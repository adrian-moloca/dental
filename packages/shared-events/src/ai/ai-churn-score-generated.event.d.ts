import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const AI_CHURN_SCORE_GENERATED_EVENT_TYPE: "dental.ai.churn.score.generated";
export declare const AI_CHURN_SCORE_GENERATED_EVENT_VERSION = 1;
export interface AIChurnScoreGeneratedPayload {
    patientId: UUID;
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    churnScore: number;
    confidence: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: Array<{
        factor: string;
        impact: number;
        description: string;
    }>;
    recommendations: string[];
    calculatedAt: ISODateString;
    validUntil: ISODateString;
    correlationId?: string;
}
export type AIChurnScoreGeneratedEvent = EventEnvelope<AIChurnScoreGeneratedPayload>;
export declare function isAIChurnScoreGeneratedEvent(event: EventEnvelope<unknown>): event is AIChurnScoreGeneratedEvent;
export declare function createAIChurnScoreGeneratedEvent(payload: AIChurnScoreGeneratedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIChurnScoreGeneratedEvent;
