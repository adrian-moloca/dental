/**
 * Health Module
 *
 * Provides health check endpoints for Kubernetes/orchestration readiness
 * and liveness probes.
 *
 * @module modules/health
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Health check module
 *
 * Exposes health check endpoints for monitoring and orchestration.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
