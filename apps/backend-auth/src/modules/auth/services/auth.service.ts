/**
 * Authentication Service (Facade)
 *
 * Orchestrates authentication workflows by delegating to specialized services.
 * This service acts as a facade that coordinates between multiple focused services,
 * each handling a single responsibility.
 *
 * Architecture:
 * - AuthenticationService: Core authentication logic (login, register)
 * - CabinetSelectionService: Cabinet management operations
 * - TokenGenerationService: JWT token creation
 * - SessionManagementService: Session lifecycle management
 * - SubscriptionIntegrationService: Subscription service integration
 * - UserManagementService: User data operations
 *
 * Responsibilities:
 * - Coordinate authentication flows
 * - Orchestrate multi-service operations
 * - Handle cabinet selection logic during login
 * - Provide backward-compatible API for controllers
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { StructuredLogger } from '@dentalos/shared-infra';
import {
  RegisterDto,
  LoginDto,
  LoginSmartDto,
  LoginSmartResponseDto,
  SelectOrgDto,
  SelectCabinetDto,
  AuthResponseDto,
  UserDto,
  SessionDto,
  CabinetListResponseDto,
  CabinetSelectionResponseDto,
  CabinetSubscriptionDto,
  SubscriptionStatus,
  ModuleCode,
} from '../dto';
import { User } from '../../users/entities/user.entity';
import { AuthenticationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

// Import specialized services
import { AuthenticationService } from './authentication.service';
import { CabinetSelectionService } from './cabinet-selection.service';
import { TokenGenerationService } from './token-generation.service';
import { SessionManagementService } from './session-management.service';
import { SubscriptionIntegrationService } from './subscription-integration.service';
import { UserManagementService } from './user-management.service';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

/**
 * Authentication Service Facade
 * Coordinates authentication workflows across specialized services
 */
@Injectable()
export class AuthService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly cabinetSelectionService: CabinetSelectionService,
    private readonly tokenGenerationService: TokenGenerationService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly subscriptionIntegrationService: SubscriptionIntegrationService,
    private readonly userManagementService: UserManagementService,
    private readonly emailVerificationService: EmailVerificationService
  ) {
    this.logger = new StructuredLogger('AuthService');
  }

  /**
   * Register a new user
   *
   * Steps:
   * 1. Create user account
   * 2. Generate email verification token
   * 3. Emit email verification event
   * 4. Fetch cabinet and subscription context
   * 5. Generate auth response with session
   *
   * Note: User will need to verify email before logging in again
   */
  async register(dto: RegisterDto, request: Request): Promise<AuthResponseDto> {
    const user = await this.authenticationService.register(dto);

    // Generate email verification token and emit event
    try {
      await this.emailVerificationService.generateVerificationToken(user);
      this.logger.log(
        `Email verification token generated for new user ${user.id} (${user.email})`
      );
    } catch (error) {
      // Non-critical: Log error but don't fail registration
      // User can request resend later
      this.logger.error(
        `Failed to generate verification token for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    const cabinetContext = await this.subscriptionIntegrationService.fetchCabinetAndSubscription(
      user.id as UUID,
      user.organizationId
    );
    return await this.generateAuthResponseWithSession(user, request, cabinetContext || undefined);
  }

  /**
   * Login existing user
   */
  async login(dto: LoginDto, request: Request): Promise<AuthResponseDto> {
    const user = await this.authenticationService.login(dto);
    return await this.handleCabinetSelectionForLogin(user, request);
  }

  /**
   * Smart login
   *
   * When single org: returns full auth response including csrfToken
   * When multiple orgs: returns org list (no tokens, no csrfToken)
   */
  async loginSmart(dto: LoginSmartDto, request: Request): Promise<LoginSmartResponseDto> {
    const result = await this.authenticationService.loginSmart(dto);

    if (!result.needsOrgSelection) {
      const user = result.users[0];
      const authResponse = await this.handleCabinetSelectionForLogin(user, request);

      const response: LoginSmartResponseDto = {
        needsOrgSelection: false,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user,
        csrfToken: authResponse.csrfToken, // Include CSRF token for single-org login
      };

      return response;
    }

    const response: LoginSmartResponseDto = {
      needsOrgSelection: true,
      organizations: result.users.map((u) => ({
        id: u.organizationId,
        name: `Organization ${u.organizationId}`,
        logoUrl: undefined,
      })),
    };

    return response;
  }

  /**
   * Login with organization selection
   */
  async loginSelectOrg(dto: SelectOrgDto, request: Request): Promise<AuthResponseDto> {
    const user = await this.authenticationService.loginSelectOrg(dto);
    return await this.handleCabinetSelectionForLogin(user, request);
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: UUID, organizationId: OrganizationId): Promise<UserDto> {
    return await this.userManagementService.getCurrentUser(userId, organizationId);
  }

  /**
   * Get user cabinets
   */
  async getUserCabinets(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<CabinetListResponseDto> {
    return await this.cabinetSelectionService.getUserCabinets(userId, organizationId);
  }

  /**
   * Select cabinet
   */
  async selectCabinet(
    dto: SelectCabinetDto,
    request: Request,
    user: User
  ): Promise<CabinetSelectionResponseDto> {
    const { cabinet, subscription, userCabinet } = await this.cabinetSelectionService.selectCabinet(
      user.id as UUID,
      dto.cabinetId,
      user.organizationId
    );

    const subscriptionContext = subscription
      ? {
          cabinetId: dto.cabinetId,
          subscription: {
            status: subscription.status,
            modules:
              subscription.modules
                ?.filter((m: any) => m.isActive && m.moduleCode)
                .map((m: any) => m.moduleCode!) || [],
          },
        }
      : { cabinetId: dto.cabinetId, subscription: null };

    const authResponse = await this.generateAuthResponseWithSession(
      user,
      request,
      subscriptionContext
    );

    const cabinetInfo = this.mapCabinetToDto(cabinet, subscription, userCabinet.isPrimary);
    const subscriptionDto: CabinetSubscriptionDto = subscription
      ? {
          status: subscription.status as SubscriptionStatus,
          trialEndsAt: subscription.trialEndsAt || null,
          modules:
            subscription.modules
              ?.filter((m: any) => m.isActive && m.moduleCode)
              .map((m: any) => m.moduleCode as ModuleCode) || [],
        }
      : { status: SubscriptionStatus.CANCELLED, trialEndsAt: null, modules: [] };

    const plainResponse = {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      tokenType: authResponse.tokenType,
      expiresIn: authResponse.expiresIn,
      cabinet: cabinetInfo,
      subscription: subscriptionDto,
    };

    return plainToInstance(CabinetSelectionResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Switch cabinet
   */
  async switchCabinet(
    userContext: { userId: UUID; organizationId: OrganizationId },
    dto: SelectCabinetDto,
    request: Request,
    currentSessionId?: UUID
  ): Promise<CabinetSelectionResponseDto> {
    if (currentSessionId) {
      await this.sessionManagementService.invalidateSession(
        currentSessionId,
        userContext.organizationId,
        'user_logout'
      );
    }

    const { user, cabinet, subscription, userCabinet } =
      await this.cabinetSelectionService.switchCabinet(
        userContext.userId,
        dto.cabinetId,
        userContext.organizationId
      );

    const subscriptionContext = subscription
      ? {
          cabinetId: dto.cabinetId,
          subscription: {
            status: subscription.status,
            modules:
              subscription.modules
                ?.filter((m: any) => m.isActive && m.moduleCode)
                .map((m: any) => m.moduleCode!) || [],
          },
        }
      : { cabinetId: dto.cabinetId, subscription: null };

    const authResponse = await this.generateAuthResponseWithSession(
      user,
      request,
      subscriptionContext
    );

    const cabinetInfo = this.mapCabinetToDto(cabinet, subscription, userCabinet.isPrimary);
    const subscriptionDto: CabinetSubscriptionDto = subscription
      ? {
          status: subscription.status as SubscriptionStatus,
          trialEndsAt: subscription.trialEndsAt || null,
          modules:
            subscription.modules
              ?.filter((m: any) => m.isActive && m.moduleCode)
              .map((m: any) => m.moduleCode as ModuleCode) || [],
        }
      : { status: SubscriptionStatus.CANCELLED, trialEndsAt: null, modules: [] };

    const plainResponse = {
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      tokenType: authResponse.tokenType,
      expiresIn: authResponse.expiresIn,
      cabinet: cabinetInfo,
      subscription: subscriptionDto,
    };

    return plainToInstance(CabinetSelectionResponseDto, plainResponse, {
      excludeExtraneousValues: true,
      enableImplicitConversion: false,
    });
  }

  /**
   * Refresh tokens
   *
   * IMPORTANT: The refresh flow requires careful token handling:
   * 1. Validate the old refresh token
   * 2. Rotate session (invalidate old, create new session)
   * 3. Generate the FINAL refresh token with the NEW session ID
   * 4. Update the new session with the FINAL token's hash
   * 5. Return the auth response with the same FINAL token
   *
   * Bug fix: Previously was passing a temporary token to rotateSession,
   * but then generateTokensForRefresh created a different token with
   * the actual sessionId. The hash stored didn't match the returned token.
   */
  async refresh(
    refreshToken: string,
    organizationId: OrganizationId,
    request: Request
  ): Promise<AuthResponseDto> {
    this.logger.log('Token refresh attempt');

    const oldSession = await this.sessionManagementService.validateRefreshToken(
      refreshToken,
      organizationId
    );
    const user = await this.userManagementService.getUserById(oldSession.userId, organizationId);

    if (!user) {
      throw new AuthenticationError('User not found', { reason: 'invalid_credentials' });
    }

    const deviceMetadata = this.sessionManagementService.extractDeviceMetadata(request);

    // Generate a placeholder token first - we'll replace its hash after generating final token
    const placeholderToken = this.tokenGenerationService.generateTemporaryRefreshToken(user);

    // Rotate session: invalidate old, create new with placeholder hash
    const newSession = await this.sessionManagementService.rotateSession(
      oldSession.id,
      organizationId,
      placeholderToken,
      deviceMetadata
    );

    // Generate the FINAL refresh token with the ACTUAL new session ID
    const finalRefreshToken = this.tokenGenerationService.generateFinalRefreshToken(
      user,
      newSession.id as UUID
    );

    // Update the session with the correct hash of the FINAL token
    await this.sessionManagementService.updateSessionTokenHash(
      newSession.id as UUID,
      organizationId,
      finalRefreshToken
    );

    this.logger.log(`Token refreshed successfully for user ${user.id}`);
    return await this.tokenGenerationService.generateTokensForRefreshWithToken(
      user,
      newSession,
      finalRefreshToken
    );
  }

  /**
   * Logout
   */
  async logout(sessionId: UUID, userId: UUID, organizationId: OrganizationId): Promise<void> {
    await this.sessionManagementService.logout(sessionId, userId, organizationId);
  }

  /**
   * List user sessions
   */
  async listUserSessions(
    userId: UUID,
    organizationId: OrganizationId,
    currentSessionId?: UUID
  ): Promise<SessionDto[]> {
    return await this.sessionManagementService.listUserSessions(
      userId,
      organizationId,
      currentSessionId
    );
  }

  /**
   * Revoke session
   */
  async revokeSession(
    sessionId: UUID,
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<void> {
    await this.sessionManagementService.revokeSession(sessionId, userId, organizationId);
  }

  /**
   * Handle cabinet selection logic during login
   */
  private async handleCabinetSelectionForLogin(
    user: User,
    request: Request
  ): Promise<AuthResponseDto> {
    // SUPER_ADMIN bypass: Skip all cabinet/subscription checks for SUPER_ADMIN role
    if (user.roles.includes('SUPER_ADMIN')) {
      this.logger.log('SUPER_ADMIN user detected, skipping cabinet/subscription checks');
      return await this.generateAuthResponseWithSession(user, request, undefined);
    }

    const { cabinets } = await this.cabinetSelectionService.getUserCabinets(
      user.id as UUID,
      user.organizationId
    );

    if (cabinets.length === 0) {
      try {
        const cabinetContext = await this.cabinetSelectionService.assignUserToCabinet(
          user.id as UUID,
          user.organizationId
        );
        return await this.generateAuthResponseWithSession(
          user,
          request,
          cabinetContext || undefined
        );
      } catch (error) {
        this.logger.warn(
          'Failed to assign cabinet, proceeding with login without cabinet context',
          { error }
        );
        return await this.generateAuthResponseWithSession(user, request, undefined);
      }
    } else if (cabinets.length === 1) {
      const cabinetContext = await this.subscriptionIntegrationService.fetchCabinetAndSubscription(
        user.id as UUID,
        user.organizationId
      );
      return await this.generateAuthResponseWithSession(user, request, cabinetContext || undefined);
    } else {
      throw new AuthenticationError(
        'Multiple cabinets available. Please use /auth/login-select-cabinet endpoint to select a cabinet.',
        {
          reason: 'invalid_credentials',
        }
      );
    }
  }

  /**
   * Generate auth response with session
   *
   * Creates a session and returns tokens. The flow is:
   * 1. Create session with placeholder token (to get session ID)
   * 2. Generate FINAL refresh token with ACTUAL session ID
   * 3. Update session with FINAL token's hash
   * 4. Return tokens (where refresh token matches stored hash)
   */
  private async generateAuthResponseWithSession(
    user: User,
    request: Request,
    cabinetContext?: { cabinetId: UUID; subscription: { status: string; modules: string[] } | null }
  ): Promise<AuthResponseDto> {
    // Step 1: Create session with placeholder token to get session ID
    const placeholderToken = this.tokenGenerationService.generateTemporaryRefreshToken(user);
    const session = await this.sessionManagementService.createSession(
      user.id as UUID,
      user.organizationId,
      user.clinicId,
      placeholderToken,
      request
    );

    // Step 2: Generate FINAL refresh token with ACTUAL session ID
    const finalRefreshToken = this.tokenGenerationService.generateFinalRefreshToken(
      user,
      session.id as UUID
    );

    // Step 3: Update session with FINAL token's hash
    await this.sessionManagementService.updateSessionTokenHash(
      session.id as UUID,
      user.organizationId,
      finalRefreshToken
    );

    // Step 4: Return auth response with FINAL token
    return await this.tokenGenerationService.generateAuthResponseWithToken(
      user,
      session,
      cabinetContext,
      finalRefreshToken
    );
  }

  /**
   * Map cabinet to DTO
   */
  private mapCabinetToDto(cabinet: any, subscription: any, isPrimary: boolean): any {
    const subscriptionDto: CabinetSubscriptionDto = subscription
      ? {
          status: subscription.status as SubscriptionStatus,
          trialEndsAt: subscription.trialEndsAt || null,
          modules:
            subscription.modules
              ?.filter((m: any) => m.isActive && m.moduleCode)
              .map((m: any) => m.moduleCode as ModuleCode) || [],
        }
      : { status: SubscriptionStatus.CANCELLED, trialEndsAt: null, modules: [] };

    return {
      id: cabinet.id,
      organizationId: cabinet.organizationId,
      name: cabinet.name,
      isDefault: cabinet.isDefault || false,
      isPrimary: isPrimary,
      subscription: subscriptionDto,
    };
  }
}
