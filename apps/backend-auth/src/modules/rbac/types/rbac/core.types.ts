/**
 * Core RBAC Type Definitions
 * Base types, user context, and fundamental RBAC primitives
 */

import type { SystemRole } from '../../constants/system-roles';
import type { Permission } from '../../constants/permissions';

/**
 * User ID type (UUID)
 */
export type UserId = string;

/**
 * Organization ID type (UUID)
 */
export type OrganizationId = string;

/**
 * Clinic ID type (UUID)
 */
export type ClinicId = string;

/**
 * Role ID type (UUID for custom roles, string for system roles)
 */
export type RoleId = string;

/**
 * Permission set - can be array of permissions or wildcard
 */
export type PermissionSet = Permission[] | ['*'];

/**
 * Scope level for roles
 */
export type RoleScope = 'global' | 'organization' | 'clinic';

/**
 * Risk level for permissions
 */
export type PermissionRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Complete user authentication context
 * This is the payload structure in access tokens
 */
export interface UserContext {
  /**
   * User unique identifier
   */
  sub: UserId;

  /**
   * User email address
   */
  email: string;

  /**
   * Assigned role names (can be multiple)
   */
  roles: SystemRole[];

  /**
   * Flattened permission codes (unioned from all roles)
   * Includes all permissions from all assigned roles
   * Wildcard ['*'] indicates super admin with all permissions
   */
  permissions: PermissionSet;

  /**
   * Organization the user belongs to
   */
  organizationId: OrganizationId;

  /**
   * Primary clinic assignment (optional)
   * Users can be assigned to multiple clinics, but this is their primary
   */
  clinicId?: ClinicId;

  /**
   * All clinic IDs the user has access to
   * Used for multi-clinic access scenarios
   */
  clinicIds?: ClinicId[];

  /**
   * Token issued at timestamp (Unix epoch)
   */
  iat: number;

  /**
   * Token expiration timestamp (Unix epoch)
   */
  exp: number;

  /**
   * Session ID for tracking and revocation
   */
  sessionId?: string;
}

/**
 * Type guard to check if permission set is wildcard
 */
export const isWildcardPermission = (permissions: PermissionSet): permissions is ['*'] => {
  return permissions.length === 1 && permissions[0] === '*';
};

/**
 * Type guard to check if user has wildcard permission
 */
export const hasWildcardPermission = (context: UserContext): boolean => {
  return isWildcardPermission(context.permissions);
};

/**
 * Extract permission components from permission code
 */
export interface PermissionComponents {
  module: string;
  resource: string;
  action: string;
}

/**
 * User with roles expanded (for internal use)
 */
export interface UserWithRoles {
  id: UserId;
  email: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  roles: RoleDefinition[];
  effectivePermissions: PermissionSet;
}

/**
 * Complete role definition (system or custom)
 */
export interface RoleDefinition {
  /**
   * Unique role identifier (UUID for custom, snake_case for system)
   */
  id: RoleId;

  /**
   * Role code/name (unique within organization)
   */
  code: string;

  /**
   * Human-readable display name
   */
  displayName: string;

  /**
   * Role description and purpose
   */
  description: string;

  /**
   * Organizational scope of the role
   */
  scope: RoleScope;

  /**
   * Whether this is a system role (immutable) or custom role
   */
  isSystemRole: boolean;

  /**
   * Organization this role belongs to (null for system roles)
   */
  organizationId: OrganizationId | null;

  /**
   * Permissions assigned to this role
   */
  permissions: PermissionSet;

  /**
   * Roles that can assign this role to users
   */
  canBeAssignedBy: SystemRole[];

  /**
   * Optional color for UI display (hex code)
   */
  color?: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Soft delete timestamp (null if active)
   */
  deletedAt: Date | null;
}
