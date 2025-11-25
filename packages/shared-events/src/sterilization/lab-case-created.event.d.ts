import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType, LabCaseStatus } from '@dentalos/shared-domain';
export declare const LAB_CASE_CREATED_EVENT_TYPE: "dental.lab.case.created";
export declare const LAB_CASE_CREATED_EVENT_VERSION = 1;
export interface LabCaseCreatedPayload {
    labCaseId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    caseNumber: string;
    type: LabCaseType;
    status: LabCaseStatus;
    patientId: UUID;
    providerId: UUID;
    treatmentPlanId?: UUID;
    description: string;
    toothNumbers?: string[];
    labName?: string;
    createdAt: ISODateString;
    createdBy: UUID;
}
export type LabCaseCreatedEvent = EventEnvelope<LabCaseCreatedPayload>;
export declare function isLabCaseCreatedEvent(event: EventEnvelope<unknown>): event is LabCaseCreatedEvent;
export declare function createLabCaseCreatedEvent(payload: LabCaseCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): LabCaseCreatedEvent;
