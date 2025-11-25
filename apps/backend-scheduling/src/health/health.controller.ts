import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health Check Controller for Scheduling Service
 *
 * Provides three types of health check endpoints:
 * - GET /health: Basic health check with terminus
 * - GET /health/detailed: Comprehensive health information for monitoring
 *
 * Uses @nestjs/terminus for standardized health checks
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly serviceName = 'backend-scheduling';
  private readonly serviceVersion = process.env.SERVICE_VERSION || '1.0.0';

  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  /**
   * Basic health check endpoint
   *
   * Simple check that returns ok status without checking dependencies.
   * This endpoint should always return 200 if the service is running.
   *
   * @returns Simple OK response
   */
  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns simple ok status without dependency checks',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  healthCheck() {
    return { status: 'ok' };
  }

  /**
   * Readiness check endpoint with dependency validation
   *
   * Uses @nestjs/terminus to check:
   * - MongoDB connection
   * - Memory heap usage
   * - Memory RSS usage
   *
   * @returns Health check result from terminus
   */
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Returns health status with database and memory checks',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
  })
  readiness() {
    return this.health.check([
      () => this.mongoose.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  /**
   * Detailed health check endpoint
   *
   * Returns comprehensive health information for the health-aggregator service.
   * Includes all terminus checks plus additional metadata.
   *
   * Response format matches other services for consistency:
   * {
   *   status: 'ok' | 'degraded' | 'error',
   *   timestamp: ISO timestamp,
   *   service: service name,
   *   version: service version,
   *   uptime: process uptime in seconds,
   *   memory: { heapUsed, heapTotal, rss, external },
   *   checks: { database, memory_heap, memory_rss }
   * }
   *
   * @returns Detailed health check response
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Returns comprehensive health information including all dependency checks. Used by health-aggregator service.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  async detailed() {
    try {
      // Run terminus health checks
      const healthResult: HealthCheckResult = await this.health.check([
        () => this.mongoose.pingCheck('database'),
        () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
        () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      ]);

      // Extract status from terminus result
      const terminusStatus = healthResult.status;

      // Convert terminus status to our standard format
      let status: 'ok' | 'degraded' | 'error' = 'ok';
      if (terminusStatus === 'error') {
        status = 'error';
      } else if (terminusStatus === 'shutting_down') {
        status = 'degraded';
      }

      // Get memory usage
      const memUsage = process.memoryUsage();

      // Transform checks to match our standard format
      const checks: any = {};
      if (healthResult.info) {
        checks.mongodb = {
          status: healthResult.info.database?.status === 'up' ? 'ok' : 'error',
        };
        checks.memory = {
          status:
            healthResult.info.memory_heap?.status === 'up' &&
            healthResult.info.memory_rss?.status === 'up'
              ? 'ok'
              : 'error',
        };
      }

      return {
        status,
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        version: this.serviceVersion,
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        },
        checks,
      };
    } catch (error) {
      // If health checks fail, return error status
      const memUsage = process.memoryUsage();
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: this.serviceName,
        version: this.serviceVersion,
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          rss: Math.round(memUsage.rss / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024),
        },
        checks: {
          mongodb: { status: 'error', message: 'Health check failed' },
        },
      };
    }
  }
}
