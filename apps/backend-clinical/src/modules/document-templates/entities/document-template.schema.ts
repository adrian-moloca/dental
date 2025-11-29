/**
 * Document Template MongoDB Schema
 *
 * Stores legal document templates required by Romanian dental practice law.
 * Templates are stored as HTML with placeholders for dynamic data.
 *
 * @module modules/document-templates/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { UUID } from '@dentalos/shared-types';

/**
 * Document template types per Romanian legal requirements
 */
export enum DocumentTemplateType {
  /** Fișa Pacientului - Patient Registration Form (required by Romanian law) */
  PATIENT_FORM = 'fisa_pacient',
  /** Consimțământ Informat General - General Informed Consent */
  GENERAL_CONSENT = 'consimtamant_general',
  /** Consimțământ Specific pentru Proceduri - Procedure-Specific Consent */
  PROCEDURE_CONSENT = 'consimtamant_procedura',
  /** Anamneză Medicală - Medical History Questionnaire */
  MEDICAL_HISTORY = 'anamneza',
  /** Plan de Tratament - Treatment Plan */
  TREATMENT_PLAN = 'plan_tratament',
  /** Rețetă Medicală - Prescription */
  PRESCRIPTION = 'reteta',
}

/**
 * Document template category for organization
 */
export enum TemplateCategory {
  /** Legal/compliance documents */
  LEGAL = 'legal',
  /** Clinical documents */
  CLINICAL = 'clinical',
  /** Financial documents */
  FINANCIAL = 'financial',
  /** Administrative documents */
  ADMINISTRATIVE = 'administrative',
}

/**
 * Placeholder definition for template variables
 */
export class TemplatePlaceholder {
  @Prop({ required: true, type: String })
  key!: string; // e.g., "patientName", "cnp", "clinicAddress"

  @Prop({ required: true, type: String })
  description!: string; // Human-readable description

  @Prop({ required: true, type: String })
  dataType!: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

  @Prop({ type: Boolean, default: true })
  required!: boolean; // Whether this placeholder must have a value

  @Prop({ type: String })
  defaultValue?: string; // Default value if not provided

  @Prop({ type: String })
  format?: string; // For dates: 'DD/MM/YYYY', for numbers: 'currency'
}

/**
 * Template version for change tracking
 */
export class TemplateVersion {
  @Prop({ required: true, type: String })
  version!: string; // Semantic version: "1.0.0"

  @Prop({ required: true, type: Date })
  effectiveFrom!: Date; // When this version becomes active

  @Prop({ type: Date })
  effectiveUntil?: Date; // When this version is superseded

  @Prop({ required: true, type: String })
  htmlContent!: string; // HTML template with {{placeholder}} syntax

  @Prop({ type: [TemplatePlaceholder], default: [] })
  placeholders!: TemplatePlaceholder[];

  @Prop({ type: String })
  changeNotes?: string; // What changed in this version

  @Prop({ type: String })
  createdBy?: string; // User ID who created this version

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean; // Whether this version can be used
}

/**
 * Clinic-specific template customization
 */
export class ClinicCustomization {
  @Prop({ required: true, type: String })
  clinicId!: string;

  @Prop({ type: String })
  logoUrl?: string; // Clinic-specific logo

  @Prop({ type: String })
  headerHtml?: string; // Custom header HTML

  @Prop({ type: String })
  footerHtml?: string; // Custom footer HTML

  @Prop({ type: Object })
  styles?: Record<string, string>; // CSS overrides: { primaryColor: '#007bff' }

  @Prop({ type: Object })
  customPlaceholders?: Record<string, string>; // Override default values

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

/**
 * Document Template Entity
 *
 * Represents a legal document template with versioning and customization support.
 * Templates are stored as HTML with placeholder substitution.
 */
@Schema({
  timestamps: true,
  collection: 'document_templates',
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, any>) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret._id;
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete ret.__v;
      return ret;
    },
  },
})
export class DocumentTemplate {
  @Prop({ required: true, type: String, unique: true, index: true })
  id!: UUID;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(DocumentTemplateType),
    index: true,
  })
  type!: DocumentTemplateType;

  @Prop({ required: true, type: String })
  name!: string; // Display name: "Fișa Pacientului v2.0"

  @Prop({ required: true, type: String })
  nameRo!: string; // Romanian official name

  @Prop({ type: String })
  description?: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(TemplateCategory),
  })
  category!: TemplateCategory;

  /**
   * Template versions with change tracking
   * The latest active version is used by default
   */
  @Prop({ type: [TemplateVersion], default: [] })
  versions!: TemplateVersion[];

  /**
   * Current active version number
   */
  @Prop({ required: true, type: String, default: '1.0.0' })
  currentVersion!: string;

  /**
   * Clinic-specific customizations
   * Allows clinics to override logos, headers, colors
   */
  @Prop({ type: [ClinicCustomization], default: [] })
  clinicCustomizations!: ClinicCustomization[];

  /**
   * Legal requirements metadata
   */
  @Prop({ type: Object })
  legalRequirements?: {
    /** Romanian law reference */
    lawReference?: string; // e.g., "Legea 95/2006"
    /** Retention period in years */
    retentionYears?: number; // 10 years for clinical documents
    /** Whether signature is required */
    signatureRequired?: boolean;
    /** Whether witness signature is required */
    witnessRequired?: boolean;
  };

  /**
   * Data source configuration
   * Specifies which services to query for placeholder data
   */
  @Prop({ type: Object })
  dataSources?: {
    /** Whether to fetch patient data */
    includePatient?: boolean;
    /** Whether to fetch appointment data */
    includeAppointment?: boolean;
    /** Whether to fetch treatment plan data */
    includeTreatmentPlan?: boolean;
    /** Whether to fetch clinic data */
    includeClinic?: boolean;
    /** Whether to fetch provider data */
    includeProvider?: boolean;
  };

  /**
   * Template settings
   */
  @Prop({ type: Object })
  settings?: {
    /** Page size: 'A4', 'Letter' */
    pageSize?: string;
    /** Page orientation: 'portrait', 'landscape' */
    orientation?: string;
    /** Margins in mm */
    margins?: { top: number; right: number; bottom: number; left: number };
    /** Whether to include page numbers */
    includePageNumbers?: boolean;
    /** Default language */
    defaultLanguage?: string; // 'ro', 'en'
  };

  @Prop({ type: [String], default: [] })
  tags!: string[]; // For search and categorization

  @Prop({
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active',
    index: true,
  })
  status!: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted!: boolean;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: String })
  deletedBy?: string;

  @Prop({ type: Date })
  createdAt!: Date;

  @Prop({ type: Date })
  updatedAt!: Date;

  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Number, default: 1 })
  version!: number;
}

export type DocumentTemplateDocument = DocumentTemplate & Document;

export const DocumentTemplateSchema = SchemaFactory.createForClass(DocumentTemplate);

// Indexes for query optimization
DocumentTemplateSchema.index({ tenantId: 1, type: 1 });
DocumentTemplateSchema.index({ tenantId: 1, status: 1, isDeleted: 1 });
DocumentTemplateSchema.index({ tenantId: 1, category: 1 });
DocumentTemplateSchema.index({ tenantId: 1, tags: 1 });
DocumentTemplateSchema.index({ 'versions.version': 1, 'versions.isActive': 1 });
DocumentTemplateSchema.index({ createdAt: 1 });
DocumentTemplateSchema.index({ updatedAt: 1 });
