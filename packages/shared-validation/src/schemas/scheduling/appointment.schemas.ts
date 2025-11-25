/**
 * Appointment Validation Schemas
 *
 * Zod schemas for validating appointment-related DTOs and domain types.
 * Provides runtime validation with comprehensive error messages.
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
 * Appointment status schema
 */
export const AppointmentStatusSchema = z.enum(
  [
    'SCHEDULED',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'RESCHEDULED',
  ],
  {
    errorMap: () => ({ message: 'Invalid appointment status' }),
  }
);

/**
 * Cancellation type schema
 */
export const CancellationTypeSchema = z.enum(['PATIENT', 'PROVIDER', 'SYSTEM', 'NO_SHOW'], {
  errorMap: () => ({ message: 'Invalid cancellation type' }),
});

/**
 * Appointment priority schema
 */
export const AppointmentPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], {
  errorMap: () => ({ message: 'Invalid appointment priority' }),
});

/**
 * Participant role schema
 */
export const ParticipantRoleSchema = z.enum(
  ['PROVIDER', 'ASSISTANT', 'HYGIENIST', 'SPECIALIST', 'OTHER'],
  {
    errorMap: () => ({ message: 'Invalid participant role' }),
  }
);

/**
 * Booking source schema
 */
export const BookingSourceSchema = z.enum(
  ['ONLINE_PORTAL', 'PHONE', 'WALK_IN', 'ADMIN', 'INTEGRATION', 'OTHER'],
  {
    errorMap: () => ({ message: 'Invalid booking source' }),
  }
);

/**
 * Check-in method schema
 */
export const CheckInMethodSchema = z.enum(['KIOSK', 'FRONT_DESK', 'MOBILE_APP', 'OTHER'], {
  errorMap: () => ({ message: 'Invalid check-in method' }),
});

/**
 * Confirmation method schema
 */
export const ConfirmationMethodSchema = z.enum(
  ['EMAIL', 'PHONE', 'SMS', 'IN_PERSON', 'ONLINE_PORTAL'],
  {
    errorMap: () => ({ message: 'Invalid confirmation method' }),
  }
);

/**
 * Recurrence pattern schema
 */
export const RecurrencePatternSchema = z.enum(
  ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'],
  {
    errorMap: () => ({ message: 'Invalid recurrence pattern' }),
  }
);

// ============================================================================
// Complex Object Schemas
// ============================================================================

/**
 * Appointment participant schema
 */
export const AppointmentParticipantSchema = z.object({
  userId: UUIDSchema,
  role: ParticipantRoleSchema,
  required: z.boolean().default(true),
  displayName: z.string().max(200).optional(),
});

/**
 * Recurrence rule schema
 */
export const RecurrenceRuleSchema = z.object({
  pattern: RecurrencePatternSchema,
  interval: z.number().int().positive().min(1).max(365).default(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  endDate: ISODateStringSchema.optional(),
  occurrences: z.number().int().positive().min(1).max(100).optional(),
});

/**
 * Appointment note schema
 */
export const AppointmentNoteSchema = z.object({
  id: UUIDSchema,
  content: NonEmptyStringSchema.max(2000, 'Note content must be 2000 characters or less'),
  createdBy: UUIDSchema,
  createdAt: ISODateStringSchema,
  isPrivate: z.boolean().default(false),
});

/**
 * Booking metadata schema
 */
export const BookingMetadataSchema = z.object({
  bookingSource: BookingSourceSchema,
  ipAddress: z.string().ip().optional(),
  userAgent: z.string().max(500).optional(),
  referrer: z.string().max(500).optional(),
  bookedBy: UUIDSchema,
  bookedAt: ISODateStringSchema,
  confirmationToken: z.string().max(100).optional(),
  requiresApproval: z.boolean().default(false),
  approvalStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  approvedBy: UUIDSchema.optional(),
  approvedAt: ISODateStringSchema.optional(),
  approvalNotes: z.string().max(500).optional(),
});

/**
 * Resource allocation schema
 */
export const ResourceAllocationSchema = z.object({
  room: z.string().max(50).optional(),
  equipmentIds: z.array(UUIDSchema).optional(),
  specialRequirements: z.string().max(500).optional(),
});

/**
 * Cancellation details schema
 */
export const CancellationDetailsSchema = z.object({
  cancellationType: CancellationTypeSchema,
  reason: z.string().max(500).optional(),
  cancelledBy: UUIDSchema,
  cancelledAt: ISODateStringSchema,
  feeCharged: z.boolean().default(false),
  feeAmount: z.number().nonnegative().optional(),
  feeCurrency: z.string().length(3).optional(),
  withinPolicy: z.boolean().default(true),
  notificationSent: z.boolean().default(false),
});

/**
 * Confirmation details schema
 */
export const ConfirmationDetailsSchema = z.object({
  confirmedAt: ISODateStringSchema,
  confirmedBy: UUIDSchema,
  confirmationMethod: ConfirmationMethodSchema,
  confirmationCode: z.string().max(50).optional(),
  reminderSent: z.boolean().default(false),
  lastReminderAt: ISODateStringSchema.optional(),
});

/**
 * Check-in details schema
 */
export const CheckInDetailsSchema = z.object({
  checkedInAt: ISODateStringSchema,
  checkedInBy: UUIDSchema,
  checkInMethod: CheckInMethodSchema,
  arrivedOnTime: z.boolean().default(true),
  minutesOffset: z.number().int().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Completion details schema
 */
export const CompletionDetailsSchema = z.object({
  completedAt: ISODateStringSchema,
  completedBy: UUIDSchema,
  actualDuration: z.number().int().positive(),
  treatmentCompleted: z.boolean().default(true),
  outcomeNotes: z.string().max(1000).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: ISODateStringSchema.optional(),
});

// ============================================================================
// Full Appointment Schema
// ============================================================================

/**
 * Complete appointment schema
 */
export const AppointmentSchema = z
  .object({
    id: UUIDSchema,
    organizationId: UUIDSchema,
    clinicId: UUIDSchema,
    patientId: UUIDSchema,
    providerId: UUIDSchema,
    title: NonEmptyStringSchema.max(200, 'Title must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    status: AppointmentStatusSchema,
    priority: AppointmentPrioritySchema.default('MEDIUM'),
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    duration: z.number().int().positive().min(5).max(480),
    appointmentType: NonEmptyStringSchema.max(100, 'Appointment type must be 100 characters or less'),
    appointmentTypeCode: z.string().max(50).optional(),
    participants: z.array(AppointmentParticipantSchema).default([]),
    resources: ResourceAllocationSchema.optional(),
    notes: z.array(AppointmentNoteSchema).default([]),
    bookingMetadata: BookingMetadataSchema.optional(),
    recurrenceRule: RecurrenceRuleSchema.optional(),
    parentAppointmentId: UUIDSchema.optional(),
    seriesId: UUIDSchema.optional(),
    confirmation: ConfirmationDetailsSchema.optional(),
    checkIn: CheckInDetailsSchema.optional(),
    cancellation: CancellationDetailsSchema.optional(),
    completion: CompletionDetailsSchema.optional(),
    createdAt: ISODateStringSchema,
    updatedAt: ISODateStringSchema,
    deletedAt: ISODateStringSchema.nullable().optional(),
    createdBy: UUIDSchema,
    updatedBy: UUIDSchema,
    deletedBy: UUIDSchema.nullable().optional(),
    version: z.number().int().nonnegative().default(1),
    metadata: MetadataSchema.optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })
  .refine(
    (data) => {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      return Math.abs(calculatedDuration - data.duration) <= 1;
    },
    {
      message: 'Duration must match the time difference between start and end time',
      path: ['duration'],
    }
  );

// ============================================================================
// DTO Schemas
// ============================================================================

/**
 * Create appointment DTO schema
 */
export const CreateAppointmentDtoSchema = z
  .object({
    organizationId: UUIDSchema,
    clinicId: UUIDSchema,
    patientId: UUIDSchema,
    providerId: UUIDSchema,
    title: NonEmptyStringSchema.max(200),
    description: z.string().max(1000).optional(),
    priority: AppointmentPrioritySchema.default('MEDIUM'),
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    duration: z.number().int().positive().min(5).max(480),
    appointmentType: NonEmptyStringSchema.max(100),
    appointmentTypeCode: z.string().max(50).optional(),
    room: z.string().max(50).optional(),
    participants: z.array(AppointmentParticipantSchema).default([]),
    notes: z.string().max(2000).optional(),
    recurrenceRule: RecurrenceRuleSchema.optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })
  .refine((data) => new Date(data.startTime) > new Date(), {
    message: 'Start time must be in the future',
    path: ['startTime'],
  });

/**
 * Update appointment DTO schema
 */
export const UpdateAppointmentDtoSchema = z
  .object({
    title: NonEmptyStringSchema.max(200).optional(),
    description: z.string().max(1000).optional(),
    priority: AppointmentPrioritySchema.optional(),
    startTime: ISODateStringSchema.optional(),
    endTime: ISODateStringSchema.optional(),
    duration: z.number().int().positive().min(5).max(480).optional(),
    appointmentType: NonEmptyStringSchema.max(100).optional(),
    room: z.string().max(50).optional(),
    participants: z.array(AppointmentParticipantSchema).optional(),
    metadata: MetadataSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: 'Start time must be before end time',
      path: ['endTime'],
    }
  );

/**
 * Appointment query DTO schema
 */
export const AppointmentQueryDtoSchema = z.object({
  organizationId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  patientId: UUIDSchema.optional(),
  providerId: UUIDSchema.optional(),
  status: z.union([AppointmentStatusSchema, z.array(AppointmentStatusSchema)]).optional(),
  priority: z.union([AppointmentPrioritySchema, z.array(AppointmentPrioritySchema)]).optional(),
  appointmentType: z.union([z.string(), z.array(z.string())]).optional(),
  startDateFrom: ISODateStringSchema.optional(),
  startDateTo: ISODateStringSchema.optional(),
  includeCancelled: z.boolean().default(false),
  includeDeleted: z.boolean().default(false),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(20),
  sortBy: z.enum(['startTime', 'createdAt', 'updatedAt', 'status']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Confirm appointment DTO schema
 */
export const ConfirmAppointmentDtoSchema = z.object({
  confirmationMethod: ConfirmationMethodSchema,
  confirmationCode: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Check-in appointment DTO schema
 */
export const CheckInAppointmentDtoSchema = z.object({
  checkInMethod: CheckInMethodSchema,
  arrivedOnTime: z.boolean().default(true),
  minutesOffset: z.number().int().optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Cancel appointment DTO schema
 */
export const CancelAppointmentDtoSchema = z.object({
  cancellationType: CancellationTypeSchema,
  reason: z.string().max(500).optional(),
  cancelEntireSeries: z.boolean().default(false),
});

/**
 * Reschedule appointment DTO schema
 */
export const RescheduleAppointmentDtoSchema = z
  .object({
    newStartTime: ISODateStringSchema,
    newEndTime: ISODateStringSchema,
    newDuration: z.number().int().positive().min(5).max(480),
    newRoom: z.string().max(50).optional(),
    reason: z.string().max(500).optional(),
    rescheduleEntireSeries: z.boolean().default(false),
  })
  .refine((data) => new Date(data.newStartTime) < new Date(data.newEndTime), {
    message: 'New start time must be before new end time',
    path: ['newEndTime'],
  })
  .refine((data) => new Date(data.newStartTime) > new Date(), {
    message: 'New start time must be in the future',
    path: ['newStartTime'],
  });

/**
 * Complete appointment DTO schema
 */
export const CompleteAppointmentDtoSchema = z.object({
  actualDuration: z.number().int().positive(),
  treatmentCompleted: z.boolean().default(true),
  outcomeNotes: z.string().max(1000).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: ISODateStringSchema.optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type AppointmentInput = z.input<typeof AppointmentSchema>;
export type AppointmentOutput = z.output<typeof AppointmentSchema>;
export type CreateAppointmentDtoInput = z.input<typeof CreateAppointmentDtoSchema>;
export type CreateAppointmentDtoOutput = z.output<typeof CreateAppointmentDtoSchema>;
export type UpdateAppointmentDtoInput = z.input<typeof UpdateAppointmentDtoSchema>;
export type UpdateAppointmentDtoOutput = z.output<typeof UpdateAppointmentDtoSchema>;
export type AppointmentQueryDtoInput = z.input<typeof AppointmentQueryDtoSchema>;
export type AppointmentQueryDtoOutput = z.output<typeof AppointmentQueryDtoSchema>;
export type ConfirmAppointmentDtoInput = z.input<typeof ConfirmAppointmentDtoSchema>;
export type ConfirmAppointmentDtoOutput = z.output<typeof ConfirmAppointmentDtoSchema>;
export type CheckInAppointmentDtoInput = z.input<typeof CheckInAppointmentDtoSchema>;
export type CheckInAppointmentDtoOutput = z.output<typeof CheckInAppointmentDtoSchema>;
export type CancelAppointmentDtoInput = z.input<typeof CancelAppointmentDtoSchema>;
export type CancelAppointmentDtoOutput = z.output<typeof CancelAppointmentDtoSchema>;
export type RescheduleAppointmentDtoInput = z.input<typeof RescheduleAppointmentDtoSchema>;
export type RescheduleAppointmentDtoOutput = z.output<typeof RescheduleAppointmentDtoSchema>;
export type CompleteAppointmentDtoInput = z.input<typeof CompleteAppointmentDtoSchema>;
export type CompleteAppointmentDtoOutput = z.output<typeof CompleteAppointmentDtoSchema>;
