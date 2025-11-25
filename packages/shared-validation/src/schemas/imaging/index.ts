/**
 * Imaging & Diagnostics validation schemas - Barrel exports
 * @module shared-validation/schemas/imaging
 */

// Re-export imaging-specific schemas (avoid conflicts with clinical module for ToothNumber, ToothSurface)
export {
  // Enums
  ImagingModality,
  ImagingRegion,
  ImagingStudyStatus,
  FindingType,
  FindingSeverity,
  ReportType,
  ReportStatus,

  // Schemas
  ImagingModalitySchema,
  ImagingRegionSchema,
  ImagingStudyStatusSchema,
  ToothNumbersArraySchema,
  CreateImagingStudyDtoSchema,
  UpdateImagingStudyDtoSchema,
  QueryImagingStudiesDtoSchema,
  DicomMetadataSchema,
  ImagingFileSchema,
  AttachFilesToStudyDtoSchema,
  BoundingBoxSchema,
  FindingTypeSchema,
  FindingSeveritySchema,
  AIFindingSchema,
  AttachAIResultDtoSchema,
  ReportTypeSchema,
  ReportStatusSchema,
  CreateImagingReportDtoSchema,
  UpdateImagingReportDtoSchema,
  QueryImagingReportsDtoSchema,

  // Types
  ImagingModalityType,
  ImagingRegionType,
  ImagingStudyStatusType,
  ToothNumbersArray,
  CreateImagingStudyDto,
  UpdateImagingStudyDto,
  QueryImagingStudiesDto,
  DicomMetadata,
  ImagingFile,
  AttachFilesToStudyDto,
  BoundingBox,
  FindingTypeType,
  FindingSeverityType,
  AIFinding,
  AttachAIResultDto,
  ReportTypeType,
  ReportStatusType,
  CreateImagingReportDto,
  UpdateImagingReportDto,
  QueryImagingReportsDto,
} from './imaging.schemas';
