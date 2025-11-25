/**
 * DTO for creating a custom role
 * @module modules/rbac/dto
 */

import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  Matches,
  MinLength,
  MaxLength,
  IsArray,
} from 'class-validator';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Request DTO for creating a custom role
 *
 * Validation rules:
 * - name must be lowercase with underscores only (^[a-z_]+$)
 * - name must be 2-100 characters
 * - displayName required, 2-255 characters
 * - description optional, max 1000 characters
 * - organizationId required, valid UUID
 * - clinicId optional, valid UUID if provided
 * - permissionIds optional array of UUIDs
 * - isSystem optional boolean (default: false)
 * - isActive optional boolean (default: true)
 */
export class CreateRoleDto {
  /**
   * Role name (lowercase, underscores only)
   * Examples: "doctor", "receptionist", "clinic_admin"
   */
  @IsString({ message: 'name must be a string' })
  @MinLength(2, { message: 'name must be at least 2 characters long' })
  @MaxLength(100, { message: 'name must not exceed 100 characters' })
  @Matches(/^[a-z_]+$/, {
    message: 'name must contain only lowercase letters and underscores',
  })
  name!: string;

  /**
   * Human-readable display name
   * Examples: "Doctor (Full Access)", "Receptionist"
   */
  @IsString({ message: 'displayName must be a string' })
  @MinLength(2, { message: 'displayName must be at least 2 characters long' })
  @MaxLength(255, { message: 'displayName must not exceed 255 characters' })
  displayName!: string;

  /**
   * Detailed description of role's purpose
   */
  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(1000, { message: 'description must not exceed 1000 characters' })
  description?: string;

  /**
   * Organization ID for tenant isolation
   */
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4' })
  organizationId!: OrganizationId;

  /**
   * Optional clinic ID for clinic-specific role
   */
  @IsOptional()
  @IsUUID('4', { message: 'clinicId must be a valid UUID v4' })
  clinicId?: ClinicId;

  /**
   * Optional array of permission IDs to assign to role
   */
  @IsOptional()
  @IsArray({ message: 'permissionIds must be an array' })
  @IsUUID('4', { each: true, message: 'Each permissionId must be a valid UUID v4' })
  permissionIds?: UUID[];

  /**
   * Whether role is system-defined (typically false for custom roles)
   */
  @IsOptional()
  @IsBoolean({ message: 'isSystem must be a boolean' })
  isSystem?: boolean;

  /**
   * Whether role is active (default: true)
   */
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;
}
