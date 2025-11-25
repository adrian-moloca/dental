import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const TASK_ESCALATED_EVENT_TYPE: "dental.hr.task.escalated";
export declare const TASK_ESCALATED_EVENT_VERSION = 1;
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
export declare function isTaskEscalatedEvent(event: EventEnvelope<unknown>): event is TaskEscalatedEvent;
export declare function createTaskEscalatedEvent(payload: TaskEscalatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): TaskEscalatedEvent;
