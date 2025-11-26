import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationMiddleware } from '@dentalos/shared-tracing';

import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { HealthController } from './health/health.controller';
import { MetricsModule } from './metrics/metrics.module';
import { CacheModule } from './common/cache/cache.module';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';

// Filters & Interceptors
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

// Middleware
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';
import { ResponseTimeMiddleware } from './common/middleware/response-time.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        // Connection pool configuration for better performance
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        // Automatically reconnect
        retryWrites: true,
        retryReads: true,
        // Enable connection monitoring
        monitorCommands: true,
        ...configService.get('database.options'),
      }),
      inject: [ConfigService],
    }),

    // Event Emitter for domain events
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Health Checks
    TerminusModule,

    // Metrics
    MetricsModule,

    // Cache
    CacheModule,

    // Feature Modules
    AppointmentsModule,
    RemindersModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global Interceptors (order matters: Metrics -> Performance -> Logging -> Transform)
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware pipeline
   * Order matters: Context -> ResponseTime -> Correlation
   */
  configure(consumer: MiddlewareConsumer): void {
    // Request context middleware (tenant/user context extraction)
    consumer.apply(RequestContextMiddleware).forRoutes('*');

    // Response time tracking middleware
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');

    // Correlation ID middleware for tracing
    const correlationMiddleware = new CorrelationMiddleware({
      serviceName: 'backend-scheduling',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      enableLogging: true,
      includeInResponse: true,
    });
    consumer
      .apply((req: any, res: any, next: any) => correlationMiddleware.use(req, res, next))
      .forRoutes('*');
  }
}
