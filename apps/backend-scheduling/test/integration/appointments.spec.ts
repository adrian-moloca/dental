import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';

import { AppointmentsModule } from '../../src/modules/appointments/appointments.module';
import { AppointmentStatus } from '../../src/modules/appointments/entities/appointment.schema';
import { JwtStrategy } from '../../src/modules/appointments/strategies/jwt.strategy';
import { JwtAuthGuard } from '../../src/modules/appointments/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../src/modules/appointments/guards/permissions.guard';
import { TenantIsolationGuard } from '../../src/modules/appointments/guards/tenant-isolation.guard';

describe('Appointments Integration Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: 'tenant-123',
    organizationId: 'org-123',
    email: 'test@example.com',
    roles: ['receptionist'],
    permissions: [
      'appointments:create',
      'appointments:read',
      'appointments:update',
      'appointments:delete',
    ],
  };

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRATION: '1h',
              redis: {
                host: 'localhost',
                port: 6379,
              },
            }),
          ],
        }),
        MongooseModule.forRoot(mongoUri),
        EventEmitterModule.forRoot(),
        CacheModule.register({
          isGlobal: true,
          store: 'memory',
        }),
        AppointmentsModule,
      ],
    })
      .overrideProvider(JwtStrategy)
      .useValue({
        validate: async (payload) => mockUser,
      })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: () => true,
      })
      .overrideGuard(TenantIsolationGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Mock JWT token
    authToken = 'Bearer mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /appointments - Book Appointment', () => {
    it('should successfully book an appointment', async () => {
      const dto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-01T10:00:00Z').toISOString(),
        end: new Date('2025-12-01T11:00:00Z').toISOString(),
        notes: 'Regular checkup',
        bookingSource: 'online',
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto)
        .expect(201);

      expect(response.body).toMatchObject({
        tenantId: mockUser.tenantId,
        organizationId: mockUser.organizationId,
        patientId: dto.patientId,
        providerId: dto.providerId,
        locationId: dto.locationId,
        serviceCode: dto.serviceCode,
        status: AppointmentStatus.SCHEDULED,
      });

      expect(response.body.id).toBeDefined();
      expect(response.body.riskScore).toBeDefined();
    });

    it('should prevent double-booking for same provider', async () => {
      const dto1 = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-02T10:00:00Z').toISOString(),
        end: new Date('2025-12-02T11:00:00Z').toISOString(),
      };

      // First booking should succeed
      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto1)
        .expect(201);

      // Overlapping booking should fail
      const dto2 = {
        ...dto1,
        patientId: '333e4567-e89b-12d3-a456-426614174000',
        start: new Date('2025-12-02T10:30:00Z').toISOString(),
        end: new Date('2025-12-02T11:30:00Z').toISOString(),
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto2)
        .expect(409);
    });

    it('should reject invalid date range', async () => {
      const dto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-03T11:00:00Z').toISOString(),
        end: new Date('2025-12-03T10:00:00Z').toISOString(), // End before start
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto)
        .expect(400);
    });

    it('should mark emergency appointments as confirmed', async () => {
      const dto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'EMERGENCY',
        start: new Date('2025-12-04T14:00:00Z').toISOString(),
        end: new Date('2025-12-04T15:00:00Z').toISOString(),
        emergencyVisit: true,
      };

      const response = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto)
        .expect(201);

      expect(response.body.status).toBe(AppointmentStatus.CONFIRMED);
    });
  });

  describe('GET /appointments/:id - Get Appointment', () => {
    it('should retrieve appointment by ID', async () => {
      // First create an appointment
      const createDto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CLEANING',
        start: new Date('2025-12-05T09:00:00Z').toISOString(),
        end: new Date('2025-12-05T10:00:00Z').toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      const appointmentId = createResponse.body.id;

      // Retrieve the appointment
      const getResponse = await request(app.getHttpServer())
        .get(`/appointments/${appointmentId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(getResponse.body.id).toBe(appointmentId);
      expect(getResponse.body.serviceCode).toBe('CLEANING');
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app.getHttpServer())
        .get('/appointments/non-existent-id')
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  describe('GET /appointments - List Appointments', () => {
    beforeEach(async () => {
      // Create test appointments
      const appointments = [
        {
          patientId: '223e4567-e89b-12d3-a456-426614174000',
          providerId: '323e4567-e89b-12d3-a456-426614174000',
          locationId: '423e4567-e89b-12d3-a456-426614174000',
          serviceCode: 'CHECKUP',
          start: new Date('2025-12-06T10:00:00Z').toISOString(),
          end: new Date('2025-12-06T11:00:00Z').toISOString(),
        },
        {
          patientId: '223e4567-e89b-12d3-a456-426614174000',
          providerId: '323e4567-e89b-12d3-a456-426614174000',
          locationId: '423e4567-e89b-12d3-a456-426614174000',
          serviceCode: 'CLEANING',
          start: new Date('2025-12-07T14:00:00Z').toISOString(),
          end: new Date('2025-12-07T15:00:00Z').toISOString(),
        },
      ];

      for (const apt of appointments) {
        await request(app.getHttpServer())
          .post('/appointments')
          .set('Authorization', authToken)
          .send(apt);
      }
    });

    it('should list all appointments', async () => {
      const response = await request(app.getHttpServer())
        .get('/appointments')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should filter appointments by patient', async () => {
      const response = await request(app.getHttpServer())
        .get('/appointments')
        .query({ patientId: '223e4567-e89b-12d3-a456-426614174000' })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.every((apt) => apt.patientId === '223e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get('/appointments')
        .query({ page: 1, limit: 1 })
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
    });
  });

  describe('PUT /appointments/:id - Reschedule Appointment', () => {
    it('should successfully reschedule appointment', async () => {
      // Create appointment
      const createDto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-08T10:00:00Z').toISOString(),
        end: new Date('2025-12-08T11:00:00Z').toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      const appointmentId = createResponse.body.id;

      // Reschedule
      const updateDto = {
        start: new Date('2025-12-09T14:00:00Z').toISOString(),
        end: new Date('2025-12-09T15:00:00Z').toISOString(),
      };

      const updateResponse = await request(app.getHttpServer())
        .put(`/appointments/${appointmentId}`)
        .set('Authorization', authToken)
        .send(updateDto)
        .expect(200);

      expect(new Date(updateResponse.body.start).toISOString()).toBe(updateDto.start);
      expect(new Date(updateResponse.body.end).toISOString()).toBe(updateDto.end);
    });

    it('should prevent rescheduling to conflicting time', async () => {
      // Create first appointment
      const dto1 = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-10T10:00:00Z').toISOString(),
        end: new Date('2025-12-10T11:00:00Z').toISOString(),
      };

      await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto1)
        .expect(201);

      // Create second appointment
      const dto2 = {
        ...dto1,
        start: new Date('2025-12-10T14:00:00Z').toISOString(),
        end: new Date('2025-12-10T15:00:00Z').toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(dto2)
        .expect(201);

      // Try to reschedule to conflict with first appointment
      const updateDto = {
        start: new Date('2025-12-10T10:30:00Z').toISOString(),
        end: new Date('2025-12-10T11:30:00Z').toISOString(),
      };

      await request(app.getHttpServer())
        .put(`/appointments/${createResponse.body.id}`)
        .set('Authorization', authToken)
        .send(updateDto)
        .expect(409);
    });
  });

  describe('DELETE /appointments/:id - Cancel Appointment', () => {
    it('should successfully cancel appointment', async () => {
      // Create appointment
      const createDto = {
        patientId: '223e4567-e89b-12d3-a456-426614174000',
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CHECKUP',
        start: new Date('2025-12-11T10:00:00Z').toISOString(),
        end: new Date('2025-12-11T11:00:00Z').toISOString(),
      };

      const createResponse = await request(app.getHttpServer())
        .post('/appointments')
        .set('Authorization', authToken)
        .send(createDto)
        .expect(201);

      const appointmentId = createResponse.body.id;

      // Cancel
      const cancelDto = {
        reason: 'Patient requested cancellation',
        notifyPatient: true,
      };

      const cancelResponse = await request(app.getHttpServer())
        .delete(`/appointments/${appointmentId}`)
        .set('Authorization', authToken)
        .send(cancelDto)
        .expect(200);

      expect(cancelResponse.body.status).toBe(AppointmentStatus.CANCELLED);
      expect(cancelResponse.body.bookingMetadata.cancellationReason).toBe(cancelDto.reason);
    });
  });

  describe('GET /appointments/availability - Search Availability', () => {
    it('should return available time slots', async () => {
      const query = {
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        date: new Date('2025-12-15T00:00:00Z').toISOString(),
        durationMinutes: 60,
      };

      const response = await request(app.getHttpServer())
        .get('/appointments/availability')
        .query(query)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.providerId).toBe(query.providerId);
      expect(response.body.slots).toBeDefined();
      expect(Array.isArray(response.body.slots)).toBe(true);
      expect(response.body.totalAvailable).toBeDefined();
    });

    it('should cache availability results', async () => {
      const query = {
        providerId: '323e4567-e89b-12d3-a456-426614174000',
        locationId: '423e4567-e89b-12d3-a456-426614174000',
        date: new Date('2025-12-16T00:00:00Z').toISOString(),
        durationMinutes: 60,
      };

      // First request
      const response1 = await request(app.getHttpServer())
        .get('/appointments/availability')
        .query(query)
        .set('Authorization', authToken)
        .expect(200);

      expect(response1.body.cached).toBe(false);

      // Second request should be cached
      const response2 = await request(app.getHttpServer())
        .get('/appointments/availability')
        .query(query)
        .set('Authorization', authToken)
        .expect(200);

      expect(response2.body.cached).toBe(true);
    });
  });
});
