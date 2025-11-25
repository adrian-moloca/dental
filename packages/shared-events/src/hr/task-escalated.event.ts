import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const TASK_ESCALATED_EVENT_TYPE = 'dental.hr.task.escalated' as const;
export const TASK_ESCALATED_EVENT_VERSION = 1;

export interface TaskEscalatedPayload {
  taskId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  escalatedTo: UUID;
  escalationReason: string;

  escalatedAt: ISODateString;
  escalatedBy: UUID;
}

export type TaskEscalatedEvent = EventEnvelope<TaskEscalatedPayload>;

export function isTaskEscalatedEvent(event: EventEnvelope<unknown>): event is TaskEscalatedEvent {
  return event.type === TASK_ESCALATED_EVENT_TYPE;
}

export function createTaskEscalatedEvent(
  payload: TaskEscalatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): TaskEscalatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: TASK_ESCALATED_EVENT_TYPE,
    version: TASK_ESCALATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
