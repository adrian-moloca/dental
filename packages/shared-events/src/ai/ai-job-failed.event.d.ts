import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';
export declare const AI_JOB_FAILED_EVENT_TYPE: "dental.ai.job.failed";
export declare const AI_JOB_FAILED_EVENT_VERSION = 1;
export interface AIJobFailedPayload {
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    error: string;
    errorCode?: string;
    retryCount: number;
    willRetry: boolean;
    failedAt: ISODateString;
    correlationId?: string;
}
export type AIJobFailedEvent = EventEnvelope<AIJobFailedPayload>;
export declare function isAIJobFailedEvent(event: EventEnvelope<unknown>): event is AIJobFailedEvent;
export declare function createAIJobFailedEvent(payload: AIJobFailedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIJobFailedEvent;
