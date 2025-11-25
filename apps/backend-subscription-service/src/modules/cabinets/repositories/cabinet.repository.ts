/**
 * Cabinet Repository
 *
 * Data access layer for Cabinet entity with strict multi-tenant isolation.
 * All queries MUST include organizationId filter to prevent cross-tenant data leakage.
 *
 * Security requirements:
 * - NEVER query cabinets without organizationId filter
 * - Check for duplicate codes within organization scope only
 * - Only one default cabinet per organization
 * - Return null instead of throwing for missing cabinets (let service layer decide)
 * - Validate tenant isolation on all mutations
 *
 * Edge cases handled:
 * - Code uniqueness per organization (not globally unique)
 * - Only one default cabinet per organization
 * - Cabinets without owner assignment
 * - Active status filtering
 * - Soft delete via status change or deletedAt
 * - Search by name (case-insensitive partial match)
 *
 * @module modules/cabinets/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull } from 'typeorm';
import { Cabinet } from '../entities/cabinet.entity';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';
import type { CreateCabinetDto, UpdateCabinetDto, FindCabinetsQueryDto } from '../dto';

/**
 * Data transfer object for creating a new cabinet
 */
export interface CreateCabinetData extends Omit<CreateCabinetDto, 'organizationId'> {
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** User ID who is creating the cabinet */
  createdBy?: UUID;
}

/**
 * Data transfer object for updating a cabinet
 */
export interface UpdateCabinetData extends Omit<UpdateCabinetDto, 'organizationId'> {
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
}

/**
 * Cabinet repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - Code uniqueness checked within organization scope only
 * - No cross-tenant data access allowed
 * - Mutations validate tenant ownership before update/delete
 * - Only one default cabinet per organization
 */
@Injectable()
export class CabinetRepository {
  constructor(
    @InjectRepository(Cabinet)
    private readonly repository: Repository<Cabinet>,
  ) {}

  /**
   * Find cabinet by ID within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if cabinet not found
   * - Validates cabinet belongs to specified organization
   * - Prevents cross-tenant cabinet access
   * - Excludes soft-deleted cabinets
   *
   * @param id - Cabinet ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @returns Cabinet or null if not found
   */
  async findById(id: UUID, organizationId: OrganizationId): Promise<Cabinet | null> {
    return this.repository.findOne({
      where: {
        id,
        organizationId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Find cabinet by code within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if cabinet not found
   * - Code search is case-sensitive (database default)
   * - Only searches within specified organization
   * - Excludes soft-deleted cabinets
   *
   * @param code - Cabinet code
   * @param organizationId - Organization ID for tenant scoping
   * @returns Cabinet or null if not found
   */
  async findByCode(code: string, organizationId: OrganizationId): Promise<Cabinet | null> {
    return this.repository.findOne({
      where: {
        code,
        organizationId,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Find default cabinet for organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns null if no default cabinet exists
   * - Only one default cabinet should exist per organization
   * - Returns first one if multiple defaults exist (data inconsistency)
   * - Excludes soft-deleted cabinets
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Default cabinet or null if not found
   */
  async findDefault(organizationId: OrganizationId): Promise<Cabinet | null> {
    return this.repository.findOne({
      where: {
        organizationId,
        isDefault: true,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Find all cabinets in organization with optional filters
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns empty array if no cabinets found
   * - Supports status filtering
   * - Supports owner filtering
   * - Supports default cabinet filtering
   * - Supports name search (case-insensitive partial match)
   * - Ordered by creation date (newest first)
   * - Excludes soft-deleted cabinets
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param query - Optional filters
   * @returns Array of cabinets
   */
  async findAll(organizationId: OrganizationId, query?: FindCabinetsQueryDto): Promise<Cabinet[]> {
    const where: any = {
      organizationId,
      deletedAt: IsNull(),
    };

    // Apply optional filters
    if (query?.status) {
      where.status = query.status;
    }

    if (query?.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query?.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    if (query?.search) {
      where.name = ILike(`%${query.search}%`);
    }

    return this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find all active cabinets in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only returns cabinets with status = ACTIVE
   * - Ordered by creation date (newest first)
   * - Excludes soft-deleted cabinets
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of active cabinets
   */
  async findAllActive(organizationId: OrganizationId): Promise<Cabinet[]> {
    return this.repository.find({
      where: {
        organizationId,
        status: EntityStatus.ACTIVE,
        deletedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Create new cabinet with tenant isolation
   *
   * CRITICAL: Validates code uniqueness within organization and default constraint
   *
   * Edge cases:
   * - Throws ConflictError if code already exists in organization
   * - Allows same code in different organizations
   * - If isDefault=true, unsets default flag on existing default cabinet
   * - Sets default status to ACTIVE if not specified
   * - Initializes optional fields (owner, address, contact, settings)
   *
   * @param data - Cabinet creation data
   * @returns Created cabinet entity
   * @throws {ConflictError} If code already exists in organization
   */
  async create(data: CreateCabinetData): Promise<Cabinet> {
    const organizationId: OrganizationId = data.organizationId;

    // Check for duplicate code within organization
    if (data.code) {
      const existing = await this.findByCode(data.code, organizationId);
      if (existing) {
        throw new ConflictError('Cabinet with this code already exists in organization', {
          conflictType: 'duplicate',
          resourceType: 'cabinet',
          existingId: existing.id,
        });
      }
    }

    // If setting as default, unset existing default
    if (data.isDefault) {
      await this.unsetDefault(organizationId);
    }

    // Create cabinet entity
    const cabinet = this.repository.create({
      organizationId,
      name: data.name,
      code: data.code,
      isDefault: data.isDefault || false,
      ownerId: data.ownerId,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      email: data.email,
      website: data.website,
      settings: data.settings,
      status: data.status || EntityStatus.ACTIVE,
      createdBy: data.createdBy,
    } as Cabinet);

    // Save to database
    return this.repository.save(cabinet);
  }

  /**
   * Update cabinet
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Validates cabinet belongs to organization before update
   * - If changing code, validates new code is unique in organization
   * - If setting isDefault=true, unsets existing default
   * - Allows partial updates (only provided fields updated)
   * - Throws NotFoundError if cabinet not found in organization
   *
   * @param id - Cabinet ID
   * @param data - Update data (partial)
   * @param organizationId - Organization ID for tenant scoping
   * @returns Updated cabinet
   * @throws {NotFoundError} If cabinet not found in organization
   * @throws {ConflictError} If code change conflicts with existing code
   */
  async update(
    id: UUID,
    data: UpdateCabinetData,
    organizationId: OrganizationId,
  ): Promise<Cabinet> {
    // Find existing cabinet
    const cabinet = await this.findById(id, organizationId);
    if (!cabinet) {
      throw new NotFoundError('Cabinet not found in organization', {
        resourceType: 'cabinet',
        resourceId: id,
      });
    }

    // Check for code conflict if code is being changed
    if (data.code && data.code !== cabinet.code) {
      const existing = await this.findByCode(data.code, organizationId);
      if (existing && existing.id !== id) {
        throw new ConflictError('Cabinet with this code already exists in organization', {
          conflictType: 'duplicate',
          resourceType: 'cabinet',
          existingId: existing.id,
        });
      }
    }

    // If setting as default, unset existing default
    if (data.isDefault && !cabinet.isDefault) {
      await this.unsetDefault(organizationId, id);
    }

    // Apply updates
    Object.assign(cabinet, data);

    // Save changes
    return this.repository.save(cabinet);
  }

  /**
   * Update cabinet status
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Validates cabinet belongs to organization before update
   * - Can be used for soft delete (set status to INACTIVE/ARCHIVED)
   * - Throws NotFoundError if cabinet not found in organization
   *
   * @param id - Cabinet ID
   * @param status - New status
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If cabinet not found in organization
   */
  async updateStatus(
    id: UUID,
    status: EntityStatus,
    organizationId: OrganizationId,
  ): Promise<void> {
    const result = await this.repository.update(
      { id, organizationId, deletedAt: IsNull() },
      { status },
    );

    if (result.affected === 0) {
      throw new NotFoundError('Cabinet not found in organization', {
        resourceType: 'cabinet',
        resourceId: id,
      });
    }
  }

  /**
   * Soft delete cabinet (sets deletedAt timestamp)
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Uses TypeORM soft delete (sets deletedAt timestamp)
   * - Validates cabinet belongs to organization before delete
   * - If deleting default cabinet, no other cabinet is set as default
   * - Throws NotFoundError if cabinet not found in organization
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If cabinet not found in organization
   */
  async softDelete(id: UUID, organizationId: OrganizationId): Promise<void> {
    // Verify cabinet exists and belongs to organization
    const cabinet = await this.findById(id, organizationId);
    if (!cabinet) {
      throw new NotFoundError('Cabinet not found in organization', {
        resourceType: 'cabinet',
        resourceId: id,
      });
    }

    // Soft delete
    await this.repository.softDelete({ id, organizationId });
  }

  /**
   * Hard delete cabinet (permanent removal)
   *
   * CRITICAL: Always filtered by organizationId
   * WARNING: This permanently deletes data. Use with caution.
   *
   * Edge cases:
   * - Permanently removes cabinet from database
   * - Validates cabinet belongs to organization before delete
   * - Cannot be undone
   * - Throws NotFoundError if cabinet not found in organization
   *
   * @param id - Cabinet ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If cabinet not found in organization
   */
  async hardDelete(id: UUID, organizationId: OrganizationId): Promise<void> {
    const result = await this.repository.delete({ id, organizationId });

    if (result.affected === 0) {
      throw new NotFoundError('Cabinet not found in organization', {
        resourceType: 'cabinet',
        resourceId: id,
      });
    }
  }

  /**
   * Count cabinets in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param status - Optional status filter
   * @returns Count of cabinets
   */
  async count(organizationId: OrganizationId, status?: EntityStatus): Promise<number> {
    const where: any = {
      organizationId,
      deletedAt: IsNull(),
    };

    if (status) {
      where.status = status;
    }

    return this.repository.count({ where });
  }

  /**
   * Unset default flag on existing default cabinet
   *
   * Private helper method to ensure only one default cabinet per organization
   *
   * @param organizationId - Organization ID
   * @param excludeId - Optional cabinet ID to exclude from update (when updating existing default)
   */
  private async unsetDefault(organizationId: OrganizationId, excludeId?: UUID): Promise<void> {
    const where: any = {
      organizationId,
      isDefault: true,
      deletedAt: IsNull(),
    };

    if (excludeId) {
      // Exclude the cabinet being updated to avoid race condition
      where.id = { $ne: excludeId } as any;
    }

    await this.repository.update(where, { isDefault: false });
  }
}
