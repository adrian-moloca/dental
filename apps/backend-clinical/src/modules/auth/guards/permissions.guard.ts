/**
 * Permissions Guard
 * Enforces RBAC permissions on routes
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUser } from '@dentalos/shared-auth';

export const PERMISSIONS_KEY = 'permissions';
export const ANY_PERMISSION_KEY = 'anyPermission';

/**
 * Check if user has a specific permission
 * Handles both string and object permission formats
 * Also handles wildcard permissions like "*:*"
 * Supports multi-part permissions like "clinical:treatment-plans:read"
 */
function checkUserHasPermission(user: CurrentUser, requiredPermission: string): boolean {
  if (!user || !user.permissions) return false;
  if (!requiredPermission || typeof requiredPermission !== 'string') return false;

  // Check user's permissions (may be strings or objects)
  return user.permissions.some((perm: any) => {
    // Handle string format like "*:*" or "clinical:read" or "clinical:notes:read"
    if (typeof perm === 'string') {
      // Wildcard permission - has all access
      if (perm === '*:*') return true;

      // Parse both permission strings
      const userParts = perm.split(':');
      const reqParts = requiredPermission.split(':');

      // For 2-part user permissions like "clinical:*"
      if (userParts.length === 2) {
        const [userResource, userAction] = userParts;
        // Resource wildcard - user has all actions on a resource
        if (userAction === '*' && reqParts[0] === userResource) return true;
        // Action wildcard - user has specific action on all resources
        if (userResource === '*') return true;
      }

      // Exact match (handles any number of parts)
      return perm === requiredPermission;
    }

    // Handle object format { resource, action }
    if (perm && typeof perm === 'object') {
      // Check for wildcards in object format
      if (perm.resource === '*' && perm.action === '*') return true;
      // For object permissions, compare as string
      const permStr = `${perm.resource}:${perm.action}`;
      if (permStr === requiredPermission) return true;
      // Handle wildcards
      if (perm.action === '*' && requiredPermission.startsWith(`${perm.resource}:`)) return true;
      if (perm.resource === '*') return true;
    }

    return false;
  });
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const anyPermission = this.reflector.getAllAndOverride<boolean>(ANY_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permissions required
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Check if user has required permissions
    const hasAccess = anyPermission
      ? requiredPermissions.some((perm) => checkUserHasPermission(user, perm))
      : requiredPermissions.every((perm) => checkUserHasPermission(user, perm));

    if (!hasAccess) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
