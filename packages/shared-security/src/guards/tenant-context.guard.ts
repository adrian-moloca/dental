import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

export interface TenantContext {
  tenantId: string;
  organizationId?: string;
  clinicId?: string;
  userId?: string;
  correlationId?: string;
}

export const TENANT_CONTEXT_KEY = 'tenantContext';

@Injectable()
export class TenantContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const tenantId = this.extractTenantId(request);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    const tenantContext: TenantContext = {
      tenantId,
      organizationId: this.extractOrganizationId(request),
      clinicId: this.extractClinicId(request),
      userId: this.extractUserId(request),
      correlationId: this.extractCorrelationId(request),
    };

    request[TENANT_CONTEXT_KEY] = tenantContext;

    return true;
  }

  private extractTenantId(request: any): string | undefined {
    return (
      request.headers['x-tenant-id'] ||
      request.query.tenantId ||
      request.user?.tenantId ||
      request.body?.tenantId
    );
  }

  private extractOrganizationId(request: any): string | undefined {
    return (
      request.headers['x-organization-id'] ||
      request.query.organizationId ||
      request.user?.organizationId ||
      request.body?.organizationId
    );
  }

  private extractClinicId(request: any): string | undefined {
    return (
      request.headers['x-clinic-id'] ||
      request.query.clinicId ||
      request.user?.clinicId ||
      request.body?.clinicId
    );
  }

  private extractUserId(request: any): string | undefined {
    return request.user?.userId || request.user?.sub || request.user?.id;
  }

  private extractCorrelationId(request: any): string | undefined {
    return (
      request.headers['x-correlation-id'] ||
      request.headers['x-request-id'] ||
      `req-${Date.now()}-${Math.random().toString(36).substring(7)}`
    );
  }
}

export function getTenantContext(request: any): TenantContext | undefined {
  return request[TENANT_CONTEXT_KEY];
}
