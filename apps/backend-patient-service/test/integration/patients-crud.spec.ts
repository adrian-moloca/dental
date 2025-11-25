/**
 * Patient CRUD Integration Tests
 *
 * Tests full request/response cycles through controllers with MongoDB.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as request from 'supertest';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import { Patient, PatientSchema } from '../../src/modules/patients/entities/patient.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('Patient CRUD API (Integration)', () => {
  let app: INestApplication;
  let patientModel: Model<any>;
  let authToken: string;
  let tenantId: string;
  let organizationId: string;
  let clinicId: string;

  // Mock JWT auth guard to inject user context
  const mockUser = {
    userId: 'user-test-123',
    organizationId: 'org-test-123',
    tenantId: 'tenant-test-123',
    email: 'test@dentalos.com',
    roles: ['admin'],
    permissions: ['patients:read', 'patients:write', 'patients:merge'],
  };

  beforeAll(async () => {
    // Use in-memory MongoDB or test database
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/dentalos-patient-test', {
          autoCreate: true,
        }),
        MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
        EventEmitterModule.forRoot(),
        PatientsModule,
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue({ canActivate: () => true })
      .overrideGuard('TenantIsolationGuard')
      .useValue({ canActivate: () => true })
      .overrideGuard('PermissionsGuard')
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Mock CurrentUser decorator by injecting user in request
    app.use((req: any, _res: any, next: any) => {
      req.user = mockUser;
      next();
    });

    await app.init();

    patientModel = moduleFixture.get<Model<any>>(getModelToken(Patient.name));
    tenantId = mockUser.organizationId;
    organizationId = mockUser.organizationId;
    clinicId = 'clinic-test-123';
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await patientModel.deleteMany({});
    await app.close();
  });

  afterEach(async () => {
    await patientModel.deleteMany({});
  });

  describe('POST /patients - Create Patient', () => {
    const createPatientDto = {
      clinicId: 'clinic-test-123',
      patientNumber: 'PAT-001',
      person: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-15',
        gender: 'male',
      },
      contacts: {
        phones: [
          {
            type: 'mobile',
            number: '+1-555-0100',
            isPrimary: true,
          },
        ],
        emails: [
          {
            type: 'personal',
            address: 'john.doe@example.com',
            isPrimary: true,
          },
        ],
        addresses: [
          {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            isPrimary: true,
          },
        ],
      },
      medical: {
        allergies: ['penicillin'],
        medications: ['aspirin'],
        conditions: ['hypertension'],
        flags: ['high_risk'],
      },
      primaryInsurance: {
        provider: 'Blue Cross',
        policyNumber: 'BC123456',
        subscriberName: 'John Doe',
        subscriberRelationship: 'self',
      },
      tags: ['vip', 'returning'],
      communicationPreferences: {
        preferredChannel: 'email',
        appointmentReminders: true,
        marketingConsent: false,
        smsNotifications: true,
      },
      consent: {
        gdprConsent: true,
        marketingConsent: false,
        dataProcessingConsent: true,
        treatmentConsent: true,
      },
      assignedProviderId: 'provider-123',
      notes: 'New patient from referral',
    };

    it('should create a patient successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPatientDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Patient created successfully');
      expect(response.body.data).toMatchObject({
        person: {
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
        },
        status: 'active',
        isDeleted: false,
        tenantId: mockUser.organizationId,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.consent.gdprConsent).toBe(true);
      expect(response.body.data.consent.gdprConsentDate).toBeDefined();
    });

    it('should reject patient creation without GDPR consent', async () => {
      const invalidDto = {
        ...createPatientDto,
        consent: { gdprConsent: false },
      };

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should reject patient with invalid email format', async () => {
      const invalidDto = {
        ...createPatientDto,
        contacts: {
          ...createPatientDto.contacts,
          emails: [{ type: 'personal', address: 'not-an-email', isPrimary: true }],
        },
      };

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should reject patient with missing required fields', async () => {
      const invalidDto = {
        clinicId: 'clinic-123',
        // Missing person and consent
      };

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should set consent dates automatically', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPatientDto)
        .expect(201);

      expect(response.body.data.consent.gdprConsentDate).toBeDefined();
      expect(response.body.data.consent.dataProcessingConsentDate).toBeDefined();
      expect(response.body.data.consent.treatmentConsentDate).toBeDefined();
    });
  });

  describe('GET /patients - List Patients', () => {
    beforeEach(async () => {
      // Seed test data
      await patientModel.insertMany([
        {
          id: 'patient-1',
          tenantId: mockUser.organizationId,
          organizationId: mockUser.organizationId,
          clinicId: 'clinic-test-123',
          person: {
            firstName: 'Alice',
            lastName: 'Anderson',
            dateOfBirth: new Date('1985-05-10'),
            gender: 'female',
          },
          contacts: { phones: [], emails: [], addresses: [] },
          medical: { allergies: [], medications: [], conditions: [], flags: [] },
          communicationPreferences: {
            preferredChannel: 'email',
            appointmentReminders: true,
            marketingConsent: false,
            recallReminders: true,
            smsNotifications: false,
            emailNotifications: true,
          },
          consent: {
            gdprConsent: true,
            gdprConsentDate: new Date(),
            marketingConsent: false,
            dataProcessingConsent: true,
            treatmentConsent: false,
          },
          tags: [],
          status: 'active',
          isDeleted: false,
          valueScore: 0,
          version: 1,
        },
        {
          id: 'patient-2',
          tenantId: mockUser.organizationId,
          organizationId: mockUser.organizationId,
          clinicId: 'clinic-test-123',
          person: {
            firstName: 'Bob',
            lastName: 'Brown',
            dateOfBirth: new Date('1992-08-22'),
            gender: 'male',
          },
          contacts: { phones: [], emails: [], addresses: [] },
          medical: { allergies: [], medications: [], conditions: [], flags: [] },
          communicationPreferences: {
            preferredChannel: 'email',
            appointmentReminders: true,
            marketingConsent: false,
            recallReminders: true,
            smsNotifications: false,
            emailNotifications: true,
          },
          consent: {
            gdprConsent: true,
            gdprConsentDate: new Date(),
            marketingConsent: false,
            dataProcessingConsent: true,
            treatmentConsent: false,
          },
          tags: [],
          status: 'active',
          isDeleted: false,
          valueScore: 0,
          version: 1,
        },
      ]);
    });

    it('should list all patients with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        total: 2,
        page: 1,
        limit: 1,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should filter by status', async () => {
      await patientModel.updateOne({ id: 'patient-1' }, { status: 'inactive' });

      const response = await request(app.getHttpServer())
        .get('/patients?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].person.firstName).toBe('Bob');
    });

    it('should search by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/patients?search=Alice')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].person.firstName).toBe('Alice');
    });

    it('should not return deleted patients by default', async () => {
      await patientModel.updateOne({ id: 'patient-1' }, { isDeleted: true });

      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('patient-2');
    });
  });

  describe('GET /patients/:id - Get Patient by ID', () => {
    let patientId: string;

    beforeEach(async () => {
      const patient = await patientModel.create({
        id: 'patient-single-123',
        tenantId: mockUser.organizationId,
        organizationId: mockUser.organizationId,
        clinicId: 'clinic-test-123',
        person: {
          firstName: 'Charlie',
          lastName: 'Chen',
          dateOfBirth: new Date('1988-03-15'),
          gender: 'male',
        },
        contacts: {
          phones: [{ type: 'mobile', number: '+1-555-0200', isPrimary: true, isActive: true }],
          emails: [{ type: 'personal', address: 'charlie@example.com', isPrimary: true, isVerified: false }],
          addresses: [],
        },
        medical: { allergies: [], medications: [], conditions: [], flags: [] },
        communicationPreferences: {
          preferredChannel: 'email',
          appointmentReminders: true,
          marketingConsent: false,
          recallReminders: true,
          smsNotifications: false,
          emailNotifications: true,
        },
        consent: {
          gdprConsent: true,
          gdprConsentDate: new Date(),
          marketingConsent: false,
          dataProcessingConsent: true,
          treatmentConsent: false,
        },
        tags: ['regular'],
        status: 'active',
        isDeleted: false,
        valueScore: 50,
        version: 1,
      });
      patientId = patient.id;
    });

    it('should get patient by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: patientId,
        person: {
          firstName: 'Charlie',
          lastName: 'Chen',
        },
        status: 'active',
      });
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .get('/patients/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not return deleted patient', async () => {
      await patientModel.updateOne({ id: patientId }, { isDeleted: true });

      await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /patients/:id - Update Patient', () => {
    let patientId: string;

    beforeEach(async () => {
      const patient = await patientModel.create({
        id: 'patient-update-123',
        tenantId: mockUser.organizationId,
        organizationId: mockUser.organizationId,
        clinicId: 'clinic-test-123',
        person: {
          firstName: 'David',
          lastName: 'Davis',
          dateOfBirth: new Date('1995-07-20'),
          gender: 'male',
        },
        contacts: {
          phones: [],
          emails: [{ type: 'personal', address: 'david@example.com', isPrimary: true, isVerified: false }],
          addresses: [],
        },
        medical: { allergies: [], medications: [], conditions: [], flags: [] },
        communicationPreferences: {
          preferredChannel: 'email',
          appointmentReminders: true,
          marketingConsent: false,
          recallReminders: true,
          smsNotifications: false,
          emailNotifications: true,
        },
        consent: {
          gdprConsent: true,
          gdprConsentDate: new Date(),
          marketingConsent: false,
          dataProcessingConsent: true,
          treatmentConsent: false,
        },
        tags: [],
        status: 'active',
        isDeleted: false,
        valueScore: 0,
        version: 1,
      });
      patientId = patient.id;
    });

    it('should update patient information', async () => {
      const updateDto = {
        person: {
          firstName: 'Daniel',
        },
        tags: ['premium', 'vip'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Patient updated successfully');
      expect(response.body.data.person.firstName).toBe('Daniel');
      expect(response.body.data.person.lastName).toBe('Davis'); // Preserved
      expect(response.body.data.tags).toEqual(['premium', 'vip']);
    });

    it('should update contact information', async () => {
      const updateDto = {
        contacts: {
          phones: [{ type: 'mobile', number: '+1-555-9999', isPrimary: true }],
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.contacts.phones).toHaveLength(1);
      expect(response.body.data.contacts.phones[0].number).toBe('+1-555-9999');
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .patch('/patients/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ person: { firstName: 'Test' } })
        .expect(404);
    });

    it('should reject invalid data', async () => {
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ person: { gender: 'invalid-gender' } })
        .expect(400);
    });
  });

  describe('DELETE /patients/:id - Soft Delete Patient', () => {
    let patientId: string;

    beforeEach(async () => {
      const patient = await patientModel.create({
        id: 'patient-delete-123',
        tenantId: mockUser.organizationId,
        organizationId: mockUser.organizationId,
        clinicId: 'clinic-test-123',
        person: {
          firstName: 'Eve',
          lastName: 'Evans',
          dateOfBirth: new Date('1993-11-05'),
          gender: 'female',
        },
        contacts: { phones: [], emails: [], addresses: [] },
        medical: { allergies: [], medications: [], conditions: [], flags: [] },
        communicationPreferences: {
          preferredChannel: 'email',
          appointmentReminders: true,
          marketingConsent: false,
          recallReminders: true,
          smsNotifications: false,
          emailNotifications: true,
        },
        consent: {
          gdprConsent: true,
          gdprConsentDate: new Date(),
          marketingConsent: false,
          dataProcessingConsent: true,
          treatmentConsent: false,
        },
        tags: [],
        status: 'active',
        isDeleted: false,
        valueScore: 0,
        version: 1,
      });
      patientId = patient.id;
    });

    it('should soft delete patient', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Patient deleted successfully');

      // Verify patient is marked as deleted
      const deletedPatient = await patientModel.findOne({ id: patientId });
      expect(deletedPatient?.isDeleted).toBe(true);
      expect(deletedPatient?.deletedAt).toBeDefined();
      expect(deletedPatient?.status).toBe('archived');
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .delete('/patients/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not delete already deleted patient', async () => {
      await patientModel.updateOne({ id: patientId }, { isDeleted: true });

      await request(app.getHttpServer())
        .delete(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Multi-Tenancy Isolation', () => {
    it('should not return patients from different tenants', async () => {
      // Create patient for different tenant
      await patientModel.create({
        id: 'patient-other-tenant',
        tenantId: 'other-tenant-456',
        organizationId: 'other-org-456',
        clinicId: 'clinic-test-123',
        person: {
          firstName: 'Other',
          lastName: 'Tenant',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'male',
        },
        contacts: { phones: [], emails: [], addresses: [] },
        medical: { allergies: [], medications: [], conditions: [], flags: [] },
        communicationPreferences: {
          preferredChannel: 'email',
          appointmentReminders: true,
          marketingConsent: false,
          recallReminders: true,
          smsNotifications: false,
          emailNotifications: true,
        },
        consent: {
          gdprConsent: true,
          gdprConsentDate: new Date(),
          marketingConsent: false,
          dataProcessingConsent: true,
          treatmentConsent: false,
        },
        tags: [],
        status: 'active',
        isDeleted: false,
        valueScore: 0,
        version: 1,
      });

      const response = await request(app.getHttpServer())
        .get('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0); // Should not see other tenant's data
    });
  });
});
