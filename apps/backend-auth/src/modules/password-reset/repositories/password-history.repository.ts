/**
 * Password History Repository
 *
 * Data access layer for password history operations.
 * Provides methods for storing, retrieving, and managing historical passwords.
 *
 * Security Features:
 * - All queries enforce multi-tenant isolation (organizationId)
 * - Automatic trimming to configured history limit
 * - Efficient ordering by createdAt (most recent first)
 *
 * @module modules/password-reset/repositories
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { PasswordHistory } from '../entities/password-history.entity';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * Data required to create a password history entry
 */
export interface CreatePasswordHistoryDto {
  userId: string;
  organizationId: OrganizationId;
  passwordHash: string;
  changeReason?: 'registration' | 'password_change' | 'password_reset' | 'admin_reset';
  changeIp?: string;
}

/**
 * Password History Repository
 *
 * Handles all database operations for password history tracking.
 */
@Injectable()
export class PasswordHistoryRepository {
  constructor(
    @InjectRepository(PasswordHistory)
    private readonly passwordHistoryRepo: Repository<PasswordHistory>
  ) {}

  /**
   * Create a new password history entry
   *
   * Stores a historical password hash for password reuse prevention.
   *
   * @param data - Password history data
   * @returns Created password history entity
   */
  async create(data: CreatePasswordHistoryDto): Promise<PasswordHistory> {
    const passwordHistory = this.passwordHistoryRepo.create(data);
    return this.passwordHistoryRepo.save(passwordHistory);
  }

  /**
   * Get password history for a user
   *
   * Returns password history entries ordered by most recent first.
   * Enforces multi-tenant isolation.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param limit - Maximum number of entries to return (optional)
   * @returns Array of password history entries, ordered by createdAt DESC
   */
  async findByUser(
    userId: string,
    organizationId: OrganizationId,
    limit?: number
  ): Promise<PasswordHistory[]> {
    const query = this.passwordHistoryRepo
      .createQueryBuilder('ph')
      .where('ph.user_id = :userId', { userId })
      .andWhere('ph.organization_id = :organizationId', { organizationId })
      .orderBy('ph.created_at', 'DESC');

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  /**
   * Get count of password history entries for a user
   *
   * Useful for determining how many entries need to be trimmed.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Count of password history entries
   */
  async countByUser(userId: string, organizationId: OrganizationId): Promise<number> {
    return this.passwordHistoryRepo.count({
      where: {
        userId,
        organizationId,
      },
    });
  }

  /**
   * Trim password history to a specific limit
   *
   * Keeps only the N most recent password history entries.
   * Deletes older entries to maintain the configured limit.
   *
   * Algorithm:
   * 1. Get all entries for user (ordered by most recent first)
   * 2. If count <= limit, do nothing
   * 3. If count > limit, delete entries beyond the limit
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param limit - Maximum number of entries to keep
   * @returns Number of entries deleted
   */
  async trimToLimit(
    userId: string,
    organizationId: OrganizationId,
    limit: number
  ): Promise<number> {
    // If limit is 0, delete all history
    if (limit === 0) {
      const result = await this.passwordHistoryRepo.delete({
        userId,
        organizationId,
      });
      return result.affected || 0;
    }

    // Get all entries ordered by most recent first
    const allEntries = await this.findByUser(userId, organizationId);

    // If we have fewer entries than the limit, no trimming needed
    if (allEntries.length <= limit) {
      return 0;
    }

    // Get entries to delete (everything beyond the limit)
    const entriesToDelete = allEntries.slice(limit);
    const idsToDelete = entriesToDelete.map((entry) => entry.id);

    // Delete old entries
    const result = await this.passwordHistoryRepo.delete(idsToDelete);
    return result.affected || 0;
  }

  /**
   * Delete all password history for a user
   *
   * Used when user is deleted or when resetting password history.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Number of entries deleted
   */
  async deleteByUser(userId: string, organizationId: OrganizationId): Promise<number> {
    const result = await this.passwordHistoryRepo.delete({
      userId,
      organizationId,
    });
    return result.affected || 0;
  }

  /**
   * Delete password history entries older than a specific date
   *
   * Useful for compliance and data retention policies.
   * E.g., delete password history older than 2 years.
   *
   * @param beforeDate - Delete entries created before this date
   * @returns Number of entries deleted
   */
  async deleteOlderThan(beforeDate: Date): Promise<number> {
    const result = await this.passwordHistoryRepo.delete({
      createdAt: LessThan(beforeDate),
    });
    return result.affected || 0;
  }
}
