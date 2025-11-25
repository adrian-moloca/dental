"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDicomProviderConfigSchema = exports.GetDicomConfigSchema = exports.DicomStoreRequestSchema = exports.DicomRetrieveRequestSchema = exports.DicomQueryRequestSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.DicomQueryRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    queryLevel: zod_1.z.enum(['PATIENT', 'STUDY', 'SERIES', 'INSTANCE']),
    patientId: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    studyInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    seriesInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    modality: zod_1.z.enum(['CR', 'CT', 'MR', 'US', 'XA', 'DX', 'IO', 'PX']).optional(),
    studyDate: common_schemas_1.ISODateStringSchema.optional(),
    accessionNumber: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    correlationId: common_schemas_1.UUIDSchema,
});
exports.DicomRetrieveRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    studyInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200),
    seriesInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    sopInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    transferSyntax: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    correlationId: common_schemas_1.UUIDSchema,
});
exports.DicomStoreRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    dicomFile: zod_1.z.instanceof(Buffer),
    studyInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200),
    seriesInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200),
    sopInstanceUID: common_schemas_1.NonEmptyStringSchema.max(200),
    correlationId: common_schemas_1.UUIDSchema,
});
exports.GetDicomConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateDicomProviderConfigSchema = zod_1.z.object({
    pacsUrl: zod_1.z.string().url(),
    wadoUrl: zod_1.z.string().url(),
    qidoUrl: zod_1.z.string().url(),
    stowUrl: zod_1.z.string().url(),
    aeTitle: common_schemas_1.NonEmptyStringSchema.max(100),
    supportsCompression: zod_1.z.boolean(),
    supportedModalities: zod_1.z.array(zod_1.z.enum(['CR', 'CT', 'MR', 'US', 'XA', 'DX', 'IO', 'PX'])).min(1),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=dicom.schemas.js.map