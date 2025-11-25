import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { InstrumentType } from '@dentalos/shared-domain';

export const STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE = 'dental.sterilization.instrument.retired' as const;
export const STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION = 1;

export interface SterilizationInstrumentRetiredPayload {
  instrumentId: UUID;
  tenantId: string;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  name: string;
  type: InstrumentType;
  serialNumber?: string;

  cyclesCompleted: number;
  maxCycles?: number;

  retiredAt: ISODateString;
  retiredReason?: string;
  retiredBy: UUID;

  inventoryItemId?: string;
  inventoryLotId?: string;
}

export type SterilizationInstrumentRetiredEvent = EventEnvelope<SterilizationInstrumentRetiredPayload>;

export function isSterilizationInstrumentRetiredEvent(event: EventEnvelope<unknown>): event is SterilizationInstrumentRetiredEvent {
  return event.type === STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE;
}

export function createSterilizationInstrumentRetiredEvent(
  payload: SterilizationInstrumentRetiredPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): SterilizationInstrumentRetiredEvent {
  return {
    id: crypto.randomUUID() as UUID,
    type: STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE,
    version: STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
