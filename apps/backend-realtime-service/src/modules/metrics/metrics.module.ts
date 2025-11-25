import { Module, Global } from '@nestjs/common';
import { PrometheusMetricsService } from '@dentalos/shared-infra';
import { MetricsController } from './metrics.controller';

/**
 * Global metrics module providing Prometheus metrics across the service.
 */
@Global()
@Module({
  providers: [PrometheusMetricsService],
  controllers: [MetricsController],
  exports: [PrometheusMetricsService],
})
export class MetricsModule {}
