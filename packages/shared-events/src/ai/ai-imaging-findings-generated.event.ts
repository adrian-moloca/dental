import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE =
  'dental.ai.imaging.findings.generated' as const;
export const AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION = 1;

export interface AIImagingFindingsGeneratedPayload {
  studyId: UUID;
  patientId: UUID;
  jobId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  findings: Array<{
    region: string;
    description: string;
    severity: 'NORMAL' | 'MILD' | 'MODERATE' | 'SEVERE';
    confidence: number;
  }>;
  abnormalities: Array<{
    type: string;
    location: string;
    description: string;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  summary: string;
  requiresReview: boolean;
  confidence: number;
  generatedAt: ISODateString;
  correlationId?: string;
}

export type AIImagingFindingsGeneratedEvent = EventEnvelope<AIImagingFindingsGeneratedPayload>;

export function isAIImagingFindingsGeneratedEvent(
  event: EventEnvelope<unknown>
): event is AIImagingFindingsGeneratedEvent {
  return event.type === AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE;
}

export function createAIImagingFindingsGeneratedEvent(
  payload: AIImagingFindingsGeneratedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AIImagingFindingsGeneratedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE,
    version: AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
