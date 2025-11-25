import type { StaffId, TaskId, TaskTemplateId, TaskStatus, TaskPriority, TaskCategory } from './staff-types';
export interface Task {
    id: TaskId;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    templateId?: TaskTemplateId;
    title: string;
    description?: string;
    category: TaskCategory;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: StaffId;
    assignedBy: string;
    reporterId: string;
    dueDate?: Date;
    estimatedMinutes?: number;
    actualMinutes?: number;
    clinicalProcedureId?: string;
    sterilizationCycleId?: string;
    inventoryOrderId?: string;
    patientId?: string;
    dependencies?: TaskId[];
    blockedBy?: string;
    blockedReason?: string;
    completedAt?: Date;
    completedBy?: string;
    escalatedAt?: Date;
    escalatedTo?: string;
    escalationReason?: string;
    tags?: string[];
    attachmentUrls?: string[];
    notes?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
export interface TaskTemplate {
    id: TaskTemplateId;
    tenantId: string;
    organizationId: string;
    clinicId?: string;
    name: string;
    description?: string;
    category: TaskCategory;
    defaultPriority: TaskPriority;
    estimatedMinutes?: number;
    checklist?: string[];
    requiredRole?: string;
    requiredSkills?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskAssignment {
    taskId: TaskId;
    staffId: StaffId;
    assignedAt: Date;
    assignedBy: string;
    acceptedAt?: Date;
    notes?: string;
}
