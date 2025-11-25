/**
 * Provider Schedule Validation Schemas
 *
 * Zod schemas for validating provider schedule-related DTOs and domain types.
 * Provides runtime validation for schedules, absences, and availability.
 *
 * @module shared-validation/schemas/scheduling
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  MetadataSchema,
} from '../common.schemas';

// ============================================================================
// Enums
// ============================================================================

/**
 * Day of week schema
 */
export const DayOfWeekSchema = z.number().int().min(0).max(6);

/**
 * Time slot type schema
 */
export const TimeSlotTypeSchema = z.enum(
  ['AVAILABLE', 'BREAK', 'BLOCKED', 'EMERGENCY', 'BUFFER', 'ADMINISTRATIVE'],
  {
    errorMap: () => ({ message: 'Invalid time slot type' }),
  }
);

/**
 * Absence type schema
 */
export const AbsenceTypeSchema = z.enum(
  [
    'VACATION',
    'SICK_LEAVE',
    'CONFERENCE',
    'PERSONAL',
    'BEREAVEMENT',
    'PARENTAL_LEAVE',
    'SABBATICAL',
    'OTHER',
  ],
  {
    errorMap: () => ({ message: 'Invalid absence type' }),
  }
);

/**
 * Absence status schema
 */
export const AbsenceStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], {
  errorMap: () => ({ message: 'Invalid absence status' }),
});

/**
 * Schedule recurrence schema
 */
export const ScheduleRecurrenceSchema = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'], {
  errorMap: () => ({ message: 'Invalid schedule recurrence' }),
});

/**
 * Schedule exception type schema
 */
export const ScheduleExceptionTypeSchema = z.enum(['OVERRIDE', 'ADDITION', 'CANCELLATION'], {
  errorMap: () => ({ message: 'Invalid schedule exception type' }),
});

// ============================================================================
// Complex Object Schemas
// ============================================================================

/**
 * Time of day schema
 */
export const TimeOfDaySchema = z
  .object({
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
  })
  .refine(
    (data) => {
      // Ensure valid time
      return data.hour >= 0 && data.hour <= 23 && data.minute >= 0 && data.minute <= 59;
    },
    {
      message: 'Invalid time of day',
    }
  );

/**
 * Work period schema
 */
export const WorkPeriodSchema = z
  .object({
    startTime: TimeOfDaySchema,
    endTime: TimeOfDaySchema,
    clinicId: UUIDSchema.optional(),
    room: z.string().max(50).optional(),
  })
  .refine(
    (data) => {
      const startMinutes = data.startTime.hour * 60 + data.startTime.minute;
      const endMinutes = data.endTime.hour * 60 + data.endTime.minute;
      return startMinutes < endMinutes;
    },
    {
      message: 'Start time must be before end time',
      path: ['endTime'],
    }
  );

/**
 * Daily working hours schema
 */
export const DailyWorkingHoursSchema = z.object({
  dayOfWeek: DayOfWeekSchema,
  isWorkingDay: z.boolean(),
  workPeriods: z.array(WorkPeriodSchema).default([]),
  notes: z.string().max(500).optional(),
});

/**
 * Time slot schema
 */
export const TimeSlotSchema = z
  .object({
    id: UUIDSchema,
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    slotType: TimeSlotTypeSchema,
    isAvailable: z.boolean(),
    reason: z.string().max(200).optional(),
    duration: z.number().int().positive(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  });

/**
 * Weekly hours schema
 */
export const WeeklyHoursSchema = z.object({
  id: UUIDSchema,
  organizationId: UUIDSchema,
  providerId: UUIDSchema,
  name: NonEmptyStringSchema.max(100),
  description: z.string().max(500).optional(),
  dailySchedules: z.array(DailyWorkingHoursSchema).length(7),
  isDefault: z.boolean().default(false),
  effectiveFrom: ISODateStringSchema,
  effectiveTo: ISODateStringSchema.nullable().optional(),
  timeZone: z.string().max(100),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  version: z.number().int().nonnegative().default(1),
  metadata: MetadataSchema.optional(),
});

/**
 * Schedule exception schema
 */
export const ScheduleExceptionSchema = z.object({
  id: UUIDSchema,
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  exceptionType: ScheduleExceptionTypeSchema,
  exceptionDate: ISODateStringSchema,
  schedule: DailyWorkingHoursSchema.optional(),
  reason: z.string().max(500).optional(),
  cancelAppointments: z.boolean().default(false),
  createdAt: ISODateStringSchema,
  createdBy: UUIDSchema,
  metadata: MetadataSchema.optional(),
});

/**
 * Provider absence schema
 */
export const ProviderAbsenceSchema = z
  .object({
    id: UUIDSchema,
    providerId: UUIDSchema,
    organizationId: UUIDSchema,
    absenceType: AbsenceTypeSchema,
    status: AbsenceStatusSchema,
    startDate: ISODateStringSchema,
    endDate: ISODateStringSchema,
    isAllDay: z.boolean().default(true),
    reason: z.string().max(1000).optional(),
    documentIds: z.array(UUIDSchema).optional(),
    requestedBy: UUIDSchema,
    requestedAt: ISODateStringSchema,
    reviewedBy: UUIDSchema.optional(),
    reviewedAt: ISODateStringSchema.optional(),
    reviewNotes: z.string().max(1000).optional(),
    cancelAppointments: z.boolean().default(false),
    affectedAppointmentIds: z.array(UUIDSchema).optional(),
    coveringProviderId: UUIDSchema.optional(),
    createdAt: ISODateStringSchema,
    updatedAt: ISODateStringSchema,
    version: z.number().int().nonnegative().default(1),
    metadata: MetadataSchema.optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  });

/**
 * Provider schedule schema
 */
export const ProviderScheduleSchema = z.object({
  id: UUIDSchema,
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  defaultWeeklyHours: WeeklyHoursSchema,
  alternateWeeklyHours: z.array(WeeklyHoursSchema).optional(),
  exceptions: z.array(ScheduleExceptionSchema).default([]),
  absences: z.array(ProviderAbsenceSchema).default([]),
  clinicIds: z.array(UUIDSchema),
  defaultAppointmentDuration: z.number().int().positive().min(5).max(480),
  minAppointmentDuration: z.number().int().positive().min(5).max(480),
  maxAppointmentDuration: z.number().int().positive().min(5).max(480),
  bufferTime: z.number().int().nonnegative().max(60).default(0),
  maxAppointmentsPerDay: z.number().int().positive().optional(),
  acceptsOnlineBooking: z.boolean().default(true),
  bookingWindowDays: z.number().int().positive().min(1).max(365).optional(),
  cancellationPolicyHours: z.number().int().positive().min(1).max(168).optional(),
  isActive: z.boolean().default(true),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  version: z.number().int().nonnegative().default(1),
  metadata: MetadataSchema.optional(),
});

/**
 * Availability search criteria schema
 */
export const AvailabilitySearchCriteriaSchema = z.object({
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  startDate: ISODateStringSchema,
  endDate: ISODateStringSchema,
  duration: z.number().int().positive().min(5).max(480),
  daysOfWeek: z.array(DayOfWeekSchema).optional(),
  preferredTimeStart: TimeOfDaySchema.optional(),
  preferredTimeEnd: TimeOfDaySchema.optional(),
  appointmentType: z.string().max(100).optional(),
  limit: z.number().int().positive().min(1).max(100).default(20),
});

/**
 * Available slot schema
 */
export const AvailableSlotSchema = z
  .object({
    providerId: UUIDSchema,
    clinicId: UUIDSchema,
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    duration: z.number().int().positive(),
    room: z.string().max(50).optional(),
    confidenceScore: z.number().min(0).max(1),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  });

/**
 * Availability summary schema
 */
export const AvailabilitySummarySchema = z.object({
  providerId: UUIDSchema,
  date: ISODateStringSchema,
  totalWorkingHours: z.number().nonnegative(),
  totalBookedHours: z.number().nonnegative(),
  totalAvailableHours: z.number().nonnegative(),
  appointmentCount: z.number().int().nonnegative(),
  availableSlotCount: z.number().int().nonnegative(),
  utilizationPercentage: z.number().min(0).max(100),
});

/**
 * Bulk schedule update schema
 */
export const BulkScheduleUpdateSchema = z.object({
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  startDate: ISODateStringSchema,
  endDate: ISODateStringSchema,
  weeklyHoursTemplate: WeeklyHoursSchema,
  preserveAppointments: z.boolean().default(true),
  updatedBy: UUIDSchema,
});

// ============================================================================
// DTO Schemas
// ============================================================================

/**
 * Create weekly hours DTO schema
 */
export const CreateWeeklyHoursDtoSchema = z.object({
  organizationId: UUIDSchema,
  providerId: UUIDSchema,
  name: NonEmptyStringSchema.max(100),
  description: z.string().max(500).optional(),
  dailySchedules: z.array(DailyWorkingHoursSchema).length(7),
  isDefault: z.boolean().default(false),
  effectiveFrom: ISODateStringSchema,
  effectiveTo: ISODateStringSchema.nullable().optional(),
  timeZone: z.string().max(100),
  metadata: MetadataSchema.optional(),
});

/**
 * Update weekly hours DTO schema
 */
export const UpdateWeeklyHoursDtoSchema = z.object({
  name: NonEmptyStringSchema.max(100).optional(),
  description: z.string().max(500).optional(),
  dailySchedules: z.array(DailyWorkingHoursSchema).length(7).optional(),
  isDefault: z.boolean().optional(),
  effectiveFrom: ISODateStringSchema.optional(),
  effectiveTo: ISODateStringSchema.nullable().optional(),
  timeZone: z.string().max(100).optional(),
  metadata: MetadataSchema.optional(),
});

/**
 * Create schedule exception DTO schema
 */
export const CreateScheduleExceptionDtoSchema = z.object({
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  exceptionType: ScheduleExceptionTypeSchema,
  exceptionDate: ISODateStringSchema,
  schedule: DailyWorkingHoursSchema.optional(),
  reason: z.string().max(500).optional(),
  cancelAppointments: z.boolean().default(false),
  metadata: MetadataSchema.optional(),
});

/**
 * Create provider absence DTO schema
 */
export const CreateProviderAbsenceDtoSchema = z
  .object({
    providerId: UUIDSchema,
    organizationId: UUIDSchema,
    absenceType: AbsenceTypeSchema,
    startDate: ISODateStringSchema,
    endDate: ISODateStringSchema,
    isAllDay: z.boolean().default(true),
    reason: z.string().max(1000).optional(),
    documentIds: z.array(UUIDSchema).optional(),
    cancelAppointments: z.boolean().default(false),
    coveringProviderId: UUIDSchema.optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
  })
  .refine((data) => new Date(data.startDate) > new Date(), {
    message: 'Start date must be in the future',
    path: ['startDate'],
  });

/**
 * Update provider absence DTO schema
 */
export const UpdateProviderAbsenceDtoSchema = z
  .object({
    startDate: ISODateStringSchema.optional(),
    endDate: ISODateStringSchema.optional(),
    isAllDay: z.boolean().optional(),
    reason: z.string().max(1000).optional(),
    documentIds: z.array(UUIDSchema).optional(),
    cancelAppointments: z.boolean().optional(),
    coveringProviderId: UUIDSchema.optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

/**
 * Approve/reject absence DTO schema
 */
export const ReviewAbsenceDtoSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(1000).optional(),
});

/**
 * Create provider schedule DTO schema
 */
export const CreateProviderScheduleDtoSchema = z.object({
  providerId: UUIDSchema,
  organizationId: UUIDSchema,
  defaultWeeklyHours: CreateWeeklyHoursDtoSchema,
  clinicIds: z.array(UUIDSchema).min(1),
  defaultAppointmentDuration: z.number().int().positive().min(5).max(480),
  minAppointmentDuration: z.number().int().positive().min(5).max(480),
  maxAppointmentDuration: z.number().int().positive().min(5).max(480),
  bufferTime: z.number().int().nonnegative().max(60).default(0),
  maxAppointmentsPerDay: z.number().int().positive().optional(),
  acceptsOnlineBooking: z.boolean().default(true),
  bookingWindowDays: z.number().int().positive().min(1).max(365).optional(),
  cancellationPolicyHours: z.number().int().positive().min(1).max(168).optional(),
  metadata: MetadataSchema.optional(),
});

/**
 * Update provider schedule DTO schema
 */
export const UpdateProviderScheduleDtoSchema = z.object({
  clinicIds: z.array(UUIDSchema).min(1).optional(),
  defaultAppointmentDuration: z.number().int().positive().min(5).max(480).optional(),
  minAppointmentDuration: z.number().int().positive().min(5).max(480).optional(),
  maxAppointmentDuration: z.number().int().positive().min(5).max(480).optional(),
  bufferTime: z.number().int().nonnegative().max(60).optional(),
  maxAppointmentsPerDay: z.number().int().positive().optional(),
  acceptsOnlineBooking: z.boolean().optional(),
  bookingWindowDays: z.number().int().positive().min(1).max(365).optional(),
  cancellationPolicyHours: z.number().int().positive().min(1).max(168).optional(),
  isActive: z.boolean().optional(),
  metadata: MetadataSchema.optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type TimeOfDayInput = z.input<typeof TimeOfDaySchema>;
export type TimeOfDayOutput = z.output<typeof TimeOfDaySchema>;
export type WorkPeriodInput = z.input<typeof WorkPeriodSchema>;
export type WorkPeriodOutput = z.output<typeof WorkPeriodSchema>;
export type DailyWorkingHoursInput = z.input<typeof DailyWorkingHoursSchema>;
export type DailyWorkingHoursOutput = z.output<typeof DailyWorkingHoursSchema>;
export type TimeSlotInput = z.input<typeof TimeSlotSchema>;
export type TimeSlotOutput = z.output<typeof TimeSlotSchema>;
export type WeeklyHoursInput = z.input<typeof WeeklyHoursSchema>;
export type WeeklyHoursOutput = z.output<typeof WeeklyHoursSchema>;
export type ScheduleExceptionInput = z.input<typeof ScheduleExceptionSchema>;
export type ScheduleExceptionOutput = z.output<typeof ScheduleExceptionSchema>;
export type ProviderAbsenceInput = z.input<typeof ProviderAbsenceSchema>;
export type ProviderAbsenceOutput = z.output<typeof ProviderAbsenceSchema>;
export type ProviderScheduleInput = z.input<typeof ProviderScheduleSchema>;
export type ProviderScheduleOutput = z.output<typeof ProviderScheduleSchema>;
export type AvailabilitySearchCriteriaInput = z.input<typeof AvailabilitySearchCriteriaSchema>;
export type AvailabilitySearchCriteriaOutput = z.output<typeof AvailabilitySearchCriteriaSchema>;
export type AvailableSlotInput = z.input<typeof AvailableSlotSchema>;
export type AvailableSlotOutput = z.output<typeof AvailableSlotSchema>;
export type CreateWeeklyHoursDtoInput = z.input<typeof CreateWeeklyHoursDtoSchema>;
export type CreateWeeklyHoursDtoOutput = z.output<typeof CreateWeeklyHoursDtoSchema>;
export type UpdateWeeklyHoursDtoInput = z.input<typeof UpdateWeeklyHoursDtoSchema>;
export type UpdateWeeklyHoursDtoOutput = z.output<typeof UpdateWeeklyHoursDtoSchema>;
export type CreateScheduleExceptionDtoInput = z.input<typeof CreateScheduleExceptionDtoSchema>;
export type CreateScheduleExceptionDtoOutput = z.output<typeof CreateScheduleExceptionDtoSchema>;
export type CreateProviderAbsenceDtoInput = z.input<typeof CreateProviderAbsenceDtoSchema>;
export type CreateProviderAbsenceDtoOutput = z.output<typeof CreateProviderAbsenceDtoSchema>;
export type UpdateProviderAbsenceDtoInput = z.input<typeof UpdateProviderAbsenceDtoSchema>;
export type UpdateProviderAbsenceDtoOutput = z.output<typeof UpdateProviderAbsenceDtoSchema>;
export type ReviewAbsenceDtoInput = z.input<typeof ReviewAbsenceDtoSchema>;
export type ReviewAbsenceDtoOutput = z.output<typeof ReviewAbsenceDtoSchema>;
export type CreateProviderScheduleDtoInput = z.input<typeof CreateProviderScheduleDtoSchema>;
export type CreateProviderScheduleDtoOutput = z.output<typeof CreateProviderScheduleDtoSchema>;
export type UpdateProviderScheduleDtoInput = z.input<typeof UpdateProviderScheduleDtoSchema>;
export type UpdateProviderScheduleDtoOutput = z.output<typeof UpdateProviderScheduleDtoSchema>;
