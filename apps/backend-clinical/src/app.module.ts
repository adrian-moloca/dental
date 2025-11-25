/**
 * Root Application Module
 */

import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
// import { CorrelationMiddleware } from '@dentalos/shared-tracing';

// Auth Module
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards';

// Health Module
import { HealthModule } from './health/health.module';

// Feature Modules
import { OdontogramModule } from './modules/odontogram/odontogram.module';
import { PerioChartModule } from './modules/perio-chart/perio-chart.module';
import { ClinicalNotesModule } from './modules/clinical-notes/clinical-notes.module';
import { TreatmentPlansModule } from './modules/treatment-plans/treatment-plans.module';
import { ProceduresModule } from './modules/procedures/procedures.module';
import { ConsentsModule } from './modules/consents/consents.module';

// Common Modules
import { CacheModule } from './common/cache/cache.module';
import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { ResilienceModule } from './common/resilience/resilience.module';

// Interceptors
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';

// Filters
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/dentalos_clinical',
        retryWrites: true,
        w: 'majority',
      }),
    }),

    // Event Emitter
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Common Modules
    CacheModule,
    DataLoaderModule,
    ResilienceModule,

    // Health Module
    HealthModule,

    // Auth Module
    AuthModule,

    // Feature Modules
    OdontogramModule,
    PerioChartModule,
    ClinicalNotesModule,
    TreatmentPlansModule,
    ProceduresModule,
    ConsentsModule,
  ],
  providers: [
    // Global JWT authentication
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware
   */
  configure(_consumer: MiddlewareConsumer): void {
    // TODO: Add correlation middleware once @dentalos/shared-tracing is available
  }
}
