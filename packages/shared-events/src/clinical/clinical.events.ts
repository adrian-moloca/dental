/**
 * Clinical Events
 *
 * Domain events for clinical operations including clinical notes, treatment plans,
 * procedures, consent management, and odontogram updates.
 *
 * These events are consumed by:
 * - Automation Engine (follow-up workflows, treatment reminders)
 * - Inventory Management (stock depletion for procedures)
 * - Billing System (procedure charges, insurance claims)
 * - Analytics Platform (clinical reporting, KPIs)
 *
 * @module shared-events/clinical
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

/**
 * Clinical note created event type constant
 */
export const CLINICAL_NOTE_CREATED_EVENT = 'dental.clinical.note.created' as const;

/**
 * Treatment plan created event type constant
 */
export const TREATMENT_PLAN_CREATED_EVENT = 'dental.clinical.treatment-plan.created' as const;

/**
 * Treatment plan updated event type constant
 */
export const TREATMENT_PLAN_UPDATED_EVENT = 'dental.clinical.treatment-plan.updated' as const;

/**
 * Procedure completed event type constant
 */
export const PROCEDURE_COMPLETED_EVENT = 'dental.clinical.procedure.completed' as const;

/**
 * Consent signed event type constant
 */
export const CONSENT_SIGNED_EVENT = 'dental.clinical.consent.signed' as const;

/**
 * Tooth status updated event type constant
 */
export const TOOTH_STATUS_UPDATED_EVENT = 'dental.clinical.tooth.status-updated' as const;

// ============================================================================
// EVENT VERSION CONSTANTS
// ============================================================================

export const CLINICAL_NOTE_CREATED_VERSION = 1;
export const TREATMENT_PLAN_CREATED_VERSION = 1;
export const TREATMENT_PLAN_UPDATED_VERSION = 1;
export const PROCEDURE_COMPLETED_VERSION = 1;
export const CONSENT_SIGNED_VERSION = 1;
export const TOOTH_STATUS_UPDATED_VERSION = 1;

// ============================================================================
// ENUMERATIONS AND SHARED TYPES
// ============================================================================

/**
 * Clinical note type enumeration
 */
export type ClinicalNoteType =
  | 'SOAP'
  | 'PROGRESS'
  | 'TREATMENT'
  | 'CONSULTATION'
  | 'PROCEDURE'
  | 'REFERRAL'
  | 'EMERGENCY'
  | 'FOLLOW_UP'
  | 'OTHER';

/**
 * Tooth numbering system
 */
export type ToothNumberingSystem = 'UNIVERSAL' | 'FDI' | 'PALMER';

/**
 * Tooth surface enumeration
 * Standard dental surfaces: Mesial, Occlusal, Distal, Buccal/Facial, Lingual
 */
export type ToothSurface = 'M' | 'O' | 'D' | 'B' | 'F' | 'L' | 'I';

/**
 * Tooth condition enumeration
 */
export type ToothCondition =
  | 'HEALTHY'
  | 'CARIES'
  | 'FILLED'
  | 'CROWN'
  | 'ROOT_CANAL'
  | 'IMPLANT'
  | 'MISSING'
  | 'EXTRACTED'
  | 'IMPACTED'
  | 'FRACTURED'
  | 'WATCH'
  | 'OTHER';

/**
 * Consent type enumeration
 */
export type ConsentType =
  | 'TREATMENT'
  | 'ANESTHESIA'
  | 'SURGERY'
  | 'RADIOGRAPH'
  | 'MEDICATION'
  | 'RELEASE_OF_INFORMATION'
  | 'FINANCIAL'
  | 'PRIVACY'
  | 'PHOTOGRAPHY'
  | 'RESEARCH'
  | 'OTHER';

/**
 * Signature method enumeration
 */
export type SignatureMethod = 'ELECTRONIC' | 'HANDWRITTEN' | 'VERBAL' | 'DIGITAL_PAD' | 'OTHER';

/**
 * Stock item used during a procedure
 * Used by inventory system for automatic deduction
 */
export interface StockItemUsed {
  /** Stock item ID */
  stockItemId: UUID;
  /** SKU or product code */
  sku?: string;
  /** Item name */
  itemName: string;
  /** Quantity used */
  quantity: number;
  /** Unit of measurement */
  unit: string;
  /** Batch number if applicable */
  batchNumber?: string;
  /** Lot number if applicable */
  lotNumber?: string;
}

/**
 * Treatment plan change summary
 */
export interface TreatmentPlanChange {
  /** Field that changed */
  field: string;
  /** Previous value (JSON stringified for complex types) */
  previousValue?: string | number | boolean | null;
  /** New value (JSON stringified for complex types) */
  newValue?: string | number | boolean | null;
  /** Description of the change */
  description?: string;
}

// ============================================================================
// 1. CLINICAL NOTE CREATED EVENT
// ============================================================================

/**
 * Clinical note created event payload
 *
 * Published when a clinical note is created for a patient visit.
 * Consumed by analytics, reporting, and audit systems.
 *
 * @example
 * ```typescript
 * const payload: ClinicalNoteCreatedPayload = {
 *   noteId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   providerId: 'provider-456',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   noteType: 'SOAP',
 *   appointmentId: 'appt-555',
 *   timestamp: '2025-11-20T14:30:00Z',
 *   title: 'Routine Examination',
 *   summary: 'Patient presented for routine checkup...',
 *   chiefComplaint: 'Toothache upper left molar',
 *   diagnosis: ['K02.51 - Dental caries'],
 *   createdAt: '2025-11-20T14:30:00Z',
 * };
 * ```
 */
export interface ClinicalNoteCreatedPayload {
  /** Unique clinical note identifier */
  noteId: UUID;

  /** Patient the note is about */
  patientId: UUID;

  /** Provider who authored the note */
  providerId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where note was created */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Type of clinical note */
  noteType: ClinicalNoteType;

  /** Associated appointment ID if applicable */
  appointmentId?: UUID;

  /** Clinical timestamp (when the note was authored) */
  timestamp: ISODateString;

  /** Note title or subject */
  title: string;

  /** Brief summary or excerpt of the note */
  summary?: string;

  /** Chief complaint */
  chiefComplaint?: string;

  /** Diagnosis codes (ICD-10 or custom) */
  diagnosis?: string[];

  /** Treatment codes (CDT or custom) */
  treatmentCodes?: string[];

  /** Whether note is finalized/locked */
  isFinalized: boolean;

  /** Provider name for display purposes */
  providerName: string;

  /** Patient name for display purposes */
  patientName: string;

  /** Timestamp when note was created in system */
  createdAt: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Clinical note created event envelope
 */
export type ClinicalNoteCreatedEvent = EventEnvelope<ClinicalNoteCreatedPayload>;

/**
 * Type guard to check if an event is a ClinicalNoteCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a ClinicalNoteCreatedEvent
 */
export function isClinicalNoteCreatedEvent(
  event: EventEnvelope<unknown>
): event is ClinicalNoteCreatedEvent {
  return event.type === CLINICAL_NOTE_CREATED_EVENT;
}

/**
 * Factory function to create a ClinicalNoteCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createClinicalNoteCreatedEvent(
  payload: ClinicalNoteCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ClinicalNoteCreatedEvent {
  // Validate critical required fields
  if (!payload.noteId) {
    throw new Error('ClinicalNoteCreatedEvent: noteId is required');
  }
  if (!payload.patientId) {
    throw new Error('ClinicalNoteCreatedEvent: patientId is required');
  }
  if (!payload.providerId) {
    throw new Error('ClinicalNoteCreatedEvent: providerId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ClinicalNoteCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ClinicalNoteCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ClinicalNoteCreatedEvent: tenantId is required');
  }
  if (!payload.noteType) {
    throw new Error('ClinicalNoteCreatedEvent: noteType is required');
  }
  if (!payload.timestamp) {
    throw new Error('ClinicalNoteCreatedEvent: timestamp is required');
  }
  if (!payload.title || payload.title.trim().length === 0) {
    throw new Error('ClinicalNoteCreatedEvent: title is required and cannot be empty');
  }
  if (!payload.createdAt) {
    throw new Error('ClinicalNoteCreatedEvent: createdAt is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: CLINICAL_NOTE_CREATED_EVENT,
    version: CLINICAL_NOTE_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 2. TREATMENT PLAN CREATED EVENT
// ============================================================================

/**
 * Treatment plan created event payload
 *
 * Published when a new treatment plan is created for a patient.
 * Consumed by billing system, automation engine (treatment reminders),
 * and analytics platform.
 *
 * @example
 * ```typescript
 * const payload: TreatmentPlanCreatedPayload = {
 *   treatmentPlanId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   providerId: 'provider-456',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   version: 1,
 *   totalCost: 2500.00,
 *   estimatedDuration: 180,
 *   procedureCount: 3,
 *   priority: 'MEDIUM',
 *   status: 'PROPOSED',
 *   timestamp: '2025-11-20T14:30:00Z',
 * };
 * ```
 */
export interface TreatmentPlanCreatedPayload {
  /** Unique treatment plan identifier */
  treatmentPlanId: UUID;

  /** Patient the treatment plan is for */
  patientId: UUID;

  /** Primary provider for the treatment plan */
  providerId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where plan was created */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Treatment plan version (starts at 1, increments with updates) */
  version: number;

  /** Total estimated cost of all procedures in the plan */
  totalCost: number;

  /** Estimated insurance coverage amount */
  estimatedInsuranceCoverage?: number;

  /** Patient out-of-pocket estimate */
  patientResponsibility?: number;

  /** Total estimated duration in minutes */
  estimatedDuration?: number;

  /** Number of procedures in the plan */
  procedureCount: number;

  /** Treatment plan priority */
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  /** Treatment plan status */
  status: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  /** Treatment plan title */
  title?: string;

  /** Treatment plan description or summary */
  description?: string;

  /** Expected start date */
  expectedStartDate?: ISODateString;

  /** Expected completion date */
  expectedCompletionDate?: ISODateString;

  /** Whether patient has signed consent for the plan */
  consentSigned: boolean;

  /** Provider name for display purposes */
  providerName: string;

  /** Patient name for display purposes */
  patientName: string;

  /** Timestamp when plan was created */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Treatment plan created event envelope
 */
export type TreatmentPlanCreatedEvent = EventEnvelope<TreatmentPlanCreatedPayload>;

/**
 * Type guard to check if an event is a TreatmentPlanCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a TreatmentPlanCreatedEvent
 */
export function isTreatmentPlanCreatedEvent(
  event: EventEnvelope<unknown>
): event is TreatmentPlanCreatedEvent {
  return event.type === TREATMENT_PLAN_CREATED_EVENT;
}

/**
 * Factory function to create a TreatmentPlanCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createTreatmentPlanCreatedEvent(
  payload: TreatmentPlanCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): TreatmentPlanCreatedEvent {
  // Validate critical required fields
  if (!payload.treatmentPlanId) {
    throw new Error('TreatmentPlanCreatedEvent: treatmentPlanId is required');
  }
  if (!payload.patientId) {
    throw new Error('TreatmentPlanCreatedEvent: patientId is required');
  }
  if (!payload.providerId) {
    throw new Error('TreatmentPlanCreatedEvent: providerId is required');
  }
  if (!payload.organizationId) {
    throw new Error('TreatmentPlanCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('TreatmentPlanCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('TreatmentPlanCreatedEvent: tenantId is required');
  }
  if (!payload.version || payload.version < 1) {
    throw new Error('TreatmentPlanCreatedEvent: version is required and must be >= 1');
  }
  if (payload.totalCost === undefined || payload.totalCost === null) {
    throw new Error('TreatmentPlanCreatedEvent: totalCost is required');
  }
  if (payload.totalCost < 0) {
    throw new Error('TreatmentPlanCreatedEvent: totalCost cannot be negative');
  }
  if (!payload.procedureCount || payload.procedureCount < 0) {
    throw new Error('TreatmentPlanCreatedEvent: procedureCount is required and must be >= 0');
  }
  if (!payload.timestamp) {
    throw new Error('TreatmentPlanCreatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: TREATMENT_PLAN_CREATED_EVENT,
    version: TREATMENT_PLAN_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 3. TREATMENT PLAN UPDATED EVENT
// ============================================================================

/**
 * Treatment plan updated event payload
 *
 * Published when a treatment plan is modified (procedures added/removed,
 * status changed, costs updated). Consumed by billing, automation, and
 * analytics systems.
 *
 * @example
 * ```typescript
 * const payload: TreatmentPlanUpdatedPayload = {
 *   treatmentPlanId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   version: 2,
 *   previousVersion: 1,
 *   changes: [
 *     { field: 'status', previousValue: 'PROPOSED', newValue: 'ACCEPTED' },
 *     { field: 'totalCost', previousValue: 2500, newValue: 2800 },
 *   ],
 *   updatedBy: 'provider-456',
 *   timestamp: '2025-11-20T15:00:00Z',
 * };
 * ```
 */
export interface TreatmentPlanUpdatedPayload {
  /** Treatment plan identifier */
  treatmentPlanId: UUID;

  /** Patient the treatment plan is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** New version number (incremented) */
  version: number;

  /** Previous version number */
  previousVersion: number;

  /** List of changes made to the treatment plan */
  changes: TreatmentPlanChange[];

  /** User who made the update */
  updatedBy: UUID;

  /** Updated by user name for display */
  updatedByName?: string;

  /** Reason for the update */
  reason?: string;

  /** New status if status changed */
  newStatus?: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  /** Previous status if status changed */
  previousStatus?: 'PROPOSED' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

  /** New total cost if cost changed */
  newTotalCost?: number;

  /** Previous total cost if cost changed */
  previousTotalCost?: number;

  /** New procedure count if changed */
  newProcedureCount?: number;

  /** Previous procedure count if changed */
  previousProcedureCount?: number;

  /** Timestamp when update occurred */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Treatment plan updated event envelope
 */
export type TreatmentPlanUpdatedEvent = EventEnvelope<TreatmentPlanUpdatedPayload>;

/**
 * Type guard to check if an event is a TreatmentPlanUpdatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a TreatmentPlanUpdatedEvent
 */
export function isTreatmentPlanUpdatedEvent(
  event: EventEnvelope<unknown>
): event is TreatmentPlanUpdatedEvent {
  return event.type === TREATMENT_PLAN_UPDATED_EVENT;
}

/**
 * Factory function to create a TreatmentPlanUpdatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createTreatmentPlanUpdatedEvent(
  payload: TreatmentPlanUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): TreatmentPlanUpdatedEvent {
  // Validate critical required fields
  if (!payload.treatmentPlanId) {
    throw new Error('TreatmentPlanUpdatedEvent: treatmentPlanId is required');
  }
  if (!payload.patientId) {
    throw new Error('TreatmentPlanUpdatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('TreatmentPlanUpdatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('TreatmentPlanUpdatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('TreatmentPlanUpdatedEvent: tenantId is required');
  }
  if (!payload.version || payload.version < 1) {
    throw new Error('TreatmentPlanUpdatedEvent: version is required and must be >= 1');
  }
  if (!payload.previousVersion || payload.previousVersion < 1) {
    throw new Error('TreatmentPlanUpdatedEvent: previousVersion is required and must be >= 1');
  }
  if (payload.version <= payload.previousVersion) {
    throw new Error('TreatmentPlanUpdatedEvent: version must be greater than previousVersion');
  }
  if (!payload.changes || payload.changes.length === 0) {
    throw new Error('TreatmentPlanUpdatedEvent: changes array is required and cannot be empty');
  }
  if (!payload.updatedBy) {
    throw new Error('TreatmentPlanUpdatedEvent: updatedBy is required');
  }
  if (!payload.timestamp) {
    throw new Error('TreatmentPlanUpdatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: TREATMENT_PLAN_UPDATED_EVENT,
    version: TREATMENT_PLAN_UPDATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 4. PROCEDURE COMPLETED EVENT
// ============================================================================

/**
 * Procedure completed event payload
 *
 * Published when a dental procedure is completed. Critical for:
 * - Inventory system (automatic stock deduction)
 * - Billing system (procedure charges, insurance claims)
 * - Analytics (procedure tracking, provider performance)
 * - Automation engine (post-procedure follow-ups)
 *
 * @example
 * ```typescript
 * const payload: ProcedureCompletedPayload = {
 *   procedureId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   providerId: 'provider-456',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   procedureCode: 'D2391',
 *   procedureName: 'Resin-based composite - one surface, posterior',
 *   tooth: '19',
 *   surfaces: ['O'],
 *   stockItemsUsed: [
 *     { stockItemId: 'item-1', itemName: 'Composite Resin', quantity: 1, unit: 'unit' },
 *     { stockItemId: 'item-2', itemName: 'Bonding Agent', quantity: 1, unit: 'ml' },
 *   ],
 *   duration: 45,
 *   timestamp: '2025-11-20T15:00:00Z',
 * };
 * ```
 */
export interface ProcedureCompletedPayload {
  /** Unique procedure identifier */
  procedureId: UUID;

  /** Patient the procedure was performed on */
  patientId: UUID;

  /** Provider who performed the procedure */
  providerId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where procedure was performed */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** CDT code or internal procedure code */
  procedureCode: string;

  /** Procedure name/description */
  procedureName: string;

  /** Tooth number (if applicable, using specified numbering system) */
  tooth?: string | number;

  /** Tooth numbering system used */
  toothNumberingSystem?: ToothNumberingSystem;

  /** Tooth surfaces involved (if applicable) */
  surfaces?: ToothSurface[];

  /** Quadrant or arch if applicable */
  quadrant?: 'UL' | 'UR' | 'LL' | 'LR' | 'UPPER' | 'LOWER' | 'FULL';

  /** Stock items consumed during the procedure (for inventory deduction) */
  stockItemsUsed: StockItemUsed[];

  /** Associated appointment ID */
  appointmentId?: UUID;

  /** Associated treatment plan ID */
  treatmentPlanId?: UUID;

  /** Actual duration in minutes */
  duration?: number;

  /** Procedure fee charged */
  feeCharged?: number;

  /** Procedure outcome or result */
  outcome?: 'SUCCESSFUL' | 'PARTIAL' | 'FAILED' | 'COMPLICATED';

  /** Provider name for display purposes */
  providerName: string;

  /** Patient name for display purposes */
  patientName: string;

  /** Whether procedure requires follow-up */
  requiresFollowUp: boolean;

  /** Follow-up due date if applicable */
  followUpDueDate?: ISODateString;

  /** Notes or complications */
  notes?: string;

  /** Timestamp when procedure was completed */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Procedure completed event envelope
 */
export type ProcedureCompletedEvent = EventEnvelope<ProcedureCompletedPayload>;

/**
 * Type guard to check if an event is a ProcedureCompletedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a ProcedureCompletedEvent
 */
export function isProcedureCompletedEvent(
  event: EventEnvelope<unknown>
): event is ProcedureCompletedEvent {
  return event.type === PROCEDURE_COMPLETED_EVENT;
}

/**
 * Factory function to create a ProcedureCompletedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createProcedureCompletedEvent(
  payload: ProcedureCompletedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ProcedureCompletedEvent {
  // Validate critical required fields
  if (!payload.procedureId) {
    throw new Error('ProcedureCompletedEvent: procedureId is required');
  }
  if (!payload.patientId) {
    throw new Error('ProcedureCompletedEvent: patientId is required');
  }
  if (!payload.providerId) {
    throw new Error('ProcedureCompletedEvent: providerId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ProcedureCompletedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ProcedureCompletedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ProcedureCompletedEvent: tenantId is required');
  }
  if (!payload.procedureCode || payload.procedureCode.trim().length === 0) {
    throw new Error('ProcedureCompletedEvent: procedureCode is required and cannot be empty');
  }
  if (!payload.procedureName || payload.procedureName.trim().length === 0) {
    throw new Error('ProcedureCompletedEvent: procedureName is required and cannot be empty');
  }
  if (!Array.isArray(payload.stockItemsUsed)) {
    throw new Error('ProcedureCompletedEvent: stockItemsUsed must be an array');
  }
  if (!payload.timestamp) {
    throw new Error('ProcedureCompletedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: PROCEDURE_COMPLETED_EVENT,
    version: PROCEDURE_COMPLETED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 5. CONSENT SIGNED EVENT
// ============================================================================

/**
 * Consent signed event payload
 *
 * Published when a patient or guardian signs a consent form.
 * Critical for compliance, legal audit trails, and treatment authorization.
 *
 * @example
 * ```typescript
 * const payload: ConsentSignedPayload = {
 *   consentId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   consentType: 'TREATMENT',
 *   consentFormId: 'form-456',
 *   signedBy: 'patient-123',
 *   signerRelationship: 'SELF',
 *   signatureMethod: 'ELECTRONIC',
 *   signature: 'data:image/png;base64,...',
 *   ipAddress: '192.168.1.1',
 *   timestamp: '2025-11-20T14:30:00Z',
 * };
 * ```
 */
export interface ConsentSignedPayload {
  /** Unique consent record identifier */
  consentId: UUID;

  /** Patient the consent is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where consent was signed */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Type of consent */
  consentType: ConsentType;

  /** Consent form template ID */
  consentFormId?: UUID;

  /** Version of the consent form template */
  consentFormVersion?: number;

  /** Title of the consent form */
  consentTitle?: string;

  /** User or patient who signed the consent */
  signedBy: UUID;

  /** Name of signer for display purposes */
  signerName: string;

  /** Patient name for display purposes */
  patientName: string;

  /** Relationship of signer to patient */
  signerRelationship: 'SELF' | 'PARENT' | 'GUARDIAN' | 'LEGAL_REPRESENTATIVE' | 'OTHER';

  /** Method used to capture signature */
  signatureMethod: SignatureMethod;

  /** Signature data (base64 encoded image or hash) */
  signature: string;

  /** IP address where consent was signed (for audit) */
  ipAddress?: string;

  /** User agent or device information */
  userAgent?: string;

  /** Location where signed (GPS coordinates if available) */
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };

  /** Associated treatment plan ID if consent is treatment-specific */
  treatmentPlanId?: UUID;

  /** Associated procedure ID if consent is procedure-specific */
  procedureId?: UUID;

  /** Provider who witnessed the signing */
  witnessedBy?: UUID;

  /** Witness name for display */
  witnessName?: string;

  /** Expiration date of consent if applicable */
  expiresAt?: ISODateString;

  /** Whether consent is revocable */
  isRevocable: boolean;

  /** Consent status */
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'SUPERSEDED';

  /** Timestamp when consent was signed */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Consent signed event envelope
 */
export type ConsentSignedEvent = EventEnvelope<ConsentSignedPayload>;

/**
 * Type guard to check if an event is a ConsentSignedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a ConsentSignedEvent
 */
export function isConsentSignedEvent(
  event: EventEnvelope<unknown>
): event is ConsentSignedEvent {
  return event.type === CONSENT_SIGNED_EVENT;
}

/**
 * Factory function to create a ConsentSignedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createConsentSignedEvent(
  payload: ConsentSignedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ConsentSignedEvent {
  // Validate critical required fields
  if (!payload.consentId) {
    throw new Error('ConsentSignedEvent: consentId is required');
  }
  if (!payload.patientId) {
    throw new Error('ConsentSignedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ConsentSignedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ConsentSignedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ConsentSignedEvent: tenantId is required');
  }
  if (!payload.consentType) {
    throw new Error('ConsentSignedEvent: consentType is required');
  }
  if (!payload.signedBy) {
    throw new Error('ConsentSignedEvent: signedBy is required');
  }
  if (!payload.signerRelationship) {
    throw new Error('ConsentSignedEvent: signerRelationship is required');
  }
  if (!payload.signatureMethod) {
    throw new Error('ConsentSignedEvent: signatureMethod is required');
  }
  if (!payload.signature || payload.signature.trim().length === 0) {
    throw new Error('ConsentSignedEvent: signature is required and cannot be empty');
  }
  if (!payload.timestamp) {
    throw new Error('ConsentSignedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: CONSENT_SIGNED_EVENT,
    version: CONSENT_SIGNED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 6. TOOTH STATUS UPDATED EVENT
// ============================================================================

/**
 * Tooth status updated event payload
 *
 * Published when the status of a tooth changes in the odontogram.
 * Consumed by clinical systems, analytics, and patient history tracking.
 *
 * @example
 * ```typescript
 * const payload: ToothStatusUpdatedPayload = {
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   toothNumber: '19',
 *   toothNumberingSystem: 'UNIVERSAL',
 *   previousCondition: 'HEALTHY',
 *   newCondition: 'FILLED',
 *   surfaces: ['O'],
 *   updatedBy: 'provider-456',
 *   procedureId: 'proc-123',
 *   timestamp: '2025-11-20T15:00:00Z',
 * };
 * ```
 */
export interface ToothStatusUpdatedPayload {
  /** Patient the tooth belongs to */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Tooth number or identifier */
  toothNumber: string | number;

  /** Tooth numbering system used */
  toothNumberingSystem: ToothNumberingSystem;

  /** Previous tooth condition */
  previousCondition: ToothCondition;

  /** New tooth condition */
  newCondition: ToothCondition;

  /** Surfaces affected (if applicable) */
  surfaces?: ToothSurface[];

  /** Provider who made the update */
  updatedBy: UUID;

  /** Provider name for display purposes */
  updatedByName?: string;

  /** Patient name for display purposes */
  patientName?: string;

  /** Associated procedure that caused the status change */
  procedureId?: UUID;

  /** Associated treatment plan */
  treatmentPlanId?: UUID;

  /** Associated appointment */
  appointmentId?: UUID;

  /** Reason for the status change */
  reason?: string;

  /** Clinical notes about the status change */
  notes?: string;

  /** Severity of condition (if applicable) */
  severity?: 'MILD' | 'MODERATE' | 'SEVERE';

  /** Whether immediate action is required */
  requiresImmediateAction: boolean;

  /** Timestamp when status was updated */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Tooth status updated event envelope
 */
export type ToothStatusUpdatedEvent = EventEnvelope<ToothStatusUpdatedPayload>;

/**
 * Type guard to check if an event is a ToothStatusUpdatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is a ToothStatusUpdatedEvent
 */
export function isToothStatusUpdatedEvent(
  event: EventEnvelope<unknown>
): event is ToothStatusUpdatedEvent {
  return event.type === TOOTH_STATUS_UPDATED_EVENT;
}

/**
 * Factory function to create a ToothStatusUpdatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createToothStatusUpdatedEvent(
  payload: ToothStatusUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ToothStatusUpdatedEvent {
  // Validate critical required fields
  if (!payload.patientId) {
    throw new Error('ToothStatusUpdatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ToothStatusUpdatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ToothStatusUpdatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ToothStatusUpdatedEvent: tenantId is required');
  }
  if (payload.toothNumber === undefined || payload.toothNumber === null) {
    throw new Error('ToothStatusUpdatedEvent: toothNumber is required');
  }
  if (!payload.toothNumberingSystem) {
    throw new Error('ToothStatusUpdatedEvent: toothNumberingSystem is required');
  }
  if (!payload.previousCondition) {
    throw new Error('ToothStatusUpdatedEvent: previousCondition is required');
  }
  if (!payload.newCondition) {
    throw new Error('ToothStatusUpdatedEvent: newCondition is required');
  }
  if (payload.previousCondition === payload.newCondition) {
    throw new Error('ToothStatusUpdatedEvent: previousCondition and newCondition must be different');
  }
  if (!payload.updatedBy) {
    throw new Error('ToothStatusUpdatedEvent: updatedBy is required');
  }
  if (!payload.timestamp) {
    throw new Error('ToothStatusUpdatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: TOOTH_STATUS_UPDATED_EVENT,
    version: TOOTH_STATUS_UPDATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
