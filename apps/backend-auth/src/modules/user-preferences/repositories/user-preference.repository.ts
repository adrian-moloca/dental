/**
 * User Preference Repository
 *
 * Data access layer for user preferences with multi-tenant isolation.
 * All queries enforce tenant scoping via organizationId.
 *
 * Security requirements:
 * - All queries MUST filter by organizationId
 * - Unique preference per user per organization
 *
 * Edge cases handled:
 * - Not found scenarios return null
 * - Upsert operation for create-or-update pattern
 *
 * @module modules/user-preferences/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference } from '../entities/user-preference.entity';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * User preference repository
 *
 * Provides data access methods with strict tenant isolation.
 * All methods enforce organizationId filtering for security.
 */
@Injectable()
export class UserPreferenceRepository {
  constructor(
    @InjectRepository(UserPreference)
    private readonly repository: Repository<UserPreference>
  ) {}

  /**
   * Find user preference by userId and organizationId
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID (for tenant isolation)
   * @returns UserPreference or null if not found
   */
  async findByUserId(
    userId: string,
    organizationId: OrganizationId
  ): Promise<UserPreference | null> {
    return this.repository.findOne({
      where: {
        userId,
        organizationId,
      },
    });
  }

  /**
   * Create new user preference record
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @param data - Preference data
   * @returns Created UserPreference
   */
  async create(
    userId: string,
    organizationId: OrganizationId,
    data: Partial<UserPreference>
  ): Promise<UserPreference> {
    const preference = this.repository.create({
      userId,
      organizationId,
      ...data,
    });

    return this.repository.save(preference);
  }

  /**
   * Update existing user preference
   *
   * @param id - Preference record ID
   * @param organizationId - Organization UUID (for tenant isolation)
   * @param data - Updated preference data
   * @returns Updated UserPreference or null if not found
   */
  async update(
    id: string,
    organizationId: OrganizationId,
    data: Partial<UserPreference>
  ): Promise<UserPreference | null> {
    // Verify preference exists and belongs to organization
    const existing = await this.repository.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return null;
    }

    // Merge updates
    Object.assign(existing, data);

    return this.repository.save(existing);
  }

  /**
   * Upsert user preference (create if not exists, update if exists)
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @param data - Preference data
   * @returns UserPreference (created or updated)
   */
  async upsert(
    userId: string,
    organizationId: OrganizationId,
    data: Partial<UserPreference>
  ): Promise<UserPreference> {
    // Try to find existing preference
    const existing = await this.findByUserId(userId, organizationId);

    if (existing) {
      // Update existing
      Object.assign(existing, data);
      return this.repository.save(existing);
    } else {
      // Create new
      return this.create(userId, organizationId, data);
    }
  }

  /**
   * Delete user preference
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID (for tenant isolation)
   * @returns True if deleted, false if not found
   */
  async delete(userId: string, organizationId: OrganizationId): Promise<boolean> {
    const result = await this.repository.delete({
      userId,
      organizationId,
    });

    return (result.affected ?? 0) > 0;
  }
}
