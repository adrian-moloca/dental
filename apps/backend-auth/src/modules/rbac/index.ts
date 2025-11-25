/**
 * RBAC Module - Public API
 *
 * This is the main entry point for the RBAC (Role-Based Access Control) module.
 * Import from this file to access roles, permissions, and type definitions.
 *
 * @example
 * ```typescript
 * import { PERMISSIONS, SYSTEM_ROLES, UserContext } from '@auth/rbac';
 *
 * // Use in guards
 * @RequirePermission(PERMISSIONS.CLINICAL.DIAGNOSIS.CREATE)
 * async createDiagnosis() { ... }
 *
 * // Check roles
 * if (userContext.roles.includes(SYSTEM_ROLES.DOCTOR)) { ... }
 * ```
 */

/* ============================================================================
 * Module
 * ============================================================================ */

export { RBACModule } from './rbac.module';

/* ============================================================================
 * Entities
 * ============================================================================ */

export { Role, SystemRole } from './entities/role.entity';
export { Permission, PermissionAction } from './entities/permission.entity';
export { UserRole } from './entities/user-role.entity';
export { RolePermission } from './entities/role-permission.entity';

/* ============================================================================
 * Repositories
 * ============================================================================ */

export { RoleRepository, CreateRoleData, UpdateRoleData } from './repositories/role.repository';
export {
  PermissionRepository,
  CreatePermissionData,
  UpdatePermissionData,
} from './repositories/permission.repository';
export {
  UserRoleRepository,
  AssignRoleData,
  RevokeRoleData,
} from './repositories/user-role.repository';
export {
  RolePermissionRepository,
  GrantPermissionData,
} from './repositories/role-permission.repository';

/* ============================================================================
 * Services
 * ============================================================================ */

export { PermissionCheckerService } from './services/permission-checker.service';
export { RoleCheckerService } from './services/role-checker.service';
export {
  RBACService,
  AssignRoleParams,
  RevokeRoleParams,
  CreateRoleParams,
  UpdateRolePermissionsParams,
} from './services/rbac.service';

/* ============================================================================
 * DTOs
 * ============================================================================ */

export { AssignRoleDto } from './dto/assign-role.dto';
export { RevokeRoleDto } from './dto/revoke-role.dto';
export { CreateRoleDto } from './dto/create-role.dto';
export { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

/* ============================================================================
 * Role Definitions (Constants)
 * ============================================================================ */

export {
  SYSTEM_ROLES,
  ROLE_METADATA,
  getAllSystemRoles,
  isValidSystemRole,
  getRoleMetadata,
} from './constants/system-roles';

export type { SystemRole as SystemRoleType, RoleMetadata } from './constants/system-roles';

/* ============================================================================
 * Permission Definitions (Constants)
 * ============================================================================ */

export {
  PERMISSIONS,
  SCHEDULING_PERMISSIONS,
  CLINICAL_PERMISSIONS,
  BILLING_PERMISSIONS,
  INVENTORY_PERMISSIONS,
  MARKETING_PERMISSIONS,
  ANALYTICS_PERMISSIONS,
  HR_PERMISSIONS,
  ADMIN_PERMISSIONS,
  getAllPermissions,
  isValidPermission,
  parsePermission,
  TOTAL_PERMISSION_COUNT,
} from './constants/permissions';

export type { Permission as PermissionType, PermissionMetadata } from './constants/permissions';

/* ============================================================================
 * Role-Permission Mappings (Constants)
 * ============================================================================ */

export {
  ROLE_PERMISSION_MAPPING,
  getPermissionsForRole,
  getPermissionsForRoles,
  roleHasPermission,
  rolesHavePermission,
  getRolePermissionCounts,
} from './constants/role-permissions';

export type { RolePermissionSet } from './constants/role-permissions';

/* ============================================================================
 * Type Definitions
 * ============================================================================ */

export type {
  // Core types
  UserId,
  OrganizationId,
  ClinicId,
  RoleId,
  PermissionSet,

  // User context
  UserContext,

  // Role types
  RoleScope,
  RoleDefinition,

  // Permission checking
  PermissionCheckResult,
  BatchPermissionCheck,
  BatchPermissionCheckResult,

  // Role assignment
  UserRoleAssignment,

  // Guard types
  PermissionRequirement,
  RoleRequirement,
  ScopeRequirement,

  // Audit types
  PermissionAuditLog,
  RoleAssignmentAuditLog,

  // Custom role management
  CreateCustomRoleDto as CreateCustomRoleDtoType,
  UpdateCustomRoleDto as UpdateCustomRoleDtoType,

  // Permission metadata
  PermissionRiskLevel,

  // Helper types
  PermissionComponents,
  UserWithRoles,

  // Database entities
  RoleEntity,
  UserRoleEntity,

  // Service responses
  RbacOperationResult,
  PermissionValidationResult,
  RoleAssignmentValidationResult,
} from './types/rbac.types';

export { isWildcardPermission, hasWildcardPermission } from './types/rbac.types';

/* ============================================================================
 * Version Information
 * ============================================================================ */

/**
 * RBAC Module Version
 */
export const RBAC_VERSION = '1.0.0';

/**
 * RBAC Module Metadata
 */
export const RBAC_METADATA = {
  version: RBAC_VERSION,
  totalRoles: 7,
  totalPermissions: 85,
  lastUpdated: '2025-11-20',
  status: 'canonical',
} as const;
