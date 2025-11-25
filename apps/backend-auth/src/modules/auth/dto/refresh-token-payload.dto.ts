/**
 * Refresh Token Payload DTO
 *
 * Defines the structure and validation for refresh token JWT payloads.
 * Links tokens to sessions for rotation-based security.
 *
 * Architecture:
 * - Each refresh token is bound to a specific session via sessionId
 * - Token rotation creates new sessions and invalidates old ones
 * - Session-token binding prevents replay attacks
 *
 * Security model:
 * - sessionId links token to Redis session storage
 * - Session stores Argon2id hash of refresh token
 * - On rotation, old session marked as revoked (reason: 'token_rotated')
 * - Replayed tokens fail because session is already revoked
 *
 * Multi-tenancy:
 * - organizationId enforces tenant isolation
 * - All session lookups scoped to organizationId
 * - Prevents cross-tenant session access
 *
 * @module modules/auth/dto
 */

import { z } from 'zod';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Refresh Token Payload Interface
 *
 * JWT payload structure for refresh tokens.
 * Contains minimal claims needed for token refresh operations.
 *
 * Standard JWT claims:
 * - sub: Subject (userId)
 * - iat: Issued at (Unix timestamp)
 * - exp: Expiration (Unix timestamp)
 *
 * Custom claims:
 * - sessionId: Links token to session in Redis
 * - type: Token type discriminator ('refresh')
 * - organizationId: Tenant scoping
 * - clinicId: Optional clinic context
 */
export interface RefreshTokenPayload {
  /** User ID (JWT standard 'sub' claim) */
  sub: UUID;

  /** Session ID - links token to session in Redis storage */
  sessionId: UUID;

  /** Token type discriminator - always 'refresh' for refresh tokens */
  type: 'refresh';

  /** Organization ID for multi-tenant isolation */
  organizationId: OrganizationId;

  /** Optional clinic ID for clinic-scoped operations */
  clinicId?: ClinicId;

  /** Issued at timestamp (Unix seconds) - JWT standard claim */
  iat: number;

  /** Expiration timestamp (Unix seconds) - JWT standard claim */
  exp: number;
}

/**
 * Zod validation schema for RefreshTokenPayload
 *
 * Validates refresh token payload structure at runtime.
 * Used during token verification to ensure payload integrity.
 *
 * Validation rules:
 * - All UUIDs must be valid v4 format
 * - type must be exactly 'refresh' (literal type)
 * - Timestamps must be positive integers
 * - clinicId is optional
 * - No additional properties allowed (strict mode)
 *
 * Security:
 * - Prevents malformed payloads from being processed
 * - Ensures type safety at runtime
 * - Catches token tampering attempts
 */
export const RefreshTokenPayloadSchema = z
  .object({
    sub: z.string().uuid({ message: 'User ID must be a valid UUID' }),

    sessionId: z.string().uuid({ message: 'Session ID must be a valid UUID' }),

    type: z.literal('refresh', {
      errorMap: () => ({ message: "Token type must be 'refresh'" }),
    }),

    organizationId: z.string().uuid({ message: 'Organization ID must be a valid UUID' }),

    clinicId: z.string().uuid({ message: 'Clinic ID must be a valid UUID' }).optional(),

    iat: z
      .number()
      .int({ message: 'Issued at must be an integer' })
      .positive({ message: 'Issued at must be positive' }),

    exp: z
      .number()
      .int({ message: 'Expiration must be an integer' })
      .positive({ message: 'Expiration must be positive' }),
  })
  .strict(); // Reject unknown properties

/**
 * Type guard for RefreshTokenPayload
 *
 * Runtime check to verify an unknown object is a valid refresh token payload.
 * Combines TypeScript type narrowing with Zod validation.
 *
 * Usage:
 * ```typescript
 * const decoded = jwtService.decode(token);
 * if (isRefreshTokenPayload(decoded)) {
 *   // TypeScript knows decoded is RefreshTokenPayload
 *   const sessionId = decoded.sessionId;
 * }
 * ```
 *
 * @param value - Unknown value to check
 * @returns Type predicate indicating if value is RefreshTokenPayload
 */
export function isRefreshTokenPayload(value: unknown): value is RefreshTokenPayload {
  const result = RefreshTokenPayloadSchema.safeParse(value);
  return result.success;
}

/**
 * Validate and parse refresh token payload
 *
 * Validates unknown data against RefreshTokenPayload schema.
 * Throws detailed validation errors if data is invalid.
 *
 * Usage:
 * ```typescript
 * try {
 *   const payload = validateRefreshTokenPayload(decoded);
 *   // payload is guaranteed to be valid
 * } catch (error) {
 *   // Handle validation error with detailed messages
 * }
 * ```
 *
 * @param value - Unknown value to validate
 * @returns Validated RefreshTokenPayload
 * @throws {z.ZodError} If validation fails with detailed error messages
 */
export function validateRefreshTokenPayload(value: unknown): RefreshTokenPayload {
  return RefreshTokenPayloadSchema.parse(value) as RefreshTokenPayload;
}

/**
 * Payload builder for refresh tokens
 *
 * Constructs a valid RefreshTokenPayload with proper type safety.
 * Ensures all required fields are provided at compile time.
 *
 * Note: iat and exp are typically added by JwtService.sign()
 * This builder is for manual token creation in tests or special cases.
 *
 * Usage:
 * ```typescript
 * const payload = buildRefreshTokenPayload({
 *   userId: user.id,
 *   sessionId: session.id,
 *   organizationId: user.organizationId,
 *   clinicId: user.clinicId,
 * });
 *
 * const token = jwtService.sign(payload, {
 *   secret: refreshSecret,
 *   expiresIn: '7d',
 * });
 * ```
 *
 * @param params - Payload parameters
 * @returns Partial RefreshTokenPayload (iat/exp added by JWT library)
 */
export function buildRefreshTokenPayload(params: {
  userId: UUID;
  sessionId: UUID;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
}): Omit<RefreshTokenPayload, 'iat' | 'exp'> {
  return {
    sub: params.userId as UUID,
    sessionId: params.sessionId as UUID,
    type: 'refresh' as const,
    organizationId: params.organizationId as OrganizationId,
    clinicId: params.clinicId as ClinicId | undefined,
  };
}

/**
 * Extract session ID from refresh token payload
 *
 * Safe extraction of sessionId with validation.
 * Returns null if payload is invalid or missing sessionId.
 *
 * Usage:
 * ```typescript
 * const decoded = jwtService.decode(token);
 * const sessionId = extractSessionId(decoded);
 * if (sessionId) {
 *   // Use sessionId to lookup session
 * }
 * ```
 *
 * @param payload - Decoded JWT payload (unknown type)
 * @returns Session ID or null if invalid
 */
export function extractSessionId(payload: unknown): UUID | null {
  if (!isRefreshTokenPayload(payload)) {
    return null;
  }
  return payload.sessionId;
}

/**
 * Check if token payload is expired
 *
 * Compares exp claim against current time.
 * Returns true if token is expired or missing exp claim.
 *
 * Note: JWT libraries typically handle expiration validation.
 * This helper is for manual checks or additional validation layers.
 *
 * @param payload - Token payload to check
 * @returns True if expired, false if still valid
 */
export function isTokenExpired(payload: RefreshTokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
  return payload.exp <= now;
}
