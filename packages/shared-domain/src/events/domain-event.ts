/**
 * Domain Event base class
 *
 * Domain events represent something that happened in the domain that domain
 * experts care about. They are immutable facts about state changes.
 *
 * Events enable:
 * - Event sourcing
 * - Event-driven architecture
 * - Audit trails
 * - Cross-aggregate communication
 * - Integration with external systems
 *
 * @module shared-domain/events
 *
 * @example
 * ```typescript
 * class PatientRegistered extends DomainEvent {
 *   constructor(
 *     aggregateId: UUID,
 *     public readonly patientId: UUID,
 *     public readonly name: string,
 *     public readonly email: string
 *   ) {
 *     super('PatientRegistered', aggregateId, 1);
 *   }
 * }
 * ```
 */

import type { UUID, ISODateString, Metadata } from '@dentalos/shared-types';

// Use global crypto API available in Node.js 16+ and browsers
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Base class for all domain events
 *
 * Domain events are immutable and should be created when something
 * significant happens in the domain.
 */
export abstract class DomainEvent {
  private readonly _eventId: UUID;
  private readonly _eventType: string;
  private readonly _aggregateId: UUID;
  private readonly _timestamp: ISODateString;
  private readonly _version: number;
  private readonly _metadata: Readonly<Metadata>;

  /**
   * Creates a new domain event
   *
   * @param eventType - Type/name of the event (e.g., 'PatientRegistered')
   * @param aggregateId - ID of the aggregate that generated this event
   * @param version - Event schema version for event evolution
   * @param metadata - Additional metadata (user ID, correlation ID, etc.)
   * @param eventId - Optional event ID (auto-generated if not provided)
   * @param timestamp - Optional timestamp (defaults to current time)
   *
   * @throws {Error} If required fields are invalid
   */
  protected constructor(
    eventType: string,
    aggregateId: UUID,
    version: number,
    metadata: Metadata = {},
    eventId?: UUID,
    timestamp?: ISODateString
  ) {
    // Validate required fields
    this.validateEventType(eventType);
    this.validateAggregateId(aggregateId);
    this.validateVersion(version);

    // Initialize immutable fields
    this._eventId = eventId || (generateUUID() as UUID);
    this._eventType = eventType;
    this._aggregateId = aggregateId;
    this._timestamp = timestamp || (new Date().toISOString() as ISODateString);
    this._version = version;
    this._metadata = Object.freeze({ ...metadata });

    // Freeze the entire event to ensure immutability
    Object.freeze(this);
  }

  /**
   * Gets the unique event identifier
   * @readonly
   */
  public get eventId(): UUID {
    return this._eventId;
  }

  /**
   * Gets the event type/name
   * @readonly
   */
  public get eventType(): string {
    return this._eventType;
  }

  /**
   * Gets the ID of the aggregate that generated this event
   * @readonly
   */
  public get aggregateId(): UUID {
    return this._aggregateId;
  }

  /**
   * Gets the timestamp when the event occurred
   * @readonly
   */
  public get timestamp(): ISODateString {
    return this._timestamp;
  }

  /**
   * Gets the event schema version
   * @readonly
   */
  public get version(): number {
    return this._version;
  }

  /**
   * Gets the event metadata
   * @readonly
   */
  public get metadata(): Readonly<Metadata> {
    return this._metadata;
  }

  /**
   * Gets metadata value by key
   *
   * @param key - Metadata key
   * @returns The metadata value or undefined if not found
   */
  public getMetadata<T = unknown>(key: string): T | undefined {
    return this._metadata[key] as T | undefined;
  }

  /**
   * Checks if metadata contains a specific key
   *
   * @param key - Metadata key to check
   * @returns true if the key exists in metadata
   */
  public hasMetadata(key: string): boolean {
    return key in this._metadata;
  }

  /**
   * Serializes the event to a JSON object
   *
   * This is useful for:
   * - Persisting events to an event store
   * - Publishing events to message brokers
   * - Logging and debugging
   *
   * @returns A plain object representation of the event
   */
  public toJSON(): Record<string, unknown> {
    return {
      eventId: this._eventId,
      eventType: this._eventType,
      aggregateId: this._aggregateId,
      timestamp: this._timestamp,
      version: this._version,
      metadata: { ...this._metadata },
      payload: this.getEventPayload(),
    };
  }

  /**
   * Gets the event-specific payload
   *
   * Subclasses should override this to include their specific data.
   * This allows for clean serialization without exposing internal details.
   *
   * @returns The event payload as a plain object
   * @protected
   */
  protected getEventPayload(): Record<string, unknown> {
    // Default implementation returns all enumerable properties
    const payload: Record<string, unknown> = {};

    // Get all own properties (not from prototype chain)
    Object.keys(this).forEach((key) => {
      // Skip private fields (starting with _)
      if (!key.startsWith('_')) {
        payload[key] = (this as Record<string, unknown>)[key];
      }
    });

    return payload;
  }

  /**
   * Validates event type
   *
   * @param eventType - The event type to validate
   * @throws {Error} If event type is invalid
   * @private
   */
  private validateEventType(eventType: string): void {
    if (!eventType || typeof eventType !== 'string') {
      throw new Error('Event type must be a non-empty string');
    }

    if (eventType.trim().length === 0) {
      throw new Error('Event type cannot be empty or whitespace');
    }
  }

  /**
   * Validates aggregate ID
   *
   * @param aggregateId - The aggregate ID to validate
   * @throws {Error} If aggregate ID is invalid
   * @private
   */
  private validateAggregateId(aggregateId: UUID): void {
    if (!aggregateId || typeof aggregateId !== 'string') {
      throw new Error('Aggregate ID must be a non-empty string');
    }
  }

  /**
   * Validates version number
   *
   * @param version - The version to validate
   * @throws {Error} If version is invalid
   * @private
   */
  private validateVersion(version: number): void {
    if (typeof version !== 'number' || !Number.isInteger(version)) {
      throw new Error('Version must be an integer');
    }

    if (version < 1) {
      throw new Error('Version must be at least 1');
    }
  }
}
