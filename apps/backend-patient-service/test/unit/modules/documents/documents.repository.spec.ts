/**
 * Documents Repository Unit Tests
 *
 * Tests data access layer for patient documents.
 * Validates tenant isolation and query operations.
 *
 * @module tests/documents
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Model } from 'mongoose';
import { DocumentsRepository } from '../../../../src/modules/documents/documents.repository';
import { PatientDocument, PatientDocumentDocument } from '../../../../src/modules/documents/entities';
import { NotFoundError, ConflictError } from '@dentalos/shared-errors';

// Create mock model
const createMockModel = () => {
  const mockQuery = {
    find: vi.fn().mockReturnThis(),
    findOne: vi.fn().mockReturnThis(),
    findOneAndUpdate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  };

  const MockModel = vi.fn().mockImplementation((data) => ({
    ...data,
    save: vi.fn().mockResolvedValue(data),
  }));

  MockModel.find = vi.fn().mockReturnValue(mockQuery);
  MockModel.findOne = vi.fn().mockReturnValue(mockQuery);
  MockModel.findOneAndUpdate = vi.fn().mockReturnValue(mockQuery);
  MockModel.countDocuments = vi.fn().mockReturnValue({ exec: vi.fn() });
  MockModel.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 0 });
  MockModel.aggregate = vi.fn().mockResolvedValue([]);
  MockModel.prototype.save = vi.fn();

  return { MockModel, mockQuery };
};

describe('DocumentsRepository', () => {
  let repository: DocumentsRepository;
  let MockModel: any;
  let mockQuery: any;

  const tenantId = 'tenant-123';

  beforeEach(() => {
    vi.clearAllMocks();
    const mocks = createMockModel();
    MockModel = mocks.MockModel;
    mockQuery = mocks.mockQuery;

    repository = new DocumentsRepository(
      MockModel as unknown as Model<PatientDocumentDocument>,
    );
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const docData = {
        id: 'doc-123',
        tenantId,
        patientId: 'patient-123',
        title: 'Test Document',
        category: 'consent',
      };

      const savedDoc = { ...docData, _id: 'mongo-id' };
      MockModel.prototype.save = vi.fn().mockResolvedValue(savedDoc);

      const mockInstance = new MockModel(docData);
      mockInstance.save = vi.fn().mockResolvedValue(savedDoc);

      MockModel.mockImplementation(() => mockInstance);

      const result = await repository.create(docData);

      expect(mockInstance.save).toHaveBeenCalled();
    });

    it('should throw ConflictError on duplicate ID', async () => {
      const docData = {
        id: 'doc-123',
        tenantId,
        patientId: 'patient-123',
      };

      const mockInstance = new MockModel(docData);
      mockInstance.save = vi.fn().mockRejectedValue({ code: 11000 });
      MockModel.mockImplementation(() => mockInstance);

      await expect(repository.create(docData)).rejects.toThrow(ConflictError);
    });
  });

  describe('findById', () => {
    it('should find document by ID with tenant isolation', async () => {
      const mockDoc = {
        id: 'doc-123',
        tenantId,
        title: 'Test Document',
      };

      mockQuery.exec.mockResolvedValue(mockDoc);

      const result = await repository.findById('doc-123' as any, tenantId);

      expect(MockModel.findOne).toHaveBeenCalledWith({
        id: 'doc-123',
        tenantId,
        isDeleted: false,
      });
      expect(result).toEqual(mockDoc);
    });

    it('should return null if document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      const result = await repository.findById('nonexistent' as any, tenantId);

      expect(result).toBeNull();
    });

    it('should include deleted documents when requested', async () => {
      const mockDoc = {
        id: 'doc-123',
        tenantId,
        isDeleted: true,
      };

      mockQuery.exec.mockResolvedValue(mockDoc);

      await repository.findById('doc-123' as any, tenantId, true);

      expect(MockModel.findOne).toHaveBeenCalledWith({
        id: 'doc-123',
        tenantId,
      });
    });
  });

  describe('findByIdOrFail', () => {
    it('should throw NotFoundError if document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      await expect(
        repository.findByIdOrFail('nonexistent' as any, tenantId),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('search', () => {
    it('should search with filters and pagination', async () => {
      const mockDocs = [
        { id: 'doc-1', title: 'Doc 1' },
        { id: 'doc-2', title: 'Doc 2' },
      ];

      mockQuery.exec.mockResolvedValue(mockDocs);
      MockModel.countDocuments.mockReturnValue({ exec: vi.fn().mockResolvedValue(10) });

      const result = await repository.search(
        {
          tenantId,
          patientId: 'patient-123',
          category: 'consent',
          tags: ['urgent'],
        },
        {
          page: 1,
          limit: 20,
          sortBy: 'uploadedAt',
          sortOrder: 'desc',
        },
      );

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should handle text search', async () => {
      mockQuery.exec.mockResolvedValue([]);
      MockModel.countDocuments.mockReturnValue({ exec: vi.fn().mockResolvedValue(0) });

      await repository.search(
        {
          tenantId,
          search: 'consent form',
        },
        { page: 1, limit: 20 },
      );

      expect(MockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          $text: { $search: 'consent form' },
        }),
      );
    });

    it('should filter by date range', async () => {
      mockQuery.exec.mockResolvedValue([]);
      MockModel.countDocuments.mockReturnValue({ exec: vi.fn().mockResolvedValue(0) });

      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      await repository.search(
        {
          tenantId,
          fromDate,
          toDate,
        },
        { page: 1, limit: 20 },
      );

      expect(MockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          documentDate: {
            $gte: fromDate,
            $lte: toDate,
          },
        }),
      );
    });

    it('should filter by signed status', async () => {
      mockQuery.exec.mockResolvedValue([]);
      MockModel.countDocuments.mockReturnValue({ exec: vi.fn().mockResolvedValue(0) });

      await repository.search(
        {
          tenantId,
          isSigned: true,
        },
        { page: 1, limit: 20 },
      );

      expect(MockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'signature.signedAt': { $exists: true },
        }),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete document with reason', async () => {
      const mockDoc = {
        id: 'doc-123',
        tenantId,
        isDeleted: true,
        deletedAt: expect.any(Date),
        deletedBy: 'user-123',
        deletionReason: 'Patient request',
      };

      mockQuery.exec.mockResolvedValue(mockDoc);

      const result = await repository.softDelete(
        'doc-123' as any,
        tenantId,
        'user-123',
        'Patient request',
      );

      expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'doc-123', tenantId, isDeleted: false },
        expect.objectContaining({
          $set: expect.objectContaining({
            isDeleted: true,
            deletedBy: 'user-123',
            deletionReason: 'Patient request',
          }),
        }),
        { new: true },
      );
    });

    it('should throw NotFoundError if document not found', async () => {
      mockQuery.exec.mockResolvedValue(null);

      await expect(
        repository.softDelete('nonexistent' as any, tenantId, 'user-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('addSignature', () => {
    it('should add signature to document', async () => {
      const signatureData = {
        signedBy: 'user-123',
        signedAt: new Date(),
        signatureMethod: 'electronic',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        signerName: 'John Doe',
        signerRole: 'patient',
      };

      const signedDoc = {
        id: 'doc-123',
        signature: signatureData,
      };

      mockQuery.exec.mockResolvedValue(signedDoc);

      const result = await repository.addSignature(
        'doc-123' as any,
        tenantId,
        signatureData,
      );

      expect(MockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'doc-123', tenantId, isDeleted: false },
        expect.objectContaining({
          $set: expect.objectContaining({
            signature: signatureData,
          }),
          $inc: { version: 1 },
        }),
        { new: true, runValidators: true },
      );
    });
  });

  describe('findByAppointmentId', () => {
    it('should find documents by appointment ID with tenant isolation', async () => {
      const mockDocs = [
        { id: 'doc-1', appointmentId: 'apt-123' },
        { id: 'doc-2', appointmentId: 'apt-123' },
      ];

      mockQuery.exec.mockResolvedValue(mockDocs);

      const result = await repository.findByAppointmentId('apt-123', tenantId);

      expect(MockModel.find).toHaveBeenCalledWith({
        tenantId,
        appointmentId: 'apt-123',
        isDeleted: false,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findUnsignedDocuments', () => {
    it('should find documents requiring signature that are not signed', async () => {
      const mockDocs = [{ id: 'doc-1', requiresSignature: true }];

      mockQuery.exec.mockResolvedValue(mockDocs);

      const result = await repository.findUnsignedDocuments('patient-123', tenantId);

      expect(MockModel.find).toHaveBeenCalledWith({
        tenantId,
        patientId: 'patient-123',
        isDeleted: false,
        requiresSignature: true,
        'signature.signedAt': { $exists: false },
      });
    });
  });

  describe('findExpiringDocuments', () => {
    it('should find documents expiring before given date', async () => {
      const expiryDate = new Date('2024-03-01');
      const mockDocs = [
        { id: 'doc-1', expiryDate: new Date('2024-02-15') },
      ];

      mockQuery.exec.mockResolvedValue(mockDocs);

      const result = await repository.findExpiringDocuments(tenantId, expiryDate);

      expect(MockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId,
          isDeleted: false,
          expiryDate: {
            $exists: true,
            $ne: null,
            $lte: expiryDate,
          },
        }),
      );
    });

    it('should filter by category when provided', async () => {
      const expiryDate = new Date('2024-03-01');
      mockQuery.exec.mockResolvedValue([]);

      await repository.findExpiringDocuments(tenantId, expiryDate, 'consent');

      expect(MockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'consent',
        }),
      );
    });
  });

  describe('bulkSoftDelete', () => {
    it('should soft delete all documents for a patient', async () => {
      MockModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await repository.bulkSoftDelete(
        'patient-123',
        tenantId,
        'user-123',
        'GDPR erasure',
      );

      expect(result).toBe(5);
      expect(MockModel.updateMany).toHaveBeenCalledWith(
        {
          tenantId,
          patientId: 'patient-123',
          isDeleted: false,
        },
        expect.objectContaining({
          $set: expect.objectContaining({
            isDeleted: true,
            deletedBy: 'user-123',
            deletionReason: 'GDPR erasure',
          }),
        }),
      );
    });
  });
});
