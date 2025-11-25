"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreakerRegistry = exports.CircuitBreaker = exports.CircuitBreakerOpenError = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreakerOpenError extends Error {
    constructor(serviceName) {
        super(`Circuit breaker is OPEN for ${serviceName}`);
        this.name = 'CircuitBreakerOpenError';
    }
}
exports.CircuitBreakerOpenError = CircuitBreakerOpenError;
class CircuitBreaker {
    constructor(options) {
        this.options = options;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.logger = new common_1.Logger(`CircuitBreaker:${options.name || 'unnamed'}`);
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                throw new CircuitBreakerOpenError(this.options.name || 'service');
            }
            this.state = CircuitState.HALF_OPEN;
            this.logger.warn(`Circuit breaker transitioning to HALF_OPEN`);
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    async executeWithFallback(fn, fallback) {
        try {
            return await this.execute(fn);
        }
        catch (error) {
            if (error instanceof CircuitBreakerOpenError) {
                this.logger.warn(`Using fallback due to open circuit`);
                return fallback;
            }
            this.logger.error(`Execution failed, using fallback:`, error);
            return fallback;
        }
    }
    onSuccess() {
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            if (this.successCount >= this.options.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successCount = 0;
                this.logger.log(`Circuit breaker closed after ${this.options.successThreshold} successes`);
            }
        }
    }
    onFailure() {
        this.failureCount++;
        this.successCount = 0;
        if (this.state === CircuitState.HALF_OPEN ||
            this.failureCount >= this.options.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.options.timeout;
            this.logger.error(`Circuit breaker opened after ${this.failureCount} failures. Next attempt at ${new Date(this.nextAttempt).toISOString()}`);
        }
    }
    getState() {
        return this.state;
    }
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            nextAttempt: new Date(this.nextAttempt),
        };
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.logger.log(`Circuit breaker manually reset`);
    }
}
exports.CircuitBreaker = CircuitBreaker;
class CircuitBreakerRegistry {
    constructor() {
        this.breakers = new Map();
        this.logger = new common_1.Logger(CircuitBreakerRegistry.name);
    }
    getBreaker(serviceName, options) {
        if (!this.breakers.has(serviceName)) {
            const defaultOptions = {
                failureThreshold: 5,
                successThreshold: 2,
                timeout: 60000,
                name: serviceName,
                ...options,
            };
            this.breakers.set(serviceName, new CircuitBreaker(defaultOptions));
            this.logger.log(`Created circuit breaker for ${serviceName}`);
        }
        return this.breakers.get(serviceName);
    }
    getHealthStatus() {
        const status = {};
        this.breakers.forEach((breaker, name) => {
            status[name] = breaker.getStats();
        });
        return status;
    }
}
exports.CircuitBreakerRegistry = CircuitBreakerRegistry;
//# sourceMappingURL=circuit-breaker.js.map