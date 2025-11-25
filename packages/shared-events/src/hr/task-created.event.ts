import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { TaskCategory, TaskStatus, TaskPriority } from '@dentalos/shared-domain';

export const TASK_CREATED_EVENT_TYPE = 'dental.hr.task.created' as const;
export const TASK_CREATED_EVENT_VERSION = 1;

export interface TaskCreatedPayload {
  taskId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  title: string;
  description?: string;

  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;

  assigneeId?: UUID;
  assignedBy: UUID;
  reporterId: UUID;

  dueDate?: ISODateString;

  clinicalProcedureId?: string;
  sterilizationCycleId?: string;
  inventoryOrderId?: string;
  patientId?: string;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type TaskCreatedEvent = EventEnvelope<TaskCreatedPayload>;

export function isTaskCreatedEvent(event: EventEnvelope<unknown>): event is TaskCreatedEvent {
  return event.type === TASK_CREATED_EVENT_TYPE;
}

export function createTaskCreatedEvent(
  payload: TaskCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): TaskCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: TASK_CREATED_EVENT_TYPE,
    version: TASK_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
