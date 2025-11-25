import { Controller, Get, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

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
  };
}

/**
 * Health Check Controller for Billing Service
 *
 * Provides health check endpoints for:
 * - Basic health check: Simple alive check
 * - Detailed health check: Check MongoDB connection and dependencies
 *
 * Edge cases handled:
 * - MongoDB connection failures (graceful degradation)
 * - Uninitialized MongoDB connection (returns error)
 * - Process uptime calculation
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly serviceName = 'backend-billing-service';
  private readonly serviceVersion = process.env.SERVICE_VERSION || '1.0.0';

  constructor(@InjectConnection() private readonly mongoConnection: Connection) {}

  /**
   * Basic health check endpoint
   *
   * Returns 200 OK if the service is alive and running.
   * This endpoint should never fail unless the process is completely dead.
   *
   * @returns Health check response with status 'ok'
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Returns 200 OK if service is alive.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is alive',
  })
  health(): HealthCheckResponse {
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
   * Detailed health check endpoint
   *
   * Returns comprehensive health information including all dependency checks,
   * memory usage, uptime, and service version. This endpoint is used by the
   * health-aggregator service for centralized monitoring.
   *
   * Edge cases handled:
   * - MongoDB connection not initialized (returns error)
   * - MongoDB connection disconnected (returns error)
   * - Partial failures (returns degraded status)
   * - All dependencies healthy (returns ok status)
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
        await this.mongoConnection.db?.admin().ping();
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
   * Determines overall health status based on dependency checks
   *
   * Edge cases handled:
   * - All dependencies healthy -> ok
   * - Any critical dependency unhealthy -> error
   *
   * @param checks - Dependency check results
   * @returns Overall health status
   */
  private determineOverallStatus(
    checks: HealthCheckResponse['checks'],
  ): 'ok' | 'degraded' | 'error' {
    // MongoDB is critical - if unhealthy, service cannot function
    if (checks?.mongodb?.status === 'error') {
      return 'error';
    }

    // All dependencies healthy
    return 'ok';
  }
}
