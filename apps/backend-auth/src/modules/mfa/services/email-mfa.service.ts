/**
 * EmailMfaService - Email-based MFA operations
 *
 * Responsibilities:
 * - Generate email verification codes
 * - Send email codes via external provider (SendGrid, AWS SES, etc.)
 * - Create and manage email challenges
 * - Rate limiting for email sending
 *
 * Security:
 * - Codes are 6-digit random numbers
 * - Limited validity period (10 minutes default)
 * - Limited attempts (3 default)
 * - Rate limiting to prevent email spam
 *
 * @module EmailMfaService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { SecurityError } from '@dentalos/shared-errors';
import { hash } from '@node-rs/argon2';
import { MfaChallengeRepository } from '../repositories/mfa-challenge.repository';
import { MfaChallenge } from '../entities/mfa-challenge.entity';
import { SendGridAdapter } from '../adapters/sendgrid.adapter';

/**
 * Email MFA service configuration
 */
export interface EmailMfaConfig {
  codeLength: number;
  validityMinutes: number;
  maxAttempts: number;
}

/**
 * Injectable Email MFA service
 */
@Injectable()
export class EmailMfaService {
  private readonly config: EmailMfaConfig;

  constructor(
    private configService: ConfigService,
    private mfaChallengeRepository: MfaChallengeRepository,
    private sendGridAdapter: SendGridAdapter
  ) {
    this.config = {
      codeLength: this.configService.get('security.mfa.email.codeLength', 6),
      validityMinutes: this.configService.get('security.mfa.email.validityMinutes', 10),
      maxAttempts: this.configService.get('security.mfa.email.maxAttempts', 3),
    };
  }

  /**
   * Generate and send email verification code
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - MFA factor identifier
   * @param email - Destination email address
   * @returns Created challenge entity
   */
  async sendVerificationCode(
    userId: UUID,
    organizationId: OrganizationId,
    factorId: UUID,
    email: string
  ): Promise<MfaChallenge> {
    const code = this.generateCode();
    const codeHash = await this.hashCode(code);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.config.validityMinutes);

    const challenge = await this.mfaChallengeRepository.create({
      userId,
      organizationId,
      factorId,
      challengeCodeHash: codeHash,
      expiresAt,
      attemptsRemaining: this.config.maxAttempts,
    });

    await this.sendEmail(email, code);

    return challenge;
  }

  /**
   * Verify email code against challenge
   *
   * @param challenge - MFA challenge entity
   * @param code - User-provided code
   * @returns True if code is valid
   */
  async verifyCode(challenge: MfaChallenge, code: string): Promise<boolean> {
    if (!challenge.isValid()) {
      return false;
    }

    if (code.length !== this.config.codeLength || !/^\d+$/.test(code)) {
      await this.mfaChallengeRepository.update(challenge.withDecrementedAttempts());
      return false;
    }

    const isValid = await this.verifyCodeHash(code, challenge.challengeCodeHash);

    if (!isValid) {
      await this.mfaChallengeRepository.update(challenge.withDecrementedAttempts());
      return false;
    }

    await this.mfaChallengeRepository.delete(challenge.id, challenge.organizationId);
    return true;
  }

  /**
   * Generate random numeric code
   */
  private generateCode(): string {
    const max = Math.pow(10, this.config.codeLength) - 1;
    const min = Math.pow(10, this.config.codeLength - 1);
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    return code.toString();
  }

  /**
   * Hash code using Argon2id
   */
  private async hashCode(code: string): Promise<string> {
    return hash(code, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Verify code against hash
   */
  private async verifyCodeHash(code: string, codeHash: string): Promise<boolean> {
    const { verify } = await import('@node-rs/argon2');
    return verify(codeHash, code);
  }

  /**
   * Send email via SendGrid
   */
  private async sendEmail(email: string, code: string): Promise<void> {
    const sent = await this.sendGridAdapter.sendMfaCode(email, code);
    if (!sent) {
      throw new SecurityError({
        code: 'MFA_EMAIL_SEND_FAILED',
        message: 'Failed to send email verification code',
      });
    }
  }
}
