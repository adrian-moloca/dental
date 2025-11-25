/**
 * MfaChallenge Entity - Temporary MFA verification challenge
 *
 * Responsibilities:
 * - Store time-limited MFA challenges for SMS/Email verification
 * - Track verification attempts and prevent brute-force attacks
 * - Support multi-tenant isolation via organizationId
 * - Auto-expire challenges after timeout
 *
 * Security:
 * - Challenge codes stored as Argon2id hashes
 * - Limited attempts to prevent brute-force
 * - Time-based expiration (typically 5-10 minutes)
 * - Immutable value object
 *
 * @module MfaChallengeEntity
 */

import { UUID, OrganizationId } from '@dentalos/shared-types';
import { ValidationError } from '@dentalos/shared-errors';

/**
 * MFA challenge entity properties
 */
export interface MfaChallengeProperties {
  id: UUID;
  userId: UUID;
  organizationId: OrganizationId;
  factorId: UUID;
  challengeCodeHash: string;
  expiresAt: Date;
  attemptsRemaining: number;
  createdAt: Date;
}

/**
 * MFA challenge entity for time-limited verification
 * Immutable value object with validation
 */
export class MfaChallenge {
  readonly id: UUID;
  readonly userId: UUID;
  readonly organizationId: OrganizationId;
  readonly factorId: UUID;
  readonly challengeCodeHash: string;
  readonly expiresAt: Date;
  readonly attemptsRemaining: number;
  readonly createdAt: Date;

  constructor(props: MfaChallengeProperties) {
    this.validateProperties(props);

    this.id = props.id;
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.factorId = props.factorId;
    this.challengeCodeHash = props.challengeCodeHash;
    this.expiresAt = props.expiresAt;
    this.attemptsRemaining = props.attemptsRemaining;
    this.createdAt = props.createdAt;
  }

  /**
   * Validate challenge properties
   */
  private validateProperties(props: MfaChallengeProperties): void {
    const errors: string[] = [];

    if (!props.id) errors.push('Challenge ID is required');
    if (!props.userId) errors.push('User ID is required');
    if (!props.organizationId) errors.push('Organization ID is required');
    if (!props.factorId) errors.push('Factor ID is required');
    if (!props.challengeCodeHash) errors.push('Challenge code hash is required');

    if (props.challengeCodeHash && props.challengeCodeHash.length < 64) {
      errors.push('Challenge code hash must be at least 64 characters');
    }

    if (!props.expiresAt) errors.push('Expiration date is required');
    if (!props.createdAt) errors.push('Created at is required');

    if (props.expiresAt && props.createdAt && props.expiresAt <= props.createdAt) {
      errors.push('Expiration date must be after creation date');
    }

    if (typeof props.attemptsRemaining !== 'number' || props.attemptsRemaining < 0) {
      errors.push('Attempts remaining must be a non-negative number');
    }

    if (errors.length > 0) {
      throw new ValidationError(`MFA challenge validation failed: ${errors.join(', ')}`, {
        errors: errors.map((err) => ({ field: 'mfa-challenge', message: err })),
      });
    }
  }

  /**
   * Check if challenge has expired
   */
  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  /**
   * Check if challenge is still valid for use
   */
  isValid(): boolean {
    return !this.isExpired() && this.attemptsRemaining > 0;
  }

  /**
   * Check if challenge has remaining attempts
   */
  hasAttemptsRemaining(): boolean {
    return this.attemptsRemaining > 0;
  }

  /**
   * Serialize to JSON for storage
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      factorId: this.factorId,
      challengeCodeHash: this.challengeCodeHash,
      expiresAt: this.expiresAt.toISOString(),
      attemptsRemaining: this.attemptsRemaining,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Deserialize from JSON storage
   */
  static fromJSON(json: Record<string, unknown>): MfaChallenge {
    return new MfaChallenge({
      id: json.id as UUID,
      userId: json.userId as UUID,
      organizationId: json.organizationId as OrganizationId,
      factorId: json.factorId as UUID,
      challengeCodeHash: json.challengeCodeHash as string,
      expiresAt: new Date(json.expiresAt as string),
      attemptsRemaining: json.attemptsRemaining as number,
      createdAt: new Date(json.createdAt as string),
    });
  }

  /**
   * Create copy with decremented attempts
   */
  withDecrementedAttempts(): MfaChallenge {
    return new MfaChallenge({
      ...this,
      attemptsRemaining: Math.max(0, this.attemptsRemaining - 1),
    });
  }
}
