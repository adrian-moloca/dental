/**
 * Exchange Constants
 *
 * Defines the message broker exchange names used for event routing.
 * These constants ensure consistent exchange naming across all microservices.
 *
 * Exchange Types:
 * - DOMAIN_EVENTS: Topic exchange for internal domain events
 * - INTEGRATION_EVENTS: Topic exchange for external integration events
 * - DEAD_LETTER: Fanout exchange for failed messages
 *
 * @module shared-events/routing
 */

/**
 * Primary exchange for domain events
 *
 * Type: Topic Exchange
 * Routing pattern: domain.entity.action (e.g., dental.patient.created)
 *
 * Used for:
 * - Internal microservice communication
 * - Event sourcing
 * - CQRS read model updates
 */
export const DOMAIN_EVENTS_EXCHANGE = 'dental.domain.events' as const;

/**
 * Exchange for integration events with external systems
 *
 * Type: Topic Exchange
 * Routing pattern: integration.system.action (e.g., integration.email.sent)
 *
 * Used for:
 * - Third-party integrations (email, SMS, payment gateways)
 * - External API webhooks
 * - Cross-system synchronization
 */
export const INTEGRATION_EVENTS_EXCHANGE = 'dental.integration.events' as const;

/**
 * Dead letter exchange for failed messages
 *
 * Type: Fanout Exchange (broadcasts to all bound queues)
 *
 * Messages are routed here when:
 * - Handler fails after max retries
 * - Message TTL expires
 * - Queue reaches max length
 * - Message is rejected without requeue
 *
 * Used for:
 * - Error monitoring and alerting
 * - Manual retry after investigation
 * - Debugging failed event processing
 */
export const DEAD_LETTER_EXCHANGE = 'dental.dlx' as const;

/**
 * Type-safe union of all exchange names
 */
export type ExchangeName =
  | typeof DOMAIN_EVENTS_EXCHANGE
  | typeof INTEGRATION_EVENTS_EXCHANGE
  | typeof DEAD_LETTER_EXCHANGE;
