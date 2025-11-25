/**
 * Sessions Module
 *
 * Manages user sessions, token refresh, and session invalidation.
 *
 * Features:
 * - Session creation on login with device tracking
 * - Session validation for refresh tokens
 * - Token refresh with rotation (anti-replay protection)
 * - Session invalidation on logout
 * - Concurrent session limits (max 5 per user)
 * - Automatic session cleanup via Redis TTL
 * - Device fingerprinting for security
 *
 * Components:
 * - Session entity: Redis-backed session value object
 * - SessionRepository: Redis data access layer
 * - SessionService: Business logic for session management
 *
 * @module modules/sessions
 */

import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionService } from './services/session.service';
import { SessionRepository } from './repositories/session.repository';
import { RedisClient } from '@dentalos/shared-infra';
import { UsersModule } from '../users/users.module';
import type { AppConfig } from '../../configuration';

/**
 * Sessions module
 *
 * Provides Redis-backed session management with multi-tenant isolation.
 * All sessions are scoped to organizationId for data isolation.
 */
@Module({
  imports: [
    // Configuration module for Redis settings
    ConfigModule,
    // Users module for PasswordService (Argon2id token hashing)
    // Use forwardRef to handle circular dependency
    forwardRef(() => UsersModule),
  ],
  controllers: [],
  providers: [
    // Redis client provider
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const redisConfig = configService.get('redis', { infer: true });

        // Create RedisClient wrapper instance
        const client = new RedisClient({
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password,
          db: redisConfig.db,
          keyPrefix: redisConfig.keyPrefix,
          maxRetriesPerRequest: 3,
          connectTimeout: 5000,
          enableReadyCheck: true,
          lazyConnect: false,
          maxLoadingRetryTime: 5000,
        });

        return client;
      },
      inject: [ConfigService],
    },
    // Session repository for Redis operations
    SessionRepository,
    // Session service for business logic
    SessionService,
  ],
  exports: [
    // Export SessionService for use in AuthModule
    SessionService,
    // Export SessionRepository for advanced use cases
    SessionRepository,
  ],
})
export class SessionsModule {}
