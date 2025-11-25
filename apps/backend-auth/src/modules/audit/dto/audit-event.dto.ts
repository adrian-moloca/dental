/**
 * Audit Event DTO
 *
 * Data transfer object for creating audit log entries.
 * Used internally by AuditLoggerService to capture security events.
 *
 * SECURITY DESIGN:
 * - All PHI/PII fields sanitized before reaching this DTO
 * - IP addresses masked at source (middleware/interceptor level)
 * - No raw user input accepted without validation
 *
 * @module modules/audit/dto
 */

import { IsEnum, IsUUID, IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { AuditAction } from '../types/audit-action.enum';
import { AuditStatus } from '../entities/audit-log.entity';

/**
 * Audit Event DTO
 *
 * Internal DTO for logging audit events.
 * NOT exposed via API - used only within service layer.
 *
 * VALIDATION REQUIREMENTS:
 * - All UUID fields validated
 * - Action must be valid AuditAction enum value
 * - Status must be 'success' or 'failure'
 * - Email format validated
 * - IP address format validated (should already be masked)
 *
 * @internal
 */
export class AuditEventDto {
  // ==================== ACTOR INFORMATION ====================

  /**
   * User ID who performed the action
   * @required
   */
  @IsUUID(4)
  userId!: UUID;

  /**
   * User email at time of action
   * @required
   */
  @IsString()
  userEmail!: string;

  /**
   * User roles at time of action
   * @required
   */
  @IsArray()
  @IsString({ each: true })
  userRoles!: string[];

  // ==================== ACTION INFORMATION ====================

  /**
   * Action being audited
   * @required
   */
  @IsEnum(AuditAction)
  action!: AuditAction;

  /**
   * Resource type affected
   * @required
   */
  @IsString()
  resource!: string;

  /**
   * Resource ID (optional)
   */
  @IsOptional()
  @IsUUID(4)
  resourceId?: UUID;

  // ==================== TENANT CONTEXT ====================

  /**
   * Organization ID (tenant isolation)
   * @required
   */
  @IsUUID(4)
  organizationId!: OrganizationId;

  /**
   * Clinic ID (optional)
   */
  @IsOptional()
  @IsUUID(4)
  clinicId?: ClinicId;

  // ==================== REQUEST CONTEXT ====================

  /**
   * Client IP address (MUST be pre-masked)
   * @required
   */
  @IsString()
  ipAddress!: string;

  /**
   * User agent string
   * @required
   */
  @IsString()
  userAgent!: string;

  /**
   * Correlation ID for request tracing
   * @required
   */
  @IsUUID(4)
  correlationId!: UUID;

  // ==================== RESULT INFORMATION ====================

  /**
   * Action result status
   * @required
   */
  @IsEnum(AuditStatus)
  status!: AuditStatus;

  /**
   * Error message if status = failure
   */
  @IsOptional()
  @IsString()
  errorMessage?: string;

  // ==================== STATE CHANGES ====================

  /**
   * State before action (MUST be pre-sanitized)
   */
  @IsOptional()
  @IsObject()
  changesBefore?: Record<string, unknown>;

  /**
   * State after action (MUST be pre-sanitized)
   */
  @IsOptional()
  @IsObject()
  changesAfter?: Record<string, unknown>;

  // ==================== METADATA ====================

  /**
   * Additional context (MUST be pre-sanitized)
   */
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

/**
 * Create Audit Event DTO (simplified builder)
 *
 * Factory function for creating audit events with defaults
 * Reduces boilerplate in service calls
 *
 * @param params - Partial audit event parameters
 * @returns Complete AuditEventDto with defaults
 */
export function createAuditEvent(
  params: Partial<AuditEventDto> & Pick<AuditEventDto, 'userId' | 'action' | 'organizationId'>
): AuditEventDto {
  const event = new AuditEventDto();

  // Required fields
  event.userId = params.userId;
  event.action = params.action;
  event.organizationId = params.organizationId;

  // Fields with defaults
  event.userEmail = params.userEmail || 'unknown@system';
  event.userRoles = params.userRoles || [];
  event.resource = params.resource || 'Unknown';
  event.ipAddress = params.ipAddress || '0.0.0.0';
  event.userAgent = params.userAgent || 'Unknown';
  event.correlationId = (params.correlationId || crypto.randomUUID()) as UUID;
  event.status = params.status || AuditStatus.SUCCESS;

  // Optional fields
  if (params.resourceId) event.resourceId = params.resourceId;
  if (params.clinicId) event.clinicId = params.clinicId;
  if (params.errorMessage) event.errorMessage = params.errorMessage;
  if (params.changesBefore) event.changesBefore = params.changesBefore;
  if (params.changesAfter) event.changesAfter = params.changesAfter;
  if (params.metadata) event.metadata = params.metadata;

  return event;
}
