import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { InstrumentType } from '@dentalos/shared-domain';
export declare const STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE: "dental.sterilization.instrument.retired";
export declare const STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION = 1;
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
export declare function isSterilizationInstrumentRetiredEvent(event: EventEnvelope<unknown>): event is SterilizationInstrumentRetiredEvent;
export declare function createSterilizationInstrumentRetiredEvent(payload: SterilizationInstrumentRetiredPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): SterilizationInstrumentRetiredEvent;
