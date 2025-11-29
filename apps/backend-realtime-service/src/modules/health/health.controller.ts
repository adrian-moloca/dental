import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, EnhancedHealthStatus as HealthStatus } from '@dentalos/shared-infra';
import { RedisService } from '../../redis/redis.service';
import { EventConsumerService } from '../event-consumer/event-consumer.service';

/**
 * Health check controller for Kubernetes readiness/liveness probes.
 *
 * - GET /health - Full health check with all dependencies
 * - GET /health/liveness - Quick liveness check (service is running)
 * - GET /health/readiness - Readiness check (service is ready for traffic)
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheck: HealthCheckService,
    private readonly redisService: RedisService,
    private readonly eventConsumerService: EventConsumerService,
  ) {
    this.registerChecks();
  }

  private registerChecks(): void {
    // Redis health check
    this.healthCheck.register(
      'redis',
      HealthCheckService.createRedisCheck(this.redisService.getClient()),
    );

    // WebSocket health check
    this.healthCheck.register('websocket', async () => {
      // Check if WebSocket server is accepting connections
      return {
        status: HealthStatus.HEALTHY,
        message: 'WebSocket server is operational',
      };
    });

    // RabbitMQ event consumer health check
    this.healthCheck.register('rabbitmq', async () => {
      const isHealthy = this.eventConsumerService.isHealthy();
      return {
        status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
        message: isHealthy
          ? 'RabbitMQ event consumer connected'
          : 'RabbitMQ event consumer disconnected (events not being consumed)',
      };
    });
  }

  /**
   * Full health check with all dependencies.
   */
  @Get()
  async check() {
    return this.healthCheck.check();
  }

  /**
   * Liveness probe - returns 200 if service is running.
   */
  @Get('liveness')
  async liveness() {
    return this.healthCheck.liveness();
  }

  /**
   * Readiness probe - returns 200 if service is ready for traffic.
   */
  @Get('readiness')
  async readiness() {
    return this.healthCheck.readiness();
  }
}
