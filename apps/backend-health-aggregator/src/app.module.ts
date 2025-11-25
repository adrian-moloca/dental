import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

// Health module
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { HealthStoreService } from './health/health-store.service';
import { AlertingService } from './health/alerting.service';

// Metrics module
import { MetricsModule } from './metrics/metrics.module';

// Global components
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { SanitizationMiddleware } from './middleware/sanitization.middleware';
import { RequestContextMiddleware } from './middleware/request-context.middleware';

/**
 * App Module
 *
 * Root application module for the Health Aggregator service.
 * Configures all necessary modules, services, controllers, and global components.
 *
 * Global Configuration:
 * - AllExceptionsFilter: Catches and formats all exceptions
 * - TransformInterceptor: Wraps responses in standardized format
 * - LoggingInterceptor: Logs all HTTP requests
 * - PerformanceInterceptor: Tracks request performance
 * - SanitizationMiddleware: Sanitizes input to prevent injection attacks
 * - RequestContextMiddleware: Enriches requests with correlation IDs
 *
 * @module app
 */
@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Scheduling module for cron jobs
    ScheduleModule.forRoot(),

    // Metrics module
    MetricsModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    HealthStoreService,
    AlertingService,

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },

    // Global interceptors (order matters!)
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures global middleware
   *
   * Middleware execution order:
   * 1. RequestContextMiddleware: Adds correlation IDs
   * 2. SanitizationMiddleware: Sanitizes input
   *
   * @param consumer - Middleware consumer
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware, SanitizationMiddleware).forRoutes('*');
  }
}
