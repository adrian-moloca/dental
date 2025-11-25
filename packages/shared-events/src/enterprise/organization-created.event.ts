import type { UUID, OrganizationId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { OrganizationStatus } from '@dentalos/shared-domain';

export const ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE = 'dental.enterprise.organization.created' as const;
export const ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION = 1;

export interface EnterpriseOrganizationCreatedPayload {
  organizationId: OrganizationId;
  name: string;
  legalName: string;
  taxId: string;
  status: OrganizationStatus;

  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;

  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  subscriptionTier: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  maxClinics: number;
  maxUsers: number;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type EnterpriseOrganizationCreatedEvent = EventEnvelope<EnterpriseOrganizationCreatedPayload>;

export function isEnterpriseOrganizationCreatedEvent(event: EventEnvelope<unknown>): event is EnterpriseOrganizationCreatedEvent {
  return event.type === ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE;
}

export function createEnterpriseOrganizationCreatedEvent(
  payload: EnterpriseOrganizationCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): EnterpriseOrganizationCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE,
    version: ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION,
    payload,
    metadata,
    tenantContext,
    occurredAt: new Date(),
  };
}
