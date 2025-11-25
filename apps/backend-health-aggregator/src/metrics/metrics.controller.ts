import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

/**
 * Metrics Controller
 *
 * Exposes metrics endpoints for monitoring and observability
 */
@Controller('metrics')
@ApiTags('Metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  /**
   * Get all metrics in JSON format
   */
  @Get()
  @ApiOperation({
    summary: 'Get all metrics',
    description: 'Returns all tracked metrics in JSON format',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics retrieved successfully',
  })
  getMetrics(): Record<string, number> {
    return this.metricsService.getAll();
  }

  /**
   * Get metrics in Prometheus text format
   */
  @Get('prometheus')
  @Header('Content-Type', 'text/plain')
  @ApiOperation({
    summary: 'Get Prometheus metrics',
    description: 'Returns metrics in Prometheus text format for scraping',
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics retrieved successfully',
  })
  getPrometheusMetrics(): string {
    return this.metricsService.getPrometheusMetrics();
  }
}
