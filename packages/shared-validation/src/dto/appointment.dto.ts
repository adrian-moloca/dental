/**
 * Appointment DTO validation schemas
 * @module shared-validation/dto/appointment
 */

import { z } from 'zod';
import { Priority } from '@dentalos/shared-types';
import {
  UUIDSchema,
  ISODateStringSchema,
  AppointmentStatusSchema,
  PrioritySchema,
  NonEmptyStringSchema,
} from '../schemas/common.schemas';
import {
  RecurrenceRuleSchema,
  AppointmentParticipantSchema,
} from '../schemas/appointment.schemas';

// ============================================================================
// Create Appointment DTO
// ============================================================================

/**
 * Create appointment DTO schema
 */
export const CreateAppointmentDtoSchema = z
  .object({
    patientId: UUIDSchema,
    providerId: UUIDSchema,
    clinicId: UUIDSchema,
    title: NonEmptyStringSchema.max(200, 'Title must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    appointmentType: NonEmptyStringSchema.max(100, 'Appointment type must be 100 characters or less'),
    startTime: ISODateStringSchema,
    endTime: ISODateStringSchema,
    duration: z.number().int().positive(),
    priority: PrioritySchema.default(() => Priority.MEDIUM),
    room: z.string().max(50, 'Room must be 50 characters or less').optional(),
    participants: z.array(AppointmentParticipantSchema).default([]),
    recurrenceRule: RecurrenceRuleSchema.optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data): boolean => new Date(data.startTime) < new Date(data.endTime), {
    message: 'Start time must be before end time',
    path: ['endTime'],
  });

// ============================================================================
// Update Appointment DTO
// ============================================================================

/**
 * Update appointment DTO schema
 */
export const UpdateAppointmentDtoSchema = z.object({
  title: NonEmptyStringSchema.max(200, 'Title must be 200 characters or less').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  appointmentType: NonEmptyStringSchema.max(100, 'Appointment type must be 100 characters or less').optional(),
  startTime: ISODateStringSchema.optional(),
  endTime: ISODateStringSchema.optional(),
  duration: z.number().int().positive().optional(),
  priority: PrioritySchema.optional(),
  room: z.string().max(50, 'Room must be 50 characters or less').optional(),
  participants: z.array(AppointmentParticipantSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================================================
// Appointment Response DTO
// ============================================================================

/**
 * Appointment response DTO schema
 */
export const AppointmentResponseDtoSchema = z.object({
  id: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema,
  patientId: UUIDSchema,
  providerId: UUIDSchema,
  title: z.string(),
  description: z.string().optional(),
  status: AppointmentStatusSchema,
  priority: PrioritySchema,
  startTime: ISODateStringSchema,
  endTime: ISODateStringSchema,
  duration: z.number(),
  appointmentType: z.string(),
  room: z.string().optional(),
  participants: z.array(AppointmentParticipantSchema),
  recurrenceRule: RecurrenceRuleSchema.optional(),
  parentAppointmentId: UUIDSchema.optional(),
  confirmedAt: ISODateStringSchema.nullable().optional(),
  checkedInAt: ISODateStringSchema.nullable().optional(),
  completedAt: ISODateStringSchema.nullable().optional(),
  cancelledAt: ISODateStringSchema.nullable().optional(),
  cancellationReason: z.string().optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

// ============================================================================
// Reschedule Appointment DTO
// ============================================================================

/**
 * Reschedule appointment DTO schema
 */
export const RescheduleAppointmentDtoSchema = z
  .object({
    newStartTime: ISODateStringSchema,
    newEndTime: ISODateStringSchema,
    reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
    notifyPatient: z.boolean().default(true),
  })
  .refine((data): boolean => new Date(data.newStartTime) < new Date(data.newEndTime), {
    message: 'Start time must be before end time',
    path: ['newEndTime'],
  });

// ============================================================================
// Cancel Appointment DTO
// ============================================================================

/**
 * Cancel appointment DTO schema
 */
export const CancelAppointmentDtoSchema = z.object({
  reason: NonEmptyStringSchema.max(500, 'Reason must be 500 characters or less'),
  notifyPatient: z.boolean().default(true),
  cancelRecurring: z.boolean().default(false),
});

// ============================================================================
// Confirm Appointment DTO
// ============================================================================

/**
 * Confirm appointment DTO schema
 */
export const ConfirmAppointmentDtoSchema = z.object({
  notifyPatient: z.boolean().default(true),
});

// ============================================================================
// Check-in Appointment DTO
// ============================================================================

/**
 * Check-in appointment DTO schema
 */
export const CheckInAppointmentDtoSchema = z.object({
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

// ============================================================================
// Complete Appointment DTO
// ============================================================================

/**
 * Complete appointment DTO schema
 */
export const CompleteAppointmentDtoSchema = z.object({
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: ISODateStringSchema.optional(),
});

// ============================================================================
// Appointment Query DTO
// ============================================================================

/**
 * Appointment query parameters DTO schema
 */
export const AppointmentQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['startTime', 'createdAt', 'status']).default('startTime').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
  status: AppointmentStatusSchema.optional(),
  patientId: UUIDSchema.optional(),
  providerId: UUIDSchema.optional(),
  clinicId: UUIDSchema.optional(),
  startDate: ISODateStringSchema.optional(),
  endDate: ISODateStringSchema.optional(),
  appointmentType: z.string().optional(),
  search: z.string().trim().optional(),
});

// ============================================================================
// Availability Query DTO
// ============================================================================

/**
 * Check availability DTO schema
 */
export const CheckAvailabilityDtoSchema = z.object({
  providerId: UUIDSchema,
  clinicId: UUIDSchema,
  startDate: ISODateStringSchema,
  endDate: ISODateStringSchema,
  duration: z.number().int().positive().default(30),
});

// ============================================================================
// Bulk Operations DTO
// ============================================================================

/**
 * Bulk update appointments DTO schema
 */
export const BulkUpdateAppointmentsDtoSchema = z.object({
  appointmentIds: z.array(UUIDSchema).min(1, 'At least one appointment ID is required'),
  updates: UpdateAppointmentDtoSchema,
});

// ============================================================================
// Type Inference
// ============================================================================

export type CreateAppointmentDtoInput = z.input<typeof CreateAppointmentDtoSchema>;
export type CreateAppointmentDtoOutput = z.output<typeof CreateAppointmentDtoSchema>;
export type UpdateAppointmentDtoInput = z.input<typeof UpdateAppointmentDtoSchema>;
export type UpdateAppointmentDtoOutput = z.output<typeof UpdateAppointmentDtoSchema>;
export type AppointmentResponseDtoInput = z.input<typeof AppointmentResponseDtoSchema>;
export type AppointmentResponseDtoOutput = z.output<typeof AppointmentResponseDtoSchema>;
export type RescheduleAppointmentDtoInput = z.input<typeof RescheduleAppointmentDtoSchema>;
export type RescheduleAppointmentDtoOutput = z.output<typeof RescheduleAppointmentDtoSchema>;
export type CancelAppointmentDtoInput = z.input<typeof CancelAppointmentDtoSchema>;
export type CancelAppointmentDtoOutput = z.output<typeof CancelAppointmentDtoSchema>;
export type ConfirmAppointmentDtoInput = z.input<typeof ConfirmAppointmentDtoSchema>;
export type ConfirmAppointmentDtoOutput = z.output<typeof ConfirmAppointmentDtoSchema>;
export type CheckInAppointmentDtoInput = z.input<typeof CheckInAppointmentDtoSchema>;
export type CheckInAppointmentDtoOutput = z.output<typeof CheckInAppointmentDtoSchema>;
export type CompleteAppointmentDtoInput = z.input<typeof CompleteAppointmentDtoSchema>;
export type CompleteAppointmentDtoOutput = z.output<typeof CompleteAppointmentDtoSchema>;
export type AppointmentQueryParamsInput = z.input<typeof AppointmentQueryParamsSchema>;
export type AppointmentQueryParamsOutput = z.output<typeof AppointmentQueryParamsSchema>;
export type CheckAvailabilityDtoInput = z.input<typeof CheckAvailabilityDtoSchema>;
export type CheckAvailabilityDtoOutput = z.output<typeof CheckAvailabilityDtoSchema>;
export type BulkUpdateAppointmentsDtoInput = z.input<typeof BulkUpdateAppointmentsDtoSchema>;
export type BulkUpdateAppointmentsDtoOutput = z.output<typeof BulkUpdateAppointmentsDtoSchema>;
