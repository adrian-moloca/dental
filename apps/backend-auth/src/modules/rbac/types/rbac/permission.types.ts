/**
 * Permission-Related Type Definitions
 * Permission checks, validation, metadata, and authorization guards
 */

import type { Permission } from '../../constants/permissions';
import type { SystemRole } from '../../constants/system-roles';
import type { UserId, PermissionRiskLevel } from './core.types';

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
