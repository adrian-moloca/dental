/**
 * Token Generation Service
 *
 * Handles JWT token generation for authentication responses.
 * Responsible for creating access tokens, refresh tokens, CSRF tokens,
 * and building JWT payloads with user claims and subscription context.
 *
 * Responsibilities:
 * - Generate access tokens (short-lived, for API authentication)
 * - Generate refresh tokens (long-lived, for token renewal)
 * - Generate CSRF tokens (bound to sessions for CSRF protection)
 * - Build JWT payloads with user claims
 * - Include cabinet and subscription context in tokens
 * - Map user entities to DTOs for API responses
 *
 * @security CRITICAL: RS256 Algorithm Enforcement
 * - ALL tokens are signed with RS256 (RSA + SHA-256)
 * - Private keys are used for signing (never distributed)
 * - Public keys are used for verification (can be distributed)
 * - HS256/HS384/HS512 are NEVER used to prevent algorithm confusion attacks
 *
 * @security CSRF Protection: Double-Submit Cookie Pattern
 * - CSRF token generated on login and bound to session
 * - Token returned in response body AND set as cookie
 * - Frontend must send token in X-CSRF-Token header
 * - Uses cryptographically secure random generation
 *
 * Security:
 * - Access tokens expire in 15 minutes
 * - Refresh tokens bound to sessions
 * - CSRF tokens bound to sessions (24h TTL)
 * - Passwords never included in tokens
 * - RSA key pairs from environment configuration
 *
 * @see CVE-2015-9235 - Algorithm confusion vulnerability
 * @see CVE-2016-10555 - jsonwebtoken algorithm confusion
 * @see OWASP CSRF Prevention Cheat Sheet
 *
 * @module modules/auth/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import { AuthResponseDto, UserDto, buildRefreshTokenPayload } from '../dto';
import { User } from '../../users/entities/user.entity';
import { Session } from '../../sessions/entities/session.entity';
import { CsrfService } from '../../csrf/csrf.service';
import type { UUID } from '@dentalos/shared-types';
import type { AppConfig } from '../../../configuration';

/**
 * Token Generation Service
 * Creates JWT tokens, CSRF tokens, and authentication responses
 */
@Injectable()
export class TokenGenerationService {
  private readonly logger = new Logger(TokenGenerationService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>,
    private readonly csrfService: CsrfService
  ) {}

  /**
   * Generate authentication response with session
   *
   * Creates complete authentication response with access token, refresh token,
   * CSRF token, and user data. Includes optional cabinet and subscription context.
   *
   * Security:
   * - Access token: RS256 signed, 15min expiry
   * - Refresh token: RS256 signed, bound to session, 7d expiry
   * - CSRF token: 256-bit cryptographically random, bound to session
   *
   * @param user - User entity
   * @param session - Session entity (includes sessionId for refresh token and CSRF binding)
   * @param cabinetContext - Optional cabinet and subscription context
   * @returns AuthResponseDto with tokens (including CSRF) and user data
   */
  async generateAuthResponse(
    user: User,
    session: Session,
    cabinetContext?: {
      cabinetId: UUID;
      subscription: {
        status: string;
        modules: string[];
      } | null;
    }
  ): Promise<AuthResponseDto> {
    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Build JWT payload with user claims for access token
    // SECURITY: Include sessionId and jti for session validation and token revocation
    const payload: any = {
      sub: user.id, // Subject: user ID
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      sessionId: session.id, // Required for session validation
      jti: randomUUID(), // JWT ID for token revocation/blacklisting
    };

    // Include cabinet and subscription context if available
    if (cabinetContext) {
      payload.cabinetId = cabinetContext.cabinetId;

      if (cabinetContext.subscription) {
        payload.subscription = {
          status: cabinetContext.subscription.status,
          modules: cabinetContext.subscription.modules,
        };
      }
    }

    // Generate access token (short-lived, WITH sessionId and jti)
    // SECURITY: Uses RS256 (configured in JwtModule) with private key
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate refresh token (long-lived, WITH sessionId)
    // SECURITY: Refresh tokens use separate RSA key pair with RS256
    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId: session.id as UUID,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      // SECURITY: Use refresh private key for signing (RS256)
      privateKey: jwtConfig.refreshPrivateKey,
      algorithm: 'RS256',
      expiresIn: jwtConfig.refreshExpiration as any,
    });

    // Generate CSRF token (bound to user session)
    // SECURITY: 256-bit cryptographically secure random token
    // SECURITY: Stored in Redis with session binding for validation
    const csrfToken = await this.csrfService.generateToken(user.id as UUID, session.id as UUID);

    this.logger.debug({
      message: 'Generated authentication response with CSRF token',
      userId: user.id,
      sessionId: session.id,
    });

    // Create plain object response
    const plainResponse = {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
      csrfToken,
    };

    // Transform to class instance with @Expose() decorators applied
    // This ensures ClassSerializerInterceptor will serialize correctly
    return plainToInstance(AuthResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Generate tokens for session rotation
   *
   * Creates new access, refresh, and CSRF tokens during token refresh flow.
   * Used when rotating sessions for enhanced security.
   *
   * Security:
   * - New CSRF token is generated to prevent token fixation attacks
   * - Old CSRF token is automatically invalidated by new session
   *
   * @param user - User entity
   * @param session - Session entity (new session after rotation)
   * @returns AuthResponseDto with new tokens (including CSRF) and user data
   */
  async generateTokensForRefresh(user: User, session: Session): Promise<AuthResponseDto> {
    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Build JWT payload with user claims
    // SECURITY: Include sessionId and jti for session validation and token revocation
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      sessionId: session.id, // Required for session validation
      jti: randomUUID(), // JWT ID for token revocation/blacklisting
    };

    // Generate access token (short-lived, WITH sessionId and jti)
    // SECURITY: Uses RS256 (configured in JwtModule) with private key
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate refresh token (long-lived, WITH sessionId)
    // SECURITY: Refresh tokens use separate RSA key pair with RS256
    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId: session.id as UUID,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      // SECURITY: Use refresh private key for signing (RS256)
      privateKey: jwtConfig.refreshPrivateKey,
      algorithm: 'RS256',
      expiresIn: jwtConfig.refreshExpiration as any,
    });

    // Generate new CSRF token for the new session
    // SECURITY: Prevents CSRF token fixation by issuing new token on rotation
    const csrfToken = await this.csrfService.generateToken(user.id as UUID, session.id as UUID);

    this.logger.debug({
      message: 'Generated refresh response with new CSRF token',
      userId: user.id,
      sessionId: session.id,
    });

    // Create plain object response
    const plainResponse = {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
      csrfToken,
    };

    // Transform to class instance with @Expose() decorators applied
    // This ensures ClassSerializerInterceptor will serialize correctly
    return plainToInstance(AuthResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Generate temporary refresh token for session creation
   *
   * Creates a temporary refresh token needed during session creation.
   * The real refresh token with actual sessionId is generated after session is created.
   *
   * @param user - User entity
   * @returns Temporary refresh token JWT string
   *
   * @security Uses RS256 with refresh private key
   */
  generateTemporaryRefreshToken(user: User): string {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId: 'temp' as UUID, // Temporary placeholder
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    return this.jwtService.sign(refreshPayload, {
      // SECURITY: Use refresh private key for signing (RS256)
      privateKey: jwtConfig.refreshPrivateKey,
      algorithm: 'RS256',
      expiresIn: jwtConfig.refreshExpiration as any,
    });
  }

  /**
   * Generate final refresh token with actual sessionId
   *
   * Creates the final refresh token after session has been created in Redis.
   * Replaces the temporary sessionId with the actual session ID.
   *
   * @param user - User entity
   * @param sessionId - Actual session ID from Redis
   * @returns Final refresh token JWT string
   *
   * @security Uses RS256 with refresh private key
   */
  generateFinalRefreshToken(user: User, sessionId: UUID): string {
    const jwtConfig = this.configService.get('jwt', { infer: true });

    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    return this.jwtService.sign(refreshPayload, {
      // SECURITY: Use refresh private key for signing (RS256)
      privateKey: jwtConfig.refreshPrivateKey,
      algorithm: 'RS256',
      expiresIn: jwtConfig.refreshExpiration as any,
    });
  }

  /**
   * Generate tokens for session rotation with pre-generated refresh token
   *
   * Creates new access token and CSRF token, using the provided refresh token.
   * This is used when the refresh token was already generated and hashed
   * in the session, ensuring token consistency.
   *
   * @param user - User entity
   * @param session - Session entity (new session after rotation)
   * @param refreshToken - Pre-generated refresh token
   * @returns AuthResponseDto with tokens (including CSRF) and user data
   */
  async generateTokensForRefreshWithToken(
    user: User,
    session: Session,
    refreshToken: string
  ): Promise<AuthResponseDto> {
    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Build JWT payload with user claims
    // SECURITY: Include sessionId and jti for session validation and token revocation
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      sessionId: session.id, // Required for session validation
      jti: randomUUID(), // JWT ID for token revocation/blacklisting
    };

    // Generate access token (short-lived, WITH sessionId and jti)
    // SECURITY: Uses RS256 (configured in JwtModule) with private key
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate new CSRF token for the new session
    // SECURITY: Prevents CSRF token fixation by issuing new token on rotation
    const csrfToken = await this.csrfService.generateToken(user.id as UUID, session.id as UUID);

    this.logger.debug({
      message: 'Generated refresh response with pre-generated token and new CSRF token',
      userId: user.id,
      sessionId: session.id,
    });

    // Create plain object response - use the provided refreshToken
    const plainResponse = {
      accessToken,
      refreshToken, // Use the pre-generated token that was hashed in session
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
      csrfToken,
    };

    // Transform to class instance with @Expose() decorators applied
    // This ensures ClassSerializerInterceptor will serialize correctly
    return plainToInstance(AuthResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Generate authentication response with pre-generated refresh token and cabinet context
   *
   * Creates complete authentication response using an already-generated refresh token.
   * This ensures the returned refresh token matches the hash stored in the session.
   *
   * @param user - User entity
   * @param session - Session entity
   * @param cabinetContext - Optional cabinet and subscription context
   * @param refreshToken - Pre-generated refresh token that was hashed in session
   * @returns AuthResponseDto with tokens (including CSRF) and user data
   */
  async generateAuthResponseWithToken(
    user: User,
    session: Session,
    cabinetContext:
      | {
          cabinetId: UUID;
          subscription: {
            status: string;
            modules: string[];
          } | null;
        }
      | undefined,
    refreshToken: string
  ): Promise<AuthResponseDto> {
    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Build JWT payload with user claims for access token
    // SECURITY: Include sessionId and jti for session validation and token revocation
    const payload: any = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      sessionId: session.id, // Required for session validation
      jti: randomUUID(), // JWT ID for token revocation/blacklisting
    };

    // Include cabinet and subscription context if available
    if (cabinetContext) {
      payload.cabinetId = cabinetContext.cabinetId;

      if (cabinetContext.subscription) {
        payload.subscription = {
          status: cabinetContext.subscription.status,
          modules: cabinetContext.subscription.modules,
        };
      }
    }

    // Generate access token (short-lived, WITH sessionId and jti)
    // SECURITY: Uses RS256 (configured in JwtModule) with private key
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate CSRF token (bound to user session)
    // SECURITY: 256-bit cryptographically secure random token
    // SECURITY: Stored in Redis with session binding for validation
    const csrfToken = await this.csrfService.generateToken(user.id as UUID, session.id as UUID);

    this.logger.debug({
      message: 'Generated authentication response with pre-generated token',
      userId: user.id,
      sessionId: session.id,
    });

    // Create plain object response - use the provided refreshToken
    const plainResponse = {
      accessToken,
      refreshToken, // Use the pre-generated token that was hashed in session
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
      csrfToken,
    };

    // Transform to class instance with @Expose() decorators applied
    // This ensures ClassSerializerInterceptor will serialize correctly
    return plainToInstance(AuthResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Build JWT payload with cabinet and subscription context
   *
   * Creates JWT payload structure with optional cabinet/subscription data.
   * Used when generating tokens with subscription context.
   *
   * @param user - User entity
   * @param cabinetContext - Optional cabinet and subscription context
   * @returns JWT payload object
   */
  buildJwtPayload(
    user: User,
    cabinetContext?: {
      cabinetId: UUID;
      subscription: {
        status: string;
        modules: string[];
      } | null;
    }
  ): any {
    const payload: any = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    // Include cabinet and subscription context if available
    if (cabinetContext) {
      payload.cabinetId = cabinetContext.cabinetId;

      if (cabinetContext.subscription) {
        payload.subscription = {
          status: cabinetContext.subscription.status,
          modules: cabinetContext.subscription.modules,
        };
      }
    }

    return payload;
  }

  /**
   * Map User entity to DTO
   *
   * Transforms database entity to API response format.
   * Excludes passwordHash and internal metadata.
   *
   * @param user - User entity from database
   * @returns UserDto for API response
   */
  mapUserToDto(user: User): UserDto {
    // Create plain object with user data
    const plainUser = {
      id: user.id as UUID,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      roles: user.roles,
      permissions: user.permissions,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    // Transform to class instance with @Expose() decorators applied
    // This ensures ClassSerializerInterceptor will serialize correctly
    return plainToInstance(UserDto, plainUser, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }
}
