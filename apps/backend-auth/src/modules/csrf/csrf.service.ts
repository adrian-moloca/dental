/**
 * CSRF Protection Service
 *
 * Implements double-submit cookie pattern for CSRF protection.
 * Generates cryptographically secure tokens and validates them using
 * timing-safe comparison to prevent timing attacks.
 *
 * Security Architecture:
 * - Token Generation: Uses crypto.randomBytes(32) for 256-bit tokens
 * - Token Validation: Uses crypto.timingSafeEqual() to prevent timing attacks
 * - Token Binding: Tokens are bound to user sessions via Redis
 * - Token Rotation: New token generated on each login/refresh
 *
 * Double-Submit Cookie Pattern:
 * 1. On login, generate CSRF token
 * 2. Return token in response body AND set as cookie (HttpOnly=false so JS can read)
 * 3. Frontend sends token in X-CSRF-Token header on state-changing requests
 * 4. Backend validates header token matches cookie token
 *
 * @security CRITICAL: This service is a core security component
 * - Never log CSRF tokens
 * - Always use timing-safe comparison
 * - Tokens must be cryptographically random
 *
 * @see OWASP CSRF Prevention Cheat Sheet
 * @module modules/csrf
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { CacheService } from '../../common/cache/cache.service';
import type { AppConfig } from '../../configuration';
import type { UUID } from '@dentalos/shared-types';

/**
 * CSRF token metadata stored in Redis
 */
interface CsrfTokenMetadata {
  /** User ID the token belongs to */
  userId: UUID;
  /** Session ID the token is bound to */
  sessionId: UUID;
  /** When the token was created */
  createdAt: number;
  /** Token fingerprint (hash) for audit logging */
  fingerprint: string;
}

/**
 * CSRF Service
 *
 * Provides CSRF token generation, validation, and lifecycle management.
 * Implements defense-in-depth with multiple security layers.
 */
@Injectable()
export class CsrfService {
  private readonly logger = new Logger(CsrfService.name);

  /** Token length in bytes (32 bytes = 256 bits = 64 hex chars) */
  private readonly TOKEN_LENGTH = 32;

  /** Redis key prefix for CSRF tokens */
  private readonly CACHE_PREFIX = 'csrf';

  /** CSRF configuration from environment */
  private readonly csrfConfig: {
    enabled: boolean;
    tokenTtl: number;
    cookieName: string;
    headerName: string;
  };

  constructor(
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService<AppConfig, true>
  ) {
    // Load CSRF configuration
    const securityConfig = this.configService.get('security', { infer: true });
    this.csrfConfig = securityConfig.csrf;

    this.logger.log({
      message: 'CSRF protection initialized',
      enabled: this.csrfConfig.enabled,
      tokenTtl: this.csrfConfig.tokenTtl,
      cookieName: this.csrfConfig.cookieName,
      headerName: this.csrfConfig.headerName,
    });
  }

  /**
   * Check if CSRF protection is enabled
   *
   * @returns true if CSRF protection is enabled
   */
  isEnabled(): boolean {
    return this.csrfConfig.enabled;
  }

  /**
   * Generate a new CSRF token
   *
   * Creates a cryptographically secure random token suitable for
   * use in the double-submit cookie pattern.
   *
   * Security measures:
   * - Uses crypto.randomBytes() for cryptographic randomness
   * - 256-bit token length (32 bytes = 64 hex characters)
   * - Token bound to user session in Redis
   *
   * @param userId - User ID to bind the token to
   * @param sessionId - Session ID to bind the token to
   * @returns Generated CSRF token (hex string)
   */
  async generateToken(userId: UUID, sessionId: UUID): Promise<string> {
    // Generate cryptographically secure random bytes
    const tokenBytes = crypto.randomBytes(this.TOKEN_LENGTH);
    const token = tokenBytes.toString('hex');

    // Create token metadata for session binding
    const metadata: CsrfTokenMetadata = {
      userId,
      sessionId,
      createdAt: Date.now(),
      // Store fingerprint (first 8 chars of SHA256 hash) for audit logging
      // SECURITY: Never log the actual token
      fingerprint: crypto.createHash('sha256').update(token).digest('hex').substring(0, 8),
    };

    // Store token metadata in Redis with session binding
    const cacheKey = this.buildCacheKey(userId, sessionId);
    await this.cacheService.set(cacheKey, metadata, {
      ttl: this.csrfConfig.tokenTtl,
      prefix: this.CACHE_PREFIX,
    });

    // Also store a reverse lookup for token validation
    const tokenCacheKey = this.buildTokenCacheKey(token);
    await this.cacheService.set(
      tokenCacheKey,
      { userId, sessionId },
      {
        ttl: this.csrfConfig.tokenTtl,
        prefix: this.CACHE_PREFIX,
      }
    );

    this.logger.debug({
      message: 'CSRF token generated',
      userId,
      sessionId,
      fingerprint: metadata.fingerprint,
    });

    return token;
  }

  /**
   * Validate a CSRF token
   *
   * Validates that the provided tokens match using timing-safe comparison.
   * This prevents timing attacks that could leak information about valid tokens.
   *
   * Validation checks:
   * 1. Both tokens are present and non-empty
   * 2. Both tokens have valid format (hex string, correct length)
   * 3. Tokens match using timing-safe comparison
   * 4. Token is bound to a valid session (optional, for extra security)
   *
   * @param cookieToken - Token from the cookie
   * @param headerToken - Token from the X-CSRF-Token header
   * @param userId - Optional user ID for session binding validation
   * @param sessionId - Optional session ID for session binding validation
   * @returns true if tokens are valid and match, false otherwise
   *
   * @security Uses crypto.timingSafeEqual() to prevent timing attacks
   */
  validateToken(
    cookieToken: string | undefined,
    headerToken: string | undefined,
    userId?: UUID,
    sessionId?: UUID
  ): boolean {
    // SECURITY: Fail fast if either token is missing
    if (!cookieToken || !headerToken) {
      this.logger.warn({
        message: 'CSRF validation failed: missing token',
        hasCookieToken: !!cookieToken,
        hasHeaderToken: !!headerToken,
      });
      return false;
    }

    // SECURITY: Validate token format before comparison
    // Expected: 64 character hex string (32 bytes)
    const tokenRegex = /^[a-f0-9]{64}$/i;
    if (!tokenRegex.test(cookieToken) || !tokenRegex.test(headerToken)) {
      this.logger.warn({
        message: 'CSRF validation failed: invalid token format',
        cookieTokenValid: tokenRegex.test(cookieToken),
        headerTokenValid: tokenRegex.test(headerToken),
      });
      return false;
    }

    // SECURITY: Use timing-safe comparison to prevent timing attacks
    // Convert strings to buffers of equal length for comparison
    try {
      const cookieBuffer = Buffer.from(cookieToken, 'hex');
      const headerBuffer = Buffer.from(headerToken, 'hex');

      // Buffers must be same length for timingSafeEqual
      if (cookieBuffer.length !== headerBuffer.length) {
        this.logger.warn({
          message: 'CSRF validation failed: token length mismatch',
        });
        return false;
      }

      const tokensMatch = crypto.timingSafeEqual(cookieBuffer, headerBuffer);

      if (!tokensMatch) {
        this.logger.warn({
          message: 'CSRF validation failed: tokens do not match',
          // SECURITY: Log fingerprints only, never actual tokens
          cookieFingerprint: crypto
            .createHash('sha256')
            .update(cookieToken)
            .digest('hex')
            .substring(0, 8),
          headerFingerprint: crypto
            .createHash('sha256')
            .update(headerToken)
            .digest('hex')
            .substring(0, 8),
        });
        return false;
      }

      this.logger.debug({
        message: 'CSRF validation successful',
        userId,
        sessionId,
      });

      return true;
    } catch (error) {
      // SECURITY: Any error during comparison should fail closed
      this.logger.error({
        message: 'CSRF validation error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Validate token with session binding (async)
   *
   * Extended validation that also checks the token is bound to the
   * correct user session in Redis. Provides defense-in-depth.
   *
   * @param cookieToken - Token from the cookie
   * @param headerToken - Token from the X-CSRF-Token header
   * @param userId - User ID for session binding validation
   * @param sessionId - Session ID for session binding validation
   * @returns true if tokens are valid, match, and bound to session
   */
  async validateTokenWithSession(
    cookieToken: string | undefined,
    headerToken: string | undefined,
    userId: UUID,
    sessionId: UUID
  ): Promise<boolean> {
    // First perform basic token validation
    if (!this.validateToken(cookieToken, headerToken)) {
      return false;
    }

    // Check session binding in Redis
    const tokenCacheKey = this.buildTokenCacheKey(cookieToken!);
    const storedBinding = await this.cacheService.get<{ userId: UUID; sessionId: UUID }>(
      tokenCacheKey,
      { prefix: this.CACHE_PREFIX }
    );

    if (!storedBinding) {
      this.logger.warn({
        message: 'CSRF validation failed: token not found in session store',
        userId,
        sessionId,
      });
      return false;
    }

    // Validate session binding
    if (storedBinding.userId !== userId || storedBinding.sessionId !== sessionId) {
      this.logger.warn({
        message: 'CSRF validation failed: session binding mismatch',
        expectedUserId: userId,
        expectedSessionId: sessionId,
      });
      return false;
    }

    return true;
  }

  /**
   * Revoke a CSRF token
   *
   * Invalidates a CSRF token, typically called on logout or session termination.
   *
   * @param userId - User ID
   * @param sessionId - Session ID
   */
  async revokeToken(userId: UUID, sessionId: UUID): Promise<void> {
    const cacheKey = this.buildCacheKey(userId, sessionId);
    await this.cacheService.del(cacheKey, { prefix: this.CACHE_PREFIX });

    this.logger.debug({
      message: 'CSRF token revoked',
      userId,
      sessionId,
    });
  }

  /**
   * Revoke all CSRF tokens for a user
   *
   * Invalidates all CSRF tokens for a user, typically called when
   * user logs out of all sessions or account is suspended.
   *
   * @param userId - User ID
   */
  async revokeAllUserTokens(userId: UUID): Promise<void> {
    const pattern = `${userId}:*`;
    await this.cacheService.delPattern(pattern, { prefix: this.CACHE_PREFIX });

    this.logger.debug({
      message: 'All CSRF tokens revoked for user',
      userId,
    });
  }

  /**
   * Get cookie options for CSRF token cookie
   *
   * Returns the cookie configuration for setting the CSRF token cookie.
   * The cookie is NOT HttpOnly so JavaScript can read it for the header.
   *
   * @returns Cookie options object
   *
   * @security
   * - HttpOnly: false (JS needs to read the token)
   * - Secure: true in production (HTTPS only)
   * - SameSite: Strict (prevents cross-site requests)
   * - Path: / (available to all paths)
   */
  getCookieOptions(): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge: number;
  } {
    const nodeEnv = this.configService.get('nodeEnv', { infer: true });
    const isProduction = nodeEnv === 'production';

    return {
      // SECURITY: HttpOnly MUST be false for double-submit cookie pattern
      // The frontend JavaScript needs to read the cookie value to send in header
      httpOnly: false,

      // SECURITY: Secure=true in production ensures cookie only sent over HTTPS
      secure: isProduction,

      // SECURITY: SameSite=Strict prevents the cookie from being sent
      // in cross-site requests, providing additional CSRF protection
      sameSite: 'strict',

      // Cookie available for all paths
      path: '/',

      // Max age matches configured token TTL (in milliseconds)
      maxAge: this.csrfConfig.tokenTtl * 1000,
    };
  }

  /**
   * Get the cookie name for the CSRF token
   *
   * @returns Cookie name string from configuration
   */
  getCookieName(): string {
    return this.csrfConfig.cookieName;
  }

  /**
   * Get the header name for the CSRF token
   *
   * @returns Header name string from configuration
   */
  getHeaderName(): string {
    return this.csrfConfig.headerName;
  }

  /**
   * Build cache key for user/session binding
   */
  private buildCacheKey(userId: UUID, sessionId: UUID): string {
    return `${userId}:${sessionId}`;
  }

  /**
   * Build cache key for token reverse lookup
   */
  private buildTokenCacheKey(token: string): string {
    // Store hash of token, not the token itself
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    return `token:${tokenHash}`;
  }
}
