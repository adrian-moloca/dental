/**
 * RBAC Type Definitions
 *
 * Centralized type definitions for Role-Based Access Control system.
 * These types ensure type safety across the entire RBAC implementation.
 */

import type { SystemRole } from '../constants/system-roles';
import type { Permission } from '../constants/permissions';

/* ============================================================================
 * Core RBAC Types
 * ============================================================================ */

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

/* ============================================================================
 * User Context - Information extracted from JWT
 * ============================================================================ */

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

/* ============================================================================
 * Role Definition Types
 * ============================================================================ */

/**
 * Scope level for roles
 */
export type RoleScope = 'global' | 'organization' | 'clinic';

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

/* ============================================================================
 * Permission Check Types
 * ============================================================================ */

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /**
   * Whether the user has the required permission
   */
  granted: boolean;

  /**
   * Reason for denial (if not granted)
   */
  reason?: string;

  /**
   * Which role(s) granted the permission (if granted)
   */
  grantedBy?: SystemRole[];
}

/**
 * Batch permission check request
 */
export interface BatchPermissionCheck {
  userId: UserId;
  permissions: Permission[];
}

/**
 * Batch permission check result
 */
export interface BatchPermissionCheckResult {
  userId: UserId;
  results: Record<Permission, PermissionCheckResult>;
}

/* ============================================================================
 * Role Assignment Types
 * ============================================================================ */

/**
 * User role assignment
 */
export interface UserRoleAssignment {
  /**
   * Assignment unique identifier
   */
  id: string;

  /**
   * User being assigned the role
   */
  userId: UserId;

  /**
   * Role being assigned
   */
  roleId: RoleId;

  /**
   * Organization context
   */
  organizationId: OrganizationId;

  /**
   * Clinic context (for clinic-scoped roles)
   */
  clinicId?: ClinicId;

  /**
   * User who made the assignment
   */
  assignedBy: UserId;

  /**
   * Assignment timestamp
   */
  assignedAt: Date;

  /**
   * Optional expiration date (for temporary access)
   */
  expiresAt?: Date;

  /**
   * Soft delete timestamp (null if active)
   */
  revokedAt?: Date;

  /**
   * User who revoked the assignment
   */
  revokedBy?: UserId;
}

/* ============================================================================
 * Authorization Guard Types
 * ============================================================================ */

/**
 * Permission requirement for guards
 */
export interface PermissionRequirement {
  /**
   * Required permissions (OR logic if multiple)
   */
  permissions: Permission[];

  /**
   * Whether ALL permissions are required (AND logic)
   * Default: false (OR logic)
   */
  requireAll?: boolean;

  /**
   * Custom error message if permission denied
   */
  errorMessage?: string;
}

/**
 * Role requirement for guards
 */
export interface RoleRequirement {
  /**
   * Required roles (OR logic if multiple)
   */
  roles: SystemRole[];

  /**
   * Whether ALL roles are required (AND logic)
   * Default: false (OR logic)
   */
  requireAll?: boolean;

  /**
   * Custom error message if role check fails
   */
  errorMessage?: string;
}

/**
 * Tenant/Clinic scoping requirement
 */
export interface ScopeRequirement {
  /**
   * Whether organization scoping is required
   */
  requireOrganization?: boolean;

  /**
   * Whether clinic scoping is required
   */
  requireClinic?: boolean;

  /**
   * Allow access across multiple clinics
   */
  allowMultiClinic?: boolean;
}

/* ============================================================================
 * Audit Log Types
 * ============================================================================ */

/**
 * Permission check audit log entry
 */
export interface PermissionAuditLog {
  /**
   * Log entry ID
   */
  id: string;

  /**
   * User who performed the action
   */
  userId: UserId;

  /**
   * User's organization
   */
  organizationId: OrganizationId;

  /**
   * User's clinic context (if applicable)
   */
  clinicId?: ClinicId;

  /**
   * Permission being checked
   */
  permission: Permission;

  /**
   * Whether permission was granted
   */
  granted: boolean;

  /**
   * User's roles at time of check
   */
  roles: SystemRole[];

  /**
   * Resource being accessed (e.g., "appointment:123")
   */
  resource?: string;

  /**
   * API endpoint or action
   */
  action: string;

  /**
   * HTTP method
   */
  method?: string;

  /**
   * Request IP address
   */
  ipAddress?: string;

  /**
   * User agent string
   */
  userAgent?: string;

  /**
   * Timestamp of the check
   */
  timestamp: Date;
}

/**
 * Role assignment audit log entry
 */
export interface RoleAssignmentAuditLog {
  /**
   * Log entry ID
   */
  id: string;

  /**
   * Type of operation
   */
  operation: 'assign' | 'revoke' | 'update';

  /**
   * User receiving the role assignment
   */
  targetUserId: UserId;

  /**
   * Role being assigned/revoked
   */
  roleId: RoleId;

  /**
   * Role code for readability
   */
  roleCode: string;

  /**
   * User who performed the operation
   */
  performedBy: UserId;

  /**
   * Organization context
   */
  organizationId: OrganizationId;

  /**
   * Clinic context (if applicable)
   */
  clinicId?: ClinicId;

  /**
   * Reason for the change
   */
  reason?: string;

  /**
   * Previous state (for updates)
   */
  previousState?: Record<string, unknown>;

  /**
   * New state (for updates)
   */
  newState?: Record<string, unknown>;

  /**
   * Timestamp of the operation
   */
  timestamp: Date;
}

/* ============================================================================
 * Custom Role Management Types
 * ============================================================================ */

/**
 * Create custom role DTO
 */
export interface CreateCustomRoleDto {
  /**
   * Role code (unique within organization)
   */
  code: string;

  /**
   * Display name for UI
   */
  displayName: string;

  /**
   * Role description
   */
  description: string;

  /**
   * Role scope
   */
  scope: Exclude<RoleScope, 'global'>; // Custom roles cannot be global

  /**
   * Permissions to assign
   */
  permissions: Permission[];

  /**
   * Optional UI color
   */
  color?: string;
}

/**
 * Update custom role DTO
 */
export interface UpdateCustomRoleDto {
  /**
   * Updated display name
   */
  displayName?: string;

  /**
   * Updated description
   */
  description?: string;

  /**
   * Updated permission set
   */
  permissions?: Permission[];

  /**
   * Updated color
   */
  color?: string;
}

/* ============================================================================
 * Permission Metadata Types
 * ============================================================================ */

/**
 * Risk level for permissions
 */
export type PermissionRiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Permission metadata (for documentation and UI)
 */
export interface PermissionMetadata {
  /**
   * Permission code
   */
  code: Permission;

  /**
   * Display name for UI
   */
  displayName: string;

  /**
   * Detailed description
   */
  description: string;

  /**
   * Module the permission belongs to
   */
  module: string;

  /**
   * Resource the permission controls
   */
  resource: string;

  /**
   * Action being performed
   */
  action: string;

  /**
   * Risk level assessment
   */
  riskLevel: PermissionRiskLevel;

  /**
   * Whether audit logging is required
   */
  auditRequired: boolean;

  /**
   * Typical roles that have this permission
   */
  typicalRoles?: SystemRole[];

  /**
   * Related permissions (for UI grouping)
   */
  relatedPermissions?: Permission[];

  /**
   * Compliance notes (HIPAA, PCI-DSS, etc.)
   */
  complianceNotes?: string;
}

/* ============================================================================
 * Helper Types
 * ============================================================================ */

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

/* ============================================================================
 * Database Entity Types (for reference)
 * ============================================================================ */

/**
 * Role entity (database representation)
 */
export interface RoleEntity {
  id: RoleId;
  code: string;
  displayName: string;
  description: string;
  scope: RoleScope;
  isSystemRole: boolean;
  organizationId: OrganizationId | null;
  permissions: string; // JSON string of PermissionSet
  canBeAssignedBy: string; // JSON string of SystemRole[]
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * User-Role assignment entity (database representation)
 */
export interface UserRoleEntity {
  id: string;
  userId: UserId;
  roleId: RoleId;
  organizationId: OrganizationId;
  clinicId: ClinicId | null;
  assignedBy: UserId;
  assignedAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  revokedBy: UserId | null;
}

/* ============================================================================
 * Service Response Types
 * ============================================================================ */

/**
 * Service operation result
 */
export interface RbacOperationResult<T = unknown> {
  /**
   * Whether the operation succeeded
   */
  success: boolean;

  /**
   * Result data (if successful)
   */
  data?: T;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Permission validation result
 */
export interface PermissionValidationResult {
  /**
   * Whether all permissions are valid
   */
  valid: boolean;

  /**
   * List of valid permissions
   */
  validPermissions: Permission[];

  /**
   * List of invalid permission codes
   */
  invalidPermissions: string[];
}

/**
 * Role assignment validation result
 */
export interface RoleAssignmentValidationResult {
  /**
   * Whether the assignment is valid
   */
  valid: boolean;

  /**
   * Validation errors (if any)
   */
  errors: string[];

  /**
   * Warnings (non-blocking issues)
   */
  warnings?: string[];
}
