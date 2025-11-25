import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 *
 * NOTE: Schema dependencies removed for scheduling service
 * Models can be injected when needed via constructor
 */

@Injectable()
export class DataLoaderService {
  constructor() {
    // Models can be injected when needed
  }

  /**
   * Create a DataLoader factory for request-scoped loaders
   * This should be used in a request-scoped provider
   *
   * NOTE: Loader methods are commented out as schemas are not available
   * Implement specific loaders when needed for the scheduling service
   */
  createLoaders(): Record<string, DataLoader<string, any>> {
    return {};
  }
}

/**
 * Request-scoped DataLoader provider
 * Creates fresh loaders for each request to prevent cross-request data leakage
 *
 * NOTE: Scheduling service does not use dataloaders
 * This can be implemented when cross-service queries are needed
 */
export const DATALOADERS = Symbol('DATALOADERS');

export type DataLoaders = Record<string, DataLoader<any, any>>;
