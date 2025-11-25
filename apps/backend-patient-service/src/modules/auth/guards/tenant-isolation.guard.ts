/**
 * Tenant Isolation Guard
 *
 * Ensures all requests are scoped to the user's tenant.
 *
 * @module modules/auth/guards
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TenantIsolationError } from '@dentalos/shared-errors';
import type { CurrentUser } from '@dentalos/shared-auth';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new TenantIsolationError('User not authenticated', '' as any, '' as any);
    }

    if (!user.organizationId) {
      throw new TenantIsolationError('User missing organization context', user.tenantId, '' as any);
    }

    // Add tenant info to request for downstream use
    request.tenantId = user.organizationId;
    request.organizationId = user.organizationId;
    request.clinicId = user.clinicId;

    return true;
  }
}
