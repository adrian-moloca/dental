import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const SHIFT_ASSIGNED_EVENT_TYPE: "dental.hr.shift.assigned";
export declare const SHIFT_ASSIGNED_EVENT_VERSION = 1;
export interface ShiftAssignedPayload {
    shiftId: UUID;
    staffId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    assignedAt: ISODateString;
    assignedBy: UUID;
}
export type ShiftAssignedEvent = EventEnvelope<ShiftAssignedPayload>;
export declare function isShiftAssignedEvent(event: EventEnvelope<unknown>): event is ShiftAssignedEvent;
export declare function createShiftAssignedEvent(payload: ShiftAssignedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): ShiftAssignedEvent;
