/**
 * Treatment Plan Schema
 *
 * MongoDB schema for treatment plans in dental practice management.
 * Supports multi-phase treatment planning with alternatives, financial tracking,
 * and approval workflows.
 *
 * CLINICAL SAFETY NOTE: Treatment plans are critical clinical documents that:
 * - Drive billing and invoicing (procedures generate charges)
 * - Control scheduling (procedures create appointments)
 * - Manage inventory (materials allocated per procedure)
 * - Require patient consent before execution
 *
 * All changes are versioned and audited. Status transitions are strictly controlled.
 *
 * @module treatment-plans/entities
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Valid treatment plan statuses with defined transitions
 *
 * State machine:
 * - draft -> presented (cannot skip)
 * - presented -> accepted | cancelled
 * - accepted -> in_progress | cancelled
 * - in_progress -> completed | cancelled
 * - completed -> (terminal state)
 * - cancelled -> (terminal state)
 */
export const TREATMENT_PLAN_STATUSES = [
  'draft',
  'presented',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
] as const;

export type TreatmentPlanStatus = (typeof TREATMENT_PLAN_STATUSES)[number];

/**
 * Valid status transitions
 */
export const VALID_STATUS_TRANSITIONS: Record<TreatmentPlanStatus, TreatmentPlanStatus[]> = {
  draft: ['presented', 'cancelled'],
  presented: ['accepted', 'cancelled', 'draft'], // Can go back to draft for edits
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

/**
 * Procedure item statuses
 */
export const PROCEDURE_ITEM_STATUSES = ['planned', 'scheduled', 'completed', 'cancelled'] as const;
export type ProcedureItemStatus = (typeof PROCEDURE_ITEM_STATUSES)[number];

/**
 * Payment plan frequencies
 */
export const PAYMENT_FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;
export type PaymentFrequency = (typeof PAYMENT_FREQUENCIES)[number];

/**
 * Approval types
 */
export const APPROVAL_TYPES = ['patient', 'provider', 'insurance', 'guardian'] as const;
export type ApprovalType = (typeof APPROVAL_TYPES)[number];

// ============================================================================
// EMBEDDED SCHEMAS
// ============================================================================

/**
 * Material requirement for a procedure
 * Links to inventory system for automatic deduction on completion
 */
@Schema({ _id: false })
export class MaterialRequirement {
  @Prop({ required: true, type: String })
  catalogItemId!: string;

  @Prop({ required: true, type: String })
  itemName!: string;

  @Prop({ required: true, type: Number, min: 0 })
  quantity!: number;

  @Prop({ type: String })
  unit?: string;

  @Prop({ type: Number, min: 0 })
  estimatedCost?: number;
}

export const MaterialRequirementSchema = SchemaFactory.createForClass(MaterialRequirement);

/**
 * Individual procedure item within a treatment phase
 *
 * CLINICAL NOTE: Each item represents a specific procedure with:
 * - CDT code for billing and insurance
 * - Tooth/surface specificity for clinical documentation
 * - Financial breakdown with discounts
 * - Provider assignment for scheduling
 * - Material requirements for inventory
 */
@Schema({ _id: true })
export class TreatmentPlanItem {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * CDT (Code on Dental Procedures and Nomenclature) code
   * Example: D2391 - Resin-based composite, one surface, posterior
   */
  @Prop({ required: true, type: String, maxlength: 10 })
  procedureCode!: string;

  /**
   * Human-readable procedure name
   */
  @Prop({ required: true, type: String, maxlength: 500 })
  procedureName!: string;

  /**
   * Teeth involved (FDI numbering)
   * Multiple teeth for procedures like bridges
   */
  @Prop({ type: [String], default: [] })
  teeth!: string[];

  /**
   * Surfaces involved (M, O, D, B, L, I)
   * For surface-specific restorations
   */
  @Prop({ type: [String], default: [] })
  surfaces!: string[];

  /**
   * Quantity of procedure (typically 1, but can be more for units)
   */
  @Prop({ required: true, type: Number, default: 1, min: 1 })
  quantity!: number;

  /**
   * Unit price before discount (stored as cents to avoid floating point issues)
   * CLINICAL SAFETY: All monetary values in cents for precision
   */
  @Prop({ required: true, type: Number, min: 0 })
  unitPriceCents!: number;

  /**
   * Discount amount in cents
   */
  @Prop({ type: Number, default: 0, min: 0 })
  discountCents!: number;

  /**
   * Discount percentage (0-100)
   */
  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  discountPercent!: number;

  /**
   * Tax amount in cents (calculated based on clinic tax settings)
   */
  @Prop({ type: Number, default: 0, min: 0 })
  taxCents!: number;

  /**
   * Total price after discount and tax (quantity * unitPrice - discount + tax)
   * Stored for performance but should be recalculated on changes
   */
  @Prop({ required: true, type: Number, min: 0 })
  totalCents!: number;

  /**
   * Provider assigned to perform this procedure
   */
  @Prop({ type: String })
  providerId?: string;

  /**
   * Provider name for display (denormalized for performance)
   */
  @Prop({ type: String })
  providerName?: string;

  /**
   * Item status within the treatment plan
   */
  @Prop({
    required: true,
    type: String,
    enum: PROCEDURE_ITEM_STATUSES,
    default: 'planned',
  })
  status!: ProcedureItemStatus;

  /**
   * Materials required for this procedure (for inventory allocation)
   */
  @Prop({ type: [MaterialRequirementSchema], default: [] })
  materials!: MaterialRequirement[];

  /**
   * Estimated duration in minutes
   */
  @Prop({ type: Number, min: 0 })
  estimatedDurationMinutes?: number;

  /**
   * Clinical notes specific to this procedure
   */
  @Prop({ type: String, maxlength: 2000 })
  notes?: string;

  /**
   * Reference to scheduled appointment (if scheduled)
   */
  @Prop({ type: String })
  appointmentId?: string;

  /**
   * Reference to completed procedure record (if completed)
   */
  @Prop({ type: String })
  completedProcedureId?: string;

  /**
   * Date procedure was completed
   */
  @Prop({ type: Date })
  completedAt?: Date;

  /**
   * User who marked this as completed
   */
  @Prop({ type: String })
  completedBy?: string;

  /**
   * Sort order within the phase
   */
  @Prop({ type: Number, default: 0 })
  sortOrder!: number;
}

export const TreatmentPlanItemSchema = SchemaFactory.createForClass(TreatmentPlanItem);

/**
 * Treatment phase grouping related procedures
 *
 * CLINICAL NOTE: Phases allow logical grouping of procedures:
 * - Phase 1: Emergency/urgent care (pain relief)
 * - Phase 2: Stabilization (infection control, decay removal)
 * - Phase 3: Restorative (fillings, crowns)
 * - Phase 4: Cosmetic (elective procedures)
 */
@Schema({ _id: true })
export class TreatmentPhase {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Phase number (1, 2, 3, etc.)
   */
  @Prop({ required: true, type: Number, min: 1 })
  phaseNumber!: number;

  /**
   * Phase name (e.g., "Phase 1: Emergency Care")
   */
  @Prop({ required: true, type: String, maxlength: 200 })
  name!: string;

  /**
   * Phase description
   */
  @Prop({ type: String, maxlength: 1000 })
  description?: string;

  /**
   * Whether procedures in this phase must be completed in order
   * If true, item N cannot start until item N-1 is complete
   */
  @Prop({ type: Boolean, default: false })
  sequenceRequired!: boolean;

  /**
   * Procedures in this phase
   */
  @Prop({ type: [TreatmentPlanItemSchema], required: true, default: [] })
  items!: TreatmentPlanItem[];

  /**
   * Calculated subtotal for this phase (sum of item totals)
   */
  @Prop({ type: Number, default: 0, min: 0 })
  subtotalCents!: number;

  /**
   * Estimated total duration for this phase
   */
  @Prop({ type: Number, default: 0, min: 0 })
  estimatedDurationMinutes!: number;

  /**
   * Sort order among phases
   */
  @Prop({ type: Number, default: 0 })
  sortOrder!: number;
}

export const TreatmentPhaseSchema = SchemaFactory.createForClass(TreatmentPhase);

/**
 * Alternative treatment plan option
 *
 * Allows presenting multiple treatment approaches to patient
 * (e.g., conservative vs. comprehensive)
 */
@Schema({ _id: true })
export class TreatmentAlternative {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Alternative name (e.g., "Conservative Option", "Comprehensive Option")
   */
  @Prop({ required: true, type: String, maxlength: 200 })
  name!: string;

  /**
   * Description of this alternative
   */
  @Prop({ type: String, maxlength: 2000 })
  description?: string;

  /**
   * Phases in this alternative (full treatment plan structure)
   */
  @Prop({ type: [TreatmentPhaseSchema], required: true, default: [] })
  phases!: TreatmentPhase[];

  /**
   * Advantages of this option
   */
  @Prop({ type: [String], default: [] })
  advantages!: string[];

  /**
   * Disadvantages/limitations of this option
   */
  @Prop({ type: [String], default: [] })
  disadvantages!: string[];

  /**
   * Whether this is the recommended option
   */
  @Prop({ type: Boolean, default: false })
  isRecommended!: boolean;

  /**
   * Calculated total cost for this alternative
   */
  @Prop({ type: Number, default: 0, min: 0 })
  totalCents!: number;
}

export const TreatmentAlternativeSchema = SchemaFactory.createForClass(TreatmentAlternative);

/**
 * Payment plan configuration
 */
@Schema({ _id: false })
export class PaymentPlan {
  /**
   * Down payment amount in cents
   */
  @Prop({ required: true, type: Number, min: 0 })
  downPaymentCents!: number;

  /**
   * Number of installments
   */
  @Prop({ required: true, type: Number, min: 1 })
  installments!: number;

  /**
   * Payment frequency
   */
  @Prop({ required: true, type: String, enum: PAYMENT_FREQUENCIES })
  frequency!: PaymentFrequency;

  /**
   * Installment amount in cents
   */
  @Prop({ required: true, type: Number, min: 0 })
  installmentAmountCents!: number;

  /**
   * Interest rate percentage (0 for interest-free plans)
   */
  @Prop({ type: Number, default: 0, min: 0 })
  interestRatePercent!: number;

  /**
   * Total amount including interest
   */
  @Prop({ required: true, type: Number, min: 0 })
  totalAmountCents!: number;
}

export const PaymentPlanSchema = SchemaFactory.createForClass(PaymentPlan);

/**
 * Financial summary for the treatment plan
 */
@Schema({ _id: false })
export class TreatmentFinancials {
  /**
   * Subtotal before discounts and taxes (sum of all items)
   */
  @Prop({ required: true, type: Number, min: 0 })
  subtotalCents!: number;

  /**
   * Total discount amount
   */
  @Prop({ type: Number, default: 0, min: 0 })
  discountTotalCents!: number;

  /**
   * Total tax amount
   */
  @Prop({ type: Number, default: 0, min: 0 })
  taxTotalCents!: number;

  /**
   * Grand total after discounts and taxes
   */
  @Prop({ required: true, type: Number, min: 0 })
  totalCents!: number;

  /**
   * Estimated insurance coverage amount
   */
  @Prop({ type: Number, min: 0 })
  insuranceCoverageCents?: number;

  /**
   * Estimated patient responsibility (total - insurance)
   */
  @Prop({ type: Number, min: 0 })
  patientResponsibilityCents?: number;

  /**
   * Currency code (ISO 4217)
   */
  @Prop({ type: String, default: 'RON' })
  currency!: string;

  /**
   * Optional payment plan configuration
   */
  @Prop({ type: PaymentPlanSchema })
  paymentPlan?: PaymentPlan;
}

export const TreatmentFinancialsSchema = SchemaFactory.createForClass(TreatmentFinancials);

/**
 * Approval record for treatment plan acceptance
 *
 * HIPAA/GDPR COMPLIANCE: Tracks who approved, when, and how
 * with full audit trail including IP address and consent form reference.
 */
@Schema({ _id: true })
export class TreatmentApproval {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  /**
   * Type of approver
   */
  @Prop({ required: true, type: String, enum: APPROVAL_TYPES })
  approvedBy!: ApprovalType;

  /**
   * User ID of the approver (patient user ID for patient approval)
   */
  @Prop({ required: true, type: String })
  approverId!: string;

  /**
   * Approver name for display
   */
  @Prop({ required: true, type: String })
  approverName!: string;

  /**
   * Reference to signature (stored separately for security)
   */
  @Prop({ type: String })
  signatureRef?: string;

  /**
   * Reference to consent form document
   */
  @Prop({ type: String })
  consentFormId?: string;

  /**
   * Consent form version for audit
   */
  @Prop({ type: String })
  consentFormVersion?: string;

  /**
   * Date and time of approval
   */
  @Prop({ required: true, type: Date })
  approvedAt!: Date;

  /**
   * IP address of approver (for audit)
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent string (for audit)
   */
  @Prop({ type: String })
  userAgent?: string;

  /**
   * Method of approval (electronic, in-person, verbal)
   */
  @Prop({ type: String })
  approvalMethod?: string;

  /**
   * Notes about the approval
   */
  @Prop({ type: String, maxlength: 1000 })
  notes?: string;
}

export const TreatmentApprovalSchema = SchemaFactory.createForClass(TreatmentApproval);

// ============================================================================
// MAIN TREATMENT PLAN SCHEMA
// ============================================================================

/**
 * Treatment Plan Document
 *
 * Complete treatment plan with phases, procedures, financials, and approvals.
 * This is the aggregate root for treatment planning in the clinical module.
 *
 * CRITICAL: Treatment plans drive billing, scheduling, and inventory.
 * All modifications must be logged and status transitions validated.
 */
@Schema({
  timestamps: true,
  collection: 'treatment_plans',
  optimisticConcurrency: true,
})
export class TreatmentPlan {
  /**
   * Patient this treatment plan is for
   */
  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  /**
   * Provider who created/owns the plan
   */
  @Prop({ required: true, type: String, index: true })
  providerId!: string;

  /**
   * Provider name for display (denormalized)
   */
  @Prop({ type: String })
  providerName?: string;

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
   * Treatment plan title/name
   */
  @Prop({ type: String, maxlength: 200 })
  title?: string;

  /**
   * Detailed description
   */
  @Prop({ type: String, maxlength: 5000 })
  description?: string;

  /**
   * Current status of the treatment plan
   */
  @Prop({
    required: true,
    type: String,
    enum: TREATMENT_PLAN_STATUSES,
    default: 'draft',
  })
  status!: TreatmentPlanStatus;

  /**
   * Treatment phases (primary treatment plan)
   */
  @Prop({ type: [TreatmentPhaseSchema], required: true, default: [] })
  phases!: TreatmentPhase[];

  /**
   * Alternative treatment options
   */
  @Prop({ type: [TreatmentAlternativeSchema], default: [] })
  alternatives!: TreatmentAlternative[];

  /**
   * Selected alternative ID (if patient chose an alternative)
   */
  @Prop({ type: String })
  selectedAlternativeId?: string;

  /**
   * Financial summary
   */
  @Prop({ type: TreatmentFinancialsSchema, required: true })
  financial!: TreatmentFinancials;

  /**
   * Approval records
   */
  @Prop({ type: [TreatmentApprovalSchema], default: [] })
  approvals!: TreatmentApproval[];

  /**
   * Date plan was presented to patient
   */
  @Prop({ type: Date })
  presentedAt?: Date;

  /**
   * User who presented the plan
   */
  @Prop({ type: String })
  presentedBy?: string;

  /**
   * Date patient accepted the plan
   */
  @Prop({ type: Date })
  acceptedAt?: Date;

  /**
   * Date treatment started (first procedure scheduled/completed)
   */
  @Prop({ type: Date })
  startedAt?: Date;

  /**
   * Date treatment completed (all procedures done)
   */
  @Prop({ type: Date })
  completedAt?: Date;

  /**
   * Date plan was cancelled
   */
  @Prop({ type: Date })
  cancelledAt?: Date;

  /**
   * User who cancelled the plan
   */
  @Prop({ type: String })
  cancelledBy?: string;

  /**
   * Reason for cancellation
   */
  @Prop({ type: String, maxlength: 1000 })
  cancellationReason?: string;

  /**
   * Plan expiration date (for time-limited proposals)
   */
  @Prop({ type: Date })
  expiresAt?: Date;

  /**
   * Insurance pre-authorization number
   */
  @Prop({ type: String })
  preAuthorizationNumber?: string;

  /**
   * Insurance pre-authorization status
   */
  @Prop({ type: String, enum: ['pending', 'approved', 'denied', 'not_required'] })
  preAuthorizationStatus?: string;

  /**
   * Related clinical note ID (initial exam, etc.)
   */
  @Prop({ type: String })
  clinicalNoteId?: string;

  /**
   * Related appointment ID (when plan was created during appointment)
   */
  @Prop({ type: String })
  appointmentId?: string;

  /**
   * Provider notes (internal, not shown to patient)
   */
  @Prop({ type: String, maxlength: 5000 })
  providerNotes?: string;

  /**
   * Patient questions/concerns recorded during presentation
   */
  @Prop({ type: [String], default: [] })
  patientQuestions!: string[];

  /**
   * User who created the plan
   */
  @Prop({ required: true, type: String })
  createdBy!: string;

  /**
   * User who last updated the plan
   */
  @Prop({ required: true, type: String })
  updatedBy!: string;

  /**
   * Version for optimistic locking
   */
  @Prop({ type: Number, default: 1 })
  version!: number;

  /**
   * Schema version for migrations
   */
  @Prop({ type: Number, default: 1 })
  schemaVersion!: number;

  /**
   * Tags for categorization
   */
  @Prop({ type: [String], default: [] })
  tags!: string[];

  /**
   * Priority level
   */
  @Prop({ type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' })
  priority!: string;

  /**
   * Soft delete flag
   */
  @Prop({ type: Date })
  deletedAt?: Date;

  /**
   * User who soft deleted the plan
   */
  @Prop({ type: String })
  deletedBy?: string;
}

export type TreatmentPlanDocument = TreatmentPlan & Document;

export const TreatmentPlanSchema = SchemaFactory.createForClass(TreatmentPlan);

// ============================================================================
// INDEXES
// ============================================================================

// Primary lookup: patient's plans within tenant
TreatmentPlanSchema.index(
  { patientId: 1, tenantId: 1, status: 1, createdAt: -1 },
  { name: 'patient_tenant_status_idx' },
);

// Provider's plans
TreatmentPlanSchema.index(
  { providerId: 1, tenantId: 1, status: 1, createdAt: -1 },
  { name: 'provider_tenant_status_idx' },
);

// Clinic-level queries
TreatmentPlanSchema.index(
  { clinicId: 1, tenantId: 1, status: 1, createdAt: -1 },
  { name: 'clinic_tenant_status_idx' },
);

// Find active plans (not completed/cancelled)
TreatmentPlanSchema.index(
  { tenantId: 1, status: 1, patientId: 1 },
  {
    name: 'active_plans_idx',
    partialFilterExpression: {
      status: { $in: ['draft', 'presented', 'accepted', 'in_progress'] },
    },
  },
);

// Soft delete filter
TreatmentPlanSchema.index(
  { tenantId: 1, deletedAt: 1 },
  { name: 'soft_delete_idx', sparse: true },
);

// ============================================================================
// HISTORY SCHEMA (AUDIT TRAIL)
// ============================================================================

/**
 * Treatment Plan History - Audit trail for all changes
 *
 * HIPAA COMPLIANCE: Complete audit trail of all modifications.
 * Records are NEVER deleted from this collection.
 */
@Schema({
  timestamps: true,
  collection: 'treatment_plan_history',
})
export class TreatmentPlanHistory {
  @Prop({ required: true, type: String, index: true })
  treatmentPlanId!: string;

  @Prop({ required: true, type: String, index: true })
  patientId!: string;

  @Prop({ required: true, type: String, index: true })
  tenantId!: string;

  @Prop({ required: true, type: String })
  organizationId!: string;

  @Prop({ required: true, type: String })
  clinicId!: string;

  /**
   * Type of change
   */
  @Prop({
    required: true,
    type: String,
    enum: [
      'created',
      'updated',
      'status_changed',
      'presented',
      'accepted',
      'item_completed',
      'item_scheduled',
      'cancelled',
      'deleted',
      'approval_added',
      'financial_updated',
    ],
  })
  changeType!: string;

  /**
   * Previous status (for status changes)
   */
  @Prop({ type: String })
  previousStatus?: string;

  /**
   * New status (for status changes)
   */
  @Prop({ type: String })
  newStatus?: string;

  /**
   * Snapshot of changed fields
   */
  @Prop({ type: Object })
  changes?: Record<string, unknown>;

  /**
   * Full document snapshot (for critical changes)
   */
  @Prop({ type: Object })
  documentSnapshot?: Record<string, unknown>;

  /**
   * User who made the change
   */
  @Prop({ required: true, type: String })
  changedBy!: string;

  /**
   * Reason for change (required for status changes)
   */
  @Prop({ type: String })
  reason?: string;

  /**
   * IP address of user
   */
  @Prop({ type: String })
  ipAddress?: string;

  /**
   * User agent string
   */
  @Prop({ type: String })
  userAgent?: string;

  /**
   * Related item ID (for item-level changes)
   */
  @Prop({ type: String })
  itemId?: string;
}

export type TreatmentPlanHistoryDocument = TreatmentPlanHistory & Document;

export const TreatmentPlanHistorySchema = SchemaFactory.createForClass(TreatmentPlanHistory);

// History indexes
TreatmentPlanHistorySchema.index(
  { treatmentPlanId: 1, createdAt: -1 },
  { name: 'plan_history_idx' },
);

TreatmentPlanHistorySchema.index(
  { patientId: 1, tenantId: 1, createdAt: -1 },
  { name: 'patient_history_idx' },
);

TreatmentPlanHistorySchema.index(
  { changedBy: 1, tenantId: 1, createdAt: -1 },
  { name: 'user_history_idx' },
);
