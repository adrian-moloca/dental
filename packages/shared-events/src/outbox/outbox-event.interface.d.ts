import type { UUID, ISODateString } from '@dentalos/shared-types';
export declare enum OutboxEventStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    PROCESSED = "PROCESSED",
    FAILED = "FAILED"
}
export interface OutboxEvent {
    readonly id: UUID;
    readonly eventType: string;
    readonly payload: unknown;
    readonly status: OutboxEventStatus;
    readonly createdAt: ISODateString;
    readonly processedAt?: ISODateString;
    readonly retryCount: number;
    readonly lastError?: string;
    readonly nextRetryAt?: ISODateString;
}
export interface CreateOutboxEventInput {
    readonly id: UUID;
    readonly eventType: string;
    readonly payload: unknown;
}
export interface OutboxEventFilter {
    readonly status?: OutboxEventStatus;
    readonly createdBefore?: ISODateString;
    readonly createdAfter?: ISODateString;
    readonly readyForRetry?: boolean;
    readonly limit?: number;
}
