/**
 * Dependency Health Service
 *
 * Shared utilities for checking health of service dependencies.
 * Used across all microservices to validate external service connectivity.
 *
 * @module shared-infra/health
 */

import { Injectable, Logger } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import axios, { AxiosError } from 'axios';

export interface DependencyHealthCheck {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface HttpHealthCheckOptions {
  url: string;
  timeout?: number;
  expectedStatus?: number;
  retries?: number;
}

@Injectable()
export class DependencyHealthService {
  private readonly logger = new Logger(DependencyHealthService.name);

  /**
   * Check HTTP endpoint health
   *
   * Performs HTTP GET request to validate service availability.
   * Measures response time and validates status code.
   *
   * @param options - HTTP health check options
   * @returns Health check result
   */
  async checkHttpEndpoint(
    options: HttpHealthCheckOptions,
  ): Promise<DependencyHealthCheck> {
    const {
      url,
      timeout = 5000,
      expectedStatus = 200,
      retries = 1,
    } = options;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout,
          validateStatus: (status: number) => status === expectedStatus,
          headers: {
            'User-Agent': 'DentalOS-HealthAggregator/1.0',
          },
        });

        const responseTime = Date.now() - startTime;

        return {
          name: this.extractServiceName(url),
          status: 'up',
          responseTime,
          metadata: {
            statusCode: response.status,
            attempt,
          },
        };
      } catch (error) {
        if (attempt === retries) {
          const responseTime = Date.now() - startTime;
          const errorMessage = this.extractErrorMessage(error);

          this.logger.warn(
            `HTTP endpoint check failed: ${url} - ${errorMessage}`,
          );

          return {
            name: this.extractServiceName(url),
            status: 'down',
            responseTime,
            error: errorMessage,
            metadata: {
              attempts: retries,
            },
          };
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }

    // Should never reach here
    return {
      name: this.extractServiceName(url),
      status: 'down',
      error: 'All retry attempts failed',
    };
  }

  /**
   * Check database connection health
   *
   * Validates database connectivity by executing a simple query.
   * Measures query execution time.
   *
   * @param dataSource - TypeORM data source
   * @param name - Database connection name (default: 'database')
   * @returns Health check result
   */
  async checkDatabaseConnection(
    dataSource: DataSource,
    name = 'database',
  ): Promise<DependencyHealthCheck> {
    const startTime = Date.now();

    try {
      if (!dataSource.isInitialized) {
        return {
          name,
          status: 'down',
          error: 'DataSource not initialized',
        };
      }

      // Execute simple query to validate connection
      await dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: 'up',
        responseTime,
        metadata: {
          driver: dataSource.driver.options.type,
          database: dataSource.driver.database,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`Database health check failed: ${errorMessage}`);

      return {
        name,
        status: 'down',
        responseTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Check Redis connection health
   *
   * Validates Redis connectivity by executing PING command.
   * Measures command execution time.
   *
   * @param redis - Redis client instance
   * @param name - Redis connection name (default: 'redis')
   * @returns Health check result
   */
  async checkRedisConnection(
    redis: Redis,
    name = 'redis',
  ): Promise<DependencyHealthCheck> {
    const startTime = Date.now();

    try {
      const response = await redis.ping();
      const responseTime = Date.now() - startTime;

      if (response !== 'PONG') {
        return {
          name,
          status: 'degraded',
          responseTime,
          error: `Unexpected ping response: ${response}`,
        };
      }

      return {
        name,
        status: 'up',
        responseTime,
        metadata: {
          host: redis.options.host,
          port: redis.options.port,
          db: redis.options.db,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      this.logger.error(`Redis health check failed: ${errorMessage}`);

      return {
        name,
        status: 'down',
        responseTime,
        error: errorMessage,
      };
    }
  }

  /**
   * Check multiple HTTP endpoints in parallel
   *
   * Performs concurrent health checks for multiple service endpoints.
   * Useful for checking all service dependencies at once.
   *
   * @param endpoints - Array of endpoint configurations
   * @returns Array of health check results
   */
  async checkMultipleEndpoints(
    endpoints: HttpHealthCheckOptions[],
  ): Promise<DependencyHealthCheck[]> {
    const checks = endpoints.map((endpoint) =>
      this.checkHttpEndpoint(endpoint),
    );
    return Promise.all(checks);
  }

  /**
   * Aggregate health status from multiple checks
   *
   * Determines overall health status based on individual check results.
   * Logic:
   * - If all checks are 'up' -> 'up'
   * - If any check is 'down' -> 'down'
   * - If any check is 'degraded' -> 'degraded'
   *
   * @param checks - Array of health check results
   * @returns Aggregated health status
   */
  aggregateHealthStatus(
    checks: DependencyHealthCheck[],
  ): 'up' | 'down' | 'degraded' {
    if (checks.length === 0) {
      return 'up';
    }

    const hasDown = checks.some((check) => check.status === 'down');
    const hasDegraded = checks.some((check) => check.status === 'degraded');

    if (hasDown) {
      return 'down';
    }
    if (hasDegraded) {
      return 'degraded';
    }
    return 'up';
  }

  /**
   * Calculate average response time from checks
   *
   * @param checks - Array of health check results
   * @returns Average response time in milliseconds
   */
  calculateAverageResponseTime(checks: DependencyHealthCheck[]): number {
    const validChecks = checks.filter((check) => check.responseTime != null);

    if (validChecks.length === 0) {
      return 0;
    }

    const total = validChecks.reduce(
      (sum, check) => sum + (check.responseTime || 0),
      0,
    );
    return Math.round(total / validChecks.length);
  }

  /**
   * Calculate uptime percentage
   *
   * @param successfulChecks - Number of successful checks
   * @param totalChecks - Total number of checks
   * @returns Uptime percentage (0-100)
   */
  calculateUptime(successfulChecks: number, totalChecks: number): number {
    if (totalChecks === 0) {
      return 100;
    }
    return Math.round((successfulChecks / totalChecks) * 100 * 10) / 10;
  }

  /**
   * Extract service name from URL
   *
   * @param url - Service URL
   * @returns Extracted service name
   */
  private extractServiceName(url: string): string {
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter((p) => p);
      return parts[0] || urlObj.hostname;
    } catch {
      return url;
    }
  }

  /**
   * Extract error message from error object
   *
   * @param error - Error object
   * @returns Human-readable error message
   */
  private extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.code === 'ECONNREFUSED') {
        return 'Connection refused';
      }
      if (axiosError.code === 'ETIMEDOUT') {
        return 'Connection timeout';
      }
      if (axiosError.response) {
        return `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
      }
      return axiosError.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }

  /**
   * Sleep utility for retry logic
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
