/**
 * Clinical Notes Repository
 *
 * Data access layer for clinical notes with built-in multi-tenant isolation.
 * All queries are automatically scoped to the tenant context.
 *
 * CRITICAL SECURITY: Every query MUST include tenantId filter.
 * This is enforced at the repository level to prevent data leakage.
 *
 * CLINICAL SAFETY:
 * - No hard deletes allowed (soft delete only)
 * - All changes create audit trail entries
 * - Optimistic locking prevents concurrent modification
 * - Version tracking for amendment chain
 *
 * @module clinical-notes/repository
 */

import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, ClientSession, FilterQuery } from 'mongoose';
import * as crypto from 'crypto';
import {
  ClinicalNote,
  ClinicalNoteDocument,
  ClinicalNoteHistory,
  ClinicalNoteHistoryDocument,
  ClinicalNoteStatus,
  DigitalSignature,
  Attachment,
  Diagnosis,
  ProcedureNote,
} from './entities/clinical-note.schema';
import { ClinicalNoteQueryDto } from './dto/clinical-note.dto';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Tenant context for all repository operations
 */
export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

/**
 * Context for audit logging
 */
export interface AuditContext extends TenantContext {
  userId: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Result of paginated queries
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * History entry input
 */
export interface HistoryEntryInput {
  clinicalNoteId: string;
  patientId: string;
  changeType: string;
  previousStatus?: string;
  newStatus?: string;
  version?: number;
  changes?: Record<string, unknown>;
  documentSnapshot?: Record<string, unknown>;
  reason?: string;
  itemId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// REPOSITORY IMPLEMENTATION
// ============================================================================

@Injectable()
export class ClinicalNotesRepository {
  private readonly logger = new Logger(ClinicalNotesRepository.name);

  constructor(
    @InjectModel(ClinicalNote.name)
    private readonly clinicalNoteModel: Model<ClinicalNoteDocument>,
    @InjectModel(ClinicalNoteHistory.name)
    private readonly historyModel: Model<ClinicalNoteHistoryDocument>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Find clinical note by ID with tenant isolation
   *
   * SECURITY: Always filters by tenantId to prevent cross-tenant access
   */
  async findById(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<ClinicalNoteDocument | null> {
    const filter: FilterQuery<ClinicalNoteDocument> = {
      _id: id,
      tenantId: context.tenantId,
    };

    if (!options?.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    return this.clinicalNoteModel.findOne(filter).exec();
  }

  /**
   * Find clinical note by ID or throw NotFoundException
   */
  async findByIdOrFail(
    id: string,
    context: TenantContext,
    options?: { includeDeleted?: boolean },
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findById(id, context, options);
    if (!note) {
      throw new NotFoundException(`Clinical note with ID ${id} not found`);
    }
    return note;
  }

  /**
   * Find all clinical notes for a patient with pagination
   */
  async findByPatient(
    patientId: string,
    context: TenantContext,
    query: ClinicalNoteQueryDto,
  ): Promise<PaginatedResult<ClinicalNoteDocument>> {
    const filter: FilterQuery<ClinicalNoteDocument> = {
      patientId,
      tenantId: context.tenantId,
    };

    // Apply optional filters
    if (query.noteType) {
      filter.noteType = query.noteType;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.authorId) {
      filter.authorId = query.authorId;
    }

    if (query.appointmentId) {
      filter.appointmentId = query.appointmentId;
    }

    if (query.treatmentPlanId) {
      filter.treatmentPlanId = query.treatmentPlanId;
    }

    if (query.fromDate || query.toDate) {
      filter.createdAt = {};
      if (query.fromDate) {
        filter.createdAt.$gte = query.fromDate;
      }
      if (query.toDate) {
        filter.createdAt.$lte = query.toDate;
      }
    }

    if (!query.includeDeleted) {
      filter.deletedAt = { $exists: false };
    }

    // Calculate pagination
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    // Build sort
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [query.sortBy]: sortDirection };

    // Execute query with count
    const [data, total] = await Promise.all([
      this.clinicalNoteModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.clinicalNoteModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find unsigned draft notes by author (for signature workflow)
   */
  async findUnsignedDraftsByAuthor(
    authorId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    return this.clinicalNoteModel
      .find({
        authorId,
        tenantId: context.tenantId,
        status: 'draft',
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find notes linked to an appointment
   */
  async findByAppointment(
    appointmentId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    return this.clinicalNoteModel
      .find({
        appointmentId,
        tenantId: context.tenantId,
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get version history for a note (follows amendment chain)
   */
  async getVersionHistory(
    noteId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    const versions: ClinicalNoteDocument[] = [];
    let currentId: string | undefined = noteId;

    // Walk backwards through the amendment chain
    while (currentId) {
      const note = await this.findById(currentId, context, { includeDeleted: true });
      if (!note) break;

      versions.push(note);
      currentId = note.previousVersionId;
    }

    return versions;
  }

  /**
   * Find all amendments to a note (forward chain)
   */
  async findAmendments(
    noteId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    return this.clinicalNoteModel
      .find({
        previousVersionId: noteId,
        tenantId: context.tenantId,
      })
      .sort({ version: 1 })
      .exec();
  }

  /**
   * Count notes by status for a clinic (dashboard metrics)
   */
  async countByStatus(
    context: TenantContext,
  ): Promise<Record<ClinicalNoteStatus, number>> {
    const results = await this.clinicalNoteModel.aggregate([
      {
        $match: {
          tenantId: context.tenantId,
          clinicId: context.clinicId,
          deletedAt: { $exists: false },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize all statuses with 0
    const counts: Record<string, number> = {
      draft: 0,
      signed: 0,
      amended: 0,
    };

    // Fill in actual counts
    for (const result of results) {
      counts[result._id] = result.count;
    }

    return counts as Record<ClinicalNoteStatus, number>;
  }

  /**
   * Find draft notes older than specified hours (for compliance monitoring)
   */
  async findStaleDrafts(
    hours: number,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.clinicalNoteModel
      .find({
        tenantId: context.tenantId,
        status: 'draft',
        createdAt: { $lt: cutoffDate },
        deletedAt: { $exists: false },
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  // ============================================================================
  // MUTATION METHODS
  // ============================================================================

  /**
   * Create a new clinical note
   */
  async create(
    data: Partial<ClinicalNote>,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = new this.clinicalNoteModel({
      ...data,
      tenantId: auditContext.tenantId,
      organizationId: auditContext.organizationId,
      clinicId: auditContext.clinicId,
      createdBy: auditContext.userId,
      updatedBy: auditContext.userId,
      status: 'draft',
      version: 1,
      schemaVersion: 1,
    });

    const saved = await note.save();

    // Log creation in history
    await this.logHistory(
      {
        clinicalNoteId: saved._id.toString(),
        patientId: saved.patientId,
        changeType: 'created',
        newStatus: saved.status,
        version: saved.version,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.log(
      `Created clinical note ${saved._id} for patient ${saved.patientId}`,
    );

    return saved;
  }

  /**
   * Update a draft clinical note
   *
   * IMPORTANT: Only notes in 'draft' status can be updated.
   * Uses optimistic locking to prevent concurrent modification.
   */
  async update(
    id: string,
    updates: Partial<ClinicalNote>,
    expectedVersion: number,
    auditContext: AuditContext,
    reason?: string,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    // Optimistic locking check
    if (note.version !== expectedVersion) {
      throw new ConflictException(
        `Note was modified by another user. Expected version ${expectedVersion}, found ${note.version}. Please refresh and try again.`,
      );
    }

    // Track changes for history
    const changes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = (note as unknown as Record<string, unknown>)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
        changes[key] = { old: oldValue, new: value };
      }
    }

    // Apply updates
    Object.assign(note, updates);
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    // Log update in history
    if (Object.keys(changes).length > 0) {
      await this.logHistory(
        {
          clinicalNoteId: id,
          patientId: note.patientId,
          changeType: 'updated',
          version: saved.version,
          changes,
          reason,
        },
        auditContext,
      );
    }

    return saved;
  }

  /**
   * Sign a clinical note (transitions draft -> signed)
   *
   * CRITICAL: Only the author can sign their own notes.
   * Creates a content hash for integrity verification.
   */
  async signNote(
    id: string,
    signature: Omit<DigitalSignature, 'contentHash'>,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    // Create content hash for integrity verification
    const contentHash = this.createContentHash(note);

    const fullSignature: DigitalSignature = {
      ...signature,
      contentHash,
    };

    note.signature = fullSignature;
    note.status = 'signed';
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    // Log signing in history with full document snapshot
    await this.logHistory(
      {
        clinicalNoteId: id,
        patientId: note.patientId,
        changeType: 'signed',
        previousStatus: 'draft',
        newStatus: 'signed',
        version: saved.version,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.log(
      `Clinical note ${id} signed by ${signature.signedBy}`,
    );

    return saved;
  }

  /**
   * Create an amendment to a signed note
   *
   * CRITICAL: Amendments create a new note version while preserving the original.
   * The original note's status changes to 'amended'.
   */
  async createAmendment(
    originalId: string,
    amendmentData: Partial<ClinicalNote> & { amendmentReason: string },
    auditContext: AuditContext,
  ): Promise<{ original: ClinicalNoteDocument; amendment: ClinicalNoteDocument }> {
    const session = await this.startSession();

    try {
      session.startTransaction();

      // Get and update original note
      const original = await this.findByIdOrFail(originalId, auditContext);
      const previousVersion = original.version;

      // Mark original as amended
      original.status = 'amended';
      original.updatedBy = auditContext.userId;
      original.version += 1;
      await original.save({ session });

      // Create the new amendment note
      const amendment = new this.clinicalNoteModel({
        // Copy relevant fields from original
        patientId: original.patientId,
        tenantId: original.tenantId,
        organizationId: original.organizationId,
        clinicId: original.clinicId,
        appointmentId: original.appointmentId,
        noteType: original.noteType,
        authorId: original.authorId,
        authorName: original.authorName,
        authorCredentials: original.authorCredentials,
        treatmentPlanId: original.treatmentPlanId,
        tags: original.tags,

        // Apply amendments
        soap: amendmentData.soap || original.soap,
        chiefComplaint: amendmentData.chiefComplaint ?? original.chiefComplaint,
        diagnoses: amendmentData.diagnoses || original.diagnoses,
        procedures: amendmentData.procedures || original.procedures,
        attachments: original.attachments, // Keep original attachments
        title: original.title,
        content: amendmentData.content ?? original.content,

        // Amendment-specific fields
        previousVersionId: originalId,
        amendmentReason: amendmentData.amendmentReason,
        version: previousVersion + 1,
        status: 'draft', // New amendments start as drafts

        // Audit fields
        createdBy: auditContext.userId,
        updatedBy: auditContext.userId,
        schemaVersion: 1,
      });

      const savedAmendment = await amendment.save({ session });

      // Log the amendment in history
      await this.historyModel.create(
        [
          {
            clinicalNoteId: originalId,
            patientId: original.patientId,
            tenantId: auditContext.tenantId,
            organizationId: auditContext.organizationId,
            clinicId: auditContext.clinicId,
            changeType: 'amended',
            previousStatus: 'signed',
            newStatus: 'amended',
            version: original.version,
            reason: amendmentData.amendmentReason,
            changedBy: auditContext.userId,
            changedByName: auditContext.userName,
            ipAddress: auditContext.ipAddress,
            userAgent: auditContext.userAgent,
            metadata: { amendmentNoteId: savedAmendment._id.toString() },
          },
        ],
        { session },
      );

      await session.commitTransaction();

      this.logger.log(
        `Created amendment ${savedAmendment._id} for note ${originalId}`,
      );

      return { original, amendment: savedAmendment };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add an attachment to a note
   */
  async addAttachment(
    id: string,
    attachment: Partial<Attachment>,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    const fullAttachment = {
      ...attachment,
      uploadedBy: auditContext.userId,
      uploadedAt: new Date(),
    };

    note.attachments.push(fullAttachment as Attachment);
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    // Log attachment addition
    await this.logHistory(
      {
        clinicalNoteId: id,
        patientId: note.patientId,
        changeType: 'attachment_added',
        version: saved.version,
        itemId: attachment.fileId,
        changes: { attachment: fullAttachment },
      },
      auditContext,
    );

    return saved;
  }

  /**
   * Add a diagnosis to a note
   */
  async addDiagnosis(
    id: string,
    diagnosis: Partial<Diagnosis>,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    note.diagnoses.push(diagnosis as Diagnosis);
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    await this.logHistory(
      {
        clinicalNoteId: id,
        patientId: note.patientId,
        changeType: 'diagnosis_added',
        version: saved.version,
        changes: { diagnosis },
      },
      auditContext,
    );

    return saved;
  }

  /**
   * Add a procedure to a note
   */
  async addProcedure(
    id: string,
    procedure: Partial<ProcedureNote>,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    note.procedures.push(procedure as ProcedureNote);
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    await this.logHistory(
      {
        clinicalNoteId: id,
        patientId: note.patientId,
        changeType: 'procedure_added',
        version: saved.version,
        changes: { procedure },
      },
      auditContext,
    );

    return saved;
  }

  /**
   * Mark a procedure as completed
   */
  async completeProcedure(
    noteId: string,
    procedureId: string,
    completionData: { completedAt?: Date; performedBy?: string; notes?: string },
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(noteId, auditContext);

    const procedure = note.procedures.find(
      (p) => p._id.toString() === procedureId,
    );
    if (!procedure) {
      throw new NotFoundException(`Procedure ${procedureId} not found in note`);
    }

    procedure.status = 'completed';
    procedure.completedAt = completionData.completedAt || new Date();
    if (completionData.performedBy) {
      procedure.performedBy = completionData.performedBy;
    }
    if (completionData.notes) {
      procedure.notes = completionData.notes;
    }

    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    await this.logHistory(
      {
        clinicalNoteId: noteId,
        patientId: note.patientId,
        changeType: 'procedure_completed',
        version: saved.version,
        itemId: procedureId,
        changes: {
          procedure: {
            _id: procedure._id.toString(),
            cdtCode: procedure.cdtCode,
            description: procedure.description,
            teeth: procedure.teeth,
            surfaces: procedure.surfaces,
            status: procedure.status,
            completedAt: procedure.completedAt,
            performedBy: procedure.performedBy,
            notes: procedure.notes,
            procedureRecordId: procedure.procedureRecordId,
          },
        },
      },
      auditContext,
    );

    return saved;
  }

  /**
   * Soft delete a clinical note
   *
   * CLINICAL SAFETY: Clinical notes are NEVER hard deleted.
   * Soft delete preserves the record for legal/compliance requirements.
   */
  async softDelete(
    id: string,
    reason: string,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.findByIdOrFail(id, auditContext);

    note.deletedAt = new Date();
    note.deletedBy = auditContext.userId;
    note.deleteReason = reason;
    note.updatedBy = auditContext.userId;
    note.version += 1;

    const saved = await note.save();

    await this.logHistory(
      {
        clinicalNoteId: id,
        patientId: note.patientId,
        changeType: 'deleted',
        previousStatus: note.status,
        version: saved.version,
        reason,
        documentSnapshot: saved.toObject() as unknown as Record<string, unknown>,
      },
      auditContext,
    );

    this.logger.warn(
      `Soft deleted clinical note ${id} by user ${auditContext.userId}. Reason: ${reason}`,
    );

    return saved;
  }

  // ============================================================================
  // HISTORY METHODS
  // ============================================================================

  /**
   * Log a history entry
   */
  private async logHistory(
    entry: HistoryEntryInput,
    auditContext: AuditContext,
    session?: ClientSession,
  ): Promise<ClinicalNoteHistoryDocument> {
    const history = new this.historyModel({
      ...entry,
      tenantId: auditContext.tenantId,
      organizationId: auditContext.organizationId,
      clinicId: auditContext.clinicId,
      changedBy: auditContext.userId,
      changedByName: auditContext.userName,
      ipAddress: auditContext.ipAddress,
      userAgent: auditContext.userAgent,
    });

    if (session) {
      return history.save({ session });
    }
    return history.save();
  }

  /**
   * Log access to a note (for HIPAA compliance)
   */
  async logAccess(
    noteId: string,
    patientId: string,
    auditContext: AuditContext,
  ): Promise<void> {
    await this.logHistory(
      {
        clinicalNoteId: noteId,
        patientId,
        changeType: 'accessed',
      },
      auditContext,
    );
  }

  /**
   * Get audit history for a clinical note
   */
  async getHistory(
    clinicalNoteId: string,
    context: TenantContext,
    options?: { limit?: number; offset?: number },
  ): Promise<ClinicalNoteHistoryDocument[]> {
    return this.historyModel
      .find({
        clinicalNoteId,
        tenantId: context.tenantId,
      })
      .sort({ createdAt: -1 })
      .skip(options?.offset ?? 0)
      .limit(options?.limit ?? 50)
      .exec();
  }

  /**
   * Get patient's full clinical note access history (for HIPAA audits)
   */
  async getPatientAuditHistory(
    patientId: string,
    context: TenantContext,
    options?: {
      limit?: number;
      offset?: number;
      fromDate?: Date;
      toDate?: Date;
      changeType?: string;
    },
  ): Promise<{ data: ClinicalNoteHistoryDocument[]; total: number }> {
    const filter: FilterQuery<ClinicalNoteHistoryDocument> = {
      patientId,
      tenantId: context.tenantId,
    };

    if (options?.fromDate || options?.toDate) {
      filter.createdAt = {};
      if (options.fromDate) {
        filter.createdAt.$gte = options.fromDate;
      }
      if (options.toDate) {
        filter.createdAt.$lte = options.toDate;
      }
    }

    if (options?.changeType) {
      filter.changeType = options.changeType;
    }

    const [data, total] = await Promise.all([
      this.historyModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(options?.offset ?? 0)
        .limit(options?.limit ?? 50)
        .exec(),
      this.historyModel.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  // ============================================================================
  // TRANSACTION SUPPORT
  // ============================================================================

  /**
   * Start a MongoDB session for transactions
   */
  async startSession(): Promise<ClientSession> {
    return this.connection.startSession();
  }

  /**
   * Execute a function within a transaction
   */
  async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.startSession();
    try {
      session.startTransaction();
      const result = await fn(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Create a content hash for signature integrity verification
   * Uses SHA-256 to hash the note content
   */
  private createContentHash(note: ClinicalNoteDocument): string {
    const contentToHash = {
      patientId: note.patientId,
      noteType: note.noteType,
      soap: note.soap,
      chiefComplaint: note.chiefComplaint,
      diagnoses: note.diagnoses,
      procedures: note.procedures,
      content: note.content,
      authorId: note.authorId,
      version: note.version,
    };

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(contentToHash))
      .digest('hex');
  }

  /**
   * Verify content hash for a signed note
   */
  verifyContentHash(note: ClinicalNoteDocument): boolean {
    if (!note.signature?.contentHash) {
      return false;
    }

    const currentHash = this.createContentHash(note);
    return currentHash === note.signature.contentHash;
  }

  /**
   * Check if a note exists
   */
  async exists(id: string, context: TenantContext): Promise<boolean> {
    const count = await this.clinicalNoteModel.countDocuments({
      _id: id,
      tenantId: context.tenantId,
      deletedAt: { $exists: false },
    });
    return count > 0;
  }
}
