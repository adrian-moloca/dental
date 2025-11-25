import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import type { EventMetadata } from './event-metadata';
export interface EventEnvelope<T = unknown> {
    readonly id: UUID;
    readonly type: string;
    readonly version: number;
    readonly occurredAt: Date;
    readonly payload: T;
    readonly metadata: EventMetadata;
    readonly tenantContext: TenantContext;
}
export interface TenantContext {
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly tenantId: TenantId;
}
