/**
 * Procedure Catalog Repository
 *
 * Data access layer for procedure catalog with built-in multi-tenant isolation.
 * All queries are automatically scoped to the tenant context.
 *
 * CRITICAL SECURITY: Every query MUST include tenantId filter.
 * This is enforced at the repository level to prevent data leakage.
 *
 * @module procedure-catalog/repository
 */

import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
  ProcedureCatalog,
  ProcedureCatalogDocument,
  ProcedureCategory,
} from './entities/procedure-catalog.schema';
import { ProcedureCatalogQueryDto, CreateProcedureCatalogDto } from './dto/procedure-catalog.dto';

/**
 * Tenant context for all repository operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId?: string;
}

/**
 * Context for audit logging
 */
export interface AuditContext extends TenantContext {
  userId: string;
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
 * Bulk import result
 */
export interface BulkImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{ code: string; error: string }>;
}

@Injectable()
export class ProcedureCatalogRepository {
  private readonly logger = new Logger(ProcedureCatalogRepository.name);

  constructor(
    @InjectModel(ProcedureCatalog.name)
    private readonly model: Model<ProcedureCatalogDocument>,
  ) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Find procedure by ID with tenant isolation
   */
  async findById(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<ProcedureCatalogDocument | null> {
    const filter: FilterQuery<ProcedureCatalogDocument> = {
      _id: id,
      tenantId: context.tenantId,
    };

    if (!options?.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    return this.model.findOne(filter).exec();
  }

  /**
   * Find procedure by ID or throw NotFoundException
   */
  async findByIdOrFail(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<ProcedureCatalogDocument> {
    const procedure = await this.findById(id, context, options);
    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }
    return procedure;
  }

  /**
   * Find procedure by code
   */
  async findByCode(
    code: string,
    context: TenantContext,
    clinicId?: string,
  ): Promise<ProcedureCatalogDocument | null> {
    const filter: FilterQuery<ProcedureCatalogDocument> = {
      code,
      tenantId: context.tenantId,
      deletedAt: { $exists: false },
    };

    // First try to find clinic-specific procedure
    if (clinicId) {
      const clinicProcedure = await this.model.findOne({ ...filter, clinicId }).exec();
      if (clinicProcedure) {
        return clinicProcedure;
      }
    }

    // Fall back to organization-level procedure
    return this.model.findOne({ ...filter, clinicId: { $exists: false } }).exec();
  }

  /**
   * Find procedure by code or throw NotFoundException
   */
  async findByCodeOrFail(
    code: string,
    context: TenantContext,
    clinicId?: string,
  ): Promise<ProcedureCatalogDocument> {
    const procedure = await this.findByCode(code, context, clinicId);
    if (!procedure) {
      throw new NotFoundException(`Procedure with code ${code} not found`);
    }
    return procedure;
  }

  /**
   * Find procedures with pagination and filtering
   */
  async find(
    context: TenantContext,
    query: ProcedureCatalogQueryDto,
  ): Promise<PaginatedResult<ProcedureCatalogDocument>> {
    const filter: FilterQuery<ProcedureCatalogDocument> = {
      tenantId: context.tenantId,
    };

    // Include clinic-specific and organization-level procedures
    if (query.clinicId) {
      filter.$or = [{ clinicId: query.clinicId }, { clinicId: { $exists: false } }];
    } else if (context.clinicId) {
      filter.$or = [{ clinicId: context.clinicId }, { clinicId: { $exists: false } }];
    }

    // Apply optional filters
    if (query.category) {
      filter.category = query.category;
    }

    if (query.procedureType) {
      filter.procedureType = query.procedureType;
    }

    if (query.isActive !== undefined) {
      filter.isActive = query.isActive;
    }

    if (!query.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    // Text search
    if (query.search) {
      filter.$text = { $search: query.search };
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
      this.model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
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
   * Find all active procedures by category
   */
  async findByCategory(
    category: ProcedureCategory,
    context: TenantContext,
  ): Promise<ProcedureCatalogDocument[]> {
    return this.model
      .find({
        tenantId: context.tenantId,
        category,
        isActive: true,
        deletedAt: { $exists: false },
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  /**
   * Get procedure count by category
   */
  async countByCategory(context: TenantContext): Promise<Record<string, number>> {
    const results = await this.model.aggregate([
      {
        $match: {
          tenantId: context.tenantId,
          isActive: true,
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const counts: Record<string, number> = {};
    for (const result of results) {
      counts[result._id] = result.count;
    }

    return counts;
  }

  // ============================================================================
  // MUTATION METHODS
  // ============================================================================

  /**
   * Create a new procedure catalog entry
   */
  async create(
    data: CreateProcedureCatalogDto,
    auditContext: AuditContext,
  ): Promise<ProcedureCatalogDocument> {
    // Check for duplicate code
    const existing = await this.findByCode(data.code, auditContext, data.clinicId);
    if (existing) {
      throw new ConflictException(`Procedure with code ${data.code} already exists`);
    }

    const procedure = new this.model({
      ...data,
      tenantId: auditContext.tenantId,
      organizationId: auditContext.organizationId,
      createdBy: auditContext.userId,
      updatedBy: auditContext.userId,
      version: 1,
    });

    const saved = await procedure.save();
    this.logger.log(`Created procedure catalog entry ${saved.code} (${saved._id})`);

    return saved;
  }

  /**
   * Update a procedure catalog entry
   */
  async update(
    id: string,
    updates: Partial<ProcedureCatalog>,
    expectedVersion: number,
    auditContext: AuditContext,
  ): Promise<ProcedureCatalogDocument> {
    const procedure = await this.findByIdOrFail(id, auditContext);

    // Optimistic locking check
    if (procedure.version !== expectedVersion) {
      throw new ConflictException(
        `Optimistic locking failed. Expected version ${expectedVersion}, found ${procedure.version}`,
      );
    }

    // Apply updates
    Object.assign(procedure, updates);
    procedure.updatedBy = auditContext.userId;
    procedure.version += 1;

    const saved = await procedure.save();
    this.logger.log(`Updated procedure catalog entry ${saved.code} (${saved._id})`);

    return saved;
  }

  /**
   * Soft delete a procedure catalog entry
   */
  async softDelete(id: string, auditContext: AuditContext): Promise<ProcedureCatalogDocument> {
    const procedure = await this.findByIdOrFail(id, auditContext);

    procedure.deletedAt = new Date();
    procedure.deletedBy = auditContext.userId;
    procedure.updatedBy = auditContext.userId;
    procedure.version += 1;

    const saved = await procedure.save();
    this.logger.warn(`Soft deleted procedure catalog entry ${saved.code} (${saved._id})`);

    return saved;
  }

  /**
   * Bulk import procedures
   */
  async bulkImport(
    procedures: CreateProcedureCatalogDto[],
    updateExisting: boolean,
    auditContext: AuditContext,
  ): Promise<BulkImportResult> {
    const result: BulkImportResult = {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (const procedureDto of procedures) {
      try {
        const existing = await this.findByCode(
          procedureDto.code,
          auditContext,
          procedureDto.clinicId,
        );

        if (existing) {
          if (updateExisting) {
            // Update existing procedure
            await this.update(
              existing._id.toString(),
              procedureDto,
              existing.version,
              auditContext,
            );
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          // Create new procedure
          await this.create(procedureDto, auditContext);
          result.imported++;
        }
      } catch (error) {
        result.errors.push({
          code: procedureDto.code,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    this.logger.log(
      `Bulk import completed: ${result.imported} imported, ${result.updated} updated, ${result.skipped} skipped, ${result.errors.length} errors`,
    );

    return result;
  }

  /**
   * Check if a procedure code exists
   */
  async exists(code: string, context: TenantContext, clinicId?: string): Promise<boolean> {
    const procedure = await this.findByCode(code, context, clinicId);
    return procedure !== null;
  }

  /**
   * Get multiple procedures by codes
   */
  async findByCodes(
    codes: string[],
    context: TenantContext,
    clinicId?: string,
  ): Promise<ProcedureCatalogDocument[]> {
    const filter: FilterQuery<ProcedureCatalogDocument> = {
      code: { $in: codes },
      tenantId: context.tenantId,
      isActive: true,
      deletedAt: { $exists: false },
    };

    if (clinicId) {
      filter.$or = [{ clinicId }, { clinicId: { $exists: false } }];
    }

    return this.model.find(filter).exec();
  }
}
