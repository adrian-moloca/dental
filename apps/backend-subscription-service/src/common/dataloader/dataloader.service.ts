import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Module } from '../../modules/modules/entities/module.entity';
import { Cabinet } from '../../modules/cabinets/entities/cabinet.entity';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 * Automatically batches and caches requests within a single request context
 *
 * Adapted for PostgreSQL/TypeORM (subscription-service specific)
 */

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Cabinet)
    private cabinetRepository: Repository<Cabinet>,
  ) {}

  /**
   * Create module loader
   * Batches module lookups by ID
   */
  createModuleLoader(): DataLoader<string, Module | null> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        const uniqueIds = [...new Set(ids)];
        this.logger.debug(`Batch loading ${uniqueIds.length} modules`);

        const modules = await this.moduleRepository.find({
          where: { id: In(uniqueIds) },
        });

        // Create a map for O(1) lookups
        const moduleMap = new Map(modules.map((mod) => [mod.id as string, mod]));

        // Return in same order as requested
        return ids.map((id) => moduleMap.get(id as string) || null);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10), // 10ms batching window
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create cabinet loader
   * Batches cabinet lookups by ID
   */
  createCabinetLoader(): DataLoader<string, Cabinet | null> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        const uniqueIds = [...new Set(ids)];
        this.logger.debug(`Batch loading ${uniqueIds.length} cabinets`);

        const cabinets = await this.cabinetRepository.find({
          where: { id: In(uniqueIds) },
        });

        const cabinetMap = new Map(cabinets.map((cabinet) => [cabinet.id as string, cabinet]));

        return ids.map((id) => cabinetMap.get(id as string) || null);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create cabinets by organization loader
   * Batches cabinet lookups for multiple organizations
   */
  createCabinetsByOrganizationLoader(): DataLoader<string, Cabinet[]> {
    return new DataLoader(
      async (organizationIds: readonly string[]) => {
        const uniqueIds = [...new Set(organizationIds)];
        this.logger.debug(`Batch loading cabinets for ${uniqueIds.length} organizations`);

        const cabinets = await this.cabinetRepository.find({
          where: { organizationId: In(uniqueIds) },
        });

        // Group by organization ID
        const cabinetMap = new Map<string, Cabinet[]>();
        for (const cabinet of cabinets) {
          const existing = cabinetMap.get(cabinet.organizationId) || [];
          existing.push(cabinet);
          cabinetMap.set(cabinet.organizationId, existing);
        }

        return organizationIds.map((id) => cabinetMap.get(id) || []);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create a DataLoader factory for request-scoped loaders
   * This should be used in a request-scoped provider
   */
  createLoaders() {
    return {
      moduleLoader: this.createModuleLoader(),
      cabinetLoader: this.createCabinetLoader(),
      cabinetsByOrganizationLoader: this.createCabinetsByOrganizationLoader(),
    };
  }
}

/**
 * Request-scoped DataLoader provider
 * Creates fresh loaders for each request to prevent cross-request data leakage
 */
export const DATALOADERS = Symbol('DATALOADERS');

export interface DataLoaders {
  moduleLoader: DataLoader<string, Module | null>;
  cabinetLoader: DataLoader<string, Cabinet | null>;
  cabinetsByOrganizationLoader: DataLoader<string, Cabinet[]>;
}
