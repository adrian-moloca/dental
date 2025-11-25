import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Schedules E2E', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Create testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        AppModule,
      ],
    })
      .overrideProvider('DATABASE_URI')
      .useValue(uri)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api/v1');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  const providerId = '550e8400-e29b-41d4-a716-446655440000';
  const locationId = '550e8400-e29b-41d4-a716-446655440001';

  describe('PUT /api/v1/providers/:id/schedule', () => {
    it('should create a new provider schedule', async () => {
      const scheduleDto = {
        weeklyHours: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
        },
        breaks: [
          {
            name: 'Lunch',
            start: '12:00',
            end: '13:00',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          },
        ],
        locationIds: [locationId],
        defaultAppointmentDuration: 30,
        bufferTime: 5,
        isActive: true,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedule`)
        .send(scheduleDto)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.providerId).toBe(providerId);
      expect(response.body.weeklyHours.monday).toHaveLength(1);
      expect(response.body.breaks).toHaveLength(1);
    });

    it('should update existing provider schedule', async () => {
      const updatedSchedule = {
        weeklyHours: {
          monday: [
            { start: '08:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
          tuesday: [{ start: '09:00', end: '17:00' }],
        },
        breaks: [],
        locationIds: [locationId],
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedule`)
        .send(updatedSchedule)
        .expect(200);

      expect(response.body.weeklyHours.monday).toHaveLength(2);
      expect(response.body.breaks).toHaveLength(0);
    });

    it('should reject overlapping time slots', async () => {
      const invalidSchedule = {
        weeklyHours: {
          monday: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '17:00' }, // Overlaps
          ],
        },
        breaks: [],
        locationIds: [locationId],
      };

      await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedule`)
        .send(invalidSchedule)
        .expect(409);
    });

    it('should reject invalid time format', async () => {
      const invalidSchedule = {
        weeklyHours: {
          monday: [{ start: '9:00', end: '17:00' }], // Invalid format
        },
        breaks: [],
        locationIds: [locationId],
      };

      await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedule`)
        .send(invalidSchedule)
        .expect(400);
    });
  });

  describe('GET /api/v1/providers/:id/schedule', () => {
    it('should get provider schedule with absences', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/schedule`)
        .expect(200);

      expect(response.body).toHaveProperty('schedule');
      expect(response.body).toHaveProperty('absences');
      expect(response.body.schedule.providerId).toBe(providerId);
    });

    it('should return 404 for non-existent provider', async () => {
      const nonExistentProviderId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .get(`/api/v1/providers/${nonExistentProviderId}/schedule`)
        .expect(404);
    });
  });

  describe('POST /api/v1/providers/:id/absences', () => {
    it('should create provider absence', async () => {
      const absenceDto = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-05'),
        type: 'vacation',
        reason: 'Holiday vacation',
        isAllDay: true,
        isRecurring: false,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send(absenceDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.providerId).toBe(providerId);
      expect(response.body.type).toBe('vacation');
      expect(response.body.status).toBe('pending');
    });

    it('should reject overlapping absences', async () => {
      const overlappingAbsence = {
        start: new Date('2025-12-03'),
        end: new Date('2025-12-07'),
        type: 'sick',
        isAllDay: true,
        isRecurring: false,
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send(overlappingAbsence)
        .expect(409);
    });

    it('should reject absence with end before start', async () => {
      const invalidAbsence = {
        start: new Date('2025-12-10'),
        end: new Date('2025-12-08'), // Before start
        type: 'vacation',
        isAllDay: true,
        isRecurring: false,
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send(invalidAbsence)
        .expect(400);
    });
  });

  describe('GET /api/v1/providers/:id/availability/:date', () => {
    it('should return availability for working day', async () => {
      const checkDate = '2025-11-25'; // Monday

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .expect(200);

      expect(response.body).toHaveProperty('isAvailable');
      expect(response.body.isAvailable).toBe(true);
      expect(response.body).toHaveProperty('availableSlots');
    });

    it('should return unavailable for non-working day', async () => {
      const checkDate = '2025-11-23'; // Sunday

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toBeDefined();
    });

    it('should return unavailable during absence period', async () => {
      const checkDate = '2025-12-02'; // During vacation

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toContain('unavailable');
    });
  });

  describe('POST /api/v1/internal/validate-availability', () => {
    it('should validate availability for valid time slot', async () => {
      const validateDto = {
        providerId,
        start: new Date('2025-11-25T10:00:00'),
        end: new Date('2025-11-25T11:00:00'),
        locationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/validate-availability')
        .send(validateDto)
        .expect(200);

      expect(response.body.isAvailable).toBe(true);
    });

    it('should reject time outside working hours', async () => {
      const validateDto = {
        providerId,
        start: new Date('2025-11-25T18:00:00'), // After 17:00
        end: new Date('2025-11-25T19:00:00'),
        locationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/validate-availability')
        .send(validateDto)
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toContain('outside provider working hours');
    });
  });

  describe('DELETE /api/v1/providers/:id/absences/:absenceId', () => {
    it('should delete absence', async () => {
      // First, create an absence to delete
      const absenceDto = {
        start: new Date('2026-01-01'),
        end: new Date('2026-01-05'),
        type: 'vacation',
        isAllDay: true,
        isRecurring: false,
      };

      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send(absenceDto)
        .expect(201);

      const absenceId = createResponse.body.id;

      // Now delete it
      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/absences/${absenceId}`)
        .expect(204);
    });

    it('should return 404 for non-existent absence', async () => {
      const nonExistentAbsenceId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/absences/${nonExistentAbsenceId}`)
        .expect(404);
    });
  });
});
