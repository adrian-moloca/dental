export declare function isRetryableError(error: Error): boolean;
export declare function isUserError(error: Error): boolean;
export declare function isCriticalError(error: Error): boolean;
export declare function extractErrorCode(error: Error): string;
export declare function extractCorrelationId(error: Error): string | undefined;
export declare function isOperationalError(error: Error): boolean;
export declare function isTransientError(error: Error): boolean;
export declare function calculateRetryDelay(attemptNumber: number, baseDelayMs?: number, maxDelayMs?: number): number;
export declare function shouldLogError(error: Error): boolean;
