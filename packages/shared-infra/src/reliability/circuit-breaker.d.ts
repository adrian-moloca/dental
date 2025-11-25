export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export interface CircuitBreakerOptions {
    failureThreshold: number;
    successThreshold: number;
    timeout: number;
    name?: string;
}
export declare class CircuitBreakerOpenError extends Error {
    constructor(serviceName: string);
}
export declare class CircuitBreaker {
    private readonly options;
    private state;
    private failureCount;
    private successCount;
    private nextAttempt;
    private readonly logger;
    constructor(options: CircuitBreakerOptions);
    execute<T>(fn: () => Promise<T>): Promise<T>;
    executeWithFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitState;
    getStats(): {
        state: CircuitState;
        failureCount: number;
        successCount: number;
        nextAttempt: Date;
    };
    reset(): void;
}
export declare class CircuitBreakerRegistry {
    private readonly breakers;
    private readonly logger;
    getBreaker(serviceName: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker;
    getHealthStatus(): Record<string, any>;
}
