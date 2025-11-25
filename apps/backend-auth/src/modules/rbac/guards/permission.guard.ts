/**
 * Permission Guard
 *
 * Authorization guard that checks if authenticated user has required permission.
 * Works in conjunction with @RequirePermission decorator.
 *
 * Security requirements:
 * - Must run AFTER JWT authentication guard
 * - Extracts permission requirement from metadata
 * - Validates user has permission via PermissionCheckerService
 * - Respects multi-tenant context (organizationId, clinicId)
 * - Returns 403 Forbidden if permission denied
 *
 * Edge cases handled:
 * - No permission metadata → allow access (public endpoint)
 * - No authenticated user → deny access (should not happen if JWT guard present)
 * - Missing organizationId → deny access (tenant context required)
 * - Permission check failure → deny access with clear error message
 *
 * @module modules/rbac/guards
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionCheckerService } from '../services/permission-checker.service';
import type { UserContext } from '../decorators/current-user.decorator';

/**
 * Guard metadata key for required permission
 * Set by @RequirePermission decorator
 */
export const PERMISSION_METADATA_KEY = 'requiredPermission';

/**
 * Permission authorization guard
 *
 * Validates that authenticated user has the required permission
 * before allowing access to protected route.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionChecker: PermissionCheckerService
  ) {}

  /**
   * Determine if user can activate route
   *
   * Process:
   * 1. Extract required permission from method metadata
   * 2. If no permission required, allow access
   * 3. Extract user context from request
   * 4. Validate user exists and has organizationId
   * 5. Check if user has required permission
   * 6. Throw ForbiddenException if permission denied
   *
   * @param context - Execution context
   * @returns true if access granted, false or throws exception if denied
   * @throws {ForbiddenException} If user lacks required permission
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract required permission from decorator metadata
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_METADATA_KEY,
      context.getHandler()
    );

    // If no permission requirement, allow access
    // This handles public endpoints or endpoints with only authentication
    if (!requiredPermission) {
      return true;
    }

    // Extract HTTP request
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserContext | undefined;

    // Validate user exists (should be set by JWT authentication guard)
    if (!user || !user.sub) {
      throw new ForbiddenException('Authentication required. User context not found in request.');
    }

    // Validate organizationId exists (required for tenant scoping)
    if (!user.organizationId) {
      throw new ForbiddenException(
        'Organization context required. User must belong to an organization.'
      );
    }

    // Check if user has the required permission
    // Note: UserContext uses string types, but permission checker expects branded UUID types
    // This is safe because JWT validation ensures these are valid UUIDs
    const hasPermission = await this.permissionChecker.hasPermission(
      user.sub as any,
      requiredPermission,
      user.organizationId as any,
      user.clinicId as any
    );

    // Deny access if permission not granted
    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Required permission: "${requiredPermission}". ` +
          `User does not have sufficient privileges to perform this action.`
      );
    }

    // Permission granted, allow access
    return true;
  }
}
