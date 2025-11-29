import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule, EventEmitter2 } from '@nestjs/event-emitter';
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

describe('Appointment Status Transitions Integration Tests', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let eventEmitter: EventEmitter2;
  let authToken: string;
  let emittedEvents: { event: string; payload: unknown }[];

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

  const createAppointmentDto = {
    patientId: '223e4567-e89b-12d3-a456-426614174000',
    providerId: '323e4567-e89b-12d3-a456-426614174000',
    locationId: '423e4567-e89b-12d3-a456-426614174000',
    serviceCode: 'CHECKUP',
    start: new Date('2025-12-15T10:00:00Z').toISOString(),
    end: new Date('2025-12-15T11:00:00Z').toISOString(),
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
        validate: async () => mockUser,
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

    // Get event emitter for tracking events
    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);

    // Mock JWT token
    authToken = 'Bearer mock-jwt-token';
  });

  beforeEach(() => {
    // Reset event tracking
    emittedEvents = [];

    // Listen to all appointment events
    const eventNames = [
      'appointment.booked',
      'appointment.confirmed',
      'appointment.checked_in',
      'appointment.started',
      'appointment.completed',
      'appointment.cancelled',
      'appointment.no_show',
      'appointment.rescheduled',
    ];

    eventNames.forEach((eventName) => {
      eventEmitter.on(eventName, (payload) => {
        emittedEvents.push({ event: eventName, payload });
      });
    });
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  /**
   * Helper function to create an appointment
   */
  async function createAppointment(overrides = {}): Promise<{ id: string; status: string }> {
    const dto = { ...createAppointmentDto, ...overrides };
    // Ensure unique time to avoid conflicts
    const uniqueTime = new Date(Date.now() + Math.random() * 1000000000);
    dto.start = uniqueTime.toISOString();
    dto.end = new Date(uniqueTime.getTime() + 60 * 60 * 1000).toISOString();

    const response = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', authToken)
      .send(dto)
      .expect(201);

    return response.body;
  }

  describe('Complete Status Flow: SCHEDULED -> CONFIRMED -> CHECKED_IN -> IN_PROGRESS -> COMPLETED', () => {
    it('should complete the full happy path status flow', async () => {
      // Step 1: Create appointment (SCHEDULED)
      const appointment = await createAppointment();
      expect(appointment.status).toBe(AppointmentStatus.SCHEDULED);

      // Step 2: Confirm appointment (SCHEDULED -> CONFIRMED)
      const confirmResponse = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      expect(confirmResponse.body.status).toBe(AppointmentStatus.CONFIRMED);
      expect(confirmResponse.body.bookingMetadata.confirmedBy).toBe(mockUser.userId);
      expect(confirmResponse.body.bookingMetadata.confirmationMethod).toBe('phone');

      // Step 3: Check in patient (CONFIRMED -> CHECKED_IN)
      const checkInResponse = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({ notes: 'Patient arrived early' })
        .expect(200);

      expect(checkInResponse.body.status).toBe(AppointmentStatus.CHECKED_IN);
      expect(checkInResponse.body.bookingMetadata.checkedInBy).toBe(mockUser.userId);

      // Step 4: Start appointment (CHECKED_IN -> IN_PROGRESS)
      const startResponse = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({ chairId: '523e4567-e89b-12d3-a456-426614174000' })
        .expect(200);

      expect(startResponse.body.status).toBe(AppointmentStatus.IN_PROGRESS);
      expect(startResponse.body.bookingMetadata.startedBy).toBe(mockUser.userId);
      expect(startResponse.body.chairId).toBe('523e4567-e89b-12d3-a456-426614174000');

      // Step 5: Complete appointment (IN_PROGRESS -> COMPLETED)
      const completeResponse = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({
          notes: 'Treatment completed successfully',
          proceduresConducted: ['D0120', 'D1110'],
        })
        .expect(200);

      expect(completeResponse.body.status).toBe(AppointmentStatus.COMPLETED);
      expect(completeResponse.body.bookingMetadata.completedBy).toBe(mockUser.userId);
      expect(completeResponse.body.bookingMetadata.completionNotes).toBe('Treatment completed successfully');
      expect(completeResponse.body.bookingMetadata.proceduresConducted).toEqual(['D0120', 'D1110']);

      // Verify status history contains all transitions
      const historyResponse = await request(app.getHttpServer())
        .get(`/appointments/${appointment.id}/status-history`)
        .set('Authorization', authToken)
        .expect(200);

      expect(historyResponse.body.length).toBe(4);
      expect(historyResponse.body[0].fromStatus).toBe(AppointmentStatus.SCHEDULED);
      expect(historyResponse.body[0].toStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(historyResponse.body[0].action).toBe('confirm');
      expect(historyResponse.body[3].fromStatus).toBe(AppointmentStatus.IN_PROGRESS);
      expect(historyResponse.body[3].toStatus).toBe(AppointmentStatus.COMPLETED);
      expect(historyResponse.body[3].action).toBe('complete');
    });
  });

  describe('PATCH /appointments/:id/confirm - Confirm Appointment', () => {
    it('should confirm a scheduled appointment', async () => {
      const appointment = await createAppointment();

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'email' })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CONFIRMED);
      expect(response.body.bookingMetadata.confirmationMethod).toBe('email');
    });

    it('should reject confirmation of already confirmed appointment', async () => {
      const appointment = await createAppointment();

      // First confirmation
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      // Second confirmation should fail
      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(400);

      expect(response.body.message).toContain('Cannot confirm');
    });

    it('should reject confirmation of completed appointment', async () => {
      const appointment = await createAppointment();

      // Go through the full flow to completed
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      // Now try to confirm again - should fail
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(400);
    });
  });

  describe('PATCH /appointments/:id/check-in - Check In Patient', () => {
    it('should check in from scheduled state (skipping confirmation)', async () => {
      const appointment = await createAppointment();

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CHECKED_IN);
    });

    it('should check in from confirmed state', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({ notes: 'Patient on time' })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CHECKED_IN);
    });

    it('should reject check-in of already checked-in appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /appointments/:id/start - Start Appointment', () => {
    it('should start appointment from checked-in state', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({ chairId: '623e4567-e89b-12d3-a456-426614174000' })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.IN_PROGRESS);
    });

    it('should reject starting without check-in', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should reject starting confirmed but not checked-in appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('checked in');
    });
  });

  describe('PATCH /appointments/:id/complete - Complete Appointment', () => {
    it('should complete appointment from in-progress state', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({ notes: 'All procedures completed' })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.COMPLETED);
    });

    it('should reject completing without starting', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should reject completing already completed appointment', async () => {
      const appointment = await createAppointment();

      // Complete the flow
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      // Try to complete again
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /appointments/:id/cancel - Cancel Appointment', () => {
    it('should cancel scheduled appointment', async () => {
      const appointment = await createAppointment();

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Patient requested cancellation',
          cancellationType: 'patient',
        })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
      expect(response.body.bookingMetadata.cancellationReason).toBe('Patient requested cancellation');
      expect(response.body.bookingMetadata.cancellationType).toBe('patient');
    });

    it('should cancel confirmed appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Provider unavailable',
          cancellationType: 'provider',
        })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
      expect(response.body.bookingMetadata.cancellationType).toBe('provider');
    });

    it('should cancel in-progress appointment (rare case)', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Emergency evacuation',
          cancellationType: 'clinic',
        })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.CANCELLED);
    });

    it('should reject cancelling completed appointment', async () => {
      const appointment = await createAppointment();

      // Complete the flow
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      // Try to cancel
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Test',
          cancellationType: 'patient',
        })
        .expect(400);
    });

    it('should reject cancelling already cancelled appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'First cancellation',
          cancellationType: 'patient',
        })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Second cancellation attempt',
          cancellationType: 'patient',
        })
        .expect(400);
    });

    it('should require cancellation reason', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          cancellationType: 'patient',
        })
        .expect(400);
    });
  });

  describe('PATCH /appointments/:id/no-show - Mark No Show', () => {
    it('should mark checked-in appointment as no-show', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/no-show`)
        .set('Authorization', authToken)
        .send({
          reason: 'Patient left without being seen',
          attemptedContact: true,
          contactAttempts: 2,
        })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.NO_SHOW);
      expect(response.body.bookingMetadata.noShowReason).toBe('Patient left without being seen');
      expect(response.body.bookingMetadata.contactAttempts).toBe(2);
    });

    it('should reject no-show for scheduled appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/no-show`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should reject no-show for confirmed but not checked-in appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/no-show`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /appointments/:id/reschedule - Reschedule Appointment', () => {
    it('should reschedule scheduled appointment', async () => {
      const appointment = await createAppointment();
      const newStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
          reason: 'Patient requested different time',
        })
        .expect(200);

      expect(response.body.status).toBe(AppointmentStatus.SCHEDULED);
      expect(new Date(response.body.start).getTime()).toBe(newStart.getTime());
      expect(response.body.bookingMetadata.rescheduleCount).toBe(1);
      expect(response.body.bookingMetadata.rescheduleReason).toBe('Patient requested different time');
    });

    it('should reschedule confirmed appointment and reset to scheduled', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      const newStart = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
        })
        .expect(200);

      // Status should reset to scheduled
      expect(response.body.status).toBe(AppointmentStatus.SCHEDULED);
      // Confirmation should be cleared
      expect(response.body.bookingMetadata.confirmedBy).toBeUndefined();
    });

    it('should reject rescheduling to past time', async () => {
      const appointment = await createAppointment();
      const pastStart = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pastEnd = new Date(pastStart.getTime() + 60 * 60 * 1000);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: pastStart.toISOString(),
          end: pastEnd.toISOString(),
        })
        .expect(400);
    });

    it('should reject rescheduling completed appointment', async () => {
      const appointment = await createAppointment();

      // Complete the flow
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const newStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
        })
        .expect(400);
    });

    it('should reject rescheduling cancelled appointment', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Cancelled',
          cancellationType: 'patient',
        })
        .expect(200);

      const newStart = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart.toISOString(),
          end: newEnd.toISOString(),
        })
        .expect(400);
    });

    it('should detect conflicts when rescheduling', async () => {
      // Create first appointment
      const appointment1 = await createAppointment();
      const time1 = new Date(appointment1.start);

      // Create second appointment at different time
      const appointment2 = await createAppointment();

      // Try to reschedule second appointment to conflict with first
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment2.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: time1.toISOString(),
          end: new Date(time1.getTime() + 60 * 60 * 1000).toISOString(),
        })
        .expect(400);
    });

    it('should increment reschedule count on each reschedule', async () => {
      const appointment = await createAppointment();

      // First reschedule
      const newStart1 = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart1.toISOString(),
          end: new Date(newStart1.getTime() + 60 * 60 * 1000).toISOString(),
        })
        .expect(200);

      // Second reschedule
      const newStart2 = new Date(Date.now() + 96 * 60 * 60 * 1000);
      const response = await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/reschedule`)
        .set('Authorization', authToken)
        .send({
          start: newStart2.toISOString(),
          end: new Date(newStart2.getTime() + 60 * 60 * 1000).toISOString(),
        })
        .expect(200);

      expect(response.body.bookingMetadata.rescheduleCount).toBe(2);
    });
  });

  describe('GET /appointments/:id/status-history - Get Status History', () => {
    it('should return status history for appointment', async () => {
      const appointment = await createAppointment();

      // Go through several transitions
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointment.id}/status-history`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.length).toBe(2);

      // Verify first transition
      expect(response.body[0].fromStatus).toBe(AppointmentStatus.SCHEDULED);
      expect(response.body[0].toStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(response.body[0].action).toBe('confirm');
      expect(response.body[0].userId).toBe(mockUser.userId);

      // Verify second transition
      expect(response.body[1].fromStatus).toBe(AppointmentStatus.CONFIRMED);
      expect(response.body[1].toStatus).toBe(AppointmentStatus.CHECKED_IN);
      expect(response.body[1].action).toBe('check_in');
    });

    it('should return empty history for new appointment', async () => {
      const appointment = await createAppointment();

      const response = await request(app.getHttpServer())
        .get(`/appointments/${appointment.id}/status-history`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Terminal State Enforcement', () => {
    it('should prevent any transition from completed state', async () => {
      const appointment = await createAppointment();

      // Complete the flow
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      // All transitions should fail
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/no-show`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should prevent any transition from cancelled state', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/cancel`)
        .set('Authorization', authToken)
        .send({
          reason: 'Cancelled',
          cancellationType: 'patient',
        })
        .expect(200);

      // All transitions should fail
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });

    it('should prevent any transition from no-show state', async () => {
      const appointment = await createAppointment();

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/check-in`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/no-show`)
        .set('Authorization', authToken)
        .send({})
        .expect(200);

      // All transitions should fail
      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/confirm`)
        .set('Authorization', authToken)
        .send({ confirmationMethod: 'phone' })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/start`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/appointments/${appointment.id}/complete`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);
    });
  });
});
