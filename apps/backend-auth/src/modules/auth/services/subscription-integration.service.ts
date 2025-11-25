/**
 * Subscription Integration Service
 *
 * Handles integration with the subscription service to fetch cabinet
 * and subscription data. Used during login to enrich JWT tokens with
 * subscription context.
 *
 * Responsibilities:
 * - Fetch user's cabinets from subscription service
 * - Fetch subscription data for cabinets
 * - Select appropriate cabinet (default or first)
 * - Gracefully degrade when subscription service unavailable
 * - Record subscription validation metrics
 *
 * Graceful Degradation:
 * - If subscription service down, continue with login without context
 * - Logs failures for monitoring
 * - Never blocks authentication flow
 *
 * @module modules/auth/services
 */

import { Injectable, Optional } from '@nestjs/common';
import { SubscriptionClientService } from './subscription-client.service';
import { StructuredLogger, PrometheusMetricsService } from '@dentalos/shared-infra';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Subscription Integration Service
 * Manages subscription service interactions for authentication
 */
@Injectable()
export class SubscriptionIntegrationService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly subscriptionClient: SubscriptionClientService,
    @Optional() private readonly metricsService?: PrometheusMetricsService
  ) {
    this.logger = new StructuredLogger('SubscriptionIntegrationService');
  }

  /**
   * Fetch cabinet and subscription context for user
   *
   * Fetches the user's cabinet and subscription data from the subscription service.
   * Used during login to enrich the JWT token with subscription context.
   *
   * Logic:
   * 1. Fetch user's cabinets from subscription service
   * 2. If no cabinets found, return null (graceful degradation)
   * 3. Select cabinet: default cabinet OR first cabinet
   * 4. Fetch subscription for selected cabinet
   * 5. Return cabinet and subscription data
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @returns Cabinet and subscription data or null if unavailable
   */
  async fetchCabinetAndSubscription(
    userId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    cabinetId: UUID;
    subscription: {
      status: string;
      modules: string[];
    } | null;
  } | null> {
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    // Set logging context
    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      operation: 'fetchCabinetAndSubscription',
    });

    this.logger.log('Fetching cabinet and subscription context for JWT');

    try {
      // Fetch user's cabinets
      const cabinets = await this.subscriptionClient.getUserCabinets(userId, organizationId);

      if (!cabinets || cabinets.length === 0) {
        this.logger.log('No cabinets found for user', {
          duration_ms: Date.now() - startTime,
        });
        this.metricsService?.incrementCounter('subscription_validation_total', {
          status: 'not_found',
          reason: 'no_cabinets',
        });
        return null;
      }

      // Select cabinet: prefer default, otherwise use first cabinet
      const selectedCabinet = cabinets.find((c) => c.isDefault) || cabinets[0];

      this.logger.log('Cabinet selected for user', {
        cabinetId: this.hashId(selectedCabinet.id),
        isDefault: selectedCabinet.isDefault,
        totalCabinets: cabinets.length,
      });

      // Fetch subscription for selected cabinet
      const subscription = await this.subscriptionClient.getCabinetSubscription(
        selectedCabinet.id,
        organizationId
      );

      const duration = Date.now() - startTime;

      if (!subscription) {
        this.logger.log('No subscription found for cabinet', {
          duration_ms: duration,
        });
        this.metricsService?.incrementCounter('subscription_validation_total', {
          status: 'not_found',
          reason: 'no_subscription',
        });
        return {
          cabinetId: selectedCabinet.id,
          subscription: null,
        };
      }

      // Extract active module codes for JWT
      const moduleCodes =
        subscription.modules?.filter((m) => m.isActive && m.moduleCode).map((m) => m.moduleCode!) ||
        [];

      // Determine validation status
      const isExpired = subscription.status === 'EXPIRED';
      const isInactive = subscription.status === 'CANCELLED';
      const isValid = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';

      this.logger.log('Subscription validated for JWT', {
        duration_ms: duration,
        subscriptionStatus: subscription.status,
        moduleCount: moduleCodes.length,
        isTrial: subscription.isTrial || false,
      });

      // Record validation metrics
      if (isValid) {
        this.metricsService?.incrementCounter('subscription_validation_total', {
          status: 'success',
          reason: subscription.isTrial ? 'trial' : 'active',
        });
      } else if (isExpired) {
        this.metricsService?.incrementCounter('subscription_validation_total', {
          status: 'failure',
          reason: 'expired',
        });
      } else if (isInactive) {
        this.metricsService?.incrementCounter('subscription_validation_total', {
          status: 'failure',
          reason: 'inactive',
        });
      }

      return {
        cabinetId: selectedCabinet.id,
        subscription: {
          status: subscription.status,
          modules: moduleCodes,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Graceful degradation: if subscription service is down, continue with login
      // but without cabinet/subscription context
      this.logger.warn('Failed to fetch cabinet/subscription, degrading gracefully', {
        error: errorMessage,
        duration_ms: duration,
      });

      this.metricsService?.incrementCounter('subscription_validation_total', {
        status: 'failure',
        reason: 'service_error',
      });

      return null;
    }
  }

  /**
   * Fetch subscription status for cabinet
   *
   * Retrieves subscription status and active modules for a specific cabinet.
   * Used during cabinet selection and switching.
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Subscription status and modules, or null if not found
   */
  async fetchSubscriptionStatus(
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    status: string;
    modules: string[];
  } | null> {
    try {
      const subscription = await this.subscriptionClient.getCabinetSubscription(
        cabinetId,
        organizationId
      );

      if (!subscription) {
        return null;
      }

      const moduleCodes =
        subscription.modules?.filter((m) => m.isActive && m.moduleCode).map((m) => m.moduleCode!) ||
        [];

      return {
        status: subscription.status,
        modules: moduleCodes,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Failed to fetch subscription status', {
        cabinetId: this.hashId(cabinetId),
        error: errorMessage,
      });
      return null;
    }
  }

  /**
   * Enrich cabinet with subscription data
   *
   * Takes cabinet data and enriches it with subscription information.
   * Used when preparing cabinet selection responses.
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Cabinet and subscription context
   */
  async enrichCabinetWithSubscription(
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<{
    cabinetId: UUID;
    subscription: {
      status: string;
      modules: string[];
    } | null;
  }> {
    const subscription = await this.fetchSubscriptionStatus(cabinetId, organizationId);

    return {
      cabinetId,
      subscription,
    };
  }

  /**
   * Check if cabinet has active subscription
   *
   * Validates that cabinet has an active (not expired/cancelled) subscription.
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns True if subscription is active, false otherwise
   */
  async hasActiveSubscription(cabinetId: UUID, organizationId: OrganizationId): Promise<boolean> {
    const subscription = await this.fetchSubscriptionStatus(cabinetId, organizationId);

    if (!subscription) {
      return false;
    }

    return subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
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
