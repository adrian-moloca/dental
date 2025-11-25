/**
 * Search Integration Tests
 *
 * Comprehensive integration tests for advanced patient search and duplicate detection
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { SearchModule } from '../../src/modules/search/search.module';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  PatientDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';

describe('Search Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule, SearchModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('GET /search/patients/by-phone - Search by Phone', () => {
    const uniquePhone = '+1-555-1234';

    beforeEach(async () => {
      // Create patients with specific phone numbers
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Phone',
            lastName: 'Test1',
            phones: [
              {
                type: 'mobile',
                number: uniquePhone,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Phone',
            lastName: 'Test2',
            phones: [
              {
                type: 'home',
                number: '+1-555-9876',
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);
    });

    it('should find patient by exact phone match', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-phone')
        .query({ phoneNumber: uniquePhone })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(
        response.body.data.some((p: any) =>
          p.contacts?.phones?.some((ph: any) => ph.number === uniquePhone),
        ),
      ).toBe(true);
    });

    it('should find patient by normalized phone number', async () => {
      // Try different formats
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-phone')
        .query({ phoneNumber: '15551234' }) // Without formatting
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
    });

    it('should return empty array for non-existent phone', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-phone')
        .query({ phoneNumber: '+1-555-0000' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should fail with missing phone number parameter', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/search/patients/by-phone',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('GET /search/patients/by-email - Search by Email', () => {
    const uniqueEmail = `unique-${Date.now()}@example.com`;

    beforeEach(async () => {
      // Create patients with specific emails
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Email',
            lastName: 'Test1',
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

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Email',
            lastName: 'Test2',
            emails: [
              {
                type: 'work',
                address: 'different@example.com',
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);
    });

    it('should find patient by exact email match', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-email')
        .query({ email: uniqueEmail })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(
        response.body.data.some((p: any) =>
          p.contacts?.emails?.some((e: any) => e.address === uniqueEmail),
        ),
      ).toBe(true);
    });

    it('should find patient by case-insensitive email', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-email')
        .query({ email: uniqueEmail.toUpperCase() })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for non-existent email', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-email')
        .query({ email: 'nonexistent@example.com' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should fail with missing email parameter', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/search/patients/by-email',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid email format', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/search/patients/by-email')
        .query({ email: 'not-an-email' })
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('GET /patients/duplicates/search - Find Duplicates', () => {
    beforeEach(async () => {
      // Create potential duplicates - same phone
      const duplicatePhone = '+1-555-DUPE';

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Duplicate',
            lastName: 'Patient',
            phones: [
              {
                type: 'mobile',
                number: duplicatePhone,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Duplicate',
            lastName: 'Patient',
            phones: [
              {
                type: 'home',
                number: duplicatePhone,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      // Create potential duplicates - same email
      const duplicateEmail = `duplicate-${Date.now()}@example.com`;

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Email',
            lastName: 'Duplicate',
            emails: [
              {
                type: 'personal',
                address: duplicateEmail,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Email',
            lastName: 'Duplicate',
            emails: [
              {
                type: 'work',
                address: duplicateEmail,
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      // Create potential duplicates - same name and DOB
      const sameDOB = new Date('1980-06-15');

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Same',
            lastName: 'Name',
            dateOfBirth: sameDOB,
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Same',
            lastName: 'Name',
            dateOfBirth: sameDOB,
          }),
        )
        .expect(201);
    });

    it('should find duplicate patients by phone', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/duplicates/search',
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);

      // Verify duplicate groups contain matching phone numbers
      const phoneGroups = response.body.data.filter((group: any) =>
        group.some((p: any) => p.contacts?.phones?.some((ph: any) => ph.number === '+1-555-DUPE')),
      );

      expect(phoneGroups.length).toBeGreaterThan(0);
    });

    it('should find duplicate patients by email', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/duplicates/search',
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);

      // Check if any groups have duplicate emails
      const hasEmailDuplicates = response.body.data.some((group: any) =>
        group.some((p: any) => p.person.firstName === 'Email' && p.person.lastName === 'Duplicate'),
      );

      expect(hasEmailDuplicates).toBe(true);
    });

    it('should find duplicate patients by name and DOB', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/duplicates/search',
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);

      // Check if any groups have duplicate name + DOB
      const hasNameDobDuplicates = response.body.data.some((group: any) =>
        group.some((p: any) => p.person.firstName === 'Same' && p.person.lastName === 'Name'),
      );

      expect(hasNameDobDuplicates).toBe(true);
    });

    it('should return empty array when no duplicates exist', async () => {
      // Create a new isolated test context with no patients
      const cleanContext = await createTestApp([PatientsModule, SearchModule]);

      const response = await authenticatedRequest(
        cleanContext.app,
        'get',
        '/patients/duplicates/search',
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.count).toBe(0);

      await closeTestApp(cleanContext);
    });
  });

  describe('Full-Text Search Integration', () => {
    beforeEach(async () => {
      // Create patients with various searchable attributes
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Alexander',
            lastName: 'Hamilton',
            emails: [
              {
                type: 'personal',
                address: 'alexander.hamilton@example.com',
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Alexandra',
            lastName: 'Johnson',
            emails: [
              {
                type: 'personal',
                address: 'alexandra.j@example.com',
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Robert',
            lastName: 'Smith',
            emails: [
              {
                type: 'personal',
                address: 'robert.smith@example.com',
                isPrimary: true,
              },
            ],
          }),
        )
        .expect(201);
    });

    it('should search by partial first name', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Alex' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(
        response.body.data.some((p: any) => p.person.firstName.startsWith('Alex')),
      ).toBe(true);
    });

    it('should search by last name', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Hamilton' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.some((p: any) => p.person.lastName === 'Hamilton')).toBe(true);
    });

    it('should search by email', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'alexander.hamilton@example.com' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle case-insensitive search', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'hamilton' }) // lowercase
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.some((p: any) => p.person.lastName === 'Hamilton')).toBe(true);
    });

    it('should handle partial email search', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'alexandra.j' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Advanced Search Combinations', () => {
    beforeEach(async () => {
      // Create diverse patient dataset
      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Sarah',
            lastName: 'Connor',
            gender: 'female',
            tags: ['vip', 'high-priority'],
          }),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'John',
            lastName: 'Connor',
            gender: 'male',
            tags: ['regular'],
          }),
        )
        .expect(201);
    });

    it('should combine search term with gender filter', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Connor', gender: 'female' })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.every((p: any) => p.person.gender === 'female')).toBe(true);
      expect(response.body.data.some((p: any) => p.person.lastName === 'Connor')).toBe(true);
    });

    it('should combine search term with tag filter', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Connor', tags: ['vip'] })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.every((p: any) => p.tags?.includes('vip'))).toBe(true);
    });

    it('should apply pagination to search results', async () => {
      const response = await authenticatedRequest(context.app, 'get', '/patients')
        .query({ search: 'Connor', page: 1, limit: 1 })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectPaginatedResponse(response);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });
  });
});
