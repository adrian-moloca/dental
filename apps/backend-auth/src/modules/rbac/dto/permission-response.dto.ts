/**
 * Permission Response DTO
 *
 * Maps Permission entity to API response format.
 * Provides comprehensive permission information for admin UIs.
 *
 * Security considerations:
 * - Exposes permission metadata for informed role configuration
 * - Includes module/resource/action breakdown for UI filtering
 * - isActive flag prevents assignment of deprecated permissions
 *
 * @module modules/rbac/dto
 */

import { ApiProperty } from '@nestjs/swagger';
import type { UUID } from '@dentalos/shared-types';
import { Permission, PermissionAction } from '../entities/permission.entity';

/**
 * Permission response DTO for API responses
 *
 * Used in:
 * - GET /rbac/permissions
 * - GET /rbac/roles/:id/permissions
 */
export class PermissionResponseDto {
  /**
   * Permission unique identifier
   */
  @ApiProperty({
    description: 'Unique permission identifier (UUID v4)',
    example: 'cc0e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id!: UUID;

  /**
   * Permission code (hierarchical)
   */
  @ApiProperty({
    description: 'Hierarchical permission code (module.resource.action)',
    example: 'scheduling.appointment.create',
    pattern: '^[a-z]+\\.[a-z]+\\.(create|read|update|delete|list|manage|export|import|execute)$',
  })
  code!: string;

  /**
   * Human-readable display name
   */
  @ApiProperty({
    description: 'Display name for UI presentation',
    example: 'Create Appointments',
  })
  displayName!: string;

  /**
   * Permission description
   */
  @ApiProperty({
    description: 'Detailed description of what this permission allows',
    example: 'Allows creating new appointment bookings in the scheduling system',
    nullable: true,
    required: false,
  })
  description?: string;

  /**
   * Module name
   */
  @ApiProperty({
    description: 'Module this permission belongs to',
    example: 'scheduling',
  })
  module!: string;

  /**
   * Resource name
   */
  @ApiProperty({
    description: 'Resource this permission controls',
    example: 'appointment',
  })
  resource!: string;

  /**
   * Action type
   */
  @ApiProperty({
    description: 'Action this permission allows',
    example: 'create',
    enum: PermissionAction,
  })
  action!: string;

  /**
   * Whether this permission is active
   */
  @ApiProperty({
    description: 'Whether this permission is active and can be assigned',
    example: true,
  })
  isActive!: boolean;

  /**
   * Creation timestamp
   */
  @ApiProperty({
    description: 'When the permission was created',
    example: '2025-11-20T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  /**
   * Maps Permission entity to PermissionResponseDto
   *
   * @param permission - Permission entity from database
   * @returns Mapped PermissionResponseDto
   */
  static fromEntity(permission: Permission): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.id = permission.id;
    dto.code = permission.code;
    dto.displayName = permission.displayName;
    dto.description = permission.description;
    dto.module = permission.module;
    dto.resource = permission.resource;
    dto.action = permission.action;
    dto.isActive = permission.isActive;
    dto.createdAt = permission.createdAt;

    return dto;
  }

  /**
   * Maps array of Permission entities to PermissionResponseDto array
   *
   * @param permissions - Array of Permission entities
   * @returns Array of PermissionResponseDto
   */
  static fromEntities(permissions: Permission[]): PermissionResponseDto[] {
    return permissions.map((p) => PermissionResponseDto.fromEntity(p));
  }
}
