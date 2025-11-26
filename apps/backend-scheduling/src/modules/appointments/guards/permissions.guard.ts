import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permissions Guard
 *
 * Checks if user has required permissions for the endpoint
 * Works in conjunction with @RequirePermissions decorator
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userPermissions: string[] = user.permissions || [];

    // Check if user has any of the required permissions
    // Supports wildcard permissions: *:* (full access), appointments:* (full domain access)
    const hasPermission = requiredPermissions.some((required) => {
      // Direct match
      if (userPermissions.includes(required)) {
        return true;
      }

      // Check for wildcard permissions
      const [requiredDomain, requiredAction] = required.split(':');

      return userPermissions.some((userPerm) => {
        // Full wildcard: *:* grants everything
        if (userPerm === '*:*') {
          return true;
        }

        const [userDomain, userAction] = userPerm.split(':');

        // Domain wildcard: domain:* grants all actions in domain
        if (userDomain === requiredDomain && userAction === '*') {
          return true;
        }

        // Action wildcard: *:action grants action across all domains
        if (userDomain === '*' && userAction === requiredAction) {
          return true;
        }

        return false;
      });
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
