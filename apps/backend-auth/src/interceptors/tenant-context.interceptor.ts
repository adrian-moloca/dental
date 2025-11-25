/**
 * Tenant Context Interceptor
 *
 * Extracts tenant context from authenticated user and propagates it
 * through AsyncLocalStorage for the entire request lifecycle.
 * Enforces multi-tenant isolation.
 *
 * Edge cases handled:
 * - Missing user context on protected routes
 * - Public routes (marked with @Public decorator)
 * - Invalid or missing tenant context in user
 *
 * @module interceptors/tenant-context
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { CurrentUser, createTenantContext } from '@dentalos/shared-auth';
import { TenantContextService } from '../context/tenant-context.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Extended Express Request with CurrentUser
 */
export interface RequestWithUser extends Request {
  user?: CurrentUser;
  tenantContext?: {
    organizationId: string;
    clinicId?: string;
  };
}

/**
 * Tenant context interceptor
 *
 * Extracts tenant context from authenticated user (populated by JWT guard)
 * and propagates it via AsyncLocalStorage for request-scoped access.
 */
@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantContextInterceptor.name);

  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly reflector: Reflector
  ) {}

  /**
   * Intercept HTTP requests and propagate tenant context
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable
   */
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    // Only process HTTP requests
    if (context.getType() !== 'http') {
      return next.handle();
    }

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Public routes don't require tenant context
    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Extract user from request (populated by JWT guard)
    const user: CurrentUser | undefined = request.user;

    if (!user) {
      this.logger.error({
        message: 'User context missing - JWT guard may not be running',
        path: request.url,
        headers: request.headers,
      });
      throw new UnauthorizedException('Authentication required. User context not found.');
    }

    // Validate tenant context exists in user
    if (!user.tenantContext || !user.tenantContext.organizationId) {
      this.logger.error({
        message: 'User missing tenant context',
        userId: user.userId,
        path: request.url,
      });
      throw new UnauthorizedException('Invalid authentication token. Tenant context missing.');
    }

    // Create tenant context from user
    const tenantContext = createTenantContext(
      user.tenantContext.organizationId,
      user.tenantContext.clinicId
    );

    this.logger.debug({
      message: 'Tenant context extracted from user',
      organizationId: tenantContext.organizationId,
      clinicId: tenantContext.clinicId,
      userId: user.userId,
    });

    // Run request handler with tenant context in AsyncLocalStorage
    return new Observable((subscriber) => {
      this.tenantContextService
        .runWithContext(tenantContext, async () => {
          return next.handle().toPromise();
        })
        .then((result) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}
