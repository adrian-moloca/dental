"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagingReportResponseSchema = exports.ImagingStudyResponseSchema = exports.QueryImagingReportsDtoSchema = exports.UpdateImagingReportDtoSchema = exports.CreateImagingReportDtoSchema = exports.AttachAIResultDtoSchema = exports.AIFindingSchema = exports.BoundingBoxSchema = exports.AttachFilesToStudyDtoSchema = exports.ImagingFileSchema = exports.DicomMetadataSchema = exports.QueryImagingStudiesDtoSchema = exports.UpdateImagingStudyDtoSchema = exports.CreateImagingStudyDtoSchema = exports.ToothSurfaceSchema = exports.ToothSurface = exports.ToothNumbersArraySchema = exports.ToothNumberSchema = exports.ReportStatusSchema = exports.ReportTypeSchema = exports.FindingTypeSchema = exports.FindingSeveritySchema = exports.ImagingFileTypeSchema = exports.ImagingStudyStatusSchema = exports.ImagingRegionSchema = exports.ImagingModalitySchema = exports.ReportStatus = exports.ReportType = exports.FindingType = exports.FindingSeverity = exports.ImagingFileType = exports.ImagingStudyStatus = exports.ImagingRegion = exports.ImagingModality = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
var ImagingModality;
(function (ImagingModality) {
    ImagingModality["INTRAORAL_XRAY"] = "INTRAORAL_XRAY";
    ImagingModality["PANORAMIC"] = "PANORAMIC";
    ImagingModality["CEPHALOMETRIC"] = "CEPHALOMETRIC";
    ImagingModality["CBCT"] = "CBCT";
    ImagingModality["CT"] = "CT";
    ImagingModality["MRI"] = "MRI";
    ImagingModality["ULTRASOUND"] = "ULTRASOUND";
    ImagingModality["PHOTO"] = "PHOTO";
    ImagingModality["VIDEO"] = "VIDEO";
    ImagingModality["THREE_D_SCAN"] = "THREE_D_SCAN";
})(ImagingModality || (exports.ImagingModality = ImagingModality = {}));
var ImagingRegion;
(function (ImagingRegion) {
    ImagingRegion["FULL_MOUTH"] = "FULL_MOUTH";
    ImagingRegion["MAXILLA"] = "MAXILLA";
    ImagingRegion["MANDIBLE"] = "MANDIBLE";
    ImagingRegion["ANTERIOR"] = "ANTERIOR";
    ImagingRegion["POSTERIOR"] = "POSTERIOR";
    ImagingRegion["TMJ_LEFT"] = "TMJ_LEFT";
    ImagingRegion["TMJ_RIGHT"] = "TMJ_RIGHT";
    ImagingRegion["TMJ_BILATERAL"] = "TMJ_BILATERAL";
    ImagingRegion["SINUS"] = "SINUS";
    ImagingRegion["SPECIFIC_TOOTH"] = "SPECIFIC_TOOTH";
    ImagingRegion["QUADRANT_1"] = "QUADRANT_1";
    ImagingRegion["QUADRANT_2"] = "QUADRANT_2";
    ImagingRegion["QUADRANT_3"] = "QUADRANT_3";
    ImagingRegion["QUADRANT_4"] = "QUADRANT_4";
})(ImagingRegion || (exports.ImagingRegion = ImagingRegion = {}));
var ImagingStudyStatus;
(function (ImagingStudyStatus) {
    ImagingStudyStatus["ORDERED"] = "ORDERED";
    ImagingStudyStatus["SCHEDULED"] = "SCHEDULED";
    ImagingStudyStatus["IN_PROGRESS"] = "IN_PROGRESS";
    ImagingStudyStatus["COMPLETED"] = "COMPLETED";
    ImagingStudyStatus["PRELIMINARY"] = "PRELIMINARY";
    ImagingStudyStatus["FINAL"] = "FINAL";
    ImagingStudyStatus["AMENDED"] = "AMENDED";
    ImagingStudyStatus["CANCELLED"] = "CANCELLED";
    ImagingStudyStatus["ERROR"] = "ERROR";
})(ImagingStudyStatus || (exports.ImagingStudyStatus = ImagingStudyStatus = {}));
var ImagingFileType;
(function (ImagingFileType) {
    ImagingFileType["DICOM"] = "DICOM";
    ImagingFileType["JPEG"] = "JPEG";
    ImagingFileType["PNG"] = "PNG";
    ImagingFileType["TIFF"] = "TIFF";
    ImagingFileType["PDF"] = "PDF";
    ImagingFileType["MP4"] = "MP4";
    ImagingFileType["AVI"] = "AVI";
    ImagingFileType["STL"] = "STL";
    ImagingFileType["OBJ"] = "OBJ";
    ImagingFileType["PLY"] = "PLY";
})(ImagingFileType || (exports.ImagingFileType = ImagingFileType = {}));
var FindingSeverity;
(function (FindingSeverity) {
    FindingSeverity["NORMAL"] = "NORMAL";
    FindingSeverity["MINIMAL"] = "MINIMAL";
    FindingSeverity["MILD"] = "MILD";
    FindingSeverity["MODERATE"] = "MODERATE";
    FindingSeverity["SEVERE"] = "SEVERE";
    FindingSeverity["CRITICAL"] = "CRITICAL";
})(FindingSeverity || (exports.FindingSeverity = FindingSeverity = {}));
var FindingType;
(function (FindingType) {
    FindingType["CARIES"] = "CARIES";
    FindingType["PERIAPICAL_LESION"] = "PERIAPICAL_LESION";
    FindingType["BONE_LOSS"] = "BONE_LOSS";
    FindingType["CALCULUS"] = "CALCULUS";
    FindingType["RESTORATION"] = "RESTORATION";
    FindingType["DEFECTIVE_RESTORATION"] = "DEFECTIVE_RESTORATION";
    FindingType["IMPACTED_TOOTH"] = "IMPACTED_TOOTH";
    FindingType["MISSING_TOOTH"] = "MISSING_TOOTH";
    FindingType["SUPERNUMERARY_TOOTH"] = "SUPERNUMERARY_TOOTH";
    FindingType["ROOT_CANAL"] = "ROOT_CANAL";
    FindingType["IMPLANT"] = "IMPLANT";
    FindingType["CROWN"] = "CROWN";
    FindingType["BRIDGE"] = "BRIDGE";
    FindingType["FRACTURE"] = "FRACTURE";
    FindingType["RESORPTION"] = "RESORPTION";
    FindingType["CYST"] = "CYST";
    FindingType["TUMOR"] = "TUMOR";
    FindingType["SINUS_PATHOLOGY"] = "SINUS_PATHOLOGY";
    FindingType["TMJ_DISORDER"] = "TMJ_DISORDER";
    FindingType["FOREIGN_BODY"] = "FOREIGN_BODY";
    FindingType["ABNORMAL_ANATOMY"] = "ABNORMAL_ANATOMY";
    FindingType["OTHER"] = "OTHER";
})(FindingType || (exports.FindingType = FindingType = {}));
var ReportType;
(function (ReportType) {
    ReportType["PRELIMINARY"] = "PRELIMINARY";
    ReportType["FINAL"] = "FINAL";
    ReportType["ADDENDUM"] = "ADDENDUM";
    ReportType["AMENDED"] = "AMENDED";
    ReportType["CONSULTATION"] = "CONSULTATION";
    ReportType["COMPARISON"] = "COMPARISON";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "DRAFT";
    ReportStatus["PENDING_REVIEW"] = "PENDING_REVIEW";
    ReportStatus["PRELIMINARY"] = "PRELIMINARY";
    ReportStatus["FINAL"] = "FINAL";
    ReportStatus["AMENDED"] = "AMENDED";
    ReportStatus["CORRECTED"] = "CORRECTED";
    ReportStatus["CANCELLED"] = "CANCELLED";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
exports.ImagingModalitySchema = zod_1.z.nativeEnum(ImagingModality, {
    errorMap: () => ({ message: 'Invalid imaging modality' }),
});
exports.ImagingRegionSchema = zod_1.z.nativeEnum(ImagingRegion, {
    errorMap: () => ({ message: 'Invalid imaging region' }),
});
exports.ImagingStudyStatusSchema = zod_1.z.nativeEnum(ImagingStudyStatus, {
    errorMap: () => ({ message: 'Invalid imaging study status' }),
});
exports.ImagingFileTypeSchema = zod_1.z.nativeEnum(ImagingFileType, {
    errorMap: () => ({ message: 'Invalid file type' }),
});
exports.FindingSeveritySchema = zod_1.z.nativeEnum(FindingSeverity, {
    errorMap: () => ({ message: 'Invalid finding severity' }),
});
exports.FindingTypeSchema = zod_1.z.nativeEnum(FindingType, {
    errorMap: () => ({ message: 'Invalid finding type' }),
});
exports.ReportTypeSchema = zod_1.z.nativeEnum(ReportType, {
    errorMap: () => ({ message: 'Invalid report type' }),
});
exports.ReportStatusSchema = zod_1.z.nativeEnum(ReportStatus, {
    errorMap: () => ({ message: 'Invalid report status' }),
});
exports.ToothNumberSchema = zod_1.z
    .number()
    .int({ message: 'Tooth number must be an integer' })
    .min(1, 'Tooth number must be between 1 and 32')
    .max(32, 'Tooth number must be between 1 and 32');
exports.ToothNumbersArraySchema = zod_1.z
    .array(exports.ToothNumberSchema)
    .min(0, 'Tooth numbers array cannot be negative length')
    .max(32, 'Cannot have more than 32 tooth numbers')
    .refine((teeth) => {
    const uniqueTeeth = new Set(teeth);
    return uniqueTeeth.size === teeth.length;
}, { message: 'Tooth numbers must be unique' });
var ToothSurface;
(function (ToothSurface) {
    ToothSurface["OCCLUSAL"] = "OCCLUSAL";
    ToothSurface["MESIAL"] = "MESIAL";
    ToothSurface["DISTAL"] = "DISTAL";
    ToothSurface["BUCCAL"] = "BUCCAL";
    ToothSurface["LINGUAL"] = "LINGUAL";
    ToothSurface["FACIAL"] = "FACIAL";
    ToothSurface["INCISAL"] = "INCISAL";
})(ToothSurface || (exports.ToothSurface = ToothSurface = {}));
exports.ToothSurfaceSchema = zod_1.z.nativeEnum(ToothSurface, {
    errorMap: () => ({ message: 'Invalid tooth surface' }),
});
const BaseImagingStudySchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.describe('Patient UUID'),
    modality: exports.ImagingModalitySchema.describe('Imaging modality'),
    region: exports.ImagingRegionSchema.describe('Anatomical region'),
    toothNumbers: exports.ToothNumbersArraySchema
        .optional()
        .describe('Specific teeth involved (for tooth-specific imaging)'),
    studyDate: common_schemas_1.ISODateStringSchema.describe('Date and time of study'),
    description: common_schemas_1.NonEmptyStringSchema.max(500, 'Description must be 500 characters or less').describe('Study description'),
    clinicalNotes: zod_1.z
        .string()
        .max(2000, 'Clinical notes must be 2000 characters or less')
        .optional()
        .describe('Clinical notes and indications'),
    referringProviderId: common_schemas_1.UUIDSchema.describe('Referring provider UUID'),
    appointmentId: common_schemas_1.UUIDSchema.optional().describe('Associated appointment UUID'),
    procedureId: common_schemas_1.UUIDSchema.optional().describe('Associated procedure UUID'),
    urgency: zod_1.z
        .enum(['ROUTINE', 'URGENT', 'STAT'], {
        errorMap: () => ({ message: 'Invalid urgency level' }),
    })
        .default('ROUTINE')
        .describe('Study urgency'),
    status: exports.ImagingStudyStatusSchema.default(ImagingStudyStatus.ORDERED).describe('Initial study status'),
});
exports.CreateImagingStudyDtoSchema = BaseImagingStudySchema.refine((data) => {
    if (data.region === ImagingRegion.SPECIFIC_TOOTH) {
        return data.toothNumbers && data.toothNumbers.length > 0;
    }
    return true;
}, {
    message: 'Tooth numbers are required when region is SPECIFIC_TOOTH',
    path: ['toothNumbers'],
}).refine((data) => {
    const studyDate = new Date(data.studyDate);
    const now = new Date();
    return studyDate <= now;
}, {
    message: 'Study date cannot be in the future',
    path: ['studyDate'],
});
exports.UpdateImagingStudyDtoSchema = BaseImagingStudySchema.omit({ patientId: true })
    .partial()
    .extend({
    status: exports.ImagingStudyStatusSchema.optional(),
    completedAt: common_schemas_1.ISODateStringSchema.optional().describe('Completion timestamp'),
})
    .refine((data) => {
    if (data.status === ImagingStudyStatus.COMPLETED ||
        data.status === ImagingStudyStatus.FINAL) {
        return data.completedAt !== undefined;
    }
    return true;
}, {
    message: 'completedAt is required when status is COMPLETED or FINAL',
    path: ['completedAt'],
});
exports.QueryImagingStudiesDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema.optional().describe('Filter by patient UUID'),
    modality: exports.ImagingModalitySchema.optional().describe('Filter by modality'),
    region: exports.ImagingRegionSchema.optional().describe('Filter by anatomical region'),
    status: exports.ImagingStudyStatusSchema.optional().describe('Filter by status'),
    referringProviderId: common_schemas_1.UUIDSchema.optional().describe('Filter by referring provider'),
    fromDate: common_schemas_1.ISODateStringSchema.optional().describe('Start date for date range filter'),
    toDate: common_schemas_1.ISODateStringSchema.optional().describe('End date for date range filter'),
    page: common_schemas_1.PositiveIntSchema.default(1).describe('Page number for pagination'),
    limit: common_schemas_1.PositiveIntSchema.min(1)
        .max(100, 'Limit cannot exceed 100')
        .default(20)
        .describe('Items per page'),
    sortBy: zod_1.z
        .enum(['studyDate', 'createdAt', 'modality', 'status'], {
        errorMap: () => ({ message: 'Invalid sort field' }),
    })
        .default('studyDate')
        .describe('Sort field'),
    sortOrder: zod_1.z
        .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Sort order must be asc or desc' }),
    })
        .default('desc')
        .describe('Sort order'),
})
    .refine((data) => {
    if (data.fromDate && data.toDate) {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);
        return from <= to;
    }
    return true;
}, {
    message: 'fromDate must be before or equal to toDate',
    path: ['fromDate'],
});
exports.DicomMetadataSchema = zod_1.z.object({
    studyInstanceUID: common_schemas_1.NonEmptyStringSchema.optional().describe('DICOM Study Instance UID'),
    seriesInstanceUID: common_schemas_1.NonEmptyStringSchema.optional().describe('DICOM Series Instance UID'),
    sopInstanceUID: common_schemas_1.NonEmptyStringSchema.optional().describe('DICOM SOP Instance UID'),
    patientName: common_schemas_1.NonEmptyStringSchema.optional().describe('Patient name from DICOM'),
    patientID: common_schemas_1.NonEmptyStringSchema.optional().describe('Patient ID from DICOM'),
    studyDescription: zod_1.z.string().optional().describe('Study description'),
    seriesDescription: zod_1.z.string().optional().describe('Series description'),
    modality: common_schemas_1.NonEmptyStringSchema.optional().describe('DICOM modality'),
    manufacturer: zod_1.z.string().optional().describe('Equipment manufacturer'),
    manufacturerModelName: zod_1.z.string().optional().describe('Equipment model'),
    kvp: zod_1.z.number().positive().optional().describe('Peak kilovoltage'),
    exposureTime: zod_1.z.number().positive().optional().describe('Exposure time in ms'),
    xrayTubeCurrent: zod_1.z.number().positive().optional().describe('X-ray tube current in mA'),
    imageRows: common_schemas_1.PositiveIntSchema.optional().describe('Image height in pixels'),
    imageColumns: common_schemas_1.PositiveIntSchema.optional().describe('Image width in pixels'),
    pixelSpacing: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional().describe('Pixel spacing [row, column] in mm'),
    sliceThickness: zod_1.z.number().positive().optional().describe('Slice thickness in mm'),
    acquisitionDate: common_schemas_1.ISODateStringSchema.optional().describe('Acquisition date'),
});
exports.ImagingFileSchema = zod_1.z.object({
    storageKey: common_schemas_1.NonEmptyStringSchema.max(500, 'Storage key must be 500 characters or less').describe('S3/storage key for file'),
    fileName: common_schemas_1.NonEmptyStringSchema.max(255, 'File name must be 255 characters or less').describe('Original file name'),
    mimeType: common_schemas_1.NonEmptyStringSchema.max(100, 'MIME type must be 100 characters or less').describe('File MIME type'),
    fileSize: common_schemas_1.PositiveIntSchema.max(5 * 1024 * 1024 * 1024, 'File size cannot exceed 5GB').describe('File size in bytes'),
    fileType: exports.ImagingFileTypeSchema.describe('File type classification'),
    dicomMetadata: exports.DicomMetadataSchema.optional().describe('DICOM metadata if applicable'),
    thumbnailStorageKey: zod_1.z
        .string()
        .max(500, 'Thumbnail storage key must be 500 characters or less')
        .optional()
        .describe('Storage key for thumbnail image'),
    description: zod_1.z
        .string()
        .max(500, 'Description must be 500 characters or less')
        .optional()
        .describe('File description'),
});
exports.AttachFilesToStudyDtoSchema = zod_1.z.object({
    studyId: common_schemas_1.UUIDSchema.describe('Imaging study UUID'),
    files: zod_1.z
        .array(exports.ImagingFileSchema)
        .min(1, 'At least one file is required')
        .max(100, 'Cannot attach more than 100 files at once')
        .describe('Array of files to attach'),
});
exports.BoundingBoxSchema = zod_1.z
    .object({
    x: zod_1.z
        .number()
        .min(0, 'x must be between 0 and 1')
        .max(1, 'x must be between 0 and 1')
        .describe('Normalized x coordinate (left)'),
    y: zod_1.z
        .number()
        .min(0, 'y must be between 0 and 1')
        .max(1, 'y must be between 0 and 1')
        .describe('Normalized y coordinate (top)'),
    width: zod_1.z
        .number()
        .min(0, 'width must be between 0 and 1')
        .max(1, 'width must be between 0 and 1')
        .describe('Normalized width'),
    height: zod_1.z
        .number()
        .min(0, 'height must be between 0 and 1')
        .max(1, 'height must be between 0 and 1')
        .describe('Normalized height'),
})
    .refine((box) => box.x + box.width <= 1, {
    message: 'Bounding box extends beyond image width (x + width > 1)',
    path: ['width'],
})
    .refine((box) => box.y + box.height <= 1, {
    message: 'Bounding box extends beyond image height (y + height > 1)',
    path: ['height'],
});
exports.AIFindingSchema = zod_1.z.object({
    findingCode: common_schemas_1.NonEmptyStringSchema.max(50, 'Finding code must be 50 characters or less').describe('Standardized finding code'),
    findingType: exports.FindingTypeSchema.describe('Type of finding'),
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Finding name must be 200 characters or less').describe('Human-readable finding name'),
    description: zod_1.z
        .string()
        .max(1000, 'Description must be 1000 characters or less')
        .optional()
        .describe('Detailed finding description'),
    severity: exports.FindingSeveritySchema.describe('Clinical severity classification'),
    confidence: zod_1.z
        .number()
        .min(0, 'Confidence must be between 0 and 1')
        .max(1, 'Confidence must be between 0 and 1')
        .describe('AI confidence score (0-1)'),
    toothNumbers: exports.ToothNumbersArraySchema.optional().describe('Affected tooth numbers'),
    surfaces: zod_1.z
        .array(exports.ToothSurfaceSchema)
        .optional()
        .describe('Affected tooth surfaces'),
    boundingBox: exports.BoundingBoxSchema.optional().describe('Location bounding box'),
    annotations: zod_1.z
        .array(zod_1.z.object({
        type: zod_1.z
            .enum(['POINT', 'LINE', 'POLYGON', 'CIRCLE'], {
            errorMap: () => ({ message: 'Invalid annotation type' }),
        })
            .describe('Annotation shape type'),
        coordinates: zod_1.z
            .array(zod_1.z.number())
            .min(2, 'Coordinates must have at least 2 values')
            .describe('Normalized coordinates array'),
        label: zod_1.z.string().optional().describe('Annotation label'),
    }))
        .optional()
        .describe('Additional annotations'),
    recommendations: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema)
        .optional()
        .describe('Clinical recommendations'),
});
exports.AttachAIResultDtoSchema = zod_1.z.object({
    studyId: common_schemas_1.UUIDSchema.describe('Imaging study UUID'),
    fileId: common_schemas_1.UUIDSchema.optional().describe('Specific file UUID if analysis is for one file'),
    aiModelName: common_schemas_1.NonEmptyStringSchema.max(100, 'Model name must be 100 characters or less').describe('AI model name'),
    aiModelVersion: common_schemas_1.NonEmptyStringSchema.max(50, 'Model version must be 50 characters or less').describe('AI model version'),
    findings: zod_1.z
        .array(exports.AIFindingSchema)
        .min(0, 'Findings array must be provided (can be empty for normal studies)')
        .max(100, 'Cannot have more than 100 findings')
        .describe('Array of AI findings'),
    overallConfidence: zod_1.z
        .number()
        .min(0, 'Overall confidence must be between 0 and 1')
        .max(1, 'Overall confidence must be between 0 and 1')
        .optional()
        .describe('Overall analysis confidence'),
    processingTime: common_schemas_1.NonNegativeIntSchema.optional().describe('Processing time in milliseconds'),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional().describe('Additional AI model metadata'),
});
const BaseImagingReportSchema = zod_1.z.object({
    studyId: common_schemas_1.UUIDSchema.describe('Imaging study UUID'),
    reportType: exports.ReportTypeSchema.describe('Type of report'),
    findings: common_schemas_1.NonEmptyStringSchema.max(5000, 'Findings must be 5000 characters or less').describe('Detailed findings description'),
    impression: common_schemas_1.NonEmptyStringSchema.max(2000, 'Impression must be 2000 characters or less').describe('Clinical impression/conclusion'),
    recommendations: zod_1.z
        .string()
        .max(2000, 'Recommendations must be 2000 characters or less')
        .optional()
        .describe('Clinical recommendations'),
    technique: zod_1.z
        .string()
        .max(1000, 'Technique must be 1000 characters or less')
        .optional()
        .describe('Imaging technique description'),
    comparison: zod_1.z
        .string()
        .max(1000, 'Comparison must be 1000 characters or less')
        .optional()
        .describe('Comparison with prior studies'),
    clinicalHistory: zod_1.z
        .string()
        .max(1000, 'Clinical history must be 1000 characters or less')
        .optional()
        .describe('Relevant clinical history'),
    signedById: common_schemas_1.UUIDSchema.optional().describe('Provider UUID who signed the report'),
    signedAt: common_schemas_1.ISODateStringSchema.optional().describe('Report signature timestamp'),
    status: exports.ReportStatusSchema.default(ReportStatus.DRAFT).describe('Report status'),
    criticalFindings: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema)
        .optional()
        .describe('Critical findings requiring immediate attention'),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional().describe('Additional report metadata'),
});
exports.CreateImagingReportDtoSchema = BaseImagingReportSchema;
exports.UpdateImagingReportDtoSchema = BaseImagingReportSchema.omit({ studyId: true })
    .partial()
    .extend({
    status: exports.ReportStatusSchema.optional(),
    amendmentReason: zod_1.z
        .string()
        .max(500, 'Amendment reason must be 500 characters or less')
        .optional()
        .describe('Reason for amendment'),
})
    .refine((data) => {
    if (data.status === ReportStatus.FINAL) {
        return data.signedById !== undefined && data.signedAt !== undefined;
    }
    return true;
}, {
    message: 'signedById and signedAt are required when status is FINAL',
    path: ['status'],
})
    .refine((data) => {
    if (data.status === ReportStatus.AMENDED) {
        return data.amendmentReason !== undefined && data.amendmentReason.length > 0;
    }
    return true;
}, {
    message: 'amendmentReason is required when status is AMENDED',
    path: ['amendmentReason'],
});
exports.QueryImagingReportsDtoSchema = zod_1.z
    .object({
    studyId: common_schemas_1.UUIDSchema.optional().describe('Filter by study UUID'),
    patientId: common_schemas_1.UUIDSchema.optional().describe('Filter by patient UUID'),
    reportType: exports.ReportTypeSchema.optional().describe('Filter by report type'),
    status: exports.ReportStatusSchema.optional().describe('Filter by status'),
    signedById: common_schemas_1.UUIDSchema.optional().describe('Filter by signing provider'),
    fromDate: common_schemas_1.ISODateStringSchema.optional().describe('Start date for date range filter'),
    toDate: common_schemas_1.ISODateStringSchema.optional().describe('End date for date range filter'),
    hasCriticalFindings: zod_1.z.boolean().optional().describe('Filter by presence of critical findings'),
    page: common_schemas_1.PositiveIntSchema.default(1).describe('Page number for pagination'),
    limit: common_schemas_1.PositiveIntSchema.min(1)
        .max(100, 'Limit cannot exceed 100')
        .default(20)
        .describe('Items per page'),
    sortBy: zod_1.z
        .enum(['signedAt', 'createdAt', 'reportType', 'status'], {
        errorMap: () => ({ message: 'Invalid sort field' }),
    })
        .default('signedAt')
        .describe('Sort field'),
    sortOrder: zod_1.z
        .enum(['asc', 'desc'], {
        errorMap: () => ({ message: 'Sort order must be asc or desc' }),
    })
        .default('desc')
        .describe('Sort order'),
})
    .refine((data) => {
    if (data.fromDate && data.toDate) {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);
        return from <= to;
    }
    return true;
}, {
    message: 'fromDate must be before or equal to toDate',
    path: ['fromDate'],
});
exports.ImagingStudyResponseSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    modality: exports.ImagingModalitySchema,
    region: exports.ImagingRegionSchema,
    toothNumbers: exports.ToothNumbersArraySchema.optional(),
    studyDate: common_schemas_1.ISODateStringSchema,
    description: common_schemas_1.NonEmptyStringSchema,
    clinicalNotes: zod_1.z.string().optional(),
    referringProviderId: common_schemas_1.UUIDSchema,
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    procedureId: common_schemas_1.UUIDSchema.optional(),
    urgency: zod_1.z.enum(['ROUTINE', 'URGENT', 'STAT']),
    status: exports.ImagingStudyStatusSchema,
    completedAt: common_schemas_1.ISODateStringSchema.optional(),
    fileCount: common_schemas_1.NonNegativeIntSchema.default(0),
    hasAIAnalysis: zod_1.z.boolean().default(false),
    hasReport: zod_1.z.boolean().default(false),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    createdBy: common_schemas_1.UUIDSchema,
    updatedBy: common_schemas_1.UUIDSchema,
});
exports.ImagingReportResponseSchema = zod_1.z.object({
    id: common_schemas_1.UUIDSchema,
    studyId: common_schemas_1.UUIDSchema,
    reportType: exports.ReportTypeSchema,
    findings: common_schemas_1.NonEmptyStringSchema,
    impression: common_schemas_1.NonEmptyStringSchema,
    recommendations: zod_1.z.string().optional(),
    technique: zod_1.z.string().optional(),
    comparison: zod_1.z.string().optional(),
    clinicalHistory: zod_1.z.string().optional(),
    signedById: common_schemas_1.UUIDSchema.optional(),
    signedAt: common_schemas_1.ISODateStringSchema.optional(),
    status: exports.ReportStatusSchema,
    criticalFindings: zod_1.z.array(common_schemas_1.NonEmptyStringSchema).optional(),
    amendmentReason: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
    createdAt: common_schemas_1.ISODateStringSchema,
    updatedAt: common_schemas_1.ISODateStringSchema,
    createdBy: common_schemas_1.UUIDSchema,
    updatedBy: common_schemas_1.UUIDSchema,
});
//# sourceMappingURL=imaging.schemas.js.map