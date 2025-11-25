/**
 * Role-based access control (RBAC) checkers
 * @module shared-auth/rbac/role-checker
 */

import { UserRole } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';

/**
 * Checks if user has a specific role
 *
 * @param user - Current authenticated user
 * @param role - Role to check
 * @returns true if user has the role, false otherwise
 *
 * @example
 * ```typescript
 * if (hasRole(user, UserRole.DENTIST)) {
 *   // Allow dentist-specific operations
 * }
 * ```
 */
export function hasRole(user: CurrentUser, role: UserRole): boolean {
  if (!user || !user.roles) {
    return false;
  }

  if (!role) {
    throw new Error('role parameter is required');
  }

  return user.roles.includes(role);
}

/**
 * Checks if user has any of the specified roles
 *
 * @param user - Current authenticated user
 * @param roles - Array of roles to check
 * @returns true if user has at least one role, false otherwise
 *
 * @example
 * ```typescript
 * if (hasAnyRole(user, [UserRole.DENTIST, UserRole.HYGIENIST])) {
 *   // Allow clinical staff operations
 * }
 * ```
 */
export function hasAnyRole(user: CurrentUser, roles: UserRole[]): boolean {
  if (!user || !user.roles) {
    return false;
  }

  if (!roles || roles.length === 0) {
    throw new Error('roles array must contain at least one role');
  }

  return roles.some((role) => user.roles.includes(role));
}

/**
 * Checks if user has all of the specified roles
 *
 * @param user - Current authenticated user
 * @param roles - Array of roles to check
 * @returns true if user has all roles, false otherwise
 *
 * @remarks
 * This is useful for operations requiring multiple roles simultaneously.
 * Most users have a single primary role, so this will typically return false.
 *
 * @example
 * ```typescript
 * if (hasAllRoles(user, [UserRole.DENTIST, UserRole.CLINIC_ADMIN])) {
 *   // User is both dentist and clinic admin
 * }
 * ```
 */
export function hasAllRoles(user: CurrentUser, roles: UserRole[]): boolean {
  if (!user || !user.roles) {
    return false;
  }

  if (!roles || roles.length === 0) {
    throw new Error('roles array must contain at least one role');
  }

  return roles.every((role) => user.roles.includes(role));
}

/**
 * Checks if user is a super admin
 *
 * @param user - Current authenticated user
 * @returns true if user is super admin, false otherwise
 */
export function isSuperAdmin(user: CurrentUser): boolean {
  return hasRole(user, UserRole.SUPER_ADMIN);
}

/**
 * Checks if user is an organization admin
 *
 * @param user - Current authenticated user
 * @returns true if user is org admin or super admin, false otherwise
 */
export function isOrgAdmin(user: CurrentUser): boolean {
  return hasAnyRole(user, [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
}

/**
 * Checks if user is a clinic admin
 *
 * @param user - Current authenticated user
 * @returns true if user is clinic admin, org admin, or super admin
 */
export function isClinicAdmin(user: CurrentUser): boolean {
  return hasAnyRole(user, [
    UserRole.SUPER_ADMIN,
    UserRole.ORG_ADMIN,
    UserRole.CLINIC_ADMIN,
  ]);
}

/**
 * Checks if user is clinical staff (dentist, hygienist, or assistant)
 *
 * @param user - Current authenticated user
 * @returns true if user is clinical staff, false otherwise
 */
export function isClinicalStaff(user: CurrentUser): boolean {
  return hasAnyRole(user, [
    UserRole.DENTIST,
    UserRole.HYGIENIST,
    UserRole.ASSISTANT,
  ]);
}
