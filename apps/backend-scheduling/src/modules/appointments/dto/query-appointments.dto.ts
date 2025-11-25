import { z } from 'zod';
import { AppointmentStatus } from '../entities/appointment.schema';

/**
 * Zod schema for querying appointments with filters
 */
export const QueryAppointmentsSchema = z
  .object({
    patientId: z.string().uuid().optional(),
    providerId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be greater than or equal to start date',
      path: ['endDate'],
    },
  );

export type QueryAppointmentsDto = z.infer<typeof QueryAppointmentsSchema>;
