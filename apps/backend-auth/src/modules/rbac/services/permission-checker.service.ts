/**
 * Permission Checker Service
 *
 * Provides methods to check user permissions with Redis caching.
 * Integrates with UserRoleRepository and RolePermissionRepository.
 *
 * Security requirements:
 * - Always filter by organizationId for tenant isolation
 * - Cache user permissions in Redis (TTL: 5 minutes)
 * - Invalidate cache on role assignment/revocation
 * - Handle permission inheritance (org-wide vs clinic-specific)
 *
 * Performance optimizations:
 * - Redis caching for permission lookups
 * - Batch permission queries
 * - Efficient JOIN queries via repositories
 *
 * @module modules/rbac/services
 */

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { UserRoleRepository } from '../repositories/user-role.repository';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { Permission } from '../entities/permission.entity';

/**
 * Permission checker service
 *
 * Provides high-performance permission checking with Redis caching.
 * All methods are tenant-scoped for security.
 */
@Injectable()
export class PermissionCheckerService {
  // Cache TTL: 5 minutes (300 seconds)
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly userRoleRepository: UserRoleRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Check if user has a specific permission
   *
   * Edge cases:
   * - Returns false for non-existent users
   * - Returns false for expired/revoked roles
   * - Handles both org-wide and clinic-specific permissions
   * - Cache miss triggers full permission resolution
   *
   * @param userId - User ID
   * @param permissionCode - Permission code (module.resource.action)
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has permission
   */
  async hasPermission(
    userId: UUID,
    permissionCode: string,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    // Get all user permissions (cached)
    const permissions = await this.getUserPermissions(userId, organizationId, clinicId);

    // Check if permission code exists in user's permissions
    return permissions.some((p) => p.code === permissionCode);
  }

  /**
   * Check if user has all specified permissions (AND logic)
   *
   * Edge cases:
   * - Returns false if any permission is missing
   * - Returns true for empty permission array (vacuous truth)
   * - Uses cached permissions for efficiency
   *
   * @param userId - User ID
   * @param permissionCodes - Array of permission codes
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has all permissions
   */
  async hasAllPermissions(
    userId: UUID,
    permissionCodes: string[],
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    if (permissionCodes.length === 0) {
      return true; // Vacuous truth
    }

    // Get all user permissions (cached)
    const permissions = await this.getUserPermissions(userId, organizationId, clinicId);

    const userPermissionCodes = new Set(permissions.map((p) => p.code));

    // Check if all required permissions exist
    return permissionCodes.every((code) => userPermissionCodes.has(code));
  }

  /**
   * Check if user has any of specified permissions (OR logic)
   *
   * Edge cases:
   * - Returns false if no permissions match
   * - Returns false for empty permission array
   * - Uses cached permissions for efficiency
   *
   * @param userId - User ID
   * @param permissionCodes - Array of permission codes
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns true if user has at least one permission
   */
  async hasAnyPermission(
    userId: UUID,
    permissionCodes: string[],
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<boolean> {
    if (permissionCodes.length === 0) {
      return false;
    }

    // Get all user permissions (cached)
    const permissions = await this.getUserPermissions(userId, organizationId, clinicId);

    const userPermissionCodes = new Set(permissions.map((p) => p.code));

    // Check if any required permission exists
    return permissionCodes.some((code) => userPermissionCodes.has(code));
  }

  /**
   * Get all permissions for user
   *
   * Implements caching strategy:
   * 1. Check Redis cache first
   * 2. On cache miss, query database
   * 3. Store result in cache (TTL: 5 minutes)
   * 4. Return permissions
   *
   * Edge cases:
   * - Returns empty array for users with no roles
   * - Deduplicates permissions across multiple roles
   * - Includes permissions from both org-wide and clinic-specific roles
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   * @returns Array of user's permissions
   */
  async getUserPermissions(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<Permission[]> {
    // Generate cache key
    const cacheKey = this.buildCacheKey(userId, organizationId, clinicId);

    // Try to get from cache
    const cached = await this.cacheManager.get<Permission[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - resolve permissions from database
    const permissions = await this.resolveUserPermissions(userId, organizationId, clinicId);

    // Store in cache
    await this.cacheManager.set(cacheKey, permissions, this.CACHE_TTL);

    return permissions;
  }

  /**
   * Invalidate user permissions cache
   *
   * Call this after role assignment/revocation to ensure fresh data
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @param clinicId - Optional clinic ID for clinic scoping
   */
  async invalidateUserPermissionsCache(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(userId, organizationId, clinicId);
    await this.cacheManager.del(cacheKey);
  }

  /**
   * Resolve user permissions from database
   *
   * Implementation:
   * 1. Get user's active roles
   * 2. Extract role IDs
   * 3. Get permissions for all roles
   * 4. Deduplicate permissions
   * 5. Return unique permissions
   *
   * @private
   */
  private async resolveUserPermissions(
    userId: UUID,
    organizationId: OrganizationId,
    clinicId?: ClinicId
  ): Promise<Permission[]> {
    // Get user's active roles
    const userRoles = await this.userRoleRepository.findActiveRolesByUser(
      userId,
      organizationId,
      clinicId
    );

    if (userRoles.length === 0) {
      return [];
    }

    // Extract role IDs
    const roleIds = userRoles.map((ur) => ur.roleId);

    // Get permissions for all roles
    const rolePermissions = await this.rolePermissionRepository.findPermissionsByRoles(
      roleIds,
      organizationId
    );

    // Extract unique permissions
    const permissionMap = new Map<UUID, Permission>();
    for (const rp of rolePermissions) {
      if (rp.permission && rp.permission.isActive) {
        permissionMap.set(rp.permission.id, rp.permission);
      }
    }

    return Array.from(permissionMap.values());
  }

  /**
   * Build cache key for user permissions
   *
   * Format: user:permissions:{organizationId}:{userId}:{clinicId?}
   *
   * @private
   */
  private buildCacheKey(userId: UUID, organizationId: OrganizationId, clinicId?: ClinicId): string {
    const parts = ['user', 'permissions', organizationId, userId];
    if (clinicId) {
      parts.push(clinicId);
    }
    return parts.join(':');
  }
}
