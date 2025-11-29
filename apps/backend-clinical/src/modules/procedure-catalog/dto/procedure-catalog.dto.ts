/**
 * Procedure Catalog DTOs with Zod Validation
 *
 * Data transfer objects for procedure catalog operations.
 * Uses Zod for runtime validation with type inference.
 *
 * CLINICAL SAFETY: All inputs are validated to prevent:
 * - Invalid CDT codes
 * - Negative pricing
 * - Invalid tax rates
 * - Invalid procedure configurations
 *
 * @module procedure-catalog/dto
 */

import { z } from 'zod';
import { PROCEDURE_CATEGORIES, PROCEDURE_TYPES } from '../entities/procedure-catalog.schema';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * CDT code format validation (D followed by 4 digits)
 * Also allows custom codes starting with X
 */
const CDT_CODE_REGEX = /^D\d{4}$/;
const procedureCodeSchema = z
  .string()
  .min(1, 'Procedure code is required')
  .max(10, 'Procedure code too long')
  .refine(
    (code) => CDT_CODE_REGEX.test(code) || code.startsWith('X'),
    'Procedure code must be CDT format (D####) or custom (X...)',
  );

/**
 * Non-negative integer in cents
 */
const centsSchema = z
  .number()
  .int('Amount must be an integer (cents)')
  .nonnegative('Amount cannot be negative');

/**
 * Valid tooth surfaces
 */
const VALID_SURFACES = ['M', 'O', 'D', 'B', 'L', 'I', 'F'] as const;

// ============================================================================
// DEFAULT MATERIAL SCHEMA
// ============================================================================

export const DefaultMaterialDtoSchema = z.object({
  catalogItemId: z.string().min(1, 'Catalog item ID is required'),
  itemName: z.string().min(1, 'Item name is required').max(200),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().max(50).optional(),
  isOptional: z.boolean().default(false),
  substituteItemIds: z.array(z.string()).default([]),
});

export type DefaultMaterialDto = z.infer<typeof DefaultMaterialDtoSchema>;

// ============================================================================
// INSURANCE MAPPING SCHEMA
// ============================================================================

export const InsuranceMappingDtoSchema = z.object({
  insuranceCode: z.string().max(20).optional(),
  typicalCoveragePercent: z.number().min(0).max(100).optional(),
  preAuthRequired: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export type InsuranceMappingDto = z.infer<typeof InsuranceMappingDtoSchema>;

// ============================================================================
// CREATE PROCEDURE CATALOG SCHEMA
// ============================================================================

export const CreateProcedureCatalogSchema = z
  .object({
    code: procedureCodeSchema,
    name: z.string().min(1, 'Procedure name is required').max(500),
    description: z.string().max(2000).optional(),
    abbreviation: z.string().max(20).optional(),
    category: z.enum(PROCEDURE_CATEGORIES),
    procedureType: z.enum(PROCEDURE_TYPES).default('single_tooth'),
    defaultPriceCents: centsSchema,
    costPriceCents: centsSchema.optional(),
    taxRate: z.number().min(0).max(1).default(0.19), // 19% Romanian VAT default
    defaultDurationMinutes: z.number().int().positive().default(30),
    requiresTooth: z.boolean().default(true),
    requiresSurfaces: z.boolean().default(false),
    requiresQuadrant: z.boolean().default(false),
    requiresArch: z.boolean().default(false),
    validSurfaces: z.array(z.enum(VALID_SURFACES)).default([]),
    minSurfaces: z.number().int().positive().optional(),
    maxSurfaces: z.number().int().positive().optional(),
    insurance: InsuranceMappingDtoSchema.optional(),
    defaultMaterials: z.array(DefaultMaterialDtoSchema).default([]),
    autoDeductMaterials: z.boolean().default(true),
    allowedSpecialties: z.array(z.string().max(100)).default([]),
    minLicenseLevel: z.string().max(50).optional(),
    relatedProcedureCodes: z.array(procedureCodeSchema).default([]),
    contraindicatedCodes: z.array(procedureCodeSchema).default([]),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().nonnegative().default(0),
    tags: z.array(z.string().max(50)).default([]),
    clinicId: z.string().uuid().optional(), // If clinic-specific pricing
  })
  .refine(
    (data) => {
      // If surfaces are required, must have valid surfaces defined
      if (data.requiresSurfaces && data.validSurfaces.length === 0) {
        return false;
      }
      return true;
    },
    { message: 'Valid surfaces must be defined when surfaces are required' },
  )
  .refine(
    (data) => {
      // If min/max surfaces defined, ensure min <= max
      if (data.minSurfaces && data.maxSurfaces && data.minSurfaces > data.maxSurfaces) {
        return false;
      }
      return true;
    },
    { message: 'Minimum surfaces cannot exceed maximum surfaces' },
  );

export type CreateProcedureCatalogDto = z.infer<typeof CreateProcedureCatalogSchema>;

// DTO class for controller type annotation
export class CreateProcedureCatalogDtoClass implements CreateProcedureCatalogDto {
  code!: string;
  name!: string;
  description?: string;
  abbreviation?: string;
  category!: (typeof PROCEDURE_CATEGORIES)[number];
  procedureType!: (typeof PROCEDURE_TYPES)[number];
  defaultPriceCents!: number;
  costPriceCents?: number;
  taxRate!: number;
  defaultDurationMinutes!: number;
  requiresTooth!: boolean;
  requiresSurfaces!: boolean;
  requiresQuadrant!: boolean;
  requiresArch!: boolean;
  validSurfaces!: (typeof VALID_SURFACES)[number][];
  minSurfaces?: number;
  maxSurfaces?: number;
  insurance?: InsuranceMappingDto;
  defaultMaterials!: DefaultMaterialDto[];
  autoDeductMaterials!: boolean;
  allowedSpecialties!: string[];
  minLicenseLevel?: string;
  relatedProcedureCodes!: string[];
  contraindicatedCodes!: string[];
  isActive!: boolean;
  sortOrder!: number;
  tags!: string[];
  clinicId?: string;
}

// ============================================================================
// UPDATE PROCEDURE CATALOG SCHEMA
// ============================================================================

/**
 * Base schema for updates (without refinements, which break .partial())
 */
const UpdateProcedureCatalogBaseSchema = z.object({
  name: z.string().min(1, 'Procedure name is required').max(500).optional(),
  description: z.string().max(2000).optional(),
  abbreviation: z.string().max(20).optional(),
  category: z.enum(PROCEDURE_CATEGORIES).optional(),
  procedureType: z.enum(PROCEDURE_TYPES).optional(),
  defaultPriceCents: centsSchema.optional(),
  costPriceCents: centsSchema.optional(),
  taxRate: z.number().min(0).max(1).optional(),
  defaultDurationMinutes: z.number().int().positive().optional(),
  requiresTooth: z.boolean().optional(),
  requiresSurfaces: z.boolean().optional(),
  requiresQuadrant: z.boolean().optional(),
  requiresArch: z.boolean().optional(),
  validSurfaces: z.array(z.enum(VALID_SURFACES)).optional(),
  minSurfaces: z.number().int().positive().optional(),
  maxSurfaces: z.number().int().positive().optional(),
  insurance: InsuranceMappingDtoSchema.optional(),
  defaultMaterials: z.array(DefaultMaterialDtoSchema).optional(),
  autoDeductMaterials: z.boolean().optional(),
  allowedSpecialties: z.array(z.string().max(100)).optional(),
  minLicenseLevel: z.string().max(50).optional(),
  relatedProcedureCodes: z.array(procedureCodeSchema).optional(),
  contraindicatedCodes: z.array(procedureCodeSchema).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  tags: z.array(z.string().max(50)).optional(),
  clinicId: z.string().uuid().optional(),
});

export const UpdateProcedureCatalogSchema = UpdateProcedureCatalogBaseSchema;

export type UpdateProcedureCatalogDto = z.infer<typeof UpdateProcedureCatalogSchema>;

export class UpdateProcedureCatalogDtoClass implements UpdateProcedureCatalogDto {
  name?: string;
  description?: string;
  abbreviation?: string;
  category?: (typeof PROCEDURE_CATEGORIES)[number];
  procedureType?: (typeof PROCEDURE_TYPES)[number];
  defaultPriceCents?: number;
  costPriceCents?: number;
  taxRate?: number;
  defaultDurationMinutes?: number;
  requiresTooth?: boolean;
  requiresSurfaces?: boolean;
  requiresQuadrant?: boolean;
  requiresArch?: boolean;
  validSurfaces?: (typeof VALID_SURFACES)[number][];
  minSurfaces?: number;
  maxSurfaces?: number;
  insurance?: InsuranceMappingDto;
  defaultMaterials?: DefaultMaterialDto[];
  autoDeductMaterials?: boolean;
  allowedSpecialties?: string[];
  minLicenseLevel?: string;
  relatedProcedureCodes?: string[];
  contraindicatedCodes?: string[];
  isActive?: boolean;
  sortOrder?: number;
  tags?: string[];
  clinicId?: string;
}

// ============================================================================
// QUERY SCHEMA
// ============================================================================

export const ProcedureCatalogQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(PROCEDURE_CATEGORIES).optional(),
  procedureType: z.enum(PROCEDURE_TYPES).optional(),
  isActive: z.coerce.boolean().optional(),
  includeDeleted: z.coerce.boolean().default(false),
  clinicId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z
    .enum(['code', 'name', 'category', 'defaultPriceCents', 'sortOrder', 'createdAt'])
    .default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ProcedureCatalogQueryDto = z.infer<typeof ProcedureCatalogQuerySchema>;

export class ProcedureCatalogQueryDtoClass implements ProcedureCatalogQueryDto {
  search?: string;
  category?: (typeof PROCEDURE_CATEGORIES)[number];
  procedureType?: (typeof PROCEDURE_TYPES)[number];
  isActive?: boolean;
  includeDeleted!: boolean;
  clinicId?: string;
  page!: number;
  limit!: number;
  sortBy!: 'code' | 'name' | 'category' | 'defaultPriceCents' | 'sortOrder' | 'createdAt';
  sortOrder!: 'asc' | 'desc';
}

// ============================================================================
// RESPONSE SCHEMA
// ============================================================================

export const ProcedureCatalogResponseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  organizationId: z.string(),
  clinicId: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  abbreviation: z.string().optional(),
  category: z.enum(PROCEDURE_CATEGORIES),
  procedureType: z.enum(PROCEDURE_TYPES),
  defaultPriceCents: z.number(),
  costPriceCents: z.number().optional(),
  taxRate: z.number(),
  defaultDurationMinutes: z.number(),
  requiresTooth: z.boolean(),
  requiresSurfaces: z.boolean(),
  requiresQuadrant: z.boolean(),
  requiresArch: z.boolean(),
  validSurfaces: z.array(z.string()),
  minSurfaces: z.number().optional(),
  maxSurfaces: z.number().optional(),
  insurance: InsuranceMappingDtoSchema.optional(),
  defaultMaterials: z.array(DefaultMaterialDtoSchema),
  autoDeductMaterials: z.boolean(),
  allowedSpecialties: z.array(z.string()),
  minLicenseLevel: z.string().optional(),
  relatedProcedureCodes: z.array(z.string()),
  contraindicatedCodes: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number(),
  tags: z.array(z.string()),
  version: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type ProcedureCatalogResponseDto = z.infer<typeof ProcedureCatalogResponseSchema>;

// ============================================================================
// PAGINATED RESPONSE SCHEMA
// ============================================================================

export const PaginatedProcedureCatalogSchema = z.object({
  data: z.array(ProcedureCatalogResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

export type PaginatedProcedureCatalogDto = z.infer<typeof PaginatedProcedureCatalogSchema>;

// ============================================================================
// BULK IMPORT SCHEMA
// ============================================================================

export const BulkImportProcedureSchema = z.object({
  procedures: z.array(CreateProcedureCatalogSchema).min(1).max(500),
  updateExisting: z.boolean().default(false), // If true, update existing codes; if false, skip
});

export type BulkImportProcedureDto = z.infer<typeof BulkImportProcedureSchema>;

export class BulkImportProcedureDtoClass implements BulkImportProcedureDto {
  procedures!: CreateProcedureCatalogDto[];
  updateExisting!: boolean;
}

export const BulkImportResultSchema = z.object({
  imported: z.number(),
  updated: z.number(),
  skipped: z.number(),
  errors: z.array(
    z.object({
      code: z.string(),
      error: z.string(),
    }),
  ),
});

export type BulkImportResultDto = z.infer<typeof BulkImportResultSchema>;
