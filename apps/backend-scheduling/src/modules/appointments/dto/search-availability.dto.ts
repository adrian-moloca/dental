import { z } from 'zod';

/**
 * Zod schema for searching provider availability
 */
export const SearchAvailabilitySchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  locationId: z.string().uuid('Location ID must be a valid UUID'),
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),
  durationMinutes: z.coerce.number().int().min(15).max(480).default(60),
  serviceCode: z.string().min(1).max(50).optional(),
});

export type SearchAvailabilityDto = z.infer<typeof SearchAvailabilitySchema>;

/**
 * Available time slot response
 */
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
  reason?: string;
}

/**
 * Availability search response
 */
export interface AvailabilityResponse {
  providerId: string;
  date: Date;
  slots: TimeSlot[];
  totalAvailable: number;
  cached: boolean;
}
