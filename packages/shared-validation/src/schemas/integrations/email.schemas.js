"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEmailProviderConfigSchema = exports.GetEmailConfigSchema = exports.SendEmailRequestSchema = exports.EmailAttachmentSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.EmailAttachmentSchema = zod_1.z.object({
    filename: common_schemas_1.NonEmptyStringSchema.max(255),
    content: zod_1.z.union([zod_1.z.string(), zod_1.z.instanceof(Buffer)]),
    contentType: common_schemas_1.NonEmptyStringSchema,
    encoding: zod_1.z.string().optional(),
});
exports.SendEmailRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    to: zod_1.z.array(zod_1.z.string().email()).min(1).max(50),
    cc: zod_1.z.array(zod_1.z.string().email()).max(50).optional(),
    bcc: zod_1.z.array(zod_1.z.string().email()).max(50).optional(),
    subject: common_schemas_1.NonEmptyStringSchema.max(500),
    htmlBody: common_schemas_1.NonEmptyStringSchema,
    textBody: zod_1.z.string().optional(),
    fromEmail: zod_1.z.string().email().optional(),
    fromName: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    replyTo: zod_1.z.string().email().optional(),
    attachments: zod_1.z.array(exports.EmailAttachmentSchema).max(10).optional(),
    templateId: common_schemas_1.UUIDSchema.optional(),
    templateData: zod_1.z.record(zod_1.z.any()).optional(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.GetEmailConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdateEmailProviderConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['SENDGRID', 'SMTP']),
    fromEmail: zod_1.z.string().email(),
    fromName: common_schemas_1.NonEmptyStringSchema.max(200),
    replyToEmail: zod_1.z.string().email().optional(),
    enableTracking: zod_1.z.boolean(),
    enableClickTracking: zod_1.z.boolean(),
    smtpHost: zod_1.z.string().optional(),
    smtpPort: zod_1.z.number().int().positive().optional(),
    smtpSecure: zod_1.z.boolean().optional(),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
    fallbackProviderId: common_schemas_1.UUIDSchema.optional(),
});
//# sourceMappingURL=email.schemas.js.map