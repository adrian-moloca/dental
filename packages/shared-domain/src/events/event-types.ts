/**
 * Common event types and metadata interfaces
 *
 * This module defines standard event types and metadata structures
 * used across the domain for consistency and type safety.
 *
 * @module shared-domain/events
 */

import type { UUID, ISODateString } from '@dentalos/shared-types';

/**
 * Standard domain event categories
 *
 * Categorizes events by their business purpose
 */
export enum DomainEventCategory {
  /** Entity lifecycle events (created, updated, deleted) */
  LIFECYCLE = 'LIFECYCLE',
  /** Business process events (completed, cancelled, approved) */
  BUSINESS_PROCESS = 'BUSINESS_PROCESS',
  /** Integration events for external systems */
  INTEGRATION = 'INTEGRATION',
  /** System events (errors, warnings, health checks) */
  SYSTEM = 'SYSTEM',
  /** Audit and compliance events */
  AUDIT = 'AUDIT',
  /** Notification and communication events */
  NOTIFICATION = 'NOTIFICATION',
}

/**
 * Standard event metadata fields
 *
 * These fields provide context about who, when, and why an event occurred
 */
export interface EventMetadata {
  /** ID of the user who triggered the event */
  userId?: UUID;
  /** Correlation ID for tracing related events across aggregates */
  correlationId?: UUID;
  /** Causation ID linking this event to its direct cause */
  causationId?: UUID;
  /** Request ID from the originating HTTP request */
  requestId?: UUID;
  /** IP address of the request originator */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Event category */
  category?: DomainEventCategory;
  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Entity lifecycle event types
 */
export enum EntityEventType {
  CREATED = 'ENTITY_CREATED',
  UPDATED = 'ENTITY_UPDATED',
  DELETED = 'ENTITY_DELETED',
  RESTORED = 'ENTITY_RESTORED',
  ARCHIVED = 'ENTITY_ARCHIVED',
}

/**
 * Audit event types
 */
export enum AuditEventType {
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_IMPORTED = 'DATA_IMPORTED',
  SENSITIVE_DATA_ACCESSED = 'SENSITIVE_DATA_ACCESSED',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
}

/**
 * Integration event types
 */
export enum IntegrationEventType {
  EXTERNAL_SERVICE_CALLED = 'EXTERNAL_SERVICE_CALLED',
  EXTERNAL_SERVICE_FAILED = 'EXTERNAL_SERVICE_FAILED',
  WEBHOOK_RECEIVED = 'WEBHOOK_RECEIVED',
  MESSAGE_PUBLISHED = 'MESSAGE_PUBLISHED',
  MESSAGE_CONSUMED = 'MESSAGE_CONSUMED',
}

/**
 * Event handler metadata
 *
 * Used to track event processing and handler execution
 */
export interface EventHandlerMetadata {
  /** Name of the handler that processed the event */
  handlerName: string;
  /** Timestamp when the handler started processing */
  handlerStartedAt: ISODateString;
  /** Timestamp when the handler completed processing */
  handlerCompletedAt?: ISODateString;
  /** Handler execution duration in milliseconds */
  handlerDuration?: number;
  /** Whether the handler succeeded */
  handlerSuccess: boolean;
  /** Error message if handler failed */
  handlerError?: string;
  /** Number of retry attempts */
  retryCount?: number;
}

/**
 * Event correlation information
 *
 * Links related events together for tracing and debugging
 */
export interface EventCorrelation {
  /** ID that groups related events together */
  correlationId: UUID;
  /** ID of the event that caused this event */
  causationId?: UUID;
  /** Chain of event IDs showing the causal sequence */
  eventChain?: UUID[];
}
