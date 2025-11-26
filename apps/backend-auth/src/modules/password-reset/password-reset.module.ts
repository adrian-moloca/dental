/**
 * Password Reset Module
 *
 * Provides secure password reset functionality with token-based flow.
 *
 * Features:
 * - Forgot password: email-based reset request
 * - Reset password: token-based password update
 * - Secure token generation and validation
 * - Multi-tenant isolation
 * - Rate limiting to prevent abuse
 *
 * Dependencies:
 * - UsersModule: Password hashing and user management
 * - SessionsModule: Session invalidation after password reset
 * - TypeORM: Database access for tokens and users
 *
 * @module modules/password-reset
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { PasswordHistory } from './entities/password-history.entity';
import { User } from '../users/entities/user.entity';
import { PasswordResetService } from './password-reset.service';
import { PasswordHistoryService } from './services/password-history.service';
import { PasswordHistoryRepository } from './repositories/password-history.repository';
import { PasswordResetController } from './password-reset.controller';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';

/**
 * Password Reset Module
 *
 * Encapsulates password reset functionality with secure token management.
 */
@Module({
  imports: [
    // Register entities with TypeORM
    TypeOrmModule.forFeature([PasswordResetToken, PasswordHistory, User]),

    // Import UsersModule for PasswordService
    UsersModule,

    // Import SessionsModule for session invalidation
    SessionsModule,
  ],

  controllers: [PasswordResetController],

  providers: [
    PasswordResetService,
    PasswordHistoryService,
    PasswordHistoryRepository,
  ],

  // Export services for potential use in other modules (e.g., admin panel, auth module)
  exports: [PasswordResetService, PasswordHistoryService],
})
export class PasswordResetModule {}
