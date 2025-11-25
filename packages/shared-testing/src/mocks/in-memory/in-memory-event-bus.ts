// @ts-nocheck
/**
 * In-Memory Event Bus
 * Synchronous event bus implementation for testing
 *
 * @module shared-testing/mocks/in-memory
 */

import type { DomainEventBus, EventHandler } from '@dentalos/shared-events';
import type { EventEnvelope } from '@dentalos/shared-events';

/**
 * In-memory event bus for synchronous event testing
 * Stores published events and executes handlers immediately
 */
export class InMemoryEventBus implements DomainEventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  private publishedEvents: EventEnvelope<any>[] = [];

  /**
   * Publish an event
   * Executes all registered handlers synchronously
   */
  public async publish<T>(event: EventEnvelope<T>): Promise<void> {
    this.publishedEvents.push(event);

    const eventHandlers = this.handlers.get(event.eventType) ?? [];
    for (const handler of eventHandlers) {
      await handler(event);
    }
  }

  /**
   * Subscribe to an event type
   */
  public subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Get all published events (testing utility)
   */
  public getPublishedEvents<T = any>(): EventEnvelope<T>[] {
    return [...this.publishedEvents] as EventEnvelope<T>[];
  }

  /**
   * Get published events of a specific type (testing utility)
   */
  public getEventsByType<T = any>(eventType: string): EventEnvelope<T>[] {
    return this.publishedEvents.filter((e) => e.eventType === eventType) as EventEnvelope<T>[];
  }

  /**
   * Get the last published event (testing utility)
   */
  public getLastEvent<T = any>(): EventEnvelope<T> | null {
    return this.publishedEvents.length > 0
      ? (this.publishedEvents[this.publishedEvents.length - 1] as EventEnvelope<T>)
      : null;
  }

  /**
   * Clear all published events
   */
  public clear(): void {
    this.publishedEvents = [];
    this.handlers.clear();
  }
}
// @ts-nocheck
