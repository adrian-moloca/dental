/**
 * Clinical Notes Module Barrel Export
 *
 * @module clinical-notes
 */

// Module
export { ClinicalNotesModule } from './clinical-notes.module';

// Service
export { ClinicalNotesService } from './clinical-notes.service';

// Repository
export {
  ClinicalNotesRepository,
  TenantContext,
  AuditContext,
  PaginatedResult,
} from './clinical-notes.repository';

// Entities
export {
  ClinicalNote,
  ClinicalNoteDocument,
  ClinicalNoteSchema,
  ClinicalNoteHistory,
  ClinicalNoteHistoryDocument,
  ClinicalNoteHistorySchema,
  CLINICAL_NOTE_TYPES,
  CLINICAL_NOTE_STATUSES,
  ATTACHMENT_TYPES,
  PROCEDURE_NOTE_STATUSES,
  VALID_NOTE_STATUS_TRANSITIONS,
  DRAFT_EDIT_WINDOW_MS,
  ClinicalNoteType,
  ClinicalNoteStatus,
  AttachmentType,
  ProcedureNoteStatus,
} from './entities/clinical-note.schema';

// DTOs
export {
  CreateClinicalNoteSchema,
  CreateClinicalNoteDto,
  UpdateClinicalNoteSchema,
  UpdateClinicalNoteDto,
  SignClinicalNoteSchema,
  SignClinicalNoteDto,
  AmendClinicalNoteSchema,
  AmendClinicalNoteDto,
  ClinicalNoteQuerySchema,
  ClinicalNoteQueryDto,
  AddAttachmentSchema,
  AddAttachmentDto,
  CreateDiagnosisSchema,
  CreateDiagnosisDto,
  CreateProcedureNoteSchema,
  CreateProcedureNoteDto,
  CompleteProcedureSchema,
  CompleteProcedureDto,
  validateICD10Format,
  validateCDTFormat,
  validateFDITooth,
  validateSurface,
} from './dto/clinical-note.dto';

// Events
export {
  CLINICAL_NOTE_EVENTS,
  ClinicalNoteCreatedEvent,
  ClinicalNoteSignedEvent,
  ClinicalNoteAmendedEvent,
  ClinicalNoteDeletedEvent,
  ClinicalNoteAttachmentAddedEvent,
  ClinicalNoteProcedureCompletedEvent,
  ClinicalNoteDiagnosisAddedEvent,
  createClinicalNoteCreatedEvent,
  createClinicalNoteSignedEvent,
  createClinicalNoteAmendedEvent,
  createClinicalNoteProcedureCompletedEvent,
} from './events/clinical-note.events';
