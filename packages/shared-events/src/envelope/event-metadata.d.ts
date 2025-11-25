import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
export interface EventMetadata {
    readonly correlationId?: UUID;
    readonly causationId?: UUID;
    readonly userId?: UUID;
    readonly userAgent?: string;
    readonly ipAddress?: string;
    readonly organizationId?: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly tenantId?: TenantId;
    readonly [key: string]: unknown;
}
