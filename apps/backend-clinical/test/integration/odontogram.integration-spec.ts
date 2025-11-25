/**
 * Odontogram Integration Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { OdontogramModule } from '../../src/modules/odontogram/odontogram.module';
import { AuthModule } from '../../src/modules/auth/auth.module';

describe('Odontogram (Integration)', () => {
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

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        AuthModule,
        OdontogramModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Mock JWT token (in real tests, use proper JWT library)
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('GET /api/v1/clinical/patients/:patientId/odontogram', () => {
    it('should create and return odontogram with all 32 teeth', async () => {
      const patientId = 'patient-123';

      // Mock the JWT strategy to return mockUser
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toHaveProperty('teeth');
      expect(response.body.patientId).toBe(patientId);
      expect(response.body.tenantId).toBe(mockUser.tenantId);
    });

    it('should enforce tenant isolation', async () => {
      const patientId = 'patient-other-tenant';

      const otherUser = { ...mockUser, tenantId: 'tenant-2' };
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(otherUser);

      await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .expect(200);

      // Switch back to original tenant
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      // Should not find odontogram from other tenant
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.patientId).not.toBe(patientId);
    });
  });

  describe('PUT /api/v1/clinical/patients/:patientId/odontogram', () => {
    it('should update tooth status', async () => {
      const patientId = 'patient-456';

      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const updateDto = {
        teeth: [
          {
            toothNumber: 14,
            status: 'crown',
            buccal: { conditions: ['restoration'], procedures: ['crown_prep'] },
            notes: 'Full coverage crown',
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .send(updateDto)
        .expect(200);

      expect(response.body.version).toBeGreaterThan(1);
    });

    it('should validate tooth number range (1-32)', async () => {
      const patientId = 'patient-789';

      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(mockUser);

      const invalidDto = {
        teeth: [
          {
            toothNumber: 33, // Invalid
            status: 'present',
          },
        ],
      };

      await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .send(invalidDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const patientId = 'patient-unauth';

      await request(app.getHttpServer())
        .get(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .expect(401);
    });

    it('should require clinical:write permission', async () => {
      const patientId = 'patient-no-perm';

      const readOnlyUser = { ...mockUser, permissions: ['clinical:read'] };
      jest.spyOn(app.get('JwtStrategy'), 'validate').mockResolvedValue(readOnlyUser);

      const updateDto = {
        teeth: [{ toothNumber: 1, status: 'present' }],
      };

      await request(app.getHttpServer())
        .put(`/api/v1/clinical/patients/${patientId}/odontogram`)
        .set('Authorization', authToken)
        .send(updateDto)
        .expect(403);
    });
  });
});
