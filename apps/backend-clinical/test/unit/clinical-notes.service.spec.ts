/**
 * Clinical Notes Service Unit Tests
 *
 * Comprehensive tests for the SOAP clinical notes service.
 * Covers note creation, signing workflow, amendments, and domain event emission.
 *
 * CLINICAL SAFETY: Tests verify that:
 * - Signed notes cannot be modified (must create amendment)
 * - Drafts cannot be edited after 24 hours
 * - Only authors can sign their own notes
 * - Amendment reason is always required
 * - ICD-10 and CDT codes are validated
 *
 * @module clinical-notes/tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { ClinicalNotesService } from '../../src/modules/clinical-notes/clinical-notes.service';
import { ClinicalNotesRepository, AuditContext } from '../../src/modules/clinical-notes/clinical-notes.repository';
import { CLINICAL_NOTE_EVENTS } from '../../src/modules/clinical-notes/events/clinical-note.events';
import {
  ClinicalNoteDocument,
  DRAFT_EDIT_WINDOW_MS,
} from '../../src/modules/clinical-notes/entities/clinical-note.schema';
import {
  CreateClinicalNoteDto,
  UpdateClinicalNoteDto,
  SignClinicalNoteDto,
  AmendClinicalNoteDto,
  CreateDiagnosisDto,
  CreateProcedureNoteDto,
} from '../../src/modules/clinical-notes/dto/clinical-note.dto';

// ============================================================================
// MOCK SETUP
// ============================================================================

const mockAuditContext: AuditContext = {
  tenantId: 'tenant-123',
  organizationId: 'org-123',
  clinicId: 'clinic-123',
  userId: 'user-123',
  userName: 'Dr. Smith',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
};

const createMockNote = (overrides: Partial<ClinicalNoteDocument> = {}): ClinicalNoteDocument => {
  const baseNote = {
    _id: { toString: () => 'note-123' },
    patientId: 'patient-123',
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    clinicId: 'clinic-123',
    noteType: 'soap' as const,
    status: 'draft' as const,
    version: 1,
    authorId: 'user-123',
    authorName: 'Dr. Smith',
    soap: {
      subjective: 'Patient complains of tooth pain',
      objective: 'Caries detected on tooth 14',
      assessment: 'Dental caries requiring restoration',
      plan: 'Schedule filling procedure',
    },
    diagnoses: [],
    procedures: [],
    attachments: [],
    tags: [],
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({}),
  };

  return { ...baseNote, ...overrides } as unknown as ClinicalNoteDocument;
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('ClinicalNotesService', () => {
  let service: ClinicalNotesService;
  let repository: jest.Mocked<ClinicalNotesRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
      findByPatient: jest.fn(),
      findByAppointment: jest.fn(),
      findUnsignedDraftsByAuthor: jest.fn(),
      update: jest.fn(),
      signNote: jest.fn(),
      createAmendment: jest.fn(),
      addAttachment: jest.fn(),
      addDiagnosis: jest.fn(),
      addProcedure: jest.fn(),
      completeProcedure: jest.fn(),
      softDelete: jest.fn(),
      getHistory: jest.fn(),
      getVersionHistory: jest.fn(),
      logAccess: jest.fn(),
      countByStatus: jest.fn(),
      findStaleDrafts: jest.fn(),
      verifyContentHash: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalNotesService,
        { provide: ClinicalNotesRepository, useValue: mockRepository },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<ClinicalNotesService>(ClinicalNotesService);
    repository = module.get(ClinicalNotesRepository);
    eventEmitter = module.get(EventEmitter2);
  });

  // ============================================================================
  // NOTE CREATION TESTS
  // ============================================================================

  describe('createClinicalNote', () => {
    it('should create a new clinical note with SOAP format', async () => {
      const dto: CreateClinicalNoteDto = {
        noteType: 'soap',
        soap: {
          subjective: 'Patient reports pain when chewing',
          objective: 'Deep caries visible on tooth 16 MOD',
          assessment: 'Irreversible pulpitis, tooth 16',
          plan: 'Root canal therapy followed by crown',
        },
        diagnoses: [],
        procedures: [],
        tags: [],
      };

      const expectedNote = createMockNote({
        noteType: 'soap',
        soap: dto.soap,
      });

      repository.create.mockResolvedValue(expectedNote);

      const result = await service.createClinicalNote(
        'patient-123',
        dto,
        'Dr. Smith',
        mockAuditContext,
      );

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: 'patient-123',
          noteType: 'soap',
          soap: dto.soap,
          authorId: mockAuditContext.userId,
          authorName: 'Dr. Smith',
        }),
        mockAuditContext,
      );
      expect(result).toEqual(expectedNote);
    });

    it('should create a note linked to an appointment', async () => {
      const dto: CreateClinicalNoteDto = {
        appointmentId: 'appointment-456',
        noteType: 'soap',
        diagnoses: [],
        procedures: [],
        tags: [],
      };

      const expectedNote = createMockNote({ appointmentId: 'appointment-456' });
      repository.create.mockResolvedValue(expectedNote);

      await service.createClinicalNote('patient-123', dto, 'Dr. Smith', mockAuditContext);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: 'appointment-456',
        }),
        mockAuditContext,
      );
    });

    it('should emit ClinicalNoteCreated event after creation', async () => {
      const dto: CreateClinicalNoteDto = {
        noteType: 'soap',
        diagnoses: [],
        procedures: [],
        tags: [],
      };

      repository.create.mockResolvedValue(createMockNote());

      await service.createClinicalNote('patient-123', dto, 'Dr. Smith', mockAuditContext);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CLINICAL_NOTE_EVENTS.CREATED,
        expect.objectContaining({
          noteId: 'note-123',
          patientId: 'patient-123',
          noteType: 'soap',
          authorId: 'user-123',
        }),
      );
    });

    it('should validate ICD-10 diagnosis codes', async () => {
      const dto: CreateClinicalNoteDto = {
        noteType: 'soap',
        diagnoses: [
          { icd10Code: 'INVALID', description: 'Test', isPrimary: true },
        ],
        procedures: [],
        tags: [],
      };

      await expect(
        service.createClinicalNote('patient-123', dto, 'Dr. Smith', mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate CDT procedure codes', async () => {
      const dto: CreateClinicalNoteDto = {
        noteType: 'soap',
        diagnoses: [],
        procedures: [
          { cdtCode: 'INVALID', description: 'Test', status: 'planned', teeth: [], surfaces: [] },
        ],
        tags: [],
      };

      await expect(
        service.createClinicalNote('patient-123', dto, 'Dr. Smith', mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid ICD-10 and CDT codes', async () => {
      const dto: CreateClinicalNoteDto = {
        noteType: 'soap',
        diagnoses: [
          { icd10Code: 'K02.9', description: 'Dental caries, unspecified', isPrimary: true },
          { icd10Code: 'K04.0', description: 'Pulpitis', isPrimary: false },
        ],
        procedures: [
          { cdtCode: 'D2391', description: 'Resin-based composite', status: 'planned', teeth: ['14'], surfaces: ['M', 'O'] },
        ],
        tags: [],
      };

      const expectedNote = createMockNote({
        diagnoses: dto.diagnoses as any,
        procedures: dto.procedures as any,
      });
      repository.create.mockResolvedValue(expectedNote);

      const result = await service.createClinicalNote(
        'patient-123',
        dto,
        'Dr. Smith',
        mockAuditContext,
      );

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // NOTE UPDATE TESTS
  // ============================================================================

  describe('updateClinicalNote', () => {
    it('should update a draft note', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const dto: UpdateClinicalNoteDto = {
        soap: {
          subjective: 'Updated subjective',
          objective: 'Updated objective',
          assessment: 'Updated assessment',
          plan: 'Updated plan',
        },
      };

      const updatedNote = createMockNote({ ...draftNote, soap: dto.soap, version: 2 });
      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.update.mockResolvedValue(updatedNote);

      const result = await service.updateClinicalNote('note-123', dto, 1, mockAuditContext);

      expect(repository.update).toHaveBeenCalledWith(
        'note-123',
        expect.objectContaining({ soap: dto.soap }),
        1,
        mockAuditContext,
        'Note updated',
      );
      expect(result.version).toBe(2);
    });

    it('should reject updates to signed notes', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.updateClinicalNote('note-123', {}, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject updates to amended notes', async () => {
      const amendedNote = createMockNote({ status: 'amended' });
      repository.findByIdOrFail.mockResolvedValue(amendedNote);

      await expect(
        service.updateClinicalNote('note-123', {}, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject updates from non-author', async () => {
      const draftNote = createMockNote({ status: 'draft', authorId: 'other-user' });
      repository.findByIdOrFail.mockResolvedValue(draftNote);

      await expect(
        service.updateClinicalNote('note-123', {}, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject updates to notes older than 24 hours', async () => {
      const oldCreatedAt = new Date(Date.now() - DRAFT_EDIT_WINDOW_MS - 1000);
      const oldDraft = createMockNote({ status: 'draft', createdAt: oldCreatedAt });
      repository.findByIdOrFail.mockResolvedValue(oldDraft);

      await expect(
        service.updateClinicalNote('note-123', {}, 1, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // SIGNING WORKFLOW TESTS
  // ============================================================================

  describe('signClinicalNote', () => {
    it('should sign a draft note', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const dto: SignClinicalNoteDto = {
        signerName: 'Dr. Smith, DDS',
        credentials: 'DDS',
        signatureMethod: 'electronic',
      };

      const signedNote = createMockNote({
        status: 'signed',
        signature: {
          signedBy: 'user-123',
          signerName: 'Dr. Smith, DDS',
          credentials: 'DDS',
          signedAt: new Date(),
          signatureMethod: 'electronic',
          contentHash: 'hash-abc',
        },
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.signNote.mockResolvedValue(signedNote);

      const result = await service.signClinicalNote('note-123', dto, mockAuditContext);

      expect(repository.signNote).toHaveBeenCalled();
      expect(result.status).toBe('signed');
      expect(result.signature).toBeDefined();
    });

    it('should emit ClinicalNoteSigned event', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const dto: SignClinicalNoteDto = {
        signerName: 'Dr. Smith',
        signatureMethod: 'electronic',
      };

      const signedNote = createMockNote({
        status: 'signed',
        signature: {
          signedBy: 'user-123',
          signerName: 'Dr. Smith',
          signedAt: new Date(),
          contentHash: 'hash',
          signatureMethod: 'electronic',
        },
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.signNote.mockResolvedValue(signedNote);

      await service.signClinicalNote('note-123', dto, mockAuditContext);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CLINICAL_NOTE_EVENTS.SIGNED,
        expect.objectContaining({
          noteId: 'note-123',
          signedBy: 'user-123',
        }),
      );
    });

    it('should reject signing notes by non-author', async () => {
      const draftNote = createMockNote({ status: 'draft', authorId: 'other-user' });
      repository.findByIdOrFail.mockResolvedValue(draftNote);

      await expect(
        service.signClinicalNote('note-123', { signerName: 'Test', signatureMethod: 'electronic' }, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject signing already signed notes', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.signClinicalNote('note-123', { signerName: 'Test', signatureMethod: 'electronic' }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject signing amended notes', async () => {
      const amendedNote = createMockNote({ status: 'amended' });
      repository.findByIdOrFail.mockResolvedValue(amendedNote);

      await expect(
        service.signClinicalNote('note-123', { signerName: 'Test', signatureMethod: 'electronic' }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // AMENDMENT WORKFLOW TESTS
  // ============================================================================

  describe('amendClinicalNote', () => {
    it('should create an amendment to a signed note', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      const dto: AmendClinicalNoteDto = {
        amendmentReason: 'Corrected diagnosis code',
        diagnoses: [
          { icd10Code: 'K02.9', description: 'Corrected diagnosis', isPrimary: true },
        ],
      };

      const amendedOriginal = createMockNote({ status: 'amended' });
      const newAmendment = createMockNote({
        _id: { toString: () => 'amendment-456' },
        status: 'draft',
        previousVersionId: 'note-123',
        amendmentReason: dto.amendmentReason,
        version: 2,
      });

      repository.findByIdOrFail.mockResolvedValue(signedNote);
      repository.createAmendment.mockResolvedValue({
        original: amendedOriginal,
        amendment: newAmendment,
      });

      const result = await service.amendClinicalNote('note-123', dto, mockAuditContext);

      expect(result.original.status).toBe('amended');
      expect(result.amendment.previousVersionId).toBe('note-123');
      expect(result.amendment.amendmentReason).toBe(dto.amendmentReason);
    });

    it('should emit ClinicalNoteAmended event', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      const dto: AmendClinicalNoteDto = {
        amendmentReason: 'Correction needed',
      };

      repository.findByIdOrFail.mockResolvedValue(signedNote);
      repository.createAmendment.mockResolvedValue({
        original: createMockNote({ status: 'amended' }),
        amendment: createMockNote({ _id: { toString: () => 'amend-123' }, status: 'draft', version: 2 }),
      });

      await service.amendClinicalNote('note-123', dto, mockAuditContext);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CLINICAL_NOTE_EVENTS.AMENDED,
        expect.objectContaining({
          originalNoteId: 'note-123',
          amendmentReason: 'Correction needed',
        }),
      );
    });

    it('should require amendment reason', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.amendClinicalNote('note-123', { amendmentReason: '' }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject amendments from non-author', async () => {
      const signedNote = createMockNote({ status: 'signed', authorId: 'other-user' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.amendClinicalNote('note-123', { amendmentReason: 'Test' }, mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject amending draft notes', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftNote);

      await expect(
        service.amendClinicalNote('note-123', { amendmentReason: 'Test' }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject amending already amended notes', async () => {
      const amendedNote = createMockNote({ status: 'amended' });
      repository.findByIdOrFail.mockResolvedValue(amendedNote);

      await expect(
        service.amendClinicalNote('note-123', { amendmentReason: 'Test' }, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // DIAGNOSIS TESTS
  // ============================================================================

  describe('addDiagnosis', () => {
    it('should add a diagnosis to a draft note', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const dto: CreateDiagnosisDto = {
        icd10Code: 'K02.9',
        description: 'Dental caries, unspecified',
        isPrimary: true,
      };

      const noteWithDiagnosis = createMockNote({
        diagnoses: [dto as any],
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.addDiagnosis.mockResolvedValue(noteWithDiagnosis);

      const result = await service.addDiagnosis('note-123', dto, mockAuditContext);

      expect(repository.addDiagnosis).toHaveBeenCalled();
      expect(result.diagnoses).toHaveLength(1);
    });

    it('should reject adding diagnosis to signed note', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.addDiagnosis(
          'note-123',
          { icd10Code: 'K02.9', description: 'Test', isPrimary: false },
          mockAuditContext,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // PROCEDURE TESTS
  // ============================================================================

  describe('addProcedure', () => {
    it('should add a procedure to a draft note', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const dto: CreateProcedureNoteDto = {
        cdtCode: 'D2391',
        description: 'Resin-based composite - one surface, posterior',
        teeth: ['14'],
        surfaces: ['O'],
        status: 'planned',
      };

      const noteWithProcedure = createMockNote({
        procedures: [dto as any],
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.addProcedure.mockResolvedValue(noteWithProcedure);

      const result = await service.addProcedure('note-123', dto, mockAuditContext);

      expect(repository.addProcedure).toHaveBeenCalled();
      expect(result.procedures).toHaveLength(1);
    });
  });

  describe('completeProcedure', () => {
    it('should mark procedure as completed and emit event', async () => {
      const draftNote = createMockNote({
        procedures: [
          {
            _id: { toString: () => 'proc-123' },
            cdtCode: 'D2391',
            description: 'Filling',
            teeth: ['14'],
            surfaces: ['O'],
            status: 'planned',
          } as any,
        ],
      });

      const completedNote = createMockNote({
        procedures: [
          {
            _id: { toString: () => 'proc-123' },
            cdtCode: 'D2391',
            description: 'Filling',
            teeth: ['14'],
            surfaces: ['O'],
            status: 'completed',
            completedAt: new Date(),
          } as any,
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.completeProcedure.mockResolvedValue(completedNote);

      const result = await service.completeProcedure(
        'note-123',
        'proc-123',
        {},
        mockAuditContext,
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        CLINICAL_NOTE_EVENTS.PROCEDURE_COMPLETED,
        expect.objectContaining({
          procedureId: 'proc-123',
          cdtCode: 'D2391',
        }),
      );
    });

    it('should reject completing already completed procedure', async () => {
      const noteWithCompletedProc = createMockNote({
        procedures: [
          {
            _id: { toString: () => 'proc-123' },
            cdtCode: 'D2391',
            description: 'Filling',
            status: 'completed',
            teeth: [],
            surfaces: [],
          } as any,
        ],
      });

      repository.findByIdOrFail.mockResolvedValue(noteWithCompletedProc);

      await expect(
        service.completeProcedure('note-123', 'proc-123', {}, mockAuditContext),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject completing non-existent procedure', async () => {
      const noteWithoutProc = createMockNote({ procedures: [] });
      repository.findByIdOrFail.mockResolvedValue(noteWithoutProc);

      await expect(
        service.completeProcedure('note-123', 'non-existent', {}, mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================================================
  // SOFT DELETE TESTS
  // ============================================================================

  describe('softDeleteNote', () => {
    it('should soft delete a draft note with reason', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      const deletedNote = createMockNote({
        deletedAt: new Date(),
        deletedBy: 'user-123',
        deleteReason: 'Created in error',
      });

      repository.findByIdOrFail.mockResolvedValue(draftNote);
      repository.softDelete.mockResolvedValue(deletedNote);

      const result = await service.softDeleteNote('note-123', 'Created in error', mockAuditContext);

      expect(repository.softDelete).toHaveBeenCalledWith(
        'note-123',
        'Created in error',
        mockAuditContext,
      );
      expect(result.deletedAt).toBeDefined();
    });

    it('should require deletion reason', async () => {
      const draftNote = createMockNote({ status: 'draft' });
      repository.findByIdOrFail.mockResolvedValue(draftNote);

      await expect(
        service.softDeleteNote('note-123', '', mockAuditContext),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject deleting signed notes', async () => {
      const signedNote = createMockNote({ status: 'signed' });
      repository.findByIdOrFail.mockResolvedValue(signedNote);

      await expect(
        service.softDeleteNote('note-123', 'Test reason', mockAuditContext),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================================================
  // QUERY TESTS
  // ============================================================================

  describe('getById', () => {
    it('should return note and log access', async () => {
      const note = createMockNote();
      repository.findByIdOrFail.mockResolvedValue(note);

      const result = await service.getById('note-123', mockAuditContext);

      expect(repository.findByIdOrFail).toHaveBeenCalledWith('note-123', mockAuditContext);
      expect(repository.logAccess).toHaveBeenCalledWith(
        'note-123',
        note.patientId,
        mockAuditContext,
      );
      expect(result).toEqual(note);
    });
  });

  describe('getByPatient', () => {
    it('should return paginated notes for patient', async () => {
      const notes = [createMockNote(), createMockNote()];
      const paginatedResult = {
        data: notes,
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      };

      repository.findByPatient.mockResolvedValue(paginatedResult);

      const result = await service.getByPatient(
        'patient-123',
        { tenantId: 'tenant-123', organizationId: 'org-123', clinicId: 'clinic-123' },
        { page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc', includeDeleted: false },
      );

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getVersionHistory', () => {
    it('should return version history for a note', async () => {
      const versions = [
        createMockNote({ version: 2, previousVersionId: 'note-v1' }),
        createMockNote({ _id: { toString: () => 'note-v1' }, version: 1 }),
      ];

      repository.getVersionHistory.mockResolvedValue(versions);

      const result = await service.getVersionHistory('note-123', {
        tenantId: 'tenant-123',
        organizationId: 'org-123',
        clinicId: 'clinic-123',
      });

      expect(result).toHaveLength(2);
      expect(result[0].version).toBe(2);
      expect(result[1].version).toBe(1);
    });
  });

  // ============================================================================
  // INTEGRITY VERIFICATION TESTS
  // ============================================================================

  describe('verifyNoteIntegrity', () => {
    it('should verify content hash matches', () => {
      const note = createMockNote({
        signature: { signedBy: 'user', signerName: 'Test', signedAt: new Date(), contentHash: 'abc', signatureMethod: 'electronic' },
      });

      repository.verifyContentHash.mockReturnValue(true);

      expect(service.verifyNoteIntegrity(note)).toBe(true);
    });

    it('should detect tampered content', () => {
      const note = createMockNote({
        signature: { signedBy: 'user', signerName: 'Test', signedAt: new Date(), contentHash: 'abc', signatureMethod: 'electronic' },
      });

      repository.verifyContentHash.mockReturnValue(false);

      expect(service.verifyNoteIntegrity(note)).toBe(false);
    });
  });
});
