import type { SterilizationCycleId } from '../inventory';
import type { InstrumentId, SterilizationCycleStatus, SterilizationCycleType, BiologicalIndicatorResult } from './sterilization-types';
export interface SterilizationCycle {
    id: SterilizationCycleId;
    tenantId: string;
    organizationId: string;
    clinicId: string;
    cycleNumber: string;
    type: SterilizationCycleType;
    status: SterilizationCycleStatus;
    autoclaveId?: string;
    operatorId: string;
    instruments: InstrumentId[];
    instrumentCount: number;
    temperature?: number;
    pressure?: number;
    durationMinutes?: number;
    startedAt?: Date;
    completedAt?: Date;
    biologicalIndicatorResult?: BiologicalIndicatorResult;
    biologicalIndicatorTestedAt?: Date;
    biologicalIndicatorTestedBy?: string;
    notes?: string;
    failureReason?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
