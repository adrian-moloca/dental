import { Injectable, Logger } from '@nestjs/common';

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface HealthCheckResult {
  status: HealthStatus;
  checks: Record<string, ComponentHealth>;
  timestamp: string;
  uptime: number;
}

export interface ComponentHealth {
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  lastCheck?: string;
}

/**
 * Health check manager for monitoring service dependencies.
 * Provides standardized health endpoints for Kubernetes/Docker readiness/liveness probes.
 *
 * @example
 * healthCheck.register('database', async () => {
 *   await db.raw('SELECT 1');
 *   return { status: HealthStatus.HEALTHY };
 * });
 *
 * const health = await healthCheck.check();
 * // Returns overall health status with all component checks
 */
@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private readonly checks = new Map<string, () => Promise<ComponentHealth>>();
  private readonly startTime = Date.now();
  private readonly checkCache = new Map<string, { result: ComponentHealth; timestamp: number }>();
  private readonly CACHE_TTL = 5000; // 5 seconds

  /**
   * Registers a health check for a component.
   */
  register(name: string, checkFn: () => Promise<ComponentHealth>): void {
    this.checks.set(name, checkFn);
    this.logger.log(`Registered health check: ${name}`);
  }

  /**
   * Performs all health checks and returns aggregated result.
   */
  async check(): Promise<HealthCheckResult> {
    const checks: Record<string, ComponentHealth> = {};
    const results = await Promise.allSettled(
      Array.from(this.checks.entries()).map(async ([name, checkFn]) => {
        // Check cache first
        const cached = this.checkCache.get(name);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
          return { name, result: cached.result };
        }

        const startTime = Date.now();
        try {
          const result = await Promise.race([
            checkFn(),
            this.timeout(5000, name),
          ]);
          const responseTime = Date.now() - startTime;
          const healthResult = {
            ...result,
            responseTime,
            lastCheck: new Date().toISOString(),
          };

          // Cache successful check
          this.checkCache.set(name, { result: healthResult, timestamp: Date.now() });

          return { name, result: healthResult };
        } catch (error) {
          const responseTime = Date.now() - startTime;
          const errorResult: ComponentHealth = {
            status: HealthStatus.UNHEALTHY,
            message: error instanceof Error ? error.message : 'Health check failed',
            responseTime,
            lastCheck: new Date().toISOString(),
          };
          return { name, result: errorResult };
        }
      }),
    );

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        checks[result.value.name] = result.value.result;
      }
    });

    // Determine overall status
    const statuses = Object.values(checks).map((c) => c.status);
    let overallStatus: HealthStatus;

    if (statuses.every((s) => s === HealthStatus.HEALTHY)) {
      overallStatus = HealthStatus.HEALTHY;
    } else if (statuses.some((s) => s === HealthStatus.UNHEALTHY)) {
      overallStatus = HealthStatus.UNHEALTHY;
    } else {
      overallStatus = HealthStatus.DEGRADED;
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Quick liveness check - just returns if service is running.
   * Used for Kubernetes liveness probes.
   */
  async liveness(): Promise<{ status: 'ok'; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check - returns if service is ready to accept traffic.
   * Used for Kubernetes readiness probes.
   */
  async readiness(): Promise<HealthCheckResult> {
    return this.check();
  }

  private timeout(ms: number, name: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Health check timeout for ${name}`)), ms);
    });
  }

  /**
   * Helper to create database health check.
   */
  static createDatabaseCheck(
    _db: any,
    testQuery: () => Promise<any>,
  ): () => Promise<ComponentHealth> {
    return async (): Promise<ComponentHealth> => {
      try {
        await testQuery();
        return {
          status: HealthStatus.HEALTHY,
          message: 'Database connection successful',
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    };
  }

  /**
   * Helper to create Redis health check.
   */
  static createRedisCheck(redis: any): () => Promise<ComponentHealth> {
    return async (): Promise<ComponentHealth> => {
      try {
        await redis.ping();
        return {
          status: HealthStatus.HEALTHY,
          message: 'Redis connection successful',
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    };
  }

  /**
   * Helper to create external service health check.
   */
  static createExternalServiceCheck(
    serviceName: string,
    checkFn: () => Promise<boolean>,
  ): () => Promise<ComponentHealth> {
    return async (): Promise<ComponentHealth> => {
      try {
        const isHealthy = await checkFn();
        return {
          status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
          message: isHealthy ? `${serviceName} is healthy` : `${serviceName} is degraded`,
        };
      } catch (error) {
        return {
          status: HealthStatus.UNHEALTHY,
          message: `${serviceName} check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    };
  }
}
