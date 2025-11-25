/**
 * Role Assignment Type Definitions
 * User-role assignments, role management DTOs, and operation results
 */

import type { Permission } from '../../constants/permissions';
import type { UserId, OrganizationId, ClinicId, RoleId, RoleScope } from './core.types';

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
