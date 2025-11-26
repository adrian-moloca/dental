/**
 * Odontogram Repository
 *
 * Data access layer for odontogram operations with multi-tenant isolation.
 * Implements optimistic locking and audit trail functionality.
 *
 * CLINICAL SAFETY: This repository ensures:
 * - Tenant isolation on all queries
 * - Optimistic locking to prevent data races
 * - Complete audit trail in history collection
 * - No hard deletes of clinical data
 *
 * @module odontogram/repository
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Odontogram,
  OdontogramDocument,
  OdontogramHistory,
  OdontogramHistoryDocument,
  ToothData,
  ToothConditionRecord,
  FDIToothNumber,
} from './entities/odontogram.schema';

/**
 * Tenant context for multi-tenant operations
 */
interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

/**
 * History record input
 */
interface HistoryRecordInput {
  patientId: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
  toothNumber: FDIToothNumber;
  changeType: 'condition_added' | 'condition_removed' | 'condition_updated' | 'tooth_updated';
  conditionId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changedBy: string;
  reason?: string;
  appointmentId?: string;
  procedureId?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * History query options
 */
interface HistoryQueryOptions {
  limit: number;
  offset: number;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class OdontogramRepository {
  constructor(
    @InjectModel(Odontogram.name)
    private readonly odontogramModel: Model<OdontogramDocument>,
    @InjectModel(OdontogramHistory.name)
    private readonly historyModel: Model<OdontogramHistoryDocument>,
  ) {}

  /**
   * Finds an odontogram by patient ID with tenant isolation
   */
  async findByPatientId(
    patientId: string,
    tenantContext: TenantContext,
  ): Promise<OdontogramDocument | null> {
    return this.odontogramModel
      .findOne({
        patientId,
        tenantId: tenantContext.tenantId,
        organizationId: tenantContext.organizationId,
      })
      .exec();
  }

  /**
   * Creates a new odontogram
   */
  async create(data: Partial<Odontogram>): Promise<OdontogramDocument> {
    const odontogram = new this.odontogramModel(data);
    return odontogram.save();
  }

  /**
   * Updates a tooth's properties (not conditions)
   * Uses optimistic locking to prevent concurrent modification
   */
  async updateTooth(
    patientId: string,
    toothNumber: string,
    toothData: ToothData,
    tenantContext: TenantContext,
    updatedBy: string,
    expectedVersion: number,
  ): Promise<OdontogramDocument> {
    const result = await this.odontogramModel
      .findOneAndUpdate(
        {
          patientId,
          tenantId: tenantContext.tenantId,
          organizationId: tenantContext.organizationId,
          version: expectedVersion,
        },
        {
          $set: {
            [`teeth.${toothNumber}`]: toothData,
            updatedBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      // Check if document exists but version mismatch
      const exists = await this.findByPatientId(patientId, tenantContext);
      if (exists) {
        throw new ConflictException(
          `Odontogram was modified by another user. Please refresh and try again. Expected version: ${expectedVersion}, current version: ${exists.version}`,
        );
      }
      throw new NotFoundException(`Odontogram not found for patient ${patientId}`);
    }

    return result;
  }

  /**
   * Adds a condition to a tooth
   * Uses optimistic locking and returns the generated condition ID
   */
  async addConditionToTooth(
    patientId: string,
    toothNumber: string,
    condition: Partial<ToothConditionRecord>,
    tenantContext: TenantContext,
    updatedBy: string,
    expectedVersion: number,
  ): Promise<{ odontogram: OdontogramDocument; conditionId: string }> {
    // Generate condition ID
    const conditionId = new Types.ObjectId();
    const conditionWithId = {
      ...condition,
      _id: conditionId,
    };

    const result = await this.odontogramModel
      .findOneAndUpdate(
        {
          patientId,
          tenantId: tenantContext.tenantId,
          organizationId: tenantContext.organizationId,
          version: expectedVersion,
        },
        {
          $push: {
            [`teeth.${toothNumber}.conditions`]: conditionWithId,
          },
          $set: {
            [`teeth.${toothNumber}.updatedAt`]: new Date(),
            [`teeth.${toothNumber}.updatedBy`]: updatedBy,
            updatedBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      const exists = await this.findByPatientId(patientId, tenantContext);
      if (exists) {
        throw new ConflictException(
          `Odontogram was modified by another user. Please refresh and try again.`,
        );
      }
      throw new NotFoundException(`Odontogram not found for patient ${patientId}`);
    }

    return { odontogram: result, conditionId: conditionId.toString() };
  }

  /**
   * Soft deletes a condition from a tooth
   * Never hard-deletes - marks with deletedAt, deletedBy, deleteReason
   */
  async softDeleteCondition(
    patientId: string,
    toothNumber: string,
    conditionId: string,
    deleteReason: string,
    tenantContext: TenantContext,
    deletedBy: string,
    expectedVersion: number,
  ): Promise<OdontogramDocument> {
    const result = await this.odontogramModel
      .findOneAndUpdate(
        {
          patientId,
          tenantId: tenantContext.tenantId,
          organizationId: tenantContext.organizationId,
          version: expectedVersion,
          [`teeth.${toothNumber}.conditions._id`]: new Types.ObjectId(conditionId),
        },
        {
          $set: {
            [`teeth.${toothNumber}.conditions.$.deletedAt`]: new Date(),
            [`teeth.${toothNumber}.conditions.$.deletedBy`]: deletedBy,
            [`teeth.${toothNumber}.conditions.$.deleteReason`]: deleteReason,
            [`teeth.${toothNumber}.updatedAt`]: new Date(),
            [`teeth.${toothNumber}.updatedBy`]: deletedBy,
            updatedBy: deletedBy,
          },
          $inc: { version: 1 },
        },
        { new: true },
      )
      .exec();

    if (!result) {
      const exists = await this.findByPatientId(patientId, tenantContext);
      if (exists) {
        // Could be version mismatch or condition not found
        const tooth = exists.teeth.get(toothNumber);
        if (!tooth) {
          throw new NotFoundException(`Tooth ${toothNumber} not found`);
        }
        const conditionExists = tooth.conditions.find(
          (c) => c._id?.toString() === conditionId,
        );
        if (!conditionExists) {
          throw new NotFoundException(`Condition ${conditionId} not found on tooth ${toothNumber}`);
        }
        throw new ConflictException(
          `Odontogram was modified by another user. Please refresh and try again.`,
        );
      }
      throw new NotFoundException(`Odontogram not found for patient ${patientId}`);
    }

    return result;
  }

  /**
   * Records a history entry for audit trail
   * IMPORTANT: This collection is append-only - never delete records
   */
  async recordHistory(input: HistoryRecordInput): Promise<OdontogramHistoryDocument> {
    const historyRecord = new this.historyModel({
      patientId: input.patientId,
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      clinicId: input.clinicId,
      toothNumber: input.toothNumber,
      changeType: input.changeType,
      conditionId: input.conditionId,
      previousState: input.previousState,
      newState: input.newState,
      changedBy: input.changedBy,
      reason: input.reason,
      appointmentId: input.appointmentId,
      procedureId: input.procedureId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    return historyRecord.save();
  }

  /**
   * Gets history records for a specific tooth with pagination
   */
  async getToothHistory(
    patientId: string,
    toothNumber: FDIToothNumber,
    tenantId: string,
    options: HistoryQueryOptions,
  ): Promise<{ data: OdontogramHistoryDocument[]; total: number }> {
    const query: Record<string, unknown> = {
      patientId,
      tenantId,
      toothNumber,
    };

    // Add date filters if provided
    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Gets all history records for a patient (for audit/compliance)
   */
  async getPatientHistory(
    patientId: string,
    tenantId: string,
    options: HistoryQueryOptions,
  ): Promise<{ data: OdontogramHistoryDocument[]; total: number }> {
    const query: Record<string, unknown> = {
      patientId,
      tenantId,
    };

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  /**
   * Gets history records by provider (for audit queries)
   */
  async getHistoryByProvider(
    changedBy: string,
    tenantId: string,
    options: HistoryQueryOptions,
  ): Promise<{ data: OdontogramHistoryDocument[]; total: number }> {
    const query: Record<string, unknown> = {
      changedBy,
      tenantId,
    };

    if (options.startDate || options.endDate) {
      query.createdAt = {};
      if (options.startDate) {
        (query.createdAt as Record<string, Date>).$gte = options.startDate;
      }
      if (options.endDate) {
        (query.createdAt as Record<string, Date>).$lte = options.endDate;
      }
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.offset)
        .limit(options.limit)
        .exec(),
      this.historyModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }
}
