/**
 * Permissions Decorator
 *
 * Marks routes with required permissions.
 *
 * @module modules/auth/decorators
 */

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
