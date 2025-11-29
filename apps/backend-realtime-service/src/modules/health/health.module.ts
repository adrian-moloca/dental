import { Module, Global } from '@nestjs/common';
import { HealthCheckService } from '@dentalos/shared-infra';
import { HealthController } from './health.controller';
import { RedisModule } from '../../redis/redis.module';
import { EventConsumerModule } from '../event-consumer/event-consumer.module';

/**
 * Health check module for monitoring service health.
 *
 * Includes health checks for:
 * - Redis: WebSocket adapter connection
 * - RabbitMQ: Domain event consumer connection
 * - WebSocket: Gateway availability
 */
@Global()
@Module({
  imports: [RedisModule, EventConsumerModule],
  providers: [HealthCheckService],
  controllers: [HealthController],
  exports: [HealthCheckService],
})
export class HealthModule {}
