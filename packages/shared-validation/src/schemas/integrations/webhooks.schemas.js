"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWebhookConfigSchema = exports.CreateWebhookConfigSchema = exports.GetWebhookConfigSchema = exports.GetWebhookDeliveryLogsSchema = exports.IncomingWebhookEventSchema = exports.OutgoingWebhookRequestSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.OutgoingWebhookRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    eventType: zod_1.z.enum([
        'appointment.booked',
        'appointment.canceled',
        'patient.created',
        'invoice.issued',
        'payment.received',
        'treatment.completed',
        'lab_case.submitted',
        'imaging_study.completed',
        'custom',
    ]),
    payload: zod_1.z.any(),
    correlationId: common_schemas_1.UUIDSchema,
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.IncomingWebhookEventSchema = zod_1.z.object({
    webhookId: common_schemas_1.NonEmptyStringSchema,
    provider: common_schemas_1.NonEmptyStringSchema.max(100),
    eventType: common_schemas_1.NonEmptyStringSchema.max(200),
    payload: zod_1.z.any(),
    signature: common_schemas_1.NonEmptyStringSchema,
    receivedAt: zod_1.z.string().datetime(),
});
exports.GetWebhookDeliveryLogsSchema = zod_1.z.object({
    webhookId: common_schemas_1.NonEmptyStringSchema,
    limit: zod_1.z.number().int().positive().max(100).default(20),
    offset: zod_1.z.number().int().nonnegative().default(0),
});
exports.GetWebhookConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.CreateWebhookConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    direction: zod_1.z.enum(['OUTGOING', 'INCOMING']),
    targetUrl: zod_1.z.string().url().optional(),
    secret: common_schemas_1.NonEmptyStringSchema.min(32).max(200),
    eventTypes: zod_1.z.array(zod_1.z.enum([
        'appointment.booked',
        'appointment.canceled',
        'patient.created',
        'invoice.issued',
        'payment.received',
        'treatment.completed',
        'lab_case.submitted',
        'imaging_study.completed',
        'custom',
    ])).min(1),
    headers: zod_1.z.record(zod_1.z.string()).optional(),
    maxRetries: zod_1.z.number().int().min(0).max(10),
    retryDelayMs: zod_1.z.number().int().positive(),
    backoffMultiplier: zod_1.z.number().positive().max(5),
    isEnabled: zod_1.z.boolean(),
});
exports.UpdateWebhookConfigSchema = exports.CreateWebhookConfigSchema.omit({
    tenantId: true,
    organizationId: true,
    clinicId: true,
}).partial();
//# sourceMappingURL=webhooks.schemas.js.map