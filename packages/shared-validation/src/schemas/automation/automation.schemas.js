"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowStatisticsDtoSchema = exports.WorkflowRunResultDtoSchema = exports.QueryWorkflowRunsDtoSchema = exports.TriggerWorkflowManuallyDtoSchema = exports.QueryWorkflowsDtoSchema = exports.UpdateWorkflowDtoSchema = exports.CreateWorkflowDtoSchema = exports.ErrorHandlingConfigSchema = exports.OnFailureActionSchema = exports.RetryPolicySchema = exports.BackoffStrategySchema = exports.ActionDtoSchema = exports.BaseActionDtoSchema = exports.InvoiceActionConfigSchema = exports.PatientUpdateActionConfigSchema = exports.EventActionConfigSchema = exports.WebhookActionConfigSchema = exports.DiscountActionConfigSchema = exports.LoyaltyActionConfigSchema = exports.AppointmentActionConfigSchema = exports.TaskActionConfigSchema = exports.SmsActionConfigSchema = exports.EmailActionConfigSchema = exports.LoyaltyPointsSourceSchema = exports.DiscountTypeSchema = exports.HttpMethodSchema = exports.ActionTypeSchema = exports.ConditionGroupDtoSchema = exports.ConditionDtoSchema = exports.ConditionFieldSchema = exports.LogicalOperatorSchema = exports.ConditionOperatorSchema = exports.TriggerDtoSchema = exports.ManualTriggerConfigSchema = exports.RequiredRoleSchema = exports.ScheduleTriggerConfigSchema = exports.EventTriggerConfigSchema = exports.IANATimezoneSchema = exports.FixedIntervalSchema = exports.CronExpressionSchema = exports.SourceServiceSchema = exports.TriggerTypeSchema = exports.WorkflowRunStatusSchema = exports.WorkflowStatusSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.WorkflowStatusSchema = zod_1.z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], {
    errorMap: () => ({ message: 'Invalid workflow status' }),
});
exports.WorkflowRunStatusSchema = zod_1.z.enum(['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'TIMEOUT'], {
    errorMap: () => ({ message: 'Invalid workflow run status' }),
});
exports.TriggerTypeSchema = zod_1.z.enum(['EVENT_TRIGGER', 'SCHEDULE_TRIGGER', 'MANUAL_TRIGGER'], {
    errorMap: () => ({ message: 'Invalid trigger type' }),
});
exports.SourceServiceSchema = zod_1.z.enum([
    'CLINICAL',
    'BILLING',
    'SCHEDULING',
    'PATIENT',
    'MARKETING',
    'IMAGING',
    'INVENTORY',
    'AUTH',
], {
    errorMap: () => ({ message: 'Invalid source service' }),
});
exports.CronExpressionSchema = zod_1.z
    .string()
    .min(9, 'CRON expression is too short')
    .max(100, 'CRON expression is too long')
    .regex(/^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/[0-6])/, {
    message: 'Invalid CRON expression format. Expected: "second minute hour day month dayOfWeek"',
})
    .describe('Standard CRON expression (6 fields: second minute hour day month dayOfWeek)');
exports.FixedIntervalSchema = zod_1.z
    .number()
    .int('Interval must be an integer')
    .min(60000, 'Minimum interval is 60000ms (1 minute)')
    .max(86400000, 'Maximum interval is 86400000ms (1 day)')
    .describe('Fixed interval in milliseconds');
exports.IANATimezoneSchema = zod_1.z
    .string()
    .min(3, 'Timezone is too short')
    .max(50, 'Timezone is too long')
    .regex(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/, {
    message: 'Must be a valid IANA timezone (e.g., "America/New_York" or "UTC")',
})
    .default('UTC');
exports.EventTriggerConfigSchema = zod_1.z.object({
    eventType: common_schemas_1.NonEmptyStringSchema.min(3, 'Event type must be at least 3 characters').max(100, 'Event type must be 100 characters or less'),
    sourceService: exports.SourceServiceSchema,
    filters: zod_1.z
        .array(zod_1.z.lazy(() => exports.ConditionDtoSchema))
        .max(20, 'Maximum 20 filters allowed per event trigger')
        .optional()
        .describe('Optional filters to narrow down which events trigger the workflow'),
});
exports.ScheduleTriggerConfigSchema = zod_1.z
    .object({
    cronExpression: exports.CronExpressionSchema.optional(),
    fixedIntervalMs: exports.FixedIntervalSchema.optional(),
    timezone: exports.IANATimezoneSchema.optional(),
    startDate: common_schemas_1.ISODateStringSchema.optional().describe('Optional start date for scheduled trigger'),
    endDate: common_schemas_1.ISODateStringSchema.optional().describe('Optional end date for scheduled trigger'),
})
    .refine((data) => {
    return (data.cronExpression && !data.fixedIntervalMs) || (!data.cronExpression && data.fixedIntervalMs);
}, {
    message: 'Must specify either cronExpression OR fixedIntervalMs, not both',
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
}, {
    message: 'End date must be after start date',
    path: ['endDate'],
});
exports.RequiredRoleSchema = zod_1.z.enum(['ADMIN', 'MANAGER', 'STAFF'], {
    errorMap: () => ({ message: 'Invalid required role' }),
});
exports.ManualTriggerConfigSchema = zod_1.z.object({
    requiredRole: exports.RequiredRoleSchema,
    approvalNeeded: zod_1.z.boolean().default(false),
    approvalRole: exports.RequiredRoleSchema.optional().describe('Required role for approval (if approvalNeeded is true)'),
});
exports.TriggerDtoSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        type: zod_1.z.literal(exports.TriggerTypeSchema.enum.EVENT_TRIGGER),
        config: exports.EventTriggerConfigSchema,
    }),
    zod_1.z.object({
        type: zod_1.z.literal(exports.TriggerTypeSchema.enum.SCHEDULE_TRIGGER),
        config: exports.ScheduleTriggerConfigSchema,
    }),
    zod_1.z.object({
        type: zod_1.z.literal(exports.TriggerTypeSchema.enum.MANUAL_TRIGGER),
        config: exports.ManualTriggerConfigSchema,
    }),
]);
exports.ConditionOperatorSchema = zod_1.z.enum([
    'EQUALS',
    'NOT_EQUALS',
    'GREATER_THAN',
    'GREATER_THAN_OR_EQUALS',
    'LESS_THAN',
    'LESS_THAN_OR_EQUALS',
    'CONTAINS',
    'NOT_CONTAINS',
    'STARTS_WITH',
    'ENDS_WITH',
    'IN',
    'NOT_IN',
    'IS_NULL',
    'IS_NOT_NULL',
    'BETWEEN',
    'REGEX_MATCH',
], {
    errorMap: () => ({ message: 'Invalid condition operator' }),
});
exports.LogicalOperatorSchema = zod_1.z.enum(['AND', 'OR'], {
    errorMap: () => ({ message: 'Invalid logical operator' }),
});
exports.ConditionFieldSchema = zod_1.z
    .string()
    .min(1, 'Field cannot be empty')
    .max(200, 'Field path must be 200 characters or less')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/, {
    message: 'Field must be valid dot notation (e.g., "patient.email", "invoice.totalAmount")',
})
    .describe('Field reference using dot notation');
exports.ConditionDtoSchema = zod_1.z.object({
    field: exports.ConditionFieldSchema,
    operator: exports.ConditionOperatorSchema,
    value: zod_1.z.any().optional().describe('Value to compare against (type depends on field)'),
    logicalOperator: exports.LogicalOperatorSchema.default('AND').describe('Logical operator to combine with next condition'),
});
exports.ConditionGroupDtoSchema = zod_1.z.object({
    conditions: zod_1.z
        .array(exports.ConditionDtoSchema)
        .min(1, 'At least one condition required')
        .max(50, 'Maximum 50 conditions per group'),
    logicalOperator: exports.LogicalOperatorSchema.default('AND'),
});
exports.ActionTypeSchema = zod_1.z.enum([
    'SEND_EMAIL',
    'SEND_SMS',
    'CREATE_TASK',
    'CREATE_APPOINTMENT',
    'UPDATE_LOYALTY_POINTS',
    'APPLY_DISCOUNT',
    'SEND_WEBHOOK',
    'EMIT_EVENT',
    'UPDATE_PATIENT',
    'CREATE_INVOICE',
], {
    errorMap: () => ({ message: 'Invalid action type' }),
});
exports.HttpMethodSchema = zod_1.z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
    errorMap: () => ({ message: 'Invalid HTTP method' }),
});
exports.DiscountTypeSchema = zod_1.z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    errorMap: () => ({ message: 'Invalid discount type' }),
});
exports.LoyaltyPointsSourceSchema = zod_1.z.enum(['AUTOMATION', 'BONUS', 'PROMOTION', 'MANUAL'], {
    errorMap: () => ({ message: 'Invalid loyalty points source' }),
});
exports.EmailActionConfigSchema = zod_1.z.object({
    templateId: zod_1.z.union([common_schemas_1.UUIDSchema, common_schemas_1.NonEmptyStringSchema]).describe('Template ID (UUID) or template name'),
    recipientField: exports.ConditionFieldSchema.describe('Field reference for recipient email (e.g., "patient.email")'),
    variables: zod_1.z
        .record(zod_1.z.any())
        .optional()
        .describe('Key-value pairs for template variable substitution'),
    ccRecipients: zod_1.z
        .array(common_schemas_1.EmailSchema)
        .max(10, 'Maximum 10 CC recipients allowed')
        .optional(),
    bccRecipients: zod_1.z
        .array(common_schemas_1.EmailSchema)
        .max(10, 'Maximum 10 BCC recipients allowed')
        .optional(),
});
exports.SmsActionConfigSchema = zod_1.z.object({
    message: common_schemas_1.NonEmptyStringSchema.min(1, 'Message cannot be empty').max(160, 'SMS message must be 160 characters or less for standard SMS'),
    recipientField: exports.ConditionFieldSchema.describe('Field reference for recipient phone (e.g., "patient.phone")'),
    variables: zod_1.z
        .record(zod_1.z.any())
        .optional()
        .describe('Key-value pairs for message variable substitution'),
});
exports.TaskActionConfigSchema = zod_1.z.object({
    title: common_schemas_1.NonEmptyStringSchema.min(3, 'Task title must be at least 3 characters').max(200, 'Task title must be 200 characters or less'),
    description: zod_1.z.string().max(2000, 'Task description must be 2000 characters or less').optional(),
    assigneeField: exports.ConditionFieldSchema.describe('Field reference for task assignee (e.g., "appointment.providerId")'),
    dueDate: common_schemas_1.ISODateStringSchema.optional().describe('Due date for the task (ISO string)'),
    dueDateField: exports.ConditionFieldSchema.optional().describe('Field reference for dynamic due date (e.g., "appointment.startTime")'),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});
exports.AppointmentActionConfigSchema = zod_1.z.object({
    providerIdField: exports.ConditionFieldSchema.describe('Field reference for provider ID'),
    serviceCode: common_schemas_1.NonEmptyStringSchema.min(1, 'Service code is required').max(50, 'Service code must be 50 characters or less'),
    dateField: exports.ConditionFieldSchema.describe('Field reference for appointment date'),
    duration: common_schemas_1.PositiveIntSchema.min(5, 'Minimum appointment duration is 5 minutes').max(480, 'Maximum appointment duration is 480 minutes (8 hours)'),
    notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});
exports.LoyaltyActionConfigSchema = zod_1.z
    .object({
    pointsAmount: zod_1.z
        .number()
        .int('Points must be an integer')
        .min(-100000, 'Minimum points is -100000 (deduction)')
        .max(100000, 'Maximum points is 100000')
        .optional(),
    pointsField: exports.ConditionFieldSchema.optional().describe('Field reference to calculate points dynamically'),
    source: exports.LoyaltyPointsSourceSchema.default('AUTOMATION'),
    description: zod_1.z.string().max(500, 'Description must be 500 characters or less').optional(),
})
    .refine((data) => {
    return (data.pointsAmount !== undefined && !data.pointsField) ||
        (!data.pointsAmount && data.pointsField);
}, {
    message: 'Must specify either pointsAmount OR pointsField, not both',
});
exports.DiscountActionConfigSchema = zod_1.z.object({
    discountType: exports.DiscountTypeSchema,
    amount: zod_1.z.number().positive('Discount amount must be positive').refine((val) => {
        const str = val.toString();
        const decimalIndex = str.indexOf('.');
        if (decimalIndex === -1)
            return true;
        return str.length - decimalIndex - 1 <= 2;
    }, {
        message: 'Amount must have at most 2 decimal places',
    }),
    targetField: exports.ConditionFieldSchema.describe('Field reference for discount target (e.g., "invoice.id")'),
    expiryDate: common_schemas_1.ISODateStringSchema.optional().describe('Optional expiry date for the discount'),
    code: zod_1.z
        .string()
        .min(4, 'Discount code must be at least 4 characters')
        .max(20, 'Discount code must be 20 characters or less')
        .regex(/^[A-Z0-9]+$/, { message: 'Discount code must contain only uppercase letters and numbers' })
        .optional(),
});
exports.WebhookActionConfigSchema = zod_1.z.object({
    url: common_schemas_1.URLSchema.describe('Webhook URL (should use HTTPS in production)'),
    method: exports.HttpMethodSchema.default('POST'),
    headers: zod_1.z.record(zod_1.z.string()).optional().describe('Optional HTTP headers'),
    bodyTemplate: zod_1.z.string().max(10000, 'Body template must be 10000 characters or less').optional(),
    timeoutMs: zod_1.z
        .number()
        .int('Timeout must be an integer')
        .min(1000, 'Minimum timeout is 1000ms')
        .max(30000, 'Maximum timeout is 30000ms (30 seconds)')
        .default(5000),
});
exports.EventActionConfigSchema = zod_1.z.object({
    eventType: common_schemas_1.NonEmptyStringSchema.min(3, 'Event type must be at least 3 characters').max(100, 'Event type must be 100 characters or less'),
    payloadTemplate: zod_1.z.record(zod_1.z.any()).describe('Event payload template'),
    targetService: exports.SourceServiceSchema.optional().describe('Optional target service for the event'),
});
exports.PatientUpdateActionConfigSchema = zod_1.z.object({
    patientIdField: exports.ConditionFieldSchema.describe('Field reference for patient ID'),
    updates: zod_1.z.record(zod_1.z.any()).describe('Key-value pairs of fields to update'),
});
exports.InvoiceActionConfigSchema = zod_1.z.object({
    patientIdField: exports.ConditionFieldSchema.describe('Field reference for patient ID'),
    items: zod_1.z
        .array(zod_1.z.object({
        description: common_schemas_1.NonEmptyStringSchema.max(500, 'Description must be 500 characters or less'),
        amount: zod_1.z.number().positive('Amount must be positive'),
        quantity: common_schemas_1.PositiveIntSchema.default(1),
    }))
        .min(1, 'At least one invoice item required'),
    dueDate: common_schemas_1.ISODateStringSchema.optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
});
exports.BaseActionDtoSchema = zod_1.z.object({
    order: common_schemas_1.PositiveIntSchema.describe('Execution order (1-based index)'),
    enabled: zod_1.z.boolean().default(true),
    continueOnError: zod_1.z.boolean().default(false).describe('Continue workflow if this action fails'),
});
exports.ActionDtoSchema = zod_1.z.discriminatedUnion('type', [
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.SEND_EMAIL),
        config: exports.EmailActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.SEND_SMS),
        config: exports.SmsActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.CREATE_TASK),
        config: exports.TaskActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.CREATE_APPOINTMENT),
        config: exports.AppointmentActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.UPDATE_LOYALTY_POINTS),
        config: exports.LoyaltyActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.APPLY_DISCOUNT),
        config: exports.DiscountActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.SEND_WEBHOOK),
        config: exports.WebhookActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.EMIT_EVENT),
        config: exports.EventActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.UPDATE_PATIENT),
        config: exports.PatientUpdateActionConfigSchema,
    }),
    exports.BaseActionDtoSchema.extend({
        type: zod_1.z.literal(exports.ActionTypeSchema.enum.CREATE_INVOICE),
        config: exports.InvoiceActionConfigSchema,
    }),
]);
exports.BackoffStrategySchema = zod_1.z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL'], {
    errorMap: () => ({ message: 'Invalid backoff strategy' }),
});
exports.RetryPolicySchema = zod_1.z.object({
    maxRetries: zod_1.z
        .number()
        .int('Max retries must be an integer')
        .min(0, 'Min retries is 0')
        .max(10, 'Max retries is 10')
        .default(3),
    backoffStrategy: exports.BackoffStrategySchema.default('EXPONENTIAL'),
    backoffMultiplier: zod_1.z
        .number()
        .min(1, 'Backoff multiplier must be at least 1')
        .max(10, 'Backoff multiplier must be at most 10')
        .default(2),
    initialBackoffMs: zod_1.z
        .number()
        .int('Initial backoff must be an integer')
        .min(100, 'Minimum initial backoff is 100ms')
        .max(60000, 'Maximum initial backoff is 60000ms (1 minute)')
        .default(1000),
});
exports.OnFailureActionSchema = zod_1.z.enum(['STOP_WORKFLOW', 'CONTINUE_NEXT_ACTION', 'RUN_FALLBACK_WORKFLOW', 'SEND_ALERT'], {
    errorMap: () => ({ message: 'Invalid on failure action' }),
});
exports.ErrorHandlingConfigSchema = zod_1.z.object({
    retryPolicy: exports.RetryPolicySchema.optional(),
    onFailureAction: exports.OnFailureActionSchema.default('STOP_WORKFLOW'),
    fallbackWorkflowId: common_schemas_1.UUIDSchema.optional().describe('Workflow ID to run if onFailureAction is RUN_FALLBACK_WORKFLOW'),
    alertRecipients: zod_1.z
        .array(common_schemas_1.EmailSchema)
        .max(10, 'Maximum 10 alert recipients')
        .optional()
        .describe('Email recipients for failure alerts'),
});
exports.CreateWorkflowDtoSchema = zod_1.z
    .object({
    name: common_schemas_1.NonEmptyStringSchema.min(3, 'Workflow name must be at least 3 characters').max(200, 'Workflow name must be 200 characters or less'),
    description: zod_1.z.string().max(2000, 'Description must be 2000 characters or less').optional(),
    trigger: exports.TriggerDtoSchema,
    conditions: zod_1.z
        .array(exports.ConditionDtoSchema)
        .max(50, 'Maximum 50 conditions per workflow')
        .optional()
        .describe('Optional conditions that must be met before executing actions'),
    actions: zod_1.z
        .array(exports.ActionDtoSchema)
        .min(1, 'At least one action is required')
        .max(20, 'Maximum 20 actions per workflow'),
    errorHandling: exports.ErrorHandlingConfigSchema.optional(),
    tags: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema.max(50, 'Tag must be 50 characters or less'))
        .max(20, 'Maximum 20 tags per workflow')
        .optional(),
    enabled: zod_1.z.boolean().default(true),
})
    .refine((data) => {
    const orders = data.actions.map((a) => a.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i + 1) {
            return false;
        }
    }
    return true;
}, {
    message: 'Actions must have sequential order starting from 1 (1, 2, 3, ...)',
    path: ['actions'],
})
    .refine((data) => {
    const orders = data.actions.map((a) => a.order);
    return new Set(orders).size === orders.length;
}, {
    message: 'Action orders must be unique',
    path: ['actions'],
})
    .refine((data) => {
    if (data.errorHandling?.onFailureAction === 'RUN_FALLBACK_WORKFLOW' &&
        !data.errorHandling.fallbackWorkflowId) {
        return false;
    }
    return true;
}, {
    message: 'Fallback workflow ID is required when onFailureAction is RUN_FALLBACK_WORKFLOW',
    path: ['errorHandling', 'fallbackWorkflowId'],
})
    .refine((data) => {
    if (data.errorHandling?.onFailureAction === 'SEND_ALERT' &&
        (!data.errorHandling.alertRecipients || data.errorHandling.alertRecipients.length === 0)) {
        return false;
    }
    return true;
}, {
    message: 'Alert recipients are required when onFailureAction is SEND_ALERT',
    path: ['errorHandling', 'alertRecipients'],
});
exports.UpdateWorkflowDtoSchema = zod_1.z
    .object({
    name: common_schemas_1.NonEmptyStringSchema.min(3, 'Workflow name must be at least 3 characters')
        .max(200, 'Workflow name must be 200 characters or less')
        .optional(),
    description: zod_1.z.string().max(2000, 'Description must be 2000 characters or less').optional(),
    trigger: exports.TriggerDtoSchema.optional(),
    conditions: zod_1.z
        .array(exports.ConditionDtoSchema)
        .max(50, 'Maximum 50 conditions per workflow')
        .optional(),
    actions: zod_1.z
        .array(exports.ActionDtoSchema)
        .min(1, 'At least one action is required')
        .max(20, 'Maximum 20 actions per workflow')
        .optional(),
    errorHandling: exports.ErrorHandlingConfigSchema.optional(),
    tags: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema.max(50, 'Tag must be 50 characters or less'))
        .max(20, 'Maximum 20 tags per workflow')
        .optional(),
    enabled: zod_1.z.boolean().optional(),
})
    .refine((data) => {
    if (data.actions && data.actions.length > 0) {
        const orders = data.actions.map((a) => a.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
            if (orders[i] !== i + 1) {
                return false;
            }
        }
    }
    return true;
}, {
    message: 'Actions must have sequential order starting from 1 (1, 2, 3, ...)',
    path: ['actions'],
});
exports.QueryWorkflowsDtoSchema = zod_1.z.object({
    status: exports.WorkflowStatusSchema.optional(),
    triggerType: exports.TriggerTypeSchema.optional(),
    sourceService: exports.SourceServiceSchema.optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema).optional(),
    search: zod_1.z.string().max(200, 'Search query must be 200 characters or less').optional(),
    enabled: zod_1.z.boolean().optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Minimum page size is 1')
        .max(100, 'Maximum page size is 100')
        .default(20),
    sortBy: zod_1.z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
});
exports.TriggerWorkflowManuallyDtoSchema = zod_1.z.object({
    payload: zod_1.z.record(zod_1.z.any()).optional().describe('Optional test payload for manual trigger'),
    dryRun: zod_1.z.boolean().default(false).describe('If true, validates workflow but does not execute actions'),
    userId: common_schemas_1.UUIDSchema.optional().describe('User ID triggering the workflow'),
});
exports.QueryWorkflowRunsDtoSchema = zod_1.z.object({
    workflowId: common_schemas_1.UUIDSchema.optional(),
    status: exports.WorkflowRunStatusSchema.optional(),
    dateFrom: common_schemas_1.ISODateStringSchema.optional(),
    dateTo: common_schemas_1.ISODateStringSchema.optional(),
    triggeredBy: common_schemas_1.UUIDSchema.optional().describe('User ID who triggered the workflow'),
    page: common_schemas_1.PositiveIntSchema.default(1),
    pageSize: zod_1.z
        .number()
        .int('Page size must be an integer')
        .min(1, 'Minimum page size is 1')
        .max(100, 'Maximum page size is 100')
        .default(20),
    sortBy: zod_1.z.enum(['startedAt', 'completedAt', 'status', 'duration']).default('startedAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
});
exports.WorkflowRunResultDtoSchema = zod_1.z.object({
    runId: common_schemas_1.UUIDSchema,
    workflowId: common_schemas_1.UUIDSchema,
    status: exports.WorkflowRunStatusSchema,
    startedAt: common_schemas_1.ISODateStringSchema,
    completedAt: common_schemas_1.ISODateStringSchema.optional(),
    durationMs: common_schemas_1.NonNegativeIntSchema.optional(),
    actionsExecuted: common_schemas_1.NonNegativeIntSchema,
    actionsSucceeded: common_schemas_1.NonNegativeIntSchema,
    actionsFailed: common_schemas_1.NonNegativeIntSchema,
    error: zod_1.z.string().optional().describe('Error message if workflow failed'),
    payload: zod_1.z.record(zod_1.z.any()).optional(),
    result: zod_1.z.record(zod_1.z.any()).optional().describe('Workflow execution result'),
});
exports.WorkflowStatisticsDtoSchema = zod_1.z.object({
    workflowId: common_schemas_1.UUIDSchema,
    totalRuns: common_schemas_1.NonNegativeIntSchema,
    successfulRuns: common_schemas_1.NonNegativeIntSchema,
    failedRuns: common_schemas_1.NonNegativeIntSchema,
    averageDurationMs: common_schemas_1.NonNegativeIntSchema,
    lastRunAt: common_schemas_1.ISODateStringSchema.optional(),
    lastSuccessAt: common_schemas_1.ISODateStringSchema.optional(),
    lastFailureAt: common_schemas_1.ISODateStringSchema.optional(),
    successRate: zod_1.z
        .number()
        .min(0, 'Success rate must be between 0 and 100')
        .max(100, 'Success rate must be between 0 and 100'),
});
//# sourceMappingURL=automation.schemas.js.map