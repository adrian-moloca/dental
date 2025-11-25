import type { UUID, ISODateString, OrganizationId, ClinicId, Metadata, Nullable } from '@dentalos/shared-types';
import type { PatientId, ProviderId, ProcedureId, ToothNumber, ToothSurface } from '../clinical';
export type ImagingStudyId = UUID & {
    readonly __brand: 'ImagingStudyId';
};
export type ImagingFileId = UUID & {
    readonly __brand: 'ImagingFileId';
};
export type ImagingReportId = UUID & {
    readonly __brand: 'ImagingReportId';
};
export type ImagingAIResultId = UUID & {
    readonly __brand: 'ImagingAIResultId';
};
export type AnnotationId = UUID & {
    readonly __brand: 'AnnotationId';
};
export declare enum ImagingStudyStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    REPORTED = "reported",
    ARCHIVED = "archived",
    CANCELLED = "cancelled",
    ERROR = "error"
}
export declare enum ImagingModality {
    X_RAY = "xray",
    CBCT = "cbct",
    PANORAMIC = "panoramic",
    INTRAORAL_PHOTO = "intraoral_photo",
    CEPHALOMETRIC = "cephalometric",
    BITEWING = "bitewing",
    PERIAPICAL = "periapical",
    OCCLUSAL = "occlusal",
    TMJ = "tmj",
    SINUS = "sinus",
    EXTRAORAL_PHOTO = "extraoral_photo",
    INTRAORAL_SCAN = "intraoral_scan",
    OTHER = "other"
}
export declare enum ImagingRegion {
    TOOTH = "tooth",
    QUADRANT = "quadrant",
    FULL_ARCH = "full_arch",
    FULL_MOUTH = "full_mouth",
    TMJ = "tmj",
    SINUS = "sinus",
    MAXILLA = "maxilla",
    MANDIBLE = "mandible",
    ANTERIOR = "anterior",
    POSTERIOR = "posterior",
    OTHER = "other"
}
export declare enum Quadrant {
    UPPER_RIGHT = "upper_right",
    UPPER_LEFT = "upper_left",
    LOWER_LEFT = "lower_left",
    LOWER_RIGHT = "lower_right"
}
export interface RadiationExposure {
    doseMsv: number;
    exposureArea: 'small' | 'medium' | 'large';
    kVp?: number;
    mA?: number;
    exposureTimeSeconds?: number;
    sourceDistanceCm?: number;
    collimation?: 'rectangular' | 'round' | 'none';
    leadApronUsed: boolean;
    thyroidCollarUsed: boolean;
    notes?: string;
}
export interface ImageQualityMetrics {
    qualityScore?: number;
    contrast: 'poor' | 'adequate' | 'good' | 'excellent';
    sharpness: 'poor' | 'adequate' | 'good' | 'excellent';
    properPositioning: boolean;
    artifactsPresent: boolean;
    artifactDescription?: string;
    isDiagnostic: boolean;
    retakeRequired: boolean;
    retakeReason?: string;
}
export declare enum FileType {
    DICOM = "dicom",
    JPEG = "jpeg",
    PNG = "png",
    TIFF = "tiff",
    PDF = "pdf",
    RAW = "raw",
    STL = "stl",
    OBJ = "obj"
}
export interface DicomMetadata {
    patientId: string;
    patientName: string;
    patientBirthDate: string;
    patientSex?: 'M' | 'F' | 'O';
    studyInstanceUID: string;
    studyDescription?: string;
    studyDate: string;
    studyTime: string;
    accessionNumber?: string;
    seriesInstanceUID: string;
    seriesDescription?: string;
    seriesNumber?: number;
    sopInstanceUID: string;
    sopClassUID?: string;
    modality: string;
    manufacturer?: string;
    manufacturerModelName?: string;
    institutionName?: string;
    stationName?: string;
    referringPhysicianName?: string;
    performingPhysicianName?: string;
    bodyPartExamined?: string;
    imageType?: string[];
    numberOfFrames?: number;
    rows?: number;
    columns?: number;
    bitsAllocated?: number;
    pixelSpacing?: [number, number];
    additionalTags?: Record<string, string | number | string[]>;
}
export interface FileStorageMetadata {
    storageProvider: 's3' | 'azure' | 'gcs' | 'local' | 'pacs' | 'other';
    bucketName?: string;
    storagePath: string;
    fileSizeBytes: number;
    contentType: string;
    md5Hash?: string;
    sha256Hash?: string;
    isEncrypted: boolean;
    encryptionAlgorithm?: string;
    cdnUrl?: string;
    thumbnailUrl?: string;
    presignedUrlExpiresAt?: ISODateString;
}
export interface ImagingFile {
    id: ImagingFileId;
    studyId: ImagingStudyId;
    fileType: FileType;
    originalFilename: string;
    displayName?: string;
    description?: string;
    seriesNumber?: number;
    instanceNumber?: number;
    dicomMetadata?: DicomMetadata;
    storageMetadata: FileStorageMetadata;
    dimensions?: {
        width: number;
        height: number;
        depth?: number;
    };
    resolutionDpi?: number;
    bitDepth?: number;
    colorSpace?: 'grayscale' | 'rgb' | 'rgba' | 'cmyk';
    acquiredAt: ISODateString;
    acquisitionDevice?: string;
    acquisitionSettings?: Record<string, string | number>;
    qualityMetrics?: ImageQualityMetrics;
    isPrimary: boolean;
    view?: string;
    orientation?: string;
    processingApplied?: string[];
    calibrationData?: {
        pixelsPerMm?: number;
        calibrationDate?: ISODateString;
        calibratedBy?: UUID;
    };
    tags?: string[];
    uploadedAt: ISODateString;
    uploadedBy: UUID;
    lastViewedAt?: ISODateString;
    viewCount: number;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum FindingSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
export declare enum FindingType {
    CARIES = "caries",
    PERIAPICAL_LESION = "periapical_lesion",
    BONE_LOSS = "bone_loss",
    IMPACTED_TOOTH = "impacted_tooth",
    FRACTURE = "fracture",
    FOREIGN_BODY = "foreign_body",
    SINUS_ISSUE = "sinus_issue",
    TMJ_DISORDER = "tmj_disorder",
    CALCULUS = "calculus",
    ABSCESS = "abscess",
    CYST_TUMOR = "cyst_tumor",
    RESORPTION = "resorption",
    PULP_EXPOSURE = "pulp_exposure",
    ENAMEL_DEFECT = "enamel_defect",
    RESTORATION_DEFECT = "restoration_defect",
    WIDENED_PDL = "widened_pdl",
    OTHER = "other"
}
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    z?: number;
    depth?: number;
    coordinateSystem: 'pixels' | 'normalized';
}
export interface Polygon {
    points: Array<[number, number]>;
    coordinateSystem: 'pixels' | 'normalized';
    isClosed: boolean;
}
export declare enum AnnotationType {
    BOUNDING_BOX = "bounding_box",
    POLYGON = "polygon",
    POINT = "point",
    LINE = "line",
    ANGLE = "angle",
    AREA = "area",
    TEXT = "text",
    ARROW = "arrow"
}
export interface Annotation {
    id: AnnotationId;
    type: AnnotationType;
    boundingBox?: BoundingBox;
    polygon?: Polygon;
    point?: {
        x: number;
        y: number;
    };
    line?: {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    };
    label?: string;
    description?: string;
    color?: string;
    confidence?: number;
    isAIGenerated: boolean;
    createdBy: ProviderId;
    createdAt: ISODateString;
    modifiedBy?: ProviderId;
    modifiedAt?: ISODateString;
    measurementValue?: {
        value: number;
        unit: 'mm' | 'cm' | 'degrees' | 'mm2' | 'cm2' | 'pixels';
    };
    findingType?: FindingType;
    visibility?: 'always' | 'on_hover' | 'hidden';
}
export interface AIFinding {
    id: UUID;
    findingType: FindingType;
    findingCode?: string;
    findingName: string;
    description?: string;
    severity: FindingSeverity;
    confidenceScore: number;
    toothNumbers?: ToothNumber[];
    surfaces?: ToothSurface[];
    boundingBox?: BoundingBox;
    polygon?: Polygon;
    annotations?: Annotation[];
    recommendations?: string[];
    differentialDiagnoses?: string[];
    reviewStatus: 'pending' | 'accepted' | 'rejected' | 'modified';
    reviewedBy?: ProviderId;
    reviewedAt?: ISODateString;
    reviewNotes?: string;
    diagnosticCode?: string;
}
export interface AIModelInfo {
    modelName: string;
    modelVersion: string;
    modelVendor?: string;
    modelType: 'classification' | 'detection' | 'segmentation' | 'other';
    trainingDataset?: string;
    accuracyMetrics?: {
        sensitivity?: number;
        specificity?: number;
        precision?: number;
        recall?: number;
        f1Score?: number;
        auc?: number;
    };
    regulatoryStatus?: {
        isFDACleared: boolean;
        clearanceNumber?: string;
        clearanceDate?: ISODateString;
    };
    deployedAt?: ISODateString;
    lastUpdatedAt?: ISODateString;
}
export interface ImagingAIResult {
    id: ImagingAIResultId;
    studyId: ImagingStudyId;
    fileIds: ImagingFileId[];
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    modelInfo: AIModelInfo;
    analyzedAt: ISODateString;
    processingDurationMs: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    errorMessage?: string;
    summary?: string;
    findings: AIFinding[];
    overallRiskScore?: number;
    recommendedActions?: string[];
    clinicalAlerts?: Array<{
        severity: FindingSeverity;
        message: string;
        findingId?: UUID;
    }>;
    analysisQualityScore?: number;
    limitations?: string[];
    requestedBy: ProviderId;
    reviewedBy?: ProviderId;
    reviewedAt?: ISODateString;
    reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected';
    reviewNotes?: string;
    findingsAccepted?: number;
    findingsRejected?: number;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum ReportType {
    PRELIMINARY = "preliminary",
    FINAL = "final",
    AMENDED = "amended",
    ADDENDUM = "addendum"
}
export declare enum ReportStatus {
    DRAFT = "draft",
    FINAL = "final",
    AMENDED = "amended",
    VOID = "void"
}
export interface ReportSection {
    sectionId: UUID;
    sectionName: string;
    content: string;
    order: number;
    isRequired?: boolean;
}
export interface ReportTemplate {
    templateId: UUID;
    templateName: string;
    templateVersion?: string;
    modality?: ImagingModality;
}
export interface ReportSignature {
    signatureId: UUID;
    signedBy: ProviderId;
    providerCredentials?: string;
    signedAt: ISODateString;
    ipAddress?: string;
    userAgent?: string;
    signatureMethod: 'electronic' | 'digital' | 'wet_signature';
    signatureData?: string;
}
export interface ReportAmendment {
    amendmentId: UUID;
    previousVersionId: ImagingReportId;
    reason: string;
    amendmentContent: string;
    amendedBy: ProviderId;
    amendedAt: ISODateString;
    signature?: ReportSignature;
}
export interface ImagingReport {
    id: ImagingReportId;
    studyId: ImagingStudyId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    reportType: ReportType;
    status: ReportStatus;
    version: number;
    title: string;
    clinicalIndication?: string;
    technique?: string;
    comparison?: string;
    sections?: ReportSection[];
    findings: string;
    impression: string;
    recommendations?: string;
    criticalFindings?: Array<{
        finding: string;
        severity: FindingSeverity;
        notified: boolean;
        notifiedAt?: ISODateString;
        notifiedTo?: UUID;
    }>;
    diagnosticCodes?: Array<{
        code: string;
        description: string;
    }>;
    template?: ReportTemplate;
    interpretingProvider: ProviderId;
    referringProvider?: ProviderId;
    reportDate: ISODateString;
    draftedAt: ISODateString;
    finalizedAt?: ISODateString;
    signature?: ReportSignature;
    amendments?: ReportAmendment[];
    previousVersionId?: ImagingReportId;
    addenda?: Array<{
        addendumId: UUID;
        content: string;
        addedBy: ProviderId;
        addedAt: ISODateString;
    }>;
    peerReview?: {
        reviewedBy: ProviderId;
        reviewedAt: ISODateString;
        reviewNotes?: string;
        approved: boolean;
    };
    isTeachingCase?: boolean;
    isResearchCase?: boolean;
    attachmentFileIds?: UUID[];
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
export declare enum StudyPriority {
    ROUTINE = "routine",
    URGENT = "urgent",
    STAT = "stat"
}
export interface ClinicalIndication {
    indication: string;
    icd10Code?: string;
    symptoms?: string[];
    duration?: string;
}
export interface PriorStudyReference {
    priorStudyId: ImagingStudyId;
    priorStudyDate: ISODateString;
    priorStudyDescription?: string;
    comparisonNotes?: string;
}
export interface StudyOrder {
    orderId: UUID;
    orderingProvider: ProviderId;
    orderedAt: ISODateString;
    priority: StudyPriority;
    orderNotes?: string;
    protocolRequested?: string;
    viewsRequested?: number;
}
export interface ImagingStudy {
    id: ImagingStudyId;
    patientId: PatientId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    accessionNumber?: string;
    status: ImagingStudyStatus;
    studyDate: ISODateString;
    description: string;
    modality: ImagingModality;
    regions: ImagingRegion[];
    quadrant?: Quadrant;
    teeth?: ToothNumber[];
    order?: StudyOrder;
    clinicalIndication?: ClinicalIndication;
    orderingProvider: ProviderId;
    performingProvider?: ProviderId;
    interpretingProvider?: ProviderId;
    appointmentId?: UUID;
    procedureId?: ProcedureId;
    files: ImagingFile[];
    numberOfFiles: number;
    totalSizeBytes: number;
    radiationExposure?: RadiationExposure;
    priorStudies?: PriorStudyReference[];
    aiResults?: ImagingAIResult[];
    reports?: ImagingReport[];
    annotations?: Annotation[];
    protocol?: string;
    equipment?: {
        manufacturer?: string;
        model?: string;
        serialNumber?: string;
        softwareVersion?: string;
    };
    acquisitionParameters?: Record<string, string | number>;
    positioningNotes?: string;
    technicalNotes?: string;
    qualityNotes?: string;
    retakesRequired?: number;
    retakeReason?: string;
    completedAt?: ISODateString;
    reportedAt?: ISODateString;
    archivedAt?: ISODateString;
    archiveLocation?: string;
    retentionPeriodYears?: number;
    scheduledDestructionDate?: ISODateString;
    legalHold?: boolean;
    isTeachingCase?: boolean;
    isResearchCase?: boolean;
    consentObtained?: boolean;
    pacsStatus?: 'not_sent' | 'pending' | 'sent' | 'failed' | 'acknowledged';
    pacsStudyInstanceUID?: string;
    externalReferences?: Array<{
        systemName: string;
        systemId: string;
        referenceId: string;
    }>;
    tags?: string[];
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UUID;
    updatedBy: UUID;
    deletedAt?: Nullable<ISODateString>;
    metadata?: Metadata;
}
