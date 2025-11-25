/**
 * Event Envelope
 *
 * Wraps domain events with metadata, versioning, and tenant context
 * for reliable event-driven communication across microservices.
 *
 * The envelope pattern decouples the event payload from infrastructure
 * concerns like routing, tracing, and multi-tenancy.
 *
 * @module shared-events/envelope
 */

import type { UUID, OrganizationId, ClinicId, TenantId } from '@dentalos/shared-types';
import type { EventMetadata } from './event-metadata';

/**
 * Generic event envelope wrapping any event payload
 *
 * The envelope provides a standard structure for all events in the system,
 * ensuring consistent metadata, versioning, and tenant context regardless
 * of the specific event type.
 *
 * @template T - The type of the event payload
 *
 * @example
 * ```typescript
 * const envelope: EventEnvelope<PatientCreatedPayload> = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'dental.patient.created',
 *   version: 1,
 *   occurredAt: new Date('2025-01-15T10:30:00Z'),
 *   payload: {
 *     patientId: '123e4567-e89b-12d3-a456-426614174000',
 *     firstName: 'John',
 *     lastName: 'Doe',
 *   },
 *   metadata: {
 *     correlationId: 'abc123',
 *     userId: 'user-123',
 *   },
 *   tenantContext: {
 *     organizationId: 'org-123',
 *     clinicId: 'clinic-456',
 *     tenantId: 'tenant-789',
 *   },
 * };
 * ```
 */
export interface EventEnvelope<T = unknown> {
  /**
   * Unique identifier for this event envelope
   *
   * Generated when the event is created. Used for idempotency
   * and deduplication in message brokers.
   */
  readonly id: UUID;

  /**
   * Event type in routing key format
   *
   * Format: "domain.entity.action" (e.g., "dental.patient.created")
   * Used for routing, filtering, and handler registration.
   */
  readonly type: string;

  /**
   * Event schema version
   *
   * Enables event evolution and backward compatibility.
   * Consumers can handle different versions of the same event type.
   *
   * @minimum 1
   */
  readonly version: number;

  /**
   * Timestamp when the event occurred
   *
   * Should be set as close as possible to when the domain event happened,
   * not when it was published or consumed.
   */
  readonly occurredAt: Date;

  /**
   * The actual event data
   *
   * Contains the business-specific information about what happened.
   * Type is defined by the generic parameter T.
   */
  readonly payload: T;

  /**
   * Event metadata for tracing and context
   *
   * Includes correlation IDs, user information, and other
   * contextual data for debugging and auditing.
   */
  readonly metadata: EventMetadata;

  /**
   * Multi-tenant context
   *
   * Ensures proper tenant isolation and routing in multi-tenant environments.
   * All events MUST include tenant context to prevent data leakage.
   */
  readonly tenantContext: TenantContext;
}

/**
 * Tenant context for multi-tenant event isolation
 *
 * Provides the necessary identifiers to route events to the correct
 * tenant partition and enforce data isolation.
 */
export interface TenantContext {
  /**
   * Organization ID
   *
   * Top-level tenant identifier representing a dental practice organization.
   */
  readonly organizationId: OrganizationId;

  /**
   * Clinic ID (optional)
   *
   * Sub-tenant identifier for organizations with multiple clinics.
   * May be undefined for organization-level events.
   */
  readonly clinicId?: ClinicId;

  /**
   * Tenant ID
   *
   * Unified tenant identifier used for database partitioning and access control.
   * May represent either organization-level or clinic-level tenancy.
   */
  readonly tenantId: TenantId;
}
