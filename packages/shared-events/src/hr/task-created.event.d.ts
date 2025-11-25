import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { TaskCategory, TaskStatus, TaskPriority } from '@dentalos/shared-domain';
export declare const TASK_CREATED_EVENT_TYPE: "dental.hr.task.created";
export declare const TASK_CREATED_EVENT_VERSION = 1;
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
export declare function isTaskCreatedEvent(event: EventEnvelope<unknown>): event is TaskCreatedEvent;
export declare function createTaskCreatedEvent(payload: TaskCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): TaskCreatedEvent;
