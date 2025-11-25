/**
 * Permissions Guard
 *
 * Checks if user has required permissions for the endpoint.
 *
 * @module modules/auth/guards
 */

import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationError } from '@dentalos/shared-errors';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { CurrentUser } from '@dentalos/shared-auth';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new AuthorizationError('User not authenticated');
    }

    // TODO: Implement actual permission checking
    // For now, just log the required permissions
    this.logger.debug(`Required permissions: ${requiredPermissions.join(', ')}`);
    this.logger.debug(`User permissions: ${user.permissions?.join(', ') || 'none'}`);

    // Temporary: allow all authenticated users
    // In production, check user.permissions includes all requiredPermissions
    return true;
  }
}
