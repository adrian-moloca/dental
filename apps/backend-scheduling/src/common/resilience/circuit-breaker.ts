import { Logger } from '@nestjs/common';

/**
 * Circuit Breaker States
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time in ms to wait before attempting half-open
  monitoringPeriod: number; // Time window in ms for failure counting
  name?: string; // Circuit breaker name for logging
}

/**
 * Circuit Breaker Implementation
 *
 * Prevents cascading failures by failing fast when a service is unavailable.
 *
 * State transitions:
 * - CLOSED -> OPEN: After failureThreshold failures in monitoringPeriod
 * - OPEN -> HALF_OPEN: After timeout period
 * - HALF_OPEN -> CLOSED: After successThreshold successes
 * - HALF_OPEN -> OPEN: On any failure
 *
 * Usage:
 * ```typescript
 * const circuitBreaker = new CircuitBreaker({
 *   failureThreshold: 5,
 *   successThreshold: 2,
 *   timeout: 60000,
 *   monitoringPeriod: 10000,
 * });
 *
 * const result = await circuitBreaker.execute(async () => {
 *   return await externalService.call();
 * });
 * ```
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private failureTimestamps: number[] = [];
  private readonly logger: Logger;

  constructor(private readonly config: CircuitBreakerConfig) {
    this.logger = new Logger(config.name || 'CircuitBreaker');
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(
          `Circuit breaker is OPEN for ${this.config.name || 'service'}. ` +
            `Next attempt in ${this.nextAttempt - Date.now()}ms`,
        );
      }
      // Transition to half-open
      this.toHalfOpen();
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
   * Execute with fallback
   */
  async executeWithFallback<T>(fn: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error) {
      this.logger.warn(`Circuit breaker executing fallback for ${this.config.name}`, error);
      return fallback();
    }
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.toClosed();
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    const now = Date.now();
    this.failureTimestamps.push(now);

    // Remove old failures outside monitoring period
    this.failureTimestamps = this.failureTimestamps.filter(
      (timestamp) => now - timestamp < this.config.monitoringPeriod,
    );

    this.failureCount = this.failureTimestamps.length;

    if (this.state === CircuitState.HALF_OPEN) {
      this.toOpen();
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.toOpen();
    }
  }

  /**
   * Transition to CLOSED state
   */
  private toClosed(): void {
    this.logger.log(`Circuit breaker ${this.config.name} transitioning to CLOSED`);
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureTimestamps = [];
  }

  /**
   * Transition to OPEN state
   */
  private toOpen(): void {
    this.logger.warn(`Circuit breaker ${this.config.name} transitioning to OPEN`);
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.config.timeout;
    this.successCount = 0;
  }

  /**
   * Transition to HALF_OPEN state
   */
  private toHalfOpen(): void {
    this.logger.log(`Circuit breaker ${this.config.name} transitioning to HALF_OPEN`);
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt,
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.logger.log(`Circuit breaker ${this.config.name} reset`);
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureTimestamps = [];
    this.nextAttempt = Date.now();
  }
}

/**
 * Decorator for circuit breaker
 */
export function CircuitBreakerProtected(config: CircuitBreakerConfig) {
  const circuitBreaker = new CircuitBreaker(config);

  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return circuitBreaker.execute(() => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
