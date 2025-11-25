/**
 * Session type definitions
 * @module shared-auth/context/session
 */

import { UUID } from '@dentalos/shared-types';

/**
 * User session information
 * Tracks active authentication sessions for security and auditing
 *
 * @remarks
 * Sessions are used to:
 * - Track active logins across devices
 * - Enable session revocation
 * - Audit user activity
 * - Detect suspicious access patterns
 */
export interface Session {
  /** Unique session identifier */
  readonly sessionId: UUID;

  /** User who owns this session */
  readonly userId: UUID;

  /** Session creation timestamp */
  readonly createdAt: Date;

  /** Session expiration timestamp */
  readonly expiresAt: Date;

  /** Last activity timestamp (updated on each request) */
  readonly lastActivityAt: Date;

  /** Client IP address (for security tracking) */
  readonly ipAddress?: string;

  /** Client user agent (for device identification) */
  readonly userAgent?: string;

  /** Optional device identifier */
  readonly deviceId?: string;

  /** Session metadata (device name, location, etc.) */
  readonly metadata?: Record<string, unknown>;
}

/**
 * Session creation parameters
 */
export interface CreateSessionParams {
  sessionId: UUID;
  userId: UUID;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a new session instance
 *
 * @param params - Session creation parameters
 * @returns Session instance
 */
export function createSession(params: CreateSessionParams): Session {
  if (!params.sessionId) {
    throw new Error('sessionId is required');
  }

  if (!params.userId) {
    throw new Error('userId is required');
  }

  if (!params.expiresAt) {
    throw new Error('expiresAt is required');
  }

  const now = new Date();

  if (params.expiresAt <= now) {
    throw new Error('expiresAt must be in the future');
  }

  return Object.freeze({
    sessionId: params.sessionId,
    userId: params.userId,
    createdAt: now,
    expiresAt: params.expiresAt,
    lastActivityAt: now,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    deviceId: params.deviceId,
    metadata: params.metadata ? Object.freeze({ ...params.metadata }) : undefined,
  });
}

/**
 * Checks if a session is expired
 *
 * @param session - Session to check
 * @returns true if expired, false otherwise
 */
export function isSessionExpired(session: Session): boolean {
  return session.expiresAt <= new Date();
}

/**
 * Gets time until session expiration in milliseconds
 *
 * @param session - Session to check
 * @returns Time until expiration (negative if expired)
 */
export function getSessionTimeRemaining(session: Session): number {
  return session.expiresAt.getTime() - Date.now();
}
