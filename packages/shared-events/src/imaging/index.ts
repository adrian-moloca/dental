/**
 * Imaging Events Module
 *
 * Exports all imaging-related event contracts, types, and utilities.
 *
 * @module shared-events/imaging
 */

// Event constants
export {
  IMAGING_STUDY_CREATED_EVENT,
  IMAGING_STUDY_UPDATED_EVENT,
  IMAGING_REPORT_CREATED_EVENT,
  IMAGING_AI_RESULT_CREATED_EVENT,
} from './imaging.events';

// Event version constants
export {
  IMAGING_STUDY_CREATED_VERSION,
  IMAGING_STUDY_UPDATED_VERSION,
  IMAGING_REPORT_CREATED_VERSION,
  IMAGING_AI_RESULT_CREATED_VERSION,
} from './imaging.events';

// Type guards
export {
  isImagingStudyCreatedEvent,
  isImagingStudyUpdatedEvent,
  isImagingReportCreatedEvent,
  isImagingAIResultCreatedEvent,
} from './imaging.events';

// Factory functions
export {
  createImagingStudyCreatedEvent,
  createImagingStudyUpdatedEvent,
  createImagingReportCreatedEvent,
  createImagingAIResultCreatedEvent,
} from './imaging.events';

// Type exports
export type {
  ImagingModality,
  ImagingRegion,
  ImagingStudyStatus,
  ReportStatus,
  ReportType,
  AIFindingSeverity,
  CriticalFinding,
  StudyChange,
  ImagingStudyCreatedPayload,
  ImagingStudyCreatedEvent,
  ImagingStudyUpdatedPayload,
  ImagingStudyUpdatedEvent,
  ImagingReportCreatedPayload,
  ImagingReportCreatedEvent,
  ImagingAIResultCreatedPayload,
  ImagingAIResultCreatedEvent,
} from './imaging.events';
