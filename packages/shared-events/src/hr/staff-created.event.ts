import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { StaffRole, StaffStatus } from '@dentalos/shared-domain';

export const STAFF_CREATED_EVENT_TYPE = 'dental.hr.staff.created' as const;
export const STAFF_CREATED_EVENT_VERSION = 1;

export interface StaffCreatedPayload {
  staffId: UUID;
  userId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  role: StaffRole;
  status: StaffStatus;

  hireDate: ISODateString;
  createdAt: ISODateString;
  createdBy: UUID;
}

export type StaffCreatedEvent = EventEnvelope<StaffCreatedPayload>;

export function isStaffCreatedEvent(event: EventEnvelope<unknown>): event is StaffCreatedEvent {
  return event.type === STAFF_CREATED_EVENT_TYPE;
}

export function createStaffCreatedEvent(
  payload: StaffCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): StaffCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: STAFF_CREATED_EVENT_TYPE,
    version: STAFF_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
