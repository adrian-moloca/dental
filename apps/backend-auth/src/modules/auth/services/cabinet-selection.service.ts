/**
 * Cabinet Selection Service
 *
 * Handles cabinet-related operations: listing user cabinets, selecting cabinets,
 * switching between cabinets, and managing user-cabinet assignments.
 *
 * Responsibilities:
 * - Fetching user's cabinet assignments
 * - Validating cabinet access permissions
 * - Enriching cabinets with subscription data
 * - Managing cabinet selection and switching
 *
 * Security:
 * - Validates user-cabinet relationships
 * - Enforces tenant isolation
 * - Verifies cabinet is active before selection
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { UserCabinetRepository } from '../../users/repositories/user-cabinet.repository';
import { SubscriptionClientService } from './subscription-client.service';
import { StructuredLogger } from '@dentalos/shared-infra';
import {
  CabinetInfoDto,
  CabinetListResponseDto,
  CabinetSubscriptionDto,
  SubscriptionStatus,
  ModuleCode,
} from '../dto';
import { User, UserStatus } from '../../users/entities/user.entity';
import { AuthenticationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Cabinet Selection Service
 * Manages cabinet operations for authenticated users
 */
@Injectable()
export class CabinetSelectionService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly userCabinetRepository: UserCabinetRepository,
    private readonly subscriptionClient: SubscriptionClientService
  ) {
    this.logger = new StructuredLogger('CabinetSelectionService');
  }

  /**
   * Get list of cabinets user has access to
   *
   * Fetches all cabinets the user is assigned to and enriches them with
   * subscription information from the subscription service.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant scoping
   * @returns CabinetListResponseDto with cabinet information
   */
  async getUserCabinets(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<CabinetListResponseDto> {
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      operation: 'getUserCabinets',
    });

    this.logger.log('Fetching user cabinets');

    // Fetch user-cabinet assignments
    const userCabinets = await this.userCabinetRepository.findByUserId(
      userId,
      organizationId,
      true // Active only
    );

    if (userCabinets.length === 0) {
      this.logger.log('User has no cabinet assignments', {
        duration_ms: Date.now() - startTime,
      });
      return { cabinets: [] };
    }

    this.logger.log(`Found ${userCabinets.length} cabinet assignments`, {
      cabinetCount: userCabinets.length,
    });

    // Fetch cabinet details and subscriptions in parallel
    const cabinetPromises = userCabinets.map(async (userCabinet) => {
      try {
        // Fetch cabinet details
        const cabinet = await this.subscriptionClient.getCabinetById(
          userCabinet.cabinetId,
          organizationId
        );

        // Fetch subscription for cabinet
        const subscription = await this.subscriptionClient.getCabinetSubscription(
          userCabinet.cabinetId,
          organizationId
        );

        // Map to CabinetInfoDto
        return this.mapCabinetToDto(cabinet, subscription, userCabinet.isPrimary);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn('Failed to fetch cabinet details, skipping', {
          cabinetId: this.hashId(userCabinet.cabinetId),
          error: errorMessage,
        });
        return null;
      }
    });

    const cabinets = (await Promise.all(cabinetPromises)).filter(
      (c): c is CabinetInfoDto => c !== null
    );

    const duration = Date.now() - startTime;
    this.logger.log('User cabinets fetched successfully', {
      cabinetCount: cabinets.length,
      duration_ms: duration,
    });

    return { cabinets };
  }

  /**
   * Select cabinet with validation
   *
   * Validates user has access to the selected cabinet and returns
   * cabinet and subscription data.
   *
   * @param userId - User ID
   * @param cabinetId - Cabinet ID to select
   * @param organizationId - Organization ID
   * @returns Cabinet and subscription data
   * @throws {ForbiddenError} If user doesn't have access to cabinet
   */
  async selectCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    cabinet: any;
    subscription: any;
    userCabinet: any;
  }> {
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      cabinetId: this.hashId(cabinetId),
      operation: 'selectCabinet',
    });

    this.logger.log('Cabinet selection attempt');

    // Validate user has access to cabinet
    const userCabinet = await this.userCabinetRepository.findOne(userId, cabinetId, organizationId);

    if (!userCabinet) {
      this.logger.warn('Cabinet selection failed: User not assigned to cabinet');
      throw new AuthenticationError('You do not have access to this cabinet', {});
    }

    if (!userCabinet.isActive) {
      this.logger.warn('Cabinet selection failed: Cabinet assignment inactive');
      throw new AuthenticationError('Your access to this cabinet has been deactivated', {});
    }

    // Fetch cabinet details
    const cabinet = await this.subscriptionClient.getCabinetById(cabinetId, organizationId);

    // Fetch subscription data
    const subscription = await this.subscriptionClient.getCabinetSubscription(
      cabinetId,
      organizationId
    );

    const duration = Date.now() - startTime;
    this.logger.log('Cabinet selected successfully', {
      duration_ms: duration,
      subscriptionStatus: subscription?.status || 'none',
      moduleCount: subscription?.modules?.length || 0,
    });

    return { cabinet, subscription, userCabinet };
  }

  /**
   * Switch to a different cabinet
   *
   * Validates user has access to new cabinet and returns cabinet data.
   *
   * @param userId - User ID
   * @param cabinetId - New cabinet ID
   * @param organizationId - Organization ID
   * @returns Cabinet and subscription data
   * @throws {ForbiddenError} If user doesn't have access to cabinet
   * @throws {AuthenticationError} If user not found or inactive
   */
  async switchCabinet(
    userId: UUID,
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    user: User;
    cabinet: any;
    subscription: any;
    userCabinet: any;
  }> {
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      cabinetId: this.hashId(cabinetId),
      operation: 'switchCabinet',
    });

    this.logger.log('Cabinet switch attempt');

    // Fetch user from database
    const user = await this.userRepository.findById(userId, organizationId);

    if (!user) {
      this.logger.warn('Cabinet switch failed: User not found');
      throw new AuthenticationError('User not found', {
        reason: 'invalid_credentials',
      });
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn('Cabinet switch failed: User not active');
      throw new AuthenticationError('User account is not active', {
        reason: 'invalid_credentials',
      });
    }

    // Validate user has access to new cabinet
    const userCabinet = await this.userCabinetRepository.findOne(userId, cabinetId, organizationId);

    if (!userCabinet) {
      this.logger.warn('Cabinet switch failed: User not assigned to cabinet');
      throw new AuthenticationError('You do not have access to this cabinet', {});
    }

    if (!userCabinet.isActive) {
      this.logger.warn('Cabinet switch failed: Cabinet assignment inactive');
      throw new AuthenticationError('Your access to this cabinet has been deactivated', {});
    }

    // Fetch cabinet details
    const cabinet = await this.subscriptionClient.getCabinetById(cabinetId, organizationId);

    // Fetch subscription data
    const subscription = await this.subscriptionClient.getCabinetSubscription(
      cabinetId,
      organizationId
    );

    const duration = Date.now() - startTime;
    this.logger.log('Cabinet switched successfully', {
      duration_ms: duration,
      subscriptionStatus: subscription?.status || 'none',
      moduleCount: subscription?.modules?.length || 0,
    });

    return { user, cabinet, subscription, userCabinet };
  }

  /**
   * Assign user to default cabinet
   *
   * Used during login when user has no cabinet assignments.
   * Attempts to assign user to organization's default cabinet.
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @returns Cabinet and subscription data if assignment successful, null otherwise
   */
  async assignUserToCabinet(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    cabinetId: UUID;
    subscription: {
      status: string;
      modules: string[];
    } | null;
  } | null> {
    this.logger.log('User has no cabinet assignments, attempting to assign to default cabinet');

    try {
      const defaultCabinet = await this.subscriptionClient.getDefaultCabinet(organizationId);

      if (!defaultCabinet) {
        this.logger.warn('No default cabinet found for organization');
        throw new AuthenticationError(
          'No cabinets assigned to user. Please contact your administrator.',
          { reason: 'invalid_credentials' }
        );
      }

      // Create user-cabinet assignment to default cabinet
      await this.userCabinetRepository.create({
        userId,
        cabinetId: defaultCabinet.id,
        organizationId,
        isPrimary: true,
        isActive: true,
      });

      this.logger.log('User assigned to default cabinet', {
        cabinetId: this.hashId(defaultCabinet.id),
      });

      // Fetch subscription for default cabinet
      const subscription = await this.subscriptionClient.getCabinetSubscription(
        defaultCabinet.id,
        organizationId
      );

      return {
        cabinetId: defaultCabinet.id,
        subscription: subscription
          ? {
              status: subscription.status,
              modules:
                subscription.modules
                  ?.filter((m) => m.isActive && m.moduleCode)
                  .map((m) => m.moduleCode!) || [],
            }
          : null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to assign user to default cabinet', {
        error: errorMessage,
      });

      if (error instanceof AuthenticationError) {
        throw error;
      }

      return null;
    }
  }

  /**
   * Map cabinet to DTO with subscription information
   *
   * @param cabinet - Cabinet summary from subscription service
   * @param subscription - Subscription summary from subscription service
   * @param isPrimary - Whether this is user's primary cabinet
   * @returns CabinetInfoDto for API response
   * @private
   */
  private mapCabinetToDto(cabinet: any, subscription: any, isPrimary: boolean): CabinetInfoDto {
    const subscriptionDto: CabinetSubscriptionDto = subscription
      ? {
          status: subscription.status as SubscriptionStatus,
          trialEndsAt: subscription.trialEndsAt || null,
          modules:
            subscription.modules
              ?.filter((m: any) => m.isActive && m.moduleCode)
              .map((m: any) => m.moduleCode as ModuleCode) || [],
        }
      : {
          status: SubscriptionStatus.CANCELLED,
          trialEndsAt: null,
          modules: [],
        };

    return {
      id: cabinet.id,
      organizationId: cabinet.organizationId,
      name: cabinet.name,
      isDefault: cabinet.isDefault || false,
      isPrimary: isPrimary,
      subscription: subscriptionDto,
    };
  }

  /**
   * Hash ID for logging (PHI protection)
   *
   * @param id - ID to hash
   * @returns Hashed ID (first 8 characters)
   * @private
   */
  private hashId(id: string): string {
    return id.substring(0, 8) + '...';
  }
}
