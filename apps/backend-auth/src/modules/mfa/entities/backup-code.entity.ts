/**
 * BackupCode Entity - One-time recovery codes for MFA
 *
 * Responsibilities:
 * - Store single-use backup codes for account recovery
 * - Track usage status to prevent reuse
 * - Support multi-tenant isolation via organizationId
 * - Provide secure fallback when primary MFA unavailable
 *
 * Security:
 * - Codes stored as Argon2id hashes (never plain-text)
 * - Single-use only (marked as used after verification)
 * - Generated in sets of 8-10 codes
 * - Immutable value object
 *
 * @module BackupCodeEntity
 */

import { UUID, OrganizationId } from '@dentalos/shared-types';
import { ValidationError } from '@dentalos/shared-errors';

/**
 * Backup code entity properties
 */
export interface BackupCodeProperties {
  id: UUID;
  userId: UUID;
  organizationId: OrganizationId;
  codeHash: string;
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
}

/**
 * Backup code entity for account recovery
 * Immutable value object with validation
 */
export class BackupCode {
  readonly id: UUID;
  readonly userId: UUID;
  readonly organizationId: OrganizationId;
  readonly codeHash: string;
  readonly isUsed: boolean;
  readonly usedAt?: Date;
  readonly createdAt: Date;

  constructor(props: BackupCodeProperties) {
    this.validateProperties(props);

    this.id = props.id;
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.codeHash = props.codeHash;
    this.isUsed = props.isUsed;
    this.usedAt = props.usedAt;
    this.createdAt = props.createdAt;
  }

  /**
   * Validate backup code properties
   */
  private validateProperties(props: BackupCodeProperties): void {
    const errors: string[] = [];

    if (!props.id) errors.push('Backup code ID is required');
    if (!props.userId) errors.push('User ID is required');
    if (!props.organizationId) errors.push('Organization ID is required');
    if (!props.codeHash) errors.push('Code hash is required');

    if (props.codeHash && props.codeHash.length < 64) {
      errors.push('Code hash must be at least 64 characters');
    }

    if (typeof props.isUsed !== 'boolean') {
      errors.push('isUsed must be a boolean');
    }

    if (props.isUsed && !props.usedAt) {
      errors.push('usedAt is required when code is marked as used');
    }

    if (!props.createdAt) errors.push('Created at is required');

    if (errors.length > 0) {
      throw new ValidationError(`Backup code validation failed: ${errors.join(', ')}`, {
        errors: errors.map((err) => ({ field: 'backup-code', message: err })),
      });
    }
  }

  /**
   * Check if code can be used
   */
  isAvailable(): boolean {
    return !this.isUsed;
  }

  /**
   * Serialize to JSON for storage
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      codeHash: this.codeHash,
      isUsed: this.isUsed,
      usedAt: this.usedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Deserialize from JSON storage
   */
  static fromJSON(json: Record<string, unknown>): BackupCode {
    return new BackupCode({
      id: json.id as UUID,
      userId: json.userId as UUID,
      organizationId: json.organizationId as OrganizationId,
      codeHash: json.codeHash as string,
      isUsed: json.isUsed as boolean,
      usedAt: json.usedAt ? new Date(json.usedAt as string) : undefined,
      createdAt: new Date(json.createdAt as string),
    });
  }

  /**
   * Mark code as used
   */
  markAsUsed(): BackupCode {
    return new BackupCode({
      ...this,
      isUsed: true,
      usedAt: new Date(),
    });
  }
}
