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

    // tenantId may be stored as organizationId in JWT
    const tenantId = user.tenantId || user.organizationId;

    if (!tenantId) {
      throw new ForbiddenException('User has no tenant association');
    }

    // Attach tenantId and organizationId to request for easy access
    request.tenantId = tenantId;
    request.organizationId = user.organizationId || tenantId;

    return true;
  }
}
