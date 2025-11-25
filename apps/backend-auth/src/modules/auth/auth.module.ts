/**
 * Authentication Module
 *
 * Provides authentication endpoints and services.
 * Handles user registration, login, and token management.
 *
 * Dependencies:
 * - UsersModule: Provides UserRepository and PasswordService
 * - JwtModule: Provides JWT token generation and validation
 * - ConfigModule: Provides configuration for JWT secrets and options
 *
 * Exports:
 * - AuthService: For use in other modules (e.g., password reset, email verification)
 *
 * Routes:
 * - POST /auth/register: Register new user
 * - POST /auth/login: Login existing user
 * - GET /auth/me: Get current user
 *
 * @module modules/auth
 */

import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './services/auth.service';
import { AuthenticationService } from './services/authentication.service';
import { CabinetSelectionService } from './services/cabinet-selection.service';
import { TokenGenerationService } from './services/token-generation.service';
import { SessionManagementService } from './services/session-management.service';
import { SubscriptionIntegrationService } from './services/subscription-integration.service';
import { UserManagementService } from './services/user-management.service';
import { SubscriptionClientService } from './services/subscription-client.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { CabinetController } from './controllers/cabinet.controller';
import { SessionController } from './controllers/session.controller';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import type { AppConfig } from '../../configuration';

/**
 * Authentication module
 *
 * Orchestrates authentication services and controllers.
 * Configures JWT module with secrets from environment.
 */
@Module({
  imports: [
    // Users module provides UserRepository and PasswordService
    // Use forwardRef to handle circular dependency with UsersModule
    forwardRef(() => UsersModule),

    // Sessions module provides SessionService for session management
    SessionsModule,

    // HTTP module for calling subscription service
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),

    // JWT module for token generation and validation
    // Configured with access token secrets and options
    // Refresh token uses separate secret (configured in AuthService)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwtConfig = configService.get('jwt', { infer: true });

        return {
          // Access token secret (used for API authentication)
          secret: jwtConfig.accessSecret,

          // Default sign options for access tokens
          signOptions: {
            expiresIn: jwtConfig.accessExpiration as any, // Default: 15m
            issuer: jwtConfig.issuer, // Default: dentalos-auth
            audience: jwtConfig.audience, // Default: dentalos-api
          },
        };
      },
    }),
  ],

  // Controllers handle HTTP requests
  // Refactored into focused controllers by domain:
  // - AuthenticationController: Core auth flows (register, login, refresh, logout, me)
  // - CabinetController: Cabinet selection and switching
  // - SessionController: Session management (list, revoke)
  // Note: MfaController is in MfaModule, not here
  controllers: [AuthenticationController, CabinetController, SessionController],

  // Services contain business logic
  // AuthService is the facade that orchestrates specialized services
  providers: [
    // Facade service (main entry point for controllers and external modules)
    AuthService,

    // Specialized services (single responsibility principle)
    AuthenticationService, // Core auth: register, login, credential validation
    CabinetSelectionService, // Cabinet operations: list, select, switch
    TokenGenerationService, // JWT token creation and refresh
    SessionManagementService, // Session lifecycle: create, rotate, invalidate
    SubscriptionIntegrationService, // Subscription service integration
    UserManagementService, // User data: get, update profile

    // External integration
    SubscriptionClientService, // HTTP client for subscription service
  ],

  // Export AuthService and SubscriptionClientService for use in other modules
  // AuthService: password reset, email verification, admin user management
  // SubscriptionClientService: used by CabinetAssignmentService
  exports: [AuthService, SubscriptionClientService],
})
export class AuthModule {}
