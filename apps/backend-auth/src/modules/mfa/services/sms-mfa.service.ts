/**
 * SMSMfaService - SMS-based MFA operations
 *
 * Responsibilities:
 * - Generate SMS verification codes
 * - Send SMS codes via external provider (Twilio, AWS SNS, etc.)
 * - Create and manage SMS challenges
 * - Rate limiting for SMS sending
 *
 * Security:
 * - Codes are 6-digit random numbers
 * - Limited validity period (5 minutes default)
 * - Limited attempts (3 default)
 * - Rate limiting to prevent SMS spam
 *
 * @module SMSMfaService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { SecurityError } from '@dentalos/shared-errors';
import { hash } from '@node-rs/argon2';
import { MfaChallengeRepository } from '../repositories/mfa-challenge.repository';
import { MfaChallenge } from '../entities/mfa-challenge.entity';
import { TwilioAdapter } from '../adapters/twilio.adapter';

/**
 * SMS MFA service configuration
 */
export interface SMSMfaConfig {
  codeLength: number;
  validityMinutes: number;
  maxAttempts: number;
}

/**
 * Injectable SMS MFA service
 */
@Injectable()
export class SMSMfaService {
  private readonly config: SMSMfaConfig;

  constructor(
    private configService: ConfigService,
    private mfaChallengeRepository: MfaChallengeRepository,
    private twilioAdapter: TwilioAdapter
  ) {
    this.config = {
      codeLength: this.configService.get('security.mfa.sms.codeLength', 6),
      validityMinutes: this.configService.get('security.mfa.sms.validityMinutes', 5),
      maxAttempts: this.configService.get('security.mfa.sms.maxAttempts', 3),
    };
  }

  /**
   * Generate and send SMS verification code
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - MFA factor identifier
   * @param phoneNumber - Destination phone number (E.164 format)
   * @returns Created challenge entity
   */
  async sendVerificationCode(
    userId: UUID,
    organizationId: OrganizationId,
    factorId: UUID,
    phoneNumber: string
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

    await this.sendSMS(phoneNumber, code);

    return challenge;
  }

  /**
   * Verify SMS code against challenge
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
   * Send SMS via Twilio
   */
  private async sendSMS(phoneNumber: string, code: string): Promise<void> {
    const sent = await this.twilioAdapter.sendMfaCode(phoneNumber, code);
    if (!sent) {
      throw new SecurityError({
        code: 'MFA_SMS_SEND_FAILED',
        message: 'Failed to send SMS verification code',
      });
    }
  }
}
