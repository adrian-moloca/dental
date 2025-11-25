import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType, LabCaseStatus } from '@dentalos/shared-domain';

export const LAB_CASE_CREATED_EVENT_TYPE = 'dental.lab.case.created' as const;
export const LAB_CASE_CREATED_EVENT_VERSION = 1;

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

export function isLabCaseCreatedEvent(event: EventEnvelope<unknown>): event is LabCaseCreatedEvent {
  return event.type === LAB_CASE_CREATED_EVENT_TYPE;
}

export function createLabCaseCreatedEvent(
  payload: LabCaseCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): LabCaseCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: LAB_CASE_CREATED_EVENT_TYPE,
    version: LAB_CASE_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
