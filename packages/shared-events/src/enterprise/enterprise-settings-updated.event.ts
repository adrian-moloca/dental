import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE = 'dental.enterprise.settings.updated' as const;
export const ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION = 1;

export interface EnterpriseSettingsUpdatedPayload {
  entityType: 'ORGANIZATION' | 'CLINIC';
  entityId: OrganizationId | ClinicId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  settingsChanged: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;

  updatedAt: ISODateString;
  updatedBy: UUID;
}

export type EnterpriseSettingsUpdatedEvent = EventEnvelope<EnterpriseSettingsUpdatedPayload>;

export function isEnterpriseSettingsUpdatedEvent(event: EventEnvelope<unknown>): event is EnterpriseSettingsUpdatedEvent {
  return event.type === ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE;
}

export function createEnterpriseSettingsUpdatedEvent(
  payload: EnterpriseSettingsUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): EnterpriseSettingsUpdatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE,
    version: ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION,
    payload,
    metadata,
    tenantContext,
    occurredAt: new Date(),
  };
}
