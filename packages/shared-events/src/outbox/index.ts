/**
 * Outbox Module
 *
 * Exports interfaces and types for implementing the transactional outbox pattern.
 *
 * @module shared-events/outbox
 */

export {
  OutboxEvent,
  OutboxEventStatus,
  CreateOutboxEventInput,
  OutboxEventFilter,
} from './outbox-event.interface';
