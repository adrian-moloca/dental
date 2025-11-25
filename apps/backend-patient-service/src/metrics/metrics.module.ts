import { Module, Global } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';

/**
 * Metrics Module
 *
 * Provides Prometheus metrics collection and exposure.
 * This module is global to allow metrics collection from any service.
 *
 * Exports:
 * - MetricsService: For recording custom metrics
 * - MetricsInterceptor: For automatic HTTP metrics
 */
@Global()
@Module({
  controllers: [MetricsController],
  providers: [MetricsService, MetricsInterceptor],
  exports: [MetricsService, MetricsInterceptor],
})
export class MetricsModule {}
