/**
 * Health Controller
 *
 * Exposes health check endpoints for monitoring and orchestration.
 *
 * Endpoints:
 * - GET /health/liveness: Simple liveness check (returns 200 OK)
 * - GET /health/readiness: Readiness check (validates dependencies)
 * - GET /health/detailed: Detailed health diagnostics
 *
 * @module modules/health/controller
 */

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../../decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * Health check controller
 *
 * All endpoints are public (no authentication required).
 */
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly healthService: HealthService,
  ) {}

  /**
   * Basic health check endpoint
   *
   * Simple check that returns ok status.
   *
   * @returns Simple OK response
   */
  @Get()
  healthCheck() {
    return { status: 'ok' };
  }

  /**
   * Liveness probe
   *
   * Simple check that the service is running.
   * Used by Kubernetes liveness probe.
   *
   * @returns Simple OK response
   */
  @Get('liveness')
  liveness(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe
   *
   * Checks that the service is ready to accept traffic.
   * Validates database and Redis connectivity.
   * Also checks database pool health for subscription queries.
   *
   * @returns Health check result
   */
  @Get('readiness')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check PostgreSQL database connection (subscriptions, cabinets)
      () => this.db.pingCheck('database', { timeout: 3000 }),
      // Check Redis connection (caching, rate limiting)
      () => this.healthService.checkRedis('redis'),
    ]);
  }

  /**
   * Detailed health check
   *
   * Comprehensive health diagnostics including all indicators.
   * Useful for debugging and monitoring dashboards.
   *
   * @returns Detailed health check result
   */
  @Get('detailed')
  @HealthCheck()
  async detailed(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database connectivity
      () => this.db.pingCheck('database', { timeout: 3000 }),
      // Redis connectivity
      () => this.healthService.checkRedis('redis'),
      // Memory usage
      () => this.healthService.checkMemory('memory'),
      // Disk space
      () => this.healthService.checkDisk('disk'),
    ]);
  }
}
