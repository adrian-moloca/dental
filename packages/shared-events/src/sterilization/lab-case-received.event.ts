import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType } from '@dentalos/shared-domain';

export const LAB_CASE_RECEIVED_EVENT_TYPE = 'dental.lab.case.received' as const;
export const LAB_CASE_RECEIVED_EVENT_VERSION = 1;

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

export function isLabCaseReceivedEvent(event: EventEnvelope<unknown>): event is LabCaseReceivedEvent {
  return event.type === LAB_CASE_RECEIVED_EVENT_TYPE;
}

export function createLabCaseReceivedEvent(
  payload: LabCaseReceivedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): LabCaseReceivedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: LAB_CASE_RECEIVED_EVENT_TYPE,
    version: LAB_CASE_RECEIVED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
