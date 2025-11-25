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

    // Validate tenant context exists
    if (!user.tenantId || !user.organizationId) {
      throw new ForbiddenException('Invalid tenant context');
    }

    // Extract patientId from params if present
    const patientId = request.params.patientId;

    // Store tenant context in request for easy access
    request.tenantContext = {
      tenantId: user.tenantId,
      organizationId: user.organizationId,
      clinicId: user.clinicId,
    };

    // Add patient validation metadata
    if (patientId) {
      request.patientId = patientId;
    }

    return true;
  }
}
