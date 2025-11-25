/**
 * Permission Repository
 *
 * Data access layer for Permission entity (global catalog).
 * Unlike other entities, permissions are NOT tenant-scoped.
 * They form a canonical catalog that all organizations reference.
 *
 * Security requirements:
 * - Permissions are read-only for most operations (system-managed)
 * - Permission codes must be globally unique
 * - Validate permission code format on creation
 * - Return null instead of throwing for missing permissions
 *
 * Edge cases handled:
 * - Permission code uniqueness (global)
 * - Permission code format validation (module.resource.action)
 * - Active permission filtering (isActive = true)
 * - Module and resource-based querying
 * - Bulk permission creation for system initialization
 *
 * @module modules/rbac/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission, PermissionAction } from '../entities/permission.entity';
import type { UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError, ValidationError } from '@dentalos/shared-errors';

/**
 * Data transfer object for creating a new permission
 */
export interface CreatePermissionData {
  /** Permission code (module.resource.action) */
  code: string;
  /** Human-readable display name */
  displayName: string;
  /** Permission description */
  description?: string;
  /** Whether permission is active (default: true) */
  isActive?: boolean;
}

/**
 * Data transfer object for updating a permission
 */
export interface UpdatePermissionData {
  /** Human-readable display name */
  displayName?: string;
  /** Permission description */
  description?: string;
  /** Whether permission is active */
  isActive?: boolean;
}

/**
 * Permission repository (global catalog)
 *
 * IMPORTANT: Permissions are NOT tenant-scoped
 * They form a global catalog referenced by all organizations
 *
 * CRITICAL RULES:
 * - Permission codes are globally unique
 * - Code format: module.resource.action (all lowercase)
 * - Permissions are typically system-managed
 * - Most operations are read-only from application perspective
 */
@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly repository: Repository<Permission>
  ) {}

  /**
   * Find permission by code
   *
   * Edge cases:
   * - Returns null if permission not found (not throwing)
   * - Code search is case-sensitive
   * - Permission codes are globally unique
   *
   * @param code - Permission code (module.resource.action)
   * @returns Permission or null if not found
   */
  async findByCode(code: string): Promise<Permission | null> {
    return this.repository.findOne({
      where: { code },
    });
  }

  /**
   * Find permission by ID
   *
   * Edge cases:
   * - Returns null if permission not found
   * - No tenant filtering (permissions are global)
   *
   * @param id - Permission ID (UUID)
   * @returns Permission or null if not found
   */
  async findById(id: UUID): Promise<Permission | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /**
   * Find multiple permissions by IDs
   *
   * Edge cases:
   * - Returns empty array if no permissions found
   * - Handles large arrays of IDs efficiently
   * - No duplicate permissions in result
   *
   * @param ids - Array of permission IDs
   * @returns Array of permissions
   */
  async findByIds(ids: UUID[]): Promise<Permission[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.repository.find({
      where: {
        id: In(ids),
      },
    });
  }

  /**
   * Find multiple permissions by codes
   *
   * Edge cases:
   * - Returns empty array if no permissions found
   * - Handles large arrays of codes efficiently
   * - No duplicate permissions in result
   *
   * @param codes - Array of permission codes
   * @returns Array of permissions
   */
  async findByCodes(codes: string[]): Promise<Permission[]> {
    if (codes.length === 0) {
      return [];
    }

    return this.repository.find({
      where: {
        code: In(codes),
      },
    });
  }

  /**
   * Create new permission
   *
   * CRITICAL: Validates permission code uniqueness and format
   *
   * Edge cases:
   * - Throws ConflictError if code already exists
   * - Validates code format (module.resource.action)
   * - Parses code to extract module, resource, action
   * - Sets isActive to true unless explicitly specified
   *
   * @param data - Permission creation data
   * @returns Created permission entity
   * @throws {ConflictError} If permission code already exists
   * @throws {ValidationError} If permission code format is invalid
   */
  async create(data: CreatePermissionData): Promise<Permission> {
    // Validate permission code format
    if (!Permission.isValidPermissionCode(data.code)) {
      throw new ValidationError('Invalid permission code format. Must be: module.resource.action', {
        errors: [
          {
            field: 'code',
            message:
              'Must match pattern: ^[a-z]+\\.[a-z]+\\.(create|read|update|delete|list|manage|export|import|execute)$',
            value: data.code,
          },
        ],
      });
    }

    // Check for duplicate code
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new ConflictError('Permission with this code already exists', {
        conflictType: 'duplicate',
        resourceType: 'permission',
        existingId: existing.id,
      });
    }

    // Parse code into components
    const parts = data.code.split('.');
    const [module, resource, action] = parts;

    // Create permission entity
    const permission = this.repository.create({
      code: data.code,
      displayName: data.displayName,
      description: data.description,
      module,
      resource,
      action,
      isActive: data.isActive ?? true,
    });

    // Save to database
    return this.repository.save(permission);
  }

  /**
   * Bulk create permissions
   *
   * Useful for system initialization and seeding
   *
   * Edge cases:
   * - Validates all codes before creating any
   * - Skips existing permissions (no error thrown)
   * - Returns array of created permissions only
   * - Handles empty input array
   *
   * @param permissionsData - Array of permission creation data
   * @returns Array of created permissions
   * @throws {ValidationError} If any permission code format is invalid
   */
  async bulkCreate(permissionsData: CreatePermissionData[]): Promise<Permission[]> {
    if (permissionsData.length === 0) {
      return [];
    }

    // Validate all codes first
    for (const data of permissionsData) {
      if (!Permission.isValidPermissionCode(data.code)) {
        throw new ValidationError(`Invalid permission code format: ${data.code}`, {
          errors: [
            {
              field: 'code',
              message: 'Must match pattern: module.resource.action',
              value: data.code,
            },
          ],
        });
      }
    }

    // Check for existing permissions
    const codes = permissionsData.map((d) => d.code);
    const existing = await this.findByCodes(codes);
    const existingCodes = new Set(existing.map((p) => p.code));

    // Filter out existing permissions
    const toCreate = permissionsData.filter((d) => !existingCodes.has(d.code));

    if (toCreate.length === 0) {
      return [];
    }

    // Create permission entities
    const permissions = toCreate.map((data) => {
      const parts = data.code.split('.');
      const [module, resource, action] = parts;

      return this.repository.create({
        code: data.code,
        displayName: data.displayName,
        description: data.description,
        module,
        resource,
        action,
        isActive: data.isActive ?? true,
      });
    });

    // Save all to database
    return this.repository.save(permissions);
  }

  /**
   * Update permission
   *
   * Edge cases:
   * - Only updates provided fields (partial update)
   * - Cannot change permission code after creation
   * - Cannot change module, resource, or action
   *
   * @param id - Permission ID
   * @param data - Permission update data
   * @throws {NotFoundError} If permission not found
   */
  async update(id: UUID, data: UpdatePermissionData): Promise<Permission> {
    // Find permission
    const permission = await this.findById(id);

    if (!permission) {
      throw new NotFoundError('Permission not found', {
        resourceType: 'permission',
        resourceId: id,
      });
    }

    // Update only provided fields
    if (data.displayName !== undefined) {
      permission.displayName = data.displayName;
    }

    if (data.description !== undefined) {
      permission.description = data.description;
    }

    if (data.isActive !== undefined) {
      permission.isActive = data.isActive;
    }

    // Save updated permission
    return this.repository.save(permission);
  }

  /**
   * Find all active permissions
   *
   * Edge cases:
   * - Only returns permissions with isActive = true
   * - Ordered by code alphabetically
   * - Can return large result set (consider pagination in service layer)
   *
   * @returns Array of active permissions
   */
  async findAllActive(): Promise<Permission[]> {
    return this.repository.find({
      where: {
        isActive: true,
      },
      order: {
        code: 'ASC',
      },
    });
  }

  /**
   * Find all permissions (including inactive)
   *
   * Edge cases:
   * - Returns permissions with any status
   * - Useful for admin permission management
   *
   * @returns Array of all permissions
   */
  async findAll(): Promise<Permission[]> {
    return this.repository.find({
      order: {
        code: 'ASC',
      },
    });
  }

  /**
   * Find permissions by module
   *
   * Edge cases:
   * - Returns empty array if no permissions found for module
   * - Only returns active permissions
   * - Ordered by code alphabetically
   *
   * @param module - Module name
   * @returns Array of permissions for module
   */
  async findByModule(module: string): Promise<Permission[]> {
    return this.repository.find({
      where: {
        module,
        isActive: true,
      },
      order: {
        code: 'ASC',
      },
    });
  }

  /**
   * Find permissions by resource
   *
   * Edge cases:
   * - Returns empty array if no permissions found for resource
   * - Only returns active permissions
   * - Ordered by code alphabetically
   *
   * @param resource - Resource name
   * @returns Array of permissions for resource
   */
  async findByResource(resource: string): Promise<Permission[]> {
    return this.repository.find({
      where: {
        resource,
        isActive: true,
      },
      order: {
        code: 'ASC',
      },
    });
  }

  /**
   * Find permissions by action
   *
   * Edge cases:
   * - Returns empty array if no permissions found for action
   * - Only returns active permissions
   * - Ordered by code alphabetically
   *
   * @param action - Action type
   * @returns Array of permissions for action
   */
  async findByAction(action: PermissionAction | string): Promise<Permission[]> {
    return this.repository.find({
      where: {
        action,
        isActive: true,
      },
      order: {
        code: 'ASC',
      },
    });
  }

  /**
   * Count total active permissions
   *
   * @returns Number of active permissions
   */
  async countActive(): Promise<number> {
    return this.repository.count({
      where: {
        isActive: true,
      },
    });
  }

  /**
   * Check if permission code exists
   *
   * @param code - Permission code to check
   * @returns true if permission exists
   */
  async exists(code: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { code },
    });
    return count > 0;
  }
}
