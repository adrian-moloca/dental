import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';
export declare const AI_JOB_COMPLETED_EVENT_TYPE: "dental.ai.job.completed";
export declare const AI_JOB_COMPLETED_EVENT_VERSION = 1;
export interface AIJobCompletedPayload {
    jobId: UUID;
    resultId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    result: Record<string, unknown>;
    confidence?: number;
    modelUsed: string;
    tokensUsed?: number;
    processingTimeMs: number;
    completedAt: ISODateString;
    correlationId?: string;
}
export type AIJobCompletedEvent = EventEnvelope<AIJobCompletedPayload>;
export declare function isAIJobCompletedEvent(event: EventEnvelope<unknown>): event is AIJobCompletedEvent;
export declare function createAIJobCompletedEvent(payload: AIJobCompletedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIJobCompletedEvent;
