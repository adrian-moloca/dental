/**
 * Relationships Integration Tests
 *
 * Comprehensive integration tests for patient relationship management
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { RelationshipsModule } from '../../src/modules/relationships/relationships.module';
import { PatientsModule } from '../../src/modules/patients/patients.module';
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

describe('Relationships Integration Tests', () => {
  let context: TestContext;
  let patient1Id: string;
  let patient2Id: string;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule, RelationshipsModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  beforeEach(async () => {
    // Create two patients for relationship testing
    const response1 = await authenticatedRequest(context.app, 'post', '/patients')
      .send(
        PatientDataFactory.createMinimalPatientDto({
          firstName: 'Parent',
          lastName: 'Patient',
        }),
      )
      .expect(201);

    patient1Id = response1.body.data.id;

    const response2 = await authenticatedRequest(context.app, 'post', '/patients')
      .send(
        PatientDataFactory.createMinimalPatientDto({
          firstName: 'Child',
          lastName: 'Patient',
        }),
      )
      .expect(201);

    patient2Id = response2.body.data.id;
  });

  describe('POST /patients/:patientId/relationships - Create Relationship', () => {
    it('should create parent-child relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(
        patient2Id,
        'parent',
        {
          notes: 'Biological parent',
          canMakeDecisions: true,
        },
      );

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.relationshipType).toBe('parent');
      expect(response.body.data.canMakeDecisions).toBe(true);
      expect(response.body.data.notes).toBe('Biological parent');
    });

    it('should create spouse relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(patient2Id, 'spouse');

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.relationshipType).toBe('spouse');
    });

    it('should create emergency contact relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(
        patient2Id,
        'emergency',
        {
          isEmergencyContact: true,
          notes: 'Primary emergency contact',
        },
      );

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.relationshipType).toBe('emergency');
      expect(response.body.data.isEmergencyContact).toBe(true);
    });

    it('should create guardian relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(
        patient2Id,
        'guardian',
        {
          canMakeDecisions: true,
          canViewRecords: true,
        },
      );

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.relationshipType).toBe('guardian');
      expect(response.body.data.canMakeDecisions).toBe(true);
      expect(response.body.data.canViewRecords).toBe(true);
    });

    it('should create sibling relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(
        patient2Id,
        'sibling',
      );

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(201);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.relationshipType).toBe('sibling');
    });

    it('should fail to create self-relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(patient1Id, 'parent');

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail to create duplicate relationship', async () => {
      const relationshipData = RelationshipDataFactory.createRelationshipDto(patient2Id, 'parent');

      // Create first relationship
      await authenticatedRequest(context.app, 'post', `/patients/${patient1Id}/relationships`)
        .send(relationshipData)
        .expect(201);

      // Try to create duplicate
      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(409);

      TestAssertions.expectErrorResponse(response, 409);
    });

    it('should fail to relate to non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const relationshipData = RelationshipDataFactory.createRelationshipDto(fakeId, 'parent');

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail cross-tenant relationship', async () => {
      // Create patient in different tenant
      const differentTenantUser = createTestUser({
        organizationId: 'org-different-001' as OrganizationId,
      });

      const differentContext = await createTestApp(
        [PatientsModule, RelationshipsModule],
        differentTenantUser,
      );

      const response3 = await authenticatedRequest(differentContext.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const differentTenantPatientId = response3.body.data.id;

      // Try to create relationship across tenants
      const relationshipData = RelationshipDataFactory.createRelationshipDto(
        differentTenantPatientId,
        'parent',
      );

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(404);

      TestAssertions.expectErrorResponse(response, 404);

      await closeTestApp(differentContext);
    });

    it('should fail with invalid relationship type', async () => {
      const relationshipData = {
        relatedPatientId: patient2Id,
        relationshipType: 'invalid-type',
      };

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should fail with invalid UUID for related patient', async () => {
      const relationshipData = {
        relatedPatientId: 'invalid-uuid',
        relationshipType: 'parent',
      };

      const response = await authenticatedRequest(
        context.app,
        'post',
        `/patients/${patient1Id}/relationships`,
      )
        .send(relationshipData)
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('GET /patients/:patientId/relationships - List Relationships', () => {
    beforeEach(async () => {
      // Create multiple relationships
      await authenticatedRequest(context.app, 'post', `/patients/${patient1Id}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(patient2Id, 'parent'))
        .expect(201);

      // Create a third patient and add another relationship
      const response3 = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            firstName: 'Sibling',
            lastName: 'Patient',
          }),
        )
        .expect(201);

      const patient3Id = response3.body.data.id;

      await authenticatedRequest(context.app, 'post', `/patients/${patient1Id}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(patient3Id, 'sibling'))
        .expect(201);
    });

    it('should list all relationships for a patient', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patient1Id}/relationships`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.some((r: any) => r.relationshipType === 'parent')).toBe(true);
      expect(response.body.data.some((r: any) => r.relationshipType === 'sibling')).toBe(true);
    });

    it('should return empty array for patient with no relationships', async () => {
      // Create new patient with no relationships
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const newPatientId = response.body.data.id;

      const relationshipsResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${newPatientId}/relationships`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(relationshipsResponse, 200);
      expect(relationshipsResponse.body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${fakeId}/relationships`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });
  });

  describe('DELETE /patients/:patientId/relationships/:relatedPatientId - Delete Relationship', () => {
    beforeEach(async () => {
      // Create a relationship to delete
      await authenticatedRequest(context.app, 'post', `/patients/${patient1Id}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(patient2Id, 'parent'))
        .expect(201);
    });

    it('should delete relationship', async () => {
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patient1Id}/relationships/${patient2Id}`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.message).toContain('removed');

      // Verify relationship is deleted
      const listResponse = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patient1Id}/relationships`,
      ).expect(200);

      expect(listResponse.body.data).toHaveLength(0);
    });

    it('should return 404 for non-existent relationship', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patient1Id}/relationships/${fakeId}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${fakeId}/relationships/${patient2Id}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should not allow deleting already deleted relationship', async () => {
      // Delete once
      await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patient1Id}/relationships/${patient2Id}`,
      ).expect(200);

      // Try to delete again
      const response = await authenticatedRequest(
        context.app,
        'delete',
        `/patients/${patient1Id}/relationships/${patient2Id}`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });
  });

  describe('Bidirectional Relationships', () => {
    it('should handle bidirectional relationships correctly', async () => {
      // Create relationship from patient1 to patient2
      await authenticatedRequest(context.app, 'post', `/patients/${patient1Id}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(patient2Id, 'parent'))
        .expect(201);

      // Create reverse relationship from patient2 to patient1
      await authenticatedRequest(context.app, 'post', `/patients/${patient2Id}/relationships`)
        .send(RelationshipDataFactory.createRelationshipDto(patient1Id, 'child'))
        .expect(201);

      // Check both patients have relationships
      const patient1Relationships = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patient1Id}/relationships`,
      ).expect(200);

      const patient2Relationships = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patient2Id}/relationships`,
      ).expect(200);

      expect(patient1Relationships.body.data).toHaveLength(1);
      expect(patient2Relationships.body.data).toHaveLength(1);
    });
  });
});
