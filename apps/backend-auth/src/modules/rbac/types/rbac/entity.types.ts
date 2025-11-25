/**
 * Database Entity Type Definitions
 * TypeORM entity representations and audit log types
 */

import type { Permission } from '../../constants/permissions';
import type { SystemRole } from '../../constants/system-roles';
import type { UserId, OrganizationId, ClinicId, RoleId, RoleScope } from './core.types';

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
