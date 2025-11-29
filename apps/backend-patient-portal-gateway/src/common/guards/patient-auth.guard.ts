/**
 * Patient Authentication Guard
 *
 * Validates JWT token and ensures it belongs to a patient.
 * Enforces patient-level security and prevents cross-patient access.
 *
 * @module common/guards/patient-auth-guard
 */

import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Patient authentication guard
 *
 * Validates JWT and ensures the authenticated user is a patient.
 */
@Injectable()
export class PatientAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(PatientAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  /**
   * Determine if authentication is required for this route
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
      return true;
    }

    // Run default JWT validation
    return super.canActivate(context);
  }

  /**
   * Handle authentication result
   *
   * Validates that the authenticated user is a patient.
   */
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext): TUser {
    // Log authentication failures
    if (err || !user) {
      const request = context?.switchToHttp().getRequest();
      const path = request?.url;

      // Handle specific JWT errors
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

    // Validate that user is a patient (has patientId in payload)
    if (!user.patientId) {
      this.logger.warn({
        message: 'User is not a patient',
        userId: user.userId,
        email: user.email,
      });
      throw new UnauthorizedException('Access denied. Patient credentials required.');
    }

    // Authentication successful
    this.logger.debug({
      message: 'Patient authentication successful',
      patientId: user.patientId,
      email: user.email,
    });

    return user;
  }
}
