import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 * Automatically batches and caches requests within a single request context
 *
 * Adapted for Clinical Service - extend as needed for clinical entities
 */

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor() {}

  /**
   * Create patient loader (example - add actual implementation when needed)
   * Batches patient lookups by ID
   */
  createPatientLoader(): DataLoader<string, unknown> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        const uniqueIds = [...new Set(ids)];
        this.logger.debug(`Batch loading ${uniqueIds.length} patients`);

        // TODO: Implement actual patient batch loading
        return ids.map(() => null);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10), // 10ms batching window
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create a DataLoader factory for request-scoped loaders
   * This should be used in a request-scoped provider
   */
  createLoaders() {
    return {
      patientLoader: this.createPatientLoader(),
    };
  }
}

/**
 * Request-scoped DataLoader provider
 * Creates fresh loaders for each request to prevent cross-request data leakage
 */
export const DATALOADERS = Symbol('DATALOADERS');

export interface DataLoaders {
  patientLoader: DataLoader<string, unknown>;
}
