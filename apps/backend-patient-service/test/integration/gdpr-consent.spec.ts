/**
 * GDPR Consent Tracking Integration Tests
 *
 * Verifies GDPR compliance, consent tracking, and data processing consent.
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

describe('GDPR Consent Tracking (Integration)', () => {
  let app: INestApplication;
  let patientModel: Model<any>;
  let authToken: string;

  const mockUser = {
    userId: 'user-gdpr-test',
    organizationId: 'org-gdpr-test',
    tenantId: 'tenant-gdpr-test',
    email: 'gdpr@dentalos.com',
    roles: ['admin'],
    permissions: ['patients:read', 'patients:write'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot('mongodb://localhost:27017/dentalos-gdpr-test', {
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

    app.use((req: any, _res: any, next: any) => {
      req.user = mockUser;
      next();
    });

    await app.init();

    patientModel = moduleFixture.get<Model<any>>(getModelToken(Patient.name));
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await patientModel.deleteMany({});
    await app.close();
  });

  afterEach(async () => {
    await patientModel.deleteMany({});
  });

  describe('GDPR Consent Requirements', () => {
    const basePatientDto = {
      clinicId: 'clinic-gdpr-test',
      person: {
        firstName: 'GDPR',
        lastName: 'Patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
      },
      contacts: {
        emails: [{ type: 'personal', address: 'gdpr@example.com', isPrimary: true }],
      },
    };

    it('should require GDPR consent to create patient', async () => {
      const dtoWithoutConsent = {
        ...basePatientDto,
        consent: {
          gdprConsent: false,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dtoWithoutConsent)
        .expect(400);

      expect(response.body).toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('GDPR consent'),
      });
    });

    it('should accept patient with GDPR consent', async () => {
      const dtoWithConsent = {
        ...basePatientDto,
        consent: {
          gdprConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dtoWithConsent)
        .expect(201);

      expect(response.body.data.consent.gdprConsent).toBe(true);
      expect(response.body.data.consent.gdprConsentDate).toBeDefined();
    });
  });

  describe('Consent Types Tracking', () => {
    it('should track all consent types with dates', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Multi',
          lastName: 'Consent',
          dateOfBirth: '1985-05-15',
          gender: 'female',
        },
        consent: {
          gdprConsent: true,
          marketingConsent: true,
          dataProcessingConsent: true,
          treatmentConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      const consent = response.body.data.consent;
      expect(consent.gdprConsent).toBe(true);
      expect(consent.gdprConsentDate).toBeDefined();
      expect(consent.marketingConsent).toBe(true);
      expect(consent.marketingConsentDate).toBeDefined();
      expect(consent.dataProcessingConsent).toBe(true);
      expect(consent.dataProcessingConsentDate).toBeDefined();
      expect(consent.treatmentConsent).toBe(true);
      expect(consent.treatmentConsentDate).toBeDefined();
    });

    it('should not set consent dates when consent is false', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'No',
          lastName: 'Marketing',
          dateOfBirth: '1992-08-20',
          gender: 'male',
        },
        consent: {
          gdprConsent: true,
          marketingConsent: false,
          dataProcessingConsent: false,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      const consent = response.body.data.consent;
      expect(consent.gdprConsent).toBe(true);
      expect(consent.gdprConsentDate).toBeDefined();
      expect(consent.marketingConsent).toBe(false);
      expect(consent.marketingConsentDate).toBeUndefined();
      expect(consent.dataProcessingConsent).toBe(false);
      expect(consent.dataProcessingConsentDate).toBeUndefined();
    });
  });

  describe('Marketing Consent', () => {
    let patientId: string;

    beforeEach(async () => {
      const patient = await patientModel.create({
        id: 'patient-marketing-test',
        tenantId: mockUser.organizationId,
        organizationId: mockUser.organizationId,
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Marketing',
          lastName: 'Test',
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
      patientId = patient.id;
    });

    it('should allow updating marketing consent', async () => {
      // Initial state: no marketing consent
      let patient = await patientModel.findOne({ id: patientId });
      expect(patient?.consent.marketingConsent).toBe(false);

      // Update to grant marketing consent
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          communicationPreferences: {
            marketingConsent: true,
          },
        })
        .expect(200);

      // Note: In production, you'd update consent separately
      // This test shows that communication preferences are tracked
      expect(response.body.data.communicationPreferences.marketingConsent).toBe(true);
    });
  });

  describe('Data Processing Consent', () => {
    it('should track data processing consent separately from GDPR', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Data',
          lastName: 'Processing',
          dateOfBirth: '1988-03-10',
          gender: 'female',
        },
        consent: {
          gdprConsent: true,
          dataProcessingConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.data.consent.gdprConsent).toBe(true);
      expect(response.body.data.consent.dataProcessingConsent).toBe(true);
      expect(response.body.data.consent.dataProcessingConsentDate).toBeDefined();
    });

    it('should allow GDPR consent without data processing consent', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Minimal',
          lastName: 'Consent',
          dateOfBirth: '1995-07-25',
          gender: 'male',
        },
        consent: {
          gdprConsent: true,
          dataProcessingConsent: false,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.data.consent.gdprConsent).toBe(true);
      expect(response.body.data.consent.dataProcessingConsent).toBe(false);
      expect(response.body.data.consent.dataProcessingConsentDate).toBeUndefined();
    });
  });

  describe('Treatment Consent', () => {
    it('should track treatment consent independently', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Treatment',
          lastName: 'Consent',
          dateOfBirth: '1987-11-30',
          gender: 'female',
        },
        consent: {
          gdprConsent: true,
          treatmentConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.data.consent.treatmentConsent).toBe(true);
      expect(response.body.data.consent.treatmentConsentDate).toBeDefined();
    });
  });

  describe('Consent Audit Trail', () => {
    it('should preserve consent dates on updates', async () => {
      // Create patient with consent
      const createResponse = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clinicId: 'clinic-gdpr-test',
          person: {
            firstName: 'Audit',
            lastName: 'Trail',
            dateOfBirth: '1993-04-18',
            gender: 'male',
          },
          consent: {
            gdprConsent: true,
            marketingConsent: true,
          },
        })
        .expect(201);

      const patientId = createResponse.body.data.id;
      const originalConsentDate = createResponse.body.data.consent.gdprConsentDate;
      const originalMarketingDate = createResponse.body.data.consent.marketingConsentDate;

      // Update patient (without touching consent)
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          person: { firstName: 'Updated' },
        })
        .expect(200);

      // Verify consent dates are preserved
      const getResponse = await request(app.getHttpServer())
        .get(`/patients/${patientId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.data.consent.gdprConsentDate).toBe(originalConsentDate);
      expect(getResponse.body.data.consent.marketingConsentDate).toBe(originalMarketingDate);
    });
  });

  describe('Communication Preferences and Consent', () => {
    it('should link communication preferences with consent', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Communication',
          lastName: 'Preferences',
          dateOfBirth: '1991-09-05',
          gender: 'female',
        },
        communicationPreferences: {
          preferredChannel: 'sms',
          appointmentReminders: true,
          marketingConsent: true,
          smsNotifications: true,
        },
        consent: {
          gdprConsent: true,
          marketingConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.data.communicationPreferences.marketingConsent).toBe(true);
      expect(response.body.data.consent.marketingConsent).toBe(true);
      expect(response.body.data.consent.marketingConsentDate).toBeDefined();
    });

    it('should respect marketing consent for notifications', async () => {
      const dto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'No',
          lastName: 'Marketing',
          dateOfBirth: '1994-02-14',
          gender: 'male',
        },
        communicationPreferences: {
          appointmentReminders: true,
          marketingConsent: false, // Explicitly opt-out
          smsNotifications: false,
        },
        consent: {
          gdprConsent: true,
          marketingConsent: false,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.data.communicationPreferences.marketingConsent).toBe(false);
      expect(response.body.data.consent.marketingConsent).toBe(false);
      expect(response.body.data.consent.marketingConsentDate).toBeUndefined();
    });
  });

  describe('GDPR Compliance Checks', () => {
    it('should enforce GDPR consent before any data collection', async () => {
      const dtoWithoutGdpr = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'No',
          lastName: 'GDPR',
          dateOfBirth: '1990-01-01',
          gender: 'male',
        },
        contacts: {
          emails: [{ type: 'personal', address: 'nogdpr@example.com', isPrimary: true }],
          phones: [{ type: 'mobile', number: '+1-555-0000', isPrimary: true }],
        },
        consent: {
          gdprConsent: false,
        },
      };

      await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(dtoWithoutGdpr)
        .expect(400);

      // Verify no patient was created
      const count = await patientModel.countDocuments({ 'person.lastName': 'GDPR' });
      expect(count).toBe(0);
    });

    it('should allow patient with minimal data and GDPR consent', async () => {
      const minimalDto = {
        clinicId: 'clinic-gdpr-test',
        person: {
          firstName: 'Minimal',
          lastName: 'Data',
          dateOfBirth: '1990-01-01',
          gender: 'other',
        },
        consent: {
          gdprConsent: true,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/patients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalDto)
        .expect(201);

      expect(response.body.data.consent.gdprConsent).toBe(true);
      expect(response.body.data.person.firstName).toBe('Minimal');
    });
  });
});
