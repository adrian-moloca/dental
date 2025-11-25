import { OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import { CurrentTenant } from '../context/current-tenant';
import { CurrentUser } from '../context/current-user';
export declare class TenantIsolationError extends Error {
    readonly userTenantId: TenantId;
    readonly targetTenantId: TenantId;
    constructor(message: string, userTenantId: TenantId, targetTenantId: TenantId);
}
export declare function validateTenantAccess(user: CurrentUser, targetTenantId: TenantId): void;
export declare function ensureTenantIsolation(userContext: CurrentTenant, dataContext: CurrentTenant): void;
export declare function canAccessOrganization(user: CurrentUser, organizationId: OrganizationId): boolean;
export declare function validateOrganizationAccess(user: CurrentUser, organizationId: OrganizationId): void;
export declare function canAccessClinic(user: CurrentUser, clinicId: ClinicId): boolean;
export declare function validateClinicAccess(user: CurrentUser, clinicId: ClinicId): void;
