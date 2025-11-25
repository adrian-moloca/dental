import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

/**
 * Metrics Module
 *
 * Provides Prometheus metrics collection and exposure.
 * This module is global to allow metrics collection from any service.
 *
 * Exports:
 * - MetricsService: For recording custom metrics
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
