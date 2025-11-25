/**
 * Event Metadata Interface
 *
 * Provides contextual information about who triggered an event,
 * from where, and for tracing purposes. Essential for audit trails,
 * debugging, and distributed tracing across microservices.
 *
 * @module shared-events/envelope
 */

import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';

/**
 * Metadata associated with an event envelope
 *
 * Captures the execution context when an event occurs, including:
 * - Who triggered the event (userId)
 * - Request tracing (correlationId, causationId)
 * - Client context (userAgent, ipAddress)
 * - Multi-tenant context (organizationId, clinicId, tenantId)
 *
 * All fields are optional to support various event sources (system, user, external)
 */
export interface EventMetadata {
  /**
   * Correlation ID for tracing related events across aggregates and services
   *
   * All events in a single business operation MUST share the same correlationId.
   * This enables distributed tracing and allows linking events across microservices.
   *
   * REQUIRED: This field is now mandatory for all events to ensure complete traceability.
   */
  readonly correlationId: UUID;

  /**
   * Causation ID linking this event to its direct cause
   *
   * Points to the eventId of the event that directly caused this event.
   * Enables building causal chains for event sourcing and debugging.
   *
   * Optional: Only set when this event was triggered by another event.
   */
  readonly causationId?: UUID;

  /**
   * Timestamp when the event metadata was created
   *
   * Complements the envelope's occurredAt with the exact time
   * the event was prepared for publishing.
   */
  readonly timestamp?: Date;

  /**
   * Source service that created this event
   *
   * Identifies which microservice generated the event,
   * useful for debugging and understanding event flow.
   */
  readonly source?: {
    service: string;
    version: string;
  };

  /**
   * ID of the user who triggered the event
   *
   * Can be undefined for system-generated events or external integrations.
   */
  readonly userId?: UUID;

  /**
   * User agent string from the client that initiated the request
   *
   * Useful for debugging, analytics, and security auditing.
   */
  readonly userAgent?: string;

  /**
   * IP address of the client that initiated the request
   *
   * Used for security auditing and fraud detection.
   * May be undefined for server-side or system-initiated events.
   */
  readonly ipAddress?: string;

  /**
   * Organization ID for multi-tenant context
   *
   * Required for events in multi-tenant contexts to ensure proper
   * tenant isolation and routing.
   */
  readonly organizationId?: OrganizationId;

  /**
   * Clinic ID for multi-clinic context within an organization
   *
   * Optional. Some organizations have multiple clinics, and events
   * may need to be scoped to a specific clinic.
   */
  readonly clinicId?: ClinicId;

  /**
   * Tenant ID for complete tenant context
   *
   * Unified tenant identifier that may represent organization-level
   * or clinic-level tenancy depending on the isolation strategy.
   */
  readonly tenantId?: TenantId;

  /**
   * Additional custom metadata
   *
   * Allows extending metadata with domain-specific or integration-specific fields
   * without modifying the interface.
   */
  readonly [key: string]: unknown;
}
