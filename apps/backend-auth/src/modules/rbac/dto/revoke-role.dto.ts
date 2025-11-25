/**
 * DTO for revoking a role from a user
 * @module modules/rbac/dto
 */

import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Request DTO for revoking a role from a user
 *
 * Validation rules:
 * - userId must be valid UUID
 * - roleId must be valid UUID
 * - organizationId must be valid UUID
 * - clinicId is optional but must be valid UUID if provided
 * - revocationReason is optional but max 500 characters
 */
export class RevokeRoleDto {
  /**
   * User ID to revoke role from
   */
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
  userId!: UUID;

  /**
   * Role ID to revoke
   */
  @IsUUID('4', { message: 'roleId must be a valid UUID v4' })
  roleId!: UUID;

  /**
   * Organization ID for tenant isolation
   */
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic ID for clinic-scoped revocation
   */
  @IsOptional()
  @IsUUID('4', { message: 'clinicId must be a valid UUID v4' })
  clinicId?: ClinicId;

  /**
   * Optional reason for revoking the role
   * Used for audit trail and compliance
   */
  @IsOptional()
  @IsString({ message: 'revocationReason must be a string' })
  @MaxLength(500, { message: 'revocationReason must not exceed 500 characters' })
  revocationReason?: string;
}
