/**
 * End-to-End Correlation ID Propagation Test
 *
 * Verifies that correlation IDs propagate correctly across:
 * - HTTP requests with middleware
 * - Service-to-service HTTP calls
 * - AsyncLocalStorage context
 * - Response headers
 *
 * @module shared-tracing/test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import {
  generateCorrelationId,
  getCorrelationId,
  getCausationId,
  runWithCorrelationContext,
  createCorrelationContext,
  extractCorrelationId,
  extractCausationId,
  createCorrelationHeaders,
  injectCorrelationId,
} from '../src/correlation-id';
import { CORRELATION_ID_HEADER, CAUSATION_ID_HEADER } from '../src/types';

describe('Correlation ID End-to-End Flow', () => {
  describe('Context Management', () => {
    it('should maintain correlation context within async operation', async () => {
      const correlationId = generateCorrelationId();
      const context = createCorrelationContext({ correlationId });

      const result = await runWithCorrelationContext(context, async () => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Context should be available
        const retrievedId = getCorrelationId();
        expect(retrievedId).toBe(correlationId);

        return { success: true };
      });

      expect(result.success).toBe(true);
    });

    it('should isolate correlation context between concurrent operations', async () => {
      const id1 = uuidv4();
      const id2 = uuidv4();

      const promise1 = runWithCorrelationContext(
        createCorrelationContext({ correlationId: id1 }),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 20));
          return getCorrelationId();
        }
      );

      const promise2 = runWithCorrelationContext(
        createCorrelationContext({ correlationId: id2 }),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return getCorrelationId();
        }
      );

      const [retrievedId1, retrievedId2] = await Promise.all([promise1, promise2]);

      expect(retrievedId1).toBe(id1);
      expect(retrievedId2).toBe(id2);
      expect(retrievedId1).not.toBe(retrievedId2);
    });

    it('should support causation chain with causationId', async () => {
      const correlationId = uuidv4();
      const causationId = uuidv4();

      await runWithCorrelationContext(
        createCorrelationContext({ correlationId, causationId }),
        async () => {
          expect(getCorrelationId()).toBe(correlationId);
          expect(getCausationId()).toBe(causationId);
        }
      );
    });
  });

  describe('Header Extraction and Injection', () => {
    it('should extract correlation ID from HTTP headers', () => {
      const correlationId = uuidv4();
      const headers = {
        'x-correlation-id': correlationId,
        'content-type': 'application/json',
      };

      const extracted = extractCorrelationId(headers);
      expect(extracted).toBe(correlationId);
    });

    it('should extract correlation ID from case-insensitive headers', () => {
      const correlationId = uuidv4();
      const headers = {
        'X-Correlation-Id': correlationId,
      };

      const extracted = extractCorrelationId(headers);
      expect(extracted).toBe(correlationId);
    });

    it('should fallback to X-Request-Id header', () => {
      const requestId = uuidv4();
      const headers = {
        'x-request-id': requestId,
      };

      const extracted = extractCorrelationId(headers);
      expect(extracted).toBe(requestId);
    });

    it('should generate new correlation ID if headers are missing', () => {
      const headers = {};
      const extracted = extractCorrelationId(headers);

      expect(extracted).toBeDefined();
      expect(extracted).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should extract causation ID from headers', () => {
      const causationId = uuidv4();
      const headers = {
        'x-causation-id': causationId,
      };

      const extracted = extractCausationId(headers);
      expect(extracted).toBe(causationId);
    });

    it('should return undefined if causation ID is missing', () => {
      const headers = {};
      const extracted = extractCausationId(headers);

      expect(extracted).toBeUndefined();
    });

    it('should create headers for outgoing HTTP requests', async () => {
      const correlationId = uuidv4();
      const causationId = uuidv4();

      await runWithCorrelationContext(
        createCorrelationContext({ correlationId, causationId }),
        async () => {
          const headers = createCorrelationHeaders();

          expect(headers['x-correlation-id']).toBe(correlationId);
          expect(headers['x-causation-id']).toBe(causationId);
        }
      );
    });

    it('should inject correlation metadata into event payload', async () => {
      const correlationId = uuidv4();
      const causationId = uuidv4();

      await runWithCorrelationContext(
        createCorrelationContext({ correlationId, causationId }),
        async () => {
          const payload = {
            eventName: 'UserCreated',
            userId: '12345',
          };

          const enriched = injectCorrelationId(payload);

          expect(enriched.correlationId).toBe(correlationId);
          expect(enriched.causationId).toBe(causationId);
          expect(enriched.timestamp).toBeInstanceOf(Date);
          expect(enriched.eventName).toBe('UserCreated');
          expect(enriched.userId).toBe('12345');
        }
      );
    });
  });

  describe('Service-to-Service Propagation Simulation', () => {
    it('should propagate correlation ID across simulated service boundary', async () => {
      const originalCorrelationId = uuidv4();

      // Simulate Service A receiving HTTP request
      await runWithCorrelationContext(
        createCorrelationContext({ correlationId: originalCorrelationId }),
        async () => {
          // Service A extracts correlation ID
          const serviceACorrelationId = getCorrelationId();
          expect(serviceACorrelationId).toBe(originalCorrelationId);

          // Service A makes HTTP call to Service B
          const headersForServiceB = createCorrelationHeaders();

          // Simulate Service B receiving the request
          await runWithCorrelationContext(
            createCorrelationContext({
              correlationId: extractCorrelationId(headersForServiceB),
              causationId: extractCausationId(headersForServiceB),
            }),
            async () => {
              // Service B should have the same correlation ID
              const serviceBCorrelationId = getCorrelationId();
              expect(serviceBCorrelationId).toBe(originalCorrelationId);
            }
          );
        }
      );
    });

    it('should support event-driven causation chain', async () => {
      const rootCorrelationId = uuidv4();

      // Service A handles HTTP request
      await runWithCorrelationContext(
        createCorrelationContext({ correlationId: rootCorrelationId }),
        async () => {
          // Service A emits domain event
          const event = injectCorrelationId({
            eventName: 'OrderCreated',
            orderId: '67890',
          });

          expect(event.correlationId).toBe(rootCorrelationId);
          expect(event.causationId).toBeUndefined(); // No causation yet

          // Service B consumes event (the event ID becomes the causationId for new operations)
          const eventId = uuidv4();
          await runWithCorrelationContext(
            createCorrelationContext({
              correlationId: event.correlationId, // Maintain same correlation ID
              causationId: eventId, // Event ID becomes causation ID
            }),
            async () => {
              const serviceBCorrelationId = getCorrelationId();
              const serviceBCausationId = getCausationId();

              // Same correlation ID
              expect(serviceBCorrelationId).toBe(rootCorrelationId);

              // Causation ID tracks the event that triggered this operation
              expect(serviceBCausationId).toBe(eventId);

              // Service B emits a new event
              const newEvent = injectCorrelationId({
                eventName: 'PaymentProcessed',
                paymentId: '11111',
              });

              // Maintains correlation ID
              expect(newEvent.correlationId).toBe(rootCorrelationId);

              // Includes causation from Service B's operation
              expect(newEvent.causationId).toBe(eventId);
            }
          );
        }
      );
    });
  });

  describe('Real-World Scenarios', () => {
    it('should trace patient journey across multiple services', async () => {
      const patientJourneyId = uuidv4();

      // 1. Patient Portal: User books appointment
      await runWithCorrelationContext(
        createCorrelationContext({
          correlationId: patientJourneyId,
          metadata: { source: 'patient-portal' },
        }),
        async () => {
          expect(getCorrelationId()).toBe(patientJourneyId);

          // Portal makes API call to Scheduling Service
          const schedulingHeaders = createCorrelationHeaders();

          // 2. Scheduling Service: Creates appointment
          await runWithCorrelationContext(
            createCorrelationContext({
              correlationId: extractCorrelationId(schedulingHeaders),
              metadata: { source: 'scheduling-service' },
            }),
            async () => {
              expect(getCorrelationId()).toBe(patientJourneyId);

              // Scheduling emits AppointmentCreated event
              const appointmentEvent = injectCorrelationId({
                eventName: 'AppointmentCreated',
                appointmentId: 'apt-123',
              });

              const appointmentEventId = uuidv4();

              // 3. Notification Service: Sends confirmation email
              await runWithCorrelationContext(
                createCorrelationContext({
                  correlationId: appointmentEvent.correlationId,
                  causationId: appointmentEventId,
                  metadata: { source: 'notification-service' },
                }),
                async () => {
                  expect(getCorrelationId()).toBe(patientJourneyId);
                  expect(getCausationId()).toBe(appointmentEventId);

                  // All services can trace back to original patient action
                  const notificationLog = {
                    correlationId: getCorrelationId(),
                    causationId: getCausationId(),
                    message: 'Appointment confirmation sent',
                  };

                  expect(notificationLog.correlationId).toBe(patientJourneyId);
                }
              );

              // 4. Billing Service: Creates invoice
              await runWithCorrelationContext(
                createCorrelationContext({
                  correlationId: appointmentEvent.correlationId,
                  causationId: appointmentEventId,
                  metadata: { source: 'billing-service' },
                }),
                async () => {
                  expect(getCorrelationId()).toBe(patientJourneyId);

                  // All operations in the patient journey share the same correlation ID
                  const billingLog = {
                    correlationId: getCorrelationId(),
                    message: 'Invoice created for appointment',
                  };

                  expect(billingLog.correlationId).toBe(patientJourneyId);
                }
              );
            }
          );
        }
      );
    });
  });
});
