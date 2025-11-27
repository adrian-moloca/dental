import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RetentionMetadata, RetentionMetadataDocument, RetentionStatus } from './retention.schema';
import {
  type RetentionPolicyConfig as _RetentionPolicyConfig,
  RecordType,
  getRetentionPolicy,
  calculateRetentionExpiry,
  getDaysUntilRetentionExpiry,
  ROMANIAN_RETENTION_POLICY,
} from './retention-policy.config';

/**
 * RetentionService
 *
 * Manages medical records retention for Romanian legal compliance.
 * Enforces 10-year retention period and prevents premature deletion.
 *
 * Key Responsibilities:
 * 1. Track retention metadata for all clinical records
 * 2. Prevent deletion of records within retention period
 * 3. Send notifications before retention expiry
 * 4. Archive records after retention period
 * 5. Support legal holds for litigation
 */
@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    @InjectModel(RetentionMetadata.name)
    private retentionModel: Model<RetentionMetadataDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Register a clinical record for retention tracking
   * Called when a new clinical record is created
   */
  async registerRecord(
    recordId: string,
    recordType: RecordType,
    patientId: string,
    tenantId: string,
    organizationId: string,
    clinicId?: string,
    countryCode: string = 'RO',
  ): Promise<RetentionMetadataDocument> {
    const policy = getRetentionPolicy(countryCode);
    const now = new Date();
    const expiryDate = calculateRetentionExpiry(now, policy);

    const metadata = new this.retentionModel({
      recordId,
      recordType,
      patientId,
      lastActivityDate: now,
      retentionExpiryDate: expiryDate,
      status: RetentionStatus.ACTIVE,
      countryCode,
      retentionYears: policy.retentionYears,
      tenantId,
      organizationId,
      clinicId,
      notificationHistory: [],
      statusHistory: [],
    });

    const saved = await metadata.save();
    this.logger.log(
      `Registered retention for ${recordType} ${recordId}, expires ${expiryDate.toISOString()}`,
    );

    return saved;
  }

  /**
   * Update last activity date (extends retention period)
   * Called when a record is updated
   */
  async updateLastActivity(recordId: string, tenantId: string): Promise<void> {
    const metadata = await this.retentionModel.findOne({ recordId, tenantId });

    if (!metadata) {
      this.logger.warn(`No retention metadata found for record ${recordId}`);
      return;
    }

    const policy = getRetentionPolicy(metadata.countryCode);
    const now = new Date();
    const newExpiry = calculateRetentionExpiry(now, policy);

    metadata.lastActivityDate = now;
    metadata.retentionExpiryDate = newExpiry;

    // Reset to active if was expiring
    if (
      metadata.status === RetentionStatus.EXPIRING_SOON ||
      metadata.status === RetentionStatus.EXPIRED
    ) {
      metadata.statusHistory.push({
        previousStatus: metadata.status,
        newStatus: RetentionStatus.ACTIVE,
        changedAt: now,
        changedBy: 'system',
        reason: 'Activity extended retention period',
      });
      metadata.status = RetentionStatus.ACTIVE;
    }

    await metadata.save();
    this.logger.debug(`Updated retention for ${recordId}, new expiry ${newExpiry.toISOString()}`);
  }

  /**
   * Check if a record can be deleted
   * Returns false if within retention period or on legal hold
   */
  async canDeleteRecord(
    recordId: string,
    tenantId: string,
  ): Promise<{ canDelete: boolean; reason?: string; expiryDate?: Date }> {
    const metadata = await this.retentionModel.findOne({ recordId, tenantId });

    if (!metadata) {
      // No metadata = allow deletion (might be non-clinical record)
      return { canDelete: true };
    }

    // Check legal hold
    if (metadata.status === RetentionStatus.LEGAL_HOLD) {
      return {
        canDelete: false,
        reason: `Record is on legal hold: ${metadata.legalHold?.reason || 'No reason provided'}`,
      };
    }

    // Check retention period
    const daysRemaining = getDaysUntilRetentionExpiry(
      metadata.lastActivityDate,
      getRetentionPolicy(metadata.countryCode),
    );

    if (daysRemaining > 0) {
      return {
        canDelete: false,
        reason: `Record must be retained for ${daysRemaining} more days per Romanian law`,
        expiryDate: metadata.retentionExpiryDate,
      };
    }

    return { canDelete: true };
  }

  /**
   * Validate deletion request (throws if not allowed)
   */
  async validateDeletion(recordId: string, tenantId: string): Promise<void> {
    const result = await this.canDeleteRecord(recordId, tenantId);

    if (!result.canDelete) {
      throw new BadRequestException(
        result.reason || 'Record cannot be deleted due to retention policy',
      );
    }
  }

  /**
   * Place a legal hold on a record
   */
  async placeLegalHold(
    recordId: string,
    tenantId: string,
    reason: string,
    caseReference: string | undefined,
    heldBy: string,
    expectedReleaseDate?: Date,
  ): Promise<void> {
    const metadata = await this.retentionModel.findOne({ recordId, tenantId });

    if (!metadata) {
      throw new BadRequestException(`No retention metadata found for record ${recordId}`);
    }

    const previousStatus = metadata.status;

    metadata.status = RetentionStatus.LEGAL_HOLD;
    metadata.legalHold = {
      reason,
      caseReference,
      holdDate: new Date(),
      heldBy,
      expectedReleaseDate,
    };
    metadata.statusHistory.push({
      previousStatus,
      newStatus: RetentionStatus.LEGAL_HOLD,
      changedAt: new Date(),
      changedBy: heldBy,
      reason: `Legal hold: ${reason}`,
    });

    await metadata.save();

    this.logger.log(`Legal hold placed on record ${recordId} by ${heldBy}: ${reason}`);

    this.eventEmitter.emit('retention.legal_hold.placed', {
      recordId,
      recordType: metadata.recordType,
      patientId: metadata.patientId,
      reason,
      caseReference,
      heldBy,
      tenantId,
    });
  }

  /**
   * Release a legal hold
   */
  async releaseLegalHold(
    recordId: string,
    tenantId: string,
    releasedBy: string,
    releaseReason: string,
  ): Promise<void> {
    const metadata = await this.retentionModel.findOne({ recordId, tenantId });

    if (!metadata) {
      throw new BadRequestException(`No retention metadata found for record ${recordId}`);
    }

    if (metadata.status !== RetentionStatus.LEGAL_HOLD) {
      throw new BadRequestException('Record is not on legal hold');
    }

    // Determine new status based on retention expiry
    const daysRemaining = getDaysUntilRetentionExpiry(
      metadata.lastActivityDate,
      getRetentionPolicy(metadata.countryCode),
    );

    let newStatus: RetentionStatus;
    if (daysRemaining > 365) {
      newStatus = RetentionStatus.ACTIVE;
    } else if (daysRemaining > 0) {
      newStatus = RetentionStatus.EXPIRING_SOON;
    } else {
      newStatus = RetentionStatus.EXPIRED;
    }

    metadata.statusHistory.push({
      previousStatus: RetentionStatus.LEGAL_HOLD,
      newStatus,
      changedAt: new Date(),
      changedBy: releasedBy,
      reason: `Legal hold released: ${releaseReason}`,
    });
    metadata.status = newStatus;
    metadata.legalHold = undefined;

    await metadata.save();

    this.logger.log(`Legal hold released on record ${recordId} by ${releasedBy}`);

    this.eventEmitter.emit('retention.legal_hold.released', {
      recordId,
      recordType: metadata.recordType,
      patientId: metadata.patientId,
      releasedBy,
      releaseReason,
      tenantId,
    });
  }

  /**
   * Get retention status for a patient's records
   */
  async getPatientRetentionStatus(
    patientId: string,
    tenantId: string,
  ): Promise<{
    totalRecords: number;
    byStatus: Record<RetentionStatus, number>;
    earliestExpiry?: Date;
    latestExpiry?: Date;
    hasLegalHold: boolean;
  }> {
    const records = await this.retentionModel.find({ patientId, tenantId });

    const byStatus: Record<RetentionStatus, number> = {
      [RetentionStatus.ACTIVE]: 0,
      [RetentionStatus.EXPIRING_SOON]: 0,
      [RetentionStatus.EXPIRED]: 0,
      [RetentionStatus.ARCHIVED]: 0,
      [RetentionStatus.LEGAL_HOLD]: 0,
      [RetentionStatus.PENDING_REVIEW]: 0,
    };

    let earliestExpiry: Date | undefined;
    let latestExpiry: Date | undefined;
    let hasLegalHold = false;

    for (const record of records) {
      byStatus[record.status]++;

      if (record.status === RetentionStatus.LEGAL_HOLD) {
        hasLegalHold = true;
      }

      if (!earliestExpiry || record.retentionExpiryDate < earliestExpiry) {
        earliestExpiry = record.retentionExpiryDate;
      }

      if (!latestExpiry || record.retentionExpiryDate > latestExpiry) {
        latestExpiry = record.retentionExpiryDate;
      }
    }

    return {
      totalRecords: records.length,
      byStatus,
      earliestExpiry,
      latestExpiry,
      hasLegalHold,
    };
  }

  /**
   * Cron job: Check for expiring records and update status
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async checkExpiringRecords(): Promise<void> {
    this.logger.log('Running retention expiry check...');

    const policy = ROMANIAN_RETENTION_POLICY;
    const now = new Date();

    // Find records expiring within notification window (1 year)
    const notificationThreshold = new Date();
    notificationThreshold.setFullYear(notificationThreshold.getFullYear() + 1);

    const expiringRecords = await this.retentionModel.find({
      status: { $in: [RetentionStatus.ACTIVE, RetentionStatus.EXPIRING_SOON] },
      retentionExpiryDate: { $lte: notificationThreshold },
    });

    let statusUpdates = 0;
    let notificationsSent = 0;

    for (const record of expiringRecords) {
      const daysRemaining = getDaysUntilRetentionExpiry(record.lastActivityDate, policy);

      // Update status if needed
      if (daysRemaining <= 0 && record.status !== RetentionStatus.EXPIRED) {
        record.statusHistory.push({
          previousStatus: record.status,
          newStatus: RetentionStatus.EXPIRED,
          changedAt: now,
          changedBy: 'system',
          reason: 'Retention period expired',
        });
        record.status = RetentionStatus.EXPIRED;
        statusUpdates++;
      } else if (
        daysRemaining > 0 &&
        daysRemaining <= 365 &&
        record.status === RetentionStatus.ACTIVE
      ) {
        record.statusHistory.push({
          previousStatus: record.status,
          newStatus: RetentionStatus.EXPIRING_SOON,
          changedAt: now,
          changedBy: 'system',
          reason: `Retention expires in ${daysRemaining} days`,
        });
        record.status = RetentionStatus.EXPIRING_SOON;
        statusUpdates++;
      }

      // Check if notification needed
      for (const notifyDays of policy.notifications.notifyDaysBefore) {
        if (Math.abs(daysRemaining - notifyDays) <= 1) {
          const alreadyNotified = record.notificationHistory.some(
            (n) => n.daysBeforeExpiry === notifyDays,
          );

          if (!alreadyNotified) {
            record.notificationHistory.push({
              notificationType: 'expiry_warning',
              sentAt: now,
              sentTo: policy.notifications.notifyRoles,
              daysBeforeExpiry: notifyDays,
            });

            this.eventEmitter.emit('retention.expiry_warning', {
              recordId: record.recordId,
              recordType: record.recordType,
              patientId: record.patientId,
              daysRemaining,
              expiryDate: record.retentionExpiryDate,
              tenantId: record.tenantId,
              notifyRoles: policy.notifications.notifyRoles,
            });

            notificationsSent++;
          }
        }
      }

      await record.save();
    }

    this.logger.log(
      `Retention check complete: ${statusUpdates} status updates, ${notificationsSent} notifications sent`,
    );
  }

  /**
   * Archive expired records (manual trigger or cron)
   */
  async archiveExpiredRecords(
    tenantId: string,
    archivedBy: string,
  ): Promise<{ archived: number; skipped: number }> {
    const policy = ROMANIAN_RETENTION_POLICY;
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - policy.gracePeriodDays);

    const expiredRecords = await this.retentionModel.find({
      tenantId,
      status: RetentionStatus.EXPIRED,
      retentionExpiryDate: { $lte: gracePeriodEnd },
    });

    let archived = 0;
    let skipped = 0;

    for (const record of expiredRecords) {
      try {
        // Emit archive event for actual record archival
        this.eventEmitter.emit('retention.archive_record', {
          recordId: record.recordId,
          recordType: record.recordType,
          patientId: record.patientId,
          tenantId,
        });

        // Update metadata
        record.statusHistory.push({
          previousStatus: record.status,
          newStatus: RetentionStatus.ARCHIVED,
          changedAt: new Date(),
          changedBy: archivedBy,
          reason: 'Retention period expired, record archived',
        });
        record.status = RetentionStatus.ARCHIVED;
        record.archiveInfo = {
          archivedAt: new Date(),
          storageLocation: 'cold-storage', // Placeholder - actual implementation depends on storage
          archiveId: `archive-${record.recordId}-${Date.now()}`,
          archivedBy,
        };

        await record.save();
        archived++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to archive record ${record.recordId}: ${errorMessage}`);
        skipped++;
      }
    }

    this.logger.log(`Archive complete: ${archived} archived, ${skipped} skipped`);

    return { archived, skipped };
  }
}
