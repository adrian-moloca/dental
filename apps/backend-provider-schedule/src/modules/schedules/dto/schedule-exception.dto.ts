import { z } from 'zod';
import { TimeSlotSchema } from './time-slot.dto';

/**
 * Exception type enumeration
 */
export const ExceptionTypeEnum = z.enum(['holiday', 'vacation', 'sick', 'training', 'override']);
export type ExceptionType = z.infer<typeof ExceptionTypeEnum>;

/**
 * Zod schema for creating a schedule exception
 *
 * Use cases:
 * - holiday: Public holiday, provider is off all day
 * - vacation: Provider vacation day (single day from an absence)
 * - sick: Provider called in sick
 * - training: Provider attending training/conference
 * - override: Custom working hours for a specific day
 */
export const CreateExceptionSchema = z.object({
  /** The date this exception applies to (ISO 8601 format) */
  date: z.coerce.date({
    required_error: 'Date is required',
    invalid_type_error: 'Date must be a valid date',
  }),

  /** Type of exception */
  type: ExceptionTypeEnum,

  /** Clinic ID this exception applies to (optional - null means all clinics) */
  clinicId: z.string().uuid('Clinic ID must be a valid UUID').optional().nullable(),

  /**
   * Working hours for this day (only for 'override' type)
   * null or empty = provider is unavailable all day
   * array of slots = only those hours are available
   */
  hours: z.array(TimeSlotSchema).optional().nullable(),

  /** Reason or description */
  reason: z.string().max(500).optional(),
});

export type CreateExceptionDto = z.infer<typeof CreateExceptionSchema>;

/**
 * Zod schema for updating a schedule exception
 */
export const UpdateExceptionSchema = z.object({
  type: ExceptionTypeEnum.optional(),
  hours: z.array(TimeSlotSchema).optional().nullable(),
  reason: z.string().max(500).optional(),
});

export type UpdateExceptionDto = z.infer<typeof UpdateExceptionSchema>;

/**
 * Zod schema for exception response
 */
export const ExceptionResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  organizationId: z.string().uuid(),
  providerId: z.string().uuid(),
  clinicId: z.string().uuid().optional().nullable(),
  date: z.date(),
  type: ExceptionTypeEnum,
  hours: z
    .array(
      z.object({
        start: z.string(),
        end: z.string(),
      }),
    )
    .optional()
    .nullable(),
  reason: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ExceptionResponseDto = z.infer<typeof ExceptionResponseSchema>;

/**
 * Zod schema for bulk creating exceptions (e.g., holiday calendar import)
 */
export const BulkCreateExceptionsSchema = z.object({
  exceptions: z
    .array(CreateExceptionSchema)
    .min(1, 'At least one exception is required')
    .max(100, 'Cannot create more than 100 exceptions at once'),
});

export type BulkCreateExceptionsDto = z.infer<typeof BulkCreateExceptionsSchema>;

/**
 * Zod schema for querying exceptions
 */
export const QueryExceptionsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  type: ExceptionTypeEnum.optional(),
  clinicId: z.string().uuid().optional(),
});

export type QueryExceptionsDto = z.infer<typeof QueryExceptionsSchema>;
