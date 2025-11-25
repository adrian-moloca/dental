/**
 * Organization and clinic validation schemas
 * @module shared-validation/schemas/tenant
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  SlugSchema,
  TenantTypeSchema,
  TenantIsolationPolicySchema,
  MetadataSchema,
  URLSchema,
} from './common.schemas';

// ============================================================================
// Address Schema
// ============================================================================

/**
 * Physical address schema
 */
export const AddressSchema = z.object({
  street: z.string().max(200, 'Street must be 200 characters or less').optional(),
  city: z.string().max(100, 'City must be 100 characters or less').optional(),
  state: z.string().max(100, 'State must be 100 characters or less').optional(),
  postalCode: z.string().max(20, 'Postal code must be 20 characters or less').optional(),
  country: z.string().max(100, 'Country must be 100 characters or less').optional(),
});

// ============================================================================
// Contact Information Schema
// ============================================================================

/**
 * Contact information schema
 */
export const ContactInfoSchema = z.object({
  phone: PhoneNumberSchema.optional(),
  email: EmailSchema.optional(),
  website: URLSchema.optional(),
});

// ============================================================================
// Organization Schema
// ============================================================================

/**
 * Organization status schema
 */
export const OrganizationStatusSchema = z.enum(['active', 'inactive', 'suspended'], {
  errorMap: (): { message: string } => ({ message: 'Invalid organization status' }),
});

/**
 * Organization entity schema
 */
export const OrganizationSchema = z.object({
  id: UUIDSchema,
  name: NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less'),
  slug: SlugSchema,
  status: OrganizationStatusSchema,
  logoUrl: URLSchema.optional(),
  metadata: MetadataSchema.optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  deletedAt: ISODateStringSchema.nullable().optional(),
  createdBy: UUIDSchema.optional(),
  updatedBy: UUIDSchema.optional(),
  deletedBy: UUIDSchema.nullable().optional(),
  version: z.number().int().nonnegative().default(1),
});

// ============================================================================
// Clinic Schema
// ============================================================================

/**
 * Clinic status schema
 */
export const ClinicStatusSchema = z.enum(['active', 'inactive', 'suspended'], {
  errorMap: (): { message: string } => ({ message: 'Invalid clinic status' }),
});

/**
 * Clinic entity schema
 */
export const ClinicSchema = z
  .object({
    id: UUIDSchema,
    organizationId: UUIDSchema,
    name: NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less'),
    slug: SlugSchema,
    status: ClinicStatusSchema,
    address: AddressSchema.optional(),
    contact: ContactInfoSchema.optional(),
    metadata: MetadataSchema.optional(),
    createdAt: ISODateStringSchema,
    updatedAt: ISODateStringSchema,
    deletedAt: ISODateStringSchema.nullable().optional(),
    createdBy: UUIDSchema.optional(),
    updatedBy: UUIDSchema.optional(),
    deletedBy: UUIDSchema.nullable().optional(),
    version: z.number().int().nonnegative().default(1),
  })
  .refine(
    (data): boolean => {
      // Slug must be unique within organization
      // This validation will be enforced at the service layer
      return data.slug.length > 0;
    },
    {
      message: 'Clinic slug must be unique within the organization',
      path: ['slug'],
    },
  );

// ============================================================================
// Tenant Context Schemas
// ============================================================================

/**
 * Tenant scoped base schema
 */
export const TenantScopedSchema = z.object({
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

/**
 * Tenant context schema
 */
export const TenantContextSchema = z.object({
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  tenantType: TenantTypeSchema,
});

/**
 * Tenant scope filter schema
 */
export const TenantScopeFilterSchema = z.object({
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  includeChildren: z.boolean().default(false),
});

/**
 * Multi-tenant query options schema
 */
export const MultiTenantQueryOptionsSchema = z.object({
  scope: TenantScopeFilterSchema,
  isolationPolicy: TenantIsolationPolicySchema.optional(),
});

// ============================================================================
// Organization Settings Schema
// ============================================================================

/**
 * Organization settings schema
 */
export const OrganizationSettingsSchema = z.object({
  timezone: z.string().default('UTC'),
  locale: z.string().default('en-US'),
  currency: z.string().length(3, 'Currency code must be 3 characters').default('USD'),
  dateFormat: z.string().default('YYYY-MM-DD'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  weekStartsOn: z.number().int().min(0).max(6).default(0),
  features: z.record(z.boolean()).default({}),
  branding: z
    .object({
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      logoUrl: URLSchema.optional(),
      faviconUrl: URLSchema.optional(),
    })
    .optional(),
});

/**
 * Clinic settings schema
 */
export const ClinicSettingsSchema = z.object({
  timezone: z.string().optional(),
  locale: z.string().optional(),
  appointmentDuration: z.number().int().positive().default(30), // minutes
  operatingHours: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
        closeTime: z.string().regex(/^\d{2}:\d{2}$/),
        isClosed: z.boolean().default(false),
      }),
    )
    .optional(),
  features: z.record(z.boolean()).default({}),
});

// ============================================================================
// Type Inference
// ============================================================================

export type AddressInput = z.input<typeof AddressSchema>;
export type AddressOutput = z.output<typeof AddressSchema>;
export type ContactInfoInput = z.input<typeof ContactInfoSchema>;
export type ContactInfoOutput = z.output<typeof ContactInfoSchema>;
export type OrganizationInput = z.input<typeof OrganizationSchema>;
export type OrganizationOutput = z.output<typeof OrganizationSchema>;
export type ClinicInput = z.input<typeof ClinicSchema>;
export type ClinicOutput = z.output<typeof ClinicSchema>;
export type TenantScopedInput = z.input<typeof TenantScopedSchema>;
export type TenantScopedOutput = z.output<typeof TenantScopedSchema>;
export type TenantContextInput = z.input<typeof TenantContextSchema>;
export type TenantContextOutput = z.output<typeof TenantContextSchema>;
export type TenantScopeFilterInput = z.input<typeof TenantScopeFilterSchema>;
export type TenantScopeFilterOutput = z.output<typeof TenantScopeFilterSchema>;
export type MultiTenantQueryOptionsInput = z.input<typeof MultiTenantQueryOptionsSchema>;
export type MultiTenantQueryOptionsOutput = z.output<typeof MultiTenantQueryOptionsSchema>;
export type OrganizationSettingsInput = z.input<typeof OrganizationSettingsSchema>;
export type OrganizationSettingsOutput = z.output<typeof OrganizationSettingsSchema>;
export type ClinicSettingsInput = z.input<typeof ClinicSettingsSchema>;
export type ClinicSettingsOutput = z.output<typeof ClinicSettingsSchema>;
