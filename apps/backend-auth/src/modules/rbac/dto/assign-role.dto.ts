/**
 * DTO for assigning a role to a user
 * @module modules/rbac/dto
 */

import { IsUUID, IsOptional, IsDateString } from 'class-validator';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Request DTO for assigning a role to a user
 *
 * Validation rules:
 * - userId must be valid UUID
 * - roleId must be valid UUID
 * - organizationId must be valid UUID
 * - clinicId is optional but must be valid UUID if provided
 * - expiresAt is optional but must be valid ISO date string if provided
 */
export class AssignRoleDto {
  /**
   * User ID to assign role to
   */
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
  userId!: UUID;

  /**
   * Role ID to assign
   */
  @IsUUID('4', { message: 'roleId must be a valid UUID v4' })
  roleId!: UUID;

  /**
   * Organization ID for tenant isolation
   */
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic ID for clinic-scoped assignment
   */
  @IsOptional()
  @IsUUID('4', { message: 'clinicId must be a valid UUID v4' })
  clinicId?: ClinicId;

  /**
   * Optional expiration date for temporary role assignment
   * Must be a valid ISO 8601 date string
   */
  @IsOptional()
  @IsDateString({}, { message: 'expiresAt must be a valid ISO 8601 date string' })
  expiresAt?: string;

  /**
   * Convert ISO string to Date object for repository
   */
  getExpiresAtDate(): Date | undefined {
    return this.expiresAt ? new Date(this.expiresAt) : undefined;
  }
}
