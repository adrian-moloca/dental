import { z } from 'zod';

/**
 * Zod schema for approving an absence request
 *
 * When an absence is approved:
 * 1. Status changes from 'pending' to 'approved'
 * 2. Schedule exceptions are automatically created for each day
 * 3. Existing appointments in the period should be notified (event emitted)
 */
export const ApproveAbsenceSchema = z.object({
  /** Optional notes about the approval */
  approvalNotes: z.string().max(500).optional(),
});

export type ApproveAbsenceDto = z.infer<typeof ApproveAbsenceSchema>;

/**
 * Zod schema for rejecting an absence request
 *
 * When an absence is rejected:
 * 1. Status changes from 'pending' to 'rejected'
 * 2. The provider is notified (event emitted)
 */
export const RejectAbsenceSchema = z.object({
  /** Reason for rejection (recommended but optional) */
  rejectionReason: z.string().max(500).optional(),
});

export type RejectAbsenceDto = z.infer<typeof RejectAbsenceSchema>;

/**
 * Zod schema for cancelling an absence request
 *
 * Only absences with status 'pending' or 'approved' can be cancelled.
 * When cancelled:
 * 1. Status changes to 'cancelled'
 * 2. Associated schedule exceptions are removed
 */
export const CancelAbsenceSchema = z.object({
  /** Reason for cancellation */
  cancellationReason: z.string().max(500).optional(),
});

export type CancelAbsenceDto = z.infer<typeof CancelAbsenceSchema>;

/**
 * Zod schema for querying absences with filters
 */
export const QueryAbsencesSchema = z.object({
  /** Filter by status */
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']).optional(),

  /** Filter by type */
  type: z
    .enum(['vacation', 'sick', 'conference', 'training', 'personal', 'emergency', 'other'])
    .optional(),

  /** Start date for range filter */
  startDate: z.coerce.date().optional(),

  /** End date for range filter */
  endDate: z.coerce.date().optional(),

  /** Filter by provider (for managers viewing team absences) */
  providerId: z.string().uuid().optional(),

  /** Include past absences (default: false, only future absences) */
  includePast: z
    .string()
    .transform((v) => v === 'true')
    .optional(),

  /** Pagination */
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryAbsencesDto = z.infer<typeof QueryAbsencesSchema>;

/**
 * Zod schema for absence list response with pagination
 */
export const AbsenceListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: z.string().uuid(),
      tenantId: z.string().uuid(),
      organizationId: z.string().uuid(),
      providerId: z.string().uuid(),
      providerName: z.string().optional(),
      start: z.date(),
      end: z.date(),
      type: z.enum([
        'vacation',
        'sick',
        'conference',
        'training',
        'personal',
        'emergency',
        'other',
      ]),
      status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
      reason: z.string().optional(),
      isAllDay: z.boolean(),
      createdBy: z.string().optional(),
      approvedBy: z.string().optional(),
      approvedAt: z.date().optional(),
      approvalNotes: z.string().optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
    }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type AbsenceListResponseDto = z.infer<typeof AbsenceListResponseSchema>;
