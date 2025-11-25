/**
 * Domain Event Bus Interface
 *
 * Defines the contract for in-process domain event handling within a single
 * microservice. Unlike EventPublisher (external), DomainEventBus is for
 * local event-driven communication within the same bounded context.
 *
 * @module shared-events/publishers
 */

import type { DomainEvent } from '@dentalos/shared-domain';

/**
 * Handler function for processing domain events
 *
 * Handlers should be idempotent and handle failures gracefully.
 * Exceptions thrown by handlers may trigger retries or dead-letter handling
 * depending on the bus implementation.
 *
 * @param event - The domain event to process
 * @returns Promise that resolves when handling is complete
 */
export type EventHandler = (event: DomainEvent) => Promise<void>;

/**
 * Interface for in-process domain event bus
 *
 * The event bus enables loose coupling between aggregates within
 * a bounded context. Use this for:
 * - Side effects within the same service (e.g., sending notifications)
 * - Cross-aggregate coordination within a single service
 * - Event sourcing within a microservice
 *
 * Do NOT use this for cross-service communication - use EventPublisher instead.
 *
 * @example
 * ```typescript
 * class NestJSEventBus implements DomainEventBus {
 *   constructor(private eventEmitter: EventEmitter2) {}
 *
 *   async emit(event: DomainEvent): Promise<void> {
 *     await this.eventEmitter.emitAsync(event.eventType, event);
 *   }
 *
 *   subscribe(eventType: string, handler: EventHandler): void {
 *     this.eventEmitter.on(eventType, handler);
 *   }
 * }
 * ```
 */
export interface DomainEventBus {
  /**
   * Emits a domain event to all registered handlers
   *
   * This method should execute all handlers asynchronously and in parallel
   * where possible. Consider using background processing for long-running handlers.
   *
   * @param event - The domain event to emit
   * @throws {EventBusError} If critical handlers fail
   *
   * Edge cases handled:
   * - No handlers registered (log warning, don't throw)
   * - Handler throws error (log error, continue with other handlers)
   * - Handler timeout (cancel after configured timeout)
   */
  emit(event: DomainEvent): Promise<void>;

  /**
   * Registers a handler for a specific event type
   *
   * Multiple handlers can be registered for the same event type.
   * Handlers are executed in registration order (or parallel if possible).
   *
   * @param eventType - The event type to listen for (e.g., 'PatientCreated')
   * @param handler - The handler function to execute
   *
   * Edge cases handled:
   * - Duplicate handler registration (allow or prevent based on implementation)
   * - Handler registration after events emitted (future events only)
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Unregisters a specific handler for an event type
   *
   * Optional method for cleanup. Useful for testing or dynamic handler management.
   *
   * @param eventType - The event type to stop listening for
   * @param handler - The specific handler to remove
   */
  unsubscribe?(eventType: string, handler: EventHandler): void;

  /**
   * Removes all handlers for a specific event type
   *
   * Optional method for cleanup. Useful for testing.
   *
   * @param eventType - The event type to clear handlers for
   */
  clearHandlers?(eventType: string): void;
}

/**
 * Error thrown when domain event bus operations fail
 *
 * Provides context about the failure for debugging.
 */
export class EventBusError extends Error {
  constructor(
    message: string,
    public readonly eventType: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'EventBusError';
    Object.setPrototypeOf(this, EventBusError.prototype);
  }
}
