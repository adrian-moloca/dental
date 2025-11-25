/**
 * Imaging & Diagnostics validation schemas
 * Comprehensive Zod validation for imaging studies, DICOM files, AI analysis,
 * and radiology reports
 * @module shared-validation/schemas/imaging
 */

import { z } from 'zod';
import {
  UUIDSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
} from '../common.schemas';

// ============================================================================
// IMAGING ENUMS (to be added to shared-types/enums.ts)
// ============================================================================

/**
 * Imaging modality types
 * Standard medical imaging modalities used in dental practice
 */
export enum ImagingModality {
  INTRAORAL_XRAY = 'INTRAORAL_XRAY', // Periapical, bitewing, occlusal
  PANORAMIC = 'PANORAMIC', // Panoramic X-ray
  CEPHALOMETRIC = 'CEPHALOMETRIC', // Lateral cephalogram
  CBCT = 'CBCT', // Cone Beam Computed Tomography
  CT = 'CT', // Computed Tomography
  MRI = 'MRI', // Magnetic Resonance Imaging
  ULTRASOUND = 'ULTRASOUND', // Ultrasound imaging
  PHOTO = 'PHOTO', // Intraoral/extraoral photography
  VIDEO = 'VIDEO', // Video recordings
  THREE_D_SCAN = 'THREE_D_SCAN', // 3D surface scans
}

/**
 * Anatomical regions for imaging
 */
export enum ImagingRegion {
  FULL_MOUTH = 'FULL_MOUTH', // Full mouth series
  MAXILLA = 'MAXILLA', // Upper jaw
  MANDIBLE = 'MANDIBLE', // Lower jaw
  ANTERIOR = 'ANTERIOR', // Front teeth region
  POSTERIOR = 'POSTERIOR', // Back teeth region
  TMJ_LEFT = 'TMJ_LEFT', // Left temporomandibular joint
  TMJ_RIGHT = 'TMJ_RIGHT', // Right temporomandibular joint
  TMJ_BILATERAL = 'TMJ_BILATERAL', // Both TMJs
  SINUS = 'SINUS', // Sinus region
  SPECIFIC_TOOTH = 'SPECIFIC_TOOTH', // Single tooth
  QUADRANT_1 = 'QUADRANT_1', // Upper right (teeth 1-8)
  QUADRANT_2 = 'QUADRANT_2', // Upper left (teeth 9-16)
  QUADRANT_3 = 'QUADRANT_3', // Lower left (teeth 17-24)
  QUADRANT_4 = 'QUADRANT_4', // Lower right (teeth 25-32)
}

/**
 * Imaging study status
 */
export enum ImagingStudyStatus {
  ORDERED = 'ORDERED', // Study ordered but not yet performed
  SCHEDULED = 'SCHEDULED', // Scheduled for imaging
  IN_PROGRESS = 'IN_PROGRESS', // Currently being performed
  COMPLETED = 'COMPLETED', // Imaging completed
  PRELIMINARY = 'PRELIMINARY', // Preliminary images available
  FINAL = 'FINAL', // Final images and report available
  AMENDED = 'AMENDED', // Report amended
  CANCELLED = 'CANCELLED', // Study cancelled
  ERROR = 'ERROR', // Technical error
}

/**
 * File type for imaging attachments
 */
export enum ImagingFileType {
  DICOM = 'DICOM', // DICOM format (.dcm)
  JPEG = 'JPEG', // JPEG image
  PNG = 'PNG', // PNG image
  TIFF = 'TIFF', // TIFF image
  PDF = 'PDF', // PDF document
  MP4 = 'MP4', // MP4 video
  AVI = 'AVI', // AVI video
  STL = 'STL', // STL 3D model
  OBJ = 'OBJ', // OBJ 3D model
  PLY = 'PLY', // PLY 3D model
}

/**
 * AI finding severity classification
 */
export enum FindingSeverity {
  NORMAL = 'NORMAL', // No abnormality detected
  MINIMAL = 'MINIMAL', // Minimal abnormality, monitoring
  MILD = 'MILD', // Mild abnormality, consider treatment
  MODERATE = 'MODERATE', // Moderate abnormality, treatment recommended
  SEVERE = 'SEVERE', // Severe abnormality, immediate treatment needed
  CRITICAL = 'CRITICAL', // Critical finding, urgent intervention
}

/**
 * AI finding types for dental imaging
 */
export enum FindingType {
  CARIES = 'CARIES', // Dental caries/decay
  PERIAPICAL_LESION = 'PERIAPICAL_LESION', // Periapical pathology
  BONE_LOSS = 'BONE_LOSS', // Alveolar bone loss
  CALCULUS = 'CALCULUS', // Dental calculus/tartar
  RESTORATION = 'RESTORATION', // Existing restoration
  DEFECTIVE_RESTORATION = 'DEFECTIVE_RESTORATION', // Failing restoration
  IMPACTED_TOOTH = 'IMPACTED_TOOTH', // Impacted tooth
  MISSING_TOOTH = 'MISSING_TOOTH', // Missing tooth
  SUPERNUMERARY_TOOTH = 'SUPERNUMERARY_TOOTH', // Extra tooth
  ROOT_CANAL = 'ROOT_CANAL', // Root canal treatment
  IMPLANT = 'IMPLANT', // Dental implant
  CROWN = 'CROWN', // Crown restoration
  BRIDGE = 'BRIDGE', // Bridge restoration
  FRACTURE = 'FRACTURE', // Tooth or root fracture
  RESORPTION = 'RESORPTION', // Root resorption
  CYST = 'CYST', // Cystic lesion
  TUMOR = 'TUMOR', // Neoplasm
  SINUS_PATHOLOGY = 'SINUS_PATHOLOGY', // Sinus disease
  TMJ_DISORDER = 'TMJ_DISORDER', // TMJ pathology
  FOREIGN_BODY = 'FOREIGN_BODY', // Foreign body
  ABNORMAL_ANATOMY = 'ABNORMAL_ANATOMY', // Anatomical variation
  OTHER = 'OTHER', // Other finding
}

/**
 * Report type for imaging reports
 */
export enum ReportType {
  PRELIMINARY = 'PRELIMINARY', // Initial reading
  FINAL = 'FINAL', // Final report
  ADDENDUM = 'ADDENDUM', // Additional information
  AMENDED = 'AMENDED', // Correction to previous report
  CONSULTATION = 'CONSULTATION', // Consultation report
  COMPARISON = 'COMPARISON', // Comparison with prior studies
}

/**
 * Report status
 */
export enum ReportStatus {
  DRAFT = 'DRAFT', // Report in progress
  PENDING_REVIEW = 'PENDING_REVIEW', // Awaiting review
  PRELIMINARY = 'PRELIMINARY', // Preliminary report issued
  FINAL = 'FINAL', // Final report signed
  AMENDED = 'AMENDED', // Report amended
  CORRECTED = 'CORRECTED', // Error corrected
  CANCELLED = 'CANCELLED', // Report cancelled
}

// ============================================================================
// ENUM VALIDATION SCHEMAS
// ============================================================================

export const ImagingModalitySchema = z.nativeEnum(ImagingModality, {
  errorMap: (): { message: string } => ({ message: 'Invalid imaging modality' }),
});

export type ImagingModalityType = z.infer<typeof ImagingModalitySchema>;

export const ImagingRegionSchema = z.nativeEnum(ImagingRegion, {
  errorMap: (): { message: string } => ({ message: 'Invalid imaging region' }),
});

export type ImagingRegionType = z.infer<typeof ImagingRegionSchema>;

export const ImagingStudyStatusSchema = z.nativeEnum(ImagingStudyStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid imaging study status' }),
});

export type ImagingStudyStatusType = z.infer<typeof ImagingStudyStatusSchema>;

export const ImagingFileTypeSchema = z.nativeEnum(ImagingFileType, {
  errorMap: (): { message: string } => ({ message: 'Invalid file type' }),
});

export type ImagingFileTypeType = z.infer<typeof ImagingFileTypeSchema>;

export const FindingSeveritySchema = z.nativeEnum(FindingSeverity, {
  errorMap: (): { message: string } => ({ message: 'Invalid finding severity' }),
});

export type FindingSeverityType = z.infer<typeof FindingSeveritySchema>;

export const FindingTypeSchema = z.nativeEnum(FindingType, {
  errorMap: (): { message: string } => ({ message: 'Invalid finding type' }),
});

export type FindingTypeType = z.infer<typeof FindingTypeSchema>;

export const ReportTypeSchema = z.nativeEnum(ReportType, {
  errorMap: (): { message: string } => ({ message: 'Invalid report type' }),
});

export type ReportTypeType = z.infer<typeof ReportTypeSchema>;

export const ReportStatusSchema = z.nativeEnum(ReportStatus, {
  errorMap: (): { message: string } => ({ message: 'Invalid report status' }),
});

export type ReportStatusType = z.infer<typeof ReportStatusSchema>;

// ============================================================================
// TOOTH NUMBER VALIDATION
// ============================================================================

/**
 * Tooth number schema (Universal Numbering System: 1-32)
 * Validates tooth numbers for adult permanent dentition
 */
export const ToothNumberSchema = z
  .number()
  .int({ message: 'Tooth number must be an integer' })
  .min(1, 'Tooth number must be between 1 and 32')
  .max(32, 'Tooth number must be between 1 and 32');

export type ToothNumber = z.infer<typeof ToothNumberSchema>;

/**
 * Array of tooth numbers with validation
 */
export const ToothNumbersArraySchema = z
  .array(ToothNumberSchema)
  .min(0, 'Tooth numbers array cannot be negative length')
  .max(32, 'Cannot have more than 32 tooth numbers')
  .refine(
    (teeth) => {
      const uniqueTeeth = new Set(teeth);
      return uniqueTeeth.size === teeth.length;
    },
    { message: 'Tooth numbers must be unique' },
  );

export type ToothNumbersArray = z.infer<typeof ToothNumbersArraySchema>;

/**
 * Tooth surface enum
 */
export enum ToothSurface {
  OCCLUSAL = 'OCCLUSAL', // Biting surface (O)
  MESIAL = 'MESIAL', // Front surface (M)
  DISTAL = 'DISTAL', // Back surface (D)
  BUCCAL = 'BUCCAL', // Cheek-side surface (B)
  LINGUAL = 'LINGUAL', // Tongue-side surface (L)
  FACIAL = 'FACIAL', // Front-facing surface (F)
  INCISAL = 'INCISAL', // Cutting edge (I)
}

export const ToothSurfaceSchema = z.nativeEnum(ToothSurface, {
  errorMap: (): { message: string } => ({ message: 'Invalid tooth surface' }),
});

export type ToothSurfaceType = z.infer<typeof ToothSurfaceSchema>;

// ============================================================================
// IMAGING STUDY SCHEMAS
// ============================================================================

/**
 * Base object schema for imaging study (without refinements)
 */
const BaseImagingStudySchema = z.object({
  patientId: UUIDSchema.describe('Patient UUID'),
  modality: ImagingModalitySchema.describe('Imaging modality'),
  region: ImagingRegionSchema.describe('Anatomical region'),
  toothNumbers: ToothNumbersArraySchema
    .optional()
    .describe('Specific teeth involved (for tooth-specific imaging)'),
  studyDate: ISODateStringSchema.describe('Date and time of study'),
  description: NonEmptyStringSchema.max(500, 'Description must be 500 characters or less').describe(
    'Study description',
  ),
  clinicalNotes: z
    .string()
    .max(2000, 'Clinical notes must be 2000 characters or less')
    .optional()
    .describe('Clinical notes and indications'),
  referringProviderId: UUIDSchema.describe('Referring provider UUID'),
  appointmentId: UUIDSchema.optional().describe('Associated appointment UUID'),
  procedureId: UUIDSchema.optional().describe('Associated procedure UUID'),
  urgency: z
    .enum(['ROUTINE', 'URGENT', 'STAT'], {
      errorMap: (): { message: string } => ({ message: 'Invalid urgency level' }),
    })
    .default('ROUTINE')
    .describe('Study urgency'),
  status: ImagingStudyStatusSchema.default(ImagingStudyStatus.ORDERED).describe('Initial study status'),
});

/**
 * Create Imaging Study DTO Schema
 * For creating new imaging studies
 */
export const CreateImagingStudyDtoSchema = BaseImagingStudySchema.refine(
  (data) => {
    // If region is SPECIFIC_TOOTH, toothNumbers must be provided
    if (data.region === ImagingRegion.SPECIFIC_TOOTH) {
      return data.toothNumbers && data.toothNumbers.length > 0;
    }
    return true;
  },
  {
    message: 'Tooth numbers are required when region is SPECIFIC_TOOTH',
    path: ['toothNumbers'],
  },
).refine(
  (data) => {
    // Validate studyDate is not in the future
    const studyDate = new Date(data.studyDate);
    const now = new Date();
    return studyDate <= now;
  },
  {
    message: 'Study date cannot be in the future',
    path: ['studyDate'],
  },
);

export type CreateImagingStudyDto = z.infer<typeof CreateImagingStudyDtoSchema>;

/**
 * Update Imaging Study DTO Schema
 * For partial updates to existing studies
 */
export const UpdateImagingStudyDtoSchema = BaseImagingStudySchema.omit({ patientId: true })
  .partial()
  .extend({
    status: ImagingStudyStatusSchema.optional(),
    completedAt: ISODateStringSchema.optional().describe('Completion timestamp'),
  })
  .refine(
    (data) => {
      // If status is COMPLETED or FINAL, completedAt should be provided
      if (
        data.status === ImagingStudyStatus.COMPLETED ||
        data.status === ImagingStudyStatus.FINAL
      ) {
        return data.completedAt !== undefined;
      }
      return true;
    },
    {
      message: 'completedAt is required when status is COMPLETED or FINAL',
      path: ['completedAt'],
    },
  );

export type UpdateImagingStudyDto = z.infer<typeof UpdateImagingStudyDtoSchema>;

/**
 * Query Imaging Studies DTO Schema
 * For filtering and searching imaging studies
 */
export const QueryImagingStudiesDtoSchema = z
  .object({
    patientId: UUIDSchema.optional().describe('Filter by patient UUID'),
    modality: ImagingModalitySchema.optional().describe('Filter by modality'),
    region: ImagingRegionSchema.optional().describe('Filter by anatomical region'),
    status: ImagingStudyStatusSchema.optional().describe('Filter by status'),
    referringProviderId: UUIDSchema.optional().describe('Filter by referring provider'),
    fromDate: ISODateStringSchema.optional().describe('Start date for date range filter'),
    toDate: ISODateStringSchema.optional().describe('End date for date range filter'),
    page: PositiveIntSchema.default(1).describe('Page number for pagination'),
    limit: PositiveIntSchema.min(1)
      .max(100, 'Limit cannot exceed 100')
      .default(20)
      .describe('Items per page'),
    sortBy: z
      .enum(['studyDate', 'createdAt', 'modality', 'status'], {
        errorMap: (): { message: string } => ({ message: 'Invalid sort field' }),
      })
      .default('studyDate')
      .describe('Sort field'),
    sortOrder: z
      .enum(['asc', 'desc'], {
        errorMap: (): { message: string } => ({ message: 'Sort order must be asc or desc' }),
      })
      .default('desc')
      .describe('Sort order'),
  })
  .refine(
    (data) => {
      // Validate date range: fromDate must be before toDate
      if (data.fromDate && data.toDate) {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);
        return from <= to;
      }
      return true;
    },
    {
      message: 'fromDate must be before or equal to toDate',
      path: ['fromDate'],
    },
  );

export type QueryImagingStudiesDto = z.infer<typeof QueryImagingStudiesDtoSchema>;

// ============================================================================
// IMAGING FILE SCHEMAS
// ============================================================================

/**
 * DICOM metadata schema
 * Subset of DICOM tags commonly used
 */
export const DicomMetadataSchema = z.object({
  studyInstanceUID: NonEmptyStringSchema.optional().describe('DICOM Study Instance UID'),
  seriesInstanceUID: NonEmptyStringSchema.optional().describe('DICOM Series Instance UID'),
  sopInstanceUID: NonEmptyStringSchema.optional().describe('DICOM SOP Instance UID'),
  patientName: NonEmptyStringSchema.optional().describe('Patient name from DICOM'),
  patientID: NonEmptyStringSchema.optional().describe('Patient ID from DICOM'),
  studyDescription: z.string().optional().describe('Study description'),
  seriesDescription: z.string().optional().describe('Series description'),
  modality: NonEmptyStringSchema.optional().describe('DICOM modality'),
  manufacturer: z.string().optional().describe('Equipment manufacturer'),
  manufacturerModelName: z.string().optional().describe('Equipment model'),
  kvp: z.number().positive().optional().describe('Peak kilovoltage'),
  exposureTime: z.number().positive().optional().describe('Exposure time in ms'),
  xrayTubeCurrent: z.number().positive().optional().describe('X-ray tube current in mA'),
  imageRows: PositiveIntSchema.optional().describe('Image height in pixels'),
  imageColumns: PositiveIntSchema.optional().describe('Image width in pixels'),
  pixelSpacing: z.tuple([z.number(), z.number()]).optional().describe('Pixel spacing [row, column] in mm'),
  sliceThickness: z.number().positive().optional().describe('Slice thickness in mm'),
  acquisitionDate: ISODateStringSchema.optional().describe('Acquisition date'),
});

export type DicomMetadata = z.infer<typeof DicomMetadataSchema>;

/**
 * Imaging file schema for attaching files to a study
 */
export const ImagingFileSchema = z.object({
  storageKey: NonEmptyStringSchema.max(500, 'Storage key must be 500 characters or less').describe(
    'S3/storage key for file',
  ),
  fileName: NonEmptyStringSchema.max(255, 'File name must be 255 characters or less').describe(
    'Original file name',
  ),
  mimeType: NonEmptyStringSchema.max(100, 'MIME type must be 100 characters or less').describe(
    'File MIME type',
  ),
  fileSize: PositiveIntSchema.max(
    5 * 1024 * 1024 * 1024,
    'File size cannot exceed 5GB',
  ).describe('File size in bytes'),
  fileType: ImagingFileTypeSchema.describe('File type classification'),
  dicomMetadata: DicomMetadataSchema.optional().describe('DICOM metadata if applicable'),
  thumbnailStorageKey: z
    .string()
    .max(500, 'Thumbnail storage key must be 500 characters or less')
    .optional()
    .describe('Storage key for thumbnail image'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .describe('File description'),
});

export type ImagingFile = z.infer<typeof ImagingFileSchema>;

/**
 * Attach Files to Study DTO Schema
 */
export const AttachFilesToStudyDtoSchema = z.object({
  studyId: UUIDSchema.describe('Imaging study UUID'),
  files: z
    .array(ImagingFileSchema)
    .min(1, 'At least one file is required')
    .max(100, 'Cannot attach more than 100 files at once')
    .describe('Array of files to attach'),
});

export type AttachFilesToStudyDto = z.infer<typeof AttachFilesToStudyDtoSchema>;

// ============================================================================
// AI ANALYSIS RESULT SCHEMAS
// ============================================================================

/**
 * Bounding box for AI findings
 * Normalized coordinates (0-1 range)
 */
export const BoundingBoxSchema = z
  .object({
    x: z
      .number()
      .min(0, 'x must be between 0 and 1')
      .max(1, 'x must be between 0 and 1')
      .describe('Normalized x coordinate (left)'),
    y: z
      .number()
      .min(0, 'y must be between 0 and 1')
      .max(1, 'y must be between 0 and 1')
      .describe('Normalized y coordinate (top)'),
    width: z
      .number()
      .min(0, 'width must be between 0 and 1')
      .max(1, 'width must be between 0 and 1')
      .describe('Normalized width'),
    height: z
      .number()
      .min(0, 'height must be between 0 and 1')
      .max(1, 'height must be between 0 and 1')
      .describe('Normalized height'),
  })
  .refine(
    (box) => box.x + box.width <= 1,
    {
      message: 'Bounding box extends beyond image width (x + width > 1)',
      path: ['width'],
    },
  )
  .refine(
    (box) => box.y + box.height <= 1,
    {
      message: 'Bounding box extends beyond image height (y + height > 1)',
      path: ['height'],
    },
  );

export type BoundingBox = z.infer<typeof BoundingBoxSchema>;

/**
 * AI Finding schema
 * Represents a single finding from AI analysis
 */
export const AIFindingSchema = z.object({
  findingCode: NonEmptyStringSchema.max(50, 'Finding code must be 50 characters or less').describe(
    'Standardized finding code',
  ),
  findingType: FindingTypeSchema.describe('Type of finding'),
  name: NonEmptyStringSchema.max(200, 'Finding name must be 200 characters or less').describe(
    'Human-readable finding name',
  ),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .describe('Detailed finding description'),
  severity: FindingSeveritySchema.describe('Clinical severity classification'),
  confidence: z
    .number()
    .min(0, 'Confidence must be between 0 and 1')
    .max(1, 'Confidence must be between 0 and 1')
    .describe('AI confidence score (0-1)'),
  toothNumbers: ToothNumbersArraySchema.optional().describe('Affected tooth numbers'),
  surfaces: z
    .array(ToothSurfaceSchema)
    .optional()
    .describe('Affected tooth surfaces'),
  boundingBox: BoundingBoxSchema.optional().describe('Location bounding box'),
  annotations: z
    .array(
      z.object({
        type: z
          .enum(['POINT', 'LINE', 'POLYGON', 'CIRCLE'], {
            errorMap: (): { message: string } => ({ message: 'Invalid annotation type' }),
          })
          .describe('Annotation shape type'),
        coordinates: z
          .array(z.number())
          .min(2, 'Coordinates must have at least 2 values')
          .describe('Normalized coordinates array'),
        label: z.string().optional().describe('Annotation label'),
      }),
    )
    .optional()
    .describe('Additional annotations'),
  recommendations: z
    .array(NonEmptyStringSchema)
    .optional()
    .describe('Clinical recommendations'),
});

export type AIFinding = z.infer<typeof AIFindingSchema>;

/**
 * Attach AI Result DTO Schema
 * For attaching AI analysis results to an imaging study
 */
export const AttachAIResultDtoSchema = z.object({
  studyId: UUIDSchema.describe('Imaging study UUID'),
  fileId: UUIDSchema.optional().describe('Specific file UUID if analysis is for one file'),
  aiModelName: NonEmptyStringSchema.max(100, 'Model name must be 100 characters or less').describe(
    'AI model name',
  ),
  aiModelVersion: NonEmptyStringSchema.max(50, 'Model version must be 50 characters or less').describe(
    'AI model version',
  ),
  findings: z
    .array(AIFindingSchema)
    .min(0, 'Findings array must be provided (can be empty for normal studies)')
    .max(100, 'Cannot have more than 100 findings')
    .describe('Array of AI findings'),
  overallConfidence: z
    .number()
    .min(0, 'Overall confidence must be between 0 and 1')
    .max(1, 'Overall confidence must be between 0 and 1')
    .optional()
    .describe('Overall analysis confidence'),
  processingTime: NonNegativeIntSchema.optional().describe('Processing time in milliseconds'),
  metadata: z.record(z.unknown()).optional().describe('Additional AI model metadata'),
});

export type AttachAIResultDto = z.infer<typeof AttachAIResultDtoSchema>;

// ============================================================================
// IMAGING REPORT SCHEMAS
// ============================================================================

/**
 * Base Imaging Report Schema (without refinements)
 */
const BaseImagingReportSchema = z.object({
  studyId: UUIDSchema.describe('Imaging study UUID'),
  reportType: ReportTypeSchema.describe('Type of report'),
  findings: NonEmptyStringSchema.max(5000, 'Findings must be 5000 characters or less').describe(
    'Detailed findings description',
  ),
  impression: NonEmptyStringSchema.max(2000, 'Impression must be 2000 characters or less').describe(
    'Clinical impression/conclusion',
  ),
  recommendations: z
    .string()
    .max(2000, 'Recommendations must be 2000 characters or less')
    .optional()
    .describe('Clinical recommendations'),
  technique: z
    .string()
    .max(1000, 'Technique must be 1000 characters or less')
    .optional()
    .describe('Imaging technique description'),
  comparison: z
    .string()
    .max(1000, 'Comparison must be 1000 characters or less')
    .optional()
    .describe('Comparison with prior studies'),
  clinicalHistory: z
    .string()
    .max(1000, 'Clinical history must be 1000 characters or less')
    .optional()
    .describe('Relevant clinical history'),
  signedById: UUIDSchema.optional().describe('Provider UUID who signed the report'),
  signedAt: ISODateStringSchema.optional().describe('Report signature timestamp'),
  status: ReportStatusSchema.default(ReportStatus.DRAFT).describe('Report status'),
  criticalFindings: z
    .array(NonEmptyStringSchema)
    .optional()
    .describe('Critical findings requiring immediate attention'),
  metadata: z.record(z.unknown()).optional().describe('Additional report metadata'),
});

/**
 * Create Imaging Report DTO Schema
 */
export const CreateImagingReportDtoSchema = BaseImagingReportSchema;

export type CreateImagingReportDto = z.infer<typeof CreateImagingReportDtoSchema>;

/**
 * Update Imaging Report DTO Schema
 */
export const UpdateImagingReportDtoSchema = BaseImagingReportSchema.omit({ studyId: true })
  .partial()
  .extend({
    status: ReportStatusSchema.optional(),
    amendmentReason: z
      .string()
      .max(500, 'Amendment reason must be 500 characters or less')
      .optional()
      .describe('Reason for amendment'),
  })
  .refine(
    (data) => {
      // If status is FINAL, signedById and signedAt must be provided
      if (data.status === ReportStatus.FINAL) {
        return data.signedById !== undefined && data.signedAt !== undefined;
      }
      return true;
    },
    {
      message: 'signedById and signedAt are required when status is FINAL',
      path: ['status'],
    },
  )
  .refine(
    (data) => {
      // If status is AMENDED, amendmentReason should be provided
      if (data.status === ReportStatus.AMENDED) {
        return data.amendmentReason !== undefined && data.amendmentReason.length > 0;
      }
      return true;
    },
    {
      message: 'amendmentReason is required when status is AMENDED',
      path: ['amendmentReason'],
    },
  );

export type UpdateImagingReportDto = z.infer<typeof UpdateImagingReportDtoSchema>;

/**
 * Query Imaging Reports DTO Schema
 */
export const QueryImagingReportsDtoSchema = z
  .object({
    studyId: UUIDSchema.optional().describe('Filter by study UUID'),
    patientId: UUIDSchema.optional().describe('Filter by patient UUID'),
    reportType: ReportTypeSchema.optional().describe('Filter by report type'),
    status: ReportStatusSchema.optional().describe('Filter by status'),
    signedById: UUIDSchema.optional().describe('Filter by signing provider'),
    fromDate: ISODateStringSchema.optional().describe('Start date for date range filter'),
    toDate: ISODateStringSchema.optional().describe('End date for date range filter'),
    hasCriticalFindings: z.boolean().optional().describe('Filter by presence of critical findings'),
    page: PositiveIntSchema.default(1).describe('Page number for pagination'),
    limit: PositiveIntSchema.min(1)
      .max(100, 'Limit cannot exceed 100')
      .default(20)
      .describe('Items per page'),
    sortBy: z
      .enum(['signedAt', 'createdAt', 'reportType', 'status'], {
        errorMap: (): { message: string } => ({ message: 'Invalid sort field' }),
      })
      .default('signedAt')
      .describe('Sort field'),
    sortOrder: z
      .enum(['asc', 'desc'], {
        errorMap: (): { message: string } => ({ message: 'Sort order must be asc or desc' }),
      })
      .default('desc')
      .describe('Sort order'),
  })
  .refine(
    (data) => {
      // Validate date range: fromDate must be before toDate
      if (data.fromDate && data.toDate) {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);
        return from <= to;
      }
      return true;
    },
    {
      message: 'fromDate must be before or equal to toDate',
      path: ['fromDate'],
    },
  );

export type QueryImagingReportsDto = z.infer<typeof QueryImagingReportsDtoSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Imaging Study Response Schema
 */
export const ImagingStudyResponseSchema = z.object({
  id: UUIDSchema,
  patientId: UUIDSchema,
  modality: ImagingModalitySchema,
  region: ImagingRegionSchema,
  toothNumbers: ToothNumbersArraySchema.optional(),
  studyDate: ISODateStringSchema,
  description: NonEmptyStringSchema,
  clinicalNotes: z.string().optional(),
  referringProviderId: UUIDSchema,
  appointmentId: UUIDSchema.optional(),
  procedureId: UUIDSchema.optional(),
  urgency: z.enum(['ROUTINE', 'URGENT', 'STAT']),
  status: ImagingStudyStatusSchema,
  completedAt: ISODateStringSchema.optional(),
  fileCount: NonNegativeIntSchema.default(0),
  hasAIAnalysis: z.boolean().default(false),
  hasReport: z.boolean().default(false),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  createdBy: UUIDSchema,
  updatedBy: UUIDSchema,
});

export type ImagingStudyResponse = z.infer<typeof ImagingStudyResponseSchema>;

/**
 * Imaging Report Response Schema
 */
export const ImagingReportResponseSchema = z.object({
  id: UUIDSchema,
  studyId: UUIDSchema,
  reportType: ReportTypeSchema,
  findings: NonEmptyStringSchema,
  impression: NonEmptyStringSchema,
  recommendations: z.string().optional(),
  technique: z.string().optional(),
  comparison: z.string().optional(),
  clinicalHistory: z.string().optional(),
  signedById: UUIDSchema.optional(),
  signedAt: ISODateStringSchema.optional(),
  status: ReportStatusSchema,
  criticalFindings: z.array(NonEmptyStringSchema).optional(),
  amendmentReason: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: ISODateStringSchema,
  updatedAt: ISODateStringSchema,
  createdBy: UUIDSchema,
  updatedBy: UUIDSchema,
});

export type ImagingReportResponse = z.infer<typeof ImagingReportResponseSchema>;
