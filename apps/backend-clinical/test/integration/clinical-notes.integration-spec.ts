/**
 * Clinical Notes Integration Tests
 *
 * End-to-end tests for clinical notes API endpoints.
 * Tests full request/response cycle with MongoDB.
 *
 * HIPAA COMPLIANCE TESTS:
 * - Audit logging for all PHI access
 * - Multi-tenant data isolation
 * - Signature workflow integrity
 * - Amendment chain preservation
 *
 * @module clinical-notes/integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';

import { ClinicalNotesModule } from '../../src/modules/clinical-notes/clinical-notes.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { CLINICAL_NOTE_EVENTS } from '../../src/modules/clinical-notes/events/clinical-note.events';

// ============================================================================
// TEST SETUP
// ============================================================================

describe('Clinical Notes API (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let eventEmitter: EventEmitter2;
  let jwtService: JwtService;
  let authToken: string;

  const mockUser = {
    userId: 'user-123-uuid-4567-890a-bcdef1234567',
    email: 'dr.smith@dental.com',
    displayName: 'Dr. John Smith',
    credentials: 'DDS',
    roles: ['DENTIST'],
    permissions: [
      'clinical:notes:create',
      'clinical:notes:read',
      'clinical:notes:update',
      'clinical:notes:sign',
      'clinical:notes:amend',
      'clinical:notes:delete',
      'clinical:notes:audit',
    ],
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    clinicId: 'clinic-123',
  };

  const testPatientId = 'patient-456-uuid-7890-abcd-ef1234567890';

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        AuthModule,
        ClinicalNotesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    // Get services
    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Generate test JWT
    authToken = `Bearer ${jwtService.sign(mockUser, { secret: 'test-secret', expiresIn: '1h' })}`;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  // ============================================================================
  // CREATE NOTE TESTS
  // ============================================================================

  describe('POST /api/v1/clinical/patients/:patientId/notes', () => {
    it('should create a SOAP clinical note', async () => {
      const createDto = {
        noteType: 'soap',
        chiefComplaint: 'Tooth pain in lower right quadrant',
        soap: {
          subjective: 'Patient reports severe pain when chewing. Started 3 days ago.',
          objective: 'Deep caries visible on tooth 46 MOD. Cold test positive. Percussion negative.',
          assessment: 'Reversible pulpitis secondary to dental caries, tooth 46',
          plan: 'Caries excavation and direct restoration D2393. Review in 2 weeks.',
        },
        diagnoses: [
          {
            icd10Code: 'K02.9',
            description: 'Dental caries, unspecified',
            tooth: '46',
            isPrimary: true,
          },
        ],
        procedures: [
          {
            cdtCode: 'D2393',
            description: 'Resin-based composite - three surfaces, posterior',
            teeth: ['46'],
            surfaces: ['M', 'O', 'D'],
            status: 'planned',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.version).toBe(1);
      expect(response.body.data.noteType).toBe('soap');
    });

    it('should create a progress note', async () => {
      const progressDto = {
        noteType: 'progress',
        title: 'Follow-up visit',
        content: 'Patient reports no pain. Restoration intact.',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send(progressDto)
        .expect(201);

      expect(response.body.data.noteType).toBe('progress');
    });

    it('should reject invalid ICD-10 code', async () => {
      const invalidDto = {
        noteType: 'soap',
        diagnoses: [
          {
            icd10Code: 'INVALID',
            description: 'Test',
            isPrimary: true,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject invalid CDT code', async () => {
      const invalidDto = {
        noteType: 'soap',
        procedures: [
          {
            cdtCode: 'INVALID',
            description: 'Test',
            status: 'planned',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send(invalidDto)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should emit ClinicalNoteCreated event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on(CLINICAL_NOTE_EVENTS.CREATED, eventSpy);

      const createDto = {
        noteType: 'soap',
        chiefComplaint: 'Test',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0]).toMatchObject({
        patientId: testPatientId,
        noteType: 'soap',
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .send({ noteType: 'soap' })
        .expect(401);
    });
  });

  // ============================================================================
  // GET NOTES TESTS
  // ============================================================================

  describe('GET /api/v1/clinical/patients/:patientId/notes', () => {
    let createdNoteId: string;

    beforeAll(async () => {
      // Create a note for testing
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({
          noteType: 'soap',
          chiefComplaint: 'Test note for GET tests',
        });
      createdNoteId = response.body.data.id;
    });

    it('should return paginated notes for patient', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should filter by note type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .query({ noteType: 'soap' })
        .set('Authorization', authToken)
        .expect(200);

      response.body.data.forEach((note: any) => {
        expect(note.noteType).toBe('soap');
      });
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .query({ status: 'draft' })
        .set('Authorization', authToken)
        .expect(200);

      response.body.data.forEach((note: any) => {
        expect(note.status).toBe('draft');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .query({ page: 1, limit: 5 })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });
  });

  // ============================================================================
  // GET SINGLE NOTE TESTS
  // ============================================================================

  describe('GET /api/v1/clinical/patients/:patientId/notes/:noteId', () => {
    let noteId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({
          noteType: 'soap',
          soap: {
            subjective: 'Test subjective',
            objective: 'Test objective',
            assessment: 'Test assessment',
            plan: 'Test plan',
          },
          diagnoses: [
            { icd10Code: 'K02.9', description: 'Dental caries', isPrimary: true },
          ],
        });
      noteId = response.body.data.id;
    });

    it('should return complete note with SOAP content', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(noteId);
      expect(response.body.data.soap).toBeDefined();
      expect(response.body.data.soap.subjective).toBe('Test subjective');
      expect(response.body.data.diagnoses).toHaveLength(1);
    });

    it('should return 404 for non-existent note', async () => {
      const fakeId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

      await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  // ============================================================================
  // UPDATE NOTE TESTS
  // ============================================================================

  describe('PUT /api/v1/clinical/patients/:patientId/notes/:noteId', () => {
    let draftNoteId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      draftNoteId = response.body.data.id;
    });

    it('should update draft note', async () => {
      const updateDto = {
        soap: {
          subjective: 'Updated subjective',
          objective: 'Updated objective',
          assessment: 'Updated assessment',
          plan: 'Updated plan',
        },
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}`)
        .query({ version: 1 })
        .set('Authorization', authToken)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.version).toBe(2);
    });

    it('should use optimistic locking', async () => {
      // First update
      await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}`)
        .query({ version: 1 })
        .set('Authorization', authToken)
        .send({ chiefComplaint: 'First update' })
        .expect(200);

      // Second update with stale version
      const response = await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}`)
        .query({ version: 1 })
        .set('Authorization', authToken)
        .send({ chiefComplaint: 'Second update' })
        .expect(409);

      expect(response.body.message).toContain('modified by another user');
    });
  });

  // ============================================================================
  // SIGNING WORKFLOW TESTS
  // ============================================================================

  describe('POST /api/v1/clinical/patients/:patientId/notes/:noteId/sign', () => {
    let draftNoteId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({
          noteType: 'soap',
          soap: {
            subjective: 'Complete SOAP for signing',
            objective: 'Examination complete',
            assessment: 'Healthy',
            plan: 'Routine follow-up',
          },
        });
      draftNoteId = response.body.data.id;
    });

    it('should sign draft note and make it immutable', async () => {
      const signDto = {
        signerName: 'Dr. John Smith, DDS',
        credentials: 'DDS',
        signatureMethod: 'electronic',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}/sign`)
        .set('Authorization', authToken)
        .send(signDto)
        .expect(200);

      expect(response.body.data.status).toBe('signed');
      expect(response.body.data.signature.signerName).toBe('Dr. John Smith, DDS');
    });

    it('should reject update to signed note', async () => {
      // Sign the note
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}/sign`)
        .set('Authorization', authToken)
        .send({ signerName: 'Dr. Smith', signatureMethod: 'electronic' });

      // Try to update
      const response = await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}`)
        .query({ version: 2 })
        .set('Authorization', authToken)
        .send({ chiefComplaint: 'Cannot update' })
        .expect(403);

      expect(response.body.message).toContain('signed');
    });

    it('should emit ClinicalNoteSigned event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on(CLINICAL_NOTE_EVENTS.SIGNED, eventSpy);

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${draftNoteId}/sign`)
        .set('Authorization', authToken)
        .send({ signerName: 'Dr. Smith', signatureMethod: 'electronic' })
        .expect(200);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // AMENDMENT WORKFLOW TESTS
  // ============================================================================

  describe('POST /api/v1/clinical/patients/:patientId/notes/:noteId/amend', () => {
    let signedNoteId: string;

    beforeEach(async () => {
      // Create and sign a note
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({
          noteType: 'soap',
          diagnoses: [
            { icd10Code: 'K02.9', description: 'Original diagnosis', isPrimary: true },
          ],
        });
      signedNoteId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${signedNoteId}/sign`)
        .set('Authorization', authToken)
        .send({ signerName: 'Dr. Smith', signatureMethod: 'electronic' });
    });

    it('should create amendment and preserve original', async () => {
      const amendDto = {
        amendmentReason: 'Corrected diagnosis after lab results',
        diagnoses: [
          { icd10Code: 'K04.0', description: 'Pulpitis', isPrimary: true },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${signedNoteId}/amend`)
        .set('Authorization', authToken)
        .send(amendDto)
        .expect(201);

      expect(response.body.data.originalNote.status).toBe('amended');
      expect(response.body.data.amendment.status).toBe('draft');
      expect(response.body.data.amendment.previousVersionId).toBe(signedNoteId);
      expect(response.body.data.amendment.amendmentReason).toBe(amendDto.amendmentReason);
    });

    it('should require amendment reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${signedNoteId}/amend`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('amendmentReason');
    });

    it('should emit ClinicalNoteAmended event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on(CLINICAL_NOTE_EVENTS.AMENDED, eventSpy);

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${signedNoteId}/amend`)
        .set('Authorization', authToken)
        .send({ amendmentReason: 'Correction needed' })
        .expect(201);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // VERSION HISTORY TESTS
  // ============================================================================

  describe('GET /api/v1/clinical/patients/:patientId/notes/:noteId/versions', () => {
    it('should return version history for amended note', async () => {
      // Create, sign, and amend a note
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      const noteId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/sign`)
        .set('Authorization', authToken)
        .send({ signerName: 'Dr. Smith', signatureMethod: 'electronic' });

      const amendResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/amend`)
        .set('Authorization', authToken)
        .send({ amendmentReason: 'Test amendment' });
      const amendmentId = amendResponse.body.data.amendment.id;

      // Get version history
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes/${amendmentId}/versions`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.totalVersions).toBeGreaterThanOrEqual(1);
      expect(response.body.data.versions[0].isCurrentVersion).toBe(true);
    });
  });

  // ============================================================================
  // AUDIT HISTORY TESTS
  // ============================================================================

  describe('GET /api/v1/clinical/patients/:patientId/notes/:noteId/history', () => {
    it('should return audit history for a note', async () => {
      // Create a note
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      const noteId = createResponse.body.data.id;

      // Update the note
      await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}`)
        .query({ version: 1 })
        .set('Authorization', authToken)
        .send({ chiefComplaint: 'Updated' });

      // Get audit history
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/history`)
        .set('Authorization', authToken)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0]).toHaveProperty('changeType');
      expect(response.body.data[0]).toHaveProperty('changedBy');
    });
  });

  // ============================================================================
  // DIAGNOSIS ENDPOINTS TESTS
  // ============================================================================

  describe('POST /api/v1/clinical/patients/:patientId/notes/:noteId/diagnoses', () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      noteId = response.body.data.id;
    });

    it('should add diagnosis to note', async () => {
      const diagnosisDto = {
        icd10Code: 'K02.9',
        description: 'Dental caries, unspecified',
        tooth: '14',
        isPrimary: true,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/diagnoses`)
        .set('Authorization', authToken)
        .send(diagnosisDto)
        .expect(201);

      expect(response.body.data.diagnosis.icd10Code).toBe('K02.9');
    });
  });

  // ============================================================================
  // PROCEDURE ENDPOINTS TESTS
  // ============================================================================

  describe('POST /api/v1/clinical/patients/:patientId/notes/:noteId/procedures', () => {
    let noteId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      noteId = response.body.data.id;
    });

    it('should add procedure to note', async () => {
      const procedureDto = {
        cdtCode: 'D2391',
        description: 'Resin-based composite - one surface, posterior',
        teeth: ['14'],
        surfaces: ['O'],
        status: 'planned',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/procedures`)
        .set('Authorization', authToken)
        .send(procedureDto)
        .expect(201);

      expect(response.body.data.procedure.cdtCode).toBe('D2391');
      expect(response.body.data.procedure.status).toBe('planned');
    });
  });

  describe('POST /api/v1/clinical/patients/:patientId/notes/:noteId/procedures/:procedureId/complete', () => {
    let noteId: string;
    let procedureId: string;

    beforeEach(async () => {
      // Create note with procedure
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({
          noteType: 'soap',
          procedures: [
            {
              cdtCode: 'D2391',
              description: 'Filling',
              teeth: ['14'],
              surfaces: ['O'],
              status: 'planned',
            },
          ],
        });
      noteId = createResponse.body.data.id;

      // Get the procedure ID
      const getResponse = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}`)
        .set('Authorization', authToken);
      procedureId = getResponse.body.data.procedures[0].id;
    });

    it('should mark procedure as completed', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/procedures/${procedureId}/complete`)
        .set('Authorization', authToken)
        .send({ notes: 'Procedure completed without complications' })
        .expect(200);

      expect(response.body.data.procedure.status).toBe('completed');
      expect(response.body.data.procedure.completedAt).toBeDefined();
    });

    it('should emit ProcedureCompleted event', async () => {
      const eventSpy = jest.fn();
      eventEmitter.on(CLINICAL_NOTE_EVENTS.PROCEDURE_COMPLETED, eventSpy);

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/procedures/${procedureId}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // SOFT DELETE TESTS
  // ============================================================================

  describe('DELETE /api/v1/clinical/patients/:patientId/notes/:noteId', () => {
    it('should soft delete draft note with reason', async () => {
      // Create a note
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      const noteId = createResponse.body.data.id;

      // Delete with reason
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}`)
        .set('Authorization', authToken)
        .send({ reason: 'Created in error' })
        .expect(200);

      expect(response.body.data.deletedAt).toBeDefined();
    });

    it('should reject deleting signed note', async () => {
      // Create and sign a note
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });
      const noteId = createResponse.body.data.id;

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}/sign`)
        .set('Authorization', authToken)
        .send({ signerName: 'Dr. Smith', signatureMethod: 'electronic' });

      // Try to delete
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/clinical/patients/${testPatientId}/notes/${noteId}`)
        .set('Authorization', authToken)
        .send({ reason: 'Should fail' })
        .expect(403);

      expect(response.body.message).toContain('Signed clinical notes cannot be deleted');
    });
  });

  // ============================================================================
  // DASHBOARD ENDPOINTS TESTS
  // ============================================================================

  describe('GET /api/v1/clinical/notes/unsigned-drafts', () => {
    it('should return unsigned drafts for current user', async () => {
      // Create a draft note
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/clinical/notes/unsigned-drafts')
        .set('Authorization', authToken)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/clinical/notes/status-counts', () => {
    it('should return note counts by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/clinical/notes/status-counts')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toHaveProperty('draft');
      expect(response.body.data).toHaveProperty('signed');
      expect(response.body.data).toHaveProperty('amended');
    });
  });

  // ============================================================================
  // MULTI-TENANT ISOLATION TESTS
  // ============================================================================

  describe('Multi-Tenant Isolation', () => {
    it('should not return notes from other tenants', async () => {
      // Create a note with original user
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', authToken)
        .send({ noteType: 'soap', chiefComplaint: 'Original tenant note' });

      // Create token for different tenant
      const otherTenantUser = { ...mockUser, tenantId: 'other-tenant-456' };
      const otherToken = `Bearer ${jwtService.sign(otherTenantUser, { secret: 'test-secret', expiresIn: '1h' })}`;

      // Query with other tenant should not find original note
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${testPatientId}/notes`)
        .set('Authorization', otherToken)
        .expect(200);

      // Should either be empty or only contain notes for the other tenant
      const originalTenantNotes = response.body.data.filter(
        (note: any) => note.chiefComplaint === 'Original tenant note',
      );
      expect(originalTenantNotes).toHaveLength(0);
    });
  });
});
