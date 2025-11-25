/**
 * Main Application Module
 *
 * Imports all feature modules and configures global providers.
 *
 * @module app
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';
import { loadConfiguration, type AppConfig } from './config/configuration';
import { HttpClientModule } from './common/http/http.module';
import { PatientAuthGuard } from './common/guards/patient-auth.guard';
import { ClinicalDataAdapter } from './common/adapters/clinical-data.adapter';
import { BillingDataAdapter } from './common/adapters/billing-data.adapter';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { ImagingModule } from './modules/imaging/imaging.module';
import { BillingModule } from './modules/billing/billing.module';
import { EngagementModule } from './modules/engagement/engagement.module';
import { GdprModule } from './modules/gdpr/gdpr.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
      cache: true,
    }),

    // Cache (Redis)
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService<AppConfig, true>) => {
        const redisConfig = configService.get('redis', { infer: true });
        return {
          store: await redisStore({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            ttl: 300, // 5 minutes default
          }),
        };
      },
      inject: [ConfigService],
    }),

    // Rate Limiting (Redis-backed)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const redisConfig = configService.get('redis', { infer: true });
        const rateLimitConfig = configService.get('rateLimit', { infer: true });

        return {
          throttlers: [
            {
              ttl: rateLimitConfig.ttl,
              limit: rateLimitConfig.maxRequests,
            },
          ],
          storage: new ThrottlerStorageRedisService(
            new Redis({
              host: redisConfig.host,
              port: redisConfig.port,
              password: redisConfig.password,
              db: redisConfig.db,
            }),
          ),
        };
      },
      inject: [ConfigService],
    }),

    // HTTP Clients
    HttpClientModule,

    // Feature Modules
    AuthModule,
    ProfileModule,
    AppointmentsModule,
    ClinicalModule,
    ImagingModule,
    BillingModule,
    EngagementModule,
    GdprModule,
    HealthModule,
  ],
  providers: [
    // Global Guards
    {
      provide: APP_GUARD,
      useClass: PatientAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Adapters
    ClinicalDataAdapter,
    BillingDataAdapter,
  ],
})
export class AppModule {}
