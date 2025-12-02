/**
 * Tenant Isolation Guard
 * Ensures multi-tenant data isolation by validating tenant context
 */

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CurrentUser } from '@dentalos/shared-auth';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: CurrentUser = request.user;

    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // tenantId may be stored as organizationId in JWT
    const tenantId = user.tenantId || user.organizationId;
    const organizationId = user.organizationId || user.tenantId;

    // Validate tenant context exists
    if (!tenantId) {
      throw new ForbiddenException('Invalid tenant context');
    }

    // Extract patientId from params if present
    const patientId = request.params.patientId;

    // Store tenant context in request for easy access
    // clinicId may be null for org-level admins - use 'default' as fallback
    request.tenantContext = {
      tenantId,
      organizationId,
      clinicId: user.clinicId || 'default',
    };

    // Add patient validation metadata
    if (patientId) {
      request.patientId = patientId;
    }

    return true;
  }
}
