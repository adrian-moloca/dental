import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType } from '@dentalos/shared-domain';
export declare const LAB_CASE_RECEIVED_EVENT_TYPE: "dental.lab.case.received";
export declare const LAB_CASE_RECEIVED_EVENT_VERSION = 1;
export interface LabCaseReceivedPayload {
    labCaseId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    caseNumber: string;
    type: LabCaseType;
    patientId: UUID;
    sentToLabAt?: ISODateString;
    receivedFromLabAt: ISODateString;
    receivedBy: UUID;
}
export type LabCaseReceivedEvent = EventEnvelope<LabCaseReceivedPayload>;
export declare function isLabCaseReceivedEvent(event: EventEnvelope<unknown>): event is LabCaseReceivedEvent;
export declare function createLabCaseReceivedEvent(payload: LabCaseReceivedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): LabCaseReceivedEvent;
