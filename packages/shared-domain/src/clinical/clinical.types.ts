/**
 * Clinical Domain Types
 *
 * Complete domain types for Clinical EHR in dental practice management system.
 * Defines odontogram (tooth charting), periodontal assessments, clinical notes,
 * treatment plans, procedures, and clinical consents.
 *
 * @module shared-domain/clinical
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Metadata,
  Nullable,
} from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for a patient
 */
export type PatientId = UUID & { readonly __brand: 'PatientId' };

/**
 * Unique identifier for a provider (dentist, hygienist, etc.)
 */
export type ProviderId = UUID & { readonly __brand: 'ProviderId' };

/**
 * Unique identifier for a clinical note
 */
export type ClinicalNoteId = UUID & { readonly __brand: 'ClinicalNoteId' };

/**
 * Unique identifier for a treatment plan
 */
export type TreatmentPlanId = UUID & { readonly __brand: 'TreatmentPlanId' };

/**
 * Unique identifier for a procedure
 */
export type ProcedureId = UUID & { readonly __brand: 'ProcedureId' };

/**
 * Unique identifier for a consent form
 */
export type ConsentId = UUID & { readonly __brand: 'ConsentId' };

/**
 * Unique identifier for an odontogram (tooth chart)
 */
export type OdontogramId = UUID & { readonly __brand: 'OdontogramId' };

/**
 * Unique identifier for a periodontal chart
 */
export type PerioChartId = UUID & { readonly __brand: 'PerioChartId' };

/**
 * Unique identifier for a stock/inventory item
 */
export type StockItemId = UUID & { readonly __brand: 'StockItemId' };

/**
 * ADA/CDT procedure code (e.g., "D0120" for periodic oral evaluation)
 * Current Dental Terminology (CDT) codes are 5-character codes
 */
export type ProcedureCode = string & { readonly __brand: 'ProcedureCode' };

// ============================================================================
// TOOTH & ODONTOGRAM TYPES
// ============================================================================

/**
 * Tooth numbering system (Universal/American system, 1-32)
 *
 * Permanent teeth numbering:
 * Upper right: 1-8 (1=3rd molar, 8=central incisor)
 * Upper left: 9-16 (9=central incisor, 16=3rd molar)
 * Lower left: 17-24 (17=3rd molar, 24=central incisor)
 * Lower right: 25-32 (25=central incisor, 32=3rd molar)
 *
 * Edge cases:
 * - Primary teeth use letters (A-T) but are stored with codes 51-82 in database
 * - Supernumerary teeth require special handling (not supported in this base type)
 * - Missing teeth are represented in ToothCondition, not by omitting the number
 */
export type ToothNumber =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8        // Upper right
  | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 // Upper left
  | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 // Lower left
  | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32; // Lower right

/**
 * Tooth surfaces for charting procedures and conditions
 *
 * Standard dental surface nomenclature:
 * - Buccal/Facial: Outer surface facing cheek/lips
 * - Lingual/Palatal: Inner surface facing tongue/palate
 * - Mesial: Surface facing toward front/midline
 * - Distal: Surface facing toward back
 * - Occlusal/Incisal: Chewing/biting surface
 *
 * Edge cases:
 * - Anterior teeth use "Incisal" instead of "Occlusal" (handled by provider notation)
 * - Full crown preparations involve all surfaces
 * - Some conditions affect multiple surfaces (represented as array)
 */
export enum ToothSurface {
  /** Outer surface facing cheek/lips */
  BUCCAL = 'buccal',
  /** Outer surface (alternate term, same as buccal) */
  FACIAL = 'facial',
  /** Inner surface facing tongue */
  LINGUAL = 'lingual',
  /** Inner surface facing palate (upper teeth) */
  PALATAL = 'palatal',
  /** Surface toward front of mouth */
  MESIAL = 'mesial',
  /** Surface toward back of mouth */
  DISTAL = 'distal',
  /** Chewing/biting surface */
  OCCLUSAL = 'occlusal',
  /** Biting edge (anterior teeth) */
  INCISAL = 'incisal',
}

/**
 * Tooth condition/status enumeration
 *
 * Represents clinical status of a tooth for odontogram charting.
 * Multiple conditions can apply to the same tooth (e.g., Crown + RCT).
 *
 * Edge cases:
 * - MISSING vs EXTRACTED: MISSING is current state, extraction is historical event
 * - IMPACTED: Tooth present but not erupted (common with wisdom teeth)
 * - UNERUPTED: Tooth present but not yet erupted (common in pediatric)
 * - ECTOPIC: Tooth erupted in wrong position
 * - WATCH: Tooth under observation (early caries, cracked, etc.)
 */
export enum ToothCondition {
  /** Healthy tooth, no conditions */
  HEALTHY = 'healthy',
  /** Dental caries (cavity) detected */
  CARIES = 'caries',
  /** Tooth restored with filling */
  RESTORED = 'restored',
  /** Tooth missing (any reason) */
  MISSING = 'missing',
  /** Tooth impacted (present but not erupted) */
  IMPACTED = 'impacted',
  /** Tooth not yet erupted (pediatric) */
  UNERUPTED = 'unerupted',
  /** Tooth erupted in wrong position */
  ECTOPIC = 'ectopic',
  /** Crown restoration present */
  CROWN = 'crown',
  /** Bridge abutment or pontic */
  BRIDGE = 'bridge',
  /** Dental implant */
  IMPLANT = 'implant',
  /** Root canal treatment completed */
  ROOT_CANAL = 'root_canal',
  /** Tooth fractured/cracked */
  FRACTURED = 'fractured',
  /** Tooth worn/abraded */
  WORN = 'worn',
  /** Tooth under observation/watch */
  WATCH = 'watch',
  /** Tooth requires extraction */
  EXTRACTION_NEEDED = 'extraction_needed',
  /** Tooth extracted (historical) */
  EXTRACTED = 'extracted',
  /** Tooth has post and core */
  POST_AND_CORE = 'post_and_core',
  /** Tooth has veneer */
  VENEER = 'veneer',
  /** Tooth has onlay/inlay */
  ONLAY_INLAY = 'onlay_inlay',
  /** Tooth has sealant */
  SEALANT = 'sealant',
  /** Temporary restoration */
  TEMPORARY = 'temporary',
  /** Root remnants present */
  ROOT_REMNANTS = 'root_remnants',
  /** Tooth has abscess */
  ABSCESS = 'abscess',
  /** Tooth mobile/loose */
  MOBILE = 'mobile',
  /** Drifted/migrated tooth */
  DRIFTED = 'drifted',
  /** Rotated tooth */
  ROTATED = 'rotated',
}

/**
 * Surface-specific condition for detailed charting
 *
 * Associates a condition with specific tooth surfaces.
 *
 * Edge cases:
 * - Empty surfaces array means condition applies to entire tooth
 * - Multiple surface conditions can exist on same tooth
 * - Material type is relevant for restorations (amalgam, composite, etc.)
 */
export interface SurfaceCondition {
  /** Condition affecting the surface(s) */
  condition: ToothCondition;
  /** Surfaces affected (empty = entire tooth) */
  surfaces: ToothSurface[];
  /** Material used for restoration (if applicable) */
  material?: string;
  /** Date condition was recorded/performed */
  recordedAt: ISODateString;
  /** Provider who recorded the condition */
  recordedBy: ProviderId;
  /** Additional notes */
  notes?: string;
}

/**
 * Complete status of a single tooth
 *
 * Captures all conditions, notes, and clinical observations for one tooth.
 *
 * Edge cases:
 * - Primary conditions array can be empty (healthy tooth)
 * - Multiple conditions can coexist (e.g., Crown + RCT + Watch)
 * - Historical conditions tracked separately for audit trail
 * - Mobility scored 0-3 (0=normal, 3=severe mobility)
 */
export interface ToothStatus {
  /** Tooth number (1-32) */
  toothNumber: ToothNumber;
  /** Primary conditions (current state) */
  conditions: SurfaceCondition[];
  /** Mobility score (0=none, 1=slight, 2=moderate, 3=severe) */
  mobility?: 0 | 1 | 2 | 3;
  /** Whether tooth is primary/deciduous (vs permanent) */
  isPrimary: boolean;
  /** Whether tooth is supernumerary (extra tooth) */
  isSupernumerary: boolean;
  /** Clinical notes for this tooth */
  notes?: string;
  /** Last updated timestamp */
  updatedAt: ISODateString;
  /** Provider who last updated */
  updatedBy: ProviderId;
}

/**
 * Single odontogram entry (snapshot in time)
 *
 * Represents tooth chart at a specific point in time.
 * Multiple entries create versioned history.
 *
 * Edge cases:
 * - Entry created at each exam/visit
 * - Changes from previous entry indicate new findings
 * - Linked to specific appointment/visit if applicable
 */
export interface OdontogramEntry {
  /** Unique entry identifier */
  id: UUID;
  /** Date of this charting */
  chartedAt: ISODateString;
  /** Provider who performed charting */
  chartedBy: ProviderId;
  /** Complete tooth chart (32 teeth) */
  teeth: ToothStatus[];
  /** General findings/observations */
  generalFindings?: string;
  /** Related appointment ID (if applicable) */
  appointmentId?: UUID;
  /** Related clinical note ID (if applicable) */
  clinicalNoteId?: ClinicalNoteId;
}

/**
 * Patient odontogram aggregate root
 *
 * Complete tooth charting history for a patient.
 * Maintains versioned history of all odontogram entries.
 *
 * Edge cases:
 * - Entries array sorted chronologically (newest first)
 * - Current state derived from most recent entry
 * - Historical entries immutable for audit compliance
 * - Multi-tenant scoped to organization/clinic
 */
export interface Odontogram {
  /** Unique odontogram identifier */
  id: OdontogramId;
  /** Patient this odontogram belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** All odontogram entries (chronological, newest first) */
  entries: OdontogramEntry[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
}

// ============================================================================
// PERIODONTAL CHARTING TYPES
// ============================================================================

/**
 * Periodontal site measurement
 *
 * Represents measurements at one probing site (6 sites per tooth).
 *
 * Standard periodontal measurements:
 * - Probing depth (PD): 0-15mm (healthy: 1-3mm, 4+ indicates disease)
 * - Recession (REC): 0-15mm (gingival margin to CEJ)
 * - Clinical attachment loss (CAL): PD + REC (key indicator)
 * - Bleeding on probing (BOP): boolean (indicates inflammation)
 * - Suppuration: boolean (indicates infection)
 * - Plaque: boolean (indicates oral hygiene)
 *
 * Edge cases:
 * - Missing tooth sites have null values
 * - Implant sites measured differently (no recession)
 * - Furcation involvement for multi-rooted teeth
 */
export interface PerioSite {
  /** Probing depth in millimeters (0-15) */
  probingDepth: number;
  /** Gingival recession in millimeters (0-15) */
  recession: number;
  /** Calculated attachment loss (probingDepth + recession) */
  attachmentLoss: number;
  /** Bleeding on probing (true = bleeding present) */
  bleeding: boolean;
  /** Suppuration present (pus) */
  suppuration: boolean;
  /** Plaque present */
  plaque: boolean;
  /** Gingival margin position relative to CEJ (+ = recession, - = overgrowth) */
  gingivalMargin?: number;
}

/**
 * Furcation involvement classification
 *
 * Glickman classification for multi-rooted teeth:
 * - Class I: Beginning furcation involvement (probe enters <3mm)
 * - Class II: Partial furcation involvement (probe enters >3mm but not through)
 * - Class III: Through-and-through furcation involvement
 * - Class IV: Through furcation with gingival recession (visible)
 */
export enum FurcationClass {
  /** No furcation involvement */
  NONE = 'none',
  /** Class I: Beginning involvement */
  CLASS_I = 'class_1',
  /** Class II: Partial involvement */
  CLASS_II = 'class_2',
  /** Class III: Through-and-through */
  CLASS_III = 'class_3',
  /** Class IV: Visible involvement */
  CLASS_IV = 'class_4',
}

/**
 * Periodontal measurements for a single tooth
 *
 * Six sites per tooth (standard periodontal charting):
 * - Buccal: Mesial, Mid, Distal
 * - Lingual/Palatal: Mesial, Mid, Distal
 *
 * Edge cases:
 * - Missing teeth have all sites null
 * - Implants measured but interpreted differently
 * - Mobility scored 0-3 (Miller's classification)
 * - Furcation only relevant for multi-rooted teeth
 */
export interface PerioTooth {
  /** Tooth number (1-32) */
  toothNumber: ToothNumber;
  /** Buccal mesial site */
  buccalMesial: PerioSite | null;
  /** Buccal mid site */
  buccalMid: PerioSite | null;
  /** Buccal distal site */
  buccalDistal: PerioSite | null;
  /** Lingual/palatal mesial site */
  lingualMesial: PerioSite | null;
  /** Lingual/palatal mid site */
  lingualMid: PerioSite | null;
  /** Lingual/palatal distal site */
  lingualDistal: PerioSite | null;
  /** Tooth mobility (Miller's classification: 0-3) */
  mobility: 0 | 1 | 2 | 3;
  /** Furcation involvement (multi-rooted teeth only) */
  furcation?: FurcationClass;
  /** Whether tooth is implant (affects interpretation) */
  isImplant: boolean;
  /** Clinical notes for this tooth */
  notes?: string;
}

/**
 * Patient periodontal chart aggregate root
 *
 * Complete periodontal assessment for a patient.
 * Maintains versioned history of assessments.
 *
 * Edge cases:
 * - Charts created periodically (typically annually or when treating perio)
 * - Current state derived from most recent chart
 * - Historical charts immutable for audit compliance
 * - Overall classification (healthy, gingivitis, periodontitis) derived from data
 */
export interface PerioChart {
  /** Unique perio chart identifier */
  id: PerioChartId;
  /** Patient this chart belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Date of periodontal exam */
  chartedAt: ISODateString;
  /** Provider who performed exam */
  chartedBy: ProviderId;
  /** All 32 teeth periodontal measurements */
  teeth: PerioTooth[];
  /** Overall periodontal classification */
  classification?: 'healthy' | 'gingivitis' | 'mild_periodontitis' | 'moderate_periodontitis' | 'severe_periodontitis';
  /** General periodontal findings */
  generalFindings?: string;
  /** Percentage of sites with bleeding */
  bleedingPercentage?: number;
  /** Percentage of sites with plaque */
  plaquePercentage?: number;
  /** Related appointment ID (if applicable) */
  appointmentId?: UUID;
  /** Related clinical note ID (if applicable) */
  clinicalNoteId?: ClinicalNoteId;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
}

// ============================================================================
// CLINICAL NOTES TYPES
// ============================================================================

/**
 * Clinical note type enumeration
 *
 * Categorizes clinical documentation by purpose and structure.
 *
 * Standard note types:
 * - SOAP: Subjective, Objective, Assessment, Plan (most common)
 * - PROGRESS: Progress note (ongoing treatment)
 * - CONSULT: Consultation note (specialist referral)
 * - EMERGENCY: Emergency visit note (urgent care)
 * - OPERATIVE: Operative/procedure note (surgical procedures)
 * - PHONE: Phone encounter note
 * - FOLLOWUP: Follow-up note (post-treatment)
 */
export enum ClinicalNoteType {
  /** SOAP note (Subjective, Objective, Assessment, Plan) */
  SOAP = 'soap',
  /** Progress note */
  PROGRESS = 'progress',
  /** Consultation note */
  CONSULT = 'consult',
  /** Emergency visit note */
  EMERGENCY = 'emergency',
  /** Operative/procedure note */
  OPERATIVE = 'operative',
  /** Phone encounter note */
  PHONE = 'phone',
  /** Follow-up note */
  FOLLOWUP = 'followup',
  /** Initial evaluation note */
  INITIAL_EVAL = 'initial_eval',
  /** Referral note */
  REFERRAL = 'referral',
}

/**
 * SOAP note structure
 *
 * Standard medical documentation format:
 * - Subjective: Patient's description of symptoms/concerns
 * - Objective: Clinical findings and measurements
 * - Assessment: Diagnosis and clinical interpretation
 * - Plan: Treatment plan and next steps
 *
 * Edge cases:
 * - All fields optional (partial notes during appointment)
 * - Assessment can include multiple diagnoses
 * - Plan can include multiple action items
 */
export interface SOAPNote {
  /** Subjective: Patient's chief complaint and symptoms */
  subjective?: string;
  /** Objective: Clinical findings, vital signs, examination */
  objective?: string;
  /** Assessment: Diagnosis and clinical interpretation */
  assessment?: string;
  /** Plan: Treatment plan, prescriptions, follow-up */
  plan?: string;
}

/**
 * Attached file reference
 *
 * References files attached to clinical notes (images, documents, etc.).
 *
 * Edge cases:
 * - File storage handled by separate document management service
 * - Only metadata stored in clinical note
 * - HIPAA-compliant access controls required
 */
export interface AttachedFile {
  /** File identifier */
  fileId: UUID;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** File type category */
  category: 'image' | 'document' | 'xray' | 'photo' | 'other';
  /** Description/caption */
  description?: string;
  /** Upload timestamp */
  uploadedAt: ISODateString;
  /** User who uploaded */
  uploadedBy: UUID;
}

/**
 * Clinical note entity
 *
 * Complete clinical documentation for patient encounter.
 *
 * Edge cases:
 * - Note can be draft (not finalized)
 * - Signed notes are locked (immutable)
 * - Amendments tracked separately for audit compliance
 * - Multiple providers can contribute (co-signature)
 * - Templates can be used for standardized documentation
 */
export interface ClinicalNote {
  /** Unique clinical note identifier */
  id: ClinicalNoteId;
  /** Patient this note belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Note type */
  type: ClinicalNoteType;
  /** Note title/summary */
  title: string;
  /** Date of encounter/service */
  encounterDate: ISODateString;
  /** SOAP structure (if applicable) */
  soap?: SOAPNote;
  /** Free-text note content (for non-SOAP notes) */
  content?: string;
  /** Primary provider/author */
  providerId: ProviderId;
  /** Co-signing providers (if applicable) */
  coSigners?: ProviderId[];
  /** Related appointment ID (if applicable) */
  appointmentId?: UUID;
  /** Related procedures performed during encounter */
  procedureIds?: ProcedureId[];
  /** Attached files (images, documents, etc.) */
  attachments: AttachedFile[];
  /** Tags for categorization */
  tags?: string[];
  /** Whether note is finalized (locked) */
  isFinalized: boolean;
  /** Finalization timestamp */
  finalizedAt?: ISODateString;
  /** Whether note is signed (electronically) */
  isSigned: boolean;
  /** Signature timestamp */
  signedAt?: ISODateString;
  /** Signature method (electronic, digital, etc.) */
  signatureMethod?: string;
  /** Amendment history (for signed notes) */
  amendments?: Array<{
    amendmentId: UUID;
    amendedAt: ISODateString;
    amendedBy: ProviderId;
    reason: string;
    content: string;
  }>;
  /** Template used (if applicable) */
  templateId?: UUID;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created note */
  createdBy: UUID;
  /** User who last updated note */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// TREATMENT PLAN TYPES
// ============================================================================

/**
 * Treatment plan status enumeration
 *
 * Lifecycle status of a treatment plan.
 *
 * Edge cases:
 * - DRAFT: Plan being created (not presented to patient)
 * - PENDING: Presented to patient, awaiting acceptance
 * - APPROVED: Patient accepted, ready to schedule
 * - IN_PROGRESS: Treatment started
 * - COMPLETED: All procedures completed
 * - CANCELLED: Plan cancelled (patient declined, changed, etc.)
 * - EXPIRED: Plan expired without acceptance
 */
export enum TreatmentPlanStatus {
  /** Draft plan (not presented) */
  DRAFT = 'draft',
  /** Pending patient acceptance */
  PENDING = 'pending',
  /** Approved by patient */
  APPROVED = 'approved',
  /** Treatment in progress */
  IN_PROGRESS = 'in_progress',
  /** Treatment completed */
  COMPLETED = 'completed',
  /** Plan cancelled */
  CANCELLED = 'cancelled',
  /** Plan expired */
  EXPIRED = 'expired',
  /** Plan on hold */
  ON_HOLD = 'on_hold',
}

/**
 * Procedure status within treatment plan
 *
 * Status of individual procedure items in a treatment plan.
 */
export enum ProcedureItemStatus {
  /** Procedure planned (not scheduled) */
  PLANNED = 'planned',
  /** Procedure scheduled (appointment booked) */
  SCHEDULED = 'scheduled',
  /** Procedure in progress (appointment started) */
  IN_PROGRESS = 'in_progress',
  /** Procedure completed */
  COMPLETED = 'completed',
  /** Procedure cancelled */
  CANCELLED = 'cancelled',
  /** Procedure on hold */
  ON_HOLD = 'on_hold',
}

/**
 * Treatment phase/stage
 *
 * Groups procedures into sequential phases for complex treatment plans.
 *
 * Common dental treatment phases:
 * - Emergency: Urgent/emergency treatment (pain relief)
 * - Stabilization: Initial stabilization (infections, decay)
 * - Restorative: Restorative procedures (fillings, crowns)
 * - Cosmetic: Elective cosmetic procedures
 * - Maintenance: Ongoing preventive maintenance
 */
export enum TreatmentPhase {
  /** Emergency/urgent treatment */
  EMERGENCY = 'emergency',
  /** Initial stabilization */
  STABILIZATION = 'stabilization',
  /** Restorative treatment */
  RESTORATIVE = 'restorative',
  /** Periodontal treatment */
  PERIODONTAL = 'periodontal',
  /** Endodontic treatment */
  ENDODONTIC = 'endodontic',
  /** Surgical treatment */
  SURGICAL = 'surgical',
  /** Orthodontic treatment */
  ORTHODONTIC = 'orthodontic',
  /** Prosthetic treatment */
  PROSTHETIC = 'prosthetic',
  /** Cosmetic treatment */
  COSMETIC = 'cosmetic',
  /** Preventive maintenance */
  MAINTENANCE = 'maintenance',
}

/**
 * Individual procedure item in treatment plan
 *
 * Represents a single procedure to be performed.
 *
 * Edge cases:
 * - Fee can be estimated or exact (based on insurance)
 * - Insurance coverage calculated separately
 * - Multiple teeth can be treated in one procedure
 * - Surfaces specified for surface-specific procedures
 * - Prerequisites can be defined (procedure must follow another)
 */
export interface ProcedureItem {
  /** Unique procedure item identifier */
  id: UUID;
  /** ADA/CDT procedure code */
  code: ProcedureCode;
  /** Procedure description */
  description: string;
  /** Category (restorative, preventive, etc.) */
  category: string;
  /** Teeth involved (can be multiple) */
  teeth: ToothNumber[];
  /** Surfaces involved (if applicable) */
  surfaces?: ToothSurface[];
  /** Estimated/actual fee */
  fee: MoneyValue;
  /** Estimated insurance coverage */
  insuranceCoverage?: MoneyValue;
  /** Estimated patient responsibility */
  patientCost?: MoneyValue;
  /** Treatment phase this belongs to */
  phase?: TreatmentPhase;
  /** Sequence number within phase */
  sequence?: number;
  /** Current status */
  status: ProcedureItemStatus;
  /** Provider assigned to perform procedure */
  assignedProviderId?: ProviderId;
  /** Scheduled appointment ID (if scheduled) */
  appointmentId?: UUID;
  /** Completed procedure ID (if completed) */
  completedProcedureId?: ProcedureId;
  /** Prerequisite procedure item IDs (must complete first) */
  prerequisites?: UUID[];
  /** Estimated duration in minutes */
  estimatedDuration?: number;
  /** Clinical notes for this procedure */
  notes?: string;
  /** Priority (urgent, high, normal, low) */
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  /** Alternative procedure options */
  alternatives?: Array<{
    code: ProcedureCode;
    description: string;
    fee: MoneyValue;
    notes?: string;
  }>;
}

/**
 * Treatment option (alternative treatment plans)
 *
 * Represents one option in a multi-option treatment plan.
 * Allows presenting multiple treatment approaches to patient.
 *
 * Edge cases:
 * - Minimum 1 option, typically 2-3 (conservative, standard, comprehensive)
 * - Each option is independent (patient selects one)
 * - Costs calculated as totals for comparison
 */
export interface TreatmentOption {
  /** Option identifier */
  optionId: UUID;
  /** Option name (e.g., "Conservative", "Standard", "Comprehensive") */
  name: string;
  /** Option description */
  description: string;
  /** Procedures in this option */
  procedures: ProcedureItem[];
  /** Total estimated fee */
  totalFee: MoneyValue;
  /** Total estimated insurance coverage */
  totalInsuranceCoverage?: MoneyValue;
  /** Total estimated patient cost */
  totalPatientCost?: MoneyValue;
  /** Estimated total duration (sum of procedure durations) */
  estimatedDuration?: number;
  /** Number of appointments estimated */
  estimatedAppointments?: number;
  /** Clinical advantages of this option */
  advantages?: string[];
  /** Clinical disadvantages/risks of this option */
  disadvantages?: string[];
  /** Provider recommendation level (recommended, acceptable, not_recommended) */
  recommendationLevel?: 'recommended' | 'acceptable' | 'not_recommended';
}

/**
 * Treatment plan entity (aggregate root)
 *
 * Complete treatment plan for patient with versioning and multi-option support.
 *
 * Edge cases:
 * - Plans are versioned (immutable once presented)
 * - Multiple options per plan (patient selects one)
 * - Selected option tracked separately
 * - Phased treatment supported (sequential stages)
 * - Plan can be revised (creates new version)
 * - Insurance pre-authorization tracked
 * - Financial arrangements tracked (payment plans)
 */
export interface TreatmentPlan {
  /** Unique treatment plan identifier */
  id: TreatmentPlanId;
  /** Patient this plan belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Plan version number (increments on revision) */
  version: number;
  /** Previous plan ID (if this is a revision) */
  previousPlanId?: TreatmentPlanId;
  /** Plan title/summary */
  title: string;
  /** Detailed description */
  description?: string;
  /** Primary provider/author */
  providerId: ProviderId;
  /** Current plan status */
  status: TreatmentPlanStatus;
  /** Treatment options (typically 1-3) */
  options: TreatmentOption[];
  /** Selected option ID (after patient acceptance) */
  selectedOptionId?: UUID;
  /** Date plan was created */
  planDate: ISODateString;
  /** Date presented to patient */
  presentedAt?: ISODateString;
  /** Date approved by patient */
  approvedAt?: ISODateString;
  /** Date treatment started */
  startedAt?: ISODateString;
  /** Date treatment completed */
  completedAt?: ISODateString;
  /** Plan expiration date */
  expiresAt?: ISODateString;
  /** Related clinical note ID */
  clinicalNoteId?: ClinicalNoteId;
  /** Related consent form IDs */
  consentIds?: ConsentId[];
  /** Insurance pre-authorization status */
  preAuthStatus?: 'pending' | 'approved' | 'denied' | 'not_required';
  /** Pre-authorization number */
  preAuthNumber?: string;
  /** Financial arrangement notes (payment plan, etc.) */
  financialNotes?: string;
  /** Patient questions/concerns */
  patientQuestions?: string[];
  /** Provider notes (private) */
  providerNotes?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created plan */
  createdBy: UUID;
  /** User who last updated plan */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// COMPLETED PROCEDURES TYPES
// ============================================================================

/**
 * Procedure completion status
 *
 * Final status of a completed procedure.
 */
export enum ProcedureStatus {
  /** Procedure scheduled (not yet started) */
  SCHEDULED = 'scheduled',
  /** Procedure in progress (partially completed) */
  IN_PROGRESS = 'in_progress',
  /** Procedure completed successfully */
  COMPLETED = 'completed',
  /** Procedure partially completed (will continue) */
  PARTIALLY_COMPLETED = 'partially_completed',
  /** Procedure cancelled (not performed) */
  CANCELLED = 'cancelled',
  /** Procedure failed/aborted */
  FAILED = 'failed',
}

/**
 * Stock/supply item consumed during procedure
 *
 * Tracks inventory consumption for procedure costing and restocking.
 *
 * Edge cases:
 * - Quantity can be fractional (e.g., 0.5ml of anesthetic)
 * - Cost tracked for procedure profitability analysis
 * - Batch/lot number tracked for recalls
 */
export interface ConsumedStockItem {
  /** Stock item identifier */
  stockItemId: StockItemId;
  /** Item name/description */
  itemName: string;
  /** Quantity consumed */
  quantity: number;
  /** Unit of measure (ml, units, pieces, etc.) */
  unit: string;
  /** Cost per unit */
  unitCost?: MoneyValue;
  /** Total cost */
  totalCost?: MoneyValue;
  /** Batch/lot number (for recalls) */
  batchNumber?: string;
  /** Expiration date */
  expirationDate?: ISODateString;
}

/**
 * Anesthesia record
 *
 * Documents anesthesia administration for procedure.
 *
 * Edge cases:
 * - Multiple anesthetics can be used
 * - Dosage must be documented for safety
 * - Adverse reactions must be documented immediately
 */
export interface AnesthesiaRecord {
  /** Anesthetic type (lidocaine, articaine, etc.) */
  type: string;
  /** Dosage administered */
  dosage: string;
  /** Route of administration (local infiltration, block, etc.) */
  route: string;
  /** Time administered */
  administeredAt: ISODateString;
  /** Provider who administered */
  administeredBy: ProviderId;
  /** Adverse reactions (if any) */
  adverseReactions?: string;
}

/**
 * Completed procedure entity
 *
 * Records completed/performed procedures with clinical details.
 *
 * Edge cases:
 * - Procedure may differ from planned (code change during treatment)
 * - Actual time may differ from estimated
 * - Complications must be documented
 * - Materials used tracked for warranty/recalls
 * - Post-op instructions provided to patient
 * - Follow-up appointments scheduled
 */
export interface CompletedProcedure {
  /** Unique procedure identifier */
  id: ProcedureId;
  /** Patient this procedure was performed on */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** ADA/CDT procedure code */
  code: ProcedureCode;
  /** Procedure description */
  description: string;
  /** Category (restorative, preventive, etc.) */
  category: string;
  /** Date procedure performed */
  procedureDate: ISODateString;
  /** Start time */
  startTime: ISODateString;
  /** End time */
  endTime: ISODateString;
  /** Actual duration in minutes */
  durationMinutes: number;
  /** Primary provider who performed procedure */
  providerId: ProviderId;
  /** Assisting providers */
  assistingProviders?: ProviderId[];
  /** Teeth treated */
  teeth: ToothNumber[];
  /** Surfaces treated (if applicable) */
  surfaces?: ToothSurface[];
  /** Procedure status */
  status: ProcedureStatus;
  /** Related appointment ID */
  appointmentId?: UUID;
  /** Related treatment plan ID */
  treatmentPlanId?: TreatmentPlanId;
  /** Related clinical note ID */
  clinicalNoteId?: ClinicalNoteId;
  /** Anesthesia administered */
  anesthesia?: AnesthesiaRecord[];
  /** Materials used (brands, lot numbers) */
  materialsUsed?: Array<{
    name: string;
    brand?: string;
    lotNumber?: string;
    expirationDate?: ISODateString;
  }>;
  /** Stock items consumed */
  stockItemsConsumed?: ConsumedStockItem[];
  /** Clinical findings during procedure */
  findings?: string;
  /** Complications encountered */
  complications?: string;
  /** Post-operative instructions */
  postOpInstructions?: string;
  /** Follow-up required (date/description) */
  followUp?: {
    required: boolean;
    scheduledDate?: ISODateString;
    instructions?: string;
  };
  /** Actual fee charged */
  fee: MoneyValue;
  /** Insurance coverage amount */
  insuranceCoverage?: MoneyValue;
  /** Patient payment amount */
  patientPayment?: MoneyValue;
  /** Billing status */
  billingStatus?: 'unbilled' | 'billed' | 'paid' | 'pending';
  /** Quality assurance notes */
  qaReview?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created record */
  createdBy: UUID;
  /** User who last updated record */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// CONSENT TYPES
// ============================================================================

/**
 * Consent type enumeration
 *
 * Categories of consent forms required in dental practice.
 *
 * Edge cases:
 * - TREATMENT: General treatment consent (required for all patients)
 * - ANESTHESIA: Specific to anesthesia administration
 * - FINANCIAL: Financial responsibility and payment agreement
 * - HIPAA: Privacy notice acknowledgment (US requirement)
 * - PHOTOGRAPHY: Consent for clinical/marketing photography
 * - RESEARCH: Consent for participation in research/studies
 * - MINOR: Special consent for minors (parent/guardian)
 * - REFERRAL: Consent to share records with specialists
 */
export enum ConsentType {
  /** General treatment consent */
  TREATMENT = 'treatment',
  /** Anesthesia consent */
  ANESTHESIA = 'anesthesia',
  /** Sedation consent (IV sedation, nitrous oxide) */
  SEDATION = 'sedation',
  /** Surgical procedure consent */
  SURGICAL = 'surgical',
  /** Financial responsibility agreement */
  FINANCIAL = 'financial',
  /** HIPAA privacy notice acknowledgment */
  HIPAA = 'hipaa',
  /** Photography consent (clinical/marketing) */
  PHOTOGRAPHY = 'photography',
  /** Research participation consent */
  RESEARCH = 'research',
  /** Minor treatment consent (parent/guardian) */
  MINOR = 'minor',
  /** Records release consent */
  RECORDS_RELEASE = 'records_release',
  /** Referral consent (share with specialist) */
  REFERRAL = 'referral',
  /** Teledentistry consent */
  TELEDENTISTRY = 'teledentistry',
  /** GDPR data processing consent */
  GDPR = 'gdpr',
}

/**
 * Consent status enumeration
 *
 * Lifecycle status of consent form.
 */
export enum ConsentStatus {
  /** Consent pending signature */
  PENDING = 'pending',
  /** Consent signed/accepted */
  SIGNED = 'signed',
  /** Consent declined/refused */
  DECLINED = 'declined',
  /** Consent expired (requires renewal) */
  EXPIRED = 'expired',
  /** Consent revoked by patient */
  REVOKED = 'revoked',
  /** Consent voided (administrative) */
  VOIDED = 'voided',
}

/**
 * Digital signature record
 *
 * Captures digital signature with audit trail.
 *
 * Edge cases:
 * - Multiple signature methods (electronic pad, click-through, DocuSign, etc.)
 * - IP address and device captured for non-repudiation
 * - Signature image stored separately
 * - Witness signature may be required for certain procedures
 */
export interface DigitalSignature {
  /** Signature identifier */
  signatureId: UUID;
  /** Who signed (patient or guardian) */
  signedBy: UUID;
  /** Signer's printed name */
  signerName: string;
  /** Relationship to patient (self, parent, guardian, etc.) */
  relationship: string;
  /** Signature timestamp */
  signedAt: ISODateString;
  /** IP address of signer */
  ipAddress?: string;
  /** Device/user agent */
  userAgent?: string;
  /** Signature method (electronic_pad, click_through, docusign, wet_signature) */
  signatureMethod: 'electronic_pad' | 'click_through' | 'docusign' | 'adobe_sign' | 'wet_signature' | 'other';
  /** Reference to signature image file (if applicable) */
  signatureImageId?: UUID;
  /** Geographic location (if captured) */
  location?: string;
  /** Witness signature (if required) */
  witnessSignature?: {
    witnessId: UUID;
    witnessName: string;
    witnessRole: string;
    signedAt: ISODateString;
  };
}

/**
 * Clinical consent entity
 *
 * Complete consent form with signature and audit trail.
 *
 * Edge cases:
 * - Consent can be template-based or custom
 * - Multiple procedures can be covered by one consent
 * - Consent can expire and require renewal
 * - Declined consent must be documented
 * - Minor consent requires parent/guardian signature
 * - Emergency consent has special rules (implied consent)
 * - Revocation must be timestamped and documented
 */
export interface ClinicalConsent {
  /** Unique consent identifier */
  id: ConsentId;
  /** Patient this consent belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Consent type */
  type: ConsentType;
  /** Consent title */
  title: string;
  /** Full consent text/content */
  content: string;
  /** Consent template ID (if based on template) */
  templateId?: UUID;
  /** Template version used */
  templateVersion?: string;
  /** Current status */
  status: ConsentStatus;
  /** Related treatment plan ID (if applicable) */
  treatmentPlanId?: TreatmentPlanId;
  /** Related procedure IDs (if procedure-specific) */
  procedureIds?: ProcedureId[];
  /** Provider who obtained consent */
  obtainedBy: ProviderId;
  /** Date consent was presented */
  presentedAt: ISODateString;
  /** Digital signature (if signed) */
  signature?: DigitalSignature;
  /** Date consent was signed */
  signedAt?: ISODateString;
  /** Reason for declining (if declined) */
  declineReason?: string;
  /** Date consent was declined */
  declinedAt?: ISODateString;
  /** Expiration date (if applicable) */
  expiresAt?: ISODateString;
  /** Date consent was revoked */
  revokedAt?: ISODateString;
  /** Reason for revocation */
  revocationReason?: string;
  /** Risks explained to patient */
  risksExplained?: string[];
  /** Alternatives discussed */
  alternativesDiscussed?: string[];
  /** Patient questions/concerns addressed */
  patientQuestions?: string[];
  /** Witness present (if required) */
  witnessPresent?: boolean;
  /** Interpreter used (if language barrier) */
  interpreterUsed?: boolean;
  /** Interpreter name (if applicable) */
  interpreterName?: string;
  /** Language of consent */
  language?: string;
  /** Special circumstances notes */
  specialCircumstances?: string;
  /** Attached files (signed PDF, etc.) */
  attachments?: AttachedFile[];
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created consent */
  createdBy: UUID;
  /** User who last updated consent */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// DIAGNOSTIC CODES (ICD-10)
// ============================================================================

/**
 * ICD-10 diagnostic code
 *
 * International Classification of Diseases codes for medical diagnoses.
 * Required for insurance billing and medical record keeping.
 *
 * Edge cases:
 * - Dental practices use subset of ICD-10 codes
 * - Codes updated annually (version tracking important)
 * - Some procedures require specific diagnosis codes for coverage
 * - Multiple diagnosis codes can apply to single patient/procedure
 */
export interface DiagnosticCode {
  /** ICD-10 code (e.g., "K02.51" for dental caries) */
  code: string;
  /** Code description */
  description: string;
  /** Code category */
  category: string;
  /** ICD-10 version/year */
  version?: string;
  /** Whether code is billable */
  isBillable: boolean;
}

/**
 * Patient diagnosis
 *
 * Links diagnostic codes to patient with clinical context.
 */
export interface PatientDiagnosis {
  /** Diagnosis identifier */
  id: UUID;
  /** Patient ID */
  patientId: PatientId;
  /** ICD-10 diagnostic code */
  diagnosticCode: DiagnosticCode;
  /** Date of diagnosis */
  diagnosisDate: ISODateString;
  /** Provider who made diagnosis */
  diagnosedBy: ProviderId;
  /** Clinical notes about diagnosis */
  notes?: string;
  /** Status (active, resolved, chronic) */
  status: 'active' | 'resolved' | 'chronic' | 'ruled_out';
  /** Date resolved (if applicable) */
  resolvedAt?: ISODateString;
  /** Related procedures */
  relatedProcedures?: ProcedureId[];
  /** Related treatment plans */
  relatedTreatmentPlans?: TreatmentPlanId[];
}
