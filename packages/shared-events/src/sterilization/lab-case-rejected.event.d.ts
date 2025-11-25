import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType } from '@dentalos/shared-domain';
export declare const LAB_CASE_REJECTED_EVENT_TYPE: "dental.lab.case.rejected";
export declare const LAB_CASE_REJECTED_EVENT_VERSION = 1;
export interface LabCaseRejectedPayload {
    labCaseId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    caseNumber: string;
    type: LabCaseType;
    patientId: UUID;
    providerId: UUID;
    rejectedAt: ISODateString;
    rejectionReason?: string;
    rejectedBy: UUID;
}
export type LabCaseRejectedEvent = EventEnvelope<LabCaseRejectedPayload>;
export declare function isLabCaseRejectedEvent(event: EventEnvelope<unknown>): event is LabCaseRejectedEvent;
export declare function createLabCaseRejectedEvent(payload: LabCaseRejectedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): LabCaseRejectedEvent;
