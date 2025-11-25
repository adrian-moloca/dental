/**
 * Automation Domain Types
 *
 * Comprehensive type definitions for workflow orchestration, event-driven automation,
 * and cross-service action execution in the Dental OS platform.
 *
 * @module automation.types
 *
 * Key Features:
 * - Event-driven workflow triggers
 * - Cross-service action execution
 * - Multi-tenant isolation
 * - Idempotency guarantees
 * - Retry and error handling
 * - Compliance audit trails
 * - Performance monitoring
 *
 * Dental Practice Use Cases:
 * - Automated appointment reminders
 * - Overdue invoice follow-ups
 * - Treatment recall campaigns
 * - Patient birthday promotions
 * - Post-operative care instructions
 * - Insurance claim status updates
 * - Hygiene appointment scheduling
 * - Patient re-engagement workflows
 * - Emergency appointment notifications
 * - Staff task assignments
 */

// =============================================================================
// BRANDED TYPES
// =============================================================================

/**
 * Branded UUID for Automation Workflow entities
 * Format: UUID v4
 * Example: "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f7a8"
 */
export type AutomationWorkflowId = string & { readonly __brand: 'AutomationWorkflowId' };

/**
 * Branded UUID for Workflow Run (execution instance)
 * Format: UUID v4
 * Example: "b2c3d4e5-f6a7-4890-b123-c4d5e6f7a8b9"
 */
export type WorkflowRunId = string & { readonly __brand: 'WorkflowRunId' };

/**
 * Branded UUID for Action Run (individual action execution)
 * Format: UUID v4
 * Example: "c3d4e5f6-a7b8-4901-c234-d5e6f7a8b9c0"
 */
export type ActionRunId = string & { readonly __brand: 'ActionRunId' };

/**
 * Branded string for Idempotency Key
 * Format: `${workflowId}:${eventId}:${tenantId}`
 * Example: "wf_a1b2c3:evt_x7y8z9:tn_org123"
 *
 * Purpose: Prevent duplicate workflow executions for the same event
 */
export type IdempotencyKey = string & { readonly __brand: 'IdempotencyKey' };

/**
 * Branded UUID for Template entities (email, SMS templates)
 * Format: UUID v4
 */
export type TemplateId = string & { readonly __brand: 'TemplateId' };

/**
 * Branded string for Event Type
 * Format: "{service}.{entity}.{action}"
 * Examples:
 * - "billing.invoice.created"
 * - "scheduling.appointment.cancelled"
 * - "patient.registration.completed"
 */
export type EventType = string & { readonly __brand: 'EventType' };

/**
 * Branded string for Workflow Name
 * Must be unique within a tenant
 */
export type WorkflowName = string & { readonly __brand: 'WorkflowName' };

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Workflow Status Lifecycle
 *
 * DRAFT: Being configured, not yet active
 * ACTIVE: Running and can be triggered
 * INACTIVE: Temporarily paused, cannot be triggered
 * ARCHIVED: Historical record, cannot be reactivated
 *
 * Dental Practice Note:
 * - Workflows should be DRAFT during testing phase
 * - INACTIVE useful for seasonal campaigns (e.g., holiday promotions)
 * - ARCHIVED maintains compliance audit trail
 */
export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Trigger Type Classification
 *
 * EVENT_TRIGGER: Triggered by domain events from services
 * SCHEDULE_TRIGGER: Triggered by time-based schedules (cron, interval)
 * MANUAL_TRIGGER: Triggered manually by authorized staff
 *
 * Dental Practice Examples:
 * - EVENT_TRIGGER: Send confirmation when appointment booked
 * - SCHEDULE_TRIGGER: Daily report of next-day appointments
 * - MANUAL_TRIGGER: Ad-hoc campaign for specific patient segment
 */
export enum TriggerType {
  EVENT_TRIGGER = 'EVENT_TRIGGER',
  SCHEDULE_TRIGGER = 'SCHEDULE_TRIGGER',
  MANUAL_TRIGGER = 'MANUAL_TRIGGER',
}

/**
 * Condition Operators for Workflow Rules
 *
 * Supports complex filtering logic to determine if workflow should execute
 *
 * Dental Practice Examples:
 * - EQUALS: patient.insuranceStatus === "ACTIVE"
 * - GREATER_THAN: invoice.amountDue > 100
 * - CONTAINS: patient.tags CONTAINS "high-risk"
 * - MATCHES_REGEX: patient.dateOfBirth matches today's month/day (birthday)
 */
export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  MATCHES_REGEX = 'MATCHES_REGEX',
  NOT_MATCHES_REGEX = 'NOT_MATCHES_REGEX',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

/**
 * Logical Operators for Condition Groups
 *
 * AND: All conditions must be true
 * OR: At least one condition must be true
 *
 * Supports nested logic for complex business rules
 */
export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

/**
 * Action Types for Workflow Execution
 *
 * Comprehensive set of actions covering all dental practice automation needs
 *
 * Communication Actions:
 * - SEND_EMAIL: Appointment reminders, treatment plans, invoices
 * - SEND_SMS: Quick reminders, confirmations
 * - SEND_PUSH_NOTIFICATION: Mobile app alerts
 *
 * Task Management Actions:
 * - CREATE_TASK: Follow-up tasks for staff
 * - ASSIGN_TASK: Route tasks to specific team members
 * - UPDATE_TASK: Modify existing task status/details
 *
 * Scheduling Actions:
 * - CREATE_APPOINTMENT: Auto-schedule hygiene recalls
 * - CANCEL_APPOINTMENT: Auto-cancel if prerequisites not met
 * - RESCHEDULE_APPOINTMENT: Move appointments based on conflicts
 *
 * Financial Actions:
 * - APPLY_LOYALTY_POINTS: Reward program automation
 * - CREATE_DISCOUNT: Promotional campaigns
 * - CREATE_CREDIT_NOTE: Automatic refunds/adjustments
 * - SEND_PAYMENT_REMINDER: Overdue invoice follow-ups
 *
 * Clinical Actions:
 * - FLAG_PATIENT_FOR_REVIEW: Alert for high-risk patients
 * - UPDATE_PATIENT_FIELD: Auto-update patient records
 * - CREATE_CLINICAL_NOTE: Document automated actions
 * - REQUEST_IMAGING: Order follow-up x-rays
 *
 * Integration Actions:
 * - CALL_WEBHOOK: Third-party system integration
 * - EMIT_EVENT: Trigger downstream workflows
 * - CALL_EXTERNAL_API: Insurance verification, lab orders
 *
 * Flow Control Actions:
 * - WAIT_DELAY: Pause before next action (e.g., wait 24h)
 * - CONDITIONAL_BRANCH: If-then-else logic
 * - PARALLEL_ACTIONS: Execute multiple actions simultaneously
 * - LOOP: Repeat actions for multiple entities
 */
export enum ActionType {
  // Communication Actions
  SEND_EMAIL = 'SEND_EMAIL',
  SEND_SMS = 'SEND_SMS',
  SEND_PUSH_NOTIFICATION = 'SEND_PUSH_NOTIFICATION',
  SEND_IN_APP_MESSAGE = 'SEND_IN_APP_MESSAGE',

  // Task Management Actions
  CREATE_TASK = 'CREATE_TASK',
  ASSIGN_TASK = 'ASSIGN_TASK',
  UPDATE_TASK = 'UPDATE_TASK',
  COMPLETE_TASK = 'COMPLETE_TASK',

  // Scheduling Actions
  CREATE_APPOINTMENT = 'CREATE_APPOINTMENT',
  CANCEL_APPOINTMENT = 'CANCEL_APPOINTMENT',
  RESCHEDULE_APPOINTMENT = 'RESCHEDULE_APPOINTMENT',
  SEND_APPOINTMENT_REMINDER = 'SEND_APPOINTMENT_REMINDER',

  // Financial Actions
  APPLY_LOYALTY_POINTS = 'APPLY_LOYALTY_POINTS',
  CREATE_DISCOUNT = 'CREATE_DISCOUNT',
  CREATE_CREDIT_NOTE = 'CREATE_CREDIT_NOTE',
  SEND_PAYMENT_REMINDER = 'SEND_PAYMENT_REMINDER',
  PROCESS_REFUND = 'PROCESS_REFUND',

  // Clinical Actions
  FLAG_PATIENT_FOR_REVIEW = 'FLAG_PATIENT_FOR_REVIEW',
  UPDATE_PATIENT_FIELD = 'UPDATE_PATIENT_FIELD',
  CREATE_CLINICAL_NOTE = 'CREATE_CLINICAL_NOTE',
  REQUEST_IMAGING = 'REQUEST_IMAGING',
  UPDATE_TREATMENT_PLAN = 'UPDATE_TREATMENT_PLAN',

  // Marketing Actions
  ADD_TO_CAMPAIGN = 'ADD_TO_CAMPAIGN',
  REMOVE_FROM_CAMPAIGN = 'REMOVE_FROM_CAMPAIGN',
  UPDATE_PATIENT_SEGMENT = 'UPDATE_PATIENT_SEGMENT',
  TRACK_ENGAGEMENT = 'TRACK_ENGAGEMENT',

  // Integration Actions
  CALL_WEBHOOK = 'CALL_WEBHOOK',
  EMIT_EVENT = 'EMIT_EVENT',
  CALL_EXTERNAL_API = 'CALL_EXTERNAL_API',
  SYNC_TO_EXTERNAL_SYSTEM = 'SYNC_TO_EXTERNAL_SYSTEM',

  // Flow Control Actions
  WAIT_DELAY = 'WAIT_DELAY',
  CONDITIONAL_BRANCH = 'CONDITIONAL_BRANCH',
  PARALLEL_ACTIONS = 'PARALLEL_ACTIONS',
  LOOP = 'LOOP',
  STOP_WORKFLOW = 'STOP_WORKFLOW',
}

/**
 * Workflow Run Status
 *
 * Tracks lifecycle of workflow execution instance
 *
 * PENDING: Workflow queued, not yet started
 * RUNNING: Currently executing actions
 * SUCCEEDED: All actions completed successfully
 * FAILED: One or more actions failed
 * CANCELLED: Manually stopped by user
 * TIMED_OUT: Exceeded maximum execution time
 *
 * Dental Practice Note:
 * - FAILED runs require review for compliance
 * - TIMED_OUT may indicate service issues needing attention
 */
export enum WorkflowRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  TIMED_OUT = 'TIMED_OUT',
}

/**
 * Action Run Status
 *
 * Tracks lifecycle of individual action execution
 *
 * PENDING: Queued for execution
 * RUNNING: Currently executing
 * SUCCEEDED: Completed successfully
 * FAILED: Execution failed
 * SKIPPED: Skipped due to condition evaluation
 * RETRYING: Failed but retrying per retry policy
 * CANCELLED: Workflow cancelled before action ran
 *
 * Dental Practice Note:
 * - FAILED email sends require manual follow-up
 * - SKIPPED actions must be logged for audit trail
 */
export enum ActionRunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  RETRYING = 'RETRYING',
  CANCELLED = 'CANCELLED',
}

/**
 * Retry Backoff Strategy
 *
 * FIXED: Wait fixed duration between retries
 * LINEAR: Increase wait time linearly (delay * attempt)
 * EXPONENTIAL: Exponential backoff (delay * 2^attempt)
 *
 * Dental Practice Recommendation:
 * - Use EXPONENTIAL for external API calls to prevent overwhelming services
 * - Use FIXED for internal service calls with known latency
 */
export enum BackoffStrategy {
  FIXED = 'FIXED',
  LINEAR = 'LINEAR',
  EXPONENTIAL = 'EXPONENTIAL',
}

/**
 * On Failure Action Strategy
 *
 * STOP_WORKFLOW: Halt execution immediately
 * CONTINUE_NEXT_ACTION: Skip failed action, continue workflow
 * RUN_FALLBACK_WORKFLOW: Execute alternative workflow
 * SEND_ALERT: Notify administrators
 *
 * Dental Practice Recommendations:
 * - STOP_WORKFLOW for critical actions (e.g., insurance verification before treatment)
 * - CONTINUE_NEXT_ACTION for non-critical notifications
 * - SEND_ALERT for actions requiring manual intervention
 */
export enum OnFailureAction {
  STOP_WORKFLOW = 'STOP_WORKFLOW',
  CONTINUE_NEXT_ACTION = 'CONTINUE_NEXT_ACTION',
  RUN_FALLBACK_WORKFLOW = 'RUN_FALLBACK_WORKFLOW',
  SEND_ALERT = 'SEND_ALERT',
}

/**
 * Condition Field Types
 *
 * Defines available fields for condition evaluation
 * Organized by domain entity
 *
 * Dental Practice Note:
 * Fields must match exact paths in service DTOs
 */
export enum ConditionField {
  // Patient Fields
  PATIENT_ID = 'patient.id',
  PATIENT_FIRST_NAME = 'patient.firstName',
  PATIENT_LAST_NAME = 'patient.lastName',
  PATIENT_EMAIL = 'patient.email',
  PATIENT_PHONE = 'patient.phone',
  PATIENT_DATE_OF_BIRTH = 'patient.dateOfBirth',
  PATIENT_AGE = 'patient.age',
  PATIENT_GENDER = 'patient.gender',
  PATIENT_STATUS = 'patient.status',
  PATIENT_INSURANCE_STATUS = 'patient.insuranceStatus',
  PATIENT_TAGS = 'patient.tags',
  PATIENT_CREATED_AT = 'patient.createdAt',
  PATIENT_LAST_VISIT_DATE = 'patient.lastVisitDate',
  PATIENT_NEXT_APPOINTMENT_DATE = 'patient.nextAppointmentDate',
  PATIENT_EMAIL_CONSENT = 'patient.emailConsent',
  PATIENT_SMS_CONSENT = 'patient.smsConsent',
  PATIENT_MARKETING_CONSENT = 'patient.marketingConsent',

  // Invoice/Billing Fields
  INVOICE_ID = 'invoice.id',
  INVOICE_STATUS = 'invoice.status',
  INVOICE_TOTAL_AMOUNT = 'invoice.totalAmount',
  INVOICE_AMOUNT_DUE = 'invoice.amountDue',
  INVOICE_AMOUNT_PAID = 'invoice.amountPaid',
  INVOICE_DUE_DATE = 'invoice.dueDate',
  INVOICE_DAYS_OVERDUE = 'invoice.daysOverdue',
  INVOICE_PAYMENT_STATUS = 'invoice.paymentStatus',
  INVOICE_CREATED_AT = 'invoice.createdAt',

  // Appointment Fields
  APPOINTMENT_ID = 'appointment.id',
  APPOINTMENT_STATUS = 'appointment.status',
  APPOINTMENT_TYPE = 'appointment.type',
  APPOINTMENT_DATE = 'appointment.date',
  APPOINTMENT_START_TIME = 'appointment.startTime',
  APPOINTMENT_END_TIME = 'appointment.endTime',
  APPOINTMENT_PROVIDER_ID = 'appointment.providerId',
  APPOINTMENT_SERVICE_CODE = 'appointment.serviceCode',
  APPOINTMENT_IS_FIRST_VISIT = 'appointment.isFirstVisit',
  APPOINTMENT_CREATED_AT = 'appointment.createdAt',

  // Loyalty Fields
  LOYALTY_POINTS_BALANCE = 'loyalty.pointsBalance',
  LOYALTY_TIER = 'loyalty.tier',
  LOYALTY_LIFETIME_POINTS = 'loyalty.lifetimePoints',
  LOYALTY_POINTS_EXPIRING_SOON = 'loyalty.pointsExpiringSoon',

  // Campaign Fields
  CAMPAIGN_ID = 'campaign.id',
  CAMPAIGN_STATUS = 'campaign.status',
  CAMPAIGN_TYPE = 'campaign.type',
  CAMPAIGN_SEGMENT_ID = 'campaign.segmentId',

  // Treatment Plan Fields
  TREATMENT_PLAN_ID = 'treatmentPlan.id',
  TREATMENT_PLAN_STATUS = 'treatmentPlan.status',
  TREATMENT_PLAN_TOTAL_COST = 'treatmentPlan.totalCost',
  TREATMENT_PLAN_ACCEPTANCE_STATUS = 'treatmentPlan.acceptanceStatus',

  // Clinical Note Fields
  CLINICAL_NOTE_ID = 'clinicalNote.id',
  CLINICAL_NOTE_TYPE = 'clinicalNote.type',
  CLINICAL_NOTE_CREATED_AT = 'clinicalNote.createdAt',

  // Imaging Fields
  IMAGING_STUDY_ID = 'imagingStudy.id',
  IMAGING_STUDY_TYPE = 'imagingStudy.studyType',
  IMAGING_STUDY_STATUS = 'imagingStudy.status',

  // Event Metadata
  EVENT_TYPE = 'event.type',
  EVENT_SOURCE_SERVICE = 'event.sourceService',
  EVENT_TIMESTAMP = 'event.timestamp',
}

/**
 * Service Names for Cross-Service Actions
 */
export enum ServiceName {
  PATIENT_SERVICE = 'patient-service',
  CLINICAL_SERVICE = 'clinical-service',
  SCHEDULING_SERVICE = 'scheduling-service',
  BILLING_SERVICE = 'billing-service',
  IMAGING_SERVICE = 'imaging-service',
  MARKETING_SERVICE = 'marketing-service',
  INVENTORY_SERVICE = 'inventory-service',
  NOTIFICATION_SERVICE = 'notification-service',
  AUTH_SERVICE = 'auth-service',
}

/**
 * Template Types for Communication Actions
 */
export enum TemplateType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  IN_APP_MESSAGE = 'IN_APP_MESSAGE',
}

/**
 * Discount Types
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

/**
 * Loyalty Point Source
 */
export enum LoyaltyPointSource {
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  REFERRAL = 'REFERRAL',
  BIRTHDAY_BONUS = 'BIRTHDAY_BONUS',
  CAMPAIGN = 'CAMPAIGN',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  AUTOMATION = 'AUTOMATION',
}

/**
 * Task Priority Levels
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * HTTP Methods for Webhook Actions
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Workflow Run Priority
 *
 * Determines execution order when multiple workflows queued
 *
 * Dental Practice Examples:
 * - CRITICAL: Emergency appointment notifications
 * - HIGH: Appointment reminders for next day
 * - NORMAL: General marketing campaigns
 * - LOW: Monthly reports, analytics
 */
export enum WorkflowRunPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
}

/**
 * Log Level for Workflow Execution Logs
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// =============================================================================
// TRIGGER INTERFACES
// =============================================================================

/**
 * Event Trigger Configuration
 *
 * Triggers workflow when specific domain event occurs
 *
 * Dental Practice Examples:
 * - Event: "billing.invoice.overdue" → Send payment reminder
 * - Event: "scheduling.appointment.created" → Send confirmation
 * - Event: "patient.registration.completed" → Start onboarding workflow
 *
 * Filter Examples:
 * - Only trigger for invoices > $100
 * - Only trigger for patients with email consent
 * - Only trigger for specific appointment types
 */
export interface EventTriggerConfig {
  /**
   * Event type to listen for
   * Format: "{service}.{entity}.{action}"
   */
  eventType: EventType;

  /**
   * Source service emitting the event
   */
  sourceService: ServiceName;

  /**
   * Optional filters to apply before triggering workflow
   * Filters evaluated against event payload
   *
   * Example: Only trigger for high-value invoices
   * filters: [
   *   { field: 'invoice.totalAmount', operator: 'GREATER_THAN', value: 1000 }
   * ]
   */
  filters?: AutomationCondition[];

  /**
   * Whether to process events that occurred while workflow was inactive
   * Default: false
   *
   * Dental Practice Note:
   * Set to true for critical workflows (e.g., overdue payments)
   * Set to false for time-sensitive workflows (e.g., appointment reminders)
   */
  processBacklog?: boolean;

  /**
   * Maximum age of events to process (in milliseconds)
   * Prevents processing stale events
   * Default: 24 hours
   */
  maxEventAge?: number;
}

/**
 * Schedule Trigger Configuration
 *
 * Triggers workflow on time-based schedule
 *
 * Dental Practice Examples:
 * - Daily at 9 AM: Send next-day appointment reminders
 * - Every Monday at 8 AM: Send weekly staff schedule
 * - First day of month: Generate monthly reports
 * - Every 6 months: Hygiene recall reminders
 *
 * Cron Expression Examples:
 * - "0 9 * * *" - Daily at 9:00 AM
 * - "0 8 * * 1" - Every Monday at 8:00 AM
 * - "0 0 1 * *" - First day of each month at midnight
 * - "0 star/4 * * *" - Every 4 hours
 */
export interface ScheduleTriggerConfig {
  /**
   * Cron expression for schedule
   * Format: "second minute hour day month dayOfWeek"
   *
   * Use cron-parser library for validation
   */
  cronExpression?: string;

  /**
   * Fixed interval in milliseconds
   * Alternative to cron expression
   *
   * Example: 3600000 = 1 hour
   */
  fixedIntervalMs?: number;

  /**
   * Timezone for schedule evaluation
   * Important for multi-location practices
   *
   * Example: "America/New_York", "America/Los_Angeles"
   */
  timezone: string;

  /**
   * Start date/time for schedule
   * Optional: Schedule not active before this time
   */
  startAt?: Date;

  /**
   * End date/time for schedule
   * Optional: Schedule not active after this time
   *
   * Dental Practice Example:
   * Campaign that runs only during specific promotion period
   */
  endAt?: Date;

  /**
   * Query to fetch entities for batch processing
   *
   * Dental Practice Example:
   * For birthday campaigns, fetch all patients with birthday today:
   * {
   *   service: 'patient-service',
   *   endpoint: '/patients/birthdays/today',
   *   method: 'GET'
   * }
   */
  batchQuery?: {
    service: ServiceName;
    endpoint: string;
    method: HttpMethod;
    params?: Record<string, any>;
  };

  /**
   * Maximum number of workflow runs per execution
   * Prevents overwhelming system with batch operations
   * Default: 100
   */
  maxBatchSize?: number;
}

/**
 * Manual Trigger Configuration
 *
 * Allows authorized staff to manually trigger workflow
 *
 * Dental Practice Examples:
 * - Send ad-hoc promotional campaign
 * - Manual patient re-engagement workflow
 * - Custom appointment reminder for specific patient
 */
export interface ManualTriggerConfig {
  /**
   * Required role to manually trigger workflow
   * Ensures only authorized staff can execute
   */
  requiredRole: string[];

  /**
   * Whether approval is needed before execution
   *
   * Dental Practice Note:
   * Set to true for financial actions (refunds, discounts)
   * Set to false for routine communications
   */
  approvalNeeded: boolean;

  /**
   * Optional approval roles (if approvalNeeded is true)
   */
  approvalRoles?: string[];

  /**
   * Input parameters required when triggering manually
   *
   * Example: Manual patient re-engagement
   * inputParams: [
   *   { name: 'patientId', type: 'string', required: true },
   *   { name: 'message', type: 'string', required: false }
   * ]
   */
  inputParams?: ManualTriggerInputParam[];

  /**
   * Maximum number of times workflow can be manually triggered per day
   * Prevents abuse
   */
  maxTriggersPerDay?: number;
}

/**
 * Input Parameter for Manual Trigger
 */
export interface ManualTriggerInputParam {
  /**
   * Parameter name
   */
  name: string;

  /**
   * Parameter type
   */
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';

  /**
   * Whether parameter is required
   */
  required: boolean;

  /**
   * Human-readable label
   */
  label: string;

  /**
   * Help text for parameter
   */
  description?: string;

  /**
   * Default value
   */
  defaultValue?: any;

  /**
   * Validation rules
   */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

/**
 * Automation Trigger Union Type
 *
 * Discriminated union based on trigger type
 */
export interface AutomationTrigger {
  /**
   * Trigger type discriminator
   */
  type: TriggerType;

  /**
   * Type-specific configuration
   */
  config: EventTriggerConfig | ScheduleTriggerConfig | ManualTriggerConfig;

  /**
   * Human-readable trigger description
   */
  description?: string;
}

// =============================================================================
// CONDITION INTERFACES
// =============================================================================

/**
 * Automation Condition
 *
 * Evaluates whether workflow should execute based on data
 *
 * Dental Practice Examples:
 * - Only send reminder if patient has email consent
 * - Only apply discount if invoice total > $500
 * - Only flag for review if patient is high-risk
 */
export interface AutomationCondition {
  /**
   * Unique identifier for condition
   * Used for logging and debugging
   */
  id?: string;

  /**
   * Field to evaluate
   * Dot-notation path in execution context
   */
  field: ConditionField | string;

  /**
   * Comparison operator
   */
  operator: ConditionOperator;

  /**
   * Value to compare against
   * Can be static value or reference to another field
   */
  value: any;

  /**
   * Whether value is a field reference (starts with '$')
   *
   * Example: Compare two fields
   * {
   *   field: 'invoice.amountDue',
   *   operator: 'GREATER_THAN',
   *   value: '$patient.creditLimit',
   *   isFieldReference: true
   * }
   */
  isFieldReference?: boolean;

  /**
   * Optional description for debugging
   */
  description?: string;
}

/**
 * Condition Group
 *
 * Supports nested AND/OR logic for complex business rules
 *
 * Dental Practice Example:
 * Send high-value patient reminder if:
 * (invoice.amountDue > 1000 AND patient.lifetimeValue > 10000)
 * OR
 * (invoice.daysOverdue > 30 AND patient.insuranceStatus === 'ACTIVE')
 */
export interface ConditionGroup {
  /**
   * Logical operator for conditions in this group
   */
  operator: LogicalOperator;

  /**
   * Conditions to evaluate
   */
  conditions: AutomationCondition[];

  /**
   * Nested condition groups
   * Allows for complex nested logic
   */
  groups?: ConditionGroup[];

  /**
   * Optional description
   */
  description?: string;
}

// =============================================================================
// ACTION CONFIGURATION INTERFACES
// =============================================================================

/**
 * Email Action Configuration
 *
 * Sends email using predefined template
 *
 * Dental Practice Examples:
 * - Appointment confirmation/reminder
 * - Treatment plan presentation
 * - Invoice notification
 * - Post-operative care instructions
 *
 * HIPAA Compliance Note:
 * - Ensure email consent is obtained
 * - Use secure email for PHI
 * - Log all email sends for audit trail
 */
export interface EmailActionConfig {
  /**
   * Email template ID
   */
  templateId: TemplateId;

  /**
   * Recipient email address
   * Can be field reference: "patient.email"
   */
  recipientField: string;

  /**
   * Optional CC recipients
   */
  ccFields?: string[];

  /**
   * Optional BCC recipients
   */
  bccFields?: string[];

  /**
   * Template variables for personalization
   *
   * Example:
   * {
   *   patientName: "patient.firstName",
   *   appointmentDate: "appointment.date",
   *   providerName: "provider.name"
   * }
   */
  variables?: Record<string, any>;

  /**
   * Optional attachments
   * Field references to file URLs
   */
  attachments?: string[];

  /**
   * Send from custom email address
   * Default: Use tenant's default from address
   */
  fromEmail?: string;

  /**
   * Custom reply-to address
   */
  replyTo?: string;

  /**
   * Whether this email contains PHI
   * If true, additional security measures applied
   */
  containsPHI?: boolean;

  /**
   * Optional scheduling
   * Send email at specific time rather than immediately
   */
  sendAt?: Date | string; // Field reference: "appointment.date"
}

/**
 * SMS Action Configuration
 *
 * Sends SMS message
 *
 * Dental Practice Examples:
 * - Quick appointment reminders
 * - Confirmation codes
 * - Appointment running late notifications
 *
 * HIPAA Compliance Note:
 * - SMS consent required
 * - Minimize PHI in SMS content
 * - Consider using secure patient portal links instead of PHI
 */
export interface SmsActionConfig {
  /**
   * Recipient phone number
   * Field reference: "patient.phone"
   */
  recipientField: string;

  /**
   * SMS template ID or raw message
   */
  templateId?: TemplateId;
  message?: string;

  /**
   * Template variables
   */
  variables?: Record<string, any>;

  /**
   * Whether message contains PHI
   */
  containsPHI?: boolean;

  /**
   * Optional scheduling
   */
  sendAt?: Date | string;
}

/**
 * Push Notification Action Configuration
 *
 * Sends push notification to mobile app
 *
 * Dental Practice Examples:
 * - Appointment starting soon
 * - Lab results available
 * - Message from provider
 */
export interface PushNotificationActionConfig {
  /**
   * Notification title
   */
  title: string;

  /**
   * Notification body
   */
  body: string;

  /**
   * Recipient user ID
   * Field reference: "patient.userId"
   */
  recipientField: string;

  /**
   * Optional deep link
   * Opens specific screen in app
   */
  deepLink?: string;

  /**
   * Custom data payload
   */
  data?: Record<string, any>;

  /**
   * Optional icon
   */
  icon?: string;

  /**
   * Whether notification contains PHI
   */
  containsPHI?: boolean;
}

/**
 * Task Action Configuration
 *
 * Creates task for staff member
 *
 * Dental Practice Examples:
 * - Follow-up call after treatment
 * - Verify insurance before appointment
 * - Review high-risk patient chart
 * - Process lab order
 */
export interface TaskActionConfig {
  /**
   * Task title
   */
  title: string;

  /**
   * Task description
   */
  description?: string;

  /**
   * Assignee user ID
   * Field reference or static value
   */
  assigneeField?: string;
  assigneeId?: string;

  /**
   * Task due date
   * Can be relative: "+2d" (2 days from now)
   */
  dueDate?: Date | string;

  /**
   * Task priority
   */
  priority: TaskPriority;

  /**
   * Related entity
   * Link task to patient, appointment, etc.
   */
  relatedEntity?: {
    entityType: 'patient' | 'appointment' | 'invoice' | 'treatment-plan';
    entityIdField: string;
  };

  /**
   * Task tags for categorization
   */
  tags?: string[];

  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Appointment Action Configuration
 *
 * Creates, cancels, or reschedules appointment
 *
 * Dental Practice Examples:
 * - Auto-schedule hygiene recall (6 months after last cleaning)
 * - Auto-schedule follow-up after surgery
 * - Cancel appointment if prerequisites not met
 *
 * Clinical Safety Note:
 * - Verify provider availability before auto-scheduling
 * - Ensure patient eligibility for service
 * - Respect operatory and equipment constraints
 */
export interface AppointmentActionConfig {
  /**
   * Action to perform
   */
  action: 'create' | 'cancel' | 'reschedule';

  /**
   * Patient ID field reference
   */
  patientIdField: string;

  /**
   * Provider ID field reference or static value
   */
  providerIdField?: string;
  providerId?: string;

  /**
   * Service/procedure code
   */
  serviceCode?: string;

  /**
   * Appointment type
   */
  appointmentType?: string;

  /**
   * Appointment date/time
   * Can be relative: "+6M" (6 months from now)
   */
  date?: Date | string;

  /**
   * Duration in minutes
   */
  durationMinutes?: number;

  /**
   * Operatory requirements
   */
  operatoryId?: string;
  operatoryRequirements?: string[];

  /**
   * Appointment notes
   */
  notes?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, any>;

  /**
   * Send confirmation notification
   */
  sendConfirmation?: boolean;
}

/**
 * Loyalty Action Configuration
 *
 * Apply loyalty points to patient account
 *
 * Dental Practice Examples:
 * - Award points after completed appointment
 * - Birthday bonus points
 * - Referral bonus points
 * - Promotion campaign points
 */
export interface LoyaltyActionConfig {
  /**
   * Points amount (positive or negative)
   */
  pointsAmount: number;

  /**
   * Patient ID field reference
   */
  patientIdField: string;

  /**
   * Source of points
   */
  source: LoyaltyPointSource;

  /**
   * Description for transaction
   */
  description: string;

  /**
   * Optional expiry date for points
   */
  expiresAt?: Date | string;

  /**
   * Reference to related entity
   */
  referenceEntity?: {
    entityType: string;
    entityIdField: string;
  };

  /**
   * Send notification to patient
   */
  notifyPatient?: boolean;
}

/**
 * Discount Action Configuration
 *
 * Create discount code or apply discount to invoice
 *
 * Dental Practice Examples:
 * - Birthday discount
 * - Referral discount
 * - Loyalty tier discount
 * - Promotional campaign discount
 *
 * Financial Control Note:
 * - Require approval for discounts > threshold
 * - Log all discounts for accounting audit
 * - Verify discount eligibility
 */
export interface DiscountActionConfig {
  /**
   * Discount type
   */
  discountType: DiscountType;

  /**
   * Discount amount
   * Percentage: 0-100
   * Fixed: Dollar amount
   */
  amount: number;

  /**
   * Apply to specific invoice
   */
  invoiceIdField?: string;

  /**
   * Or create discount code for patient
   */
  patientIdField?: string;

  /**
   * Discount code (if creating new code)
   */
  code?: string;

  /**
   * Discount description
   */
  description: string;

  /**
   * Expiry date
   */
  expiresAt?: Date | string;

  /**
   * Minimum purchase amount
   */
  minPurchaseAmount?: number;

  /**
   * Maximum discount amount (for percentage discounts)
   */
  maxDiscountAmount?: number;

  /**
   * Applicable service codes
   */
  applicableServiceCodes?: string[];

  /**
   * Require approval
   */
  requiresApproval?: boolean;

  /**
   * Approval role
   */
  approvalRole?: string;
}

/**
 * Credit Note Action Configuration
 *
 * Create credit note for refund or adjustment
 *
 * Dental Practice Examples:
 * - Insurance overpayment refund
 * - Service adjustment
 * - Promotional credit
 *
 * Financial Control Note:
 * - Require approval for credits > threshold
 * - Log all credits for accounting audit
 * - Update invoice status accordingly
 */
export interface CreditNoteActionConfig {
  /**
   * Invoice ID field reference
   */
  invoiceIdField: string;

  /**
   * Credit amount
   */
  amount: number;

  /**
   * Reason code
   */
  reasonCode: string;

  /**
   * Reason description
   */
  description: string;

  /**
   * Refund method
   */
  refundMethod?: 'original_payment_method' | 'check' | 'credit_to_account';

  /**
   * Require approval
   */
  requiresApproval?: boolean;

  /**
   * Approval role
   */
  approvalRole?: string;

  /**
   * Send notification to patient
   */
  notifyPatient?: boolean;
}

/**
 * Patient Flag Action Configuration
 *
 * Flag patient record for staff review
 *
 * Dental Practice Examples:
 * - Flag high-risk patients (medical conditions)
 * - Flag overdue payments
 * - Flag missed appointments
 * - Flag for treatment plan review
 *
 * Clinical Safety Note:
 * - Flags must be reviewed before next appointment
 * - Critical flags should trigger alerts
 */
export interface PatientFlagActionConfig {
  /**
   * Patient ID field reference
   */
  patientIdField: string;

  /**
   * Flag type/category
   */
  flagType: string;

  /**
   * Flag priority
   */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /**
   * Flag description
   */
  description: string;

  /**
   * Auto-resolve flag after date
   */
  expiresAt?: Date | string;

  /**
   * Require acknowledgment by role
   */
  requiresAcknowledgment?: boolean;
  acknowledgmentRoles?: string[];

  /**
   * Send alert to specific roles
   */
  alertRoles?: string[];

  /**
   * Related entity
   */
  relatedEntity?: {
    entityType: string;
    entityIdField: string;
  };
}

/**
 * Update Patient Field Action Configuration
 *
 * Update specific field in patient record
 *
 * Dental Practice Examples:
 * - Update patient status based on activity
 * - Update patient tags based on behavior
 * - Update marketing preferences
 *
 * HIPAA Compliance Note:
 * - Log all patient record updates
 * - Restrict which fields can be auto-updated
 * - Require audit trail
 */
export interface UpdatePatientFieldActionConfig {
  /**
   * Patient ID field reference
   */
  patientIdField: string;

  /**
   * Field to update
   * Dot-notation path
   */
  fieldPath: string;

  /**
   * New value
   * Can be static or field reference
   */
  value: any;

  /**
   * Whether value is field reference
   */
  isFieldReference?: boolean;

  /**
   * Reason for update (for audit trail)
   */
  reason: string;

  /**
   * Only update if current value matches condition
   */
  condition?: AutomationCondition;
}

/**
 * Webhook Action Configuration
 *
 * Call external HTTP endpoint
 *
 * Dental Practice Examples:
 * - Send data to insurance eligibility API
 * - Notify external lab system of new order
 * - Sync to accounting software
 * - Update marketing platform
 *
 * Security Note:
 * - Whitelist allowed webhook URLs
 * - Use API keys/authentication
 * - Implement rate limiting
 * - Log all webhook calls
 */
export interface WebhookActionConfig {
  /**
   * Webhook URL
   */
  url: string;

  /**
   * HTTP method
   */
  method: HttpMethod;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Request body
   * Can include field references using template syntax
   */
  body?: Record<string, any> | string;

  /**
   * Authentication config
   */
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key';
    token?: string;
    username?: string;
    password?: string;
    apiKeyHeader?: string;
    apiKeyValue?: string;
  };

  /**
   * Timeout in milliseconds
   */
  timeout?: number;

  /**
   * Expected success status codes
   */
  successStatusCodes?: number[];

  /**
   * Whether to retry on failure
   */
  retryOnFailure?: boolean;

  /**
   * Maximum retries
   */
  maxRetries?: number;
}

/**
 * Event Action Configuration
 *
 * Emit domain event to trigger downstream workflows
 *
 * Dental Practice Examples:
 * - Emit "patient.high_value.identified" to trigger VIP workflow
 * - Emit "invoice.payment.received" to trigger thank you email
 * - Emit "appointment.completed" to trigger post-visit survey
 */
export interface EventActionConfig {
  /**
   * Event type to emit
   */
  eventType: EventType;

  /**
   * Event payload template
   * Can include field references
   */
  payloadTemplate: Record<string, any>;

  /**
   * Target service to receive event
   */
  targetService?: ServiceName;

  /**
   * Event priority
   */
  priority?: WorkflowRunPriority;
}

/**
 * Wait/Delay Action Configuration
 *
 * Pause workflow execution
 *
 * Dental Practice Examples:
 * - Wait 24 hours before sending follow-up
 * - Wait until specific date/time
 * - Wait for external condition
 */
export interface WaitDelayActionConfig {
  /**
   * Delay type
   */
  delayType: 'fixed_duration' | 'until_date' | 'until_condition';

  /**
   * Fixed duration in milliseconds
   */
  durationMs?: number;

  /**
   * Wait until specific date
   * Can be field reference
   */
  untilDate?: Date | string;

  /**
   * Wait until condition is met
   * Periodically check condition
   */
  untilCondition?: AutomationCondition;

  /**
   * Check interval for condition (milliseconds)
   */
  checkIntervalMs?: number;

  /**
   * Maximum wait time (milliseconds)
   */
  maxWaitMs?: number;
}

/**
 * Conditional Branch Action Configuration
 *
 * Execute different actions based on condition
 *
 * Dental Practice Example:
 * If invoice amount > $500:
 *   Send detailed invoice email
 * Else:
 *   Send simple invoice SMS
 */
export interface ConditionalBranchActionConfig {
  /**
   * Condition to evaluate
   */
  condition: AutomationCondition | ConditionGroup;

  /**
   * Actions to execute if condition is true
   */
  ifTrueActions: AutomationAction[];

  /**
   * Actions to execute if condition is false
   */
  ifFalseActions?: AutomationAction[];
}

/**
 * Parallel Actions Configuration
 *
 * Execute multiple actions simultaneously
 *
 * Dental Practice Example:
 * When appointment confirmed:
 * - Send email confirmation (parallel)
 * - Send SMS confirmation (parallel)
 * - Update calendar (parallel)
 * - Create reminder task (parallel)
 */
export interface ParallelActionsConfig {
  /**
   * Actions to execute in parallel
   */
  actions: AutomationAction[];

  /**
   * Whether to wait for all actions to complete
   */
  waitForAll: boolean;

  /**
   * Continue workflow if some actions fail
   */
  continueOnPartialFailure?: boolean;

  /**
   * Minimum number of successful actions required
   */
  minSuccessfulActions?: number;
}

/**
 * Loop Action Configuration
 *
 * Iterate over collection and execute actions for each item
 *
 * Dental Practice Example:
 * For each patient with birthday today:
 * - Send birthday email
 * - Apply loyalty bonus points
 */
export interface LoopActionConfig {
  /**
   * Field reference to array
   */
  collectionField: string;

  /**
   * Variable name for loop item
   */
  itemVariable: string;

  /**
   * Actions to execute for each item
   */
  actions: AutomationAction[];

  /**
   * Maximum iterations (safety limit)
   */
  maxIterations?: number;

  /**
   * Execute iterations in parallel
   */
  parallel?: boolean;

  /**
   * Continue loop if iteration fails
   */
  continueOnFailure?: boolean;
}

/**
 * Clinical Note Action Configuration
 *
 * Create clinical note in patient chart
 *
 * Dental Practice Examples:
 * - Document automated appointment reminder sent
 * - Document treatment plan email sent
 * - Document post-operative instructions provided
 *
 * HIPAA Compliance Note:
 * - All automated actions affecting patient care must be documented
 * - Include automation workflow ID for audit trail
 */
export interface ClinicalNoteActionConfig {
  /**
   * Patient ID field reference
   */
  patientIdField: string;

  /**
   * Note type
   */
  noteType: string;

  /**
   * Note content/body
   */
  content: string;

  /**
   * Related appointment ID
   */
  appointmentIdField?: string;

  /**
   * Related treatment plan ID
   */
  treatmentPlanIdField?: string;

  /**
   * Provider ID for note attribution
   */
  providerIdField?: string;

  /**
   * Note template ID
   */
  templateId?: TemplateId;

  /**
   * Template variables
   */
  variables?: Record<string, any>;

  /**
   * Note tags
   */
  tags?: string[];
}

/**
 * External API Call Action Configuration
 *
 * Call external service API
 *
 * Dental Practice Examples:
 * - Verify insurance eligibility
 * - Submit lab order
 * - Check drug interactions
 * - Verify patient identity
 */
export interface ExternalApiCallActionConfig {
  /**
   * API endpoint URL
   */
  url: string;

  /**
   * HTTP method
   */
  method: HttpMethod;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Request body
   */
  body?: Record<string, any> | string;

  /**
   * Authentication config
   */
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key' | 'oauth2';
    token?: string;
    username?: string;
    password?: string;
    apiKeyHeader?: string;
    apiKeyValue?: string;
    oauth2Config?: {
      tokenUrl: string;
      clientId: string;
      clientSecret: string;
      scope?: string;
    };
  };

  /**
   * Response mapping
   * Map API response to execution context variables
   */
  responseMapping?: Record<string, string>;

  /**
   * Error handling
   */
  errorHandling?: {
    retryOnStatusCodes?: number[];
    fallbackResponse?: any;
  };

  /**
   * Timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Automation Action Union Type
 *
 * Discriminated union based on action type
 */
export interface AutomationAction {
  /**
   * Unique identifier for action
   */
  id?: string;

  /**
   * Action type discriminator
   */
  type: ActionType;

  /**
   * Type-specific configuration
   */
  config:
    | EmailActionConfig
    | SmsActionConfig
    | PushNotificationActionConfig
    | TaskActionConfig
    | AppointmentActionConfig
    | LoyaltyActionConfig
    | DiscountActionConfig
    | CreditNoteActionConfig
    | PatientFlagActionConfig
    | UpdatePatientFieldActionConfig
    | WebhookActionConfig
    | EventActionConfig
    | WaitDelayActionConfig
    | ConditionalBranchActionConfig
    | ParallelActionsConfig
    | LoopActionConfig
    | ClinicalNoteActionConfig
    | ExternalApiCallActionConfig;

  /**
   * Human-readable action description
   */
  description?: string;

  /**
   * Conditions that must be met for action to execute
   * Evaluated at action runtime (not workflow trigger time)
   */
  conditions?: AutomationCondition[];

  /**
   * Retry policy for this action
   * Overrides workflow-level retry policy
   */
  retryPolicy?: RetryPolicy;

  /**
   * What to do if action fails
   */
  onFailure?: OnFailureAction;

  /**
   * Fallback workflow to run if action fails
   */
  fallbackWorkflowId?: AutomationWorkflowId;

  /**
   * Timeout for action execution (milliseconds)
   */
  timeout?: number;

  /**
   * Whether this action requires approval before execution
   */
  requiresApproval?: boolean;

  /**
   * Approval roles
   */
  approvalRoles?: string[];
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

/**
 * Retry Policy
 *
 * Defines how to retry failed actions
 *
 * Dental Practice Recommendations:
 * - External APIs: 3 retries, exponential backoff
 * - Internal services: 2 retries, linear backoff
 * - Email sends: 5 retries, exponential backoff
 * - SMS sends: 3 retries, exponential backoff
 */
export interface RetryPolicy {
  /**
   * Maximum number of retry attempts
   */
  maxRetries: number;

  /**
   * Backoff strategy
   */
  backoffStrategy: BackoffStrategy;

  /**
   * Initial delay before first retry (milliseconds)
   */
  initialDelayMs: number;

  /**
   * Backoff multiplier for exponential/linear strategies
   */
  backoffMultiplier?: number;

  /**
   * Maximum delay between retries (milliseconds)
   */
  maxDelayMs?: number;

  /**
   * Whether to retry on specific error types only
   */
  retryOnErrorTypes?: string[];

  /**
   * Whether to retry on timeout
   */
  retryOnTimeout?: boolean;
}

/**
 * Error Handling Policy
 *
 * Defines workflow-level error handling
 */
export interface ErrorHandlingPolicy {
  /**
   * Default retry policy for all actions
   */
  defaultRetryPolicy?: RetryPolicy;

  /**
   * What to do when action fails after retries
   */
  onFailure: OnFailureAction;

  /**
   * Fallback workflow to run on failure
   */
  fallbackWorkflowId?: AutomationWorkflowId;

  /**
   * Alert recipients on failure
   */
  alertRecipients?: string[];

  /**
   * Alert channels
   */
  alertChannels?: ('email' | 'sms' | 'in_app')[];

  /**
   * Continue workflow execution even if non-critical actions fail
   */
  continueOnNonCriticalFailure?: boolean;

  /**
   * Which actions are critical
   * Critical action failures stop workflow
   */
  criticalActions?: string[]; // Action IDs
}

// =============================================================================
// EXECUTION CONTEXT TYPES
// =============================================================================

/**
 * Execution Context
 *
 * Data available during workflow execution
 * Contains all data needed to evaluate conditions and execute actions
 */
export interface ExecutionContext {
  /**
   * Unique execution context ID
   */
  contextId: string;

  /**
   * Tenant context
   */
  tenantId: string;
  organizationId: string;
  clinicId: string;

  /**
   * Triggering event (if event-triggered)
   */
  event?: EventContext;

  /**
   * Manual trigger input (if manual-triggered)
   */
  manualInput?: Record<string, any>;

  /**
   * Patient context (if applicable)
   */
  patient?: PatientContext;

  /**
   * Invoice context (if applicable)
   */
  invoice?: InvoiceContext;

  /**
   * Appointment context (if applicable)
   */
  appointment?: AppointmentContext;

  /**
   * Loyalty context (if applicable)
   */
  loyalty?: LoyaltyContext;

  /**
   * Treatment plan context (if applicable)
   */
  treatmentPlan?: TreatmentPlanContext;

  /**
   * Custom variables set during workflow execution
   */
  variables?: Record<string, any>;

  /**
   * Execution metadata
   */
  metadata: {
    workflowId: AutomationWorkflowId;
    workflowRunId: WorkflowRunId;
    startedAt: Date;
    executedBy?: string; // User ID for manual triggers
  };
}

/**
 * Event Context
 *
 * Original triggering event data
 */
export interface EventContext {
  /**
   * Event ID (for idempotency)
   */
  eventId: string;

  /**
   * Event type
   */
  eventType: EventType;

  /**
   * Source service
   */
  sourceService: ServiceName;

  /**
   * Event timestamp
   */
  timestamp: Date;

  /**
   * Event payload
   */
  payload: Record<string, any>;

  /**
   * Event metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Patient Context
 *
 * Patient data fetched from Patient service
 */
export interface PatientContext {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  age?: number;
  gender?: string;
  status?: string;
  insuranceStatus?: string;
  tags?: string[];
  createdAt: Date;
  lastVisitDate?: Date;
  nextAppointmentDate?: Date;
  emailConsent?: boolean;
  smsConsent?: boolean;
  marketingConsent?: boolean;
  lifetimeValue?: number;
  [key: string]: any;
}

/**
 * Invoice Context
 *
 * Invoice data fetched from Billing service
 */
export interface InvoiceContext {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
  amountDue: number;
  amountPaid: number;
  dueDate?: Date;
  daysOverdue?: number;
  paymentStatus: string;
  patientId: string;
  createdAt: Date;
  [key: string]: any;
}

/**
 * Appointment Context
 *
 * Appointment data fetched from Scheduling service
 */
export interface AppointmentContext {
  id: string;
  status: string;
  type: string;
  date: Date;
  startTime: string;
  endTime: string;
  providerId: string;
  providerName?: string;
  patientId: string;
  serviceCode?: string;
  serviceName?: string;
  isFirstVisit?: boolean;
  operatoryId?: string;
  createdAt: Date;
  [key: string]: any;
}

/**
 * Loyalty Context
 *
 * Loyalty data fetched from Marketing service
 */
export interface LoyaltyContext {
  patientId: string;
  pointsBalance: number;
  tier?: string;
  lifetimePoints: number;
  pointsExpiringSoon?: number;
  expiryDate?: Date;
  [key: string]: any;
}

/**
 * Treatment Plan Context
 *
 * Treatment plan data fetched from Clinical service
 */
export interface TreatmentPlanContext {
  id: string;
  status: string;
  totalCost: number;
  acceptanceStatus?: string;
  patientId: string;
  providerId: string;
  createdAt: Date;
  [key: string]: any;
}

// =============================================================================
// WORKFLOW TYPES
// =============================================================================

/**
 * Automation Workflow
 *
 * Complete workflow definition
 *
 * Dental Practice Note:
 * - Each workflow should have single, clear purpose
 * - Test workflows in DRAFT status before activating
 * - Monitor metrics to optimize workflow performance
 * - Maintain audit trail for compliance
 */
export interface AutomationWorkflow {
  /**
   * Workflow ID
   */
  id: AutomationWorkflowId;

  /**
   * Workflow name (unique within tenant)
   */
  name: WorkflowName;

  /**
   * Workflow description
   */
  description?: string;

  /**
   * Workflow status
   */
  status: WorkflowStatus;

  /**
   * Multi-tenant context
   */
  tenantId: string;
  organizationId: string;

  /**
   * Clinic IDs this workflow applies to
   * Empty array = applies to all clinics in organization
   */
  clinicIds: string[];

  /**
   * Workflow trigger
   */
  trigger: AutomationTrigger;

  /**
   * Pre-conditions that must be met for workflow to execute
   * Evaluated before any actions run
   */
  conditions?: ConditionGroup;

  /**
   * Actions to execute
   * Executed sequentially unless using PARALLEL_ACTIONS
   */
  actions: AutomationAction[];

  /**
   * Error handling policy
   */
  errorHandling: ErrorHandlingPolicy;

  /**
   * Maximum execution time (milliseconds)
   * Workflow times out if exceeded
   */
  maxExecutionTimeMs: number;

  /**
   * Priority for workflow execution
   */
  priority: WorkflowRunPriority;

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Workflow category
   */
  category?: string;

  /**
   * Whether workflow is system-defined or user-defined
   */
  isSystemWorkflow: boolean;

  /**
   * Workflow version (for versioning changes)
   */
  version: number;

  /**
   * Previous version ID (if updated)
   */
  previousVersionId?: AutomationWorkflowId;

  /**
   * Metadata
   */
  metadata?: Record<string, any>;

  /**
   * Audit fields
   */
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;

  /**
   * Activation dates
   */
  activatedAt?: Date;
  deactivatedAt?: Date;
  archivedAt?: Date;
}

/**
 * Workflow Run
 *
 * Execution instance of workflow
 *
 * Dental Practice Note:
 * - All workflow runs must be logged for compliance
 * - Failed runs require review and resolution
 * - Monitor run metrics for performance optimization
 */
export interface WorkflowRun {
  /**
   * Workflow run ID
   */
  id: WorkflowRunId;

  /**
   * Workflow ID
   */
  workflowId: AutomationWorkflowId;

  /**
   * Workflow name (denormalized for reporting)
   */
  workflowName: string;

  /**
   * Workflow version at time of execution
   */
  workflowVersion: number;

  /**
   * Run status
   */
  status: WorkflowRunStatus;

  /**
   * Multi-tenant context
   */
  tenantId: string;
  organizationId: string;
  clinicId: string;

  /**
   * Trigger that caused this run
   */
  trigger: {
    type: TriggerType;
    eventId?: string; // For event triggers
    scheduledTime?: Date; // For schedule triggers
    executedBy?: string; // For manual triggers
  };

  /**
   * Idempotency key to prevent duplicate runs
   */
  idempotencyKey?: IdempotencyKey;

  /**
   * Execution context
   */
  context: ExecutionContext;

  /**
   * Action runs
   */
  actionRuns: ActionRun[];

  /**
   * Priority
   */
  priority: WorkflowRunPriority;

  /**
   * Execution timing
   */
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;

  /**
   * Error information (if failed)
   */
  error?: {
    message: string;
    code: string;
    details?: any;
    stackTrace?: string;
  };

  /**
   * Cancellation reason (if cancelled)
   */
  cancellationReason?: string;
  cancelledBy?: string;

  /**
   * Logs
   */
  logs: WorkflowRunLog[];

  /**
   * Metadata
   */
  metadata?: Record<string, any>;

  /**
   * Audit fields
   */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Action Run
 *
 * Execution instance of individual action
 */
export interface ActionRun {
  /**
   * Action run ID
   */
  id: ActionRunId;

  /**
   * Action ID from workflow definition
   */
  actionId: string;

  /**
   * Action type
   */
  actionType: ActionType;

  /**
   * Action description
   */
  description?: string;

  /**
   * Run status
   */
  status: ActionRunStatus;

  /**
   * Execution timing
   */
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;

  /**
   * Input data
   */
  input?: any;

  /**
   * Output data
   */
  output?: any;

  /**
   * Error information (if failed)
   */
  error?: {
    message: string;
    code: string;
    details?: any;
    stackTrace?: string;
  };

  /**
   * Retry information
   */
  retryAttempts: number;
  maxRetries: number;
  nextRetryAt?: Date;

  /**
   * Skip reason (if skipped)
   */
  skipReason?: string;

  /**
   * Logs
   */
  logs: ActionRunLog[];

  /**
   * Metadata
   */
  metadata?: Record<string, any>;

  /**
   * Audit fields
   */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow Run Log
 *
 * Log entry for workflow execution
 */
export interface WorkflowRunLog {
  /**
   * Log ID
   */
  id: string;

  /**
   * Log timestamp
   */
  timestamp: Date;

  /**
   * Log level
   */
  level: LogLevel;

  /**
   * Log message
   */
  message: string;

  /**
   * Additional context
   */
  context?: Record<string, any>;

  /**
   * Related action run ID (if applicable)
   */
  actionRunId?: ActionRunId;
}

/**
 * Action Run Log
 *
 * Log entry for action execution
 */
export interface ActionRunLog {
  /**
   * Log ID
   */
  id: string;

  /**
   * Log timestamp
   */
  timestamp: Date;

  /**
   * Log level
   */
  level: LogLevel;

  /**
   * Log message
   */
  message: string;

  /**
   * Additional context
   */
  context?: Record<string, any>;
}

// =============================================================================
// METRICS AND MONITORING TYPES
// =============================================================================

/**
 * Workflow Metrics
 *
 * Aggregated metrics for workflow performance
 */
export interface WorkflowMetrics {
  /**
   * Workflow ID
   */
  workflowId: AutomationWorkflowId;

  /**
   * Workflow name
   */
  workflowName: string;

  /**
   * Multi-tenant context
   */
  tenantId: string;
  organizationId: string;
  clinicId?: string;

  /**
   * Time period for metrics
   */
  periodStart: Date;
  periodEnd: Date;

  /**
   * Execution metrics
   */
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  cancelledRuns: number;
  timedOutRuns: number;

  /**
   * Success rate (0-100)
   */
  successRate: number;

  /**
   * Timing metrics
   */
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  p50DurationMs: number;
  p95DurationMs: number;
  p99DurationMs: number;

  /**
   * Action metrics
   */
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  retriedActions: number;

  /**
   * Action type breakdown
   */
  actionTypeBreakdown: Record<ActionType, number>;

  /**
   * Error breakdown
   */
  errorBreakdown: Record<string, number>;

  /**
   * Last execution
   */
  lastExecutedAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;

  /**
   * Audit fields
   */
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Action Metrics
 *
 * Aggregated metrics for action performance
 */
export interface ActionMetrics {
  /**
   * Workflow ID
   */
  workflowId: AutomationWorkflowId;

  /**
   * Action ID
   */
  actionId: string;

  /**
   * Action type
   */
  actionType: ActionType;

  /**
   * Multi-tenant context
   */
  tenantId: string;
  organizationId: string;

  /**
   * Time period for metrics
   */
  periodStart: Date;
  periodEnd: Date;

  /**
   * Execution metrics
   */
  executionCount: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;

  /**
   * Success rate (0-100)
   */
  successRate: number;

  /**
   * Timing metrics
   */
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;

  /**
   * Retry metrics
   */
  totalRetries: number;
  avgRetries: number;
  maxRetries: number;

  /**
   * Error breakdown
   */
  errorBreakdown: Record<string, number>;

  /**
   * Audit fields
   */
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Workflow Validation Result
 *
 * Result of workflow configuration validation
 */
export interface WorkflowValidationResult {
  /**
   * Whether workflow is valid
   */
  isValid: boolean;

  /**
   * Validation errors (blocking)
   */
  errors: ValidationError[];

  /**
   * Validation warnings (non-blocking)
   */
  warnings: ValidationWarning[];

  /**
   * Validated at
   */
  validatedAt: Date;
}

/**
 * Validation Error
 *
 * Blocking validation error
 */
export interface ValidationError {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Field path that caused error
   */
  field?: string;

  /**
   * Additional details
   */
  details?: any;
}

/**
 * Validation Warning
 *
 * Non-blocking validation warning
 */
export interface ValidationWarning {
  /**
   * Warning code
   */
  code: string;

  /**
   * Warning message
   */
  message: string;

  /**
   * Field path
   */
  field?: string;

  /**
   * Suggested fix
   */
  suggestion?: string;

  /**
   * Additional details
   */
  details?: any;
}

/**
 * Condition Validation Error
 *
 * Error in condition configuration
 */
export interface ConditionValidationError extends ValidationError {
  /**
   * Invalid field
   */
  invalidField?: ConditionField | string;

  /**
   * Invalid operator
   */
  invalidOperator?: ConditionOperator;

  /**
   * Expected type
   */
  expectedType?: string;

  /**
   * Actual type
   */
  actualType?: string;
}

/**
 * Action Validation Error
 *
 * Error in action configuration
 */
export interface ActionValidationError extends ValidationError {
  /**
   * Action ID
   */
  actionId?: string;

  /**
   * Action type
   */
  actionType?: ActionType;

  /**
   * Missing configuration fields
   */
  missingFields?: string[];

  /**
   * Invalid service call
   */
  invalidServiceCall?: string;
}

// =============================================================================
// SCHEDULE TYPES
// =============================================================================

/**
 * Schedule Configuration
 *
 * Base interface for schedule configurations
 */
export interface ScheduleConfig {
  /**
   * Schedule type
   */
  type: 'cron' | 'fixed_interval' | 'fixed_delay';

  /**
   * Timezone
   */
  timezone: string;

  /**
   * Schedule start date
   */
  startAt?: Date;

  /**
   * Schedule end date
   */
  endAt?: Date;
}

/**
 * Cron Schedule
 *
 * Cron-based schedule
 */
export interface CronSchedule extends ScheduleConfig {
  type: 'cron';

  /**
   * Cron expression
   */
  cronExpression: string;
}

/**
 * Fixed Interval Schedule
 *
 * Execute at fixed intervals
 */
export interface FixedIntervalSchedule extends ScheduleConfig {
  type: 'fixed_interval';

  /**
   * Interval in milliseconds
   */
  intervalMs: number;
}

/**
 * Fixed Delay Schedule
 *
 * Wait fixed delay after event before executing
 */
export interface FixedDelaySchedule extends ScheduleConfig {
  type: 'fixed_delay';

  /**
   * Delay in milliseconds
   */
  delayMs: number;

  /**
   * Event to wait for
   */
  afterEvent: EventType;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Workflow Template
 *
 * Pre-configured workflow template for common use cases
 */
export interface WorkflowTemplate {
  /**
   * Template ID
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description: string;

  /**
   * Template category
   */
  category: string;

  /**
   * Workflow configuration
   */
  workflow: Omit<AutomationWorkflow, 'id' | 'tenantId' | 'organizationId' | 'clinicIds' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

  /**
   * Required configuration from user
   */
  requiredConfig?: string[];

  /**
   * Whether template is system-provided
   */
  isSystem: boolean;
}

/**
 * Workflow Import/Export Format
 *
 * JSON format for importing/exporting workflows
 */
export interface WorkflowExport {
  /**
   * Export format version
   */
  version: string;

  /**
   * Exported at
   */
  exportedAt: Date;

  /**
   * Exported by
   */
  exportedBy: string;

  /**
   * Workflow data
   */
  workflow: Omit<AutomationWorkflow, 'id' | 'tenantId' | 'organizationId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

  /**
   * Metadata
   */
  metadata?: Record<string, any>;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Type guard for AutomationWorkflowId
 */
export function isAutomationWorkflowId(value: any): value is AutomationWorkflowId {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type guard for WorkflowRunId
 */
export function isWorkflowRunId(value: any): value is WorkflowRunId {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type guard for ActionRunId
 */
export function isActionRunId(value: any): value is ActionRunId {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type guard for EventType
 */
export function isEventType(value: any): value is EventType {
  return typeof value === 'string' && /^[a-z-]+\.[a-z-]+\.[a-z-]+$/.test(value);
}

/**
 * Type guard for IdempotencyKey
 */
export function isIdempotencyKey(value: any): value is IdempotencyKey {
  return typeof value === 'string' && value.split(':').length >= 3;
}
