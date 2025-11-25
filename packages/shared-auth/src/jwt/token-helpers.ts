/**
 * JWT token helper utilities
 * @module shared-auth/jwt/token-helpers
 */

import { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.types';

/**
 * Checks if a token is expired based on its exp claim
 *
 * @param payload - Token payload with exp claim
 * @returns true if token is expired, false otherwise
 *
 * @remarks
 * Uses current system time for comparison.
 * Adds 5-second clock skew tolerance to prevent premature expiration.
 */
export function isTokenExpired(
  payload: AccessTokenPayload | RefreshTokenPayload,
): boolean {
  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error('Token payload missing valid exp claim');
  }

  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const clockSkewToleranceSeconds = 5; // Allow 5 seconds of clock skew

  return payload.exp < now - clockSkewToleranceSeconds;
}

/**
 * Gets the expiration time of a token as a Date object
 *
 * @param payload - Token payload with exp claim
 * @returns Expiration date
 */
export function getTokenExpiration(
  payload: AccessTokenPayload | RefreshTokenPayload,
): Date {
  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error('Token payload missing valid exp claim');
  }

  return new Date(payload.exp * 1000);
}

/**
 * Gets the time remaining until token expiration in milliseconds
 *
 * @param payload - Token payload with exp claim
 * @returns Time until expiration in milliseconds (negative if expired)
 */
export function getTimeUntilExpiration(
  payload: AccessTokenPayload | RefreshTokenPayload,
): number {
  if (!payload.exp || typeof payload.exp !== 'number') {
    throw new Error('Token payload missing valid exp claim');
  }

  const expirationMs = payload.exp * 1000;
  const nowMs = Date.now();

  return expirationMs - nowMs;
}

/**
 * Checks if a token will expire within a specified time window
 *
 * @param payload - Token payload with exp claim
 * @param thresholdMs - Time threshold in milliseconds
 * @returns true if token expires within threshold, false otherwise
 *
 * @example
 * ```typescript
 * const willExpireSoon = willExpireWithin(payload, 5 * 60 * 1000); // 5 minutes
 * if (willExpireSoon) {
 *   // Refresh token proactively
 * }
 * ```
 */
export function willExpireWithin(
  payload: AccessTokenPayload | RefreshTokenPayload,
  thresholdMs: number,
): boolean {
  if (thresholdMs < 0) {
    throw new Error('Threshold must be a non-negative number');
  }

  const timeRemaining = getTimeUntilExpiration(payload);
  return timeRemaining <= thresholdMs;
}

/**
 * Gets the token age in milliseconds
 *
 * @param payload - Token payload with iat claim
 * @returns Token age in milliseconds
 */
export function getTokenAge(
  payload: AccessTokenPayload | RefreshTokenPayload,
): number {
  if (!payload.iat || typeof payload.iat !== 'number') {
    throw new Error('Token payload missing valid iat claim');
  }

  const issuedAtMs = payload.iat * 1000;
  const nowMs = Date.now();

  return nowMs - issuedAtMs;
}
