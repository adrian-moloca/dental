import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

/**
 * Material requirement for a procedure
 */
export class MaterialRequirement {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  productName!: string;

  @Prop({ required: true, default: 1, min: 0.001 })
  quantityPerUnit!: number;

  @Prop()
  unitOfMeasure?: string;

  @Prop({ default: false })
  isOptional!: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  substitutes?: Types.ObjectId[];

  @Prop()
  notes?: string;
}

export type ProcedureTemplateDocument = HydratedDocument<ProcedureTemplate>;

/**
 * ProcedureTemplate Schema
 *
 * Maps dental procedure codes (CDT/CPT) to material requirements.
 * Used for automatic stock deduction when a procedure is completed.
 *
 * Example: D0120 (Periodic oral evaluation) might use:
 * - 1x disposable mirror
 * - 2x examination gloves
 * - 1x patient bib
 *
 * Key Features:
 * - Multi-tenant support (each clinic can customize templates)
 * - Optional materials for varying scenarios
 * - Substitute materials for stock shortages
 * - Auto-deduction toggle per template
 */
@Schema({
  collection: 'procedure_templates',
  timestamps: true,
})
export class ProcedureTemplate extends Document {
  /**
   * Procedure code (CDT/CPT code)
   * e.g., D0120, D1110, D2740
   */
  @Prop({ required: true, index: true })
  procedureCode!: string;

  /**
   * Human-readable procedure name
   */
  @Prop({ required: true })
  procedureName!: string;

  /**
   * Procedure category for grouping
   */
  @Prop({
    type: String,
    enum: [
      'diagnostic',
      'preventive',
      'restorative',
      'endodontic',
      'periodontic',
      'prosthodontic',
      'oral_surgery',
      'orthodontic',
      'implant',
      'other',
    ],
    default: 'other',
  })
  category!: string;

  /**
   * Materials required for this procedure
   */
  @Prop({ type: [MaterialRequirement], default: [] })
  materials!: MaterialRequirement[];

  /**
   * Whether to auto-deduct stock when procedure is completed
   */
  @Prop({ required: true, default: true })
  autoDeductOnComplete!: boolean;

  /**
   * Estimated procedure duration in minutes
   * Used for inventory planning and forecasting
   */
  @Prop()
  estimatedDurationMinutes?: number;

  /**
   * Active flag for soft deletion
   */
  @Prop({ required: true, default: true })
  isActive!: boolean;

  /**
   * Template notes/instructions
   */
  @Prop()
  notes?: string;

  // Multi-tenant fields
  @Prop({ required: true, index: true })
  tenantId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ index: true })
  clinicId?: string; // Optional: clinic-specific overrides

  // Audit fields
  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const ProcedureTemplateSchema = SchemaFactory.createForClass(ProcedureTemplate);

// Compound indexes for common queries
ProcedureTemplateSchema.index({ tenantId: 1, procedureCode: 1 });
ProcedureTemplateSchema.index({ tenantId: 1, category: 1 });
ProcedureTemplateSchema.index({ tenantId: 1, clinicId: 1, procedureCode: 1 }, { unique: true });
