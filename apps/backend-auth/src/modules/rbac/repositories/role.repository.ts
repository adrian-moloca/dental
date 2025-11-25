/**
 * Role Repository
 *
 * Data access layer for Role entity with strict multi-tenant isolation.
 * All queries MUST include organizationId filter to prevent cross-tenant data leakage.
 *
 * Security requirements:
 * - NEVER query roles without organizationId filter
 * - Check for duplicate role names within (organizationId, clinicId) scope
 * - System roles cannot be modified or deleted
 * - Return null instead of throwing for missing roles (let service layer decide)
 * - Validate tenant isolation on all mutations
 *
 * Edge cases handled:
 * - Role name uniqueness per (organizationId, clinicId)
 * - System roles protection (cannot modify/delete)
 * - Clinic-specific vs organization-wide roles
 * - Soft delete via deletedAt
 * - Active role filtering (isActive = true)
 *
 * @module modules/rbac/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Role } from '../entities/role.entity';
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError, ValidationError } from '@dentalos/shared-errors';

/**
 * Data transfer object for creating a new role
 */
export interface CreateRoleData {
  /** Role name (lowercase, underscores only) */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Role description */
  description?: string;
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-specific roles) */
  clinicId?: ClinicId;
  /** Whether role is system-defined (default: false) */
  isSystem?: boolean;
  /** Whether role is active (default: true) */
  isActive?: boolean;
}

/**
 * Data transfer object for updating a role
 */
export interface UpdateRoleData {
  /** Human-readable display name */
  displayName?: string;
  /** Role description */
  description?: string;
  /** Whether role is active */
  isActive?: boolean;
}

/**
 * Role repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - Role name uniqueness checked within (organizationId, clinicId) scope
 * - No cross-tenant data access allowed
 * - System roles cannot be modified or deleted
 * - Mutations validate tenant ownership before update/delete
 */
@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>
  ) {}

  /**
   * Find role by name within organization and clinic scope
   *
   * CRITICAL: Always filtered by organizationId and clinicId for tenant isolation
   *
   * Edge cases:
   * - Returns null if role not found (not throwing)
   * - Handles both org-wide roles (clinicId = null) and clinic-specific roles
   * - Name search is case-sensitive
   *
   * @param name - Role name
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns Role or null if not found
   */
  async findByName(
    name: string,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<Role | null> {
    return this.repository.findOne({
      where: {
        name,
        organizationId,
        clinicId: clinicId ?? IsNull(),
      },
    });
  }

  /**
   * Find role by ID within organization
   *
   * CRITICAL: Always filtered by organizationId for tenant isolation
   *
   * Edge cases:
   * - Returns null if role not found
   * - Validates role belongs to specified organization
   * - Prevents cross-tenant role access
   *
   * @param id - Role ID (UUID)
   * @param organizationId - Organization ID for tenant scoping
   * @returns Role or null if not found
   */
  async findById(id: UUID, organizationId: OrganizationId): Promise<Role | null> {
    return this.repository.findOne({
      where: {
        id,
        organizationId,
      },
    });
  }

  /**
   * Find role by ID without organization filter (DANGEROUS - use with caution)
   * Only for system operations that need to verify role existence
   *
   * @param id - Role ID (UUID)
   * @returns Role or null if not found
   */
  async findByIdUnsafe(id: UUID): Promise<Role | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Create new role with tenant isolation
   *
   * CRITICAL: Validates role name uniqueness within (organizationId, clinicId)
   *
   * Edge cases:
   * - Throws ConflictError if role name already exists in scope
   * - Validates role name format (lowercase, underscores only)
   * - Sets isSystem to false unless explicitly specified
   * - Sets isActive to true unless explicitly specified
   * - Handles both org-wide and clinic-specific roles
   *
   * @param data - Role creation data
   * @returns Created role entity
   * @throws {ConflictError} If role name already exists in scope
   * @throws {ValidationError} If role name format is invalid
   */
  async create(data: CreateRoleData): Promise<Role> {
    // Validate role name format
    const namePattern = /^[a-z_]+$/;
    if (!namePattern.test(data.name)) {
      throw new ValidationError('Role name must contain only lowercase letters and underscores', {
        errors: [
          {
            field: 'name',
            message: 'Must match pattern: ^[a-z_]+$',
            value: data.name,
          },
        ],
      });
    }

    // Check for duplicate role name within scope
    const existing = await this.findByName(data.name, data.organizationId, data.clinicId);

    if (existing) {
      throw new ConflictError('Role with this name already exists in organization scope', {
        conflictType: 'duplicate',
        resourceType: 'role',
        existingId: existing.id,
      });
    }

    // Create role entity
    const role = this.repository.create({
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      organizationId: data.organizationId,
      clinicId: data.clinicId,
      isSystem: data.isSystem ?? false,
      isActive: data.isActive ?? true,
    });

    // Save to database
    return this.repository.save(role);
  }

  /**
   * Update role
   *
   * CRITICAL: System roles cannot be updated
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Throws ValidationError if attempting to modify system role
   * - Validates role belongs to organization before update
   * - Only updates provided fields (partial update)
   * - Cannot change role name after creation
   *
   * @param id - Role ID
   * @param data - Role update data
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If role not found in organization
   * @throws {ValidationError} If attempting to modify system role
   */
  async update(id: UUID, data: UpdateRoleData, organizationId: OrganizationId): Promise<Role> {
    // Find role with tenant check
    const role = await this.findById(id, organizationId);

    if (!role) {
      throw new NotFoundError('Role not found in organization', {
        resourceType: 'role',
        resourceId: id,
      });
    }

    // Prevent modification of system roles
    if (role.isSystem) {
      throw new ValidationError('System roles cannot be modified', {
        errors: [
          {
            field: 'isSystem',
            message: 'Cannot modify system-defined roles',
            value: role.name,
          },
        ],
      });
    }

    // Update only provided fields
    if (data.displayName !== undefined) {
      role.displayName = data.displayName;
    }

    if (data.description !== undefined) {
      role.description = data.description;
    }

    if (data.isActive !== undefined) {
      role.isActive = data.isActive;
    }

    // Save updated role
    return this.repository.save(role);
  }

  /**
   * Soft delete role (mark as deleted)
   *
   * CRITICAL: System roles cannot be deleted
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Throws ValidationError if attempting to delete system role
   * - Validates role belongs to organization before delete
   * - Sets deletedAt timestamp for audit trail
   * - Sets isActive to false
   *
   * @param id - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If role not found in organization
   * @throws {ValidationError} If attempting to delete system role
   */
  async softDelete(id: UUID, organizationId: OrganizationId): Promise<void> {
    // Find role with tenant check
    const role = await this.findById(id, organizationId);

    if (!role) {
      throw new NotFoundError('Role not found in organization', {
        resourceType: 'role',
        resourceId: id,
      });
    }

    // Prevent deletion of system roles
    if (role.isSystem) {
      throw new ValidationError('System roles cannot be deleted', {
        errors: [
          {
            field: 'isSystem',
            message: 'Cannot delete system-defined roles',
            value: role.name,
          },
        ],
      });
    }

    // Soft delete
    role.deletedAt = new Date();
    role.isActive = false;

    await this.repository.save(role);
  }

  /**
   * Find all active roles in organization
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Only returns roles with isActive = true AND deletedAt = null
   * - Includes both org-wide and clinic-specific roles
   * - Ordered by creation date (newest first)
   *
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID to filter clinic-specific roles
   * @returns Array of active roles
   */
  async findAllActive(organizationId: OrganizationId, clinicId?: ClinicId): Promise<Role[]> {
    const where: Record<string, unknown> = {
      organizationId,
      isActive: true,
      deletedAt: IsNull(),
    };

    // If clinicId provided, include both org-wide and clinic-specific roles
    if (clinicId) {
      return this.repository
        .createQueryBuilder('role')
        .where('role.organization_id = :organizationId', { organizationId })
        .andWhere('role.is_active = :isActive', { isActive: true })
        .andWhere('role.deleted_at IS NULL')
        .andWhere('(role.clinic_id = :clinicId OR role.clinic_id IS NULL)', { clinicId })
        .orderBy('role.created_at', 'DESC')
        .getMany();
    }

    return this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find all roles in organization (including inactive and deleted)
   *
   * CRITICAL: Always filtered by organizationId
   *
   * Edge cases:
   * - Returns roles with any status
   * - Useful for admin role management
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of all roles
   */
  async findAll(organizationId: OrganizationId): Promise<Role[]> {
    return this.repository.find({
      where: {
        organizationId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Find system roles in organization
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of system roles
   */
  async findSystemRoles(organizationId: OrganizationId): Promise<Role[]> {
    return this.repository.find({
      where: {
        organizationId,
        isSystem: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Count active roles in organization
   *
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of active roles
   */
  async countActive(organizationId: OrganizationId): Promise<number> {
    return this.repository.count({
      where: {
        organizationId,
        isActive: true,
        deletedAt: IsNull(),
      },
    });
  }
}
