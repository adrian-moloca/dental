import { z } from 'zod';

/**
 * Zod schema for getting availability on a single date
 *
 * GET /providers/:id/availability?date=2025-01-15&duration=30
 */
export const GetAvailabilitySchema = z.object({
  /** Date to check availability (ISO 8601 format) */
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),

  /** Duration in minutes (optional, used for filtering) */
  duration: z.coerce.number().int().min(5).max(480).optional().default(30),

  /** Clinic ID to check availability for (optional) */
  clinicId: z.string().uuid().optional(),

  /**
   * Timezone for the response (IANA format)
   * Default: Europe/Bucharest
   */
  timezone: z.string().optional().default('Europe/Bucharest'),
});

export type GetAvailabilityDto = z.infer<typeof GetAvailabilitySchema>;

/**
 * Zod schema for getting availability over a date range
 *
 * GET /providers/:id/availability-range?start=2025-01-15&end=2025-01-31
 */
export const GetAvailabilityRangeSchema = z.object({
  /** Start date of the range (ISO 8601 format) */
  start: z.coerce.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Start date must be a valid date',
  }),

  /** End date of the range (ISO 8601 format) */
  end: z.coerce.date({
    required_error: 'End date is required',
    invalid_type_error: 'End date must be a valid date',
  }),

  /** Duration in minutes (optional, used for filtering) */
  duration: z.coerce.number().int().min(5).max(480).optional().default(30),

  /** Clinic ID to check availability for (optional) */
  clinicId: z.string().uuid().optional(),

  /**
   * Timezone for the response (IANA format)
   * Default: Europe/Bucharest
   */
  timezone: z.string().optional().default('Europe/Bucharest'),
});

export type GetAvailabilityRangeDto = z.infer<typeof GetAvailabilityRangeSchema>;

/**
 * Time slot in availability response
 */
export const AvailableSlotSchema = z.object({
  /** Slot start time (UTC) */
  start: z.date(),

  /** Slot end time (UTC) */
  end: z.date(),

  /** Duration in minutes */
  durationMinutes: z.number().optional(),
});

export type AvailableSlot = z.infer<typeof AvailableSlotSchema>;

/**
 * Daily availability summary
 */
export const DailyAvailabilitySchema = z.object({
  /** Date (ISO 8601 date string, e.g., "2025-01-15") */
  date: z.string(),

  /** Day of week */
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),

  /** Whether the provider is available at all on this day */
  isAvailable: z.boolean(),

  /** Reason if not available */
  unavailableReason: z.string().optional(),

  /** Working hours for this day (from schedule template) */
  workingHours: z
    .array(
      z.object({
        start: z.string(), // "09:00"
        end: z.string(), // "17:00"
      }),
    )
    .optional(),

  /** Available slots after considering appointments and exceptions */
  availableSlots: z.array(AvailableSlotSchema).optional(),

  /** Total available minutes on this day */
  totalAvailableMinutes: z.number().optional(),
});

export type DailyAvailability = z.infer<typeof DailyAvailabilitySchema>;

/**
 * Response schema for availability check
 */
export const AvailabilityCheckResponseSchema = z.object({
  /** Provider ID */
  providerId: z.string().uuid(),

  /** Clinic ID (if filtered by clinic) */
  clinicId: z.string().uuid().optional(),

  /** Whether the provider is available */
  isAvailable: z.boolean(),

  /** Reason if not available */
  reason: z.string().optional(),

  /** Available time slots for the requested date */
  availableSlots: z.array(AvailableSlotSchema).optional(),

  /** Working hours for the day */
  workingHours: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    )
    .optional(),

  /** Next available slot (if not available today) */
  nextAvailableSlot: AvailableSlotSchema.optional(),

  /** Timezone used for the response */
  timezone: z.string(),

  /** Cache information */
  cached: z.boolean().optional(),
  cachedAt: z.date().optional(),
});

export type AvailabilityCheckResponse = z.infer<typeof AvailabilityCheckResponseSchema>;

/**
 * Response schema for availability range query
 */
export const AvailabilityRangeResponseSchema = z.object({
  /** Provider ID */
  providerId: z.string().uuid(),

  /** Clinic ID (if filtered by clinic) */
  clinicId: z.string().uuid().optional(),

  /** Start date of the range */
  startDate: z.string(),

  /** End date of the range */
  endDate: z.string(),

  /** Daily availability for each day in the range */
  days: z.array(DailyAvailabilitySchema),

  /** Summary statistics */
  summary: z.object({
    /** Total days in range */
    totalDays: z.number(),

    /** Days with availability */
    availableDays: z.number(),

    /** Total available slots across all days */
    totalSlots: z.number(),

    /** Total available minutes across all days */
    totalAvailableMinutes: z.number(),
  }),

  /** Timezone used for the response */
  timezone: z.string(),

  /** Cache information */
  cached: z.boolean().optional(),
  cachedAt: z.date().optional(),
});

export type AvailabilityRangeResponse = z.infer<typeof AvailabilityRangeResponseSchema>;
