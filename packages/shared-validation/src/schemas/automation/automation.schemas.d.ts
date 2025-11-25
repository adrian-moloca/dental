import { z } from 'zod';
export declare const WorkflowStatusSchema: z.ZodEnum<["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]>;
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export declare const WorkflowRunStatusSchema: z.ZodEnum<["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED", "TIMEOUT"]>;
export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>;
export declare const TriggerTypeSchema: z.ZodEnum<["EVENT_TRIGGER", "SCHEDULE_TRIGGER", "MANUAL_TRIGGER"]>;
export type TriggerType = z.infer<typeof TriggerTypeSchema>;
export declare const SourceServiceSchema: z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>;
export type SourceService = z.infer<typeof SourceServiceSchema>;
export declare const CronExpressionSchema: z.ZodString;
export type CronExpression = z.infer<typeof CronExpressionSchema>;
export declare const FixedIntervalSchema: z.ZodNumber;
export type FixedInterval = z.infer<typeof FixedIntervalSchema>;
export declare const IANATimezoneSchema: z.ZodDefault<z.ZodString>;
export type IANATimezone = z.infer<typeof IANATimezoneSchema>;
export declare const EventTriggerConfigSchema: z.ZodObject<{
    eventType: z.ZodString;
    sourceService: z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>;
    filters: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
        value: z.ZodOptional<z.ZodAny>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }>>, "many">>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
    filters?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
}, {
    eventType: string;
    sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
    filters?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
}>;
export type EventTriggerConfig = z.infer<typeof EventTriggerConfigSchema>;
export declare const ScheduleTriggerConfigSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    cronExpression: z.ZodOptional<z.ZodString>;
    fixedIntervalMs: z.ZodOptional<z.ZodNumber>;
    timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}>, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}>, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}, {
    timezone?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    cronExpression?: string | undefined;
    fixedIntervalMs?: number | undefined;
}>;
export type ScheduleTriggerConfig = z.infer<typeof ScheduleTriggerConfigSchema>;
export declare const RequiredRoleSchema: z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>;
export type RequiredRole = z.infer<typeof RequiredRoleSchema>;
export declare const ManualTriggerConfigSchema: z.ZodObject<{
    requiredRole: z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>;
    approvalNeeded: z.ZodDefault<z.ZodBoolean>;
    approvalRole: z.ZodOptional<z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>>;
}, "strip", z.ZodTypeAny, {
    requiredRole: "ADMIN" | "MANAGER" | "STAFF";
    approvalNeeded: boolean;
    approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
}, {
    requiredRole: "ADMIN" | "MANAGER" | "STAFF";
    approvalNeeded?: boolean | undefined;
    approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
}>;
export type ManualTriggerConfig = z.infer<typeof ManualTriggerConfigSchema>;
export declare const TriggerDtoSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"EVENT_TRIGGER">;
    config: z.ZodObject<{
        eventType: z.ZodString;
        sourceService: z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>;
        filters: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
            field: z.ZodString;
            operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
            value: z.ZodOptional<z.ZodAny>;
            logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
        }, "strip", z.ZodTypeAny, {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            logicalOperator: "AND" | "OR";
            value?: any;
        }, {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }>>, "many">>;
    }, "strip", z.ZodTypeAny, {
        eventType: string;
        sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
        filters?: {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            logicalOperator: "AND" | "OR";
            value?: any;
        }[] | undefined;
    }, {
        eventType: string;
        sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
        filters?: {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "EVENT_TRIGGER";
    config: {
        eventType: string;
        sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
        filters?: {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            logicalOperator: "AND" | "OR";
            value?: any;
        }[] | undefined;
    };
}, {
    type: "EVENT_TRIGGER";
    config: {
        eventType: string;
        sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
        filters?: {
            field: string;
            operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
            value?: any;
            logicalOperator?: "AND" | "OR" | undefined;
        }[] | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"SCHEDULE_TRIGGER">;
    config: z.ZodEffects<z.ZodEffects<z.ZodObject<{
        cronExpression: z.ZodOptional<z.ZodString>;
        fixedIntervalMs: z.ZodOptional<z.ZodNumber>;
        timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }>, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }>, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }, {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SCHEDULE_TRIGGER";
    config: {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    };
}, {
    type: "SCHEDULE_TRIGGER";
    config: {
        timezone?: string | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
        cronExpression?: string | undefined;
        fixedIntervalMs?: number | undefined;
    };
}>, z.ZodObject<{
    type: z.ZodLiteral<"MANUAL_TRIGGER">;
    config: z.ZodObject<{
        requiredRole: z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>;
        approvalNeeded: z.ZodDefault<z.ZodBoolean>;
        approvalRole: z.ZodOptional<z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>>;
    }, "strip", z.ZodTypeAny, {
        requiredRole: "ADMIN" | "MANAGER" | "STAFF";
        approvalNeeded: boolean;
        approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
    }, {
        requiredRole: "ADMIN" | "MANAGER" | "STAFF";
        approvalNeeded?: boolean | undefined;
        approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "MANUAL_TRIGGER";
    config: {
        requiredRole: "ADMIN" | "MANAGER" | "STAFF";
        approvalNeeded: boolean;
        approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
    };
}, {
    type: "MANUAL_TRIGGER";
    config: {
        requiredRole: "ADMIN" | "MANAGER" | "STAFF";
        approvalNeeded?: boolean | undefined;
        approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
    };
}>]>;
export type TriggerDto = z.infer<typeof TriggerDtoSchema>;
export declare const ConditionOperatorSchema: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;
export declare const LogicalOperatorSchema: z.ZodEnum<["AND", "OR"]>;
export type LogicalOperator = z.infer<typeof LogicalOperatorSchema>;
export declare const ConditionFieldSchema: z.ZodString;
export type ConditionField = z.infer<typeof ConditionFieldSchema>;
export declare const ConditionDtoSchema: z.ZodObject<{
    field: z.ZodString;
    operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
    value: z.ZodOptional<z.ZodAny>;
    logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
}, "strip", z.ZodTypeAny, {
    field: string;
    operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
    logicalOperator: "AND" | "OR";
    value?: any;
}, {
    field: string;
    operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
    value?: any;
    logicalOperator?: "AND" | "OR" | undefined;
}>;
export type ConditionDto = z.infer<typeof ConditionDtoSchema>;
export declare const ConditionGroupDtoSchema: z.ZodObject<{
    conditions: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
        value: z.ZodOptional<z.ZodAny>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">;
    logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
}, "strip", z.ZodTypeAny, {
    conditions: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[];
    logicalOperator: "AND" | "OR";
}, {
    conditions: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[];
    logicalOperator?: "AND" | "OR" | undefined;
}>;
export type ConditionGroupDto = z.infer<typeof ConditionGroupDtoSchema>;
export declare const ActionTypeSchema: z.ZodEnum<["SEND_EMAIL", "SEND_SMS", "CREATE_TASK", "CREATE_APPOINTMENT", "UPDATE_LOYALTY_POINTS", "APPLY_DISCOUNT", "SEND_WEBHOOK", "EMIT_EVENT", "UPDATE_PATIENT", "CREATE_INVOICE"]>;
export type ActionType = z.infer<typeof ActionTypeSchema>;
export declare const HttpMethodSchema: z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>;
export type HttpMethod = z.infer<typeof HttpMethodSchema>;
export declare const DiscountTypeSchema: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
export type DiscountType = z.infer<typeof DiscountTypeSchema>;
export declare const LoyaltyPointsSourceSchema: z.ZodEnum<["AUTOMATION", "BONUS", "PROMOTION", "MANUAL"]>;
export type LoyaltyPointsSource = z.infer<typeof LoyaltyPointsSourceSchema>;
export declare const EmailActionConfigSchema: z.ZodObject<{
    templateId: z.ZodUnion<[z.ZodString, z.ZodString]>;
    recipientField: z.ZodString;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    ccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    templateId: string;
    recipientField: string;
    variables?: Record<string, any> | undefined;
    ccRecipients?: string[] | undefined;
    bccRecipients?: string[] | undefined;
}, {
    templateId: string;
    recipientField: string;
    variables?: Record<string, any> | undefined;
    ccRecipients?: string[] | undefined;
    bccRecipients?: string[] | undefined;
}>;
export type EmailActionConfig = z.infer<typeof EmailActionConfigSchema>;
export declare const SmsActionConfigSchema: z.ZodObject<{
    message: z.ZodString;
    recipientField: z.ZodString;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    recipientField: string;
    variables?: Record<string, any> | undefined;
}, {
    message: string;
    recipientField: string;
    variables?: Record<string, any> | undefined;
}>;
export type SmsActionConfig = z.infer<typeof SmsActionConfigSchema>;
export declare const TaskActionConfigSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeField: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    dueDateField: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
}, "strip", z.ZodTypeAny, {
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    title: string;
    assigneeField: string;
    description?: string | undefined;
    dueDate?: string | undefined;
    dueDateField?: string | undefined;
}, {
    title: string;
    assigneeField: string;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    dueDate?: string | undefined;
    dueDateField?: string | undefined;
}>;
export type TaskActionConfig = z.infer<typeof TaskActionConfigSchema>;
export declare const AppointmentActionConfigSchema: z.ZodObject<{
    providerIdField: z.ZodString;
    serviceCode: z.ZodString;
    dateField: z.ZodString;
    duration: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    providerIdField: string;
    serviceCode: string;
    dateField: string;
    duration: number;
    notes?: string | undefined;
}, {
    providerIdField: string;
    serviceCode: string;
    dateField: string;
    duration: number;
    notes?: string | undefined;
}>;
export type AppointmentActionConfig = z.infer<typeof AppointmentActionConfigSchema>;
export declare const LoyaltyActionConfigSchema: z.ZodEffects<z.ZodObject<{
    pointsAmount: z.ZodOptional<z.ZodNumber>;
    pointsField: z.ZodOptional<z.ZodString>;
    source: z.ZodDefault<z.ZodEnum<["AUTOMATION", "BONUS", "PROMOTION", "MANUAL"]>>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
    description?: string | undefined;
    pointsAmount?: number | undefined;
    pointsField?: string | undefined;
}, {
    source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
    description?: string | undefined;
    pointsAmount?: number | undefined;
    pointsField?: string | undefined;
}>, {
    source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
    description?: string | undefined;
    pointsAmount?: number | undefined;
    pointsField?: string | undefined;
}, {
    source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
    description?: string | undefined;
    pointsAmount?: number | undefined;
    pointsField?: string | undefined;
}>;
export type LoyaltyActionConfig = z.infer<typeof LoyaltyActionConfigSchema>;
export declare const DiscountActionConfigSchema: z.ZodObject<{
    discountType: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
    amount: z.ZodEffects<z.ZodNumber, number, number>;
    targetField: z.ZodString;
    expiryDate: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    targetField: string;
    code?: string | undefined;
    expiryDate?: string | undefined;
}, {
    amount: number;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    targetField: string;
    code?: string | undefined;
    expiryDate?: string | undefined;
}>;
export type DiscountActionConfig = z.infer<typeof DiscountActionConfigSchema>;
export declare const WebhookActionConfigSchema: z.ZodObject<{
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bodyTemplate: z.ZodOptional<z.ZodString>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    url: string;
    method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
    timeoutMs: number;
    headers?: Record<string, string> | undefined;
    bodyTemplate?: string | undefined;
}, {
    url: string;
    method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
    headers?: Record<string, string> | undefined;
    bodyTemplate?: string | undefined;
    timeoutMs?: number | undefined;
}>;
export type WebhookActionConfig = z.infer<typeof WebhookActionConfigSchema>;
export declare const EventActionConfigSchema: z.ZodObject<{
    eventType: z.ZodString;
    payloadTemplate: z.ZodRecord<z.ZodString, z.ZodAny>;
    targetService: z.ZodOptional<z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>>;
}, "strip", z.ZodTypeAny, {
    eventType: string;
    payloadTemplate: Record<string, any>;
    targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
}, {
    eventType: string;
    payloadTemplate: Record<string, any>;
    targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
}>;
export type EventActionConfig = z.infer<typeof EventActionConfigSchema>;
export declare const PatientUpdateActionConfigSchema: z.ZodObject<{
    patientIdField: z.ZodString;
    updates: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    patientIdField: string;
    updates: Record<string, any>;
}, {
    patientIdField: string;
    updates: Record<string, any>;
}>;
export type PatientUpdateActionConfig = z.infer<typeof PatientUpdateActionConfigSchema>;
export declare const InvoiceActionConfigSchema: z.ZodObject<{
    patientIdField: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        amount: z.ZodNumber;
        quantity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        amount: number;
    }, {
        description: string;
        amount: number;
        quantity?: number | undefined;
    }>, "many">;
    dueDate: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    items: {
        description: string;
        quantity: number;
        amount: number;
    }[];
    patientIdField: string;
    dueDate?: string | undefined;
    notes?: string | undefined;
}, {
    items: {
        description: string;
        amount: number;
        quantity?: number | undefined;
    }[];
    patientIdField: string;
    dueDate?: string | undefined;
    notes?: string | undefined;
}>;
export type InvoiceActionConfig = z.infer<typeof InvoiceActionConfigSchema>;
export declare const BaseActionDtoSchema: z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    order: number;
    continueOnError: boolean;
}, {
    order: number;
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>;
export declare const ActionDtoSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"SEND_EMAIL">;
    config: z.ZodObject<{
        templateId: z.ZodUnion<[z.ZodString, z.ZodString]>;
        recipientField: z.ZodString;
        variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        ccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        bccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        templateId: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
        ccRecipients?: string[] | undefined;
        bccRecipients?: string[] | undefined;
    }, {
        templateId: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
        ccRecipients?: string[] | undefined;
        bccRecipients?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SEND_EMAIL";
    enabled: boolean;
    order: number;
    config: {
        templateId: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
        ccRecipients?: string[] | undefined;
        bccRecipients?: string[] | undefined;
    };
    continueOnError: boolean;
}, {
    type: "SEND_EMAIL";
    order: number;
    config: {
        templateId: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
        ccRecipients?: string[] | undefined;
        bccRecipients?: string[] | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"SEND_SMS">;
    config: z.ZodObject<{
        message: z.ZodString;
        recipientField: z.ZodString;
        variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
    }, {
        message: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SEND_SMS";
    enabled: boolean;
    order: number;
    config: {
        message: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
    };
    continueOnError: boolean;
}, {
    type: "SEND_SMS";
    order: number;
    config: {
        message: string;
        recipientField: string;
        variables?: Record<string, any> | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"CREATE_TASK">;
    config: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        assigneeField: z.ZodString;
        dueDate: z.ZodOptional<z.ZodString>;
        dueDateField: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    }, "strip", z.ZodTypeAny, {
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
        title: string;
        assigneeField: string;
        description?: string | undefined;
        dueDate?: string | undefined;
        dueDateField?: string | undefined;
    }, {
        title: string;
        assigneeField: string;
        description?: string | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
        dueDate?: string | undefined;
        dueDateField?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_TASK";
    enabled: boolean;
    order: number;
    config: {
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
        title: string;
        assigneeField: string;
        description?: string | undefined;
        dueDate?: string | undefined;
        dueDateField?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "CREATE_TASK";
    order: number;
    config: {
        title: string;
        assigneeField: string;
        description?: string | undefined;
        priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
        dueDate?: string | undefined;
        dueDateField?: string | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"CREATE_APPOINTMENT">;
    config: z.ZodObject<{
        providerIdField: z.ZodString;
        serviceCode: z.ZodString;
        dateField: z.ZodString;
        duration: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        providerIdField: string;
        serviceCode: string;
        dateField: string;
        duration: number;
        notes?: string | undefined;
    }, {
        providerIdField: string;
        serviceCode: string;
        dateField: string;
        duration: number;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_APPOINTMENT";
    enabled: boolean;
    order: number;
    config: {
        providerIdField: string;
        serviceCode: string;
        dateField: string;
        duration: number;
        notes?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "CREATE_APPOINTMENT";
    order: number;
    config: {
        providerIdField: string;
        serviceCode: string;
        dateField: string;
        duration: number;
        notes?: string | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"UPDATE_LOYALTY_POINTS">;
    config: z.ZodEffects<z.ZodObject<{
        pointsAmount: z.ZodOptional<z.ZodNumber>;
        pointsField: z.ZodOptional<z.ZodString>;
        source: z.ZodDefault<z.ZodEnum<["AUTOMATION", "BONUS", "PROMOTION", "MANUAL"]>>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    }, {
        source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    }>, {
        source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    }, {
        source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "UPDATE_LOYALTY_POINTS";
    enabled: boolean;
    order: number;
    config: {
        source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "UPDATE_LOYALTY_POINTS";
    order: number;
    config: {
        source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
        description?: string | undefined;
        pointsAmount?: number | undefined;
        pointsField?: string | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"APPLY_DISCOUNT">;
    config: z.ZodObject<{
        discountType: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
        amount: z.ZodEffects<z.ZodNumber, number, number>;
        targetField: z.ZodString;
        expiryDate: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT";
        targetField: string;
        code?: string | undefined;
        expiryDate?: string | undefined;
    }, {
        amount: number;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT";
        targetField: string;
        code?: string | undefined;
        expiryDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "APPLY_DISCOUNT";
    enabled: boolean;
    order: number;
    config: {
        amount: number;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT";
        targetField: string;
        code?: string | undefined;
        expiryDate?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "APPLY_DISCOUNT";
    order: number;
    config: {
        amount: number;
        discountType: "PERCENTAGE" | "FIXED_AMOUNT";
        targetField: string;
        code?: string | undefined;
        expiryDate?: string | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"SEND_WEBHOOK">;
    config: z.ZodObject<{
        url: z.ZodString;
        method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        bodyTemplate: z.ZodOptional<z.ZodString>;
        timeoutMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
        timeoutMs: number;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
    }, {
        url: string;
        method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "SEND_WEBHOOK";
    enabled: boolean;
    order: number;
    config: {
        url: string;
        method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
        timeoutMs: number;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "SEND_WEBHOOK";
    order: number;
    config: {
        url: string;
        method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
        headers?: Record<string, string> | undefined;
        bodyTemplate?: string | undefined;
        timeoutMs?: number | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"EMIT_EVENT">;
    config: z.ZodObject<{
        eventType: z.ZodString;
        payloadTemplate: z.ZodRecord<z.ZodString, z.ZodAny>;
        targetService: z.ZodOptional<z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>>;
    }, "strip", z.ZodTypeAny, {
        eventType: string;
        payloadTemplate: Record<string, any>;
        targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    }, {
        eventType: string;
        payloadTemplate: Record<string, any>;
        targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "EMIT_EVENT";
    enabled: boolean;
    order: number;
    config: {
        eventType: string;
        payloadTemplate: Record<string, any>;
        targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    };
    continueOnError: boolean;
}, {
    type: "EMIT_EVENT";
    order: number;
    config: {
        eventType: string;
        payloadTemplate: Record<string, any>;
        targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"UPDATE_PATIENT">;
    config: z.ZodObject<{
        patientIdField: z.ZodString;
        updates: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        patientIdField: string;
        updates: Record<string, any>;
    }, {
        patientIdField: string;
        updates: Record<string, any>;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "UPDATE_PATIENT";
    enabled: boolean;
    order: number;
    config: {
        patientIdField: string;
        updates: Record<string, any>;
    };
    continueOnError: boolean;
}, {
    type: "UPDATE_PATIENT";
    order: number;
    config: {
        patientIdField: string;
        updates: Record<string, any>;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>, z.ZodObject<{
    order: z.ZodNumber;
    enabled: z.ZodDefault<z.ZodBoolean>;
    continueOnError: z.ZodDefault<z.ZodBoolean>;
} & {
    type: z.ZodLiteral<"CREATE_INVOICE">;
    config: z.ZodObject<{
        patientIdField: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            amount: z.ZodNumber;
            quantity: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            quantity: number;
            amount: number;
        }, {
            description: string;
            amount: number;
            quantity?: number | undefined;
        }>, "many">;
        dueDate: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        items: {
            description: string;
            quantity: number;
            amount: number;
        }[];
        patientIdField: string;
        dueDate?: string | undefined;
        notes?: string | undefined;
    }, {
        items: {
            description: string;
            amount: number;
            quantity?: number | undefined;
        }[];
        patientIdField: string;
        dueDate?: string | undefined;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    type: "CREATE_INVOICE";
    enabled: boolean;
    order: number;
    config: {
        items: {
            description: string;
            quantity: number;
            amount: number;
        }[];
        patientIdField: string;
        dueDate?: string | undefined;
        notes?: string | undefined;
    };
    continueOnError: boolean;
}, {
    type: "CREATE_INVOICE";
    order: number;
    config: {
        items: {
            description: string;
            amount: number;
            quantity?: number | undefined;
        }[];
        patientIdField: string;
        dueDate?: string | undefined;
        notes?: string | undefined;
    };
    enabled?: boolean | undefined;
    continueOnError?: boolean | undefined;
}>]>;
export type ActionDto = z.infer<typeof ActionDtoSchema>;
export declare const BackoffStrategySchema: z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL"]>;
export type BackoffStrategy = z.infer<typeof BackoffStrategySchema>;
export declare const RetryPolicySchema: z.ZodObject<{
    maxRetries: z.ZodDefault<z.ZodNumber>;
    backoffStrategy: z.ZodDefault<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL"]>>;
    backoffMultiplier: z.ZodDefault<z.ZodNumber>;
    initialBackoffMs: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxRetries: number;
    backoffMultiplier: number;
    backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
    initialBackoffMs: number;
}, {
    maxRetries?: number | undefined;
    backoffMultiplier?: number | undefined;
    backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
    initialBackoffMs?: number | undefined;
}>;
export type RetryPolicy = z.infer<typeof RetryPolicySchema>;
export declare const OnFailureActionSchema: z.ZodEnum<["STOP_WORKFLOW", "CONTINUE_NEXT_ACTION", "RUN_FALLBACK_WORKFLOW", "SEND_ALERT"]>;
export type OnFailureAction = z.infer<typeof OnFailureActionSchema>;
export declare const ErrorHandlingConfigSchema: z.ZodObject<{
    retryPolicy: z.ZodOptional<z.ZodObject<{
        maxRetries: z.ZodDefault<z.ZodNumber>;
        backoffStrategy: z.ZodDefault<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL"]>>;
        backoffMultiplier: z.ZodDefault<z.ZodNumber>;
        initialBackoffMs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxRetries: number;
        backoffMultiplier: number;
        backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
        initialBackoffMs: number;
    }, {
        maxRetries?: number | undefined;
        backoffMultiplier?: number | undefined;
        backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
        initialBackoffMs?: number | undefined;
    }>>;
    onFailureAction: z.ZodDefault<z.ZodEnum<["STOP_WORKFLOW", "CONTINUE_NEXT_ACTION", "RUN_FALLBACK_WORKFLOW", "SEND_ALERT"]>>;
    fallbackWorkflowId: z.ZodOptional<z.ZodString>;
    alertRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
    retryPolicy?: {
        maxRetries: number;
        backoffMultiplier: number;
        backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
        initialBackoffMs: number;
    } | undefined;
    fallbackWorkflowId?: string | undefined;
    alertRecipients?: string[] | undefined;
}, {
    retryPolicy?: {
        maxRetries?: number | undefined;
        backoffMultiplier?: number | undefined;
        backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
        initialBackoffMs?: number | undefined;
    } | undefined;
    onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
    fallbackWorkflowId?: string | undefined;
    alertRecipients?: string[] | undefined;
}>;
export type ErrorHandlingConfig = z.infer<typeof ErrorHandlingConfigSchema>;
export declare const CreateWorkflowDtoSchema: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    trigger: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"EVENT_TRIGGER">;
        config: z.ZodObject<{
            eventType: z.ZodString;
            sourceService: z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>;
            filters: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                field: z.ZodString;
                operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
                value: z.ZodOptional<z.ZodAny>;
                logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
            }, "strip", z.ZodTypeAny, {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }, {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }>>, "many">>;
        }, "strip", z.ZodTypeAny, {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        }, {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    }, {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"SCHEDULE_TRIGGER">;
        config: z.ZodEffects<z.ZodEffects<z.ZodObject<{
            cronExpression: z.ZodOptional<z.ZodString>;
            fixedIntervalMs: z.ZodOptional<z.ZodNumber>;
            timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    }, {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"MANUAL_TRIGGER">;
        config: z.ZodObject<{
            requiredRole: z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>;
            approvalNeeded: z.ZodDefault<z.ZodBoolean>;
            approvalRole: z.ZodOptional<z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>>;
        }, "strip", z.ZodTypeAny, {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        }, {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    }, {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    }>]>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
        value: z.ZodOptional<z.ZodAny>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">>;
    actions: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_EMAIL">;
        config: z.ZodObject<{
            templateId: z.ZodUnion<[z.ZodString, z.ZodString]>;
            recipientField: z.ZodString;
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            ccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            bccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        }, {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_SMS">;
        config: z.ZodObject<{
            message: z.ZodString;
            recipientField: z.ZodString;
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        }, {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_TASK">;
        config: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            assigneeField: z.ZodString;
            dueDate: z.ZodOptional<z.ZodString>;
            dueDateField: z.ZodOptional<z.ZodString>;
            priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
        }, "strip", z.ZodTypeAny, {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        }, {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_APPOINTMENT">;
        config: z.ZodObject<{
            providerIdField: z.ZodString;
            serviceCode: z.ZodString;
            dateField: z.ZodString;
            duration: z.ZodNumber;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        }, {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"UPDATE_LOYALTY_POINTS">;
        config: z.ZodEffects<z.ZodObject<{
            pointsAmount: z.ZodOptional<z.ZodNumber>;
            pointsField: z.ZodOptional<z.ZodString>;
            source: z.ZodDefault<z.ZodEnum<["AUTOMATION", "BONUS", "PROMOTION", "MANUAL"]>>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }, {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }>, {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }, {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"APPLY_DISCOUNT">;
        config: z.ZodObject<{
            discountType: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
            amount: z.ZodEffects<z.ZodNumber, number, number>;
            targetField: z.ZodString;
            expiryDate: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        }, {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_WEBHOOK">;
        config: z.ZodObject<{
            url: z.ZodString;
            method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            bodyTemplate: z.ZodOptional<z.ZodString>;
            timeoutMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        }, {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"EMIT_EVENT">;
        config: z.ZodObject<{
            eventType: z.ZodString;
            payloadTemplate: z.ZodRecord<z.ZodString, z.ZodAny>;
            targetService: z.ZodOptional<z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>>;
        }, "strip", z.ZodTypeAny, {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        }, {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"UPDATE_PATIENT">;
        config: z.ZodObject<{
            patientIdField: z.ZodString;
            updates: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            patientIdField: string;
            updates: Record<string, any>;
        }, {
            patientIdField: string;
            updates: Record<string, any>;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    }, {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_INVOICE">;
        config: z.ZodObject<{
            patientIdField: z.ZodString;
            items: z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                amount: z.ZodNumber;
                quantity: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                quantity: number;
                amount: number;
            }, {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }>, "many">;
            dueDate: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        }, {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>]>, "many">;
    errorHandling: z.ZodOptional<z.ZodObject<{
        retryPolicy: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            backoffStrategy: z.ZodDefault<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL"]>>;
            backoffMultiplier: z.ZodDefault<z.ZodNumber>;
            initialBackoffMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        }, {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        }>>;
        onFailureAction: z.ZodDefault<z.ZodEnum<["STOP_WORKFLOW", "CONTINUE_NEXT_ACTION", "RUN_FALLBACK_WORKFLOW", "SEND_ALERT"]>>;
        fallbackWorkflowId: z.ZodOptional<z.ZodString>;
        alertRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    }, {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    enabled: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[];
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[];
    enabled?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>, {
    enabled: boolean;
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[];
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[];
    enabled?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>, {
    enabled: boolean;
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[];
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[];
    enabled?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>, {
    enabled: boolean;
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[];
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[];
    enabled?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>, {
    enabled: boolean;
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[];
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    name: string;
    trigger: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    };
    actions: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[];
    enabled?: boolean | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>;
export type CreateWorkflowDto = z.infer<typeof CreateWorkflowDtoSchema>;
export declare const UpdateWorkflowDtoSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"EVENT_TRIGGER">;
        config: z.ZodObject<{
            eventType: z.ZodString;
            sourceService: z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>;
            filters: z.ZodOptional<z.ZodArray<z.ZodLazy<z.ZodObject<{
                field: z.ZodString;
                operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
                value: z.ZodOptional<z.ZodAny>;
                logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
            }, "strip", z.ZodTypeAny, {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }, {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }>>, "many">>;
        }, "strip", z.ZodTypeAny, {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        }, {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    }, {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"SCHEDULE_TRIGGER">;
        config: z.ZodEffects<z.ZodEffects<z.ZodObject<{
            cronExpression: z.ZodOptional<z.ZodString>;
            fixedIntervalMs: z.ZodOptional<z.ZodNumber>;
            timezone: z.ZodOptional<z.ZodDefault<z.ZodString>>;
            startDate: z.ZodOptional<z.ZodString>;
            endDate: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }, {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    }, {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    }>, z.ZodObject<{
        type: z.ZodLiteral<"MANUAL_TRIGGER">;
        config: z.ZodObject<{
            requiredRole: z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>;
            approvalNeeded: z.ZodDefault<z.ZodBoolean>;
            approvalRole: z.ZodOptional<z.ZodEnum<["ADMIN", "MANAGER", "STAFF"]>>;
        }, "strip", z.ZodTypeAny, {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        }, {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    }, {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    }>]>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<["EQUALS", "NOT_EQUALS", "GREATER_THAN", "GREATER_THAN_OR_EQUALS", "LESS_THAN", "LESS_THAN_OR_EQUALS", "CONTAINS", "NOT_CONTAINS", "STARTS_WITH", "ENDS_WITH", "IN", "NOT_IN", "IS_NULL", "IS_NOT_NULL", "BETWEEN", "REGEX_MATCH"]>;
        value: z.ZodOptional<z.ZodAny>;
        logicalOperator: z.ZodDefault<z.ZodEnum<["AND", "OR"]>>;
    }, "strip", z.ZodTypeAny, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }, {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }>, "many">>;
    actions: z.ZodOptional<z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_EMAIL">;
        config: z.ZodObject<{
            templateId: z.ZodUnion<[z.ZodString, z.ZodString]>;
            recipientField: z.ZodString;
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            ccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            bccRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        }, {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_SMS">;
        config: z.ZodObject<{
            message: z.ZodString;
            recipientField: z.ZodString;
            variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        }, {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_TASK">;
        config: z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            assigneeField: z.ZodString;
            dueDate: z.ZodOptional<z.ZodString>;
            dueDateField: z.ZodOptional<z.ZodString>;
            priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
        }, "strip", z.ZodTypeAny, {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        }, {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_APPOINTMENT">;
        config: z.ZodObject<{
            providerIdField: z.ZodString;
            serviceCode: z.ZodString;
            dateField: z.ZodString;
            duration: z.ZodNumber;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        }, {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"UPDATE_LOYALTY_POINTS">;
        config: z.ZodEffects<z.ZodObject<{
            pointsAmount: z.ZodOptional<z.ZodNumber>;
            pointsField: z.ZodOptional<z.ZodString>;
            source: z.ZodDefault<z.ZodEnum<["AUTOMATION", "BONUS", "PROMOTION", "MANUAL"]>>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }, {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }>, {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }, {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"APPLY_DISCOUNT">;
        config: z.ZodObject<{
            discountType: z.ZodEnum<["PERCENTAGE", "FIXED_AMOUNT"]>;
            amount: z.ZodEffects<z.ZodNumber, number, number>;
            targetField: z.ZodString;
            expiryDate: z.ZodOptional<z.ZodString>;
            code: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        }, {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"SEND_WEBHOOK">;
        config: z.ZodObject<{
            url: z.ZodString;
            method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
            headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
            bodyTemplate: z.ZodOptional<z.ZodString>;
            timeoutMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        }, {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"EMIT_EVENT">;
        config: z.ZodObject<{
            eventType: z.ZodString;
            payloadTemplate: z.ZodRecord<z.ZodString, z.ZodAny>;
            targetService: z.ZodOptional<z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>>;
        }, "strip", z.ZodTypeAny, {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        }, {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"UPDATE_PATIENT">;
        config: z.ZodObject<{
            patientIdField: z.ZodString;
            updates: z.ZodRecord<z.ZodString, z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            patientIdField: string;
            updates: Record<string, any>;
        }, {
            patientIdField: string;
            updates: Record<string, any>;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    }, {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>, z.ZodObject<{
        order: z.ZodNumber;
        enabled: z.ZodDefault<z.ZodBoolean>;
        continueOnError: z.ZodDefault<z.ZodBoolean>;
    } & {
        type: z.ZodLiteral<"CREATE_INVOICE">;
        config: z.ZodObject<{
            patientIdField: z.ZodString;
            items: z.ZodArray<z.ZodObject<{
                description: z.ZodString;
                amount: z.ZodNumber;
                quantity: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                description: string;
                quantity: number;
                amount: number;
            }, {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }>, "many">;
            dueDate: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        }, {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    }, {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    }>]>, "many">>;
    errorHandling: z.ZodOptional<z.ZodObject<{
        retryPolicy: z.ZodOptional<z.ZodObject<{
            maxRetries: z.ZodDefault<z.ZodNumber>;
            backoffStrategy: z.ZodDefault<z.ZodEnum<["FIXED", "LINEAR", "EXPONENTIAL"]>>;
            backoffMultiplier: z.ZodDefault<z.ZodNumber>;
            initialBackoffMs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        }, {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        }>>;
        onFailureAction: z.ZodDefault<z.ZodEnum<["STOP_WORKFLOW", "CONTINUE_NEXT_ACTION", "RUN_FALLBACK_WORKFLOW", "SEND_ALERT"]>>;
        fallbackWorkflowId: z.ZodOptional<z.ZodString>;
        alertRecipients: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    }, {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    }>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    trigger?: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    } | undefined;
    actions?: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    enabled?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    trigger?: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    } | undefined;
    actions?: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>, {
    enabled?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        logicalOperator: "AND" | "OR";
        value?: any;
    }[] | undefined;
    trigger?: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                logicalOperator: "AND" | "OR";
                value?: any;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded: boolean;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    } | undefined;
    actions?: ({
        type: "SEND_EMAIL";
        enabled: boolean;
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_SMS";
        enabled: boolean;
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_TASK";
        enabled: boolean;
        order: number;
        config: {
            priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
            title: string;
            assigneeField: string;
            description?: string | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_APPOINTMENT";
        enabled: boolean;
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        enabled: boolean;
        order: number;
        config: {
            source: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL";
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "APPLY_DISCOUNT";
        enabled: boolean;
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "SEND_WEBHOOK";
        enabled: boolean;
        order: number;
        config: {
            url: string;
            method: "DELETE" | "GET" | "POST" | "PUT" | "PATCH";
            timeoutMs: number;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "EMIT_EVENT";
        enabled: boolean;
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        continueOnError: boolean;
    } | {
        type: "UPDATE_PATIENT";
        enabled: boolean;
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        continueOnError: boolean;
    } | {
        type: "CREATE_INVOICE";
        enabled: boolean;
        order: number;
        config: {
            items: {
                description: string;
                quantity: number;
                amount: number;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        continueOnError: boolean;
    })[] | undefined;
    errorHandling?: {
        onFailureAction: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT";
        retryPolicy?: {
            maxRetries: number;
            backoffMultiplier: number;
            backoffStrategy: "FIXED" | "LINEAR" | "EXPONENTIAL";
            initialBackoffMs: number;
        } | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}, {
    enabled?: boolean | undefined;
    name?: string | undefined;
    description?: string | undefined;
    tags?: string[] | undefined;
    conditions?: {
        field: string;
        operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
        value?: any;
        logicalOperator?: "AND" | "OR" | undefined;
    }[] | undefined;
    trigger?: {
        type: "EVENT_TRIGGER";
        config: {
            eventType: string;
            sourceService: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH";
            filters?: {
                field: string;
                operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "GREATER_THAN_OR_EQUALS" | "LESS_THAN" | "LESS_THAN_OR_EQUALS" | "CONTAINS" | "NOT_CONTAINS" | "STARTS_WITH" | "ENDS_WITH" | "IN" | "NOT_IN" | "IS_NULL" | "IS_NOT_NULL" | "BETWEEN" | "REGEX_MATCH";
                value?: any;
                logicalOperator?: "AND" | "OR" | undefined;
            }[] | undefined;
        };
    } | {
        type: "SCHEDULE_TRIGGER";
        config: {
            timezone?: string | undefined;
            startDate?: string | undefined;
            endDate?: string | undefined;
            cronExpression?: string | undefined;
            fixedIntervalMs?: number | undefined;
        };
    } | {
        type: "MANUAL_TRIGGER";
        config: {
            requiredRole: "ADMIN" | "MANAGER" | "STAFF";
            approvalNeeded?: boolean | undefined;
            approvalRole?: "ADMIN" | "MANAGER" | "STAFF" | undefined;
        };
    } | undefined;
    actions?: ({
        type: "SEND_EMAIL";
        order: number;
        config: {
            templateId: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
            ccRecipients?: string[] | undefined;
            bccRecipients?: string[] | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_SMS";
        order: number;
        config: {
            message: string;
            recipientField: string;
            variables?: Record<string, any> | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_TASK";
        order: number;
        config: {
            title: string;
            assigneeField: string;
            description?: string | undefined;
            priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
            dueDate?: string | undefined;
            dueDateField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_APPOINTMENT";
        order: number;
        config: {
            providerIdField: string;
            serviceCode: string;
            dateField: string;
            duration: number;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_LOYALTY_POINTS";
        order: number;
        config: {
            source?: "AUTOMATION" | "BONUS" | "PROMOTION" | "MANUAL" | undefined;
            description?: string | undefined;
            pointsAmount?: number | undefined;
            pointsField?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "APPLY_DISCOUNT";
        order: number;
        config: {
            amount: number;
            discountType: "PERCENTAGE" | "FIXED_AMOUNT";
            targetField: string;
            code?: string | undefined;
            expiryDate?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "SEND_WEBHOOK";
        order: number;
        config: {
            url: string;
            method?: "DELETE" | "GET" | "POST" | "PUT" | "PATCH" | undefined;
            headers?: Record<string, string> | undefined;
            bodyTemplate?: string | undefined;
            timeoutMs?: number | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "EMIT_EVENT";
        order: number;
        config: {
            eventType: string;
            payloadTemplate: Record<string, any>;
            targetService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "UPDATE_PATIENT";
        order: number;
        config: {
            patientIdField: string;
            updates: Record<string, any>;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    } | {
        type: "CREATE_INVOICE";
        order: number;
        config: {
            items: {
                description: string;
                amount: number;
                quantity?: number | undefined;
            }[];
            patientIdField: string;
            dueDate?: string | undefined;
            notes?: string | undefined;
        };
        enabled?: boolean | undefined;
        continueOnError?: boolean | undefined;
    })[] | undefined;
    errorHandling?: {
        retryPolicy?: {
            maxRetries?: number | undefined;
            backoffMultiplier?: number | undefined;
            backoffStrategy?: "FIXED" | "LINEAR" | "EXPONENTIAL" | undefined;
            initialBackoffMs?: number | undefined;
        } | undefined;
        onFailureAction?: "STOP_WORKFLOW" | "CONTINUE_NEXT_ACTION" | "RUN_FALLBACK_WORKFLOW" | "SEND_ALERT" | undefined;
        fallbackWorkflowId?: string | undefined;
        alertRecipients?: string[] | undefined;
    } | undefined;
}>;
export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowDtoSchema>;
export declare const QueryWorkflowsDtoSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]>>;
    triggerType: z.ZodOptional<z.ZodEnum<["EVENT_TRIGGER", "SCHEDULE_TRIGGER", "MANUAL_TRIGGER"]>>;
    sourceService: z.ZodOptional<z.ZodEnum<["CLINICAL", "BILLING", "SCHEDULING", "PATIENT", "MARKETING", "IMAGING", "INVENTORY", "AUTH"]>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    search: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "createdAt", "updatedAt", "status"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    sortBy: "status" | "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    pageSize: number;
    status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED" | undefined;
    enabled?: boolean | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    sourceService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    triggerType?: "EVENT_TRIGGER" | "SCHEDULE_TRIGGER" | "MANUAL_TRIGGER" | undefined;
}, {
    status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED" | undefined;
    enabled?: boolean | undefined;
    tags?: string[] | undefined;
    search?: string | undefined;
    page?: number | undefined;
    sortBy?: "status" | "name" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    sourceService?: "PATIENT" | "IMAGING" | "SCHEDULING" | "CLINICAL" | "BILLING" | "INVENTORY" | "MARKETING" | "AUTH" | undefined;
    triggerType?: "EVENT_TRIGGER" | "SCHEDULE_TRIGGER" | "MANUAL_TRIGGER" | undefined;
    pageSize?: number | undefined;
}>;
export type QueryWorkflowsDto = z.infer<typeof QueryWorkflowsDtoSchema>;
export declare const TriggerWorkflowManuallyDtoSchema: z.ZodObject<{
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
    userId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    userId?: string | undefined;
    payload?: Record<string, any> | undefined;
}, {
    userId?: string | undefined;
    payload?: Record<string, any> | undefined;
    dryRun?: boolean | undefined;
}>;
export type TriggerWorkflowManuallyDto = z.infer<typeof TriggerWorkflowManuallyDtoSchema>;
export declare const QueryWorkflowRunsDtoSchema: z.ZodObject<{
    workflowId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED", "TIMEOUT"]>>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    triggeredBy: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["startedAt", "completedAt", "status", "duration"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    sortBy: "status" | "completedAt" | "startedAt" | "duration";
    sortOrder: "asc" | "desc";
    pageSize: number;
    status?: "PENDING" | "CANCELLED" | "RUNNING" | "FAILED" | "SUCCEEDED" | "TIMEOUT" | undefined;
    workflowId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    triggeredBy?: string | undefined;
}, {
    status?: "PENDING" | "CANCELLED" | "RUNNING" | "FAILED" | "SUCCEEDED" | "TIMEOUT" | undefined;
    page?: number | undefined;
    sortBy?: "status" | "completedAt" | "startedAt" | "duration" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    pageSize?: number | undefined;
    workflowId?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    triggeredBy?: string | undefined;
}>;
export type QueryWorkflowRunsDto = z.infer<typeof QueryWorkflowRunsDtoSchema>;
export declare const WorkflowRunResultDtoSchema: z.ZodObject<{
    runId: z.ZodString;
    workflowId: z.ZodString;
    status: z.ZodEnum<["PENDING", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED", "TIMEOUT"]>;
    startedAt: z.ZodString;
    completedAt: z.ZodOptional<z.ZodString>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    actionsExecuted: z.ZodNumber;
    actionsSucceeded: z.ZodNumber;
    actionsFailed: z.ZodNumber;
    error: z.ZodOptional<z.ZodString>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    result: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "CANCELLED" | "RUNNING" | "FAILED" | "SUCCEEDED" | "TIMEOUT";
    startedAt: string;
    workflowId: string;
    runId: string;
    actionsExecuted: number;
    actionsSucceeded: number;
    actionsFailed: number;
    error?: string | undefined;
    payload?: Record<string, any> | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
    result?: Record<string, any> | undefined;
}, {
    status: "PENDING" | "CANCELLED" | "RUNNING" | "FAILED" | "SUCCEEDED" | "TIMEOUT";
    startedAt: string;
    workflowId: string;
    runId: string;
    actionsExecuted: number;
    actionsSucceeded: number;
    actionsFailed: number;
    error?: string | undefined;
    payload?: Record<string, any> | undefined;
    completedAt?: string | undefined;
    durationMs?: number | undefined;
    result?: Record<string, any> | undefined;
}>;
export type WorkflowRunResultDto = z.infer<typeof WorkflowRunResultDtoSchema>;
export declare const WorkflowStatisticsDtoSchema: z.ZodObject<{
    workflowId: z.ZodString;
    totalRuns: z.ZodNumber;
    successfulRuns: z.ZodNumber;
    failedRuns: z.ZodNumber;
    averageDurationMs: z.ZodNumber;
    lastRunAt: z.ZodOptional<z.ZodString>;
    lastSuccessAt: z.ZodOptional<z.ZodString>;
    lastFailureAt: z.ZodOptional<z.ZodString>;
    successRate: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    workflowId: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDurationMs: number;
    successRate: number;
    lastRunAt?: string | undefined;
    lastSuccessAt?: string | undefined;
    lastFailureAt?: string | undefined;
}, {
    workflowId: string;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDurationMs: number;
    successRate: number;
    lastRunAt?: string | undefined;
    lastSuccessAt?: string | undefined;
    lastFailureAt?: string | undefined;
}>;
export type WorkflowStatisticsDto = z.infer<typeof WorkflowStatisticsDtoSchema>;
export type { EventTriggerConfig as EventTrigger, ScheduleTriggerConfig as ScheduleTrigger, ManualTriggerConfig as ManualTrigger, ConditionDto as Condition, ConditionGroupDto as ConditionGroup, EmailActionConfig as EmailAction, SmsActionConfig as SmsAction, TaskActionConfig as TaskAction, AppointmentActionConfig as AppointmentAction, LoyaltyActionConfig as LoyaltyAction, DiscountActionConfig as DiscountAction, WebhookActionConfig as WebhookAction, EventActionConfig as EventAction, PatientUpdateActionConfig as PatientUpdateAction, InvoiceActionConfig as InvoiceAction, };
