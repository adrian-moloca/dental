/**
 * Patient Documents Module
 *
 * NestJS module for patient document management.
 * Provides document storage, retrieval, signing, and generation capabilities.
 *
 * FEATURES:
 * - Single and bulk document upload
 * - S3-based storage with tenant isolation
 * - Digital signature support
 * - Document generation from templates
 * - Full-text search
 * - GDPR compliance (export, erasure)
 *
 * @module modules/documents
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

// Schema
import { PatientDocument, PatientDocumentSchema } from './entities/patient-document.schema';

// Services
import { DocumentsService } from './documents.service';
import { S3StorageService, ThumbnailService } from './services';

// Repository
import { DocumentsRepository } from './documents.repository';

// Controller
import { DocumentsController } from './documents.controller';

/**
 * Documents Module
 *
 * Configures all dependencies for patient document management.
 */
@Module({
  imports: [
    // MongoDB schema registration
    MongooseModule.forFeature([
      {
        name: PatientDocument.name,
        schema: PatientDocumentSchema,
      },
    ]),

    // Configuration for S3 settings
    ConfigModule,

    // Multer for file uploads (memory storage for processing)
    MulterModule.register({
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
        files: 10, // Max 10 files for bulk upload
      },
    }),
  ],

  controllers: [DocumentsController],

  providers: [
    // Core service
    DocumentsService,

    // Repository
    DocumentsRepository,

    // Supporting services
    S3StorageService,
    ThumbnailService,
  ],

  exports: [
    // Export service for use by other modules
    DocumentsService,

    // Export repository for direct access if needed
    DocumentsRepository,
  ],
})
export class DocumentsModule {}
