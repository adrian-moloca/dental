/**
 * Root Application Module for Backend Auth Service
 *
 * Configures all infrastructure modules, feature modules,
 * global providers, filters, and interceptors.
 *
 * @module app.module
 */

import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import Redis from 'ioredis';
import { loadConfiguration, AppConfig } from './configuration';
import { CorrelationMiddleware } from '@dentalos/shared-tracing';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { AuditModule } from './modules/audit/audit.module';
import { RBACModule } from './modules/rbac/rbac.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { DeviceModule } from './modules/device/device.module';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LicenseGuard } from './guards/license.guard';
import { TenantThrottlerGuard } from './guards/tenant-throttler.guard';
import { TenantContextService } from './context/tenant-context.service';
import { CacheModule } from './common/cache/cache.module';
import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { MetricsModule } from './metrics/metrics.module';
import { CsrfModule, CsrfGuard } from './modules/csrf';

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

    // JWT module for token generation and validation (RS256)
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwtConfig = configService.get('jwt', { infer: true });
        return {
          privateKey: jwtConfig.accessPrivateKey,
          publicKey: jwtConfig.accessPublicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: jwtConfig.accessExpiration as any,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
          verifyOptions: {
            algorithms: ['RS256'],
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
    CacheModule, // Redis caching
    DataLoaderModule, // N+1 query prevention
    MetricsModule, // Prometheus metrics

    // Feature modules
    HealthModule,
    UsersModule,
    AuthModule,
    DeviceModule,
    TenantsModule,
    SessionsModule,
    TokensModule,
    AuditModule, // HIPAA/GDPR compliance audit logging
    RBACModule, // Role-based access control
    MfaModule, // Multi-factor authentication
    PasswordResetModule, // Password reset flow
    EmailVerificationModule, // Email verification flow
    CsrfModule, // CSRF protection (double-submit cookie pattern)
  ],
  providers: [
    // Tenant context service for AsyncLocalStorage
    TenantContextService,

    // Reflector for metadata reading (required by guards)
    Reflector,

    // JWT strategy for Passport authentication
    JwtStrategy,

    // GUARD ORDER (execution order):
    // 1. JwtAuthGuard - Authenticates user, populates request.user
    // 2. CsrfGuard - Validates CSRF token on state-changing requests
    // 3. LicenseGuard - Validates module access based on @RequiresModule decorator
    // 4. TenantThrottlerGuard - Rate limiting per tenant

    // Global JWT authentication guard (runs first)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // SECURITY: Global CSRF guard (runs second, after authentication)
    // Validates CSRF token on POST/PUT/PATCH/DELETE requests
    // Skips public routes and safe methods (GET/HEAD/OPTIONS)
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },

    // Global license guard (runs third)
    // Validates module-level permissions
    {
      provide: APP_GUARD,
      useClass: LicenseGuard,
    },

    // Global rate limiting guard - per-tenant throttling (runs last)
    {
      provide: APP_GUARD,
      useClass: TenantThrottlerGuard,
    },

    // Global exception filter - catches all errors and formats responses
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
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
      serviceName: 'backend-auth',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      enableLogging: true,
      includeInResponse: true,
    });
    consumer
      .apply((req: Request, res: Response, next: NextFunction) =>
        correlationMiddleware.use(req, res, next)
      )
      .forRoutes('*');
  }
}
