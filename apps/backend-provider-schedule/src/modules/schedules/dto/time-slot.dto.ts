import { z } from 'zod';

/**
 * Time format regex: HH:mm (24-hour format)
 */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates time string format
 */
const timeString = z
  .string()
  .regex(TIME_REGEX, 'Time must be in HH:mm format (24-hour)')
  .refine(
    (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
    },
    { message: 'Invalid time value' },
  );

/**
 * Zod schema for time slot
 */
export const TimeSlotSchema = z
  .object({
    start: timeString,
    end: timeString,
  })
  .refine((data) => data.end > data.start, {
    message: 'End time must be after start time',
    path: ['end'],
  });

export type TimeSlotDto = z.infer<typeof TimeSlotSchema>;

/**
 * Zod schema for break period
 */
export const BreakPeriodSchema = z
  .object({
    name: z.string().min(1).max(50),
    start: timeString,
    end: timeString,
    days: z
      .array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
      .min(1, 'At least one day must be specified'),
  })
  .refine((data) => data.end > data.start, {
    message: 'End time must be after start time',
    path: ['end'],
  });

export type BreakPeriodDto = z.infer<typeof BreakPeriodSchema>;

/**
 * Zod schema for weekly hours
 */
export const WeeklyHoursSchema = z.object({
  monday: z.array(TimeSlotSchema).optional(),
  tuesday: z.array(TimeSlotSchema).optional(),
  wednesday: z.array(TimeSlotSchema).optional(),
  thursday: z.array(TimeSlotSchema).optional(),
  friday: z.array(TimeSlotSchema).optional(),
  saturday: z.array(TimeSlotSchema).optional(),
  sunday: z.array(TimeSlotSchema).optional(),
});

export type WeeklyHoursDto = z.infer<typeof WeeklyHoursSchema>;
