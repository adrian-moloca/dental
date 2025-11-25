import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { SterilizationCycleType, SterilizationCycleStatus } from '@dentalos/shared-domain';
export declare const STERILIZATION_CYCLE_CREATED_EVENT_TYPE: "dental.sterilization.cycle.created";
export declare const STERILIZATION_CYCLE_CREATED_EVENT_VERSION = 1;
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
export declare function isSterilizationCycleCreatedEvent(event: EventEnvelope<unknown>): event is SterilizationCycleCreatedEvent;
export declare function createSterilizationCycleCreatedEvent(payload: SterilizationCycleCreatedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): SterilizationCycleCreatedEvent;
