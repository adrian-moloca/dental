/**
 * Password History Service
 *
 * Manages password history for preventing password reuse.
 * Validates new passwords against historical passwords and stores password history.
 *
 * Security Features:
 * - Validates new password against last N passwords (configurable)
 * - Uses Argon2id for password comparison (same as user passwords)
 * - Automatically trims history to configured limit
 * - Multi-tenant isolation enforced
 *
 * Flow:
 * 1. Password Change Request:
 *    - Check if new password matches any of last N passwords
 *    - If match found → reject with error
 *    - If no match → allow change
 *
 * 2. Password Change Success:
 *    - Store old password hash in history
 *    - Trim history to configured limit
 *
 * 3. Registration:
 *    - Store initial password in history
 *
 * @module modules/password-reset/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordHistoryRepository } from '../repositories/password-history.repository';
import { PasswordService } from '../../users/services/password.service';
import type { OrganizationId } from '@dentalos/shared-types';
import type { AppConfig } from '../../../configuration';

/**
 * Result of password history validation
 */
export interface PasswordHistoryValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Password History Service
 *
 * Handles password history validation and storage operations.
 */
@Injectable()
export class PasswordHistoryService {
  private readonly logger = new Logger(PasswordHistoryService.name);
  private readonly historyCount: number;

  constructor(
    private readonly passwordHistoryRepo: PasswordHistoryRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService<AppConfig>
  ) {
    // Load password history count from configuration
    this.historyCount = this.configService.get('security.passwordHistoryCount', { infer: true })!;
    this.logger.log(`Password history tracking initialized with limit: ${this.historyCount}`);
  }

  /**
   * Validate new password against password history
   *
   * Checks if the new password matches any of the user's last N passwords.
   * Returns validation result with appropriate error message if password is reused.
   *
   * Algorithm:
   * 1. If history count is 0, skip validation (feature disabled)
   * 2. Get last N password hashes for user
   * 3. Compare new password against each historical hash using Argon2id
   * 4. If any match found, return invalid with error message
   * 5. If no matches, return valid
   *
   * Security:
   * - Uses constant-time Argon2id verification (prevents timing attacks)
   * - Generic error message (doesn't reveal which historical password matched)
   * - Enforces multi-tenant isolation
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param newPassword - New password to validate (plain text)
   * @returns Validation result with isValid and optional error message
   */
  async validatePasswordHistory(
    userId: string,
    organizationId: OrganizationId,
    newPassword: string
  ): Promise<PasswordHistoryValidationResult> {
    // If history count is 0, password history is disabled
    if (this.historyCount === 0) {
      return { isValid: true };
    }

    try {
      // Get last N password hashes for user
      const passwordHistory = await this.passwordHistoryRepo.findByUser(
        userId,
        organizationId,
        this.historyCount
      );

      // If no history, validation passes
      if (passwordHistory.length === 0) {
        return { isValid: true };
      }

      // Check new password against each historical password
      for (const historicalEntry of passwordHistory) {
        const matches = await this.passwordService.verifyPassword(
          newPassword,
          historicalEntry.passwordHash
        );

        if (matches) {
          // Password matches a historical password - reject
          this.logger.warn(
            `Password reuse detected for user ${userId} in organization ${organizationId}`
          );

          return {
            isValid: false,
            message: `You cannot reuse any of your last ${this.historyCount} passwords. Please choose a different password.`,
          };
        }
      }

      // No matches found - password is valid
      return { isValid: true };
    } catch (error) {
      // Log error but don't fail validation (fail open for better UX)
      this.logger.error(
        `Error validating password history for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      // Allow password change even if validation fails
      // This prevents password history feature from blocking legitimate password changes
      return { isValid: true };
    }
  }

  /**
   * Add password to history
   *
   * Stores a password hash in history after successful password change.
   * Automatically trims history to configured limit.
   *
   * Flow:
   * 1. Create new password history entry
   * 2. Trim history to configured limit (keeps most recent N entries)
   * 3. Log success
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param passwordHash - Password hash to store (already hashed with Argon2id)
   * @param changeReason - Reason for password change
   * @param changeIp - Optional IP address of password change
   */
  async addPasswordToHistory(
    userId: string,
    organizationId: OrganizationId,
    passwordHash: string,
    changeReason: 'registration' | 'password_change' | 'password_reset' | 'admin_reset',
    changeIp?: string
  ): Promise<void> {
    // If history count is 0, password history is disabled
    if (this.historyCount === 0) {
      return;
    }

    try {
      // Create password history entry
      await this.passwordHistoryRepo.create({
        userId,
        organizationId,
        passwordHash,
        changeReason,
        changeIp,
      });

      this.logger.log(
        `Password history entry created for user ${userId} (reason: ${changeReason})`
      );

      // Trim history to configured limit
      const deletedCount = await this.passwordHistoryRepo.trimToLimit(
        userId,
        organizationId,
        this.historyCount
      );

      if (deletedCount > 0) {
        this.logger.log(
          `Trimmed ${deletedCount} old password history entries for user ${userId}`
        );
      }
    } catch (error) {
      // Log error but don't throw - password history is a secondary feature
      // The password change itself should succeed even if history storage fails
      this.logger.error(
        `Failed to add password to history for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get password history count for a user
   *
   * Useful for debugging or admin dashboards.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Number of password history entries
   */
  async getHistoryCount(userId: string, organizationId: OrganizationId): Promise<number> {
    return this.passwordHistoryRepo.countByUser(userId, organizationId);
  }

  /**
   * Clear password history for a user
   *
   * Useful for admin operations or compliance requirements.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Number of entries deleted
   */
  async clearUserHistory(userId: string, organizationId: OrganizationId): Promise<number> {
    const deletedCount = await this.passwordHistoryRepo.deleteByUser(userId, organizationId);

    this.logger.log(`Cleared ${deletedCount} password history entries for user ${userId}`);

    return deletedCount;
  }

  /**
   * Get configured password history limit
   *
   * @returns Number of passwords to track in history
   */
  getHistoryLimit(): number {
    return this.historyCount;
  }
}
