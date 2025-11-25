/**
 * JWT verification utilities
 * @module shared-auth/jwt/verifier
 */

import * as jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.types';

/**
 * Error codes for JWT verification failures
 */
export enum JWTVerificationError {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  MALFORMED_TOKEN = 'MALFORMED_TOKEN',
  MISSING_CLAIMS = 'MISSING_CLAIMS',
  INVALID_ISSUER = 'INVALID_ISSUER',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
}

/**
 * JWT verification exception
 */
export class JWTError extends Error {
  constructor(
    public readonly code: JWTVerificationError,
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'JWTError';
    Object.setPrototypeOf(this, JWTError.prototype);
  }
}

/**
 * Verifies an access token and returns its payload
 * Supports key rotation by accepting multiple secrets
 *
 * @param token - JWT token string
 * @param secret - Single secret or array of secrets (for key rotation)
 * @param expectedIssuer - Optional expected issuer to validate
 * @returns Decoded and verified access token payload
 * @throws {JWTError} If token is invalid, expired, or malformed
 *
 * @security
 * - Verifies signature using provided secret(s)
 * - Validates expiration (exp claim)
 * - Validates issuer if provided
 * - Tries multiple secrets in order for graceful key rotation
 */
export async function verifyAccessToken(
  token: string,
  secret: string | string[],
  expectedIssuer?: string,
): Promise<AccessTokenPayload> {
  if (!token || typeof token !== 'string') {
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      'Token must be a non-empty string',
    );
  }

  if (!secret || (Array.isArray(secret) && secret.length === 0)) {
    throw new Error('Secret is required for token verification');
  }

  const secrets = Array.isArray(secret) ? secret : [secret];
  let lastError: Error | undefined;

  for (const currentSecret of secrets) {
    try {
      const decoded = jwt.verify(token, currentSecret, {
        complete: false,
        algorithms: ['HS256', 'HS384', 'HS512'],
      }) as AccessTokenPayload;

      // Validate required claims
      if (!decoded.sub || !decoded.email || !decoded.roles || !decoded.organizationId) {
        throw new JWTError(
          JWTVerificationError.MISSING_CLAIMS,
          'Access token missing required claims (sub, email, roles, organizationId)',
        );
      }

      // Validate issuer if expected
      if (expectedIssuer && decoded.iss !== expectedIssuer) {
        throw new JWTError(
          JWTVerificationError.INVALID_ISSUER,
          `Invalid issuer: expected ${expectedIssuer}, got ${decoded.iss}`,
        );
      }

      return decoded;
    } catch (error: unknown) {
      // Type guard to ensure error is an Error object
      const errorObj = error instanceof Error ? error : new Error(String(error));
      lastError = errorObj;

      // Don't try other secrets for non-signature errors
      if (errorObj instanceof JWTError) {
        throw errorObj;
      }

      if (errorObj instanceof jwt.TokenExpiredError) {
        throw new JWTError(
          JWTVerificationError.TOKEN_EXPIRED,
          'Token has expired',
          errorObj,
        );
      }

      if (errorObj instanceof jwt.JsonWebTokenError) {
        // Continue to next secret if signature verification failed
        if (errorObj.message.includes('invalid signature')) {
          continue;
        }

        throw new JWTError(
          JWTVerificationError.MALFORMED_TOKEN,
          `Malformed token: ${errorObj.message}`,
          errorObj,
        );
      }

      // Unknown error type
      continue;
    }
  }

  // All secrets failed
  throw new JWTError(
    JWTVerificationError.INVALID_SIGNATURE,
    'Token signature verification failed with all provided secrets',
    lastError,
  );
}

/**
 * Verifies a refresh token and returns its payload
 * Supports key rotation by accepting multiple secrets
 *
 * @param token - JWT token string
 * @param secret - Single secret or array of secrets (for key rotation)
 * @param expectedIssuer - Optional expected issuer to validate
 * @returns Decoded and verified refresh token payload
 * @throws {JWTError} If token is invalid, expired, or malformed
 *
 * @security
 * - Verifies signature using provided secret(s)
 * - Validates expiration (exp claim)
 * - Validates issuer if provided
 * - Minimal payload to reduce token size
 */
export async function verifyRefreshToken(
  token: string,
  secret: string | string[],
  expectedIssuer?: string,
): Promise<RefreshTokenPayload> {
  if (!token || typeof token !== 'string') {
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      'Token must be a non-empty string',
    );
  }

  if (!secret || (Array.isArray(secret) && secret.length === 0)) {
    throw new Error('Secret is required for token verification');
  }

  const secrets = Array.isArray(secret) ? secret : [secret];
  let lastError: Error | undefined;

  for (const currentSecret of secrets) {
    try {
      const decoded = jwt.verify(token, currentSecret, {
        complete: false,
        algorithms: ['HS256', 'HS384', 'HS512'],
      }) as RefreshTokenPayload;

      // Validate required claims
      if (!decoded.sub || !decoded.sessionId) {
        throw new JWTError(
          JWTVerificationError.MISSING_CLAIMS,
          'Refresh token missing required claims (sub, sessionId)',
        );
      }

      // Validate issuer if expected
      if (expectedIssuer && decoded.iss !== expectedIssuer) {
        throw new JWTError(
          JWTVerificationError.INVALID_ISSUER,
          `Invalid issuer: expected ${expectedIssuer}, got ${decoded.iss}`,
        );
      }

      return decoded;
    } catch (error: unknown) {
      // Type guard to ensure error is an Error object
      const errorObj = error instanceof Error ? error : new Error(String(error));
      lastError = errorObj;

      // Don't try other secrets for non-signature errors
      if (errorObj instanceof JWTError) {
        throw errorObj;
      }

      if (errorObj instanceof jwt.TokenExpiredError) {
        throw new JWTError(
          JWTVerificationError.TOKEN_EXPIRED,
          'Token has expired',
          errorObj,
        );
      }

      if (errorObj instanceof jwt.JsonWebTokenError) {
        // Continue to next secret if signature verification failed
        if (errorObj.message.includes('invalid signature')) {
          continue;
        }

        throw new JWTError(
          JWTVerificationError.MALFORMED_TOKEN,
          `Malformed token: ${errorObj.message}`,
          errorObj,
        );
      }

      // Unknown error type
      continue;
    }
  }

  // All secrets failed
  throw new JWTError(
    JWTVerificationError.INVALID_SIGNATURE,
    'Token signature verification failed with all provided secrets',
    lastError,
  );
}

/**
 * Extracts payload from a token WITHOUT verification
 * Used for debugging or extracting claims before verification
 *
 * @param token - JWT token string
 * @returns Decoded payload (unverified)
 *
 * @warning
 * This function does NOT verify the token signature.
 * NEVER use this for authentication or authorization.
 * For production use, always use verifyAccessToken or verifyRefreshToken.
 */
export function extractPayload<T = unknown>(token: string): T {
  if (!token || typeof token !== 'string') {
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      'Token must be a non-empty string',
    );
  }

  try {
    const decoded = jwt.decode(token, { complete: false });

    if (!decoded || typeof decoded !== 'object') {
      throw new JWTError(
        JWTVerificationError.MALFORMED_TOKEN,
        'Token payload is not a valid JSON object',
      );
    }

    return decoded as T;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      `Failed to decode token: ${errorObj.message}`,
      errorObj,
    );
  }
}
