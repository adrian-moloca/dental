import { Module as NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataLoaderService } from './dataloader.service';
import { Module as SubscriptionModule } from '../../modules/modules/entities/module.entity';
import { Cabinet } from '../../modules/cabinets/entities/cabinet.entity';

/**
 * DataLoader Module
 *
 * Provides request-scoped data loading with batching and caching
 * to prevent N+1 query problems
 */
@NestModule({
  imports: [TypeOrmModule.forFeature([SubscriptionModule, Cabinet])],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
