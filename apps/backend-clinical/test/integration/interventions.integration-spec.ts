/**
 * Interventions Integration Tests
 *
 * Tests the full intervention API stack including controllers,
 * services, and database operations with multi-tenant isolation.
 *
 * @module interventions/integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { InterventionsModule } from '../../src/modules/interventions/interventions.module';
import { OdontogramModule } from '../../src/modules/odontogram/odontogram.module';
import { AuthModule } from '../../src/modules/auth/auth.module';

describe('Interventions (Integration)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;

  const mockUser = {
    userId: 'test-user-id',
    email: 'dentist@test.com',
    roles: ['DENTIST'],
    permissions: ['clinical:read', 'clinical:write'],
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    clinicId: 'clinic-1',
  };

  const patientId = 'patient-123';

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        AuthModule,
        OdontogramModule,
        InterventionsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /api/v1/clinical/patients/:patientId/interventions', () => {
    it('should create an intervention', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createDto = {
        type: 'fluoride',
        title: 'Fluoride application',
        teeth: ['11', '12'],
        surfaces: [],
        isBillable: true,
        billedAmount: 50,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      expect(response.body.intervention).toBeDefined();
      expect(response.body.intervention.type).toBe('fluoride');
      expect(response.body.intervention.patientId).toBe(patientId);
      expect(response.body.intervention.tenantId).toBe(mockUser.tenantId);
    });

    it('should reject invalid intervention type', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createDto = {
        type: 'invalid_type',
        title: 'Test',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send(createDto)
        .expect(400);
    });

    it('should reject invalid tooth numbers', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createDto = {
        type: 'fluoride',
        title: 'Test',
        teeth: ['99'],
      };

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send(createDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .send({ type: 'fluoride', title: 'Test' })
        .expect(401);
    });
  });

  describe('POST /api/v1/clinical/patients/:patientId/interventions/quick', () => {
    it('should create a quick intervention', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const quickDto = {
        type: 'sensitivity_test',
        teeth: ['16'],
        notes: 'Mild sensitivity reported',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions/quick`)
        .set('Authorization', authToken)
        .send(quickDto)
        .expect(201);

      expect(response.body.intervention).toBeDefined();
      expect(response.body.intervention.type).toBe('sensitivity_test');
      expect(response.body.intervention.status).toBe('completed');
      expect(response.body.intervention.isBillable).toBe(false);
    });

    it('should auto-fill provider from context', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions/quick`)
        .set('Authorization', authToken)
        .send({ type: 'vitality_test' })
        .expect(201);

      expect(response.body.intervention.providerId).toBe(mockUser.userId);
    });
  });

  describe('GET /api/v1/clinical/patients/:patientId/interventions', () => {
    it('should list patient interventions', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('hasMore');
    });

    it('should filter by type', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/interventions`)
        .query({ type: 'fluoride' })
        .set('Authorization', authToken)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should paginate results', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/interventions`)
        .query({ limit: 10, offset: 0 })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(0);
    });
  });

  describe('GET /api/v1/clinical/interventions/types', () => {
    it('should return intervention types metadata', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get('/api/v1/clinical/interventions/types')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.types).toBeDefined();
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(response.body.types[0]).toHaveProperty('type');
      expect(response.body.types[0]).toHaveProperty('labelEn');
      expect(response.body.types[0]).toHaveProperty('labelRo');
    });
  });

  describe('PATCH /api/v1/clinical/interventions/:id', () => {
    let interventionId: string;

    beforeEach(async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'examination',
          title: 'Routine exam',
        });

      interventionId = createResponse.body.intervention._id;
    });

    it('should update an intervention', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .send({
          title: 'Updated examination notes',
          version: 1,
        })
        .expect(200);

      expect(response.body.title).toBe('Updated examination notes');
      expect(response.body.version).toBe(2);
    });

    it('should require version for optimistic locking', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .send({
          title: 'Updated title',
          // missing version
        })
        .expect(400);
    });

    it('should reject concurrent modification', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .send({
          title: 'Updated title',
          version: 999, // wrong version
        })
        .expect(409);
    });
  });

  describe('POST /api/v1/clinical/interventions/:id/cancel', () => {
    let interventionId: string;

    beforeEach(async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'fluoride',
          title: 'To be cancelled',
        });

      interventionId = createResponse.body.intervention._id;
    });

    it('should cancel an intervention', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/interventions/${interventionId}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Patient declined procedure',
          version: 1,
        })
        .expect(200);

      expect(response.body.status).toBe('cancelled');
      expect(response.body.cancellationReason).toBe('Patient declined procedure');
    });

    it('should require cancellation reason', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/interventions/${interventionId}/cancel`)
        .set('Authorization', authToken)
        .send({
          version: 1,
          // missing reason
        })
        .expect(400);
    });

    it('should not cancel already cancelled intervention', async () => {
      // First cancellation
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/interventions/${interventionId}/cancel`)
        .set('Authorization', authToken)
        .send({ reason: 'First cancellation', version: 1 })
        .expect(200);

      // Second cancellation attempt
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/interventions/${interventionId}/cancel`)
        .set('Authorization', authToken)
        .send({ reason: 'Second cancellation', version: 2 })
        .expect(409);
    });
  });

  describe('DELETE /api/v1/clinical/interventions/:id', () => {
    let interventionId: string;

    beforeEach(async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'other',
          title: 'To be deleted',
        });

      interventionId = createResponse.body.intervention._id;
    });

    it('should soft-delete an intervention', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .send({
          reason: 'Record entered in error',
          version: 1,
        })
        .expect(200);

      expect(response.body.deletedAt).toBeDefined();
      expect(response.body.deleteReason).toBe('Record entered in error');
    });

    it('should require deletion reason for audit compliance', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .send({ version: 1 })
        .expect(400);
    });
  });

  describe('Tenant Isolation', () => {
    it('should not access interventions from different tenant', async () => {
      // Create intervention as tenant-1
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'fluoride',
          title: 'Tenant 1 intervention',
        });

      const interventionId = createResponse.body.intervention._id;

      // Try to access as tenant-2
      const otherUser = { ...mockUser, tenantId: 'tenant-2' };
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(otherUser);

      await request(app.getHttpServer())
        .get(`/api/v1/clinical/interventions/${interventionId}`)
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  describe('GET /api/v1/clinical/patients/:patientId/teeth/:toothNumber/interventions', () => {
    it('should return interventions for specific tooth', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      // Create intervention with tooth
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'fluoride',
          title: 'Fluoride on 16',
          teeth: ['16'],
        });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/teeth/16/interventions`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/clinical/appointments/:appointmentId/interventions', () => {
    it('should return interventions for appointment', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const appointmentId = 'appointment-456';

      // Create intervention linked to appointment
      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'examination',
          title: 'Appointment exam',
          appointmentId,
        });

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/appointments/${appointmentId}/interventions`)
        .set('Authorization', authToken)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/clinical/appointments/:appointmentId/interventions/batch', () => {
    it('should create batch interventions', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const appointmentId = 'appointment-789';

      const response = await request(app.getHttpServer())
        .post(`/api/v1/clinical/appointments/${appointmentId}/interventions/batch`)
        .set('Authorization', authToken)
        .send({
          interventions: [
            { type: 'scaling', title: 'Scaling' },
            { type: 'polishing', title: 'Polishing' },
          ],
        })
        .expect(201);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should reject batch exceeding limit', async () => {
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const interventions = Array(21).fill({
        type: 'fluoride',
        title: 'Test',
      });

      await request(app.getHttpServer())
        .post('/api/v1/clinical/appointments/appt-123/interventions/batch')
        .set('Authorization', authToken)
        .send({ interventions })
        .expect(400);
    });
  });

  describe('Permission checks', () => {
    it('should require clinical:write for create', async () => {
      const readOnlyUser = { ...mockUser, permissions: ['clinical:read'] };
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(readOnlyUser);

      await request(app.getHttpServer())
        .post(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .send({
          type: 'fluoride',
          title: 'Test',
        })
        .expect(403);
    });

    it('should require clinical:read for list', async () => {
      const noPermUser = { ...mockUser, permissions: [] };
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(noPermUser);

      await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/interventions`)
        .set('Authorization', authToken)
        .expect(403);
    });
  });
});
