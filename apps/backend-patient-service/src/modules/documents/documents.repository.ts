/**
 * Patient Documents Repository
 *
 * Data access layer for patient documents with strict tenant isolation.
 * All queries automatically enforce tenant boundaries for PHI protection.
 *
 * SECURITY:
 * - Every query includes tenantId for multi-tenant isolation
 * - Soft deletes only - no hard delete methods
 * - Audit logging should be performed at service layer
 *
 * @module modules/documents
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, UpdateQuery } from 'mongoose';
import { PatientDocument, PatientDocumentDocument, DocumentCategory } from './entities';
import { NotFoundError, ConflictError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

/**
 * Search criteria for documents
 */
export interface DocumentSearchCriteria {
  tenantId: string;
  patientId?: string;
  appointmentId?: string;
  category?: DocumentCategory | DocumentCategory[];
  tags?: string[];
  search?: string;
  requiresSignature?: boolean;
  isSigned?: boolean;
  fromDate?: Date;
  toDate?: Date;
  expiringBefore?: Date;
  uploadedBy?: string;
  source?: string;
  includeDeleted?: boolean;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Patient Documents Repository
 *
 * Handles all database operations for patient documents with:
 * - Tenant isolation on every query
 * - Soft delete support
 * - Full-text search
 * - Complex filtering
 * - Pagination
 */
@Injectable()
export class DocumentsRepository {
  private readonly logger = new Logger(DocumentsRepository.name);

  constructor(
    @InjectModel(PatientDocument.name)
    private readonly documentModel: Model<PatientDocumentDocument>,
  ) {}

  /**
   * Create a new document record
   *
   * @param documentData - Document data to create
   * @returns Created document
   * @throws {ConflictError} If document with same ID already exists
   */
  async create(documentData: Partial<PatientDocument>): Promise<PatientDocumentDocument> {
    try {
      const document = new this.documentModel(documentData);
      return await document.save();
    } catch (error: any) {
      if (error.code === 11000) {
        this.logger.warn(`Duplicate document creation attempted: ${error.message}`);
        throw new ConflictError('Document with this ID already exists');
      }
      throw error;
    }
  }

  /**
   * Find document by ID with tenant isolation
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @param includeDeleted - Whether to include soft-deleted records
   * @returns Document or null
   */
  async findById(
    id: UUID,
    tenantId: string,
    includeDeleted = false,
  ): Promise<PatientDocumentDocument | null> {
    const query: FilterQuery<PatientDocumentDocument> = {
      id,
      tenantId,
    };

    if (!includeDeleted) {
      query.isDeleted = false;
    }

    return this.documentModel.findOne(query).exec();
  }

  /**
   * Find document by ID or throw error
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @returns Document
   * @throws {NotFoundError} If document not found
   */
  async findByIdOrFail(id: UUID, tenantId: string): Promise<PatientDocumentDocument> {
    const document = await this.findById(id, tenantId);

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Find all documents for a patient
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param options - Pagination options
   * @returns Paginated documents
   */
  async findByPatientId(
    patientId: string,
    tenantId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<PatientDocumentDocument>> {
    return this.search({ tenantId, patientId }, options);
  }

  /**
   * Find all documents for an appointment
   *
   * @param appointmentId - Appointment ID
   * @param tenantId - Tenant ID for isolation
   * @returns Documents for the appointment
   */
  async findByAppointmentId(
    appointmentId: string,
    tenantId: string,
  ): Promise<PatientDocumentDocument[]> {
    return this.documentModel
      .find({
        tenantId,
        appointmentId,
        isDeleted: false,
      })
      .sort({ uploadedAt: -1 })
      .exec();
  }

  /**
   * Search documents with filters and pagination
   *
   * @param criteria - Search criteria
   * @param options - Pagination options
   * @returns Paginated document results
   */
  async search(
    criteria: DocumentSearchCriteria,
    options: PaginationOptions,
  ): Promise<PaginatedResult<PatientDocumentDocument>> {
    const { page = 1, limit = 20, sortBy = 'uploadedAt', sortOrder = 'desc' } = options;

    // Build query with tenant isolation
    const query: FilterQuery<PatientDocumentDocument> = {
      tenantId: criteria.tenantId,
    };

    if (!criteria.includeDeleted) {
      query.isDeleted = false;
    }

    // Apply filters
    if (criteria.patientId) {
      query.patientId = criteria.patientId;
    }

    if (criteria.appointmentId) {
      query.appointmentId = criteria.appointmentId;
    }

    if (criteria.category) {
      if (Array.isArray(criteria.category)) {
        query.category = { $in: criteria.category };
      } else {
        query.category = criteria.category;
      }
    }

    if (criteria.tags && criteria.tags.length > 0) {
      query.tags = { $in: criteria.tags };
    }

    if (criteria.requiresSignature !== undefined) {
      query.requiresSignature = criteria.requiresSignature;
    }

    if (criteria.isSigned !== undefined) {
      if (criteria.isSigned) {
        query['signature.signedAt'] = { $exists: true };
      } else {
        query['signature.signedAt'] = { $exists: false };
      }
    }

    if (criteria.fromDate || criteria.toDate) {
      query.documentDate = {};
      if (criteria.fromDate) {
        query.documentDate.$gte = criteria.fromDate;
      }
      if (criteria.toDate) {
        query.documentDate.$lte = criteria.toDate;
      }
    }

    if (criteria.expiringBefore) {
      query.expiryDate = { $lte: criteria.expiringBefore };
    }

    if (criteria.uploadedBy) {
      query.uploadedBy = criteria.uploadedBy;
    }

    if (criteria.source) {
      query.source = criteria.source;
    }

    // Text search
    if (criteria.search && criteria.search.trim()) {
      query.$text = { $search: criteria.search.trim() };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [data, total] = await Promise.all([
      this.documentModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.documentModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Update document metadata
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @param updateData - Data to update
   * @returns Updated document
   * @throws {NotFoundError} If document not found
   */
  async update(
    id: UUID,
    tenantId: string,
    updateData: Partial<PatientDocument>,
  ): Promise<PatientDocumentDocument> {
    const updateQuery: UpdateQuery<PatientDocumentDocument> = {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
      $inc: { version: 1 },
    };

    const document = await this.documentModel
      .findOneAndUpdate({ id, tenantId, isDeleted: false }, updateQuery, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Soft delete a document
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @param deletedBy - User ID who deleted the document
   * @param reason - Reason for deletion (required for compliance)
   * @returns Soft-deleted document
   * @throws {NotFoundError} If document not found
   */
  async softDelete(
    id: UUID,
    tenantId: string,
    deletedBy: string,
    reason?: string,
  ): Promise<PatientDocumentDocument> {
    const document = await this.documentModel
      .findOneAndUpdate(
        { id, tenantId, isDeleted: false },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy,
            deletionReason: reason,
          },
        },
        { new: true },
      )
      .exec();

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Add signature to a document
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @param signatureData - Signature information
   * @returns Updated document
   * @throws {NotFoundError} If document not found
   */
  async addSignature(
    id: UUID,
    tenantId: string,
    signatureData: {
      signedBy: string;
      signedAt: Date;
      signatureMethod: string;
      signatureImageUrl?: string;
      ipAddress?: string;
      userAgent?: string;
      deviceFingerprint?: string;
      attestationText?: string;
      signerName?: string;
      signerRole?: string;
    },
  ): Promise<PatientDocumentDocument> {
    const document = await this.documentModel
      .findOneAndUpdate(
        { id, tenantId, isDeleted: false },
        {
          $set: {
            signature: signatureData,
            updatedAt: new Date(),
          },
          $inc: { version: 1 },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Add an additional signature to a document
   *
   * @param id - Document ID
   * @param tenantId - Tenant ID for isolation
   * @param signatureData - Signature information
   * @returns Updated document
   */
  async addAdditionalSignature(
    id: UUID,
    tenantId: string,
    signatureData: {
      signedBy: string;
      signedAt: Date;
      signatureMethod: string;
      signatureImageUrl?: string;
      ipAddress?: string;
      userAgent?: string;
      signerName?: string;
      signerRole?: string;
    },
  ): Promise<PatientDocumentDocument> {
    const document = await this.documentModel
      .findOneAndUpdate(
        { id, tenantId, isDeleted: false },
        {
          $push: { additionalSignatures: signatureData },
          $set: { updatedAt: new Date() },
          $inc: { version: 1 },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!document) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    return document;
  }

  /**
   * Find documents requiring signature that are not yet signed
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Unsigned documents
   */
  async findUnsignedDocuments(
    patientId: string,
    tenantId: string,
  ): Promise<PatientDocumentDocument[]> {
    return this.documentModel
      .find({
        tenantId,
        patientId,
        isDeleted: false,
        requiresSignature: true,
        'signature.signedAt': { $exists: false },
      })
      .sort({ uploadedAt: -1 })
      .exec();
  }

  /**
   * Find expiring documents
   *
   * @param tenantId - Tenant ID for isolation
   * @param beforeDate - Find documents expiring before this date
   * @param category - Optional category filter
   * @returns Expiring documents
   */
  async findExpiringDocuments(
    tenantId: string,
    beforeDate: Date,
    category?: DocumentCategory,
  ): Promise<PatientDocumentDocument[]> {
    const query: FilterQuery<PatientDocumentDocument> = {
      tenantId,
      isDeleted: false,
      expiryDate: {
        $exists: true,
        $ne: null,
        $lte: beforeDate,
      },
    };

    if (category) {
      query.category = category;
    }

    return this.documentModel.find(query).sort({ expiryDate: 1 }).exec();
  }

  /**
   * Count documents by category for a patient
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns Count by category
   */
  async countByCategory(
    patientId: string,
    tenantId: string,
  ): Promise<Array<{ category: DocumentCategory; count: number }>> {
    const result = await this.documentModel.aggregate([
      {
        $match: {
          tenantId,
          patientId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return result as Array<{ category: DocumentCategory; count: number }>;
  }

  /**
   * Get all documents for GDPR data export
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @returns All patient documents (including deleted)
   */
  async findAllForExport(patientId: string, tenantId: string): Promise<PatientDocumentDocument[]> {
    return this.documentModel
      .find({
        tenantId,
        patientId,
      })
      .sort({ uploadedAt: -1 })
      .exec();
  }

  /**
   * Bulk soft delete documents (for GDPR erasure)
   *
   * @param patientId - Patient ID
   * @param tenantId - Tenant ID for isolation
   * @param deletedBy - User ID performing deletion
   * @param reason - Reason for deletion
   * @returns Number of documents deleted
   */
  async bulkSoftDelete(
    patientId: string,
    tenantId: string,
    deletedBy: string,
    reason: string,
  ): Promise<number> {
    const result = await this.documentModel.updateMany(
      {
        tenantId,
        patientId,
        isDeleted: false,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
          deletionReason: reason,
        },
      },
    );

    return result.modifiedCount;
  }
}
