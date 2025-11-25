/**
 * Permission Checker Service Unit Tests
 *
 * Comprehensive test suite for PermissionCheckerService covering:
 * - Single permission checking
 * - Multiple permission checking (AND/OR logic)
 * - User permission resolution
 * - Redis caching functionality
 * - Cache invalidation
 * - Multi-tenant isolation
 * - Expired/revoked role handling
 * - Edge cases and boundary conditions
 *
 * Test Coverage:
 * - Permission Checking: hasPermission, hasAllPermissions, hasAnyPermission
 * - Cache Management: getUserPermissions with caching, invalidation
 * - Multi-Tenant: Organization and clinic scoping
 * - Edge Cases: Empty permissions, non-existent users, expired roles
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Cache } from 'cache-manager';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { PermissionCheckerService } from '../../../../../src/modules/rbac/services/permission-checker.service';
import { UserRoleRepository } from '../../../../../src/modules/rbac/repositories/user-role.repository';
import { RolePermissionRepository } from '../../../../../src/modules/rbac/repositories/role-permission.repository';
import {
  createTestPermission,
  createTestUserRole,
  createTestRolePermission,
} from '../../../../utils/rbac-test-helpers';

describe('PermissionCheckerService', () => {
  let service: PermissionCheckerService;
  let userRoleRepository: UserRoleRepository;
  let rolePermissionRepository: RolePermissionRepository;
  let cacheManager: Cache;

  // Test data constants
  const testOrgId = 'org-123' as OrganizationId;
  const testClinicId = 'clinic-456' as ClinicId;
  const testUserId = 'user-789' as UUID;
  const testRoleId = 'role-001' as UUID;

  beforeEach(() => {
    // Create mock repositories
    userRoleRepository = {
      findActiveRolesByUser: vi.fn(),
      countActiveRolesByUser: vi.fn(),
      assignRole: vi.fn(),
      revokeRole: vi.fn(),
    } as any;

    rolePermissionRepository = {
      findPermissionsByRoles: vi.fn(),
      grantPermissions: vi.fn(),
      revokePermissions: vi.fn(),
      replacePermissions: vi.fn(),
    } as any;

    cacheManager = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
      reset: vi.fn(),
      wrap: vi.fn(),
    } as any;

    // Create service instance
    service = new PermissionCheckerService(
      userRoleRepository,
      rolePermissionRepository,
      cacheManager,
    );
  });

  /* ============================================================================
   * hasPermission() - Single Permission Check
   * ============================================================================ */

  describe('hasPermission', () => {
    it('should return true if user has exact permission', async () => {
      // Arrange
      const permissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('clinical', 'patient', 'read'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(null); // Cache miss
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, { organizationId: testOrgId }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(testRoleId, permissions[0].id, {
          organizationId: testOrgId,
          permission: permissions[0],
        } as any),
      ]);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'scheduling.appointment.read',
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user lacks permission', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'clinical.patient.delete', // User doesn't have this
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should use cached permissions if available', async () => {
      // Arrange
      const cachedPermissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(cachedPermissions);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'scheduling.appointment.read',
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
      expect(userRoleRepository.findActiveRolesByUser).not.toHaveBeenCalled();
      expect(rolePermissionRepository.findPermissionsByRoles).not.toHaveBeenCalled();
    });

    it('should fetch from database on cache miss', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(null); // Cache miss

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
      });
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      const rolePermission = createTestRolePermission(testRoleId, permissions[0].id, {
        organizationId: testOrgId,
        permission: permissions[0],
      } as any);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        rolePermission,
      ]);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'scheduling.appointment.read',
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        undefined,
      );
      expect(rolePermissionRepository.findPermissionsByRoles).toHaveBeenCalledWith(
        [testRoleId],
        testOrgId,
      );
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should handle clinic-scoped permission checks', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          clinicId: testClinicId,
        }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(testRoleId, permissions[0].id, {
          organizationId: testOrgId,
          permission: permissions[0],
        } as any),
      ]);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'scheduling.appointment.read',
        testOrgId,
        testClinicId,
      );

      // Assert
      expect(result).toBe(true);
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        testClinicId,
      );
    });

    it('should return false for users with no roles', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.hasPermission(
        testUserId,
        'scheduling.appointment.read',
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
      expect(rolePermissionRepository.findPermissionsByRoles).not.toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * hasAllPermissions() - AND Logic Permission Check
   * ============================================================================ */

  describe('hasAllPermissions', () => {
    it('should return true if user has all requested permissions', async () => {
      // Arrange
      const permissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('scheduling', 'appointment', 'create'),
        createTestPermission('scheduling', 'appointment', 'update'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasAllPermissions(
        testUserId,
        [
          'scheduling.appointment.read',
          'scheduling.appointment.create',
          'scheduling.appointment.update',
        ],
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user lacks any permission', async () => {
      // Arrange
      const permissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('scheduling', 'appointment', 'create'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasAllPermissions(
        testUserId,
        [
          'scheduling.appointment.read',
          'scheduling.appointment.create',
          'scheduling.appointment.delete', // Missing this one
        ],
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for empty permission array (vacuous truth)', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue([]);

      // Act
      const result = await service.hasAllPermissions(testUserId, [], testOrgId);

      // Assert
      expect(result).toBe(true);
    });

    it('should use cached permissions for efficiency', async () => {
      // Arrange
      const cachedPermissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('scheduling', 'appointment', 'create'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(cachedPermissions);

      // Act
      await service.hasAllPermissions(
        testUserId,
        ['scheduling.appointment.read', 'scheduling.appointment.create'],
        testOrgId,
      );

      // Assert
      expect(userRoleRepository.findActiveRolesByUser).not.toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * hasAnyPermission() - OR Logic Permission Check
   * ============================================================================ */

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasAnyPermission(
        testUserId,
        [
          'scheduling.appointment.read', // Has this
          'clinical.patient.delete', // Doesn't have this
          'billing.invoice.manage', // Doesn't have this
        ],
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasAnyPermission(
        testUserId,
        [
          'clinical.patient.delete',
          'billing.invoice.manage',
          'admin.user.manage',
        ],
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty permission array', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(permissions);

      // Act
      const result = await service.hasAnyPermission(testUserId, [], testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should use cached permissions for efficiency', async () => {
      // Arrange
      const cachedPermissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(cachedPermissions);

      // Act
      await service.hasAnyPermission(
        testUserId,
        ['scheduling.appointment.read', 'clinical.patient.delete'],
        testOrgId,
      );

      // Assert
      expect(userRoleRepository.findActiveRolesByUser).not.toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * getUserPermissions() - Permission Resolution with Caching
   * ============================================================================ */

  describe('getUserPermissions', () => {
    it('should return cached permissions if available', async () => {
      // Arrange
      const cachedPermissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('clinical', 'patient', 'read'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(cachedPermissions);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toBe(cachedPermissions);
      expect(userRoleRepository.findActiveRolesByUser).not.toHaveBeenCalled();
    });

    it('should resolve permissions from database on cache miss', async () => {
      // Arrange
      const permissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('clinical', 'patient', 'read'),
      ];
      vi.mocked(cacheManager.get).mockResolvedValue(null); // Cache miss

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
      });
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      const rolePermissions = permissions.map((perm) =>
        createTestRolePermission(testRoleId, perm.id, {
          organizationId: testOrgId,
          permission: perm,
        } as any),
      );
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue(
        rolePermissions,
      );

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('scheduling.appointment.read');
      expect(result[1].code).toBe('clinical.patient.read');
    });

    it('should cache resolved permissions with 5 minute TTL', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, { organizationId: testOrgId }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(testRoleId, permissions[0].id, {
          organizationId: testOrgId,
          permission: permissions[0],
        } as any),
      ]);

      // Act
      await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.stringContaining('user:permissions'),
        expect.any(Array),
        300, // 5 minutes in seconds
      );
    });

    it('should return empty array for users with no roles', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toEqual([]);
      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        [],
        300,
      );
    });

    it('should deduplicate permissions across multiple roles', async () => {
      // Arrange
      const role1Id = 'role-001' as UUID;
      const role2Id = 'role-002' as UUID;
      const sharedPermission = createTestPermission('scheduling', 'appointment', 'read');

      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, role1Id, { organizationId: testOrgId }),
        createTestUserRole(testUserId, role2Id, { organizationId: testOrgId }),
      ]);

      // Both roles have the same permission
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(role1Id, sharedPermission.id, {
          organizationId: testOrgId,
          permission: sharedPermission,
        } as any),
        createTestRolePermission(role2Id, sharedPermission.id, {
          organizationId: testOrgId,
          permission: sharedPermission,
        } as any),
      ]);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toHaveLength(1); // Deduplicated
      expect(result[0].id).toBe(sharedPermission.id);
    });

    it('should filter by organizationId and clinicId', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          clinicId: testClinicId,
        }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);

      // Act
      await service.getUserPermissions(testUserId, testOrgId, testClinicId);

      // Assert
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        testClinicId,
      );
    });

    it('should only include active permissions', async () => {
      // Arrange
      const activePermission = createTestPermission('scheduling', 'appointment', 'read', {
        isActive: true,
      });
      const inactivePermission = createTestPermission('clinical', 'patient', 'delete', {
        isActive: false,
      });

      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, { organizationId: testOrgId }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(testRoleId, activePermission.id, {
          organizationId: testOrgId,
          permission: activePermission,
        } as any),
        createTestRolePermission(testRoleId, inactivePermission.id, {
          organizationId: testOrgId,
          permission: inactivePermission,
        } as any),
      ]);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });

    it('should handle null permissions gracefully', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, testRoleId, { organizationId: testOrgId }),
      ]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestRolePermission(testRoleId, 'perm-001' as UUID, {
          organizationId: testOrgId,
          permission: null, // Null permission (shouldn't happen, but defensive)
        } as any),
      ]);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toEqual([]);
    });
  });

  /* ============================================================================
   * invalidateUserPermissionsCache() - Cache Invalidation
   * ============================================================================ */

  describe('invalidateUserPermissionsCache', () => {
    it('should delete cache key for user', async () => {
      // Arrange
      vi.mocked(cacheManager.del).mockResolvedValue(undefined);

      // Act
      await service.invalidateUserPermissionsCache(testUserId, testOrgId);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith(
        `user:permissions:${testOrgId}:${testUserId}`,
      );
    });

    it('should include clinicId in cache key if provided', async () => {
      // Arrange
      vi.mocked(cacheManager.del).mockResolvedValue(undefined);

      // Act
      await service.invalidateUserPermissionsCache(testUserId, testOrgId, testClinicId);

      // Assert
      expect(cacheManager.del).toHaveBeenCalledWith(
        `user:permissions:${testOrgId}:${testUserId}:${testClinicId}`,
      );
    });

    it('should handle cache deletion errors gracefully', async () => {
      // Arrange
      vi.mocked(cacheManager.del).mockRejectedValue(new Error('Cache error'));

      // Act & Assert - Should not throw
      await expect(
        service.invalidateUserPermissionsCache(testUserId, testOrgId),
      ).resolves.toBeUndefined();
    });
  });

  /* ============================================================================
   * Cache Key Building - Edge Cases
   * ============================================================================ */

  describe('Cache Key Building', () => {
    it('should use consistent cache key format without clinicId', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(
        `user:permissions:${testOrgId}:${testUserId}`,
      );
    });

    it('should use consistent cache key format with clinicId', async () => {
      // Arrange
      vi.mocked(cacheManager.get).mockResolvedValue(null);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      await service.getUserPermissions(testUserId, testOrgId, testClinicId);

      // Assert
      expect(cacheManager.get).toHaveBeenCalledWith(
        `user:permissions:${testOrgId}:${testUserId}:${testClinicId}`,
      );
    });
  });
});
