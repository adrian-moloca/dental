export declare class TimeoutError extends Error {
    readonly timeoutMs: number;
    constructor(message: string, timeoutMs: number);
}
export declare function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
export interface RetryConfig {
    maxAttempts: number;
    delayMs: number;
    backoffMultiplier?: number;
    maxDelayMs?: number;
    retryableErrors?: string[];
}
export declare function withRetry<T>(fn: () => Promise<T>, config: RetryConfig): Promise<T>;
export declare function sleep(ms: number): Promise<void>;
export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    resetTimeout: number;
}
export declare class CircuitBreaker {
    private readonly config;
    private state;
    private failureCount;
    private successCount;
    private nextAttempt;
    constructor(config: CircuitBreakerConfig);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitState;
    reset(): void;
}
