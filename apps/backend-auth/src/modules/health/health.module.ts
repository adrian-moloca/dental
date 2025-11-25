/**
 * Health Module
 *
 * Provides health check endpoints for Kubernetes/orchestration readiness
 * and liveness probes.
 *
 * @module modules/health
 */

import { Module, forwardRef } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Health check module
 *
 * Exposes health check endpoints for monitoring and orchestration.
 */
@Module({
  imports: [TerminusModule, forwardRef(() => AuthModule)],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
