/**
 * Insurance Management Integration Tests
 *
 * Tests for insurance policy management including:
 * - Multiple insurance policies per patient
 * - Coverage details (annual max, remaining, deductible)
 * - Policy verification
 * - Policy expiration tracking
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Insurance Management (e2e)', () => {
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
      firstName: 'Insurance',
      lastName: 'TestPatient',
      dateOfBirth: '1975-03-20',
      gender: 'male',
    },
    contacts: {
      emails: [{ type: 'personal', address: 'insurance.test@test.com', isPrimary: true }],
    },
    consent: {
      gdprConsent: true,
    },
  };

  const primaryInsurance = {
    provider: {
      name: 'Delta Dental',
      phone: '+1-800-555-1234',
      payerId: 'DDPFL',
    },
    policyNumber: 'POL-123456789',
    groupNumber: 'GRP-001',
    groupName: 'Acme Corporation',
    planName: 'Premium Plus PPO',
    planType: 'PPO',
    subscriberName: 'Insurance TestPatient',
    subscriberId: 'SUB-12345',
    subscriberRelationship: 'self',
    subscriberDateOfBirth: '1975-03-20',
    effectiveDate: '2024-01-01',
    expirationDate: '2025-12-31',
    coverage: {
      annualMax: 2000,
      remaining: 1500,
      deductible: 50,
      deductibleMet: 50,
      preventivePercent: 100,
      basicPercent: 80,
      majorPercent: 50,
      orthoPercent: 50,
      orthoLifetimeMax: 1500,
      basicWaitingPeriodMonths: 0,
      majorWaitingPeriodMonths: 12,
      currency: 'RON',
    },
    isPrimary: true,
  };

  const secondaryInsurance = {
    provider: {
      name: 'MetLife Dental',
      phone: '+1-800-555-5678',
      payerId: 'METLF',
    },
    policyNumber: 'SEC-987654321',
    groupNumber: 'GRP-002',
    planName: 'Basic Dental',
    planType: 'HMO',
    subscriberName: 'Jane TestPatient',
    subscriberRelationship: 'spouse',
    subscriberDateOfBirth: '1978-07-10',
    effectiveDate: '2024-01-01',
    expirationDate: '2024-12-31',
    coverage: {
      annualMax: 1000,
      remaining: 1000,
      deductible: 100,
      deductibleMet: 0,
      preventivePercent: 100,
      basicPercent: 70,
      majorPercent: 40,
      currency: 'RON',
    },
    isPrimary: false,
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

  describe('Insurance Policy CRUD', () => {
    it('should create a patient for insurance testing', async () => {
      const response = await request(app.getHttpServer())
        .post('/patients')
        .set(authHeaders)
        .send(testPatient)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      patientId = response.body.data.id;
    });

    it('should add primary insurance policy', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(primaryInsurance)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].provider.name).toBe('Delta Dental');
      expect(response.body.data[0].isPrimary).toBe(true);
    });

    it('should add secondary insurance policy', async () => {
      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(secondaryInsurance)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[1].isPrimary).toBe(false);
    });

    it('should get all insurance policies', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.policies).toHaveLength(2);
      expect(response.body.data.primaryPolicy).toBeDefined();
      expect(response.body.data.hasCoverage).toBe(true);
    });

    it('should update insurance coverage details', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/insurance/0`)
        .set(authHeaders)
        .send({
          coverage: {
            remaining: 1200, // Patient used some benefits
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].coverage.remaining).toBe(1200);
    });

    it('should switch primary insurance', async () => {
      // Make secondary insurance primary
      const response = await request(app.getHttpServer())
        .patch(`/patients/${patientId}/insurance/1`)
        .set(authHeaders)
        .send({ isPrimary: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[1].isPrimary).toBe(true);
      expect(response.body.data[0].isPrimary).toBe(false);
    });

    it('should deactivate insurance policy', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/patients/${patientId}/insurance/1`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Insurance Verification', () => {
    it('should verify insurance eligibility', async () => {
      const verifyDto = {
        policyIndex: 0,
        verifiedBy: 'front-desk-user',
        coverage: {
          annualMax: 2000,
          remaining: 1100,
          deductible: 50,
          deductibleMet: 50,
        },
        notes: 'Verified via phone call with Delta Dental',
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance/verify`)
        .set(authHeaders)
        .send(verifyDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].isVerified).toBe(true);
      expect(response.body.data[0].verifiedAt).toBeDefined();
    });

    it('should update coverage during verification', async () => {
      const verifyDto = {
        policyIndex: 0,
        coverage: {
          remaining: 1000,
        },
      };

      const response = await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance/verify`)
        .set(authHeaders)
        .send(verifyDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].coverage.remaining).toBe(1000);
    });
  });

  describe('Coverage Calculations', () => {
    it('should return insurance summary in Patient360 view', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/360`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.insuranceSummary).toBeDefined();
      expect(response.body.data.insuranceSummary.hasCoverage).toBe(true);
      expect(response.body.data.insuranceSummary.primaryPolicy).toBeDefined();
    });

    it('should calculate total coverage from all active policies', async () => {
      // Re-add secondary insurance
      const reAddSecondary = {
        ...secondaryInsurance,
        isPrimary: false,
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(reAddSecondary)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/360`)
        .set(authHeaders)
        .expect(200);

      // Should have combined annual max from both policies
      const totalAnnualMax = response.body.data.insuranceSummary.totalAnnualMax;
      expect(totalAnnualMax).toBeGreaterThan(0);
    });
  });

  describe('Insurance Expiration', () => {
    it('should flag expired insurance in critical alerts', async () => {
      // Add an expired policy
      const expiredPolicy = {
        provider: {
          name: 'Expired Insurance Co',
          payerId: 'EXPRD',
        },
        policyNumber: 'EXP-111111',
        subscriberName: 'Insurance TestPatient',
        subscriberRelationship: 'self',
        effectiveDate: '2022-01-01',
        expirationDate: '2022-12-31', // Expired
        isPrimary: false,
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(expiredPolicy)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/patients/${patientId}/360`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.data.criticalAlerts.expiredInsurance).toBe(true);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should require provider name', async () => {
      const invalidPolicy = {
        provider: {
          // Missing name
          payerId: 'TEST',
        },
        policyNumber: 'TEST-123',
        subscriberName: 'Test Patient',
        subscriberRelationship: 'self',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(invalidPolicy)
        .expect(400);
    });

    it('should require policy number', async () => {
      const invalidPolicy = {
        provider: {
          name: 'Test Insurance',
        },
        // Missing policyNumber
        subscriberName: 'Test Patient',
        subscriberRelationship: 'self',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(invalidPolicy)
        .expect(400);
    });

    it('should validate subscriber relationship', async () => {
      const invalidPolicy = {
        provider: {
          name: 'Test Insurance',
        },
        policyNumber: 'TEST-123',
        subscriberName: 'Test Patient',
        subscriberRelationship: 'invalid_relationship',
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(invalidPolicy)
        .expect(400);
    });

    it('should return error for invalid policy index', async () => {
      await request(app.getHttpServer())
        .patch(`/patients/${patientId}/insurance/999`)
        .set(authHeaders)
        .send({ notes: 'Update' })
        .expect(400);
    });

    it('should return error for invalid verification index', async () => {
      const verifyDto = {
        policyIndex: 999,
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance/verify`)
        .set(authHeaders)
        .send(verifyDto)
        .expect(400);
    });

    it('should validate coverage percentages are 0-100', async () => {
      const invalidPolicy = {
        provider: {
          name: 'Test Insurance',
        },
        policyNumber: 'TEST-123',
        subscriberName: 'Test Patient',
        subscriberRelationship: 'self',
        coverage: {
          preventivePercent: 150, // Invalid - over 100
        },
      };

      await request(app.getHttpServer())
        .post(`/patients/${patientId}/insurance`)
        .set(authHeaders)
        .send(invalidPolicy)
        .expect(400);
    });

    it('should return 404 for non-existent patient', async () => {
      await request(app.getHttpServer())
        .get(`/patients/non-existent-id/insurance`)
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should not return insurance from different tenant', async () => {
      const differentTenantHeaders = {
        Authorization: 'Bearer test-jwt-token',
        'x-tenant-id': 'different-tenant',
        'x-organization-id': 'different-org',
      };

      // Should return 404 as patient doesn't exist in different tenant
      await request(app.getHttpServer())
        .get(`/patients/${patientId}/insurance`)
        .set(differentTenantHeaders)
        .expect(404);
    });
  });
});
