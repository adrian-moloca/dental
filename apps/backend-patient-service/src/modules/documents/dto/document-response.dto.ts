/**
 * Document Response DTOs
 *
 * Defines response structures for document API endpoints.
 *
 * @module modules/documents/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DocumentCategory, DocumentSource } from '../entities';

/**
 * File information in response (sanitized - no storage keys)
 */
export class FileInfoResponse {
  @ApiProperty({ example: 'consent-form.pdf' })
  fileName!: string;

  @ApiProperty({ example: 102400 })
  fileSize!: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;

  @ApiPropertyOptional({ description: 'Pre-signed download URL (expires in 15 minutes)' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'Pre-signed thumbnail URL (expires in 15 minutes)' })
  thumbnailUrl?: string;
}

/**
 * Signature information in response
 */
export class SignatureResponse {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  signedBy!: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  signedAt!: Date;

  @ApiProperty({ example: 'electronic' })
  signatureMethod!: string;

  @ApiPropertyOptional()
  signerName?: string;

  @ApiPropertyOptional()
  signerRole?: string;
}

/**
 * Patient document response DTO
 *
 * This is the shape returned to clients - sensitive storage details are removed.
 */
export class PatientDocumentResponse {
  @ApiProperty({
    description: 'Unique document ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @ApiProperty({ description: 'Organization ID' })
  organizationId!: string;

  @ApiProperty({ description: 'Clinic ID' })
  clinicId!: string;

  @ApiProperty({ description: 'Patient ID' })
  patientId!: string;

  @ApiProperty({ description: 'Document title', example: 'Consent for Root Canal' })
  title!: string;

  @ApiPropertyOptional({ description: 'Document description' })
  description?: string;

  @ApiProperty({
    description: 'Document category',
    enum: [
      'consent',
      'anamnesis',
      'patient_form',
      'treatment_plan',
      'prescription',
      'referral',
      'lab_result',
      'imaging',
      'invoice',
      'insurance',
      'id_document',
      'other',
    ],
  })
  category!: DocumentCategory;

  @ApiProperty({ description: 'File information' })
  file!: FileInfoResponse;

  @ApiPropertyOptional({ description: 'Date on the document' })
  documentDate?: Date;

  @ApiPropertyOptional({ description: 'Expiry date' })
  expiryDate?: Date;

  @ApiProperty({
    description: 'Document source',
    enum: ['upload', 'generated', 'imported', 'scan'],
  })
  source!: DocumentSource;

  @ApiPropertyOptional({ description: 'Template ID if generated' })
  generatedFromTemplateId?: string;

  @ApiPropertyOptional({ description: 'Associated appointment ID' })
  appointmentId?: string;

  @ApiProperty({ description: 'Whether signature is required' })
  requiresSignature!: boolean;

  @ApiPropertyOptional({ description: 'Primary signature' })
  signature?: SignatureResponse;

  @ApiPropertyOptional({ description: 'Additional signatures', type: [SignatureResponse] })
  additionalSignatures?: SignatureResponse[];

  @ApiProperty({ description: 'Whether document is signed' })
  isSigned!: boolean;

  @ApiProperty({ description: 'Tags', type: [String] })
  tags!: string[];

  @ApiProperty({ description: 'User who uploaded' })
  uploadedBy!: string;

  @ApiProperty({ description: 'Upload timestamp' })
  uploadedAt!: Date;

  @ApiProperty({ description: 'Last updated' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'User who last updated' })
  updatedBy?: string;

  @ApiProperty({ description: 'Document version' })
  version!: number;
}

/**
 * Paginated documents response
 */
export class PaginatedDocumentsResponse {
  @ApiProperty({ type: [PatientDocumentResponse] })
  data!: PatientDocumentResponse[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  hasNext!: boolean;

  @ApiProperty()
  hasPrev!: boolean;
}

/**
 * Upload URL response for client-side uploads
 */
export class UploadUrlResponse {
  @ApiProperty({ description: 'Pre-signed upload URL' })
  uploadUrl!: string;

  @ApiProperty({ description: 'Document ID that will be created' })
  documentId!: string;

  @ApiProperty({ description: 'Fields to include in the upload form' })
  fields!: Record<string, string>;

  @ApiProperty({ description: 'URL expiration time (ISO string)' })
  expiresAt!: string;
}

/**
 * Download URL response
 */
export class DownloadUrlResponse {
  @ApiProperty({ description: 'Pre-signed download URL (expires in 15 minutes)' })
  downloadUrl!: string;

  @ApiProperty({ description: 'Original filename' })
  fileName!: string;

  @ApiProperty({ description: 'MIME type' })
  mimeType!: string;

  @ApiProperty({ description: 'File size in bytes' })
  fileSize!: number;

  @ApiProperty({ description: 'URL expiration time (ISO string)' })
  expiresAt!: string;
}

/**
 * Document category count
 */
export class CategoryCountResponse {
  @ApiProperty({ description: 'Document category' })
  category!: DocumentCategory;

  @ApiProperty({ description: 'Number of documents' })
  count!: number;
}

/**
 * Document summary for patient overview
 */
export class DocumentsSummaryResponse {
  @ApiProperty({ description: 'Total document count' })
  totalDocuments!: number;

  @ApiProperty({ description: 'Documents by category', type: [CategoryCountResponse] })
  byCategory!: CategoryCountResponse[];

  @ApiProperty({ description: 'Documents requiring signature' })
  pendingSignatures!: number;

  @ApiProperty({ description: 'Documents expiring soon (next 30 days)' })
  expiringSoon!: number;

  @ApiProperty({ description: 'Most recent document date' })
  lastDocumentDate?: Date;
}
