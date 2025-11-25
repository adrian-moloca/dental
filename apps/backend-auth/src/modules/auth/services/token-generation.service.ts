/**
 * Token Generation Service
 *
 * Handles JWT token generation for authentication responses.
 * Responsible for creating access tokens, refresh tokens, and building
 * JWT payloads with user claims and subscription context.
 *
 * Responsibilities:
 * - Generate access tokens (short-lived, for API authentication)
 * - Generate refresh tokens (long-lived, for token renewal)
 * - Build JWT payloads with user claims
 * - Include cabinet and subscription context in tokens
 * - Map user entities to DTOs for API responses
 *
 * Security:
 * - Access tokens expire in 15 minutes
 * - Refresh tokens bound to sessions
 * - Passwords never included in tokens
 * - Token secrets from environment configuration
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { AuthResponseDto, UserDto, buildRefreshTokenPayload } from '../dto';
import { User } from '../../users/entities/user.entity';
import { Session } from '../../sessions/entities/session.entity';
import type { UUID } from '@dentalos/shared-types';
import type { AppConfig } from '../../../configuration';

/**
 * Token Generation Service
 * Creates JWT tokens and authentication responses
 */
@Injectable()
export class TokenGenerationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AppConfig, true>
  ) {}

  /**
   * Generate authentication response with session
   *
   * Creates complete authentication response with access token, refresh token,
   * and user data. Includes optional cabinet and subscription context.
   *
   * @param user - User entity
   * @param session - Session entity (includes sessionId for refresh token)
   * @param cabinetContext - Optional cabinet and subscription context
   * @returns AuthResponseDto with tokens and user data
   */
  generateAuthResponse(
    user: User,
    session: Session,
    cabinetContext?: {
      cabinetId: UUID;
      subscription: {
        status: string;
        modules: string[];
      } | null;
    }
  ): AuthResponseDto {
    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Build JWT payload with user claims for access token
    const payload: any = {
      sub: user.id, // Subject: user ID
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

    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate refresh token (long-lived, WITH sessionId)
    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId: session.id as UUID,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiration as any,
    });

    // Create plain object response
    const plainResponse = {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
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
   * Creates new access and refresh tokens during token refresh flow.
   * Used when rotating sessions for enhanced security.
   *
   * @param user - User entity
   * @param session - Session entity (new session after rotation)
   * @returns AuthResponseDto with new tokens and user data
   */
  generateTokensForRefresh(user: User, session: Session): AuthResponseDto {
    // Build JWT payload with user claims
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    // Get JWT configuration
    const jwtConfig = this.configService.get('jwt', { infer: true });

    // Generate access token (short-lived, no sessionId)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessExpiration as any,
    });

    // Generate refresh token (long-lived, WITH sessionId)
    const refreshPayload = buildRefreshTokenPayload({
      userId: user.id as UUID,
      sessionId: session.id as UUID,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiration as any,
    });

    // Create plain object response
    const plainResponse = {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 900, // 15 minutes in seconds
      user: this.mapUserToDto(user),
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
      secret: jwtConfig.refreshSecret,
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
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiration as any,
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
