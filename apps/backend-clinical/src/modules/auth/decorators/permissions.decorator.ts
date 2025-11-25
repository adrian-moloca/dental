/**
 * Permissions Decorators
 * Define required permissions for routes
 */

import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY, ANY_PERMISSION_KEY } from '../guards';

/**
 * Require all specified permissions (AND logic)
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Require any of the specified permissions (OR logic)
 */
export const RequireAnyPermission = (...permissions: string[]) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (key && descriptor) {
      SetMetadata(PERMISSIONS_KEY, permissions)(target, key, descriptor);
      SetMetadata(ANY_PERMISSION_KEY, true)(target, key, descriptor);
    }
  };
};
