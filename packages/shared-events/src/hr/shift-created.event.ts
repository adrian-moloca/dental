import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const SHIFT_CREATED_EVENT_TYPE = 'dental.hr.shift.created' as const;
export const SHIFT_CREATED_EVENT_VERSION = 1;

export interface ShiftCreatedPayload {
  shiftId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  title: string;
  startTime: ISODateString;
  endTime: ISODateString;

  assignedStaffIds: UUID[];
  requiredRole?: string;

  isRecurring: boolean;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type ShiftCreatedEvent = EventEnvelope<ShiftCreatedPayload>;

export function isShiftCreatedEvent(event: EventEnvelope<unknown>): event is ShiftCreatedEvent {
  return event.type === SHIFT_CREATED_EVENT_TYPE;
}

export function createShiftCreatedEvent(
  payload: ShiftCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ShiftCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: SHIFT_CREATED_EVENT_TYPE,
    version: SHIFT_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
