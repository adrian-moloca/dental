import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { SterilizationCycleType, SterilizationCycleStatus } from '@dentalos/shared-domain';

export const STERILIZATION_CYCLE_CREATED_EVENT_TYPE = 'dental.sterilization.cycle.created' as const;
export const STERILIZATION_CYCLE_CREATED_EVENT_VERSION = 1;

export interface SterilizationCycleCreatedPayload {
  cycleId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  cycleNumber: string;
  type: SterilizationCycleType;
  status: SterilizationCycleStatus;

  operatorId: UUID;
  instrumentIds: UUID[];
  instrumentCount: number;

  createdAt: ISODateString;
  createdBy: UUID;
}

export type SterilizationCycleCreatedEvent = EventEnvelope<SterilizationCycleCreatedPayload>;

export function isSterilizationCycleCreatedEvent(event: EventEnvelope<unknown>): event is SterilizationCycleCreatedEvent {
  return event.type === STERILIZATION_CYCLE_CREATED_EVENT_TYPE;
}

export function createSterilizationCycleCreatedEvent(
  payload: SterilizationCycleCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): SterilizationCycleCreatedEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: STERILIZATION_CYCLE_CREATED_EVENT_TYPE,
    version: STERILIZATION_CYCLE_CREATED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
