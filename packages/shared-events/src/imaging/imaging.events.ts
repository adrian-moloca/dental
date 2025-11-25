/**
 * Imaging Events
 *
 * Domain events for diagnostic imaging operations including imaging studies,
 * radiology reports, and AI-assisted analysis results.
 *
 * These events are consumed by:
 * - Patient Timeline (aggregating imaging history)
 * - Clinical Module (linking imaging to tooth references and procedures)
 * - AI Engine (triggering automated analysis and findings detection)
 * - Automation Engine (follow-up workflows, report reminders)
 * - Analytics Platform (imaging utilization, diagnostic tracking)
 * - Compliance Systems (radiation dose tracking, DICOM compliance)
 *
 * @module shared-events/imaging
 */

import type { UUID, OrganizationId, ClinicId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';

// ============================================================================
// EVENT TYPE CONSTANTS
// ============================================================================

/**
 * Imaging study created event type constant
 */
export const IMAGING_STUDY_CREATED_EVENT = 'dental.imaging.study.created' as const;

/**
 * Imaging study updated event type constant
 */
export const IMAGING_STUDY_UPDATED_EVENT = 'dental.imaging.study.updated' as const;

/**
 * Imaging report created event type constant
 */
export const IMAGING_REPORT_CREATED_EVENT = 'dental.imaging.report.created' as const;

/**
 * Imaging AI result created event type constant
 */
export const IMAGING_AI_RESULT_CREATED_EVENT = 'dental.imaging.ai-result.created' as const;

// ============================================================================
// EVENT VERSION CONSTANTS
// ============================================================================

export const IMAGING_STUDY_CREATED_VERSION = 1;
export const IMAGING_STUDY_UPDATED_VERSION = 1;
export const IMAGING_REPORT_CREATED_VERSION = 1;
export const IMAGING_AI_RESULT_CREATED_VERSION = 1;

// ============================================================================
// ENUMERATIONS AND SHARED TYPES
// ============================================================================

/**
 * Imaging modality enumeration
 * Standard radiological modalities used in dental imaging
 */
export type ImagingModality =
  | 'BITEWING'
  | 'PERIAPICAL'
  | 'PANORAMIC'
  | 'CEPHALOMETRIC'
  | 'CBCT'
  | 'CT'
  | 'MRI'
  | 'OCCLUSAL'
  | 'INTRAORAL'
  | 'EXTRAORAL'
  | 'DIGITAL_XRAY'
  | 'PHOTOGRAPH'
  | 'VIDEO'
  | 'OTHER';

/**
 * Anatomical region for imaging
 */
export type ImagingRegion =
  | 'FULL_MOUTH'
  | 'MAXILLA'
  | 'MANDIBLE'
  | 'ANTERIOR'
  | 'POSTERIOR'
  | 'LEFT_QUADRANT'
  | 'RIGHT_QUADRANT'
  | 'UPPER_LEFT'
  | 'UPPER_RIGHT'
  | 'LOWER_LEFT'
  | 'LOWER_RIGHT'
  | 'SINGLE_TOOTH'
  | 'TMJ'
  | 'SINUS'
  | 'AIRWAY'
  | 'SOFT_TISSUE'
  | 'OTHER';

/**
 * Imaging study status enumeration
 */
export type ImagingStudyStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'ARCHIVED';

/**
 * Report status enumeration
 */
export type ReportStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'SIGNED'
  | 'AMENDED'
  | 'FINALIZED';

/**
 * Report type enumeration
 */
export type ReportType =
  | 'DIAGNOSTIC'
  | 'SCREENING'
  | 'FOLLOW_UP'
  | 'CONSULTATION'
  | 'TREATMENT_PLANNING'
  | 'PREOPERATIVE'
  | 'POSTOPERATIVE'
  | 'COMPARATIVE'
  | 'EMERGENCY'
  | 'OTHER';

/**
 * AI finding severity enumeration
 */
export type AIFindingSeverity =
  | 'NORMAL'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'
  | 'UNCERTAIN';

/**
 * Critical finding detected by AI
 */
export interface CriticalFinding {
  /** Finding identifier */
  findingId: UUID;
  /** Type of finding (e.g., 'CARIES', 'PERIAPICAL_LESION', 'BONE_LOSS') */
  findingType: string;
  /** Severity level */
  severity: AIFindingSeverity;
  /** Confidence score (0-1) */
  confidence: number;
  /** Affected tooth numbers */
  toothNumbers?: (string | number)[];
  /** Brief description */
  description: string;
  /** Location/region in the image */
  location?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  /** Recommended action */
  recommendation?: string;
}

/**
 * Study change summary for update events
 */
export interface StudyChange {
  /** Field that changed */
  field: string;
  /** Previous value */
  previousValue?: string | number | boolean | null;
  /** New value */
  newValue?: string | number | boolean | null;
  /** Change description */
  description?: string;
}

// ============================================================================
// 1. IMAGING STUDY CREATED EVENT
// ============================================================================

/**
 * Imaging study created event payload
 *
 * Published when a new diagnostic imaging study is captured or imported.
 * Consumed by patient timeline, clinical systems, AI engine, and analytics.
 *
 * @example
 * ```typescript
 * const payload: ImagingStudyCreatedPayload = {
 *   studyId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   modality: 'PANORAMIC',
 *   region: 'FULL_MOUTH',
 *   studyDate: '2025-11-20T14:30:00Z',
 *   toothNumbers: [],
 *   referringProviderId: 'provider-456',
 *   appointmentId: 'appt-555',
 *   procedureId: 'proc-789',
 *   status: 'COMPLETED',
 *   fileCount: 1,
 *   timestamp: '2025-11-20T14:35:00Z',
 * };
 * ```
 */
export interface ImagingStudyCreatedPayload {
  /** Unique imaging study identifier */
  studyId: UUID;

  /** Patient the imaging study is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where study was performed */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Imaging modality type */
  modality: ImagingModality;

  /** Anatomical region imaged */
  region: ImagingRegion;

  /** Date and time the study was performed */
  studyDate: ISODateString;

  /** Specific tooth numbers if applicable (using practice numbering system) */
  toothNumbers?: (string | number)[];

  /** Provider who ordered/referred the imaging study */
  referringProviderId: UUID;

  /** Referring provider name for display */
  referringProviderName?: string;

  /** Provider who performed the imaging */
  performingProviderId?: UUID;

  /** Performing provider name for display */
  performingProviderName?: string;

  /** Associated appointment ID */
  appointmentId?: UUID;

  /** Associated procedure ID if linked to a specific procedure */
  procedureId?: UUID;

  /** Associated treatment plan ID if part of treatment planning */
  treatmentPlanId?: UUID;

  /** Current status of the imaging study */
  status: ImagingStudyStatus;

  /** Number of image files in the study */
  fileCount: number;

  /** Total file size in bytes */
  totalFileSize?: number;

  /** Study description or notes */
  description?: string;

  /** Clinical indication or reason for imaging */
  clinicalIndication?: string;

  /** Patient name for display purposes */
  patientName: string;

  /** Whether study requires urgent review */
  isUrgent: boolean;

  /** Whether study contains critical findings */
  hasCriticalFindings?: boolean;

  /** Radiation dose information if applicable */
  radiationDose?: {
    value: number;
    unit: string;
  };

  /** DICOM study instance UID if applicable */
  studyInstanceUID?: string;

  /** Equipment/device used for imaging */
  equipmentInfo?: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
  };

  /** Timestamp when study was created in system */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Imaging study created event envelope
 */
export type ImagingStudyCreatedEvent = EventEnvelope<ImagingStudyCreatedPayload>;

/**
 * Type guard to check if an event is an ImagingStudyCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is an ImagingStudyCreatedEvent
 */
export function isImagingStudyCreatedEvent(
  event: EventEnvelope<unknown>
): event is ImagingStudyCreatedEvent {
  return event.type === IMAGING_STUDY_CREATED_EVENT;
}

/**
 * Factory function to create an ImagingStudyCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createImagingStudyCreatedEvent(
  payload: ImagingStudyCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ImagingStudyCreatedEvent {
  // Validate critical required fields
  if (!payload.studyId) {
    throw new Error('ImagingStudyCreatedEvent: studyId is required');
  }
  if (!payload.patientId) {
    throw new Error('ImagingStudyCreatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ImagingStudyCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ImagingStudyCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ImagingStudyCreatedEvent: tenantId is required');
  }
  if (!payload.modality) {
    throw new Error('ImagingStudyCreatedEvent: modality is required');
  }
  if (!payload.region) {
    throw new Error('ImagingStudyCreatedEvent: region is required');
  }
  if (!payload.studyDate) {
    throw new Error('ImagingStudyCreatedEvent: studyDate is required');
  }
  if (!payload.referringProviderId) {
    throw new Error('ImagingStudyCreatedEvent: referringProviderId is required');
  }
  if (!payload.status) {
    throw new Error('ImagingStudyCreatedEvent: status is required');
  }
  if (payload.fileCount === undefined || payload.fileCount === null) {
    throw new Error('ImagingStudyCreatedEvent: fileCount is required');
  }
  if (payload.fileCount < 0) {
    throw new Error('ImagingStudyCreatedEvent: fileCount cannot be negative');
  }
  if (!payload.timestamp) {
    throw new Error('ImagingStudyCreatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: IMAGING_STUDY_CREATED_EVENT,
    version: IMAGING_STUDY_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 2. IMAGING STUDY UPDATED EVENT
// ============================================================================

/**
 * Imaging study updated event payload
 *
 * Published when an imaging study is modified (status changed, files added,
 * report status updated). Consumed by patient timeline, clinical systems,
 * and notification systems.
 *
 * @example
 * ```typescript
 * const payload: ImagingStudyUpdatedPayload = {
 *   studyId: '123e4567-e89b-12d3-a456-426614174000',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   changes: {
 *     status: 'COMPLETED',
 *     fileCount: 5,
 *     reportStatus: 'SIGNED',
 *   },
 *   updatedBy: 'provider-456',
 *   timestamp: '2025-11-20T15:00:00Z',
 * };
 * ```
 */
export interface ImagingStudyUpdatedPayload {
  /** Imaging study identifier */
  studyId: UUID;

  /** Patient the study is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Summary of changes made to the study */
  changes: {
    /** New status if status changed */
    status?: ImagingStudyStatus;
    /** Previous status if status changed */
    previousStatus?: ImagingStudyStatus;
    /** New file count if files added/removed */
    fileCount?: number;
    /** Previous file count if files added/removed */
    previousFileCount?: number;
    /** New report status if report status changed */
    reportStatus?: ReportStatus;
    /** Previous report status if report status changed */
    previousReportStatus?: ReportStatus;
    /** New description if description changed */
    description?: string;
    /** Whether critical findings flag changed */
    hasCriticalFindings?: boolean;
    /** Additional change details */
    detailedChanges?: StudyChange[];
  };

  /** User who made the update */
  updatedBy: UUID;

  /** Updated by user name for display */
  updatedByName?: string;

  /** Patient name for display purposes */
  patientName?: string;

  /** Reason for the update */
  reason?: string;

  /** Whether update is critical/urgent */
  isCriticalUpdate: boolean;

  /** Timestamp when update occurred */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Imaging study updated event envelope
 */
export type ImagingStudyUpdatedEvent = EventEnvelope<ImagingStudyUpdatedPayload>;

/**
 * Type guard to check if an event is an ImagingStudyUpdatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is an ImagingStudyUpdatedEvent
 */
export function isImagingStudyUpdatedEvent(
  event: EventEnvelope<unknown>
): event is ImagingStudyUpdatedEvent {
  return event.type === IMAGING_STUDY_UPDATED_EVENT;
}

/**
 * Factory function to create an ImagingStudyUpdatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createImagingStudyUpdatedEvent(
  payload: ImagingStudyUpdatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ImagingStudyUpdatedEvent {
  // Validate critical required fields
  if (!payload.studyId) {
    throw new Error('ImagingStudyUpdatedEvent: studyId is required');
  }
  if (!payload.patientId) {
    throw new Error('ImagingStudyUpdatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ImagingStudyUpdatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ImagingStudyUpdatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ImagingStudyUpdatedEvent: tenantId is required');
  }
  if (!payload.changes) {
    throw new Error('ImagingStudyUpdatedEvent: changes object is required');
  }
  if (Object.keys(payload.changes).length === 0) {
    throw new Error('ImagingStudyUpdatedEvent: changes object cannot be empty');
  }
  if (!payload.updatedBy) {
    throw new Error('ImagingStudyUpdatedEvent: updatedBy is required');
  }
  if (!payload.timestamp) {
    throw new Error('ImagingStudyUpdatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: IMAGING_STUDY_UPDATED_EVENT,
    version: IMAGING_STUDY_UPDATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 3. IMAGING REPORT CREATED EVENT
// ============================================================================

/**
 * Imaging report created event payload
 *
 * Published when a radiology report is generated or signed for an imaging study.
 * Consumed by patient timeline, clinical documentation, and notification systems.
 *
 * @example
 * ```typescript
 * const payload: ImagingReportCreatedPayload = {
 *   reportId: '123e4567-e89b-12d3-a456-426614174000',
 *   studyId: 'study-456',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   reportType: 'DIAGNOSTIC',
 *   generatedBy: 'provider-456',
 *   signedBy: 'provider-456',
 *   signedAt: '2025-11-20T15:30:00Z',
 *   findingsSummary: 'Normal dental anatomy with no pathology detected',
 *   status: 'SIGNED',
 *   timestamp: '2025-11-20T15:30:00Z',
 * };
 * ```
 */
export interface ImagingReportCreatedPayload {
  /** Unique report identifier */
  reportId: UUID;

  /** Associated imaging study ID */
  studyId: UUID;

  /** Patient the report is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID where report was generated */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Type of report */
  reportType: ReportType;

  /** Provider who generated the report */
  generatedBy: UUID;

  /** Report author name for display */
  generatedByName?: string;

  /** Provider who signed the report (may be different from author) */
  signedBy?: UUID;

  /** Signing provider name for display */
  signedByName?: string;

  /** Timestamp when report was signed */
  signedAt?: ISODateString;

  /** Brief summary of findings */
  findingsSummary: string;

  /** Detailed findings (may be markdown or HTML) */
  detailedFindings?: string;

  /** Clinical impressions or conclusions */
  impression?: string;

  /** Recommendations for follow-up or treatment */
  recommendations?: string;

  /** Whether report contains critical findings */
  hasCriticalFindings: boolean;

  /** Critical findings requiring immediate attention */
  criticalFindings?: string[];

  /** Report status */
  status: ReportStatus;

  /** Patient name for display purposes */
  patientName: string;

  /** Whether report has been communicated to patient */
  patientNotified: boolean;

  /** Whether report requires acknowledgment */
  requiresAcknowledgment: boolean;

  /** Associated procedure codes if applicable */
  procedureCodes?: string[];

  /** Billing codes for reporting services */
  billingCodes?: string[];

  /** Report template ID if generated from template */
  templateId?: UUID;

  /** Report version (for amendments) */
  version: number;

  /** Previous report version if amended */
  previousVersionId?: UUID;

  /** Amendment reason if applicable */
  amendmentReason?: string;

  /** Timestamp when report was created */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Imaging report created event envelope
 */
export type ImagingReportCreatedEvent = EventEnvelope<ImagingReportCreatedPayload>;

/**
 * Type guard to check if an event is an ImagingReportCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is an ImagingReportCreatedEvent
 */
export function isImagingReportCreatedEvent(
  event: EventEnvelope<unknown>
): event is ImagingReportCreatedEvent {
  return event.type === IMAGING_REPORT_CREATED_EVENT;
}

/**
 * Factory function to create an ImagingReportCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createImagingReportCreatedEvent(
  payload: ImagingReportCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ImagingReportCreatedEvent {
  // Validate critical required fields
  if (!payload.reportId) {
    throw new Error('ImagingReportCreatedEvent: reportId is required');
  }
  if (!payload.studyId) {
    throw new Error('ImagingReportCreatedEvent: studyId is required');
  }
  if (!payload.patientId) {
    throw new Error('ImagingReportCreatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ImagingReportCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ImagingReportCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ImagingReportCreatedEvent: tenantId is required');
  }
  if (!payload.reportType) {
    throw new Error('ImagingReportCreatedEvent: reportType is required');
  }
  if (!payload.generatedBy) {
    throw new Error('ImagingReportCreatedEvent: generatedBy is required');
  }
  if (!payload.findingsSummary || payload.findingsSummary.trim().length === 0) {
    throw new Error('ImagingReportCreatedEvent: findingsSummary is required and cannot be empty');
  }
  if (!payload.status) {
    throw new Error('ImagingReportCreatedEvent: status is required');
  }
  if (!payload.version || payload.version < 1) {
    throw new Error('ImagingReportCreatedEvent: version is required and must be >= 1');
  }
  if (!payload.timestamp) {
    throw new Error('ImagingReportCreatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: IMAGING_REPORT_CREATED_EVENT,
    version: IMAGING_REPORT_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}

// ============================================================================
// 4. IMAGING AI RESULT CREATED EVENT
// ============================================================================

/**
 * Imaging AI result created event payload
 *
 * Published when AI analysis completes for an imaging study.
 * Critical for clinical decision support, quality assurance, and automation.
 * Consumed by clinical systems, notification systems, and analytics.
 *
 * @example
 * ```typescript
 * const payload: ImagingAIResultCreatedPayload = {
 *   aiResultId: '123e4567-e89b-12d3-a456-426614174000',
 *   studyId: 'study-456',
 *   patientId: 'patient-123',
 *   organizationId: 'org-789',
 *   clinicId: 'clinic-101',
 *   tenantId: 'tenant-789',
 *   aiModelName: 'DentalAI-Caries-Detector-v2.1',
 *   aiModelVersion: '2.1.0',
 *   findingsCount: 3,
 *   criticalFindings: [
 *     {
 *       findingId: 'finding-1',
 *       findingType: 'CARIES',
 *       severity: 'HIGH',
 *       confidence: 0.92,
 *       toothNumbers: ['19'],
 *       description: 'Deep carious lesion detected on tooth 19',
 *       recommendation: 'Immediate evaluation and treatment recommended',
 *     },
 *   ],
 *   toothNumbers: ['19', '20', '21'],
 *   overallConfidence: 0.89,
 *   processingTime: 2.34,
 *   requiresReview: true,
 *   timestamp: '2025-11-20T14:40:00Z',
 * };
 * ```
 */
export interface ImagingAIResultCreatedPayload {
  /** Unique AI result identifier */
  aiResultId: UUID;

  /** Associated imaging study ID */
  studyId: UUID;

  /** Patient the AI result is for */
  patientId: UUID;

  /** Organization ID (tenant context) */
  organizationId: OrganizationId;

  /** Clinic ID */
  clinicId: ClinicId;

  /** Unified tenant identifier for data partitioning */
  tenantId: string;

  /** Name of the AI model used */
  aiModelName: string;

  /** Version of the AI model */
  aiModelVersion?: string;

  /** AI vendor or provider */
  aiVendor?: string;

  /** Total number of findings detected */
  findingsCount: number;

  /** Critical findings requiring attention */
  criticalFindings: CriticalFinding[];

  /** Number of critical findings (for quick filtering) */
  criticalFindingsCount?: number;

  /** Affected tooth numbers across all findings */
  toothNumbers?: (string | number)[];

  /** Overall confidence score for the analysis (0-1) */
  overallConfidence: number;

  /** Processing time in seconds */
  processingTime?: number;

  /** Whether AI results require provider review */
  requiresReview: boolean;

  /** Whether AI results have been reviewed by a provider */
  isReviewed: boolean;

  /** Provider who reviewed the AI results */
  reviewedBy?: UUID;

  /** Reviewer name for display */
  reviewedByName?: string;

  /** Timestamp when reviewed */
  reviewedAt?: ISODateString;

  /** Provider's agreement with AI findings */
  providerAgreement?: 'AGREE' | 'PARTIALLY_AGREE' | 'DISAGREE' | 'UNCERTAIN';

  /** Provider's notes on the AI results */
  reviewNotes?: string;

  /** Patient name for display purposes */
  patientName?: string;

  /** Whether results have been integrated into clinical notes */
  integratedToClinicalNote: boolean;

  /** Associated clinical note ID if integrated */
  clinicalNoteId?: UUID;

  /** Whether results triggered automated alerts */
  triggeredAlerts: boolean;

  /** Alert IDs if alerts were triggered */
  alertIds?: UUID[];

  /** AI analysis metadata (technical details) */
  analysisMetadata?: {
    /** Input image resolution */
    imageResolution?: string;
    /** Number of images analyzed */
    imageCount?: number;
    /** GPU/compute resources used */
    computeResources?: string;
    /** Analysis parameters */
    parameters?: Record<string, unknown>;
  };

  /** Timestamp when AI analysis was completed */
  timestamp: ISODateString;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Imaging AI result created event envelope
 */
export type ImagingAIResultCreatedEvent = EventEnvelope<ImagingAIResultCreatedPayload>;

/**
 * Type guard to check if an event is an ImagingAIResultCreatedEvent
 *
 * @param event - The event to check
 * @returns True if the event is an ImagingAIResultCreatedEvent
 */
export function isImagingAIResultCreatedEvent(
  event: EventEnvelope<unknown>
): event is ImagingAIResultCreatedEvent {
  return event.type === IMAGING_AI_RESULT_CREATED_EVENT;
}

/**
 * Factory function to create an ImagingAIResultCreatedEvent
 *
 * Validates required fields and generates a complete event envelope.
 *
 * @param payload - The event payload
 * @param metadata - Event metadata
 * @param tenantContext - Tenant context
 * @returns Complete event envelope
 * @throws {Error} If required fields are missing or invalid
 */
export function createImagingAIResultCreatedEvent(
  payload: ImagingAIResultCreatedPayload,
  metadata: EventEnvelope<unknown>['metadata'],
  tenantContext: EventEnvelope<unknown>['tenantContext']
): ImagingAIResultCreatedEvent {
  // Validate critical required fields
  if (!payload.aiResultId) {
    throw new Error('ImagingAIResultCreatedEvent: aiResultId is required');
  }
  if (!payload.studyId) {
    throw new Error('ImagingAIResultCreatedEvent: studyId is required');
  }
  if (!payload.patientId) {
    throw new Error('ImagingAIResultCreatedEvent: patientId is required');
  }
  if (!payload.organizationId) {
    throw new Error('ImagingAIResultCreatedEvent: organizationId is required');
  }
  if (!payload.clinicId) {
    throw new Error('ImagingAIResultCreatedEvent: clinicId is required');
  }
  if (!payload.tenantId) {
    throw new Error('ImagingAIResultCreatedEvent: tenantId is required');
  }
  if (!payload.aiModelName || payload.aiModelName.trim().length === 0) {
    throw new Error('ImagingAIResultCreatedEvent: aiModelName is required and cannot be empty');
  }
  if (payload.findingsCount === undefined || payload.findingsCount === null) {
    throw new Error('ImagingAIResultCreatedEvent: findingsCount is required');
  }
  if (payload.findingsCount < 0) {
    throw new Error('ImagingAIResultCreatedEvent: findingsCount cannot be negative');
  }
  if (!Array.isArray(payload.criticalFindings)) {
    throw new Error('ImagingAIResultCreatedEvent: criticalFindings must be an array');
  }
  if (payload.overallConfidence === undefined || payload.overallConfidence === null) {
    throw new Error('ImagingAIResultCreatedEvent: overallConfidence is required');
  }
  if (payload.overallConfidence < 0 || payload.overallConfidence > 1) {
    throw new Error('ImagingAIResultCreatedEvent: overallConfidence must be between 0 and 1');
  }
  if (!payload.timestamp) {
    throw new Error('ImagingAIResultCreatedEvent: timestamp is required');
  }

  return {
    id: crypto.randomUUID() as UUID,
    type: IMAGING_AI_RESULT_CREATED_EVENT,
    version: IMAGING_AI_RESULT_CREATED_VERSION,
    occurredAt: new Date(),
    payload,
    metadata,
    tenantContext,
  };
}
