import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

/**
 * Metrics Controller
 *
 * Exposes Prometheus metrics endpoint for scraping
 * Endpoint: GET /metrics
 */
@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  @ApiExcludeEndpoint() // Exclude from Swagger to reduce clutter
  @ApiOperation({
    summary: 'Prometheus metrics',
    description: 'Returns metrics in Prometheus format for scraping',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics in Prometheus format',
  })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}
