// @ts-nocheck
import { z } from 'zod';
import {
  StaffRole,
  StaffStatus,
  AbsenceType,
  AbsenceStatus,
  TaskStatus,
  TaskPriority,
  TaskCategory,
} from '@dentalos/shared-domain';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  EmailSchema,
  PhoneNumberSchema,
} from '../common.schemas';

// Staff Schemas
export const CreateStaffDtoSchema = z.object({
  userId: UUIDSchema,
  firstName: NonEmptyStringSchema.max(100),
  lastName: NonEmptyStringSchema.max(100),
  email: EmailSchema,
  phone: PhoneNumberSchema.optional(),
  role: z.nativeEnum(StaffRole),
  clinicId: UUIDSchema.optional(),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  skills: z.array(z.string()).default([]),
  hireDate: ISODateStringSchema,
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: PhoneNumberSchema.optional(),
});

export type CreateStaffDto = z.infer<typeof CreateStaffDtoSchema>;

export const UpdateStaffDtoSchema = z.object({
  firstName: NonEmptyStringSchema.max(100).optional(),
  lastName: NonEmptyStringSchema.max(100).optional(),
  email: EmailSchema.optional(),
  phone: PhoneNumberSchema.optional(),
  role: z.nativeEnum(StaffRole).optional(),
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  skills: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: PhoneNumberSchema.optional(),
  bio: z.string().optional(),
});

export type UpdateStaffDto = z.infer<typeof UpdateStaffDtoSchema>;

export const UpdateStaffStatusDtoSchema = z.object({
  status: z.nativeEnum(StaffStatus),
  reason: z.string().optional(),
});

export type UpdateStaffStatusDto = z.infer<typeof UpdateStaffStatusDtoSchema>;

// Shift Schemas
export const CreateShiftDtoSchema = z.object({
  clinicId: UUIDSchema,
  title: NonEmptyStringSchema.max(200),
  description: z.string().optional(),
  startTime: ISODateStringSchema,
  endTime: ISODateStringSchema,
  assignedStaffIds: z.array(UUIDSchema).default([]),
  requiredRole: z.string().optional(),
  minStaffCount: z.number().int().positive().optional(),
  maxStaffCount: z.number().int().positive().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateShiftDto = z.infer<typeof CreateShiftDtoSchema>;

export const UpdateShiftDtoSchema = CreateShiftDtoSchema.partial();

export type UpdateShiftDto = z.infer<typeof UpdateShiftDtoSchema>;

export const AssignShiftDtoSchema = z.object({
  staffId: UUIDSchema,
});

export type AssignShiftDto = z.infer<typeof AssignShiftDtoSchema>;

// Availability Schemas
export const CreateAvailabilityDtoSchema = z.object({
  staffId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  startTime: ISODateStringSchema,
  endTime: ISODateStringSchema,
  isAvailable: z.boolean(),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAvailabilityDto = z.infer<typeof CreateAvailabilityDtoSchema>;

// Absence Schemas
export const CreateAbsenceDtoSchema = z.object({
  staffId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  type: z.nativeEnum(AbsenceType),
  startDate: ISODateStringSchema,
  endDate: ISODateStringSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
  documentUrls: z.array(z.string().url()).optional(),
});

export type CreateAbsenceDto = z.infer<typeof CreateAbsenceDtoSchema>;

export const UpdateAbsenceStatusDtoSchema = z.object({
  status: z.nativeEnum(AbsenceStatus),
  reviewNotes: z.string().optional(),
});

export type UpdateAbsenceStatusDto = z.infer<typeof UpdateAbsenceStatusDtoSchema>;

// Task Schemas
export const CreateTaskDtoSchema = z.object({
  clinicId: UUIDSchema.optional(),
  title: NonEmptyStringSchema.max(200),
  description: z.string().optional(),
  category: z.nativeEnum(TaskCategory),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: UUIDSchema.optional(),
  dueDate: ISODateStringSchema.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  clinicalProcedureId: z.string().optional(),
  sterilizationCycleId: z.string().optional(),
  inventoryOrderId: z.string().optional(),
  patientId: UUIDSchema.optional(),
  dependencies: z.array(UUIDSchema).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type CreateTaskDto = z.infer<typeof CreateTaskDtoSchema>;

export const UpdateTaskDtoSchema = z.object({
  title: NonEmptyStringSchema.max(200).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: UUIDSchema.optional(),
  dueDate: ISODateStringSchema.optional(),
  estimatedMinutes: z.number().int().positive().optional(),
  actualMinutes: z.number().int().positive().optional(),
  blockedBy: z.string().optional(),
  blockedReason: z.string().optional(),
  notes: z.string().optional(),
});

export type UpdateTaskDto = z.infer<typeof UpdateTaskDtoSchema>;

export const EscalateTaskDtoSchema = z.object({
  escalatedTo: UUIDSchema,
  escalationReason: NonEmptyStringSchema,
});

export type EscalateTaskDto = z.infer<typeof EscalateTaskDtoSchema>;

// Query Schemas
export const TaskFilterDtoSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  category: z.nativeEnum(TaskCategory).optional(),
  assigneeId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  dueAfter: ISODateStringSchema.optional(),
  dueBefore: ISODateStringSchema.optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export type TaskFilterDto = z.infer<typeof TaskFilterDtoSchema>;
// @ts-nocheck
