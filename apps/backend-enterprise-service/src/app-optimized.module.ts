import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration, { type AppConfig } from './config/configuration';
import { defaultPerformanceConfig } from './config/performance.config';

// Performance Modules
import { CacheModule } from './common/cache/cache.module';
import { DataLoaderModule } from './common/dataloader/dataloader.module';
import { ResilienceModule } from './common/resilience/resilience.module';

// Feature Modules
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Global Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, defaultPerformanceConfig],
      cache: true, // Cache configuration for faster access
    }),

    // MongoDB with Performance Optimizations
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig>) => {
        const perfConfig = defaultPerformanceConfig();

        return {
          uri: configService.get('mongodb.uri', { infer: true })!,

          // Connection Pool Configuration
          maxPoolSize: perfConfig.database.maxPoolSize,
          minPoolSize: perfConfig.database.minPoolSize,
          serverSelectionTimeoutMS: perfConfig.database.serverSelectionTimeoutMS,
          socketTimeoutMS: perfConfig.database.socketTimeoutMS,
          connectTimeoutMS: perfConfig.database.connectTimeoutMS,
          maxIdleTimeMS: perfConfig.database.maxIdleTimeMS,
          waitQueueTimeoutMS: perfConfig.database.waitQueueTimeoutMS,

          // Read/Write Preferences
          readPreference: perfConfig.database.readPreference,
          readConcern: { level: perfConfig.database.readConcern },
          writeConcern: perfConfig.database.writeConcern,

          // Performance Options
          autoIndex: perfConfig.database.autoCreateIndexes,
          autoCreate: true,

          // Compression
          compressors: ['zlib'],
          zlibCompressionLevel: 6,

          // Monitoring
          monitorCommands: perfConfig.monitoring.enabled,

          // Connection Events
          connectionFactory: (connection) => {
            // Log slow queries if enabled
            if (perfConfig.database.enableQueryLogging) {
              connection.on('commandStarted', (event: any) => {
                const startTime = Date.now();
                connection.once('commandSucceeded', () => {
                  const duration = Date.now() - startTime;
                  if (duration > perfConfig.database.slowQueryThresholdMs) {
                    console.warn({
                      message: 'Slow query detected',
                      command: event.commandName,
                      duration,
                      collection: event.command?.collection,
                    });
                  }
                });
              });
            }
            return connection;
          },
        };
      },
    }),

    // Event Emitter with Performance Settings
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20, // Increased for performance monitoring
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),

    // Performance Infrastructure Modules
    CacheModule, // Redis caching with TTL strategies
    DataLoaderModule, // Batch loading and N+1 prevention
    ResilienceModule, // Circuit breaker and graceful degradation

    // Feature Modules
    HealthModule,
    OrganizationsModule,
    ClinicsModule,
    AssignmentsModule,
    RbacModule,
  ],
})
export class AppModule {}
