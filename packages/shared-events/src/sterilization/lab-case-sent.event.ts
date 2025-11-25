import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { LabCaseType } from '@dentalos/shared-domain';

export const LAB_CASE_SENT_EVENT_TYPE = 'dental.lab.case.sent' as const;
export const LAB_CASE_SENT_EVENT_VERSION = 1;

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

export function isLabCaseSentEvent(event: EventEnvelope<unknown>): event is LabCaseSentEvent {
  return event.type === LAB_CASE_SENT_EVENT_TYPE;
}

export function createLabCaseSentEvent(
  payload: LabCaseSentPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): LabCaseSentEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: LAB_CASE_SENT_EVENT_TYPE,
    version: LAB_CASE_SENT_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
