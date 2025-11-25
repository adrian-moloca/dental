/**
 * Patient Integration Tests
 *
 * Comprehensive integration tests for patient CRUD operations and edge cases
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  PatientDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';
import { createTestUser } from '@dentalos/shared-testing';
import type { OrganizationId } from '@dentalos/shared-types';

describe('Patients Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('POST /patients - Create Patient', () => {
    it('should create a patient with full profile', async () => {
      const patientData = PatientDataFactory.createFullPatientDto({
        firstName: 'John',
        lastName: 'Doe',
        patientNumber: 'PAT-001',
      });

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(patientData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      TestAssertions.expectValidPatient(response.body.data);

      expect(response.body.data.person.firstName).toBe('John');
      expect(response.body.data.person.lastName).toBe('Doe');
      expect(response.body.data.patientNumber).toBe('PAT-001');
      expect(response.body.data.contacts.phones).toHaveLength(1);
      expect(response.body.data.contacts.emails).toHaveLength(1);
      expect(response.body.data.contacts.addresses).toHaveLength(1);
      expect(response.body.data.medical.allergies).toContain('Penicillin');
      expect(response.body.data.tags).toContain('test-patient');
    });

    it('should create a patient with minimal data', async () => {
      const patientData = PatientDataFactory.createMinimalPatientDto({
        firstName: 'Jane',
        lastName: 'Smith',
      });

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(patientData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      TestAssertions.expectValidPatient(response.body.data);

      expect(response.body.data.person.firstName).toBe('Jane');
      expect(response.body.data.person.lastName).toBe('Smith');
      expect(response.body.data.contacts).toBeUndefined();
    });

    it('should fail with invalid data (missing required fields)', async () => {
      const invalidData = PatientDataFactory.createInvalidPatientDto();

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(invalidData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid date format', async () => {
      const patientData = PatientDataFactory.createMinimalPatientDto({
        dateOfBirth: 'invalid-date',
      });

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(patientData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid email format', async () => {
      const patientData = PatientDataFactory.createFullPatientDto({
        emails: [
          {
            type: 'personal',
            address: 'not-an-email',
            isPrimary: true,
          },
        ],
      });

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(patientData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid phone format', async () => {
      const patientData = PatientDataFactory.createFullPatientDto({
        phones: [
          {
            type: 'mobile',
            number: 'invalid-phone',
            isPrimary: true,
          },
        ],
      });

      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(patientData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with duplicate patient number', async () => {
      const patientNumber = `PAT-DUPLICATE-${Date.now()}`;

      // Create first patient
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            patientNumber,
          }),
        )
        .expect(201);

      // Try to create second patient with same number
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            patientNumber,
          }),
        )
        .expect(409);

      TestAssertions.expectErrorResponse(response, 409);
    });
  });

  describe('GET /patients/:id - Get Patient', () => {
    let createdPatientId: string;

    beforeEach(async () => {
      // Create a patient for testing
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      createdPatientId = response.body.data.id;
    });

    it('should get patient by ID', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${createdPatientId}`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectValidPatient(response.body.data);
      expect(response.body.data.id).toBe(createdPatientId);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${fakeId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/invalid-uuid',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail cross-tenant access', async () => {
      // Create patient with one tenant
      const patient1Response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const patientId = patient1Response.body.data.id;

      // Create new context with different tenant
      const differentTenantUser = createTestUser({
        organizationId: 'org-different-001' as OrganizationId,
      });

      const differentTenantContext = await createTestApp([PatientsModule], differentTenantUser);

      // Try to access patient from different tenant
      const response = await authenticatedRequest(
        differentTenantContext.app,
        'get',
        `/patients/${patientId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);

      await closeTestApp(differentTenantContext);
    });
  });

  describe('PATCH /patients/:id - Update Patient', () => {
    let createdPatientId: string;

    beforeEach(async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Original',
            lastName: 'Name',
          }),
        )
        .expect(201);

      createdPatientId = response.body.data.id;
    });

    it('should update patient partial fields', async () => {
      const updateData = {
        person: {
          firstName: 'Updated',
        },
      };

      const response = await authenticatedRequest(
        context.app,
        'patch',
        `/patients/${createdPatientId}`,
      )
        .send(updateData)
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.person.firstName).toBe('Updated');
      expect(response.body.data.person.lastName).toBe('Name'); // Should remain unchanged
    });

    it('should update contact information', async () => {
      const updateData = {
        contacts: {
          phones: [
            {
              type: 'mobile',
              number: '+1-555-9999',
              isPrimary: true,
            },
          ],
        },
      };

      const response = await authenticatedRequest(
        context.app,
        'patch',
        `/patients/${createdPatientId}`,
      )
        .send(updateData)
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.contacts.phones[0].number).toBe('+1-555-9999');
    });

    it('should update tags', async () => {
      const updateData = {
        tags: ['vip', 'high-risk'],
      };

      const response = await authenticatedRequest(
        context.app,
        'patch',
        `/patients/${createdPatientId}`,
      )
        .send(updateData)
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.tags).toContain('vip');
      expect(response.body.data.tags).toContain('high-risk');
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(context.app, 'patch', `/patients/${fakeId}`)
        .send({ person: { firstName: 'Test' } })
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail with invalid update data', async () => {
      const updateData = {
        person: {
          dateOfBirth: 'invalid-date',
        },
      };

      const response = await authenticatedRequest(
        context.app,
        'patch',
        `/patients/${createdPatientId}`,
      )
        .send(updateData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('GET /patients - Search Patients', () => {
    beforeEach(async () => {
      // Create test patients
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Alice',
            lastName: 'Anderson',
            gender: 'female',
            tags: ['vip'],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Bob',
            lastName: 'Brown',
            gender: 'male',
            tags: ['regular'],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Charlie',
            lastName: 'Anderson',
            gender: 'male',
            tags: ['vip', 'high-risk'],
          }),
        )
        .expect(201);
    });

    it('should search patients by name', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Anderson' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectPaginatedResponse(response);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.some((p: any) => p.person.lastName === 'Anderson')).toBe(true);
    });

    it('should search patients by email', async () => {
      // Create patient with specific email
      const uniqueEmail = `unique-${Date.now()}@example.com`;
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            emails: [
              {
                type: 'personal',
                address: uniqueEmail,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: uniqueEmail })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by gender', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ gender: 'female' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.every((p: any) => p.person.gender === 'female')).toBe(true);
    });

    it('should filter by tags', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ tags: ['vip'] })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.every((p: any) => p.tags?.includes('vip'))).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ status: 'active' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectPaginatedResponse(response);
    });

    it('should support pagination', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ page: 1, limit: 2 })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectPaginatedResponse(response);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should support sorting', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ sortBy: 'lastName', sortOrder: 'asc' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);

      // Verify sorting (if we have at least 2 patients)
      if (response.body.data.length >= 2) {
        const lastNames = response.body.data.map((p: any) => p.person.lastName);
        const sortedLastNames = [...lastNames].sort();
        expect(lastNames).toEqual(sortedLastNames);
      }
    });

    it('should return empty results for no matches', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'NonExistentPatient123456' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should handle invalid pagination params', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ page: -1, limit: 1000 })
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('DELETE /patients/:id - Soft Delete Patient', () => {
    let createdPatientId: string;

    beforeEach(async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      createdPatientId = response.body.data.id;
    });

    it('should soft delete patient', async () => {
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${createdPatientId}`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.message).toContain('deleted');

      // Verify patient is soft deleted (cannot be retrieved)
      await authenticatedRequest(context.app, 'get', `/patients/${createdPatientId}`).expect(404);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${fakeId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should not allow deleting already deleted patient', async () => {
      // Delete once
      await authenticatedRequest(context.app, 'delete', `/patients/${createdPatientId}`).expect(
        200,
      );

      // Try to delete again
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${createdPatientId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });
  });
});
