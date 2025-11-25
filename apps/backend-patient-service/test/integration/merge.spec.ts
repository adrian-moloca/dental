/**
 * Merge Integration Tests
 *
 * Comprehensive integration tests for patient merge functionality
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import { RelationshipsModule } from '../../src/modules/relationships/relationships.module';
import { TimelineModule } from '../../src/modules/timeline/timeline.module';
import {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  PatientDataFactory,
  RelationshipDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';
import { createTestUser } from '@dentalos/shared-testing';
import type { OrganizationId } from '@dentalos/shared-types';

describe('Merge Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule, RelationshipsModule, TimelineModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('POST /patients/merge - Merge Patients', () => {
    let masterId: string;
    let duplicateId: string;

    beforeEach(async () => {
      // Create master patient
      const masterResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Master',
            lastName: 'Patient',
            patientNumber: 'MASTER-001',
            tags: ['master', 'vip'],
          }),
        )
        .expect(201);

      masterId = masterResponse.body.data.id;

      // Create duplicate patient
      const duplicateResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Duplicate',
            lastName: 'Patient',
            patientNumber: 'DUP-001',
            tags: ['duplicate'],
          }),
        )
        .expect(201);

      duplicateId = duplicateResponse.body.data.id;
    });

    it('should merge two patients successfully (master wins)', async () => {
      const mergeData = {
        masterId,
        duplicateId,
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.message).toContain('merged');

      // Verify master patient still exists
      const masterCheck = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}`,
      ).expect(200);

      TestAssertions.expectValidPatient(masterCheck.body.data);
      expect(masterCheck.body.data.person.firstName).toBe('Master');
    });

    it('should soft-delete duplicate patient after merge', async () => {
      const mergeData = {
        masterId,
        duplicateId,
      };

      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(200);

      // Verify duplicate patient is soft-deleted (returns 404)
      const duplicateCheck = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${duplicateId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(duplicateCheck, 404);
    });

    it('should transfer relationships to master patient', async () => {
      // Create a third patient to have relationships with
      const relatedResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            firstName: 'Related',
            lastName: 'Patient',
          }),
        )
        .expect(201);

      const relatedId = relatedResponse.body.data.id;

      // Create relationship from duplicate to related patient
      await authenticatedRequest(context.app, 'post', `/patients/${duplicateId}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(relatedId, 'sibling'))
        .expect(201);

      // Merge patients
      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({ masterId, duplicateId })
        .expect(200);

      // Verify relationships transferred to master
      const masterRelationships = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}/relationships`,
      ).expect(200);

      expect(masterRelationships.body.data.some((r: any) => r.relatedPatientId === relatedId)).toBe(
        true,
      );
    });

    it('should merge timeline events to master patient', async () => {
      // Update duplicate patient to create timeline events
      await authenticatedRequest(context.app, 'patch', `/patients/${duplicateId}`)
        .send({ tags: ['updated'] })
        .expect(200);

      // Get duplicate timeline before merge
      const duplicateTimelineBefore = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${duplicateId}/timeline`,
      ).expect(200);

      const duplicateEventsCount = duplicateTimelineBefore.body.data.length;

      // Merge patients
      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({ masterId, duplicateId })
        .expect(200);

      // Verify master timeline includes merged events
      const masterTimeline = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}/timeline`,
      ).expect(200);

      // Master should have at least as many events as it had + duplicate's events
      expect(masterTimeline.body.data.length).toBeGreaterThanOrEqual(duplicateEventsCount);
    });

    it('should fail to merge patient with itself', async () => {
      const mergeData = {
        masterId,
        duplicateId: masterId, // Same as master
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail to merge non-existent patients', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const mergeData = {
        masterId: fakeId,
        duplicateId,
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail to merge patients from different tenants', async () => {
      // Create patient in different tenant
      const differentTenantUser = createTestUser({
        organizationId: 'org-different-001' as OrganizationId,
      });

      const differentContext = await createTestApp([PatientsModule], differentTenantUser);

      const differentTenantResponse = await authenticatedRequest(
        differentContext.app,
        'post',
        '/patients',
      )
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const differentTenantPatientId = differentTenantResponse.body.data.id;

      // Try to merge across tenants
      const mergeData = {
        masterId,
        duplicateId: differentTenantPatientId,
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);

      await closeTestApp(differentContext);
    });

    it('should fail to merge already deleted patient', async () => {
      // Soft delete duplicate patient first
      await authenticatedRequest(context.app, 'delete', `/patients/${duplicateId}`).expect(200);

      // Try to merge
      const mergeData = {
        masterId,
        duplicateId,
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail with invalid UUID format', async () => {
      const mergeData = {
        masterId: 'invalid-uuid',
        duplicateId,
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with missing required fields', async () => {
      const mergeData = {
        masterId,
        // Missing duplicateId
      };

      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send(mergeData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('Complex Merge Scenarios', () => {
    let masterId: string;
    let duplicateId: string;

    beforeEach(async () => {
      const masterResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Complex',
            lastName: 'Master',
          }),
        )
        .expect(201);

      masterId = masterResponse.body.data.id;

      const duplicateResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Complex',
            lastName: 'Duplicate',
          }),
        )
        .expect(201);

      duplicateId = duplicateResponse.body.data.id;
    });

    it('should handle merge with multiple relationships', async () => {
      // Create multiple related patients
      const related1Response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const related2Response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const related3Response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      // Create relationships for duplicate
      await authenticatedRequest(context.app, 'post', `/patients/${duplicateId}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(related1Response.body.data.id, 'child'))
        .expect(201);

      await authenticatedRequest(context.app, 'post', `/patients/${duplicateId}/relationships`)
        .send(
          RelationshipDataFactory.createRelationshipDto(related2Response.body.data.id, 'spouse'),
        )
        .expect(201);

      await authenticatedRequest(context.app, 'post', `/patients/${duplicateId}/relationships`)
        .send(
          RelationshipDataFactory.createRelationshipDto(related3Response.body.data.id, 'sibling'),
        )
        .expect(201);

      // Merge
      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({ masterId, duplicateId })
        .expect(200);

      // Verify all relationships transferred
      const masterRelationships = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}/relationships`,
      ).expect(200);

      expect(masterRelationships.body.data).toHaveLength(3);
    });

    it('should preserve master patient data during merge', async () => {
      // Get master data before merge
      const masterBefore = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}`,
      ).expect(200);

      const originalFirstName = masterBefore.body.data.person.firstName;
      const originalLastName = masterBefore.body.data.person.lastName;

      // Merge
      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({ masterId, duplicateId })
        .expect(200);

      // Get master data after merge
      const masterAfter = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}`,
      ).expect(200);

      // Verify master data unchanged
      expect(masterAfter.body.data.person.firstName).toBe(originalFirstName);
      expect(masterAfter.body.data.person.lastName).toBe(originalLastName);
    });

    it('should handle merge when both patients have relationships', async () => {
      // Create related patient
      const relatedResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const relatedId = relatedResponse.body.data.id;

      // Create relationships for both master and duplicate
      await authenticatedRequest(context.app, 'post', `/patients/${masterId}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(relatedId, 'parent'))
        .expect(201);

      await authenticatedRequest(context.app, 'post', `/patients/${duplicateId}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(relatedId, 'guardian'))
        .expect(201);

      // Merge
      await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({ masterId, duplicateId })
        .expect(200);

      // Verify relationships
      const masterRelationships = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${masterId}/relationships`,
      ).expect(200);

      // Should have both relationships (or handle duplicates appropriately)
      expect(masterRelationships.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Merge Validation', () => {
    it('should require both masterId and duplicateId', async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({})
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should validate UUID format for masterId', async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({
          masterId: 'not-a-uuid',
          duplicateId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should validate UUID format for duplicateId', async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients/merge')
        .send({
          masterId: '00000000-0000-0000-0000-000000000000',
          duplicateId: 'not-a-uuid',
        })
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });
});
