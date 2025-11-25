import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { StaffRole, StaffStatus } from '@dentalos/shared-domain';
export declare const STAFF_CREATED_EVENT_TYPE: "dental.hr.staff.created";
export declare const STAFF_CREATED_EVENT_VERSION = 1;
export interface StaffCreatedPayload {
    staffId: UUID;
    userId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: StaffRole;
    status: StaffStatus;
    hireDate: ISODateString;
    createdAt: ISODateString;
    createdBy: UUID;
}
export type StaffCreatedEvent = EventEnvelope<StaffCreatedPayload>;
export declare function isStaffCreatedEvent(event: EventEnvelope<unknown>): event is StaffCreatedEvent;
export declare function createStaffCreatedEvent(payload: StaffCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): StaffCreatedEvent;
