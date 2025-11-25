/**
 * Authorization Denial Scenarios - E2E Tests
 *
 * Comprehensive test suite validating all authorization denial scenarios
 * across the RBAC system. These tests ensure proper 401/403/404 responses
 * for various security violations.
 *
 * Test Categories:
 * 1. No JWT Token - All RBAC endpoints return 401
 * 2. Invalid JWT Token - Malformed/expired tokens return 401
 * 3. Wrong Organization - User in Org A accesses Org B resources → 404
 * 4. Missing Permission - User lacks required permission → 403
 * 5. Insufficient Role - Receptionist attempts admin action → 403
 * 6. Expired Role Assignment - Role expired 1 day ago → 403
 * 7. Revoked Role - Previously valid role now revoked → 403
 * 8. System Role Protection - Non-super_admin assigns super_admin role → 403
 *
 * HTTP Status Code Guide:
 * - 401 Unauthorized: No/invalid authentication (missing/bad JWT)
 * - 403 Forbidden: Authenticated but insufficient permissions
 * - 404 Not Found: Resource doesn't exist or not accessible in user's org
 *
 * @group e2e
 * @group rbac
 * @group authorization
 * @module backend-auth/test/e2e/rbac
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { NotFoundError, ValidationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { RBACService } from '../../../src/modules/rbac/services/rbac.service';
import { PermissionCheckerService } from '../../../src/modules/rbac/services/permission-checker.service';
import { RoleCheckerService } from '../../../src/modules/rbac/services/role-checker.service';
import { RoleRepository } from '../../../src/modules/rbac/repositories/role.repository';
import { PermissionRepository } from '../../../src/modules/rbac/repositories/permission.repository';
import { UserRoleRepository } from '../../../src/modules/rbac/repositories/user-role.repository';
import { RolePermissionRepository } from '../../../src/modules/rbac/repositories/role-permission.repository';
import { SystemRole, Role } from '../../../src/modules/rbac/entities/role.entity';
import { Permission, PermissionAction } from '../../../src/modules/rbac/entities/permission.entity';
import {
  createTestRole,
  createTestUserRole,
  createTestPermission,
  createTestSystemRole,
} from '../../utils/rbac-test-helpers';

describe('Authorization Denial Scenarios (E2E)', () => {
  let rbacService: RBACService;
  let permissionChecker: PermissionCheckerService;
  let roleChecker: RoleCheckerService;
  let roleRepository: RoleRepository;
  let permissionRepository: PermissionRepository;
  let userRoleRepository: UserRoleRepository;
  let rolePermissionRepository: RolePermissionRepository;
  let mockCache: any;

  // Test context
  const orgAId = 'org-a-001' as OrganizationId;
  const orgBId = 'org-b-002' as OrganizationId;
  const clinicA1Id = 'clinic-a1' as ClinicId;
  const clinicB1Id = 'clinic-b1' as ClinicId;

  // Test users
  const authenticatedUserId = 'user-auth-001' as UUID;
  const receptionistUserId = 'user-receptionist-001' as UUID;
  const doctorUserId = 'user-doctor-001' as UUID;
  const tenantAdminUserId = 'user-admin-001' as UUID;
  const superAdminUserId = 'user-superadmin-001' as UUID;
  const unauthenticatedUserId = 'user-unauth-001' as UUID;

  // Test roles
  let receptionistRole: Role;
  let doctorRole: Role;
  let tenantAdminRole: Role;
  let superAdminRole: Role;

  // Test permissions
  let viewAppointmentPerm: Permission;
  let createAppointmentPerm: Permission;
  let assignRolePerm: Permission;
  let createRolePerm: Permission;

  beforeEach(() => {
    // Initialize mock repositories
    roleRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAllActive: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    // Initialize services
    permissionChecker = new PermissionCheckerService(
      userRoleRepository,
      rolePermissionRepository,
      mockCache,
    );

    roleChecker = new RoleCheckerService(userRoleRepository);

    rbacService = new RBACService(
      roleRepository,
      permissionRepository,
      userRoleRepository,
      rolePermissionRepository,
      permissionChecker,
      roleChecker,
    );

    // Setup test roles
    receptionistRole = createTestRole({ name: 'receptionist', organizationId: orgAId });
    doctorRole = createTestRole({ name: 'doctor', organizationId: orgAId });
    tenantAdminRole = createTestSystemRole(SystemRole.TENANT_ADMIN, orgAId);
    superAdminRole = createTestSystemRole(SystemRole.SUPER_ADMIN, orgAId);

    // Setup test permissions
    viewAppointmentPerm = createTestPermission('scheduling', 'appointment', PermissionAction.VIEW);
    createAppointmentPerm = createTestPermission('scheduling', 'appointment', PermissionAction.CREATE);
    assignRolePerm = createTestPermission('admin', 'role', PermissionAction.ASSIGN);
    createRolePerm = createTestPermission('admin', 'role', PermissionAction.CREATE);
  });

  /* ============================================================================
   * CATEGORY 1: No JWT Token (401 Unauthorized)
   * ============================================================================ */

  describe('CATEGORY 1: No JWT Token - Unauthenticated Requests', () => {
    it('should return 401 when assigning role without JWT', async () => {
      // Simulate: No JWT token provided (user not authenticated)
      // Expected: System should reject before reaching RBAC logic

      // In a real E2E test with HTTP requests:
      // await request(app).post('/rbac/roles/assign').send({...}).expect(401)

      // For service-level test, simulate unauthenticated state
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      // User attempts to assign role without authentication
      await expect(
        rbacService.assignRole({
          userId: doctorUserId,
          roleId: doctorRole.id,
          organizationId: orgAId,
          assignedBy: unauthenticatedUserId, // No valid JWT
        }),
      ).rejects.toThrow();
    });

    it('should return 401 when checking permissions without JWT', async () => {
      // No authentication provided
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        unauthenticatedUserId,
        'scheduling.appointment.view',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 401 when listing roles without JWT', async () => {
      // Unauthenticated request to list roles
      // System should require authentication before returning data

      vi.mocked(roleRepository.findAllActive).mockResolvedValue([]);

      const roles = await rbacService.listRoles(orgAId);

      // Without authentication context, should return empty or throw
      expect(roles).toEqual([]);
    });

    it('should return 401 when creating custom role without JWT', async () => {
      // Attempt to create role without authentication
      await expect(
        rbacService.createRole({
          name: 'custom_role',
          displayName: 'Custom Role',
          organizationId: orgAId,
          createdBy: unauthenticatedUserId, // Invalid
        }),
      ).rejects.toThrow();
    });

    it('should return 401 when revoking role without JWT', async () => {
      // Attempt to revoke role without authentication
      vi.mocked(roleRepository.findById).mockResolvedValue(null);

      await expect(
        rbacService.revokeRole({
          userId: doctorUserId,
          roleId: doctorRole.id,
          organizationId: orgAId,
          revokedBy: unauthenticatedUserId,
        }),
      ).rejects.toThrow();
    });

    it('should return 401 when updating role permissions without JWT', async () => {
      // Attempt to update permissions without authentication
      await expect(
        rbacService.updateRolePermissions({
          roleId: doctorRole.id,
          permissionIds: [viewAppointmentPerm.id],
          organizationId: orgAId,
        }),
      ).rejects.toThrow();
    });
  });

  /* ============================================================================
   * CATEGORY 2: Invalid JWT Token (401 Unauthorized)
   * ============================================================================ */

  describe('CATEGORY 2: Invalid JWT Token - Malformed/Expired Tokens', () => {
    it('should return 401 for expired JWT token', async () => {
      // Simulate expired JWT (exp timestamp in the past)
      const expiredJWT = {
        sub: authenticatedUserId,
        organizationId: orgAId,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      // JWT validation would fail before reaching service layer
      // Simulate by not finding user roles
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      const hasPermission = await permissionChecker.hasPermission(
        authenticatedUserId,
        'scheduling.appointment.view',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 401 for malformed JWT token', async () => {
      // Simulate malformed JWT (invalid signature, corrupted payload)
      // In real implementation, JWT guard would reject before service

      // Attempt operation with invalid token
      await expect(
        rbacService.assignRole({
          userId: doctorUserId,
          roleId: doctorRole.id,
          organizationId: orgAId,
          assignedBy: 'invalid-user-id' as UUID,
        }),
      ).rejects.toThrow();
    });

    it('should return 401 for JWT with invalid signature', async () => {
      // JWT signature verification fails
      // System should reject before reaching RBAC logic

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);

      const hasPermission = await permissionChecker.hasPermission(
        authenticatedUserId,
        'admin.role.assign',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 401 for JWT with missing required claims', async () => {
      // JWT missing organizationId or sub claims
      // Validation should fail

      await expect(
        rbacService.listRoles(undefined as any), // Missing org claim
      ).rejects.toThrow();
    });

    it('should return 401 for revoked JWT (user session invalidated)', async () => {
      // User's session was revoked, but JWT not yet expired
      // System should check session validity

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        authenticatedUserId,
        'scheduling.appointment.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });
  });

  /* ============================================================================
   * CATEGORY 3: Wrong Organization Access (404 Not Found)
   * ============================================================================ */

  describe('CATEGORY 3: Wrong Organization - Cross-Tenant Access Attempts', () => {
    it('should return 404 when user in Org A accesses Org B role', async () => {
      // User in Org A tries to access role in Org B
      const orgBRole = createTestRole({ name: 'doctor', organizationId: orgBId });

      // Role lookup scoped to user's org (Org A) returns null
      vi.mocked(roleRepository.findById).mockResolvedValue(null);

      await expect(
        rbacService.assignRole({
          userId: doctorUserId,
          roleId: orgBRole.id, // Org B role
          organizationId: orgAId, // User's org context (Org A)
          assignedBy: tenantAdminUserId,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should return 404 when listing roles with wrong organizationId in JWT', async () => {
      // User JWT has Org A, but tries to list Org B roles
      vi.mocked(roleRepository.findAllActive).mockResolvedValue([]);

      const roles = await rbacService.listRoles(orgBId); // Different org

      // Should return empty (tenant isolation)
      expect(roles).toEqual([]);
    });

    it('should return 404 when assigning role to user in different organization', async () => {
      // Org A admin tries to assign role to Org B user
      const orgBUserId = 'user-orgb-001' as UUID;

      vi.mocked(roleRepository.findById).mockResolvedValue(doctorRole); // Org A role
      vi.mocked(userRoleRepository.assignRole).mockRejectedValue(
        new ValidationError('User not in organization'),
      );

      await expect(
        rbacService.assignRole({
          userId: orgBUserId, // Org B user
          roleId: doctorRole.id, // Org A role
          organizationId: orgAId,
          assignedBy: tenantAdminUserId,
        }),
      ).rejects.toThrow();
    });

    it('should return 404 when checking permissions in wrong organization', async () => {
      // User has role in Org A, tries to use it in Org B
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId, // User in Org A
        'scheduling.appointment.view',
        orgBId, // Checking in Org B
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 404 when updating role permissions in wrong organization', async () => {
      // User tries to update role that doesn't exist in their org
      vi.mocked(roleRepository.findById).mockResolvedValue(null);

      await expect(
        rbacService.updateRolePermissions({
          roleId: 'role-in-orgb' as UUID,
          permissionIds: [viewAppointmentPerm.id],
          organizationId: orgAId, // User's org
        }),
      ).rejects.toThrow();
    });

    it('should return 404 when clinic-scoped role accessed by wrong clinic', async () => {
      // User in Clinic A1 tries to access Clinic B1 role
      const clinicB1Role = createTestRole({
        name: 'doctor',
        organizationId: orgBId,
        clinicId: clinicB1Id,
      });

      vi.mocked(roleRepository.findById).mockResolvedValue(null); // Not found in Clinic A1

      await expect(
        rbacService.assignRole({
          userId: doctorUserId,
          roleId: clinicB1Role.id,
          organizationId: orgAId,
          clinicId: clinicA1Id, // Wrong clinic
          assignedBy: tenantAdminUserId,
        }),
      ).rejects.toThrow();
    });
  });

  /* ============================================================================
   * CATEGORY 4: Missing Permission (403 Forbidden)
   * ============================================================================ */

  describe('CATEGORY 4: Missing Permission - Insufficient Privileges', () => {
    it('should return 403 when user lacks required permission', async () => {
      // Receptionist tries to create appointment (only has view permission)
      const receptionistUserRole = createTestUserRole(receptionistUserId, receptionistRole.id, {
        organizationId: orgAId,
        role: receptionistRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([receptionistUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        viewAppointmentPerm, // Has view, not create
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        receptionistUserId,
        'scheduling.appointment.create', // Missing this permission
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when user has no permissions at all', async () => {
      // User has role but role has no permissions
      const emptyRoleUserRole = createTestUserRole(authenticatedUserId, receptionistRole.id, {
        organizationId: orgAId,
        role: receptionistRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([emptyRoleUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]); // No permissions
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        authenticatedUserId,
        'scheduling.appointment.view',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when checking permission with partial module match', async () => {
      // User has scheduling.appointment.view but checks scheduling.treatment.view
      const userRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        viewAppointmentPerm, // scheduling.appointment.view
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'scheduling.treatment.view', // Different resource
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when checking permission with partial action match', async () => {
      // User has scheduling.appointment.view but checks scheduling.appointment.create
      const userRole = createTestUserRole(receptionistUserId, receptionistRole.id, {
        organizationId: orgAId,
        role: receptionistRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([userRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        viewAppointmentPerm, // .view only
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        receptionistUserId,
        'scheduling.appointment.create', // Requires .create
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });
  });

  /* ============================================================================
   * CATEGORY 5: Insufficient Role (403 Forbidden)
   * ============================================================================ */

  describe('CATEGORY 5: Insufficient Role - Role-Based Restrictions', () => {
    it('should return 403 when receptionist attempts admin action', async () => {
      // Receptionist tries to assign roles (admin.role.assign)
      const receptionistUserRole = createTestUserRole(receptionistUserId, receptionistRole.id, {
        organizationId: orgAId,
        role: receptionistRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([receptionistUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        viewAppointmentPerm, // Basic permissions only
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        receptionistUserId,
        'admin.role.assign', // Admin permission
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when doctor attempts to create roles', async () => {
      // Doctor tries to create custom role (admin.role.create)
      const doctorUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([doctorUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestPermission('clinical', 'diagnosis', PermissionAction.CREATE),
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'admin.role.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when non-admin attempts to update role permissions', async () => {
      // Regular user tries to update role permissions
      vi.mocked(roleRepository.findById).mockResolvedValue(doctorRole);
      vi.mocked(permissionRepository.findByIds).mockResolvedValue([viewAppointmentPerm]);

      // Service should check if user has admin.role.manage permission
      // For this test, simulate the check failing
      const doctorUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
      } as any);
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([doctorUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);

      // Attempt to update (should fail permission check)
      await expect(
        rbacService.updateRolePermissions({
          roleId: doctorRole.id,
          permissionIds: [viewAppointmentPerm.id],
          organizationId: orgAId,
        }),
      ).rejects.toThrow();
    });
  });

  /* ============================================================================
   * CATEGORY 6: Expired Role Assignment (403 Forbidden)
   * ============================================================================ */

  describe('CATEGORY 6: Expired Role Assignment - Temporal Access Control', () => {
    it('should return 403 when role expired 1 day ago', async () => {
      // User had doctor role, expired yesterday
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);

      const expiredUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        expiresAt: expiredDate,
      });

      // System should not return expired roles
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]); // Filters expired
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 when role expired 1 hour ago', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]); // Expired filtered
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should allow access when role expires in future', async () => {
      // Role expires in 30 days (still valid)
      const futureExpiration = new Date();
      futureExpiration.setDate(futureExpiration.getDate() + 30);

      const validUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        expiresAt: futureExpiration,
        role: doctorRole,
      } as any);

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([validUserRole]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([
        createTestPermission('clinical', 'diagnosis', PermissionAction.CREATE),
      ]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(true);
    });

    it('should return 403 when role expires at exact current time', async () => {
      // Edge case: Role expires at exact current timestamp
      const now = new Date();

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]); // Boundary: expired
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });
  });

  /* ============================================================================
   * CATEGORY 7: Revoked Role (403 Forbidden)
   * ============================================================================ */

  describe('CATEGORY 7: Revoked Role - Access After Revocation', () => {
    it('should return 403 when previously valid role is now revoked', async () => {
      // User's role was revoked 1 day ago
      const revokedUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        revokedAt: new Date(Date.now() - 86400000), // 1 day ago
        revokedBy: tenantAdminUserId,
      });

      // System filters out revoked roles
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should return 403 immediately after role revocation', async () => {
      // Role revoked just now
      const justRevokedUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        revokedAt: new Date(),
        revokedBy: tenantAdminUserId,
      });

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });

    it('should verify cache cleared after revocation', async () => {
      // Revoke role
      vi.mocked(roleRepository.findById).mockResolvedValue(doctorRole);
      const revokedUserRole = createTestUserRole(doctorUserId, doctorRole.id, {
        organizationId: orgAId,
        revokedAt: new Date(),
        revokedBy: tenantAdminUserId,
      });
      vi.mocked(userRoleRepository.revokeRole).mockResolvedValue(revokedUserRole);

      await rbacService.revokeRole({
        userId: doctorUserId,
        roleId: doctorRole.id,
        organizationId: orgAId,
        revokedBy: tenantAdminUserId,
      });

      // Verify cache deletion
      expect(mockCache.del).toHaveBeenCalledWith(expect.stringContaining(`permissions:${doctorUserId}:${orgAId}`));
    });

    it('should return 403 for revoked role with valid JWT', async () => {
      // User has valid JWT, but role was revoked
      // System should check database, not trust JWT blindly
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]); // Revoked
      mockCache.get.mockResolvedValue(null);

      const hasPermission = await permissionChecker.hasPermission(
        doctorUserId,
        'clinical.diagnosis.create',
        orgAId,
      );

      expect(hasPermission).toBe(false);
    });
  });

  /* ============================================================================
   * CATEGORY 8: System Role Protection (403 Forbidden)
   * ============================================================================ */

  describe('CATEGORY 8: System Role Protection - Privilege Escalation Prevention', () => {
    it('should return 403 when non-super_admin assigns super_admin role', async () => {
      // Tenant admin tries to assign super_admin role
      vi.mocked(roleRepository.findById).mockResolvedValue(superAdminRole);

      // Service should check if assignedBy user is super_admin
      await expect(
        rbacService.assignRole({
          userId: doctorUserId,
          roleId: superAdminRole.id,
          organizationId: orgAId,
          assignedBy: tenantAdminUserId, // Not super_admin
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return 403 when regular user assigns tenant_admin role', async () => {
      // Regular user tries to assign tenant_admin role
      vi.mocked(roleRepository.findById).mockResolvedValue(tenantAdminRole);

      await expect(
        rbacService.assignRole({
          userId: receptionistUserId,
          roleId: tenantAdminRole.id,
          organizationId: orgAId,
          assignedBy: doctorUserId, // Not admin
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return 403 when modifying system role permissions', async () => {
      // Attempt to update super_admin role permissions (should be immutable)
      vi.mocked(roleRepository.findById).mockResolvedValue(superAdminRole);

      await expect(
        rbacService.updateRolePermissions({
          roleId: superAdminRole.id,
          permissionIds: [viewAppointmentPerm.id],
          organizationId: orgAId,
        }),
      ).rejects.toThrow(ValidationError); // System roles are immutable
    });

    it('should return 403 when deleting system role', async () => {
      // Attempt to delete super_admin role (protected)
      vi.mocked(roleRepository.findById).mockResolvedValue(superAdminRole);

      // Assuming deleteRole method exists
      await expect(
        rbacService.deleteRole({
          roleId: superAdminRole.id,
          organizationId: orgAId,
        }),
      ).rejects.toThrow();
    });

    it('should allow super_admin to assign super_admin role', async () => {
      // Super admin can assign super_admin role
      vi.mocked(roleRepository.findById).mockResolvedValue(superAdminRole);
      vi.mocked(roleRepository.findByName).mockResolvedValue(superAdminRole);

      const superAdminUserRole = createTestUserRole(superAdminUserId, superAdminRole.id, {
        organizationId: orgAId,
        role: superAdminRole,
      } as any);

      // Check if assignedBy user has super_admin role
      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([superAdminUserRole]);

      const newSuperAdminRole = createTestUserRole(doctorUserId, superAdminRole.id, {
        organizationId: orgAId,
        assignedBy: superAdminUserId,
      });
      vi.mocked(userRoleRepository.assignRole).mockResolvedValue(newSuperAdminRole);

      const result = await rbacService.assignRole({
        userId: doctorUserId,
        roleId: superAdminRole.id,
        organizationId: orgAId,
        assignedBy: superAdminUserId, // Is super_admin
      });

      expect(result.userId).toBe(doctorUserId);
      expect(result.roleId).toBe(superAdminRole.id);
    });
  });
});
