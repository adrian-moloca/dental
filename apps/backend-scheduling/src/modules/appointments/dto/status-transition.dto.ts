import { z } from 'zod';

/**
 * Schema for confirming an appointment
 */
export const ConfirmAppointmentSchema = z.object({
  confirmationMethod: z
    .enum(['sms', 'email', 'phone', 'patient_portal'])
    .default('phone')
    .describe('Method used to confirm the appointment'),
});

export type ConfirmAppointmentDto = z.infer<typeof ConfirmAppointmentSchema>;

/**
 * Schema for checking in a patient
 */
export const CheckInAppointmentSchema = z.object({
  notes: z.string().max(500).optional().describe('Optional notes during check-in'),
});

export type CheckInAppointmentDto = z.infer<typeof CheckInAppointmentSchema>;

/**
 * Schema for starting an appointment
 */
export const StartAppointmentSchema = z.object({
  chairId: z
    .string()
    .uuid('Chair ID must be a valid UUID')
    .optional()
    .describe('Optional chair/room assignment'),
  notes: z.string().max(500).optional().describe('Optional notes when starting'),
});

export type StartAppointmentDto = z.infer<typeof StartAppointmentSchema>;

/**
 * Schema for completing an appointment
 */
export const CompleteAppointmentSchema = z.object({
  notes: z.string().max(2000).optional().describe('Completion notes'),
  proceduresConducted: z.array(z.string()).optional().describe('List of procedure codes conducted'),
});

export type CompleteAppointmentDto = z.infer<typeof CompleteAppointmentSchema>;

/**
 * Schema for cancelling an appointment with detailed tracking
 */
export const CancelAppointmentWithTypeSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
  cancellationType: z
    .enum(['patient', 'provider', 'clinic'])
    .describe('Who initiated the cancellation'),
  notifyPatient: z.boolean().default(true).describe('Whether to notify the patient'),
  notifyProvider: z.boolean().default(true).describe('Whether to notify the provider'),
  lateCancellation: z
    .boolean()
    .optional()
    .describe('Whether this is a late cancellation (within policy window)'),
});

export type CancelAppointmentWithTypeDto = z.infer<typeof CancelAppointmentWithTypeSchema>;

/**
 * Schema for marking an appointment as no-show
 */
export const NoShowAppointmentSchema = z.object({
  reason: z.string().max(500).optional().describe('Optional reason for no-show'),
  attemptedContact: z.boolean().default(false).describe('Whether contact was attempted'),
  contactAttempts: z
    .number()
    .int()
    .min(0)
    .max(10)
    .optional()
    .describe('Number of contact attempts made'),
});

export type NoShowAppointmentDto = z.infer<typeof NoShowAppointmentSchema>;

/**
 * Schema for rescheduling an appointment
 */
export const RescheduleAppointmentSchema = z
  .object({
    start: z.coerce.date({
      required_error: 'New start time is required',
      invalid_type_error: 'Start time must be a valid date',
    }),
    end: z.coerce.date({
      required_error: 'New end time is required',
      invalid_type_error: 'End time must be a valid date',
    }),
    providerId: z
      .string()
      .uuid('Provider ID must be a valid UUID')
      .optional()
      .describe('New provider if changing'),
    chairId: z
      .string()
      .uuid('Chair ID must be a valid UUID')
      .optional()
      .describe('New chair/room assignment'),
    reason: z.string().max(500).optional().describe('Reason for rescheduling'),
    notifyPatient: z.boolean().default(true),
    notifyProvider: z.boolean().default(true),
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
  )
  .refine(
    (data) => {
      return data.start > new Date();
    },
    {
      message: 'Cannot reschedule to a time in the past',
      path: ['start'],
    },
  );

export type RescheduleAppointmentDto = z.infer<typeof RescheduleAppointmentSchema>;

/**
 * Response DTO for status transition operations
 */
export interface StatusTransitionResponseDto {
  /** The appointment ID */
  appointmentId: string;
  /** Previous status */
  previousStatus: string;
  /** New status */
  newStatus: string;
  /** Transition timestamp */
  transitionedAt: Date;
  /** User who performed the transition */
  transitionedBy: string;
  /** Any additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * DTO for status transition history entry
 */
export interface StatusTransitionHistoryDto {
  /** Previous status */
  fromStatus: string;
  /** New status */
  toStatus: string;
  /** Action that triggered the transition */
  action: string;
  /** When the transition occurred */
  timestamp: Date;
  /** User who performed the transition */
  userId: string;
  /** Optional reason for the transition */
  reason?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}
