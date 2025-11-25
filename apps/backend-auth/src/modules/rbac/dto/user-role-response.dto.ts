/**
 * UserRole Response DTO
 *
 * Maps UserRole entity to API response format.
 * Provides complete assignment information including role details.
 *
 * Security considerations:
 * - Includes assignment audit trail (assignedBy, assignedAt)
 * - Exposes revocation information for transparency
 * - Includes expiration data for temporary assignments
 *
 * @module modules/rbac/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { UserRole } from '../entities/user-role.entity';
import { RoleResponseDto } from './role-response.dto';

/**
 * UserRole response DTO for API responses
 *
 * Used in:
 * - POST /rbac/users/:id/roles (assign role)
 * - GET /rbac/users/:id/roles (list user roles)
 */
export class UserRoleResponseDto {
  /**
   * Assignment unique identifier
   */
  @ApiProperty({
    description: 'Unique user-role assignment identifier (UUID v4)',
    example: '880e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: UUID;

  /**
   * User ID who has the role
   */
  @ApiProperty({
    description: 'User who was assigned this role',
    example: '990e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  userId!: UUID;

  /**
   * Role ID that was assigned
   */
  @ApiProperty({
    description: 'Role that was assigned',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  roleId!: UUID;

  /**
   * Organization context
   */
  @ApiProperty({
    description: 'Organization where the role was assigned',
    example: '660e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  organizationId!: OrganizationId;

  /**
   * Optional clinic context
   */
  @ApiProperty({
    description: 'Clinic where the role was assigned (null for org-wide)',
    example: '770e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  clinicId?: ClinicId;

  /**
   * When the role was assigned
   */
  @ApiProperty({
    description: 'Timestamp when role was assigned',
    example: '2025-11-20T10:30:00.000Z',
    format: 'date-time',
  })
  assignedAt!: Date;

  /**
   * Who assigned the role
   */
  @ApiProperty({
    description: 'User ID of the person who assigned this role',
    example: 'aa0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  assignedBy!: UUID;

  /**
   * Optional expiration timestamp
   */
  @ApiProperty({
    description: 'When the role assignment expires (null for permanent)',
    example: '2026-11-20T10:30:00.000Z',
    format: 'date-time',
    nullable: true,
    required: false,
  })
  expiresAt?: Date;

  /**
   * Whether the assignment is currently active
   */
  @ApiProperty({
    description: 'Whether the role assignment is currently active',
    example: true,
  })
  isActive!: boolean;

  /**
   * Whether the assignment has been revoked
   */
  @ApiProperty({
    description: 'Whether the role assignment has been revoked',
    example: false,
  })
  isRevoked!: boolean;

  /**
   * Whether the assignment has expired
   */
  @ApiProperty({
    description: 'Whether the role assignment has expired',
    example: false,
  })
  isExpired!: boolean;

  /**
   * When the role was revoked (if applicable)
   */
  @ApiProperty({
    description: 'Timestamp when role was revoked',
    example: '2025-11-21T15:00:00.000Z',
    format: 'date-time',
    nullable: true,
    required: false,
  })
  revokedAt?: Date;

  /**
   * Who revoked the role (if applicable)
   */
  @ApiProperty({
    description: 'User ID of the person who revoked this role',
    example: 'bb0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    nullable: true,
    required: false,
  })
  revokedBy?: UUID;

  /**
   * Reason for revocation (if applicable)
   */
  @ApiProperty({
    description: 'Reason why the role was revoked',
    example: 'Employee transferred to different department',
    nullable: true,
    required: false,
  })
  revocationReason?: string;

  /**
   * Embedded role details (optional)
   */
  @ApiProperty({
    description: 'Full role details (included when expanded)',
    type: () => RoleResponseDto,
    required: false,
  })
  role?: RoleResponseDto;

  /**
   * Maps UserRole entity to UserRoleResponseDto
   *
   * @param userRole - UserRole entity from database
   * @param includeRole - Whether to include full role details
   * @returns Mapped UserRoleResponseDto
   */
  static fromEntity(userRole: UserRole, includeRole = false): UserRoleResponseDto {
    const dto = new UserRoleResponseDto();
    dto.id = userRole.id;
    dto.userId = userRole.userId;
    dto.roleId = userRole.roleId;
    dto.organizationId = userRole.organizationId;
    dto.clinicId = userRole.clinicId;
    dto.assignedAt = userRole.assignedAt;
    dto.assignedBy = userRole.assignedBy;
    dto.expiresAt = userRole.expiresAt;
    dto.isActive = userRole.isActive();
    dto.isRevoked = userRole.isRevoked();
    dto.isExpired = userRole.isExpired();
    dto.revokedAt = userRole.revokedAt;
    dto.revokedBy = userRole.revokedBy;
    dto.revocationReason = userRole.revocationReason;

    // Include full role details if requested and available
    if (includeRole && userRole.role) {
      dto.role = RoleResponseDto.fromEntity(userRole.role);
    }

    return dto;
  }

  /**
   * Maps array of UserRole entities to UserRoleResponseDto array
   *
   * @param userRoles - Array of UserRole entities
   * @param includeRole - Whether to include full role details
   * @returns Array of UserRoleResponseDto
   */
  static fromEntities(userRoles: UserRole[], includeRole = false): UserRoleResponseDto[] {
    return userRoles.map((ur) => UserRoleResponseDto.fromEntity(ur, includeRole));
  }
}
