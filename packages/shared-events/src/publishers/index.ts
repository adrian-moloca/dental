/**
 * Publishers Module
 *
 * Exports interfaces for publishing events both externally (cross-service)
 * and internally (within a service).
 *
 * @module shared-events/publishers
 */

export { EventPublisher, PublisherError } from './event-publisher.interface';
export {
  DomainEventBus,
  EventHandler,
  EventBusError,
} from './domain-event-bus.interface';
