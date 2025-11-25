/**
 * JWT Authentication Guard
 *
 * Global guard that enforces JWT authentication on all routes
 * unless explicitly marked with @Public() decorator.
 *
 * @security
 * - Applied globally to all routes by default
 * - Respects @Public() decorator to exclude specific routes
 * - Provides detailed error messages for different JWT failure scenarios
 * - Fails closed (denies by default)
 *
 * @module guards/jwt-auth-guard
 */

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * JWT authentication guard
 *
 * Extends Passport's AuthGuard to add support for @Public() decorator
 * and enhanced error handling.
 *
 * @remarks
 * When applied globally via APP_GUARD, this guard runs before all route handlers.
 * Routes marked with @Public() are automatically excluded.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determine if authentication is required for this route
   *
   * @param context - Execution context
   * @returns true if authentication should proceed, false to skip
   */
  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug({
        message: 'Skipping JWT validation for public route',
        handler: context.getHandler().name,
        class: context.getClass().name,
      });
      return true; // Skip JWT validation for public routes
    }

    // Run default JWT validation via Passport
    return super.canActivate(context);
  }

  /**
   * Handle authentication result
   *
   * @param err - Error from strategy (if any)
   * @param user - User returned from strategy (if successful)
   * @param info - Additional info (e.g., JWT error details)
   * @returns Authenticated user
   * @throws {UnauthorizedException} With specific error message
   */
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext): TUser {
    // Log authentication failures for security monitoring
    if (err || !user) {
      const request = context?.switchToHttp().getRequest();
      const path = request?.url;

      // Handle specific JWT errors with appropriate messages
      if (info?.name === 'TokenExpiredError') {
        this.logger.warn({
          message: 'JWT token expired',
          path,
          expiredAt: info.expiredAt,
        });
        throw new UnauthorizedException('Token expired. Please login again.');
      }

      if (info?.name === 'JsonWebTokenError') {
        this.logger.warn({
          message: 'Invalid JWT token',
          path,
          error: info.message,
        });
        throw new UnauthorizedException('Invalid token. Authentication failed.');
      }

      if (info?.name === 'NotBeforeError') {
        this.logger.warn({
          message: 'JWT token not yet valid',
          path,
          date: info.date,
        });
        throw new UnauthorizedException('Token not yet valid.');
      }

      if (info?.message === 'No auth token') {
        this.logger.warn({
          message: 'Missing authorization header',
          path,
        });
        throw new UnauthorizedException('Authentication required. No token provided.');
      }

      // Generic authentication failure
      this.logger.warn({
        message: 'Authentication failed',
        path,
        error: err?.message || info?.message,
      });

      throw err || new UnauthorizedException('Authentication required.');
    }

    // Authentication successful
    this.logger.debug({
      message: 'JWT authentication successful',
      userId: user.userId,
      email: user.email,
    });

    return user;
  }
}
