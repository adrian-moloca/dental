/**
 * Audit Log Query DTO
 *
 * Data transfer object for querying audit logs.
 * Used by compliance officers and security teams for audit trail analysis.
 *
 * SECURITY REQUIREMENTS:
 * - ALL queries MUST be scoped to organizationId (tenant isolation)
 * - Date ranges limited to prevent excessive data retrieval
 * - Result set size limited via pagination
 * - Only users with 'admin.audit.read' permission can query
 *
 * PERFORMANCE REQUIREMENTS:
 * - Date range queries: <500ms for 1 year of data
 * - Limit enforced: Default 100, max 1000 records
 * - Offset-based pagination (consider cursor-based for large datasets)
 *
 * @module modules/audit/dto
 */

import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { AuditAction } from '../types/audit-action.enum';
import { AuditStatus } from '../entities/audit-log.entity';

/**
 * Audit Log Query DTO
 *
 * Query parameters for retrieving audit logs with filtering and pagination.
 * Exposed via REST API for compliance reporting.
 *
 * VALIDATION:
 * - organizationId: Required (tenant isolation)
 * - Date ranges: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
 * - Pagination: limit (1-1000), offset (0+)
 *
 * EXAMPLE QUERIES:
 * - All role assignments in last 30 days:
 *   ?organizationId=xxx&action=role.assigned&startDate=2025-10-20T00:00:00Z
 *
 * - Failed access attempts for user:
 *   ?organizationId=xxx&userId=yyy&status=failure&action=access.denied
 *
 * - Security events requiring investigation:
 *   ?organizationId=xxx&action=security.privilege_escalation_attempt
 */
export class AuditLogQueryDto {
  /**
   * Organization ID (required for tenant isolation)
   *
   * CRITICAL: MUST be provided for ALL queries
   * Prevents cross-tenant data leakage
   *
   * @required
   */
  @ApiProperty({
    description: 'Organization ID (tenant scope)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    required: true,
  })
  @IsUUID(4)
  organizationId!: OrganizationId;

  /**
   * Clinic ID (optional clinic scope)
   *
   * Filters audit logs to specific clinic within organization
   * If omitted, returns logs for all clinics in organization
   */
  @ApiProperty({
    description: 'Clinic ID (optional clinic scope)',
    example: 'a1b2c3d4-5678-9012-3456-789012345678',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  clinicId?: ClinicId;

  /**
   * User ID filter (optional)
   *
   * Retrieves audit logs for specific user
   * Useful for user activity reports and investigations
   */
  @ApiProperty({
    description: 'User ID filter',
    example: 'b2c3d4e5-6789-0123-4567-890123456789',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  userId?: UUID;

  /**
   * Action filter (optional)
   *
   * Filters by specific audit action type
   * See AuditAction enum for available values
   */
  @ApiProperty({
    description: 'Audit action filter',
    enum: AuditAction,
    example: AuditAction.ROLE_ASSIGNED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  /**
   * Status filter (optional)
   *
   * Filters by success/failure status
   * Useful for identifying failed authorization attempts
   */
  @ApiProperty({
    description: 'Status filter (success or failure)',
    enum: AuditStatus,
    example: AuditStatus.SUCCESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  /**
   * Resource filter (optional)
   *
   * Filters by resource type (e.g., 'Role', 'UserRole', 'Permission')
   * Case-sensitive exact match
   */
  @ApiProperty({
    description: 'Resource type filter',
    example: 'Role',
    required: false,
  })
  @IsOptional()
  @IsString()
  resource?: string;

  /**
   * Resource ID filter (optional)
   *
   * Filters by specific resource instance
   * Useful for tracking changes to a specific role or user
   */
  @ApiProperty({
    description: 'Resource ID filter',
    example: 'c3d4e5f6-7890-1234-5678-901234567890',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  resourceId?: UUID;

  /**
   * Start date (inclusive)
   *
   * ISO 8601 timestamp - beginning of date range
   * If omitted, queries from earliest available log
   *
   * @format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  @ApiProperty({
    description: 'Start date (inclusive) in ISO 8601 format',
    example: '2025-01-01T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  /**
   * End date (inclusive)
   *
   * ISO 8601 timestamp - end of date range
   * If omitted, queries up to current time
   *
   * @format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  @ApiProperty({
    description: 'End date (inclusive) in ISO 8601 format',
    example: '2025-12-31T23:59:59.999Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  /**
   * Correlation ID filter (optional)
   *
   * Retrieves all audit events within same HTTP request
   * Enables end-to-end transaction analysis
   */
  @ApiProperty({
    description: 'Correlation ID for request tracing',
    example: 'd4e5f6g7-8901-2345-6789-012345678901',
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  correlationId?: UUID;

  /**
   * Maximum number of records to return
   *
   * PERFORMANCE LIMIT:
   * - Default: 100 records
   * - Maximum: 1000 records (prevents excessive data retrieval)
   * - For larger datasets, use pagination (increase offset)
   */
  @ApiProperty({
    description: 'Maximum number of records to return',
    example: 100,
    minimum: 1,
    maximum: 1000,
    default: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  limit?: number = 100;

  /**
   * Number of records to skip
   *
   * Used for offset-based pagination
   * offset=0: First page
   * offset=100: Second page (if limit=100)
   *
   * NOTE: For large offsets (>10000), consider cursor-based pagination
   */
  @ApiProperty({
    description: 'Number of records to skip (pagination)',
    example: 0,
    minimum: 0,
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}

/**
 * Audit Log Response DTO
 *
 * Paginated response for audit log queries
 * Includes metadata for pagination and result count
 */
export class AuditLogResponseDto {
  /**
   * Audit log records matching query
   */
  @ApiProperty({
    description: 'Audit log records',
    type: 'array',
    isArray: true,
  })
  records!: any[]; // Actual type: AuditLog[], but avoiding circular dependency

  /**
   * Total number of records matching query (without limit/offset)
   *
   * Used for calculating total pages in pagination
   * NOTE: COUNT(*) queries can be slow on large tables
   */
  @ApiProperty({
    description: 'Total number of records matching query',
    example: 1523,
  })
  total!: number;

  /**
   * Number of records returned in this response
   *
   * May be less than limit if fewer records available
   */
  @ApiProperty({
    description: 'Number of records in this response',
    example: 100,
  })
  count!: number;

  /**
   * Limit applied to query
   */
  @ApiProperty({
    description: 'Limit applied to query',
    example: 100,
  })
  limit!: number;

  /**
   * Offset applied to query
   */
  @ApiProperty({
    description: 'Offset applied to query',
    example: 0,
  })
  offset!: number;

  /**
   * Whether more records are available
   *
   * true if (offset + count) < total
   */
  @ApiProperty({
    description: 'Whether more records are available',
    example: true,
  })
  hasMore!: boolean;
}

/**
 * Audit Report Query DTO
 *
 * Specialized query for generating compliance reports
 * Aggregates audit data by time periods and categories
 */
export class AuditReportQueryDto {
  /**
   * Organization ID (required)
   */
  @ApiProperty({
    description: 'Organization ID',
    required: true,
  })
  @IsUUID(4)
  organizationId!: OrganizationId;

  /**
   * Start date for report period
   */
  @ApiProperty({
    description: 'Report start date',
    example: '2025-01-01T00:00:00.000Z',
    required: true,
  })
  @IsDateString()
  startDate!: string;

  /**
   * End date for report period
   */
  @ApiProperty({
    description: 'Report end date',
    example: '2025-12-31T23:59:59.999Z',
    required: true,
  })
  @IsDateString()
  endDate!: string;

  /**
   * Grouping period (day, week, month)
   */
  @ApiProperty({
    description: 'Grouping period',
    enum: ['day', 'week', 'month'],
    example: 'month',
    required: false,
  })
  @IsOptional()
  @IsString()
  groupBy?: 'day' | 'week' | 'month' = 'month';
}
