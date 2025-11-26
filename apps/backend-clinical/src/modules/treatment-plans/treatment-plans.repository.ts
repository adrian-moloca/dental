/**
 * Treatment Plans Repository
 *
 * Data access layer for treatment plans with built-in multi-tenant isolation.
 * All queries are automatically scoped to the tenant context.
 *
 * CRITICAL SECURITY: Every query MUST include tenantId filter.
 * This is enforced at the repository level to prevent data leakage.
 *
 * @module treatment-plans/repository
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, FilterQuery } from 'mongoose';
import {
  TreatmentPlan,
  TreatmentPlanDocument,
  TreatmentPlanHistory,
  TreatmentPlanHistoryDocument,
  TreatmentPlanStatus,
} from './entities/treatment-plan.schema';
import { TreatmentPlanQueryDto } from './dto/treatment-plan.dto';

/**
 * Tenant context for all repository operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

/**
 * Context for audit logging
 */
export interface AuditContext extends TenantContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result of paginated queries
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * History entry input
 */
export interface HistoryEntryInput {
  treatmentPlanId: string;
  patientId: string;
  changeType: string;
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, unknown>;
  documentSnapshot?: Record<string, unknown>;
  reason?: string;
  itemId?: string;
}

@Injectable()
export class TreatmentPlansRepository {
  private readonly logger = new Logger(TreatmentPlansRepository.name);

  constructor(
    @InjectModel(TreatmentPlan.name)
    private readonly treatmentPlanModel: Model<TreatmentPlanDocument>,
    @InjectModel(TreatmentPlanHistory.name)
    private readonly historyModel: Model<TreatmentPlanHistoryDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Find treatment plan by ID with tenant isolation
   *
   * SECURITY: Always filters by tenantId to prevent cross-tenant access
   */
  async findById(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<TreatmentPlanDocument | null> {
    const filter: FilterQuery<TreatmentPlanDocument> = {
      _id: id,
      tenantId: context.tenantId,
    };

    if (!options?.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    return this.treatmentPlanModel.findOne(filter).exec();
  }

  /**
   * Find treatment plan by ID or throw NotFoundException
   */
  async findByIdOrFail(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.findById(id, context, options);
    if (!plan) {
      throw new NotFoundException(`Treatment plan with ID ${id} not found`);
    }
    return plan;
  }

  /**
   * Find all treatment plans for a patient with pagination
   */
  async findByPatient(
    patientId: string,
    context: TenantContext,
    query: TreatmentPlanQueryDto,
  ): Promise<PaginatedResult<TreatmentPlanDocument>> {
    const filter: FilterQuery<TreatmentPlanDocument> = {
      patientId,
      tenantId: context.tenantId,
    };

    // Apply optional filters
    if (query.status) {
      filter.status = query.status;
    }

    if (query.providerId) {
      filter.providerId = query.providerId;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate) {
        filter.createdAt.$gte = query.fromDate;
      }
      if (query.toDate) {
        filter.createdAt.$lte = query.toDate;
      }
    }

    if (!query.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    // Calculate pagination
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    // Build sort
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy]: sortDirection };

    // Execute query with count
    const [data, total] = await Promise.all([
      this.treatmentPlanModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.treatmentPlanModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find active treatment plans for a patient
   * (not completed or cancelled)
   */
  async findActiveByPatient(
    patientId: string,
    context: TenantContext,
  ): Promise<TreatmentPlanDocument[]> {
    return this.treatmentPlanModel
      .find({
        patientId,
        tenantId: context.tenantId,
        status: { $in: ['draft', 'presented', 'accepted', 'in_progress'] },
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find the current active plan (in_progress status)
   */
  async findCurrentActivePlan(
    patientId: string,
    context: TenantContext,
  ): Promise<TreatmentPlanDocument | null> {
    return this.treatmentPlanModel
      .findOne({
        patientId,
        tenantId: context.tenantId,
        status: 'in_progress',
        deletedAt: { $exists: false },
      })
      .exec();
  }

  /**
   * Find plans by provider
   */
  async findByProvider(
    providerId: string,
    context: TenantContext,
    query: TreatmentPlanQueryDto,
  ): Promise<PaginatedResult<TreatmentPlanDocument>> {
    const filter: FilterQuery<TreatmentPlanDocument> = {
      providerId,
      tenantId: context.tenantId,
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (!query.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy]: sortDirection };

    const [data, total] = await Promise.all([
      this.treatmentPlanModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.treatmentPlanModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Count plans by status for a clinic (dashboard metrics)
   */
  async countByStatus(context: TenantContext): Promise<Record<TreatmentPlanStatus, number>> {
    const results = await this.treatmentPlanModel.aggregate([
      {
        $match: {
          tenantId: context.tenantId,
          clinicId: context.clinicId,
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize all statuses with 0
    const counts: Record<string, number> = {
      draft: 0,
      presented: 0,
      accepted: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };

    // Fill in actual counts
    for (const result of results) {
      counts[result._id] = result.count;
    }

    return counts as Record<TreatmentPlanStatus, number>;
  }

  // ============================================================================
  // MUTATION METHODS
  // ============================================================================

  /**
   * Create a new treatment plan
   */
  async create(
    data: Partial<TreatmentPlan>,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = new this.treatmentPlanModel({
      ...data,
      tenantId: auditContext.tenantId,
      organizationId: auditContext.organizationId,
      clinicId: auditContext.clinicId,
      createdBy: auditContext.userId,
      updatedBy: auditContext.userId,
      version: 1,
      schemaVersion: 1,
    });

    const saved = await plan.save();

    // Log creation in history
    await this.logHistory(
      {
        treatmentPlanId: saved._id.toString(),
        patientId: saved.patientId,
        changeType: 'created',
        newStatus: saved.status,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.log(`Created treatment plan ${saved._id} for patient ${saved.patientId}`);

    return saved;
  }

  /**
   * Update a treatment plan with optimistic locking
   *
   * @param id Treatment plan ID
   * @param updates Fields to update
   * @param expectedVersion Version for optimistic locking
   * @param auditContext Audit context
   * @param reason Reason for update (for audit)
   */
  async update(
    id: string,
    updates: Partial<TreatmentPlan>,
    expectedVersion: number,
    auditContext: AuditContext,
    reason?: string,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.findByIdOrFail(id, auditContext);

    // Optimistic locking check
    if (plan.version !== expectedVersion) {
      throw new Error(
        `Optimistic locking failed. Expected version ${expectedVersion}, found ${plan.version}`,
      );
    }

    // Track changes for history
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = (plan as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        changes[key] = { old: oldValue, new: value };
      }
    }

    // Apply updates
    Object.assign(plan, updates);
    plan.updatedBy = auditContext.userId;
    plan.version += 1;

    const saved = await plan.save();

    // Log update in history
    if (Object.keys(changes).length > 0) {
      await this.logHistory(
        {
          treatmentPlanId: id,
          patientId: plan.patientId,
          changeType: 'updated',
          changes,
          reason,
        },
        auditContext,
      );
    }

    return saved;
  }

  /**
   * Update treatment plan status with validation
   */
  async updateStatus(
    id: string,
    newStatus: TreatmentPlanStatus,
    auditContext: AuditContext,
    options?: {
      reason?: string;
      additionalUpdates?: Partial<TreatmentPlan>;
    },
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.findByIdOrFail(id, auditContext);
    const previousStatus = plan.status;

    // Apply status change
    plan.status = newStatus;
    plan.updatedBy = auditContext.userId;
    plan.version += 1;

    // Apply additional updates if provided
    if (options?.additionalUpdates) {
      Object.assign(plan, options.additionalUpdates);
    }

    const saved = await plan.save();

    // Log status change in history
    await this.logHistory(
      {
        treatmentPlanId: id,
        patientId: plan.patientId,
        changeType: 'status_changed',
        previousStatus,
        newStatus,
        reason: options?.reason,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.log(`Updated treatment plan ${id} status from ${previousStatus} to ${newStatus}`);

    return saved;
  }

  /**
   * Mark a procedure item as completed
   */
  async completeItem(
    planId: string,
    phaseId: string,
    itemId: string,
    completionData: {
      completedProcedureId?: string;
      completedBy: string;
      completedAt: Date;
    },
    auditContext: AuditContext,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.findByIdOrFail(planId, auditContext);

    // Find the phase and item
    const phase = plan.phases.find((p) => p._id.toString() === phaseId);
    if (!phase) {
      throw new NotFoundException(`Phase ${phaseId} not found in treatment plan`);
    }

    const item = phase.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      throw new NotFoundException(`Item ${itemId} not found in phase`);
    }

    // Update item status
    item.status = 'completed';
    item.completedProcedureId = completionData.completedProcedureId;
    item.completedBy = completionData.completedBy;
    item.completedAt = completionData.completedAt;

    plan.updatedBy = auditContext.userId;
    plan.version += 1;

    // Check if all items in all phases are completed
    const allCompleted = plan.phases.every((p) =>
      p.items.every((i) => i.status === 'completed' || i.status === 'cancelled'),
    );

    if (allCompleted && plan.status === 'in_progress') {
      plan.status = 'completed';
      plan.completedAt = new Date();
    }

    const saved = await plan.save();

    // Log item completion
    await this.logHistory(
      {
        treatmentPlanId: planId,
        patientId: plan.patientId,
        changeType: 'item_completed',
        itemId,
        changes: {
          procedureCode: item.procedureCode,
          procedureName: item.procedureName,
          completedAt: completionData.completedAt,
        },
      },
      auditContext,
    );

    return saved;
  }

  /**
   * Soft delete a treatment plan
   */
  async softDelete(
    id: string,
    auditContext: AuditContext,
    reason: string,
  ): Promise<TreatmentPlanDocument> {
    const plan = await this.findByIdOrFail(id, auditContext);

    plan.deletedAt = new Date();
    plan.deletedBy = auditContext.userId;
    plan.updatedBy = auditContext.userId;
    plan.version += 1;

    const saved = await plan.save();

    await this.logHistory(
      {
        treatmentPlanId: id,
        patientId: plan.patientId,
        changeType: 'deleted',
        previousStatus: plan.status,
        reason,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.warn(
      `Soft deleted treatment plan ${id} by user ${auditContext.userId}. Reason: ${reason}`,
    );

    return saved;
  }

  // ============================================================================
  // HISTORY METHODS
  // ============================================================================

  /**
   * Log a history entry
   */
  private async logHistory(
    entry: HistoryEntryInput,
    auditContext: AuditContext,
  ): Promise<TreatmentPlanHistoryDocument> {
    const history = new this.historyModel({
      ...entry,
      tenantId: auditContext.tenantId,
      organizationId: auditContext.organizationId,
      clinicId: auditContext.clinicId,
      changedBy: auditContext.userId,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    return history.save();
  }

  /**
   * Get history for a treatment plan
   */
  async getHistory(
    treatmentPlanId: string,
    context: TenantContext,
    options?: { limit?: number; offset?: number },
  ): Promise<TreatmentPlanHistoryDocument[]> {
    return this.historyModel
      .find({
        treatmentPlanId,
        tenantId: context.tenantId,
      })
      .sort({ createdAt: -1 })
      .skip(options?.offset ?? 0)
      .limit(options?.limit ?? 50)
      .exec();
  }

  // ============================================================================
  // TRANSACTION SUPPORT
  // ============================================================================

  /**
   * Start a MongoDB session for transactions
   */
  async startSession(): Promise<ClientSession> {
    return this.connection.startSession();
  }

  /**
   * Execute a function within a transaction
   */
  async withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await this.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if a treatment plan exists
   */
  async exists(id: string, context: TenantContext): Promise<boolean> {
    const count = await this.treatmentPlanModel.countDocuments({
      _id: id,
      tenantId: context.tenantId,
      deletedAt: { $exists: false },
    });
    return count > 0;
  }

  /**
   * Convert cents to decimal for display
   */
  centsToDecimal(cents: number): number {
    return cents / 100;
  }

  /**
   * Convert decimal to cents for storage
   */
  decimalToCents(decimal: number): number {
    return Math.round(decimal * 100);
  }
}
