import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../guards/permissions.guard';

/**
 * Require Permissions Decorator
 *
 * Specifies required permissions for an endpoint
 * Usage: @RequirePermissions('appointments:create', 'appointments:read')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
