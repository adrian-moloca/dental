import { AsyncLocalStorage } from 'async_hooks';
import type { CorrelationContext } from './types';
declare const correlationStorage: AsyncLocalStorage<CorrelationContext>;
export declare function generateCorrelationId(): string;
export declare function getCorrelationContext(): CorrelationContext | undefined;
export declare function getCorrelationId(): string | undefined;
export declare function getCausationId(): string | undefined;
export declare function runWithCorrelationContext<T>(context: CorrelationContext, callback: () => T): T;
export declare function createCorrelationContext(options?: {
    correlationId?: string;
    causationId?: string;
    source?: {
        service: string;
        version: string;
    };
    metadata?: Record<string, unknown>;
}): CorrelationContext;
export declare function extractCorrelationId(headers: Record<string, string | string[] | undefined>): string;
export declare function extractCausationId(headers: Record<string, string | string[] | undefined>): string | undefined;
export declare function injectCorrelationId<T extends Record<string, unknown>>(payload: T): T & {
    correlationId: string;
    causationId?: string;
    timestamp: Date;
};
export declare function createCorrelationHeaders(): Record<string, string>;
export { correlationStorage };
