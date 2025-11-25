import type { StaffId } from './staff-types';
export declare enum HRActivityType {
    STAFF_CREATED = "STAFF_CREATED",
    STAFF_UPDATED = "STAFF_UPDATED",
    STAFF_STATUS_CHANGED = "STAFF_STATUS_CHANGED",
    CONTRACT_CREATED = "CONTRACT_CREATED",
    CONTRACT_UPDATED = "CONTRACT_UPDATED",
    SHIFT_CREATED = "SHIFT_CREATED",
    SHIFT_ASSIGNED = "SHIFT_ASSIGNED",
    SHIFT_UNASSIGNED = "SHIFT_UNASSIGNED",
    AVAILABILITY_UPDATED = "AVAILABILITY_UPDATED",
    ABSENCE_REQUESTED = "ABSENCE_REQUESTED",
    ABSENCE_APPROVED = "ABSENCE_APPROVED",
    ABSENCE_REJECTED = "ABSENCE_REJECTED",
    TASK_CREATED = "TASK_CREATED",
    TASK_ASSIGNED = "TASK_ASSIGNED",
    TASK_COMPLETED = "TASK_COMPLETED",
    TASK_ESCALATED = "TASK_ESCALATED"
}
export interface HRActivityLogEntry {
    id: string;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    activityType: HRActivityType;
    staffId?: StaffId;
    performedBy: string;
    entityType: string;
    entityId: string;
    changes?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
}
