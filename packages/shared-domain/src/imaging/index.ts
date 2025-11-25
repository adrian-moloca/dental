/**
 * Imaging & Diagnostics Module Exports
 *
 * Exports all domain types for dental imaging and diagnostics.
 *
 * @module shared-domain/imaging
 */

// ============================================================================
// Branded Types
// ============================================================================
export type {
  ImagingStudyId,
  ImagingFileId,
  ImagingReportId,
  ImagingAIResultId,
  AnnotationId,
} from './imaging.types';

// ============================================================================
// Enumerations
// ============================================================================
export {
  ImagingStudyStatus,
  ImagingModality,
  ImagingRegion,
  Quadrant,
  FileType,
  FindingSeverity,
  FindingType,
  AnnotationType,
  ReportType,
  ReportStatus,
  StudyPriority,
} from './imaging.types';

// ============================================================================
// Imaging Study Types
// ============================================================================
export type {
  RadiationExposure,
  ImageQualityMetrics,
  ClinicalIndication,
  PriorStudyReference,
  StudyOrder,
  ImagingStudy,
} from './imaging.types';

// ============================================================================
// Imaging File Types
// ============================================================================
export type {
  DicomMetadata,
  FileStorageMetadata,
  ImagingFile,
} from './imaging.types';

// ============================================================================
// AI Analysis Types
// ============================================================================
export type {
  BoundingBox,
  Polygon,
  Annotation,
  AIFinding,
  AIModelInfo,
  ImagingAIResult,
} from './imaging.types';

// ============================================================================
// Imaging Report Types
// ============================================================================
export type {
  ReportSection,
  ReportTemplate,
  ReportSignature,
  ReportAmendment,
  ImagingReport,
} from './imaging.types';
