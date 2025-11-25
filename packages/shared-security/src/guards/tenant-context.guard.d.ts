import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface TenantContext {
    tenantId: string;
    organizationId?: string;
    clinicId?: string;
    userId?: string;
    correlationId?: string;
}
export declare const TENANT_CONTEXT_KEY = "tenantContext";
export declare class TenantContextGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
    private extractTenantId;
    private extractOrganizationId;
    private extractClinicId;
    private extractUserId;
    private extractCorrelationId;
}
export declare function getTenantContext(request: any): TenantContext | undefined;
