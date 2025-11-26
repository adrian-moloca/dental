/**
 * CSRF Protection Guard
 *
 * NestJS guard that validates CSRF tokens on state-changing HTTP methods
 * (POST, PUT, PATCH, DELETE). Implements the double-submit cookie pattern.
 *
 * Security Architecture:
 * - Validates X-CSRF-Token header against csrf_token cookie
 * - Uses timing-safe comparison to prevent timing attacks
 * - Skips validation for safe methods (GET, HEAD, OPTIONS)
 * - Skips validation for routes marked with @SkipCsrf() decorator
 * - Skips validation for public routes (no session to bind to)
 * - Fails closed: any error results in denied access
 *
 * Execution Order:
 * 1. JwtAuthGuard - Authenticates user, populates request.user
 * 2. CsrfGuard - Validates CSRF token (this guard)
 * 3. LicenseGuard - Validates module access
 * 4. TenantThrottlerGuard - Rate limiting
 *
 * @security CRITICAL: This guard is a core security component
 * - Must execute AFTER JwtAuthGuard (needs user context)
 * - Must fail closed on any validation error
 * - Never skip for state-changing requests unless explicitly marked
 *
 * @see OWASP CSRF Prevention Cheat Sheet
 * @module modules/csrf
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { CsrfService } from './csrf.service';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import { SKIP_CSRF_KEY } from './skip-csrf.decorator';

/**
 * HTTP methods that are considered "safe" (read-only)
 * These methods should not cause state changes and don't require CSRF protection
 *
 * @see RFC 7231 Section 4.2.1 - Safe Methods
 */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * CSRF Protection Guard
 *
 * Validates CSRF tokens on state-changing requests using the
 * double-submit cookie pattern.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly csrfService: CsrfService
  ) {}

  /**
   * Determine if the request should be allowed to proceed
   *
   * Validation flow:
   * 1. Skip if CSRF protection is disabled in configuration
   * 2. Skip for safe HTTP methods (GET, HEAD, OPTIONS)
   * 3. Skip for public routes (@Public decorator)
   * 4. Skip for routes marked with @SkipCsrf decorator
   * 5. Extract CSRF token from cookie and header
   * 6. Validate tokens match using timing-safe comparison
   * 7. Optionally validate session binding
   *
   * @param context - Execution context
   * @returns true if request is allowed, throws ForbiddenException otherwise
   * @throws {ForbiddenException} If CSRF validation fails
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method.toUpperCase();

    // Check if CSRF protection is enabled globally
    if (!this.csrfService.isEnabled()) {
      this.logger.debug({
        message: 'CSRF check skipped: protection disabled',
        path: request.url,
      });
      return true;
    }

    // Skip validation for safe HTTP methods
    // These methods should not cause state changes
    if (SAFE_METHODS.includes(method)) {
      this.logger.debug({
        message: 'CSRF check skipped: safe method',
        method,
        path: request.url,
      });
      return true;
    }

    // Check if route is marked as public
    // Public routes don't have authenticated users, so no session binding
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug({
        message: 'CSRF check skipped: public route',
        path: request.url,
      });
      return true;
    }

    // Check if route is explicitly marked to skip CSRF
    // Use sparingly, only for routes that truly can't use CSRF tokens
    const skipCsrf = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCsrf) {
      this.logger.debug({
        message: 'CSRF check skipped: @SkipCsrf decorator',
        path: request.url,
        handler: context.getHandler().name,
      });
      return true;
    }

    // Extract CSRF tokens
    const cookieToken = this.extractCookieToken(request);
    const headerToken = this.extractHeaderToken(request);

    // Validate tokens
    const isValid = this.csrfService.validateToken(cookieToken, headerToken);

    if (!isValid) {
      this.logger.warn({
        message: 'CSRF validation failed',
        method,
        path: request.url,
        ip: request.ip,
        userAgent: request.get('user-agent'),
        hasCookieToken: !!cookieToken,
        hasHeaderToken: !!headerToken,
      });

      // SECURITY: Fail closed with generic error message
      // Don't reveal which validation check failed
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    this.logger.debug({
      message: 'CSRF validation passed',
      method,
      path: request.url,
    });

    return true;
  }

  /**
   * Extract CSRF token from cookie
   *
   * @param request - Express request object
   * @returns Cookie token or undefined
   */
  private extractCookieToken(request: Request): string | undefined {
    const cookieName = this.csrfService.getCookieName();

    // Check signed cookies first, then unsigned
    // SECURITY: Prefer signed cookies if available
    const signedToken = request.signedCookies?.[cookieName];
    if (signedToken) {
      return signedToken;
    }

    // Fall back to unsigned cookies
    const unsignedToken = request.cookies?.[cookieName];
    return unsignedToken;
  }

  /**
   * Extract CSRF token from header
   *
   * @param request - Express request object
   * @returns Header token or undefined
   */
  private extractHeaderToken(request: Request): string | undefined {
    const headerName = this.csrfService.getHeaderName();

    // Request.get() is case-insensitive
    return request.get(headerName);
  }
}
