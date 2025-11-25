/**
 * Tokens Module
 *
 * Manages JWT token generation, validation, and revocation.
 *
 * Architecture:
 * - Token Payload Builder: Constructs JWT payloads from User entities (token-payload.builder.ts)
 * - Token Service: Generates and validates tokens (TODO AUTH-005)
 * - Refresh Token Repository: Manages refresh token persistence in Redis (TODO AUTH-005)
 * - Token Revocation: Tracks revoked tokens for logout and permission changes (TODO AUTH-005)
 *
 * Integration Points:
 * - Shared-Auth: Token verification utilities (verifyAccessToken, verifyRefreshToken)
 * - App Module: JwtModule for token signing
 * - JWT Strategy: Token validation and CurrentUser transformation
 * - Sessions Module: Session management tied to refresh tokens
 *
 * AUTH-002 GROUP 2: Token Helper Utilities
 * - Created token-payload.builder.ts with:
 *   * buildAccessTokenPayload() - Constructs access token from User entity
 *   * buildRefreshTokenPayload() - Constructs refresh token from User + Session
 *   * validateAccessTokenPayloadStructure() - Validates required claims
 *   * validateRefreshTokenPayloadStructure() - Validates refresh token claims
 * - Documented JWT configuration consistency in JWT_CONFIGURATION_VALIDATION.md
 * - Integrated with JwtStrategy for CurrentUser transformation
 *
 * AUTH-005: Refresh Token Implementation (FUTURE)
 * When implementing AUTH-005, implement the following features:
 *
 * 1. Refresh Token Storage in Redis
 *    - Store refresh tokens indexed by sessionId for quick lookup
 *    - Schema: dentalos:auth:refresh:session:{sessionId}
 *    - Include: userId, jti, issuedAt, expiresAt, rotated, previousJti
 *    - TTL: 7 days (match JWT_REFRESH_EXPIRATION)
 *    - TODO AUTH-005: Create RedisRefreshTokenRepository service
 *    - TODO AUTH-005: Implement saveRefreshToken(sessionId, token) method
 *    - TODO AUTH-005: Implement getRefreshToken(sessionId) method
 *    - TODO AUTH-005: Implement revokeRefreshToken(sessionId) method
 *
 * 2. Token Refresh Endpoint (/auth/refresh)
 *    - Accept refresh token in request body or cookies
 *    - Verify refresh token signature and expiration
 *    - Look up session in Redis to verify token hasn't been revoked
 *    - TODO AUTH-005: Verify sessionId in Redis (prevents logout bypass)
 *    - TODO AUTH-005: Check jti matches stored jti (prevents replay attacks)
 *    - TODO AUTH-005: Detect token reuse (compare against previousJti)
 *    - TODO AUTH-005: Return 401 if reuse detected (security incident)
 *    - Generate new access token from session user
 *    - TODO AUTH-005: Generate new refresh token (token rotation)
 *    - TODO AUTH-005: Store old refresh token jti in revocation set
 *    - TODO AUTH-005: Return both tokens in response
 *
 * 3. Token Rotation Strategy
 *    - On each refresh: Revoke old refresh token, issue new one
 *    - Prevents compromise of single refresh token (limited window)
 *    - Allows detection of stolen tokens (reuse attack)
 *    - TODO AUTH-005: Implement rotateRefreshToken() method
 *    - TODO AUTH-005: Track previousJti for reuse detection
 *    - TODO AUTH-005: Implement MAX_TOKEN_REUSE_WINDOW (e.g., 1 minute)
 *    - TODO AUTH-005: Auto-invalidate session if reuse detected
 *
 * 4. Token Revocation (Logout)
 *    - Delete refresh token from Redis immediately (instant revocation)
 *    - Optional: Add access token jti to blacklist with short TTL
 *    - TODO AUTH-005: Implement revokeAllSessions(userId) for account lockout
 *    - TODO AUTH-005: Implement logoutAllDevices endpoint
 *    - TODO AUTH-005: Track device fingerprints for multi-device sessions
 *
 * 5. Access Token Revocation (Permission Changes)
 *    - When user roles/permissions change, invalidate access token
 *    - Option A: Add access token jti to blacklist (Redis key with TTL)
 *    - Option B: Invalidate all tokens for user (force re-authentication)
 *    - Option C: Update permissions in CurrentUser (but requires cache invalidation)
 *    - TODO AUTH-005: Decide on revocation strategy with Product
 *    - TODO AUTH-005: Implement permission change listeners
 *    - TODO AUTH-005: Hook into user role/permission updates
 *
 * 6. Token Expiration Monitoring
 *    - Monitor when refresh tokens approach expiration (warn before expiry)
 *    - Clean up expired refresh token data from Redis periodically
 *    - TODO AUTH-005: Implement background job for cleanup
 *    - TODO AUTH-005: Check Redis TTL is set correctly
 *    - TODO AUTH-005: Log and alert on unusual token expiration patterns
 *
 * Security Considerations:
 * - Refresh tokens are sensitive: store in HTTP-only cookies when possible
 * - Add CSRF protection if using cookies for refresh tokens
 * - Implement rate limiting on /auth/refresh endpoint
 * - Log token refresh events for audit trail
 * - Monitor for unusual refresh patterns (indication of compromise)
 * - Consider adding device fingerprinting to prevent token theft
 * - Implement maximum concurrent sessions per user
 *
 * @module modules/tokens
 */

import { Module } from '@nestjs/common';
import { TokenBlacklistService } from './services/token-blacklist.service';

/**
 * Tokens module
 *
 * Exports token payload builders and blacklist service for auth service integration.
 * Includes TokenBlacklistService for token revocation support (cabinet switches, forced logout).
 */
@Module({
  imports: [],
  controllers: [],
  providers: [TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class TokensModule {}
