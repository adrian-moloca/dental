/**
 * Event Publisher Interface
 *
 * Defines the contract for publishing event envelopes to message brokers
 * or event buses. Implementations handle the infrastructure-specific details
 * of event delivery (RabbitMQ, Kafka, AWS SNS/SQS, etc.).
 *
 * @module shared-events/publishers
 */

import type { EventEnvelope } from '../envelope';

/**
 * Interface for publishing events to external message brokers
 *
 * Implementations should handle:
 * - Connection management to message broker
 * - Serialization of event envelopes
 * - Routing to appropriate exchanges/topics
 * - Error handling and retries
 * - Guaranteed delivery (at-least-once semantics)
 *
 * @template T - The type of the event payload
 *
 * @example
 * ```typescript
 * class RabbitMQEventPublisher implements EventPublisher {
 *   async publish<T>(event: EventEnvelope<T>): Promise<void> {
 *     const routingKey = event.type;
 *     await this.channel.publish(
 *       'dental.domain.events',
 *       routingKey,
 *       Buffer.from(JSON.stringify(event)),
 *       { persistent: true }
 *     );
 *   }
 *
 *   async publishBatch<T>(events: EventEnvelope<T>[]): Promise<void> {
 *     for (const event of events) {
 *       await this.publish(event);
 *     }
 *   }
 * }
 * ```
 */
export interface EventPublisher<T = unknown> {
  /**
   * Publishes a single event envelope to the message broker
   *
   * This method should be idempotent - publishing the same event multiple times
   * should not cause duplicate processing (use event.id for deduplication).
   *
   * @param event - The event envelope to publish
   * @throws {PublisherError} If publishing fails after retries
   *
   * Edge cases handled:
   * - Connection failures (retry with exponential backoff)
   * - Serialization errors (log and throw)
   * - Message broker unavailable (queue locally or throw)
   */
  publish(event: EventEnvelope<T>): Promise<void>;

  /**
   * Publishes multiple event envelopes in a batch
   *
   * Implementations may optimize batch publishing using broker-specific
   * features (e.g., RabbitMQ batch confirms, Kafka batching).
   *
   * @param events - Array of event envelopes to publish
   * @throws {PublisherError} If batch publishing fails
   *
   * Edge cases handled:
   * - Empty array (return immediately)
   * - Partial failures (all-or-nothing or best-effort based on implementation)
   * - Large batches (split into smaller chunks if needed)
   */
  publishBatch(events: EventEnvelope<T>[]): Promise<void>;
}

/**
 * Error thrown when event publishing fails
 *
 * Provides context about the failure for debugging and error handling.
 */
export class PublisherError extends Error {
  constructor(
    message: string,
    public readonly eventId: string,
    public readonly eventType: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PublisherError';
    Object.setPrototypeOf(this, PublisherError.prototype);
  }
}
