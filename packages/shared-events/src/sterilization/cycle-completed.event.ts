import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { SterilizationCycleStatus, BiologicalIndicatorResult } from '@dentalos/shared-domain';

export const STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE = 'dental.sterilization.cycle.completed' as const;
export const STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION = 1;

export interface SterilizationCycleCompletedPayload {
  cycleId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  cycleNumber: string;
  status: SterilizationCycleStatus;

  instrumentIds: UUID[];
  instrumentCount: number;

  startedAt?: ISODateString;
  completedAt: ISODateString;
  durationMinutes?: number;

  biologicalIndicatorResult?: BiologicalIndicatorResult;

  completedBy: UUID;
}

export type SterilizationCycleCompletedEvent = EventEnvelope<SterilizationCycleCompletedPayload>;

export function isSterilizationCycleCompletedEvent(event: EventEnvelope<unknown>): event is SterilizationCycleCompletedEvent {
  return event.type === STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE;
}

export function createSterilizationCycleCompletedEvent(
  payload: SterilizationCycleCompletedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): SterilizationCycleCompletedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE,
    version: STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
