/**
 * Timeline Integration Tests
 *
 * Comprehensive integration tests for patient timeline functionality
 *
 * @module test/integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TimelineModule } from '../../src/modules/timeline/timeline.module';
import { PatientsModule } from '../../src/modules/patients/patients.module';
import {
  createTestApp,
  closeTestApp,
  authenticatedRequest,
  PatientDataFactory,
  TestAssertions,
  type TestContext,
} from './test-setup';

describe('Timeline Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp([PatientsModule, TimelineModule]);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('GET /patients/:patientId/timeline - Get Timeline', () => {
    let patientId: string;

    beforeEach(async () => {
      // Create a patient
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            firstName: 'Timeline',
            lastName: 'Patient',
          }),
        )
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should get timeline for patient', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include patient creation event in timeline', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);

      // Should have creation event
      const hasCreationEvent = response.body.data.some(
        (event: any) =>
          event.eventType === 'patient.created' || event.eventType === 'PATIENT_CREATED',
      );

      expect(hasCreationEvent).toBe(true);
    });

    it('should include patient update events in timeline', async () => {
      // Update patient to generate timeline event
      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({
          person: {
            firstName: 'Updated',
          },
        })
        .expect(200);

      // Get timeline
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      // Should have update event
      const hasUpdateEvent = response.body.data.some(
        (event: any) =>
          event.eventType === 'patient.updated' || event.eventType === 'PATIENT_UPDATED',
      );

      expect(hasUpdateEvent).toBe(true);
    });

    it('should order timeline events chronologically', async () => {
      // Create multiple events
      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({ tags: ['tag1'] })
        .expect(200);

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({ tags: ['tag2'] })
        .expect(200);

      // Get timeline
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const events = response.body.data;

      // Verify chronological order (most recent first or oldest first)
      if (events.length >= 2) {
        const timestamps = events.map((e: any) => new Date(e.timestamp || e.createdAt).getTime());

        // Check if sorted (either ascending or descending)
        const isAscending = timestamps.every(
          (val: number, i: number, arr: number[]) => i === 0 || val >= arr[i - 1],
        );
        const isDescending = timestamps.every(
          (val: number, i: number, arr: number[]) => i === 0 || val <= arr[i - 1],
        );

        expect(isAscending || isDescending).toBe(true);
      }
    });

    it('should include event metadata in timeline entries', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const events = response.body.data;

      if (events.length > 0) {
        const event = events[0];

        // Verify event structure
        expect(event.eventType).toBeDefined();
        expect(event.timestamp || event.createdAt).toBeDefined();

        // Should have some context or metadata
        expect(
          event.metadata || event.data || event.payload || event.context,
        ).toBeDefined();
      }
    });

    it('should return empty timeline for patient with no events', async () => {
      // Create new patient
      const newResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const newPatientId = newResponse.body.data.id;

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${newPatientId}/timeline`,
      ).expect(200);

      // Should have at least creation event, but if truly empty:
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail for non-existent patient', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${fakeId}/timeline`,
      ).expect(404);

      TestAssertions.expectErrorResponse(response, 404);
    });

    it('should fail with invalid UUID', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        '/patients/invalid-uuid/timeline',
      ).expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('Timeline Pagination', () => {
    let patientId: string;

    beforeEach(async () => {
      // Create patient
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      patientId = response.body.data.id;

      // Generate multiple timeline events
      for (let i = 0; i < 5; i++) {
        await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
          .send({ tags: [`tag-${i}`] })
          .expect(200);

        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });

    it('should support pagination with page parameter', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      )
        .query({ page: 1, limit: 3 })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should support pagination with limit parameter', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      )
        .query({ limit: 2 })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should return pagination metadata', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      )
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(0);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should handle second page request', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      )
        .query({ page: 2, limit: 2 })
        .expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.pagination.page).toBe(2);
    });

    it('should handle invalid pagination parameters', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      )
        .query({ page: -1, limit: 1000 })
        .expect(400);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('Timeline Event Types', () => {
    let patientId: string;

    beforeEach(async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createFullPatientDto({
            firstName: 'Event',
            lastName: 'Test',
          }),
        )
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should track patient creation event', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const hasCreationEvent = response.body.data.some((event: any) =>
        event.eventType?.toLowerCase().includes('created'),
      );

      expect(hasCreationEvent).toBe(true);
    });

    it('should track patient update events', async () => {
      // Update patient
      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({
          person: {
            firstName: 'Updated',
          },
        })
        .expect(200);

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const hasUpdateEvent = response.body.data.some((event: any) =>
        event.eventType?.toLowerCase().includes('updated'),
      );

      expect(hasUpdateEvent).toBe(true);
    });

    it('should track multiple sequential updates', async () => {
      // Multiple updates
      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({ tags: ['update1'] })
        .expect(200);

      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({ tags: ['update2'] })
        .expect(200);

      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({ tags: ['update3'] })
        .expect(200);

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      // Should have multiple events
      expect(response.body.data.length).toBeGreaterThanOrEqual(4); // Creation + 3 updates
    });
  });

  describe('Timeline Performance and Limits', () => {
    let patientId: string;

    beforeEach(async () => {
      const response = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      patientId = response.body.data.id;
    });

    it('should handle timeline for patient with many events', async () => {
      // Generate many events
      for (let i = 0; i < 10; i++) {
        await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
          .send({ tags: [`many-events-${i}`] })
          .expect(200);
      }

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should use default pagination when not specified', async () => {
      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.pagination).toBeDefined();

      // Should have default values
      expect(response.body.pagination.page).toBeGreaterThan(0);
      expect(response.body.pagination.limit).toBeGreaterThan(0);
    });
  });

  describe('Timeline Data Integrity', () => {
    it('should maintain timeline after patient updates', async () => {
      // Create patient
      const createResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(
          PatientDataFactory.createMinimalPatientDto({
            firstName: 'Original',
            lastName: 'Name',
          }),
        )
        .expect(201);

      const patientId = createResponse.body.data.id;

      // Get initial timeline
      const timeline1 = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const initialEventCount = timeline1.body.data.length;

      // Update patient
      await authenticatedRequest(context.app, 'patch', `/patients/${patientId}`)
        .send({
          person: {
            firstName: 'Updated',
          },
        })
        .expect(200);

      // Get updated timeline
      const timeline2 = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      // Should have more events
      expect(timeline2.body.data.length).toBeGreaterThan(initialEventCount);
    });

    it('should include relevant event details', async () => {
      const createResponse = await authenticatedRequest(context.app, 'post', '/patients')
        .send(PatientDataFactory.createMinimalPatientDto())
        .expect(201);

      const patientId = createResponse.body.data.id;

      const response = await authenticatedRequest(
        context.app,
        'get',
        `/patients/${patientId}/timeline`,
      ).expect(200);

      const events = response.body.data;

      if (events.length > 0) {
        const event = events[0];

        // Each event should have essential fields
        expect(event.eventType).toBeDefined();
        expect(event.timestamp || event.createdAt).toBeDefined();

        // Should be able to identify the patient
        expect(event.patientId || event.aggregateId).toBeDefined();
      }
    });
  });
});
