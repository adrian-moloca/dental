import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  serverConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  corsConfig,
  rabbitmqConfig,
} from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { PresenceModule } from './modules/presence/presence.module';
import { CrdtModule } from './modules/crdt/crdt.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { HealthModule } from './modules/health/health.module';
import { EventConsumerModule } from './modules/event-consumer/event-consumer.module';

/**
 * Application Root Module
 *
 * The Real-Time Service provides WebSocket connectivity and event-driven updates
 * for the Dental OS platform. It bridges domain events from backend services
 * to connected frontend clients.
 *
 * Key Features:
 * - WebSocket gateway with Socket.IO and Redis adapter for horizontal scaling
 * - RabbitMQ event consumer for domain event subscription
 * - Presence tracking for online/away/busy status
 * - CRDT-based collaborative editing support
 * - Prometheus metrics for observability
 *
 * Event Flow:
 * 1. Backend services publish domain events to RabbitMQ
 * 2. EventConsumerModule subscribes to relevant event patterns
 * 3. Events are routed to WebSocket channels based on tenant context
 * 4. Connected clients receive real-time updates
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig, databaseConfig, redisConfig, jwtConfig, corsConfig, rabbitmqConfig],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    CrdtModule,
    PresenceModule,
    RealtimeModule,
    EventConsumerModule,
    MetricsModule,
    HealthModule,
  ],
})
export class AppModule {}
