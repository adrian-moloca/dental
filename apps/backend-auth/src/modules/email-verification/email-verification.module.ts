/**
 * Email Verification Module
 *
 * Provides email verification functionality for user registration.
 *
 * Features:
 * - Secure token generation (32 bytes crypto random)
 * - Token hashing with SHA-256 before storage
 * - 24-hour token expiration
 * - Single-use tokens
 * - Rate-limited resend (3 per hour)
 * - Event emission for email sending
 *
 * Exports:
 * - EmailVerificationService for use in other modules
 *
 * @module modules/email-verification
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { User } from '../users/entities/user.entity';

/**
 * Email Verification Module
 *
 * Handles email verification token generation, verification, and resend.
 */
@Module({
  imports: [
    // Import User entity for token storage and verification
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService], // Export for use in AuthModule
})
export class EmailVerificationModule {}
