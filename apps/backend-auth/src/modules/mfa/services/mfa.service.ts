/**
 * MfaService - Main MFA orchestration service
 *
 * Responsibilities:
 * - Coordinate MFA enrollment and verification
 * - Manage MFA factors lifecycle
 * - Enforce MFA requirements
 * - Delegate to factor-specific services
 *
 * Architecture:
 * - Orchestrates TOTPService, SMSMfaService, EmailMfaService, BackupCodeService
 * - Manages MFA factors via MfaFactorRepository
 * - Enforces organization-level MFA policies
 *
 * SECURITY NOTE:
 * TOTP secrets are encrypted using AES-256-GCM, NOT hashed.
 * This is critical because TOTP verification requires the original secret
 * to compute the HMAC. Hashing is one-way and would make verification impossible.
 *
 * @module MfaService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { SecurityError, NotFoundError } from '@dentalos/shared-errors';
import { hash } from '@node-rs/argon2';
import { AppConfig } from '../../../configuration';
import { MfaFactorRepository } from '../repositories/mfa-factor.repository';
import { MfaFactor, MfaFactorType } from '../entities/mfa-factor.entity';
import { TOTPService } from './totp.service';
import { SMSMfaService } from './sms-mfa.service';
import {
  encryptTotpSecret,
  decryptTotpSecret,
  isEncryptedSecret,
} from '../utils/totp-encryption.util';

/**
 * TOTP enrollment result
 */
export interface TOTPEnrollmentResult {
  factor: MfaFactor;
  secret: string;
  qrCodeUri: string;
}

/**
 * Injectable MFA service
 */
@Injectable()
export class MfaService {
  /**
   * AES-256-GCM encryption key for TOTP secrets
   * @security This key protects all TOTP secrets. Handle with extreme care.
   */
  private readonly mfaEncryptionKey: string;

  constructor(
    private mfaFactorRepository: MfaFactorRepository,
    private totpService: TOTPService,
    private smsMfaService: SMSMfaService,
    private configService: ConfigService<AppConfig, true>
  ) {
    this.mfaEncryptionKey = this.configService.get('security.mfaEncryptionKey', { infer: true });
  }

  /**
   * Enroll TOTP factor for a user
   *
   * SECURITY: TOTP secrets are encrypted with AES-256-GCM, not hashed.
   * TOTP verification requires the original secret to compute HMAC.
   * The plaintext secret is returned to the user ONCE during enrollment
   * and must be stored in their authenticator app.
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorName - Human-readable factor name
   * @param userEmail - User email for QR code
   * @returns TOTP enrollment result with secret and QR code URI
   */
  async enrollTOTP(
    userId: UUID,
    organizationId: OrganizationId,
    factorName: string,
    userEmail: string
  ): Promise<TOTPEnrollmentResult> {
    const secret = this.totpService.generateSecret();

    // CRITICAL: Encrypt the secret, do NOT hash it
    // TOTP verification requires the original secret to compute the expected token
    const encryptedSecret = encryptTotpSecret(secret, this.mfaEncryptionKey);

    const existingFactors = await this.mfaFactorRepository.findByUserId(userId, organizationId);
    const isPrimary = existingFactors.length === 0;

    const factor = await this.mfaFactorRepository.create({
      userId,
      organizationId,
      factorType: MfaFactorType.TOTP,
      secret: encryptedSecret,
      isEnabled: false,
      isPrimary,
      metadata: { factorName },
    });

    const qrCodeUri = this.totpService.generateQRCodeURI(secret, userEmail);

    return {
      factor,
      secret,
      qrCodeUri,
    };
  }

  /**
   * Verify and enable TOTP factor
   *
   * SECURITY: Decrypts the stored secret before TOTP verification.
   * The secret must be decrypted because TOTP verification requires
   * the original base32 secret to compute the expected HMAC token.
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - Factor identifier
   * @param token - User-provided TOTP token
   * @returns True if verification successful
   *
   * @throws SecurityError if the stored secret cannot be decrypted
   * @throws NotFoundError if factor not found or belongs to different user
   */
  async verifyTOTP(
    userId: UUID,
    organizationId: OrganizationId,
    factorId: UUID,
    token: string
  ): Promise<boolean> {
    const factor = await this.mfaFactorRepository.findById(factorId, organizationId);

    if (!factor || factor.userId !== userId) {
      throw new NotFoundError('MFA factor not found');
    }

    if (factor.factorType !== MfaFactorType.TOTP) {
      throw new SecurityError({ code: 'INVALID_FACTOR_TYPE', message: 'Factor is not TOTP' });
    }

    // CRITICAL: Decrypt the secret before verification
    // TOTP requires the original plaintext secret to compute the HMAC
    let plaintextSecret: string;
    try {
      // Check if this is an encrypted secret (new format) or hashed (legacy bug)
      if (!isEncryptedSecret(factor.secret)) {
        // This is a legacy hashed secret - verification is impossible
        // Log this as a security incident and fail securely
        throw new SecurityError({
          code: 'LEGACY_HASHED_SECRET',
          message:
            'TOTP verification failed: secret was stored using irreversible hashing. User must re-enroll MFA.',
        });
      }

      plaintextSecret = decryptTotpSecret(factor.secret, this.mfaEncryptionKey);
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      // Decryption failed - either wrong key or corrupted data
      // Do not expose specific error details
      throw new SecurityError({
        code: 'TOTP_DECRYPTION_FAILED',
        message: 'TOTP verification failed due to internal error',
      });
    }

    const isValid = this.totpService.verifyToken(plaintextSecret, token);

    if (isValid && !factor.isEnabled) {
      const enabledFactor = factor.withEnabledStatus(true).withUpdatedUsage();
      await this.mfaFactorRepository.update(enabledFactor);
    } else if (isValid) {
      const updatedFactor = factor.withUpdatedUsage();
      await this.mfaFactorRepository.update(updatedFactor);
    }

    return isValid;
  }

  /**
   * Enroll SMS factor for a user
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorName - Human-readable factor name
   * @param phoneNumber - Phone number (E.164 format)
   * @returns Created MFA factor
   */
  async enrollSMS(
    userId: UUID,
    organizationId: OrganizationId,
    factorName: string,
    phoneNumber: string
  ): Promise<MfaFactor> {
    const existingFactors = await this.mfaFactorRepository.findByUserId(userId, organizationId);
    const isPrimary = existingFactors.length === 0;

    const phoneHash = await this.hashSecret(phoneNumber);

    const factor = await this.mfaFactorRepository.create({
      userId,
      organizationId,
      factorType: MfaFactorType.SMS,
      secret: phoneHash,
      isEnabled: false,
      isPrimary,
      phoneNumber,
      metadata: { factorName },
    });

    return factor;
  }

  /**
   * Send SMS verification code
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - Factor identifier
   */
  async sendSMSCode(userId: UUID, organizationId: OrganizationId, factorId: UUID): Promise<void> {
    const factor = await this.mfaFactorRepository.findById(factorId, organizationId);

    if (!factor || factor.userId !== userId) {
      throw new NotFoundError('MFA factor not found');
    }

    if (factor.factorType !== MfaFactorType.SMS || !factor.phoneNumber) {
      throw new SecurityError({ code: 'INVALID_FACTOR_TYPE', message: 'Factor is not SMS' });
    }

    await this.smsMfaService.sendVerificationCode(
      userId,
      organizationId,
      factorId,
      factor.phoneNumber
    );
  }

  /**
   * List all MFA factors for a user
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @returns Array of MFA factors
   */
  async listFactors(userId: UUID, organizationId: OrganizationId): Promise<MfaFactor[]> {
    return this.mfaFactorRepository.findByUserId(userId, organizationId);
  }

  /**
   * Disable MFA factor
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - Factor identifier
   */
  async disableFactor(userId: UUID, organizationId: OrganizationId, factorId: UUID): Promise<void> {
    const factor = await this.mfaFactorRepository.findById(factorId, organizationId);

    if (!factor || factor.userId !== userId) {
      throw new NotFoundError('MFA factor not found');
    }

    const disabledFactor = factor.withEnabledStatus(false);
    await this.mfaFactorRepository.update(disabledFactor);
  }

  /**
   * Delete MFA factor
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - Factor identifier
   */
  async deleteFactor(userId: UUID, organizationId: OrganizationId, factorId: UUID): Promise<void> {
    const factor = await this.mfaFactorRepository.findById(factorId, organizationId);

    if (!factor || factor.userId !== userId) {
      throw new NotFoundError('MFA factor not found');
    }

    await this.mfaFactorRepository.delete(factorId, organizationId);
  }

  /**
   * Check if user requires MFA
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @returns True if user has enabled MFA factors
   */
  async requiresMfa(userId: UUID, organizationId: OrganizationId): Promise<boolean> {
    const enabledFactors = await this.mfaFactorRepository.findEnabledByUserId(
      userId,
      organizationId
    );
    return enabledFactors.length > 0;
  }

  /**
   * Hash secret using Argon2id
   *
   * NOTE: This is used for SMS/Email factors where the secret field stores
   * a hash for integrity verification. The actual phone/email is stored
   * in plaintext in dedicated fields because SMS/Email MFA sends codes
   * to those addresses and doesn't need to reverse the hash.
   *
   * DO NOT use this for TOTP secrets - TOTP requires encryption (reversible)
   * because the original secret is needed to compute HMAC for verification.
   *
   * @param secret - The value to hash (phone number, email, etc.)
   * @returns Argon2id hash string
   */
  private async hashSecret(secret: string): Promise<string> {
    return hash(secret, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
}
