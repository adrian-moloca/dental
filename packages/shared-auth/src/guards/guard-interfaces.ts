/**
 * Framework-agnostic guard interfaces
 * @module shared-auth/guards/interfaces
 */

import { Permission, TenantId } from '@dentalos/shared-types';
import { CurrentUser } from '../context/current-user';

/**
 * Base authentication guard interface
 * Framework-agnostic interface for implementing authentication guards
 *
 * @remarks
 * Implementations should:
 * - Extract and verify JWT tokens
 * - Populate CurrentUser in request context
 * - Return false or throw for unauthenticated requests
 *
 * @example
 * ```typescript
 * class NestAuthGuard implements AuthGuard {
 *   async canActivate(context: ExecutionContext): Promise<boolean> {
 *     const request = context.switchToHttp().getRequest();
 *     const token = extractToken(request);
 *     const user = await verifyAndPopulateUser(token);
 *     request.user = user;
 *     return true;
 *   }
 * }
 * ```
 */
export interface AuthGuard {
  /**
   * Determines if request can proceed
   * @param context - Framework-specific request context
   * @returns true if authenticated, false otherwise
   */
  canActivate(context: unknown): boolean | Promise<boolean>;
}

/**
 * Permission-based guard interface
 * Extends AuthGuard to enforce permission requirements
 *
 * @remarks
 * Implementations should:
 * - Verify user is authenticated (via AuthGuard)
 * - Check if user has required permissions
 * - Return false or throw for unauthorized requests
 */
export interface PermissionGuard extends AuthGuard {
  /**
   * Required permissions for this guard
   * User must have ALL listed permissions
   */
  readonly requiredPermissions: readonly Permission[];

  /**
   * Determines if user has required permissions
   * @param context - Framework-specific request context
   * @returns true if authorized, false otherwise
   */
  canActivate(context: unknown): boolean | Promise<boolean>;
}

/**
 * Tenant isolation guard interface
 * Enforces multi-tenant data isolation
 *
 * @remarks
 * Implementations should:
 * - Verify user is authenticated (via AuthGuard)
 * - Extract target tenant from request (params, body, etc.)
 * - Validate user's tenant matches target tenant
 * - Return false or throw for cross-tenant access attempts
 *
 * @security
 * This is CRITICAL for multi-tenant security.
 * Always validate tenant access before allowing data operations.
 */
export interface TenantGuard extends AuthGuard {
  /**
   * Validates user can access target tenant
   *
   * @param user - Current authenticated user
   * @param targetTenantId - Tenant ID being accessed
   * @returns true if access allowed, false otherwise
   *
   * @security
   * Must perform strict equality check on tenant IDs.
   * No default "allow all" behavior.
   */
  validateTenantAccess(user: CurrentUser, targetTenantId: TenantId): boolean;
}

/**
 * Combined permission and tenant guard interface
 * Enforces both permission requirements and tenant isolation
 */
export interface PermissionTenantGuard extends PermissionGuard, TenantGuard {
  /**
   * Required permissions
   */
  readonly requiredPermissions: readonly Permission[];

  /**
   * Validates both permissions and tenant access
   * @param context - Framework-specific request context
   * @returns true if authorized and tenant access valid, false otherwise
   */
  canActivate(context: unknown): boolean | Promise<boolean>;

  /**
   * Validates tenant access
   * @param user - Current authenticated user
   * @param targetTenantId - Tenant ID being accessed
   * @returns true if access allowed, false otherwise
   */
  validateTenantAccess(user: CurrentUser, targetTenantId: TenantId): boolean;
}

/**
 * Guard execution context
 * Minimal abstraction over framework-specific request contexts
 */
export interface GuardContext<TRequest = unknown> {
  /**
   * Gets the current request object
   */
  getRequest(): TRequest;

  /**
   * Gets the current user (if authenticated)
   */
  getUser(): CurrentUser | undefined;
}
