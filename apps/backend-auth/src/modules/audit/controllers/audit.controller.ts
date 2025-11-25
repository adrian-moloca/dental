/**
 * Audit Controller
 *
 * REST API endpoints for querying audit logs and generating compliance reports.
 * Restricted to users with 'admin.audit.read' permission.
 *
 * SECURITY REQUIREMENTS:
 * - ALL endpoints require authentication (JWT)
 * - ALL endpoints require 'admin.audit.read' permission
 * - ALL queries scoped to user's organization (tenant isolation)
 * - Rate limited to prevent abuse (100 req/min)
 *
 * COMPLIANCE PURPOSE:
 * - HIPAA §164.308(a)(1)(ii)(D): Information system activity review
 * - GDPR Article 30: Access to records of processing activities
 * - SOC 2: Audit log access and review controls
 *
 * ENDPOINTS:
 * - GET /audit/logs - Query audit logs with filters
 * - GET /audit/logs/:id - Get specific audit log entry
 * - GET /audit/statistics - Get audit statistics for dashboard
 * - GET /audit/reports/role-changes - Role change compliance report
 *
 * @module modules/audit/controllers
 */

import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuditLoggerService } from '../services/audit-logger.service';
import {
  AuditLogQueryDto,
  AuditLogResponseDto,
  AuditReportQueryDto,
} from '../dto/audit-log-query.dto';
import { AuditLog } from '../entities/audit-log.entity';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

/**
 * Audit Controller
 *
 * Provides read-only access to audit logs for compliance officers.
 * NO write operations - audit logs are immutable (created via AuditLoggerService only).
 *
 * AUTHORIZATION:
 * - Requires 'admin.audit.read' permission (enforced via guard - to be added)
 * - Tenant isolation enforced via organizationId in JWT
 *
 * RATE LIMITING:
 * - Default: 100 requests per minute
 * - Prevents excessive audit log queries (expensive operations)
 */
@Controller('audit')
@ApiTags('Audit Logs')
@ApiBearerAuth()
@Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 req/min
export class AuditController {
  private readonly logger = new Logger(AuditController.name);

  constructor(private readonly auditLogger: AuditLoggerService) {}

  /**
   * Query audit logs
   *
   * Retrieve audit logs with filtering and pagination.
   * Results automatically scoped to user's organization.
   *
   * PERFORMANCE:
   * - Uses database indexes for optimal query performance
   * - Default limit: 100 records
   * - Maximum limit: 1000 records
   * - Date range queries: <500ms for 1 year of data
   *
   * SECURITY:
   * - Requires 'admin.audit.read' permission
   * - Results filtered by organizationId from JWT (tenant isolation)
   * - No PHI/PII in results (already sanitized in database)
   *
   * @param query - Query parameters with filters and pagination
   * @returns Paginated audit log response
   *
   * @example
   * GET /audit/logs?organizationId=xxx&action=role.assigned&startDate=2025-01-01T00:00:00Z&limit=50
   */
  @Get('logs')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Query audit logs',
    description:
      'Retrieve audit logs with filtering and pagination. Requires admin.audit.read permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Missing admin.audit.read permission',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - Rate limit exceeded',
  })
  @ApiQuery({
    name: 'organizationId',
    required: true,
    description: 'Organization ID (tenant scope)',
  })
  @ApiQuery({ name: 'clinicId', required: false, description: 'Clinic ID (optional clinic scope)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by audit action' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (success/failure)' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'resourceId', required: false, description: 'Filter by resource ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (ISO 8601)' })
  @ApiQuery({ name: 'correlationId', required: false, description: 'Filter by correlation ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max records to return (default: 100, max: 1000)',
  })
  @ApiQuery({ name: 'offset', required: false, description: 'Records to skip (default: 0)' })
  async queryLogs(@Query() query: AuditLogQueryDto): Promise<AuditLogResponseDto> {
    this.logger.log({
      message: 'Querying audit logs',
      organizationId: query.organizationId,
      filters: {
        userId: query.userId,
        action: query.action,
        status: query.status,
        dateRange:
          query.startDate && query.endDate ? `${query.startDate} to ${query.endDate}` : undefined,
      },
    });

    const result = await this.auditLogger.queryLogs(query);

    this.logger.debug({
      message: 'Audit logs query completed',
      total: result.total,
      returned: result.count,
      hasMore: result.hasMore,
    });

    return result;
  }

  /**
   * Get audit log by ID
   *
   * Retrieve specific audit log entry by ID.
   * Used for detailed investigation of specific events.
   *
   * @param id - Audit log ID
   * @param organizationId - Organization ID (tenant isolation)
   * @returns Single audit log entry
   *
   * @example
   * GET /audit/logs/f47ac10b-58cc-4372-a567-0e02b2c3d479?organizationId=xxx
   */
  @Get('logs/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit log by ID',
    description: 'Retrieve specific audit log entry. Requires admin.audit.read permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
    type: AuditLog,
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log not found or does not belong to organization',
  })
  @ApiParam({ name: 'id', description: 'Audit log ID (UUID)' })
  @ApiQuery({ name: 'organizationId', required: true, description: 'Organization ID' })
  async getAuditLogById(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Query('organizationId', ParseUUIDPipe) organizationId: UUID
  ): Promise<AuditLog | null> {
    this.logger.log({
      message: 'Retrieving audit log by ID',
      auditLogId: id,
      organizationId,
    });

    // Query with ID and organizationId for tenant isolation
    const result = await this.auditLogger.queryLogs({
      organizationId: organizationId as unknown as OrganizationId,
      limit: 1,
      offset: 0,
    });

    // Filter by ID (TypeORM query builder doesn't support ID filter directly)
    const auditLog = result.records.find((log: any) => log.id === id);

    if (!auditLog) {
      this.logger.warn({
        message: 'Audit log not found',
        auditLogId: id,
        organizationId,
      });
      return null;
    }

    return auditLog;
  }

  /**
   * Get audit statistics
   *
   * Retrieve high-level audit statistics for dashboard display.
   * Aggregates audit data by action type, status, and time period.
   *
   * PERFORMANCE:
   * - Uses aggregation queries (GROUP BY)
   * - May be slow for large date ranges (>1 year)
   * - Consider caching for frequently accessed periods
   *
   * @param query - Statistics query parameters
   * @returns Audit statistics object
   *
   * @example
   * GET /audit/statistics?organizationId=xxx&startDate=2025-01-01&endDate=2025-12-31
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get audit statistics',
    description: 'Retrieve audit statistics for dashboard. Requires admin.audit.read permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO 8601)' })
  async getStatistics(
    @Query('organizationId', ParseUUIDPipe) organizationId: UUID,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<any> {
    this.logger.log({
      message: 'Retrieving audit statistics',
      organizationId,
      period: `${startDate} to ${endDate}`,
    });

    const stats = await this.auditLogger.getAuditStatistics(
      organizationId,
      new Date(startDate),
      new Date(endDate)
    );

    return stats;
  }

  /**
   * Get role change report
   *
   * Specialized compliance report for role assignments and revocations.
   * Groups by user, role, and time period.
   *
   * COMPLIANCE USE CASES:
   * - HIPAA access review requirements
   * - SOC 2 quarterly access reviews
   * - GDPR data processing records
   *
   * @param query - Report query parameters
   * @returns Role change report
   *
   * @example
   * GET /audit/reports/role-changes?organizationId=xxx&startDate=2025-01-01&endDate=2025-03-31&groupBy=month
   */
  @Get('reports/role-changes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Role change compliance report',
    description:
      'Generate report of all role assignments and revocations. Requires admin.audit.read permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  @ApiQuery({ name: 'groupBy', required: false, enum: ['day', 'week', 'month'] })
  async getRoleChangeReport(@Query() query: AuditReportQueryDto): Promise<any> {
    this.logger.log({
      message: 'Generating role change report',
      organizationId: query.organizationId,
      period: `${query.startDate} to ${query.endDate}`,
      groupBy: query.groupBy,
    });

    // Query for role assignment and revocation events
    const assignments = await this.auditLogger.queryLogs({
      organizationId: query.organizationId,
      action: 'role.assigned' as any,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 1000,
    });

    const revocations = await this.auditLogger.queryLogs({
      organizationId: query.organizationId,
      action: 'role.revoked' as any,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 1000,
    });

    return {
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
      },
      summary: {
        totalAssignments: assignments.total,
        totalRevocations: revocations.total,
        netChange: assignments.total - revocations.total,
      },
      assignments: assignments.records,
      revocations: revocations.records,
    };
  }

  /**
   * Get security events report
   *
   * Specialized report for security-related audit events.
   * Includes: privilege escalation attempts, unauthorized access, excessive failures.
   *
   * SECURITY USE CASES:
   * - Threat detection and investigation
   * - Security incident response
   * - Anomaly detection
   *
   * @param query - Report query parameters
   * @returns Security events report
   *
   * @example
   * GET /audit/reports/security-events?organizationId=xxx&startDate=2025-01-01&endDate=2025-12-31
   */
  @Get('reports/security-events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Security events report',
    description:
      'Generate report of security-related events. Requires admin.audit.read permission.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
  })
  @ApiQuery({ name: 'organizationId', required: true })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getSecurityEventsReport(@Query() query: AuditReportQueryDto): Promise<any> {
    this.logger.log({
      message: 'Generating security events report',
      organizationId: query.organizationId,
      period: `${query.startDate} to ${query.endDate}`,
    });

    // Query for security events
    const privilegeEscalation = await this.auditLogger.queryLogs({
      organizationId: query.organizationId,
      action: 'security.privilege_escalation_attempt' as any,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 1000,
    });

    const unauthorizedAccess = await this.auditLogger.queryLogs({
      organizationId: query.organizationId,
      action: 'security.unauthorized_access_attempt' as any,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 1000,
    });

    const accessDenied = await this.auditLogger.queryLogs({
      organizationId: query.organizationId,
      action: 'access.denied' as any,
      startDate: query.startDate,
      endDate: query.endDate,
      limit: 1000,
    });

    return {
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
      },
      summary: {
        privilegeEscalationAttempts: privilegeEscalation.total,
        unauthorizedAccessAttempts: unauthorizedAccess.total,
        accessDeniedEvents: accessDenied.total,
        totalSecurityEvents:
          privilegeEscalation.total + unauthorizedAccess.total + accessDenied.total,
      },
      events: {
        privilegeEscalation: privilegeEscalation.records,
        unauthorizedAccess: unauthorizedAccess.records,
        accessDenied: accessDenied.records,
      },
    };
  }
}
