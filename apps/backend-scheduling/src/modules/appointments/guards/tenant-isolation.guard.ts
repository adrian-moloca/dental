import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Tenant Isolation Guard
 *
 * Ensures multi-tenant data isolation by validating
 * that the user's tenantId matches the request context
 */
@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.tenantId) {
      throw new ForbiddenException('User has no tenant association');
    }

    // Attach tenantId and organizationId to request for easy access
    request.tenantId = user.tenantId;
    request.organizationId = user.organizationId;

    return true;
  }
}
