/**
 * Root Application Module for Backend Subscription Service
 *
 * Configures all infrastructure modules, feature modules,
 * global providers, filters, and interceptors.
 *
 * @module app.module
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import type { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { CorrelationMiddleware } from '@dentalos/shared-tracing';
import { loadConfiguration, AppConfig } from './configuration';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TenantContextInterceptor } from './interceptors/tenant-context.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CompressionInterceptor } from './common/interceptors/compression.interceptor';
import { ETagInterceptor } from './common/interceptors/etag.interceptor';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantThrottlerGuard } from './guards/tenant-throttler.guard';
import { TenantContextService } from './context/tenant-context.service';
import { CacheModule } from './common/cache/cache.module';
import { MetricsModule } from './metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';
import { CabinetsModule } from './modules/cabinets/cabinets.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ModulesModule } from './modules/modules/modules.module';

/**
 * Root application module
 *
 * Orchestrates all infrastructure and feature modules.
 * Applies global filters, interceptors, and middleware.
 */
@Module({
  imports: [
    // Configuration module - loads and validates environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
      cache: true,
      expandVariables: true,
    }),

    // Event emitter for domain events
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // TypeORM database connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const dbConfig = configService.get('database', { infer: true });
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl,
          logging: dbConfig.logging,
          synchronize: dbConfig.synchronize,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          extra: {
            max: dbConfig.maxConnections,
          },
        };
      },
    }),

    // Passport authentication module
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT module for token validation
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwtConfig = configService.get('jwt', { infer: true });
        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
        };
      },
    }),

    // Throttler module for rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const redisConfig = configService.get('redis', { infer: true });
        const rateLimitConfig = configService.get('rateLimit', { infer: true });

        // Create Redis client for rate limiting storage
        const redis = new Redis({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db || 0,
          keyPrefix: `${redisConfig.keyPrefix}throttle:`,
        });

        return {
          throttlers: [
            {
              ttl: rateLimitConfig.ttl,
              limit: rateLimitConfig.maxRequests,
            },
          ],
          storage: new ThrottlerStorageRedisService(redis),
        };
      },
    }),

    // Infrastructure modules
    CacheModule,
    MetricsModule,

    // Feature modules
    HealthModule,
    ModulesModule,
    CabinetsModule,
    SubscriptionsModule,
    // PlansModule,         // TODO: Add when implemented
    // InvoicesModule,      // TODO: Add when implemented
    // PaymentsModule,      // TODO: Add when implemented
  ],
  providers: [
    // Tenant context service for AsyncLocalStorage
    TenantContextService,

    // JWT strategy for Passport authentication
    JwtStrategy,

    // Global JWT authentication guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // Global rate limiting guard - per-tenant throttling
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },

    // Global exception filter - catches all errors and formats responses
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },

    // Global logging interceptor - logs all requests and responses
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },

    // Global tenant context interceptor - extracts and validates tenant context
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantContextInterceptor,
    },

    // Global transform interceptor - standardizes response format
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Global compression interceptor - compresses large responses
    {
      provide: APP_INTERCEPTOR,
      useClass: CompressionInterceptor,
    },

    // Global ETag interceptor - implements conditional requests
    {
      provide: APP_INTERCEPTOR,
      useClass: ETagInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware
   *
   * Applies correlation ID middleware to all routes using shared-tracing package.
   */
  configure(consumer: MiddlewareConsumer): void {
    const correlationMiddleware = new CorrelationMiddleware({
      serviceName: 'backend-subscription-service',
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
