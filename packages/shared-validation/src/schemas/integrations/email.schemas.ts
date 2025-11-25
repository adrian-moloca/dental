import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema } from '../common.schemas';

export const EmailAttachmentSchema = z.object({
  filename: NonEmptyStringSchema.max(255),
  content: z.union([z.string(), z.instanceof(Buffer)]),
  contentType: NonEmptyStringSchema,
  encoding: z.string().optional(),
});

export const SendEmailRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  to: z.array(z.string().email()).min(1).max(50),
  cc: z.array(z.string().email()).max(50).optional(),
  bcc: z.array(z.string().email()).max(50).optional(),
  subject: NonEmptyStringSchema.max(500),
  htmlBody: NonEmptyStringSchema,
  textBody: z.string().optional(),
  fromEmail: z.string().email().optional(),
  fromName: NonEmptyStringSchema.max(200).optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(EmailAttachmentSchema).max(10).optional(),
  templateId: UUIDSchema.optional(),
  templateData: z.record(z.any()).optional(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type SendEmailRequest = z.infer<typeof SendEmailRequestSchema>;

export const GetEmailConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetEmailConfig = z.infer<typeof GetEmailConfigSchema>;

export const UpdateEmailProviderConfigSchema = z.object({
  provider: z.enum(['SENDGRID', 'SMTP']),
  fromEmail: z.string().email(),
  fromName: NonEmptyStringSchema.max(200),
  replyToEmail: z.string().email().optional(),
  enableTracking: z.boolean(),
  enableClickTracking: z.boolean(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().positive().optional(),
  smtpSecure: z.boolean().optional(),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
  fallbackProviderId: UUIDSchema.optional(),
});

export type UpdateEmailProviderConfig = z.infer<typeof UpdateEmailProviderConfigSchema>;
