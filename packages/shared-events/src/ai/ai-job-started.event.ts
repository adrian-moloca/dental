import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';

export const AI_JOB_STARTED_EVENT_TYPE = 'dental.ai.job.started' as const;
export const AI_JOB_STARTED_EVENT_VERSION = 1;

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

export function isAIJobStartedEvent(event: EventEnvelope<unknown>): event is AIJobStartedEvent {
  return event.type === AI_JOB_STARTED_EVENT_TYPE;
}

export function createAIJobStartedEvent(
  payload: AIJobStartedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AIJobStartedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_JOB_STARTED_EVENT_TYPE,
    version: AI_JOB_STARTED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
