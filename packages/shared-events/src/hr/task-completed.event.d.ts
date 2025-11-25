import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const TASK_COMPLETED_EVENT_TYPE: "dental.hr.task.completed";
export declare const TASK_COMPLETED_EVENT_VERSION = 1;
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
export declare function isTaskCompletedEvent(event: EventEnvelope<unknown>): event is TaskCompletedEvent;
export declare function createTaskCompletedEvent(payload: TaskCompletedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): TaskCompletedEvent;
