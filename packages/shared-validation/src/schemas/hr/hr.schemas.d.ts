import { z } from 'zod';
import { StaffRole, StaffStatus, AbsenceType, AbsenceStatus, TaskStatus, TaskPriority, TaskCategory } from '@dentalos/shared-domain';
export declare const CreateStaffDtoSchema: z.ZodObject<{
    userId: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodNativeEnum<typeof StaffRole>;
    clinicId: z.ZodOptional<z.ZodString>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    skills: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    hireDate: z.ZodString;
    emergencyContactName: z.ZodOptional<z.ZodString>;
    emergencyContactPhone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    skills: string[];
    hireDate: string;
    clinicId?: string | undefined;
    phone?: string | undefined;
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
}, {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: StaffRole;
    hireDate: string;
    clinicId?: string | undefined;
    phone?: string | undefined;
    licenseNumber?: string | undefined;
    specialty?: string | undefined;
    skills?: string[] | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
}>;
export type CreateStaffDto = z.infer<typeof CreateStaffDtoSchema>;
export declare const UpdateStaffDtoSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<typeof StaffRole>>;
    licenseNumber: z.ZodOptional<z.ZodString>;
    specialty: z.ZodOptional<z.ZodString>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    emergencyContactName: z.ZodOptional<z.ZodString>;
    emergencyContactPhone: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: StaffRole | undefined;
    licenseNumber?: string | undefined;
    bio?: string | undefined;
    specialty?: string | undefined;
    skills?: string[] | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
}, {
    email?: string | undefined;
    phone?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: StaffRole | undefined;
    licenseNumber?: string | undefined;
    bio?: string | undefined;
    specialty?: string | undefined;
    skills?: string[] | undefined;
    emergencyContactName?: string | undefined;
    emergencyContactPhone?: string | undefined;
}>;
export type UpdateStaffDto = z.infer<typeof UpdateStaffDtoSchema>;
export declare const UpdateStaffStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof StaffStatus>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: StaffStatus;
    reason?: string | undefined;
}, {
    status: StaffStatus;
    reason?: string | undefined;
}>;
export type UpdateStaffStatusDto = z.infer<typeof UpdateStaffStatusDtoSchema>;
export declare const CreateShiftDtoSchema: z.ZodObject<{
    clinicId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    assignedStaffIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    requiredRole: z.ZodOptional<z.ZodString>;
    minStaffCount: z.ZodOptional<z.ZodNumber>;
    maxStaffCount: z.ZodOptional<z.ZodNumber>;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    recurrenceRule: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    clinicId: string;
    title: string;
    assignedStaffIds: string[];
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    description?: string | undefined;
    notes?: string | undefined;
    requiredRole?: string | undefined;
    minStaffCount?: number | undefined;
    maxStaffCount?: number | undefined;
    recurrenceRule?: string | undefined;
}, {
    clinicId: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string | undefined;
    notes?: string | undefined;
    assignedStaffIds?: string[] | undefined;
    requiredRole?: string | undefined;
    minStaffCount?: number | undefined;
    maxStaffCount?: number | undefined;
    isRecurring?: boolean | undefined;
    recurrenceRule?: string | undefined;
}>;
export type CreateShiftDto = z.infer<typeof CreateShiftDtoSchema>;
export declare const UpdateShiftDtoSchema: z.ZodObject<{
    clinicId: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    startTime: z.ZodOptional<z.ZodString>;
    endTime: z.ZodOptional<z.ZodString>;
    assignedStaffIds: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    requiredRole: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    minStaffCount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    maxStaffCount: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    isRecurring: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    recurrenceRule: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    clinicId?: string | undefined;
    description?: string | undefined;
    title?: string | undefined;
    notes?: string | undefined;
    assignedStaffIds?: string[] | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    requiredRole?: string | undefined;
    minStaffCount?: number | undefined;
    maxStaffCount?: number | undefined;
    isRecurring?: boolean | undefined;
    recurrenceRule?: string | undefined;
}, {
    clinicId?: string | undefined;
    description?: string | undefined;
    title?: string | undefined;
    notes?: string | undefined;
    assignedStaffIds?: string[] | undefined;
    startTime?: string | undefined;
    endTime?: string | undefined;
    requiredRole?: string | undefined;
    minStaffCount?: number | undefined;
    maxStaffCount?: number | undefined;
    isRecurring?: boolean | undefined;
    recurrenceRule?: string | undefined;
}>;
export type UpdateShiftDto = z.infer<typeof UpdateShiftDtoSchema>;
export declare const AssignShiftDtoSchema: z.ZodObject<{
    staffId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    staffId: string;
}, {
    staffId: string;
}>;
export type AssignShiftDto = z.infer<typeof AssignShiftDtoSchema>;
export declare const CreateAvailabilityDtoSchema: z.ZodObject<{
    staffId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    isAvailable: z.ZodBoolean;
    isRecurring: z.ZodDefault<z.ZodBoolean>;
    recurrenceRule: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    staffId: string;
    isAvailable: boolean;
    clinicId?: string | undefined;
    notes?: string | undefined;
    recurrenceRule?: string | undefined;
}, {
    startTime: string;
    endTime: string;
    staffId: string;
    isAvailable: boolean;
    clinicId?: string | undefined;
    notes?: string | undefined;
    isRecurring?: boolean | undefined;
    recurrenceRule?: string | undefined;
}>;
export type CreateAvailabilityDto = z.infer<typeof CreateAvailabilityDtoSchema>;
export declare const CreateAbsenceDtoSchema: z.ZodObject<{
    staffId: z.ZodString;
    clinicId: z.ZodOptional<z.ZodString>;
    type: z.ZodNativeEnum<typeof AbsenceType>;
    startDate: z.ZodString;
    endDate: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    documentUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: AbsenceType;
    startDate: string;
    endDate: string;
    staffId: string;
    clinicId?: string | undefined;
    reason?: string | undefined;
    notes?: string | undefined;
    documentUrls?: string[] | undefined;
}, {
    type: AbsenceType;
    startDate: string;
    endDate: string;
    staffId: string;
    clinicId?: string | undefined;
    reason?: string | undefined;
    notes?: string | undefined;
    documentUrls?: string[] | undefined;
}>;
export type CreateAbsenceDto = z.infer<typeof CreateAbsenceDtoSchema>;
export declare const UpdateAbsenceStatusDtoSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof AbsenceStatus>;
    reviewNotes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: AbsenceStatus;
    reviewNotes?: string | undefined;
}, {
    status: AbsenceStatus;
    reviewNotes?: string | undefined;
}>;
export type UpdateAbsenceStatusDto = z.infer<typeof UpdateAbsenceStatusDtoSchema>;
export declare const CreateTaskDtoSchema: z.ZodObject<{
    clinicId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodNativeEnum<typeof TaskCategory>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof TaskPriority>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    clinicalProcedureId: z.ZodOptional<z.ZodString>;
    sterilizationCycleId: z.ZodOptional<z.ZodString>;
    inventoryOrderId: z.ZodOptional<z.ZodString>;
    patientId: z.ZodOptional<z.ZodString>;
    dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    priority: TaskPriority;
    title: string;
    category: TaskCategory;
    clinicId?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    dueDate?: string | undefined;
    notes?: string | undefined;
    patientId?: string | undefined;
    assigneeId?: string | undefined;
    estimatedMinutes?: number | undefined;
    clinicalProcedureId?: string | undefined;
    sterilizationCycleId?: string | undefined;
    inventoryOrderId?: string | undefined;
    dependencies?: string[] | undefined;
}, {
    title: string;
    category: TaskCategory;
    clinicId?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    priority?: TaskPriority | undefined;
    dueDate?: string | undefined;
    notes?: string | undefined;
    patientId?: string | undefined;
    assigneeId?: string | undefined;
    estimatedMinutes?: number | undefined;
    clinicalProcedureId?: string | undefined;
    sterilizationCycleId?: string | undefined;
    inventoryOrderId?: string | undefined;
    dependencies?: string[] | undefined;
}>;
export type CreateTaskDto = z.infer<typeof CreateTaskDtoSchema>;
export declare const UpdateTaskDtoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof TaskPriority>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    estimatedMinutes: z.ZodOptional<z.ZodNumber>;
    actualMinutes: z.ZodOptional<z.ZodNumber>;
    blockedBy: z.ZodOptional<z.ZodString>;
    blockedReason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: TaskStatus | undefined;
    description?: string | undefined;
    priority?: TaskPriority | undefined;
    title?: string | undefined;
    dueDate?: string | undefined;
    notes?: string | undefined;
    assigneeId?: string | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    blockedBy?: string | undefined;
    blockedReason?: string | undefined;
}, {
    status?: TaskStatus | undefined;
    description?: string | undefined;
    priority?: TaskPriority | undefined;
    title?: string | undefined;
    dueDate?: string | undefined;
    notes?: string | undefined;
    assigneeId?: string | undefined;
    estimatedMinutes?: number | undefined;
    actualMinutes?: number | undefined;
    blockedBy?: string | undefined;
    blockedReason?: string | undefined;
}>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskDtoSchema>;
export declare const EscalateTaskDtoSchema: z.ZodObject<{
    escalatedTo: z.ZodString;
    escalationReason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    escalatedTo: string;
    escalationReason: string;
}, {
    escalatedTo: string;
    escalationReason: string;
}>;
export type EscalateTaskDto = z.infer<typeof EscalateTaskDtoSchema>;
export declare const TaskFilterDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof TaskPriority>>;
    category: z.ZodOptional<z.ZodNativeEnum<typeof TaskCategory>>;
    assigneeId: z.ZodOptional<z.ZodString>;
    clinicId: z.ZodOptional<z.ZodString>;
    dueAfter: z.ZodOptional<z.ZodString>;
    dueBefore: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: TaskStatus | undefined;
    clinicId?: string | undefined;
    priority?: TaskPriority | undefined;
    assigneeId?: string | undefined;
    category?: TaskCategory | undefined;
    dueAfter?: string | undefined;
    dueBefore?: string | undefined;
}, {
    status?: TaskStatus | undefined;
    clinicId?: string | undefined;
    limit?: number | undefined;
    priority?: TaskPriority | undefined;
    offset?: number | undefined;
    assigneeId?: string | undefined;
    category?: TaskCategory | undefined;
    dueAfter?: string | undefined;
    dueBefore?: string | undefined;
}>;
export type TaskFilterDto = z.infer<typeof TaskFilterDtoSchema>;
