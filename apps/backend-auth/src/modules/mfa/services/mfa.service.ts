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
 * @module MfaService
 */

import { Injectable } from '@nestjs/common';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { SecurityError, NotFoundError } from '@dentalos/shared-errors';
import { hash } from '@node-rs/argon2';
import { MfaFactorRepository } from '../repositories/mfa-factor.repository';
import { MfaFactor, MfaFactorType } from '../entities/mfa-factor.entity';
import { TOTPService } from './totp.service';
import { SMSMfaService } from './sms-mfa.service';

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
  constructor(
    private mfaFactorRepository: MfaFactorRepository,
    private totpService: TOTPService,
    private smsMfaService: SMSMfaService
  ) {}

  /**
   * Enroll TOTP factor for a user
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
    const secretHash = await this.hashSecret(secret);

    const existingFactors = await this.mfaFactorRepository.findByUserId(userId, organizationId);
    const isPrimary = existingFactors.length === 0;

    const factor = await this.mfaFactorRepository.create({
      userId,
      organizationId,
      factorType: MfaFactorType.TOTP,
      secret: secretHash,
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
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param factorId - Factor identifier
   * @param token - User-provided TOTP token
   * @returns True if verification successful
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

    const isValid = this.totpService.verifyToken(factor.secret, token);

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
   */
  private async hashSecret(secret: string): Promise<string> {
    return hash(secret, {
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
}
