/**
 * Documents Service Unit Tests
 *
 * Tests business logic for patient document management.
 * Validates file handling, signatures, and document generation.
 *
 * @module tests/documents
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DocumentsService, UploadedFile, TenantContext } from '../../../../src/modules/documents/documents.service';
import { DocumentsRepository } from '../../../../src/modules/documents/documents.repository';
import { S3StorageService, ThumbnailService } from '../../../../src/modules/documents/services';
import { ValidationError } from '@dentalos/shared-errors';
import { CreateDocumentDto, SignDocumentDto, GenerateDocumentDto } from '../../../../src/modules/documents/dto';

// Mock dependencies
const mockRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findByIdOrFail: vi.fn(),
  findByPatientId: vi.fn(),
  findByAppointmentId: vi.fn(),
  search: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  addSignature: vi.fn(),
  findUnsignedDocuments: vi.fn(),
  findExpiringDocuments: vi.fn(),
  countByCategory: vi.fn(),
  findAllForExport: vi.fn(),
  bulkSoftDelete: vi.fn(),
};

const mockS3Service = {
  generateStorageKey: vi.fn(),
  generateThumbnailKey: vi.fn(),
  uploadFile: vi.fn(),
  getDownloadUrl: vi.fn(),
  getBucket: vi.fn(),
  isAllowedMimeType: vi.fn(),
};

const mockThumbnailService = {
  supportsThumbnail: vi.fn(),
  generateThumbnail: vi.fn(),
  getThumbnailUrl: vi.fn(),
};

const mockEventEmitter = {
  emit: vi.fn(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  const tenantContext: TenantContext = {
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    userId: 'user-123',
    clinicId: 'clinic-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockS3Service.getBucket.mockReturnValue('test-bucket');
    mockS3Service.isAllowedMimeType.mockReturnValue(true);
    mockS3Service.generateStorageKey.mockReturnValue('tenant-123/patients/patient-123/documents/doc-123/test.pdf');
    mockS3Service.uploadFile.mockResolvedValue({
      storageKey: 'tenant-123/patients/patient-123/documents/doc-123/test.pdf',
      bucket: 'test-bucket',
      contentHash: 'abc123hash',
      fileSize: 1024,
    });
    mockS3Service.getDownloadUrl.mockResolvedValue({
      url: 'https://s3.amazonaws.com/test-bucket/test.pdf?signed',
      expiresAt: new Date(Date.now() + 900000),
    });

    mockThumbnailService.supportsThumbnail.mockReturnValue(true);
    mockThumbnailService.generateThumbnail.mockResolvedValue('tenant-123/patients/patient-123/documents/doc-123/thumbnails/test_thumb.png');

    service = new DocumentsService(
      mockRepository as unknown as DocumentsRepository,
      mockS3Service as unknown as S3StorageService,
      mockThumbnailService as unknown as ThumbnailService,
      mockEventEmitter as unknown as EventEmitter2,
    );
  });

  describe('uploadDocument', () => {
    const patientId = 'patient-123';
    const validFile: UploadedFile = {
      buffer: Buffer.from('test content'),
      originalname: 'consent-form.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    };
    const validDto: CreateDocumentDto = {
      title: 'Consent Form',
      category: 'consent',
      requiresSignature: true,
      tags: ['consent', 'treatment'],
    };

    it('should upload a document successfully', async () => {
      const mockCreatedDoc = {
        id: 'doc-123',
        tenantId: tenantContext.tenantId,
        patientId,
        title: validDto.title,
        category: validDto.category,
        file: {
          fileName: validFile.originalname,
          fileSize: validFile.size,
          mimeType: validFile.mimetype,
          storageKey: 'tenant-123/patients/patient-123/documents/doc-123/test.pdf',
          bucket: 'test-bucket',
          contentHash: 'abc123hash',
        },
        requiresSignature: true,
        tags: ['consent', 'treatment'],
        uploadedBy: tenantContext.userId,
        uploadedAt: new Date(),
        version: 1,
      };

      mockRepository.create.mockResolvedValue(mockCreatedDoc);

      const result = await service.uploadDocument(patientId, validFile, validDto, tenantContext);

      expect(result.id).toBe('doc-123');
      expect(result.title).toBe(validDto.title);
      expect(result.category).toBe(validDto.category);
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(mockThumbnailService.generateThumbnail).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('document.uploaded', expect.anything());
    });

    it('should reject files exceeding size limit', async () => {
      const oversizedFile: UploadedFile = {
        buffer: Buffer.alloc(30 * 1024 * 1024), // 30MB
        originalname: 'large-file.pdf',
        mimetype: 'application/pdf',
        size: 30 * 1024 * 1024,
      };

      await expect(
        service.uploadDocument(patientId, oversizedFile, validDto, tenantContext),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject files with disallowed MIME types', async () => {
      mockS3Service.isAllowedMimeType.mockReturnValue(false);

      const invalidFile: UploadedFile = {
        buffer: Buffer.from('test'),
        originalname: 'script.exe',
        mimetype: 'application/x-executable',
        size: 1024,
      };

      await expect(
        service.uploadDocument(patientId, invalidFile, validDto, tenantContext),
      ).rejects.toThrow(ValidationError);
    });

    it('should reject empty files', async () => {
      const emptyFile: UploadedFile = {
        buffer: Buffer.alloc(0),
        originalname: 'empty.pdf',
        mimetype: 'application/pdf',
        size: 0,
      };

      await expect(
        service.uploadDocument(patientId, emptyFile, validDto, tenantContext),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getDocument', () => {
    const patientId = 'patient-123';
    const documentId = 'doc-123' as any;

    it('should return document if it belongs to the patient', async () => {
      const mockDoc = {
        id: documentId,
        patientId,
        tenantId: tenantContext.tenantId,
        title: 'Test Doc',
      };

      mockRepository.findByIdOrFail.mockResolvedValue(mockDoc);

      const result = await service.getDocument(patientId, documentId, tenantContext);

      expect(result.id).toBe(documentId);
      expect(mockRepository.findByIdOrFail).toHaveBeenCalledWith(documentId, tenantContext.tenantId);
    });

    it('should throw error if document belongs to different patient', async () => {
      const mockDoc = {
        id: documentId,
        patientId: 'different-patient',
        tenantId: tenantContext.tenantId,
        title: 'Test Doc',
      };

      mockRepository.findByIdOrFail.mockResolvedValue(mockDoc);

      await expect(
        service.getDocument(patientId, documentId, tenantContext),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('signDocument', () => {
    const patientId = 'patient-123';
    const documentId = 'doc-123' as any;
    const signDto: SignDocumentDto = {
      signatureMethod: 'electronic',
      attestationText: 'I agree to the terms',
      signerName: 'John Doe',
      signerRole: 'patient',
    };

    it('should add signature to unsigned document', async () => {
      const unsignedDoc = {
        id: documentId,
        patientId,
        tenantId: tenantContext.tenantId,
        requiresSignature: true,
        signature: undefined,
      };

      const signedDoc = {
        ...unsignedDoc,
        signature: {
          signedBy: tenantContext.userId,
          signedAt: new Date(),
          signatureMethod: 'electronic',
          signerName: 'John Doe',
          signerRole: 'patient',
        },
      };

      mockRepository.findByIdOrFail.mockResolvedValue(unsignedDoc);
      mockRepository.addSignature.mockResolvedValue(signedDoc);

      const result = await service.signDocument(
        patientId,
        documentId,
        signDto,
        tenantContext,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result.signature).toBeDefined();
      expect(result.signature?.signatureMethod).toBe('electronic');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('document.signed', expect.anything());
    });

    it('should reject signing an already signed document', async () => {
      const alreadySignedDoc = {
        id: documentId,
        patientId,
        tenantId: tenantContext.tenantId,
        requiresSignature: true,
        signature: {
          signedBy: 'other-user',
          signedAt: new Date(),
          signatureMethod: 'electronic',
        },
      };

      mockRepository.findByIdOrFail.mockResolvedValue(alreadySignedDoc);

      await expect(
        service.signDocument(patientId, documentId, signDto, tenantContext),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteDocument', () => {
    const patientId = 'patient-123';
    const documentId = 'doc-123' as any;

    it('should soft delete document with reason', async () => {
      const mockDoc = {
        id: documentId,
        patientId,
        tenantId: tenantContext.tenantId,
        title: 'Test Doc',
        isDeleted: false,
      };

      const deletedDoc = {
        ...mockDoc,
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: tenantContext.userId,
        deletionReason: 'Patient request',
      };

      mockRepository.findByIdOrFail.mockResolvedValue(mockDoc);
      mockRepository.softDelete.mockResolvedValue(deletedDoc);

      const result = await service.deleteDocument(
        patientId,
        documentId,
        tenantContext,
        'Patient request',
      );

      expect(result.isDeleted).toBe(true);
      expect(result.deletionReason).toBe('Patient request');
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('document.deleted', expect.anything());
    });
  });

  describe('generateDocument', () => {
    const patientId = 'patient-123';
    const generateDto: GenerateDocumentDto = {
      templateId: 'consent-extraction-ro',
      appointmentId: 'apt-123',
      requiresSignature: true,
      tags: ['consent'],
    };

    it('should generate document from template', async () => {
      const mockGeneratedDoc = {
        id: 'doc-456',
        tenantId: tenantContext.tenantId,
        patientId,
        title: 'Generated Document - consent-extraction-ro',
        category: 'consent',
        source: 'generated',
        generatedFromTemplateId: generateDto.templateId,
        requiresSignature: true,
      };

      mockRepository.create.mockResolvedValue(mockGeneratedDoc);

      const result = await service.generateDocument(patientId, generateDto, tenantContext);

      expect(result.source).toBe('generated');
      expect(result.generatedFromTemplateId).toBe(generateDto.templateId);
      expect(mockS3Service.uploadFile).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('document.generated', expect.anything());
    });
  });

  describe('getDocumentsSummary', () => {
    const patientId = 'patient-123';

    it('should return documents summary', async () => {
      mockRepository.countByCategory.mockResolvedValue([
        { category: 'consent', count: 5 },
        { category: 'imaging', count: 10 },
      ]);
      mockRepository.findUnsignedDocuments.mockResolvedValue([
        { id: 'doc-1' },
        { id: 'doc-2' },
      ]);
      mockRepository.findExpiringDocuments.mockResolvedValue([
        { id: 'doc-3', patientId },
      ]);
      mockRepository.search.mockResolvedValue({
        data: [{ uploadedAt: new Date() }],
        total: 15,
        page: 1,
        limit: 1,
        totalPages: 15,
        hasNext: true,
        hasPrev: false,
      });

      const result = await service.getDocumentsSummary(patientId, tenantContext);

      expect(result.totalDocuments).toBe(15);
      expect(result.pendingSignatures).toBe(2);
      expect(result.expiringSoon).toBe(1);
      expect(result.byCategory).toHaveLength(2);
    });
  });

  describe('bulkUpload', () => {
    const patientId = 'patient-123';

    it('should upload multiple files and return results', async () => {
      const files = new Map<string, UploadedFile>([
        ['file_0', { buffer: Buffer.from('test1'), originalname: 'doc1.pdf', mimetype: 'application/pdf', size: 100 }],
        ['file_1', { buffer: Buffer.from('test2'), originalname: 'doc2.pdf', mimetype: 'application/pdf', size: 100 }],
      ]);

      const dto = {
        files: [
          { fileKey: 'file_0', title: 'Document 1', category: 'consent' as const },
          { fileKey: 'file_1', title: 'Document 2', category: 'imaging' as const },
        ],
      };

      mockRepository.create.mockResolvedValueOnce({ id: 'doc-1' });
      mockRepository.create.mockResolvedValueOnce({ id: 'doc-2' });

      const result = await service.bulkUpload(patientId, files, dto, tenantContext);

      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(2);
    });

    it('should handle missing files in bulk upload', async () => {
      const files = new Map<string, UploadedFile>([
        ['file_0', { buffer: Buffer.from('test1'), originalname: 'doc1.pdf', mimetype: 'application/pdf', size: 100 }],
      ]);

      const dto = {
        files: [
          { fileKey: 'file_0', title: 'Document 1', category: 'consent' as const },
          { fileKey: 'file_missing', title: 'Document 2', category: 'imaging' as const },
        ],
      };

      mockRepository.create.mockResolvedValueOnce({ id: 'doc-1' });

      const result = await service.bulkUpload(patientId, files, dto, tenantContext);

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(1);
      expect(result.results.find(r => r.fileKey === 'file_missing')?.success).toBe(false);
    });
  });

  describe('GDPR compliance', () => {
    const patientId = 'patient-123';

    it('should export all documents for GDPR request', async () => {
      const mockDocs = [
        { id: 'doc-1', title: 'Doc 1' },
        { id: 'doc-2', title: 'Doc 2', isDeleted: true },
      ];

      mockRepository.findAllForExport.mockResolvedValue(mockDocs);

      const result = await service.getDocumentsForExport(patientId, tenantContext);

      expect(result).toHaveLength(2);
      expect(mockRepository.findAllForExport).toHaveBeenCalledWith(patientId, tenantContext.tenantId);
    });

    it('should bulk delete documents for erasure', async () => {
      mockRepository.bulkSoftDelete.mockResolvedValue(5);

      const result = await service.bulkDeleteForErasure(
        patientId,
        tenantContext,
        'GDPR erasure request',
      );

      expect(result).toBe(5);
      expect(mockRepository.bulkSoftDelete).toHaveBeenCalledWith(
        patientId,
        tenantContext.tenantId,
        tenantContext.userId,
        'GDPR erasure request',
      );
    });
  });
});
