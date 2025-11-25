/**
 * GDPR Integration Tests
 *
 * Comprehensive integration tests for GDPR compliance operations
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { GdprModule } from '../../src/modules/gdpr/gdpr.module';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import { RelationshipsModule } from '../../src/modules/relationships/relationships.module';
import {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  PatientDataFactory,
  RelationshipDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';

describe('GDPR Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule, GdprModule, RelationshipsModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('GET /patients/:patientId/gdpr/export - Export Patient Data', () => {
    let patientId: string;

    beforeEach(async () => {
      // Create a patient with full data
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Export',
            lastName: 'Patient',
            patientNumber: 'EXP-001',
          }),
        )
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should export complete patient data', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toBeDefined();

      const exportedData = response.body.data;

      // Verify core data is exported
      expect(exportedData.id).toBe(patientId);
      expect(exportedData.person).toBeDefined();
      expect(exportedData.person.firstName).toBe('Export');
      expect(exportedData.person.lastName).toBe('Patient');
    });

    it('should include contact information in export', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      expect(exportedData.contacts).toBeDefined();
      expect(exportedData.contacts.phones).toBeDefined();
      expect(exportedData.contacts.emails).toBeDefined();
      expect(exportedData.contacts.addresses).toBeDefined();
    });

    it('should include demographics in export', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      expect(exportedData.demographics).toBeDefined();
    });

    it('should include medical information in export', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      expect(exportedData.medical).toBeDefined();
      expect(exportedData.medical.allergies).toBeDefined();
      expect(exportedData.medical.medications).toBeDefined();
      expect(exportedData.medical.conditions).toBeDefined();
    });

    it('should include metadata in export', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      expect(exportedData.createdAt).toBeDefined();
      expect(exportedData.updatedAt).toBeDefined();
      expect(exportedData.organizationId).toBeDefined();
      expect(exportedData.clinicId).toBeDefined();
    });

    it('should include relationships in export', async () => {
      // Create a related patient and relationship
      const relatedResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const relatedId = relatedResponse.body.data.id;

      await authenticatedRequest(context.app, 'post', `/patients/${patientId}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(relatedId, 'spouse'))
        .expect(201);

      // Export data
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      expect(exportedData.relationships).toBeDefined();
      expect(Array.isArray(exportedData.relationships)).toBe(true);
      expect(exportedData.relationships.length).toBeGreaterThan(0);
    });

    it('should export data in structured JSON format', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = response.body.data;

      // Verify it's valid JSON (already parsed by supertest)
      expect(typeof exportedData).toBe('object');
      expect(exportedData).not.toBeNull();
    });

    it('should fail to export non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${fakeId}/gdpr/export`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail to export with invalid UUID', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/invalid-uuid/gdpr/export',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('DELETE /patients/:patientId/gdpr/anonymize - Anonymize Patient', () => {
    let patientId: string;

    beforeEach(async () => {
      // Create a patient with identifiable data
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Sensitive',
            lastName: 'Data',
            patientNumber: 'SENS-001',
            ssn: '123-45-6789',
          }),
        )
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should anonymize patient data', async () => {
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.message).toContain('anonymized');
    });

    it('should remove PII after anonymization', async () => {
      // Anonymize patient
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Verify patient data is anonymized
      const getResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}`,
      ).expect(200);

      const anonymizedData = getResponse.body.data;

      // Check that PII is removed or anonymized
      expect(anonymizedData.person.firstName).not.toBe('Sensitive');
      expect(anonymizedData.person.lastName).not.toBe('Data');

      // SSN should be removed
      if (anonymizedData.person.ssn) {
        expect(anonymizedData.person.ssn).not.toBe('123-45-6789');
      }

      // Email addresses should be anonymized
      if (anonymizedData.contacts?.emails) {
        anonymizedData.contacts.emails.forEach((email: any) => {
          expect(email.address).not.toContain('Sensitive');
          expect(email.address).not.toContain('Data');
        });
      }

      // Phone numbers should be anonymized
      if (anonymizedData.contacts?.phones) {
        anonymizedData.contacts.phones.forEach((phone: any) => {
          expect(phone.number).toContain('ANONYMIZED');
        });
      }
    });

    it('should preserve non-PII data structure after anonymization', async () => {
      // Anonymize patient
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Get anonymized data
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}`,
      ).expect(200);

      const anonymizedData = response.body.data;

      // Should still have ID and structure
      expect(anonymizedData.id).toBe(patientId);
      expect(anonymizedData.organizationId).toBeDefined();
      expect(anonymizedData.clinicId).toBeDefined();
      expect(anonymizedData.createdAt).toBeDefined();
      expect(anonymizedData.updatedAt).toBeDefined();
    });

    it('should mark patient as anonymized', async () => {
      // Anonymize patient
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Get patient data
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}`,
      ).expect(200);

      const anonymizedData = response.body.data;

      // Should have anonymization flag or indicator
      expect(
        anonymizedData.isAnonymized ||
          anonymizedData.status === 'anonymized' ||
          anonymizedData.gdprStatus === 'anonymized',
      ).toBe(true);
    });

    it('should fail to anonymize non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${fakeId}/gdpr/anonymize`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail to anonymize already anonymized patient', async () => {
      // Anonymize once
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Try to anonymize again
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid UUID', async () => {
      const response = await authenticatedRequest(
        context.app,
        'delete',
        '/patients/invalid-uuid/gdpr/anonymize',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('GDPR Compliance Workflows', () => {
    let patientId: string;

    beforeEach(async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Workflow',
            lastName: 'Test',
          }),
        )
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should support export before anonymization workflow', async () => {
      // Export data first
      const exportResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      expect(exportResponse.body.data).toBeDefined();
      const originalData = exportResponse.body.data;

      // Then anonymize
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Verify original data was captured in export
      expect(originalData.person.firstName).toBe('Workflow');
      expect(originalData.person.lastName).toBe('Test');
    });

    it('should handle export of anonymized patient', async () => {
      // Anonymize patient
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Export anonymized data
      const exportResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = exportResponse.body.data;

      // Should export anonymized data
      expect(exportedData.person.firstName).not.toBe('Workflow');
      expect(exportedData.person.lastName).not.toBe('Test');
    });

    it('should preserve patient ID throughout GDPR operations', async () => {
      const originalId = patientId;

      // Export
      const exportResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      expect(exportResponse.body.data.id).toBe(originalId);

      // Anonymize
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patientId}/gdpr/anonymize`,
      ).expect(200);

      // Verify ID unchanged
      const getResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}`,
      ).expect(200);

      expect(getResponse.body.data.id).toBe(originalId);
    });
  });

  describe('GDPR Data Portability', () => {
    it('should export data in machine-readable format', async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Portable',
            lastName: 'Data',
          }),
        )
        .expect(201);

      const patientId = response.body.data.id;

      const exportResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = exportResponse.body.data;

      // Verify data is structured and can be programmatically processed
      expect(typeof exportedData).toBe('object');
      expect(exportedData.person).toBeDefined();
      expect(exportedData.contacts).toBeDefined();

      // Should be serializable to JSON
      expect(() => JSON.stringify(exportedData)).not.toThrow();
    });

    it('should include all relevant patient data fields in export', async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createFullPatientDto())
        .expect(201);

      const patientId = response.body.data.id;

      const exportResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/gdpr/export`,
      ).expect(200);

      const exportedData = exportResponse.body.data;

      // Verify comprehensive data export
      const expectedFields = [
        'id',
        'person',
        'contacts',
        'demographics',
        'medical',
        'createdAt',
        'updatedAt',
      ];

      expectedFields.forEach((field) => {
        expect(exportedData[field]).toBeDefined();
      });
    });
  });
});
