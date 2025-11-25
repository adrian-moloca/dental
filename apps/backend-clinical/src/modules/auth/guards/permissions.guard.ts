/**
 * Permissions Guard
 * Enforces RBAC permissions on routes
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CurrentUser, hasPermission, hasAnyPermission } from '@dentalos/shared-auth';

export const PERMISSIONS_KEY = 'permissions';
export const ANY_PERMISSION_KEY = 'anyPermission';

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
      ? hasAnyPermission(user, requiredPermissions as any)
      : requiredPermissions.every((permission) => hasPermission(user, permission as any));

    if (!hasAccess) {
      throw new ForbiddenException(
        `Missing required permissions: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
