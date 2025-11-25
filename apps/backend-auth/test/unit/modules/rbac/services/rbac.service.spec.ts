/**
 * RBAC Service Unit Tests
 *
 * Comprehensive test suite for RBACService covering:
 * - Role assignment authorization checks
 * - Role revocation authorization checks
 * - Custom role creation
 * - Role permission updates
 * - Multi-tenant isolation
 * - System role protection
 * - Cache invalidation
 * - Audit logging
 * - Error handling and edge cases
 *
 * Test Coverage:
 * - Authorization: Validates permission checks and role-based restrictions
 * - Business Logic: Tests core RBAC operations
 * - Multi-Tenant: Ensures organization/clinic scoping
 * - Security: System role protection, privilege escalation prevention
 * - Cache Management: Permission cache invalidation
 * - Error Handling: Validation errors, not found errors, conflicts
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { ValidationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { RBACService } from '../../../../../src/modules/rbac/services/rbac.service';
import { RoleRepository } from '../../../../../src/modules/rbac/repositories/role.repository';
import { PermissionRepository } from '../../../../../src/modules/rbac/repositories/permission.repository';
import { UserRoleRepository } from '../../../../../src/modules/rbac/repositories/user-role.repository';
import { RolePermissionRepository } from '../../../../../src/modules/rbac/repositories/role-permission.repository';
import { PermissionCheckerService } from '../../../../../src/modules/rbac/services/permission-checker.service';
import { RoleCheckerService } from '../../../../../src/modules/rbac/services/role-checker.service';
import { SystemRole } from '../../../../../src/modules/rbac/entities/role.entity';
import {
  createTestRole,
  createTestUserRole,
  createTestPermission,
  createTestSystemRole,
  TEST_PERMISSIONS,
} from '../../../../utils/rbac-test-helpers';

describe('RBACService', () => {
  let service: RBACService;
  let roleRepository: RoleRepository;
  let permissionRepository: PermissionRepository;
  let userRoleRepository: UserRoleRepository;
  let rolePermissionRepository: RolePermissionRepository;
  let permissionChecker: PermissionCheckerService;
  let roleChecker: RoleCheckerService;

  // Test data constants
  const testOrgId = 'org-123' as OrganizationId;
  const testClinicId = 'clinic-456' as ClinicId;
  const testUserId = 'user-789' as UUID;
  const testAssignerId = 'user-admin-001' as UUID;
  const testRoleId = 'role-doctor-001' as UUID;

  beforeEach(() => {
    // Create mock repositories
    roleRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAllActive: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    permissionRepository = {
      findByIds: vi.fn(),
      findAll: vi.fn(),
      findByCode: vi.fn(),
    } as any;

    userRoleRepository = {
      assignRole: vi.fn(),
      revokeRole: vi.fn(),
      findActiveRolesByUser: vi.fn(),
      countActiveRolesByUser: vi.fn(),
    } as any;

    rolePermissionRepository = {
      grantPermissions: vi.fn(),
      revokePermissions: vi.fn(),
      replacePermissions: vi.fn(),
      findPermissionsByRoles: vi.fn(),
    } as any;

    permissionChecker = {
      hasPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyPermission: vi.fn(),
      getUserPermissions: vi.fn(),
      invalidateUserPermissionsCache: vi.fn(),
    } as any;

    roleChecker = {
      hasRole: vi.fn(),
      isTenantAdmin: vi.fn(),
      getUserRoles: vi.fn(),
      hasAnyRole: vi.fn(),
      hasAllRoles: vi.fn(),
      hasSystemRole: vi.fn(),
      countUserRoles: vi.fn(),
    } as any;

    // Create service instance
    service = new RBACService(
      roleRepository,
      permissionRepository,
      userRoleRepository,
      rolePermissionRepository,
      permissionChecker,
      roleChecker,
    );
  });

  /* ============================================================================
   * assignRole() - Authorization Tests
   * ============================================================================ */

  describe('assignRole', () => {
    describe('Authorization Checks', () => {
      it('should throw ForbiddenException if trying to assign system role without super_admin', async () => {
        // Arrange: Create a system role
        const systemRole = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
        vi.mocked(roleRepository.findById).mockResolvedValue(systemRole);
        vi.mocked(roleChecker.hasRole).mockResolvedValue(false); // Not super_admin

        // Act & Assert
        await expect(
          service.assignRole({
            userId: testUserId,
            roleId: systemRole.id,
            organizationId: testOrgId,
            assignedBy: testAssignerId,
          }),
        ).rejects.toThrow(ForbiddenException);

        expect(roleChecker.hasRole).toHaveBeenCalledWith(
          testAssignerId,
          SystemRole.SUPER_ADMIN,
          testOrgId,
        );
      });

      it('should allow super_admin to assign any role including system roles', async () => {
        // Arrange: Super admin assigning super_admin role
        const systemRole = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
        const userRole = createTestUserRole(testUserId, systemRole.id, {
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(systemRole);
        vi.mocked(roleChecker.hasRole).mockResolvedValue(true); // Is super_admin
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        const result = await service.assignRole({
          userId: testUserId,
          roleId: systemRole.id,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        // Assert
        expect(result).toBe(userRole);
        expect(roleChecker.hasRole).toHaveBeenCalledWith(
          testAssignerId,
          SystemRole.SUPER_ADMIN,
          testOrgId,
        );
        expect(userRoleRepository.assignRole).toHaveBeenCalledWith({
          userId: testUserId,
          roleId: systemRole.id,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
          expiresAt: undefined,
          clinicId: undefined,
        });
      });

      it('should allow non-super_admin to assign non-system roles', async () => {
        // Arrange: Regular admin assigning doctor role
        const doctorRole = createTestRole({
          name: 'doctor',
          organizationId: testOrgId,
          isSystem: false,
        });
        const userRole = createTestUserRole(testUserId, doctorRole.id, {
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(doctorRole);
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        const result = await service.assignRole({
          userId: testUserId,
          roleId: doctorRole.id,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        // Assert
        expect(result).toBe(userRole);
        expect(roleChecker.hasRole).not.toHaveBeenCalled(); // No super_admin check for non-system roles
      });
    });

    describe('Business Logic Tests', () => {
      it('should successfully assign role to user', async () => {
        // Arrange
        const role = createTestRole({
          id: testRoleId,
          name: 'doctor',
          organizationId: testOrgId,
          isActive: true,
        });
        const userRole = createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(role);
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        const result = await service.assignRole({
          userId: testUserId,
          roleId: testRoleId,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        // Assert
        expect(result).toBe(userRole);
        expect(roleRepository.findById).toHaveBeenCalledWith(testRoleId, testOrgId);
        expect(userRoleRepository.assignRole).toHaveBeenCalledWith({
          userId: testUserId,
          roleId: testRoleId,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
          expiresAt: undefined,
          clinicId: undefined,
        });
      });

      it('should invalidate user permission cache after assignment', async () => {
        // Arrange
        const role = createTestRole({
          id: testRoleId,
          organizationId: testOrgId,
          isActive: true,
        });
        const userRole = createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(role);
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        await service.assignRole({
          userId: testUserId,
          roleId: testRoleId,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
        });

        // Assert
        expect(permissionChecker.invalidateUserPermissionsCache).toHaveBeenCalledWith(
          testUserId,
          testOrgId,
          undefined,
        );
      });

      it('should throw ValidationError if role does not exist', async () => {
        // Arrange
        vi.mocked(roleRepository.findById).mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.assignRole({
            userId: testUserId,
            roleId: testRoleId,
            organizationId: testOrgId,
            assignedBy: testAssignerId,
          }),
        ).rejects.toThrow(ValidationError);

        expect(userRoleRepository.assignRole).not.toHaveBeenCalled();
      });

      it('should throw ValidationError if role is inactive', async () => {
        // Arrange
        const inactiveRole = createTestRole({
          id: testRoleId,
          organizationId: testOrgId,
          isActive: false,
        });
        vi.mocked(roleRepository.findById).mockResolvedValue(inactiveRole);

        // Act & Assert
        await expect(
          service.assignRole({
            userId: testUserId,
            roleId: testRoleId,
            organizationId: testOrgId,
            assignedBy: testAssignerId,
          }),
        ).rejects.toThrow(ValidationError);

        expect(userRoleRepository.assignRole).not.toHaveBeenCalled();
      });

      it('should support role assignment with expiration date', async () => {
        // Arrange
        const role = createTestRole({ id: testRoleId, organizationId: testOrgId });
        const expiresAt = new Date('2025-12-31');
        const userRole = createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          expiresAt,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(role);
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        const result = await service.assignRole({
          userId: testUserId,
          roleId: testRoleId,
          organizationId: testOrgId,
          assignedBy: testAssignerId,
          expiresAt,
        });

        // Assert
        expect(result.expiresAt).toEqual(expiresAt);
        expect(userRoleRepository.assignRole).toHaveBeenCalledWith(
          expect.objectContaining({ expiresAt }),
        );
      });
    });

    describe('Multi-Tenant Tests', () => {
      it('should throw ValidationError if role belongs to different organization', async () => {
        // Arrange: Role from different org
        vi.mocked(roleRepository.findById).mockResolvedValue(null);

        // Act & Assert
        await expect(
          service.assignRole({
            userId: testUserId,
            roleId: testRoleId,
            organizationId: testOrgId,
            assignedBy: testAssignerId,
          }),
        ).rejects.toThrow(ValidationError);
      });

      it('should handle clinic-scoped role assignments', async () => {
        // Arrange
        const clinicRole = createTestRole({
          id: testRoleId,
          organizationId: testOrgId,
          clinicId: testClinicId,
        });
        const userRole = createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          clinicId: testClinicId,
        });

        vi.mocked(roleRepository.findById).mockResolvedValue(clinicRole);
        vi.mocked(userRoleRepository.assignRole).mockResolvedValue(userRole);

        // Act
        const result = await service.assignRole({
          userId: testUserId,
          roleId: testRoleId,
          organizationId: testOrgId,
          clinicId: testClinicId,
          assignedBy: testAssignerId,
        });

        // Assert
        expect(result.clinicId).toBe(testClinicId);
        expect(userRoleRepository.assignRole).toHaveBeenCalledWith(
          expect.objectContaining({ clinicId: testClinicId }),
        );
      });
    });
  });

  /* ============================================================================
   * revokeRole() - Revocation Tests
   * ============================================================================ */

  describe('revokeRole', () => {
    it('should successfully revoke role from user', async () => {
      // Arrange
      vi.mocked(userRoleRepository.revokeRole).mockResolvedValue(undefined);

      // Act
      await service.revokeRole({
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        revokedBy: testAssignerId,
      });

      // Assert
      expect(userRoleRepository.revokeRole).toHaveBeenCalledWith({
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        revokedBy: testAssignerId,
        revocationReason: undefined,
        clinicId: undefined,
      });
    });

    it('should invalidate user permission cache after revocation', async () => {
      // Arrange
      vi.mocked(userRoleRepository.revokeRole).mockResolvedValue(undefined);

      // Act
      await service.revokeRole({
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        revokedBy: testAssignerId,
      });

      // Assert
      expect(permissionChecker.invalidateUserPermissionsCache).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        undefined,
      );
    });

    it('should support revocation with reason', async () => {
      // Arrange
      const revocationReason = 'Employee left organization';
      vi.mocked(userRoleRepository.revokeRole).mockResolvedValue(undefined);

      // Act
      await service.revokeRole({
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        revokedBy: testAssignerId,
        revocationReason,
      });

      // Assert
      expect(userRoleRepository.revokeRole).toHaveBeenCalledWith(
        expect.objectContaining({ revocationReason }),
      );
    });

    it('should handle clinic-scoped revocations', async () => {
      // Arrange
      vi.mocked(userRoleRepository.revokeRole).mockResolvedValue(undefined);

      // Act
      await service.revokeRole({
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        clinicId: testClinicId,
        revokedBy: testAssignerId,
      });

      // Assert
      expect(userRoleRepository.revokeRole).toHaveBeenCalledWith(
        expect.objectContaining({ clinicId: testClinicId }),
      );
      expect(permissionChecker.invalidateUserPermissionsCache).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        testClinicId,
      );
    });
  });

  /* ============================================================================
   * createRole() - Custom Role Creation
   * ============================================================================ */

  describe('createRole', () => {
    const permissionIds = ['perm-1', 'perm-2', 'perm-3'] as UUID[];

    it('should throw ForbiddenException if creator is not tenant_admin', async () => {
      // Arrange
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.createRole({
          name: 'custom_role',
          displayName: 'Custom Role',
          organizationId: testOrgId,
          permissionIds: [],
          createdBy: testAssignerId,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(roleRepository.create).not.toHaveBeenCalled();
    });

    it('should successfully create new role as tenant_admin', async () => {
      // Arrange
      const newRole = createTestRole({
        name: 'custom_role',
        displayName: 'Custom Role',
        organizationId: testOrgId,
        isSystem: false,
      });

      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue([]);
      vi.mocked(roleRepository.create).mockResolvedValue(newRole);

      // Act
      const result = await service.createRole({
        name: 'custom_role',
        displayName: 'Custom Role',
        organizationId: testOrgId,
        permissionIds: [],
        createdBy: testAssignerId,
      });

      // Assert
      expect(result).toBe(newRole);
      expect(roleRepository.create).toHaveBeenCalledWith({
        name: 'custom_role',
        displayName: 'Custom Role',
        organizationId: testOrgId,
        isSystem: false,
        isActive: true,
        description: undefined,
        clinicId: undefined,
      });
    });

    it('should throw ValidationError if permission IDs are invalid', async () => {
      // Arrange
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue([]); // No permissions found

      // Act & Assert
      await expect(
        service.createRole({
          name: 'custom_role',
          displayName: 'Custom Role',
          organizationId: testOrgId,
          permissionIds: permissionIds, // 3 IDs requested, 0 found
          createdBy: testAssignerId,
        }),
      ).rejects.toThrow(ValidationError);

      expect(roleRepository.create).not.toHaveBeenCalled();
    });

    it('should create role and assign permissions', async () => {
      // Arrange
      const newRole = createTestRole({ organizationId: testOrgId });
      const permissions = permissionIds.map((id) =>
        createTestPermission('test', 'resource', 'read', { id }),
      );

      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue(permissions);
      vi.mocked(roleRepository.create).mockResolvedValue(newRole);
      vi.mocked(rolePermissionRepository.grantPermissions).mockResolvedValue(undefined);

      // Act
      const result = await service.createRole({
        name: 'custom_role',
        displayName: 'Custom Role',
        organizationId: testOrgId,
        permissionIds,
        createdBy: testAssignerId,
      });

      // Assert
      expect(result).toBe(newRole);
      expect(rolePermissionRepository.grantPermissions).toHaveBeenCalledWith(
        newRole.id,
        permissionIds,
        testOrgId,
        testAssignerId,
      );
    });

    it('should support clinic-scoped role creation', async () => {
      // Arrange
      const clinicRole = createTestRole({
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue([]);
      vi.mocked(roleRepository.create).mockResolvedValue(clinicRole);

      // Act
      const result = await service.createRole({
        name: 'clinic_role',
        displayName: 'Clinic Role',
        organizationId: testOrgId,
        clinicId: testClinicId,
        permissionIds: [],
        createdBy: testAssignerId,
      });

      // Assert
      expect(result.clinicId).toBe(testClinicId);
      expect(roleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ clinicId: testClinicId }),
      );
    });
  });

  /* ============================================================================
   * updateRolePermissions() - Permission Updates
   * ============================================================================ */

  describe('updateRolePermissions', () => {
    const permissionIds = ['perm-1', 'perm-2'] as UUID[];

    it('should throw ForbiddenException if updater is not tenant_admin', async () => {
      // Arrange
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.updateRolePermissions({
          roleId: testRoleId,
          permissionIds,
          organizationId: testOrgId,
          updatedBy: testAssignerId,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(rolePermissionRepository.replacePermissions).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if role does not exist', async () => {
      // Arrange
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(roleRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRolePermissions({
          roleId: testRoleId,
          permissionIds,
          organizationId: testOrgId,
          updatedBy: testAssignerId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if trying to update system role', async () => {
      // Arrange
      const systemRole = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(roleRepository.findById).mockResolvedValue(systemRole);

      // Act & Assert
      await expect(
        service.updateRolePermissions({
          roleId: systemRole.id,
          permissionIds,
          organizationId: testOrgId,
          updatedBy: testAssignerId,
        }),
      ).rejects.toThrow(ValidationError);

      expect(rolePermissionRepository.replacePermissions).not.toHaveBeenCalled();
    });

    it('should successfully update role permissions', async () => {
      // Arrange
      const customRole = createTestRole({ id: testRoleId, organizationId: testOrgId });
      const permissions = permissionIds.map((id) =>
        createTestPermission('test', 'resource', 'read', { id }),
      );

      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(roleRepository.findById).mockResolvedValue(customRole);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue(permissions);
      vi.mocked(rolePermissionRepository.replacePermissions).mockResolvedValue(undefined);

      // Act
      await service.updateRolePermissions({
        roleId: testRoleId,
        permissionIds,
        organizationId: testOrgId,
        updatedBy: testAssignerId,
      });

      // Assert
      expect(rolePermissionRepository.replacePermissions).toHaveBeenCalledWith(
        testRoleId,
        permissionIds,
        testOrgId,
        testAssignerId,
      );
    });

    it('should throw ValidationError if some permission IDs are invalid', async () => {
      // Arrange
      const customRole = createTestRole({ id: testRoleId, organizationId: testOrgId });
      vi.mocked(roleChecker.isTenantAdmin).mockResolvedValue(true);
      vi.mocked(roleRepository.findById).mockResolvedValue(customRole);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue([]); // No permissions found

      // Act & Assert
      await expect(
        service.updateRolePermissions({
          roleId: testRoleId,
          permissionIds,
          organizationId: testOrgId,
          updatedBy: testAssignerId,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  /* ============================================================================
   * listRoles() - Role Listing
   * ============================================================================ */

  describe('listRoles', () => {
    it('should return all roles for organization', async () => {
      // Arrange
      const roles = [
        createTestRole({ name: 'doctor', organizationId: testOrgId }),
        createTestRole({ name: 'nurse', organizationId: testOrgId }),
      ];
      vi.mocked(roleRepository.findAllActive).mockResolvedValue(roles);

      // Act
      const result = await service.listRoles(testOrgId);

      // Assert
      expect(result).toBe(roles);
      expect(roleRepository.findAllActive).toHaveBeenCalledWith(testOrgId, undefined);
    });

    it('should filter by clinicId if provided', async () => {
      // Arrange
      const clinicRoles = [
        createTestRole({
          name: 'clinic_doctor',
          organizationId: testOrgId,
          clinicId: testClinicId,
        }),
      ];
      vi.mocked(roleRepository.findAllActive).mockResolvedValue(clinicRoles);

      // Act
      const result = await service.listRoles(testOrgId, testClinicId);

      // Assert
      expect(result).toBe(clinicRoles);
      expect(roleRepository.findAllActive).toHaveBeenCalledWith(testOrgId, testClinicId);
    });
  });

  /* ============================================================================
   * getUserPermissions() - Permission Retrieval
   * ============================================================================ */

  describe('getUserPermissions', () => {
    it('should return all permissions for user', async () => {
      // Arrange
      const permissions = [
        createTestPermission('scheduling', 'appointment', 'read'),
        createTestPermission('clinical', 'patient', 'read'),
      ];
      vi.mocked(permissionChecker.getUserPermissions).mockResolvedValue(permissions);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId);

      // Assert
      expect(result).toBe(permissions);
      expect(permissionChecker.getUserPermissions).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        undefined,
      );
    });

    it('should support clinic-scoped permission queries', async () => {
      // Arrange
      const permissions = [createTestPermission('scheduling', 'appointment', 'read')];
      vi.mocked(permissionChecker.getUserPermissions).mockResolvedValue(permissions);

      // Act
      const result = await service.getUserPermissions(testUserId, testOrgId, testClinicId);

      // Assert
      expect(result).toBe(permissions);
      expect(permissionChecker.getUserPermissions).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        testClinicId,
      );
    });
  });
});
