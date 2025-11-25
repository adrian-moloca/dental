import { z } from 'zod';
import { WeeklyHoursSchema, BreakPeriodSchema } from './time-slot.dto';

/**
 * Zod schema for schedule response
 */
export const ScheduleResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  providerId: z.string().uuid(),
  weeklyHours: WeeklyHoursSchema,
  breaks: z.array(BreakPeriodSchema),
  locationIds: z.array(z.string().uuid()),
  defaultAppointmentDuration: z.number().optional(),
  bufferTime: z.number().optional(),
  maxPatientsPerDay: z.number().optional(),
  isActive: z.boolean(),
  effectiveFrom: z.date().optional(),
  effectiveTo: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ScheduleResponseDto = z.infer<typeof ScheduleResponseSchema>;

/**
 * Zod schema for absence response
 */
export const AbsenceResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  providerId: z.string().uuid(),
  start: z.date(),
  end: z.date(),
  type: z.enum(['vacation', 'sick', 'conference', 'training', 'personal', 'emergency', 'other']),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  reason: z.string().optional(),
  isAllDay: z.boolean(),
  isRecurring: z.boolean(),
  recurrenceRule: z.string().optional(),
  createdBy: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.date().optional(),
  approvalNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AbsenceResponseDto = z.infer<typeof AbsenceResponseSchema>;
