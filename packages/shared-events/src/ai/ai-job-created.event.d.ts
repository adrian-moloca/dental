import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';
export declare const AI_JOB_CREATED_EVENT_TYPE: "dental.ai.job.created";
export declare const AI_JOB_CREATED_EVENT_VERSION = 1;
export interface AIJobCreatedPayload {
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    requestedBy: UUID;
    correlationId?: string;
    createdAt: ISODateString;
    metadata?: Record<string, unknown>;
}
export type AIJobCreatedEvent = EventEnvelope<AIJobCreatedPayload>;
export declare function isAIJobCreatedEvent(event: EventEnvelope<unknown>): event is AIJobCreatedEvent;
export declare function createAIJobCreatedEvent(payload: AIJobCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIJobCreatedEvent;
