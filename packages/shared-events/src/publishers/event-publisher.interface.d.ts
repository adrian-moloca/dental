import type { EventEnvelope } from '../envelope';
export interface EventPublisher<T = unknown> {
    publish(event: EventEnvelope<T>): Promise<void>;
    publishBatch(events: EventEnvelope<T>[]): Promise<void>;
}
export declare class PublisherError extends Error {
    readonly eventId: string;
    readonly eventType: string;
    readonly cause?: Error | undefined;
    constructor(message: string, eventId: string, eventType: string, cause?: Error | undefined);
}
