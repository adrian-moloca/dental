import type { SterilizationCycleId } from '../inventory';
import type { InstrumentId, InstrumentStatus, InstrumentType } from './sterilization-types';
export interface Instrument {
    id: InstrumentId;
    tenantId: string;
    organizationId: string;
    clinicId: string;
    name: string;
    type: InstrumentType;
    status: InstrumentStatus;
    serialNumber?: string;
    manufacturer?: string;
    modelNumber?: string;
    inventoryItemId?: string;
    inventoryLotId?: string;
    purchaseDate?: Date;
    purchaseCost?: number;
    cyclesCompleted: number;
    maxCycles?: number;
    lastSterilizedAt?: Date;
    lastSterilizationCycleId?: SterilizationCycleId;
    retiredAt?: Date;
    retiredReason?: string;
    maintenanceNotes?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
