import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
export declare const AI_PATIENT_RISK_UPDATED_EVENT_TYPE: "dental.ai.patient.risk.updated";
export declare const AI_PATIENT_RISK_UPDATED_EVENT_VERSION = 1;
export interface AIPatientRiskUpdatedPayload {
    patientId: UUID;
    jobId: UUID;
    tenantId: string;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: Array<{
        factor: string;
        impact: number;
        description: string;
    }>;
    recommendations: string[];
    calculatedAt: ISODateString;
    validUntil: ISODateString;
    correlationId?: string;
}
export type AIPatientRiskUpdatedEvent = EventEnvelope<AIPatientRiskUpdatedPayload>;
export declare function isAIPatientRiskUpdatedEvent(event: EventEnvelope<unknown>): event is AIPatientRiskUpdatedEvent;
export declare function createAIPatientRiskUpdatedEvent(payload: AIPatientRiskUpdatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): AIPatientRiskUpdatedEvent;
