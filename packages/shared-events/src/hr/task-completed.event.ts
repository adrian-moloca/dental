import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const TASK_COMPLETED_EVENT_TYPE = 'dental.hr.task.completed' as const;
export const TASK_COMPLETED_EVENT_VERSION = 1;

export interface TaskCompletedPayload {
  taskId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  actualMinutes?: number;
  notes?: string;

  completedAt: ISODateString;
  completedBy: UUID;
}

export type TaskCompletedEvent = EventEnvelope<TaskCompletedPayload>;

export function isTaskCompletedEvent(event: EventEnvelope<unknown>): event is TaskCompletedEvent {
  return event.type === TASK_COMPLETED_EVENT_TYPE;
}

export function createTaskCompletedEvent(
  payload: TaskCompletedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): TaskCompletedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: TASK_COMPLETED_EVENT_TYPE,
    version: TASK_COMPLETED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
