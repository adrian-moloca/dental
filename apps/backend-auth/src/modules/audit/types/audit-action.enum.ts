/**
 * Audit Action Enum
 *
 * Defines all auditable actions in the system for HIPAA and GDPR compliance.
 * Each action represents a significant security or data processing event.
 *
 * COMPLIANCE REQUIREMENTS:
 * - HIPAA §164.312(b): Audit controls to record and examine activity
 * - GDPR Article 30: Records of processing activities
 * - GDPR Article 5(2): Accountability principle
 *
 * SECURITY DESIGN:
 * - Comprehensive event coverage for all RBAC operations
 * - Explicit security event types for threat detection
 * - Granular action types for forensic analysis
 *
 * @module modules/audit/types
 */

/**
 * Audit action types
 *
 * Naming convention: <resource>.<action>
 * Examples: role.created, access.denied, security.privilege_escalation_attempt
 *
 * Categories:
 * - Role management: CRUD operations on roles
 * - Permission management: Permission assignments and updates
 * - Access control: Grant/deny decisions
 * - Security events: Suspicious activities requiring investigation
 */
export enum AuditAction {
  // ==================== ROLE MANAGEMENT ====================
  /**
   * New role created (custom or system role initialization)
   * Logged when: RBACService.createRole() succeeds
   * Security significance: Medium - tracks role proliferation
   */
  ROLE_CREATED = 'role.created',

  /**
   * Role metadata updated (name, description, active status)
   * Logged when: Role entity updated (future implementation)
   * Security significance: Medium - tracks role modifications
   */
  ROLE_UPDATED = 'role.updated',

  /**
   * Role soft-deleted (isActive set to false)
   * Logged when: Role deletion operation (future implementation)
   * Security significance: High - tracks removal of access control structure
   */
  ROLE_DELETED = 'role.deleted',

  /**
   * Role assigned to user
   * Logged when: RBACService.assignRole() succeeds
   * Security significance: HIGH - direct privilege grant
   * CRITICAL: Must capture assignedBy, userId, roleId, expiresAt
   */
  ROLE_ASSIGNED = 'role.assigned',

  /**
   * Role revoked from user
   * Logged when: RBACService.revokeRole() succeeds
   * Security significance: HIGH - privilege removal
   * CRITICAL: Must capture revokedBy, userId, roleId, revocationReason
   */
  ROLE_REVOKED = 'role.revoked',

  // ==================== PERMISSION MANAGEMENT ====================
  /**
   * New permission created in catalog
   * Logged when: Permission entity created (future implementation)
   * Security significance: Low - catalog management
   */
  PERMISSION_CREATED = 'permission.created',

  /**
   * Role's permission set updated
   * Logged when: RBACService.updateRolePermissions() succeeds
   * Security significance: HIGH - changes effective permissions for all users with role
   * CRITICAL: Must capture before/after permission sets
   */
  ROLE_PERMISSIONS_UPDATED = 'role.permissions.updated',

  // ==================== ACCESS CONTROL EVENTS ====================
  /**
   * Access granted after successful authorization check
   * Logged when: Permission/Role guards succeed
   * Security significance: Low - normal operation (optional logging)
   * NOTE: May generate high volume, consider sampling for performance
   */
  ACCESS_GRANTED = 'access.granted',

  /**
   * Access denied due to missing permission
   * Logged when: Permission/Role guards fail
   * Security significance: MEDIUM - may indicate unauthorized access attempts
   * CRITICAL: Must capture requiredPermission, userPermissions, endpoint
   */
  ACCESS_DENIED = 'access.denied',

  /**
   * Permission check failed due to error (cache miss, DB error, etc.)
   * Logged when: PermissionCheckerService encounters exception
   * Security significance: MEDIUM - system reliability issue
   */
  PERMISSION_CHECK_FAILED = 'permission.check.failed',

  // ==================== SECURITY EVENTS ====================
  /**
   * User attempted to assign role they don't possess
   * Logged when: RBACService.assignRole() validation fails
   * Security significance: CRITICAL - privilege escalation attempt
   * ALERT: May require immediate security team notification
   * CRITICAL: Must capture attemptedRole, assignerId, targetUserId
   */
  PRIVILEGE_ESCALATION_ATTEMPT = 'security.privilege_escalation_attempt',

  /**
   * User attempted to access resource outside their tenant scope
   * Logged when: Tenant isolation check fails (future implementation)
   * Security significance: CRITICAL - potential data breach attempt
   * ALERT: Requires immediate investigation
   */
  UNAUTHORIZED_ACCESS_ATTEMPT = 'security.unauthorized_access_attempt',

  /**
   * System role (super_admin, tenant_admin) assignment attempted by non-super_admin
   * Logged when: RBACService.assignRole() system role check fails
   * Security significance: CRITICAL - administrative privilege escalation
   * ALERT: Requires immediate security team notification
   */
  SYSTEM_ROLE_ASSIGNMENT_BLOCKED = 'security.system_role_assignment_blocked',

  /**
   * Multiple failed authorization attempts in short time window
   * Logged when: Rate limit threshold exceeded (future implementation)
   * Security significance: HIGH - potential brute force attack
   * ALERT: May trigger temporary account lockout
   */
  EXCESSIVE_ACCESS_ATTEMPTS = 'security.excessive_access_attempts',

  // ==================== USER AUTHENTICATION EVENTS ====================
  /**
   * User successfully authenticated
   * Logged when: AuthService.login() succeeds
   * Security significance: Low - normal operation
   * COMPLIANCE: Required for HIPAA access logs
   */
  USER_LOGIN = 'user.login',

  /**
   * User login failed (invalid credentials)
   * Logged when: AuthService.login() fails
   * Security significance: MEDIUM - multiple failures may indicate attack
   */
  USER_LOGIN_FAILED = 'user.login.failed',

  /**
   * User logged out
   * Logged when: AuthService.logout() succeeds
   * Security significance: Low - normal operation
   */
  USER_LOGOUT = 'user.logout',

  /**
   * User session expired
   * Logged when: Token expiration detected
   * Security significance: Low - normal operation
   */
  USER_SESSION_EXPIRED = 'user.session.expired',

  // ==================== SUBSCRIPTION & AUTHORIZATION EVENTS ====================
  /**
   * Subscription validated successfully
   * Logged when: Subscription data fetched from subscription service
   * Security significance: Low - normal operation
   * COMPLIANCE: Required for HIPAA access audit trail
   */
  SUBSCRIPTION_VALIDATED = 'subscription.validated',

  /**
   * Subscription validation failed
   * Logged when: Subscription service unavailable or subscription not found
   * Security significance: Medium - service degradation
   */
  SUBSCRIPTION_VALIDATION_FAILED = 'subscription.validation.failed',

  /**
   * Module access granted
   * Logged when: SubscriptionGuard allows access to module-protected endpoint
   * Security significance: Low - normal operation
   * COMPLIANCE: Required for HIPAA - tracks access to ePHI features
   */
  MODULE_ACCESS_GRANTED = 'module.access.granted',

  /**
   * Module access denied
   * Logged when: User attempts to access module not in their subscription
   * Security significance: HIGH - unauthorized feature access attempt
   * ALERT: Multiple denials may indicate subscription bypass attempts
   */
  MODULE_ACCESS_DENIED = 'module.access.denied',

  /**
   * Authorization denied (generic)
   * Logged when: Access denied due to subscription status or other auth failure
   * Security significance: MEDIUM - access control enforcement
   */
  AUTHORIZATION_DENIED = 'authorization.denied',

  /**
   * Subscription status changed affecting active users
   * Logged when: Subscription cancelled/suspended and sessions invalidated
   * Security significance: HIGH - affects ongoing access
   */
  SUBSCRIPTION_STATUS_CHANGED = 'subscription.status.changed',
}

/**
 * Audit action metadata
 * Provides categorization and risk assessment for each action type
 */
export interface AuditActionMetadata {
  /** Action category for filtering and reporting */
  category: 'role' | 'permission' | 'access' | 'security' | 'authentication';

  /** Security risk level (drives alert escalation) */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Whether this action should trigger real-time alerts */
  alertable: boolean;

  /** Human-readable description */
  description: string;

  /** Whether to log changesBefore/changesAfter */
  captureStateChanges: boolean;
}

/**
 * Audit action metadata map
 * Used for automated alerting, reporting, and compliance documentation
 */
export const AUDIT_ACTION_METADATA: Record<AuditAction, AuditActionMetadata> = {
  [AuditAction.ROLE_CREATED]: {
    category: 'role',
    severity: 'medium',
    alertable: false,
    description: 'Custom role created',
    captureStateChanges: true,
  },
  [AuditAction.ROLE_UPDATED]: {
    category: 'role',
    severity: 'medium',
    alertable: false,
    description: 'Role metadata updated',
    captureStateChanges: true,
  },
  [AuditAction.ROLE_DELETED]: {
    category: 'role',
    severity: 'high',
    alertable: true,
    description: 'Role deleted (soft delete)',
    captureStateChanges: true,
  },
  [AuditAction.ROLE_ASSIGNED]: {
    category: 'role',
    severity: 'high',
    alertable: false,
    description: 'Role assigned to user',
    captureStateChanges: true,
  },
  [AuditAction.ROLE_REVOKED]: {
    category: 'role',
    severity: 'high',
    alertable: false,
    description: 'Role revoked from user',
    captureStateChanges: true,
  },
  [AuditAction.PERMISSION_CREATED]: {
    category: 'permission',
    severity: 'low',
    alertable: false,
    description: 'Permission added to catalog',
    captureStateChanges: false,
  },
  [AuditAction.ROLE_PERMISSIONS_UPDATED]: {
    category: 'permission',
    severity: 'high',
    alertable: true,
    description: 'Role permissions modified',
    captureStateChanges: true,
  },
  [AuditAction.ACCESS_GRANTED]: {
    category: 'access',
    severity: 'low',
    alertable: false,
    description: 'Access granted after authorization check',
    captureStateChanges: false,
  },
  [AuditAction.ACCESS_DENIED]: {
    category: 'access',
    severity: 'medium',
    alertable: false,
    description: 'Access denied due to insufficient permissions',
    captureStateChanges: false,
  },
  [AuditAction.PERMISSION_CHECK_FAILED]: {
    category: 'access',
    severity: 'medium',
    alertable: true,
    description: 'Permission check failed due to error',
    captureStateChanges: false,
  },
  [AuditAction.PRIVILEGE_ESCALATION_ATTEMPT]: {
    category: 'security',
    severity: 'critical',
    alertable: true,
    description: 'Privilege escalation attempt detected',
    captureStateChanges: true,
  },
  [AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT]: {
    category: 'security',
    severity: 'critical',
    alertable: true,
    description: 'Cross-tenant access attempt detected',
    captureStateChanges: false,
  },
  [AuditAction.SYSTEM_ROLE_ASSIGNMENT_BLOCKED]: {
    category: 'security',
    severity: 'critical',
    alertable: true,
    description: 'Unauthorized system role assignment blocked',
    captureStateChanges: true,
  },
  [AuditAction.EXCESSIVE_ACCESS_ATTEMPTS]: {
    category: 'security',
    severity: 'high',
    alertable: true,
    description: 'Excessive authorization failures detected',
    captureStateChanges: false,
  },
  [AuditAction.USER_LOGIN]: {
    category: 'authentication',
    severity: 'low',
    alertable: false,
    description: 'User successfully authenticated',
    captureStateChanges: false,
  },
  [AuditAction.USER_LOGIN_FAILED]: {
    category: 'authentication',
    severity: 'medium',
    alertable: false,
    description: 'User login attempt failed',
    captureStateChanges: false,
  },
  [AuditAction.USER_LOGOUT]: {
    category: 'authentication',
    severity: 'low',
    alertable: false,
    description: 'User logged out',
    captureStateChanges: false,
  },
  [AuditAction.USER_SESSION_EXPIRED]: {
    category: 'authentication',
    severity: 'low',
    alertable: false,
    description: 'User session expired',
    captureStateChanges: false,
  },
  [AuditAction.SUBSCRIPTION_VALIDATED]: {
    category: 'access',
    severity: 'low',
    alertable: false,
    description: 'Subscription validated successfully',
    captureStateChanges: false,
  },
  [AuditAction.SUBSCRIPTION_VALIDATION_FAILED]: {
    category: 'access',
    severity: 'medium',
    alertable: true,
    description: 'Subscription validation failed',
    captureStateChanges: false,
  },
  [AuditAction.MODULE_ACCESS_GRANTED]: {
    category: 'access',
    severity: 'low',
    alertable: false,
    description: 'Module access granted',
    captureStateChanges: false,
  },
  [AuditAction.MODULE_ACCESS_DENIED]: {
    category: 'security',
    severity: 'high',
    alertable: true,
    description: 'Module access denied - unauthorized feature access attempt',
    captureStateChanges: false,
  },
  [AuditAction.AUTHORIZATION_DENIED]: {
    category: 'access',
    severity: 'medium',
    alertable: false,
    description: 'Authorization denied',
    captureStateChanges: false,
  },
  [AuditAction.SUBSCRIPTION_STATUS_CHANGED]: {
    category: 'access',
    severity: 'high',
    alertable: true,
    description: 'Subscription status changed affecting active users',
    captureStateChanges: true,
  },
};

/**
 * Helper function to get action metadata
 */
export function getAuditActionMetadata(action: AuditAction): AuditActionMetadata {
  return AUDIT_ACTION_METADATA[action];
}

/**
 * Helper function to check if action should trigger alerts
 */
export function isAlertableAction(action: AuditAction): boolean {
  return AUDIT_ACTION_METADATA[action].alertable;
}

/**
 * Helper function to filter actions by category
 */
export function getActionsByCategory(category: AuditActionMetadata['category']): AuditAction[] {
  return Object.entries(AUDIT_ACTION_METADATA)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([action]) => action as AuditAction);
}

/**
 * Helper function to filter actions by severity
 */
export function getActionsBySeverity(severity: AuditActionMetadata['severity']): AuditAction[] {
  return Object.entries(AUDIT_ACTION_METADATA)
    .filter(([_, metadata]) => metadata.severity === severity)
    .map(([action]) => action as AuditAction);
}
