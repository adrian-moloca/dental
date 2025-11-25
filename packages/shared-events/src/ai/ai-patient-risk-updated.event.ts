import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const AI_PATIENT_RISK_UPDATED_EVENT_TYPE = 'dental.ai.patient.risk.updated' as const;
export const AI_PATIENT_RISK_UPDATED_EVENT_VERSION = 1;

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

export function isAIPatientRiskUpdatedEvent(
  event: EventEnvelope<unknown>
): event is AIPatientRiskUpdatedEvent {
  return event.type === AI_PATIENT_RISK_UPDATED_EVENT_TYPE;
}

export function createAIPatientRiskUpdatedEvent(
  payload: AIPatientRiskUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AIPatientRiskUpdatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_PATIENT_RISK_UPDATED_EVENT_TYPE,
    version: AI_PATIENT_RISK_UPDATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
