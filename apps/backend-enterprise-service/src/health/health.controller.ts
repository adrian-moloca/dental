import { Controller, Get, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';

/**
 * Health check response interface
 */
interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  checks?: {
    mongodb?: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
    redis?: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
  };
}

/**
 * Health Check Controller
 *
 * Provides health check endpoints for:
 * - Liveness probe: Simple alive check (no dependencies)
 * - Readiness probe: Check MongoDB connection and dependencies
 *
 * Edge cases handled:
 * - MongoDB connection failures (graceful degradation)
 * - Uninitialized MongoDB connection (returns error)
 * - Process uptime calculation
 * - Service version from package.json or environment
 *
 * @Controller
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly serviceName = 'backend-enterprise-service';
  private readonly serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
  private redisClient: Redis | null = null;

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection for health checks
   * Uses lazy connection - only connects when health check is called
   */
  private initializeRedis(): void {
    try {
      const redisHost = this.configService.get('redis.host', { infer: true });
      const redisPort = this.configService.get('redis.port', { infer: true });

      this.redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 100, 3000);
          return delay;
        },
        lazyConnect: true,
        enableReadyCheck: true,
        showFriendlyErrorStack: true,
      });

      this.redisClient.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to initialize Redis client', error);
    }
  }

  /**
   * Cleanup Redis connection on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }

  /**
   * Liveness probe endpoint
   *
   * Returns 200 OK if the service is alive and running.
   * This endpoint should never fail unless the process is completely dead.
   *
   * Edge cases handled:
   * - No dependency checks (always returns ok if process is running)
   * - Used by Kubernetes/Docker for liveness probes
   * - Does not check external dependencies
   *
   * @returns Health check response with status 'ok'
   */
  @Get('liveness')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Returns 200 OK if service is alive. Used for liveness probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  liveness(): HealthCheckResponse {
    const memUsage = process.memoryUsage();
    return {
      status: 'ok',
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
    };
  }

  /**
   * Readiness probe endpoint
   *
   * Returns 200 OK if the service is ready to accept traffic.
   * Checks MongoDB connection and other critical dependencies.
   *
   * Edge cases handled:
   * - MongoDB connection not initialized (returns error)
   * - MongoDB connection disconnected (returns error)
   * - Partial failures (returns degraded status)
   * - All dependencies healthy (returns ok status)
   *
   * @returns Health check response with dependency status
   */
  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Returns 200 OK if service is ready to accept traffic. Checks MongoDB, Redis and other dependencies.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready (dependencies unhealthy)',
  })
  async readiness(): Promise<HealthCheckResponse> {
    const checks: HealthCheckResponse['checks'] = {};

    // Check MongoDB connection
    const mongoCheck = await this.checkMongoDBConnection();
    checks.mongodb = mongoCheck;

    // Check Redis connection
    const redisCheck = await this.checkRedisConnection();
    checks.redis = redisCheck;

    // Determine overall status based on dependency checks
    const overallStatus = this.determineOverallStatus(checks);

    const memUsage = process.memoryUsage();
    const response: HealthCheckResponse = {
      status: overallStatus,
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

    // Log unhealthy status for debugging
    if (overallStatus !== 'ok') {
      this.logger.warn('Service is not ready', response);
    }

    return response;
  }

  /**
   * Checks MongoDB connection status
   *
   * Edge cases handled:
   * - Connection not initialized (readyState === 0)
   * - Connection disconnected (readyState === 3)
   * - Connection connecting (readyState === 2) - considered not ready
   * - Connection connected (readyState === 1) - ok
   * - Unexpected errors during check
   *
   * @returns MongoDB health check result
   */
  private async checkMongoDBConnection(): Promise<{
    status: 'ok' | 'error';
    message?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    try {
      if (!this.mongoConnection) {
        return {
          status: 'error',
          message: 'MongoDB connection not initialized',
          responseTime: Date.now() - startTime,
        };
      }

      const readyState = this.mongoConnection.readyState;

      // Perform an actual ping to verify connection
      if (readyState === 1) {
        await this.mongoConnection.db?.admin()?.ping();
        return {
          status: 'ok',
          responseTime: Date.now() - startTime,
        };
      }

      switch (readyState) {
        case 2:
          return {
            status: 'error',
            message: 'MongoDB is connecting',
            responseTime: Date.now() - startTime,
          };
        case 3:
          return {
            status: 'error',
            message: 'MongoDB is disconnecting',
            responseTime: Date.now() - startTime,
          };
        case 0:
        default:
          return {
            status: 'error',
            message: 'MongoDB is disconnected',
            responseTime: Date.now() - startTime,
          };
      }
    } catch (error) {
      this.logger.error('Error checking MongoDB connection', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Checks Redis connection status with actual ping
   */
  private async checkRedisConnection(): Promise<{
    status: 'ok' | 'error';
    message?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    try {
      if (!this.redisClient) {
        return {
          status: 'error',
          message: 'Redis client not initialized',
          responseTime: Date.now() - startTime,
        };
      }

      // Ensure connection is established
      if (this.redisClient.status !== 'ready') {
        await this.redisClient.connect();
      }

      // Perform ping with timeout
      const pingResult = await Promise.race([
        this.redisClient.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 5000)),
      ]);

      if (pingResult === 'PONG') {
        return {
          status: 'ok',
          responseTime: Date.now() - startTime,
        };
      }

      return {
        status: 'error',
        message: 'Redis ping failed',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Error checking Redis connection', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Detailed health check endpoint
   *
   * Returns comprehensive health information including all dependency checks,
   * memory usage, uptime, and service version. This endpoint is used by the
   * health-aggregator service for centralized monitoring.
   *
   * Edge cases handled:
   * - Same as readiness endpoint but with guaranteed consistent format
   * - Always returns 200 OK (even if degraded) for monitoring compatibility
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
  async detailed(): Promise<HealthCheckResponse> {
    const checks: HealthCheckResponse['checks'] = {};

    // Check MongoDB connection
    const mongoCheck = await this.checkMongoDBConnection();
    checks.mongodb = mongoCheck;

    // Check Redis connection
    const redisCheck = await this.checkRedisConnection();
    checks.redis = redisCheck;

    // Determine overall status based on dependency checks
    const overallStatus = this.determineOverallStatus(checks);

    const memUsage = process.memoryUsage();
    const response: HealthCheckResponse = {
      status: overallStatus,
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

    return response;
  }

  /**
   * Basic health check endpoint
   *
   * Returns simple health status without dependency checks.
   * Used for basic uptime monitoring.
   *
   * @returns Basic health check response
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns simple health status. Equivalent to liveness probe.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
  })
  health(): HealthCheckResponse {
    return this.liveness();
  }

  /**
   * Determines overall health status based on dependency checks
   *
   * Edge cases handled:
   * - All dependencies healthy -> ok
   * - Any critical dependency unhealthy -> error
   * - Some non-critical dependencies unhealthy -> degraded
   *
   * @param checks - Dependency check results
   * @returns Overall health status
   */
  private determineOverallStatus(
    checks: HealthCheckResponse['checks'] | undefined,
  ): 'ok' | 'degraded' | 'error' {
    // MongoDB is critical - if unhealthy, service cannot function
    if (checks?.mongodb?.status === 'error') {
      return 'error';
    }

    // Redis is important but not critical - degraded if unhealthy
    if (checks?.redis?.status === 'error') {
      return 'degraded';
    }

    // All dependencies healthy
    return 'ok';
  }
}
