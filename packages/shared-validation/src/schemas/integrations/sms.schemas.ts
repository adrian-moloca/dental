import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema } from '../common.schemas';

export const SendSmsRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  message: NonEmptyStringSchema.max(1600),
  fromNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type SendSmsRequest = z.infer<typeof SendSmsRequestSchema>;

export const GetSmsConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetSmsConfig = z.infer<typeof GetSmsConfigSchema>;

export const UpdateSmsProviderConfigSchema = z.object({
  provider: z.enum(['TWILIO', 'NEXMO']),
  fromNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  enableDeliveryReports: z.boolean(),
  maxMessageLength: z.number().int().positive().max(1600),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
  fallbackProviderId: UUIDSchema.optional(),
});

export type UpdateSmsProviderConfig = z.infer<typeof UpdateSmsProviderConfigSchema>;
