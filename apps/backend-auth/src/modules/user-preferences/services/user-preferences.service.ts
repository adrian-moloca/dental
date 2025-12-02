/**
 * User Preferences Service
 *
 * Business logic for user preference management.
 * Handles preference retrieval, creation, and updates with upsert pattern.
 *
 * Security requirements:
 * - All operations enforce multi-tenant isolation
 * - Only user can access/modify their own preferences
 *
 * Edge cases handled:
 * - First access creates default preferences
 * - Upsert pattern ensures preferences always exist
 * - Validates user exists before creating preferences
 *
 * @module modules/user-preferences/services
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferenceRepository } from '../repositories/user-preference.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { UserPreference } from '../entities/user-preference.entity';
import { UpdatePreferencesDto } from '../dto';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * User preferences service
 *
 * Provides business logic for user preference operations.
 * Implements upsert pattern for seamless first-time access.
 */
@Injectable()
export class UserPreferencesService {
  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
    private readonly userRepository: UserRepository
  ) {}

  /**
   * Get user preferences by userId
   *
   * If preferences don't exist, creates default preferences.
   * Implements auto-create pattern for better UX.
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID (for tenant isolation)
   * @returns UserPreference
   * @throws NotFoundException if user doesn't exist
   */
  async getPreferences(userId: string, organizationId: OrganizationId): Promise<UserPreference> {
    // Verify user exists in this organization
    const user = await this.userRepository.findById(userId, organizationId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Try to get existing preferences
    let preferences = await this.userPreferenceRepository.findByUserId(userId, organizationId);

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await this.userPreferenceRepository.create(userId, organizationId, {
        dashboardLayout: this.getDefaultDashboardLayout(),
        themePreferences: null,
      });
    }

    return preferences;
  }

  /**
   * Update user preferences (upsert pattern)
   *
   * Creates preferences if they don't exist, updates if they do.
   * Ensures user always has preferences after this operation.
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID (for tenant isolation)
   * @param dto - Preference update data
   * @returns Updated UserPreference
   * @throws NotFoundException if user doesn't exist
   */
  async updatePreferences(
    userId: string,
    organizationId: OrganizationId,
    dto: UpdatePreferencesDto
  ): Promise<UserPreference> {
    // Verify user exists in this organization
    const user = await this.userRepository.findById(userId, organizationId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Prepare update data
    const updateData: Partial<UserPreference> = {};

    if (dto.dashboardLayout !== undefined) {
      updateData.dashboardLayout = dto.dashboardLayout;
    }

    if (dto.themePreferences !== undefined) {
      updateData.themePreferences = dto.themePreferences;
    }

    // Upsert preferences
    const preferences = await this.userPreferenceRepository.upsert(
      userId,
      organizationId,
      updateData
    );

    return preferences;
  }

  /**
   * Get default dashboard layout
   *
   * Returns sensible defaults for first-time users.
   *
   * @returns Default dashboard section configuration
   */
  private getDefaultDashboardLayout() {
    return [
      {
        id: 'appointments-calendar',
        x: 0,
        y: 0,
        w: 8,
        h: 4,
        visible: true,
      },
      {
        id: 'recent-patients',
        x: 8,
        y: 0,
        w: 4,
        h: 4,
        visible: true,
      },
      {
        id: 'daily-statistics',
        x: 0,
        y: 4,
        w: 6,
        h: 3,
        visible: true,
      },
      {
        id: 'pending-tasks',
        x: 6,
        y: 4,
        w: 6,
        h: 3,
        visible: true,
      },
    ];
  }
}
