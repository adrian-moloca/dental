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
    request.tenantContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
      userId: user.sub || user.userId,
    };

    return true;
  }
}
