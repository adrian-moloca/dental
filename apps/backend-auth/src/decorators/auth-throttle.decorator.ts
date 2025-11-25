/**
 * Authentication Throttle Decorators
 *
 * Provides specialized rate limiting decorators for authentication endpoints.
 * These decorators apply stricter rate limits to prevent:
 * - Credential stuffing attacks
 * - Account enumeration via timing
 * - Abuse of password reset flow
 *
 * @module decorators/auth-throttle
 */

import { Throttle } from '@nestjs/throttler';

/**
 * Apply stricter rate limiting to authentication endpoints
 *
 * Limits:
 * - 10 requests per minute per tenant (login/register)
 * - Prevents credential stuffing attacks
 * - Prevents account enumeration via timing
 *
 * Usage:
 * ```typescript
 * @AuthThrottle()
 * @Post('login')
 * async login(@Body() dto: LoginDto) {
 *   // ...
 * }
 * ```
 */
export const AuthThrottle = () =>
  Throttle({
    default: {
      ttl: 60000, // 1 minute
      limit: 10, // 10 requests per minute
    },
  });

/**
 * Apply very strict rate limiting to password reset
 *
 * Limits:
 * - 3 requests per 5 minutes per tenant
 * - Prevents abuse of password reset flow
 * - Prevents email enumeration attacks
 *
 * Usage:
 * ```typescript
 * @PasswordResetThrottle()
 * @Post('password-reset')
 * async requestPasswordReset(@Body() dto: PasswordResetDto) {
 *   // ...
 * }
 * ```
 */
export const PasswordResetThrottle = () =>
  Throttle({
    default: {
      ttl: 300000, // 5 minutes
      limit: 3, // 3 requests per 5 minutes
    },
  });
