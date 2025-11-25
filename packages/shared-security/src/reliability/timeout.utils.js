"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.CircuitState = exports.TimeoutError = void 0;
exports.withTimeout = withTimeout;
exports.withRetry = withRetry;
exports.sleep = sleep;
class TimeoutError extends Error {
    constructor(message, timeoutMs) {
        super(message);
        this.timeoutMs = timeoutMs;
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
async function withTimeout(promise, timeoutMs, errorMessage) {
    let timeoutHandle;
    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new TimeoutError(errorMessage || `Operation timed out after ${timeoutMs}ms`, timeoutMs));
        }, timeoutMs);
    });
    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutHandle);
        return result;
    }
    catch (error) {
        clearTimeout(timeoutHandle);
        throw error;
    }
}
async function withRetry(fn, config) {
    const { maxAttempts, delayMs, backoffMultiplier = 2, maxDelayMs = 30000, retryableErrors = [], } = config;
    let lastError;
    let currentDelay = delayMs;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            const isRetryable = retryableErrors.length === 0 ||
                retryableErrors.some((errCode) => error.code === errCode || error.message?.includes(errCode));
            if (attempt === maxAttempts || !isRetryable) {
                throw error;
            }
            await sleep(currentDelay);
            currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
        }
    }
    throw lastError;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = CircuitState.HALF_OPEN;
            this.successCount = 0;
        }
        try {
            const result = await withTimeout(fn(), this.config.timeout);
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.successCount = 0;
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.config.resetTimeout;
        }
    }
    getState() {
        return this.state;
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=timeout.utils.js.map