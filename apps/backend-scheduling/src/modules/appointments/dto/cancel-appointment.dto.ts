import { z } from 'zod';

/**
 * Zod schema for cancelling an appointment
 */
export const CancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
  notifyPatient: z.boolean().optional().default(true),
});

export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>;
