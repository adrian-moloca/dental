import { Injectable, Logger } from '@nestjs/common';

/**
 * Circuit Breaker Service
 * Prevents cascading failures by breaking the circuit when error threshold is exceeded
 */

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit is open, requests fail fast
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time in ms before attempting to half-open
  monitoringPeriod: number; // Time window for counting failures
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: Date;
  totalRequests: number;
  rejectedRequests: number;
}

class Circuit {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: Date;
  private nextAttempt?: Date;
  private totalRequests = 0;
  private rejectedRequests = 0;
  private readonly logger: Logger;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig,
  ) {
    this.logger = new Logger(`Circuit:${name}`);
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.nextAttempt && new Date() > this.nextAttempt) {
        this.logger.log(`Circuit ${this.name} transitioning to HALF_OPEN`);
        this.state = CircuitState.HALF_OPEN;
      } else {
        this.rejectedRequests++;
        throw new Error(`Circuit ${this.name} is OPEN`);
      }
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

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.logger.log(`Circuit ${this.name} transitioning to CLOSED`);
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn(`Circuit ${this.name} transitioning back to OPEN`);
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.config.timeout);
      this.successes = 0;
      return;
    }

    if (this.failures >= this.config.failureThreshold) {
      this.logger.error(
        `Circuit ${this.name} transitioning to OPEN after ${this.failures} failures`,
      );
      this.state = CircuitState.OPEN;
      this.nextAttempt = new Date(Date.now() + this.config.timeout);
    }
  }

  getStats(): CircuitStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.nextAttempt = undefined;
  }
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits = new Map<string, Circuit>();

  private readonly defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000, // 60 seconds
    monitoringPeriod: 120000, // 2 minutes
  };

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    circuitName: string,
    fn: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitName, config);
    return circuit.execute(fn);
  }

  /**
   * Get circuit statistics
   */
  getStats(circuitName: string): CircuitStats | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? circuit.getStats() : null;
  }

  /**
   * Get all circuit statistics
   */
  getAllStats(): Record<string, CircuitStats> {
    const stats: Record<string, CircuitStats> = {};
    for (const [name, circuit] of this.circuits.entries()) {
      stats[name] = circuit.getStats();
    }
    return stats;
  }

  /**
   * Reset circuit
   */
  reset(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.reset();
      this.logger.log(`Circuit ${circuitName} reset`);
    }
  }

  /**
   * Reset all circuits
   */
  resetAll(): void {
    for (const [name, circuit] of this.circuits.entries()) {
      circuit.reset();
      this.logger.log(`Circuit ${name} reset`);
    }
  }

  private getOrCreateCircuit(name: string, config?: Partial<CircuitBreakerConfig>): Circuit {
    let circuit = this.circuits.get(name);

    if (!circuit) {
      const finalConfig = { ...this.defaultConfig, ...config };
      circuit = new Circuit(name, finalConfig);
      this.circuits.set(name, circuit);
      this.logger.log(`Created circuit ${name} with config:`, finalConfig);
    }

    return circuit;
  }
}
