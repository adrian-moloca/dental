import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

/**
 * Health Module
 *
 * Provides health check endpoints for:
 * - Liveness probe (GET /health/liveness)
 * - Readiness probe (GET /health/readiness)
 *
 * This module is imported in AppModule and requires no additional dependencies
 * as it uses the global MongoDB connection from MongooseModule.
 *
 * @Module
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
