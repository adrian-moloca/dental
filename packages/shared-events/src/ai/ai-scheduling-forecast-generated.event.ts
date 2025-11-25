import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

export const AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE =
  'dental.ai.scheduling.forecast.generated' as const;
export const AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION = 1;

export interface AISchedulingForecastGeneratedPayload {
  appointmentId: UUID;
  patientId: UUID;
  jobId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId?: ClinicId;
  noShowProbability: number;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  recommendations: string[];
  generatedAt: ISODateString;
  correlationId?: string;
}

export type AISchedulingForecastGeneratedEvent = EventEnvelope<AISchedulingForecastGeneratedPayload>;

export function isAISchedulingForecastGeneratedEvent(
  event: EventEnvelope<unknown>
): event is AISchedulingForecastGeneratedEvent {
  return event.type === AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE;
}

export function createAISchedulingForecastGeneratedEvent(
  payload: AISchedulingForecastGeneratedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): AISchedulingForecastGeneratedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE,
    version: AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
