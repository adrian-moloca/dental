import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema } from '../common.schemas';

export const OutgoingWebhookRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  eventType: z.enum([
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
  payload: z.any(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type OutgoingWebhookRequest = z.infer<typeof OutgoingWebhookRequestSchema>;

export const IncomingWebhookEventSchema = z.object({
  webhookId: NonEmptyStringSchema,
  provider: NonEmptyStringSchema.max(100),
  eventType: NonEmptyStringSchema.max(200),
  payload: z.any(),
  signature: NonEmptyStringSchema,
  receivedAt: z.string().datetime(),
});

export type IncomingWebhookEvent = z.infer<typeof IncomingWebhookEventSchema>;

export const GetWebhookDeliveryLogsSchema = z.object({
  webhookId: NonEmptyStringSchema,
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type GetWebhookDeliveryLogs = z.infer<typeof GetWebhookDeliveryLogsSchema>;

export const GetWebhookConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetWebhookConfig = z.infer<typeof GetWebhookConfigSchema>;

export const CreateWebhookConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  direction: z.enum(['OUTGOING', 'INCOMING']),
  targetUrl: z.string().url().optional(),
  secret: NonEmptyStringSchema.min(32).max(200),
  eventTypes: z.array(z.enum([
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
  headers: z.record(z.string()).optional(),
  maxRetries: z.number().int().min(0).max(10),
  retryDelayMs: z.number().int().positive(),
  backoffMultiplier: z.number().positive().max(5),
  isEnabled: z.boolean(),
});

export type CreateWebhookConfig = z.infer<typeof CreateWebhookConfigSchema>;

export const UpdateWebhookConfigSchema = CreateWebhookConfigSchema.omit({
  tenantId: true,
  organizationId: true,
  clinicId: true,
}).partial();

export type UpdateWebhookConfig = z.infer<typeof UpdateWebhookConfigSchema>;
