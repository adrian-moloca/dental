"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWhatsAppProviderConfigSchema = exports.GetWhatsAppConfigSchema = exports.GetWhatsAppTemplatesSchema = exports.SendWhatsAppMessageRequestSchema = exports.WhatsAppTemplateParameterSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.WhatsAppTemplateParameterSchema = zod_1.z.object({
    type: zod_1.z.enum(['text', 'currency', 'date_time']),
    text: zod_1.z.string().optional(),
    currency: zod_1.z.object({
        fallback_value: common_schemas_1.NonEmptyStringSchema,
        code: zod_1.z.string().length(3),
        amount_1000: zod_1.z.number().int(),
    }).optional(),
    date_time: zod_1.z.object({
        fallback_value: common_schemas_1.NonEmptyStringSchema,
    }).optional(),
});
exports.SendWhatsAppMessageRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    to: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
    messageType: zod_1.z.enum(['TEXT', 'TEMPLATE', 'IMAGE', 'DOCUMENT']),
    templateName: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    templateLanguage: zod_1.z.string().length(2).optional(),
    templateParameters: zod_1.z.array(exports.WhatsAppTemplateParameterSchema).optional(),
    textMessage: common_schemas_1.NonEmptyStringSchema.max(4096).optional(),
    mediaUrl: zod_1.z.string().url().optional(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.GetWhatsAppTemplatesSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.GetWhatsAppConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateWhatsAppProviderConfigSchema = zod_1.z.object({
    phoneNumberId: common_schemas_1.NonEmptyStringSchema.max(200),
    businessAccountId: common_schemas_1.NonEmptyStringSchema.max(200),
    apiVersion: common_schemas_1.NonEmptyStringSchema.max(20),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=whatsapp.schemas.js.map