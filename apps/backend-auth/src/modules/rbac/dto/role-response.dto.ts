/**
 * Role Response DTO
 *
 * Maps Role entity to API response format.
 * Provides clean, consistent structure for role data in API responses.
 *
 * Security considerations:
 * - Exposes only safe fields (no internal IDs or sensitive data)
 * - Includes isSystem flag to prevent modification attempts
 * - Includes isActive flag for UI display logic
 *
 * @module modules/rbac/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { Role } from '../entities/role.entity';

/**
 * Role response DTO for API responses
 *
 * Used in:
 * - GET /rbac/roles
 * - POST /rbac/roles
 * - POST /rbac/roles/:id/permissions
 */
export class RoleResponseDto {
  /**
   * Role unique identifier
   */
  @ApiProperty({
    description: 'Unique role identifier (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: UUID;

  /**
   * Role code/name (lowercase with underscores)
   */
  @ApiProperty({
    description: 'Role code name (lowercase, underscores only)',
    example: 'clinic_admin',
    pattern: '^[a-z_]+$',
  })
  name!: string;

  /**
   * Human-readable display name
   */
  @ApiProperty({
    description: 'Display name for UI presentation',
    example: 'Clinic Administrator',
  })
  displayName!: string;

  /**
   * Role description
   */
  @ApiProperty({
    description: 'Detailed description of role purpose and permissions',
    example: 'Full administrative access within a specific clinic',
    nullable: true,
    required: false,
  })
  description?: string;

  /**
   * Organization ID (tenant isolation)
   */
  @ApiProperty({
    description: 'Organization this role belongs to',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: OrganizationId;

  /**
   * Optional clinic ID for clinic-scoped roles
   */
  @ApiProperty({
    description: 'Clinic ID for clinic-specific roles (null for org-wide roles)',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  clinicId?: ClinicId;

  /**
   * Whether this is a system-defined role
   */
  @ApiProperty({
    description: 'Whether this is a system role (immutable)',
    example: false,
  })
  isSystem!: boolean;

  /**
   * Whether this role is active
   */
  @ApiProperty({
    description: 'Whether this role is active and can be assigned',
    example: true,
  })
  isActive!: boolean;

  /**
   * Number of users currently assigned this role
   */
  @ApiProperty({
    description: 'Count of active user assignments for this role',
    example: 12,
    required: false,
  })
  userCount?: number;

  /**
   * Number of permissions attached to this role
   */
  @ApiProperty({
    description: 'Count of permissions assigned to this role',
    example: 24,
    required: false,
  })
  permissionCount?: number;

  /**
   * Creation timestamp
   */
  @ApiProperty({
    description: 'When the role was created',
    example: '2025-11-20T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  /**
   * Last update timestamp
   */
  @ApiProperty({
    description: 'When the role was last updated',
    example: '2025-11-20T14:45:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;

  /**
   * Maps Role entity to RoleResponseDto
   *
   * @param role - Role entity from database
   * @param userCount - Optional count of users with this role
   * @param permissionCount - Optional count of permissions in this role
   * @returns Mapped RoleResponseDto
   */
  static fromEntity(role: Role, userCount?: number, permissionCount?: number): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id = role.id;
    dto.name = role.name;
    dto.displayName = role.displayName;
    dto.description = role.description;
    dto.organizationId = role.organizationId;
    dto.clinicId = role.clinicId;
    dto.isSystem = role.isSystem;
    dto.isActive = role.isActive;
    dto.createdAt = role.createdAt;
    dto.updatedAt = role.updatedAt;

    if (userCount !== undefined) {
      dto.userCount = userCount;
    }

    if (permissionCount !== undefined) {
      dto.permissionCount = permissionCount;
    }

    return dto;
  }

  /**
   * Maps array of Role entities to RoleResponseDto array
   *
   * @param roles - Array of Role entities
   * @returns Array of RoleResponseDto
   */
  static fromEntities(roles: Role[]): RoleResponseDto[] {
    return roles.map((role) => RoleResponseDto.fromEntity(role));
  }
}
