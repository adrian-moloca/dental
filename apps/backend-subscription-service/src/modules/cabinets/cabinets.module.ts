/**
 * Cabinets Module
 *
 * Manages cabinet (dental clinic location) entities, including:
 * - Cabinet creation, update, deletion
 * - Default cabinet management
 * - Multi-tenant isolation
 * - Cabinet settings (timezone, working hours, etc.)
 *
 * Components:
 * - Cabinet entity: TypeORM entity with tenant scoping
 * - CabinetRepository: Data access layer with strict tenant isolation
 * - CabinetService: Business logic and domain rules
 * - CabinetController: REST API endpoints
 *
 * Security features:
 * - All queries filtered by organizationId
 * - Only one default cabinet per organization
 * - Code uniqueness within organization
 * - Soft delete support
 *
 * Future enhancements:
 * - Event emission (CabinetCreated, CabinetUpdated, etc.)
 * - Integration with User service for owner validation
 * - Integration with Appointment service for cabinet assignment
 * - Cabinet-specific permissions and RBAC
 *
 * @module modules/cabinets
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cabinet } from './entities/cabinet.entity';
import { CabinetRepository } from './repositories/cabinet.repository';
import { CabinetService } from './services/cabinet.service';
import { CabinetController } from './controllers/cabinet.controller';
import { DefaultCabinetSeeder } from './seeders/default-cabinet.seeder';

/**
 * Cabinets module
 *
 * Provides Cabinet entity, repository, service, and REST API controller.
 * All queries are tenant-scoped for multi-tenant isolation.
 *
 * Exports:
 * - CabinetService: For use in other modules (e.g., Appointment, Subscription)
 * - CabinetRepository: For advanced queries if needed
 */
@Module({
  imports: [
    // Register Cabinet entity with TypeORM
    TypeOrmModule.forFeature([Cabinet]),
  ],
  controllers: [
    // REST API controller
    CabinetController,
  ],
  providers: [
    // Cabinet repository for data access
    CabinetRepository,
    // Cabinet service for business logic
    CabinetService,
    // Default cabinet seeder
    DefaultCabinetSeeder,
  ],
  exports: [
    // Export service for use in other modules
    CabinetService,
    // Export repository for advanced use cases
    CabinetRepository,
    // Export seeder for database initialization
    DefaultCabinetSeeder,
  ],
})
export class CabinetsModule {}
