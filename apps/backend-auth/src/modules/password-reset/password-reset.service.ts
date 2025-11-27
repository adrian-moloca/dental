/**
 * Password Reset Service
 *
 * Handles password reset flow with secure token generation and validation.
 *
 * Security Features:
 * - Cryptographically secure random tokens (crypto.randomBytes)
 * - SHA-256 hashing before storage (prevents token theft from DB)
 * - One-time use tokens (deleted after successful reset)
 * - 1-hour expiration window
 * - All user sessions invalidated on password change
 * - Rate limiting enforced at controller level
 * - Generic responses prevent user enumeration
 *
 * Flow:
 * 1. Forgot Password:
 *    - User submits email
 *    - Find user (if exists)
 *    - Generate secure token
 *    - Hash token and store with expiration
 *    - Send email with reset link (stubbed for now)
 *    - Return generic success message (same response whether user exists or not)
 *
 * 2. Reset Password:
 *    - User submits token + new password
 *    - Hash token and find in database
 *    - Validate token (not expired, not used)
 *    - Validate password strength
 *    - Update user password (hash with Argon2id)
 *    - Invalidate all user sessions
 *    - Delete used token
 *    - Return success
 *
 * @module modules/password-reset
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHash } from 'crypto';
import type { UUID } from '@dentalos/shared-types';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { User } from '../users/entities/user.entity';
import { PasswordService } from '../users/services/password.service';
import { SessionService } from '../sessions/services/session.service';
import { PasswordHistoryService } from './services/password-history.service';
import { ForgotPasswordDto, ResetPasswordDto } from './dto';

/**
 * Password Reset Service
 *
 * Manages secure password reset tokens and password change operations.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly TOKEN_LENGTH_BYTES = 32; // 32 bytes = 64 hex chars
  private readonly TOKEN_EXPIRATION_HOURS = 1;

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepo: Repository<PasswordResetToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly passwordHistoryService: PasswordHistoryService
  ) {}

  /**
   * Generate cryptographically secure random token
   *
   * Uses Node.js crypto.randomBytes for CSPRNG (Cryptographically Secure PRNG).
   * Token format: 32 bytes → 64 hex characters
   *
   * @returns Plain token string (64 hex chars)
   *
   * @example
   * "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
   */
  private generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH_BYTES).toString('hex');
  }

  /**
   * Hash token using SHA-256
   *
   * Tokens are hashed before storage to prevent token theft if database is compromised.
   * Same principle as password hashing, but using SHA-256 (fast) instead of Argon2 (slow)
   * because tokens are already high-entropy random values.
   *
   * @param token - Plain token string
   * @returns SHA-256 hash of token (64 hex chars)
   */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Calculate token expiration time
   *
   * @returns Date object for expiration (1 hour from now)
   */
  private getExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRATION_HOURS);
    return expiresAt;
  }

  /**
   * Initiate password reset flow
   *
   * Steps:
   * 1. Find user by email (case-insensitive) across all organizations
   * 2. If user not found → return generic success (prevent enumeration)
   * 3. If user inactive → return generic success (security)
   * 4. Invalidate any existing reset tokens for this user
   * 5. Generate new secure token
   * 6. Hash token and store with expiration
   * 7. Log reset request for audit
   * 8. TODO: Send email with reset link (stubbed for now)
   * 9. Return generic success message
   *
   * Security:
   * - Same response whether user exists or not (prevents email enumeration)
   * - Rate limiting enforced at controller level (3 requests per 5 minutes per IP)
   * - Token is 32 bytes of crypto random (2^256 possible values)
   * - Only latest token is valid (previous tokens invalidated)
   *
   * @param dto - Forgot password request with email
   * @param requestIp - IP address of requester (for logging)
   * @param userAgent - User agent string (for logging)
   * @returns Generic success message
   */
  async forgotPassword(
    dto: ForgotPasswordDto,
    requestIp?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const email = dto.email.toLowerCase().trim();

    // Find user by email (case-insensitive)
    // Note: In multi-tenant system, email might exist in multiple organizations
    // We'll send reset link for all matching accounts
    const users = await this.userRepo.find({
      where: { email },
      select: ['id', 'organizationId', 'email', 'status', 'firstName', 'lastName'],
    });

    // SECURITY: Always return same response to prevent user enumeration
    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };

    // If no users found, return generic success (don't reveal email doesn't exist)
    if (users.length === 0) {
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return genericResponse;
    }

    // Process reset for each user account with this email
    for (const user of users) {
      // Skip inactive users (don't reveal account exists but is inactive)
      if (user.status !== 'ACTIVE') {
        this.logger.warn(
          `Password reset requested for inactive user: ${user.id} (${user.email}) - skipping`
        );
        continue;
      }

      try {
        // Invalidate any existing reset tokens for this user
        await this.passwordResetTokenRepo.delete({
          userId: user.id,
          organizationId: user.organizationId,
        });

        // Generate new token
        const plainToken = this.generateToken();
        const tokenHash = this.hashToken(plainToken);
        const expiresAt = this.getExpirationDate();

        // Store hashed token
        const resetToken = this.passwordResetTokenRepo.create({
          organizationId: user.organizationId,
          userId: user.id,
          tokenHash,
          expiresAt,
          requestIp,
          requestUserAgent: userAgent,
        });

        await this.passwordResetTokenRepo.save(resetToken);

        // Log successful token creation
        this.logger.log(
          `Password reset token created for user ${user.id} (${user.email}) in org ${user.organizationId}`
        );

        // TODO: Send email with reset link
        // For now, log the token to console (REMOVE IN PRODUCTION)
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${plainToken}`;
        this.logger.log(`
========================================
PASSWORD RESET LINK (DEVELOPMENT ONLY)
========================================
User: ${user.firstName} ${user.lastName} (${user.email})
Organization: ${user.organizationId}
Reset Link: ${resetLink}
Expires: ${expiresAt.toISOString()}
========================================
        `);

        // TODO: Replace with actual email service
        // await this.emailService.sendPasswordReset({
        //   to: user.email,
        //   firstName: user.firstName,
        //   resetLink,
        //   expiresAt,
        // });
      } catch (error) {
        // Log error but don't expose to user
        this.logger.error(
          `Failed to create password reset token for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Always return generic success message
    return genericResponse;
  }

  /**
   * Complete password reset with new password
   *
   * Steps:
   * 1. Hash provided token
   * 2. Find token in database by hash
   * 3. Validate token exists, not expired, not used
   * 4. Validate new password strength
   * 5. Hash new password with Argon2id
   * 6. Update user password
   * 7. Invalidate all user sessions (force re-login)
   * 8. Mark token as used
   * 9. Delete token from database
   * 10. Log successful reset
   * 11. Return success
   *
   * Security:
   * - Token hashed before lookup (protects against timing attacks)
   * - All sessions invalidated (prevents session hijacking after password change)
   * - Token deleted after use (prevents reuse)
   * - Generic error messages (don't reveal why token is invalid)
   *
   * @param dto - Reset password request with token and new password
   * @returns Success message
   * @throws UnauthorizedException if token invalid, expired, or used
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.hashToken(dto.token);

    // Find token by hash
    const resetToken = await this.passwordResetTokenRepo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    // Token not found
    if (!resetToken) {
      this.logger.warn('Password reset attempted with invalid token');
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Token expired
    if (resetToken.isExpired()) {
      this.logger.warn(`Password reset attempted with expired token for user ${resetToken.userId}`);
      // Clean up expired token
      await this.passwordResetTokenRepo.delete({ id: resetToken.id });
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Token already used
    if (resetToken.used) {
      this.logger.warn(
        `Password reset attempted with already-used token for user ${resetToken.userId}`
      );
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Get user
    const user = await this.userRepo.findOne({
      where: {
        id: resetToken.userId,
        organizationId: resetToken.organizationId,
      },
    });

    if (!user) {
      this.logger.error(
        `User not found for valid reset token: ${resetToken.userId} in org ${resetToken.organizationId}`
      );
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Validate password strength (additional validation beyond DTO)
    const passwordValidation = this.passwordService.validatePasswordStrength(dto.newPassword);
    if (!passwordValidation.isValid) {
      throw new UnauthorizedException(`Weak password: ${passwordValidation.errors.join(', ')}`);
    }

    // Validate against password history
    const historyValidation = await this.passwordHistoryService.validatePasswordHistory(
      user.id,
      user.organizationId,
      dto.newPassword
    );
    if (!historyValidation.isValid) {
      this.logger.warn(
        `Password reset rejected due to password reuse for user ${user.id} in org ${user.organizationId}`
      );
      throw new UnauthorizedException(
        historyValidation.message || 'Password has been used recently'
      );
    }

    // Store old password hash in history before changing password
    await this.passwordHistoryService.addPasswordToHistory(
      user.id,
      user.organizationId,
      user.passwordHash,
      'password_reset',
      resetToken.requestIp || undefined
    );

    // Hash new password
    const passwordHash = await this.passwordService.hashPassword(dto.newPassword);

    // Update user password
    user.passwordHash = passwordHash;
    await this.userRepo.save(user);

    // Invalidate all user sessions (force re-login everywhere)
    try {
      await this.sessionService.invalidateAllUserSessions(user.id as UUID, user.organizationId);
      this.logger.log(`Invalidated all sessions for user ${user.id} after password reset`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate sessions for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      // Continue even if session invalidation fails
    }

    // Mark token as used and delete it
    resetToken.used = true;
    resetToken.usedAt = new Date();
    await this.passwordResetTokenRepo.save(resetToken);
    await this.passwordResetTokenRepo.delete({ id: resetToken.id });

    this.logger.log(
      `Password reset completed successfully for user ${user.id} (${user.email}) in org ${user.organizationId}`
    );

    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Clean up expired tokens (for cron job)
   *
   * Removes all tokens that have passed their expiration time.
   * Should be run periodically (e.g., every hour) to keep database clean.
   *
   * @returns Number of tokens deleted
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.passwordResetTokenRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now: new Date() })
      .execute();

    const deletedCount = result.affected || 0;

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} expired password reset tokens`);
    }

    return deletedCount;
  }
}
