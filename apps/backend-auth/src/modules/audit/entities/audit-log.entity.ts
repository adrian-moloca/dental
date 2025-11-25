/**
 * Audit Log Entity
 *
 * Immutable, append-only audit log for HIPAA and GDPR compliance.
 * Records all security-relevant events with comprehensive metadata.
 *
 * COMPLIANCE REQUIREMENTS:
 * - HIPAA §164.312(b): Audit controls to record and examine activity in systems
 *   that contain ePHI (Electronic Protected Health Information)
 * - HIPAA §164.308(a)(1)(ii)(D): Information system activity review
 * - GDPR Article 30: Records of processing activities
 * - GDPR Article 5(2): Accountability - demonstrate compliance
 * - GDPR Article 32: Security of processing - audit logging
 *
 * SECURITY DESIGN PRINCIPLES:
 * - Immutability: No updates or deletes allowed (enforced at application layer)
 * - Append-only: New records only (database constraint enforcement recommended)
 * - Hash-chaining: Future enhancement for tamper detection
 * - Multi-tenant isolation: All queries MUST filter by organizationId
 * - PHI sanitization: No patient health information in logs
 * - PII minimization: IP masking, email redaction where appropriate
 *
 * RETENTION POLICY:
 * - HIPAA requirement: 6 years from creation or last date in effect
 * - GDPR requirement: As long as necessary for purposes (typically 3-7 years)
 * - Implemented retention: 7 years (exceeds both requirements)
 * - Archival strategy: Partition by month, archive to cold storage after 1 year
 *
 * @module modules/audit/entities
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { AuditAction } from '../types/audit-action.enum';

/**
 * Audit status enum
 * Indicates whether the audited action succeeded or failed
 */
export enum AuditStatus {
  /** Action completed successfully */
  SUCCESS = 'success',
  /** Action failed (authorization denied, validation error, etc.) */
  FAILURE = 'failure',
}

/**
 * Audit Log Entity
 *
 * CRITICAL DATABASE DESIGN:
 * - NO foreign key constraints (prevents cascade deletes, ensures immutability)
 * - NO UPDATE or DELETE operations allowed (application-level enforcement)
 * - Partition by month for performance (recommendation for PostgreSQL)
 * - Retention managed via automated archival jobs, not deletes
 *
 * INDEXES FOR PERFORMANCE:
 * - (organizationId, timestamp DESC): Primary query pattern
 * - (userId, timestamp DESC): User activity reports
 * - (action, timestamp DESC): Action-specific queries
 * - (correlationId): Request tracing
 * - (status, timestamp DESC): Failed action analysis
 *
 * QUERY PERFORMANCE TARGETS:
 * - Date range queries: <500ms for 1 year of data
 * - User activity queries: <200ms for 90 days
 * - Real-time inserts: <50ms p99
 *
 * @security
 * - All queries MUST include organizationId (tenant isolation)
 * - All PHI/PII fields MUST be sanitized before storage
 * - IP addresses MUST be masked (GDPR compliance)
 * - No database-level deletes (manual intervention only for GDPR erasure requests)
 */
@Entity('audit_logs')
@Index(['organizationId', 'timestamp']) // Primary query pattern
@Index(['userId', 'timestamp']) // User activity queries
@Index(['action', 'timestamp']) // Action-specific queries
@Index(['correlationId']) // Request tracing
@Index(['status', 'timestamp']) // Failed action analysis
@Index(['timestamp']) // Archival job queries
export class AuditLog {
  /**
   * Unique audit log entry identifier (UUID v4)
   * Primary key for audit log record
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  // ==================== ACTOR INFORMATION (WHO) ====================

  /**
   * User ID who performed the action
   *
   * CRITICAL: This is the authenticated user from JWT claims
   * NOT a foreign key (prevents cascade deletes)
   *
   * @security User ID from JWT sub claim, validated by JwtStrategy
   */
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: UUID;

  /**
   * User email at time of action
   *
   * Denormalized for audit trail completeness (user email may change)
   * Used for human-readable audit reports
   *
   * @compliance GDPR: Pseudonymized identifier, not full PII
   */
  @Column({ type: 'varchar', length: 255, name: 'user_email' })
  userEmail!: string;

  /**
   * User roles at time of action
   *
   * Snapshot of roles when action occurred (roles may change over time)
   * Critical for forensic analysis of privilege escalation
   *
   * @format Array of role names (e.g., ['super_admin', 'doctor'])
   */
  @Column({ type: 'varchar', array: true, name: 'user_roles' })
  userRoles!: string[];

  // ==================== ACTION INFORMATION (WHAT) ====================

  /**
   * Action performed
   *
   * @see AuditAction enum for complete list
   * @example AuditAction.ROLE_ASSIGNED, AuditAction.ACCESS_DENIED
   */
  @Column({
    type: 'varchar',
    length: 100,
    name: 'action',
  })
  action!: AuditAction;

  /**
   * Resource type affected by action
   *
   * Represents the domain entity or concept being modified/accessed
   *
   * @example 'Role', 'UserRole', 'Permission', 'User'
   */
  @Column({ type: 'varchar', length: 100, name: 'resource' })
  resource!: string;

  /**
   * Resource ID (optional)
   *
   * Specific ID of the affected resource, if applicable
   * NULL for actions that don't target a specific resource
   *
   * @example roleId for ROLE_ASSIGNED, userId for permission checks
   */
  @Column({ type: 'uuid', name: 'resource_id', nullable: true })
  resourceId?: UUID;

  // ==================== TENANT CONTEXT (WHERE) ====================

  /**
   * Organization ID (tenant isolation)
   *
   * CRITICAL: MUST be included in ALL queries for multi-tenant isolation
   * Prevents cross-tenant data leakage
   *
   * @security Tenant boundary enforcement - NEVER query without this filter
   */
  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: OrganizationId;

  /**
   * Clinic ID (optional clinic scope)
   *
   * NULL for organization-wide actions
   * Set for clinic-specific role assignments or access events
   */
  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId?: ClinicId;

  // ==================== TEMPORAL INFORMATION (WHEN) ====================

  /**
   * Timestamp when action occurred
   *
   * Automatically set by TypeORM on insert
   * Immutable - never modified after creation
   *
   * @compliance Required for HIPAA audit trail
   */
  @CreateDateColumn({ type: 'timestamp with time zone', name: 'timestamp' })
  timestamp!: Date;

  // ==================== REQUEST CONTEXT (HOW) ====================

  /**
   * Client IP address (GDPR-compliant masked format)
   *
   * CRITICAL: Last octet MUST be masked for GDPR compliance
   * Format: XXX.XXX.XXX.xxx (last octet masked)
   *
   * @example '192.168.1.xxx' instead of '192.168.1.42'
   * @compliance GDPR Article 32: Pseudonymization
   */
  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ipAddress!: string;

  /**
   * User agent string
   *
   * Browser/client identification for security analysis
   * Useful for detecting automated attacks or unusual client behavior
   *
   * @example 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...'
   */
  @Column({ type: 'text', name: 'user_agent' })
  userAgent!: string;

  /**
   * Correlation ID for request tracing
   *
   * Links related audit events within same HTTP request
   * Enables end-to-end transaction analysis
   *
   * @format UUID v4
   * @example Trace role assignment + permission cache invalidation
   */
  @Column({ type: 'uuid', name: 'correlation_id' })
  correlationId!: UUID;

  // ==================== RESULT INFORMATION ====================

  /**
   * Action result status
   *
   * - SUCCESS: Action completed successfully
   * - FAILURE: Action failed (authorization denied, validation error, etc.)
   *
   * @see AuditStatus enum
   */
  @Column({
    type: 'varchar',
    length: 20,
    name: 'status',
  })
  status!: AuditStatus;

  /**
   * Error message if status = FAILURE
   *
   * Human-readable error description for failed actions
   * CRITICAL: Must NOT contain PHI/PII or sensitive system details
   *
   * @example 'Permission denied: admin.role.assign'
   */
  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage?: string;

  // ==================== STATE CHANGE INFORMATION ====================

  /**
   * State before action (optional)
   *
   * Snapshot of resource state BEFORE action was performed
   * Used for rollback analysis and change tracking
   *
   * CRITICAL SECURITY REQUIREMENTS:
   * - NO PHI allowed (sanitized before storage)
   * - NO passwords or credentials
   * - NO sensitive system internals
   *
   * @format JSON object
   * @example { roleId: 'xxx', permissions: ['read', 'write'] }
   */
  @Column({ type: 'jsonb', name: 'changes_before', nullable: true })
  changesBefore?: Record<string, unknown>;

  /**
   * State after action (optional)
   *
   * Snapshot of resource state AFTER action was performed
   * Used for change verification and compliance reporting
   *
   * CRITICAL SECURITY REQUIREMENTS:
   * - NO PHI allowed (sanitized before storage)
   * - NO passwords or credentials
   * - NO sensitive system internals
   *
   * @format JSON object
   * @example { roleId: 'xxx', permissions: ['read'] }
   */
  @Column({ type: 'jsonb', name: 'changes_after', nullable: true })
  changesAfter?: Record<string, unknown>;

  // ==================== ADDITIONAL METADATA ====================

  /**
   * Additional context metadata
   *
   * Flexible JSONB field for action-specific context
   * Examples:
   * - endpoint: '/api/rbac/roles/:id/users'
   * - method: 'POST'
   * - duration: 142 (milliseconds)
   * - expiresAt: '2025-01-01T00:00:00Z' (for role assignments)
   * - revocationReason: 'Employee terminated'
   *
   * CRITICAL: Must NOT contain PHI/PII
   *
   * @format JSON object
   */
  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata?: Record<string, unknown>;

  // ==================== IMMUTABILITY ENFORCEMENT ====================

  /**
   * Check if record can be modified (always false)
   *
   * Audit logs are IMMUTABLE - no updates or deletes allowed
   * This is a conceptual enforcement method for application logic
   *
   * @returns Always false
   */
  canBeModified(): boolean {
    return false;
  }

  /**
   * Check if record can be deleted (always false)
   *
   * Audit logs CANNOT be deleted (except for GDPR erasure requests)
   * Manual DBA intervention required for erasure
   *
   * @returns Always false
   */
  canBeDeleted(): boolean {
    return false;
  }

  /**
   * Check if record is older than retention period
   *
   * Retention policy: 7 years (exceeds HIPAA 6-year requirement)
   * Records older than 7 years are eligible for archival
   *
   * @returns true if record should be archived
   */
  shouldBeArchived(): boolean {
    const retentionYears = 7;
    const retentionMs = retentionYears * 365 * 24 * 60 * 60 * 1000;
    const age = Date.now() - this.timestamp.getTime();
    return age > retentionMs;
  }

  /**
   * Custom JSON serialization
   *
   * Ensures consistent output format for API responses
   * Explicitly excludes fields that should never be exposed
   *
   * @returns Serialized audit log object
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      userId: this.userId,
      userEmail: this.userEmail,
      userRoles: this.userRoles,
      action: this.action,
      resource: this.resource,
      resourceId: this.resourceId,
      organizationId: this.organizationId,
      clinicId: this.clinicId,
      timestamp: this.timestamp.toISOString(),
      ipAddress: this.ipAddress, // Already masked
      userAgent: this.userAgent,
      correlationId: this.correlationId,
      status: this.status,
      errorMessage: this.errorMessage,
      changesBefore: this.changesBefore, // Already sanitized
      changesAfter: this.changesAfter, // Already sanitized
      metadata: this.metadata, // Already sanitized
    };
  }
}
