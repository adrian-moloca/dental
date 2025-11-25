import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health Module for Clinical EHR Service
 *
 * Provides health check endpoints for monitoring and observability.
 * No external dependencies required - uses injected MongoDB connection.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
