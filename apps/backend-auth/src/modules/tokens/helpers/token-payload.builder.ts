/**
 * Token Payload Builder
 *
 * Constructs JWT payloads from User entities and validates payload structure.
 * Ensures consistent payload format across all token generation.
 *
 * Security:
 * - Validates all required claims are present before token generation
 * - Encodes minimal required information to reduce token size
 * - Includes issuer and audience for claim validation
 * - Separates access token (full user context) from refresh token (minimal data)
 *
 * @module modules/tokens/helpers/token-payload
 */

import { AccessTokenPayload, RefreshTokenPayload } from '@dentalos/shared-auth';
import { UUID, UserRole, OrganizationId, ClinicId, Email } from '@dentalos/shared-types';

/**
 * User entity interface (minimal required fields for token building)
 * Should match User entity from users module
 */
export interface UserForTokenPayload {
  readonly id: UUID;
  readonly email: Email;
  readonly roles: readonly UserRole[];
  readonly organizationId: OrganizationId;
  readonly clinicId?: ClinicId;
}

/**
 * Session entity interface (minimal required fields for refresh tokens)
 */
export interface SessionForTokenPayload {
  readonly id: UUID;
  readonly userId: UUID;
}

/**
 * Token payload builder configuration
 */
export interface TokenPayloadBuilderConfig {
  readonly issuer: string;
  readonly audience?: string;
  readonly accessTokenTtl: number; // in seconds
  readonly refreshTokenTtl: number; // in seconds
}

/**
 * Validates required fields for token payload construction
 *
 * @param user - User entity to validate
 * @throws {Error} If any required field is missing or invalid
 */
function validateUserForTokenPayload(user: UserForTokenPayload): void {
  if (!user.id || typeof user.id !== 'string') {
    throw new Error('User ID is required and must be a UUID string');
  }

  if (!user.email || typeof user.email !== 'string') {
    throw new Error('User email is required and must be a string');
  }

  if (!Array.isArray(user.roles) || user.roles.length === 0) {
    throw new Error('User must have at least one role');
  }

  if (!user.organizationId || typeof user.organizationId !== 'string') {
    throw new Error('Organization ID is required and must be a UUID string');
  }

  // clinicId is optional, no validation needed if not present
}

/**
 * Builds an access token payload from a User entity
 *
 * Access token contains full user context including:
 * - User identification (sub, email)
 * - User roles
 * - Tenant context (organizationId, clinicId)
 * - Standard JWT claims (iat, exp, iss, aud, jti)
 *
 * Token is intended for API authentication and authorization decisions.
 *
 * @param user - User entity to build token payload from
 * @param config - Token configuration (issuer, audience, TTL)
 * @returns AccessTokenPayload with all required claims
 *
 * @throws {Error} If user data is invalid or missing required fields
 *
 * Example:
 * ```typescript
 * const user = { id: 'uuid', email: 'user@example.com', roles: ['user'], organizationId: 'org-id' };
 * const config = { issuer: 'dentalos-auth', audience: 'dentalos-api', accessTokenTtl: 900, refreshTokenTtl: 604800 };
 * const payload = buildAccessTokenPayload(user, config);
 * // Returns: { sub: 'uuid', email: '...', roles: [...], organizationId: '...', iat: ..., exp: ..., ... }
 * ```
 *
 * @security
 * - Validates all required fields before building payload
 * - Uses readonly types to prevent accidental mutation
 * - Includes standard JWT claims (iat, exp, iss)
 * - Generates unique jti for token tracking and revocation
 */
export function buildAccessTokenPayload(
  user: UserForTokenPayload,
  config: TokenPayloadBuilderConfig
): AccessTokenPayload {
  // Validate user data before building payload
  validateUserForTokenPayload(user);

  // Current time in seconds (Unix epoch)
  const issuedAt = Math.floor(Date.now() / 1000);

  // Expiration time = now + TTL
  const expiresAt = issuedAt + config.accessTokenTtl;

  // Generate unique JWT ID for token tracking
  // Format: 'jti_' + short random string (will be replaced with UUID in production)
  const jti = `jti_${generateRandomId()}`;

  // Build access token payload
  const payload: AccessTokenPayload = {
    // Standard JWT claims
    sub: user.id,
    iat: issuedAt,
    exp: expiresAt,
    iss: config.issuer,
    aud: config.audience,
    jti,
    sessionId: user.id,

    // User identity claims
    email: user.email,
    roles: user.roles,

    // Tenant context claims
    organizationId: user.organizationId,
    clinicId: user.clinicId,
  };

  return payload;
}

/**
 * Builds a refresh token payload from a User and Session entity
 *
 * Refresh token contains minimal information:
 * - User ID (sub) for identifying user
 * - Session ID for session tracking and revocation
 * - Standard JWT claims (iat, exp, iss, aud, jti)
 *
 * Does NOT contain:
 * - User roles (not needed for refresh, roles fetched from access token)
 * - Tenant context (not used in refresh token validation)
 * - Email or other user details (minimal payload = smaller token)
 *
 * Token is intended for obtaining a new access token without re-authentication.
 *
 * @param user - User entity (only ID used from user, session ID is primary)
 * @param session - Session entity with ID for revocation tracking
 * @param config - Token configuration (issuer, audience, TTL)
 * @returns RefreshTokenPayload with minimal claims
 *
 * @throws {Error} If user or session data is invalid
 *
 * Example:
 * ```typescript
 * const user = { id: 'user-id', ... };
 * const session = { id: 'session-id', userId: 'user-id' };
 * const config = { issuer: 'dentalos-auth', audience: 'dentalos-api', accessTokenTtl: 900, refreshTokenTtl: 604800 };
 * const payload = buildRefreshTokenPayload(user, session, config);
 * // Returns: { sub: 'user-id', sessionId: 'session-id', iat: ..., exp: ..., ... }
 * ```
 *
 * @security
 * - Validates user and session IDs before building payload
 * - Minimal payload reduces token size and exposure surface
 * - Session ID enables revocation by invalidating session in Redis
 * - Includes unique jti for tracking refresh token usage
 *
 * @future AUTH-005
 * - Refresh token will be stored in Redis with session ID as key
 * - Token rotation will revoke old refresh token and issue new one
 * - Session tracking enables detection of token reuse attacks
 */
export function buildRefreshTokenPayload(
  user: UserForTokenPayload,
  session: SessionForTokenPayload,
  config: TokenPayloadBuilderConfig
): RefreshTokenPayload {
  // Validate user data
  if (!user.id || typeof user.id !== 'string') {
    throw new Error('User ID is required for refresh token payload');
  }

  // Validate session data
  if (!session.id || typeof session.id !== 'string') {
    throw new Error('Session ID is required for refresh token payload');
  }

  if (!session.userId || typeof session.userId !== 'string') {
    throw new Error('Session user ID is required for refresh token payload');
  }

  // Verify session belongs to user
  if (session.userId !== user.id) {
    throw new Error('Session does not belong to user');
  }

  // Current time in seconds (Unix epoch)
  const issuedAt = Math.floor(Date.now() / 1000);

  // Expiration time = now + TTL
  // Refresh token TTL is longer (7 days) compared to access token (15 minutes)
  const expiresAt = issuedAt + config.refreshTokenTtl;

  // Generate unique JWT ID for token tracking and revocation
  const jti = `jti_${generateRandomId()}`;

  // Build refresh token payload with minimal information
  const payload: RefreshTokenPayload = {
    // Standard JWT claims
    sub: user.id,
    iat: issuedAt,
    exp: expiresAt,
    iss: config.issuer,
    aud: config.audience,
    jti,

    // Session tracking for revocation
    sessionId: session.id,
  };

  return payload;
}

/**
 * Validates access token payload structure
 *
 * Checks that all required claims are present and have correct types.
 * This is used AFTER JWT signature verification to validate the payload structure.
 *
 * JWT signature verification by Passport handles:
 * - Signature validity
 * - Expiration (exp claim)
 * - Issuer validation (iss claim)
 * - Audience validation (aud claim)
 *
 * This validator focuses on:
 * - Required custom claims (sub, email, roles, organizationId)
 * - Type correctness
 * - Array structure for roles
 * - Presence of tenant context
 *
 * @param payload - Access token payload to validate
 * @returns true if payload is valid
 * @throws {Error} If payload is invalid
 *
 * @remarks
 * This is called by JwtStrategy.validate() after Passport verifies the token.
 * By this point, we know:
 * - Token signature is valid
 * - Token is not expired
 * - Issuer and audience claims match configuration
 *
 * We only need to validate the custom claims specific to our application.
 */
export function validateAccessTokenPayloadStructure(
  payload: unknown
): payload is AccessTokenPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a non-null object');
  }

  const p = payload as Record<string, unknown>;

  // Validate required standard JWT claims (should be present after signature verification)
  if (typeof p.sub !== 'string') {
    throw new Error('Invalid token: missing or invalid sub (user ID) claim');
  }

  if (typeof p.email !== 'string') {
    throw new Error('Invalid token: missing or invalid email claim');
  }

  if (!Array.isArray(p.roles)) {
    throw new Error('Invalid token: roles must be an array');
  }

  if (p.roles.length === 0) {
    throw new Error('Invalid token: roles array cannot be empty');
  }

  if (typeof p.organizationId !== 'string') {
    throw new Error('Invalid token: missing or invalid organizationId claim');
  }

  // clinicId is optional, validate only if present
  if (p.clinicId !== undefined && typeof p.clinicId !== 'string') {
    throw new Error('Invalid token: clinicId must be a string if present');
  }

  // Validate standard JWT claims presence
  if (typeof p.iat !== 'number') {
    throw new Error('Invalid token: missing or invalid iat (issued at) claim');
  }

  if (typeof p.exp !== 'number') {
    throw new Error('Invalid token: missing or invalid exp (expiration) claim');
  }

  if (typeof p.iss !== 'string') {
    throw new Error('Invalid token: missing or invalid iss (issuer) claim');
  }

  return true;
}

/**
 * Validates refresh token payload structure
 *
 * Checks that all required refresh token claims are present and have correct types.
 * This is used AFTER JWT signature verification.
 *
 * Refresh tokens have minimal payloads:
 * - sub: User ID
 * - sessionId: Session ID for revocation tracking
 * - Standard JWT claims: iat, exp, iss, aud
 *
 * @param payload - Refresh token payload to validate
 * @returns true if payload is valid
 * @throws {Error} If payload is invalid
 *
 * @remarks
 * Refresh tokens don't contain user roles or tenant context because they're
 * only used to obtain a new access token, which will contain that information.
 */
export function validateRefreshTokenPayloadStructure(
  payload: unknown
): payload is RefreshTokenPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload must be a non-null object');
  }

  const p = payload as Record<string, unknown>;

  // Validate required claims for refresh token
  if (typeof p.sub !== 'string') {
    throw new Error('Invalid token: missing or invalid sub (user ID) claim');
  }

  if (typeof p.sessionId !== 'string') {
    throw new Error('Invalid token: missing or invalid sessionId claim');
  }

  // Validate standard JWT claims
  if (typeof p.iat !== 'number') {
    throw new Error('Invalid token: missing or invalid iat (issued at) claim');
  }

  if (typeof p.exp !== 'number') {
    throw new Error('Invalid token: missing or invalid exp (expiration) claim');
  }

  if (typeof p.iss !== 'string') {
    throw new Error('Invalid token: missing or invalid iss (issuer) claim');
  }

  return true;
}

/**
 * Generates a random ID for JTI (JWT ID) claim
 *
 * FUTURE (AUTH-005): Replace with UUID v4 generator when UUID package is available
 *
 * @returns Random ID string (not cryptographically secure - for demo only)
 * @internal
 */
function generateRandomId(): string {
  // TODO AUTH-005: Replace with crypto.randomUUID() or uuid.v4()
  // For now, using timestamp + random number for basic uniqueness
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
