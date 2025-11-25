"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLabProviderConfigSchema = exports.GetLabConfigSchema = exports.CancelLabCaseSchema = exports.GetLabCaseStatusSchema = exports.SendLabCaseRequestSchema = exports.LabShippingAddressSchema = exports.LabCaseItemSchema = exports.LabCasePatientSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.LabCasePatientSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    firstName: common_schemas_1.NonEmptyStringSchema.max(100),
    lastName: common_schemas_1.NonEmptyStringSchema.max(100),
    dateOfBirth: common_schemas_1.ISODateStringSchema.optional(),
    gender: zod_1.z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});
exports.LabCaseItemSchema = zod_1.z.object({
    toothNumber: common_schemas_1.NonEmptyStringSchema.max(10).optional(),
    shade: common_schemas_1.NonEmptyStringSchema.max(50).optional(),
    material: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    instructions: zod_1.z.string().max(1000).optional(),
});
exports.LabShippingAddressSchema = zod_1.z.object({
    street: common_schemas_1.NonEmptyStringSchema.max(200),
    city: common_schemas_1.NonEmptyStringSchema.max(100),
    state: common_schemas_1.NonEmptyStringSchema.max(100),
    postalCode: common_schemas_1.NonEmptyStringSchema.max(20),
    country: common_schemas_1.NonEmptyStringSchema.max(100),
});
exports.SendLabCaseRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema,
    labType: zod_1.z.enum(['ALIGNER', 'CROWN_BRIDGE', 'DENTURE', 'IMPLANT', 'ORTHODONTIC']),
    patient: exports.LabCasePatientSchema,
    providerId: common_schemas_1.UUIDSchema,
    providerName: common_schemas_1.NonEmptyStringSchema.max(200),
    items: zod_1.z.array(exports.LabCaseItemSchema).min(1).max(50),
    priority: zod_1.z.enum(['STANDARD', 'RUSH', 'URGENT']),
    dueDate: common_schemas_1.ISODateStringSchema.optional(),
    instructions: zod_1.z.string().max(2000).optional(),
    digitalFilesUrls: zod_1.z.array(zod_1.z.string().url()).max(20).optional(),
    shippingAddress: exports.LabShippingAddressSchema.optional(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.GetLabCaseStatusSchema = zod_1.z.object({
    externalCaseId: common_schemas_1.NonEmptyStringSchema,
});
exports.CancelLabCaseSchema = zod_1.z.object({
    externalCaseId: common_schemas_1.NonEmptyStringSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500).optional(),
});
exports.GetLabConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateLabProviderConfigSchema = zod_1.z.object({
    labName: common_schemas_1.NonEmptyStringSchema.max(200),
    labType: zod_1.z.enum(['ALIGNER', 'CROWN_BRIDGE', 'DENTURE', 'IMPLANT', 'ORTHODONTIC']),
    apiEndpoint: zod_1.z.string().url(),
    supportsDigitalFiles: zod_1.z.boolean(),
    supportedFileFormats: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=lab.schemas.js.map