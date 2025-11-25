import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';

export const AI_JOB_COMPLETED_EVENT_TYPE = 'dental.ai.job.completed' as const;
export const AI_JOB_COMPLETED_EVENT_VERSION = 1;

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

export function isAIJobCompletedEvent(event: EventEnvelope<unknown>): event is AIJobCompletedEvent {
  return event.type === AI_JOB_COMPLETED_EVENT_TYPE;
}

export function createAIJobCompletedEvent(
  payload: AIJobCompletedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AIJobCompletedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_JOB_COMPLETED_EVENT_TYPE,
    version: AI_JOB_COMPLETED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
