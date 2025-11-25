/**
 * Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) utilities
 * @module shared-auth/rbac
 */

export {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isSuperAdmin,
  isOrgAdmin,
  isClinicAdmin,
  isClinicalStaff,
} from './role-checker';

export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  canAccessResource,
  getResourcePermissions,
  hasFullAccess,
} from './permission-checker';

export type { Scope } from './scope-checker';
export {
  extractScopes,
  hasScope,
  hasScopeForResource,
  hasAllScopes,
  hasAnyScope,
  toScope,
} from './scope-checker';
