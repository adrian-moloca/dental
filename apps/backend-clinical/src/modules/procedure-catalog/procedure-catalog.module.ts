/**
 * Procedure Catalog Module
 *
 * NestJS module for procedure catalog management in the clinical system.
 * Provides master catalog of dental procedures with pricing and configuration.
 *
 * IMPORTANT: This catalog is used when building treatment plans.
 * Changes affect all future treatment plans; existing plans retain original data.
 *
 * @module procedure-catalog
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// Controller
import { ProcedureCatalogController } from './procedure-catalog.controller';

// Service
import { ProcedureCatalogService } from './procedure-catalog.service';

// Repository
import { ProcedureCatalogRepository } from './procedure-catalog.repository';

// Schemas
import { ProcedureCatalog, ProcedureCatalogSchema } from './entities/procedure-catalog.schema';

// Auth Module for guards and decorators
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    // Register MongoDB schemas
    MongooseModule.forFeature([
      {
        name: ProcedureCatalog.name,
        schema: ProcedureCatalogSchema,
      },
    ]),

    // Auth module for guards
    AuthModule,
  ],
  controllers: [ProcedureCatalogController],
  providers: [ProcedureCatalogService, ProcedureCatalogRepository],
  exports: [
    // Export service for use by other modules (e.g., treatment plans)
    ProcedureCatalogService,
    ProcedureCatalogRepository,
  ],
})
export class ProcedureCatalogModule {}
