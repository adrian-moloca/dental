import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';
export declare const AI_JOB_STARTED_EVENT_TYPE: "dental.ai.job.started";
export declare const AI_JOB_STARTED_EVENT_VERSION = 1;
export interface AIJobStartedPayload {
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    taskType: AITaskType;
    contextId: string;
    contextType: string;
    startedAt: ISODateString;
    correlationId?: string;
}
export type AIJobStartedEvent = EventEnvelope<AIJobStartedPayload>;
export declare function isAIJobStartedEvent(event: EventEnvelope<unknown>): event is AIJobStartedEvent;
export declare function createAIJobStartedEvent(payload: AIJobStartedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIJobStartedEvent;
