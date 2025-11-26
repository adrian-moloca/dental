/**
 * CNP Encryption Service
 *
 * Handles encryption, decryption, and validation of Romanian CNP (Cod Numeric Personal)
 * using the shared-security encryption utilities.
 *
 * Features:
 * - AES-256-GCM encryption for CNP storage
 * - Deterministic hashing for searchable lookups
 * - CNP validation against Romanian algorithm
 * - Data extraction (birth date, gender, county)
 *
 * @module services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CnpEncryption } from '@dentalos/shared-security';
import { validateCnp, parseCnp, maskCnp } from '@dentalos/shared-validation';
import type { NationalIdInfo } from '../modules/patients/entities/patient.schema';

/**
 * Result of processing a CNP
 */
export interface ProcessedCnp {
  /**
   * Encrypted CNP value
   */
  encryptedValue: string;

  /**
   * Searchable hash for lookups
   */
  searchHash: string;

  /**
   * Last 4 digits for display
   */
  lastFour: string;

  /**
   * Whether CNP passed validation
   */
  isValidated: boolean;

  /**
   * Gender extracted from CNP
   */
  extractedGender?: 'male' | 'female';

  /**
   * Birth date extracted from CNP
   */
  extractedBirthDate?: Date;

  /**
   * County code from CNP
   */
  countyCode?: string;
}

/**
 * CNP Encryption Service
 *
 * Provides secure handling of Romanian national ID (CNP) with:
 * - Field-level encryption using AES-256-GCM
 * - Searchable deterministic hashing
 * - Validation against Romanian CNP algorithm
 */
@Injectable()
export class CnpEncryptionService {
  private readonly logger = new Logger(CnpEncryptionService.name);
  private readonly cnpEncryption: CnpEncryption;

  constructor(private readonly configService: ConfigService) {
    // Get encryption key from config
    const masterKey = this.configService.get<string>('PII_ENCRYPTION_KEY');

    if (!masterKey) {
      this.logger.warn(
        'PII_ENCRYPTION_KEY not configured. Using default key (NOT SECURE FOR PRODUCTION)',
      );
    }

    this.cnpEncryption = new CnpEncryption(
      masterKey || 'default-dev-key-change-in-production-32ch',
    );
  }

  /**
   * Process and encrypt a CNP for storage
   *
   * @param cnp - Raw CNP string (13 digits)
   * @param _tenantId - Tenant ID for key derivation (reserved for future use)
   * @returns Processed CNP data ready for storage
   */
  processCnp(cnp: string, _tenantId: string): ProcessedCnp {
    // Validate CNP
    const validation = validateCnp(cnp);

    if (!validation.valid) {
      this.logger.warn(`Invalid CNP provided: ${validation.error}`);
    }

    // Parse CNP data
    const parsed = validation.valid ? parseCnp(cnp) : null;

    // Encrypt CNP
    const encryptedValue = this.cnpEncryption.encrypt(cnp);

    // Create searchable hash
    const searchHash = this.cnpEncryption.createSearchHash(cnp);

    // Get last 4 digits for display
    const lastFour = cnp.slice(-4);

    return {
      encryptedValue,
      searchHash,
      lastFour,
      isValidated: validation.valid,
      extractedGender: parsed?.gender ?? undefined,
      extractedBirthDate: parsed?.birthDate ?? undefined,
      countyCode: parsed?.countyCode ?? undefined,
    };
  }

  /**
   * Decrypt a stored CNP
   *
   * @param encryptedValue - Encrypted CNP from database
   * @returns Decrypted CNP string
   */
  decryptCnp(encryptedValue: string): string {
    return this.cnpEncryption.decrypt(encryptedValue);
  }

  /**
   * Create a search hash for looking up a patient by CNP
   *
   * @param cnp - Raw CNP string
   * @returns Search hash to match against stored searchHash
   */
  createSearchHash(cnp: string): string {
    return this.cnpEncryption.createSearchHash(cnp);
  }

  /**
   * Mask a CNP for display (e.g., "***********1234")
   *
   * @param cnp - Raw CNP string
   * @returns Masked CNP
   */
  maskCnp(cnp: string): string {
    return maskCnp(cnp);
  }

  /**
   * Validate a CNP without processing
   *
   * @param cnp - CNP to validate
   * @returns Validation result with extracted data
   */
  validateCnp(cnp: string) {
    return validateCnp(cnp);
  }

  /**
   * Convert processed CNP to NationalIdInfo schema format
   *
   * @param processed - Processed CNP data
   * @returns NationalIdInfo object for MongoDB storage
   */
  toNationalIdInfo(processed: ProcessedCnp): NationalIdInfo {
    return {
      encryptedValue: processed.encryptedValue,
      searchHash: processed.searchHash,
      lastFour: processed.lastFour,
      isValidated: processed.isValidated,
      extractedGender: processed.extractedGender,
      extractedBirthDate: processed.extractedBirthDate,
      countyCode: processed.countyCode,
    };
  }

  /**
   * Check if a CNP exists in the database (via search hash)
   *
   * @param cnp - CNP to check
   * @returns Search hash to query against
   */
  getSearchHashForLookup(cnp: string): string {
    return this.createSearchHash(cnp);
  }
}
