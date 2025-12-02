/**
 * User Preferences Controller
 *
 * REST API endpoints for user preference management.
 * All endpoints require JWT authentication.
 *
 * Security requirements:
 * - JWT authentication required (extracts userId from token)
 * - Users can only access/modify their own preferences
 * - Multi-tenant context from JWT token
 *
 * Endpoints:
 * - GET /users/me/preferences - Get current user's preferences
 * - PATCH /users/me/preferences - Update current user's preferences
 *
 * @module modules/user-preferences/controllers
 */

import { Controller, Get, Patch, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { OrganizationId } from '@dentalos/shared-types';

// Services
import { UserPreferencesService } from '../services/user-preferences.service';

// DTOs
import { UpdatePreferencesDto, UserPreferenceResponseDto } from '../dto';

// Decorators
import { CurrentUser, UserContext } from '../../rbac/decorators/current-user.decorator';

/**
 * User Preferences Controller
 *
 * Provides REST API endpoints for managing user preferences.
 * All routes require authentication and operate on current user's data.
 */
@Controller('users/me/preferences')
@ApiTags('User Preferences')
@ApiBearerAuth()
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  /**
   * Get current user's preferences
   *
   * Retrieves preferences for the authenticated user.
   * Auto-creates default preferences if none exist.
   *
   * @param user - Authenticated user context from JWT
   * @returns User preferences
   */
  @Get()
  @Throttle({ default: { limit: 200, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get user preferences',
    description: 'Retrieve preferences for the current user. Auto-creates defaults if none exist.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    type: UserPreferenceResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPreferences(@CurrentUser() user: UserContext): Promise<UserPreferenceResponseDto> {
    const preferences = await this.userPreferencesService.getPreferences(
      user.userId,
      user.organizationId as OrganizationId
    );

    return UserPreferenceResponseDto.fromEntity(preferences);
  }

  /**
   * Update current user's preferences
   *
   * Updates preferences for the authenticated user.
   * Uses upsert pattern - creates if not exists, updates if exists.
   *
   * @param user - Authenticated user context from JWT
   * @param dto - Preference update data
   * @returns Updated preferences
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Update preferences for the current user. Creates if not exists (upsert).',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: UserPreferenceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Authentication required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(
    @CurrentUser() user: UserContext,
    @Body() dto: UpdatePreferencesDto
  ): Promise<UserPreferenceResponseDto> {
    const preferences = await this.userPreferencesService.updatePreferences(
      user.userId,
      user.organizationId as OrganizationId,
      dto
    );

    return UserPreferenceResponseDto.fromEntity(preferences);
  }
}
