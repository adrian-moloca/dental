/**
 * Audit Module
 *
 * Provides comprehensive audit logging functionality for HIPAA and GDPR compliance.
 * Implements immutable, append-only audit trail for all security-relevant events.
 *
 * FEATURES:
 * - Automatic audit logging via @AuditLog decorator
 * - PHI/PII sanitization before storage
 * - IP address masking (GDPR compliance)
 * - Multi-tenant isolation
 * - Compliance reporting API
 * - Security event alerting
 *
 * COMPLIANCE STANDARDS:
 * - HIPAA §164.312(b): Audit controls
 * - HIPAA §164.308(a)(1)(ii)(D): Information system activity review
 * - GDPR Article 30: Records of processing activities
 * - GDPR Article 32: Security of processing
 * - SOC 2: Audit logging and monitoring
 *
 * USAGE:
 * 1. Import AuditModule in app.module.ts
 * 2. Register AuditLogInterceptor globally (APP_INTERCEPTOR)
 * 3. Add @AuditLog decorator to controller methods
 * 4. Inject AuditLoggerService for manual logging in services
 *
 * @module modules/audit
 */

import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLoggerService } from './services/audit-logger.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuditController } from './controllers/audit.controller';

/**
 * Audit Module
 *
 * CRITICAL DESIGN DECISIONS:
 * 1. @Global() decorator: Makes AuditLoggerService available throughout application
 *    without explicit imports (required for RBAC, auth, and other modules)
 *
 * 2. Single responsibility: Only handles audit logging (no business logic)
 *
 * 3. Zero dependencies on feature modules: Prevents circular dependencies
 *
 * 4. Interceptor registered globally in app.module.ts (not here) to ensure
 *    it runs for all controllers
 *
 * EXPORTS:
 * - AuditLoggerService: For manual audit logging in services (e.g., RBACService)
 * - AuditLogInterceptor: For global registration in app.module.ts
 *
 * IMPORTS:
 * - TypeOrmModule: For AuditLog entity repository
 * - ConfigModule: Implicitly available (registered globally in app.module.ts)
 */
@Global() // Makes AuditLoggerService available globally without imports
@Module({
  imports: [
    // Register AuditLog entity with TypeORM
    TypeOrmModule.forFeature([AuditLog]),
  ],
  controllers: [
    // REST API for compliance queries
    AuditController,
  ],
  providers: [
    // Core audit logging service
    AuditLoggerService,

    // Interceptor for automatic logging (also exported for global registration)
    AuditLogInterceptor,
  ],
  exports: [
    // Export service for use in other modules (RBAC, auth, etc.)
    AuditLoggerService,

    // Export interceptor for global registration in app.module.ts
    AuditLogInterceptor,
  ],
})
export class AuditModule {}
