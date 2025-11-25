/**
 * Tenant (Organization/Clinic) DTO validation schemas
 * @module shared-validation/dto/tenant
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  SlugSchema,
  URLSchema,
  MetadataSchema,
} from '../schemas/common.schemas';
import {
  OrganizationStatusSchema,
  ClinicStatusSchema,
  AddressSchema,
  ContactInfoSchema,
  OrganizationSettingsSchema,
  ClinicSettingsSchema,
} from '../schemas/tenant.schemas';

// ============================================================================
// Create Organization DTO
// ============================================================================

/**
 * Create organization DTO schema
 */
export const CreateOrganizationDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less'),
  slug: SlugSchema,
  logoUrl: URLSchema.optional(),
  metadata: MetadataSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
});

// ============================================================================
// Update Organization DTO
// ============================================================================

/**
 * Update organization DTO schema
 */
export const UpdateOrganizationDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200, 'Organization name must be 200 characters or less').optional(),
  slug: SlugSchema.optional(),
  status: OrganizationStatusSchema.optional(),
  logoUrl: URLSchema.optional(),
  metadata: MetadataSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
});

// ============================================================================
// Organization Response DTO
// ============================================================================

/**
 * Organization response DTO schema
 */
export const OrganizationResponseDtoSchema = z.object({
  id: UUIDSchema,
  name: z.string(),
  slug: z.string(),
  status: OrganizationStatusSchema,
  logoUrl: z.string().optional(),
  metadata: MetadataSchema.optional(),
  settings: OrganizationSettingsSchema.optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

// ============================================================================
// Create Clinic DTO
// ============================================================================

/**
 * Create clinic DTO schema
 */
export const CreateClinicDtoSchema = z.object({
  organizationId: UUIDSchema,
  name: NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less'),
  slug: SlugSchema,
  address: AddressSchema.optional(),
  contact: ContactInfoSchema.optional(),
  metadata: MetadataSchema.optional(),
  settings: ClinicSettingsSchema.optional(),
});

// ============================================================================
// Update Clinic DTO
// ============================================================================

/**
 * Update clinic DTO schema
 */
export const UpdateClinicDtoSchema = z.object({
  name: NonEmptyStringSchema.max(200, 'Clinic name must be 200 characters or less').optional(),
  slug: SlugSchema.optional(),
  status: ClinicStatusSchema.optional(),
  address: AddressSchema.optional(),
  contact: ContactInfoSchema.optional(),
  metadata: MetadataSchema.optional(),
  settings: ClinicSettingsSchema.optional(),
});

// ============================================================================
// Clinic Response DTO
// ============================================================================

/**
 * Clinic response DTO schema
 */
export const ClinicResponseDtoSchema = z.object({
  id: UUIDSchema,
  organizationId: UUIDSchema,
  name: z.string(),
  slug: z.string(),
  status: ClinicStatusSchema,
  address: AddressSchema.optional(),
  contact: ContactInfoSchema.optional(),
  metadata: MetadataSchema.optional(),
  settings: ClinicSettingsSchema.optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
});

// ============================================================================
// Organization Query DTO
// ============================================================================

/**
 * Organization query parameters DTO schema
 */
export const OrganizationQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'slug', 'createdAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  status: OrganizationStatusSchema.optional(),
  search: z.string().trim().optional(),
});

// ============================================================================
// Clinic Query DTO
// ============================================================================

/**
 * Clinic query parameters DTO schema
 */
export const ClinicQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'slug', 'createdAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  organizationId: UUIDSchema.optional(),
  status: ClinicStatusSchema.optional(),
  search: z.string().trim().optional(),
});

// ============================================================================
// Update Organization Status DTO
// ============================================================================

/**
 * Update organization status DTO schema
 */
export const UpdateOrganizationStatusDtoSchema = z.object({
  status: OrganizationStatusSchema,
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
});

// ============================================================================
// Update Clinic Status DTO
// ============================================================================

/**
 * Update clinic status DTO schema
 */
export const UpdateClinicStatusDtoSchema = z.object({
  status: ClinicStatusSchema,
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type CreateOrganizationDtoInput = z.input<typeof CreateOrganizationDtoSchema>;
export type CreateOrganizationDtoOutput = z.output<typeof CreateOrganizationDtoSchema>;
export type UpdateOrganizationDtoInput = z.input<typeof UpdateOrganizationDtoSchema>;
export type UpdateOrganizationDtoOutput = z.output<typeof UpdateOrganizationDtoSchema>;
export type OrganizationResponseDtoInput = z.input<typeof OrganizationResponseDtoSchema>;
export type OrganizationResponseDtoOutput = z.output<typeof OrganizationResponseDtoSchema>;
export type CreateClinicDtoInput = z.input<typeof CreateClinicDtoSchema>;
export type CreateClinicDtoOutput = z.output<typeof CreateClinicDtoSchema>;
export type UpdateClinicDtoInput = z.input<typeof UpdateClinicDtoSchema>;
export type UpdateClinicDtoOutput = z.output<typeof UpdateClinicDtoSchema>;
export type ClinicResponseDtoInput = z.input<typeof ClinicResponseDtoSchema>;
export type ClinicResponseDtoOutput = z.output<typeof ClinicResponseDtoSchema>;
export type OrganizationQueryParamsInput = z.input<typeof OrganizationQueryParamsSchema>;
export type OrganizationQueryParamsOutput = z.output<typeof OrganizationQueryParamsSchema>;
export type ClinicQueryParamsInput = z.input<typeof ClinicQueryParamsSchema>;
export type ClinicQueryParamsOutput = z.output<typeof ClinicQueryParamsSchema>;
export type UpdateOrganizationStatusDtoInput = z.input<typeof UpdateOrganizationStatusDtoSchema>;
export type UpdateOrganizationStatusDtoOutput = z.output<typeof UpdateOrganizationStatusDtoSchema>;
export type UpdateClinicStatusDtoInput = z.input<typeof UpdateClinicStatusDtoSchema>;
export type UpdateClinicStatusDtoOutput = z.output<typeof UpdateClinicStatusDtoSchema>;
