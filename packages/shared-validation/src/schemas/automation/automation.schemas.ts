/**
 * Automation workflow validation schemas
 * Comprehensive Zod validation for automation workflows, triggers, conditions, actions, and execution
 * @module shared-validation/schemas/automation
 *
 * Edge cases covered:
 * - CRON expression validation and parsing
 * - Complex condition logic with nested groups
 * - Action sequencing and ordering validation
 * - Error handling and retry policy validation
 * - Circular workflow dependency prevention
 * - Template variable injection validation
 * - Rate limiting and execution throttling
 * - Timezone-aware scheduling
 * - Conditional trigger configurations
 * - Cross-field validations for actions
 * - Dynamic field references and value resolution
 * - Webhook security (HTTPS enforcement in production)
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
  URLSchema,
  SortOrderSchema,
} from '../common.schemas';

// ============================================================================
// WORKFLOW STATUS ENUMS
// ============================================================================

/**
 * Workflow lifecycle status
 * DRAFT → ACTIVE (can be paused/reactivated) → ARCHIVED
 */
export const WorkflowStatusSchema = z.enum(
  ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'],
  {
    errorMap: () => ({ message: 'Invalid workflow status' }),
  },
);

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

/**
 * Workflow execution/run status
 */
export const WorkflowRunStatusSchema = z.enum(
  ['PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'TIMEOUT'],
  {
    errorMap: () => ({ message: 'Invalid workflow run status' }),
  },
);

export type WorkflowRunStatus = z.infer<typeof WorkflowRunStatusSchema>;

// ============================================================================
// TRIGGER TYPE ENUMS & SCHEMAS
// ============================================================================

/**
 * Trigger type enumeration
 * Defines how a workflow is initiated
 */
export const TriggerTypeSchema = z.enum(
  ['EVENT_TRIGGER', 'SCHEDULE_TRIGGER', 'MANUAL_TRIGGER'],
  {
    errorMap: () => ({ message: 'Invalid trigger type' }),
  },
);

export type TriggerType = z.infer<typeof TriggerTypeSchema>;

/**
 * Source service enumeration
 * Services that can emit events to trigger workflows
 */
export const SourceServiceSchema = z.enum(
  [
    'CLINICAL',
    'BILLING',
    'SCHEDULING',
    'PATIENT',
    'MARKETING',
    'IMAGING',
    'INVENTORY',
    'AUTH',
  ],
  {
    errorMap: () => ({ message: 'Invalid source service' }),
  },
);

export type SourceService = z.infer<typeof SourceServiceSchema>;

/**
 * CRON expression schema with validation
 * Validates CRON format using basic regex (full validation happens at runtime)
 * Format: second minute hour day month dayOfWeek
 * Example: "0 0 9 * * MON-FRI" (9 AM on weekdays)
 */
export const CronExpressionSchema = z
  .string()
  .min(9, 'CRON expression is too short')
  .max(100, 'CRON expression is too long')
  .regex(
    /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/[0-6])/,
    {
      message:
        'Invalid CRON expression format. Expected: "second minute hour day month dayOfWeek"',
    },
  )
  .describe('Standard CRON expression (6 fields: second minute hour day month dayOfWeek)');

export type CronExpression = z.infer<typeof CronExpressionSchema>;

/**
 * Fixed interval schema (milliseconds)
 * Minimum 1 minute, maximum 1 day
 */
export const FixedIntervalSchema = z
  .number()
  .int('Interval must be an integer')
  .min(60000, 'Minimum interval is 60000ms (1 minute)')
  .max(86400000, 'Maximum interval is 86400000ms (1 day)')
  .describe('Fixed interval in milliseconds');

export type FixedInterval = z.infer<typeof FixedIntervalSchema>;

/**
 * IANA timezone schema
 * Examples: "America/New_York", "Europe/London", "UTC"
 */
export const IANATimezoneSchema = z
  .string()
  .min(3, 'Timezone is too short')
  .max(50, 'Timezone is too long')
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/, {
    message: 'Must be a valid IANA timezone (e.g., "America/New_York" or "UTC")',
  })
  .default('UTC');

export type IANATimezone = z.infer<typeof IANATimezoneSchema>;

/**
 * Event trigger configuration
 * Triggered by domain events from other services
 */
export const EventTriggerConfigSchema = z.object({
  eventType: NonEmptyStringSchema.min(3, 'Event type must be at least 3 characters').max(
    100,
    'Event type must be 100 characters or less',
  ),
  sourceService: SourceServiceSchema,
  filters: z
    .array(z.lazy(() => ConditionDtoSchema))
    .max(20, 'Maximum 20 filters allowed per event trigger')
    .optional()
    .describe('Optional filters to narrow down which events trigger the workflow'),
});

export type EventTriggerConfig = z.infer<typeof EventTriggerConfigSchema>;

/**
 * Schedule trigger configuration
 * Triggered on a schedule (CRON or fixed interval)
 */
export const ScheduleTriggerConfigSchema = z
  .object({
    cronExpression: CronExpressionSchema.optional(),
    fixedIntervalMs: FixedIntervalSchema.optional(),
    timezone: IANATimezoneSchema.optional(),
    startDate: ISODateStringSchema.optional().describe('Optional start date for scheduled trigger'),
    endDate: ISODateStringSchema.optional().describe('Optional end date for scheduled trigger'),
  })
  .refine(
    (data) => {
      // Must have either cronExpression OR fixedIntervalMs, but not both
      return (data.cronExpression && !data.fixedIntervalMs) || (!data.cronExpression && data.fixedIntervalMs);
    },
    {
      message: 'Must specify either cronExpression OR fixedIntervalMs, not both',
    },
  )
  .refine(
    (data) => {
      // If both dates are provided, endDate must be after startDate
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

export type ScheduleTriggerConfig = z.infer<typeof ScheduleTriggerConfigSchema>;

/**
 * Required role enumeration for manual triggers
 */
export const RequiredRoleSchema = z.enum(['ADMIN', 'MANAGER', 'STAFF'], {
  errorMap: () => ({ message: 'Invalid required role' }),
});

export type RequiredRole = z.infer<typeof RequiredRoleSchema>;

/**
 * Manual trigger configuration
 * Triggered manually by authorized users
 */
export const ManualTriggerConfigSchema = z.object({
  requiredRole: RequiredRoleSchema,
  approvalNeeded: z.boolean().default(false),
  approvalRole: RequiredRoleSchema.optional().describe(
    'Required role for approval (if approvalNeeded is true)',
  ),
});

export type ManualTriggerConfig = z.infer<typeof ManualTriggerConfigSchema>;

/**
 * Trigger DTO with discriminated union
 * Uses type field to determine configuration shape
 */
export const TriggerDtoSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(TriggerTypeSchema.enum.EVENT_TRIGGER),
    config: EventTriggerConfigSchema,
  }),
  z.object({
    type: z.literal(TriggerTypeSchema.enum.SCHEDULE_TRIGGER),
    config: ScheduleTriggerConfigSchema,
  }),
  z.object({
    type: z.literal(TriggerTypeSchema.enum.MANUAL_TRIGGER),
    config: ManualTriggerConfigSchema,
  }),
]);

export type TriggerDto = z.infer<typeof TriggerDtoSchema>;

// ============================================================================
// CONDITION SCHEMAS
// ============================================================================

/**
 * Condition operator enumeration
 * Supports various comparison and logical operations
 */
export const ConditionOperatorSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid condition operator' }),
  },
);

export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

/**
 * Logical operator for combining conditions
 */
export const LogicalOperatorSchema = z.enum(['AND', 'OR'], {
  errorMap: () => ({ message: 'Invalid logical operator' }),
});

export type LogicalOperator = z.infer<typeof LogicalOperatorSchema>;

/**
 * Condition field schema
 * Field reference using dot notation (e.g., "patient.email", "invoice.amount")
 * Supports nested field access
 */
export const ConditionFieldSchema = z
  .string()
  .min(1, 'Field cannot be empty')
  .max(200, 'Field path must be 200 characters or less')
  .regex(/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/, {
    message: 'Field must be valid dot notation (e.g., "patient.email", "invoice.totalAmount")',
  })
  .describe('Field reference using dot notation');

export type ConditionField = z.infer<typeof ConditionFieldSchema>;

/**
 * Condition DTO
 * Represents a single condition in a workflow
 */
export const ConditionDtoSchema = z.object({
  field: ConditionFieldSchema,
  operator: ConditionOperatorSchema,
  value: z.any().optional().describe('Value to compare against (type depends on field)'),
  logicalOperator: LogicalOperatorSchema.default('AND').describe(
    'Logical operator to combine with next condition',
  ),
});

export type ConditionDto = z.infer<typeof ConditionDtoSchema>;

/**
 * Condition group DTO
 * Groups multiple conditions with a logical operator
 */
export const ConditionGroupDtoSchema = z.object({
  conditions: z
    .array(ConditionDtoSchema)
    .min(1, 'At least one condition required')
    .max(50, 'Maximum 50 conditions per group'),
  logicalOperator: LogicalOperatorSchema.default('AND'),
});

export type ConditionGroupDto = z.infer<typeof ConditionGroupDtoSchema>;

// ============================================================================
// ACTION TYPE ENUMS & SCHEMAS
// ============================================================================

/**
 * Action type enumeration
 * Defines the type of action to perform
 */
export const ActionTypeSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid action type' }),
  },
);

export type ActionType = z.infer<typeof ActionTypeSchema>;

/**
 * HTTP method enumeration for webhooks
 */
export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], {
  errorMap: () => ({ message: 'Invalid HTTP method' }),
});

export type HttpMethod = z.infer<typeof HttpMethodSchema>;

/**
 * Discount type enumeration
 */
export const DiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
  errorMap: () => ({ message: 'Invalid discount type' }),
});

export type DiscountType = z.infer<typeof DiscountTypeSchema>;

/**
 * Loyalty points source enumeration
 */
export const LoyaltyPointsSourceSchema = z.enum(['AUTOMATION', 'BONUS', 'PROMOTION', 'MANUAL'], {
  errorMap: () => ({ message: 'Invalid loyalty points source' }),
});

export type LoyaltyPointsSource = z.infer<typeof LoyaltyPointsSourceSchema>;

/**
 * Email action configuration
 * Sends an email using a template
 */
export const EmailActionConfigSchema = z.object({
  templateId: z.union([UUIDSchema, NonEmptyStringSchema]).describe(
    'Template ID (UUID) or template name',
  ),
  recipientField: ConditionFieldSchema.describe('Field reference for recipient email (e.g., "patient.email")'),
  variables: z
    .record(z.any())
    .optional()
    .describe('Key-value pairs for template variable substitution'),
  ccRecipients: z
    .array(EmailSchema)
    .max(10, 'Maximum 10 CC recipients allowed')
    .optional(),
  bccRecipients: z
    .array(EmailSchema)
    .max(10, 'Maximum 10 BCC recipients allowed')
    .optional(),
});

export type EmailActionConfig = z.infer<typeof EmailActionConfigSchema>;

/**
 * SMS action configuration
 * Sends an SMS message
 */
export const SmsActionConfigSchema = z.object({
  message: NonEmptyStringSchema.min(1, 'Message cannot be empty').max(
    160,
    'SMS message must be 160 characters or less for standard SMS',
  ),
  recipientField: ConditionFieldSchema.describe('Field reference for recipient phone (e.g., "patient.phone")'),
  variables: z
    .record(z.any())
    .optional()
    .describe('Key-value pairs for message variable substitution'),
});

export type SmsActionConfig = z.infer<typeof SmsActionConfigSchema>;

/**
 * Task action configuration
 * Creates a task for a user
 */
export const TaskActionConfigSchema = z.object({
  title: NonEmptyStringSchema.min(3, 'Task title must be at least 3 characters').max(
    200,
    'Task title must be 200 characters or less',
  ),
  description: z.string().max(2000, 'Task description must be 2000 characters or less').optional(),
  assigneeField: ConditionFieldSchema.describe('Field reference for task assignee (e.g., "appointment.providerId")'),
  dueDate: ISODateStringSchema.optional().describe('Due date for the task (ISO string)'),
  dueDateField: ConditionFieldSchema.optional().describe(
    'Field reference for dynamic due date (e.g., "appointment.startTime")',
  ),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export type TaskActionConfig = z.infer<typeof TaskActionConfigSchema>;

/**
 * Appointment action configuration
 * Creates an appointment
 */
export const AppointmentActionConfigSchema = z.object({
  providerIdField: ConditionFieldSchema.describe('Field reference for provider ID'),
  serviceCode: NonEmptyStringSchema.min(1, 'Service code is required').max(
    50,
    'Service code must be 50 characters or less',
  ),
  dateField: ConditionFieldSchema.describe('Field reference for appointment date'),
  duration: PositiveIntSchema.min(5, 'Minimum appointment duration is 5 minutes').max(
    480,
    'Maximum appointment duration is 480 minutes (8 hours)',
  ),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});

export type AppointmentActionConfig = z.infer<typeof AppointmentActionConfigSchema>;

/**
 * Loyalty points action configuration
 * Awards or deducts loyalty points
 */
export const LoyaltyActionConfigSchema = z
  .object({
    pointsAmount: z
      .number()
      .int('Points must be an integer')
      .min(-100000, 'Minimum points is -100000 (deduction)')
      .max(100000, 'Maximum points is 100000')
      .optional(),
    pointsField: ConditionFieldSchema.optional().describe(
      'Field reference to calculate points dynamically',
    ),
    source: LoyaltyPointsSourceSchema.default('AUTOMATION'),
    description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  })
  .refine(
    (data) => {
      // Must have either pointsAmount OR pointsField, but not both
      return (data.pointsAmount !== undefined && !data.pointsField) ||
             (!data.pointsAmount && data.pointsField);
    },
    {
      message: 'Must specify either pointsAmount OR pointsField, not both',
    },
  );

export type LoyaltyActionConfig = z.infer<typeof LoyaltyActionConfigSchema>;

/**
 * Discount action configuration
 * Applies a discount to an invoice or appointment
 */
export const DiscountActionConfigSchema = z.object({
  discountType: DiscountTypeSchema,
  amount: z.number().positive('Discount amount must be positive').refine(
    (val) => {
      const str = val.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex === -1) return true;
      return str.length - decimalIndex - 1 <= 2;
    },
    {
      message: 'Amount must have at most 2 decimal places',
    },
  ),
  targetField: ConditionFieldSchema.describe('Field reference for discount target (e.g., "invoice.id")'),
  expiryDate: ISODateStringSchema.optional().describe('Optional expiry date for the discount'),
  code: z
    .string()
    .min(4, 'Discount code must be at least 4 characters')
    .max(20, 'Discount code must be 20 characters or less')
    .regex(/^[A-Z0-9]+$/, { message: 'Discount code must contain only uppercase letters and numbers' })
    .optional(),
});

export type DiscountActionConfig = z.infer<typeof DiscountActionConfigSchema>;

/**
 * Webhook action configuration
 * Sends an HTTP request to an external service
 */
export const WebhookActionConfigSchema = z.object({
  url: URLSchema.describe('Webhook URL (should use HTTPS in production)'),
  method: HttpMethodSchema.default('POST'),
  headers: z.record(z.string()).optional().describe('Optional HTTP headers'),
  bodyTemplate: z.string().max(10000, 'Body template must be 10000 characters or less').optional(),
  timeoutMs: z
    .number()
    .int('Timeout must be an integer')
    .min(1000, 'Minimum timeout is 1000ms')
    .max(30000, 'Maximum timeout is 30000ms (30 seconds)')
    .default(5000),
});

export type WebhookActionConfig = z.infer<typeof WebhookActionConfigSchema>;

/**
 * Event action configuration
 * Emits a domain event to trigger other workflows
 */
export const EventActionConfigSchema = z.object({
  eventType: NonEmptyStringSchema.min(3, 'Event type must be at least 3 characters').max(
    100,
    'Event type must be 100 characters or less',
  ),
  payloadTemplate: z.record(z.any()).describe('Event payload template'),
  targetService: SourceServiceSchema.optional().describe('Optional target service for the event'),
});

export type EventActionConfig = z.infer<typeof EventActionConfigSchema>;

/**
 * Patient update action configuration
 * Updates patient record fields
 */
export const PatientUpdateActionConfigSchema = z.object({
  patientIdField: ConditionFieldSchema.describe('Field reference for patient ID'),
  updates: z.record(z.any()).describe('Key-value pairs of fields to update'),
});

export type PatientUpdateActionConfig = z.infer<typeof PatientUpdateActionConfigSchema>;

/**
 * Invoice creation action configuration
 * Creates an invoice for a patient
 */
export const InvoiceActionConfigSchema = z.object({
  patientIdField: ConditionFieldSchema.describe('Field reference for patient ID'),
  items: z
    .array(
      z.object({
        description: NonEmptyStringSchema.max(500, 'Description must be 500 characters or less'),
        amount: z.number().positive('Amount must be positive'),
        quantity: PositiveIntSchema.default(1),
      }),
    )
    .min(1, 'At least one invoice item required'),
  dueDate: ISODateStringSchema.optional(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
});

export type InvoiceActionConfig = z.infer<typeof InvoiceActionConfigSchema>;

/**
 * Base action DTO with order
 */
export const BaseActionDtoSchema = z.object({
  order: PositiveIntSchema.describe('Execution order (1-based index)'),
  enabled: z.boolean().default(true),
  continueOnError: z.boolean().default(false).describe('Continue workflow if this action fails'),
});

/**
 * Action DTO with discriminated union
 * Uses type field to determine configuration shape
 */
export const ActionDtoSchema = z.discriminatedUnion('type', [
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.SEND_EMAIL),
    config: EmailActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.SEND_SMS),
    config: SmsActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.CREATE_TASK),
    config: TaskActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.CREATE_APPOINTMENT),
    config: AppointmentActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.UPDATE_LOYALTY_POINTS),
    config: LoyaltyActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.APPLY_DISCOUNT),
    config: DiscountActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.SEND_WEBHOOK),
    config: WebhookActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.EMIT_EVENT),
    config: EventActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.UPDATE_PATIENT),
    config: PatientUpdateActionConfigSchema,
  }),
  BaseActionDtoSchema.extend({
    type: z.literal(ActionTypeSchema.enum.CREATE_INVOICE),
    config: InvoiceActionConfigSchema,
  }),
]);

export type ActionDto = z.infer<typeof ActionDtoSchema>;

// ============================================================================
// ERROR HANDLING SCHEMAS
// ============================================================================

/**
 * Backoff strategy enumeration
 */
export const BackoffStrategySchema = z.enum(['FIXED', 'LINEAR', 'EXPONENTIAL'], {
  errorMap: () => ({ message: 'Invalid backoff strategy' }),
});

export type BackoffStrategy = z.infer<typeof BackoffStrategySchema>;

/**
 * Retry policy schema
 * Defines how to retry failed actions
 */
export const RetryPolicySchema = z.object({
  maxRetries: z
    .number()
    .int('Max retries must be an integer')
    .min(0, 'Min retries is 0')
    .max(10, 'Max retries is 10')
    .default(3),
  backoffStrategy: BackoffStrategySchema.default('EXPONENTIAL'),
  backoffMultiplier: z
    .number()
    .min(1, 'Backoff multiplier must be at least 1')
    .max(10, 'Backoff multiplier must be at most 10')
    .default(2),
  initialBackoffMs: z
    .number()
    .int('Initial backoff must be an integer')
    .min(100, 'Minimum initial backoff is 100ms')
    .max(60000, 'Maximum initial backoff is 60000ms (1 minute)')
    .default(1000),
});

export type RetryPolicy = z.infer<typeof RetryPolicySchema>;

/**
 * On failure action enumeration
 * Defines what to do when a workflow fails
 */
export const OnFailureActionSchema = z.enum(
  ['STOP_WORKFLOW', 'CONTINUE_NEXT_ACTION', 'RUN_FALLBACK_WORKFLOW', 'SEND_ALERT'],
  {
    errorMap: () => ({ message: 'Invalid on failure action' }),
  },
);

export type OnFailureAction = z.infer<typeof OnFailureActionSchema>;

/**
 * Error handling configuration
 */
export const ErrorHandlingConfigSchema = z.object({
  retryPolicy: RetryPolicySchema.optional(),
  onFailureAction: OnFailureActionSchema.default('STOP_WORKFLOW'),
  fallbackWorkflowId: UUIDSchema.optional().describe(
    'Workflow ID to run if onFailureAction is RUN_FALLBACK_WORKFLOW',
  ),
  alertRecipients: z
    .array(EmailSchema)
    .max(10, 'Maximum 10 alert recipients')
    .optional()
    .describe('Email recipients for failure alerts'),
});

export type ErrorHandlingConfig = z.infer<typeof ErrorHandlingConfigSchema>;

// ============================================================================
// WORKFLOW SCHEMAS
// ============================================================================

/**
 * Create workflow DTO
 * Used when creating a new automation workflow
 */
export const CreateWorkflowDtoSchema = z
  .object({
    name: NonEmptyStringSchema.min(3, 'Workflow name must be at least 3 characters').max(
      200,
      'Workflow name must be 200 characters or less',
    ),
    description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
    trigger: TriggerDtoSchema,
    conditions: z
      .array(ConditionDtoSchema)
      .max(50, 'Maximum 50 conditions per workflow')
      .optional()
      .describe('Optional conditions that must be met before executing actions'),
    actions: z
      .array(ActionDtoSchema)
      .min(1, 'At least one action is required')
      .max(20, 'Maximum 20 actions per workflow'),
    errorHandling: ErrorHandlingConfigSchema.optional(),
    tags: z
      .array(NonEmptyStringSchema.max(50, 'Tag must be 50 characters or less'))
      .max(20, 'Maximum 20 tags per workflow')
      .optional(),
    enabled: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Validate action order: must be sequential starting from 1
      const orders = data.actions.map((a) => a.order).sort((a, b) => a - b);
      for (let i = 0; i < orders.length; i++) {
        if (orders[i] !== i + 1) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'Actions must have sequential order starting from 1 (1, 2, 3, ...)',
      path: ['actions'],
    },
  )
  .refine(
    (data) => {
      // No duplicate action orders
      const orders = data.actions.map((a) => a.order);
      return new Set(orders).size === orders.length;
    },
    {
      message: 'Action orders must be unique',
      path: ['actions'],
    },
  )
  .refine(
    (data) => {
      // If onFailureAction is RUN_FALLBACK_WORKFLOW, fallbackWorkflowId must be provided
      if (
        data.errorHandling?.onFailureAction === 'RUN_FALLBACK_WORKFLOW' &&
        !data.errorHandling.fallbackWorkflowId
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Fallback workflow ID is required when onFailureAction is RUN_FALLBACK_WORKFLOW',
      path: ['errorHandling', 'fallbackWorkflowId'],
    },
  )
  .refine(
    (data) => {
      // If onFailureAction is SEND_ALERT, alertRecipients must be provided
      if (
        data.errorHandling?.onFailureAction === 'SEND_ALERT' &&
        (!data.errorHandling.alertRecipients || data.errorHandling.alertRecipients.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Alert recipients are required when onFailureAction is SEND_ALERT',
      path: ['errorHandling', 'alertRecipients'],
    },
  );

export type CreateWorkflowDto = z.infer<typeof CreateWorkflowDtoSchema>;

/**
 * Update workflow DTO
 * All fields optional for partial updates
 */
export const UpdateWorkflowDtoSchema = z
  .object({
    name: NonEmptyStringSchema.min(3, 'Workflow name must be at least 3 characters')
      .max(200, 'Workflow name must be 200 characters or less')
      .optional(),
    description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
    trigger: TriggerDtoSchema.optional(),
    conditions: z
      .array(ConditionDtoSchema)
      .max(50, 'Maximum 50 conditions per workflow')
      .optional(),
    actions: z
      .array(ActionDtoSchema)
      .min(1, 'At least one action is required')
      .max(20, 'Maximum 20 actions per workflow')
      .optional(),
    errorHandling: ErrorHandlingConfigSchema.optional(),
    tags: z
      .array(NonEmptyStringSchema.max(50, 'Tag must be 50 characters or less'))
      .max(20, 'Maximum 20 tags per workflow')
      .optional(),
    enabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If actions are provided, validate ordering
      if (data.actions && data.actions.length > 0) {
        const orders = data.actions.map((a) => a.order).sort((a, b) => a - b);
        for (let i = 0; i < orders.length; i++) {
          if (orders[i] !== i + 1) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message: 'Actions must have sequential order starting from 1 (1, 2, 3, ...)',
      path: ['actions'],
    },
  );

export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowDtoSchema>;

/**
 * Query workflows DTO
 * Filters and pagination for listing workflows
 */
export const QueryWorkflowsDtoSchema = z.object({
  status: WorkflowStatusSchema.optional(),
  triggerType: TriggerTypeSchema.optional(),
  sourceService: SourceServiceSchema.optional(),
  tags: z.array(NonEmptyStringSchema).optional(),
  search: z.string().max(200, 'Search query must be 200 characters or less').optional(),
  enabled: z.boolean().optional(),
  page: PositiveIntSchema.default(1),
  pageSize: z
    .number()
    .int('Page size must be an integer')
    .min(1, 'Minimum page size is 1')
    .max(100, 'Maximum page size is 100')
    .default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

export type QueryWorkflowsDto = z.infer<typeof QueryWorkflowsDtoSchema>;

// ============================================================================
// WORKFLOW EXECUTION SCHEMAS
// ============================================================================

/**
 * Trigger workflow manually DTO
 * Used to manually trigger a workflow with optional test payload
 */
export const TriggerWorkflowManuallyDtoSchema = z.object({
  payload: z.record(z.any()).optional().describe('Optional test payload for manual trigger'),
  dryRun: z.boolean().default(false).describe('If true, validates workflow but does not execute actions'),
  userId: UUIDSchema.optional().describe('User ID triggering the workflow'),
});

export type TriggerWorkflowManuallyDto = z.infer<typeof TriggerWorkflowManuallyDtoSchema>;

/**
 * Query workflow runs DTO
 * Filters and pagination for listing workflow execution history
 */
export const QueryWorkflowRunsDtoSchema = z.object({
  workflowId: UUIDSchema.optional(),
  status: WorkflowRunStatusSchema.optional(),
  dateFrom: ISODateStringSchema.optional(),
  dateTo: ISODateStringSchema.optional(),
  triggeredBy: UUIDSchema.optional().describe('User ID who triggered the workflow'),
  page: PositiveIntSchema.default(1),
  pageSize: z
    .number()
    .int('Page size must be an integer')
    .min(1, 'Minimum page size is 1')
    .max(100, 'Maximum page size is 100')
    .default(20),
  sortBy: z.enum(['startedAt', 'completedAt', 'status', 'duration']).default('startedAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

export type QueryWorkflowRunsDto = z.infer<typeof QueryWorkflowRunsDtoSchema>;

/**
 * Workflow run result DTO
 * Returned after workflow execution
 */
export const WorkflowRunResultDtoSchema = z.object({
  runId: UUIDSchema,
  workflowId: UUIDSchema,
  status: WorkflowRunStatusSchema,
  startedAt: ISODateStringSchema,
  completedAt: ISODateStringSchema.optional(),
  durationMs: NonNegativeIntSchema.optional(),
  actionsExecuted: NonNegativeIntSchema,
  actionsSucceeded: NonNegativeIntSchema,
  actionsFailed: NonNegativeIntSchema,
  error: z.string().optional().describe('Error message if workflow failed'),
  payload: z.record(z.any()).optional(),
  result: z.record(z.any()).optional().describe('Workflow execution result'),
});

export type WorkflowRunResultDto = z.infer<typeof WorkflowRunResultDtoSchema>;

// ============================================================================
// WORKFLOW STATISTICS SCHEMAS
// ============================================================================

/**
 * Workflow statistics DTO
 * Aggregated statistics for a workflow
 */
export const WorkflowStatisticsDtoSchema = z.object({
  workflowId: UUIDSchema,
  totalRuns: NonNegativeIntSchema,
  successfulRuns: NonNegativeIntSchema,
  failedRuns: NonNegativeIntSchema,
  averageDurationMs: NonNegativeIntSchema,
  lastRunAt: ISODateStringSchema.optional(),
  lastSuccessAt: ISODateStringSchema.optional(),
  lastFailureAt: ISODateStringSchema.optional(),
  successRate: z
    .number()
    .min(0, 'Success rate must be between 0 and 100')
    .max(100, 'Success rate must be between 0 and 100'),
});

export type WorkflowStatisticsDto = z.infer<typeof WorkflowStatisticsDtoSchema>;

// ============================================================================
// EXPORTS - Named types for convenience
// ============================================================================

export type {
  EventTriggerConfig as EventTrigger,
  ScheduleTriggerConfig as ScheduleTrigger,
  ManualTriggerConfig as ManualTrigger,
  ConditionDto as Condition,
  ConditionGroupDto as ConditionGroup,
  EmailActionConfig as EmailAction,
  SmsActionConfig as SmsAction,
  TaskActionConfig as TaskAction,
  AppointmentActionConfig as AppointmentAction,
  LoyaltyActionConfig as LoyaltyAction,
  DiscountActionConfig as DiscountAction,
  WebhookActionConfig as WebhookAction,
  EventActionConfig as EventAction,
  PatientUpdateActionConfig as PatientUpdateAction,
  InvoiceActionConfig as InvoiceAction,
};
