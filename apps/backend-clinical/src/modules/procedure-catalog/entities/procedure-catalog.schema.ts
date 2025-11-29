/**
 * Procedure Catalog Schema
 *
 * MongoDB schema for the dental procedure catalog.
 * Contains CDT codes, pricing, and procedure configuration for treatment planning.
 *
 * CLINICAL SAFETY NOTE: This catalog drives:
 * - Treatment plan pricing
 * - Insurance code mapping
 * - Default material allocation
 * - Duration estimation for scheduling
 *
 * Changes to this catalog affect all future treatment plans.
 * Historical treatment plans retain their original pricing.
 *
 * @module procedure-catalog/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Procedure categories based on CDT code ranges
 */
export const PROCEDURE_CATEGORIES = [
  'diagnostic', // D0100-D0999
  'preventive', // D1000-D1999
  'restorative', // D2000-D2999
  'endodontics', // D3000-D3999
  'periodontics', // D4000-D4999
  'prosthodontics_removable', // D5000-D5899
  'maxillofacial_prosthetics', // D5900-D5999
  'implant_services', // D6000-D6199
  'prosthodontics_fixed', // D6200-D6999
  'oral_surgery', // D7000-D7999
  'orthodontics', // D8000-D8999
  'adjunctive', // D9000-D9999
  'custom', // X codes (custom procedures)
] as const;

export type ProcedureCategory = (typeof PROCEDURE_CATEGORIES)[number];

/**
 * Procedure type classification
 */
export const PROCEDURE_TYPES = [
  'single_tooth', // Applies to one tooth
  'multiple_teeth', // Applies to multiple teeth
  'quadrant', // Applies to a quadrant
  'arch', // Applies to an arch
  'full_mouth', // Applies to full mouth
  'per_unit', // Per unit pricing (e.g., pontics)
  'per_surface', // Per surface pricing (fillings)
  'other', // Other procedures
] as const;

export type ProcedureType = (typeof PROCEDURE_TYPES)[number];

// ============================================================================
// EMBEDDED SCHEMAS
// ============================================================================

/**
 * Default material for a procedure
 * Links to inventory catalog for automatic deduction
 */
@Schema({ _id: false })
export class DefaultMaterial {
  @Prop({ required: true, type: String })
  catalogItemId!: string;

  @Prop({ required: true, type: String })
  itemName!: string;

  @Prop({ required: true, type: Number, min: 0 })
  quantity!: number;

  @Prop({ type: String })
  unit?: string;

  @Prop({ type: Boolean, default: false })
  isOptional!: boolean;

  @Prop({ type: [String], default: [] })
  substituteItemIds!: string[];
}

export const DefaultMaterialSchema = SchemaFactory.createForClass(DefaultMaterial);

/**
 * Insurance mapping for the procedure
 */
@Schema({ _id: false })
export class InsuranceMapping {
  @Prop({ type: String })
  insuranceCode?: string;

  @Prop({ type: Number, min: 0, max: 100 })
  typicalCoveragePercent?: number;

  @Prop({ type: Boolean, default: false })
  preAuthRequired!: boolean;

  @Prop({ type: String })
  notes?: string;
}

export const InsuranceMappingSchema = SchemaFactory.createForClass(InsuranceMapping);

// ============================================================================
// MAIN PROCEDURE CATALOG SCHEMA
// ============================================================================

/**
 * Procedure Catalog Document
 *
 * Master catalog of dental procedures with pricing and configuration.
 * Used when building treatment plans.
 *
 * IMPORTANT: Procedure codes follow CDT (Code on Dental Procedures and Nomenclature)
 * which is updated annually by the ADA. Custom codes should start with 'X'.
 */
@Schema({
  timestamps: true,
  collection: 'procedure_catalog',
  optimisticConcurrency: true,
})
export class ProcedureCatalog {
  /**
   * Tenant identifier for multi-tenant isolation
   * CRITICAL: All queries MUST include tenantId
   */
  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  /**
   * Organization identifier
   */
  @Prop({ required: true, type: String, index: true })
  organizationId!: string;

  /**
   * Optional clinic ID if pricing is clinic-specific
   * If null, applies to all clinics in the organization
   */
  @Prop({ type: String, index: true })
  clinicId?: string;

  /**
   * CDT procedure code (e.g., D2391)
   * Custom codes start with 'X'
   */
  @Prop({ required: true, type: String, index: true, maxlength: 10 })
  code!: string;

  /**
   * Procedure name/description
   */
  @Prop({ required: true, type: String, maxlength: 500 })
  name!: string;

  /**
   * Detailed description for staff reference
   */
  @Prop({ type: String, maxlength: 2000 })
  description?: string;

  /**
   * Abbreviation for quick entry
   */
  @Prop({ type: String, maxlength: 20 })
  abbreviation?: string;

  /**
   * Procedure category
   */
  @Prop({ required: true, type: String, enum: PROCEDURE_CATEGORIES })
  category!: ProcedureCategory;

  /**
   * Procedure type classification
   */
  @Prop({ required: true, type: String, enum: PROCEDURE_TYPES, default: 'single_tooth' })
  procedureType!: ProcedureType;

  /**
   * Default price in cents (RON)
   * CLINICAL SAFETY: All monetary values in cents for precision
   */
  @Prop({ required: true, type: Number, min: 0 })
  defaultPriceCents!: number;

  /**
   * Cost price in cents (for margin calculation)
   */
  @Prop({ type: Number, min: 0 })
  costPriceCents?: number;

  /**
   * VAT/Tax rate as decimal (e.g., 0.19 for 19% Romanian VAT)
   */
  @Prop({ required: true, type: Number, min: 0, max: 1, default: 0.19 })
  taxRate!: number;

  /**
   * Default duration in minutes
   */
  @Prop({ required: true, type: Number, min: 1, default: 30 })
  defaultDurationMinutes!: number;

  /**
   * Whether this procedure requires tooth selection
   */
  @Prop({ type: Boolean, default: true })
  requiresTooth!: boolean;

  /**
   * Whether this procedure requires surface selection
   */
  @Prop({ type: Boolean, default: false })
  requiresSurfaces!: boolean;

  /**
   * Whether this procedure requires quadrant selection
   */
  @Prop({ type: Boolean, default: false })
  requiresQuadrant!: boolean;

  /**
   * Whether this procedure requires arch selection
   */
  @Prop({ type: Boolean, default: false })
  requiresArch!: boolean;

  /**
   * Valid surfaces for this procedure
   */
  @Prop({ type: [String], default: [] })
  validSurfaces!: string[];

  /**
   * Minimum number of surfaces (for surface-based procedures)
   */
  @Prop({ type: Number, min: 1 })
  minSurfaces?: number;

  /**
   * Maximum number of surfaces (for surface-based procedures)
   */
  @Prop({ type: Number, min: 1 })
  maxSurfaces?: number;

  /**
   * Insurance mapping information
   */
  @Prop({ type: InsuranceMappingSchema })
  insurance?: InsuranceMapping;

  /**
   * Default materials required for this procedure
   * Used for inventory allocation and cost calculation
   */
  @Prop({ type: [DefaultMaterialSchema], default: [] })
  defaultMaterials!: DefaultMaterial[];

  /**
   * Whether to automatically deduct materials on completion
   */
  @Prop({ type: Boolean, default: true })
  autoDeductMaterials!: boolean;

  /**
   * Provider specialties that can perform this procedure
   */
  @Prop({ type: [String], default: [] })
  allowedSpecialties!: string[];

  /**
   * Minimum provider license level required
   */
  @Prop({ type: String })
  minLicenseLevel?: string;

  /**
   * Related/commonly combined procedure codes
   */
  @Prop({ type: [String], default: [] })
  relatedProcedureCodes!: string[];

  /**
   * Contraindicated procedure codes (should not be combined)
   */
  @Prop({ type: [String], default: [] })
  contraindicatedCodes!: string[];

  /**
   * Whether this procedure is active (can be used in new treatment plans)
   */
  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  /**
   * Display order for UI sorting within category
   */
  @Prop({ type: Number, default: 0 })
  sortOrder!: number;

  /**
   * Tags for search and filtering
   */
  @Prop({ type: [String], default: [] })
  tags!: string[];

  /**
   * User who created the entry
   */
  @Prop({ required: true, type: String })
  createdBy!: string;

  /**
   * User who last updated the entry
   */
  @Prop({ required: true, type: String })
  updatedBy!: string;

  /**
   * Version for optimistic locking
   */
  @Prop({ type: Number, default: 1 })
  version!: number;

  /**
   * Soft delete timestamp
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * User who deleted the entry
   */
  @Prop({ type: String })
  deletedBy?: string;
}

export type ProcedureCatalogDocument = ProcedureCatalog & Document;

export const ProcedureCatalogSchema = SchemaFactory.createForClass(ProcedureCatalog);

// ============================================================================
// INDEXES
// ============================================================================

// Unique constraint: one procedure code per tenant (or per clinic if clinic-specific)
ProcedureCatalogSchema.index(
  { code: 1, tenantId: 1, clinicId: 1 },
  { unique: true, name: 'unique_code_tenant_clinic_idx' },
);

// Search by category
ProcedureCatalogSchema.index(
  { tenantId: 1, category: 1, isActive: 1, sortOrder: 1 },
  { name: 'category_search_idx' },
);

// Full-text search on name and description
ProcedureCatalogSchema.index(
  { name: 'text', description: 'text', abbreviation: 'text', code: 'text' },
  { name: 'text_search_idx', weights: { code: 10, abbreviation: 5, name: 3, description: 1 } },
);

// Active procedures lookup
ProcedureCatalogSchema.index(
  { tenantId: 1, isActive: 1, deletedAt: 1 },
  { name: 'active_procedures_idx' },
);
