"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsTaskFilterDtoSchema = exports.LabCaseFilterDtoSchema = exports.InstrumentFilterDtoSchema = exports.CycleFilterDtoSchema = exports.UpdateLogisticsTaskDtoSchema = exports.CreateLogisticsTaskDtoSchema = exports.CreateLabCaseEventDtoSchema = exports.UpdateLabCaseStatusDtoSchema = exports.UpdateLabCaseDtoSchema = exports.CreateLabCaseDtoSchema = exports.UpdateInstrumentStatusDtoSchema = exports.UpdateInstrumentDtoSchema = exports.CreateInstrumentDtoSchema = exports.AddInstrumentsToCycleDtoSchema = exports.UpdateCycleStatusDtoSchema = exports.CreateCycleDtoSchema = void 0;
const zod_1 = require("zod");
const shared_domain_1 = require("@dentalos/shared-domain");
const common_schemas_1 = require("../common.schemas");
exports.CreateCycleDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    cycleNumber: common_schemas_1.NonEmptyStringSchema.max(50),
    type: zod_1.z.nativeEnum(shared_domain_1.SterilizationCycleType),
    autoclaveId: zod_1.z.string().optional(),
    instrumentIds: zod_1.z.array(common_schemas_1.UUIDSchema),
    temperature: zod_1.z.number().positive().optional(),
    pressure: zod_1.z.number().positive().optional(),
    durationMinutes: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateCycleStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.SterilizationCycleStatus),
    biologicalIndicatorResult: zod_1.z.nativeEnum(shared_domain_1.BiologicalIndicatorResult).optional(),
    failureReason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.AddInstrumentsToCycleDtoSchema = zod_1.z.object({
    instrumentIds: zod_1.z.array(common_schemas_1.UUIDSchema).min(1),
});
exports.CreateInstrumentDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(200),
    type: zod_1.z.nativeEnum(shared_domain_1.InstrumentType),
    serialNumber: zod_1.z.string().max(100).optional(),
    manufacturer: zod_1.z.string().max(200).optional(),
    modelNumber: zod_1.z.string().max(200).optional(),
    inventoryItemId: common_schemas_1.UUIDSchema.optional(),
    inventoryLotId: common_schemas_1.UUIDSchema.optional(),
    purchaseDate: common_schemas_1.ISODateStringSchema.optional(),
    purchaseCost: zod_1.z.number().positive().optional(),
    maxCycles: zod_1.z.number().int().positive().optional(),
    maintenanceNotes: zod_1.z.string().optional(),
});
exports.UpdateInstrumentDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    serialNumber: zod_1.z.string().max(100).optional(),
    manufacturer: zod_1.z.string().max(200).optional(),
    modelNumber: zod_1.z.string().max(200).optional(),
    maxCycles: zod_1.z.number().int().positive().optional(),
    maintenanceNotes: zod_1.z.string().optional(),
});
exports.UpdateInstrumentStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.InstrumentStatus),
    retiredReason: zod_1.z.string().optional(),
});
exports.CreateLabCaseDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    caseNumber: common_schemas_1.NonEmptyStringSchema.max(50),
    type: zod_1.z.nativeEnum(shared_domain_1.LabCaseType),
    patientId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    labId: zod_1.z.string().optional(),
    labName: zod_1.z.string().max(200).optional(),
    labContactEmail: zod_1.z.string().email().optional(),
    labContactPhone: zod_1.z.string().optional(),
    description: common_schemas_1.NonEmptyStringSchema.max(1000),
    specifications: zod_1.z.string().optional(),
    shadeGuide: zod_1.z.string().optional(),
    toothNumbers: zod_1.z.array(zod_1.z.string()).optional(),
    impressionDate: common_schemas_1.ISODateStringSchema.optional(),
    expectedReturnDate: common_schemas_1.ISODateStringSchema.optional(),
    estimatedCost: zod_1.z.number().positive().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateLabCaseDtoSchema = zod_1.z.object({
    labName: zod_1.z.string().max(200).optional(),
    labContactEmail: zod_1.z.string().email().optional(),
    labContactPhone: zod_1.z.string().optional(),
    description: common_schemas_1.NonEmptyStringSchema.max(1000).optional(),
    specifications: zod_1.z.string().optional(),
    shadeGuide: zod_1.z.string().optional(),
    toothNumbers: zod_1.z.array(zod_1.z.string()).optional(),
    expectedReturnDate: common_schemas_1.ISODateStringSchema.optional(),
    estimatedCost: zod_1.z.number().positive().optional(),
    actualCost: zod_1.z.number().positive().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateLabCaseStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.LabCaseStatus),
    courierTrackingNumber: zod_1.z.string().optional(),
    courierService: zod_1.z.string().optional(),
    rejectionReason: zod_1.z.string().optional(),
});
exports.CreateLabCaseEventDtoSchema = zod_1.z.object({
    eventType: common_schemas_1.NonEmptyStringSchema.max(100),
    description: common_schemas_1.NonEmptyStringSchema.max(500),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.CreateLogisticsTaskDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    type: zod_1.z.nativeEnum(shared_domain_1.ClinicalLogisticsTaskType),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    roomId: zod_1.z.string().optional(),
    roomName: zod_1.z.string().max(100).optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    procedureId: common_schemas_1.UUIDSchema.optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    title: common_schemas_1.NonEmptyStringSchema.max(200),
    description: zod_1.z.string().optional(),
    checklist: zod_1.z.array(zod_1.z.object({
        description: common_schemas_1.NonEmptyStringSchema.max(300),
        isCompleted: zod_1.z.boolean().default(false),
    })).optional(),
    consumablesRequired: zod_1.z.array(zod_1.z.object({
        inventoryItemId: common_schemas_1.UUIDSchema,
        itemName: common_schemas_1.NonEmptyStringSchema.max(200),
        quantity: zod_1.z.number().positive(),
        unit: common_schemas_1.NonEmptyStringSchema.max(50),
        isPrepared: zod_1.z.boolean().default(false),
    })).optional(),
    dueAt: common_schemas_1.ISODateStringSchema.optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateLogisticsTaskDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.ClinicalLogisticsTaskStatus).optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    description: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    checklist: zod_1.z.array(zod_1.z.object({
        id: common_schemas_1.UUIDSchema,
        description: common_schemas_1.NonEmptyStringSchema.max(300),
        isCompleted: zod_1.z.boolean(),
        completedAt: common_schemas_1.ISODateStringSchema.optional(),
        completedBy: common_schemas_1.UUIDSchema.optional(),
    })).optional(),
    consumablesRequired: zod_1.z.array(zod_1.z.object({
        inventoryItemId: common_schemas_1.UUIDSchema,
        itemName: common_schemas_1.NonEmptyStringSchema.max(200),
        quantity: zod_1.z.number().positive(),
        unit: common_schemas_1.NonEmptyStringSchema.max(50),
        isPrepared: zod_1.z.boolean(),
        preparedAt: common_schemas_1.ISODateStringSchema.optional(),
        preparedBy: common_schemas_1.UUIDSchema.optional(),
    })).optional(),
});
exports.CycleFilterDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.SterilizationCycleStatus).optional(),
    type: zod_1.z.nativeEnum(shared_domain_1.SterilizationCycleType).optional(),
    operatorId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    startDate: common_schemas_1.ISODateStringSchema.optional(),
    endDate: common_schemas_1.ISODateStringSchema.optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
exports.InstrumentFilterDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.InstrumentStatus).optional(),
    type: zod_1.z.nativeEnum(shared_domain_1.InstrumentType).optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
exports.LabCaseFilterDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.LabCaseStatus).optional(),
    type: zod_1.z.nativeEnum(shared_domain_1.LabCaseType).optional(),
    patientId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
exports.LogisticsTaskFilterDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.ClinicalLogisticsTaskStatus).optional(),
    type: zod_1.z.nativeEnum(shared_domain_1.ClinicalLogisticsTaskType).optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    roomId: zod_1.z.string().optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
//# sourceMappingURL=sterilization.schemas.js.map