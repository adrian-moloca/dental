import { z } from 'zod';
import { SterilizationCycleStatus, SterilizationCycleType, BiologicalIndicatorResult, InstrumentStatus, InstrumentType, LabCaseStatus, LabCaseType, ClinicalLogisticsTaskType, ClinicalLogisticsTaskStatus } from '@dentalos/shared-domain';
export declare const CreateCycleDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    cycleNumber: z.ZodString;
    type: z.ZodNativeEnum<typeof SterilizationCycleType>;
    autoclaveId: z.ZodOptional<z.ZodString>;
    instrumentIds: z.ZodArray<z.ZodString, "many">;
    temperature: z.ZodOptional<z.ZodNumber>;
    pressure: z.ZodOptional<z.ZodNumber>;
    durationMinutes: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: SterilizationCycleType;
    clinicId: string;
    cycleNumber: string;
    instrumentIds: string[];
    notes?: string | undefined;
    autoclaveId?: string | undefined;
    temperature?: number | undefined;
    pressure?: number | undefined;
    durationMinutes?: number | undefined;
}, {
    type: SterilizationCycleType;
    clinicId: string;
    cycleNumber: string;
    instrumentIds: string[];
    notes?: string | undefined;
    autoclaveId?: string | undefined;
    temperature?: number | undefined;
    pressure?: number | undefined;
    durationMinutes?: number | undefined;
}>;
export type CreateCycleDto = z.infer<typeof CreateCycleDtoSchema>;
export declare const UpdateCycleStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof SterilizationCycleStatus>;
    biologicalIndicatorResult: z.ZodOptional<z.ZodNativeEnum<typeof BiologicalIndicatorResult>>;
    failureReason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: SterilizationCycleStatus;
    notes?: string | undefined;
    biologicalIndicatorResult?: BiologicalIndicatorResult | undefined;
    failureReason?: string | undefined;
}, {
    status: SterilizationCycleStatus;
    notes?: string | undefined;
    biologicalIndicatorResult?: BiologicalIndicatorResult | undefined;
    failureReason?: string | undefined;
}>;
export type UpdateCycleStatusDto = z.infer<typeof UpdateCycleStatusDtoSchema>;
export declare const AddInstrumentsToCycleDtoSchema: z.ZodObject<{
    instrumentIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    instrumentIds: string[];
}, {
    instrumentIds: string[];
}>;
export type AddInstrumentsToCycleDto = z.infer<typeof AddInstrumentsToCycleDtoSchema>;
export declare const CreateInstrumentDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    name: z.ZodString;
    type: z.ZodNativeEnum<typeof InstrumentType>;
    serialNumber: z.ZodOptional<z.ZodString>;
    manufacturer: z.ZodOptional<z.ZodString>;
    modelNumber: z.ZodOptional<z.ZodString>;
    inventoryItemId: z.ZodOptional<z.ZodString>;
    inventoryLotId: z.ZodOptional<z.ZodString>;
    purchaseDate: z.ZodOptional<z.ZodString>;
    purchaseCost: z.ZodOptional<z.ZodNumber>;
    maxCycles: z.ZodOptional<z.ZodNumber>;
    maintenanceNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: InstrumentType;
    clinicId: string;
    name: string;
    serialNumber?: string | undefined;
    manufacturer?: string | undefined;
    modelNumber?: string | undefined;
    inventoryItemId?: string | undefined;
    inventoryLotId?: string | undefined;
    purchaseDate?: string | undefined;
    purchaseCost?: number | undefined;
    maxCycles?: number | undefined;
    maintenanceNotes?: string | undefined;
}, {
    type: InstrumentType;
    clinicId: string;
    name: string;
    serialNumber?: string | undefined;
    manufacturer?: string | undefined;
    modelNumber?: string | undefined;
    inventoryItemId?: string | undefined;
    inventoryLotId?: string | undefined;
    purchaseDate?: string | undefined;
    purchaseCost?: number | undefined;
    maxCycles?: number | undefined;
    maintenanceNotes?: string | undefined;
}>;
export type CreateInstrumentDto = z.infer<typeof CreateInstrumentDtoSchema>;
export declare const UpdateInstrumentDtoSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    serialNumber: z.ZodOptional<z.ZodString>;
    manufacturer: z.ZodOptional<z.ZodString>;
    modelNumber: z.ZodOptional<z.ZodString>;
    maxCycles: z.ZodOptional<z.ZodNumber>;
    maintenanceNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    serialNumber?: string | undefined;
    manufacturer?: string | undefined;
    modelNumber?: string | undefined;
    maxCycles?: number | undefined;
    maintenanceNotes?: string | undefined;
}, {
    name?: string | undefined;
    serialNumber?: string | undefined;
    manufacturer?: string | undefined;
    modelNumber?: string | undefined;
    maxCycles?: number | undefined;
    maintenanceNotes?: string | undefined;
}>;
export type UpdateInstrumentDto = z.infer<typeof UpdateInstrumentDtoSchema>;
export declare const UpdateInstrumentStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof InstrumentStatus>;
    retiredReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: InstrumentStatus;
    retiredReason?: string | undefined;
}, {
    status: InstrumentStatus;
    retiredReason?: string | undefined;
}>;
export type UpdateInstrumentStatusDto = z.infer<typeof UpdateInstrumentStatusDtoSchema>;
export declare const CreateLabCaseDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    caseNumber: z.ZodString;
    type: z.ZodNativeEnum<typeof LabCaseType>;
    patientId: z.ZodString;
    providerId: z.ZodString;
    treatmentPlanId: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    labId: z.ZodOptional<z.ZodString>;
    labName: z.ZodOptional<z.ZodString>;
    labContactEmail: z.ZodOptional<z.ZodString>;
    labContactPhone: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    specifications: z.ZodOptional<z.ZodString>;
    shadeGuide: z.ZodOptional<z.ZodString>;
    toothNumbers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    impressionDate: z.ZodOptional<z.ZodString>;
    expectedReturnDate: z.ZodOptional<z.ZodString>;
    estimatedCost: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: LabCaseType;
    clinicId: string;
    description: string;
    patientId: string;
    providerId: string;
    caseNumber: string;
    notes?: string | undefined;
    labName?: string | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    labId?: string | undefined;
    labContactEmail?: string | undefined;
    labContactPhone?: string | undefined;
    specifications?: string | undefined;
    shadeGuide?: string | undefined;
    toothNumbers?: string[] | undefined;
    impressionDate?: string | undefined;
    expectedReturnDate?: string | undefined;
    estimatedCost?: number | undefined;
}, {
    type: LabCaseType;
    clinicId: string;
    description: string;
    patientId: string;
    providerId: string;
    caseNumber: string;
    notes?: string | undefined;
    labName?: string | undefined;
    treatmentPlanId?: string | undefined;
    appointmentId?: string | undefined;
    labId?: string | undefined;
    labContactEmail?: string | undefined;
    labContactPhone?: string | undefined;
    specifications?: string | undefined;
    shadeGuide?: string | undefined;
    toothNumbers?: string[] | undefined;
    impressionDate?: string | undefined;
    expectedReturnDate?: string | undefined;
    estimatedCost?: number | undefined;
}>;
export type CreateLabCaseDto = z.infer<typeof CreateLabCaseDtoSchema>;
export declare const UpdateLabCaseDtoSchema: z.ZodObject<{
    labName: z.ZodOptional<z.ZodString>;
    labContactEmail: z.ZodOptional<z.ZodString>;
    labContactPhone: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    specifications: z.ZodOptional<z.ZodString>;
    shadeGuide: z.ZodOptional<z.ZodString>;
    toothNumbers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    expectedReturnDate: z.ZodOptional<z.ZodString>;
    estimatedCost: z.ZodOptional<z.ZodNumber>;
    actualCost: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    notes?: string | undefined;
    labName?: string | undefined;
    labContactEmail?: string | undefined;
    labContactPhone?: string | undefined;
    specifications?: string | undefined;
    shadeGuide?: string | undefined;
    toothNumbers?: string[] | undefined;
    expectedReturnDate?: string | undefined;
    estimatedCost?: number | undefined;
    actualCost?: number | undefined;
}, {
    description?: string | undefined;
    notes?: string | undefined;
    labName?: string | undefined;
    labContactEmail?: string | undefined;
    labContactPhone?: string | undefined;
    specifications?: string | undefined;
    shadeGuide?: string | undefined;
    toothNumbers?: string[] | undefined;
    expectedReturnDate?: string | undefined;
    estimatedCost?: number | undefined;
    actualCost?: number | undefined;
}>;
export type UpdateLabCaseDto = z.infer<typeof UpdateLabCaseDtoSchema>;
export declare const UpdateLabCaseStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof LabCaseStatus>;
    courierTrackingNumber: z.ZodOptional<z.ZodString>;
    courierService: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: LabCaseStatus;
    courierTrackingNumber?: string | undefined;
    courierService?: string | undefined;
    rejectionReason?: string | undefined;
}, {
    status: LabCaseStatus;
    courierTrackingNumber?: string | undefined;
    courierService?: string | undefined;
    rejectionReason?: string | undefined;
}>;
export type UpdateLabCaseStatusDto = z.infer<typeof UpdateLabCaseStatusDtoSchema>;
export declare const CreateLabCaseEventDtoSchema: z.ZodObject<{
    eventType: z.ZodString;
    description: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    eventType: string;
    metadata?: Record<string, any> | undefined;
}, {
    description: string;
    eventType: string;
    metadata?: Record<string, any> | undefined;
}>;
export type CreateLabCaseEventDto = z.infer<typeof CreateLabCaseEventDtoSchema>;
export declare const CreateLogisticsTaskDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    type: z.ZodNativeEnum<typeof ClinicalLogisticsTaskType>;
    priority: z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>;
    roomId: z.ZodOptional<z.ZodString>;
    roomName: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodString>;
    procedureId: z.ZodOptional<z.ZodString>;
    assigneeId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    checklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        isCompleted: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        isCompleted: boolean;
    }, {
        description: string;
        isCompleted?: boolean | undefined;
    }>, "many">>;
    consumablesRequired: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventoryItemId: z.ZodString;
        itemName: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        isPrepared: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
    }, {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared?: boolean | undefined;
    }>, "many">>;
    dueAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: ClinicalLogisticsTaskType;
    clinicId: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    description?: string | undefined;
    notes?: string | undefined;
    appointmentId?: string | undefined;
    roomId?: string | undefined;
    roomName?: string | undefined;
    procedureId?: string | undefined;
    assigneeId?: string | undefined;
    checklist?: {
        description: string;
        isCompleted: boolean;
    }[] | undefined;
    consumablesRequired?: {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
    }[] | undefined;
    dueAt?: string | undefined;
}, {
    type: ClinicalLogisticsTaskType;
    clinicId: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    description?: string | undefined;
    notes?: string | undefined;
    appointmentId?: string | undefined;
    roomId?: string | undefined;
    roomName?: string | undefined;
    procedureId?: string | undefined;
    assigneeId?: string | undefined;
    checklist?: {
        description: string;
        isCompleted?: boolean | undefined;
    }[] | undefined;
    consumablesRequired?: {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared?: boolean | undefined;
    }[] | undefined;
    dueAt?: string | undefined;
}>;
export type CreateLogisticsTaskDto = z.infer<typeof CreateLogisticsTaskDtoSchema>;
export declare const UpdateLogisticsTaskDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof ClinicalLogisticsTaskStatus>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    checklist: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        description: z.ZodString;
        isCompleted: z.ZodBoolean;
        completedAt: z.ZodOptional<z.ZodString>;
        completedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        isCompleted: boolean;
        completedAt?: string | undefined;
        completedBy?: string | undefined;
    }, {
        id: string;
        description: string;
        isCompleted: boolean;
        completedAt?: string | undefined;
        completedBy?: string | undefined;
    }>, "many">>;
    consumablesRequired: z.ZodOptional<z.ZodArray<z.ZodObject<{
        inventoryItemId: z.ZodString;
        itemName: z.ZodString;
        quantity: z.ZodNumber;
        unit: z.ZodString;
        isPrepared: z.ZodBoolean;
        preparedAt: z.ZodOptional<z.ZodString>;
        preparedBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
        preparedAt?: string | undefined;
        preparedBy?: string | undefined;
    }, {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
        preparedAt?: string | undefined;
        preparedBy?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: ClinicalLogisticsTaskStatus | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    assigneeId?: string | undefined;
    checklist?: {
        id: string;
        description: string;
        isCompleted: boolean;
        completedAt?: string | undefined;
        completedBy?: string | undefined;
    }[] | undefined;
    consumablesRequired?: {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
        preparedAt?: string | undefined;
        preparedBy?: string | undefined;
    }[] | undefined;
}, {
    status?: ClinicalLogisticsTaskStatus | undefined;
    description?: string | undefined;
    notes?: string | undefined;
    assigneeId?: string | undefined;
    checklist?: {
        id: string;
        description: string;
        isCompleted: boolean;
        completedAt?: string | undefined;
        completedBy?: string | undefined;
    }[] | undefined;
    consumablesRequired?: {
        itemName: string;
        quantity: number;
        inventoryItemId: string;
        unit: string;
        isPrepared: boolean;
        preparedAt?: string | undefined;
        preparedBy?: string | undefined;
    }[] | undefined;
}>;
export type UpdateLogisticsTaskDto = z.infer<typeof UpdateLogisticsTaskDtoSchema>;
export declare const CycleFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof SterilizationCycleStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof SterilizationCycleType>>;
    operatorId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    type?: SterilizationCycleType | undefined;
    status?: SterilizationCycleStatus | undefined;
    clinicId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    operatorId?: string | undefined;
}, {
    type?: SterilizationCycleType | undefined;
    status?: SterilizationCycleStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    operatorId?: string | undefined;
}>;
export type CycleFilterDto = z.infer<typeof CycleFilterDtoSchema>;
export declare const InstrumentFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof InstrumentStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof InstrumentType>>;
    clinicId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    type?: InstrumentType | undefined;
    status?: InstrumentStatus | undefined;
    clinicId?: string | undefined;
}, {
    type?: InstrumentType | undefined;
    status?: InstrumentStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type InstrumentFilterDto = z.infer<typeof InstrumentFilterDtoSchema>;
export declare const LabCaseFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof LabCaseStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof LabCaseType>>;
    patientId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    type?: LabCaseType | undefined;
    status?: LabCaseStatus | undefined;
    clinicId?: string | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
}, {
    type?: LabCaseType | undefined;
    status?: LabCaseStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    patientId?: string | undefined;
    providerId?: string | undefined;
}>;
export type LabCaseFilterDto = z.infer<typeof LabCaseFilterDtoSchema>;
export declare const LogisticsTaskFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof ClinicalLogisticsTaskStatus>>;
    type: z.ZodOptional<z.ZodNativeEnum<typeof ClinicalLogisticsTaskType>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    roomId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    type?: ClinicalLogisticsTaskType | undefined;
    status?: ClinicalLogisticsTaskStatus | undefined;
    clinicId?: string | undefined;
    roomId?: string | undefined;
    assigneeId?: string | undefined;
}, {
    type?: ClinicalLogisticsTaskType | undefined;
    status?: ClinicalLogisticsTaskStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    roomId?: string | undefined;
    assigneeId?: string | undefined;
}>;
export type LogisticsTaskFilterDto = z.infer<typeof LogisticsTaskFilterDtoSchema>;
