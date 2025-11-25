import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { StaffStatus } from '@dentalos/shared-domain';
export declare const STAFF_STATUS_CHANGED_EVENT_TYPE: "dental.hr.staff.status_changed";
export declare const STAFF_STATUS_CHANGED_EVENT_VERSION = 1;
export interface StaffStatusChangedPayload {
    staffId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    previousStatus: StaffStatus;
    newStatus: StaffStatus;
    reason?: string;
    changedAt: ISODateString;
    changedBy: UUID;
}
export type StaffStatusChangedEvent = EventEnvelope<StaffStatusChangedPayload>;
export declare function isStaffStatusChangedEvent(event: EventEnvelope<unknown>): event is StaffStatusChangedEvent;
export declare function createStaffStatusChangedEvent(payload: StaffStatusChangedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): StaffStatusChangedEvent;
