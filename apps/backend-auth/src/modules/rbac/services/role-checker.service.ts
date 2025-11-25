/**
 * Role Checker Service
 *
 * Provides methods to check user roles with caching support.
 * Integrates with UserRoleRepository for role verification.
 *
 * Security requirements:
 * - Always filter by organizationId for tenant isolation
 * - Handle role expiration and revocation
 * - Support system role checks (super_admin, tenant_admin)
 *
 * @module modules/rbac/services
 */

import { Injectable } from '@nestjs/common';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { Role, SystemRole } from '../entities/role.entity';

/**
 * Role checker service
 *
 * Provides role verification methods.
 * All methods are tenant-scoped for security.
 */
@Injectable()
export class RoleCheckerService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {}

  /**
   * Check if user has a specific role
   *
   * Edge cases:
   * - Returns false for non-existent users
   * - Returns false for expired/revoked roles
   * - Handles both org-wide and clinic-specific roles
   * - Case-sensitive role name matching
   *
   * @param userId - User ID
   * @param roleName - Role name to check
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has role
   */
  async hasRole(
    userId: UUID,
    roleName: string,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    // Get user's active roles
    const userRoles = await this.userRoleRepository.findActiveRolesByUser(
      userId,
      organizationId,
      clinicId
    );

    // Check if any role matches the requested name
    return userRoles.some((ur) => ur.role?.name === roleName);
  }

  /**
   * Check if user is super admin
   *
   * DEPRECATED: This method requires organization context in multi-tenant systems.
   * Use `hasRole(userId, SystemRole.SUPER_ADMIN, organizationId)` instead.
   *
   * Super admins have full system access across all organizations.
   * However, in this multi-tenant implementation, super_admin roles are
   * organization-scoped for security and data isolation.
   *
   * Edge cases:
   * - Returns false for non-existent users
   * - Super admin role must be active
   * - Requires organizationId parameter for proper scoping
   *
   * @deprecated Use hasRole(userId, SystemRole.SUPER_ADMIN, organizationId) instead
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping (optional for backward compat)
   * @returns true if user is super admin
   */
  async isSuperAdmin(userId: UUID, organizationId?: OrganizationId): Promise<boolean> {
    if (!organizationId) {
      // If no organizationId provided, throw descriptive error
      throw new Error(
        'isSuperAdmin requires organizationId parameter in multi-tenant systems. ' +
          'Use hasRole(userId, SystemRole.SUPER_ADMIN, organizationId) instead.'
      );
    }

    // Check if user has super_admin role in the specified organization
    return this.hasRole(userId, SystemRole.SUPER_ADMIN, organizationId);
  }

  /**
   * Check if user is tenant admin (organization admin)
   *
   * Tenant admins have full access within their organization.
   *
   * Edge cases:
   * - Returns false for non-existent users
   * - Tenant admin role must be active
   * - Checks within specified organization only
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns true if user is tenant admin
   */
  async isTenantAdmin(userId: UUID, organizationId: OrganizationId): Promise<boolean> {
    return this.hasRole(userId, SystemRole.TENANT_ADMIN, organizationId);
  }

  /**
   * Get all active roles for user
   *
   * Edge cases:
   * - Returns empty array for users with no roles
   * - Only returns active (non-revoked, non-expired) roles
   * - Includes both org-wide and clinic-specific roles if clinicId provided
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns Array of user's active roles
   */
  async getUserRoles(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<Role[]> {
    // Get user's active role assignments
    const userRoles = await this.userRoleRepository.findActiveRolesByUser(
      userId,
      organizationId,
      clinicId
    );

    // Extract and return Role entities
    return userRoles
      .map((ur) => ur.role)
      .filter((role): role is Role => role !== undefined && role !== null);
  }

  /**
   * Check if user has any of specified roles (OR logic)
   *
   * Edge cases:
   * - Returns false if no roles match
   * - Returns false for empty roles array
   * - Handles expired/revoked roles
   *
   * @param userId - User ID
   * @param roleNames - Array of role names to check
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has at least one role
   */
  async hasAnyRole(
    userId: UUID,
    roleNames: string[],
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    if (roleNames.length === 0) {
      return false;
    }

    // Get user's active roles
    const userRoles = await this.userRoleRepository.findActiveRolesByUser(
      userId,
      organizationId,
      clinicId
    );

    const userRoleNames = new Set(
      userRoles.map((ur) => ur.role?.name).filter((name): name is string => !!name)
    );

    // Check if any requested role exists
    return roleNames.some((name) => userRoleNames.has(name));
  }

  /**
   * Check if user has all specified roles (AND logic)
   *
   * Edge cases:
   * - Returns false if any role is missing
   * - Returns true for empty roles array (vacuous truth)
   * - Handles expired/revoked roles
   *
   * @param userId - User ID
   * @param roleNames - Array of role names to check
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has all roles
   */
  async hasAllRoles(
    userId: UUID,
    roleNames: string[],
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    if (roleNames.length === 0) {
      return true; // Vacuous truth
    }

    // Get user's active roles
    const userRoles = await this.userRoleRepository.findActiveRolesByUser(
      userId,
      organizationId,
      clinicId
    );

    const userRoleNames = new Set(
      userRoles.map((ur) => ur.role?.name).filter((name): name is string => !!name)
    );

    // Check if all requested roles exist
    return roleNames.every((name) => userRoleNames.has(name));
  }

  /**
   * Count active roles for user
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns Number of active roles
   */
  async countUserRoles(userId: UUID, organizationId: OrganizationId): Promise<number> {
    return this.userRoleRepository.countActiveRolesByUser(userId, organizationId);
  }

  /**
   * Check if user has system role (super_admin or tenant_admin)
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns true if user has any system role
   */
  async hasSystemRole(userId: UUID, organizationId: OrganizationId): Promise<boolean> {
    return this.hasAnyRole(
      userId,
      [SystemRole.SUPER_ADMIN, SystemRole.TENANT_ADMIN],
      organizationId
    );
  }
}
