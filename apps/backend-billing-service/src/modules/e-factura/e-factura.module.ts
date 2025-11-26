import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { EFacturaService } from './e-factura.service';
import { EFacturaController } from './e-factura.controller';
import {
  EFacturaSubmission,
  EFacturaSubmissionSchema,
} from './entities/e-factura-submission.schema';
import { EFacturaLog, EFacturaLogSchema } from './entities/e-factura-log.schema';
import { Invoice, InvoiceSchema } from '../invoices/entities/invoice.entity';
import { InvoiceItem, InvoiceItemSchema } from '../invoice-items/entities/invoice-item.entity';
import eFacturaConfig from './config/e-factura.config';

// Phase 2 Services
import { XmlGeneratorService } from './services/xml-generator.service';
import { AnafApiService } from './services/anaf-api.service';
import { AnafOAuthService } from './services/anaf-oauth.service';
import { ClinicFiscalService } from './services/clinic-fiscal.service';
import { HealthcareVatService } from './services/healthcare-vat.service';

/**
 * E-Factura Module
 *
 * This module provides integration with Romania's ANAF E-Factura electronic invoicing system.
 * E-Factura is legally required for B2B invoicing in Romania and involves:
 *
 * 1. Generating UBL 2.1 XML invoices compliant with CIUS-RO specifications
 * 2. Submitting invoices to ANAF's API
 * 3. Tracking submission status through the ANAF workflow
 * 4. Downloading signed invoices after ANAF validation
 * 5. Handling errors and retries
 *
 * The module is designed with multi-tenancy in mind, where each dental practice
 * has its own CUI (company tax ID) and OAuth credentials with ANAF.
 *
 * Phase 1 (Completed):
 * - MongoDB schemas for submissions and logs
 * - Configuration management
 * - DTOs and validation
 * - Constants for UBL codes and ANAF endpoints
 *
 * Phase 2 (Current - Implemented):
 * - XML generation (UBL 2.1 format)
 * - ANAF API integration with retry logic
 * - OAuth2 token management (stub for manual setup)
 * - Status polling
 * - Signed invoice download
 * - REST API endpoints
 * - Custom exceptions
 *
 * Future Enhancements:
 * - Scheduled retry jobs (cron-based)
 * - Event handlers for auto-submission
 * - Full OAuth flow with ANAF SPV portal
 * - XML schema validation against XSD
 *
 * @module EFacturaModule
 */
@Module({
  imports: [
    // Load E-Factura specific configuration
    ConfigModule.forFeature(eFacturaConfig),

    // HTTP client for inter-service communication
    HttpModule,

    // Event emitter for publishing submission events
    // Note: EventEmitterModule should be imported in the root AppModule
    // EventEmitterModule.forRoot(),

    // Register MongoDB schemas
    MongooseModule.forFeature([
      {
        name: EFacturaSubmission.name,
        schema: EFacturaSubmissionSchema,
      },
      {
        name: EFacturaLog.name,
        schema: EFacturaLogSchema,
      },
      // Invoice schema needed for submission creation
      {
        name: Invoice.name,
        schema: InvoiceSchema,
      },
      // InvoiceItem schema for line items
      {
        name: InvoiceItem.name,
        schema: InvoiceItemSchema,
      },
    ]),

    // Note: RedisModule should be imported if using AnafOAuthService
    // The OAuth service requires Redis for token storage
    // Import RedisModule from @nestjs-modules/ioredis in the root module
  ],
  controllers: [
    EFacturaController,
  ],
  providers: [
    // Core service
    EFacturaService,

    // Phase 2 services
    XmlGeneratorService,
    AnafApiService,
    AnafOAuthService,

    // Clinic fiscal settings fetcher
    ClinicFiscalService,

    // Healthcare VAT exemption mapping
    HealthcareVatService,
  ],
  exports: [
    // Export main service for use by other modules
    EFacturaService,

    // Export sub-services for advanced use cases
    XmlGeneratorService,
    AnafApiService,
    AnafOAuthService,
    ClinicFiscalService,
    HealthcareVatService,

    // Export MongooseModule for other modules that need access to submissions
    MongooseModule,
  ],
})
export class EFacturaModule {}

/**
 * Module Dependencies:
 *
 * Required Imports in Root Module:
 * - ConfigModule.forRoot(): For environment configuration
 * - MongooseModule.forRoot(): For MongoDB connection
 * - EventEmitterModule.forRoot(): For event publishing
 * - RedisModule (from @nestjs-modules/ioredis): For OAuth token storage
 *
 * This module depends on:
 * - ConfigModule: For environment-based configuration
 * - MongooseModule: For database access
 * - EventEmitter2: For publishing domain events
 * - Redis: For OAuth token caching
 *
 * This module is used by:
 * - InvoicesModule: To submit issued invoices to E-Factura
 * - Scheduled jobs: For automatic status checking and retry processing
 * - Admin dashboard: For monitoring and manual intervention
 *
 * Events Emitted:
 * - efactura.submission.created: When a new submission is created
 * - efactura.submission.submitted: When submitted to ANAF
 * - efactura.submission.signed: When ANAF signs the invoice
 * - efactura.submission.rejected: When ANAF rejects the invoice
 * - efactura.submission.retried: When a submission is retried
 * - efactura.submission.cancelled: When a submission is cancelled
 *
 * Events Consumed (Future Enhancement):
 * - invoice.issued: Auto-submit to E-Factura when invoice is issued (if enabled)
 *
 * Required npm dependencies:
 * - xmlbuilder2: For XML generation
 * - axios: For HTTP requests to ANAF
 * - axios-retry: For retry logic
 * - uuid: For correlation ID generation
 *
 * Configuration (via environment variables):
 * - EFACTURA_ENABLED: Enable/disable E-Factura integration
 * - ANAF_API_BASE_URL: ANAF API base URL (prod/test)
 * - ANAF_OAUTH_BASE_URL: ANAF OAuth URL
 * - ANAF_IS_TEST: Use test environment
 * - EFACTURA_MAX_RETRIES: Maximum retry attempts
 * - EFACTURA_RETRY_DELAY_MS: Delay between retries
 * - EFACTURA_STATUS_CHECK_INTERVAL_MS: Status polling interval
 * - EFACTURA_DEADLINE_HOURS: Submission deadline (default 120 = 5 days)
 */
