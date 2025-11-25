import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema, ISODateStringSchema } from '../common.schemas';

export const EFacturaAddressSchema = z.object({
  street: NonEmptyStringSchema.max(200),
  city: NonEmptyStringSchema.max(100),
  county: NonEmptyStringSchema.max(100),
  postalCode: NonEmptyStringSchema.max(20),
  country: NonEmptyStringSchema.max(100),
});

export const EFacturaPartySchema = z.object({
  cui: NonEmptyStringSchema.max(50),
  name: NonEmptyStringSchema.max(200),
  registrationNumber: NonEmptyStringSchema.max(100).optional(),
  address: EFacturaAddressSchema,
  email: z.string().email().optional(),
  phone: NonEmptyStringSchema.max(50).optional(),
  bankAccount: NonEmptyStringSchema.max(100).optional(),
  bankName: NonEmptyStringSchema.max(200).optional(),
});

export const EFacturaLineItemSchema = z.object({
  lineNumber: z.number().int().positive(),
  itemCode: NonEmptyStringSchema.max(100).optional(),
  itemName: NonEmptyStringSchema.max(500),
  quantity: z.number().positive(),
  unitOfMeasure: NonEmptyStringSchema.max(50),
  unitPrice: z.number().nonnegative(),
  vatRate: z.number().min(0).max(100),
  vatAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  discountAmount: z.number().nonnegative().optional(),
});

export const SubmitEFacturaRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  documentType: z.enum(['INVOICE', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  invoiceNumber: NonEmptyStringSchema.max(100),
  invoiceDate: ISODateStringSchema,
  dueDate: ISODateStringSchema.optional(),
  supplier: EFacturaPartySchema,
  customer: EFacturaPartySchema,
  lineItems: z.array(EFacturaLineItemSchema).min(1),
  totalAmountWithoutVat: z.number().nonnegative(),
  totalVatAmount: z.number().nonnegative(),
  totalAmount: z.number().nonnegative(),
  currency: z.string().length(3),
  paymentMethod: NonEmptyStringSchema.max(100).optional(),
  notes: z.string().max(1000).optional(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type SubmitEFacturaRequest = z.infer<typeof SubmitEFacturaRequestSchema>;

export const GetEFacturaStatusSchema = z.object({
  submissionId: NonEmptyStringSchema,
});

export type GetEFacturaStatus = z.infer<typeof GetEFacturaStatusSchema>;

export const CancelEFacturaSchema = z.object({
  submissionId: NonEmptyStringSchema,
  reason: NonEmptyStringSchema.max(500),
});

export type CancelEFactura = z.infer<typeof CancelEFacturaSchema>;

export const DownloadEFacturaXmlSchema = z.object({
  downloadId: NonEmptyStringSchema,
});

export type DownloadEFacturaXml = z.infer<typeof DownloadEFacturaXmlSchema>;

export const GetEFacturaConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetEFacturaConfig = z.infer<typeof GetEFacturaConfigSchema>;

export const UpdateEFacturaProviderConfigSchema = z.object({
  anafUrl: z.string().url(),
  cui: NonEmptyStringSchema.max(50),
  certificatePath: NonEmptyStringSchema.optional(),
  testMode: z.boolean(),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
});

export type UpdateEFacturaProviderConfig = z.infer<typeof UpdateEFacturaProviderConfigSchema>;
