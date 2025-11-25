/**
 * Health Service
 *
 * Core service for polling and aggregating health checks from all microservices.
 * Runs scheduled tasks to check service health and maintains up-to-date status.
 *
 * Features:
 * - Scheduled health checks (every 30 seconds)
 * - Parallel service polling
 * - Automatic retry logic
 * - Integration with health store and alerting
 * - Service dependency graph generation
 *
 * @module health/health
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import {
  SERVICE_REGISTRY,
  ServiceDefinition,
  SERVICE_DEPENDENCIES,
} from '../config/services.config';
import { HealthStoreService, HealthCheckRecord } from './health-store.service';
import { AlertingService } from './alerting.service';

export interface AggregatedHealth {
  timestamp: Date;
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  overallStatus: 'healthy' | 'degraded' | 'critical';
  services: ServiceHealthSummary[];
}

export interface ServiceHealthSummary {
  name: string;
  displayName: string;
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  lastCheckTime: Date;
  error?: string;
  critical: boolean;
  category: string;
  uptimePercentage?: number;
  consecutiveFailures?: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  name: string;
  displayName: string;
  status: 'up' | 'down' | 'degraded' | 'unknown';
  critical: boolean;
  category: string;
}

export interface DependencyEdge {
  source: string;
  target: string;
}

@Injectable()
export class HealthService implements OnModuleInit {
  private readonly logger = new Logger(HealthService.name);

  /**
   * Flag to track if initial health check has completed
   */
  private initialCheckComplete = false;

  /**
   * Last aggregated health snapshot
   */
  private lastAggregatedHealth: AggregatedHealth | null = null;

  /**
   * Cache TTL for aggregated results (5 seconds)
   */
  private readonly CACHE_TTL_MS = 5000;

  constructor(
    private readonly healthStore: HealthStoreService,
    private readonly alerting: AlertingService,
  ) {}

  /**
   * Run initial health check on module initialization
   */
  async onModuleInit() {
    this.logger.log('Health service initialized. Running initial health check...');
    await this.performHealthChecks();
    this.initialCheckComplete = true;
    this.logger.log(
      `Initial health check complete. Monitoring ${SERVICE_REGISTRY.length} services.`,
    );
  }

  /**
   * Scheduled health check job
   *
   * Runs every 30 seconds to poll all services.
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async scheduledHealthCheck() {
    if (!this.initialCheckComplete) {
      return; // Skip if initial check hasn't completed
    }

    try {
      await this.performHealthChecks();
    } catch (error) {
      this.logger.error(
        `Scheduled health check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Perform health checks for all services
   *
   * Polls all services in parallel and stores results.
   */
  private async performHealthChecks(): Promise<void> {
    const startTime = Date.now();
    this.logger.debug(`Starting health check for ${SERVICE_REGISTRY.length} services...`);

    // Poll all services in parallel
    const checks = SERVICE_REGISTRY.map((service) => this.checkServiceHealth(service));

    const results = await Promise.allSettled(checks);

    // Process results
    let successCount = 0;
    let failureCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successCount++;
      } else {
        failureCount++;
        this.logger.error(
          `Health check failed for ${SERVICE_REGISTRY[index].name}: ${result.reason}`,
        );
      }
    });

    const duration = Date.now() - startTime;
    this.logger.debug(
      `Health check completed in ${duration}ms (${successCount} successful, ${failureCount} failed)`,
    );

    // Invalidate cache
    this.lastAggregatedHealth = null;
  }

  /**
   * Check health of a single service
   *
   * @param service - Service definition
   */
  private async checkServiceHealth(service: ServiceDefinition): Promise<HealthCheckRecord> {
    const startTime = Date.now();

    try {
      const response = await axios.get(service.url, {
        timeout: service.timeout || 5000,
        validateStatus: (status) => status === 200,
        headers: {
          'User-Agent': 'DentalOS-HealthAggregator/1.0',
        },
      });

      const responseTime = Date.now() - startTime;

      // Parse response to determine status
      const status = this.parseHealthStatus(response.data);

      const record: HealthCheckRecord = {
        serviceName: service.name,
        status,
        timestamp: new Date(),
        responseTime,
        metadata: {
          statusCode: response.status,
          endpoint: service.url,
        },
      };

      // Store in health store
      this.healthStore.storeHealthCheck(record);

      // Get statistics for alerting
      const stats = this.healthStore.getServiceStats(service.name);

      // Process alert
      await this.alerting.processHealthCheck(
        service,
        status,
        undefined,
        responseTime,
        stats?.consecutiveFailures,
        stats?.uptimePercentage,
      );

      return record;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = this.extractErrorMessage(error);

      const record: HealthCheckRecord = {
        serviceName: service.name,
        status: 'down',
        timestamp: new Date(),
        responseTime,
        error: errorMessage,
        metadata: {
          endpoint: service.url,
        },
      };

      // Store in health store
      this.healthStore.storeHealthCheck(record);

      // Get statistics for alerting
      const stats = this.healthStore.getServiceStats(service.name);

      // Process alert
      await this.alerting.processHealthCheck(
        service,
        'down',
        errorMessage,
        responseTime,
        stats?.consecutiveFailures,
        stats?.uptimePercentage,
      );

      return record;
    }
  }

  /**
   * Parse health status from response
   *
   * @param data - Response data
   * @returns Health status
   */
  private parseHealthStatus(data: any): 'up' | 'down' | 'degraded' {
    // Handle @nestjs/terminus format
    if (data.status === 'ok') {
      return 'up';
    }
    if (data.status === 'error') {
      return 'down';
    }
    if (data.status === 'degraded') {
      return 'degraded';
    }

    // Handle custom format
    if (data.healthy === true || data.health === 'healthy') {
      return 'up';
    }
    if (data.healthy === false || data.health === 'unhealthy') {
      return 'down';
    }

    // Default: check if any info indicates problems
    if (data.info && Object.keys(data.info).length > 0) {
      return 'up';
    }
    if (data.error && Object.keys(data.error).length > 0) {
      return 'down';
    }

    // Assume healthy if we got a 200 response
    return 'up';
  }

  /**
   * Get aggregated health of all services
   *
   * Returns cached result if available and fresh.
   *
   * @returns Aggregated health status
   */
  async getAggregatedHealth(): Promise<AggregatedHealth> {
    // Return cached result if available and fresh
    if (
      this.lastAggregatedHealth &&
      Date.now() - this.lastAggregatedHealth.timestamp.getTime() < this.CACHE_TTL_MS
    ) {
      return this.lastAggregatedHealth;
    }

    // Build aggregated health
    const allStats = this.healthStore.getAllServiceStats();
    const services: ServiceHealthSummary[] = [];

    for (const service of SERVICE_REGISTRY) {
      const stats = allStats.find((s) => s.serviceName === service.name);

      if (stats) {
        services.push({
          name: service.name,
          displayName: service.displayName,
          status: stats.currentStatus,
          responseTime: stats.averageResponseTime,
          lastCheckTime: stats.lastCheckTime,
          critical: service.critical,
          category: service.category,
          uptimePercentage: stats.uptimePercentage,
          consecutiveFailures: stats.consecutiveFailures,
        });
      } else {
        // Service not yet checked
        services.push({
          name: service.name,
          displayName: service.displayName,
          status: 'down',
          lastCheckTime: new Date(),
          error: 'No health check data available',
          critical: service.critical,
          category: service.category,
        });
      }
    }

    // Calculate overall statistics
    const healthyCount = services.filter((s) => s.status === 'up').length;
    const degradedCount = services.filter((s) => s.status === 'degraded').length;
    const downCount = services.filter((s) => s.status === 'down').length;

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const criticalServicesDown = services.filter((s) => s.critical && s.status === 'down').length;

    if (criticalServicesDown > 0 || downCount > services.length / 2) {
      overallStatus = 'critical';
    } else if (degradedCount > 0 || downCount > 0) {
      overallStatus = 'degraded';
    }

    const aggregated: AggregatedHealth = {
      timestamp: new Date(),
      totalServices: services.length,
      healthyServices: healthyCount,
      degradedServices: degradedCount,
      downServices: downCount,
      overallStatus,
      services,
    };

    // Cache result
    this.lastAggregatedHealth = aggregated;

    return aggregated;
  }

  /**
   * Get health status for a specific service
   *
   * @param serviceName - Service identifier
   * @returns Service health summary or null
   */
  async getServiceHealth(serviceName: string): Promise<ServiceHealthSummary | null> {
    const service = SERVICE_REGISTRY.find((s) => s.name === serviceName);
    if (!service) {
      return null;
    }

    const stats = this.healthStore.getServiceStats(serviceName);
    if (!stats) {
      return null;
    }

    return {
      name: service.name,
      displayName: service.displayName,
      status: stats.currentStatus,
      responseTime: stats.averageResponseTime,
      lastCheckTime: stats.lastCheckTime,
      critical: service.critical,
      category: service.category,
      uptimePercentage: stats.uptimePercentage,
      consecutiveFailures: stats.consecutiveFailures,
    };
  }

  /**
   * Generate service dependency graph
   *
   * @returns Dependency graph with nodes and edges
   */
  async getDependencyGraph(): Promise<DependencyGraph> {
    const allStats = this.healthStore.getAllServiceStats();
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Build nodes
    for (const service of SERVICE_REGISTRY) {
      const stats = allStats.find((s) => s.serviceName === service.name);

      nodes.push({
        id: service.name,
        name: service.name,
        displayName: service.displayName,
        status: stats ? stats.currentStatus : 'unknown',
        critical: service.critical,
        category: service.category,
      });
    }

    // Build edges from dependency map
    for (const [source, targets] of Object.entries(SERVICE_DEPENDENCIES)) {
      for (const target of targets) {
        edges.push({ source, target });
      }
    }

    return { nodes, edges };
  }

  /**
   * Force immediate health check for all services
   */
  async forceHealthCheck(): Promise<void> {
    this.logger.log('Forcing immediate health check for all services...');
    await this.performHealthChecks();
  }

  /**
   * Force health check for specific service
   *
   * @param serviceName - Service identifier
   */
  async forceServiceHealthCheck(serviceName: string): Promise<HealthCheckRecord | null> {
    const service = SERVICE_REGISTRY.find((s) => s.name === serviceName);
    if (!service) {
      return null;
    }

    this.logger.log(`Forcing health check for service: ${serviceName}`);
    return this.checkServiceHealth(service);
  }

  /**
   * Extract error message from error object
   */
  private extractErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        return 'Connection refused - service may be down';
      }
      if (error.code === 'ETIMEDOUT') {
        return 'Connection timeout';
      }
      if (error.response) {
        return `HTTP ${error.response.status}: ${error.response.statusText}`;
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
