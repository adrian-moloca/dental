/**
 * Scope-based access control checkers
 * @module shared-auth/rbac/scope-checker
 */

import { ResourceType, PermissionAction } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';

/**
 * OAuth 2.0 style scope format: "resource:action"
 * Examples: "patient:read", "appointment:write", "invoice:delete"
 */
export type Scope = `${string}:${string}`;

/**
 * Extracts scopes from user permissions
 * Converts permissions to OAuth 2.0 style scope strings
 *
 * @param user - Current authenticated user
 * @returns Array of scope strings
 *
 * @remarks
 * Scope format: "resource:action"
 * Example: "patient:read", "appointment:create"
 *
 * @example
 * ```typescript
 * const scopes = extractScopes(user);
 * // Returns: ["patient:read", "patient:update", "appointment:create", ...]
 * ```
 */
export function extractScopes(user: CurrentUser): readonly Scope[] {
  if (!user || !user.permissions) {
    return [];
  }

  return user.permissions.map(
    (permission) =>
      `${permission.resource.toLowerCase()}:${permission.action.toLowerCase()}` as Scope,
  );
}

/**
 * Checks if user has a specific scope
 *
 * @param user - Current authenticated user
 * @param scope - Scope to check (format: "resource:action")
 * @returns true if user has the scope, false otherwise
 *
 * @example
 * ```typescript
 * if (hasScope(user, "patient:read")) {
 *   // Allow patient read operations
 * }
 * ```
 */
export function hasScope(user: CurrentUser, scope: Scope | string): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!scope || typeof scope !== 'string') {
    throw new Error('scope must be a non-empty string');
  }

  const [resource, action] = scope.split(':');

  if (!resource || !action) {
    throw new Error('scope must be in format "resource:action"');
  }

  return user.permissions.some(
    (p) =>
      p.resource.toLowerCase() === resource.toLowerCase() &&
      p.action.toLowerCase() === action.toLowerCase(),
  );
}

/**
 * Checks if user has any scope for a specific resource
 *
 * @param user - Current authenticated user
 * @param resource - Resource name (case-insensitive)
 * @returns true if user has any permission for the resource
 *
 * @example
 * ```typescript
 * if (hasScopeForResource(user, "patient")) {
 *   // User has some patient permissions
 * }
 * ```
 */
export function hasScopeForResource(user: CurrentUser, resource: string): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!resource || typeof resource !== 'string') {
    throw new Error('resource must be a non-empty string');
  }

  return user.permissions.some(
    (p) => p.resource.toLowerCase() === resource.toLowerCase(),
  );
}

/**
 * Checks if user has all specified scopes
 *
 * @param user - Current authenticated user
 * @param scopes - Array of scopes to check
 * @returns true if user has all scopes, false otherwise
 *
 * @example
 * ```typescript
 * if (hasAllScopes(user, ["patient:read", "patient:update"])) {
 *   // User can read and update patients
 * }
 * ```
 */
export function hasAllScopes(user: CurrentUser, scopes: Array<Scope | string>): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!scopes || scopes.length === 0) {
    throw new Error('scopes array must contain at least one scope');
  }

  return scopes.every((scope) => hasScope(user, scope));
}

/**
 * Checks if user has any of the specified scopes
 *
 * @param user - Current authenticated user
 * @param scopes - Array of scopes to check
 * @returns true if user has at least one scope, false otherwise
 *
 * @example
 * ```typescript
 * if (hasAnyScope(user, ["report:read", "report:export"])) {
 *   // User can either read or export reports
 * }
 * ```
 */
export function hasAnyScope(user: CurrentUser, scopes: Array<Scope | string>): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  if (!scopes || scopes.length === 0) {
    throw new Error('scopes array must contain at least one scope');
  }

  return scopes.some((scope) => hasScope(user, scope));
}

/**
 * Converts resource type and action to scope string
 *
 * @param resource - Resource type
 * @param action - Permission action
 * @returns Scope string
 *
 * @example
 * ```typescript
 * const scope = toScope(ResourceType.PATIENT, PermissionAction.READ);
 * // Returns: "patient:read"
 * ```
 */
export function toScope(resource: ResourceType, action: PermissionAction): Scope {
  if (!resource) {
    throw new Error('resource is required');
  }

  if (!action) {
    throw new Error('action is required');
  }

  return `${resource.toLowerCase()}:${action.toLowerCase()}` as Scope;
}
