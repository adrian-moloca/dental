"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEventEnvelopeSchema = exports.TenantContextSchema = exports.EventMetadataSchema = void 0;
exports.EventEnvelopeSchema = EventEnvelopeSchema;
const zod_1 = require("zod");
const shared_validation_1 = require("@dentalos/shared-validation");
exports.EventMetadataSchema = zod_1.z.object({
    correlationId: shared_validation_1.UUIDSchema.optional(),
    causationId: shared_validation_1.UUIDSchema.optional(),
    userId: shared_validation_1.UUIDSchema.optional(),
    userAgent: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().ip().optional(),
    organizationId: zod_1.z.string().min(1).optional(),
    clinicId: zod_1.z.string().min(1).optional(),
    tenantId: zod_1.z.string().min(1).optional(),
});
exports.TenantContextSchema = zod_1.z.object({
    organizationId: zod_1.z.string().min(1),
    clinicId: zod_1.z.string().min(1).optional(),
    tenantId: zod_1.z.string().min(1),
});
function EventEnvelopeSchema(payloadSchema) {
    return zod_1.z.object({
        id: shared_validation_1.UUIDSchema,
        type: zod_1.z
            .string()
            .min(1)
            .regex(/^[a-z]+\.[a-z]+\.[a-z]+$/, 'Event type must follow format: domain.entity.action'),
        version: zod_1.z.number().int().min(1),
        occurredAt: zod_1.z.coerce.date(),
        payload: payloadSchema,
        metadata: exports.EventMetadataSchema,
        tenantContext: exports.TenantContextSchema,
    });
}
exports.BaseEventEnvelopeSchema = EventEnvelopeSchema(zod_1.z.unknown());
//# sourceMappingURL=event-envelope.schema.js.map