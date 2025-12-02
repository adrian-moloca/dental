import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Extract tenant context from JWT payload
    // tenantId may be stored as organizationId in JWT
    // clinicId may be null for org-level admins - use 'default' as fallback
    const tenantId = user.tenantId || user.organizationId;
    const clinicId = user.clinicId || 'default';

    if (!tenantId) {
      return false;
    }

    request.tenantContext = {
      tenantId,
      organizationId: user.organizationId || tenantId,
      clinicId,
      userId: user.sub || user.userId,
    };

    return true;
  }
}
