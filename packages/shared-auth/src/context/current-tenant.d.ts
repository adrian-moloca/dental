import { OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import { CurrentUser } from './current-user';
export interface CurrentTenant {
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly tenantId: TenantId;
}
export declare function extractTenantContext(user: CurrentUser): CurrentTenant;
export declare function createTenantContext(organizationId: OrganizationId, clinicId?: ClinicId): CurrentTenant;
export declare function isOrganizationLevel(tenant: CurrentTenant): boolean;
export declare function isClinicLevel(tenant: CurrentTenant): boolean;
