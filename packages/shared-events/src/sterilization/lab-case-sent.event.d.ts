import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType } from '@dentalos/shared-domain';
export declare const LAB_CASE_SENT_EVENT_TYPE: "dental.lab.case.sent";
export declare const LAB_CASE_SENT_EVENT_VERSION = 1;
export interface LabCaseSentPayload {
    labCaseId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    caseNumber: string;
    type: LabCaseType;
    patientId: UUID;
    labName?: string;
    sentToLabAt: ISODateString;
    expectedReturnDate?: ISODateString;
    courierTrackingNumber?: string;
    courierService?: string;
    sentBy: UUID;
}
export type LabCaseSentEvent = EventEnvelope<LabCaseSentPayload>;
export declare function isLabCaseSentEvent(event: EventEnvelope<unknown>): event is LabCaseSentEvent;
export declare function createLabCaseSentEvent(payload: LabCaseSentPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): LabCaseSentEvent;
