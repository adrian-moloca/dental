/**
 * RBAC Repositories Export
 * @module modules/rbac/repositories
 */

export { RoleRepository, CreateRoleData, UpdateRoleData } from './role.repository';
export {
  PermissionRepository,
  CreatePermissionData,
  UpdatePermissionData,
} from './permission.repository';
export { UserRoleRepository, AssignRoleData, RevokeRoleData } from './user-role.repository';
export { RolePermissionRepository, GrantPermissionData } from './role-permission.repository';
