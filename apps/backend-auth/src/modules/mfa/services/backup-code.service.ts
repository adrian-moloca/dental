/**
 * BackupCodeService - Backup code generation and verification
 *
 * Responsibilities:
 * - Generate sets of backup codes
 * - Verify backup codes
 * - Manage backup code lifecycle
 * - Prevent code reuse
 *
 * Security:
 * - Codes are cryptographically random
 * - Stored as Argon2id hashes
 * - Single-use only
 * - Generated in sets of 8-10 codes
 *
 * @module BackupCodeService
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UUID, OrganizationId } from '@dentalos/shared-types';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'crypto';
import { BackupCodeRepository } from '../repositories/backup-code.repository';

/**
 * Backup code service configuration
 */
export interface BackupCodeConfig {
  codeLength: number;
  codeCount: number;
}

/**
 * Injectable backup code service
 */
@Injectable()
export class BackupCodeService {
  private readonly config: BackupCodeConfig;

  constructor(
    private configService: ConfigService,
    private backupCodeRepository: BackupCodeRepository
  ) {
    this.config = {
      codeLength: this.configService.get('security.mfa.backupCode.length', 8),
      codeCount: this.configService.get('security.mfa.backupCode.count', 10),
    };
  }

  /**
   * Generate new set of backup codes for a user
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @returns Array of plain-text backup codes (display once to user)
   */
  async generateBackupCodes(userId: UUID, organizationId: OrganizationId): Promise<string[]> {
    await this.backupCodeRepository.deleteByUserId(userId, organizationId);

    const plainCodes: string[] = [];
    const codeDataList = [];

    for (let i = 0; i < this.config.codeCount; i++) {
      const code = this.generateCode();
      const codeHash = await this.hashCode(code);

      plainCodes.push(code);
      codeDataList.push({
        userId,
        organizationId,
        codeHash,
      });
    }

    await this.backupCodeRepository.createBatch(codeDataList);

    return plainCodes;
  }

  /**
   * Verify backup code and mark as used
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @param code - User-provided backup code
   * @returns True if code is valid and unused
   */
  async verifyBackupCode(
    userId: UUID,
    organizationId: OrganizationId,
    code: string
  ): Promise<boolean> {
    if (!code || code.length !== this.config.codeLength) {
      return false;
    }

    const availableCodes = await this.backupCodeRepository.findAvailableByUserId(
      userId,
      organizationId
    );

    for (const backupCode of availableCodes) {
      const isValid = await this.verifyCodeHash(code, backupCode.codeHash);

      if (isValid) {
        const usedCode = backupCode.markAsUsed();
        await this.backupCodeRepository.update(usedCode);
        return true;
      }
    }

    return false;
  }

  /**
   * Get count of remaining backup codes for a user
   *
   * @param userId - User identifier
   * @param organizationId - Organization identifier
   * @returns Number of unused backup codes
   */
  async getRemainingCodeCount(userId: UUID, organizationId: OrganizationId): Promise<number> {
    const availableCodes = await this.backupCodeRepository.findAvailableByUserId(
      userId,
      organizationId
    );
    return availableCodes.length;
  }

  /**
   * Generate random alphanumeric code
   */
  private generateCode(): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(this.config.codeLength);
    let code = '';

    for (let i = 0; i < this.config.codeLength; i++) {
      code += charset[bytes[i] % charset.length];
    }

    return code;
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
}
