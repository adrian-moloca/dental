import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { SterilizationCycleStatus, BiologicalIndicatorResult } from '@dentalos/shared-domain';
export declare const STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE: "dental.sterilization.cycle.completed";
export declare const STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION = 1;
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
export declare function isSterilizationCycleCompletedEvent(event: EventEnvelope<unknown>): event is SterilizationCycleCompletedEvent;
export declare function createSterilizationCycleCompletedEvent(payload: SterilizationCycleCompletedPayload, metadata: EventEnvelope<unknown>['metadata'], tenantContext: EventEnvelope<unknown>['tenantContext']): SterilizationCycleCompletedEvent;
