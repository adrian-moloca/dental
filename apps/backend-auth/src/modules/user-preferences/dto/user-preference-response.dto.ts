/**
 * User Preference Response DTO
 *
 * Response format for user preference endpoints.
 * Transforms entity to API response format.
 *
 * @module modules/user-preferences/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserPreference,
  DashboardSection,
  ThemePreferences,
} from '../entities/user-preference.entity';

/**
 * User preference response DTO
 *
 * Returned by GET /users/me/preferences and PATCH /users/me/preferences
 */
export class UserPreferenceResponseDto {
  /**
   * Preference record ID
   */
  @ApiProperty({
    description: 'Preference record ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  /**
   * User ID
   */
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string;

  /**
   * Organization ID
   */
  @ApiProperty({
    description: 'Organization ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  organizationId!: string;

  /**
   * Dashboard layout configuration
   */
  @ApiProperty({
    description: 'Dashboard layout configuration',
    type: 'array',
    example: [
      {
        id: 'appointments-calendar',
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        visible: true,
      },
    ],
  })
  dashboardLayout!: DashboardSection[];

  /**
   * Theme preferences (optional)
   */
  @ApiPropertyOptional({
    description: 'Theme preferences',
    type: 'object',
    example: {
      mode: 'light',
      primaryColor: '#1976d2',
      fontSize: 'medium',
      highContrast: false,
    },
  })
  themePreferences?: ThemePreferences | null;

  /**
   * Created timestamp
   */
  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-11-28T10:00:00.000Z',
  })
  createdAt!: Date;

  /**
   * Updated timestamp
   */
  @ApiProperty({
    description: 'Updated timestamp',
    example: '2024-11-28T10:00:00.000Z',
  })
  updatedAt!: Date;

  /**
   * Create DTO from entity
   *
   * @param entity - UserPreference entity
   * @returns UserPreferenceResponseDto
   */
  static fromEntity(entity: UserPreference): UserPreferenceResponseDto {
    const dto = new UserPreferenceResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.organizationId = entity.organizationId;
    dto.dashboardLayout = entity.dashboardLayout;
    dto.themePreferences = entity.themePreferences;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
