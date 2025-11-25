"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentProviderConfigSchema = exports.GetPaymentConfigSchema = exports.StripeWebhookEventSchema = exports.RefundPaymentRequestSchema = exports.ConfirmPaymentRequestSchema = exports.CreatePaymentIntentRequestSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.CreatePaymentIntentRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    paymentMethod: zod_1.z.enum(['CARD', 'BANK_TRANSFER', 'CASH', 'SEPA_DEBIT']),
    customerId: common_schemas_1.UUIDSchema.optional(),
    description: common_schemas_1.NonEmptyStringSchema.max(500).optional(),
    invoiceId: common_schemas_1.UUIDSchema.optional(),
    patientId: common_schemas_1.UUIDSchema.optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    correlationId: common_schemas_1.UUIDSchema,
});
exports.ConfirmPaymentRequestSchema = zod_1.z.object({
    intentId: common_schemas_1.NonEmptyStringSchema,
    paymentMethodId: common_schemas_1.NonEmptyStringSchema.optional(),
    returnUrl: zod_1.z.string().url().optional(),
});
exports.RefundPaymentRequestSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    transactionId: common_schemas_1.NonEmptyStringSchema,
    amount: zod_1.z.number().positive().optional(),
    reason: common_schemas_1.NonEmptyStringSchema.max(500).optional(),
    correlationId: common_schemas_1.UUIDSchema,
});
exports.StripeWebhookEventSchema = zod_1.z.object({
    id: common_schemas_1.NonEmptyStringSchema,
    type: common_schemas_1.NonEmptyStringSchema,
    data: zod_1.z.any(),
    created: zod_1.z.number().int().positive(),
});
exports.GetPaymentConfigSchema = zod_1.z.object({
    tenantId: common_schemas_1.UUIDSchema,
    organizationId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
});
exports.UpdatePaymentProviderConfigSchema = zod_1.z.object({
    provider: zod_1.z.enum(['STRIPE', 'EUPLATESC', 'MOBILPAY']),
    merchantId: common_schemas_1.NonEmptyStringSchema.max(200),
    publicKey: common_schemas_1.NonEmptyStringSchema.optional(),
    webhookSecret: common_schemas_1.NonEmptyStringSchema,
    currency: zod_1.z.string().length(3),
    supportedPaymentMethods: zod_1.z.array(zod_1.z.enum(['CARD', 'BANK_TRANSFER', 'CASH', 'SEPA_DEBIT'])).min(1),
    credentials: zod_1.z.record(zod_1.z.string()),
    isEnabled: zod_1.z.boolean(),
});
//# sourceMappingURL=payments.schemas.js.map