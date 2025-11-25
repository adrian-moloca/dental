/**
 * Appointment validation schemas
 * @module shared-validation/schemas/appointment
 */

import { z } from 'zod';
import { Priority } from '@dentalos/shared-types';
import {
  UUIDSchema,
  ISODateStringSchema,
  AppointmentStatusSchema,
  RecurrencePatternSchema,
  DayOfWeekSchema,
  NonEmptyStringSchema,
  PrioritySchema,
} from './common.schemas';

// ============================================================================
// Time Slot Schema
// ============================================================================

/**
 * Time slot schema with validation
 * Ensures startTime is before endTime
 */
export const TimeSlotSchema = z
  .object({
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
  })
  .refine((data): boolean => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  });

// ============================================================================
// Recurrence Rule Schema
// ============================================================================

/**
 * Recurrence rule schema for recurring appointments
 */
export const RecurrenceRuleSchema = z.object({
  pattern: RecurrencePatternSchema,
  interval: z.number().int().positive().default(1),
  daysOfWeek: z.array(DayOfWeekSchema).optional(),
  endDate: ISODateStringSchema.optional(),
  occurrences: z.number().int().positive().optional(),
});

// ============================================================================
// Appointment Participant Schema
// ============================================================================

/**
 * Appointment participant schema
 */
export const AppointmentParticipantSchema = z.object({
  userId: UUIDSchema,
  role: z.enum(['provider', 'assistant', 'hygienist'], {
    errorMap: (): { message: string } => ({ message: 'Invalid participant role' }),
  }),
  required: z.boolean().default(true),
});

// ============================================================================
// Appointment Notes Schema
// ============================================================================

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

// ============================================================================
// Appointment Schema
// ============================================================================

/**
 * Complete appointment entity schema
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
    priority: PrioritySchema.default(() => Priority.MEDIUM),
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    duration: z.number().int().positive(), // minutes
    appointmentType: NonEmptyStringSchema.max(100, 'Appointment type must be 100 characters or less'),
    room: z.string().max(50, 'Room must be 50 characters or less').optional(),
    participants: z.array(AppointmentParticipantSchema).default([]),
    notes: z.array(AppointmentNoteSchema).default([]),
    recurrenceRule: RecurrenceRuleSchema.optional(),
    parentAppointmentId: UUIDSchema.optional(), // For recurring appointments
    cancellationReason: z.string().max(500, 'Cancellation reason must be 500 characters or less').optional(),
    cancelledAt: ISODateStringSchema.nullable().optional(),
    cancelledBy: UUIDSchema.nullable().optional(),
    confirmedAt: ISODateStringSchema.nullable().optional(),
    confirmedBy: UUIDSchema.nullable().optional(),
    checkedInAt: ISODateStringSchema.nullable().optional(),
    completedAt: ISODateStringSchema.nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
    createdAt: ISODateStringSchema,
    updatedAt: ISODateStringSchema,
    deletedAt: ISODateStringSchema.nullable().optional(),
    createdBy: UUIDSchema.optional(),
    updatedBy: UUIDSchema.optional(),
    deletedBy: UUIDSchema.nullable().optional(),
    version: z.number().int().nonnegative().default(1),
  })
  .refine((data): boolean => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  })
  .refine(
    (data): boolean => {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      return Math.abs(calculatedDuration - data.duration) <= 1; // Allow 1 minute tolerance
    },
    {
      message: 'Duration must match the time difference between start and end time',
      path: ['duration'],
    },
  );

// ============================================================================
// Appointment Status Transition Schema
// ============================================================================

/**
 * Appointment status transition validation
 * Validates allowed status transitions
 */
export const AppointmentStatusTransitionSchema = z
  .object({
    currentStatus: AppointmentStatusSchema,
    newStatus: AppointmentStatusSchema,
    reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
  })
  .refine(
    (data): boolean => {
      const validTransitions: Record<string, string[]> = {
        SCHEDULED: ['CONFIRMED', 'CANCELLED', 'RESCHEDULED'],
        CONFIRMED: ['CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
        CHECKED_IN: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [], // Terminal state
        CANCELLED: [], // Terminal state
        NO_SHOW: [], // Terminal state
        RESCHEDULED: [], // Terminal state
      };

      const allowed = validTransitions[data.currentStatus] || [];
      return allowed.includes(data.newStatus);
    },
    {
      message: 'Invalid status transition',
      path: ['newStatus'],
    },
  );

// ============================================================================
// Availability Slot Schema
// ============================================================================

/**
 * Provider availability slot schema
 */
export const AvailabilitySlotSchema = z.object({
  id: UUIDSchema,
  providerId: UUIDSchema,
  clinicId: UUIDSchema,
  startTime: ISODateStringSchema,
  endTime: ISODateStringSchema,
  isAvailable: z.boolean().default(true),
  slotType: z.enum(['regular', 'break', 'blocked', 'emergency'], {
    errorMap: (): { message: string } => ({ message: 'Invalid slot type' }),
  }),
  reason: z.string().max(200, 'Reason must be 200 characters or less').optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type TimeSlotInput = z.input<typeof TimeSlotSchema>;
export type TimeSlotOutput = z.output<typeof TimeSlotSchema>;
export type RecurrenceRuleInput = z.input<typeof RecurrenceRuleSchema>;
export type RecurrenceRuleOutput = z.output<typeof RecurrenceRuleSchema>;
export type AppointmentParticipantInput = z.input<typeof AppointmentParticipantSchema>;
export type AppointmentParticipantOutput = z.output<typeof AppointmentParticipantSchema>;
export type AppointmentNoteInput = z.input<typeof AppointmentNoteSchema>;
export type AppointmentNoteOutput = z.output<typeof AppointmentNoteSchema>;
export type AppointmentInput = z.input<typeof AppointmentSchema>;
export type AppointmentOutput = z.output<typeof AppointmentSchema>;
export type AppointmentStatusTransitionInput = z.input<typeof AppointmentStatusTransitionSchema>;
export type AppointmentStatusTransitionOutput = z.output<typeof AppointmentStatusTransitionSchema>;
export type AvailabilitySlotInput = z.input<typeof AvailabilitySlotSchema>;
export type AvailabilitySlotOutput = z.output<typeof AvailabilitySlotSchema>;
