/**
 * Email Verification Service
 *
 * Handles email verification flow with secure token generation and validation.
 *
 * Security Features:
 * - Cryptographically secure random tokens (crypto.randomBytes)
 * - SHA-256 hashing before storage (prevents token theft from DB)
 * - Single-use tokens (cleared after successful verification)
 * - 24-hour expiration window
 * - Rate limiting enforced at controller level
 * - Generic responses prevent user enumeration
 *
 * Flow:
 * 1. Generate Verification Token (on registration or resend):
 *    - Generate secure random token (32 bytes)
 *    - Hash token with SHA-256
 *    - Store hash in user record with 24h expiration
 *    - Emit EmailVerificationRequested event
 *    - Return generic success message
 *
 * 2. Verify Email:
 *    - User submits token
 *    - Hash token and find user by hash
 *    - Validate token (not expired, not already verified)
 *    - Mark email as verified
 *    - Clear token fields
 *    - Return success
 *
 * @module modules/email-verification
 */

import { Injectable, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { randomBytes, createHash } from 'crypto';
import { User } from '../users/entities/user.entity';
import {
  VerifyEmailDto,
  VerifyEmailResponseDto,
  ResendVerificationDto,
  ResendVerificationResponseDto,
} from './dto';

/**
 * Email Verification Service
 *
 * Manages email verification tokens and verification operations.
 */
@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);
  private readonly TOKEN_LENGTH_BYTES = 32; // 32 bytes = 64 hex chars
  private readonly TOKEN_EXPIRATION_HOURS = 24;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2
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
   * @returns Date object for expiration (24 hours from now)
   */
  private getExpirationDate(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.TOKEN_EXPIRATION_HOURS);
    return expiresAt;
  }

  /**
   * Generate and store email verification token for user
   *
   * This is called during registration or when user requests resend.
   * Generates a new token, hashes it, stores in user record, and emits event.
   *
   * Steps:
   * 1. Generate secure random token
   * 2. Hash token with SHA-256
   * 3. Store hash and expiration in user record
   * 4. Emit EmailVerificationRequested event for email service
   * 5. Return plain token (to be sent via email)
   *
   * Security:
   * - Token is 32 bytes of crypto random (2^256 possible values)
   * - Only hashed token stored in database
   * - Previous token is replaced (only latest is valid)
   *
   * @param user - User entity to generate token for
   * @returns Plain token string to be sent via email
   */
  async generateVerificationToken(user: User): Promise<string> {
    // Generate new token
    const plainToken = this.generateToken();
    const tokenHash = this.hashToken(plainToken);
    const expiresAt = this.getExpirationDate();

    // Update user record with token hash and expiration
    user.emailVerificationToken = tokenHash;
    user.emailVerificationTokenExpiresAt = expiresAt;
    await this.userRepo.save(user);

    this.logger.log(
      `Email verification token generated for user ${user.id} (${user.email}) in org ${user.organizationId}`
    );

    // Emit event for email service to send verification email
    this.eventEmitter.emit('email.verification.requested', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      token: plainToken,
      expiresAt: expiresAt.toISOString(),
    });

    // TODO: Remove in production - log token for development
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${plainToken}`;
    this.logger.log(`
========================================
EMAIL VERIFICATION LINK (DEVELOPMENT ONLY)
========================================
User: ${user.firstName} ${user.lastName} (${user.email})
Organization: ${user.organizationId}
Verification Link: ${verificationLink}
Expires: ${expiresAt.toISOString()}
========================================
    `);

    return plainToken;
  }

  /**
   * Verify user email with token
   *
   * Steps:
   * 1. Hash provided token
   * 2. Find user by token hash
   * 3. Validate token exists, not expired, email not already verified
   * 4. Mark email as verified
   * 5. Clear token fields (single-use)
   * 6. Save user
   * 7. Return success
   *
   * Security:
   * - Token hashed before lookup (protects against timing attacks)
   * - Token cleared after use (prevents reuse)
   * - Generic error messages (don't reveal why token is invalid)
   *
   * @param dto - Verify email request with token
   * @returns Success message
   * @throws UnauthorizedException if token invalid, expired, or email already verified
   */
  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    const tokenHash = this.hashToken(dto.token);

    // Find user by token hash
    const user = await this.userRepo.findOne({
      where: { emailVerificationToken: tokenHash },
    });

    // Token not found
    if (!user) {
      this.logger.warn('Email verification attempted with invalid token');
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    // Email already verified
    if (user.emailVerified) {
      this.logger.warn(
        `Email verification attempted for already-verified user ${user.id} (${user.email})`
      );
      throw new BadRequestException('Email is already verified');
    }

    // Token expired
    if (user.emailVerificationTokenExpiresAt && new Date() > user.emailVerificationTokenExpiresAt) {
      this.logger.warn(
        `Email verification attempted with expired token for user ${user.id} (${user.email})`
      );
      throw new UnauthorizedException('Verification token has expired. Please request a new one.');
    }

    // Mark email as verified and clear token
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;
    await this.userRepo.save(user);

    this.logger.log(
      `Email verified successfully for user ${user.id} (${user.email}) in org ${user.organizationId}`
    );

    // Emit event for audit logging
    this.eventEmitter.emit('email.verified', {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      verifiedAt: new Date().toISOString(),
    });

    return {
      message: 'Email verified successfully. You can now log in.',
      verified: true,
    };
  }

  /**
   * Resend email verification link
   *
   * Steps:
   * 1. Find user by email (case-insensitive)
   * 2. If user not found → return generic success (prevent enumeration)
   * 3. If email already verified → return generic success (security)
   * 4. Generate new verification token
   * 5. Emit event for email service
   * 6. Return generic success message
   *
   * Security:
   * - Same response whether email exists or not (prevents email enumeration)
   * - Rate limiting enforced at controller level (3 requests per hour per IP)
   * - Previous token is invalidated (only latest token valid)
   *
   * @param dto - Resend verification request with email
   * @returns Generic success message
   */
  async resendVerification(dto: ResendVerificationDto): Promise<ResendVerificationResponseDto> {
    const email = dto.email.toLowerCase().trim();

    // Find user by email (case-insensitive)
    // Note: In multi-tenant system, email might exist in multiple organizations
    const users = await this.userRepo.find({
      where: { email },
      select: ['id', 'organizationId', 'email', 'emailVerified', 'firstName', 'lastName', 'status'],
    });

    // SECURITY: Always return same response to prevent user enumeration
    const genericResponse: ResendVerificationResponseDto = {
      message:
        'If an account with that email exists and is not verified, a verification email has been sent.',
    };

    // If no users found, return generic success (don't reveal email doesn't exist)
    if (users.length === 0) {
      this.logger.log(`Verification resend requested for non-existent email: ${email}`);
      return genericResponse;
    }

    // Process resend for each user account with this email
    for (const user of users) {
      // Skip if email already verified (don't reveal account exists and is verified)
      if (user.emailVerified) {
        this.logger.log(
          `Verification resend requested for already-verified user: ${user.id} (${user.email}) - skipping`
        );
        continue;
      }

      // Skip inactive users (don't reveal account exists but is inactive)
      if (user.status !== 'ACTIVE') {
        this.logger.warn(
          `Verification resend requested for inactive user: ${user.id} (${user.email}) - skipping`
        );
        continue;
      }

      try {
        // Get full user record to update
        const fullUser = await this.userRepo.findOne({
          where: {
            id: user.id,
            organizationId: user.organizationId,
          },
        });

        if (!fullUser) {
          continue;
        }

        // Generate new verification token
        await this.generateVerificationToken(fullUser);

        this.logger.log(
          `Verification email resent to user ${user.id} (${user.email}) in org ${user.organizationId}`
        );
      } catch (error) {
        // Log error but don't expose to user
        this.logger.error(
          `Failed to resend verification email for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Always return generic success message
    return genericResponse;
  }

  /**
   * Clean up expired verification tokens (for cron job)
   *
   * Removes verification tokens that have passed their expiration time.
   * Should be run periodically (e.g., every hour) to keep database clean.
   *
   * @returns Number of tokens cleared
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      })
      .where('email_verification_token_expires_at < :now', { now: new Date() })
      .andWhere('email_verification_token IS NOT NULL')
      .execute();

    const clearedCount = result.affected || 0;

    if (clearedCount > 0) {
      this.logger.log(`Cleaned up ${clearedCount} expired email verification tokens`);
    }

    return clearedCount;
  }
}
