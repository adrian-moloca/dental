import { z } from 'zod';
export declare enum ImagingModality {
    INTRAORAL_XRAY = "INTRAORAL_XRAY",
    PANORAMIC = "PANORAMIC",
    CEPHALOMETRIC = "CEPHALOMETRIC",
    CBCT = "CBCT",
    CT = "CT",
    MRI = "MRI",
    ULTRASOUND = "ULTRASOUND",
    PHOTO = "PHOTO",
    VIDEO = "VIDEO",
    THREE_D_SCAN = "THREE_D_SCAN"
}
export declare enum ImagingRegion {
    FULL_MOUTH = "FULL_MOUTH",
    MAXILLA = "MAXILLA",
    MANDIBLE = "MANDIBLE",
    ANTERIOR = "ANTERIOR",
    POSTERIOR = "POSTERIOR",
    TMJ_LEFT = "TMJ_LEFT",
    TMJ_RIGHT = "TMJ_RIGHT",
    TMJ_BILATERAL = "TMJ_BILATERAL",
    SINUS = "SINUS",
    SPECIFIC_TOOTH = "SPECIFIC_TOOTH",
    QUADRANT_1 = "QUADRANT_1",
    QUADRANT_2 = "QUADRANT_2",
    QUADRANT_3 = "QUADRANT_3",
    QUADRANT_4 = "QUADRANT_4"
}
export declare enum ImagingStudyStatus {
    ORDERED = "ORDERED",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    PRELIMINARY = "PRELIMINARY",
    FINAL = "FINAL",
    AMENDED = "AMENDED",
    CANCELLED = "CANCELLED",
    ERROR = "ERROR"
}
export declare enum ImagingFileType {
    DICOM = "DICOM",
    JPEG = "JPEG",
    PNG = "PNG",
    TIFF = "TIFF",
    PDF = "PDF",
    MP4 = "MP4",
    AVI = "AVI",
    STL = "STL",
    OBJ = "OBJ",
    PLY = "PLY"
}
export declare enum FindingSeverity {
    NORMAL = "NORMAL",
    MINIMAL = "MINIMAL",
    MILD = "MILD",
    MODERATE = "MODERATE",
    SEVERE = "SEVERE",
    CRITICAL = "CRITICAL"
}
export declare enum FindingType {
    CARIES = "CARIES",
    PERIAPICAL_LESION = "PERIAPICAL_LESION",
    BONE_LOSS = "BONE_LOSS",
    CALCULUS = "CALCULUS",
    RESTORATION = "RESTORATION",
    DEFECTIVE_RESTORATION = "DEFECTIVE_RESTORATION",
    IMPACTED_TOOTH = "IMPACTED_TOOTH",
    MISSING_TOOTH = "MISSING_TOOTH",
    SUPERNUMERARY_TOOTH = "SUPERNUMERARY_TOOTH",
    ROOT_CANAL = "ROOT_CANAL",
    IMPLANT = "IMPLANT",
    CROWN = "CROWN",
    BRIDGE = "BRIDGE",
    FRACTURE = "FRACTURE",
    RESORPTION = "RESORPTION",
    CYST = "CYST",
    TUMOR = "TUMOR",
    SINUS_PATHOLOGY = "SINUS_PATHOLOGY",
    TMJ_DISORDER = "TMJ_DISORDER",
    FOREIGN_BODY = "FOREIGN_BODY",
    ABNORMAL_ANATOMY = "ABNORMAL_ANATOMY",
    OTHER = "OTHER"
}
export declare enum ReportType {
    PRELIMINARY = "PRELIMINARY",
    FINAL = "FINAL",
    ADDENDUM = "ADDENDUM",
    AMENDED = "AMENDED",
    CONSULTATION = "CONSULTATION",
    COMPARISON = "COMPARISON"
}
export declare enum ReportStatus {
    DRAFT = "DRAFT",
    PENDING_REVIEW = "PENDING_REVIEW",
    PRELIMINARY = "PRELIMINARY",
    FINAL = "FINAL",
    AMENDED = "AMENDED",
    CORRECTED = "CORRECTED",
    CANCELLED = "CANCELLED"
}
export declare const ImagingModalitySchema: z.ZodNativeEnum<typeof ImagingModality>;
export type ImagingModalityType = z.infer<typeof ImagingModalitySchema>;
export declare const ImagingRegionSchema: z.ZodNativeEnum<typeof ImagingRegion>;
export type ImagingRegionType = z.infer<typeof ImagingRegionSchema>;
export declare const ImagingStudyStatusSchema: z.ZodNativeEnum<typeof ImagingStudyStatus>;
export type ImagingStudyStatusType = z.infer<typeof ImagingStudyStatusSchema>;
export declare const ImagingFileTypeSchema: z.ZodNativeEnum<typeof ImagingFileType>;
export type ImagingFileTypeType = z.infer<typeof ImagingFileTypeSchema>;
export declare const FindingSeveritySchema: z.ZodNativeEnum<typeof FindingSeverity>;
export type FindingSeverityType = z.infer<typeof FindingSeveritySchema>;
export declare const FindingTypeSchema: z.ZodNativeEnum<typeof FindingType>;
export type FindingTypeType = z.infer<typeof FindingTypeSchema>;
export declare const ReportTypeSchema: z.ZodNativeEnum<typeof ReportType>;
export type ReportTypeType = z.infer<typeof ReportTypeSchema>;
export declare const ReportStatusSchema: z.ZodNativeEnum<typeof ReportStatus>;
export type ReportStatusType = z.infer<typeof ReportStatusSchema>;
export declare const ToothNumberSchema: z.ZodNumber;
export type ToothNumber = z.infer<typeof ToothNumberSchema>;
export declare const ToothNumbersArraySchema: z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>;
export type ToothNumbersArray = z.infer<typeof ToothNumbersArraySchema>;
export declare enum ToothSurface {
    OCCLUSAL = "OCCLUSAL",
    MESIAL = "MESIAL",
    DISTAL = "DISTAL",
    BUCCAL = "BUCCAL",
    LINGUAL = "LINGUAL",
    FACIAL = "FACIAL",
    INCISAL = "INCISAL"
}
export declare const ToothSurfaceSchema: z.ZodNativeEnum<typeof ToothSurface>;
export type ToothSurfaceType = z.infer<typeof ToothSurfaceSchema>;
export declare const CreateImagingStudyDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    patientId: z.ZodString;
    modality: z.ZodNativeEnum<typeof ImagingModality>;
    region: z.ZodNativeEnum<typeof ImagingRegion>;
    toothNumbers: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
    studyDate: z.ZodString;
    description: z.ZodString;
    clinicalNotes: z.ZodOptional<z.ZodString>;
    referringProviderId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    procedureId: z.ZodOptional<z.ZodString>;
    urgency: z.ZodDefault<z.ZodEnum<["ROUTINE", "URGENT", "STAT"]>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof ImagingStudyStatus>>;
}, "strip", z.ZodTypeAny, {
    status: ImagingStudyStatus;
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    urgency: "URGENT" | "ROUTINE" | "STAT";
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
}, {
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    status?: ImagingStudyStatus | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}>, {
    status: ImagingStudyStatus;
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    urgency: "URGENT" | "ROUTINE" | "STAT";
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
}, {
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    status?: ImagingStudyStatus | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}>, {
    status: ImagingStudyStatus;
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    urgency: "URGENT" | "ROUTINE" | "STAT";
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
}, {
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    referringProviderId: string;
    status?: ImagingStudyStatus | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    clinicalNotes?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}>;
export type CreateImagingStudyDto = z.infer<typeof CreateImagingStudyDtoSchema>;
export declare const UpdateImagingStudyDtoSchema: z.ZodEffects<z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodNativeEnum<typeof ImagingRegion>>;
    modality: z.ZodOptional<z.ZodNativeEnum<typeof ImagingModality>>;
    studyDate: z.ZodOptional<z.ZodString>;
    appointmentId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    toothNumbers: z.ZodOptional<z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>>;
    procedureId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    clinicalNotes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    referringProviderId: z.ZodOptional<z.ZodString>;
    urgency: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ROUTINE", "URGENT", "STAT"]>>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof ImagingStudyStatus>>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: ImagingStudyStatus | undefined;
    description?: string | undefined;
    region?: ImagingRegion | undefined;
    modality?: ImagingModality | undefined;
    studyDate?: string | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
    referringProviderId?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}, {
    status?: ImagingStudyStatus | undefined;
    description?: string | undefined;
    region?: ImagingRegion | undefined;
    modality?: ImagingModality | undefined;
    studyDate?: string | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
    referringProviderId?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}>, {
    status?: ImagingStudyStatus | undefined;
    description?: string | undefined;
    region?: ImagingRegion | undefined;
    modality?: ImagingModality | undefined;
    studyDate?: string | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
    referringProviderId?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}, {
    status?: ImagingStudyStatus | undefined;
    description?: string | undefined;
    region?: ImagingRegion | undefined;
    modality?: ImagingModality | undefined;
    studyDate?: string | undefined;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
    referringProviderId?: string | undefined;
    urgency?: "URGENT" | "ROUTINE" | "STAT" | undefined;
}>;
export type UpdateImagingStudyDto = z.infer<typeof UpdateImagingStudyDtoSchema>;
export declare const QueryImagingStudiesDtoSchema: z.ZodEffects<z.ZodObject<{
    patientId: z.ZodOptional<z.ZodString>;
    modality: z.ZodOptional<z.ZodNativeEnum<typeof ImagingModality>>;
    region: z.ZodOptional<z.ZodNativeEnum<typeof ImagingRegion>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ImagingStudyStatus>>;
    referringProviderId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["studyDate", "createdAt", "modality", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "modality" | "studyDate";
    sortOrder: "asc" | "desc";
    status?: ImagingStudyStatus | undefined;
    region?: ImagingRegion | undefined;
    patientId?: string | undefined;
    modality?: ImagingModality | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    referringProviderId?: string | undefined;
}, {
    status?: ImagingStudyStatus | undefined;
    limit?: number | undefined;
    region?: ImagingRegion | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "modality" | "studyDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    modality?: ImagingModality | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    referringProviderId?: string | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "modality" | "studyDate";
    sortOrder: "asc" | "desc";
    status?: ImagingStudyStatus | undefined;
    region?: ImagingRegion | undefined;
    patientId?: string | undefined;
    modality?: ImagingModality | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    referringProviderId?: string | undefined;
}, {
    status?: ImagingStudyStatus | undefined;
    limit?: number | undefined;
    region?: ImagingRegion | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "modality" | "studyDate" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    modality?: ImagingModality | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    referringProviderId?: string | undefined;
}>;
export type QueryImagingStudiesDto = z.infer<typeof QueryImagingStudiesDtoSchema>;
export declare const DicomMetadataSchema: z.ZodObject<{
    studyInstanceUID: z.ZodOptional<z.ZodString>;
    seriesInstanceUID: z.ZodOptional<z.ZodString>;
    sopInstanceUID: z.ZodOptional<z.ZodString>;
    patientName: z.ZodOptional<z.ZodString>;
    patientID: z.ZodOptional<z.ZodString>;
    studyDescription: z.ZodOptional<z.ZodString>;
    seriesDescription: z.ZodOptional<z.ZodString>;
    modality: z.ZodOptional<z.ZodString>;
    manufacturer: z.ZodOptional<z.ZodString>;
    manufacturerModelName: z.ZodOptional<z.ZodString>;
    kvp: z.ZodOptional<z.ZodNumber>;
    exposureTime: z.ZodOptional<z.ZodNumber>;
    xrayTubeCurrent: z.ZodOptional<z.ZodNumber>;
    imageRows: z.ZodOptional<z.ZodNumber>;
    imageColumns: z.ZodOptional<z.ZodNumber>;
    pixelSpacing: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    sliceThickness: z.ZodOptional<z.ZodNumber>;
    acquisitionDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    studyInstanceUID?: string | undefined;
    seriesInstanceUID?: string | undefined;
    modality?: string | undefined;
    sopInstanceUID?: string | undefined;
    manufacturer?: string | undefined;
    patientName?: string | undefined;
    patientID?: string | undefined;
    studyDescription?: string | undefined;
    seriesDescription?: string | undefined;
    manufacturerModelName?: string | undefined;
    kvp?: number | undefined;
    exposureTime?: number | undefined;
    xrayTubeCurrent?: number | undefined;
    imageRows?: number | undefined;
    imageColumns?: number | undefined;
    pixelSpacing?: [number, number] | undefined;
    sliceThickness?: number | undefined;
    acquisitionDate?: string | undefined;
}, {
    studyInstanceUID?: string | undefined;
    seriesInstanceUID?: string | undefined;
    modality?: string | undefined;
    sopInstanceUID?: string | undefined;
    manufacturer?: string | undefined;
    patientName?: string | undefined;
    patientID?: string | undefined;
    studyDescription?: string | undefined;
    seriesDescription?: string | undefined;
    manufacturerModelName?: string | undefined;
    kvp?: number | undefined;
    exposureTime?: number | undefined;
    xrayTubeCurrent?: number | undefined;
    imageRows?: number | undefined;
    imageColumns?: number | undefined;
    pixelSpacing?: [number, number] | undefined;
    sliceThickness?: number | undefined;
    acquisitionDate?: string | undefined;
}>;
export type DicomMetadata = z.infer<typeof DicomMetadataSchema>;
export declare const ImagingFileSchema: z.ZodObject<{
    storageKey: z.ZodString;
    fileName: z.ZodString;
    mimeType: z.ZodString;
    fileSize: z.ZodNumber;
    fileType: z.ZodNativeEnum<typeof ImagingFileType>;
    dicomMetadata: z.ZodOptional<z.ZodObject<{
        studyInstanceUID: z.ZodOptional<z.ZodString>;
        seriesInstanceUID: z.ZodOptional<z.ZodString>;
        sopInstanceUID: z.ZodOptional<z.ZodString>;
        patientName: z.ZodOptional<z.ZodString>;
        patientID: z.ZodOptional<z.ZodString>;
        studyDescription: z.ZodOptional<z.ZodString>;
        seriesDescription: z.ZodOptional<z.ZodString>;
        modality: z.ZodOptional<z.ZodString>;
        manufacturer: z.ZodOptional<z.ZodString>;
        manufacturerModelName: z.ZodOptional<z.ZodString>;
        kvp: z.ZodOptional<z.ZodNumber>;
        exposureTime: z.ZodOptional<z.ZodNumber>;
        xrayTubeCurrent: z.ZodOptional<z.ZodNumber>;
        imageRows: z.ZodOptional<z.ZodNumber>;
        imageColumns: z.ZodOptional<z.ZodNumber>;
        pixelSpacing: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        sliceThickness: z.ZodOptional<z.ZodNumber>;
        acquisitionDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        studyInstanceUID?: string | undefined;
        seriesInstanceUID?: string | undefined;
        modality?: string | undefined;
        sopInstanceUID?: string | undefined;
        manufacturer?: string | undefined;
        patientName?: string | undefined;
        patientID?: string | undefined;
        studyDescription?: string | undefined;
        seriesDescription?: string | undefined;
        manufacturerModelName?: string | undefined;
        kvp?: number | undefined;
        exposureTime?: number | undefined;
        xrayTubeCurrent?: number | undefined;
        imageRows?: number | undefined;
        imageColumns?: number | undefined;
        pixelSpacing?: [number, number] | undefined;
        sliceThickness?: number | undefined;
        acquisitionDate?: string | undefined;
    }, {
        studyInstanceUID?: string | undefined;
        seriesInstanceUID?: string | undefined;
        modality?: string | undefined;
        sopInstanceUID?: string | undefined;
        manufacturer?: string | undefined;
        patientName?: string | undefined;
        patientID?: string | undefined;
        studyDescription?: string | undefined;
        seriesDescription?: string | undefined;
        manufacturerModelName?: string | undefined;
        kvp?: number | undefined;
        exposureTime?: number | undefined;
        xrayTubeCurrent?: number | undefined;
        imageRows?: number | undefined;
        imageColumns?: number | undefined;
        pixelSpacing?: [number, number] | undefined;
        sliceThickness?: number | undefined;
        acquisitionDate?: string | undefined;
    }>>;
    thumbnailStorageKey: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    fileType: ImagingFileType;
    description?: string | undefined;
    dicomMetadata?: {
        studyInstanceUID?: string | undefined;
        seriesInstanceUID?: string | undefined;
        modality?: string | undefined;
        sopInstanceUID?: string | undefined;
        manufacturer?: string | undefined;
        patientName?: string | undefined;
        patientID?: string | undefined;
        studyDescription?: string | undefined;
        seriesDescription?: string | undefined;
        manufacturerModelName?: string | undefined;
        kvp?: number | undefined;
        exposureTime?: number | undefined;
        xrayTubeCurrent?: number | undefined;
        imageRows?: number | undefined;
        imageColumns?: number | undefined;
        pixelSpacing?: [number, number] | undefined;
        sliceThickness?: number | undefined;
        acquisitionDate?: string | undefined;
    } | undefined;
    thumbnailStorageKey?: string | undefined;
}, {
    storageKey: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    fileType: ImagingFileType;
    description?: string | undefined;
    dicomMetadata?: {
        studyInstanceUID?: string | undefined;
        seriesInstanceUID?: string | undefined;
        modality?: string | undefined;
        sopInstanceUID?: string | undefined;
        manufacturer?: string | undefined;
        patientName?: string | undefined;
        patientID?: string | undefined;
        studyDescription?: string | undefined;
        seriesDescription?: string | undefined;
        manufacturerModelName?: string | undefined;
        kvp?: number | undefined;
        exposureTime?: number | undefined;
        xrayTubeCurrent?: number | undefined;
        imageRows?: number | undefined;
        imageColumns?: number | undefined;
        pixelSpacing?: [number, number] | undefined;
        sliceThickness?: number | undefined;
        acquisitionDate?: string | undefined;
    } | undefined;
    thumbnailStorageKey?: string | undefined;
}>;
export type ImagingFile = z.infer<typeof ImagingFileSchema>;
export declare const AttachFilesToStudyDtoSchema: z.ZodObject<{
    studyId: z.ZodString;
    files: z.ZodArray<z.ZodObject<{
        storageKey: z.ZodString;
        fileName: z.ZodString;
        mimeType: z.ZodString;
        fileSize: z.ZodNumber;
        fileType: z.ZodNativeEnum<typeof ImagingFileType>;
        dicomMetadata: z.ZodOptional<z.ZodObject<{
            studyInstanceUID: z.ZodOptional<z.ZodString>;
            seriesInstanceUID: z.ZodOptional<z.ZodString>;
            sopInstanceUID: z.ZodOptional<z.ZodString>;
            patientName: z.ZodOptional<z.ZodString>;
            patientID: z.ZodOptional<z.ZodString>;
            studyDescription: z.ZodOptional<z.ZodString>;
            seriesDescription: z.ZodOptional<z.ZodString>;
            modality: z.ZodOptional<z.ZodString>;
            manufacturer: z.ZodOptional<z.ZodString>;
            manufacturerModelName: z.ZodOptional<z.ZodString>;
            kvp: z.ZodOptional<z.ZodNumber>;
            exposureTime: z.ZodOptional<z.ZodNumber>;
            xrayTubeCurrent: z.ZodOptional<z.ZodNumber>;
            imageRows: z.ZodOptional<z.ZodNumber>;
            imageColumns: z.ZodOptional<z.ZodNumber>;
            pixelSpacing: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
            sliceThickness: z.ZodOptional<z.ZodNumber>;
            acquisitionDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        }, {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        }>>;
        thumbnailStorageKey: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        fileType: ImagingFileType;
        description?: string | undefined;
        dicomMetadata?: {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        } | undefined;
        thumbnailStorageKey?: string | undefined;
    }, {
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        fileType: ImagingFileType;
        description?: string | undefined;
        dicomMetadata?: {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        } | undefined;
        thumbnailStorageKey?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    studyId: string;
    files: {
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        fileType: ImagingFileType;
        description?: string | undefined;
        dicomMetadata?: {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        } | undefined;
        thumbnailStorageKey?: string | undefined;
    }[];
}, {
    studyId: string;
    files: {
        storageKey: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        fileType: ImagingFileType;
        description?: string | undefined;
        dicomMetadata?: {
            studyInstanceUID?: string | undefined;
            seriesInstanceUID?: string | undefined;
            modality?: string | undefined;
            sopInstanceUID?: string | undefined;
            manufacturer?: string | undefined;
            patientName?: string | undefined;
            patientID?: string | undefined;
            studyDescription?: string | undefined;
            seriesDescription?: string | undefined;
            manufacturerModelName?: string | undefined;
            kvp?: number | undefined;
            exposureTime?: number | undefined;
            xrayTubeCurrent?: number | undefined;
            imageRows?: number | undefined;
            imageColumns?: number | undefined;
            pixelSpacing?: [number, number] | undefined;
            sliceThickness?: number | undefined;
            acquisitionDate?: string | undefined;
        } | undefined;
        thumbnailStorageKey?: string | undefined;
    }[];
}>;
export type AttachFilesToStudyDto = z.infer<typeof AttachFilesToStudyDtoSchema>;
export declare const BoundingBoxSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
    width: z.ZodNumber;
    height: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    y: number;
    x: number;
    width: number;
    height: number;
}, {
    y: number;
    x: number;
    width: number;
    height: number;
}>, {
    y: number;
    x: number;
    width: number;
    height: number;
}, {
    y: number;
    x: number;
    width: number;
    height: number;
}>, {
    y: number;
    x: number;
    width: number;
    height: number;
}, {
    y: number;
    x: number;
    width: number;
    height: number;
}>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export declare const AIFindingSchema: z.ZodObject<{
    findingCode: z.ZodString;
    findingType: z.ZodNativeEnum<typeof FindingType>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodNativeEnum<typeof FindingSeverity>;
    confidence: z.ZodNumber;
    toothNumbers: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
    surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
    boundingBox: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        y: number;
        x: number;
        width: number;
        height: number;
    }, {
        y: number;
        x: number;
        width: number;
        height: number;
    }>, {
        y: number;
        x: number;
        width: number;
        height: number;
    }, {
        y: number;
        x: number;
        width: number;
        height: number;
    }>, {
        y: number;
        x: number;
        width: number;
        height: number;
    }, {
        y: number;
        x: number;
        width: number;
        height: number;
    }>>;
    annotations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["POINT", "LINE", "POLYGON", "CIRCLE"]>;
        coordinates: z.ZodArray<z.ZodNumber, "many">;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
        coordinates: number[];
        label?: string | undefined;
    }, {
        type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
        coordinates: number[];
        label?: string | undefined;
    }>, "many">>;
    recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    severity: FindingSeverity;
    findingCode: string;
    findingType: FindingType;
    confidence: number;
    description?: string | undefined;
    toothNumbers?: number[] | undefined;
    surfaces?: ToothSurface[] | undefined;
    boundingBox?: {
        y: number;
        x: number;
        width: number;
        height: number;
    } | undefined;
    annotations?: {
        type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
        coordinates: number[];
        label?: string | undefined;
    }[] | undefined;
    recommendations?: string[] | undefined;
}, {
    name: string;
    severity: FindingSeverity;
    findingCode: string;
    findingType: FindingType;
    confidence: number;
    description?: string | undefined;
    toothNumbers?: number[] | undefined;
    surfaces?: ToothSurface[] | undefined;
    boundingBox?: {
        y: number;
        x: number;
        width: number;
        height: number;
    } | undefined;
    annotations?: {
        type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
        coordinates: number[];
        label?: string | undefined;
    }[] | undefined;
    recommendations?: string[] | undefined;
}>;
export type AIFinding = z.infer<typeof AIFindingSchema>;
export declare const AttachAIResultDtoSchema: z.ZodObject<{
    studyId: z.ZodString;
    fileId: z.ZodOptional<z.ZodString>;
    aiModelName: z.ZodString;
    aiModelVersion: z.ZodString;
    findings: z.ZodArray<z.ZodObject<{
        findingCode: z.ZodString;
        findingType: z.ZodNativeEnum<typeof FindingType>;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        severity: z.ZodNativeEnum<typeof FindingSeverity>;
        confidence: z.ZodNumber;
        toothNumbers: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
        surfaces: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ToothSurface>, "many">>;
        boundingBox: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
            width: z.ZodNumber;
            height: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            y: number;
            x: number;
            width: number;
            height: number;
        }, {
            y: number;
            x: number;
            width: number;
            height: number;
        }>, {
            y: number;
            x: number;
            width: number;
            height: number;
        }, {
            y: number;
            x: number;
            width: number;
            height: number;
        }>, {
            y: number;
            x: number;
            width: number;
            height: number;
        }, {
            y: number;
            x: number;
            width: number;
            height: number;
        }>>;
        annotations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["POINT", "LINE", "POLYGON", "CIRCLE"]>;
            coordinates: z.ZodArray<z.ZodNumber, "many">;
            label: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }, {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }>, "many">>;
        recommendations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        severity: FindingSeverity;
        findingCode: string;
        findingType: FindingType;
        confidence: number;
        description?: string | undefined;
        toothNumbers?: number[] | undefined;
        surfaces?: ToothSurface[] | undefined;
        boundingBox?: {
            y: number;
            x: number;
            width: number;
            height: number;
        } | undefined;
        annotations?: {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }[] | undefined;
        recommendations?: string[] | undefined;
    }, {
        name: string;
        severity: FindingSeverity;
        findingCode: string;
        findingType: FindingType;
        confidence: number;
        description?: string | undefined;
        toothNumbers?: number[] | undefined;
        surfaces?: ToothSurface[] | undefined;
        boundingBox?: {
            y: number;
            x: number;
            width: number;
            height: number;
        } | undefined;
        annotations?: {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }[] | undefined;
        recommendations?: string[] | undefined;
    }>, "many">;
    overallConfidence: z.ZodOptional<z.ZodNumber>;
    processingTime: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    studyId: string;
    aiModelName: string;
    aiModelVersion: string;
    findings: {
        name: string;
        severity: FindingSeverity;
        findingCode: string;
        findingType: FindingType;
        confidence: number;
        description?: string | undefined;
        toothNumbers?: number[] | undefined;
        surfaces?: ToothSurface[] | undefined;
        boundingBox?: {
            y: number;
            x: number;
            width: number;
            height: number;
        } | undefined;
        annotations?: {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }[] | undefined;
        recommendations?: string[] | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    fileId?: string | undefined;
    overallConfidence?: number | undefined;
    processingTime?: number | undefined;
}, {
    studyId: string;
    aiModelName: string;
    aiModelVersion: string;
    findings: {
        name: string;
        severity: FindingSeverity;
        findingCode: string;
        findingType: FindingType;
        confidence: number;
        description?: string | undefined;
        toothNumbers?: number[] | undefined;
        surfaces?: ToothSurface[] | undefined;
        boundingBox?: {
            y: number;
            x: number;
            width: number;
            height: number;
        } | undefined;
        annotations?: {
            type: "POINT" | "LINE" | "POLYGON" | "CIRCLE";
            coordinates: number[];
            label?: string | undefined;
        }[] | undefined;
        recommendations?: string[] | undefined;
    }[];
    metadata?: Record<string, unknown> | undefined;
    fileId?: string | undefined;
    overallConfidence?: number | undefined;
    processingTime?: number | undefined;
}>;
export type AttachAIResultDto = z.infer<typeof AttachAIResultDtoSchema>;
export declare const CreateImagingReportDtoSchema: z.ZodObject<{
    studyId: z.ZodString;
    reportType: z.ZodNativeEnum<typeof ReportType>;
    findings: z.ZodString;
    impression: z.ZodString;
    recommendations: z.ZodOptional<z.ZodString>;
    technique: z.ZodOptional<z.ZodString>;
    comparison: z.ZodOptional<z.ZodString>;
    clinicalHistory: z.ZodOptional<z.ZodString>;
    signedById: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof ReportStatus>>;
    criticalFindings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    status: ReportStatus;
    studyId: string;
    findings: string;
    reportType: ReportType;
    impression: string;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
}, {
    studyId: string;
    findings: string;
    reportType: ReportType;
    impression: string;
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
}>;
export type CreateImagingReportDto = z.infer<typeof CreateImagingReportDtoSchema>;
export declare const UpdateImagingReportDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    recommendations: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    findings: z.ZodOptional<z.ZodString>;
    reportType: z.ZodOptional<z.ZodNativeEnum<typeof ReportType>>;
    impression: z.ZodOptional<z.ZodString>;
    technique: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    comparison: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    clinicalHistory: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    signedById: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    signedAt: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    criticalFindings: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
} & {
    status: z.ZodOptional<z.ZodNativeEnum<typeof ReportStatus>>;
    amendmentReason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}>, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}>, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}, {
    status?: ReportStatus | undefined;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    findings?: string | undefined;
    reportType?: ReportType | undefined;
    impression?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}>;
export type UpdateImagingReportDto = z.infer<typeof UpdateImagingReportDtoSchema>;
export declare const QueryImagingReportsDtoSchema: z.ZodEffects<z.ZodObject<{
    studyId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    reportType: z.ZodOptional<z.ZodNativeEnum<typeof ReportType>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ReportStatus>>;
    signedById: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    hasCriticalFindings: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["signedAt", "createdAt", "reportType", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "reportType" | "signedAt";
    sortOrder: "asc" | "desc";
    status?: ReportStatus | undefined;
    patientId?: string | undefined;
    studyId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    reportType?: ReportType | undefined;
    signedById?: string | undefined;
    hasCriticalFindings?: boolean | undefined;
}, {
    status?: ReportStatus | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "reportType" | "signedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    studyId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    reportType?: ReportType | undefined;
    signedById?: string | undefined;
    hasCriticalFindings?: boolean | undefined;
}>, {
    limit: number;
    page: number;
    sortBy: "status" | "createdAt" | "reportType" | "signedAt";
    sortOrder: "asc" | "desc";
    status?: ReportStatus | undefined;
    patientId?: string | undefined;
    studyId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    reportType?: ReportType | undefined;
    signedById?: string | undefined;
    hasCriticalFindings?: boolean | undefined;
}, {
    status?: ReportStatus | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "status" | "createdAt" | "reportType" | "signedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    patientId?: string | undefined;
    studyId?: string | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    reportType?: ReportType | undefined;
    signedById?: string | undefined;
    hasCriticalFindings?: boolean | undefined;
}>;
export type QueryImagingReportsDto = z.infer<typeof QueryImagingReportsDtoSchema>;
export declare const ImagingStudyResponseSchema: z.ZodObject<{
    id: z.ZodString;
    patientId: z.ZodString;
    modality: z.ZodNativeEnum<typeof ImagingModality>;
    region: z.ZodNativeEnum<typeof ImagingRegion>;
    toothNumbers: z.ZodOptional<z.ZodEffects<z.ZodArray<z.ZodNumber, "many">, number[], number[]>>;
    studyDate: z.ZodString;
    description: z.ZodString;
    clinicalNotes: z.ZodOptional<z.ZodString>;
    referringProviderId: z.ZodString;
    appointmentId: z.ZodOptional<z.ZodString>;
    procedureId: z.ZodOptional<z.ZodString>;
    urgency: z.ZodEnum<["ROUTINE", "URGENT", "STAT"]>;
    status: z.ZodNativeEnum<typeof ImagingStudyStatus>;
    completedAt: z.ZodOptional<z.ZodString>;
    fileCount: z.ZodDefault<z.ZodNumber>;
    hasAIAnalysis: z.ZodDefault<z.ZodBoolean>;
    hasReport: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodString;
    updatedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: ImagingStudyStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    updatedBy: string;
    createdBy: string;
    referringProviderId: string;
    urgency: "URGENT" | "ROUTINE" | "STAT";
    fileCount: number;
    hasAIAnalysis: boolean;
    hasReport: boolean;
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
}, {
    status: ImagingStudyStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    region: ImagingRegion;
    patientId: string;
    modality: ImagingModality;
    studyDate: string;
    updatedBy: string;
    createdBy: string;
    referringProviderId: string;
    urgency: "URGENT" | "ROUTINE" | "STAT";
    appointmentId?: string | undefined;
    toothNumbers?: number[] | undefined;
    procedureId?: string | undefined;
    completedAt?: string | undefined;
    clinicalNotes?: string | undefined;
    fileCount?: number | undefined;
    hasAIAnalysis?: boolean | undefined;
    hasReport?: boolean | undefined;
}>;
export type ImagingStudyResponse = z.infer<typeof ImagingStudyResponseSchema>;
export declare const ImagingReportResponseSchema: z.ZodObject<{
    id: z.ZodString;
    studyId: z.ZodString;
    reportType: z.ZodNativeEnum<typeof ReportType>;
    findings: z.ZodString;
    impression: z.ZodString;
    recommendations: z.ZodOptional<z.ZodString>;
    technique: z.ZodOptional<z.ZodString>;
    comparison: z.ZodOptional<z.ZodString>;
    clinicalHistory: z.ZodOptional<z.ZodString>;
    signedById: z.ZodOptional<z.ZodString>;
    signedAt: z.ZodOptional<z.ZodString>;
    status: z.ZodNativeEnum<typeof ReportStatus>;
    criticalFindings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    amendmentReason: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodString;
    updatedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: ReportStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    studyId: string;
    updatedBy: string;
    createdBy: string;
    findings: string;
    reportType: ReportType;
    impression: string;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}, {
    status: ReportStatus;
    id: string;
    createdAt: string;
    updatedAt: string;
    studyId: string;
    updatedBy: string;
    createdBy: string;
    findings: string;
    reportType: ReportType;
    impression: string;
    metadata?: Record<string, unknown> | undefined;
    recommendations?: string | undefined;
    technique?: string | undefined;
    comparison?: string | undefined;
    clinicalHistory?: string | undefined;
    signedById?: string | undefined;
    signedAt?: string | undefined;
    criticalFindings?: string[] | undefined;
    amendmentReason?: string | undefined;
}>;
export type ImagingReportResponse = z.infer<typeof ImagingReportResponseSchema>;
