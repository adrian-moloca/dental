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
    private readonly userManagementService: UserManagementService
  ) {
    this.logger = new StructuredLogger('AuthService');
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto, request: Request): Promise<AuthResponseDto> {
    const user = await this.authenticationService.register(dto);
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
   */
  async loginSmart(dto: LoginSmartDto, request: Request): Promise<LoginSmartResponseDto> {
    const result = await this.authenticationService.loginSmart(dto);

    if (!result.needsOrgSelection) {
      const user = result.users[0];
      const authResponse = await this.handleCabinetSelectionForLogin(user, request);

      const response = {
        needsOrgSelection: false,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user,
      };

      console.log('=== FIXED v14 EXPLICIT_REG_FIXED - RETURN LOGGING ===');
      console.log('Response object:', JSON.stringify(response, null, 2));
      console.log('Response keys:', Object.keys(response));
      console.log('authResponse:', JSON.stringify(authResponse, null, 2));
      return response as LoginSmartResponseDto;
    }

    const response = {
      needsOrgSelection: true,
      organizations: result.users.map((u) => ({
        id: u.organizationId,
        name: `Organization ${u.organizationId}`,
        logoUrl: undefined,
      })),
    };

    console.log('=== FIXED v6 MULTI-ORG - NO CLASS SERIALIZER ===');
    return response as LoginSmartResponseDto;
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
    const newSession = await this.sessionManagementService.rotateSession(
      oldSession.id,
      organizationId,
      refreshToken,
      deviceMetadata
    );

    this.logger.log(`Token refreshed successfully for user ${user.id}`);
    return this.tokenGenerationService.generateTokensForRefresh(user, newSession);
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
   */
  private async generateAuthResponseWithSession(
    user: User,
    request: Request,
    cabinetContext?: { cabinetId: UUID; subscription: { status: string; modules: string[] } | null }
  ): Promise<AuthResponseDto> {
    const tempRefreshToken = this.tokenGenerationService.generateTemporaryRefreshToken(user);
    const session = await this.sessionManagementService.createSession(
      user.id as UUID,
      user.organizationId,
      user.clinicId,
      tempRefreshToken,
      request
    );
    return this.tokenGenerationService.generateAuthResponse(user, session, cabinetContext);
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
