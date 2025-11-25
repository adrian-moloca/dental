"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProviderScheduleDtoSchema = exports.CreateProviderScheduleDtoSchema = exports.ReviewAbsenceDtoSchema = exports.UpdateProviderAbsenceDtoSchema = exports.CreateProviderAbsenceDtoSchema = exports.CreateScheduleExceptionDtoSchema = exports.UpdateWeeklyHoursDtoSchema = exports.CreateWeeklyHoursDtoSchema = exports.BulkScheduleUpdateSchema = exports.AvailabilitySummarySchema = exports.AvailableSlotSchema = exports.AvailabilitySearchCriteriaSchema = exports.ProviderScheduleSchema = exports.ProviderAbsenceSchema = exports.ScheduleExceptionSchema = exports.WeeklyHoursSchema = exports.TimeSlotSchema = exports.DailyWorkingHoursSchema = exports.WorkPeriodSchema = exports.TimeOfDaySchema = exports.ScheduleExceptionTypeSchema = exports.ScheduleRecurrenceSchema = exports.AbsenceStatusSchema = exports.AbsenceTypeSchema = exports.TimeSlotTypeSchema = exports.DayOfWeekSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.DayOfWeekSchema = zod_1.z.number().int().min(0).max(6);
exports.TimeSlotTypeSchema = zod_1.z.enum(['AVAILABLE', 'BREAK', 'BLOCKED', 'EMERGENCY', 'BUFFER', 'ADMINISTRATIVE'], {
    errorMap: () => ({ message: 'Invalid time slot type' }),
});
exports.AbsenceTypeSchema = zod_1.z.enum([
    'VACATION',
    'SICK_LEAVE',
    'CONFERENCE',
    'PERSONAL',
    'BEREAVEMENT',
    'PARENTAL_LEAVE',
    'SABBATICAL',
    'OTHER',
], {
    errorMap: () => ({ message: 'Invalid absence type' }),
});
exports.AbsenceStatusSchema = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid absence status' }),
});
exports.ScheduleRecurrenceSchema = zod_1.z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'], {
    errorMap: () => ({ message: 'Invalid schedule recurrence' }),
});
exports.ScheduleExceptionTypeSchema = zod_1.z.enum(['OVERRIDE', 'ADDITION', 'CANCELLATION'], {
    errorMap: () => ({ message: 'Invalid schedule exception type' }),
});
exports.TimeOfDaySchema = zod_1.z
    .object({
    hour: zod_1.z.number().int().min(0).max(23),
    minute: zod_1.z.number().int().min(0).max(59),
})
    .refine((data) => {
    return data.hour >= 0 && data.hour <= 23 && data.minute >= 0 && data.minute <= 59;
}, {
    message: 'Invalid time of day',
});
exports.WorkPeriodSchema = zod_1.z
    .object({
    startTime: exports.TimeOfDaySchema,
    endTime: exports.TimeOfDaySchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    room: zod_1.z.string().max(50).optional(),
})
    .refine((data) => {
    const startMinutes = data.startTime.hour * 60 + data.startTime.minute;
    const endMinutes = data.endTime.hour * 60 + data.endTime.minute;
    return startMinutes < endMinutes;
}, {
    message: 'Start time must be before end time',
    path: ['endTime'],
});
exports.DailyWorkingHoursSchema = zod_1.z.object({
    dayOfWeek: exports.DayOfWeekSchema,
    isWorkingDay: zod_1.z.boolean(),
    workPeriods: zod_1.z.array(exports.WorkPeriodSchema).default([]),
    notes: zod_1.z.string().max(500).optional(),
});
exports.TimeSlotSchema = zod_1.z
    .object({
    id: common_schemas_1.UUIDSchema,
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    slotType: exports.TimeSlotTypeSchema,
    isAvailable: zod_1.z.boolean(),
    reason: zod_1.z.string().max(200).optional(),
    duration: zod_1.z.number().int().positive(),
})
    .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
});
exports.WeeklyHoursSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(100),
    description: zod_1.z.string().max(500).optional(),
    dailySchedules: zod_1.z.array(exports.DailyWorkingHoursSchema).length(7),
    isDefault: zod_1.z.boolean().default(false),
    effectiveFrom: common_schemas_1.ISODateStringSchema,
    effectiveTo: common_schemas_1.ISODateStringSchema.nullable().optional(),
    timeZone: zod_1.z.string().max(100),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    version: zod_1.z.number().int().nonnegative().default(1),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.ScheduleExceptionSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    exceptionType: exports.ScheduleExceptionTypeSchema,
    exceptionDate: common_schemas_1.ISODateStringSchema,
    schedule: exports.DailyWorkingHoursSchema.optional(),
    reason: zod_1.z.string().max(500).optional(),
    cancelAppointments: zod_1.z.boolean().default(false),
    createdAt: common_schemas_1.ISODateStringSchema,
    createdBy: common_schemas_1.UUIDSchema,
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.ProviderAbsenceSchema = zod_1.z
    .object({
    id: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    absenceType: exports.AbsenceTypeSchema,
    status: exports.AbsenceStatusSchema,
    startDate: common_schemas_1.ISODateStringSchema,
    endDate: common_schemas_1.ISODateStringSchema,
    isAllDay: zod_1.z.boolean().default(true),
    reason: zod_1.z.string().max(1000).optional(),
    documentIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    requestedBy: common_schemas_1.UUIDSchema,
    requestedAt: common_schemas_1.ISODateStringSchema,
    reviewedBy: common_schemas_1.UUIDSchema.optional(),
    reviewedAt: common_schemas_1.ISODateStringSchema.optional(),
    reviewNotes: zod_1.z.string().max(1000).optional(),
    cancelAppointments: zod_1.z.boolean().default(false),
    affectedAppointmentIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    coveringProviderId: common_schemas_1.UUIDSchema.optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    version: zod_1.z.number().int().nonnegative().default(1),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
});
exports.ProviderScheduleSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    defaultWeeklyHours: exports.WeeklyHoursSchema,
    alternateWeeklyHours: zod_1.z.array(exports.WeeklyHoursSchema).optional(),
    exceptions: zod_1.z.array(exports.ScheduleExceptionSchema).default([]),
    absences: zod_1.z.array(exports.ProviderAbsenceSchema).default([]),
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema),
    defaultAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    minAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    maxAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    bufferTime: zod_1.z.number().int().nonnegative().max(60).default(0),
    maxAppointmentsPerDay: zod_1.z.number().int().positive().optional(),
    acceptsOnlineBooking: zod_1.z.boolean().default(true),
    bookingWindowDays: zod_1.z.number().int().positive().min(1).max(365).optional(),
    cancellationPolicyHours: zod_1.z.number().int().positive().min(1).max(168).optional(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    version: zod_1.z.number().int().nonnegative().default(1),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.AvailabilitySearchCriteriaSchema = zod_1.z.object({
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    startDate: common_schemas_1.ISODateStringSchema,
    endDate: common_schemas_1.ISODateStringSchema,
    duration: zod_1.z.number().int().positive().min(5).max(480),
    daysOfWeek: zod_1.z.array(exports.DayOfWeekSchema).optional(),
    preferredTimeStart: exports.TimeOfDaySchema.optional(),
    preferredTimeEnd: exports.TimeOfDaySchema.optional(),
    appointmentType: zod_1.z.string().max(100).optional(),
    limit: zod_1.z.number().int().positive().min(1).max(100).default(20),
});
exports.AvailableSlotSchema = zod_1.z
    .object({
    providerId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    startTime: common_schemas_1.ISODateStringSchema,
    endTime: common_schemas_1.ISODateStringSchema,
    duration: zod_1.z.number().int().positive(),
    room: zod_1.z.string().max(50).optional(),
    confidenceScore: zod_1.z.number().min(0).max(1),
})
    .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
});
exports.AvailabilitySummarySchema = zod_1.z.object({
    providerId: common_schemas_1.UUIDSchema,
    date: common_schemas_1.ISODateStringSchema,
    totalWorkingHours: zod_1.z.number().nonnegative(),
    totalBookedHours: zod_1.z.number().nonnegative(),
    totalAvailableHours: zod_1.z.number().nonnegative(),
    appointmentCount: zod_1.z.number().int().nonnegative(),
    availableSlotCount: zod_1.z.number().int().nonnegative(),
    utilizationPercentage: zod_1.z.number().min(0).max(100),
});
exports.BulkScheduleUpdateSchema = zod_1.z.object({
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    startDate: common_schemas_1.ISODateStringSchema,
    endDate: common_schemas_1.ISODateStringSchema,
    weeklyHoursTemplate: exports.WeeklyHoursSchema,
    preserveAppointments: zod_1.z.boolean().default(true),
    updatedBy: common_schemas_1.UUIDSchema,
});
exports.CreateWeeklyHoursDtoSchema = zod_1.z.object({
    organizationId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    name: common_schemas_1.NonEmptyStringSchema.max(100),
    description: zod_1.z.string().max(500).optional(),
    dailySchedules: zod_1.z.array(exports.DailyWorkingHoursSchema).length(7),
    isDefault: zod_1.z.boolean().default(false),
    effectiveFrom: common_schemas_1.ISODateStringSchema,
    effectiveTo: common_schemas_1.ISODateStringSchema.nullable().optional(),
    timeZone: zod_1.z.string().max(100),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.UpdateWeeklyHoursDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    dailySchedules: zod_1.z.array(exports.DailyWorkingHoursSchema).length(7).optional(),
    isDefault: zod_1.z.boolean().optional(),
    effectiveFrom: common_schemas_1.ISODateStringSchema.optional(),
    effectiveTo: common_schemas_1.ISODateStringSchema.nullable().optional(),
    timeZone: zod_1.z.string().max(100).optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.CreateScheduleExceptionDtoSchema = zod_1.z.object({
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    exceptionType: exports.ScheduleExceptionTypeSchema,
    exceptionDate: common_schemas_1.ISODateStringSchema,
    schedule: exports.DailyWorkingHoursSchema.optional(),
    reason: zod_1.z.string().max(500).optional(),
    cancelAppointments: zod_1.z.boolean().default(false),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.CreateProviderAbsenceDtoSchema = zod_1.z
    .object({
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    absenceType: exports.AbsenceTypeSchema,
    startDate: common_schemas_1.ISODateStringSchema,
    endDate: common_schemas_1.ISODateStringSchema,
    isAllDay: zod_1.z.boolean().default(true),
    reason: zod_1.z.string().max(1000).optional(),
    documentIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    cancelAppointments: zod_1.z.boolean().default(false),
    coveringProviderId: common_schemas_1.UUIDSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
})
    .refine((data) => new Date(data.startDate) > new Date(), {
    message: 'Start date must be in the future',
    path: ['startDate'],
});
exports.UpdateProviderAbsenceDtoSchema = zod_1.z
    .object({
    startDate: common_schemas_1.ISODateStringSchema.optional(),
    endDate: common_schemas_1.ISODateStringSchema.optional(),
    isAllDay: zod_1.z.boolean().optional(),
    reason: zod_1.z.string().max(1000).optional(),
    documentIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    cancelAppointments: zod_1.z.boolean().optional(),
    coveringProviderId: common_schemas_1.UUIDSchema.optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
});
exports.ReviewAbsenceDtoSchema = zod_1.z.object({
    status: zod_1.z.enum(['APPROVED', 'REJECTED']),
    reviewNotes: zod_1.z.string().max(1000).optional(),
});
exports.CreateProviderScheduleDtoSchema = zod_1.z.object({
    providerId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    defaultWeeklyHours: exports.CreateWeeklyHoursDtoSchema,
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).min(1),
    defaultAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    minAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    maxAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480),
    bufferTime: zod_1.z.number().int().nonnegative().max(60).default(0),
    maxAppointmentsPerDay: zod_1.z.number().int().positive().optional(),
    acceptsOnlineBooking: zod_1.z.boolean().default(true),
    bookingWindowDays: zod_1.z.number().int().positive().min(1).max(365).optional(),
    cancellationPolicyHours: zod_1.z.number().int().positive().min(1).max(168).optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
exports.UpdateProviderScheduleDtoSchema = zod_1.z.object({
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).min(1).optional(),
    defaultAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480).optional(),
    minAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480).optional(),
    maxAppointmentDuration: zod_1.z.number().int().positive().min(5).max(480).optional(),
    bufferTime: zod_1.z.number().int().nonnegative().max(60).optional(),
    maxAppointmentsPerDay: zod_1.z.number().int().positive().optional(),
    acceptsOnlineBooking: zod_1.z.boolean().optional(),
    bookingWindowDays: zod_1.z.number().int().positive().min(1).max(365).optional(),
    cancellationPolicyHours: zod_1.z.number().int().positive().min(1).max(168).optional(),
    isActive: zod_1.z.boolean().optional(),
    metadata: common_schemas_1.MetadataSchema.optional(),
});
//# sourceMappingURL=provider-schedule.schemas.js.map