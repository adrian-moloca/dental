import { Controller, Get, Header } from '@nestjs/common';
import { PrometheusMetricsService } from '@dentalos/shared-infra';

/**
 * Metrics controller exposing Prometheus metrics endpoint.
 * Kubernetes/monitoring systems scrape /metrics for observability.
 */
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: PrometheusMetricsService) {}

  /**
   * GET /metrics
   * Returns Prometheus-formatted metrics.
   */
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  /**
   * GET /metrics/json
   * Returns metrics as JSON for debugging.
   */
  @Get('json')
  async getMetricsJson(): Promise<any> {
    return this.metricsService.getMetricsJSON();
  }
}
