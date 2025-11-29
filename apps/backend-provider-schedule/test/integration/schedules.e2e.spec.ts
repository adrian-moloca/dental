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
  const clinicId = '550e8400-e29b-41d4-a716-446655440002';
  const locationId = '550e8400-e29b-41d4-a716-446655440001';

  // ============================================================================
  // SCHEDULE CRUD TESTS
  // ============================================================================

  describe('POST /api/v1/providers/:id/schedules', () => {
    it('should create a new provider schedule', async () => {
      const scheduleDto = {
        clinicId,
        timezone: 'Europe/Bucharest',
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
        .post(`/api/v1/providers/${providerId}/schedules`)
        .send(scheduleDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.providerId).toBe(providerId);
      expect(response.body.clinicId).toBe(clinicId);
      expect(response.body.timezone).toBe('Europe/Bucharest');
      expect(response.body.weeklyHours.monday).toHaveLength(1);
      expect(response.body.breaks).toHaveLength(1);
    });

    it('should reject duplicate schedule for same clinic', async () => {
      const scheduleDto = {
        clinicId,
        weeklyHours: {
          monday: [{ start: '09:00', end: '17:00' }],
        },
        locationIds: [locationId],
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/schedules`)
        .send(scheduleDto)
        .expect(409);
    });

    it('should reject overlapping time slots', async () => {
      const newClinicId = '550e8400-e29b-41d4-a716-446655440003';
      const invalidSchedule = {
        clinicId: newClinicId,
        weeklyHours: {
          monday: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '17:00' }, // Overlaps
          ],
        },
        locationIds: [locationId],
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/schedules`)
        .send(invalidSchedule)
        .expect(409);
    });

    it('should reject invalid time format', async () => {
      const newClinicId = '550e8400-e29b-41d4-a716-446655440004';
      const invalidSchedule = {
        clinicId: newClinicId,
        weeklyHours: {
          monday: [{ start: '9:00', end: '17:00' }], // Invalid format
        },
        locationIds: [locationId],
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/schedules`)
        .send(invalidSchedule)
        .expect(400);
    });
  });

  describe('GET /api/v1/providers/:id/schedule', () => {
    it('should get provider schedule with absences', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/schedule`)
        .query({ clinicId })
        .expect(200);

      expect(response.body).toHaveProperty('schedule');
      expect(response.body).toHaveProperty('absences');
      expect(response.body.schedule.providerId).toBe(providerId);
      expect(response.body.schedule.clinicId).toBe(clinicId);
    });

    it('should return 404 for non-existent provider', async () => {
      const nonExistentProviderId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .get(`/api/v1/providers/${nonExistentProviderId}/schedule`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/providers/:id/schedules/:clinicId', () => {
    it('should update existing provider schedule', async () => {
      const updatedSchedule = {
        weeklyHours: {
          monday: [
            { start: '08:00', end: '12:00' },
            { start: '13:00', end: '17:00' },
          ],
          tuesday: [{ start: '09:00', end: '17:00' }],
        },
        bufferTime: 10,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedules/${clinicId}`)
        .send(updatedSchedule)
        .expect(200);

      expect(response.body.weeklyHours.monday).toHaveLength(2);
      expect(response.body.bufferTime).toBe(10);
    });

    it('should return 404 for non-existent schedule', async () => {
      const nonExistentClinicId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/schedules/${nonExistentClinicId}`)
        .send({ bufferTime: 15 })
        .expect(404);
    });
  });

  // ============================================================================
  // EXCEPTION MANAGEMENT TESTS
  // ============================================================================

  describe('POST /api/v1/providers/:id/exceptions', () => {
    it('should create a holiday exception (day off)', async () => {
      const exceptionDto = {
        date: '2025-12-25',
        type: 'holiday',
        reason: 'Christmas Holiday',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/exceptions`)
        .send(exceptionDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('holiday');
      expect(response.body.reason).toBe('Christmas Holiday');
      expect(response.body.hours).toBeNull();
    });

    it('should create an override exception with custom hours', async () => {
      const exceptionDto = {
        date: '2025-12-24',
        type: 'override',
        hours: [{ start: '09:00', end: '14:00' }],
        reason: 'Christmas Eve - early close',
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/exceptions`)
        .send(exceptionDto)
        .expect(201);

      expect(response.body.type).toBe('override');
      expect(response.body.hours).toHaveLength(1);
      expect(response.body.hours[0].end).toBe('14:00');
    });

    it('should reject duplicate exception for same date', async () => {
      const exceptionDto = {
        date: '2025-12-25',
        type: 'sick',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/exceptions`)
        .send(exceptionDto)
        .expect(409);
    });
  });

  describe('GET /api/v1/providers/:id/exceptions', () => {
    it('should return all exceptions for provider', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/exceptions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter exceptions by date range', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/exceptions`)
        .query({ startDate: '2025-12-01', endDate: '2025-12-31' })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // All returned exceptions should be within the date range
      for (const exception of response.body) {
        const exceptionDate = new Date(exception.date);
        expect(exceptionDate.getMonth()).toBe(11); // December
      }
    });
  });

  describe('PUT /api/v1/providers/:id/exceptions/:exceptionId', () => {
    let exceptionId: string;

    beforeEach(async () => {
      // Create an exception to update
      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/exceptions`)
        .send({
          date: '2025-12-31',
          type: 'vacation',
          reason: 'New Year Eve',
        });

      exceptionId = response.body.id;
    });

    it('should update exception reason', async () => {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/providers/${providerId}/exceptions/${exceptionId}`)
        .send({ reason: 'Updated reason' })
        .expect(200);

      expect(response.body.reason).toBe('Updated reason');
    });
  });

  describe('DELETE /api/v1/providers/:id/exceptions/:exceptionId', () => {
    let exceptionId: string;

    beforeEach(async () => {
      // Create an exception to delete
      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/exceptions`)
        .send({
          date: '2025-12-30',
          type: 'training',
          reason: 'Webinar',
        });

      exceptionId = response.body.id;
    });

    it('should delete exception', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/exceptions/${exceptionId}`)
        .expect(204);
    });

    it('should return 404 for non-existent exception', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/exceptions/${nonExistentId}`)
        .expect(404);
    });
  });

  // ============================================================================
  // ABSENCE WORKFLOW TESTS
  // ============================================================================

  describe('POST /api/v1/providers/:id/absences', () => {
    it('should create provider absence with pending status', async () => {
      const absenceDto = {
        start: new Date('2026-01-10'),
        end: new Date('2026-01-15'),
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
        start: new Date('2026-01-12'),
        end: new Date('2026-01-18'),
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
        start: new Date('2026-02-10'),
        end: new Date('2026-02-08'), // Before start
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

  describe('POST /api/v1/absences/:absenceId/approve', () => {
    let absenceId: string;

    beforeEach(async () => {
      // Create an absence to approve
      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send({
          start: new Date('2026-03-01'),
          end: new Date('2026-03-05'),
          type: 'conference',
          reason: 'Dental conference',
          isAllDay: true,
          isRecurring: false,
        });

      absenceId = response.body.id;
    });

    it('should approve pending absence', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/absences/${absenceId}/approve`)
        .send({ approvalNotes: 'Approved for conference attendance' })
        .expect(200);

      expect(response.body.status).toBe('approved');
      expect(response.body.approvalNotes).toBe('Approved for conference attendance');
    });

    it('should return 404 for non-existent absence', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .post(`/api/v1/absences/${nonExistentId}/approve`)
        .send({})
        .expect(404);
    });
  });

  describe('POST /api/v1/absences/:absenceId/reject', () => {
    let absenceId: string;

    beforeEach(async () => {
      // Create an absence to reject
      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send({
          start: new Date('2026-04-01'),
          end: new Date('2026-04-05'),
          type: 'vacation',
          isAllDay: true,
          isRecurring: false,
        });

      absenceId = response.body.id;
    });

    it('should reject pending absence', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/absences/${absenceId}/reject`)
        .send({ rejectionReason: 'Staffing conflict during that period' })
        .expect(200);

      expect(response.body.status).toBe('rejected');
    });
  });

  describe('POST /api/v1/absences/:absenceId/cancel', () => {
    let absenceId: string;

    beforeEach(async () => {
      // Create an absence to cancel
      const response = await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/absences`)
        .send({
          start: new Date('2026-05-01'),
          end: new Date('2026-05-05'),
          type: 'personal',
          isAllDay: true,
          isRecurring: false,
        });

      absenceId = response.body.id;
    });

    it('should cancel pending absence', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/absences/${absenceId}/cancel`)
        .send({ cancellationReason: 'Plans changed' })
        .expect(200);

      expect(response.body.status).toBe('cancelled');
    });
  });

  describe('GET /api/v1/absences', () => {
    it('should return paginated absences', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/absences')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should filter absences by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/absences')
        .query({ status: 'pending', page: 1, limit: 10 })
        .expect(200);

      for (const absence of response.body.data) {
        expect(absence.status).toBe('pending');
      }
    });
  });

  // ============================================================================
  // AVAILABILITY TESTS
  // ============================================================================

  describe('GET /api/v1/providers/:id/availability/:date', () => {
    it('should return availability for working day', async () => {
      const checkDate = '2025-11-24'; // Monday

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .query({ clinicId })
        .expect(200);

      expect(response.body).toHaveProperty('isAvailable');
      expect(response.body.isAvailable).toBe(true);
      expect(response.body).toHaveProperty('availableSlots');
    });

    it('should return unavailable for non-working day', async () => {
      const checkDate = '2025-11-23'; // Sunday

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .query({ clinicId })
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toBeDefined();
    });

    it('should return unavailable on holiday exception', async () => {
      const checkDate = '2025-12-25'; // Christmas holiday created earlier

      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability/${checkDate}`)
        .query({ clinicId })
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toContain('unavailable');
    });
  });

  describe('GET /api/v1/providers/:id/availability-range', () => {
    it('should return availability for date range', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability-range`)
        .query({
          start: '2025-11-24',
          end: '2025-11-28',
          duration: 30,
          clinicId,
        })
        .expect(200);

      expect(response.body).toHaveProperty('days');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.days).toHaveLength(5);
      expect(response.body.summary.totalDays).toBe(5);
    });

    it('should reject when end date before start', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/providers/${providerId}/availability-range`)
        .query({
          start: '2025-11-28',
          end: '2025-11-24',
          duration: 30,
        })
        .expect(400);
    });
  });

  // ============================================================================
  // INTERNAL API TESTS
  // ============================================================================

  describe('POST /api/v1/internal/validate-availability', () => {
    it('should validate availability for valid time slot', async () => {
      const validateDto = {
        providerId,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        start: new Date('2025-11-24T10:00:00'),
        end: new Date('2025-11-24T11:00:00'),
        locationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/validate-availability')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(validateDto)
        .expect(200);

      expect(response.body.isAvailable).toBe(true);
    });

    it('should reject time outside working hours', async () => {
      const validateDto = {
        providerId,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        start: new Date('2025-11-24T18:00:00'), // After 17:00
        end: new Date('2025-11-24T19:00:00'),
        locationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/validate-availability')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(validateDto)
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toContain('outside provider working hours');
    });

    it('should reject time during break', async () => {
      const validateDto = {
        providerId,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        start: new Date('2025-11-24T12:00:00'), // During lunch break
        end: new Date('2025-11-24T12:30:00'),
        locationId,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/validate-availability')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(validateDto)
        .expect(200);

      expect(response.body.isAvailable).toBe(false);
      expect(response.body.reason).toContain('break');
    });
  });

  describe('POST /api/v1/internal/get-available-slots', () => {
    it('should return available slots for provider', async () => {
      const dto = {
        providerId,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        locationId,
        date: '2025-11-24',
        duration: 30,
        count: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/get-available-slots')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty('slots');
      expect(response.body).toHaveProperty('hasMore');
      expect(response.body).toHaveProperty('provider');
      expect(Array.isArray(response.body.slots)).toBe(true);
    });

    it('should return empty slots for non-existent location', async () => {
      const dto = {
        providerId,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        locationId: '550e8400-e29b-41d4-a716-446655440099',
        date: '2025-11-24',
        duration: 30,
        count: 5,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/get-available-slots')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(dto)
        .expect(200);

      expect(response.body.slots).toHaveLength(0);
      expect(response.body.hasMore).toBe(false);
    });
  });

  describe('POST /api/v1/internal/bulk-validate-availability', () => {
    it('should validate multiple providers at once', async () => {
      const requests = [
        {
          providerId,
          tenantId: 'tenant-1',
          organizationId: 'org-1',
          start: new Date('2025-11-24T10:00:00'),
          end: new Date('2025-11-24T11:00:00'),
          locationId,
        },
        {
          providerId,
          tenantId: 'tenant-1',
          organizationId: 'org-1',
          start: new Date('2025-11-24T18:00:00'),
          end: new Date('2025-11-24T19:00:00'),
          locationId,
        },
      ];

      const response = await request(app.getHttpServer())
        .post('/api/v1/internal/bulk-validate-availability')
        .set('X-Internal-API-Key', 'test-internal-key')
        .send(requests)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].result.isAvailable).toBe(true);
      expect(response.body[1].result.isAvailable).toBe(false);
    });
  });

  // ============================================================================
  // ABSENCE DELETE TESTS
  // ============================================================================

  describe('DELETE /api/v1/providers/:id/absences/:absenceId', () => {
    it('should delete absence', async () => {
      // First, create an absence to delete
      const absenceDto = {
        start: new Date('2026-06-01'),
        end: new Date('2026-06-05'),
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

  // ============================================================================
  // SCHEDULE DELETE TESTS
  // ============================================================================

  describe('DELETE /api/v1/providers/:id/schedules/:clinicId', () => {
    const newClinicId = '550e8400-e29b-41d4-a716-446655440010';

    beforeEach(async () => {
      // Create a schedule to delete
      await request(app.getHttpServer())
        .post(`/api/v1/providers/${providerId}/schedules`)
        .send({
          clinicId: newClinicId,
          weeklyHours: {
            monday: [{ start: '09:00', end: '17:00' }],
          },
          locationIds: [locationId],
        });
    });

    it('should delete schedule', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/schedules/${newClinicId}`)
        .expect(204);
    });

    it('should return 404 for non-existent schedule', async () => {
      const nonExistentClinicId = '550e8400-e29b-41d4-a716-446655440099';

      await request(app.getHttpServer())
        .delete(`/api/v1/providers/${providerId}/schedules/${nonExistentClinicId}`)
        .expect(404);
    });
  });
});
