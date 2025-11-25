/**
 * Subscription Client with Circuit Breaker
 *
 * Wraps SubscriptionClientService with circuit breaker pattern to prevent
 * cascading failures when subscription service is unavailable.
 *
 * CIRCUIT BREAKER PATTERN:
 * - CLOSED: Normal operation, all requests pass through
 * - OPEN: Service unavailable, fail fast with fallback
 * - HALF_OPEN: Testing recovery, allow limited requests
 *
 * CONFIGURATION:
 * - Timeout: 3 seconds per request
 * - Error Threshold: 50% failure rate opens circuit
 * - Reset Timeout: 30 seconds before retrying
 * - Volume Threshold: 10 requests minimum before evaluation
 *
 * FALLBACK STRATEGY:
 * - Return null for cabinet/subscription queries
 * - Log circuit state changes for monitoring
 * - Allow authentication to proceed without subscription data
 *
 * @module modules/auth/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CircuitBreaker from 'opossum';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import {
  SubscriptionClientService,
  CabinetSummary,
  SubscriptionSummary,
} from './subscription-client.service';

/**
 * Circuit breaker statistics
 */
export interface CircuitBreakerStats {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failures: number;
  successes: number;
  rejects: number;
  timeouts: number;
  fallbacks: number;
}

/**
 * Subscription Client with Circuit Breaker
 *
 * Provides resilient access to subscription service with automatic
 * failure detection and recovery.
 */
@Injectable()
export class SubscriptionClientWithCircuitBreakerService {
  private readonly logger = new Logger(SubscriptionClientWithCircuitBreakerService.name);

  private readonly getUserCabinetsBreaker: any;
  private readonly getDefaultCabinetBreaker: any;
  private readonly getCabinetSubscriptionBreaker: any;
  private readonly getCabinetByIdBreaker: any;

  constructor(
    private readonly subscriptionClient: SubscriptionClientService,
    private readonly configService: ConfigService
  ) {
    // Circuit breaker configuration
    const options = this.buildCircuitBreakerOptions();

    // Create circuit breakers for each method
    this.getUserCabinetsBreaker = new CircuitBreaker(
      this.subscriptionClient.getUserCabinets.bind(this.subscriptionClient),
      {
        ...options,
        name: 'getUserCabinets',
      }
    );

    this.getDefaultCabinetBreaker = new CircuitBreaker(
      this.subscriptionClient.getDefaultCabinet.bind(this.subscriptionClient),
      {
        ...options,
        name: 'getDefaultCabinet',
      }
    );

    this.getCabinetSubscriptionBreaker = new CircuitBreaker(
      this.subscriptionClient.getCabinetSubscription.bind(this.subscriptionClient),
      {
        ...options,
        name: 'getCabinetSubscription',
      }
    );

    this.getCabinetByIdBreaker = new CircuitBreaker(
      this.subscriptionClient.getCabinetById.bind(this.subscriptionClient),
      {
        ...options,
        name: 'getCabinetById',
      }
    );

    // Register event listeners for all breakers
    [
      this.getUserCabinetsBreaker,
      this.getDefaultCabinetBreaker,
      this.getCabinetSubscriptionBreaker,
      this.getCabinetByIdBreaker,
    ].forEach((breaker) => {
      this.registerEventListeners(breaker);
    });
  }

  /**
   * Build circuit breaker options from configuration
   */
  private buildCircuitBreakerOptions(): any {
    return {
      // Request timeout (milliseconds)
      timeout: this.configService.get<number>('subscription.circuitBreaker.timeout', 3000),

      // Error threshold percentage (0-100)
      // Open circuit if this percentage of requests fail
      errorThresholdPercentage: this.configService.get<number>(
        'subscription.circuitBreaker.errorThreshold',
        50
      ),

      // Reset timeout (milliseconds)
      // How long to wait before attempting to close circuit
      resetTimeout: this.configService.get<number>(
        'subscription.circuitBreaker.resetTimeout',
        30000
      ),

      // Rolling count timeout (milliseconds)
      // Time window for calculating error rate
      rollingCountTimeout: this.configService.get<number>(
        'subscription.circuitBreaker.rollingWindow',
        10000
      ),

      // Rolling count buckets
      // Number of buckets in rolling window
      rollingCountBuckets: 10,

      // Volume threshold
      // Minimum number of requests before opening circuit
      volumeThreshold: this.configService.get<number>(
        'subscription.circuitBreaker.volumeThreshold',
        10
      ),

      // Enable statistics
      enabled: true,
    };
  }

  /**
   * Register event listeners for circuit breaker monitoring
   */
  private registerEventListeners(breaker: any): void {
    const breakerName = breaker.name || 'unknown';

    // Circuit opened (service degraded)
    breaker.on('open', () => {
      this.logger.error({
        message: `Circuit OPEN: ${breakerName} - Subscription service unavailable`,
        circuit: breakerName,
        state: 'OPEN',
        stats: breaker.stats,
      });
    });

    // Circuit half-open (testing recovery)
    breaker.on('halfOpen', () => {
      this.logger.warn({
        message: `Circuit HALF-OPEN: ${breakerName} - Testing subscription service recovery`,
        circuit: breakerName,
        state: 'HALF_OPEN',
      });
    });

    // Circuit closed (service recovered)
    breaker.on('close', () => {
      this.logger.log({
        message: `Circuit CLOSED: ${breakerName} - Subscription service recovered`,
        circuit: breakerName,
        state: 'CLOSED',
        stats: breaker.stats,
      });
    });

    // Fallback triggered
    breaker.on('fallback', (result: any) => {
      this.logger.warn({
        message: `Circuit FALLBACK: ${breakerName} - Using fallback response`,
        circuit: breakerName,
        fallbackResult: result !== null ? 'data' : 'null',
      });
    });

    // Request timeout
    breaker.on('timeout', () => {
      this.logger.warn({
        message: `Circuit TIMEOUT: ${breakerName} - Request exceeded timeout`,
        circuit: breakerName,
      });
    });

    // Request rejected (circuit open)
    breaker.on('reject', () => {
      this.logger.debug({
        message: `Circuit REJECT: ${breakerName} - Request rejected (circuit open)`,
        circuit: breakerName,
      });
    });
  }

  /**
   * Fetch user's cabinets with circuit breaker
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @returns Array of cabinets or empty array on failure
   */
  async getUserCabinets(userId: UUID, organizationId: OrganizationId): Promise<CabinetSummary[]> {
    try {
      return await this.getUserCabinetsBreaker.fire(userId, organizationId);
    } catch (error) {
      this.logger.warn({
        message: 'Failed to fetch user cabinets (circuit breaker)',
        userId,
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback: Return empty array
      return [];
    }
  }

  /**
   * Fetch default cabinet with circuit breaker
   *
   * @param organizationId - Organization UUID
   * @returns Default cabinet or null on failure
   */
  async getDefaultCabinet(organizationId: OrganizationId): Promise<CabinetSummary | null> {
    try {
      return await this.getDefaultCabinetBreaker.fire(organizationId);
    } catch (error) {
      this.logger.warn({
        message: 'Failed to fetch default cabinet (circuit breaker)',
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback: Return null
      return null;
    }
  }

  /**
   * Fetch cabinet subscription with circuit breaker
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Subscription or null on failure
   */
  async getCabinetSubscription(
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<SubscriptionSummary | null> {
    try {
      return await this.getCabinetSubscriptionBreaker.fire(cabinetId, organizationId);
    } catch (error) {
      this.logger.warn({
        message: 'Failed to fetch cabinet subscription (circuit breaker)',
        cabinetId,
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback: Return null (allows login without subscription)
      return null;
    }
  }

  /**
   * Fetch cabinet by ID with circuit breaker
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Cabinet data or throws error
   */
  async getCabinetById(cabinetId: UUID, organizationId: OrganizationId): Promise<CabinetSummary> {
    // Note: This method does NOT use fallback because cabinet lookup
    // is typically required for critical operations
    return await this.getCabinetByIdBreaker.fire(cabinetId, organizationId);
  }

  /**
   * Get circuit breaker statistics
   *
   * @returns Circuit breaker stats for all endpoints
   */
  getStats(): Record<string, CircuitBreakerStats> {
    return {
      getUserCabinets: this.extractStats(this.getUserCabinetsBreaker),
      getDefaultCabinet: this.extractStats(this.getDefaultCabinetBreaker),
      getCabinetSubscription: this.extractStats(this.getCabinetSubscriptionBreaker),
      getCabinetById: this.extractStats(this.getCabinetByIdBreaker),
    };
  }

  /**
   * Extract statistics from circuit breaker
   */
  private extractStats(breaker: any): CircuitBreakerStats {
    const stats = breaker.stats;
    return {
      state: breaker.opened ? 'OPEN' : breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED',
      failures: stats.failures,
      successes: stats.successes,
      rejects: stats.rejects,
      timeouts: stats.timeouts,
      fallbacks: stats.fallbacks,
    };
  }

  /**
   * Reset all circuit breakers (for testing)
   */
  resetAll(): void {
    [
      this.getUserCabinetsBreaker,
      this.getDefaultCabinetBreaker,
      this.getCabinetSubscriptionBreaker,
      this.getCabinetByIdBreaker,
    ].forEach((breaker) => {
      breaker.close();
    });

    this.logger.log('All circuit breakers reset');
  }
}
