/**
 * Audit Module Exports
 *
 * Public API for audit logging module.
 * Other modules should import from this file.
 *
 * @module modules/audit
 */

// Module
export * from './audit.module';

// Services
export * from './services/audit-logger.service';

// Interceptors
export * from './interceptors/audit-log.interceptor';

// DTOs
export * from './dto';

// Types
export * from './types/audit-action.enum';

// Entities
export { AuditLog, AuditStatus } from './entities/audit-log.entity';

// Decorators
export {
  AuditLog as AuditLogDecorator,
  AuditResource,
  AuditCaptureState,
} from './decorators/audit-log.decorator';
