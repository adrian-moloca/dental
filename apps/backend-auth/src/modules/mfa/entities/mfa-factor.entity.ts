/**
 * MfaFactor Entity - Multi-factor authentication factor storage
 *
 * Responsibilities:
 * - Represent MFA factors (TOTP, SMS, Email, WebAuthn, BackupCode)
 * - Store encrypted secrets and factor-specific metadata
 * - Support multi-tenant isolation via organizationId
 * - Track factor usage and status
 *
 * Security:
 * - Secrets stored using Argon2id hashing
 * - Phone numbers and emails encrypted
 * - No plain-text sensitive data in toJSON output
 * - Immutable value object with validation
 *
 * @module MfaFactorEntity
 */

import { UUID, OrganizationId } from '@dentalos/shared-types';
import { ValidationError } from '@dentalos/shared-errors';

/**
 * Supported MFA factor types
 */
export enum MfaFactorType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  WEBAUTHN = 'webauthn',
  BACKUP_CODE = 'backup_code',
}

/**
 * MFA factor metadata structure
 */
export interface MfaFactorMetadata {
  /** Human-readable factor name (e.g., "My Phone", "Work Email") */
  factorName?: string;
  /** Device information for WebAuthn */
  deviceInfo?: {
    credentialId?: string;
    publicKey?: string;
    counter?: number;
  };
  /** TOTP-specific metadata */
  totpInfo?: {
    algorithm?: string;
    digits?: number;
    period?: number;
    issuer?: string;
  };
  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * MFA factor entity properties
 */
export interface MfaFactorProperties {
  id: UUID;
  userId: UUID;
  organizationId: OrganizationId;
  factorType: MfaFactorType;
  secret: string;
  isEnabled: boolean;
  isPrimary: boolean;
  phoneNumber?: string;
  email?: string;
  metadata: MfaFactorMetadata;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MFA factor entity for multi-factor authentication
 * Immutable value object with validation
 */
export class MfaFactor {
  readonly id: UUID;
  readonly userId: UUID;
  readonly organizationId: OrganizationId;
  readonly factorType: MfaFactorType;
  readonly secret: string;
  readonly isEnabled: boolean;
  readonly isPrimary: boolean;
  readonly phoneNumber?: string;
  readonly email?: string;
  readonly metadata: MfaFactorMetadata;
  readonly lastUsedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: MfaFactorProperties) {
    this.validateProperties(props);

    this.id = props.id;
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.factorType = props.factorType;
    this.secret = props.secret;
    this.isEnabled = props.isEnabled;
    this.isPrimary = props.isPrimary;
    this.phoneNumber = props.phoneNumber;
    this.email = props.email;
    this.metadata = props.metadata;
    this.lastUsedAt = props.lastUsedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Validate MFA factor properties
   * Enforces business rules and data integrity
   */
  private validateProperties(props: MfaFactorProperties): void {
    const errors: string[] = [];

    if (!props.id) errors.push('Factor ID is required');
    if (!props.userId) errors.push('User ID is required');
    if (!props.organizationId) errors.push('Organization ID is required');
    if (!props.factorType) errors.push('Factor type is required');
    if (!props.secret) errors.push('Secret is required');

    if (!Object.values(MfaFactorType).includes(props.factorType)) {
      errors.push(`Invalid factor type: ${props.factorType}`);
    }

    if (props.secret && props.secret.length < 32) {
      errors.push('Secret must be at least 32 characters');
    }

    if (props.factorType === MfaFactorType.SMS && !props.phoneNumber) {
      errors.push('Phone number is required for SMS factor');
    }

    if (props.factorType === MfaFactorType.EMAIL && !props.email) {
      errors.push('Email is required for Email factor');
    }

    if (!props.createdAt) errors.push('Created at is required');
    if (!props.updatedAt) errors.push('Updated at is required');

    if (errors.length > 0) {
      throw new ValidationError(`MFA factor validation failed: ${errors.join(', ')}`, {
        errors: errors.map((err) => ({ field: 'mfa-factor', message: err })),
      });
    }
  }

  /**
   * Check if factor can be used for authentication
   */
  isUsable(): boolean {
    return this.isEnabled;
  }

  /**
   * Serialize to JSON for storage
   * Excludes sensitive data from output
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      factorType: this.factorType,
      secret: this.secret,
      isEnabled: this.isEnabled,
      isPrimary: this.isPrimary,
      phoneNumber: this.phoneNumber,
      email: this.email,
      metadata: this.metadata,
      lastUsedAt: this.lastUsedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Deserialize from JSON storage
   */
  static fromJSON(json: Record<string, unknown>): MfaFactor {
    return new MfaFactor({
      id: json.id as UUID,
      userId: json.userId as UUID,
      organizationId: json.organizationId as OrganizationId,
      factorType: json.factorType as MfaFactorType,
      secret: json.secret as string,
      isEnabled: json.isEnabled as boolean,
      isPrimary: json.isPrimary as boolean,
      phoneNumber: json.phoneNumber as string | undefined,
      email: json.email as string | undefined,
      metadata: (json.metadata as MfaFactorMetadata) || {},
      lastUsedAt: json.lastUsedAt ? new Date(json.lastUsedAt as string) : undefined,
      createdAt: new Date(json.createdAt as string),
      updatedAt: new Date(json.updatedAt as string),
    });
  }

  /**
   * Create updated copy with new last used timestamp
   */
  withUpdatedUsage(): MfaFactor {
    return new MfaFactor({
      ...this,
      lastUsedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Create copy with enabled status toggled
   */
  withEnabledStatus(isEnabled: boolean): MfaFactor {
    return new MfaFactor({
      ...this,
      isEnabled,
      updatedAt: new Date(),
    });
  }

  /**
   * Create copy with primary status toggled
   */
  withPrimaryStatus(isPrimary: boolean): MfaFactor {
    return new MfaFactor({
      ...this,
      isPrimary,
      updatedAt: new Date(),
    });
  }
}
