import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '@nestjs-modules/ioredis';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CorrelationMiddleware } from '@dentalos/shared-tracing';

import databaseConfig from './modules/config/database.config';
import billingConfig from './modules/config/billing.config';
import redisConfig from './modules/config/redis.config';
import eFacturaConfig from './modules/e-factura/config/e-factura.config';

import { AuthModule } from './modules/auth/auth.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { InvoiceItemsModule } from './modules/invoice-items/invoice-items.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { PatientBalancesModule } from './modules/patient-balances/patient-balances.module';
import { ClinicalIntegrationModule } from './modules/clinical-integration/clinical-integration.module';
import { EFacturaModule } from './modules/e-factura/e-factura.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { HealthModule } from './health/health.module';

// Standard DentalOS components
import { CacheModule } from './common/cache/cache.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, billingConfig, redisConfig, eFacturaConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.dbName'),
      }),
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    ScheduleModule.forRoot(),
    // Redis module for E-Factura OAuth token storage
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://:${configService.get<string>('redis.password')}@${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}/${configService.get<number>('redis.db')}`,
      }),
    }),
    // Global cache module
    CacheModule,
    // Health module
    HealthModule,
    // Feature modules
    AuthModule,
    InvoicesModule,
    InvoiceItemsModule,
    PaymentsModule,
    LedgerModule,
    PatientBalancesModule,
    ClinicalIntegrationModule,
    EFacturaModule,
    StripeModule,
  ],
  providers: [
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
   * Configure middleware for request context and correlation ID propagation
   */
  configure(consumer: MiddlewareConsumer): void {
    // Request context middleware (adds context to all requests)
    consumer.apply(RequestContextMiddleware).forRoutes('*');

    // Correlation middleware (distributed tracing)
    const correlationMiddleware = new CorrelationMiddleware({
      serviceName: 'backend-billing-service',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      enableLogging: true,
      includeInResponse: true,
    });
    consumer
      .apply((req: Request, res: Response, next: NextFunction) =>
        correlationMiddleware.use(req, res, next),
      )
      .forRoutes('*');
  }
}
