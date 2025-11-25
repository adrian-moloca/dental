/**
 * Health Store Service
 *
 * In-memory ring buffer storage for health check results.
 * Maintains last N health checks for each service to track trends.
 *
 * Features:
 * - Ring buffer implementation (fixed size, FIFO)
 * - Per-service health history
 * - Uptime calculation
 * - Average response time tracking
 * - Query capabilities (current status, history, statistics)
 *
 * @module health/health-store
 */

import { Injectable, Logger } from '@nestjs/common';

export interface HealthCheckRecord {
  serviceName: string;
  status: 'up' | 'down' | 'degraded';
  timestamp: Date;
  responseTime?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface ServiceHealthStats {
  serviceName: string;
  currentStatus: 'up' | 'down' | 'degraded';
  lastCheckTime: Date;
  uptimePercentage: number;
  averageResponseTime: number;
  consecutiveFailures: number;
  totalChecks: number;
  successfulChecks: number;
  recentHistory: HealthCheckRecord[];
}

@Injectable()
export class HealthStoreService {
  private readonly logger = new Logger(HealthStoreService.name);

  /**
   * Ring buffer size per service
   * Stores last 100 health checks per service
   */
  private readonly BUFFER_SIZE = 100;

  /**
   * In-memory storage: Map<serviceName, HealthCheckRecord[]>
   * Each array is a ring buffer of fixed size
   */
  private readonly storage = new Map<string, HealthCheckRecord[]>();

  /**
   * Current write position for each service's ring buffer
   */
  private readonly writePositions = new Map<string, number>();

  /**
   * Store a health check result
   *
   * Adds the check to the service's ring buffer.
   * Automatically overwrites oldest entry when buffer is full.
   *
   * @param record - Health check record to store
   */
  storeHealthCheck(record: HealthCheckRecord): void {
    const { serviceName } = record;

    // Initialize storage for new service
    if (!this.storage.has(serviceName)) {
      this.storage.set(serviceName, []);
      this.writePositions.set(serviceName, 0);
    }

    const buffer = this.storage.get(serviceName)!;
    const position = this.writePositions.get(serviceName)!;

    // Write to ring buffer
    if (buffer.length < this.BUFFER_SIZE) {
      // Buffer not yet full, just append
      buffer.push(record);
    } else {
      // Buffer full, overwrite oldest entry
      buffer[position] = record;
    }

    // Update write position (circular)
    const nextPosition = (position + 1) % this.BUFFER_SIZE;
    this.writePositions.set(serviceName, nextPosition);

    this.logger.debug(
      `Stored health check for ${serviceName}: ${record.status} (${record.responseTime}ms)`,
    );
  }

  /**
   * Get current health status for a service
   *
   * Returns the most recent health check record.
   *
   * @param serviceName - Service identifier
   * @returns Most recent health check or null if no data
   */
  getCurrentStatus(serviceName: string): HealthCheckRecord | null {
    const buffer = this.storage.get(serviceName);
    if (!buffer || buffer.length === 0) {
      return null;
    }

    // Find most recent check (highest timestamp)
    return buffer.reduce((latest, current) =>
      current.timestamp > latest.timestamp ? current : latest,
    );
  }

  /**
   * Get health history for a service
   *
   * Returns recent health checks in chronological order (oldest first).
   *
   * @param serviceName - Service identifier
   * @param limit - Maximum number of records to return (default: 20)
   * @returns Array of health check records
   */
  getHistory(serviceName: string, limit = 20): HealthCheckRecord[] {
    const buffer = this.storage.get(serviceName);
    if (!buffer || buffer.length === 0) {
      return [];
    }

    // Sort by timestamp (oldest first)
    const sorted = [...buffer].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Return last N records
    return sorted.slice(-limit);
  }

  /**
   * Get comprehensive health statistics for a service
   *
   * Calculates:
   * - Current status
   * - Uptime percentage
   * - Average response time
   * - Consecutive failures
   * - Recent history
   *
   * @param serviceName - Service identifier
   * @returns Service health statistics or null if no data
   */
  getServiceStats(serviceName: string): ServiceHealthStats | null {
    const buffer = this.storage.get(serviceName);
    if (!buffer || buffer.length === 0) {
      return null;
    }

    const currentStatus = this.getCurrentStatus(serviceName);
    if (!currentStatus) {
      return null;
    }

    // Calculate statistics
    const totalChecks = buffer.length;
    const successfulChecks = buffer.filter((check) => check.status === 'up').length;
    const uptimePercentage = (successfulChecks / totalChecks) * 100;

    // Calculate average response time (only for successful checks)
    const responseTimes = buffer
      .filter((check) => check.responseTime != null)
      .map((check) => check.responseTime!);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

    // Count consecutive failures (from most recent)
    const sortedBuffer = [...buffer].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    let consecutiveFailures = 0;
    for (const check of sortedBuffer) {
      if (check.status === 'down') {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    // Get recent history (last 10 checks)
    const recentHistory = this.getHistory(serviceName, 10);

    return {
      serviceName,
      currentStatus: currentStatus.status,
      lastCheckTime: currentStatus.timestamp,
      uptimePercentage: Math.round(uptimePercentage * 10) / 10,
      averageResponseTime: Math.round(averageResponseTime),
      consecutiveFailures,
      totalChecks,
      successfulChecks,
      recentHistory,
    };
  }

  /**
   * Get statistics for all services
   *
   * @returns Array of service health statistics
   */
  getAllServiceStats(): ServiceHealthStats[] {
    const stats: ServiceHealthStats[] = [];

    for (const serviceName of this.storage.keys()) {
      const serviceStats = this.getServiceStats(serviceName);
      if (serviceStats) {
        stats.push(serviceStats);
      }
    }

    // Sort by service name
    return stats.sort((a, b) => a.serviceName.localeCompare(b.serviceName));
  }

  /**
   * Get unhealthy services (status: down or degraded)
   *
   * @returns Array of service names that are currently unhealthy
   */
  getUnhealthyServices(): string[] {
    const unhealthy: string[] = [];

    for (const serviceName of this.storage.keys()) {
      const status = this.getCurrentStatus(serviceName);
      if (status && (status.status === 'down' || status.status === 'degraded')) {
        unhealthy.push(serviceName);
      }
    }

    return unhealthy;
  }

  /**
   * Get services with consecutive failures
   *
   * Returns services that have failed N or more times in a row.
   *
   * @param threshold - Minimum number of consecutive failures (default: 3)
   * @returns Array of service names with high failure counts
   */
  getServicesWithConsecutiveFailures(threshold = 3): string[] {
    const services: string[] = [];

    for (const serviceName of this.storage.keys()) {
      const stats = this.getServiceStats(serviceName);
      if (stats && stats.consecutiveFailures >= threshold) {
        services.push(serviceName);
      }
    }

    return services;
  }

  /**
   * Clear health history for a service
   *
   * @param serviceName - Service identifier
   */
  clearServiceHistory(serviceName: string): void {
    this.storage.delete(serviceName);
    this.writePositions.delete(serviceName);
    this.logger.log(`Cleared health history for service: ${serviceName}`);
  }

  /**
   * Clear all health history
   */
  clearAllHistory(): void {
    this.storage.clear();
    this.writePositions.clear();
    this.logger.log('Cleared all health history');
  }

  /**
   * Get memory usage statistics
   *
   * Returns information about storage usage.
   *
   * @returns Storage statistics
   */
  getStorageStats(): {
    totalServices: number;
    totalRecords: number;
    bufferSize: number;
    memoryUsageEstimate: string;
  } {
    let totalRecords = 0;
    for (const buffer of this.storage.values()) {
      totalRecords += buffer.length;
    }

    // Rough estimate: ~500 bytes per record
    const estimatedBytes = totalRecords * 500;
    const memoryUsageEstimate =
      estimatedBytes < 1024 * 1024
        ? `${Math.round(estimatedBytes / 1024)} KB`
        : `${Math.round(estimatedBytes / (1024 * 1024))} MB`;

    return {
      totalServices: this.storage.size,
      totalRecords,
      bufferSize: this.BUFFER_SIZE,
      memoryUsageEstimate,
    };
  }
}
