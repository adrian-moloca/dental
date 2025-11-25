import type { DomainEvent } from '@dentalos/shared-domain';
export type EventHandler = (event: DomainEvent) => Promise<void>;
export interface DomainEventBus {
    emit(event: DomainEvent): Promise<void>;
    subscribe(eventType: string, handler: EventHandler): void;
    unsubscribe?(eventType: string, handler: EventHandler): void;
    clearHandlers?(eventType: string): void;
}
export declare class EventBusError extends Error {
    readonly eventType: string;
    readonly cause?: Error | undefined;
    constructor(message: string, eventType: string, cause?: Error | undefined);
}
