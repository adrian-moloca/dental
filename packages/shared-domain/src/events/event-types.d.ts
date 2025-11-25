import type { UUID, ISODateString } from '@dentalos/shared-types';
export declare enum DomainEventCategory {
    LIFECYCLE = "LIFECYCLE",
    BUSINESS_PROCESS = "BUSINESS_PROCESS",
    INTEGRATION = "INTEGRATION",
    SYSTEM = "SYSTEM",
    AUDIT = "AUDIT",
    NOTIFICATION = "NOTIFICATION"
}
export interface EventMetadata {
    userId?: UUID;
    correlationId?: UUID;
    causationId?: UUID;
    requestId?: UUID;
    ipAddress?: string;
    userAgent?: string;
    category?: DomainEventCategory;
    [key: string]: unknown;
}
export declare enum EntityEventType {
    CREATED = "ENTITY_CREATED",
    UPDATED = "ENTITY_UPDATED",
    DELETED = "ENTITY_DELETED",
    RESTORED = "ENTITY_RESTORED",
    ARCHIVED = "ENTITY_ARCHIVED"
}
export declare enum AuditEventType {
    ACCESS_GRANTED = "ACCESS_GRANTED",
    ACCESS_DENIED = "ACCESS_DENIED",
    PERMISSION_CHANGED = "PERMISSION_CHANGED",
    DATA_EXPORTED = "DATA_EXPORTED",
    DATA_IMPORTED = "DATA_IMPORTED",
    SENSITIVE_DATA_ACCESSED = "SENSITIVE_DATA_ACCESSED",
    COMPLIANCE_VIOLATION = "COMPLIANCE_VIOLATION"
}
export declare enum IntegrationEventType {
    EXTERNAL_SERVICE_CALLED = "EXTERNAL_SERVICE_CALLED",
    EXTERNAL_SERVICE_FAILED = "EXTERNAL_SERVICE_FAILED",
    WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED",
    MESSAGE_PUBLISHED = "MESSAGE_PUBLISHED",
    MESSAGE_CONSUMED = "MESSAGE_CONSUMED"
}
export interface EventHandlerMetadata {
    handlerName: string;
    handlerStartedAt: ISODateString;
    handlerCompletedAt?: ISODateString;
    handlerDuration?: number;
    handlerSuccess: boolean;
    handlerError?: string;
    retryCount?: number;
}
export interface EventCorrelation {
    correlationId: UUID;
    causationId?: UUID;
    eventChain?: UUID[];
}
