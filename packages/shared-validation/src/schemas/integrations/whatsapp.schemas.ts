import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema } from '../common.schemas';

export const WhatsAppTemplateParameterSchema = z.object({
  type: z.enum(['text', 'currency', 'date_time']),
  text: z.string().optional(),
  currency: z.object({
    fallback_value: NonEmptyStringSchema,
    code: z.string().length(3),
    amount_1000: z.number().int(),
  }).optional(),
  date_time: z.object({
    fallback_value: NonEmptyStringSchema,
  }).optional(),
});

export const SendWhatsAppMessageRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  messageType: z.enum(['TEXT', 'TEMPLATE', 'IMAGE', 'DOCUMENT']),
  templateName: NonEmptyStringSchema.max(200).optional(),
  templateLanguage: z.string().length(2).optional(),
  templateParameters: z.array(WhatsAppTemplateParameterSchema).optional(),
  textMessage: NonEmptyStringSchema.max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type SendWhatsAppMessageRequest = z.infer<typeof SendWhatsAppMessageRequestSchema>;

export const GetWhatsAppTemplatesSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetWhatsAppTemplates = z.infer<typeof GetWhatsAppTemplatesSchema>;

export const GetWhatsAppConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetWhatsAppConfig = z.infer<typeof GetWhatsAppConfigSchema>;

export const UpdateWhatsAppProviderConfigSchema = z.object({
  phoneNumberId: NonEmptyStringSchema.max(200),
  businessAccountId: NonEmptyStringSchema.max(200),
  apiVersion: NonEmptyStringSchema.max(20),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
});

export type UpdateWhatsAppProviderConfig = z.infer<typeof UpdateWhatsAppProviderConfigSchema>;
