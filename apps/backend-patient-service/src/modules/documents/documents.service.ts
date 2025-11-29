/**
 * Patient Documents Service
 *
 * Business logic layer for patient document management.
 * Handles CRUD operations, file uploads, signatures, and document generation.
 *
 * SECURITY:
 * - All operations enforce tenant isolation
 * - Document access is logged for HIPAA compliance
 * - Soft deletes only for legal defensibility
 *
 * @module modules/documents
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DocumentsRepository,
  DocumentSearchCriteria,
  PaginationOptions,
} from './documents.repository';
import { S3StorageService, ThumbnailService, MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from './services';
import { PatientDocument, PatientDocumentDocument, DocumentCategory } from './entities';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  SearchDocumentsDto,
  SignDocumentDto,
  GenerateDocumentDto,
  BulkUploadDocumentsDto,
  BulkUploadFileResult,
  PatientDocumentResponse,
  FileInfoResponse,
  SignatureResponse,
  DownloadUrlResponse,
  DocumentsSummaryResponse,
} from './dto';
import {
  DocumentUploadedEvent,
  DocumentSignedEvent,
  DocumentDeletedEvent,
  DocumentGeneratedEvent,
  DocumentUpdatedEvent,
  DocumentAccessedEvent,
} from './events';
import { ValidationError } from '@dentalos/shared-errors';
import type { UUID, ISODateString } from '@dentalos/shared-types';

/**
 * File upload data from multipart request
 */
export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

/**
 * Tenant context for service operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  userId: string;
  clinicId?: string;
}

/**
 * Patient Documents Service
 *
 * Provides business logic for:
 * - Document upload and storage
 * - Metadata management
 * - Digital signatures
 * - Document generation from templates
 * - Search and filtering
 * - GDPR compliance (export, deletion)
 */
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly s3StorageService: S3StorageService,
    private readonly thumbnailService: ThumbnailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Upload a new document
   *
   * @param patientId - Patient ID
   * @param file - Uploaded file data
   * @param dto - Document metadata
   * @param context - Tenant context
   * @returns Created document
   */
  async uploadDocument(
    patientId: string,
    file: UploadedFile,
    dto: CreateDocumentDto,
    context: TenantContext,
  ): Promise<PatientDocumentDocument> {
    this.logger.log(`Uploading document for patient ${patientId}`);

    // Validate file
    this.validateFile(file);

    // Generate document ID
    const documentId = crypto.randomUUID() as UUID;

    // Generate storage key
    const storageKey = this.s3StorageService.generateStorageKey(
      context.tenantId,
      patientId,
      documentId,
      file.originalname,
    );

    // Upload to S3
    const uploadResult = await this.s3StorageService.uploadFile(
      file.buffer,
      storageKey,
      file.mimetype,
      {
        patientId,
        documentId,
        tenantId: context.tenantId,
      },
    );

    // Generate thumbnail if supported
    let thumbnailStorageKey: string | undefined;
    if (this.thumbnailService.supportsThumbnail(file.mimetype)) {
      thumbnailStorageKey = await this.thumbnailService.generateThumbnail(
        file.buffer,
        file.mimetype,
        storageKey,
      );
    }

    // Create document record
    const documentData: Partial<PatientDocument> = {
      id: documentId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: dto.clinicId || context.clinicId || context.organizationId,
      patientId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      file: {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey,
        bucket: this.s3StorageService.getBucket(),
        contentHash: uploadResult.contentHash,
        thumbnailStorageKey,
        isEncrypted: false,
      },
      documentDate: dto.documentDate,
      expiryDate: dto.expiryDate,
      source: dto.source || 'upload',
      appointmentId: dto.appointmentId,
      requiresSignature: dto.requiresSignature || false,
      tags: dto.tags || [],
      uploadedBy: context.userId,
      uploadedAt: new Date(),
      version: 1,
    };

    const document = await this.documentsRepository.create(documentData);

    // Emit event
    const event = new DocumentUploadedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      documentData.clinicId!,
      dto.category,
      dto.title,
      documentData.source!,
      context.userId,
      dto.appointmentId,
      { userId: context.userId },
    );
    this.eventEmitter.emit('document.uploaded', event);

    this.logger.log(`Document uploaded: ${documentId}`);
    return document;
  }

  /**
   * Bulk upload multiple documents
   *
   * @param patientId - Patient ID
   * @param files - Map of file key to uploaded file
   * @param dto - Bulk upload metadata
   * @param context - Tenant context
   * @returns Bulk upload results
   */
  async bulkUpload(
    patientId: string,
    files: Map<string, UploadedFile>,
    dto: BulkUploadDocumentsDto,
    context: TenantContext,
  ): Promise<{ results: BulkUploadFileResult[]; successCount: number; failureCount: number }> {
    const results: BulkUploadFileResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const fileMeta of dto.files) {
      const file = files.get(fileMeta.fileKey);

      if (!file) {
        results.push({
          fileKey: fileMeta.fileKey,
          success: false,
          error: `File not found in upload: ${fileMeta.fileKey}`,
        });
        failureCount++;
        continue;
      }

      try {
        const document = await this.uploadDocument(
          patientId,
          file,
          {
            title: fileMeta.title,
            category: fileMeta.category,
            description: fileMeta.description,
            tags: fileMeta.tags,
            appointmentId: dto.appointmentId,
            clinicId: dto.clinicId,
          },
          context,
        );

        results.push({
          fileKey: fileMeta.fileKey,
          success: true,
          documentId: document.id,
        });
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Bulk upload failed for ${fileMeta.fileKey}: ${errorMessage}`);

        results.push({
          fileKey: fileMeta.fileKey,
          success: false,
          error: errorMessage,
        });
        failureCount++;
      }
    }

    return { results, successCount, failureCount };
  }

  /**
   * Get document by ID
   *
   * @param patientId - Patient ID (for validation)
   * @param documentId - Document ID
   * @param context - Tenant context
   * @returns Document
   */
  async getDocument(
    patientId: string,
    documentId: UUID,
    context: TenantContext,
  ): Promise<PatientDocumentDocument> {
    const document = await this.documentsRepository.findByIdOrFail(documentId, context.tenantId);

    // Verify patient matches
    if (document.patientId !== patientId) {
      throw new ValidationError('Document does not belong to this patient');
    }

    return document;
  }

  /**
   * List documents for a patient with filtering
   *
   * @param patientId - Patient ID
   * @param searchDto - Search and filter criteria
   * @param context - Tenant context
   * @returns Paginated documents
   */
  async listDocuments(patientId: string, searchDto: SearchDocumentsDto, context: TenantContext) {
    const criteria: DocumentSearchCriteria = {
      tenantId: context.tenantId,
      patientId,
      search: searchDto.search,
      category: searchDto.category as DocumentCategory[] | undefined,
      tags: searchDto.tags,
      requiresSignature: searchDto.requiresSignature,
      isSigned: searchDto.isSigned,
      fromDate: searchDto.fromDate,
      toDate: searchDto.toDate,
      expiringBefore: searchDto.expiringBefore,
      source: searchDto.source,
    };

    const options: PaginationOptions = {
      page: searchDto.page || 1,
      limit: searchDto.limit || 20,
      sortBy: searchDto.sortBy || 'uploadedAt',
      sortOrder: searchDto.sortOrder || 'desc',
    };

    return this.documentsRepository.search(criteria, options);
  }

  /**
   * Get documents for an appointment
   *
   * @param appointmentId - Appointment ID
   * @param context - Tenant context
   * @returns Documents for the appointment
   */
  async getDocumentsForAppointment(
    appointmentId: string,
    context: TenantContext,
  ): Promise<PatientDocumentDocument[]> {
    return this.documentsRepository.findByAppointmentId(appointmentId, context.tenantId);
  }

  /**
   * Update document metadata
   *
   * @param patientId - Patient ID
   * @param documentId - Document ID
   * @param dto - Update data
   * @param context - Tenant context
   * @returns Updated document
   */
  async updateDocument(
    patientId: string,
    documentId: UUID,
    dto: UpdateDocumentDto,
    context: TenantContext,
  ): Promise<PatientDocumentDocument> {
    // Verify document belongs to patient
    await this.getDocument(patientId, documentId, context);

    // Prepare update data
    const updateData: Partial<PatientDocument> = {
      updatedBy: context.userId,
    };

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.category !== undefined) updateData.category = dto.category;
    if (dto.documentDate !== undefined) updateData.documentDate = dto.documentDate;
    if (dto.expiryDate !== undefined) updateData.expiryDate = dto.expiryDate;
    if (dto.appointmentId !== undefined) updateData.appointmentId = dto.appointmentId;
    if (dto.requiresSignature !== undefined) updateData.requiresSignature = dto.requiresSignature;
    if (dto.tags !== undefined) updateData.tags = dto.tags;

    const document = await this.documentsRepository.update(
      documentId,
      context.tenantId,
      updateData,
    );

    // Emit event
    const updatedFields = Object.keys(dto).filter(
      (key) => dto[key as keyof UpdateDocumentDto] !== undefined,
    );
    const event = new DocumentUpdatedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      context.userId,
      updatedFields,
      { userId: context.userId },
    );
    this.eventEmitter.emit('document.updated', event);

    this.logger.log(`Document updated: ${documentId}`);
    return document;
  }

  /**
   * Soft delete a document
   *
   * @param patientId - Patient ID
   * @param documentId - Document ID
   * @param context - Tenant context
   * @param reason - Deletion reason (required for compliance)
   * @returns Deleted document
   */
  async deleteDocument(
    patientId: string,
    documentId: UUID,
    context: TenantContext,
    reason?: string,
  ): Promise<PatientDocumentDocument> {
    // Verify document belongs to patient
    await this.getDocument(patientId, documentId, context);

    const document = await this.documentsRepository.softDelete(
      documentId,
      context.tenantId,
      context.userId,
      reason,
    );

    // Emit event
    const event = new DocumentDeletedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      context.userId,
      new Date().toISOString() as ISODateString,
      reason,
      { userId: context.userId },
    );
    this.eventEmitter.emit('document.deleted', event);

    this.logger.log(`Document deleted: ${documentId}`);
    return document;
  }

  /**
   * Get download URL for a document
   *
   * @param patientId - Patient ID
   * @param documentId - Document ID
   * @param context - Tenant context
   * @param ipAddress - Client IP (for audit)
   * @returns Download URL response
   */
  async getDownloadUrl(
    patientId: string,
    documentId: UUID,
    context: TenantContext,
    ipAddress?: string,
  ): Promise<DownloadUrlResponse> {
    const document = await this.getDocument(patientId, documentId, context);

    const { url, expiresAt } = await this.s3StorageService.getDownloadUrl(document.file.storageKey);

    // Emit access event for audit
    const event = new DocumentAccessedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      context.userId,
      'download',
      ipAddress,
      { userId: context.userId },
    );
    this.eventEmitter.emit('document.accessed', event);

    return {
      downloadUrl: url,
      fileName: document.file.fileName,
      mimeType: document.file.mimeType,
      fileSize: document.file.fileSize,
      expiresAt: expiresAt.toISOString(),
    };
  }

  /**
   * Sign a document
   *
   * @param patientId - Patient ID
   * @param documentId - Document ID
   * @param dto - Signature data
   * @param context - Tenant context
   * @param ipAddress - Client IP
   * @param userAgent - Client user agent
   * @returns Signed document
   */
  async signDocument(
    patientId: string,
    documentId: UUID,
    dto: SignDocumentDto,
    context: TenantContext,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PatientDocumentDocument> {
    // Verify document exists and belongs to patient
    const existing = await this.getDocument(patientId, documentId, context);

    // Check if document is already signed
    if (existing.signature?.signedAt) {
      throw new ValidationError(
        'Document is already signed. Use additional signature endpoint for multiple signatures.',
      );
    }

    const signedAt = new Date();

    const document = await this.documentsRepository.addSignature(documentId, context.tenantId, {
      signedBy: context.userId,
      signedAt,
      signatureMethod: dto.signatureMethod,
      signatureImageUrl: dto.signatureImageUrl,
      ipAddress,
      userAgent,
      deviceFingerprint: dto.deviceFingerprint,
      attestationText: dto.attestationText,
      signerName: dto.signerName,
      signerRole: dto.signerRole,
    });

    // Emit event
    const event = new DocumentSignedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      context.userId,
      signedAt.toISOString() as ISODateString,
      dto.signatureMethod,
      dto.signerRole,
      false,
      { userId: context.userId, ...(ipAddress && { ipAddress }) },
    );
    this.eventEmitter.emit('document.signed', event);

    this.logger.log(`Document signed: ${documentId} by ${context.userId}`);
    return document;
  }

  /**
   * Generate document from template
   *
   * @param patientId - Patient ID
   * @param dto - Generation data
   * @param context - Tenant context
   * @returns Generated document
   */
  async generateDocument(
    patientId: string,
    dto: GenerateDocumentDto,
    context: TenantContext,
  ): Promise<PatientDocumentDocument> {
    this.logger.log(`Generating document from template ${dto.templateId} for patient ${patientId}`);

    // In production, this would:
    // 1. Fetch the template from a templates collection
    // 2. Fetch patient data
    // 3. Optionally fetch appointment data
    // 4. Render the template with data (e.g., using Handlebars, PDFKit, or Puppeteer)
    // 5. Convert to PDF
    // 6. Upload to S3
    // 7. Create document record

    // Stub implementation - create a placeholder document
    const documentId = crypto.randomUUID() as UUID;
    const title = dto.title || `Generated Document - ${dto.templateId}`;

    // Determine category based on template (stub logic)
    let category: DocumentCategory = 'other';
    if (dto.templateId.includes('consent')) category = 'consent';
    else if (dto.templateId.includes('anamnesis')) category = 'anamnesis';
    else if (dto.templateId.includes('treatment')) category = 'treatment_plan';
    else if (dto.templateId.includes('prescription')) category = 'prescription';

    const storageKey = this.s3StorageService.generateStorageKey(
      context.tenantId,
      patientId,
      documentId,
      `${dto.templateId}.pdf`,
    );

    // Stub: Create empty PDF (in production, generate actual content)
    const pdfBuffer = Buffer.from('%PDF-1.4 stub document content');

    await this.s3StorageService.uploadFile(pdfBuffer, storageKey, 'application/pdf', {
      patientId,
      documentId,
      templateId: dto.templateId,
    });

    const documentData: Partial<PatientDocument> = {
      id: documentId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: dto.clinicId || context.clinicId || context.organizationId,
      patientId,
      title,
      category,
      file: {
        fileName: `${dto.templateId}.pdf`,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        storageKey,
        bucket: this.s3StorageService.getBucket(),
        isEncrypted: false,
      },
      expiryDate: dto.expiryDate,
      source: 'generated',
      generatedFromTemplateId: dto.templateId,
      generationData: dto.additionalData,
      appointmentId: dto.appointmentId,
      requiresSignature: dto.requiresSignature !== false, // Default true for generated docs
      tags: dto.tags || [],
      uploadedBy: context.userId,
      uploadedAt: new Date(),
      version: 1,
    };

    const document = await this.documentsRepository.create(documentData);

    // Emit event
    const event = new DocumentGeneratedEvent(
      documentId,
      patientId as UUID,
      context.tenantId,
      context.organizationId,
      documentData.clinicId!,
      dto.templateId,
      context.userId,
      dto.appointmentId,
      { userId: context.userId },
    );
    this.eventEmitter.emit('document.generated', event);

    this.logger.log(`Document generated: ${documentId} from template ${dto.templateId}`);
    return document;
  }

  /**
   * Get documents summary for a patient
   *
   * @param patientId - Patient ID
   * @param context - Tenant context
   * @returns Documents summary
   */
  async getDocumentsSummary(
    patientId: string,
    context: TenantContext,
  ): Promise<DocumentsSummaryResponse> {
    // Get category counts
    const byCategory = await this.documentsRepository.countByCategory(patientId, context.tenantId);

    // Get unsigned documents count
    const unsignedDocs = await this.documentsRepository.findUnsignedDocuments(
      patientId,
      context.tenantId,
    );

    // Get expiring documents (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringDocs = await this.documentsRepository.findExpiringDocuments(
      context.tenantId,
      thirtyDaysFromNow,
    );
    const patientExpiringDocs = expiringDocs.filter((d) => d.patientId === patientId);

    // Get most recent document
    const recentDocs = await this.documentsRepository.search(
      { tenantId: context.tenantId, patientId },
      { page: 1, limit: 1, sortBy: 'uploadedAt', sortOrder: 'desc' },
    );

    const totalDocuments = byCategory.reduce((sum, cat) => sum + cat.count, 0);

    return {
      totalDocuments,
      byCategory,
      pendingSignatures: unsignedDocs.length,
      expiringSoon: patientExpiringDocs.length,
      lastDocumentDate: recentDocs.data[0]?.uploadedAt,
    };
  }

  /**
   * Get all documents for GDPR export
   *
   * @param patientId - Patient ID
   * @param context - Tenant context
   * @returns All patient documents
   */
  async getDocumentsForExport(
    patientId: string,
    context: TenantContext,
  ): Promise<PatientDocumentDocument[]> {
    return this.documentsRepository.findAllForExport(patientId, context.tenantId);
  }

  /**
   * Bulk delete documents for GDPR erasure
   *
   * @param patientId - Patient ID
   * @param context - Tenant context
   * @param reason - Deletion reason
   * @returns Number of documents deleted
   */
  async bulkDeleteForErasure(
    patientId: string,
    context: TenantContext,
    reason: string,
  ): Promise<number> {
    const count = await this.documentsRepository.bulkSoftDelete(
      patientId,
      context.tenantId,
      context.userId,
      reason,
    );

    this.logger.log(`GDPR erasure: ${count} documents soft-deleted for patient ${patientId}`);
    return count;
  }

  /**
   * Transform document to response DTO
   *
   * @param document - Document entity
   * @param includeUrls - Whether to include pre-signed URLs
   * @returns Response DTO
   */
  async toResponseDto(
    document: PatientDocumentDocument,
    includeUrls = false,
  ): Promise<PatientDocumentResponse> {
    const fileInfo: FileInfoResponse = {
      fileName: document.file.fileName,
      fileSize: document.file.fileSize,
      mimeType: document.file.mimeType,
    };

    if (includeUrls) {
      const { url } = await this.s3StorageService.getDownloadUrl(document.file.storageKey);
      fileInfo.downloadUrl = url;

      if (document.file.thumbnailStorageKey) {
        fileInfo.thumbnailUrl = await this.thumbnailService.getThumbnailUrl(
          document.file.thumbnailStorageKey,
        );
      }
    }

    let signature: SignatureResponse | undefined;
    if (document.signature) {
      signature = {
        signedBy: document.signature.signedBy,
        signedAt: document.signature.signedAt,
        signatureMethod: document.signature.signatureMethod,
        signerName: document.signature.signerName,
        signerRole: document.signature.signerRole,
      };
    }

    const additionalSignatures = document.additionalSignatures?.map((sig) => ({
      signedBy: sig.signedBy,
      signedAt: sig.signedAt,
      signatureMethod: sig.signatureMethod,
      signerName: sig.signerName,
      signerRole: sig.signerRole,
    }));

    return {
      id: document.id,
      tenantId: document.tenantId,
      organizationId: document.organizationId,
      clinicId: document.clinicId,
      patientId: document.patientId,
      title: document.title,
      description: document.description,
      category: document.category,
      file: fileInfo,
      documentDate: document.documentDate,
      expiryDate: document.expiryDate,
      source: document.source,
      generatedFromTemplateId: document.generatedFromTemplateId,
      appointmentId: document.appointmentId,
      requiresSignature: document.requiresSignature,
      signature,
      additionalSignatures,
      isSigned: !!document.signature?.signedAt,
      tags: document.tags,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      updatedAt: document.updatedAt,
      updatedBy: document.updatedBy,
      version: document.version,
    };
  }

  /**
   * Validate uploaded file
   *
   * @param file - File to validate
   * @throws {ValidationError} If file is invalid
   */
  private validateFile(file: UploadedFile): void {
    if (!file.buffer || file.size === 0) {
      throw new ValidationError('File is empty');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(
        `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }

    if (!this.s3StorageService.isAllowedMimeType(file.mimetype)) {
      throw new ValidationError(
        `File type ${file.mimetype} is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }
}
