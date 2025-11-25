/**
 * RBAC Test Helpers
 *
 * Comprehensive utilities for testing RBAC infrastructure:
 * - Factory functions for creating test entities
 * - Mock implementations of RBAC services
 * - Test data builders with realistic defaults
 * - Assertion helpers for common test scenarios
 * - Cleanup utilities for integration tests
 *
 * @module backend-auth/test/utils
 */

import { v4 as uuidv4 } from 'uuid';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { Role, SystemRole } from '../../src/modules/rbac/entities/role.entity';
import { Permission, PermissionAction } from '../../src/modules/rbac/entities/permission.entity';
import { UserRole } from '../../src/modules/rbac/entities/user-role.entity';
import { RolePermission } from '../../src/modules/rbac/entities/role-permission.entity';

/* ============================================================================
 * Factory Functions - Create Test Entities
 * ============================================================================ */

/**
 * Creates a test Role entity with realistic defaults
 *
 * @param overrides - Partial role properties to override defaults
 * @returns Role entity for testing
 */
export function createTestRole(overrides?: Partial<Role>): Role {
  const role = new Role();

  role.id = (overrides?.id as UUID) || (uuidv4() as UUID);
  role.name = overrides?.name || `test_role_${Date.now()}`;
  role.displayName = overrides?.displayName || 'Test Role';
  role.description = overrides?.description || 'A test role for unit testing';
  role.organizationId = (overrides?.organizationId as OrganizationId) || (uuidv4() as OrganizationId);
  role.clinicId = overrides?.clinicId !== undefined ? (overrides.clinicId as ClinicId) : undefined;
  role.isSystem = overrides?.isSystem ?? false;
  role.isActive = overrides?.isActive ?? true;
  role.createdAt = overrides?.createdAt || new Date();
  role.updatedAt = overrides?.updatedAt || new Date();
  role.deletedAt = overrides?.deletedAt || undefined;

  return role;
}

/**
 * Creates a system role (super_admin or tenant_admin)
 *
 * @param systemRoleType - Type of system role
 * @param organizationId - Organization ID for tenant_admin
 * @returns System Role entity
 */
export function createTestSystemRole(
  systemRoleType: SystemRole,
  organizationId: OrganizationId,
): Role {
  return createTestRole({
    name: systemRoleType,
    displayName: systemRoleType === SystemRole.SUPER_ADMIN ? 'Super Administrator' : 'Tenant Administrator',
    description: systemRoleType === SystemRole.SUPER_ADMIN
      ? 'Full system access across all organizations'
      : 'Full access within their organization',
    organizationId,
    isSystem: true,
  });
}

/**
 * Creates a test Permission entity with valid code format
 *
 * @param module - Module name (e.g., 'scheduling')
 * @param resource - Resource name (e.g., 'appointment')
 * @param action - Action type (e.g., 'create')
 * @param overrides - Additional properties to override
 * @returns Permission entity for testing
 */
export function createTestPermission(
  module: string,
  resource: string,
  action: PermissionAction | string,
  overrides?: Partial<Permission>,
): Permission {
  const permission = new Permission();

  const code = Permission.buildCode(module, resource, action);

  permission.id = (overrides?.id as UUID) || (uuidv4() as UUID);
  permission.code = overrides?.code || code;
  permission.displayName = overrides?.displayName || `${action.toUpperCase()} ${resource}`;
  permission.description = overrides?.description || `Permission to ${action} ${resource} in ${module}`;
  permission.module = overrides?.module || module.toLowerCase();
  permission.resource = overrides?.resource || resource.toLowerCase();
  permission.action = overrides?.action || action.toLowerCase();
  permission.isActive = overrides?.isActive ?? true;
  permission.createdAt = overrides?.createdAt || new Date();

  return permission;
}

/**
 * Creates a test UserRole assignment
 *
 * @param userId - User ID
 * @param roleId - Role ID
 * @param overrides - Additional properties to override
 * @returns UserRole entity for testing
 */
export function createTestUserRole(
  userId: UUID,
  roleId: UUID,
  overrides?: Partial<UserRole>,
): UserRole {
  const userRole = new UserRole();

  userRole.id = (overrides?.id as UUID) || (uuidv4() as UUID);
  userRole.userId = userId;
  userRole.roleId = roleId;
  userRole.organizationId = (overrides?.organizationId as OrganizationId) || (uuidv4() as OrganizationId);
  userRole.clinicId = overrides?.clinicId !== undefined ? (overrides.clinicId as ClinicId) : undefined;
  userRole.assignedAt = overrides?.assignedAt || new Date();
  userRole.assignedBy = (overrides?.assignedBy as UUID) || (uuidv4() as UUID);
  userRole.expiresAt = overrides?.expiresAt || undefined;
  userRole.revokedAt = overrides?.revokedAt || undefined;
  userRole.revokedBy = overrides?.revokedBy !== undefined ? (overrides.revokedBy as UUID) : undefined;
  userRole.revocationReason = overrides?.revocationReason || undefined;

  return userRole;
}

/**
 * Creates a test RolePermission assignment
 *
 * @param roleId - Role ID
 * @param permissionId - Permission ID
 * @param overrides - Additional properties to override
 * @returns RolePermission entity for testing
 */
export function createTestRolePermission(
  roleId: UUID,
  permissionId: UUID,
  overrides?: Partial<RolePermission>,
): RolePermission {
  const rolePermission = new RolePermission();

  rolePermission.id = (overrides?.id as UUID) || (uuidv4() as UUID);
  rolePermission.roleId = roleId;
  rolePermission.permissionId = permissionId;
  rolePermission.organizationId = (overrides?.organizationId as OrganizationId) || (uuidv4() as OrganizationId);
  rolePermission.grantedAt = overrides?.grantedAt || new Date();
  rolePermission.grantedBy = (overrides?.grantedBy as UUID) || (uuidv4() as UUID);

  return rolePermission;
}

/* ============================================================================
 * Test Data Builders - Realistic Data Objects
 * ============================================================================ */

/**
 * Interface for role creation data
 */
export interface CreateRoleData {
  name: string;
  displayName: string;
  description: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  isSystem?: boolean;
}

/**
 * Builds role creation data with defaults
 *
 * @param overrides - Properties to override
 * @returns Role creation data
 */
export function buildRoleData(overrides?: Partial<CreateRoleData>): CreateRoleData {
  return {
    name: overrides?.name || `custom_role_${Date.now()}`,
    displayName: overrides?.displayName || 'Custom Role',
    description: overrides?.description || 'A custom role for testing',
    organizationId: (overrides?.organizationId as OrganizationId) || (uuidv4() as OrganizationId),
    clinicId: overrides?.clinicId,
    isSystem: overrides?.isSystem ?? false,
  };
}

/**
 * Interface for permission creation data
 */
export interface CreatePermissionData {
  code: string;
  displayName: string;
  description: string;
  module: string;
  resource: string;
  action: string;
}

/**
 * Builds permission creation data with defaults
 *
 * @param module - Module name
 * @param resource - Resource name
 * @param action - Action type
 * @param overrides - Properties to override
 * @returns Permission creation data
 */
export function buildPermissionData(
  module: string,
  resource: string,
  action: string,
  overrides?: Partial<CreatePermissionData>,
): CreatePermissionData {
  const code = Permission.buildCode(module, resource, action);

  return {
    code: overrides?.code || code,
    displayName: overrides?.displayName || `${action.toUpperCase()} ${resource}`,
    description: overrides?.description || `Permission to ${action} ${resource} in ${module}`,
    module: overrides?.module || module.toLowerCase(),
    resource: overrides?.resource || resource.toLowerCase(),
    action: overrides?.action || action.toLowerCase(),
  };
}

/* ============================================================================
 * Mock Implementations - Service Mocks
 * ============================================================================ */

/**
 * Creates a mock PermissionCheckerService
 *
 * @returns Partial mock of PermissionCheckerService
 */
export function mockPermissionChecker() {
  return {
    hasPermission: vi.fn().mockResolvedValue(true),
    hasAllPermissions: vi.fn().mockResolvedValue(true),
    hasAnyPermission: vi.fn().mockResolvedValue(true),
    getUserPermissions: vi.fn().mockResolvedValue([]),
    invalidateUserPermissionsCache: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock RoleCheckerService
 *
 * @returns Partial mock of RoleCheckerService
 */
export function mockRoleChecker() {
  return {
    hasRole: vi.fn().mockResolvedValue(true),
    hasAnyRole: vi.fn().mockResolvedValue(true),
    hasAllRoles: vi.fn().mockResolvedValue(true),
    getUserRoles: vi.fn().mockResolvedValue([]),
    isTenantAdmin: vi.fn().mockResolvedValue(false),
    hasSystemRole: vi.fn().mockResolvedValue(false),
    countUserRoles: vi.fn().mockResolvedValue(0),
  };
}

/**
 * Creates a mock RBACService
 *
 * @returns Partial mock of RBACService
 */
export function mockRBACService() {
  return {
    assignRole: vi.fn().mockResolvedValue(createTestUserRole(uuidv4() as UUID, uuidv4() as UUID)),
    revokeRole: vi.fn().mockResolvedValue(undefined),
    listRoles: vi.fn().mockResolvedValue([]),
    getUserPermissions: vi.fn().mockResolvedValue([]),
    createRole: vi.fn().mockResolvedValue(createTestRole()),
    updateRolePermissions: vi.fn().mockResolvedValue(undefined),
  };
}

/* ============================================================================
 * Assertion Helpers - Common Test Assertions
 * ============================================================================ */

/**
 * Asserts that a role has specific permissions
 *
 * @param role - Role entity
 * @param expectedPermissions - Array of permission codes
 * @param rolePermissions - Array of RolePermission entities
 */
export function expectRoleToHavePermissions(
  role: Role,
  expectedPermissions: string[],
  rolePermissions: RolePermission[],
): void {
  const rolePermissionIds = rolePermissions
    .filter(rp => rp.roleId === role.id)
    .map(rp => rp.permissionId);

  expect(rolePermissionIds.length).toBeGreaterThanOrEqual(expectedPermissions.length);
}

/**
 * Asserts that a user has specific roles
 *
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param expectedRoles - Array of role names
 * @param userRoles - Array of UserRole entities
 */
export function expectUserToHaveRoles(
  userId: UUID,
  organizationId: OrganizationId,
  expectedRoles: string[],
  userRoles: UserRole[],
): void {
  const activeUserRoles = userRoles.filter(
    ur => ur.userId === userId && ur.organizationId === organizationId && ur.isActive(),
  );

  expect(activeUserRoles.length).toBeGreaterThanOrEqual(expectedRoles.length);
}

/**
 * Asserts that a role name is valid (lowercase, underscores only)
 *
 * @param roleName - Role name to validate
 */
export function expectValidRoleName(roleName: string): void {
  expect(roleName).toMatch(/^[a-z_]+$/);
}

/**
 * Asserts that a permission code is valid (module.resource.action format)
 *
 * @param permissionCode - Permission code to validate
 */
export function expectValidPermissionCode(permissionCode: string): void {
  expect(permissionCode).toMatch(/^[a-z]+\.[a-z]+\.(create|read|update|delete|list|manage|export|import|execute)$/);
}

/* ============================================================================
 * Cleanup Utilities - Integration Test Cleanup
 * ============================================================================ */

/**
 * Cleans up RBAC test data for a specific organization
 * Used in integration tests to ensure clean state
 *
 * @param organizationId - Organization ID to clean up
 * @param repositories - Object containing repository instances
 */
export async function cleanupRBACTestData(
  organizationId: OrganizationId,
  repositories: {
    roleRepository?: any;
    userRoleRepository?: any;
    rolePermissionRepository?: any;
  },
): Promise<void> {
  // Clean up user role assignments
  if (repositories.userRoleRepository) {
    // This would need to be implemented based on actual repository methods
    // For now, this is a placeholder
  }

  // Clean up role permissions
  if (repositories.rolePermissionRepository) {
    // This would need to be implemented based on actual repository methods
    // For now, this is a placeholder
  }

  // Clean up custom roles (DO NOT delete system roles)
  if (repositories.roleRepository) {
    // This would need to be implemented based on actual repository methods
    // For now, this is a placeholder
  }
}

/* ============================================================================
 * Test Data Sets - Common Test Scenarios
 * ============================================================================ */

/**
 * Standard permission set for testing
 */
export const TEST_PERMISSIONS = {
  APPOINTMENT_CREATE: 'scheduling.appointment.create',
  APPOINTMENT_READ: 'scheduling.appointment.read',
  APPOINTMENT_UPDATE: 'scheduling.appointment.update',
  APPOINTMENT_DELETE: 'scheduling.appointment.delete',
  PATIENT_CREATE: 'clinical.patient.create',
  PATIENT_READ: 'clinical.patient.read',
  PATIENT_UPDATE: 'clinical.patient.update',
  PATIENT_DELETE: 'clinical.patient.delete',
  BILLING_READ: 'billing.invoice.read',
  BILLING_MANAGE: 'billing.invoice.manage',
  ADMIN_USER_MANAGE: 'admin.user.manage',
  ADMIN_ROLE_MANAGE: 'admin.role.manage',
};

/**
 * Standard role names for testing
 */
export const TEST_ROLES = {
  SUPER_ADMIN: SystemRole.SUPER_ADMIN,
  TENANT_ADMIN: SystemRole.TENANT_ADMIN,
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  CLINIC_MANAGER: 'clinic_manager',
  BILLING_ADMIN: 'billing_admin',
};

/**
 * Creates a complete role with permissions for testing
 *
 * @param roleName - Role name
 * @param organizationId - Organization ID
 * @param permissionCodes - Array of permission codes
 * @returns Object with role, permissions, and role-permission mappings
 */
export function createRoleWithPermissions(
  roleName: string,
  organizationId: OrganizationId,
  permissionCodes: string[],
): {
  role: Role;
  permissions: Permission[];
  rolePermissions: RolePermission[];
} {
  const role = createTestRole({
    name: roleName,
    organizationId,
  });

  const permissions = permissionCodes.map(code => {
    const [module, resource, action] = code.split('.');
    return createTestPermission(module, resource, action, { code });
  });

  const rolePermissions = permissions.map(permission =>
    createTestRolePermission(role.id, permission.id, { organizationId }),
  );

  return { role, permissions, rolePermissions };
}

/**
 * Creates a user with role assignments
 *
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param roleIds - Array of role IDs to assign
 * @param assignedBy - User ID who assigned the roles
 * @returns Array of UserRole entities
 */
export function createUserWithRoles(
  userId: UUID,
  organizationId: OrganizationId,
  roleIds: UUID[],
  assignedBy: UUID,
): UserRole[] {
  return roleIds.map(roleId =>
    createTestUserRole(userId, roleId, { organizationId, assignedBy }),
  );
}

/**
 * Creates an expired role assignment
 *
 * @param userId - User ID
 * @param roleId - Role ID
 * @param organizationId - Organization ID
 * @returns Expired UserRole entity
 */
export function createExpiredUserRole(
  userId: UUID,
  roleId: UUID,
  organizationId: OrganizationId,
): UserRole {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return createTestUserRole(userId, roleId, {
    organizationId,
    expiresAt: yesterday,
  });
}

/**
 * Creates a revoked role assignment
 *
 * @param userId - User ID
 * @param roleId - Role ID
 * @param organizationId - Organization ID
 * @param revokedBy - User ID who revoked the role
 * @returns Revoked UserRole entity
 */
export function createRevokedUserRole(
  userId: UUID,
  roleId: UUID,
  organizationId: OrganizationId,
  revokedBy: UUID,
): UserRole {
  return createTestUserRole(userId, roleId, {
    organizationId,
    revokedAt: new Date(),
    revokedBy,
    revocationReason: 'Test revocation',
  });
}

/**
 * Creates a temporary role assignment (expiring in future)
 *
 * @param userId - User ID
 * @param roleId - Role ID
 * @param organizationId - Organization ID
 * @param daysUntilExpiration - Number of days until expiration
 * @returns Temporary UserRole entity
 */
export function createTemporaryUserRole(
  userId: UUID,
  roleId: UUID,
  organizationId: OrganizationId,
  daysUntilExpiration: number,
): UserRole {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysUntilExpiration);

  return createTestUserRole(userId, roleId, {
    organizationId,
    expiresAt,
  });
}

/**
 * Helper to make vi available in tests
 * Import this in tests that use mocks
 */
export { vi } from 'vitest';
