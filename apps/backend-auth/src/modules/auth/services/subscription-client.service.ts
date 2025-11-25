/**
 * Subscription Client Service
 *
 * HTTP client for communicating with the backend-subscription-service.
 * Fetches cabinet and subscription data during authentication flows.
 *
 * Responsibilities:
 * - Fetch user's cabinets from subscription service
 * - Fetch default cabinet for organization
 * - Fetch subscription data for a cabinet
 * - Handle errors and timeouts gracefully
 *
 * @module modules/auth/services
 */

import { Injectable, Optional } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, catchError, throwError, of } from 'rxjs';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import { InfrastructureError, NotFoundError } from '@dentalos/shared-errors';
import { StructuredLogger } from '@dentalos/shared-infra';
import { PrometheusMetricsService } from '@dentalos/shared-infra';
import { CircuitBreaker, CircuitBreakerOpenError } from '@dentalos/shared-infra';

/**
 * Cabinet summary from subscription service
 */
export interface CabinetSummary {
  readonly id: UUID;
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly code?: string;
  readonly isDefault: boolean;
  readonly ownerId?: UUID;
  readonly status: EntityStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Subscription module summary
 */
export interface SubscriptionModuleSummary {
  readonly id: UUID;
  readonly moduleId: UUID;
  readonly moduleCode?: string;
  readonly moduleName?: string;
  readonly isActive: boolean;
  readonly price?: number;
  readonly billingCycle: string;
  readonly currency: string;
  readonly isCore: boolean;
}

/**
 * Subscription summary from subscription service
 */
export interface SubscriptionSummary {
  readonly id: UUID;
  readonly organizationId: OrganizationId;
  readonly cabinetId: UUID;
  readonly status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  readonly billingCycle: 'MONTHLY' | 'YEARLY';
  readonly totalPrice: number;
  readonly currency: string;
  readonly isTrial?: boolean;
  readonly isTrialExpired?: boolean;
  readonly trialEndsAt?: Date;
  readonly renewsAt?: Date;
  readonly inGracePeriod: boolean;
  readonly activeModuleCount?: number;
  readonly modules?: SubscriptionModuleSummary[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Subscription client service
 *
 * Communicates with backend-subscription-service over HTTP
 */
@Injectable()
export class SubscriptionClientService {
  private readonly logger: StructuredLogger;
  private readonly baseUrl: string;
  private readonly requestTimeout: number;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Optional() private readonly metricsService?: PrometheusMetricsService
  ) {
    // Initialize structured logger
    this.logger = new StructuredLogger('SubscriptionClient');

    // Get subscription service URL from environment (fallback approach for type safety)
    // In production, use proper typed config service
    this.baseUrl =
      this.configService.get<string>('SUBSCRIPTION_SERVICE_URL') || 'http://localhost:3311';
    this.requestTimeout = this.configService.get<number>('SUBSCRIPTION_SERVICE_TIMEOUT') || 5000;

    // Initialize circuit breaker for subscription service
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      name: 'subscription-service',
    });

    this.logger.log('Subscription client initialized', {
      baseUrl: this.baseUrl,
      timeout: this.requestTimeout,
    });
  }

  /**
   * Get circuit breaker state for health checks
   */
  getCircuitBreakerState() {
    const stats = this.circuitBreaker.getStats();
    this.metricsService?.recordCircuitBreakerState('subscription-service', stats.state);
    return stats;
  }

  /**
   * Fetch user's cabinets from subscription service
   *
   * @param userId - User UUID
   * @param organizationId - Organization UUID
   * @returns Array of cabinets owned by or accessible to the user
   * @throws {InfrastructureError} If subscription service is down
   */
  async getUserCabinets(userId: UUID, organizationId: OrganizationId): Promise<CabinetSummary[]> {
    const url = `${this.baseUrl}/cabinets`;
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    // Set logging context
    this.logger.setContext({
      correlationId,
      organizationId,
      userId: this.hashId(userId),
      operation: 'getUserCabinets',
    });

    this.logger.log('Fetching user cabinets', {
      endpoint: '/cabinets',
    });

    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await firstValueFrom(
          this.httpService
            .get<CabinetSummary[]>(url, {
              params: {
                ownerId: userId,
                status: EntityStatus.ACTIVE,
              },
              headers: {
                'X-Organization-Id': organizationId,
                'X-Correlation-Id': correlationId,
              },
            })
            .pipe(
              timeout({ first: this.requestTimeout }),
              catchError((error) => {
                const duration = Date.now() - startTime;
                const errorType = this.categorizeError(error);

                // Log error with context
                this.logger.error('Subscription service call failed', error, {
                  endpoint: '/cabinets',
                  duration_ms: duration,
                  errorType,
                  statusCode: error.response?.status,
                });

                // Record metrics
                this.metricsService?.recordExternalServiceCall(
                  'subscription-service',
                  'getUserCabinets',
                  duration,
                  false
                );
                this.metricsService?.incrementCounter('subscription_service_errors_total', {
                  type: errorType,
                  endpoint: 'cabinets',
                });

                return throwError(
                  () =>
                    new InfrastructureError(
                      'Failed to fetch user cabinets from subscription service',
                      {
                        service: 'external_api',
                        isTransient: true,
                        tenantContext: { organizationId },
                      }
                    )
                );
              })
            )
        );
      });

      const duration = Date.now() - startTime;

      // Log success
      this.logger.log('User cabinets fetched successfully', {
        cabinetCount: response.data.length,
        duration_ms: duration,
      });

      // Record success metrics
      this.metricsService?.recordExternalServiceCall(
        'subscription-service',
        'getUserCabinets',
        duration,
        true
      );
      this.metricsService?.recordHistogram('subscription_service_call_duration_ms', duration, {
        endpoint: 'cabinets',
        status: 'success',
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof CircuitBreakerOpenError) {
        this.logger.warn('Circuit breaker open for subscription service', {
          duration_ms: duration,
        });
        this.metricsService?.incrementCounter('subscription_service_errors_total', {
          type: 'circuit_open',
          endpoint: 'cabinets',
        });
      }

      if (error instanceof InfrastructureError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Unexpected error fetching user cabinets', error as Error, {
        duration_ms: duration,
      });

      throw new InfrastructureError(`Failed to fetch user cabinets: ${errorMessage}`, {
        service: 'external_api',
        isTransient: true,
      });
    }
  }

  /**
   * Fetch default cabinet for organization
   *
   * @param organizationId - Organization UUID
   * @returns Default cabinet or null if none exists
   * @throws {InfrastructureError} If subscription service is down
   */
  async getDefaultCabinet(organizationId: OrganizationId): Promise<CabinetSummary | null> {
    const url = `${this.baseUrl}/cabinets/default`;

    this.logger.debug(`Fetching default cabinet for org ${organizationId}`);

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<CabinetSummary>(url, {
            headers: {
              'X-Organization-Id': organizationId,
            },
          })
          .pipe(
            timeout({ first: this.requestTimeout }),
            catchError((error) => {
              // 404 is expected if no default cabinet exists
              if (error.response?.status === 404) {
                this.logger.debug(`No default cabinet found for org ${organizationId}`);
                return of({ data: null } as any);
              }

              this.logger.error(`Failed to fetch default cabinet: ${error.message}`, error.stack);
              return throwError(
                () =>
                  new InfrastructureError(
                    'Failed to fetch default cabinet from subscription service',
                    {
                      service: 'external_api',
                      isTransient: true,
                      tenantContext: { organizationId },
                    }
                  )
              );
            })
          )
      );

      return response?.data || null;
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Error fetching default cabinet: ${errorMessage}, returning null`);
      return null;
    }
  }

  /**
   * Fetch subscription for a cabinet
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Subscription data or null if no subscription exists
   * @throws {InfrastructureError} If subscription service is down
   */
  async getCabinetSubscription(
    cabinetId: UUID,
    organizationId: OrganizationId
  ): Promise<SubscriptionSummary | null> {
    const url = `${this.baseUrl}/subscriptions/cabinet/${cabinetId}`;
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    // Set logging context
    this.logger.setContext({
      correlationId,
      organizationId,
      cabinetId: this.hashId(cabinetId),
      operation: 'getCabinetSubscription',
    });

    this.logger.log('Fetching cabinet subscription', {
      endpoint: '/subscriptions/cabinet',
    });

    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await firstValueFrom(
          this.httpService
            .get<SubscriptionSummary>(url, {
              headers: {
                'X-Organization-Id': organizationId,
                'X-Correlation-Id': correlationId,
              },
            })
            .pipe(
              timeout({ first: this.requestTimeout }),
              catchError((error) => {
                const duration = Date.now() - startTime;

                // 404 is expected if no subscription exists
                if (error.response?.status === 404) {
                  this.logger.log('No subscription found for cabinet', {
                    duration_ms: duration,
                    statusCode: 404,
                  });
                  this.metricsService?.recordExternalServiceCall(
                    'subscription-service',
                    'getCabinetSubscription',
                    duration,
                    true
                  );
                  return of({ data: null } as any);
                }

                const errorType = this.categorizeError(error);

                this.logger.error('Failed to fetch cabinet subscription', error, {
                  endpoint: '/subscriptions/cabinet',
                  duration_ms: duration,
                  errorType,
                  statusCode: error.response?.status,
                });

                this.metricsService?.recordExternalServiceCall(
                  'subscription-service',
                  'getCabinetSubscription',
                  duration,
                  false
                );
                this.metricsService?.incrementCounter('subscription_service_errors_total', {
                  type: errorType,
                  endpoint: 'subscription',
                });

                return throwError(
                  () =>
                    new InfrastructureError(
                      'Failed to fetch cabinet subscription from subscription service',
                      {
                        service: 'external_api',
                        isTransient: true,
                        tenantContext: { organizationId },
                      }
                    )
                );
              })
            )
        );
      });

      const duration = Date.now() - startTime;

      if (response?.data) {
        this.logger.log('Cabinet subscription fetched successfully', {
          duration_ms: duration,
          subscriptionStatus: response.data.status,
          moduleCount: response.data.modules?.length || 0,
        });

        this.metricsService?.recordExternalServiceCall(
          'subscription-service',
          'getCabinetSubscription',
          duration,
          true
        );
        this.metricsService?.recordHistogram('subscription_service_call_duration_ms', duration, {
          endpoint: 'subscription',
          status: 'success',
        });
      }

      return response?.data || null;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof CircuitBreakerOpenError) {
        this.logger.warn('Circuit breaker open for subscription service', {
          duration_ms: duration,
        });
        this.metricsService?.incrementCounter('subscription_service_errors_total', {
          type: 'circuit_open',
          endpoint: 'subscription',
        });
        return null;
      }

      if (error instanceof InfrastructureError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('Error fetching cabinet subscription, returning null', {
        error: errorMessage,
        duration_ms: duration,
      });
      return null;
    }
  }

  /**
   * Fetch cabinet by ID
   *
   * @param cabinetId - Cabinet UUID
   * @param organizationId - Organization UUID
   * @returns Cabinet data
   * @throws {NotFoundError} If cabinet not found
   * @throws {InfrastructureError} If subscription service is down
   */
  async getCabinetById(cabinetId: UUID, organizationId: OrganizationId): Promise<CabinetSummary> {
    const url = `${this.baseUrl}/cabinets/${cabinetId}`;

    this.logger.debug(`Fetching cabinet ${cabinetId} in org ${organizationId}`);

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<CabinetSummary>(url, {
            headers: {
              'X-Organization-Id': organizationId,
            },
          })
          .pipe(
            timeout({ first: this.requestTimeout }),
            catchError((error) => {
              if (error.response?.status === 404) {
                this.logger.warn(`Cabinet ${cabinetId} not found`);
                return throwError(() => new NotFoundError('cabinet', { resourceId: cabinetId }));
              }

              this.logger.error(`Failed to fetch cabinet: ${error.message}`, error.stack);
              return throwError(
                () =>
                  new InfrastructureError('Failed to fetch cabinet from subscription service', {
                    service: 'external_api',
                    isTransient: true,
                    tenantContext: { organizationId },
                  })
              );
            })
          )
      );

      return response.data;
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof InfrastructureError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Unexpected error fetching cabinet: ${errorMessage}`,
        error instanceof Error ? error : undefined
      );

      throw new InfrastructureError(`Failed to fetch cabinet: ${errorMessage}`, {
        service: 'external_api',
        isTransient: true,
      });
    }
  }

  /**
   * Create a new cabinet via subscription service
   *
   * @param data - Cabinet creation data
   * @returns Created cabinet summary
   * @throws {InfrastructureError} If subscription service is unavailable
   * @throws {ValidationError} If cabinet data is invalid
   */
  async createCabinet(data: {
    organizationId: OrganizationId;
    name: string;
    code?: string;
    isDefault: boolean;
    status: EntityStatus;
    ownerId?: UUID;
  }): Promise<CabinetSummary> {
    const url = `${this.baseUrl}/cabinets`;
    const startTime = Date.now();
    const correlationId = this.logger.ensureCorrelationId();

    // Set logging context
    this.logger.setContext({
      correlationId,
      organizationId: data.organizationId,
      operation: 'createCabinet',
    });

    this.logger.log('Creating cabinet via subscription service', {
      endpoint: '/cabinets',
      cabinetName: data.name,
    });

    try {
      const response = await this.circuitBreaker.execute(async () => {
        return await firstValueFrom(
          this.httpService
            .post<CabinetSummary>(url, data, {
              headers: {
                'X-Organization-Id': data.organizationId,
                'X-Correlation-Id': correlationId,
              },
            })
            .pipe(
              timeout({ first: this.requestTimeout }),
              catchError((error) => {
                const duration = Date.now() - startTime;
                const errorType = this.categorizeError(error);

                // Log error with context
                this.logger.error('Cabinet creation failed', error, {
                  endpoint: '/cabinets',
                  duration_ms: duration,
                  errorType,
                  statusCode: error.response?.status,
                });

                // Record metrics
                this.metricsService?.recordExternalServiceCall(
                  'subscription-service',
                  'createCabinet',
                  duration,
                  false
                );
                this.metricsService?.incrementCounter('subscription_service_errors_total', {
                  type: errorType,
                  endpoint: 'cabinets_create',
                });

                return throwError(
                  () =>
                    new InfrastructureError('Failed to create cabinet via subscription service', {
                      service: 'external_api',
                      isTransient: true,
                      tenantContext: { organizationId: data.organizationId },
                    })
                );
              })
            )
        );
      });

      const duration = Date.now() - startTime;

      // Log success
      this.logger.log('Cabinet created successfully', {
        cabinetId: this.hashId(response.data.id),
        cabinetName: response.data.name,
        duration_ms: duration,
      });

      // Record success metrics
      this.metricsService?.recordExternalServiceCall(
        'subscription-service',
        'createCabinet',
        duration,
        true
      );
      this.metricsService?.recordHistogram('subscription_service_call_duration_ms', duration, {
        endpoint: 'cabinets_create',
        status: 'success',
      });

      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof CircuitBreakerOpenError) {
        this.logger.warn('Circuit breaker open for subscription service', {
          duration_ms: duration,
        });
        this.metricsService?.incrementCounter('subscription_service_errors_total', {
          type: 'circuit_open',
          endpoint: 'cabinets_create',
        });
      }

      if (error instanceof InfrastructureError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Unexpected error creating cabinet', error as Error, {
        duration_ms: duration,
      });

      throw new InfrastructureError(`Failed to create cabinet: ${errorMessage}`, {
        service: 'external_api',
        isTransient: true,
      });
    }
  }

  /**
   * Hash ID for logging (PHI protection)
   * Never log raw UUIDs as they may be considered PHI
   */
  private hashId(id: string): string {
    // Simple hash for logging - first 8 chars are enough for correlation
    return id.substring(0, 8) + '...';
  }

  /**
   * Categorize errors for metrics and debugging
   */
  private categorizeError(error: any): string {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return 'connection';
    }
    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      return 'timeout';
    }
    if (error.response?.status >= 500) {
      return '5xx';
    }
    if (error.response?.status >= 400) {
      return '4xx';
    }
    return 'unknown';
  }
}
