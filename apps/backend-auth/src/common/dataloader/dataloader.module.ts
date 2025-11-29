import { Module } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';

/**
 * DataLoaderModule - Placeholder for N+1 query prevention
 *
 * Note: DataLoader functionality is not yet implemented.
 * The service currently returns null for all loaders.
 * TODO: Implement actual DataLoader batching when needed.
 */
@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
