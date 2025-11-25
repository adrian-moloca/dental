import { Module, Global } from '@nestjs/common';
import { HealthCheckService } from '@dentalos/shared-infra';
import { HealthController } from './health.controller';
import { RedisModule } from '../../redis/redis.module';

/**
 * Health check module for monitoring service health.
 */
@Global()
@Module({
  imports: [RedisModule],
  providers: [HealthCheckService],
  controllers: [HealthController],
  exports: [HealthCheckService],
})
export class HealthModule {}
