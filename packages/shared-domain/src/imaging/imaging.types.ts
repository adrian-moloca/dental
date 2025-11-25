/**
 * Imaging & Diagnostics Domain Types
 *
 * Complete domain types for dental imaging and diagnostic imaging workflows.
 * Defines imaging studies, DICOM metadata, AI analysis results, imaging reports,
 * and annotations for dental practice management system.
 *
 * @module shared-domain/imaging
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Metadata,
  Nullable,
} from '@dentalos/shared-types';
import type {
  PatientId,
  ProviderId,
  ProcedureId,
  ToothNumber,
  ToothSurface,
} from '../clinical';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for an imaging study
 */
export type ImagingStudyId = UUID & { readonly __brand: 'ImagingStudyId' };

/**
 * Unique identifier for an imaging file
 */
export type ImagingFileId = UUID & { readonly __brand: 'ImagingFileId' };

/**
 * Unique identifier for an imaging report
 */
export type ImagingReportId = UUID & { readonly __brand: 'ImagingReportId' };

/**
 * Unique identifier for an AI analysis result
 */
export type ImagingAIResultId = UUID & { readonly __brand: 'ImagingAIResultId' };

/**
 * Unique identifier for an annotation
 */
export type AnnotationId = UUID & { readonly __brand: 'AnnotationId' };

// ============================================================================
// IMAGING STUDY TYPES
// ============================================================================

/**
 * Imaging study status enumeration
 *
 * Lifecycle status of an imaging study in dental practice workflow.
 *
 * Workflow progression:
 * PENDING → IN_PROGRESS → COMPLETED → REPORTED → ARCHIVED
 *
 * Edge cases:
 * - PENDING: Study ordered but images not yet acquired
 * - IN_PROGRESS: Images being captured/uploaded
 * - COMPLETED: All images captured, awaiting interpretation
 * - REPORTED: Report finalized by provider
 * - ARCHIVED: Study archived for long-term storage
 * - CANCELLED: Study cancelled before completion
 * - ERROR: Technical error during acquisition/processing
 */
export enum ImagingStudyStatus {
  /** Study ordered, awaiting image acquisition */
  PENDING = 'pending',
  /** Images being captured or uploaded */
  IN_PROGRESS = 'in_progress',
  /** All images captured, awaiting interpretation */
  COMPLETED = 'completed',
  /** Report finalized and signed */
  REPORTED = 'reported',
  /** Study archived for long-term storage */
  ARCHIVED = 'archived',
  /** Study cancelled before completion */
  CANCELLED = 'cancelled',
  /** Technical error occurred */
  ERROR = 'error',
}

/**
 * Imaging modality enumeration
 *
 * Types of dental imaging modalities used in practice.
 *
 * Standard dental imaging modalities:
 * - X_RAY: Generic dental radiograph
 * - CBCT: Cone Beam Computed Tomography (3D imaging)
 * - PANORAMIC: Panoramic radiograph (full mouth view)
 * - INTRAORAL_PHOTO: Intraoral camera photograph
 * - CEPHALOMETRIC: Lateral skull radiograph (orthodontics)
 * - BITEWING: Bitewing radiograph (interproximal caries detection)
 * - PERIAPICAL: Periapical radiograph (root and bone)
 * - OCCLUSAL: Occlusal radiograph (palate/floor of mouth)
 * - TMJ: Temporomandibular joint imaging
 * - SINUS: Sinus radiograph
 *
 * Edge cases:
 * - CBCT generates large datasets (hundreds of slices)
 * - Intraoral photos have different radiation safety requirements (none)
 * - Cephalometric requires specific patient positioning
 * - FMX (Full Mouth X-ray) series consists of multiple periapical + bitewings
 */
export enum ImagingModality {
  /** Generic dental X-ray */
  X_RAY = 'xray',
  /** Cone Beam CT (3D imaging) */
  CBCT = 'cbct',
  /** Panoramic radiograph */
  PANORAMIC = 'panoramic',
  /** Intraoral camera photo */
  INTRAORAL_PHOTO = 'intraoral_photo',
  /** Cephalometric radiograph (orthodontics) */
  CEPHALOMETRIC = 'cephalometric',
  /** Bitewing radiograph */
  BITEWING = 'bitewing',
  /** Periapical radiograph */
  PERIAPICAL = 'periapical',
  /** Occlusal radiograph */
  OCCLUSAL = 'occlusal',
  /** Temporomandibular joint imaging */
  TMJ = 'tmj',
  /** Sinus radiograph */
  SINUS = 'sinus',
  /** Extraoral photo (facial/profile) */
  EXTRAORAL_PHOTO = 'extraoral_photo',
  /** Scan (intraoral scanner for impressions) */
  INTRAORAL_SCAN = 'intraoral_scan',
  /** Other/legacy modality */
  OTHER = 'other',
}

/**
 * Imaging region enumeration
 *
 * Anatomical region being imaged.
 *
 * Edge cases:
 * - TOOTH: Single tooth (specify tooth number)
 * - QUADRANT: One quadrant (UR, UL, LR, LL)
 * - FULL_ARCH: Upper or lower arch
 * - FULL_MOUTH: Complete dentition (FMX series)
 * - TMJ: Temporomandibular joint
 * - SINUS: Maxillary sinuses
 * - MAXILLA: Upper jaw
 * - MANDIBLE: Lower jaw
 */
export enum ImagingRegion {
  /** Single tooth */
  TOOTH = 'tooth',
  /** One quadrant (UR, UL, LR, LL) */
  QUADRANT = 'quadrant',
  /** Full upper or lower arch */
  FULL_ARCH = 'full_arch',
  /** Complete dentition (all teeth) */
  FULL_MOUTH = 'full_mouth',
  /** Temporomandibular joint */
  TMJ = 'tmj',
  /** Maxillary sinuses */
  SINUS = 'sinus',
  /** Upper jaw (maxilla) */
  MAXILLA = 'maxilla',
  /** Lower jaw (mandible) */
  MANDIBLE = 'mandible',
  /** Anterior teeth region */
  ANTERIOR = 'anterior',
  /** Posterior teeth region */
  POSTERIOR = 'posterior',
  /** Other/unspecified region */
  OTHER = 'other',
}

/**
 * Quadrant specification
 *
 * Dental quadrant nomenclature (standard)
 */
export enum Quadrant {
  /** Upper right quadrant (teeth 1-8) */
  UPPER_RIGHT = 'upper_right',
  /** Upper left quadrant (teeth 9-16) */
  UPPER_LEFT = 'upper_left',
  /** Lower left quadrant (teeth 17-24) */
  LOWER_LEFT = 'lower_left',
  /** Lower right quadrant (teeth 25-32) */
  LOWER_RIGHT = 'lower_right',
}

/**
 * Radiation exposure record
 *
 * Documents radiation exposure for safety compliance and ALARA principles.
 *
 * Edge cases:
 * - Intraoral photos have zero radiation exposure
 * - CBCT has higher exposure than traditional radiographs
 * - Cumulative exposure tracking required for patient safety
 * - Pregnancy status affects imaging decisions
 */
export interface RadiationExposure {
  /** Exposure dose in millisieverts (mSv) */
  doseMsv: number;
  /** Exposure area (small, medium, large) */
  exposureArea: 'small' | 'medium' | 'large';
  /** Peak kilovoltage (kVp) used */
  kVp?: number;
  /** Milliamperage (mA) used */
  mA?: number;
  /** Exposure time in seconds */
  exposureTimeSeconds?: number;
  /** Distance from source in centimeters */
  sourceDistanceCm?: number;
  /** Collimation used (rectangular, round) */
  collimation?: 'rectangular' | 'round' | 'none';
  /** Lead apron used */
  leadApronUsed: boolean;
  /** Thyroid collar used */
  thyroidCollarUsed: boolean;
  /** Operator notes */
  notes?: string;
}

/**
 * Image quality metrics
 *
 * Assesses technical quality of acquired images.
 *
 * Edge cases:
 * - Poor quality images may require retakes (additional radiation exposure)
 * - Quality assessment drives retake decisions
 * - AI can assist with automatic quality scoring
 */
export interface ImageQualityMetrics {
  /** Overall quality score (0-100) */
  qualityScore?: number;
  /** Contrast adequacy (poor, adequate, good, excellent) */
  contrast: 'poor' | 'adequate' | 'good' | 'excellent';
  /** Sharpness/definition (poor, adequate, good, excellent) */
  sharpness: 'poor' | 'adequate' | 'good' | 'excellent';
  /** Proper positioning (true/false) */
  properPositioning: boolean;
  /** Artifacts present (true/false) */
  artifactsPresent: boolean;
  /** Artifact description if present */
  artifactDescription?: string;
  /** Diagnostic quality (diagnostic vs non-diagnostic) */
  isDiagnostic: boolean;
  /** Retake required */
  retakeRequired: boolean;
  /** Retake reason */
  retakeReason?: string;
}

// ============================================================================
// IMAGING FILE TYPES
// ============================================================================

/**
 * File type enumeration
 *
 * Supported imaging file formats.
 *
 * Edge cases:
 * - DICOM: Medical imaging standard (contains metadata)
 * - JPEG/PNG/TIFF: Standard image formats (no embedded metadata)
 * - PDF: Reports, consents, documents
 * - Raw formats require conversion for viewing
 */
export enum FileType {
  /** DICOM medical imaging format */
  DICOM = 'dicom',
  /** JPEG image format */
  JPEG = 'jpeg',
  /** PNG image format */
  PNG = 'png',
  /** TIFF image format */
  TIFF = 'tiff',
  /** PDF document format */
  PDF = 'pdf',
  /** Raw sensor data */
  RAW = 'raw',
  /** STL file (3D scans) */
  STL = 'stl',
  /** OBJ file (3D models) */
  OBJ = 'obj',
}

/**
 * DICOM metadata structure
 *
 * Essential DICOM tags for medical imaging compliance and interoperability.
 *
 * DICOM (Digital Imaging and Communications in Medicine) standard metadata.
 * Required fields for PACS integration and regulatory compliance.
 *
 * Edge cases:
 * - Study/Series/SOP Instance UIDs must be globally unique
 * - Patient demographics must match EHR records
 * - Modality codes standardized (CR, DX, CT, etc.)
 * - Multiple series can exist in one study (e.g., multiple CBCT sequences)
 * - Timestamps in DICOM format (YYYYMMDD, HHMMSS)
 */
export interface DicomMetadata {
  /** Patient ID (must match EHR patient ID) */
  patientId: string;
  /** Patient name (Last^First^Middle) */
  patientName: string;
  /** Patient birth date (YYYYMMDD) */
  patientBirthDate: string;
  /** Patient sex (M, F, O) */
  patientSex?: 'M' | 'F' | 'O';
  /** Study Instance UID (globally unique) */
  studyInstanceUID: string;
  /** Study description */
  studyDescription?: string;
  /** Study date (YYYYMMDD) */
  studyDate: string;
  /** Study time (HHMMSS) */
  studyTime: string;
  /** Accession number (study tracking ID) */
  accessionNumber?: string;
  /** Series Instance UID (globally unique) */
  seriesInstanceUID: string;
  /** Series description */
  seriesDescription?: string;
  /** Series number */
  seriesNumber?: number;
  /** SOP Instance UID (globally unique, per image) */
  sopInstanceUID: string;
  /** SOP Class UID (defines image type) */
  sopClassUID?: string;
  /** Modality code (CR, DX, CT, etc.) */
  modality: string;
  /** Manufacturer */
  manufacturer?: string;
  /** Manufacturer model name */
  manufacturerModelName?: string;
  /** Institution name */
  institutionName?: string;
  /** Station name (equipment ID) */
  stationName?: string;
  /** Referring physician name */
  referringPhysicianName?: string;
  /** Performing physician name */
  performingPhysicianName?: string;
  /** Body part examined */
  bodyPartExamined?: string;
  /** Image type (ORIGINAL, DERIVED, etc.) */
  imageType?: string[];
  /** Number of frames (for multi-frame images) */
  numberOfFrames?: number;
  /** Rows (image height in pixels) */
  rows?: number;
  /** Columns (image width in pixels) */
  columns?: number;
  /** Bits allocated per pixel */
  bitsAllocated?: number;
  /** Pixel spacing (mm) */
  pixelSpacing?: [number, number];
  /** Additional DICOM tags */
  additionalTags?: Record<string, string | number | string[]>;
}

/**
 * File storage metadata
 *
 * Tracks file storage location and access information.
 *
 * Edge cases:
 * - Cloud storage (S3, Azure Blob, Google Cloud Storage)
 * - Local PACS server storage
 * - Hybrid storage (local + cloud backup)
 * - File encryption required for HIPAA compliance
 * - CDN for fast access to frequently viewed images
 */
export interface FileStorageMetadata {
  /** Storage provider (s3, azure, gcs, local, pacs) */
  storageProvider: 's3' | 'azure' | 'gcs' | 'local' | 'pacs' | 'other';
  /** Storage bucket/container name */
  bucketName?: string;
  /** Storage path/key */
  storagePath: string;
  /** File size in bytes */
  fileSizeBytes: number;
  /** Content type (MIME type) */
  contentType: string;
  /** MD5 hash for integrity verification */
  md5Hash?: string;
  /** SHA256 hash for integrity verification */
  sha256Hash?: string;
  /** Encryption enabled */
  isEncrypted: boolean;
  /** Encryption algorithm used */
  encryptionAlgorithm?: string;
  /** CDN URL for fast access */
  cdnUrl?: string;
  /** Thumbnail URL (for previews) */
  thumbnailUrl?: string;
  /** Presigned URL expiration (for temporary access) */
  presignedUrlExpiresAt?: ISODateString;
}

/**
 * Imaging file entity
 *
 * Represents a single imaging file (image, series, or document).
 *
 * Edge cases:
 * - One study can contain multiple files (FMX series, CBCT slices)
 * - DICOM files have embedded metadata (extract and store)
 * - Non-DICOM files require manual metadata entry
 * - Thumbnails generated for quick preview
 * - Original files preserved (no destructive edits)
 * - Annotations stored separately from original image
 */
export interface ImagingFile {
  /** Unique file identifier */
  id: ImagingFileId;
  /** Parent imaging study ID */
  studyId: ImagingStudyId;
  /** File type/format */
  fileType: FileType;
  /** Original filename */
  originalFilename: string;
  /** Display name (user-friendly) */
  displayName?: string;
  /** File description */
  description?: string;
  /** Series number (for multi-file studies) */
  seriesNumber?: number;
  /** Instance number (for multi-file series) */
  instanceNumber?: number;
  /** DICOM metadata (if DICOM file) */
  dicomMetadata?: DicomMetadata;
  /** File storage metadata */
  storageMetadata: FileStorageMetadata;
  /** Image dimensions (width x height) */
  dimensions?: {
    width: number;
    height: number;
    depth?: number; // For 3D images (CBCT)
  };
  /** Image resolution (DPI) */
  resolutionDpi?: number;
  /** Bit depth (8, 12, 16) */
  bitDepth?: number;
  /** Color space (grayscale, RGB, etc.) */
  colorSpace?: 'grayscale' | 'rgb' | 'rgba' | 'cmyk';
  /** Acquisition timestamp */
  acquiredAt: ISODateString;
  /** Acquisition device/equipment */
  acquisitionDevice?: string;
  /** Acquisition settings (kVp, mA, exposure time, etc.) */
  acquisitionSettings?: Record<string, string | number>;
  /** Quality metrics */
  qualityMetrics?: ImageQualityMetrics;
  /** Whether file is primary/key image */
  isPrimary: boolean;
  /** View/projection (PA, lateral, oblique, etc.) */
  view?: string;
  /** Anatomical orientation (if applicable) */
  orientation?: string;
  /** Processing applied (contrast enhancement, filters, etc.) */
  processingApplied?: string[];
  /** Calibration data (for measurements) */
  calibrationData?: {
    pixelsPerMm?: number;
    calibrationDate?: ISODateString;
    calibratedBy?: UUID;
  };
  /** Tags for categorization */
  tags?: string[];
  /** Upload timestamp */
  uploadedAt: ISODateString;
  /** User who uploaded */
  uploadedBy: UUID;
  /** Last viewed timestamp */
  lastViewedAt?: ISODateString;
  /** View count */
  viewCount: number;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// IMAGING AI ANALYSIS TYPES
// ============================================================================

/**
 * Finding severity enumeration
 *
 * Severity classification for AI-detected findings.
 *
 * Edge cases:
 * - LOW: Minor finding, routine monitoring
 * - MEDIUM: Moderate finding, schedule follow-up
 * - HIGH: Significant finding, prompt treatment needed
 * - CRITICAL: Urgent finding, immediate attention required
 */
export enum FindingSeverity {
  /** Low severity, routine monitoring */
  LOW = 'low',
  /** Medium severity, follow-up needed */
  MEDIUM = 'medium',
  /** High severity, prompt treatment */
  HIGH = 'high',
  /** Critical severity, immediate attention */
  CRITICAL = 'critical',
}

/**
 * Finding type enumeration
 *
 * Categories of pathological findings detected in imaging.
 *
 * Common dental imaging findings:
 * - CARIES: Dental cavity/decay
 * - PERIAPICAL_LESION: Infection at tooth root apex
 * - BONE_LOSS: Periodontal bone loss
 * - IMPACTED_TOOTH: Tooth unable to erupt
 * - FRACTURE: Tooth or bone fracture
 * - FOREIGN_BODY: Foreign object present
 * - SINUS_ISSUE: Maxillary sinus pathology
 * - TMJ_DISORDER: Temporomandibular joint abnormality
 */
export enum FindingType {
  /** Dental caries (cavity) */
  CARIES = 'caries',
  /** Periapical lesion (root infection) */
  PERIAPICAL_LESION = 'periapical_lesion',
  /** Periodontal bone loss */
  BONE_LOSS = 'bone_loss',
  /** Impacted tooth */
  IMPACTED_TOOTH = 'impacted_tooth',
  /** Tooth or bone fracture */
  FRACTURE = 'fracture',
  /** Foreign body */
  FOREIGN_BODY = 'foreign_body',
  /** Maxillary sinus pathology */
  SINUS_ISSUE = 'sinus_issue',
  /** TMJ disorder */
  TMJ_DISORDER = 'tmj_disorder',
  /** Calculus/tartar buildup */
  CALCULUS = 'calculus',
  /** Abscess */
  ABSCESS = 'abscess',
  /** Cyst or tumor */
  CYST_TUMOR = 'cyst_tumor',
  /** Root resorption */
  RESORPTION = 'resorption',
  /** Pulp exposure */
  PULP_EXPOSURE = 'pulp_exposure',
  /** Enamel defect */
  ENAMEL_DEFECT = 'enamel_defect',
  /** Restoration defect */
  RESTORATION_DEFECT = 'restoration_defect',
  /** Widened PDL space */
  WIDENED_PDL = 'widened_pdl',
  /** Other abnormality */
  OTHER = 'other',
}

/**
 * Bounding box coordinates
 *
 * Rectangular region defining location of finding.
 *
 * Coordinates system:
 * - x: Horizontal position from left edge (pixels or percentage)
 * - y: Vertical position from top edge (pixels or percentage)
 * - width: Width of bounding box
 * - height: Height of bounding box
 *
 * Edge cases:
 * - Coordinates can be absolute (pixels) or relative (0-1 percentage)
 * - Multiple bounding boxes can overlap (multiple findings)
 * - 3D bounding boxes for CBCT (add z, depth dimensions)
 */
export interface BoundingBox {
  /** X coordinate (left edge) */
  x: number;
  /** Y coordinate (top edge) */
  y: number;
  /** Width of box */
  width: number;
  /** Height of box */
  height: number;
  /** Z coordinate (for 3D images) */
  z?: number;
  /** Depth (for 3D images) */
  depth?: number;
  /** Coordinate system (pixels or normalized 0-1) */
  coordinateSystem: 'pixels' | 'normalized';
}

/**
 * Polygon coordinates
 *
 * Irregular shape defining precise boundary of finding.
 *
 * Edge cases:
 * - More precise than bounding box
 * - Computationally expensive to process
 * - Useful for irregular shapes (cysts, lesions)
 */
export interface Polygon {
  /** Array of [x, y] coordinate pairs */
  points: Array<[number, number]>;
  /** Coordinate system (pixels or normalized 0-1) */
  coordinateSystem: 'pixels' | 'normalized';
  /** Whether polygon is closed (first point = last point) */
  isClosed: boolean;
}

/**
 * Annotation type enumeration
 *
 * Types of annotations that can be added to images.
 */
export enum AnnotationType {
  /** Bounding box */
  BOUNDING_BOX = 'bounding_box',
  /** Polygon */
  POLYGON = 'polygon',
  /** Point marker */
  POINT = 'point',
  /** Line measurement */
  LINE = 'line',
  /** Angle measurement */
  ANGLE = 'angle',
  /** Area measurement */
  AREA = 'area',
  /** Text label */
  TEXT = 'text',
  /** Arrow pointer */
  ARROW = 'arrow',
}

/**
 * Annotation entity
 *
 * Visual annotation on imaging file (manual or AI-generated).
 *
 * Edge cases:
 * - Manual annotations by provider (interpretations)
 * - AI-generated annotations (automated findings)
 * - Annotations can be edited/deleted
 * - Annotations stored separately from image file
 * - Measurements require calibration data
 */
export interface Annotation {
  /** Unique annotation identifier */
  id: AnnotationId;
  /** Annotation type */
  type: AnnotationType;
  /** Bounding box coordinates (if applicable) */
  boundingBox?: BoundingBox;
  /** Polygon coordinates (if applicable) */
  polygon?: Polygon;
  /** Point coordinates (if applicable) */
  point?: { x: number; y: number };
  /** Line coordinates (if applicable) */
  line?: { start: { x: number; y: number }; end: { x: number; y: number } };
  /** Text label */
  label?: string;
  /** Description/notes */
  description?: string;
  /** Color (hex code) */
  color?: string;
  /** Confidence score (0-1, for AI annotations) */
  confidence?: number;
  /** Whether annotation is from AI */
  isAIGenerated: boolean;
  /** Provider who created/verified annotation */
  createdBy: ProviderId;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last modified by */
  modifiedBy?: ProviderId;
  /** Last modified timestamp */
  modifiedAt?: ISODateString;
  /** Measurement value (if measurement annotation) */
  measurementValue?: {
    value: number;
    unit: 'mm' | 'cm' | 'degrees' | 'mm2' | 'cm2' | 'pixels';
  };
  /** Related finding type (if clinical annotation) */
  findingType?: FindingType;
  /** Visibility (always, on_hover, hidden) */
  visibility?: 'always' | 'on_hover' | 'hidden';
}

/**
 * AI finding entity
 *
 * Individual finding detected by AI analysis.
 *
 * Edge cases:
 * - Confidence score drives provider review workflow (low confidence = manual review)
 * - Multiple findings can exist on same tooth
 * - Provider can accept, reject, or modify AI findings
 * - Accepted findings integrated into diagnosis workflow
 */
export interface AIFinding {
  /** Unique finding identifier */
  id: UUID;
  /** Finding type */
  findingType: FindingType;
  /** Finding code (standardized classification) */
  findingCode?: string;
  /** Finding name/description */
  findingName: string;
  /** Detailed description */
  description?: string;
  /** Severity level */
  severity: FindingSeverity;
  /** Confidence score (0-1) */
  confidenceScore: number;
  /** Affected tooth numbers (if tooth-specific) */
  toothNumbers?: ToothNumber[];
  /** Affected surfaces (if surface-specific) */
  surfaces?: ToothSurface[];
  /** Bounding box location */
  boundingBox?: BoundingBox;
  /** Polygon location (more precise) */
  polygon?: Polygon;
  /** Annotations associated with this finding */
  annotations?: Annotation[];
  /** Clinical recommendations */
  recommendations?: string[];
  /** Differential diagnoses */
  differentialDiagnoses?: string[];
  /** Provider review status */
  reviewStatus: 'pending' | 'accepted' | 'rejected' | 'modified';
  /** Provider who reviewed */
  reviewedBy?: ProviderId;
  /** Review timestamp */
  reviewedAt?: ISODateString;
  /** Review notes */
  reviewNotes?: string;
  /** Related diagnostic code (ICD-10) */
  diagnosticCode?: string;
}

/**
 * AI model information
 *
 * Metadata about the AI model used for analysis.
 *
 * Edge cases:
 * - Model version tracking for audit trail
 * - Different models for different findings (caries, bone loss, etc.)
 * - Model performance metrics tracked
 * - Regulatory compliance (FDA clearance for diagnostic AI)
 */
export interface AIModelInfo {
  /** Model name */
  modelName: string;
  /** Model version */
  modelVersion: string;
  /** Model vendor/provider */
  modelVendor?: string;
  /** Model type (classification, detection, segmentation) */
  modelType: 'classification' | 'detection' | 'segmentation' | 'other';
  /** Training dataset description */
  trainingDataset?: string;
  /** Model accuracy metrics */
  accuracyMetrics?: {
    sensitivity?: number; // True positive rate
    specificity?: number; // True negative rate
    precision?: number;
    recall?: number;
    f1Score?: number;
    auc?: number; // Area under ROC curve
  };
  /** FDA clearance/approval status */
  regulatoryStatus?: {
    isFDACleared: boolean;
    clearanceNumber?: string;
    clearanceDate?: ISODateString;
  };
  /** Model deployment date */
  deployedAt?: ISODateString;
  /** Model last updated */
  lastUpdatedAt?: ISODateString;
}

/**
 * Imaging AI result entity (aggregate root)
 *
 * Complete AI analysis results for an imaging study.
 *
 * Edge cases:
 * - One study can have multiple AI analyses (re-run with different models)
 * - AI results require provider review and acceptance
 * - Results integrated into clinical workflow (diagnosis, treatment planning)
 * - Processing failures logged for troubleshooting
 * - Performance metrics tracked (processing time, accuracy)
 */
export interface ImagingAIResult {
  /** Unique AI result identifier */
  id: ImagingAIResultId;
  /** Related imaging study ID */
  studyId: ImagingStudyId;
  /** Related imaging file IDs analyzed */
  fileIds: ImagingFileId[];
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** AI model information */
  modelInfo: AIModelInfo;
  /** Analysis timestamp */
  analyzedAt: ISODateString;
  /** Processing duration (milliseconds) */
  processingDurationMs: number;
  /** Analysis status */
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  /** Error message (if failed) */
  errorMessage?: string;
  /** Overall findings summary */
  summary?: string;
  /** Individual findings detected */
  findings: AIFinding[];
  /** Overall risk score (0-1) */
  overallRiskScore?: number;
  /** Recommended actions */
  recommendedActions?: string[];
  /** Clinical alerts (urgent findings) */
  clinicalAlerts?: Array<{
    severity: FindingSeverity;
    message: string;
    findingId?: UUID;
  }>;
  /** Quality score of analysis (0-1) */
  analysisQualityScore?: number;
  /** Limitations/caveats */
  limitations?: string[];
  /** Provider who requested analysis */
  requestedBy: ProviderId;
  /** Provider who reviewed results */
  reviewedBy?: ProviderId;
  /** Review timestamp */
  reviewedAt?: ISODateString;
  /** Review status */
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
  /** Review notes */
  reviewNotes?: string;
  /** Number of findings accepted */
  findingsAccepted?: number;
  /** Number of findings rejected */
  findingsRejected?: number;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// IMAGING REPORT TYPES
// ============================================================================

/**
 * Report type enumeration
 *
 * Classification of imaging report types.
 *
 * Edge cases:
 * - PRELIMINARY: Initial interpretation, subject to change
 * - FINAL: Finalized and signed report
 * - AMENDED: Correction to previously finalized report
 * - ADDENDUM: Additional information added to finalized report
 */
export enum ReportType {
  /** Preliminary interpretation (not final) */
  PRELIMINARY = 'preliminary',
  /** Final signed report */
  FINAL = 'final',
  /** Amended report (correction) */
  AMENDED = 'amended',
  /** Addendum to final report */
  ADDENDUM = 'addendum',
}

/**
 * Report status enumeration
 *
 * Lifecycle status of imaging report.
 *
 * Edge cases:
 * - DRAFT: Report being written (not released)
 * - FINAL: Report finalized and signed (released to patient chart)
 * - AMENDED: Report amended after finalization
 * - VOID: Report voided/cancelled
 */
export enum ReportStatus {
  /** Draft report (not finalized) */
  DRAFT = 'draft',
  /** Final signed report */
  FINAL = 'final',
  /** Amended report */
  AMENDED = 'amended',
  /** Voided report */
  VOID = 'void',
}

/**
 * Report section structure
 *
 * Structured sections of imaging report.
 *
 * Standard report sections:
 * - Clinical indication: Reason for imaging
 * - Technique: Imaging technique/parameters
 * - Findings: Detailed imaging findings
 * - Impression: Summary interpretation/diagnosis
 * - Recommendations: Suggested follow-up
 */
export interface ReportSection {
  /** Section identifier */
  sectionId: UUID;
  /** Section name */
  sectionName: string;
  /** Section content */
  content: string;
  /** Section order */
  order: number;
  /** Whether section is required */
  isRequired?: boolean;
}

/**
 * Report template reference
 *
 * Reference to report template used.
 *
 * Edge cases:
 * - Templates standardize reporting for consistency
 * - Templates can include macros/snippets
 * - Different templates for different modalities
 */
export interface ReportTemplate {
  /** Template identifier */
  templateId: UUID;
  /** Template name */
  templateName: string;
  /** Template version */
  templateVersion?: string;
  /** Modality this template is for */
  modality?: ImagingModality;
}

/**
 * Digital signature for report
 *
 * Electronic signature capturing report finalization.
 *
 * Edge cases:
 * - Required for final reports
 * - Locks report (no further edits)
 * - Captures timestamp, IP, user agent for audit trail
 */
export interface ReportSignature {
  /** Signature identifier */
  signatureId: UUID;
  /** Provider who signed */
  signedBy: ProviderId;
  /** Provider's credentials/title */
  providerCredentials?: string;
  /** Signature timestamp */
  signedAt: ISODateString;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
  /** Signature method */
  signatureMethod: 'electronic' | 'digital' | 'wet_signature';
  /** Digital signature data (encrypted) */
  signatureData?: string;
}

/**
 * Report amendment record
 *
 * Tracks amendments made to finalized report.
 *
 * Edge cases:
 * - Amendments require reason and provider signature
 * - Original report preserved in audit trail
 * - Amendment history visible to providers
 */
export interface ReportAmendment {
  /** Amendment identifier */
  amendmentId: UUID;
  /** Previous report version ID */
  previousVersionId: ImagingReportId;
  /** Reason for amendment */
  reason: string;
  /** Amendment content (what changed) */
  amendmentContent: string;
  /** Provider who made amendment */
  amendedBy: ProviderId;
  /** Amendment timestamp */
  amendedAt: ISODateString;
  /** Amendment signature */
  signature?: ReportSignature;
}

/**
 * Imaging report entity (aggregate root)
 *
 * Complete diagnostic report for imaging study.
 *
 * Edge cases:
 * - One study can have multiple reports (preliminary, final, amended)
 * - Reports require provider signature for finalization
 * - Templates used for standardization
 * - Structured reporting improves data extraction
 * - Critical findings flagged for urgent communication
 * - Reports integrated into patient chart
 */
export interface ImagingReport {
  /** Unique report identifier */
  id: ImagingReportId;
  /** Related imaging study ID */
  studyId: ImagingStudyId;
  /** Patient ID */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Report type */
  reportType: ReportType;
  /** Report status */
  status: ReportStatus;
  /** Report version number */
  version: number;
  /** Report title */
  title: string;
  /** Clinical indication (reason for imaging) */
  clinicalIndication?: string;
  /** Imaging technique description */
  technique?: string;
  /** Comparison with prior studies */
  comparison?: string;
  /** Structured report sections */
  sections?: ReportSection[];
  /** Findings (free text or structured) */
  findings: string;
  /** Impression/conclusion */
  impression: string;
  /** Recommendations */
  recommendations?: string;
  /** Critical/urgent findings */
  criticalFindings?: Array<{
    finding: string;
    severity: FindingSeverity;
    notified: boolean;
    notifiedAt?: ISODateString;
    notifiedTo?: UUID;
  }>;
  /** Diagnostic codes (ICD-10) */
  diagnosticCodes?: Array<{
    code: string;
    description: string;
  }>;
  /** Template used (if applicable) */
  template?: ReportTemplate;
  /** Interpreting provider */
  interpretingProvider: ProviderId;
  /** Referring provider */
  referringProvider?: ProviderId;
  /** Report date */
  reportDate: ISODateString;
  /** Report created timestamp */
  draftedAt: ISODateString;
  /** Report finalized timestamp */
  finalizedAt?: ISODateString;
  /** Digital signature */
  signature?: ReportSignature;
  /** Amendments (if any) */
  amendments?: ReportAmendment[];
  /** Previous report version ID (if amended) */
  previousVersionId?: ImagingReportId;
  /** Addenda (additional information) */
  addenda?: Array<{
    addendumId: UUID;
    content: string;
    addedBy: ProviderId;
    addedAt: ISODateString;
  }>;
  /** Peer review (if applicable) */
  peerReview?: {
    reviewedBy: ProviderId;
    reviewedAt: ISODateString;
    reviewNotes?: string;
    approved: boolean;
  };
  /** Teaching case flag */
  isTeachingCase?: boolean;
  /** Research case flag */
  isResearchCase?: boolean;
  /** Attachments (annotated images, etc.) */
  attachmentFileIds?: UUID[];
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created report */
  createdBy: UUID;
  /** User who last updated report */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// IMAGING STUDY (AGGREGATE ROOT)
// ============================================================================

/**
 * Study priority
 *
 * Urgency/priority of imaging study.
 */
export enum StudyPriority {
  /** Routine study */
  ROUTINE = 'routine',
  /** Urgent study (same day) */
  URGENT = 'urgent',
  /** Stat/emergency study (immediate) */
  STAT = 'stat',
}

/**
 * Clinical indication
 *
 * Reason for ordering imaging study.
 */
export interface ClinicalIndication {
  /** Indication text */
  indication: string;
  /** ICD-10 code (if applicable) */
  icd10Code?: string;
  /** Symptoms */
  symptoms?: string[];
  /** Duration */
  duration?: string;
}

/**
 * Prior study reference
 *
 * Reference to prior imaging for comparison.
 */
export interface PriorStudyReference {
  /** Prior study ID */
  priorStudyId: ImagingStudyId;
  /** Prior study date */
  priorStudyDate: ISODateString;
  /** Prior study description */
  priorStudyDescription?: string;
  /** Comparison notes */
  comparisonNotes?: string;
}

/**
 * Study order information
 *
 * Order details for imaging study.
 *
 * Edge cases:
 * - Orders created when provider requests imaging
 * - Standing orders for routine preventive imaging
 * - STAT orders prioritized in workflow
 */
export interface StudyOrder {
  /** Order identifier */
  orderId: UUID;
  /** Ordering provider */
  orderingProvider: ProviderId;
  /** Order date/time */
  orderedAt: ISODateString;
  /** Order priority */
  priority: StudyPriority;
  /** Order notes/instructions */
  orderNotes?: string;
  /** Protocol/technique requested */
  protocolRequested?: string;
  /** Number of views requested */
  viewsRequested?: number;
}

/**
 * Imaging study entity (aggregate root)
 *
 * Complete imaging study with files, AI analysis, and reports.
 *
 * Edge cases:
 * - Study can contain multiple files (series, views)
 * - FMX (Full Mouth X-ray) is one study with 18-20 files
 * - CBCT generates hundreds of slices (all part of one study)
 * - Studies linked to appointments, procedures, treatment plans
 * - AI analysis optional (can be run later)
 * - Reports required for complex studies (CBCT, consults)
 * - Radiation exposure tracked cumulatively
 * - Studies archived for long-term storage (7-10 years typical)
 */
export interface ImagingStudy {
  /** Unique imaging study identifier */
  id: ImagingStudyId;
  /** Patient this study belongs to */
  patientId: PatientId;
  /** Organization scope */
  organizationId: OrganizationId;
  /** Clinic scope (optional) */
  clinicId?: ClinicId;
  /** Accession number (unique study tracking ID) */
  accessionNumber?: string;
  /** Study status */
  status: ImagingStudyStatus;
  /** Study date/time */
  studyDate: ISODateString;
  /** Study description */
  description: string;
  /** Imaging modality */
  modality: ImagingModality;
  /** Anatomical region(s) imaged */
  regions: ImagingRegion[];
  /** Specific quadrant (if applicable) */
  quadrant?: Quadrant;
  /** Specific teeth imaged (if applicable) */
  teeth?: ToothNumber[];
  /** Study order information */
  order?: StudyOrder;
  /** Clinical indication */
  clinicalIndication?: ClinicalIndication;
  /** Ordering/referring provider */
  orderingProvider: ProviderId;
  /** Performing provider/technician */
  performingProvider?: ProviderId;
  /** Interpreting provider (radiologist/dentist) */
  interpretingProvider?: ProviderId;
  /** Related appointment ID */
  appointmentId?: UUID;
  /** Related procedure ID */
  procedureId?: ProcedureId;
  /** Imaging files in this study */
  files: ImagingFile[];
  /** Number of files/images */
  numberOfFiles: number;
  /** Total storage size (bytes) */
  totalSizeBytes: number;
  /** Radiation exposure record */
  radiationExposure?: RadiationExposure;
  /** Prior studies for comparison */
  priorStudies?: PriorStudyReference[];
  /** AI analysis results */
  aiResults?: ImagingAIResult[];
  /** Imaging reports */
  reports?: ImagingReport[];
  /** Study annotations */
  annotations?: Annotation[];
  /** Study protocol used */
  protocol?: string;
  /** Equipment/device used */
  equipment?: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    softwareVersion?: string;
  };
  /** Acquisition parameters */
  acquisitionParameters?: Record<string, string | number>;
  /** Patient positioning notes */
  positioningNotes?: string;
  /** Technical notes */
  technicalNotes?: string;
  /** Quality assurance notes */
  qualityNotes?: string;
  /** Retakes required */
  retakesRequired?: number;
  /** Retake reason */
  retakeReason?: string;
  /** Study completed timestamp */
  completedAt?: ISODateString;
  /** Study reported timestamp */
  reportedAt?: ISODateString;
  /** Study archived timestamp */
  archivedAt?: ISODateString;
  /** Archive location */
  archiveLocation?: string;
  /** Retention period (years) */
  retentionPeriodYears?: number;
  /** Scheduled destruction date */
  scheduledDestructionDate?: ISODateString;
  /** Legal hold (do not destroy) */
  legalHold?: boolean;
  /** Teaching case flag */
  isTeachingCase?: boolean;
  /** Research case flag */
  isResearchCase?: boolean;
  /** Consent for use obtained */
  consentObtained?: boolean;
  /** PACS integration status */
  pacsStatus?: 'not_sent' | 'pending' | 'sent' | 'failed' | 'acknowledged';
  /** PACS study instance UID */
  pacsStudyInstanceUID?: string;
  /** External system references */
  externalReferences?: Array<{
    systemName: string;
    systemId: string;
    referenceId: string;
  }>;
  /** Tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created study */
  createdBy: UUID;
  /** User who last updated study */
  updatedBy: UUID;
  /** Soft delete flag */
  deletedAt?: Nullable<ISODateString>;
  /** Custom metadata */
  metadata?: Metadata;
}
