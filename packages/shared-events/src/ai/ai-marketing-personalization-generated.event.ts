import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE =
  'dental.ai.marketing.personalization.generated' as const;
export const AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION = 1;

export interface AIMarketingPersonalizationGeneratedPayload {
  patientId: UUID;
  jobId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  personalization: {
    preferredChannel: string;
    preferredTiming: string;
    messageStyle: string;
    topics: string[];
    offers: string[];
  };
  confidence: number;
  generatedAt: ISODateString;
  validUntil: ISODateString;
  correlationId?: string;
}

export type AIMarketingPersonalizationGeneratedEvent =
  EventEnvelope<AIMarketingPersonalizationGeneratedPayload>;

export function isAIMarketingPersonalizationGeneratedEvent(
  event: EventEnvelope<unknown>
): event is AIMarketingPersonalizationGeneratedEvent {
  return event.type === AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE;
}

export function createAIMarketingPersonalizationGeneratedEvent(
  payload: AIMarketingPersonalizationGeneratedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AIMarketingPersonalizationGeneratedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE,
    version: AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
