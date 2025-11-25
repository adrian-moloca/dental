import { ISODateString, UUID, JSONObject, Nullable } from './common.types';
import { OrganizationId, ClinicId } from './multi-tenant.types';
import { BaseEntity } from './entity.types';
export declare enum AuditAction {
    CREATE = "CREATE",
    READ = "READ",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    RESTORE = "RESTORE",
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    LOGIN_FAILED = "LOGIN_FAILED",
    PASSWORD_RESET = "PASSWORD_RESET",
    PASSWORD_CHANGED = "PASSWORD_CHANGED",
    MFA_ENABLED = "MFA_ENABLED",
    MFA_DISABLED = "MFA_DISABLED",
    USER_INVITED = "USER_INVITED",
    USER_ACTIVATED = "USER_ACTIVATED",
    USER_DEACTIVATED = "USER_DEACTIVATED",
    USER_ROLE_CHANGED = "USER_ROLE_CHANGED",
    EXPORT = "EXPORT",
    IMPORT = "IMPORT",
    BATCH_UPDATE = "BATCH_UPDATE",
    SUBMITTED_FOR_APPROVAL = "SUBMITTED_FOR_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    SETTINGS_CHANGED = "SETTINGS_CHANGED",
    CONFIGURATION_CHANGED = "CONFIGURATION_CHANGED",
    CUSTOM = "CUSTOM"
}
export declare enum AuditSeverity {
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR",
    CRITICAL = "CRITICAL"
}
export interface AuditActor {
    userId: Nullable<UUID>;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    ipAddress?: string;
    userAgent?: string;
    isSystem: boolean;
}
export interface AuditTarget {
    resourceType: string;
    resourceId: UUID;
    resourceName?: string;
    parentResource?: {
        type: string;
        id: UUID;
    };
}
export interface AuditMetadata {
    requestId?: string;
    sessionId?: string;
    source?: string;
    context?: JSONObject;
}
export interface AuditFieldChange {
    field: string;
    oldValue: Nullable<string>;
    newValue: Nullable<string>;
    dataType?: string;
}
export interface AuditLogEntry extends BaseEntity {
    organizationId: OrganizationId;
    clinicId?: Nullable<ClinicId>;
    action: AuditAction;
    severity: AuditSeverity;
    description: string;
    actor: AuditActor;
    target: AuditTarget;
    changes?: AuditFieldChange[];
    metadata: AuditMetadata;
    success: boolean;
    errorMessage?: string;
    errorCode?: string;
    occurredAt: ISODateString;
}
export interface AuditLogFilter {
    organizationId?: OrganizationId;
    clinicId?: ClinicId;
    userId?: UUID;
    actions?: AuditAction[];
    resourceType?: string;
    resourceId?: UUID;
    severity?: AuditSeverity;
    success?: boolean;
    startDate?: ISODateString;
    endDate?: ISODateString;
}
export interface AuditStatistics {
    totalEvents: number;
    successCount: number;
    failureCount: number;
    eventsByAction: Record<AuditAction, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    startDate: ISODateString;
    endDate: ISODateString;
}
export type CreateAuditLogEntry = Omit<AuditLogEntry, 'id' | 'createdAt' | 'updatedAt'>;
