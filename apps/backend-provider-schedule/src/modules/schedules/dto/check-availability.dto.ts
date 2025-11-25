import { z } from 'zod';

/**
 * Zod schema for checking provider availability
 */
export const CheckAvailabilitySchema = z.object({
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),
});

export type CheckAvailabilityDto = z.infer<typeof CheckAvailabilitySchema>;

/**
 * Zod schema for validating availability (internal API)
 */
export const ValidateAvailabilitySchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  start: z.coerce.date({
    required_error: 'Start time is required',
    invalid_type_error: 'Start time must be a valid date',
  }),
  end: z.coerce.date({
    required_error: 'End time is required',
    invalid_type_error: 'End time must be a valid date',
  }),
  locationId: z.string().uuid('Location ID must be a valid UUID'),
});

export type ValidateAvailabilityDto = z.infer<typeof ValidateAvailabilitySchema>;

/**
 * Response schema for availability check
 */
export const AvailabilityResponseSchema = z.object({
  isAvailable: z.boolean(),
  reason: z.string().optional(),
  availableSlots: z
    .array(
      z.object({
        start: z.date(),
        end: z.date(),
      }),
    )
    .optional(),
});

export type AvailabilityResponseDto = z.infer<typeof AvailabilityResponseSchema>;
