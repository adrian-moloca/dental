import { z } from 'zod';

/**
 * Zod schema for creating a new appointment
 */
export const CreateAppointmentSchema = z
  .object({
    patientId: z.string().uuid('Patient ID must be a valid UUID'),
    providerId: z.string().uuid('Provider ID must be a valid UUID'),
    locationId: z.string().uuid('Location ID must be a valid UUID'),
    chairId: z.string().uuid('Chair ID must be a valid UUID').optional(),
    serviceCode: z.string().min(1, 'Service code is required').max(50),
    start: z.coerce.date({
      required_error: 'Start time is required',
      invalid_type_error: 'Start time must be a valid date',
    }),
    end: z.coerce.date({
      required_error: 'End time is required',
      invalid_type_error: 'End time must be a valid date',
    }),
    notes: z.string().max(500).optional(),
    bookingSource: z.enum(['online', 'phone', 'walk_in', 'referral']).optional(),
    emergencyVisit: z.boolean().optional().default(false),
  })
  .refine((data) => data.end > data.start, {
    message: 'End time must be after start time',
    path: ['end'],
  })
  .refine(
    (data) => {
      const duration = data.end.getTime() - data.start.getTime();
      const maxDuration = 8 * 60 * 60 * 1000; // 8 hours
      return duration <= maxDuration;
    },
    {
      message: 'Appointment duration cannot exceed 8 hours',
      path: ['end'],
    },
  );

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>;
