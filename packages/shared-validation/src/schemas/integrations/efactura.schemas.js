"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEFacturaProviderConfigSchema = exports.GetEFacturaConfigSchema = exports.DownloadEFacturaXmlSchema = exports.CancelEFacturaSchema = exports.GetEFacturaStatusSchema = exports.SubmitEFacturaRequestSchema = exports.EFacturaLineItemSchema = exports.EFacturaPartySchema = exports.EFacturaAddressSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.EFacturaAddressSchema = zod_1.z.object({
    street: common_schemas_1.NonEmptyStringSchema.max(200),
    city: common_schemas_1.NonEmptyStringSchema.max(100),
    county: common_schemas_1.NonEmptyStringSchema.max(100),
    postalCode: common_schemas_1.NonEmptyStringSchema.max(20),
    country: common_schemas_1.NonEmptyStringSchema.max(100),
});
exports.EFacturaPartySchema = zod_1.z.object({
    cui: common_schemas_1.NonEmptyStringSchema.max(50),
    name: common_schemas_1.NonEmptyStringSchema.max(200),
    registrationNumber: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    address: exports.EFacturaAddressSchema,
    email: zod_1.z.string().email().optional(),
    phone: common_schemas_1.NonEmptyStringSchema.max(50).optional(),
    bankAccount: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    bankName: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
});
exports.EFacturaLineItemSchema = zod_1.z.object({
    lineNumber: zod_1.z.number().int().positive(),
    itemCode: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    itemName: common_schemas_1.NonEmptyStringSchema.max(500),
    quantity: zod_1.z.number().positive(),
    unitOfMeasure: common_schemas_1.NonEmptyStringSchema.max(50),
    unitPrice: zod_1.z.number().nonnegative(),
    vatRate: zod_1.z.number().min(0).max(100),
    vatAmount: zod_1.z.number().nonnegative(),
    totalAmount: zod_1.z.number().nonnegative(),
    discountAmount: zod_1.z.number().nonnegative().optional(),
});
exports.SubmitEFacturaRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    documentType: zod_1.z.enum(['INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE']),
    invoiceNumber: common_schemas_1.NonEmptyStringSchema.max(100),
    invoiceDate: common_schemas_1.ISODateStringSchema,
    dueDate: common_schemas_1.ISODateStringSchema.optional(),
    supplier: exports.EFacturaPartySchema,
    customer: exports.EFacturaPartySchema,
    lineItems: zod_1.z.array(exports.EFacturaLineItemSchema).min(1),
    totalAmountWithoutVat: zod_1.z.number().nonnegative(),
    totalVatAmount: zod_1.z.number().nonnegative(),
    totalAmount: zod_1.z.number().nonnegative(),
    currency: zod_1.z.string().length(3),
    paymentMethod: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.GetEFacturaStatusSchema = zod_1.z.object({
    submissionId: common_schemas_1.NonEmptyStringSchema,
});
exports.CancelEFacturaSchema = zod_1.z.object({
    submissionId: common_schemas_1.NonEmptyStringSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(500),
});
exports.DownloadEFacturaXmlSchema = zod_1.z.object({
    downloadId: common_schemas_1.NonEmptyStringSchema,
});
exports.GetEFacturaConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateEFacturaProviderConfigSchema = zod_1.z.object({
    anafUrl: zod_1.z.string().url(),
    cui: common_schemas_1.NonEmptyStringSchema.max(50),
    certificatePath: common_schemas_1.NonEmptyStringSchema.optional(),
    testMode: zod_1.z.boolean(),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=efactura.schemas.js.map