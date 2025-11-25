import { Injectable, Logger } from '@nestjs/common';

/**
 * Graceful Degradation Service
 * Provides fallback behavior when services or features fail
 */

export interface DegradationConfig {
  enableFallback: boolean;
  cacheStaleData: boolean;
  returnPartialResults: boolean;
}

@Injectable()
export class GracefulDegradationService {
  private readonly logger = new Logger(GracefulDegradationService.name);
  private readonly degradedFeatures = new Set<string>();

  /**
   * Execute with fallback
   */
  async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => Promise<T> | T,
    operationName: string,
  ): Promise<T> {
    try {
      const result = await operation();
      this.markAsHealthy(operationName);
      return result;
    } catch (error) {
      this.logger.warn(`Operation ${operationName} failed, using fallback`, error);
      this.markAsDegraded(operationName);

      try {
        return await fallback();
      } catch (fallbackError) {
        this.logger.error(`Fallback for ${operationName} also failed`, fallbackError);
        throw error; // Throw original error
      }
    }
  }

  /**
   * Execute with partial results
   */
  async executeWithPartialResults<T>(
    operations: Array<{ name: string; fn: () => Promise<T> }>,
  ): Promise<Array<{ name: string; result?: T; error?: Error }>> {
    const results = await Promise.allSettled(operations.map((op) => op.fn()));

    return operations.map((op, index) => {
      const result = results[index];

      if (result.status === 'fulfilled') {
        this.markAsHealthy(op.name);
        return { name: op.name, result: result.value };
      } else {
        this.logger.warn(`Partial operation ${op.name} failed`, result.reason);
        this.markAsDegraded(op.name);
        return { name: op.name, error: result.reason };
      }
    });
  }

  /**
   * Check if feature is degraded
   */
  isDegraded(featureName: string): boolean {
    return this.degradedFeatures.has(featureName);
  }

  /**
   * Get all degraded features
   */
  getDegradedFeatures(): string[] {
    return Array.from(this.degradedFeatures);
  }

  /**
   * Manually mark feature as degraded
   */
  markAsDegraded(featureName: string): void {
    if (!this.degradedFeatures.has(featureName)) {
      this.degradedFeatures.add(featureName);
      this.logger.warn(`Feature ${featureName} marked as degraded`);
    }
  }

  /**
   * Mark feature as healthy
   */
  markAsHealthy(featureName: string): void {
    if (this.degradedFeatures.has(featureName)) {
      this.degradedFeatures.delete(featureName);
      this.logger.log(`Feature ${featureName} recovered`);
    }
  }

  /**
   * Reset all degradations
   */
  resetAll(): void {
    this.degradedFeatures.clear();
    this.logger.log('All degradations cleared');
  }
}
