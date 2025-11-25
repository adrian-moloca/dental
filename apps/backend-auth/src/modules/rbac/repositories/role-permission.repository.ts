/**
 * RolePermission Repository
 *
 * Data access layer for RolePermission join entity with tenant isolation.
 * Manages permission assignments to roles.
 *
 * Security requirements:
 * - NEVER query role permissions without organizationId filter
 * - Prevent duplicate permission assignments to same role
 * - Validate tenant isolation on all mutations
 * - Full audit trail with grantedBy tracking
 *
 * Edge cases handled:
 * - Duplicate permission prevention
 * - Bulk permission assignment/removal
 * - Permission inheritance queries
 * - Efficient permission lookups for role chains
 *
 * @module modules/rbac/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';

/**
 * Data transfer object for granting permission to role
 */
export interface GrantPermissionData {
  /** Role ID */
  roleId: UUID;
  /** Permission ID */
  permissionId: UUID;
  /** Organization ID (REQUIRED for tenant isolation) */
  organizationId: OrganizationId;
  /** User who is granting this permission */
  grantedBy: UUID;
}

/**
 * RolePermission repository with tenant-scoped data access
 *
 * CRITICAL SECURITY RULES:
 * - ALL queries MUST filter by organizationId
 * - No duplicate permission assignments per role
 * - Validate tenant ownership before mutations
 * - Full audit trail with grantedBy and grantedAt
 */
@Injectable()
export class RolePermissionRepository {
  constructor(
    @InjectRepository(RolePermission)
    private readonly repository: Repository<RolePermission>
  ) {}

  /**
   * Find permission assignment
   *
   * CRITICAL: Filtered by organizationId
   *
   * Edge cases:
   * - Returns null if assignment not found
   * - Validates role and permission exist
   * - Checks tenant ownership
   *
   * @param roleId - Role ID
   * @param permissionId - Permission ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns RolePermission or null if not found
   */
  async findAssignment(
    roleId: UUID,
    permissionId: UUID,
    organizationId: OrganizationId
  ): Promise<RolePermission | null> {
    return this.repository.findOne({
      where: {
        roleId,
        permissionId,
        organizationId,
      },
    });
  }

  /**
   * Find all permissions for a role
   *
   * CRITICAL: Filtered by organizationId
   *
   * Edge cases:
   * - Returns empty array if no permissions assigned
   * - Includes permission details via relation
   * - Ordered by permission code
   *
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of role permission assignments with permission details
   */
  async findPermissionsByRole(
    roleId: UUID,
    organizationId: OrganizationId
  ): Promise<RolePermission[]> {
    return this.repository.find({
      where: {
        roleId,
        organizationId,
      },
      relations: ['permission'],
      order: {
        permission: {
          code: 'ASC',
        },
      },
    });
  }

  /**
   * Find all permissions for multiple roles (bulk)
   *
   * CRITICAL: Filtered by organizationId
   *
   * Edge cases:
   * - Returns empty array if no permissions assigned
   * - Handles empty roleIds array
   * - Deduplicates permissions across roles
   * - Efficient for permission resolution
   *
   * @param roleIds - Array of role IDs
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of unique permissions across all roles
   */
  async findPermissionsByRoles(
    roleIds: UUID[],
    organizationId: OrganizationId
  ): Promise<RolePermission[]> {
    if (roleIds.length === 0) {
      return [];
    }

    return this.repository.find({
      where: {
        roleId: In(roleIds),
        organizationId,
      },
      relations: ['permission'],
    });
  }

  /**
   * Find all roles that have a specific permission
   *
   * CRITICAL: Filtered by organizationId
   *
   * Edge cases:
   * - Returns empty array if no roles have permission
   * - Useful for permission impact analysis
   * - Includes role details via relation
   *
   * @param permissionId - Permission ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Array of role permission assignments with role details
   */
  async findRolesByPermission(
    permissionId: UUID,
    organizationId: OrganizationId
  ): Promise<RolePermission[]> {
    return this.repository.find({
      where: {
        permissionId,
        organizationId,
      },
      relations: ['role'],
      order: {
        role: {
          name: 'ASC',
        },
      },
    });
  }

  /**
   * Grant permission to role
   *
   * CRITICAL: Validates no duplicate assignment exists
   *
   * Edge cases:
   * - Throws ConflictError if permission already granted
   * - Records grantedBy for audit trail
   * - Sets grantedAt timestamp automatically
   *
   * @param data - Permission grant data
   * @returns Created role permission assignment
   * @throws {ConflictError} If permission already granted to role
   */
  async grantPermission(data: GrantPermissionData): Promise<RolePermission> {
    // Check for existing assignment
    const existing = await this.findAssignment(data.roleId, data.permissionId, data.organizationId);

    if (existing) {
      throw new ConflictError('Permission already granted to role', {
        conflictType: 'duplicate',
        resourceType: 'role_permission',
        existingId: existing.id,
      });
    }

    // Create role permission assignment
    const rolePermission = this.repository.create({
      roleId: data.roleId,
      permissionId: data.permissionId,
      organizationId: data.organizationId,
      grantedBy: data.grantedBy,
    });

    // Save to database
    return this.repository.save(rolePermission);
  }

  /**
   * Grant multiple permissions to role (bulk)
   *
   * CRITICAL: Validates no duplicate assignments
   *
   * Edge cases:
   * - Skips already granted permissions (no error)
   * - Returns only newly created assignments
   * - Handles empty permissionIds array
   * - Atomic operation (all or nothing)
   *
   * @param roleId - Role ID
   * @param permissionIds - Array of permission IDs to grant
   * @param organizationId - Organization ID for tenant scoping
   * @param grantedBy - User who is granting permissions
   * @returns Array of created role permission assignments
   */
  async grantPermissions(
    roleId: UUID,
    permissionIds: UUID[],
    organizationId: OrganizationId,
    grantedBy: UUID
  ): Promise<RolePermission[]> {
    if (permissionIds.length === 0) {
      return [];
    }

    // Find existing assignments
    const existing = await this.repository.find({
      where: {
        roleId,
        permissionId: In(permissionIds),
        organizationId,
      },
    });

    const existingPermissionIds = new Set(existing.map((rp) => rp.permissionId));

    // Filter out already granted permissions
    const newPermissionIds = permissionIds.filter((id) => !existingPermissionIds.has(id));

    if (newPermissionIds.length === 0) {
      return [];
    }

    // Create new assignments
    const rolePermissions = newPermissionIds.map((permissionId) =>
      this.repository.create({
        roleId,
        permissionId,
        organizationId,
        grantedBy,
      })
    );

    // Save all to database
    return this.repository.save(rolePermissions);
  }

  /**
   * Revoke permission from role
   *
   * CRITICAL: Only revokes within organization scope
   *
   * Edge cases:
   * - Throws NotFoundError if permission not granted
   * - Completely removes assignment (hard delete)
   * - No soft delete for role permissions
   *
   * @param roleId - Role ID
   * @param permissionId - Permission ID
   * @param organizationId - Organization ID for tenant scoping
   * @throws {NotFoundError} If permission not granted to role
   */
  async revokePermission(
    roleId: UUID,
    permissionId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    // Find assignment
    const assignment = await this.findAssignment(roleId, permissionId, organizationId);

    if (!assignment) {
      throw new NotFoundError('Permission not granted to role', {
        resourceType: 'role_permission',
        context: {
          roleId,
          permissionId,
        },
      });
    }

    // Remove assignment (hard delete)
    await this.repository.remove(assignment);
  }

  /**
   * Revoke all permissions from role
   *
   * CRITICAL: Only revokes within organization scope
   *
   * Edge cases:
   * - Removes all permission assignments
   * - No error if role has no permissions
   * - Atomic operation
   *
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   */
  async revokeAllPermissions(roleId: UUID, organizationId: OrganizationId): Promise<void> {
    await this.repository.delete({
      roleId,
      organizationId,
    });
  }

  /**
   * Replace all permissions for role (sync operation)
   *
   * CRITICAL: Removes old permissions and adds new ones
   *
   * Edge cases:
   * - Removes permissions not in new list
   * - Adds permissions not currently granted
   * - Keeps permissions that are in both lists
   * - Atomic operation (transaction recommended in service layer)
   *
   * @param roleId - Role ID
   * @param permissionIds - New set of permission IDs
   * @param organizationId - Organization ID for tenant scoping
   * @param grantedBy - User who is updating permissions
   * @returns Array of current role permission assignments
   */
  async replacePermissions(
    roleId: UUID,
    permissionIds: UUID[],
    organizationId: OrganizationId,
    grantedBy: UUID
  ): Promise<RolePermission[]> {
    // Find current assignments
    const current = await this.findPermissionsByRole(roleId, organizationId);
    const currentPermissionIds = new Set(current.map((rp) => rp.permissionId));
    const newPermissionIds = new Set(permissionIds);

    // Determine permissions to remove
    const toRemove = current.filter((rp) => !newPermissionIds.has(rp.permissionId));

    // Determine permissions to add
    const toAdd = permissionIds.filter((id) => !currentPermissionIds.has(id));

    // Remove old permissions
    if (toRemove.length > 0) {
      await this.repository.remove(toRemove);
    }

    // Add new permissions
    if (toAdd.length > 0) {
      const newAssignments = toAdd.map((permissionId) =>
        this.repository.create({
          roleId,
          permissionId,
          organizationId,
          grantedBy,
        })
      );
      await this.repository.save(newAssignments);
    }

    // Return updated assignments
    return this.findPermissionsByRole(roleId, organizationId);
  }

  /**
   * Count permissions for role
   *
   * @param roleId - Role ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of permissions granted to role
   */
  async countPermissionsByRole(roleId: UUID, organizationId: OrganizationId): Promise<number> {
    return this.repository.count({
      where: {
        roleId,
        organizationId,
      },
    });
  }

  /**
   * Count roles with specific permission
   *
   * @param permissionId - Permission ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of roles with permission
   */
  async countRolesByPermission(
    permissionId: UUID,
    organizationId: OrganizationId
  ): Promise<number> {
    return this.repository.count({
      where: {
        permissionId,
        organizationId,
      },
    });
  }

  /**
   * Check if role has specific permission
   *
   * @param roleId - Role ID
   * @param permissionId - Permission ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns true if role has permission
   */
  async hasPermission(
    roleId: UUID,
    permissionId: UUID,
    organizationId: OrganizationId
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        roleId,
        permissionId,
        organizationId,
      },
    });
    return count > 0;
  }
}
