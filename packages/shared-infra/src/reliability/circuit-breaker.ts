import { Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Milliseconds to wait before attempting half-open
  name?: string; // For logging
}

export class CircuitBreakerOpenError extends Error {
  constructor(serviceName: string) {
    super(`Circuit breaker is OPEN for ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Circuit breaker implementation for protecting inter-service calls.
 * Prevents cascading failures by failing fast when a service is unhealthy.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Too many failures, all requests fail immediately
 * - HALF_OPEN: Testing if service recovered, limited requests allowed
 *
 * @example
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 60000,
 *   name: 'patient-service'
 * });
 *
 * const result = await breaker.execute(() => axios.get('/api/patients'));
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private readonly logger: Logger;

  constructor(private readonly options: CircuitBreakerOptions) {
    this.logger = new Logger(`CircuitBreaker:${options.name || 'unnamed'}`);
  }

  /**
   * Executes a function with circuit breaker protection.
   * Throws CircuitBreakerOpenError if circuit is open.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerOpenError(this.options.name || 'service');
      }
      // Transition to HALF_OPEN to test if service recovered
      this.state = CircuitState.HALF_OPEN;
      this.logger.warn(`Circuit breaker transitioning to HALF_OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Executes with a fallback value if circuit is open or call fails.
   */
  async executeWithFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        this.logger.warn(`Using fallback due to open circuit`);
        return fallback;
      }
      this.logger.error(`Execution failed, using fallback:`, error);
      return fallback;
    }
  }

  private onSuccess(): void {
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

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failureCount >= this.options.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.timeout;
      this.logger.error(
        `Circuit breaker opened after ${this.failureCount} failures. Next attempt at ${new Date(this.nextAttempt).toISOString()}`,
      );
    }
  }

  getState(): CircuitState {
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

  /**
   * Manually resets the circuit breaker to CLOSED state.
   * Use with caution.
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.logger.log(`Circuit breaker manually reset`);
  }
}

/**
 * Registry for managing multiple circuit breakers across different services.
 */
export class CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly logger = new Logger(CircuitBreakerRegistry.name);

  /**
   * Gets or creates a circuit breaker for a service.
   */
  getBreaker(serviceName: string, options?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const defaultOptions: CircuitBreakerOptions = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
        name: serviceName,
        ...options,
      };
      this.breakers.set(serviceName, new CircuitBreaker(defaultOptions));
      this.logger.log(`Created circuit breaker for ${serviceName}`);
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Gets health status of all circuit breakers.
   */
  getHealthStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    this.breakers.forEach((breaker, name) => {
      status[name] = breaker.getStats();
    });
    return status;
  }
}
