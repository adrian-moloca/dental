/**
 * Medical Alerts Integration Tests
 *
 * Tests for the medical alerts functionality including:
 * - Allergies with severity levels
 * - Medical conditions with ICD-10 codes
 * - Current medications
 * - Patient flags
 *
 * CRITICAL: These tests verify patient safety-critical functionality.
 * All tests must pass before deploying changes.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Medical Alerts (e2e)', () => {
  let app: INestApplication;
  let patientId: string;

  // Mock auth headers for testing
  const authHeaders = {
    Authorization: 'Bearer test-jwt-token',
    'x-tenant-id': 'test-tenant',
    'x-organization-id': 'test-org',
  };

  // Test data
  const testPatient = {
    clinicId: 'test-clinic-123',
    person: {
      firstName: 'Medical',
      lastName: 'AlertTest',
      dateOfBirth: '1985-06-15',
      gender: 'female',
    },
    contacts: {
      emails: [{ type: 'personal', address: 'medical.alert@test.com', isPrimary: true }],
    },
    consent: {
      gdprConsent: true,
    },
  };

  const testAllergy = {
    allergen: 'Penicillin',
    severity: 'life_threatening',
    reaction: 'Anaphylaxis - severe respiratory distress',
    notes: 'Patient carries EpiPen',
  };

  const testCondition = {
    name: 'Type 2 Diabetes Mellitus',
    icd10Code: 'E11.9',
    status: 'active',
    severity: 'moderate',
    notes: 'Well controlled with medication',
  };

  const testMedication = {
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    dosage: '500mg',
    frequency: 'Twice daily with meals',
    route: 'oral',
    reason: 'Blood sugar control',
  };

  const testFlag = {
    type: 'anxious',
    description: 'Patient experiences severe dental anxiety, recommend sedation for procedures',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Allergy Management', () => {
    it('should create a patient for allergy testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set(authHeaders)
        .send(testPatient)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      patientId = response.body.data.id;
    });

    it('should add a life-threatening allergy', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/allergies`)
        .set(authHeaders)
        .send(testAllergy)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].allergen).toBe('Penicillin');
      expect(response.body.data[0].severity).toBe('life_threatening');
    });

    it('should add a mild allergy', async () => {
      const mildAllergy = {
        allergen: 'Latex',
        severity: 'mild',
        reaction: 'Skin irritation',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/allergies`)
        .set(authHeaders)
        .send(mildAllergy)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should get all allergies', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/medical-alerts`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.allergies).toHaveLength(2);
      expect(response.body.data.allergies[0].severity).toBe('life_threatening');
    });

    it('should update an allergy severity', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/allergies/1`)
        .set(authHeaders)
        .send({ severity: 'moderate' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[1].severity).toBe('moderate');
    });

    it('should soft delete an allergy', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}/allergies/1`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid allergy severity', async () => {
      const invalidAllergy = {
        allergen: 'Test',
        severity: 'invalid_severity',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/allergies`)
        .set(authHeaders)
        .send(invalidAllergy)
        .expect(400);
    });

    it('should require allergen name', async () => {
      const incompleteAllergy = {
        severity: 'mild',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/allergies`)
        .set(authHeaders)
        .send(incompleteAllergy)
        .expect(400);
    });
  });

  describe('Medical Condition Management', () => {
    it('should add a medical condition with ICD-10 code', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/conditions`)
        .set(authHeaders)
        .send(testCondition)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Type 2 Diabetes Mellitus');
      expect(response.body.data[0].icd10Code).toBe('E11.9');
    });

    it('should add hypertension with ICD-10 code', async () => {
      const hypertension = {
        name: 'Essential (primary) hypertension',
        icd10Code: 'I10',
        status: 'chronic',
        severity: 'moderate',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/conditions`)
        .set(authHeaders)
        .send(hypertension)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should update condition status to resolved', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/conditions/0`)
        .set(authHeaders)
        .send({
          status: 'resolved',
          resolvedDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].status).toBe('resolved');
    });

    it('should validate ICD-10 code format', async () => {
      const invalidCondition = {
        name: 'Test Condition',
        icd10Code: 'INVALID', // Invalid format
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/conditions`)
        .set(authHeaders)
        .send(invalidCondition)
        .expect(400);
    });

    it('should accept valid ICD-10 codes with decimals', async () => {
      const conditionWithDecimal = {
        name: 'Dental caries on pit and fissure surface limited to enamel',
        icd10Code: 'K02.51',
        status: 'active',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/conditions`)
        .set(authHeaders)
        .send(conditionWithDecimal)
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Medication Management', () => {
    it('should add a medication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/medications`)
        .set(authHeaders)
        .send(testMedication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].name).toBe('Metformin');
      expect(response.body.data[0].dosage).toBe('500mg');
    });

    it('should add blood pressure medication', async () => {
      const bpMed = {
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        route: 'oral',
        reason: 'Blood pressure control',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/medications`)
        .set(authHeaders)
        .send(bpMed)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should update medication dosage', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/medications/0`)
        .set(authHeaders)
        .send({ dosage: '1000mg' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].dosage).toBe('1000mg');
    });

    it('should discontinue medication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/medications/1`)
        .set(authHeaders)
        .send({
          isActive: false,
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[1].isActive).toBe(false);
    });
  });

  describe('Patient Flag Management', () => {
    it('should add a patient flag', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/flags`)
        .set(authHeaders)
        .send(testFlag)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].type).toBe('anxious');
    });

    it('should add a wheelchair flag', async () => {
      const wheelchairFlag = {
        type: 'wheelchair',
        description: 'Patient uses wheelchair, ensure accessible treatment room',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/flags`)
        .set(authHeaders)
        .send(wheelchairFlag)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should add a temporary flag with expiration', async () => {
      const tempFlag = {
        type: 'requires_premedication',
        description: 'Antibiotic prophylaxis required due to recent joint replacement',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/flags`)
        .set(authHeaders)
        .send(tempFlag)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data[2].expiresAt).toBeDefined();
    });

    it('should remove a flag', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}/flags/0`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject invalid flag type', async () => {
      const invalidFlag = {
        type: 'invalid_flag_type',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/flags`)
        .set(authHeaders)
        .send(invalidFlag)
        .expect(400);
    });
  });

  describe('Patient360 View', () => {
    it('should return comprehensive patient view with medical alerts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/360`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.patient).toBeDefined();
      expect(response.body.data.medicalAlerts).toBeDefined();
      expect(response.body.data.criticalAlerts).toBeDefined();
    });

    it('should flag life-threatening allergies in critical alerts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/360`)
        .set(authHeaders)
        .expect(200);

      // Check critical alerts section
      expect(response.body.data.criticalAlerts.hasLifeThreateningAllergies).toBe(true);
      expect(response.body.data.criticalAlerts.lifeThreateningAllergies.length).toBeGreaterThan(0);
    });
  });

  describe('Bulk Medical Alerts Update', () => {
    it('should update all medical alerts at once', async () => {
      const bulkUpdate = {
        allergies: [
          { allergen: 'Codeine', severity: 'severe', reaction: 'Severe nausea and vomiting' },
        ],
        conditions: [{ name: 'Asthma', icd10Code: 'J45.20', status: 'active' }],
        medications: [{ name: 'Albuterol Inhaler', dosage: 'As needed', frequency: 'PRN' }],
        flags: [{ type: 'high_risk', description: 'Multiple comorbidities' }],
      };

      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/medical-alerts`)
        .set(authHeaders)
        .send(bulkUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.allergies).toHaveLength(1);
      expect(response.body.data.conditions).toHaveLength(1);
      expect(response.body.data.medications).toHaveLength(1);
      expect(response.body.data.flags).toHaveLength(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .get(`/patients/non-existent-id/medical-alerts`)
        .set(authHeaders)
        .expect(404);
    });

    it('should return error for invalid allergy index', async () => {
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}/allergies/999`)
        .set(authHeaders)
        .send({ severity: 'mild' })
        .expect(400);
    });

    it('should return error for invalid condition index', async () => {
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}/conditions/999`)
        .set(authHeaders)
        .send({ status: 'resolved' })
        .expect(400);
    });

    it('should return error for invalid medication index', async () => {
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}/medications/999`)
        .set(authHeaders)
        .send({ dosage: '100mg' })
        .expect(400);
    });

    it('should return error for invalid flag index', async () => {
      await request(app.getHttpServer())
        .delete(`/patients/${patientId}/flags/999`)
        .set(authHeaders)
        .expect(400);
    });
  });
});
