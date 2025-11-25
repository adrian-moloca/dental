// @ts-nocheck
import { z } from 'zod';
import {
  SterilizationCycleStatus,
  SterilizationCycleType,
  BiologicalIndicatorResult,
  InstrumentStatus,
  InstrumentType,
  LabCaseStatus,
  LabCaseType,
  ClinicalLogisticsTaskType,
  ClinicalLogisticsTaskStatus,
} from '@dentalos/shared-domain';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
} from '../common.schemas';

// ============================================================================
// Sterilization Cycle Schemas
// ============================================================================

export const CreateCycleDtoSchema = z.object({
  clinicId: UUIDSchema,
  cycleNumber: NonEmptyStringSchema.max(50),
  type: z.nativeEnum(SterilizationCycleType),
  autoclaveId: z.string().optional(),
  instrumentIds: z.array(UUIDSchema),
  temperature: z.number().positive().optional(),
  pressure: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export type CreateCycleDto = z.infer<typeof CreateCycleDtoSchema>;

export const UpdateCycleStatusDtoSchema = z.object({
  status: z.nativeEnum(SterilizationCycleStatus),
  biologicalIndicatorResult: z.nativeEnum(BiologicalIndicatorResult).optional(),
  failureReason: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateCycleStatusDto = z.infer<typeof UpdateCycleStatusDtoSchema>;

export const AddInstrumentsToCycleDtoSchema = z.object({
  instrumentIds: z.array(UUIDSchema).min(1),
});

export type AddInstrumentsToCycleDto = z.infer<typeof AddInstrumentsToCycleDtoSchema>;

// ============================================================================
// Instrument Schemas
// ============================================================================

export const CreateInstrumentDtoSchema = z.object({
  clinicId: UUIDSchema,
  name: NonEmptyStringSchema.max(200),
  type: z.nativeEnum(InstrumentType),
  serialNumber: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  modelNumber: z.string().max(200).optional(),
  inventoryItemId: UUIDSchema.optional(),
  inventoryLotId: UUIDSchema.optional(),
  purchaseDate: ISODateStringSchema.optional(),
  purchaseCost: z.number().positive().optional(),
  maxCycles: z.number().int().positive().optional(),
  maintenanceNotes: z.string().optional(),
});

export type CreateInstrumentDto = z.infer<typeof CreateInstrumentDtoSchema>;

export const UpdateInstrumentDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200).optional(),
  serialNumber: z.string().max(100).optional(),
  manufacturer: z.string().max(200).optional(),
  modelNumber: z.string().max(200).optional(),
  maxCycles: z.number().int().positive().optional(),
  maintenanceNotes: z.string().optional(),
});

export type UpdateInstrumentDto = z.infer<typeof UpdateInstrumentDtoSchema>;

export const UpdateInstrumentStatusDtoSchema = z.object({
  status: z.nativeEnum(InstrumentStatus),
  retiredReason: z.string().optional(),
});

export type UpdateInstrumentStatusDto = z.infer<typeof UpdateInstrumentStatusDtoSchema>;

// ============================================================================
// Lab Case Schemas
// ============================================================================

export const CreateLabCaseDtoSchema = z.object({
  clinicId: UUIDSchema,
  caseNumber: NonEmptyStringSchema.max(50),
  type: z.nativeEnum(LabCaseType),
  patientId: UUIDSchema,
  providerId: UUIDSchema,
  treatmentPlanId: UUIDSchema.optional(),
  appointmentId: UUIDSchema.optional(),
  labId: z.string().optional(),
  labName: z.string().max(200).optional(),
  labContactEmail: z.string().email().optional(),
  labContactPhone: z.string().optional(),
  description: NonEmptyStringSchema.max(1000),
  specifications: z.string().optional(),
  shadeGuide: z.string().optional(),
  toothNumbers: z.array(z.string()).optional(),
  impressionDate: ISODateStringSchema.optional(),
  expectedReturnDate: ISODateStringSchema.optional(),
  estimatedCost: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateLabCaseDto = z.infer<typeof CreateLabCaseDtoSchema>;

export const UpdateLabCaseDtoSchema = z.object({
  labName: z.string().max(200).optional(),
  labContactEmail: z.string().email().optional(),
  labContactPhone: z.string().optional(),
  description: NonEmptyStringSchema.max(1000).optional(),
  specifications: z.string().optional(),
  shadeGuide: z.string().optional(),
  toothNumbers: z.array(z.string()).optional(),
  expectedReturnDate: ISODateStringSchema.optional(),
  estimatedCost: z.number().positive().optional(),
  actualCost: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type UpdateLabCaseDto = z.infer<typeof UpdateLabCaseDtoSchema>;

export const UpdateLabCaseStatusDtoSchema = z.object({
  status: z.nativeEnum(LabCaseStatus),
  courierTrackingNumber: z.string().optional(),
  courierService: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export type UpdateLabCaseStatusDto = z.infer<typeof UpdateLabCaseStatusDtoSchema>;

export const CreateLabCaseEventDtoSchema = z.object({
  eventType: NonEmptyStringSchema.max(100),
  description: NonEmptyStringSchema.max(500),
  metadata: z.record(z.any()).optional(),
});

export type CreateLabCaseEventDto = z.infer<typeof CreateLabCaseEventDtoSchema>;

// ============================================================================
// Clinical Logistics Schemas
// ============================================================================

export const CreateLogisticsTaskDtoSchema = z.object({
  clinicId: UUIDSchema,
  type: z.nativeEnum(ClinicalLogisticsTaskType),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  roomId: z.string().optional(),
  roomName: z.string().max(100).optional(),
  appointmentId: UUIDSchema.optional(),
  procedureId: UUIDSchema.optional(),
  assigneeId: UUIDSchema.optional(),
  title: NonEmptyStringSchema.max(200),
  description: z.string().optional(),
  checklist: z.array(z.object({
    description: NonEmptyStringSchema.max(300),
    isCompleted: z.boolean().default(false),
  })).optional(),
  consumablesRequired: z.array(z.object({
    inventoryItemId: UUIDSchema,
    itemName: NonEmptyStringSchema.max(200),
    quantity: z.number().positive(),
    unit: NonEmptyStringSchema.max(50),
    isPrepared: z.boolean().default(false),
  })).optional(),
  dueAt: ISODateStringSchema.optional(),
  notes: z.string().optional(),
});

export type CreateLogisticsTaskDto = z.infer<typeof CreateLogisticsTaskDtoSchema>;

export const UpdateLogisticsTaskDtoSchema = z.object({
  status: z.nativeEnum(ClinicalLogisticsTaskStatus).optional(),
  assigneeId: UUIDSchema.optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  checklist: z.array(z.object({
    id: UUIDSchema,
    description: NonEmptyStringSchema.max(300),
    isCompleted: z.boolean(),
    completedAt: ISODateStringSchema.optional(),
    completedBy: UUIDSchema.optional(),
  })).optional(),
  consumablesRequired: z.array(z.object({
    inventoryItemId: UUIDSchema,
    itemName: NonEmptyStringSchema.max(200),
    quantity: z.number().positive(),
    unit: NonEmptyStringSchema.max(50),
    isPrepared: z.boolean(),
    preparedAt: ISODateStringSchema.optional(),
    preparedBy: UUIDSchema.optional(),
  })).optional(),
});

export type UpdateLogisticsTaskDto = z.infer<typeof UpdateLogisticsTaskDtoSchema>;

// ============================================================================
// Filter/Query Schemas
// ============================================================================

export const CycleFilterDtoSchema = z.object({
  status: z.nativeEnum(SterilizationCycleStatus).optional(),
  type: z.nativeEnum(SterilizationCycleType).optional(),
  operatorId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  startDate: ISODateStringSchema.optional(),
  endDate: ISODateStringSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type CycleFilterDto = z.infer<typeof CycleFilterDtoSchema>;

export const InstrumentFilterDtoSchema = z.object({
  status: z.nativeEnum(InstrumentStatus).optional(),
  type: z.nativeEnum(InstrumentType).optional(),
  clinicId: UUIDSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type InstrumentFilterDto = z.infer<typeof InstrumentFilterDtoSchema>;

export const LabCaseFilterDtoSchema = z.object({
  status: z.nativeEnum(LabCaseStatus).optional(),
  type: z.nativeEnum(LabCaseType).optional(),
  patientId: UUIDSchema.optional(),
  providerId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type LabCaseFilterDto = z.infer<typeof LabCaseFilterDtoSchema>;

export const LogisticsTaskFilterDtoSchema = z.object({
  status: z.nativeEnum(ClinicalLogisticsTaskStatus).optional(),
  type: z.nativeEnum(ClinicalLogisticsTaskType).optional(),
  assigneeId: UUIDSchema.optional(),
  roomId: z.string().optional(),
  clinicId: UUIDSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type LogisticsTaskFilterDto = z.infer<typeof LogisticsTaskFilterDtoSchema>;
// @ts-nocheck
