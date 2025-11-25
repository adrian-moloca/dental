/**
 * MfaModule - Multi-Factor Authentication module
 *
 * Responsibilities:
 * - Configure MFA dependencies and providers
 * - Register MFA controllers and services
 * - Export MFA service for use in other modules
 * - Configure TypeORM entities for PostgreSQL
 * - Configure Redis for challenge storage
 *
 * Architecture:
 * - Entities: MfaFactor, MfaChallenge (Redis), BackupCode
 * - Repositories: Type-safe data access layer
 * - Services: Business logic and orchestration
 * - Controllers: HTTP API endpoints
 * - Guards: MFA verification enforcement
 *
 * @module MfaModule
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MfaController } from './controllers/mfa.controller';
import {
  MfaService,
  TOTPService,
  SMSMfaService,
  EmailMfaService,
  BackupCodeService,
} from './services';
import { MfaFactorRepository, MfaChallengeRepository, BackupCodeRepository } from './repositories';
import { MfaFactor, BackupCode } from './entities';
import { RequireMfaGuard } from './guards';
import { TwilioAdapter, SendGridAdapter } from './adapters';
import { RedisService } from '../../config/redis.config';

@Module({
  imports: [TypeOrmModule.forFeature([MfaFactor, BackupCode])],
  controllers: [MfaController],
  providers: [
    RedisService,
    TwilioAdapter,
    SendGridAdapter,
    MfaService,
    TOTPService,
    SMSMfaService,
    EmailMfaService,
    BackupCodeService,
    MfaFactorRepository,
    MfaChallengeRepository,
    BackupCodeRepository,
    RequireMfaGuard,
  ],
  exports: [MfaService, RequireMfaGuard],
})
export class MfaModule {}
