// @ts-nocheck
/**
 * Event Factory
 * Creates domain events and event envelopes for testing
 *
 * @module shared-testing/factories
 */

import type { EventEnvelope, TenantContext, EventMetadata } from '@dentalos/shared-events';
import type { UUID } from '@dentalos/shared-types';
import { generateFakeUUID } from '../generators/id-generator';
import { createTestTenantContext } from '../context/test-tenant-context.builder';

/**
 * Creates a fake event envelope for testing
 *
 * @param event - Event payload
 * @param overrides - Optional envelope field overrides
 * @returns EventEnvelope wrapping the event
 *
 * @example
 * ```typescript
 * const event = { userId: 'user-123', action: 'login' };
 * const envelope = fakeEventEnvelope(event);
 * // {
 * //   eventId: 'uuid',
 * //   eventType: 'object',
 * //   payload: { userId: 'user-123', action: 'login' },
 * //   metadata: {...},
 * //   tenantContext: {...}
 * // }
 * ```
 */
export function fakeEventEnvelope<T>(
  event: T,
  overrides?: Partial<EventEnvelope<T>>
): EventEnvelope<T> {
  const now = new Date();
  const eventId = overrides?.eventId ?? generateFakeUUID();
  const eventType = overrides?.eventType ?? (typeof event === 'string' ? event : 'test.event');
  const correlationId = overrides?.correlationId ?? generateFakeUUID();
  const causationId = overrides?.causationId ?? eventId;

  const metadata: EventMetadata = {
    eventId,
    eventType,
    timestamp: overrides?.timestamp ?? now,
    version: overrides?.version ?? 1,
    correlationId,
    causationId,
    source: overrides?.source ?? 'test-service',
  };

  const tenantContext = overrides?.tenantContext ?? createTestTenantContext();

  return {
    eventId,
    eventType,
    payload: event,
    metadata,
    tenantContext,
    timestamp: metadata.timestamp,
    version: metadata.version,
    correlationId,
    causationId,
    source: metadata.source,
  };
}

/**
 * Creates a domain event for testing
 *
 * @param eventType - Event type identifier
 * @param payload - Event payload data
 * @returns Event envelope
 *
 * @example
 * ```typescript
 * const event = createDomainEvent('user.created', {
 *   userId: 'user-123',
 *   email: 'test@example.com'
 * });
 * ```
 */
export function createDomainEvent<T = Record<string, unknown>>(
  eventType: string,
  payload: T
): EventEnvelope<T> {
  return fakeEventEnvelope(payload, { eventType });
}

/**
 * Creates an event with a specific correlation ID for event chain testing
 *
 * @param event - Event payload
 * @param correlationId - Correlation ID to link events
 * @param causationId - Optional causation ID (defaults to correlation ID)
 * @returns EventEnvelope with correlation
 */
export function createCorrelatedEvent<T>(
  event: T,
  correlationId: UUID,
  causationId?: UUID
): EventEnvelope<T> {
  return fakeEventEnvelope(event, {
    correlationId,
    causationId: causationId ?? correlationId,
  });
}

/**
 * Creates multiple related events with same correlation ID
 *
 * @param events - Array of event payloads
 * @param correlationId - Optional correlation ID (generated if not provided)
 * @returns Array of correlated event envelopes
 */
export function createEventChain<T>(
  events: T[],
  correlationId?: UUID
): EventEnvelope<T>[] {
  const chainCorrelationId = correlationId ?? generateFakeUUID();
  let previousEventId: UUID | undefined;

  return events.map((event) => {
    const envelope = fakeEventEnvelope(event, {
      correlationId: chainCorrelationId,
      causationId: previousEventId ?? chainCorrelationId,
    });
    previousEventId = envelope.eventId;
    return envelope;
  });
}
// @ts-nocheck
