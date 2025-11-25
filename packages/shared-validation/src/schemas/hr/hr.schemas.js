"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFilterDtoSchema = exports.EscalateTaskDtoSchema = exports.UpdateTaskDtoSchema = exports.CreateTaskDtoSchema = exports.UpdateAbsenceStatusDtoSchema = exports.CreateAbsenceDtoSchema = exports.CreateAvailabilityDtoSchema = exports.AssignShiftDtoSchema = exports.UpdateShiftDtoSchema = exports.CreateShiftDtoSchema = exports.UpdateStaffStatusDtoSchema = exports.UpdateStaffDtoSchema = exports.CreateStaffDtoSchema = void 0;
const zod_1 = require("zod");
const shared_domain_1 = require("@dentalos/shared-domain");
const common_schemas_1 = require("../common.schemas");
exports.CreateStaffDtoSchema = zod_1.z.object({
    userId: common_schemas_1.UUIDSchema,
    firstName: common_schemas_1.NonEmptyStringSchema.max(100),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100),
    email: common_schemas_1.EmailSchema,
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    role: zod_1.z.nativeEnum(shared_domain_1.StaffRole),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    licenseNumber: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).default([]),
    hireDate: common_schemas_1.ISODateStringSchema,
    emergencyContactName: zod_1.z.string().optional(),
    emergencyContactPhone: common_schemas_1.PhoneNumberSchema.optional(),
});
exports.UpdateStaffDtoSchema = zod_1.z.object({
    firstName: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    email: common_schemas_1.EmailSchema.optional(),
    phone: common_schemas_1.PhoneNumberSchema.optional(),
    role: zod_1.z.nativeEnum(shared_domain_1.StaffRole).optional(),
    licenseNumber: zod_1.z.string().optional(),
    specialty: zod_1.z.string().optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    emergencyContactName: zod_1.z.string().optional(),
    emergencyContactPhone: common_schemas_1.PhoneNumberSchema.optional(),
    bio: zod_1.z.string().optional(),
});
exports.UpdateStaffStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.StaffStatus),
    reason: zod_1.z.string().optional(),
});
exports.CreateShiftDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema,
    title: common_schemas_1.NonEmptyStringSchema.max(200),
    description: zod_1.z.string().optional(),
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    assignedStaffIds: zod_1.z.array(common_schemas_1.UUIDSchema).default([]),
    requiredRole: zod_1.z.string().optional(),
    minStaffCount: zod_1.z.number().int().positive().optional(),
    maxStaffCount: zod_1.z.number().int().positive().optional(),
    isRecurring: zod_1.z.boolean().default(false),
    recurrenceRule: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateShiftDtoSchema = exports.CreateShiftDtoSchema.partial();
exports.AssignShiftDtoSchema = zod_1.z.object({
    staffId: common_schemas_1.UUIDSchema,
});
exports.CreateAvailabilityDtoSchema = zod_1.z.object({
    staffId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    isAvailable: zod_1.z.boolean(),
    isRecurring: zod_1.z.boolean().default(false),
    recurrenceRule: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.CreateAbsenceDtoSchema = zod_1.z.object({
    staffId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    type: zod_1.z.nativeEnum(shared_domain_1.AbsenceType),
    startDate: common_schemas_1.ISODateStringSchema,
    endDate: common_schemas_1.ISODateStringSchema,
    reason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    documentUrls: zod_1.z.array(zod_1.z.string().url()).optional(),
});
exports.UpdateAbsenceStatusDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.AbsenceStatus),
    reviewNotes: zod_1.z.string().optional(),
});
exports.CreateTaskDtoSchema = zod_1.z.object({
    clinicId: common_schemas_1.UUIDSchema.optional(),
    title: common_schemas_1.NonEmptyStringSchema.max(200),
    description: zod_1.z.string().optional(),
    category: zod_1.z.nativeEnum(shared_domain_1.TaskCategory),
    priority: zod_1.z.nativeEnum(shared_domain_1.TaskPriority).default(shared_domain_1.TaskPriority.MEDIUM),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    dueDate: common_schemas_1.ISODateStringSchema.optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
    clinicalProcedureId: zod_1.z.string().optional(),
    sterilizationCycleId: zod_1.z.string().optional(),
    inventoryOrderId: zod_1.z.string().optional(),
    patientId: common_schemas_1.UUIDSchema.optional(),
    dependencies: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
exports.UpdateTaskDtoSchema = zod_1.z.object({
    title: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(shared_domain_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(shared_domain_1.TaskPriority).optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    dueDate: common_schemas_1.ISODateStringSchema.optional(),
    estimatedMinutes: zod_1.z.number().int().positive().optional(),
    actualMinutes: zod_1.z.number().int().positive().optional(),
    blockedBy: zod_1.z.string().optional(),
    blockedReason: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.EscalateTaskDtoSchema = zod_1.z.object({
    escalatedTo: common_schemas_1.UUIDSchema,
    escalationReason: common_schemas_1.NonEmptyStringSchema,
});
exports.TaskFilterDtoSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(shared_domain_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(shared_domain_1.TaskPriority).optional(),
    category: zod_1.z.nativeEnum(shared_domain_1.TaskCategory).optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    dueAfter: common_schemas_1.ISODateStringSchema.optional(),
    dueBefore: common_schemas_1.ISODateStringSchema.optional(),
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().min(0).default(0),
});
//# sourceMappingURL=hr.schemas.js.map