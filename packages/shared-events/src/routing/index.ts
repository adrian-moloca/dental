/**
 * Routing Module
 *
 * Exports routing utilities and constants for event-driven messaging.
 *
 * @module shared-events/routing
 */

export {
  DOMAIN_EVENTS_EXCHANGE,
  INTEGRATION_EVENTS_EXCHANGE,
  DEAD_LETTER_EXCHANGE,
  ExchangeName,
} from './exchange.constants';

export {
  buildRoutingKey,
  parseRoutingKey,
  matchesPattern,
  RoutingKeyComponents,
} from './routing-key.builder';
