import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AbsenceType, AbsenceStatus } from '@dentalos/shared-domain';
export declare const ABSENCE_CREATED_EVENT_TYPE: "dental.hr.absence.created";
export declare const ABSENCE_CREATED_EVENT_VERSION = 1;
export interface AbsenceCreatedPayload {
    absenceId: UUID;
    staffId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    type: AbsenceType;
    status: AbsenceStatus;
    startDate: ISODateString;
    endDate: ISODateString;
    totalDays: number;
    reason?: string;
    requestedAt: ISODateString;
    requestedBy: UUID;
}
export type AbsenceCreatedEvent = EventEnvelope<AbsenceCreatedPayload>;
export declare function isAbsenceCreatedEvent(event: EventEnvelope<unknown>): event is AbsenceCreatedEvent;
export declare function createAbsenceCreatedEvent(payload: AbsenceCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AbsenceCreatedEvent;
