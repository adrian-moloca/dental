import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CurrentUser } from '@dentalos/shared-auth';

/**
 * Permission metadata key for decorator
 */
export const PERMISSIONS_KEY = 'permissions';
export const ANY_PERMISSIONS_KEY = 'anyPermissions';

/**
 * Permission requirement mode
 */
export enum PermissionMode {
  ALL = 'ALL', // User must have ALL permissions (AND logic)
  ANY = 'ANY', // User must have ANY permission (OR logic)
}

/**
 * Permission metadata interface
 */
export interface PermissionMetadata {
  permissions: string[];
  mode: PermissionMode;
}

/**
 * Decorator to require ALL permissions (AND logic)
 *
 * @example
 * @RequirePermissions('organization:write', 'clinic:write')
 * async createClinic() { ... }
 */
export const RequirePermissions =
  (...permissions: string[]) =>
  (_target: any, _key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(
        PERMISSIONS_KEY,
        { permissions, mode: PermissionMode.ALL },
        descriptor.value,
      );
    }
  };

/**
 * Decorator to require ANY permission (OR logic)
 *
 * @example
 * @RequireAnyPermission('organization:read', 'clinic:read')
 * async getResource() { ... }
 */
export const RequireAnyPermission =
  (...permissions: string[]) =>
  (_target: any, _key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(
        ANY_PERMISSIONS_KEY,
        { permissions, mode: PermissionMode.ANY },
        descriptor.value,
      );
    }
  };

/**
 * Permissions Guard for Enterprise Service
 *
 * SECURITY RESPONSIBILITIES:
 * - Validates user has required permissions for endpoint
 * - Supports both ALL (AND) and ANY (OR) permission logic
 * - Blocks unauthorized requests with ForbiddenException
 * - Logs all authorization failures for audit trail
 *
 * RBAC/ABAC ENFORCEMENT:
 * - Integrates with shared-auth permission checking
 * - Validates permissions from JWT token payload
 * - Supports granular resource-level permissions
 * - Compatible with role-based and attribute-based access control
 *
 * THREAT MITIGATION:
 * - Prevents privilege escalation (CWE-269)
 * - Enforces least privilege principle
 * - Prevents unauthorized data access (CWE-284: Improper Access Control)
 *
 * USAGE:
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('organization:write', 'clinic:write')
 * async createClinic() { ... }
 *
 * IMPORTANT: This guard MUST be applied AFTER JwtAuthGuard
 * to ensure request.user is populated.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private readonly reflector: Reflector) {}

  /**
   * Determines if request can proceed based on permission requirements
   *
   * SECURITY CHECKS:
   * 1. Verify user is authenticated (request.user exists)
   * 2. Extract permission requirements from route metadata
   * 3. Validate user has required permissions based on mode (ALL/ANY)
   * 4. Block unauthorized requests with ForbiddenException
   * 5. Log all authorization failures for audit trail
   *
   * @param context - Execution context containing HTTP request
   * @returns true if authorized, throws ForbiddenException otherwise
   * @throws UnauthorizedException if user is not authenticated
   * @throws ForbiddenException if user lacks required permissions
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Verify user is authenticated
    // SECURITY: This guard depends on JwtAuthGuard running first
    const user = (request as any).user as CurrentUser | undefined;
    if (!user) {
      this.logger.error('PermissionsGuard: User not authenticated', {
        method: request.method,
        url: request.url,
      });
      throw new UnauthorizedException('Authentication required');
    }

    // Extract permission metadata from route handler
    const allPermissions = this.reflector.get<PermissionMetadata>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    const anyPermissions = this.reflector.get<PermissionMetadata>(
      ANY_PERMISSIONS_KEY,
      context.getHandler(),
    );

    // If no permissions required, allow access
    if (!allPermissions && !anyPermissions) {
      return true;
    }

    // Check ALL permissions (AND logic)
    if (allPermissions) {
      const hasAllRequired = this.checkAllPermissions(user, allPermissions.permissions);
      if (!hasAllRequired) {
        this.logger.warn('Authorization failed: Missing required permissions (ALL)', {
          userId: user.userId,
          organizationId: user.organizationId,
          requiredPermissions: allPermissions.permissions,
          userPermissions: user.permissions,
          method: request.method,
          url: request.url,
        });

        throw new ForbiddenException(
          `Insufficient permissions. Required: ${allPermissions.permissions.join(', ')}`,
        );
      }
    }

    // Check ANY permissions (OR logic)
    if (anyPermissions) {
      const hasAnyRequired = this.checkAnyPermissions(user, anyPermissions.permissions);
      if (!hasAnyRequired) {
        this.logger.warn('Authorization failed: Missing any required permission (ANY)', {
          userId: user.userId,
          organizationId: user.organizationId,
          requiredPermissions: anyPermissions.permissions,
          userPermissions: user.permissions,
          method: request.method,
          url: request.url,
        });

        throw new ForbiddenException(
          `Insufficient permissions. Required any of: ${anyPermissions.permissions.join(', ')}`,
        );
      }
    }

    // Log successful authorization for audit trail
    this.logger.debug('Authorization successful', {
      userId: user.userId,
      organizationId: user.organizationId,
      method: request.method,
      url: request.url,
    });

    return true;
  }

  /**
   * Checks if user has ALL required permissions (AND logic)
   * Supports wildcard permissions: *:* (full access), domain:* (domain access)
   *
   * @param user - Current authenticated user
   * @param requiredPermissions - Array of required permissions (strings like "patients:read")
   * @returns true if user has all permissions
   */
  private checkAllPermissions(user: CurrentUser, requiredPermissions: string[]): boolean {
    return requiredPermissions.every((required) => this.userHasPermission(user, required));
  }

  /**
   * Checks if user has ANY required permission (OR logic)
   * Supports wildcard permissions: *:* (full access), domain:* (domain access)
   *
   * @param user - Current authenticated user
   * @param requiredPermissions - Array of required permissions (strings like "patients:read")
   * @returns true if user has at least one permission
   */
  private checkAnyPermissions(user: CurrentUser, requiredPermissions: string[]): boolean {
    return requiredPermissions.some((required) => this.userHasPermission(user, required));
  }

  /**
   * Checks if user has a specific permission with wildcard support
   * Handles both string permissions from JWT (like "*:*") and Permission objects
   *
   * @param user - Current authenticated user
   * @param required - Required permission string (e.g., "patients:read")
   * @returns true if user has the permission
   */
  private userHasPermission(user: CurrentUser, required: string): boolean {
    // Cast to unknown[] because JWT payload contains strings but type says Permission[]
    const userPermissions: unknown[] = (user.permissions || []) as unknown[];
    const [requiredDomain, requiredAction] = required.split(':');

    return userPermissions.some((perm: unknown) => {
      // Handle string permissions (from JWT payload)
      if (typeof perm === 'string') {
        // Direct match
        if (perm === required) {
          return true;
        }

        // Full wildcard: *:* grants everything
        if (perm === '*:*') {
          return true;
        }

        const [userDomain, userAction] = perm.split(':');

        // Domain wildcard: domain:* grants all actions in domain
        if (userDomain === requiredDomain && userAction === '*') {
          return true;
        }

        // Action wildcard: *:action grants action across all domains
        if (userDomain === '*' && userAction === requiredAction) {
          return true;
        }

        return false;
      }

      // Handle Permission objects (if shared-auth types are used)
      if (typeof perm === 'object' && perm !== null) {
        const permObj = perm as { resource?: string; action?: string };
        if (permObj.resource && permObj.action) {
          return permObj.resource === requiredDomain && permObj.action === requiredAction;
        }
      }

      return false;
    });
  }
}
