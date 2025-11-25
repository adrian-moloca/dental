import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const STAFF_UPDATED_EVENT_TYPE = 'dental.hr.staff.updated' as const;
export const STAFF_UPDATED_EVENT_VERSION = 1;

export interface StaffUpdatedPayload {
  staffId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  changes: Record<string, unknown>;
  updatedAt: ISODateString;
  updatedBy: UUID;
}

export type StaffUpdatedEvent = EventEnvelope<StaffUpdatedPayload>;

export function isStaffUpdatedEvent(event: EventEnvelope<unknown>): event is StaffUpdatedEvent {
  return event.type === STAFF_UPDATED_EVENT_TYPE;
}

export function createStaffUpdatedEvent(
  payload: StaffUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StaffUpdatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: STAFF_UPDATED_EVENT_TYPE,
    version: STAFF_UPDATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
