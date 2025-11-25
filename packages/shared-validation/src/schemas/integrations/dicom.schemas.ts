import { z } from 'zod';
import { UUIDSchema, NonEmptyStringSchema, ISODateStringSchema } from '../common.schemas';

export const DicomQueryRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  queryLevel: z.enum(['PATIENT', 'STUDY', 'SERIES', 'INSTANCE']),
  patientId: NonEmptyStringSchema.max(200).optional(),
  studyInstanceUID: NonEmptyStringSchema.max(200).optional(),
  seriesInstanceUID: NonEmptyStringSchema.max(200).optional(),
  modality: z.enum(['CR', 'CT', 'MR', 'US', 'XA', 'DX', 'IO', 'PX']).optional(),
  studyDate: ISODateStringSchema.optional(),
  accessionNumber: NonEmptyStringSchema.max(200).optional(),
  correlationId: UUIDSchema,
});

export type DicomQueryRequest = z.infer<typeof DicomQueryRequestSchema>;

export const DicomRetrieveRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  studyInstanceUID: NonEmptyStringSchema.max(200),
  seriesInstanceUID: NonEmptyStringSchema.max(200).optional(),
  sopInstanceUID: NonEmptyStringSchema.max(200).optional(),
  transferSyntax: NonEmptyStringSchema.max(200).optional(),
  correlationId: UUIDSchema,
});

export type DicomRetrieveRequest = z.infer<typeof DicomRetrieveRequestSchema>;

export const DicomStoreRequestSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
  dicomFile: z.instanceof(Buffer),
  studyInstanceUID: NonEmptyStringSchema.max(200),
  seriesInstanceUID: NonEmptyStringSchema.max(200),
  sopInstanceUID: NonEmptyStringSchema.max(200),
  correlationId: UUIDSchema,
});

export type DicomStoreRequest = z.infer<typeof DicomStoreRequestSchema>;

export const GetDicomConfigSchema = z.object({
  tenantId: UUIDSchema,
  organizationId: UUIDSchema,
  clinicId: UUIDSchema.optional(),
});

export type GetDicomConfig = z.infer<typeof GetDicomConfigSchema>;

export const UpdateDicomProviderConfigSchema = z.object({
  pacsUrl: z.string().url(),
  wadoUrl: z.string().url(),
  qidoUrl: z.string().url(),
  stowUrl: z.string().url(),
  aeTitle: NonEmptyStringSchema.max(100),
  supportsCompression: z.boolean(),
  supportedModalities: z.array(z.enum(['CR', 'CT', 'MR', 'US', 'XA', 'DX', 'IO', 'PX'])).min(1),
  credentials: z.record(z.string()),
  isEnabled: z.boolean(),
});

export type UpdateDicomProviderConfig = z.infer<typeof UpdateDicomProviderConfigSchema>;
