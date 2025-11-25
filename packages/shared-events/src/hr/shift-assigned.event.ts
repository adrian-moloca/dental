import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const SHIFT_ASSIGNED_EVENT_TYPE = 'dental.hr.shift.assigned' as const;
export const SHIFT_ASSIGNED_EVENT_VERSION = 1;

export interface ShiftAssignedPayload {
  shiftId: UUID;
  staffId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  assignedAt: ISODateString;
  assignedBy: UUID;
}

export type ShiftAssignedEvent = EventEnvelope<ShiftAssignedPayload>;

export function isShiftAssignedEvent(event: EventEnvelope<unknown>): event is ShiftAssignedEvent {
  return event.type === SHIFT_ASSIGNED_EVENT_TYPE;
}

export function createShiftAssignedEvent(
  payload: ShiftAssignedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ShiftAssignedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: SHIFT_ASSIGNED_EVENT_TYPE,
    version: SHIFT_ASSIGNED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
