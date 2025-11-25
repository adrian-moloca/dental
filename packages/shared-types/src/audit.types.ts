/**
 * Audit logging and event tracking types
 * @module shared-types/audit
 */

import { ISODateString, UUID, JSONObject, Nullable } from './common.types';
import { OrganizationId, ClinicId } from './multi-tenant.types';
import { BaseEntity } from './entity.types';

/**
 * Audit event action types
 */
export enum AuditAction {
  // CRUD operations
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESTORE = 'RESTORE',

  // Authentication and authorization
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // User management
  USER_INVITED = 'USER_INVITED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',

  // Data operations
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  BATCH_UPDATE = 'BATCH_UPDATE',

  // Approval workflows
  SUBMITTED_FOR_APPROVAL = 'SUBMITTED_FOR_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',

  // System events
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',

  // Other
  CUSTOM = 'CUSTOM',
}

/**
 * Audit event severity
 */
export enum AuditSeverity {
  /** Informational event */
  INFO = 'INFO',
  /** Warning event */
  WARNING = 'WARNING',
  /** Error event */
  ERROR = 'ERROR',
  /** Critical security event */
  CRITICAL = 'CRITICAL',
}

/**
 * Actor performing the audited action
 */
export interface AuditActor {
  /** User ID (null for system actions) */
  userId: Nullable<UUID>;
  /** User email or identifier */
  userEmail?: string;
  /** User display name */
  userName?: string;
  /** User role at time of action */
  userRole?: string;
  /** IP address */
  ipAddress?: string;
  /** User agent string */
  userAgent?: string;
  /** Whether action was performed by system */
  isSystem: boolean;
}

/**
 * Audit event target (resource being acted upon)
 */
export interface AuditTarget {
  /** Resource type */
  resourceType: string;
  /** Resource ID */
  resourceId: UUID;
  /** Resource name or identifier */
  resourceName?: string;
  /** Parent resource (if applicable) */
  parentResource?: {
    type: string;
    id: UUID;
  };
}

/**
 * Audit event metadata
 */
export interface AuditMetadata {
  /** Request ID for tracing */
  requestId?: string;
  /** Session ID */
  sessionId?: string;
  /** Service or module that generated the event */
  source?: string;
  /** Additional context */
  context?: JSONObject;
}

/**
 * Field change in audit trail
 */
export interface AuditFieldChange {
  /** Field name */
  field: string;
  /** Previous value (serialized) */
  oldValue: Nullable<string>;
  /** New value (serialized) */
  newValue: Nullable<string>;
  /** Data type of the field */
  dataType?: string;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry extends BaseEntity {
  /** Organization context */
  organizationId: OrganizationId;
  /** Clinic context (if applicable) */
  clinicId?: Nullable<ClinicId>;

  /** Action performed */
  action: AuditAction;
  /** Event severity */
  severity: AuditSeverity;
  /** Human-readable event description */
  description: string;

  /** Actor who performed the action */
  actor: AuditActor;
  /** Target resource */
  target: AuditTarget;

  /** Field-level changes (for UPDATE actions) */
  changes?: AuditFieldChange[];

  /** Event metadata */
  metadata: AuditMetadata;

  /** Success status */
  success: boolean;
  /** Error message (if failed) */
  errorMessage?: string;
  /** Error code (if failed) */
  errorCode?: string;

  /** Event timestamp (same as createdAt) */
  occurredAt: ISODateString;
}

/**
 * Audit trail query filter
 */
export interface AuditLogFilter {
  /** Filter by organization */
  organizationId?: OrganizationId;
  /** Filter by clinic */
  clinicId?: ClinicId;
  /** Filter by actor user ID */
  userId?: UUID;
  /** Filter by action type */
  actions?: AuditAction[];
  /** Filter by resource type */
  resourceType?: string;
  /** Filter by resource ID */
  resourceId?: UUID;
  /** Filter by severity */
  severity?: AuditSeverity;
  /** Filter by success status */
  success?: boolean;
  /** Filter by date range start */
  startDate?: ISODateString;
  /** Filter by date range end */
  endDate?: ISODateString;
}

/**
 * Audit statistics summary
 */
export interface AuditStatistics {
  /** Total event count */
  totalEvents: number;
  /** Success count */
  successCount: number;
  /** Failure count */
  failureCount: number;
  /** Events by action */
  eventsByAction: Record<AuditAction, number>;
  /** Events by severity */
  eventsBySeverity: Record<AuditSeverity, number>;
  /** Time range of statistics */
  startDate: ISODateString;
  endDate: ISODateString;
}

/**
 * Audit event for creation (before persisting)
 */
export type CreateAuditLogEntry = Omit<AuditLogEntry, 'id' | 'createdAt' | 'updatedAt'>;
