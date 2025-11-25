import { z } from 'zod';
import { WeeklyHoursSchema, BreakPeriodSchema } from './time-slot.dto';

/**
 * Zod schema for updating a provider schedule
 */
export const UpdateScheduleSchema = z.object({
  weeklyHours: WeeklyHoursSchema,
  breaks: z.array(BreakPeriodSchema).optional().default([]),
  locationIds: z
    .array(z.string().uuid('Location ID must be a valid UUID'))
    .min(1, 'At least one location must be specified'),
  defaultAppointmentDuration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours')
    .optional(),
  bufferTime: z
    .number()
    .int()
    .min(0, 'Buffer time cannot be negative')
    .max(60, 'Buffer time cannot exceed 60 minutes')
    .optional(),
  maxPatientsPerDay: z
    .number()
    .int()
    .min(0, 'Max patients cannot be negative')
    .max(100, 'Max patients cannot exceed 100')
    .optional(),
  isActive: z.boolean().optional(),
  effectiveFrom: z.coerce.date().optional(),
  effectiveTo: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateScheduleDto = z.infer<typeof UpdateScheduleSchema>;
