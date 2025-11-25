/**
 * Health Controller
 *
 * REST API endpoints for health aggregation and monitoring.
 *
 * Endpoints:
 * - GET /health/all - Aggregate health of all services
 * - GET /health/services/:serviceName - Single service health
 * - GET /health/graph - Service dependency graph
 * - GET /health/history/:serviceName - Service health history
 * - GET /health/alerts - Alert history
 * - POST /health/check - Force health check
 * - GET /health/stats - Overall statistics
 *
 * @module health/controller
 */

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthStoreService } from './health-store.service';
import { AlertingService } from './alerting.service';
import { SERVICE_REGISTRY, getServiceByName } from '../config/services.config';

@ApiTags('Health Aggregator')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly healthStore: HealthStoreService,
    private readonly alerting: AlertingService,
  ) {}

  /**
   * Get aggregated health of all services
   *
   * Returns current health status for all microservices.
   * Results are cached for 5 seconds to reduce load.
   *
   * @returns Aggregated health data
   */
  @Get('all')
  @ApiOperation({
    summary: 'Get aggregated health of all services',
    description:
      'Returns current health status for all microservices. Results cached for 5 seconds.',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated health data returned successfully',
  })
  async getAllServicesHealth() {
    return this.healthService.getAggregatedHealth();
  }

  /**
   * Get health status for a specific service
   *
   * @param serviceName - Service identifier
   * @returns Service health summary
   */
  @Get('services/:serviceName')
  @ApiOperation({
    summary: 'Get health status for a specific service',
    description: 'Returns detailed health information for a single service',
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Service identifier (e.g., "auth", "billing")',
    example: 'auth',
  })
  @ApiResponse({ status: 200, description: 'Service health data returned' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceHealth(@Param('serviceName') serviceName: string) {
    const service = getServiceByName(serviceName);
    if (!service) {
      throw new NotFoundException(`Service not found: ${serviceName}`);
    }

    const health = await this.healthService.getServiceHealth(serviceName);
    if (!health) {
      throw new NotFoundException(`No health data available for service: ${serviceName}`);
    }

    // Include additional details
    const stats = this.healthStore.getServiceStats(serviceName);
    const recentAlerts = this.alerting.getServiceAlerts(serviceName, 10);

    return {
      ...health,
      stats: stats
        ? {
            totalChecks: stats.totalChecks,
            successfulChecks: stats.successfulChecks,
            recentHistory: stats.recentHistory,
          }
        : null,
      recentAlerts,
    };
  }

  /**
   * Get service dependency graph
   *
   * Returns graph data structure with nodes (services) and edges (dependencies).
   * Useful for visualizing service relationships.
   *
   * @returns Dependency graph
   */
  @Get('graph')
  @ApiOperation({
    summary: 'Get service dependency graph',
    description: 'Returns graph structure showing service dependencies and current health status',
  })
  @ApiResponse({ status: 200, description: 'Dependency graph returned' })
  async getDependencyGraph() {
    return this.healthService.getDependencyGraph();
  }

  /**
   * Get health history for a service
   *
   * @param serviceName - Service identifier
   * @param limit - Number of records to return (default: 20)
   * @returns Historical health check data
   */
  @Get('history/:serviceName')
  @ApiOperation({
    summary: 'Get health history for a service',
    description: 'Returns historical health check data for a specific service',
  })
  @ApiParam({
    name: 'serviceName',
    description: 'Service identifier',
    example: 'auth',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiResponse({ status: 200, description: 'Health history returned' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async getServiceHistory(
    @Param('serviceName') serviceName: string,
    @Query('limit') limit?: string,
  ) {
    const service = getServiceByName(serviceName);
    if (!service) {
      throw new NotFoundException(`Service not found: ${serviceName}`);
    }

    const limitNum = limit ? parseInt(limit, 10) : 20;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    const history = this.healthStore.getHistory(serviceName, limitNum);

    return {
      serviceName,
      displayName: service.displayName,
      count: history.length,
      history,
    };
  }

  /**
   * Get alert history
   *
   * @param limit - Number of alerts to return (default: 50)
   * @param serviceName - Filter by service (optional)
   * @returns Recent alerts
   */
  @Get('alerts')
  @ApiOperation({
    summary: 'Get alert history',
    description: 'Returns recent health alerts, optionally filtered by service',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of alerts to return',
    example: 50,
  })
  @ApiQuery({
    name: 'service',
    required: false,
    description: 'Filter by service name',
    example: 'auth',
  })
  @ApiResponse({ status: 200, description: 'Alert history returned' })
  async getAlerts(@Query('limit') limit?: string, @Query('service') serviceName?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 200) {
      throw new BadRequestException('Limit must be between 1 and 200');
    }

    let alerts;
    if (serviceName) {
      alerts = this.alerting.getServiceAlerts(serviceName, limitNum);
    } else {
      alerts = this.alerting.getAlertHistory(limitNum);
    }

    return {
      count: alerts.length,
      alerts,
    };
  }

  /**
   * Force immediate health check
   *
   * Triggers health check for all services or a specific service.
   *
   * @param serviceName - Optional service name
   */
  @Post('check')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Force immediate health check',
    description: 'Triggers an immediate health check for all services or a specific service',
  })
  @ApiQuery({
    name: 'service',
    required: false,
    description: 'Check specific service only',
    example: 'auth',
  })
  @ApiResponse({ status: 202, description: 'Health check initiated' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async forceHealthCheck(@Query('service') serviceName?: string) {
    if (serviceName) {
      const service = getServiceByName(serviceName);
      if (!service) {
        throw new NotFoundException(`Service not found: ${serviceName}`);
      }

      const result = await this.healthService.forceServiceHealthCheck(serviceName);
      return {
        message: `Health check initiated for service: ${serviceName}`,
        result,
      };
    } else {
      // Force check for all services (async)
      this.healthService.forceHealthCheck().catch((error) => {
        console.error('Force health check failed:', error);
      });

      return {
        message: 'Health check initiated for all services',
      };
    }
  }

  /**
   * Get overall health statistics
   *
   * Returns comprehensive statistics about the health monitoring system.
   *
   * @returns System statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get overall health statistics',
    description: 'Returns comprehensive statistics about the monitoring system',
  })
  @ApiResponse({ status: 200, description: 'Statistics returned' })
  async getStats() {
    const aggregated = await this.healthService.getAggregatedHealth();
    const storageStats = this.healthStore.getStorageStats();
    const alertingStats = this.alerting.getAlertingStats();

    return {
      timestamp: new Date(),
      services: {
        total: aggregated.totalServices,
        healthy: aggregated.healthyServices,
        degraded: aggregated.degradedServices,
        down: aggregated.downServices,
        overallStatus: aggregated.overallStatus,
      },
      storage: storageStats,
      alerting: alertingStats,
      registry: {
        totalServices: SERVICE_REGISTRY.length,
        criticalServices: SERVICE_REGISTRY.filter((s) => s.critical).length,
        categories: {
          backend: SERVICE_REGISTRY.filter((s) => s.category === 'backend').length,
          frontend: SERVICE_REGISTRY.filter((s) => s.category === 'frontend').length,
          gateway: SERVICE_REGISTRY.filter((s) => s.category === 'gateway').length,
          infrastructure: SERVICE_REGISTRY.filter((s) => s.category === 'infrastructure').length,
        },
      },
    };
  }

  /**
   * Get list of all registered services
   *
   * Returns the service registry configuration.
   *
   * @returns Service registry
   */
  @Get('registry')
  @ApiOperation({
    summary: 'Get service registry',
    description: 'Returns list of all registered services with their configuration',
  })
  @ApiResponse({ status: 200, description: 'Service registry returned' })
  async getRegistry() {
    return {
      count: SERVICE_REGISTRY.length,
      services: SERVICE_REGISTRY.map((service) => ({
        name: service.name,
        displayName: service.displayName,
        category: service.category,
        critical: service.critical,
        port: service.port,
        description: service.description,
        url: service.url,
      })),
    };
  }

  /**
   * Basic health check endpoint
   *
   * Simple check that returns ok status.
   *
   * @returns OK response
   */
  @Get()
  @ApiOperation({
    summary: 'Basic health check',
    description: 'Simple health check endpoint',
  })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  healthCheck() {
    return { status: 'ok' };
  }

  /**
   * Liveness probe
   *
   * Simple check that the health aggregator itself is running.
   *
   * @returns OK response
   */
  @Get('liveness')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Simple check that the health aggregator service is running',
  })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness probe
   *
   * Checks that the health aggregator is ready to serve traffic.
   *
   * @returns Readiness status
   */
  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Checks that the health aggregator is ready to serve traffic',
  })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readiness() {
    // Check if we have any health data
    const storageStats = this.healthStore.getStorageStats();
    const hasData = storageStats.totalRecords > 0;

    return {
      status: hasData ? 'ok' : 'initializing',
      timestamp: new Date().toISOString(),
      dataAvailable: hasData,
      servicesMonitored: storageStats.totalServices,
    };
  }
}
