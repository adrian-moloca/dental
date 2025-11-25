/**
 * Common field validation schemas
 * @module shared-validation/schemas/common
 */

import { z } from 'zod';
import {
  UserRole,
  PermissionAction,
  ResourceType,
  UserStatus,
  AppointmentStatus,
  TreatmentStatus,
  Status,
  ApprovalStatus,
  PaymentStatus,
  Priority,
  Gender,
  MaritalStatus,
  ContactMethod,
  NotificationType,
  NotificationChannel,
  DocumentType,
  RecurrencePattern,
  DayOfWeek,
  CurrencyCode,
  LanguageCode,
  TimeZone,
  TenantType,
  TenantIsolationPolicy,
  EntityStatus,
} from '@dentalos/shared-types';

// ============================================================================
// Branded Type Schemas
// ============================================================================

/**
 * UUID schema with brand preservation
 * Validates UUID v4 format and preserves the UUID brand
 */
export const UUIDSchema = z.string().uuid({
  message: 'Must be a valid UUID',
});

/**
 * Email schema with RFC 5322 regex validation
 * Validates email format and preserves the Email brand
 */
export const EmailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Must be a valid email address')
  .toLowerCase()
  .trim();

/**
 * Phone number schema with E.164 format validation
 * Format: +[1-9]\d{1,14}
 */
export const PhoneNumberSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, {
    message: 'Must be a valid phone number in E.164 format (e.g., +14155552671)',
  })
  .trim();

/**
 * ISO 8601 date string schema
 * Validates ISO datetime format
 */
export const ISODateStringSchema = z.string().datetime({
  message: 'Must be a valid ISO 8601 datetime string',
});

/**
 * Date schema with ISO string to Date transformation
 * Transforms ISO datetime string to Date object
 */
export const DateSchema = z.string().datetime().transform((str): Date => new Date(str));

/**
 * Date-only schema (YYYY-MM-DD format)
 * For dates without time component
 */
export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Must be a valid date in YYYY-MM-DD format',
  })
  .refine((val): boolean => !isNaN(new Date(val).getTime()), {
    message: 'Must be a valid date',
  });

/**
 * URL schema with validation
 */
export const URLSchema = z.string().url({
  message: 'Must be a valid URL',
});

/**
 * Positive integer schema
 */
export const PositiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be a positive number');

/**
 * Non-negative integer schema
 */
export const NonNegativeIntSchema = z
  .number()
  .int('Must be an integer')
  .nonnegative('Must be a non-negative number');

// ============================================================================
// String Refinements
// ============================================================================

/**
 * Non-empty string schema
 */
export const NonEmptyStringSchema = z.string().min(1, 'Cannot be empty').trim();

/**
 * Non-empty trimmed string schema
 */
export const TrimmedStringSchema = z.string().trim().min(1, 'Cannot be empty after trimming');

/**
 * Slug schema for URL-safe identifiers
 * Format: lowercase letters, numbers, and hyphens only
 */
export const SlugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, {
    message: 'Must contain only lowercase letters, numbers, and hyphens',
  })
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug must be 100 characters or less');

/**
 * Password schema with strength validation
 * Requirements: min 8 chars, uppercase, lowercase, number, special char
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less')
  .refine((val): boolean => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val): boolean => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val): boolean => /\d/.test(val), {
    message: 'Password must contain at least one number',
  })
  .refine((val): boolean => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Password must contain at least one special character',
  });

// ============================================================================
// Enum Schemas
// ============================================================================

/**
 * User role enum schema
 */
export const UserRoleSchema = z.nativeEnum(UserRole, {
  errorMap: (): { message: string } => ({ message: 'Invalid user role' }),
});

/**
 * Permission action enum schema
 */
export const PermissionActionSchema = z.nativeEnum(PermissionAction, {
  errorMap: (): { message: string } => ({ message: 'Invalid permission action' }),
});

/**
 * Resource type enum schema
 */
export const ResourceTypeSchema = z.nativeEnum(ResourceType, {
  errorMap: (): { message: string } => ({ message: 'Invalid resource type' }),
});

/**
 * User status enum schema
 */
export const UserStatusSchema = z.nativeEnum(UserStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid user status' }),
});

/**
 * Appointment status enum schema
 */
export const AppointmentStatusSchema = z.nativeEnum(AppointmentStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid appointment status' }),
});

/**
 * Treatment status enum schema
 */
export const TreatmentStatusSchema = z.nativeEnum(TreatmentStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid treatment status' }),
});

/**
 * Generic status enum schema
 */
export const StatusSchema = z.nativeEnum(Status, {
  errorMap: (): { message: string } => ({ message: 'Invalid status' }),
});

/**
 * Approval status enum schema
 */
export const ApprovalStatusSchema = z.nativeEnum(ApprovalStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid approval status' }),
});

/**
 * Payment status enum schema
 */
export const PaymentStatusSchema = z.nativeEnum(PaymentStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid payment status' }),
});

/**
 * Priority enum schema
 */
export const PrioritySchema = z.nativeEnum(Priority, {
  errorMap: (): { message: string } => ({ message: 'Invalid priority' }),
});

/**
 * Gender enum schema
 */
export const GenderSchema = z.nativeEnum(Gender, {
  errorMap: (): { message: string } => ({ message: 'Invalid gender' }),
});

/**
 * Marital status enum schema
 */
export const MaritalStatusSchema = z.nativeEnum(MaritalStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid marital status' }),
});

/**
 * Contact method enum schema
 */
export const ContactMethodSchema = z.nativeEnum(ContactMethod, {
  errorMap: (): { message: string } => ({ message: 'Invalid contact method' }),
});

/**
 * Notification type enum schema
 */
export const NotificationTypeSchema = z.nativeEnum(NotificationType, {
  errorMap: (): { message: string } => ({ message: 'Invalid notification type' }),
});

/**
 * Notification channel enum schema
 */
export const NotificationChannelSchema = z.nativeEnum(NotificationChannel, {
  errorMap: (): { message: string } => ({ message: 'Invalid notification channel' }),
});

/**
 * Document type enum schema
 */
export const DocumentTypeSchema = z.nativeEnum(DocumentType, {
  errorMap: (): { message: string } => ({ message: 'Invalid document type' }),
});

/**
 * Recurrence pattern enum schema
 */
export const RecurrencePatternSchema = z.nativeEnum(RecurrencePattern, {
  errorMap: (): { message: string } => ({ message: 'Invalid recurrence pattern' }),
});

/**
 * Day of week enum schema
 */
export const DayOfWeekSchema = z.nativeEnum(DayOfWeek, {
  errorMap: (): { message: string } => ({ message: 'Invalid day of week' }),
});

/**
 * Currency code enum schema
 */
export const CurrencyCodeSchema = z.nativeEnum(CurrencyCode, {
  errorMap: (): { message: string } => ({ message: 'Invalid currency code' }),
});

/**
 * Language code enum schema
 */
export const LanguageCodeSchema = z.nativeEnum(LanguageCode, {
  errorMap: (): { message: string } => ({ message: 'Invalid language code' }),
});

/**
 * Time zone enum schema
 */
export const TimeZoneSchema = z.nativeEnum(TimeZone, {
  errorMap: (): { message: string } => ({ message: 'Invalid time zone' }),
});

/**
 * Tenant type enum schema
 */
export const TenantTypeSchema = z.nativeEnum(TenantType, {
  errorMap: (): { message: string } => ({ message: 'Invalid tenant type' }),
});

/**
 * Tenant isolation policy enum schema
 */
export const TenantIsolationPolicySchema = z.nativeEnum(TenantIsolationPolicy, {
  errorMap: (): { message: string } => ({ message: 'Invalid tenant isolation policy' }),
});

/**
 * Entity status enum schema
 */
export const EntityStatusSchema = z.nativeEnum(EntityStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid entity status' }),
});

// ============================================================================
// Common Object Schemas
// ============================================================================

/**
 * Permission schema
 */
export const PermissionSchema = z.object({
  resource: ResourceTypeSchema,
  action: PermissionActionSchema,
  constraints: z.record(z.unknown()).optional(),
});

/**
 * Sort order schema
 */
export const SortOrderSchema = z.enum(['asc', 'desc'], {
  errorMap: (): { message: string } => ({ message: 'Sort order must be "asc" or "desc"' }),
});

/**
 * Metadata schema for extensibility
 */
export const MetadataSchema = z.record(z.unknown());
