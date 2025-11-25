import { z } from 'zod';
export declare const DicomQueryRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    queryLevel: z.ZodEnum<["PATIENT", "STUDY", "SERIES", "INSTANCE"]>;
    patientId: z.ZodOptional<z.ZodString>;
    studyInstanceUID: z.ZodOptional<z.ZodString>;
    seriesInstanceUID: z.ZodOptional<z.ZodString>;
    modality: z.ZodOptional<z.ZodEnum<["CR", "CT", "MR", "US", "XA", "DX", "IO", "PX"]>>;
    studyDate: z.ZodOptional<z.ZodString>;
    accessionNumber: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    queryLevel: "PATIENT" | "STUDY" | "SERIES" | "INSTANCE";
    clinicId?: string | undefined;
    patientId?: string | undefined;
    studyInstanceUID?: string | undefined;
    seriesInstanceUID?: string | undefined;
    modality?: "CR" | "CT" | "MR" | "US" | "XA" | "DX" | "IO" | "PX" | undefined;
    studyDate?: string | undefined;
    accessionNumber?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    queryLevel: "PATIENT" | "STUDY" | "SERIES" | "INSTANCE";
    clinicId?: string | undefined;
    patientId?: string | undefined;
    studyInstanceUID?: string | undefined;
    seriesInstanceUID?: string | undefined;
    modality?: "CR" | "CT" | "MR" | "US" | "XA" | "DX" | "IO" | "PX" | undefined;
    studyDate?: string | undefined;
    accessionNumber?: string | undefined;
}>;
export type DicomQueryRequest = z.infer<typeof DicomQueryRequestSchema>;
export declare const DicomRetrieveRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    studyInstanceUID: z.ZodString;
    seriesInstanceUID: z.ZodOptional<z.ZodString>;
    sopInstanceUID: z.ZodOptional<z.ZodString>;
    transferSyntax: z.ZodOptional<z.ZodString>;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    studyInstanceUID: string;
    clinicId?: string | undefined;
    seriesInstanceUID?: string | undefined;
    sopInstanceUID?: string | undefined;
    transferSyntax?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    studyInstanceUID: string;
    clinicId?: string | undefined;
    seriesInstanceUID?: string | undefined;
    sopInstanceUID?: string | undefined;
    transferSyntax?: string | undefined;
}>;
export type DicomRetrieveRequest = z.infer<typeof DicomRetrieveRequestSchema>;
export declare const DicomStoreRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    dicomFile: z.ZodType<Buffer<ArrayBufferLike>, z.ZodTypeDef, Buffer<ArrayBufferLike>>;
    studyInstanceUID: z.ZodString;
    seriesInstanceUID: z.ZodString;
    sopInstanceUID: z.ZodString;
    correlationId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    studyInstanceUID: string;
    seriesInstanceUID: string;
    sopInstanceUID: string;
    dicomFile: Buffer<ArrayBufferLike>;
    clinicId?: string | undefined;
}, {
    correlationId: string;
    organizationId: string;
    tenantId: string;
    studyInstanceUID: string;
    seriesInstanceUID: string;
    sopInstanceUID: string;
    dicomFile: Buffer<ArrayBufferLike>;
    clinicId?: string | undefined;
}>;
export type DicomStoreRequest = z.infer<typeof DicomStoreRequestSchema>;
export declare const GetDicomConfigSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    organizationId: string;
    tenantId: string;
    clinicId?: string | undefined;
}, {
    organizationId: string;
    tenantId: string;
    clinicId?: string | undefined;
}>;
export type GetDicomConfig = z.infer<typeof GetDicomConfigSchema>;
export declare const UpdateDicomProviderConfigSchema: z.ZodObject<{
    pacsUrl: z.ZodString;
    wadoUrl: z.ZodString;
    qidoUrl: z.ZodString;
    stowUrl: z.ZodString;
    aeTitle: z.ZodString;
    supportsCompression: z.ZodBoolean;
    supportedModalities: z.ZodArray<z.ZodEnum<["CR", "CT", "MR", "US", "XA", "DX", "IO", "PX"]>, "many">;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    pacsUrl: string;
    wadoUrl: string;
    qidoUrl: string;
    stowUrl: string;
    aeTitle: string;
    supportsCompression: boolean;
    supportedModalities: ("CR" | "CT" | "MR" | "US" | "XA" | "DX" | "IO" | "PX")[];
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    pacsUrl: string;
    wadoUrl: string;
    qidoUrl: string;
    stowUrl: string;
    aeTitle: string;
    supportsCompression: boolean;
    supportedModalities: ("CR" | "CT" | "MR" | "US" | "XA" | "DX" | "IO" | "PX")[];
}>;
export type UpdateDicomProviderConfig = z.infer<typeof UpdateDicomProviderConfigSchema>;
