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
 *
 * Used by appointment service to validate if a specific time slot
 * is available for booking.
 */
export const ValidateAvailabilitySchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  clinicId: z.string().uuid('Clinic ID must be a valid UUID').optional(),
  start: z.coerce.date({
    required_error: 'Start time is required',
    invalid_type_error: 'Start time must be a valid date',
  }),
  end: z.coerce.date({
    required_error: 'End time is required',
    invalid_type_error: 'End time must be a valid date',
  }),
  locationId: z.string().uuid('Location ID must be a valid UUID'),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID'),
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
});

export type ValidateAvailabilityDto = z.infer<typeof ValidateAvailabilitySchema>;

/**
 * Zod schema for getting available slots (internal API)
 *
 * Used by appointment service to get the next N available time slots
 * for a provider, starting from a specific date. This powers the
 * appointment booking UI's slot selection.
 *
 * @example
 * {
 *   providerId: "uuid",
 *   clinicId: "uuid",
 *   locationId: "uuid",
 *   date: "2024-01-15",
 *   duration: 30,        // minutes
 *   count: 10,           // return up to 10 slots
 *   tenantId: "uuid",
 *   organizationId: "uuid"
 * }
 */
export const GetAvailableSlotsSchema = z.object({
  providerId: z.string().uuid('Provider ID must be a valid UUID'),
  clinicId: z.string().uuid('Clinic ID must be a valid UUID').optional(),
  locationId: z.string().uuid('Location ID must be a valid UUID'),
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),
  duration: z
    .number()
    .int()
    .min(5, 'Duration must be at least 5 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  count: z
    .number()
    .int()
    .min(1, 'Count must be at least 1')
    .max(100, 'Count cannot exceed 100')
    .default(10),
  tenantId: z.string().uuid('Tenant ID must be a valid UUID'),
  organizationId: z.string().uuid('Organization ID must be a valid UUID'),
});

export type GetAvailableSlotsDto = z.infer<typeof GetAvailableSlotsSchema>;

/**
 * Response schema for get available slots
 */
export const AvailableSlotsResponseSchema = z.object({
  slots: z.array(
    z.object({
      start: z.date(),
      end: z.date(),
    }),
  ),
  hasMore: z.boolean().optional(),
  provider: z
    .object({
      id: z.string(),
      name: z.string().optional(),
    })
    .optional(),
});

export type AvailableSlotsResponseDto = z.infer<typeof AvailableSlotsResponseSchema>;

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
