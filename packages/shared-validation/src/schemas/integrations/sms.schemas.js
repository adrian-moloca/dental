"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSmsProviderConfigSchema = exports.GetSmsConfigSchema = exports.SendSmsRequestSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.SendSmsRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    to: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
    message: common_schemas_1.NonEmptyStringSchema.max(1600),
    fromNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.GetSmsConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateSmsProviderConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['TWILIO', 'NEXMO']),
    fromNumber: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/),
    enableDeliveryReports: zod_1.z.boolean(),
    maxMessageLength: zod_1.z.number().int().positive().max(1600),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
    fallbackProviderId: common_schemas_1.UUIDSchema.optional(),
});
//# sourceMappingURL=sms.schemas.js.map