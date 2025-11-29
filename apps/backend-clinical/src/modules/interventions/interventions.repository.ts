/**
 * Clinical Interventions Repository
 *
 * Data access layer for clinical interventions with multi-tenant isolation.
 * Implements optimistic locking and comprehensive audit trail.
 *
 * CLINICAL SAFETY: This repository ensures:
 * - Tenant isolation on all queries (CRITICAL for HIPAA)
 * - Optimistic locking to prevent concurrent modification conflicts
 * - Complete audit trail in history collection
 * - No hard deletes of clinical data (soft delete only)
 *
 * @module interventions/repository
 */

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import {
  ClinicalIntervention,
  ClinicalInterventionDocument,
  ClinicalInterventionHistory,
  ClinicalInterventionHistoryDocument,
  InterventionType,
  InterventionStatus,
} from './entities/intervention.schema';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Tenant context for multi-tenant operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

/**
 * Query options for listing interventions
 */
export interface InterventionQueryOptions {
  limit: number;
  offset: number;
  startDate?: Date;
  endDate?: Date;
  type?: InterventionType;
  status?: InterventionStatus;
  providerId?: string;
  appointmentId?: string;
  toothNumber?: string;
  isBillable?: boolean;
  followUpRequired?: boolean;
  includeDeleted?: boolean;
}

/**
 * History record input for audit trail
 */
export interface HistoryRecordInput {
  interventionId: string;
  tenantId: string;
  patientId: string;
  organizationId: string;
  clinicId: string;
  changeType: 'created' | 'updated' | 'cancelled' | 'deleted' | 'billed';
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changedFields?: string[];
  changedBy: string;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// REPOSITORY
// ============================================================================

@Injectable()
export class InterventionsRepository {
  constructor(
    @InjectModel(ClinicalIntervention.name)
    private readonly interventionModel: Model<ClinicalInterventionDocument>,
    @InjectModel(ClinicalInterventionHistory.name)
    private readonly historyModel: Model<ClinicalInterventionHistoryDocument>,
  ) {}

  // --------------------------------------------------------------------------
  // CREATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Creates a new clinical intervention
   */
  async create(data: Partial<ClinicalIntervention>): Promise<ClinicalInterventionDocument> {
    const intervention = new this.interventionModel({
      ...data,
      version: 1,
      schemaVersion: 1,
    });
    return intervention.save();
  }

  // --------------------------------------------------------------------------
  // READ OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Finds an intervention by ID with tenant isolation
   */
  async findById(
    id: string,
    tenantContext: TenantContext,
    includeDeleted = false,
  ): Promise<ClinicalInterventionDocument | null> {
    const query: FilterQuery<ClinicalInterventionDocument> = {
      _id: new Types.ObjectId(id),
      tenantId: tenantContext.tenantId,
    };

    if (!includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    return this.interventionModel.findOne(query).exec();
  }

  /**
   * Finds interventions for a patient with pagination and filtering
   */
  async findByPatientId(
    patientId: string,
    tenantContext: TenantContext,
    options: InterventionQueryOptions,
  ): Promise<PaginatedResult<ClinicalInterventionDocument>> {
    const query = this.buildQuery(patientId, tenantContext, options);

    const [data, total] = await Promise.all([
      this.interventionModel
        .find(query)
        .sort({ performedAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec(),
      this.interventionModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      offset: options.offset,
      limit: options.limit,
      hasMore: options.offset + data.length < total,
    };
  }

  /**
   * Finds interventions for a specific appointment
   */
  async findByAppointmentId(
    appointmentId: string,
    tenantContext: TenantContext,
    includeDeleted = false,
  ): Promise<ClinicalInterventionDocument[]> {
    const query: FilterQuery<ClinicalInterventionDocument> = {
      appointmentId,
      tenantId: tenantContext.tenantId,
    };

    if (!includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    return this.interventionModel.find(query).sort({ performedAt: 1 }).exec();
  }

  /**
   * Finds interventions for a specific tooth
   */
  async findByToothNumber(
    patientId: string,
    toothNumber: string,
    tenantContext: TenantContext,
    options: InterventionQueryOptions,
  ): Promise<PaginatedResult<ClinicalInterventionDocument>> {
    const query: FilterQuery<ClinicalInterventionDocument> = {
      patientId,
      tenantId: tenantContext.tenantId,
      teeth: toothNumber,
    };

    if (!options.includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    if (options.startDate || options.endDate) {
      query.performedAt = {};
      if (options.startDate) {
        query.performedAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.performedAt.$lte = options.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.interventionModel
        .find(query)
        .sort({ performedAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec(),
      this.interventionModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      offset: options.offset,
      limit: options.limit,
      hasMore: options.offset + data.length < total,
    };
  }

  /**
   * Counts interventions by type for a patient (for analytics)
   */
  async countByType(
    patientId: string,
    tenantContext: TenantContext,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Record<InterventionType, number>> {
    const matchStage: Record<string, unknown> = {
      patientId,
      tenantId: tenantContext.tenantId,
      deletedAt: { $exists: false },
    };

    if (startDate || endDate) {
      matchStage.performedAt = {};
      if (startDate) {
        (matchStage.performedAt as Record<string, Date>).$gte = startDate;
      }
      if (endDate) {
        (matchStage.performedAt as Record<string, Date>).$lte = endDate;
      }
    }

    const results = await this.interventionModel
      .aggregate([{ $match: matchStage }, { $group: { _id: '$type', count: { $sum: 1 } } }])
      .exec();

    const counts: Partial<Record<InterventionType, number>> = {};
    for (const result of results) {
      counts[result._id as InterventionType] = result.count;
    }

    return counts as Record<InterventionType, number>;
  }

  // --------------------------------------------------------------------------
  // UPDATE OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Updates an intervention with optimistic locking
   */
  async update(
    id: string,
    updateData: Partial<ClinicalIntervention>,
    tenantContext: TenantContext,
    updatedBy: string,
    expectedVersion: number,
  ): Promise<ClinicalInterventionDocument> {
    const updateQuery: UpdateQuery<ClinicalInterventionDocument> = {
      $set: {
        ...updateData,
        updatedBy,
      },
      $inc: { version: 1 },
    };

    const result = await this.interventionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: tenantContext.tenantId,
          version: expectedVersion,
          deletedAt: { $exists: false },
        },
        updateQuery,
        { new: true },
      )
      .exec();

    if (!result) {
      await this.handleUpdateFailure(id, tenantContext, expectedVersion);
    }

    return result!;
  }

  /**
   * Cancels an intervention (sets status to cancelled)
   */
  async cancel(
    id: string,
    reason: string,
    tenantContext: TenantContext,
    cancelledBy: string,
    expectedVersion: number,
  ): Promise<ClinicalInterventionDocument> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Cancellation reason is required');
    }

    const result = await this.interventionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: tenantContext.tenantId,
          version: expectedVersion,
          status: { $ne: 'cancelled' },
          deletedAt: { $exists: false },
        },
        {
          $set: {
            status: 'cancelled',
            cancellationReason: reason,
            cancelledAt: new Date(),
            cancelledBy,
            updatedBy: cancelledBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      const existing = await this.findById(id, tenantContext);
      if (!existing) {
        throw new NotFoundException(`Intervention ${id} not found`);
      }
      if (existing.status === 'cancelled') {
        throw new ConflictException('Intervention is already cancelled');
      }
      throw new ConflictException(
        'Intervention was modified by another user. Please refresh and try again.',
      );
    }

    return result;
  }

  /**
   * Soft deletes an intervention
   * CLINICAL SAFETY: Never hard-delete clinical data
   */
  async softDelete(
    id: string,
    reason: string,
    tenantContext: TenantContext,
    deletedBy: string,
    expectedVersion: number,
  ): Promise<ClinicalInterventionDocument> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Deletion reason is required for audit compliance');
    }

    const result = await this.interventionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: tenantContext.tenantId,
          version: expectedVersion,
          deletedAt: { $exists: false },
        },
        {
          $set: {
            deletedAt: new Date(),
            deletedBy,
            deleteReason: reason,
            updatedBy: deletedBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      await this.handleUpdateFailure(id, tenantContext, expectedVersion);
    }

    return result!;
  }

  /**
   * Links an intervention to an invoice
   */
  async linkToInvoice(
    id: string,
    invoiceId: string,
    tenantContext: TenantContext,
    billedBy: string,
    expectedVersion: number,
  ): Promise<ClinicalInterventionDocument> {
    const result = await this.interventionModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          tenantId: tenantContext.tenantId,
          version: expectedVersion,
          isBillable: true,
          invoiceId: { $exists: false },
          deletedAt: { $exists: false },
        },
        {
          $set: {
            invoiceId,
            billedAt: new Date(),
            updatedBy: billedBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      const existing = await this.findById(id, tenantContext);
      if (!existing) {
        throw new NotFoundException(`Intervention ${id} not found`);
      }
      if (!existing.isBillable) {
        throw new BadRequestException('Intervention is not billable');
      }
      if (existing.invoiceId) {
        throw new ConflictException(
          `Intervention is already linked to invoice ${existing.invoiceId}`,
        );
      }
      throw new ConflictException(
        'Intervention was modified by another user. Please refresh and try again.',
      );
    }

    return result;
  }

  // --------------------------------------------------------------------------
  // BATCH OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Creates multiple interventions for an appointment (batch operation)
   */
  async createBatch(
    interventions: Partial<ClinicalIntervention>[],
  ): Promise<ClinicalInterventionDocument[]> {
    const docs = interventions.map(
      (data) =>
        new this.interventionModel({
          ...data,
          version: 1,
          schemaVersion: 1,
        }),
    );

    return this.interventionModel.insertMany(docs);
  }

  // --------------------------------------------------------------------------
  // HISTORY OPERATIONS
  // --------------------------------------------------------------------------

  /**
   * Records a history entry for audit trail
   * IMPORTANT: This collection is append-only - never delete records
   */
  async recordHistory(input: HistoryRecordInput): Promise<ClinicalInterventionHistoryDocument> {
    const historyRecord = new this.historyModel(input);
    return historyRecord.save();
  }

  /**
   * Gets history for an intervention
   */
  async getInterventionHistory(
    interventionId: string,
    tenantId: string,
    limit = 50,
    offset = 0,
  ): Promise<PaginatedResult<ClinicalInterventionHistoryDocument>> {
    const query = { interventionId, tenantId };

    const [data, total] = await Promise.all([
      this.historyModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      offset,
      limit,
      hasMore: offset + data.length < total,
    };
  }

  /**
   * Gets intervention history for a patient (for compliance audits)
   */
  async getPatientInterventionHistory(
    patientId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 100,
    offset = 0,
  ): Promise<PaginatedResult<ClinicalInterventionHistoryDocument>> {
    const query: FilterQuery<ClinicalInterventionHistoryDocument> = {
      patientId,
      tenantId,
    };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = startDate;
      }
      if (endDate) {
        query.createdAt.$lte = endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.historyModel.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      offset,
      limit,
      hasMore: offset + data.length < total,
    };
  }

  // --------------------------------------------------------------------------
  // PRIVATE HELPERS
  // --------------------------------------------------------------------------

  /**
   * Builds a query with all filtering options
   */
  private buildQuery(
    patientId: string,
    tenantContext: TenantContext,
    options: InterventionQueryOptions,
  ): FilterQuery<ClinicalInterventionDocument> {
    const query: FilterQuery<ClinicalInterventionDocument> = {
      patientId,
      tenantId: tenantContext.tenantId,
    };

    // Soft delete filter
    if (!options.includeDeleted) {
      query.deletedAt = { $exists: false };
    }

    // Date range filter
    if (options.startDate || options.endDate) {
      query.performedAt = {};
      if (options.startDate) {
        query.performedAt.$gte = options.startDate;
      }
      if (options.endDate) {
        query.performedAt.$lte = options.endDate;
      }
    }

    // Type filter
    if (options.type) {
      query.type = options.type;
    }

    // Status filter
    if (options.status) {
      query.status = options.status;
    }

    // Provider filter
    if (options.providerId) {
      query.providerId = options.providerId;
    }

    // Appointment filter
    if (options.appointmentId) {
      query.appointmentId = options.appointmentId;
    }

    // Tooth filter
    if (options.toothNumber) {
      query.teeth = options.toothNumber;
    }

    // Billable filter
    if (options.isBillable !== undefined) {
      query.isBillable = options.isBillable;
    }

    // Follow-up filter
    if (options.followUpRequired !== undefined) {
      query.followUpRequired = options.followUpRequired;
    }

    return query;
  }

  /**
   * Handles update failures by determining the cause
   */
  private async handleUpdateFailure(
    id: string,
    tenantContext: TenantContext,
    expectedVersion: number,
  ): Promise<never> {
    const existing = await this.interventionModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: tenantContext.tenantId,
      })
      .exec();

    if (!existing) {
      throw new NotFoundException(`Intervention ${id} not found`);
    }

    if (existing.deletedAt) {
      throw new ConflictException('Intervention has been deleted');
    }

    if (existing.version !== expectedVersion) {
      throw new ConflictException(
        `Intervention was modified by another user. Expected version: ${expectedVersion}, current version: ${existing.version}. Please refresh and try again.`,
      );
    }

    // Generic fallback
    throw new ConflictException('Failed to update intervention');
  }
}
