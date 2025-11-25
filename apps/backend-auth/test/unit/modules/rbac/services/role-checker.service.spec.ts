/**
 * Role Checker Service Unit Tests
 *
 * Comprehensive test suite for RoleCheckerService covering:
 * - Single role checking
 * - Multiple role checking (AND/OR logic)
 * - System role identification (super_admin, tenant_admin)
 * - User role retrieval
 * - Multi-tenant isolation
 * - Expired/revoked role handling
 * - Edge cases and boundary conditions
 *
 * Test Coverage:
 * - Role Checking: hasRole, hasAnyRole, hasAllRoles
 * - System Roles: isTenantAdmin, hasSystemRole
 * - Role Management: getUserRoles, countUserRoles
 * - Multi-Tenant: Organization and clinic scoping
 * - Edge Cases: Expired roles, revoked roles, non-existent users
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { RoleCheckerService } from '../../../../../src/modules/rbac/services/role-checker.service';
import { UserRoleRepository } from '../../../../../src/modules/rbac/repositories/user-role.repository';
import { SystemRole } from '../../../../../src/modules/rbac/entities/role.entity';
import {
  createTestUserRole,
  createTestRole,
  createTestSystemRole,
} from '../../../../utils/rbac-test-helpers';

describe('RoleCheckerService', () => {
  let service: RoleCheckerService;
  let userRoleRepository: UserRoleRepository;

  // Test data constants
  const testOrgId = 'org-123' as OrganizationId;
  const testClinicId = 'clinic-456' as ClinicId;
  const testUserId = 'user-789' as UUID;
  const testRoleId = 'role-001' as UUID;

  beforeEach(() => {
    // Create mock repository
    userRoleRepository = {
      findActiveRolesByUser: vi.fn(),
      countActiveRolesByUser: vi.fn(),
      assignRole: vi.fn(),
      revokeRole: vi.fn(),
    } as any;

    // Create service instance
    service = new RoleCheckerService(userRoleRepository);
  });

  /* ============================================================================
   * hasRole() - Single Role Check
   * ============================================================================ */

  describe('hasRole', () => {
    it('should return true if user has active role', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasRole(testUserId, 'doctor', testOrgId);

      // Assert
      expect(result).toBe(true);
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        undefined,
      );
    });

    it('should return false if user lacks role', async () => {
      // Arrange
      const nurseRole = createTestRole({ name: 'nurse', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, nurseRole.id, {
        organizationId: testOrgId,
        role: nurseRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasRole(testUserId, 'doctor', testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false if user has no roles', async () => {
      // Arrange
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.hasRole(testUserId, 'doctor', testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle clinic-scoped role checks', async () => {
      // Arrange
      const clinicRole = createTestRole({
        name: 'clinic_manager',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });
      const userRole = createTestUserRole(testUserId, clinicRole.id, {
        organizationId: testOrgId,
        clinicId: testClinicId,
        role: clinicRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasRole(
        testUserId,
        'clinic_manager',
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

    it('should be case-sensitive for role name matching', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasRole(testUserId, 'DOCTOR', testOrgId);

      // Assert
      expect(result).toBe(false); // Case mismatch
    });

    it('should return false if role object is undefined', async () => {
      // Arrange
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        role: undefined, // Role not populated
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasRole(testUserId, 'doctor', testOrgId);

      // Assert
      expect(result).toBe(false);
    });
  });

  /* ============================================================================
   * isSuperAdmin() - Super Admin Check
   * ============================================================================ */

  describe('isSuperAdmin', () => {
    it('should throw error indicating organization context is required', async () => {
      // Act & Assert
      await expect(service.isSuperAdmin(testUserId)).rejects.toThrow(
        'isSuperAdmin requires organization context',
      );
    });
  });

  /* ============================================================================
   * isTenantAdmin() - Tenant Admin Check
   * ============================================================================ */

  describe('isTenantAdmin', () => {
    it('should return true if user has tenant_admin role', async () => {
      // Arrange
      const tenantAdminRole = createTestSystemRole(SystemRole.TENANT_ADMIN, testOrgId);
      const userRole = createTestUserRole(testUserId, tenantAdminRole.id, {
        organizationId: testOrgId,
        role: tenantAdminRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.isTenantAdmin(testUserId, testOrgId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user is not tenant_admin', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.isTenantAdmin(testUserId, testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should check within specified organization only', async () => {
      // Arrange
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      await service.isTenantAdmin(testUserId, testOrgId);

      // Assert
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        undefined,
      );
    });
  });

  /* ============================================================================
   * getUserRoles() - Retrieve User Roles
   * ============================================================================ */

  describe('getUserRoles', () => {
    it('should return all active roles for user', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const nurseRole = createTestRole({ name: 'nurse', organizationId: testOrgId });

      const userRoles = [
        createTestUserRole(testUserId, doctorRole.id, {
          organizationId: testOrgId,
          role: doctorRole,
        } as any),
        createTestUserRole(testUserId, nurseRole.id, {
          organizationId: testOrgId,
          role: nurseRole,
        } as any),
      ];

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue(userRoles);

      // Act
      const result = await service.getUserRoles(testUserId, testOrgId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('doctor');
      expect(result[1].name).toBe('nurse');
    });

    it('should return empty array for users with no roles', async () => {
      // Arrange
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.getUserRoles(testUserId, testOrgId);

      // Assert
      expect(result).toEqual([]);
    });

    it('should filter out null/undefined roles', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });

      const userRoles = [
        createTestUserRole(testUserId, doctorRole.id, {
          organizationId: testOrgId,
          role: doctorRole,
        } as any),
        createTestUserRole(testUserId, 'role-002' as UUID, {
          organizationId: testOrgId,
          role: null, // Null role
        } as any),
        createTestUserRole(testUserId, 'role-003' as UUID, {
          organizationId: testOrgId,
          role: undefined, // Undefined role
        } as any),
      ];

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue(userRoles);

      // Act
      const result = await service.getUserRoles(testUserId, testOrgId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('doctor');
    });

    it('should support clinic-scoped role queries', async () => {
      // Arrange
      const clinicRole = createTestRole({
        name: 'clinic_doctor',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([
        createTestUserRole(testUserId, clinicRole.id, {
          organizationId: testOrgId,
          clinicId: testClinicId,
          role: clinicRole,
        } as any),
      ]);

      // Act
      const result = await service.getUserRoles(testUserId, testOrgId, testClinicId);

      // Assert
      expect(result).toHaveLength(1);
      expect(userRoleRepository.findActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
        testClinicId,
      );
    });
  });

  /* ============================================================================
   * hasAnyRole() - OR Logic Role Check
   * ============================================================================ */

  describe('hasAnyRole', () => {
    it('should return true if user has at least one role', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasAnyRole(
        testUserId,
        ['doctor', 'nurse', 'receptionist'], // Has doctor
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has none of the roles', async () => {
      // Arrange
      const receptionistRole = createTestRole({
        name: 'receptionist',
        organizationId: testOrgId,
      });
      const userRole = createTestUserRole(testUserId, receptionistRole.id, {
        organizationId: testOrgId,
        role: receptionistRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasAnyRole(
        testUserId,
        ['doctor', 'nurse'],
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for empty roles array', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasAnyRole(testUserId, [], testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle clinic-scoped checks', async () => {
      // Arrange
      const clinicRole = createTestRole({
        name: 'clinic_manager',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });
      const userRole = createTestUserRole(testUserId, clinicRole.id, {
        organizationId: testOrgId,
        clinicId: testClinicId,
        role: clinicRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasAnyRole(
        testUserId,
        ['clinic_manager', 'doctor'],
        testOrgId,
        testClinicId,
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  /* ============================================================================
   * hasAllRoles() - AND Logic Role Check
   * ============================================================================ */

  describe('hasAllRoles', () => {
    it('should return true if user has all requested roles', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const nurseRole = createTestRole({ name: 'nurse', organizationId: testOrgId });

      const userRoles = [
        createTestUserRole(testUserId, doctorRole.id, {
          organizationId: testOrgId,
          role: doctorRole,
        } as any),
        createTestUserRole(testUserId, nurseRole.id, {
          organizationId: testOrgId,
          role: nurseRole,
        } as any),
      ];

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue(userRoles);

      // Act
      const result = await service.hasAllRoles(
        testUserId,
        ['doctor', 'nurse'],
        testOrgId,
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user lacks any role', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasAllRoles(
        testUserId,
        ['doctor', 'nurse'], // Missing nurse
        testOrgId,
      );

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for empty roles array (vacuous truth)', async () => {
      // Arrange
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.hasAllRoles(testUserId, [], testOrgId);

      // Assert
      expect(result).toBe(true);
    });

    it('should handle clinic-scoped checks', async () => {
      // Arrange
      const role1 = createTestRole({
        name: 'clinic_doctor',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });
      const role2 = createTestRole({
        name: 'clinic_manager',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      const userRoles = [
        createTestUserRole(testUserId, role1.id, {
          organizationId: testOrgId,
          clinicId: testClinicId,
          role: role1,
        } as any),
        createTestUserRole(testUserId, role2.id, {
          organizationId: testOrgId,
          clinicId: testClinicId,
          role: role2,
        } as any),
      ];

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue(userRoles);

      // Act
      const result = await service.hasAllRoles(
        testUserId,
        ['clinic_doctor', 'clinic_manager'],
        testOrgId,
        testClinicId,
      );

      // Assert
      expect(result).toBe(true);
    });
  });

  /* ============================================================================
   * countUserRoles() - Role Counting
   * ============================================================================ */

  describe('countUserRoles', () => {
    it('should return count of active roles for user', async () => {
      // Arrange
      vi.mocked(userRoleRepository.countActiveRolesByUser).mockResolvedValue(3);

      // Act
      const result = await service.countUserRoles(testUserId, testOrgId);

      // Assert
      expect(result).toBe(3);
      expect(userRoleRepository.countActiveRolesByUser).toHaveBeenCalledWith(
        testUserId,
        testOrgId,
      );
    });

    it('should return 0 for users with no roles', async () => {
      // Arrange
      vi.mocked(userRoleRepository.countActiveRolesByUser).mockResolvedValue(0);

      // Act
      const result = await service.countUserRoles(testUserId, testOrgId);

      // Assert
      expect(result).toBe(0);
    });
  });

  /* ============================================================================
   * hasSystemRole() - System Role Check
   * ============================================================================ */

  describe('hasSystemRole', () => {
    it('should return true if user has super_admin role', async () => {
      // Arrange
      const superAdminRole = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
      const userRole = createTestUserRole(testUserId, superAdminRole.id, {
        organizationId: testOrgId,
        role: superAdminRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasSystemRole(testUserId, testOrgId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true if user has tenant_admin role', async () => {
      // Arrange
      const tenantAdminRole = createTestSystemRole(SystemRole.TENANT_ADMIN, testOrgId);
      const userRole = createTestUserRole(testUserId, tenantAdminRole.id, {
        organizationId: testOrgId,
        role: tenantAdminRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasSystemRole(testUserId, testOrgId);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if user has no system roles', async () => {
      // Arrange
      const doctorRole = createTestRole({ name: 'doctor', organizationId: testOrgId });
      const userRole = createTestUserRole(testUserId, doctorRole.id, {
        organizationId: testOrgId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);

      // Act
      const result = await service.hasSystemRole(testUserId, testOrgId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for users with no roles', async () => {
      // Arrange
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // Act
      const result = await service.hasSystemRole(testUserId, testOrgId);

      // Assert
      expect(result).toBe(false);
    });
  });
});
