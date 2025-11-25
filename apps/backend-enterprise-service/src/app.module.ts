import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration, { type AppConfig } from './config/configuration';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
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
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    MetricsModule,
    HealthModule,
    OrganizationsModule,
    ClinicsModule,
    AssignmentsModule,
    RbacModule,
  ],
})
export class AppModule {}
