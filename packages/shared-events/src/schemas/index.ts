/**
 * Schemas Module
 *
 * Exports Zod validation schemas for event envelopes and metadata.
 *
 * @module shared-events/schemas
 */

export {
  EventMetadataSchema,
  TenantContextSchema,
  EventEnvelopeSchema,
  BaseEventEnvelopeSchema,
  EventMetadataSchemaType,
  TenantContextSchemaType,
  BaseEventEnvelopeSchemaType,
} from './event-envelope.schema';
