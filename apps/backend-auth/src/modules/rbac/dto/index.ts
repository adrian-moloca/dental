/**
 * RBAC DTOs Export
 * @module modules/rbac/dto
 */

// Request DTOs
export { AssignRoleDto } from './assign-role.dto';
export { RevokeRoleDto } from './revoke-role.dto';
export { CreateRoleDto } from './create-role.dto';
export { UpdateRolePermissionsDto } from './update-role-permissions.dto';

// Response DTOs
export { RoleResponseDto } from './role-response.dto';
export { UserRoleResponseDto } from './user-role-response.dto';
export { PermissionResponseDto } from './permission-response.dto';

// Query DTOs
export { ListRolesQueryDto } from './list-roles-query.dto';
export { ListPermissionsQueryDto } from './list-permissions-query.dto';
