import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const STAFF_UPDATED_EVENT_TYPE: "dental.hr.staff.updated";
export declare const STAFF_UPDATED_EVENT_VERSION = 1;
export interface StaffUpdatedPayload {
    staffId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    changes: Record<string, unknown>;
    updatedAt: ISODateString;
    updatedBy: UUID;
}
export type StaffUpdatedEvent = EventEnvelope<StaffUpdatedPayload>;
export declare function isStaffUpdatedEvent(event: EventEnvelope<unknown>): event is StaffUpdatedEvent;
export declare function createStaffUpdatedEvent(payload: StaffUpdatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): StaffUpdatedEvent;
