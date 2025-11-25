/**
 * Aggregate Root base class
 *
 * An Aggregate Root is a cluster of domain objects that can be treated as a single unit.
 * It is the entry point for all operations on the aggregate and enforces invariants.
 *
 * Key responsibilities:
 * - Enforce business rules and invariants across the aggregate
 * - Manage domain events that represent state changes
 * - Ensure transactional consistency within the aggregate boundary
 * - Control access to entities within the aggregate
 *
 * @module shared-domain/entities
 *
 * @example
 * ```typescript
 * class Appointment extends AggregateRoot {
 *   private _status: AppointmentStatus;
 *
 *   public schedule(patientId: UUID, providerId: UUID, slot: TimeSlot): void {
 *     // Validate business rules
 *     // Update state
 *     this._status = AppointmentStatus.SCHEDULED;
 *
 *     // Raise domain event
 *     this.addDomainEvent(
 *       new AppointmentScheduled(this.id, patientId, providerId, slot)
 *     );
 *
 *     this.touch();
 *   }
 * }
 * ```
 */

import type { UUID, ISODateString } from '@dentalos/shared-types';
import type { OrganizationId, ClinicId } from '@dentalos/shared-types';
import { BaseEntity } from './base-entity';
import { DomainEvent } from '../events/domain-event';

/**
 * Aggregate Root implementation
 *
 * Extends BaseEntity with domain event management capabilities.
 * All aggregate roots should extend this class.
 */
export abstract class AggregateRoot extends BaseEntity {
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * Creates a new aggregate root instance
   *
   * @param id - Unique aggregate identifier
   * @param organizationId - Organization this aggregate belongs to
   * @param clinicId - Optional clinic scope
   * @param createdAt - Creation timestamp
   * @param updatedAt - Last update timestamp
   */
  protected constructor(
    id: UUID,
    organizationId: OrganizationId,
    clinicId: ClinicId | undefined,
    createdAt?: ISODateString,
    updatedAt?: ISODateString
  ) {
    super(id, organizationId, clinicId, createdAt, updatedAt);
  }

  /**
   * Gets all uncommitted domain events
   *
   * Returns a readonly copy to prevent external modification.
   * Events should only be added through addDomainEvent().
   *
   * @returns Readonly array of domain events
   */
  public getDomainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }

  /**
   * Adds a domain event to the uncommitted events collection
   *
   * Domain events represent state changes that have occurred in the aggregate.
   * They are stored until explicitly cleared (typically after persistence).
   *
   * @param event - The domain event to add
   * @throws {Error} If event is null or undefined
   *
   * @protected
   */
  protected addDomainEvent(event: DomainEvent): void {
    if (!event) {
      throw new Error('Domain event cannot be null or undefined');
    }

    // Verify the event belongs to this aggregate
    if (event.aggregateId !== this.id) {
      throw new Error(
        `Event aggregate ID (${event.aggregateId}) does not match this aggregate (${this.id})`
      );
    }

    this._domainEvents.push(event);
  }

  /**
   * Clears all uncommitted domain events
   *
   * This should be called after events have been successfully:
   * - Persisted to an event store
   * - Published to an event bus
   * - Processed by event handlers
   *
   * Clearing prevents events from being processed multiple times.
   */
  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  /**
   * Checks if the aggregate has uncommitted domain events
   *
   * @returns true if there are uncommitted events, false otherwise
   */
  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Gets the number of uncommitted domain events
   *
   * @returns Count of uncommitted events
   */
  public getDomainEventCount(): number {
    return this._domainEvents.length;
  }

  /**
   * Gets events of a specific type
   *
   * @param eventType - The event type to filter by
   * @returns Array of events matching the type
   */
  public getEventsByType(eventType: string): readonly DomainEvent[] {
    return this._domainEvents.filter((event) => event.eventType === eventType);
  }
}
