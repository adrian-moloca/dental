import { z } from 'zod';

/**
 * Zod schema for rescheduling an appointment
 */
export const UpdateAppointmentSchema = z
  .object({
    start: z.coerce.date({
      required_error: 'Start time is required',
      invalid_type_error: 'Start time must be a valid date',
    }),
    end: z.coerce.date({
      required_error: 'End time is required',
      invalid_type_error: 'End time must be a valid date',
    }),
    providerId: z.string().uuid('Provider ID must be a valid UUID').optional(),
    chairId: z.string().uuid('Chair ID must be a valid UUID').optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.end > data.start, {
    message: 'End time must be after start time',
    path: ['end'],
  });

export type UpdateAppointmentDto = z.infer<typeof UpdateAppointmentSchema>;
