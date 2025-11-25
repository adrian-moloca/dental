/**
 * Test User Builder
 * Creates CurrentUser instances for testing authentication and authorization
 *
 * @module shared-testing/context
 */

import type { CurrentUser } from '@dentalos/shared-auth';
import { createCurrentUser } from '@dentalos/shared-auth';
import type { UUID, Email, UserRole, Permission, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { UserRole as Roles, PermissionAction, ResourceType } from '@dentalos/shared-types';
import { generateFakeUUID } from '../generators/id-generator';
import { generateFakeEmail } from '../generators/fake-data-generator';
import { createTestTenantContext } from './test-tenant-context.builder';

/**
 * Default test user ID
 */
export const TEST_USER_ID = 'user-test-001' as UUID;

/**
 * Default test user email
 */
export const TEST_USER_EMAIL = 'test@example.com' as Email;

/**
 * Permission builder helper
 */
function buildPermission(action: PermissionAction, resource: ResourceType): Permission {
  return {
    action,
    resource,
  };
}

/**
 * Get default permissions for dentist role
 */
function getDentistPermissions(): Permission[] {
  return [
    buildPermission(PermissionAction.READ, ResourceType.PATIENT),
    buildPermission(PermissionAction.CREATE, ResourceType.PATIENT),
    buildPermission(PermissionAction.UPDATE, ResourceType.PATIENT),
    buildPermission(PermissionAction.READ, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.CREATE, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.UPDATE, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.DELETE, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.READ, ResourceType.TREATMENT),
    buildPermission(PermissionAction.CREATE, ResourceType.TREATMENT),
    buildPermission(PermissionAction.UPDATE, ResourceType.TREATMENT),
  ];
}

/**
 * Get default permissions for receptionist role
 */
function getReceptionistPermissions(): Permission[] {
  return [
    buildPermission(PermissionAction.READ, ResourceType.PATIENT),
    buildPermission(PermissionAction.CREATE, ResourceType.PATIENT),
    buildPermission(PermissionAction.UPDATE, ResourceType.PATIENT),
    buildPermission(PermissionAction.READ, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.CREATE, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.UPDATE, ResourceType.APPOINTMENT),
    buildPermission(PermissionAction.DELETE, ResourceType.APPOINTMENT),
  ];
}

/**
 * Get all permissions for super admin
 */
function getSuperAdminPermissions(): Permission[] {
  const actions = Object.values(PermissionAction);
  const resources = Object.values(ResourceType);

  return actions.flatMap(action =>
    resources.map(resource => buildPermission(action, resource))
  );
}

/**
 * Creates a test user with specified overrides
 *
 * @param overrides - Partial user data to override defaults
 * @returns CurrentUser for testing
 *
 * @example
 * ```typescript
 * const user = createTestUser();
 * // Default dentist user
 *
 * const customUser = createTestUser({
 *   userId: 'custom-id',
 *   email: 'custom@example.com',
 *   roles: [UserRole.RECEPTIONIST]
 * });
 * ```
 */
export function createTestUser(overrides?: {
  userId?: UUID;
  email?: Email;
  roles?: UserRole[];
  permissions?: Permission[];
  organizationId?: OrganizationId;
  clinicId?: ClinicId;
}): CurrentUser {
  const userId = overrides?.userId ?? TEST_USER_ID;
  const email = overrides?.email ?? TEST_USER_EMAIL;
  const roles = overrides?.roles ?? [Roles.DENTIST];

  // Compute default permissions based on roles if not provided
  let permissions = overrides?.permissions;
  if (!permissions) {
    if (roles.includes(Roles.SUPER_ADMIN)) {
      permissions = getSuperAdminPermissions();
    } else if (roles.includes(Roles.DENTIST)) {
      permissions = getDentistPermissions();
    } else if (roles.includes(Roles.RECEPTIONIST)) {
      permissions = getReceptionistPermissions();
    } else {
      permissions = [];
    }
  }

  const tenantContext = createTestTenantContext({
    organizationId: overrides?.organizationId,
    clinicId: overrides?.clinicId,
  });

  return createCurrentUser({
    userId,
    email,
    roles,
    permissions,
    organizationId: tenantContext.organizationId,
    clinicId: tenantContext.clinicId,
  });
}

/**
 * Creates a test super admin user
 *
 * @param overrides - Optional overrides
 * @returns Super admin CurrentUser
 *
 * @example
 * ```typescript
 * const admin = createSuperAdmin();
 * ```
 */
export function createSuperAdmin(overrides?: {
  userId?: UUID;
  email?: Email;
  organizationId?: OrganizationId;
}): CurrentUser {
  return createTestUser({
    userId: overrides?.userId,
    email: overrides?.email ?? ('admin@example.com' as Email),
    roles: [Roles.SUPER_ADMIN],
    permissions: getSuperAdminPermissions(),
    organizationId: overrides?.organizationId,
    clinicId: undefined, // Super admins operate at org level
  });
}

/**
 * Creates a test dentist user
 *
 * @param overrides - Optional overrides
 * @returns Dentist CurrentUser
 *
 * @example
 * ```typescript
 * const dentist = createDentist();
 * ```
 */
export function createDentist(overrides?: {
  userId?: UUID;
  email?: Email;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;
}): CurrentUser {
  return createTestUser({
    userId: overrides?.userId,
    email: overrides?.email ?? ('dentist@example.com' as Email),
    roles: [Roles.DENTIST],
    permissions: getDentistPermissions(),
    organizationId: overrides?.organizationId,
    clinicId: overrides?.clinicId,
  });
}

/**
 * Creates a test receptionist user
 *
 * @param overrides - Optional overrides
 * @returns Receptionist CurrentUser
 *
 * @example
 * ```typescript
 * const receptionist = createReceptionist();
 * ```
 */
export function createReceptionist(overrides?: {
  userId?: UUID;
  email?: Email;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;
}): CurrentUser {
  return createTestUser({
    userId: overrides?.userId,
    email: overrides?.email ?? ('receptionist@example.com' as Email),
    roles: [Roles.RECEPTIONIST],
    permissions: getReceptionistPermissions(),
    organizationId: overrides?.organizationId,
    clinicId: overrides?.clinicId,
  });
}

/**
 * Creates a random test user
 *
 * @param role - Optional role (defaults to DENTIST)
 * @returns Random CurrentUser
 */
export function createRandomUser(role?: UserRole): CurrentUser {
  const selectedRole = role ?? Roles.DENTIST;

  return createTestUser({
    userId: generateFakeUUID(),
    email: generateFakeEmail() as Email,
    roles: [selectedRole],
  });
}
