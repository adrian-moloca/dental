import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Retention status for clinical records
 */
export enum RetentionStatus {
  /**
   * Record is active and within retention period
   */
  ACTIVE = 'active',

  /**
   * Record is approaching retention expiry (within notification window)
   */
  EXPIRING_SOON = 'expiring_soon',

  /**
   * Record has passed retention period, pending action
   */
  EXPIRED = 'expired',

  /**
   * Record has been archived to cold storage
   */
  ARCHIVED = 'archived',

  /**
   * Record is on legal hold (cannot be deleted/archived)
   */
  LEGAL_HOLD = 'legal_hold',

  /**
   * Record has been flagged for manual review
   */
  PENDING_REVIEW = 'pending_review',
}

export type RetentionMetadataDocument = HydratedDocument<RetentionMetadata>;

/**
 * RetentionMetadata Schema
 *
 * Tracks retention status for clinical records to ensure compliance
 * with Romanian medical records retention laws (10 years).
 *
 * This is a separate collection that links to clinical records by ID,
 * allowing centralized retention management without modifying each record type.
 */
@Schema({
  collection: 'retention_metadata',
  timestamps: true,
})
export class RetentionMetadata extends Document {
  /**
   * Reference to the clinical record
   */
  @Prop({ required: true, index: true })
  recordId!: string;

  /**
   * Type of clinical record
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      'clinical_note',
      'treatment_plan',
      'consent_form',
      'odontogram',
      'perio_chart',
      'procedure',
      'prescription',
      'imaging_study',
      'lab_result',
    ],
    index: true,
  })
  recordType!: string;

  /**
   * Patient ID (for quick lookup)
   */
  @Prop({ required: true, index: true })
  patientId!: string;

  /**
   * Date of last activity on this record
   * Used to calculate retention expiry
   */
  @Prop({ required: true, type: Date })
  lastActivityDate!: Date;

  /**
   * Calculated retention expiry date
   */
  @Prop({ required: true, type: Date, index: true })
  retentionExpiryDate!: Date;

  /**
   * Current retention status
   */
  @Prop({
    required: true,
    type: String,
    enum: Object.values(RetentionStatus),
    default: RetentionStatus.ACTIVE,
    index: true,
  })
  status!: RetentionStatus;

  /**
   * Country code that determines retention policy
   */
  @Prop({ required: true, default: 'RO' })
  countryCode!: string;

  /**
   * Retention period in years (at time of creation)
   */
  @Prop({ required: true, default: 10 })
  retentionYears!: number;

  /**
   * Legal hold information
   */
  @Prop({ type: Object })
  legalHold?: {
    /** Reason for legal hold */
    reason: string;
    /** Legal case reference */
    caseReference?: string;
    /** Date hold was placed */
    holdDate: Date;
    /** User who placed the hold */
    heldBy: string;
    /** Expected release date (if known) */
    expectedReleaseDate?: Date;
  };

  /**
   * Archive information (if archived)
   */
  @Prop({ type: Object })
  archiveInfo?: {
    /** Date archived */
    archivedAt: Date;
    /** Archive storage location */
    storageLocation: string;
    /** Archive reference ID */
    archiveId: string;
    /** User who initiated archival */
    archivedBy: string;
  };

  /**
   * Notifications sent about this record
   */
  @Prop({ type: [Object], default: [] })
  notificationHistory!: Array<{
    notificationType: 'expiry_warning' | 'expired' | 'archived';
    sentAt: Date;
    sentTo: string[];
    daysBeforeExpiry?: number;
  }>;

  /**
   * Audit trail for status changes
   */
  @Prop({ type: [Object], default: [] })
  statusHistory!: Array<{
    previousStatus: RetentionStatus;
    newStatus: RetentionStatus;
    changedAt: Date;
    changedBy: string;
    reason?: string;
  }>;

  // Multi-tenant fields
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ index: true })
  clinicId?: string;
}

export const RetentionMetadataSchema = SchemaFactory.createForClass(RetentionMetadata);

// Compound indexes for common queries
RetentionMetadataSchema.index({ tenantId: 1, status: 1, retentionExpiryDate: 1 });
RetentionMetadataSchema.index({ tenantId: 1, patientId: 1, recordType: 1 });
RetentionMetadataSchema.index({ tenantId: 1, recordType: 1, status: 1 });

// Index for finding records expiring soon
RetentionMetadataSchema.index({ status: 1, retentionExpiryDate: 1 });
