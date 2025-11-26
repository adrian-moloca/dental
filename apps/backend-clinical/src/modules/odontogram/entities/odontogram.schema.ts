/**
 * Odontogram Schema
 *
 * MongoDB schema for tooth charting data using FDI (Federation Dentaire Internationale)
 * numbering system. This schema supports:
 * - Permanent teeth: 11-18, 21-28, 31-38, 41-48
 * - Deciduous (primary) teeth: 51-55, 61-65, 71-75, 81-85
 *
 * CLINICAL SAFETY NOTE: This schema stores critical clinical data that affects
 * treatment planning, billing, and patient safety. All changes are versioned
 * and audited. Never hard-delete records.
 *
 * @module odontogram/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Valid FDI tooth numbers for permanent dentition
 * Quadrant 1 (upper right): 11-18
 * Quadrant 2 (upper left): 21-28
 * Quadrant 3 (lower left): 31-38
 * Quadrant 4 (lower right): 41-48
 */
export const PERMANENT_TEETH = [
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
] as const;

/**
 * Valid FDI tooth numbers for deciduous (primary) dentition
 * Quadrant 5 (upper right): 51-55
 * Quadrant 6 (upper left): 61-65
 * Quadrant 7 (lower left): 71-75
 * Quadrant 8 (lower right): 81-85
 */
export const DECIDUOUS_TEETH = [
  '51',
  '52',
  '53',
  '54',
  '55',
  '61',
  '62',
  '63',
  '64',
  '65',
  '71',
  '72',
  '73',
  '74',
  '75',
  '81',
  '82',
  '83',
  '84',
  '85',
] as const;

/**
 * All valid FDI tooth numbers
 */
export const ALL_TEETH = [...PERMANENT_TEETH, ...DECIDUOUS_TEETH] as const;

export type FDIToothNumber = (typeof ALL_TEETH)[number];

/**
 * Tooth surfaces using standard dental nomenclature
 * M - Mesial: Surface facing toward front/midline
 * O - Occlusal: Chewing surface (posterior teeth)
 * D - Distal: Surface facing toward back
 * B - Buccal/Facial: Outer surface facing cheek/lips
 * L - Lingual/Palatal: Inner surface facing tongue/palate
 * I - Incisal: Biting edge (anterior teeth)
 */
export const TOOTH_SURFACES = ['M', 'O', 'D', 'B', 'L', 'I'] as const;
export type ToothSurface = (typeof TOOTH_SURFACES)[number];

/**
 * Tooth conditions aligned with clinical terminology
 * and the shared-events ToothCondition type
 */
export const TOOTH_CONDITIONS = [
  'healthy',
  'caries',
  'filling',
  'crown',
  'root_canal',
  'extraction',
  'implant',
  'bridge',
  'veneer',
  'missing',
  'impacted',
  'fractured',
  'watch',
  'sealant',
  'temporary',
  'post_and_core',
  'onlay_inlay',
  'abscess',
  'mobile',
  'root_remnants',
] as const;

export type ToothCondition = (typeof TOOTH_CONDITIONS)[number];

/**
 * Severity levels for conditions
 */
export const CONDITION_SEVERITIES = ['mild', 'moderate', 'severe'] as const;
export type ConditionSeverity = (typeof CONDITION_SEVERITIES)[number];

/**
 * Material types commonly used in restorations
 */
export const RESTORATION_MATERIALS = [
  'amalgam',
  'composite',
  'glass_ionomer',
  'ceramic',
  'porcelain',
  'gold',
  'titanium',
  'zirconia',
  'emax',
  'pfm', // Porcelain fused to metal
  'temporary',
  'other',
] as const;

export type RestorationMaterial = (typeof RESTORATION_MATERIALS)[number];

/**
 * Mobility classification (Miller's classification)
 * 0 - Normal
 * 1 - Slightly mobile (up to 1mm horizontal)
 * 2 - Moderately mobile (1-2mm horizontal)
 * 3 - Severely mobile (>2mm or vertical mobility)
 */
export type MobilityGrade = 0 | 1 | 2 | 3;

/**
 * Furcation involvement classification (Glickman)
 */
export const FURCATION_CLASSES = ['none', 'class_1', 'class_2', 'class_3'] as const;
export type FurcationClass = (typeof FURCATION_CLASSES)[number];

/**
 * Surface condition - condition applied to specific tooth surfaces
 *
 * Clinical note: A tooth can have multiple conditions on different surfaces.
 * For example, tooth 16 could have:
 * - Mesial surface: filling
 * - Occlusal surface: caries
 * - Distal surface: healthy
 */
@Schema({ _id: true, timestamps: true })
export class ToothConditionRecord {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Type of condition (e.g., 'caries', 'filling', 'crown')
   */
  @Prop({
    required: true,
    type: String,
    enum: TOOTH_CONDITIONS,
  })
  condition!: ToothCondition;

  /**
   * Surfaces affected by this condition
   * Empty array means entire tooth is affected
   */
  @Prop({
    type: [String],
    enum: TOOTH_SURFACES,
    default: [],
  })
  surfaces!: ToothSurface[];

  /**
   * Severity of the condition (e.g., for caries)
   */
  @Prop({
    type: String,
    enum: CONDITION_SEVERITIES,
  })
  severity?: ConditionSeverity;

  /**
   * Material used (for restorations)
   */
  @Prop({
    type: String,
    enum: RESTORATION_MATERIALS,
  })
  material?: RestorationMaterial;

  /**
   * Date condition was recorded or procedure was performed
   */
  @Prop({ type: Date, default: Date.now })
  recordedAt!: Date;

  /**
   * Provider who recorded/performed this
   */
  @Prop({ required: true, type: String })
  recordedBy!: string;

  /**
   * Clinical notes specific to this condition
   */
  @Prop({ type: String, maxlength: 2000 })
  notes?: string;

  /**
   * Reference to procedure that created this condition (if applicable)
   */
  @Prop({ type: String })
  procedureId?: string;

  /**
   * CDT code associated with this condition/restoration
   */
  @Prop({ type: String })
  cdtCode?: string;

  /**
   * Soft delete flag - conditions are never hard deleted
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * User who performed the soft delete
   */
  @Prop({ type: String })
  deletedBy?: string;

  /**
   * Reason for removal (required for audit trail)
   */
  @Prop({ type: String })
  deleteReason?: string;
}

export const ToothConditionRecordSchema = SchemaFactory.createForClass(ToothConditionRecord);

/**
 * Complete status of a single tooth
 *
 * Captures all conditions, clinical observations, and notes for one tooth.
 * Multiple conditions can coexist (e.g., Crown + RCT + Watch)
 */
@Schema({ _id: false })
export class ToothData {
  /**
   * FDI tooth number (e.g., '11', '48', '55')
   */
  @Prop({
    required: true,
    type: String,
    enum: ALL_TEETH,
  })
  toothNumber!: FDIToothNumber;

  /**
   * Whether the tooth is currently present in the mouth
   */
  @Prop({ type: Boolean, default: true })
  isPresent!: boolean;

  /**
   * Whether this is a primary (deciduous) tooth
   * Teeth 51-85 are always primary
   */
  @Prop({ type: Boolean, default: false })
  isPrimary!: boolean;

  /**
   * Whether this is a supernumerary (extra) tooth
   */
  @Prop({ type: Boolean, default: false })
  isSupernumerary!: boolean;

  /**
   * Whether tooth has implant
   */
  @Prop({ type: Boolean, default: false })
  isImplant!: boolean;

  /**
   * All conditions affecting this tooth (current and historical)
   */
  @Prop({ type: [ToothConditionRecordSchema], default: [] })
  conditions!: ToothConditionRecord[];

  /**
   * Mobility score (Miller's classification: 0-3)
   * 0 = normal, 3 = severe mobility
   */
  @Prop({ type: Number, min: 0, max: 3 })
  mobility?: MobilityGrade;

  /**
   * Furcation involvement (for multi-rooted teeth)
   * Only applicable to molars
   */
  @Prop({ type: String, enum: FURCATION_CLASSES })
  furcation?: FurcationClass;

  /**
   * General clinical notes for this tooth
   */
  @Prop({ type: String, maxlength: 2000 })
  notes?: string;

  /**
   * Last modification timestamp
   */
  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;

  /**
   * Last modifier
   */
  @Prop({ type: String })
  updatedBy?: string;
}

export const ToothDataSchema = SchemaFactory.createForClass(ToothData);

/**
 * Patient Odontogram - Complete tooth chart for a patient
 *
 * This is the aggregate root for all tooth charting data.
 * Contains the current state of all teeth with full history.
 *
 * IMPORTANT: This document uses optimistic locking via the version field.
 * Always check version before updates to prevent concurrent modification.
 */
@Schema({
  timestamps: true,
  collection: 'odontograms',
  optimisticConcurrency: true,
})
export class Odontogram {
  /**
   * Patient identifier (from Patient Service)
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

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
   * Clinic identifier
   */
  @Prop({ required: true, type: String, index: true })
  clinicId!: string;

  /**
   * Map of tooth number to tooth data
   * Key is FDI tooth number (string)
   */
  @Prop({ type: Map, of: ToothDataSchema, required: true })
  teeth!: Map<string, ToothData>;

  /**
   * Numbering system used (always 'FDI' for this implementation)
   */
  @Prop({ type: String, default: 'FDI' })
  numberingSystem!: string;

  /**
   * Whether patient has full adult dentition
   * False for pediatric patients with mixed/primary dentition
   */
  @Prop({ type: Boolean, default: true })
  isAdultDentition!: boolean;

  /**
   * General notes about the patient's oral status
   */
  @Prop({ type: String, maxlength: 5000 })
  generalNotes?: string;

  /**
   * User who last updated this odontogram
   */
  @Prop({ required: true, type: String })
  updatedBy!: string;

  /**
   * Version for optimistic locking
   * Incremented on each update to detect concurrent modifications
   */
  @Prop({ type: Number, default: 1 })
  version!: number;

  /**
   * Schema version for future migrations
   */
  @Prop({ type: Number, default: 2 })
  schemaVersion!: number;
}

export type OdontogramDocument = Odontogram & Document;

export const OdontogramSchema = SchemaFactory.createForClass(Odontogram);

// Compound index for tenant isolation - ensures one odontogram per patient per tenant
OdontogramSchema.index({ patientId: 1, tenantId: 1, organizationId: 1 }, { unique: true });

// Index for efficient queries by provider
OdontogramSchema.index({ updatedBy: 1, updatedAt: -1 });

// Index for clinic-level queries
OdontogramSchema.index({ clinicId: 1, tenantId: 1 });

/**
 * Tooth Condition History - Audit trail for all condition changes
 *
 * This collection stores immutable records of all condition changes
 * for HIPAA compliance and clinical audit requirements.
 *
 * NEVER DELETE RECORDS FROM THIS COLLECTION
 */
@Schema({
  timestamps: true,
  collection: 'odontogram_history',
})
export class OdontogramHistory {
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String })
  organizationId!: string;

  @Prop({ required: true, type: String })
  clinicId!: string;

  /**
   * FDI tooth number that was modified
   */
  @Prop({ required: true, type: String, enum: ALL_TEETH })
  toothNumber!: FDIToothNumber;

  /**
   * Type of change
   */
  @Prop({
    required: true,
    type: String,
    enum: ['condition_added', 'condition_removed', 'condition_updated', 'tooth_updated'],
  })
  changeType!: 'condition_added' | 'condition_removed' | 'condition_updated' | 'tooth_updated';

  /**
   * Condition ID that was affected (if applicable)
   */
  @Prop({ type: String })
  conditionId?: string;

  /**
   * Previous state (JSON snapshot)
   */
  @Prop({ type: Object })
  previousState?: Record<string, unknown>;

  /**
   * New state (JSON snapshot)
   */
  @Prop({ type: Object })
  newState?: Record<string, unknown>;

  /**
   * Provider who made the change
   */
  @Prop({ required: true, type: String })
  changedBy!: string;

  /**
   * Clinical reason for the change
   */
  @Prop({ type: String })
  reason?: string;

  /**
   * Associated appointment ID (if applicable)
   */
  @Prop({ type: String })
  appointmentId?: string;

  /**
   * Associated procedure ID (if applicable)
   */
  @Prop({ type: String })
  procedureId?: string;

  /**
   * IP address of the user making the change
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent of the client
   */
  @Prop({ type: String })
  userAgent?: string;
}

export type OdontogramHistoryDocument = OdontogramHistory & Document;

export const OdontogramHistorySchema = SchemaFactory.createForClass(OdontogramHistory);

// Index for querying history by patient and tooth
OdontogramHistorySchema.index({ patientId: 1, tenantId: 1, toothNumber: 1, createdAt: -1 });

// Index for audit queries by provider
OdontogramHistorySchema.index({ changedBy: 1, tenantId: 1, createdAt: -1 });

// Index for date range queries
OdontogramHistorySchema.index({ tenantId: 1, createdAt: -1 });
