import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema } from '../common.schemas';

export const CreatePaymentIntentRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  paymentMethod: z.enum(['CARD', 'BANK_TRANSFER', 'CASH', 'SEPA_DEBIT']),
  customerId: UUIDSchema.optional(),
  description: NonEmptyStringSchema.max(500).optional(),
  invoiceId: UUIDSchema.optional(),
  patientId: UUIDSchema.optional(),
  metadata: z.record(z.any()).optional(),
  correlationId: UUIDSchema,
});

export type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentRequestSchema>;

export const ConfirmPaymentRequestSchema = z.object({
  intentId: NonEmptyStringSchema,
  paymentMethodId: NonEmptyStringSchema.optional(),
  returnUrl: z.string().url().optional(),
});

export type ConfirmPaymentRequest = z.infer<typeof ConfirmPaymentRequestSchema>;

export const RefundPaymentRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  transactionId: NonEmptyStringSchema,
  amount: z.number().positive().optional(),
  reason: NonEmptyStringSchema.max(500).optional(),
  correlationId: UUIDSchema,
});

export type RefundPaymentRequest = z.infer<typeof RefundPaymentRequestSchema>;

export const StripeWebhookEventSchema = z.object({
  id: NonEmptyStringSchema,
  type: NonEmptyStringSchema,
  data: z.any(),
  created: z.number().int().positive(),
});

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

export const GetPaymentConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetPaymentConfig = z.infer<typeof GetPaymentConfigSchema>;

export const UpdatePaymentProviderConfigSchema = z.object({
  provider: z.enum(['STRIPE', 'EUPLATESC', 'MOBILPAY']),
  merchantId: NonEmptyStringSchema.max(200),
  publicKey: NonEmptyStringSchema.optional(),
  webhookSecret: NonEmptyStringSchema,
  currency: z.string().length(3),
  supportedPaymentMethods: z.array(z.enum(['CARD', 'BANK_TRANSFER', 'CASH', 'SEPA_DEBIT'])).min(1),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
});

export type UpdatePaymentProviderConfig = z.infer<typeof UpdatePaymentProviderConfigSchema>;
