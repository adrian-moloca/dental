/**
 * Clinical Notes Service
 *
 * Business logic layer for clinical note management.
 * Handles note creation, signing, amendments, and domain event emission.
 *
 * CRITICAL BUSINESS RULES:
 * 1. Notes cannot be deleted (soft delete only for compliance)
 * 2. Signed notes cannot be edited (must create amendment)
 * 3. Amendments create new version, link to previous
 * 4. Provider can only sign their own notes
 * 5. Notes older than 24 hours cannot be edited (even drafts)
 *
 * HIPAA COMPLIANCE:
 * - All access is logged for audit trail
 * - All changes create immutable history records
 * - Digital signatures include content hash for integrity
 *
 * @module clinical-notes/service
 */

import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ClinicalNotesRepository,
  TenantContext,
  AuditContext,
  PaginatedResult,
} from './clinical-notes.repository';
import {
  ClinicalNoteDocument,
  ClinicalNoteStatus,
  VALID_NOTE_STATUS_TRANSITIONS,
  DRAFT_EDIT_WINDOW_MS,
  DigitalSignature,
} from './entities/clinical-note.schema';
import {
  CreateClinicalNoteDto,
  UpdateClinicalNoteDto,
  SignClinicalNoteDto,
  AmendClinicalNoteDto,
  ClinicalNoteQueryDto,
  AddAttachmentDto,
  CreateDiagnosisDto,
  CreateProcedureNoteDto,
  CompleteProcedureDto,
  validateICD10Format,
  validateCDTFormat,
} from './dto/clinical-note.dto';
import {
  CLINICAL_NOTE_EVENTS,
  createClinicalNoteCreatedEvent,
  createClinicalNoteSignedEvent,
  createClinicalNoteAmendedEvent,
  createClinicalNoteProcedureCompletedEvent,
} from './events/clinical-note.events';

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

@Injectable()
export class ClinicalNotesService {
  private readonly logger = new Logger(ClinicalNotesService.name);

  constructor(
    private readonly repository: ClinicalNotesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Get a clinical note by ID
   *
   * Logs access for HIPAA compliance
   */
  async getById(noteId: string, context: AuditContext): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, context);

    // Log access for HIPAA compliance
    await this.repository.logAccess(noteId, note.patientId, context);

    return note;
  }

  /**
   * Get all clinical notes for a patient
   */
  async getByPatient(
    patientId: string,
    context: TenantContext,
    query: ClinicalNoteQueryDto,
  ): Promise<PaginatedResult<ClinicalNoteDocument>> {
    return this.repository.findByPatient(patientId, context, query);
  }

  /**
   * Get notes linked to an appointment
   */
  async getByAppointment(
    appointmentId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    return this.repository.findByAppointment(appointmentId, context);
  }

  /**
   * Get version history for a note (amendment chain)
   */
  async getVersionHistory(noteId: string, context: TenantContext): Promise<ClinicalNoteDocument[]> {
    return this.repository.getVersionHistory(noteId, context);
  }

  /**
   * Get unsigned draft notes by author (for signature workflow)
   */
  async getUnsignedDrafts(
    authorId: string,
    context: TenantContext,
  ): Promise<ClinicalNoteDocument[]> {
    return this.repository.findUnsignedDraftsByAuthor(authorId, context);
  }

  /**
   * Get note audit history
   */
  async getAuditHistory(
    noteId: string,
    context: TenantContext,
    options?: { limit?: number; offset?: number },
  ) {
    // Verify note exists and user has access
    await this.repository.findByIdOrFail(noteId, context);
    return this.repository.getHistory(noteId, context, options);
  }

  /**
   * Get note status counts (for dashboard)
   */
  async getStatusCounts(context: TenantContext) {
    return this.repository.countByStatus(context);
  }

  /**
   * Find stale draft notes (compliance monitoring)
   */
  async findStaleDrafts(hours: number, context: TenantContext): Promise<ClinicalNoteDocument[]> {
    return this.repository.findStaleDrafts(hours, context);
  }

  // ============================================================================
  // CREATE / UPDATE METHODS
  // ============================================================================

  /**
   * Create a new clinical note
   *
   * @param patientId Patient the note is for
   * @param dto Creation data
   * @param authorName Display name of the author
   * @param auditContext Audit information
   */
  async createClinicalNote(
    patientId: string,
    dto: CreateClinicalNoteDto,
    authorName: string,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    // Validate diagnoses codes
    if (dto.diagnoses?.length) {
      await this.validateDiagnoses(dto.diagnoses);
    }

    // Validate procedure codes
    if (dto.procedures?.length) {
      await this.validateProcedures(dto.procedures);
    }

    const note = await this.repository.create(
      {
        patientId,
        appointmentId: dto.appointmentId,
        noteType: dto.noteType,
        soap: dto.soap,
        chiefComplaint: dto.chiefComplaint,
        diagnoses: dto.diagnoses as any,
        procedures: dto.procedures as any,
        title: dto.title,
        content: dto.content,
        treatmentPlanId: dto.treatmentPlanId,
        tags: dto.tags,
        authorId: auditContext.userId,
        authorName,
        authorCredentials: dto.authorCredentials,
      },
      auditContext,
    );

    // Emit domain event
    const event = createClinicalNoteCreatedEvent(
      {
        noteId: note._id.toString(),
        patientId,
        noteType: note.noteType,
        authorId: note.authorId,
        authorName: note.authorName,
        appointmentId: note.appointmentId,
        treatmentPlanId: note.treatmentPlanId,
        hasSOAP: !!note.soap,
        diagnosisCount: note.diagnoses.length,
        procedureCount: note.procedures.length,
      },
      {
        tenantId: auditContext.tenantId,
        organizationId: auditContext.organizationId,
        clinicId: auditContext.clinicId,
        triggeredBy: auditContext.userId,
        triggeredByName: auditContext.userName,
        ipAddress: auditContext.ipAddress,
      },
    );

    this.eventEmitter.emit(CLINICAL_NOTE_EVENTS.CREATED, event);

    this.logger.log(`Created clinical note ${note._id} for patient ${patientId} by ${authorName}`);

    return note;
  }

  /**
   * Update a draft clinical note
   *
   * IMPORTANT: Only notes in 'draft' status can be updated.
   * Signed notes must be amended.
   */
  async updateClinicalNote(
    noteId: string,
    dto: UpdateClinicalNoteDto,
    expectedVersion: number,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Validate status allows updates
    if (note.status !== 'draft') {
      throw new ForbiddenException(
        `Cannot update clinical note in '${note.status}' status. ` +
          `Only draft notes can be modified. Signed notes must be amended.`,
      );
    }

    // Validate edit window (24 hours for drafts)
    this.validateEditWindow(note);

    // Validate author can edit (only author can edit their notes)
    if (note.authorId !== auditContext.userId) {
      throw new ForbiddenException('You can only edit your own clinical notes.');
    }

    // Validate diagnoses codes if being updated
    if (dto.diagnoses?.length) {
      await this.validateDiagnoses(dto.diagnoses);
    }

    // Validate procedure codes if being updated
    if (dto.procedures?.length) {
      await this.validateProcedures(dto.procedures);
    }

    return this.repository.update(
      noteId,
      {
        soap: dto.soap,
        chiefComplaint: dto.chiefComplaint,
        diagnoses: dto.diagnoses as any,
        procedures: dto.procedures as any,
        title: dto.title,
        content: dto.content,
        tags: dto.tags,
      },
      expectedVersion,
      auditContext,
      'Note updated',
    );
  }

  // ============================================================================
  // SIGNING WORKFLOW
  // ============================================================================

  /**
   * Sign a clinical note (digitally finalize)
   *
   * CRITICAL RULES:
   * 1. Only the author can sign their own notes
   * 2. Only draft notes can be signed
   * 3. Creates a content hash for integrity verification
   * 4. Transitions note to 'signed' status
   */
  async signClinicalNote(
    noteId: string,
    dto: SignClinicalNoteDto,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Validate status transition
    this.validateStatusTransition(note.status, 'signed');

    // Validate author can sign (only author can sign their notes)
    if (note.authorId !== auditContext.userId) {
      throw new ForbiddenException(
        'You can only sign your own clinical notes. ' +
          `This note was authored by ${note.authorName}.`,
      );
    }

    // Create signature record
    const signature: Omit<DigitalSignature, 'contentHash'> = {
      signedBy: auditContext.userId,
      signerName: dto.signerName,
      credentials: dto.credentials,
      signedAt: new Date(),
      signatureRef: dto.signatureRef,
      signatureMethod: dto.signatureMethod,
      ipAddress: dto.ipAddress || auditContext.ipAddress,
      userAgent: dto.userAgent || auditContext.userAgent,
    };

    const signedNote = await this.repository.signNote(noteId, signature, auditContext);

    // Emit domain event
    const event = createClinicalNoteSignedEvent(
      {
        noteId: signedNote._id.toString(),
        patientId: signedNote.patientId,
        authorId: signedNote.authorId,
        authorName: signedNote.authorName,
        signedBy: signedNote.signature!.signedBy,
        signerName: signedNote.signature!.signerName,
        signerCredentials: signedNote.signature!.credentials,
        signedAt: signedNote.signature!.signedAt,
        signatureMethod: signedNote.signature!.signatureMethod || 'electronic',
        contentHash: signedNote.signature!.contentHash!,
        noteType: signedNote.noteType,
        version: signedNote.version,
        summary: {
          chiefComplaint: signedNote.chiefComplaint,
          diagnosisCodes: signedNote.diagnoses.map((d) => d.icd10Code),
          procedureCodes: signedNote.procedures.map((p) => p.cdtCode),
          appointmentId: signedNote.appointmentId,
        },
      },
      {
        tenantId: auditContext.tenantId,
        organizationId: auditContext.organizationId,
        clinicId: auditContext.clinicId,
        triggeredBy: auditContext.userId,
        triggeredByName: auditContext.userName,
        ipAddress: auditContext.ipAddress,
      },
    );

    this.eventEmitter.emit(CLINICAL_NOTE_EVENTS.SIGNED, event);

    this.logger.log(`Clinical note ${noteId} signed by ${dto.signerName}`);

    return signedNote;
  }

  // ============================================================================
  // AMENDMENT WORKFLOW
  // ============================================================================

  /**
   * Create an amendment to a signed clinical note
   *
   * CRITICAL: Amendments create a new note version while preserving the original.
   * The original note's status changes to 'amended'.
   * The new amendment starts as a draft and must be signed.
   */
  async amendClinicalNote(
    noteId: string,
    dto: AmendClinicalNoteDto,
    auditContext: AuditContext,
  ): Promise<{ original: ClinicalNoteDocument; amendment: ClinicalNoteDocument }> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Validate status transition
    this.validateStatusTransition(note.status, 'amended');

    // Validate author can amend (only author can amend their notes)
    if (note.authorId !== auditContext.userId) {
      throw new ForbiddenException(
        'You can only amend your own clinical notes. ' +
          `This note was authored by ${note.authorName}.`,
      );
    }

    // Validate amendment reason is provided
    if (!dto.amendmentReason || dto.amendmentReason.trim().length === 0) {
      throw new BadRequestException('Amendment reason is required for clinical note amendments.');
    }

    // Validate any new diagnoses
    if (dto.diagnoses?.length) {
      await this.validateDiagnoses(dto.diagnoses);
    }

    // Validate any new procedures
    if (dto.procedures?.length) {
      await this.validateProcedures(dto.procedures);
    }

    const result = await this.repository.createAmendment(
      noteId,
      {
        amendmentReason: dto.amendmentReason,
        soap: dto.soap,
        chiefComplaint: dto.chiefComplaint,
        diagnoses: dto.diagnoses as any,
        procedures: dto.procedures as any,
        content: dto.content,
        tags: dto.tags,
      },
      auditContext,
    );

    // Determine what changed
    const changesDescription: string[] = [];
    if (dto.soap) changesDescription.push('SOAP content');
    if (dto.chiefComplaint !== undefined) changesDescription.push('Chief complaint');
    if (dto.diagnoses) changesDescription.push('Diagnoses');
    if (dto.procedures) changesDescription.push('Procedures');
    if (dto.content !== undefined) changesDescription.push('Additional content');
    if (dto.tags) changesDescription.push('Tags');

    // Emit domain event
    const event = createClinicalNoteAmendedEvent(
      {
        originalNoteId: noteId,
        amendmentNoteId: result.amendment._id.toString(),
        patientId: note.patientId,
        authorId: note.authorId,
        authorName: note.authorName,
        amendmentReason: dto.amendmentReason,
        originalVersion: note.version,
        amendmentVersion: result.amendment.version,
        changesDescription,
      },
      {
        tenantId: auditContext.tenantId,
        organizationId: auditContext.organizationId,
        clinicId: auditContext.clinicId,
        triggeredBy: auditContext.userId,
        triggeredByName: auditContext.userName,
        ipAddress: auditContext.ipAddress,
      },
    );

    this.eventEmitter.emit(CLINICAL_NOTE_EVENTS.AMENDED, event);

    this.logger.log(
      `Created amendment ${result.amendment._id} for note ${noteId}. Reason: ${dto.amendmentReason}`,
    );

    return result;
  }

  // ============================================================================
  // ATTACHMENT METHODS
  // ============================================================================

  /**
   * Add an attachment to a clinical note
   */
  async addAttachment(
    noteId: string,
    dto: AddAttachmentDto,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Can only add attachments to draft notes
    if (note.status !== 'draft') {
      throw new ForbiddenException(
        `Cannot add attachments to a ${note.status} note. ` + `Only draft notes can be modified.`,
      );
    }

    // Validate edit window
    this.validateEditWindow(note);

    return this.repository.addAttachment(
      noteId,
      {
        fileId: dto.fileId,
        type: dto.type,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        description: dto.description,
        annotations: dto.annotations as any,
      },
      auditContext,
    );
  }

  // ============================================================================
  // DIAGNOSIS METHODS
  // ============================================================================

  /**
   * Add a diagnosis to a clinical note
   */
  async addDiagnosis(
    noteId: string,
    dto: CreateDiagnosisDto,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Can only add diagnoses to draft notes
    if (note.status !== 'draft') {
      throw new ForbiddenException(`Cannot add diagnoses to a ${note.status} note.`);
    }

    this.validateEditWindow(note);

    // Validate ICD-10 code
    await this.validateDiagnoses([dto]);

    return this.repository.addDiagnosis(noteId, dto as any, auditContext);
  }

  /**
   * Validate ICD-10 diagnosis codes
   *
   * CLINICAL SAFETY: Validates code format.
   * Full validation should check against actual ICD-10 database.
   */
  async validateDiagnoses(diagnoses: CreateDiagnosisDto[]): Promise<void> {
    const invalidCodes: string[] = [];

    for (const diagnosis of diagnoses) {
      if (!validateICD10Format(diagnosis.icd10Code)) {
        invalidCodes.push(diagnosis.icd10Code);
      }
    }

    if (invalidCodes.length > 0) {
      throw new BadRequestException(
        `Invalid ICD-10 code format: ${invalidCodes.join(', ')}. ` +
          'ICD-10 codes must be in format: Letter + 2 digits, optionally followed by decimal and up to 4 characters (e.g., K02.9)',
      );
    }

    // TODO: Add lookup against ICD-10 database for full validation
  }

  // ============================================================================
  // PROCEDURE METHODS
  // ============================================================================

  /**
   * Add a procedure to a clinical note
   */
  async addProcedure(
    noteId: string,
    dto: CreateProcedureNoteDto,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Can only add procedures to draft notes
    if (note.status !== 'draft') {
      throw new ForbiddenException(`Cannot add procedures to a ${note.status} note.`);
    }

    this.validateEditWindow(note);

    // Validate CDT code
    await this.validateProcedures([dto]);

    return this.repository.addProcedure(noteId, dto as any, auditContext);
  }

  /**
   * Mark a procedure as completed
   *
   * CRITICAL: This triggers billing and inventory events
   */
  async completeProcedure(
    noteId: string,
    procedureId: string,
    dto: CompleteProcedureDto,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Find the procedure
    const procedure = note.procedures.find((p) => p._id.toString() === procedureId);
    if (!procedure) {
      throw new BadRequestException(`Procedure ${procedureId} not found in note`);
    }

    // Validate procedure isn't already completed
    if (procedure.status === 'completed') {
      throw new ConflictException('This procedure has already been completed');
    }

    const updatedNote = await this.repository.completeProcedure(
      noteId,
      procedureId,
      {
        completedAt: dto.completedAt,
        performedBy: dto.performedBy || auditContext.userId,
        notes: dto.notes,
      },
      auditContext,
    );

    // Find the updated procedure
    const completedProcedure = updatedNote.procedures.find((p) => p._id.toString() === procedureId);

    // Emit procedure completed event
    const event = createClinicalNoteProcedureCompletedEvent(
      {
        noteId: updatedNote._id.toString(),
        patientId: updatedNote.patientId,
        procedureId,
        cdtCode: completedProcedure!.cdtCode,
        description: completedProcedure!.description,
        teeth: completedProcedure!.teeth,
        surfaces: completedProcedure!.surfaces,
        completedAt: completedProcedure!.completedAt!,
        performedBy: completedProcedure!.performedBy || auditContext.userId,
        notes: completedProcedure!.notes,
        procedureRecordId: dto.procedureRecordId,
      },
      {
        tenantId: auditContext.tenantId,
        organizationId: auditContext.organizationId,
        clinicId: auditContext.clinicId,
        triggeredBy: auditContext.userId,
        triggeredByName: auditContext.userName,
        ipAddress: auditContext.ipAddress,
      },
    );

    this.eventEmitter.emit(CLINICAL_NOTE_EVENTS.PROCEDURE_COMPLETED, event);

    this.logger.log(`Procedure ${procedure.cdtCode} completed in note ${noteId}`);

    return updatedNote;
  }

  /**
   * Validate CDT procedure codes
   *
   * CLINICAL SAFETY: Validates code format.
   * Full validation should check against actual ADA CDT database.
   */
  async validateProcedures(procedures: CreateProcedureNoteDto[]): Promise<void> {
    const invalidCodes: string[] = [];

    for (const procedure of procedures) {
      if (!validateCDTFormat(procedure.cdtCode)) {
        invalidCodes.push(procedure.cdtCode);
      }
    }

    if (invalidCodes.length > 0) {
      throw new BadRequestException(
        `Invalid CDT code format: ${invalidCodes.join(', ')}. ` +
          'CDT codes must be in format D#### (e.g., D2391) or custom codes starting with X',
      );
    }

    // TODO: Add lookup against CDT database for full validation
  }

  // ============================================================================
  // SOFT DELETE
  // ============================================================================

  /**
   * Soft delete a clinical note
   *
   * CLINICAL SAFETY: Clinical notes are NEVER hard deleted.
   * This marks the note as deleted while preserving the record.
   */
  async softDeleteNote(
    noteId: string,
    reason: string,
    auditContext: AuditContext,
  ): Promise<ClinicalNoteDocument> {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Deletion reason is required for clinical note deletion.');
    }

    const note = await this.repository.findByIdOrFail(noteId, auditContext);

    // Only draft notes can be soft deleted
    if (note.status === 'signed') {
      throw new ForbiddenException(
        'Signed clinical notes cannot be deleted. ' +
          'If corrections are needed, please create an amendment.',
      );
    }

    return this.repository.softDelete(noteId, reason, auditContext);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  /**
   * Validate status transition is allowed
   */
  private validateStatusTransition(
    currentStatus: ClinicalNoteStatus,
    targetStatus: ClinicalNoteStatus,
  ): void {
    const allowedTransitions = VALID_NOTE_STATUS_TRANSITIONS[currentStatus];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. ` +
          `Allowed transitions from '${currentStatus}': ${allowedTransitions.join(', ') || 'none'}`,
      );
    }
  }

  /**
   * Validate note is within edit window (24 hours)
   *
   * CLINICAL RULE: Draft notes cannot be edited after 24 hours
   */
  private validateEditWindow(note: ClinicalNoteDocument): void {
    const createdAt = new Date(note.createdAt).getTime();
    const now = Date.now();

    if (now - createdAt > DRAFT_EDIT_WINDOW_MS) {
      const hoursAgo = Math.round((now - createdAt) / (60 * 60 * 1000));
      throw new ForbiddenException(
        `This draft note was created ${hoursAgo} hours ago and can no longer be edited. ` +
          'Draft notes can only be edited within 24 hours of creation. ' +
          'Please sign the note as-is or create a new note.',
      );
    }
  }

  /**
   * Verify content integrity of a signed note
   */
  verifyNoteIntegrity(note: ClinicalNoteDocument): boolean {
    return this.repository.verifyContentHash(note);
  }
}
