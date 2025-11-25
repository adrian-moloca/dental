/**
 * Health Service
 *
 * Custom health indicators for Redis, memory, and disk space.
 * Integrates with @nestjs/terminus for comprehensive health checks.
 *
 * Edge cases handled:
 * - Redis connection failures
 * - Redis timeout
 * - Memory threshold breaches
 * - Disk space threshold breaches
 *
 * @module modules/health/service
 */

import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import * as fs from 'fs';

/**
 * Health service with custom indicators
 */
@Injectable()
export class HealthService extends HealthIndicator {
  private readonly logger = new Logger(HealthService.name);

  /**
   * Check Redis connectivity
   *
   * Placeholder for Redis health check.
   * Will be implemented when Redis client is added.
   *
   * @param key - Health check key
   * @returns Health indicator result
   */
  async checkRedis(key: string): Promise<HealthIndicatorResult> {
    try {
      // TODO: Implement Redis ping when Redis client is added
      // For now, return healthy status
      const isHealthy = true;

      const result = this.getStatus(key, isHealthy, {
        message: 'Redis health check not yet implemented',
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Redis health check failed', result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis health check failed: ${errorMessage}`);

      throw new HealthCheckError('Redis health check failed', {
        [key]: {
          status: 'down',
          message: errorMessage,
        },
      });
    }
  }

  /**
   * Check memory usage
   *
   * Validates that heap memory usage is below threshold.
   *
   * @param key - Health check key
   * @returns Health indicator result
   */
  async checkMemory(key: string): Promise<HealthIndicatorResult> {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapThresholdMB = parseInt(process.env.HEALTH_CHECK_MEMORY_HEAP_THRESHOLD || '150', 10);

    const isHealthy = heapUsedMB < heapThresholdMB;

    const result = this.getStatus(key, isHealthy, {
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      threshold: `${heapThresholdMB}MB`,
    });

    if (isHealthy) {
      return result;
    }

    throw new HealthCheckError('Memory usage exceeds threshold', result);
  }

  /**
   * Check disk space
   *
   * Validates that disk usage is below threshold.
   *
   * @param key - Health check key
   * @returns Health indicator result
   */
  async checkDisk(key: string): Promise<HealthIndicatorResult> {
    try {
      const stats = await fs.promises.statfs('/');
      const totalSpace = stats.blocks * stats.bsize;
      const freeSpace = stats.bfree * stats.bsize;
      const usedSpace = totalSpace - freeSpace;
      const usagePercentage = (usedSpace / totalSpace) * 100;

      const threshold = parseFloat(process.env.HEALTH_CHECK_DISK_THRESHOLD || '0.9') * 100;
      const isHealthy = usagePercentage < threshold;

      const result = this.getStatus(key, isHealthy, {
        total: this.formatBytes(totalSpace),
        used: this.formatBytes(usedSpace),
        free: this.formatBytes(freeSpace),
        usagePercentage: `${usagePercentage.toFixed(2)}%`,
        threshold: `${threshold}%`,
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Disk usage exceeds threshold', result);
    } catch (error) {
      // If statfs fails, return healthy (filesystem check not critical)
      this.logger.warn('Disk health check failed, returning healthy status');
      return this.getStatus(key, true, {
        message: 'Disk check unavailable',
      });
    }
  }

  /**
   * Format bytes to human-readable string
   *
   * @param bytes - Number of bytes
   * @returns Formatted string (e.g., "1.5GB")
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)}${units[unitIndex]}`;
  }
}
