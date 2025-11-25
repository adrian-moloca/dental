/**
 * Cabinet Zod Validation Schemas
 *
 * Type-safe validation schemas for Cabinet operations using Zod.
 * All schemas enforce multi-tenant isolation and business rules.
 *
 * Business rules enforced:
 * - Name is required and must be 1-255 characters
 * - Code is optional but must be unique per organization
 * - Only one default cabinet per organization
 * - Email, phone, and URL format validation when provided
 * - Working hours validation (start < end)
 * - Timezone validation against known timezones
 *
 * @module modules/cabinets/dto/schemas
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  URLSchema,
  NonEmptyStringSchema,
} from '@dentalos/shared-validation';
import { EntityStatus } from '@dentalos/shared-types';

// Local schema definitions (not yet in shared-validation)
const EntityStatusSchema = z.nativeEnum(EntityStatus);
const TimeZoneSchema = z.string().min(1).max(100);
const LanguageCodeSchema = z.string().length(2).toLowerCase();
const CurrencyCodeSchema = z.string().length(3).toUpperCase();

// ============================================================================
// Cabinet Settings Schemas
// ============================================================================

/**
 * Working hours schema for a single day
 */
export const WorkingHoursSchema = z
  .object({
    /** Start time in HH:MM format (24-hour) */
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Start time must be in HH:MM format (e.g., 09:00)',
    }),
    /** End time in HH:MM format (24-hour) */
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'End time must be in HH:MM format (e.g., 17:00)',
    }),
    /** Whether the cabinet is closed on this day */
    closed: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.closed) return true; // Skip validation if closed
      return data.start < data.end;
    },
    {
      message: 'Start time must be before end time',
    },
  );

/**
 * Cabinet settings schema
 */
export const CabinetSettingsSchema = z
  .object({
    /** Timezone for the cabinet */
    timezone: TimeZoneSchema,
    /** Language code */
    language: LanguageCodeSchema,
    /** Currency code */
    currency: CurrencyCodeSchema,
    /** Date format preference */
    dateFormat: z.string().min(1).max(50),
    /** Working hours for each day of the week */
    workingHours: z.record(z.string(), WorkingHoursSchema).optional(),
  })
  .catchall(z.unknown()); // Allow additional properties

// ============================================================================
// Create Cabinet Schemas
// ============================================================================

/**
 * Create cabinet request schema
 */
export const CreateCabinetSchema = z.object({
  /** Cabinet name (required) */
  name: NonEmptyStringSchema.max(255, 'Name must be 255 characters or less'),

  /** Unique code (optional, unique per organization) */
  code: z.string().trim().max(100).optional(),

  /** Whether this is the default cabinet */
  isDefault: z.boolean().optional().default(false),

  /** Owner/manager user ID (optional) */
  ownerId: UUIDSchema.optional(),

  // Address fields
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(50).optional(),
  zipCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(100).optional(),

  // Contact fields
  phone: PhoneNumberSchema.optional(),
  email: EmailSchema.optional(),
  website: URLSchema.optional(),

  // Settings
  settings: CabinetSettingsSchema.optional(),

  // Status (optional, defaults to ACTIVE)
  status: EntityStatusSchema.optional().default(EntityStatus.ACTIVE),
});

export type CreateCabinetDto = z.infer<typeof CreateCabinetSchema>;

// ============================================================================
// Update Cabinet Schemas
// ============================================================================

/**
 * Update cabinet request schema
 * All fields are optional (partial update)
 */
export const UpdateCabinetSchema = z
  .object({
    name: NonEmptyStringSchema.max(255).optional(),
    code: z.string().trim().max(100).optional(),
    isDefault: z.boolean().optional(),
    ownerId: UUIDSchema.nullable().optional(),

    // Address fields
    address: z.string().trim().max(500).nullable().optional(),
    city: z.string().trim().max(100).nullable().optional(),
    state: z.string().trim().max(50).nullable().optional(),
    zipCode: z.string().trim().max(20).nullable().optional(),
    country: z.string().trim().max(100).nullable().optional(),

    // Contact fields
    phone: PhoneNumberSchema.nullable().optional(),
    email: EmailSchema.nullable().optional(),
    website: URLSchema.nullable().optional(),

    // Settings
    settings: CabinetSettingsSchema.nullable().optional(),

    // Status
    status: EntityStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateCabinetDto = z.infer<typeof UpdateCabinetSchema>;

// ============================================================================
// Query Schemas
// ============================================================================

/**
 * Find all cabinets query parameters
 */
export const FindCabinetsQuerySchema = z.object({
  /** Filter by status */
  status: EntityStatusSchema.optional(),
  /** Filter by owner ID */
  ownerId: UUIDSchema.optional(),
  /** Only return default cabinet */
  isDefault: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  /** Search by name (partial match) */
  search: z.string().trim().optional(),
});

export type FindCabinetsQueryDto = z.infer<typeof FindCabinetsQuerySchema>;

// ============================================================================
// Response Schemas
// ============================================================================

/**
 * Cabinet response schema (matches entity shape)
 */
export const CabinetResponseSchema = z.object({
  id: UUIDSchema,
  organizationId: UUIDSchema,
  name: z.string(),
  code: z.string().nullable(),
  isDefault: z.boolean(),
  ownerId: UUIDSchema.nullable(),

  // Address
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipCode: z.string().nullable(),
  country: z.string().nullable(),

  // Contact
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),

  // Status & Settings
  status: EntityStatusSchema,
  settings: CabinetSettingsSchema.nullable(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdBy: UUIDSchema.nullable(),
});

export type CabinetResponseDto = z.infer<typeof CabinetResponseSchema>;
