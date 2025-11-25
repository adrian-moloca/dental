"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteAppointmentDtoSchema = exports.RescheduleAppointmentDtoSchema = exports.CancelAppointmentDtoSchema = exports.CheckInAppointmentDtoSchema = exports.ConfirmAppointmentDtoSchema = exports.AppointmentQueryDtoSchema = exports.UpdateAppointmentDtoSchema = exports.CreateAppointmentDtoSchema = exports.AppointmentSchema = exports.CompletionDetailsSchema = exports.CheckInDetailsSchema = exports.ConfirmationDetailsSchema = exports.CancellationDetailsSchema = exports.ResourceAllocationSchema = exports.BookingMetadataSchema = exports.AppointmentNoteSchema = exports.RecurrenceRuleSchema = exports.AppointmentParticipantSchema = exports.RecurrencePatternSchema = exports.ConfirmationMethodSchema = exports.CheckInMethodSchema = exports.BookingSourceSchema = exports.ParticipantRoleSchema = exports.AppointmentPrioritySchema = exports.CancellationTypeSchema = exports.AppointmentStatusSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.AppointmentStatusSchema = zod_1.z.enum([
    'SCHEDULED',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED',
], {
    errorMap: () => ({ message: 'Invalid appointment status' }),
});
exports.CancellationTypeSchema = zod_1.z.enum(['PATIENT', 'PROVIDER', 'SYSTEM', 'NO_SHOW'], {
    errorMap: () => ({ message: 'Invalid cancellation type' }),
});
exports.AppointmentPrioritySchema = zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
    errorMap: () => ({ message: 'Invalid appointment priority' }),
});
exports.ParticipantRoleSchema = zod_1.z.enum(['PROVIDER', 'ASSISTANT', 'HYGIENIST', 'SPECIALIST', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid participant role' }),
});
exports.BookingSourceSchema = zod_1.z.enum(['ONLINE_PORTAL', 'PHONE', 'WALK_IN', 'ADMIN', 'INTEGRATION', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid booking source' }),
});
exports.CheckInMethodSchema = zod_1.z.enum(['KIOSK', 'FRONT_DESK', 'MOBILE_APP', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid check-in method' }),
});
exports.ConfirmationMethodSchema = zod_1.z.enum(['EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'ONLINE_PORTAL'], {
    errorMap: () => ({ message: 'Invalid confirmation method' }),
});
exports.RecurrencePatternSchema = zod_1.z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'], {
    errorMap: () => ({ message: 'Invalid recurrence pattern' }),
});
exports.AppointmentParticipantSchema = zod_1.z.object({
    userId: common_schemas_1.UUIDSchema,
    role: exports.ParticipantRoleSchema,
    required: zod_1.z.boolean().default(true),
    displayName: zod_1.z.string().max(200).optional(),
});
exports.RecurrenceRuleSchema = zod_1.z.object({
    pattern: exports.RecurrencePatternSchema,
    interval: zod_1.z.number().int().positive().min(1).max(365).default(1),
    daysOfWeek: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional(),
    endDate: common_schemas_1.ISODateStringSchema.optional(),
    occurrences: zod_1.z.number().int().positive().min(1).max(100).optional(),
});
exports.AppointmentNoteSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    content: common_schemas_1.NonEmptyStringSchema.max(2000, 'Note content must be 2000 characters or less'),
    createdBy: common_schemas_1.UUIDSchema,
    createdAt: common_schemas_1.ISODateStringSchema,
    isPrivate: zod_1.z.boolean().default(false),
});
exports.BookingMetadataSchema = zod_1.z.object({
    bookingSource: exports.BookingSourceSchema,
    ipAddress: zod_1.z.string().ip().optional(),
    userAgent: zod_1.z.string().max(500).optional(),
    referrer: zod_1.z.string().max(500).optional(),
    bookedBy: common_schemas_1.UUIDSchema,
    bookedAt: common_schemas_1.ISODateStringSchema,
    confirmationToken: zod_1.z.string().max(100).optional(),
    requiresApproval: zod_1.z.boolean().default(false),
    approvalStatus: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    approvedBy: common_schemas_1.UUIDSchema.optional(),
    approvedAt: common_schemas_1.ISODateStringSchema.optional(),
    approvalNotes: zod_1.z.string().max(500).optional(),
});
exports.ResourceAllocationSchema = zod_1.z.object({
    room: zod_1.z.string().max(50).optional(),
    equipmentIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    specialRequirements: zod_1.z.string().max(500).optional(),
});
exports.CancellationDetailsSchema = zod_1.z.object({
    cancellationType: exports.CancellationTypeSchema,
    reason: zod_1.z.string().max(500).optional(),
    cancelledBy: common_schemas_1.UUIDSchema,
    cancelledAt: common_schemas_1.ISODateStringSchema,
    feeCharged: zod_1.z.boolean().default(false),
    feeAmount: zod_1.z.number().nonnegative().optional(),
    feeCurrency: zod_1.z.string().length(3).optional(),
    withinPolicy: zod_1.z.boolean().default(true),
    notificationSent: zod_1.z.boolean().default(false),
});
exports.ConfirmationDetailsSchema = zod_1.z.object({
    confirmedAt: common_schemas_1.ISODateStringSchema,
    confirmedBy: common_schemas_1.UUIDSchema,
    confirmationMethod: exports.ConfirmationMethodSchema,
    confirmationCode: zod_1.z.string().max(50).optional(),
    reminderSent: zod_1.z.boolean().default(false),
    lastReminderAt: common_schemas_1.ISODateStringSchema.optional(),
});
exports.CheckInDetailsSchema = zod_1.z.object({
    checkedInAt: common_schemas_1.ISODateStringSchema,
    checkedInBy: common_schemas_1.UUIDSchema,
    checkInMethod: exports.CheckInMethodSchema,
    arrivedOnTime: zod_1.z.boolean().default(true),
    minutesOffset: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.CompletionDetailsSchema = zod_1.z.object({
    completedAt: common_schemas_1.ISODateStringSchema,
    completedBy: common_schemas_1.UUIDSchema,
    actualDuration: zod_1.z.number().int().positive(),
    treatmentCompleted: zod_1.z.boolean().default(true),
    outcomeNotes: zod_1.z.string().max(1000).optional(),
    followUpRequired: zod_1.z.boolean().default(false),
    followUpDate: common_schemas_1.ISODateStringSchema.optional(),
});
exports.AppointmentSchema = zod_1.z
    .object({
    id: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    title: common_schemas_1.NonEmptyStringSchema.max(200, 'Title must be 200 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    status: exports.AppointmentStatusSchema,
    priority: exports.AppointmentPrioritySchema.default('MEDIUM'),
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    duration: zod_1.z.number().int().positive().min(5).max(480),
    appointmentType: common_schemas_1.NonEmptyStringSchema.max(100, 'Appointment type must be 100 characters or less'),
    appointmentTypeCode: zod_1.z.string().max(50).optional(),
    participants: zod_1.z.array(exports.AppointmentParticipantSchema).default([]),
    resources: exports.ResourceAllocationSchema.optional(),
    notes: zod_1.z.array(exports.AppointmentNoteSchema).default([]),
    bookingMetadata: exports.BookingMetadataSchema.optional(),
    recurrenceRule: exports.RecurrenceRuleSchema.optional(),
    parentAppointmentId: common_schemas_1.UUIDSchema.optional(),
    seriesId: common_schemas_1.UUIDSchema.optional(),
    confirmation: exports.ConfirmationDetailsSchema.optional(),
    checkIn: exports.CheckInDetailsSchema.optional(),
    cancellation: exports.CancellationDetailsSchema.optional(),
    completion: exports.CompletionDetailsSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    deletedAt: common_schemas_1.ISODateStringSchema.nullable().optional(),
    createdBy: common_schemas_1.UUIDSchema,
    updatedBy: common_schemas_1.UUIDSchema,
    deletedBy: common_schemas_1.UUIDSchema.nullable().optional(),
    version: zod_1.z.number().int().nonnegative().default(1),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
})
    .refine((data) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    return Math.abs(calculatedDuration - data.duration) <= 1;
}, {
    message: 'Duration must match the time difference between start and end time',
    path: ['duration'],
});
exports.CreateAppointmentDtoSchema = zod_1.z
    .object({
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    title: common_schemas_1.NonEmptyStringSchema.max(200),
    description: zod_1.z.string().max(1000).optional(),
    priority: exports.AppointmentPrioritySchema.default('MEDIUM'),
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    duration: zod_1.z.number().int().positive().min(5).max(480),
    appointmentType: common_schemas_1.NonEmptyStringSchema.max(100),
    appointmentTypeCode: zod_1.z.string().max(50).optional(),
    room: zod_1.z.string().max(50).optional(),
    participants: zod_1.z.array(exports.AppointmentParticipantSchema).default([]),
    notes: zod_1.z.string().max(2000).optional(),
    recurrenceRule: exports.RecurrenceRuleSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
})
    .refine((data) => new Date(data.startTime) > new Date(), {
    message: 'Start time must be in the future',
    path: ['startTime'],
});
exports.UpdateAppointmentDtoSchema = zod_1.z
    .object({
    title: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    priority: exports.AppointmentPrioritySchema.optional(),
    startTime: common_schemas_1.ISODateStringSchema.optional(),
    endTime: common_schemas_1.ISODateStringSchema.optional(),
    duration: zod_1.z.number().int().positive().min(5).max(480).optional(),
    appointmentType: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    room: zod_1.z.string().max(50).optional(),
    participants: zod_1.z.array(exports.AppointmentParticipantSchema).optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => {
    if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
}, {
    message: 'Start time must be before end time',
    path: ['endTime'],
});
exports.AppointmentQueryDtoSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    patientId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    status: zod_1.z.union([exports.AppointmentStatusSchema, zod_1.z.array(exports.AppointmentStatusSchema)]).optional(),
    priority: zod_1.z.union([exports.AppointmentPrioritySchema, zod_1.z.array(exports.AppointmentPrioritySchema)]).optional(),
    appointmentType: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    startDateFrom: common_schemas_1.ISODateStringSchema.optional(),
    startDateTo: common_schemas_1.ISODateStringSchema.optional(),
    includeCancelled: zod_1.z.boolean().default(false),
    includeDeleted: zod_1.z.boolean().default(false),
    page: zod_1.z.number().int().positive().default(1),
    limit: zod_1.z.number().int().positive().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['startTime', 'createdAt', 'updatedAt', 'status']).default('startTime'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
});
exports.ConfirmAppointmentDtoSchema = zod_1.z.object({
    confirmationMethod: exports.ConfirmationMethodSchema,
    confirmationCode: zod_1.z.string().max(50).optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.CheckInAppointmentDtoSchema = zod_1.z.object({
    checkInMethod: exports.CheckInMethodSchema,
    arrivedOnTime: zod_1.z.boolean().default(true),
    minutesOffset: zod_1.z.number().int().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.CancelAppointmentDtoSchema = zod_1.z.object({
    cancellationType: exports.CancellationTypeSchema,
    reason: zod_1.z.string().max(500).optional(),
    cancelEntireSeries: zod_1.z.boolean().default(false),
});
exports.RescheduleAppointmentDtoSchema = zod_1.z
    .object({
    newStartTime: common_schemas_1.ISODateStringSchema,
    newEndTime: common_schemas_1.ISODateStringSchema,
    newDuration: zod_1.z.number().int().positive().min(5).max(480),
    newRoom: zod_1.z.string().max(50).optional(),
    reason: zod_1.z.string().max(500).optional(),
    rescheduleEntireSeries: zod_1.z.boolean().default(false),
})
    .refine((data) => new Date(data.newStartTime) < new Date(data.newEndTime), {
    message: 'New start time must be before new end time',
    path: ['newEndTime'],
})
    .refine((data) => new Date(data.newStartTime) > new Date(), {
    message: 'New start time must be in the future',
    path: ['newStartTime'],
});
exports.CompleteAppointmentDtoSchema = zod_1.z.object({
    actualDuration: zod_1.z.number().int().positive(),
    treatmentCompleted: zod_1.z.boolean().default(true),
    outcomeNotes: zod_1.z.string().max(1000).optional(),
    followUpRequired: zod_1.z.boolean().default(false),
    followUpDate: common_schemas_1.ISODateStringSchema.optional(),
});
//# sourceMappingURL=appointment.schemas.js.map