import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { ClinicStatus } from '@dentalos/shared-domain';

export const ENTERPRISE_CLINIC_CREATED_EVENT_TYPE = 'dental.enterprise.clinic.created' as const;
export const ENTERPRISE_CLINIC_CREATED_EVENT_VERSION = 1;

export interface EnterpriseClinicCreatedPayload {
  clinicId: ClinicId;
  organizationId: OrganizationId;
  name: string;
  code: string;
  status: ClinicStatus;

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  phone: string;
  email: string;
  timezone: string;

  managerUserId?: UUID;
  managerName?: string;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type EnterpriseClinicCreatedEvent = EventEnvelope<EnterpriseClinicCreatedPayload>;

export function isEnterpriseClinicCreatedEvent(event: EventEnvelope<unknown>): event is EnterpriseClinicCreatedEvent {
  return event.type === ENTERPRISE_CLINIC_CREATED_EVENT_TYPE;
}

export function createEnterpriseClinicCreatedEvent(
  payload: EnterpriseClinicCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): EnterpriseClinicCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: ENTERPRISE_CLINIC_CREATED_EVENT_TYPE,
    version: ENTERPRISE_CLINIC_CREATED_EVENT_VERSION,
    payload,
    metadata,
    tenantContext,
    occurredAt: new Date(),
  };
}
