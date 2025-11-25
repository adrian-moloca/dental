/**
 * Modules Module
 * NestJS module that wires together the module catalog system
 *
 * This module provides:
 * - Module entity and TypeORM repository registration
 * - Module repository for data access
 * - Module service for business logic
 * - Module controller for API endpoints
 * - Module seeder for database initialization
 *
 * @module backend-subscription-service/modules
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from './entities/module.entity';
import { ModuleRepository } from './repositories/module.repository';
import { ModuleService } from './services/module.service';
import { ModuleController } from './controllers/module.controller';
import { ModuleSeeder } from './seeders/module.seeder';

/**
 * Modules Module
 * Central module for module catalog functionality
 */
@Module({
  imports: [
    // Register TypeORM entity
    TypeOrmModule.forFeature([ModuleEntity]),
  ],
  controllers: [ModuleController],
  providers: [
    ModuleRepository,
    ModuleService,
    {
      provide: ModuleSeeder,
      useFactory: (repository: ModuleRepository) => {
        // Configure seeder
        // Set autoRun: true to automatically seed on startup
        return new ModuleSeeder(repository, {
          autoRun: false, // Set to true for auto-seeding on startup
          updateExisting: true,
          verbose: true,
        });
      },
      inject: [ModuleRepository],
    },
  ],
  exports: [ModuleRepository, ModuleService, ModuleSeeder],
})
export class ModulesModule {}
