import { Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { DataLoaderService, DATALOADERS } from './dataloader.service';

/**
 * DataLoader Module - Batch loading and N+1 query prevention
 *
 * NOTE: Schemas are not available in scheduling service
 * This module is commented out and can be implemented when needed
 */
@Module({
  imports: [],
  providers: [
    DataLoaderService,
    // Request-scoped DataLoaders provider
    {
      provide: DATALOADERS,
      scope: Scope.REQUEST,
      inject: [DataLoaderService, REQUEST],
      useFactory: (dataLoaderService: DataLoaderService) => {
        return dataLoaderService.createLoaders();
      },
    },
  ],
  exports: [DataLoaderService, DATALOADERS],
})
export class DataLoaderModule {}
