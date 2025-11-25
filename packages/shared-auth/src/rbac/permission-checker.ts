/**
 * Permission-based access control checkers
 * @module shared-auth/rbac/permission-checker
 */

import { Permission, ResourceType, PermissionAction } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';

/**
 * Checks if user has a specific permission
 *
 * @param user - Current authenticated user
 * @param permission - Permission to check
 * @returns true if user has the permission, false otherwise
 *
 * @remarks
 * Performs exact match on resource and action.
 * Does not consider permission constraints.
 *
 * @example
 * ```typescript
 * const canReadPatients = hasPermission(user, {
 *   resource: ResourceType.PATIENT,
 *   action: PermissionAction.READ,
 * });
 * ```
 */
export function hasPermission(user: CurrentUser, permission: Permission): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!permission || !permission.resource || !permission.action) {
    throw new Error('permission must have resource and action');
  }

  return user.permissions.some(
    (p) => p.resource === permission.resource && p.action === permission.action,
  );
}

/**
 * Checks if user has all specified permissions
 *
 * @param user - Current authenticated user
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions, false otherwise
 *
 * @example
 * ```typescript
 * const canManagePatients = hasAllPermissions(user, [
 *   { resource: ResourceType.PATIENT, action: PermissionAction.READ },
 *   { resource: ResourceType.PATIENT, action: PermissionAction.UPDATE },
 * ]);
 * ```
 */
export function hasAllPermissions(
  user: CurrentUser,
  permissions: Permission[],
): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!permissions || permissions.length === 0) {
    throw new Error('permissions array must contain at least one permission');
  }

  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Checks if user has any of the specified permissions
 *
 * @param user - Current authenticated user
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one permission, false otherwise
 *
 * @example
 * ```typescript
 * const canAccessReports = hasAnyPermission(user, [
 *   { resource: ResourceType.REPORT, action: PermissionAction.READ },
 *   { resource: ResourceType.REPORT, action: PermissionAction.EXPORT },
 * ]);
 * ```
 */
export function hasAnyPermission(
  user: CurrentUser,
  permissions: Permission[],
): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!permissions || permissions.length === 0) {
    throw new Error('permissions array must contain at least one permission');
  }

  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Checks if user can perform a specific action on a resource type
 *
 * @param user - Current authenticated user
 * @param resource - Resource type
 * @param action - Permission action
 * @returns true if user can perform action, false otherwise
 *
 * @remarks
 * This is a convenience function that constructs a Permission object
 * and checks if the user has it.
 *
 * @example
 * ```typescript
 * if (canAccessResource(user, ResourceType.INVOICE, PermissionAction.CREATE)) {
 *   // Allow invoice creation
 * }
 * ```
 */
export function canAccessResource(
  user: CurrentUser,
  resource: ResourceType,
  action: PermissionAction,
): boolean {
  if (!resource) {
    throw new Error('resource is required');
  }

  if (!action) {
    throw new Error('action is required');
  }

  return hasPermission(user, { resource, action });
}

/**
 * Gets all permissions for a specific resource type
 *
 * @param user - Current authenticated user
 * @param resource - Resource type
 * @returns Array of permissions for the resource
 *
 * @example
 * ```typescript
 * const patientPermissions = getResourcePermissions(user, ResourceType.PATIENT);
 * // Returns all PATIENT permissions: [{ resource: PATIENT, action: READ }, ...]
 * ```
 */
export function getResourcePermissions(
  user: CurrentUser,
  resource: ResourceType,
): readonly Permission[] {
  if (!user || !user.permissions) {
    return [];
  }

  if (!resource) {
    throw new Error('resource is required');
  }

  return user.permissions.filter((p) => p.resource === resource);
}

/**
 * Checks if user can perform all CRUD operations on a resource
 *
 * @param user - Current authenticated user
 * @param resource - Resource type
 * @returns true if user has full CRUD access, false otherwise
 */
export function hasFullAccess(user: CurrentUser, resource: ResourceType): boolean {
  if (!resource) {
    throw new Error('resource is required');
  }

  const crudActions = [
    PermissionAction.CREATE,
    PermissionAction.READ,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
  ];

  return crudActions.every((action) => canAccessResource(user, resource, action));
}
