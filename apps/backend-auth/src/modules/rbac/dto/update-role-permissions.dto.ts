/**
 * DTO for updating role permissions
 * @module modules/rbac/dto
 */

import { IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Request DTO for updating permissions assigned to a role
 *
 * Validation rules:
 * - roleId must be valid UUID
 * - organizationId must be valid UUID
 * - permissionIds must be array of at least one UUID
 */
export class UpdateRolePermissionsDto {
  /**
   * Role ID to update permissions for
   */
  @IsUUID('4', { message: 'roleId must be a valid UUID v4' })
  roleId!: UUID;

  /**
   * Organization ID for tenant isolation
   */
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4' })
  organizationId!: OrganizationId;

  /**
   * Array of permission IDs to assign to role
   * This replaces all existing permissions
   */
  @IsArray({ message: 'permissionIds must be an array' })
  @ArrayMinSize(1, { message: 'permissionIds must contain at least one permission' })
  @IsUUID('4', { each: true, message: 'Each permissionId must be a valid UUID v4' })
  permissionIds!: UUID[];
}
