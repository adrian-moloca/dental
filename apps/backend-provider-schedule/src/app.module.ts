import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration, { type AppConfig } from './config/configuration';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

/**
 * Application Root Module
 *
 * Configures core infrastructure and feature modules for the
 * Provider Schedule microservice following DentalOS Microservices Standard.
 *
 * ARCHITECTURE:
 * - Configuration: Zod-validated environment variables
 * - Database: MongoDB with connection pooling and monitoring
 * - Events: Event-driven architecture for state changes
 * - Health: Liveness and readiness probes for Kubernetes
 * - Metrics: Prometheus metrics for observability
 *
 * MODULES:
 * - SchedulesModule: Provider schedule and availability management
 */
@Module({
  imports: [
    // Configuration with Zod validation
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // MongoDB with production-ready configuration
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        uri: configService.get('mongodb.uri', { infer: true })!,
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
      }),
    }),

    // Event Emitter for domain events
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Infrastructure Modules
    MetricsModule,
    HealthModule,

    // Feature Modules
    SchedulesModule,
  ],
})
export class AppModule {}
