import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE: "dental.ai.marketing.personalization.generated";
export declare const AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION = 1;
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
export type AIMarketingPersonalizationGeneratedEvent = EventEnvelope<AIMarketingPersonalizationGeneratedPayload>;
export declare function isAIMarketingPersonalizationGeneratedEvent(event: EventEnvelope<unknown>): event is AIMarketingPersonalizationGeneratedEvent;
export declare function createAIMarketingPersonalizationGeneratedEvent(payload: AIMarketingPersonalizationGeneratedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIMarketingPersonalizationGeneratedEvent;
