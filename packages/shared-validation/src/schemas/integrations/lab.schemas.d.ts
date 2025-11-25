import { z } from 'zod';
export declare const LabCasePatientSchema: z.ZodObject<{
    patientId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    dateOfBirth: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
}, "strip", z.ZodTypeAny, {
    firstName: string;
    lastName: string;
    patientId: string;
    dateOfBirth?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
}, {
    firstName: string;
    lastName: string;
    patientId: string;
    dateOfBirth?: string | undefined;
    gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
}>;
export declare const LabCaseItemSchema: z.ZodObject<{
    toothNumber: z.ZodOptional<z.ZodString>;
    shade: z.ZodOptional<z.ZodString>;
    material: z.ZodOptional<z.ZodString>;
    instructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    toothNumber?: string | undefined;
    shade?: string | undefined;
    material?: string | undefined;
    instructions?: string | undefined;
}, {
    toothNumber?: string | undefined;
    shade?: string | undefined;
    material?: string | undefined;
    instructions?: string | undefined;
}>;
export declare const LabShippingAddressSchema: z.ZodObject<{
    street: z.ZodString;
    city: z.ZodString;
    state: z.ZodString;
    postalCode: z.ZodString;
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}, {
    state: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
}>;
export declare const SendLabCaseRequestSchema: z.ZodObject<{
    tenantId: z.ZodString;
    organizationId: z.ZodString;
    clinicId: z.ZodString;
    labType: z.ZodEnum<["ALIGNER", "CROWN_BRIDGE", "DENTURE", "IMPLANT", "ORTHODONTIC"]>;
    patient: z.ZodObject<{
        patientId: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        dateOfBirth: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodEnum<["MALE", "FEMALE", "OTHER"]>>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        patientId: string;
        dateOfBirth?: string | undefined;
        gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }, {
        firstName: string;
        lastName: string;
        patientId: string;
        dateOfBirth?: string | undefined;
        gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    }>;
    providerId: z.ZodString;
    providerName: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        toothNumber: z.ZodOptional<z.ZodString>;
        shade: z.ZodOptional<z.ZodString>;
        material: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        toothNumber?: string | undefined;
        shade?: string | undefined;
        material?: string | undefined;
        instructions?: string | undefined;
    }, {
        toothNumber?: string | undefined;
        shade?: string | undefined;
        material?: string | undefined;
        instructions?: string | undefined;
    }>, "many">;
    priority: z.ZodEnum<["STANDARD", "RUSH", "URGENT"]>;
    dueDate: z.ZodOptional<z.ZodString>;
    instructions: z.ZodOptional<z.ZodString>;
    digitalFilesUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    shippingAddress: z.ZodOptional<z.ZodObject<{
        street: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }, {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    }>>;
    correlationId: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    correlationId: string;
    organizationId: string;
    clinicId: string;
    tenantId: string;
    items: {
        toothNumber?: string | undefined;
        shade?: string | undefined;
        material?: string | undefined;
        instructions?: string | undefined;
    }[];
    priority: "URGENT" | "STANDARD" | "RUSH";
    labType: "IMPLANT" | "ORTHODONTIC" | "ALIGNER" | "CROWN_BRIDGE" | "DENTURE";
    patient: {
        firstName: string;
        lastName: string;
        patientId: string;
        dateOfBirth?: string | undefined;
        gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    };
    providerId: string;
    providerName: string;
    metadata?: Record<string, any> | undefined;
    dueDate?: string | undefined;
    instructions?: string | undefined;
    digitalFilesUrls?: string[] | undefined;
    shippingAddress?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
}, {
    correlationId: string;
    organizationId: string;
    clinicId: string;
    tenantId: string;
    items: {
        toothNumber?: string | undefined;
        shade?: string | undefined;
        material?: string | undefined;
        instructions?: string | undefined;
    }[];
    priority: "URGENT" | "STANDARD" | "RUSH";
    labType: "IMPLANT" | "ORTHODONTIC" | "ALIGNER" | "CROWN_BRIDGE" | "DENTURE";
    patient: {
        firstName: string;
        lastName: string;
        patientId: string;
        dateOfBirth?: string | undefined;
        gender?: "MALE" | "FEMALE" | "OTHER" | undefined;
    };
    providerId: string;
    providerName: string;
    metadata?: Record<string, any> | undefined;
    dueDate?: string | undefined;
    instructions?: string | undefined;
    digitalFilesUrls?: string[] | undefined;
    shippingAddress?: {
        state: string;
        street: string;
        city: string;
        postalCode: string;
        country: string;
    } | undefined;
}>;
export type SendLabCaseRequest = z.infer<typeof SendLabCaseRequestSchema>;
export declare const GetLabCaseStatusSchema: z.ZodObject<{
    externalCaseId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    externalCaseId: string;
}, {
    externalCaseId: string;
}>;
export type GetLabCaseStatus = z.infer<typeof GetLabCaseStatusSchema>;
export declare const CancelLabCaseSchema: z.ZodObject<{
    externalCaseId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    externalCaseId: string;
    reason?: string | undefined;
}, {
    externalCaseId: string;
    reason?: string | undefined;
}>;
export type CancelLabCase = z.infer<typeof CancelLabCaseSchema>;
export declare const GetLabConfigSchema: z.ZodObject<{
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
export type GetLabConfig = z.infer<typeof GetLabConfigSchema>;
export declare const UpdateLabProviderConfigSchema: z.ZodObject<{
    labName: z.ZodString;
    labType: z.ZodEnum<["ALIGNER", "CROWN_BRIDGE", "DENTURE", "IMPLANT", "ORTHODONTIC"]>;
    apiEndpoint: z.ZodString;
    supportsDigitalFiles: z.ZodBoolean;
    supportedFileFormats: z.ZodArray<z.ZodString, "many">;
    credentials: z.ZodRecord<z.ZodString, z.ZodString>;
    isEnabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    labType: "IMPLANT" | "ORTHODONTIC" | "ALIGNER" | "CROWN_BRIDGE" | "DENTURE";
    labName: string;
    apiEndpoint: string;
    supportsDigitalFiles: boolean;
    supportedFileFormats: string[];
}, {
    credentials: Record<string, string>;
    isEnabled: boolean;
    labType: "IMPLANT" | "ORTHODONTIC" | "ALIGNER" | "CROWN_BRIDGE" | "DENTURE";
    labName: string;
    apiEndpoint: string;
    supportsDigitalFiles: boolean;
    supportedFileFormats: string[];
}>;
export type UpdateLabProviderConfig = z.infer<typeof UpdateLabProviderConfigSchema>;
