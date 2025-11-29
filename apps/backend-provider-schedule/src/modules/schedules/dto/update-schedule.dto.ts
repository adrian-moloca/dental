import { z } from 'zod';
import { WeeklyHoursSchema, BreakPeriodSchema } from './time-slot.dto';

/**
 * Zod schema for creating a provider schedule
 *
 * MULTI-CLINIC SUPPORT:
 * - clinicId is required and defines which clinic this schedule applies to
 * - A provider can have separate schedules at different clinics
 * - timezone defaults to Europe/Bucharest but should match clinic's timezone
 */
export const CreateScheduleSchema = z.object({
  /** Clinic this schedule belongs to */
  clinicId: z.string().uuid('Clinic ID must be a valid UUID'),

  /** Timezone for this schedule (IANA format) */
  timezone: z.string().default('Europe/Bucharest'),

  /** Weekly working hours */
  weeklyHours: WeeklyHoursSchema,

  /** Break periods */
  breaks: z.array(BreakPeriodSchema).optional().default([]),

  /** Location IDs (treatment rooms/chairs) where this provider works */
  locationIds: z
    .array(z.string().uuid('Location ID must be a valid UUID'))
    .min(1, 'At least one location must be specified'),

  /** Default appointment duration in minutes */
  defaultAppointmentDuration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional()
    .default(30),

  /** Buffer time between appointments in minutes */
  bufferTime: z
    .number()
    .int()
    .min(0, 'Buffer time cannot be negative')
    .max(60, 'Buffer time cannot exceed 60 minutes')
    .optional()
    .default(0),

  /** Maximum patients per day (0 = unlimited) */
  maxPatientsPerDay: z
    .number()
    .int()
    .min(0, 'Max patients cannot be negative')
    .max(100, 'Max patients cannot exceed 100')
    .optional()
    .default(0),

  /** Whether schedule is active */
  isActive: z.boolean().optional().default(true),

  /** Schedule effective from date */
  effectiveFrom: z.coerce.date().optional(),

  /** Schedule effective until date */
  effectiveTo: z.coerce.date().optional(),

  /** Notes about this schedule */
  notes: z.string().max(500).optional(),
});

export type CreateScheduleDto = z.infer<typeof CreateScheduleSchema>;

/**
 * Zod schema for updating a provider schedule
 * All fields are optional except clinicId which identifies which schedule to update
 */
export const UpdateScheduleSchema = z.object({
  /** Timezone for this schedule (IANA format) */
  timezone: z.string().optional(),

  /** Weekly working hours */
  weeklyHours: WeeklyHoursSchema.optional(),

  /** Break periods */
  breaks: z.array(BreakPeriodSchema).optional(),

  /** Location IDs (treatment rooms/chairs) where this provider works */
  locationIds: z
    .array(z.string().uuid('Location ID must be a valid UUID'))
    .min(1, 'At least one location must be specified')
    .optional(),

  /** Default appointment duration in minutes */
  defaultAppointmentDuration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),

  /** Buffer time between appointments in minutes */
  bufferTime: z
    .number()
    .int()
    .min(0, 'Buffer time cannot be negative')
    .max(60, 'Buffer time cannot exceed 60 minutes')
    .optional(),

  /** Maximum patients per day (0 = unlimited) */
  maxPatientsPerDay: z
    .number()
    .int()
    .min(0, 'Max patients cannot be negative')
    .max(100, 'Max patients cannot exceed 100')
    .optional(),

  /** Whether schedule is active */
  isActive: z.boolean().optional(),

  /** Schedule effective from date */
  effectiveFrom: z.coerce.date().optional(),

  /** Schedule effective until date */
  effectiveTo: z.coerce.date().optional(),

  /** Notes about this schedule */
  notes: z.string().max(500).optional(),
});

export type UpdateScheduleDto = z.infer<typeof UpdateScheduleSchema>;
