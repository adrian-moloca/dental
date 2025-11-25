import type { UUID, ISODateString, Metadata } from '@dentalos/shared-types';
export declare abstract class DomainEvent {
    private readonly _eventId;
    private readonly _eventType;
    private readonly _aggregateId;
    private readonly _timestamp;
    private readonly _version;
    private readonly _metadata;
    protected constructor(eventType: string, aggregateId: UUID, version: number, metadata?: Metadata, eventId?: UUID, timestamp?: ISODateString);
    get eventId(): UUID;
    get eventType(): string;
    get aggregateId(): UUID;
    get timestamp(): ISODateString;
    get version(): number;
    get metadata(): Readonly<Metadata>;
    getMetadata<T = unknown>(key: string): T | undefined;
    hasMetadata(key: string): boolean;
    toJSON(): Record<string, unknown>;
    protected getEventPayload(): Record<string, unknown>;
    private validateEventType;
    private validateAggregateId;
    private validateVersion;
}
