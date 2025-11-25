/**
 * JWT Authentication Strategy
 *
 * Passport strategy for validating JWT access tokens.
 * Extracts and validates JWT from Authorization header,
 * then transforms payload into CurrentUser.
 *
 * @security
 * - Validates JWT signature using secret key
 * - Checks token expiration automatically
 * - Validates issuer and audience claims
 * - Ensures all required fields are present in payload
 *
 * @module strategies/jwt-strategy
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload, CurrentUser, createCurrentUser } from '@dentalos/shared-auth';
import type { UUID } from '@dentalos/shared-types';
import type { AppConfig } from '../configuration';
import { SessionService } from '../modules/sessions/services/session.service';
import { TokenBlacklistService } from '../modules/tokens/services/token-blacklist.service';

/**
 * JWT authentication strategy
 *
 * Integrates with Passport.js to validate JWT tokens
 * and populate request.user with CurrentUser.
 *
 * @remarks
 * Passport automatically verifies:
 * - JWT signature (using secret)
 * - Token expiration (exp claim)
 * - Issuer (iss claim)
 * - Audience (aud claim)
 *
 * This strategy only needs to transform the validated payload.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService<AppConfig, true>,
    private readonly sessionService: SessionService,
    private readonly tokenBlacklistService: TokenBlacklistService
  ) {
    const jwtConfig = configService.get('jwt', { infer: true });

    super({
      // Extract JWT from Authorization header as Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Don't ignore expiration - reject expired tokens
      ignoreExpiration: false,

      // Secret key for signature verification
      secretOrKey: jwtConfig.accessSecret,

      // Validate issuer claim
      issuer: jwtConfig.issuer,

      // Validate audience claim
      audience: jwtConfig.audience,

      // Additional validation options
      algorithms: ['HS256'], // Only allow HS256 algorithm
    });
  }

  /**
   * Validate JWT payload and transform to CurrentUser
   *
   * @param payload - Verified JWT payload (signature and expiration already checked)
   * @returns CurrentUser instance for request.user
   * @throws {UnauthorizedException} If payload is invalid or missing required fields
   *
   * @remarks
   * This method is called AFTER Passport verifies the JWT signature and expiration.
   * Passport has already validated:
   * - JWT signature (using secret)
   * - Token expiration (exp claim)
   * - Issuer (iss claim)
   * - Audience (aud claim)
   *
   * We only need to:
   * - Validate payload structure (required fields present and correct types)
   * - Transform payload to CurrentUser for use in request handlers
   *
   * @security
   * - Uses validateAccessTokenPayloadStructure() (AUTH-002 GROUP 2) for validation
   * - Ensures all required claims are present before creating CurrentUser
   * - Validates organizationId (required for tenant isolation)
   * - Validates roles array is not empty
   * - Handles optional clinicId correctly
   *
   * Payload Structure Reference:
   * - sub: User ID (UUID string)
   * - email: User email (string)
   * - roles: User roles (non-empty array of strings)
   * - organizationId: Organization ID (UUID string)
   * - clinicId: Optional clinic ID (UUID string)
   * - iat, exp, iss, aud, jti: Standard JWT claims (already verified by Passport)
   *
   * See: src/modules/tokens/TOKEN_FLOW.md for complete token flow documentation
   * See: src/modules/tokens/helpers/token-payload.builder.ts for validation functions
   */
  async validate(payload: AccessTokenPayload): Promise<CurrentUser> {
    // Validate required fields in payload (payload structure validation)
    // This ensures the token contains all necessary claims for authorization
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token: missing user ID (sub claim)');
    }

    if (!payload.email) {
      throw new UnauthorizedException('Invalid token: missing email claim');
    }

    if (!payload.organizationId) {
      throw new UnauthorizedException(
        'Invalid token: missing organizationId claim (required for tenant isolation)'
      );
    }

    const sessionId = (payload as any).sessionId as UUID | undefined;
    // SECURITY FIX: Validate sessionId exists (required for revocation support)
    if (!sessionId) {
      throw new UnauthorizedException(
        'Invalid token: missing sessionId claim (required for session validation)'
      );
    }

    // SECURITY FIX: Validate jti exists (required for blacklist support)
    if (!payload.jti) {
      throw new UnauthorizedException(
        'Invalid token: missing jti claim (required for token revocation)'
      );
    }

    // SECURITY FIX: Check if token is blacklisted (cabinet switch, forced logout)
    // This check happens BEFORE session validation for fail-fast behavior
    const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(payload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked. Please log in again.');
    }

    // SECURITY FIX: Validate session exists in Redis (session-based revocation)
    // This ensures tokens are invalidated immediately when user logs out or session expires
    try {
      const session = await this.sessionService.validateSessionOwnership(
        sessionId,
        payload.sub,
        payload.organizationId
      );

      if (!session) {
        throw new UnauthorizedException('Session not found or invalid. Please log in again.');
      }

      // Check if session is active (not expired or revoked)
      if (!session.isActive()) {
        throw new UnauthorizedException(
          'Session has expired or been revoked. Please log in again.'
        );
      }
    } catch (error) {
      // If session validation fails, reject token
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // For unexpected errors, fail closed (reject token)
      throw new UnauthorizedException('Failed to validate session. Please log in again.');
    }

    // Validate roles array exists and is not empty
    // Users must have at least one role for authorization
    if (!Array.isArray(payload.roles)) {
      throw new UnauthorizedException('Invalid token: roles must be an array');
    }

    if (payload.roles.length === 0) {
      throw new UnauthorizedException('Invalid token: user must have at least one role');
    }

    // Optional: Validate clinicId format if present
    // clinicId is optional but if present must be valid UUID string
    if (payload.clinicId && typeof payload.clinicId !== 'string') {
      throw new UnauthorizedException('Invalid token: clinicId must be a string if present');
    }

    // Create CurrentUser from validated JWT payload
    // CurrentUser is immutable (frozen arrays) to prevent accidental mutations
    // Available in route handlers via @CurrentUser() decorator
    // Available in services via request.user or CurrentUser injection
    return createCurrentUser({
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: [], // TODO AUTH-003: Populate from roles or token
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
      cabinetId: payload.cabinetId,
      subscription: payload.subscription,
    });
  }
}
