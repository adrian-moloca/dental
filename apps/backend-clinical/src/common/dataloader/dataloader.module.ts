import { Module } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';

/**
 * DataLoader Module
 * Provides DataLoader service for batch loading and N+1 query prevention
 */

@Module({
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
