/**
 * Outbox Event Interface
 *
 * Defines the transactional outbox pattern for reliable event publishing.
 * Events are first persisted to an outbox table in the same transaction as
 * the business data, then asynchronously published to the message broker.
 *
 * This ensures:
 * - At-least-once delivery (no lost events)
 * - Transactional consistency (events match database state)
 * - Resilience to message broker failures
 *
 * @module shared-events/outbox
 */

import type { UUID, ISODateString } from '@dentalos/shared-types';

/**
 * Status of an outbox event in its processing lifecycle
 */
export enum OutboxEventStatus {
  /**
   * Event is waiting to be published
   *
   * Initial state when event is persisted to outbox table.
   */
  PENDING = 'PENDING',

  /**
   * Event is currently being published
   *
   * Set when a worker picks up the event for processing.
   * Prevents duplicate processing by multiple workers.
   */
  PROCESSING = 'PROCESSING',

  /**
   * Event was successfully published to message broker
   *
   * Terminal state. Event can be archived or deleted after retention period.
   */
  PROCESSED = 'PROCESSED',

  /**
   * Event failed to publish after max retries
   *
   * Requires manual intervention or compensation logic.
   * Should trigger alerts for operations team.
   */
  FAILED = 'FAILED',
}

/**
 * Represents an event stored in the transactional outbox
 *
 * The outbox table structure ensures events are persisted atomically
 * with business data changes, enabling reliable event publishing.
 *
 * Typical workflow:
 * 1. Business logic commits data + outbox event in same transaction
 * 2. Background worker polls outbox for PENDING events
 * 3. Worker updates status to PROCESSING
 * 4. Worker publishes event to message broker
 * 5. Worker updates status to PROCESSED
 * 6. (Optional) Cleanup job archives old PROCESSED events
 */
export interface OutboxEvent {
  /**
   * Unique identifier for this outbox entry
   *
   * Used for idempotency and tracking. Should match the event envelope ID
   * to enable deduplication in message consumers.
   */
  readonly id: UUID;

  /**
   * Event type in routing key format
   *
   * Format: domain.entity.action (e.g., 'dental.patient.created')
   * Used for routing and filtering during publishing.
   */
  readonly eventType: string;

  /**
   * Serialized event envelope payload
   *
   * Contains the full EventEnvelope<T> as JSON. Deserialized during publishing.
   * Must include all necessary data for consumers to process the event.
   */
  readonly payload: unknown;

  /**
   * Current processing status
   *
   * Lifecycle: PENDING -> PROCESSING -> PROCESSED (or FAILED)
   */
  readonly status: OutboxEventStatus;

  /**
   * Timestamp when event was created and persisted to outbox
   *
   * Used for monitoring event publishing latency and detecting stuck events.
   */
  readonly createdAt: ISODateString;

  /**
   * Timestamp when event was successfully published
   *
   * Undefined until status is PROCESSED. Used for auditing and cleanup.
   */
  readonly processedAt?: ISODateString;

  /**
   * Number of times publishing was attempted
   *
   * Incremented on each failed attempt. Used to implement exponential backoff
   * and determine when to mark event as FAILED.
   *
   * @minimum 0
   */
  readonly retryCount: number;

  /**
   * Error message from last failed publishing attempt
   *
   * Undefined if no errors occurred. Used for debugging and alerting.
   * Should include stack trace or error code for diagnostics.
   */
  readonly lastError?: string;

  /**
   * Timestamp of next retry attempt
   *
   * Calculated using exponential backoff: delay = baseDelay * (2 ^ retryCount)
   * Workers should skip events where nextRetryAt > now.
   */
  readonly nextRetryAt?: ISODateString;
}

/**
 * Options for creating a new outbox event entry
 *
 * Used when persisting events to the outbox table.
 */
export interface CreateOutboxEventInput {
  /**
   * Event envelope ID (for idempotency)
   */
  readonly id: UUID;

  /**
   * Event type routing key
   */
  readonly eventType: string;

  /**
   * Serialized event envelope
   */
  readonly payload: unknown;
}

/**
 * Filter options for querying outbox events
 *
 * Used by background workers to fetch events for processing.
 */
export interface OutboxEventFilter {
  /**
   * Filter by event status
   */
  readonly status?: OutboxEventStatus;

  /**
   * Filter events created before this timestamp
   */
  readonly createdBefore?: ISODateString;

  /**
   * Filter events created after this timestamp
   */
  readonly createdAfter?: ISODateString;

  /**
   * Filter events ready for retry (nextRetryAt <= now)
   */
  readonly readyForRetry?: boolean;

  /**
   * Limit number of results
   */
  readonly limit?: number;
}
