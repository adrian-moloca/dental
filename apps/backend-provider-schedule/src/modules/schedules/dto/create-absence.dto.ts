import { z } from 'zod';

/**
 * Zod schema for creating a provider absence
 */
export const CreateAbsenceSchema = z
  .object({
    start: z.coerce.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Start date must be a valid date',
    }),
    end: z.coerce.date({
      required_error: 'End date is required',
      invalid_type_error: 'End date must be a valid date',
    }),
    type: z.enum(['vacation', 'sick', 'conference', 'training', 'personal', 'emergency', 'other']),
    reason: z.string().max(500).optional(),
    isAllDay: z.boolean().default(true),
    isRecurring: z.boolean().default(false),
    recurrenceRule: z.string().optional(),
  })
  .refine((data) => data.end > data.start, {
    message: 'End date must be after start date',
    path: ['end'],
  })
  .refine(
    (data) => {
      // If recurring, recurrence rule must be provided
      if (data.isRecurring && !data.recurrenceRule) {
        return false;
      }
      return true;
    },
    {
      message: 'Recurrence rule is required for recurring absences',
      path: ['recurrenceRule'],
    },
  )
  .refine(
    (data) => {
      // Absence cannot exceed 1 year
      const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in ms
      const duration = data.end.getTime() - data.start.getTime();
      return duration <= maxDuration;
    },
    {
      message: 'Absence duration cannot exceed 1 year',
      path: ['end'],
    },
  );

export type CreateAbsenceDto = z.infer<typeof CreateAbsenceSchema>;
