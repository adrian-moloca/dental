import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { AITaskType } from '@dentalos/shared-domain';
export declare const AI_PREDICTION_GENERATED_EVENT_TYPE: "dental.ai.prediction.generated";
export declare const AI_PREDICTION_GENERATED_EVENT_VERSION = 1;
export interface AIPredictionGeneratedPayload {
    predictionId: UUID;
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    taskType: AITaskType;
    entityId: string;
    entityType: string;
    prediction: Record<string, unknown>;
    confidence: number;
    riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    generatedAt: ISODateString;
    validUntil?: ISODateString;
    correlationId?: string;
}
export type AIPredictionGeneratedEvent = EventEnvelope<AIPredictionGeneratedPayload>;
export declare function isAIPredictionGeneratedEvent(event: EventEnvelope<unknown>): event is AIPredictionGeneratedEvent;
export declare function createAIPredictionGeneratedEvent(payload: AIPredictionGeneratedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIPredictionGeneratedEvent;
