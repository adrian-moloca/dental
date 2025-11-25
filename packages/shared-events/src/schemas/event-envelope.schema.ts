/**
 * Event Envelope Validation Schemas
 *
 * Zod schemas for runtime validation of event envelopes and metadata.
 * These schemas ensure data integrity when deserializing events from
 * message brokers or external sources.
 *
 * @module shared-events/schemas
 */

import { z } from 'zod';
import { UUIDSchema } from '@dentalos/shared-validation';

/**
 * Schema for event metadata validation
 *
 * Validates the metadata structure including correlation IDs,
 * user context, and tenant information.
 */
export const EventMetadataSchema = z.object({
  correlationId: UUIDSchema.optional(),
  causationId: UUIDSchema.optional(),
  userId: UUIDSchema.optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
  organizationId: z.string().min(1).optional(),
  clinicId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
});

/**
 * Inferred TypeScript type from EventMetadataSchema
 */
export type EventMetadataSchemaType = z.infer<typeof EventMetadataSchema>;

/**
 * Schema for tenant context validation
 *
 * Ensures proper multi-tenant isolation by validating tenant identifiers.
 */
export const TenantContextSchema = z.object({
  organizationId: z.string().min(1),
  clinicId: z.string().min(1).optional(),
  tenantId: z.string().min(1),
});

/**
 * Inferred TypeScript type from TenantContextSchema
 */
export type TenantContextSchemaType = z.infer<typeof TenantContextSchema>;

/**
 * Generic schema factory for event envelope validation
 *
 * Creates a schema that validates the envelope structure and payload.
 * The payload schema is provided as a parameter to support type-safe
 * validation of different event types.
 *
 * @param payloadSchema - Zod schema for validating the event payload
 * @returns A Zod schema for the complete event envelope
 *
 * @example
 * ```typescript
 * const PatientCreatedPayloadSchema = z.object({
 *   patientId: UUIDSchema,
 *   firstName: z.string().min(1),
 *   lastName: z.string().min(1),
 *   email: z.string().email().optional(),
 * });
 *
 * const PatientCreatedEnvelopeSchema = EventEnvelopeSchema(
 *   PatientCreatedPayloadSchema
 * );
 *
 * const result = PatientCreatedEnvelopeSchema.safeParse(eventData);
 * if (result.success) {
 *   // event is valid
 *   const envelope = result.data;
 * }
 * ```
 */
export function EventEnvelopeSchema<T extends z.ZodTypeAny>(
  payloadSchema: T
): z.ZodObject<{
  id: typeof UUIDSchema;
  type: z.ZodString;
  version: z.ZodNumber;
  occurredAt: z.ZodDate;
  payload: T;
  metadata: typeof EventMetadataSchema;
  tenantContext: typeof TenantContextSchema;
}> {
  return z.object({
    id: UUIDSchema,
    type: z
      .string()
      .min(1)
      .regex(
        /^[a-z]+\.[a-z]+\.[a-z]+$/,
        'Event type must follow format: domain.entity.action'
      ),
    version: z.number().int().min(1),
    occurredAt: z.coerce.date(),
    payload: payloadSchema,
    metadata: EventMetadataSchema,
    tenantContext: TenantContextSchema,
  });
}

/**
 * Base event envelope schema with unknown payload
 *
 * Use this when the payload type is not known at validation time,
 * or for validating the envelope structure without payload validation.
 */
export const BaseEventEnvelopeSchema = EventEnvelopeSchema(z.unknown());

/**
 * Inferred TypeScript type from BaseEventEnvelopeSchema
 */
export type BaseEventEnvelopeSchemaType = z.infer<
  typeof BaseEventEnvelopeSchema
>;
