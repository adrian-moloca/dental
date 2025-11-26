/**
 * JWT verification utilities
 * @module shared-auth/jwt/verifier
 *
 * @security IMPORTANT: Algorithm Confusion Attack Prevention
 * This module ONLY accepts RS256 algorithm to prevent algorithm confusion attacks.
 * See: CVE-2015-9235, CVE-2016-10555
 *
 * RS256 (RSA + SHA-256) is mandatory because:
 * 1. Asymmetric signing prevents key confusion attacks
 * 2. Private key never leaves the auth service
 * 3. Public key can be safely distributed to all services
 * 4. Industry standard for distributed systems
 *
 * NEVER add HS256/HS384/HS512 to the allowed algorithms list.
 */

import * as jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload } from './jwt-payload.types';

/**
 * Allowed JWT signing algorithms
 *
 * @security CRITICAL: Only RS256 is permitted
 * Adding symmetric algorithms (HS256, HS384, HS512) would expose
 * the system to algorithm confusion attacks where an attacker
 * could forge tokens using the public key as an HMAC secret.
 */
export const ALLOWED_JWT_ALGORITHMS: jwt.Algorithm[] = ['RS256'];

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
  ALGORITHM_MISMATCH = 'ALGORITHM_MISMATCH',
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
 * Supports key rotation by accepting multiple public keys
 *
 * @param token - JWT token string
 * @param publicKey - Single public key or array of public keys (for key rotation)
 * @param expectedIssuer - Optional expected issuer to validate
 * @returns Decoded and verified access token payload
 * @throws {JWTError} If token is invalid, expired, or malformed
 *
 * @security CRITICAL: Algorithm Confusion Attack Prevention
 * - ONLY RS256 algorithm is accepted (asymmetric)
 * - Explicitly rejects HS256/HS384/HS512 to prevent key confusion attacks
 * - Verifies signature using provided public key(s)
 * - Validates expiration (exp claim)
 * - Validates issuer if provided
 * - Tries multiple keys in order for graceful key rotation
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 */
export async function verifyAccessToken(
  token: string,
  publicKey: string | string[],
  expectedIssuer?: string,
): Promise<AccessTokenPayload> {
  if (!token || typeof token !== 'string') {
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      'Token must be a non-empty string',
    );
  }

  if (!publicKey || (Array.isArray(publicKey) && publicKey.length === 0)) {
    throw new Error('Public key is required for token verification');
  }

  // Pre-flight check: Decode header to verify algorithm before signature check
  // This prevents timing attacks and provides clearer error messages
  const decodedHeader = jwt.decode(token, { complete: true });
  if (decodedHeader && decodedHeader.header) {
    const tokenAlgorithm = decodedHeader.header.alg;
    if (!ALLOWED_JWT_ALGORITHMS.includes(tokenAlgorithm as jwt.Algorithm)) {
      throw new JWTError(
        JWTVerificationError.ALGORITHM_MISMATCH,
        `Algorithm '${tokenAlgorithm}' is not allowed. Only RS256 is permitted.`,
      );
    }
  }

  const keys = Array.isArray(publicKey) ? publicKey : [publicKey];
  let lastError: Error | undefined;

  for (const currentKey of keys) {
    try {
      const decoded = jwt.verify(token, currentKey, {
        complete: false,
        // SECURITY: ONLY allow RS256 - prevents algorithm confusion attacks
        algorithms: ALLOWED_JWT_ALGORITHMS,
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

  // All keys failed
  throw new JWTError(
    JWTVerificationError.INVALID_SIGNATURE,
    'Token signature verification failed with all provided public keys',
    lastError,
  );
}

/**
 * Verifies a refresh token and returns its payload
 * Supports key rotation by accepting multiple public keys
 *
 * @param token - JWT token string
 * @param publicKey - Single public key or array of public keys (for key rotation)
 * @param expectedIssuer - Optional expected issuer to validate
 * @returns Decoded and verified refresh token payload
 * @throws {JWTError} If token is invalid, expired, or malformed
 *
 * @security CRITICAL: Algorithm Confusion Attack Prevention
 * - ONLY RS256 algorithm is accepted (asymmetric)
 * - Explicitly rejects HS256/HS384/HS512 to prevent key confusion attacks
 * - Verifies signature using provided public key(s)
 * - Validates expiration (exp claim)
 * - Validates issuer if provided
 * - Minimal payload to reduce token size
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 */
export async function verifyRefreshToken(
  token: string,
  publicKey: string | string[],
  expectedIssuer?: string,
): Promise<RefreshTokenPayload> {
  if (!token || typeof token !== 'string') {
    throw new JWTError(
      JWTVerificationError.MALFORMED_TOKEN,
      'Token must be a non-empty string',
    );
  }

  if (!publicKey || (Array.isArray(publicKey) && publicKey.length === 0)) {
    throw new Error('Public key is required for token verification');
  }

  // Pre-flight check: Decode header to verify algorithm before signature check
  const decodedHeader = jwt.decode(token, { complete: true });
  if (decodedHeader && decodedHeader.header) {
    const tokenAlgorithm = decodedHeader.header.alg;
    if (!ALLOWED_JWT_ALGORITHMS.includes(tokenAlgorithm as jwt.Algorithm)) {
      throw new JWTError(
        JWTVerificationError.ALGORITHM_MISMATCH,
        `Algorithm '${tokenAlgorithm}' is not allowed. Only RS256 is permitted.`,
      );
    }
  }

  const keys = Array.isArray(publicKey) ? publicKey : [publicKey];
  let lastError: Error | undefined;

  for (const currentKey of keys) {
    try {
      const decoded = jwt.verify(token, currentKey, {
        complete: false,
        // SECURITY: ONLY allow RS256 - prevents algorithm confusion attacks
        algorithms: ALLOWED_JWT_ALGORITHMS,
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

  // All keys failed
  throw new JWTError(
    JWTVerificationError.INVALID_SIGNATURE,
    'Token signature verification failed with all provided public keys',
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
