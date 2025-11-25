import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema, ISODateStringSchema } from '../common.schemas';

export const LabCasePatientSchema = z.object({
  patientId: UUIDSchema,
  firstName: NonEmptyStringSchema.max(100),
  lastName: NonEmptyStringSchema.max(100),
  dateOfBirth: ISODateStringSchema.optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
});

export const LabCaseItemSchema = z.object({
  toothNumber: NonEmptyStringSchema.max(10).optional(),
  shade: NonEmptyStringSchema.max(50).optional(),
  material: NonEmptyStringSchema.max(100).optional(),
  instructions: z.string().max(1000).optional(),
});

export const LabShippingAddressSchema = z.object({
  street: NonEmptyStringSchema.max(200),
  city: NonEmptyStringSchema.max(100),
  state: NonEmptyStringSchema.max(100),
  postalCode: NonEmptyStringSchema.max(20),
  country: NonEmptyStringSchema.max(100),
});

export const SendLabCaseRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema,
  labType: z.enum(['ALIGNER', 'CROWN_BRIDGE', 'DENTURE', 'IMPLANT', 'ORTHODONTIC']),
  patient: LabCasePatientSchema,
  providerId: UUIDSchema,
  providerName: NonEmptyStringSchema.max(200),
  items: z.array(LabCaseItemSchema).min(1).max(50),
  priority: z.enum(['STANDARD', 'RUSH', 'URGENT']),
  dueDate: ISODateStringSchema.optional(),
  instructions: z.string().max(2000).optional(),
  digitalFilesUrls: z.array(z.string().url()).max(20).optional(),
  shippingAddress: LabShippingAddressSchema.optional(),
  correlationId: UUIDSchema,
  metadata: z.record(z.any()).optional(),
});

export type SendLabCaseRequest = z.infer<typeof SendLabCaseRequestSchema>;

export const GetLabCaseStatusSchema = z.object({
  externalCaseId: NonEmptyStringSchema,
});

export type GetLabCaseStatus = z.infer<typeof GetLabCaseStatusSchema>;

export const CancelLabCaseSchema = z.object({
  externalCaseId: NonEmptyStringSchema,
  reason: NonEmptyStringSchema.max(500).optional(),
});

export type CancelLabCase = z.infer<typeof CancelLabCaseSchema>;

export const GetLabConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetLabConfig = z.infer<typeof GetLabConfigSchema>;

export const UpdateLabProviderConfigSchema = z.object({
  labName: NonEmptyStringSchema.max(200),
  labType: z.enum(['ALIGNER', 'CROWN_BRIDGE', 'DENTURE', 'IMPLANT', 'ORTHODONTIC']),
  apiEndpoint: z.string().url(),
  supportsDigitalFiles: z.boolean(),
  supportedFileFormats: z.array(NonEmptyStringSchema.max(50)),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
});

export type UpdateLabProviderConfig = z.infer<typeof UpdateLabProviderConfigSchema>;
