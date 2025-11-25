/**
 * Framework-agnostic guard interfaces and decorators
 * @module shared-auth/guards
 */

export type {
  AuthGuard,
  PermissionGuard,
  TenantGuard,
  PermissionTenantGuard,
  GuardContext,
} from './guard-interfaces';

export type { PermissionMetadata } from './permission.decorator';
export {
  RequirePermissions,
  RequireAnyPermission,
  getPermissionMetadata,
  PERMISSION_METADATA_KEY,
} from './permission.decorator';

export type { RoleMetadata } from './role.decorator';
export {
  RequireRoles,
  RequireAllRoles,
  getRoleMetadata,
  ROLE_METADATA_KEY,
} from './role.decorator';

export type { ModuleMetadata } from './requires-module.decorator';
export {
  RequiresModule,
  getModuleMetadata,
  MODULE_METADATA_KEY,
} from './requires-module.decorator';

export { LicenseGuard } from './license.guard';
export {
  SubscriptionStatusGuard,
  ALLOW_GRACE_PERIOD_KEY,
} from './subscription-status.guard';
