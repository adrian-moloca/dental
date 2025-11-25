import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const SHIFT_CREATED_EVENT_TYPE: "dental.hr.shift.created";
export declare const SHIFT_CREATED_EVENT_VERSION = 1;
export interface ShiftCreatedPayload {
    shiftId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    title: string;
    startTime: ISODateString;
    endTime: ISODateString;
    assignedStaffIds: UUID[];
    requiredRole?: string;
    isRecurring: boolean;
    createdAt: ISODateString;
    createdBy: UUID;
}
export type ShiftCreatedEvent = EventEnvelope<ShiftCreatedPayload>;
export declare function isShiftCreatedEvent(event: EventEnvelope<unknown>): event is ShiftCreatedEvent;
export declare function createShiftCreatedEvent(payload: ShiftCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): ShiftCreatedEvent;
