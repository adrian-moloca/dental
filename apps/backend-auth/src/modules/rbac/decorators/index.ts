/**
 * RBAC Decorators Export
 * @module modules/rbac/decorators
 */

export { CurrentUser, type UserContext } from './current-user.decorator';
export {
  RequirePermission,
  RequireAnyPermission,
  RequireAllPermissions,
} from './require-permission.decorator';
