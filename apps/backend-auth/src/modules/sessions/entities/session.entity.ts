/**
 * Session Entity - Redis-backed session storage
 *
 * Responsibilities:
 * - Represent active user sessions with device tracking
 * - Support multi-tenant isolation via organizationId
 * - Provide JSON serialization for Redis storage
 * - Enforce session lifecycle rules (expiration, revocation)
 *
 * Redis Storage Strategy:
 * - Key pattern: session:{organizationId}:{sessionId}
 * - TTL auto-expiration aligned with expiresAt
 * - JSON stringified storage for compatibility
 *
 * Security:
 * - Stores Argon2id hash of refresh token (not plain token)
 * - IP address partially masked for GDPR compliance
 * - Device fingerprint for anti-theft detection
 * - Soft deletion via revokedAt (audit trail)
 *
 * @module SessionEntity
 */

import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { ValidationError } from '@dentalos/shared-errors';

/**
 * Session revocation reason codes
 * Used for audit trails and security monitoring
 */
export type SessionRevocationReason =
  | 'user_logout'
  | 'user_revoked'
  | 'admin_revoked'
  | 'token_rotated'
  | 'expired'
  | 'suspicious_activity'
  | 'password_changed'
  | 'session_limit_exceeded';

/**
 * Device information for session tracking
 * Enables device-based security features
 */
export interface DeviceInfo {
  /** Unique device identifier (SHA256 hash) */
  deviceId: string;
  /** Human-readable device name */
  deviceName: string;
  /** Partially masked IP address (GDPR compliant) */
  ipAddress: string;
  /** Full User-Agent string */
  userAgent: string;
}

/**
 * Session entity properties
 * Represents an active authentication session
 */
export interface SessionProperties {
  /** Session unique identifier */
  id: UUID;
  /** User who owns this session */
  userId: UUID;
  /** Organization for multi-tenant isolation */
  organizationId: OrganizationId;
  /** Optional clinic scope */
  clinicId?: ClinicId;
  /** Argon2id hash of the refresh token */
  refreshTokenHash: string;
  /** Device information */
  deviceInfo: DeviceInfo;
  /** Session creation timestamp */
  createdAt: Date;
  /** Session expiration timestamp (TTL: 7 days default) */
  expiresAt: Date;
  /** Last activity timestamp (updated on refresh) */
  lastActivityAt: Date;
  /** Revocation timestamp (null if active) */
  revokedAt?: Date;
  /** Revocation reason (if revoked) */
  revokedReason?: SessionRevocationReason;
}

/**
 * Session entity for Redis storage
 * Immutable value object with validation
 */
export class Session {
  readonly id: UUID;
  readonly userId: UUID;
  readonly organizationId: OrganizationId;
  readonly clinicId?: ClinicId;
  readonly refreshTokenHash: string;
  readonly deviceInfo: DeviceInfo;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly lastActivityAt: Date;
  readonly revokedAt?: Date;
  readonly revokedReason?: SessionRevocationReason;

  constructor(props: SessionProperties) {
    // Validate required fields
    this.validateProperties(props);

    // Assign all properties (immutable)
    this.id = props.id;
    this.userId = props.userId;
    this.organizationId = props.organizationId;
    this.clinicId = props.clinicId;
    this.refreshTokenHash = props.refreshTokenHash;
    this.deviceInfo = props.deviceInfo;
    this.createdAt = props.createdAt;
    this.expiresAt = props.expiresAt;
    this.lastActivityAt = props.lastActivityAt;
    this.revokedAt = props.revokedAt;
    this.revokedReason = props.revokedReason;
  }

  /**
   * Validate session properties
   * Enforces business rules and data integrity
   */
  private validateProperties(props: SessionProperties): void {
    const errors: string[] = [];

    // Required field validation
    if (!props.id) errors.push('Session ID is required');
    if (!props.userId) errors.push('User ID is required');
    if (!props.organizationId) errors.push('Organization ID is required');
    if (!props.refreshTokenHash) errors.push('Refresh token hash is required');

    // Refresh token hash validation (Argon2id output)
    if (props.refreshTokenHash && props.refreshTokenHash.length < 64) {
      errors.push('Refresh token hash must be at least 64 characters');
    }

    // Device info validation
    if (!props.deviceInfo) {
      errors.push('Device info is required');
    } else {
      if (!props.deviceInfo.deviceId) errors.push('Device ID is required');
      if (!props.deviceInfo.deviceName) errors.push('Device name is required');
      if (!props.deviceInfo.ipAddress) errors.push('IP address is required');
      if (!props.deviceInfo.userAgent) errors.push('User agent is required');

      // Device ID format validation (SHA256 = 64 hex chars)
      if (props.deviceInfo.deviceId && !/^[a-f0-9]{64}$/i.test(props.deviceInfo.deviceId)) {
        errors.push('Device ID must be a valid SHA256 hash (64 hex characters)');
      }
    }

    // Timestamp validation
    if (!props.createdAt) errors.push('Created at is required');
    if (!props.expiresAt) errors.push('Expires at is required');
    if (!props.lastActivityAt) errors.push('Last activity at is required');

    // Expiration validation
    if (props.createdAt && props.expiresAt && props.expiresAt <= props.createdAt) {
      errors.push('Expiration date must be after creation date');
    }

    // Revocation validation
    if (props.revokedAt && !props.revokedReason) {
      errors.push('Revocation reason is required when session is revoked');
    }

    if (errors.length > 0) {
      throw new ValidationError(`Session validation failed: ${errors.join(', ')}`, {
        errors: errors.map((err) => ({ field: 'session', message: err })),
      });
    }
  }

  /**
   * Check if session is currently active
   * Active = not expired, not revoked
   */
  isActive(): boolean {
    const now = new Date();
    const isNotExpired = this.expiresAt > now;
    const isNotRevoked = !this.revokedAt;
    return isNotExpired && isNotRevoked;
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  /**
   * Check if session is revoked
   */
  isRevoked(): boolean {
    return !!this.revokedAt;
  }

  /**
   * Serialize session to JSON for Redis storage
   * Converts Date objects to ISO strings
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      organizationId: this.organizationId,
      clinicId: this.clinicId,
      refreshTokenHash: this.refreshTokenHash,
      deviceInfo: this.deviceInfo,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      lastActivityAt: this.lastActivityAt.toISOString(),
      revokedAt: this.revokedAt?.toISOString(),
      revokedReason: this.revokedReason,
    };
  }

  /**
   * Deserialize session from JSON (Redis storage)
   * Converts ISO strings back to Date objects
   */
  static fromJSON(json: Record<string, unknown>): Session {
    return new Session({
      id: json.id as UUID,
      userId: json.userId as UUID,
      organizationId: json.organizationId as OrganizationId,
      clinicId: json.clinicId as ClinicId | undefined,
      refreshTokenHash: json.refreshTokenHash as string,
      deviceInfo: json.deviceInfo as DeviceInfo,
      createdAt: new Date(json.createdAt as string),
      expiresAt: new Date(json.expiresAt as string),
      lastActivityAt: new Date(json.lastActivityAt as string),
      revokedAt: json.revokedAt ? new Date(json.revokedAt as string) : undefined,
      revokedReason: json.revokedReason as SessionRevocationReason | undefined,
    });
  }

  /**
   * Create a new session with updated last activity timestamp
   * Used during token refresh operations
   */
  withUpdatedActivity(): Session {
    return new Session({
      ...this,
      lastActivityAt: new Date(),
    });
  }

  /**
   * Create a revoked copy of this session
   * Used for logout and rotation operations
   */
  withRevocation(reason: SessionRevocationReason): Session {
    return new Session({
      ...this,
      revokedAt: new Date(),
      revokedReason: reason,
    });
  }
}
