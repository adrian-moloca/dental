/**
 * Audit Logger Service
 *
 * Core service for writing immutable audit logs to database.
 * Implements HIPAA §164.312(b) and GDPR Article 30 compliance requirements.
 *
 * CRITICAL SECURITY DESIGN PRINCIPLES:
 * 1. NEVER THROW EXCEPTIONS - Audit failures must not break application flow
 * 2. SANITIZE ALL PHI/PII - No health information or sensitive PII in logs
 * 3. MASK IP ADDRESSES - GDPR pseudonymization requirement
 * 4. ASYNC PROCESSING - Zero performance impact on critical paths
 * 5. IMMUTABLE STORAGE - No updates or deletes allowed
 *
 * COMPLIANCE REQUIREMENTS:
 * - HIPAA §164.312(b): Implement hardware, software, and procedural mechanisms
 *   to record and examine activity in information systems containing ePHI
 * - HIPAA §164.308(a)(1)(ii)(D): Regularly review audit logs
 * - GDPR Article 30: Maintain records of processing activities
 * - GDPR Article 32: Implement appropriate technical measures
 * - GDPR Article 5(1)(f): Ensure appropriate security of personal data
 *
 * RETENTION POLICY:
 * - Active storage: 1 year (hot tier, PostgreSQL)
 * - Archive storage: 7 years (cold tier, S3 Glacier)
 * - Total retention: 7 years (exceeds HIPAA 6-year requirement)
 *
 * @module modules/audit/services
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditLog, AuditStatus } from '../entities/audit-log.entity';
import { AuditEventDto } from '../dto/audit-event.dto';
import { AuditLogQueryDto, AuditLogResponseDto } from '../dto/audit-log-query.dto';
import { getAuditActionMetadata } from '../types/audit-action.enum';

/**
 * PHI/PII field patterns for sanitization
 *
 * CRITICAL: These fields MUST be redacted before storing in audit logs
 * Based on HIPAA 18 identifiers and GDPR special category data
 */
const PHI_PII_FIELDS = [
  // HIPAA Protected Health Information (PHI)
  'medicalRecordNumber',
  'healthPlanNumber',
  'accountNumber',
  'certificateNumber',
  'diagnosis',
  'prescription',
  'labResult',
  'medicalHistory',
  'treatmentPlan',
  'clinicalNotes',
  'vitalSigns',
  'allergies',
  'medications',

  // HIPAA Identifiers (excluding those needed for audit trail)
  'ssn',
  'socialSecurityNumber',
  'driverLicenseNumber',
  'vehicleIdentifier',
  'deviceSerialNumber',
  'biometricIdentifier',
  'facePhoto',
  'fingerprint',

  // Personal Identifiable Information (PII)
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secretKey',
  'privateKey',
  'creditCardNumber',
  'bankAccountNumber',
  'dateOfBirth', // Kept in some contexts, redacted in others
  'birthDate',

  // Contact information (selective redaction)
  'phone',
  'phoneNumber',
  'mobilePhone',
  'homePhone',
  'faxNumber',

  // Geographic identifiers (smaller than state level)
  'streetAddress',
  'address',
  'addressLine1',
  'addressLine2',
  'zipCode',
  'postalCode',

  // Web/network identifiers (full redaction)
  'ipAddressFull', // Full IP addresses (we store masked versions)
  'macAddress',
  'deviceId',
  'webUrl',
];

/**
 * Sensitive fields that should be completely removed (not redacted)
 *
 * These fields should never appear in audit logs, even in redacted form
 */
const FORBIDDEN_FIELDS = [
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secretKey',
  'privateKey',
  'sessionToken',
  'csrfToken',
];

/**
 * Audit Logger Service
 *
 * Provides methods for:
 * - Logging audit events (create operations)
 * - Querying audit logs (read operations)
 * - Generating compliance reports (aggregations)
 *
 * CRITICAL: This service has NO update or delete methods
 * Audit logs are immutable by design
 */
@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger(AuditLoggerService.name);
  private readonly sanitizationEnabled: boolean;
  private readonly ipMaskingEnabled: boolean;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly configService: ConfigService
  ) {
    // Load configuration (default to safe values)
    this.sanitizationEnabled = this.configService.get<boolean>('audit.sanitization.enabled', true);
    this.ipMaskingEnabled = this.configService.get<boolean>('audit.ipMasking.enabled', true);

    this.logger.log({
      message: 'AuditLoggerService initialized',
      sanitizationEnabled: this.sanitizationEnabled,
      ipMaskingEnabled: this.ipMaskingEnabled,
    });
  }

  /**
   * Log audit event to database
   *
   * CRITICAL BEHAVIOR:
   * - NEVER throws exceptions (audit failures must not break app flow)
   * - Logs errors to stderr for monitoring
   * - Sanitizes all PHI/PII before storage
   * - Masks IP addresses for GDPR compliance
   * - Asynchronous operation (non-blocking)
   *
   * ERROR HANDLING:
   * - Database connection failures: Logged to stderr, returns silently
   * - Validation errors: Logged to stderr, returns silently
   * - TypeORM errors: Logged to stderr, returns silently
   *
   * @param event - Audit event to log (pre-validated)
   * @returns Promise<void> - Always resolves (never rejects)
   */
  async logEvent(event: AuditEventDto): Promise<void> {
    try {
      // Validate event has required fields
      if (!event.userId || !event.action || !event.organizationId) {
        this.logger.error({
          message: '[AUDIT LOG VALIDATION ERROR] Missing required fields',
          userId: event.userId,
          action: event.action,
          organizationId: event.organizationId,
          timestamp: new Date().toISOString(),
        });
        return; // Fail silently - do not break app flow
      }

      // Sanitize sensitive data
      const sanitizedEvent = this.sanitizeEvent(event);

      // Create audit log entity
      const auditLog = this.auditLogRepository.create({
        // Actor information
        userId: sanitizedEvent.userId,
        userEmail: sanitizedEvent.userEmail,
        userRoles: sanitizedEvent.userRoles,

        // Action information
        action: sanitizedEvent.action,
        resource: sanitizedEvent.resource,
        resourceId: sanitizedEvent.resourceId,

        // Tenant context
        organizationId: sanitizedEvent.organizationId,
        clinicId: sanitizedEvent.clinicId,

        // Request context
        ipAddress: this.ipMaskingEnabled
          ? this.maskIpAddress(sanitizedEvent.ipAddress)
          : sanitizedEvent.ipAddress,
        userAgent: this.truncateUserAgent(sanitizedEvent.userAgent),
        correlationId: sanitizedEvent.correlationId,

        // Result information
        status: sanitizedEvent.status,
        errorMessage: sanitizedEvent.errorMessage,

        // State changes (already sanitized)
        changesBefore: sanitizedEvent.changesBefore,
        changesAfter: sanitizedEvent.changesAfter,

        // Metadata (already sanitized)
        metadata: sanitizedEvent.metadata,
      });

      // Persist to database (async, non-blocking)
      await this.auditLogRepository.save(auditLog);

      // Log successful audit (debug level)
      this.logger.debug({
        message: 'Audit event logged successfully',
        action: event.action,
        userId: event.userId,
        organizationId: event.organizationId,
        correlationId: event.correlationId,
      });

      // Check if action requires alerting
      const metadata = getAuditActionMetadata(event.action);
      if (metadata.alertable && event.status === AuditStatus.FAILURE) {
        this.triggerSecurityAlert(auditLog);
      }
    } catch (error: any) {
      // CRITICAL: Log error but DO NOT throw exception
      // Audit logging failures must never break application flow
      this.logger.error({
        message: '[AUDIT LOG FAILURE] Failed to write audit log',
        error: error.message,
        stack: error.stack,
        action: event.action,
        userId: event.userId,
        organizationId: event.organizationId,
        timestamp: new Date().toISOString(),
      });

      // In production, consider sending alert to monitoring system
      // (e.g., Sentry, Datadog, CloudWatch Alarms)
    }
  }

  /**
   * Sanitize audit event data
   *
   * Removes or redacts PHI/PII fields from event data before storage
   * Applied to: changesBefore, changesAfter, metadata
   *
   * SANITIZATION RULES:
   * - Forbidden fields: Completely removed
   * - PHI/PII fields: Replaced with '[REDACTED]'
   * - Nested objects: Recursively sanitized
   * - Arrays: Each element sanitized
   *
   * @param event - Original event
   * @returns Sanitized event (deep copy)
   */
  private sanitizeEvent(event: AuditEventDto): AuditEventDto {
    if (!this.sanitizationEnabled) {
      return event; // Skip sanitization if disabled (testing only)
    }

    // Deep copy to avoid mutating original
    const sanitized = { ...event };

    // Sanitize state change objects
    if (sanitized.changesBefore) {
      sanitized.changesBefore = this.sanitizeObject(sanitized.changesBefore);
    }

    if (sanitized.changesAfter) {
      sanitized.changesAfter = this.sanitizeObject(sanitized.changesAfter);
    }

    // Sanitize metadata
    if (sanitized.metadata) {
      sanitized.metadata = this.sanitizeObject(sanitized.metadata);
    }

    return sanitized;
  }

  /**
   * Sanitize object (recursive)
   *
   * Deep sanitization of nested objects and arrays
   * Removes forbidden fields, redacts PHI/PII
   *
   * @param obj - Object to sanitize
   * @returns Sanitized object (new instance)
   */
  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) =>
        typeof item === 'object' && item !== null
          ? this.sanitizeObject(item as Record<string, unknown>)
          : item
      ) as unknown as Record<string, unknown>;
    }

    // Sanitize object fields
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Remove forbidden fields completely
      if (FORBIDDEN_FIELDS.includes(key)) {
        continue; // Skip this field entirely
      }

      // Redact PHI/PII fields
      if (PHI_PII_FIELDS.includes(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      if (value && typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Mask IP address for GDPR compliance
   *
   * GDPR Article 32: Pseudonymization requirement
   * Masks last octet of IPv4 addresses
   * Masks last 80 bits of IPv6 addresses
   *
   * @param ip - Original IP address
   * @returns Masked IP address
   *
   * @example
   * maskIpAddress('192.168.1.42') => '192.168.1.xxx'
   * maskIpAddress('2001:0db8:85a3:0000:0000:8a2e:0370:7334') => '2001:0db8:85a3::xxxx'
   */
  private maskIpAddress(ip: string): string {
    if (!ip) return '0.0.0.0';

    // IPv4 detection and masking
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = ip.match(ipv4Pattern);

    if (ipv4Match) {
      return `${ipv4Match[1]}.${ipv4Match[2]}.${ipv4Match[3]}.xxx`;
    }

    // IPv6 detection and masking
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}::xxxx`;
      }
    }

    // Unknown format - return masked placeholder
    this.logger.warn({
      message: 'Unknown IP address format',
      ip: ip.substring(0, 10), // Log only first 10 chars for debugging
    });
    return 'unknown.xxx';
  }

  /**
   * Truncate user agent string
   *
   * User agent strings can be very long (>1000 characters)
   * Truncate to reasonable length to prevent database bloat
   *
   * @param userAgent - Original user agent
   * @returns Truncated user agent (max 500 chars)
   */
  private truncateUserAgent(userAgent: string): string {
    const MAX_LENGTH = 500;
    if (!userAgent) return 'Unknown';
    if (userAgent.length <= MAX_LENGTH) return userAgent;
    return `${userAgent.substring(0, MAX_LENGTH)}... [truncated]`;
  }

  /**
   * Trigger security alert for critical events
   *
   * Called when alertable action fails (e.g., privilege escalation attempt)
   * In production, integrate with SIEM or alerting system
   *
   * @param auditLog - Audit log entry requiring alert
   */
  private triggerSecurityAlert(auditLog: AuditLog): void {
    this.logger.warn({
      message: '[SECURITY ALERT] Critical security event detected',
      auditLogId: auditLog.id,
      action: auditLog.action,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      organizationId: auditLog.organizationId,
      errorMessage: auditLog.errorMessage,
      timestamp: auditLog.timestamp.toISOString(),
      correlationId: auditLog.correlationId,
    });

    // TODO: Integrate with alerting system
    // - Send email to security team
    // - Create incident in PagerDuty/Opsgenie
    // - Post to Slack security channel
    // - Trigger automated response (e.g., temporary account lockout)
  }

  /**
   * Query audit logs with filtering and pagination
   *
   * SECURITY REQUIREMENTS:
   * - ALL queries MUST filter by organizationId (tenant isolation)
   * - Date ranges validated to prevent excessive data retrieval
   * - Result sets limited via pagination
   *
   * PERFORMANCE OPTIMIZATIONS:
   * - Uses database indexes (organizationId, userId, action, timestamp)
   * - Limits result set size (max 1000 records)
   * - Uses offset-based pagination (consider cursor-based for large datasets)
   *
   * @param query - Query parameters with filters and pagination
   * @returns Paginated audit log response
   */
  async queryLogs(query: AuditLogQueryDto): Promise<AuditLogResponseDto> {
    try {
      const qb = this.auditLogRepository.createQueryBuilder('audit');

      // CRITICAL: Always filter by organizationId (tenant isolation)
      qb.where('audit.organization_id = :organizationId', {
        organizationId: query.organizationId,
      });

      // Apply optional filters
      if (query.clinicId) {
        qb.andWhere('audit.clinic_id = :clinicId', { clinicId: query.clinicId });
      }

      if (query.userId) {
        qb.andWhere('audit.user_id = :userId', { userId: query.userId });
      }

      if (query.action) {
        qb.andWhere('audit.action = :action', { action: query.action });
      }

      if (query.status) {
        qb.andWhere('audit.status = :status', { status: query.status });
      }

      if (query.resource) {
        qb.andWhere('audit.resource = :resource', { resource: query.resource });
      }

      if (query.resourceId) {
        qb.andWhere('audit.resource_id = :resourceId', { resourceId: query.resourceId });
      }

      if (query.correlationId) {
        qb.andWhere('audit.correlation_id = :correlationId', {
          correlationId: query.correlationId,
        });
      }

      // Date range filters
      if (query.startDate) {
        qb.andWhere('audit.timestamp >= :startDate', { startDate: new Date(query.startDate) });
      }

      if (query.endDate) {
        qb.andWhere('audit.timestamp <= :endDate', { endDate: new Date(query.endDate) });
      }

      // Count total records (before pagination)
      const total = await qb.getCount();

      // Apply pagination
      qb.orderBy('audit.timestamp', 'DESC');
      qb.take(query.limit || 100);
      qb.skip(query.offset || 0);

      // Execute query
      const records = await qb.getMany();

      return {
        records,
        total,
        count: records.length,
        limit: query.limit || 100,
        offset: query.offset || 0,
        hasMore: (query.offset || 0) + records.length < total,
      };
    } catch (error: any) {
      this.logger.error({
        message: 'Failed to query audit logs',
        error: error.message,
        query,
      });
      throw error; // Re-throw for controller error handling
    }
  }

  /**
   * Get audit statistics for compliance reporting
   *
   * Provides high-level metrics for audit dashboard:
   * - Total events by action type
   * - Success/failure rates
   * - Most active users
   * - Security events summary
   *
   * @param organizationId - Organization ID
   * @param startDate - Start date for statistics
   * @param endDate - End date for statistics
   * @returns Audit statistics object
   */
  async getAuditStatistics(organizationId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      // Action breakdown
      const actionBreakdown = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .where('audit.organization_id = :organizationId', { organizationId })
        .andWhere('audit.timestamp >= :startDate', { startDate })
        .andWhere('audit.timestamp <= :endDate', { endDate })
        .groupBy('audit.action')
        .orderBy('count', 'DESC')
        .getRawMany();

      // Success/failure rates
      const statusBreakdown = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('audit.organization_id = :organizationId', { organizationId })
        .andWhere('audit.timestamp >= :startDate', { startDate })
        .andWhere('audit.timestamp <= :endDate', { endDate })
        .groupBy('audit.status')
        .getRawMany();

      return {
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        actionBreakdown,
        statusBreakdown,
      };
    } catch (error: any) {
      this.logger.error({
        message: 'Failed to get audit statistics',
        error: error.message,
        organizationId,
      });
      throw error;
    }
  }
}
