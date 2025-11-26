/**
 * CSRF Protection Module
 *
 * Provides CSRF (Cross-Site Request Forgery) protection for the application
 * using the double-submit cookie pattern.
 *
 * Architecture:
 * - CsrfService: Token generation and validation logic
 * - CsrfGuard: Request-level CSRF validation
 * - SkipCsrf decorator: Opt-out for specific routes
 *
 * The module exports CsrfService and CsrfGuard for use in other modules
 * and for global guard registration in AppModule.
 *
 * Integration:
 * 1. Import CsrfModule in AppModule
 * 2. Register CsrfGuard as global guard (after JwtAuthGuard)
 * 3. Generate CSRF token on login and include in response
 * 4. Set CSRF token cookie in login response
 * 5. Frontend sends token in X-CSRF-Token header
 *
 * @module modules/csrf
 */

import { Module, Global } from '@nestjs/common';
import { CsrfService } from './csrf.service';
import { CsrfGuard } from './csrf.guard';
import { CacheModule } from '../../common/cache/cache.module';

/**
 * CSRF Protection Module
 *
 * Global module that provides CSRF protection services throughout
 * the application.
 */
@Global()
@Module({
  imports: [
    // CacheModule provides Redis-based caching for token storage
    CacheModule,
  ],
  providers: [
    // CSRF token generation and validation service
    CsrfService,

    // CSRF validation guard
    CsrfGuard,
  ],
  exports: [
    // Export CsrfService for use in auth service (token generation on login)
    CsrfService,

    // Export CsrfGuard for global registration in AppModule
    CsrfGuard,
  ],
})
export class CsrfModule {}
