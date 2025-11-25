/**
 * Automation Events
 *
 * Domain events for the automation engine covering workflow lifecycle, execution,
 * actions, conditions, triggers, retries, errors, monitoring, idempotency, and integrations.
 *
 * These events are consumed by:
 * - Feature 10 (AI Engine): Optimize workflow performance based on execution patterns
 * - Analytics Service: Track automation effectiveness, success rates, and trends
 * - Monitoring/Alerting Systems: Detect operational issues and performance degradation
 * - Audit Systems: Compliance tracking and troubleshooting automation runs
 * - Marketing Service: Trigger downstream marketing actions
 *
 * Safety & Compliance:
 * - All workflow executions must be idempotent (duplicate detection required)
 * - Rate limiting enforced at patient and system levels
 * - Consent checks performed before communication actions
 * - Quiet hours respected for patient communications
 * - Loop prevention mechanisms (max runs per patient per period)
 * - Circuit breakers for external service calls
 *
 * @module shared-events/automation
 */

import type { UUID, OrganizationId, ClinicId, TenantId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientId } from '@dentalos/shared-domain';

// ============================================================================
// BRANDED TYPES FOR AUTOMATION DOMAIN
// ============================================================================

/**
 * Unique identifier for an automation workflow
 */
export type AutomationWorkflowId = UUID & { readonly __brand: 'AutomationWorkflowId' };

/**
 * Unique identifier for a workflow run (execution instance)
 */
export type WorkflowRunId = UUID & { readonly __brand: 'WorkflowRunId' };

/**
 * Unique identifier for an action run (individual action execution)
 */
export type ActionRunId = UUID & { readonly __brand: 'ActionRunId' };

/**
 * Unique identifier for a user
 */
export type UserId = UUID & { readonly __brand: 'UserId' };

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Workflow trigger type enumeration
 */
export type WorkflowTriggerType =
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_NO_SHOW'
  | 'TREATMENT_PLAN_CREATED'
  | 'TREATMENT_PLAN_APPROVED'
  | 'PROCEDURE_COMPLETED'
  | 'INVOICE_CREATED'
  | 'INVOICE_PAID'
  | 'INVOICE_OVERDUE'
  | 'PATIENT_CREATED'
  | 'PATIENT_BIRTHDAY'
  | 'PATIENT_ANNIVERSARY'
  | 'PATIENT_INACTIVE'
  | 'SEGMENT_MEMBERSHIP_CHANGED'
  | 'FEEDBACK_RECEIVED'
  | 'NPS_SCORE_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'LOYALTY_POINTS_EARNED'
  | 'LOYALTY_TIER_CHANGED'
  | 'REFERRAL_COMPLETED'
  | 'RECALL_OVERDUE'
  | 'SCHEDULED_TIME'
  | 'WEBHOOK_RECEIVED'
  | 'CUSTOM_EVENT';

/**
 * Workflow action type enumeration
 */
export type WorkflowActionType =
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'SEND_PUSH_NOTIFICATION'
  | 'SEND_WHATSAPP'
  | 'CREATE_TASK'
  | 'UPDATE_PATIENT_FIELD'
  | 'ADD_PATIENT_TAG'
  | 'REMOVE_PATIENT_TAG'
  | 'ADD_TO_SEGMENT'
  | 'REMOVE_FROM_SEGMENT'
  | 'ACCRUE_LOYALTY_POINTS'
  | 'CREATE_REFERRAL'
  | 'TRIGGER_WORKFLOW'
  | 'WAIT_DURATION'
  | 'WAIT_UNTIL'
  | 'CONDITION_CHECK'
  | 'AI_ACTION'
  | 'CALL_WEBHOOK'
  | 'CALL_API'
  | 'EXECUTE_SCRIPT'
  | 'CREATE_APPOINTMENT'
  | 'SEND_INTERNAL_NOTIFICATION';

/**
 * Workflow status enumeration
 */
export type WorkflowStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT';

/**
 * Workflow run status enumeration
 */
export type WorkflowRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMED_OUT';

/**
 * Action run status enumeration
 */
export type ActionRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'RETRYING';

/**
 * Error type categorization
 */
export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'CONSENT_ERROR'
  | 'QUIET_HOURS_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'CONFIGURATION_ERROR'
  | 'IDEMPOTENCY_ERROR'
  | 'CONDITION_ERROR'
  | 'ACTION_ERROR'
  | 'LOOP_DETECTED'
  | 'UNKNOWN_ERROR';

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Error context for failure events
 */
export interface ErrorContext {
  /** Error type category */
  type: ErrorType;
  /** Error message */
  message: string;
  /** Error stack trace (optional, for debugging) */
  stack?: string;
  /** Error code (optional, for specific error handling) */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Retry context for retry events
 */
export interface RetryContext {
  /** Current retry attempt (1-indexed) */
  attempt: number;
  /** Maximum retry attempts allowed */
  maxRetries: number;
  /** Next retry scheduled time */
  nextRetryAt?: ISODateString;
  /** Backoff delay in milliseconds */
  backoffMs?: number;
  /** Exponential backoff multiplier */
  backoffMultiplier?: number;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  /** Execution duration in milliseconds */
  durationMs: number;
  /** Memory usage in bytes (optional) */
  memoryBytes?: number;
  /** Number of actions executed */
  actionsExecuted?: number;
  /** Number of API calls made */
  apiCallsCount?: number;
  /** Average action duration in milliseconds */
  avgActionDurationMs?: number;
}

/**
 * Change tracking for workflow updates
 */
export interface WorkflowChange {
  /** Field that changed */
  field: string;
  /** Previous value (JSON stringified) */
  previousValue?: string | number | boolean | null;
  /** New value (JSON stringified) */
  newValue?: string | number | boolean | null;
  /** Change description */
  description?: string;
}

// ============================================================================
// 1. WORKFLOW LIFECYCLE EVENTS
// ============================================================================

/**
 * Workflow created event type constant
 */
export const WORKFLOW_CREATED = 'dental.automation.workflow.created' as const;
export const WORKFLOW_CREATED_VERSION = 1;

/**
 * Workflow created event payload
 *
 * Published when a new automation workflow is created.
 * Consumed by analytics and audit systems.
 */
export interface WorkflowCreatedPayload {
  /** Unique workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name */
  name: string;

  /** Workflow description */
  description?: string;

  /** Trigger type that activates this workflow */
  triggerType: WorkflowTriggerType;

  /** Action types configured in workflow */
  actionTypes: WorkflowActionType[];

  /** Number of actions in workflow */
  actionCount: number;

  /** Workflow status */
  status: WorkflowStatus;

  /** User who created the workflow */
  createdBy: UserId;

  /** Tags for workflow organization */
  tags?: string[];

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow created event envelope
 */
export type WorkflowCreatedEvent = EventEnvelope<WorkflowCreatedPayload>;

/**
 * Workflow updated event type constant
 */
export const WORKFLOW_UPDATED = 'dental.automation.workflow.updated' as const;
export const WORKFLOW_UPDATED_VERSION = 1;

/**
 * Workflow updated event payload
 *
 * Published when workflow configuration is modified.
 * Consumed by audit systems and version control.
 */
export interface WorkflowUpdatedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (may have changed) */
  name: string;

  /** List of changes made */
  changes: WorkflowChange[];

  /** User who made the update */
  updatedBy: UserId;

  /** Update reason/notes */
  reason?: string;

  /** New status if changed */
  newStatus?: WorkflowStatus;

  /** Previous status if changed */
  previousStatus?: WorkflowStatus;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow updated event envelope
 */
export type WorkflowUpdatedEvent = EventEnvelope<WorkflowUpdatedPayload>;

/**
 * Workflow activated event type constant
 */
export const WORKFLOW_ACTIVATED = 'dental.automation.workflow.activated' as const;
export const WORKFLOW_ACTIVATED_VERSION = 1;

/**
 * Workflow activated event payload
 *
 * Published when a workflow is activated/enabled.
 * Consumed by automation engine to start monitoring triggers.
 */
export interface WorkflowActivatedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name */
  name: string;

  /** Trigger type */
  triggerType: WorkflowTriggerType;

  /** User who activated the workflow */
  activatedBy: UserId;

  /** Activation reason/notes */
  reason?: string;

  /** Estimated trigger frequency (triggers per day) */
  estimatedFrequency?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow activated event envelope
 */
export type WorkflowActivatedEvent = EventEnvelope<WorkflowActivatedPayload>;

/**
 * Workflow deactivated event type constant
 */
export const WORKFLOW_DEACTIVATED = 'dental.automation.workflow.deactivated' as const;
export const WORKFLOW_DEACTIVATED_VERSION = 1;

/**
 * Workflow deactivated event payload
 *
 * Published when a workflow is deactivated/disabled.
 * Consumed by automation engine to stop monitoring triggers.
 */
export interface WorkflowDeactivatedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name */
  name: string;

  /** Deactivation reason */
  reason: string;

  /** User who deactivated the workflow */
  deactivatedBy: UserId;

  /** Total runs before deactivation */
  totalRuns?: number;

  /** Success rate before deactivation */
  successRate?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow deactivated event envelope
 */
export type WorkflowDeactivatedEvent = EventEnvelope<WorkflowDeactivatedPayload>;

/**
 * Workflow deleted event type constant
 */
export const WORKFLOW_DELETED = 'dental.automation.workflow.deleted' as const;
export const WORKFLOW_DELETED_VERSION = 1;

/**
 * Workflow deleted event payload
 *
 * Published when a workflow is permanently deleted.
 * Consumed by cleanup systems and audit logs.
 */
export interface WorkflowDeletedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name */
  name: string;

  /** User who deleted the workflow */
  deletedBy: UserId;

  /** Deletion reason */
  reason?: string;

  /** Total lifetime runs */
  totalLifetimeRuns?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow deleted event envelope
 */
export type WorkflowDeletedEvent = EventEnvelope<WorkflowDeletedPayload>;

// ============================================================================
// 2. WORKFLOW EXECUTION EVENTS
// ============================================================================

/**
 * Workflow run started event type constant
 */
export const WORKFLOW_RUN_STARTED = 'dental.automation.workflow.run.started' as const;
export const WORKFLOW_RUN_STARTED_VERSION = 1;

/**
 * Workflow run started event payload
 *
 * Published when a workflow execution begins.
 * Critical for monitoring active runs and detecting stalls.
 */
export interface WorkflowRunStartedPayload {
  /** Unique workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Trigger event that started this run */
  triggerEvent: string;

  /** Trigger event payload */
  triggerPayload: Record<string, unknown>;

  /** Idempotency key for duplicate detection */
  idempotencyKey: string;

  /** Patient this run is for (if applicable) */
  patientId?: PatientId;

  /** Estimated action count */
  estimatedActionCount: number;

  /** Estimated duration (milliseconds) */
  estimatedDurationMs?: number;

  /** Run started at timestamp */
  startedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow run started event envelope
 */
export type WorkflowRunStartedEvent = EventEnvelope<WorkflowRunStartedPayload>;

/**
 * Workflow run completed event type constant
 */
export const WORKFLOW_RUN_COMPLETED = 'dental.automation.workflow.run.completed' as const;
export const WORKFLOW_RUN_COMPLETED_VERSION = 1;

/**
 * Workflow run completed event payload
 *
 * Published when a workflow execution completes successfully.
 * Critical for performance tracking and success metrics.
 */
export interface WorkflowRunCompletedPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Patient this run was for (if applicable) */
  patientId?: PatientId;

  /** Execution duration (milliseconds) */
  duration: number;

  /** Number of actions executed */
  actionsExecuted: number;

  /** Number of actions succeeded */
  actionsSucceeded: number;

  /** Number of actions failed */
  actionsFailed: number;

  /** Number of actions skipped */
  actionsSkipped: number;

  /** Performance metrics */
  performanceMetrics: PerformanceMetrics;

  /** Run completed at timestamp */
  completedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow run completed event envelope
 */
export type WorkflowRunCompletedEvent = EventEnvelope<WorkflowRunCompletedPayload>;

/**
 * Workflow run failed event type constant
 */
export const WORKFLOW_RUN_FAILED = 'dental.automation.workflow.run.failed' as const;
export const WORKFLOW_RUN_FAILED_VERSION = 1;

/**
 * Workflow run failed event payload
 *
 * Published when a workflow execution fails.
 * CRITICAL for alerting and operational monitoring.
 */
export interface WorkflowRunFailedPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Patient this run was for (if applicable) */
  patientId?: PatientId;

  /** Error details */
  error: ErrorContext;

  /** Action that caused failure (if applicable) */
  failedActionId?: ActionRunId;

  /** Failed action type (if applicable) */
  failedActionType?: WorkflowActionType;

  /** Execution duration before failure (milliseconds) */
  duration?: number;

  /** Whether retry will be attempted */
  willRetry: boolean;

  /** Retry context (if retry will be attempted) */
  retryContext?: RetryContext;

  /** Run failed at timestamp */
  failedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow run failed event envelope
 */
export type WorkflowRunFailedEvent = EventEnvelope<WorkflowRunFailedPayload>;

/**
 * Workflow run cancelled event type constant
 */
export const WORKFLOW_RUN_CANCELLED = 'dental.automation.workflow.run.cancelled' as const;
export const WORKFLOW_RUN_CANCELLED_VERSION = 1;

/**
 * Workflow run cancelled event payload
 *
 * Published when a workflow execution is manually cancelled.
 * Used for audit and cleanup operations.
 */
export interface WorkflowRunCancelledPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Patient this run was for (if applicable) */
  patientId?: PatientId;

  /** Cancellation reason */
  reason: string;

  /** User who cancelled the run */
  cancelledBy: UserId;

  /** Execution duration before cancellation (milliseconds) */
  duration?: number;

  /** Actions completed before cancellation */
  actionsCompletedBeforeCancellation?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow run cancelled event envelope
 */
export type WorkflowRunCancelledEvent = EventEnvelope<WorkflowRunCancelledPayload>;

/**
 * Workflow run timed out event type constant
 */
export const WORKFLOW_RUN_TIMED_OUT = 'dental.automation.workflow.run.timed_out' as const;
export const WORKFLOW_RUN_TIMED_OUT_VERSION = 1;

/**
 * Workflow run timed out event payload
 *
 * Published when a workflow execution exceeds timeout limit.
 * CRITICAL for detecting performance issues and infinite loops.
 */
export interface WorkflowRunTimedOutPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Patient this run was for (if applicable) */
  patientId?: PatientId;

  /** Configured timeout (milliseconds) */
  timeout: number;

  /** Actual execution duration before timeout (milliseconds) */
  duration: number;

  /** Actions completed before timeout */
  actionsCompletedBeforeTimeout: number;

  /** Last action that was running */
  lastRunningActionType?: WorkflowActionType;

  /** Timed out at timestamp */
  timedOutAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow run timed out event envelope
 */
export type WorkflowRunTimedOutEvent = EventEnvelope<WorkflowRunTimedOutPayload>;

// ============================================================================
// 3. ACTION EXECUTION EVENTS
// ============================================================================

/**
 * Action started event type constant
 */
export const ACTION_STARTED = 'dental.automation.action.started' as const;
export const ACTION_STARTED_VERSION = 1;

/**
 * Action started event payload
 *
 * Published when an individual action begins execution.
 * Used for detailed execution tracking and debugging.
 */
export interface ActionStartedPayload {
  /** Unique action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Action configuration/parameters */
  actionConfig: Record<string, unknown>;

  /** Action order in workflow */
  actionOrder: number;

  /** Patient this action is for (if applicable) */
  patientId?: PatientId;

  /** Action started at timestamp */
  startedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action started event envelope
 */
export type ActionStartedEvent = EventEnvelope<ActionStartedPayload>;

/**
 * Action completed event type constant
 */
export const ACTION_COMPLETED = 'dental.automation.action.completed' as const;
export const ACTION_COMPLETED_VERSION = 1;

/**
 * Action completed event payload
 *
 * Published when an individual action completes successfully.
 * Critical for tracking action-level success rates.
 */
export interface ActionCompletedPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Patient this action was for (if applicable) */
  patientId?: PatientId;

  /** Action result/output */
  result: Record<string, unknown>;

  /** Execution duration (milliseconds) */
  duration: number;

  /** Action completed at timestamp */
  completedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action completed event envelope
 */
export type ActionCompletedEvent = EventEnvelope<ActionCompletedPayload>;

/**
 * Action failed event type constant
 */
export const ACTION_FAILED = 'dental.automation.action.failed' as const;
export const ACTION_FAILED_VERSION = 1;

/**
 * Action failed event payload
 *
 * Published when an individual action fails.
 * CRITICAL for action-level error tracking and alerting.
 */
export interface ActionFailedPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Patient this action was for (if applicable) */
  patientId?: PatientId;

  /** Error details */
  error: ErrorContext;

  /** Retry count for this action */
  retryCount: number;

  /** Execution duration before failure (milliseconds) */
  duration?: number;

  /** Action failed at timestamp */
  failedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action failed event envelope
 */
export type ActionFailedEvent = EventEnvelope<ActionFailedPayload>;

/**
 * Action retrying event type constant
 */
export const ACTION_RETRYING = 'dental.automation.action.retrying' as const;
export const ACTION_RETRYING_VERSION = 1;

/**
 * Action retrying event payload
 *
 * Published when an action is scheduled for retry after failure.
 * Used for monitoring retry behavior and backoff patterns.
 */
export interface ActionRetryingPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Patient this action is for (if applicable) */
  patientId?: PatientId;

  /** Current retry attempt (1-indexed) */
  retryAttempt: number;

  /** Maximum retry attempts */
  maxRetries: number;

  /** Next retry scheduled time */
  nextRetryAt: ISODateString;

  /** Backoff delay (milliseconds) */
  backoffMs: number;

  /** Previous failure reason */
  previousError?: ErrorContext;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action retrying event envelope
 */
export type ActionRetryingEvent = EventEnvelope<ActionRetryingPayload>;

/**
 * Action skipped event type constant
 */
export const ACTION_SKIPPED = 'dental.automation.action.skipped' as const;
export const ACTION_SKIPPED_VERSION = 1;

/**
 * Action skipped event payload
 *
 * Published when an action is skipped due to conditions not being met.
 * Used for understanding workflow branching logic.
 */
export interface ActionSkippedPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Patient this action was for (if applicable) */
  patientId?: PatientId;

  /** Reason for skipping */
  reason: string;

  /** Condition that was not met (if applicable) */
  conditionNotMet?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action skipped event envelope
 */
export type ActionSkippedEvent = EventEnvelope<ActionSkippedPayload>;

// ============================================================================
// 4. CONDITION EVALUATION EVENTS
// ============================================================================

/**
 * Condition evaluated event type constant
 */
export const CONDITION_EVALUATED = 'dental.automation.condition.evaluated' as const;
export const CONDITION_EVALUATED_VERSION = 1;

/**
 * Condition evaluated event payload
 *
 * Published when a workflow condition is evaluated.
 * Critical for understanding workflow branching logic.
 */
export interface ConditionEvaluatedPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Condition expression */
  conditionExpression: string;

  /** Evaluation result */
  result: boolean;

  /** Evaluated values */
  evaluatedValues?: Record<string, unknown>;

  /** Evaluation duration (milliseconds) */
  evaluationDurationMs?: number;

  /** Patient this condition was evaluated for (if applicable) */
  patientId?: PatientId;

  /** Evaluated at timestamp */
  evaluatedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Condition evaluated event envelope
 */
export type ConditionEvaluatedEvent = EventEnvelope<ConditionEvaluatedPayload>;

/**
 * Condition error event type constant
 */
export const CONDITION_ERROR = 'dental.automation.condition.error' as const;
export const CONDITION_ERROR_VERSION = 1;

/**
 * Condition error event payload
 *
 * Published when a condition evaluation fails.
 * CRITICAL for detecting malformed conditions.
 */
export interface ConditionErrorPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Condition expression that failed */
  conditionExpression: string;

  /** Error details */
  error: ErrorContext;

  /** Patient this condition was for (if applicable) */
  patientId?: PatientId;

  /** Error occurred at timestamp */
  errorAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Condition error event envelope
 */
export type ConditionErrorEvent = EventEnvelope<ConditionErrorPayload>;

// ============================================================================
// 5. TRIGGER EVENTS
// ============================================================================

/**
 * Trigger matched event type constant
 */
export const TRIGGER_MATCHED = 'dental.automation.trigger.matched' as const;
export const TRIGGER_MATCHED_VERSION = 1;

/**
 * Trigger matched event payload
 *
 * Published when a trigger event matches a workflow's trigger criteria.
 * Used for monitoring trigger frequency and workflow activation.
 */
export interface TriggerMatchedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Trigger type */
  triggerType: WorkflowTriggerType;

  /** Source event that triggered the match */
  sourceEvent: string;

  /** Source event payload */
  sourcePayload: Record<string, unknown>;

  /** Patient associated with trigger (if applicable) */
  patientId?: PatientId;

  /** Matched at timestamp */
  matchedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Trigger matched event envelope
 */
export type TriggerMatchedEvent = EventEnvelope<TriggerMatchedPayload>;

/**
 * Trigger filtered event type constant
 */
export const TRIGGER_FILTERED = 'dental.automation.trigger.filtered' as const;
export const TRIGGER_FILTERED_VERSION = 1;

/**
 * Trigger filtered event payload
 *
 * Published when a trigger event is filtered out before workflow execution.
 * Used for understanding why workflows aren't running when expected.
 */
export interface TriggerFilteredPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Trigger type */
  triggerType: WorkflowTriggerType;

  /** Source event that was filtered */
  sourceEvent: string;

  /** Source event payload */
  sourcePayload: Record<string, unknown>;

  /** Reason for filtering */
  reason: string;

  /** Filter rule that applied */
  filterRule?: string;

  /** Patient associated with trigger (if applicable) */
  patientId?: PatientId;

  /** Filtered at timestamp */
  filteredAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Trigger filtered event envelope
 */
export type TriggerFilteredEvent = EventEnvelope<TriggerFilteredPayload>;

// ============================================================================
// 6. RETRY EVENTS
// ============================================================================

/**
 * Retry scheduled event type constant
 */
export const RETRY_SCHEDULED = 'dental.automation.retry.scheduled' as const;
export const RETRY_SCHEDULED_VERSION = 1;

/**
 * Retry scheduled event payload
 *
 * Published when a workflow or action retry is scheduled.
 * Used for monitoring retry queue and backoff behavior.
 */
export interface RetryScheduledPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action run identifier (if action retry) */
  actionRunId?: ActionRunId;

  /** Action type (if action retry) */
  actionType?: WorkflowActionType;

  /** Patient this retry is for (if applicable) */
  patientId?: PatientId;

  /** Retry context */
  retryContext: RetryContext;

  /** Previous failure reason */
  previousError: ErrorContext;

  /** Scheduled at timestamp */
  scheduledAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Retry scheduled event envelope
 */
export type RetryScheduledEvent = EventEnvelope<RetryScheduledPayload>;

/**
 * Retry exhausted event type constant
 */
export const RETRY_EXHAUSTED = 'dental.automation.retry.exhausted' as const;
export const RETRY_EXHAUSTED_VERSION = 1;

/**
 * Retry exhausted event payload
 *
 * Published when maximum retry attempts are exhausted.
 * CRITICAL for alerting on persistent failures.
 */
export interface RetryExhaustedPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Action run identifier (if action retry) */
  actionRunId?: ActionRunId;

  /** Action type (if action retry) */
  actionType?: WorkflowActionType;

  /** Patient this retry was for (if applicable) */
  patientId?: PatientId;

  /** Maximum retries that were attempted */
  maxRetries: number;

  /** Total retry duration (milliseconds) */
  totalRetryDurationMs: number;

  /** Last failure error */
  lastError: ErrorContext;

  /** Exhausted at timestamp */
  exhaustedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Retry exhausted event envelope
 */
export type RetryExhaustedEvent = EventEnvelope<RetryExhaustedPayload>;

// ============================================================================
// 7. ERROR EVENTS
// ============================================================================

/**
 * Workflow error event type constant
 */
export const WORKFLOW_ERROR = 'dental.automation.workflow.error' as const;
export const WORKFLOW_ERROR_VERSION = 1;

/**
 * Workflow error event payload
 *
 * Published when a workflow-level error occurs.
 * CRITICAL for alerting and operational monitoring.
 */
export interface WorkflowErrorPayload {
  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Patient this error affects (if applicable) */
  patientId?: PatientId;

  /** Error details */
  error: ErrorContext;

  /** Error occurred at timestamp */
  occurredAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow error event envelope
 */
export type WorkflowErrorEvent = EventEnvelope<WorkflowErrorPayload>;

/**
 * Action error event type constant
 */
export const ACTION_ERROR = 'dental.automation.action.error' as const;
export const ACTION_ERROR_VERSION = 1;

/**
 * Action error event payload
 *
 * Published when an action-level error occurs.
 * CRITICAL for action-specific error tracking.
 */
export interface ActionErrorPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Action type */
  actionType: WorkflowActionType;

  /** Patient this error affects (if applicable) */
  patientId?: PatientId;

  /** Error details */
  error: ErrorContext;

  /** Error occurred at timestamp */
  occurredAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action error event envelope
 */
export type ActionErrorEvent = EventEnvelope<ActionErrorPayload>;

/**
 * System error event type constant
 */
export const SYSTEM_ERROR = 'dental.automation.system.error' as const;
export const SYSTEM_ERROR_VERSION = 1;

/**
 * System error event payload
 *
 * Published when a system-level error occurs (not specific to workflow/action).
 * CRITICAL for infrastructure and platform monitoring.
 */
export interface SystemErrorPayload {
  /** Component where error occurred */
  component: string;

  /** Error details */
  error: ErrorContext;

  /** Impacted workflow identifiers (if applicable) */
  impactedWorkflowIds?: AutomationWorkflowId[];

  /** Impacted workflow run identifiers (if applicable) */
  impactedWorkflowRunIds?: WorkflowRunId[];

  /** Error occurred at timestamp */
  occurredAt: ISODateString;

  /** Tenant context (if applicable) */
  tenantId?: TenantId;
  organizationId?: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * System error event envelope
 */
export type SystemErrorEvent = EventEnvelope<SystemErrorPayload>;

// ============================================================================
// 8. MONITORING EVENTS
// ============================================================================

/**
 * Workflow metrics updated event type constant
 */
export const WORKFLOW_METRICS_UPDATED = 'dental.automation.workflow.metrics.updated' as const;
export const WORKFLOW_METRICS_UPDATED_VERSION = 1;

/**
 * Workflow metrics updated event payload
 *
 * Published periodically with aggregated workflow metrics.
 * Used by analytics and BI systems for performance tracking.
 */
export interface WorkflowMetricsUpdatedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Total runs (all time) */
  totalRuns: number;

  /** Successful runs count */
  successCount: number;

  /** Failed runs count */
  failureCount: number;

  /** Cancelled runs count */
  cancelledCount: number;

  /** Success rate (0.0-1.0) */
  successRate: number;

  /** Average duration (milliseconds) */
  avgDuration: number;

  /** Median duration (milliseconds) */
  medianDuration?: number;

  /** P95 duration (milliseconds) */
  p95Duration?: number;

  /** Last run timestamp */
  lastRunAt?: ISODateString;

  /** Metrics period start */
  periodStart?: ISODateString;

  /** Metrics period end */
  periodEnd?: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Workflow metrics updated event envelope
 */
export type WorkflowMetricsUpdatedEvent = EventEnvelope<WorkflowMetricsUpdatedPayload>;

/**
 * Action metrics updated event type constant
 */
export const ACTION_METRICS_UPDATED = 'dental.automation.action.metrics.updated' as const;
export const ACTION_METRICS_UPDATED_VERSION = 1;

/**
 * Action metrics updated event payload
 *
 * Published periodically with aggregated action metrics.
 * Used to identify problematic action types.
 */
export interface ActionMetricsUpdatedPayload {
  /** Action type */
  actionType: WorkflowActionType;

  /** Total executions */
  executionCount: number;

  /** Successful executions */
  successCount: number;

  /** Failed executions */
  failureCount: number;

  /** Success rate (0.0-1.0) */
  successRate: number;

  /** Average duration (milliseconds) */
  avgDuration: number;

  /** Median duration (milliseconds) */
  medianDuration?: number;

  /** P95 duration (milliseconds) */
  p95Duration?: number;

  /** Common error types */
  commonErrors?: Array<{
    errorType: ErrorType;
    count: number;
    percentage: number;
  }>;

  /** Metrics period start */
  periodStart?: ISODateString;

  /** Metrics period end */
  periodEnd?: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Action metrics updated event envelope
 */
export type ActionMetricsUpdatedEvent = EventEnvelope<ActionMetricsUpdatedPayload>;

/**
 * Performance threshold exceeded event type constant
 */
export const PERFORMANCE_THRESHOLD_EXCEEDED = 'dental.automation.performance.threshold_exceeded' as const;
export const PERFORMANCE_THRESHOLD_EXCEEDED_VERSION = 1;

/**
 * Performance threshold exceeded event payload
 *
 * Published when a workflow or action exceeds performance thresholds.
 * CRITICAL for proactive performance monitoring.
 */
export interface PerformanceThresholdExceededPayload {
  /** Workflow identifier (if workflow threshold) */
  workflowId?: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName?: string;

  /** Action type (if action threshold) */
  actionType?: WorkflowActionType;

  /** Metric that exceeded threshold */
  metric: 'DURATION' | 'FAILURE_RATE' | 'TIMEOUT_RATE' | 'RETRY_RATE' | 'ERROR_RATE';

  /** Configured threshold value */
  threshold: number;

  /** Actual value that exceeded threshold */
  actualValue: number;

  /** Threshold unit (ms, percentage, count, etc.) */
  thresholdUnit: string;

  /** Observation period (milliseconds) */
  observationPeriodMs?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Performance threshold exceeded event envelope
 */
export type PerformanceThresholdExceededEvent = EventEnvelope<PerformanceThresholdExceededPayload>;

// ============================================================================
// 9. IDEMPOTENCY EVENTS
// ============================================================================

/**
 * Duplicate run detected event type constant
 */
export const DUPLICATE_RUN_DETECTED = 'dental.automation.duplicate_run.detected' as const;
export const DUPLICATE_RUN_DETECTED_VERSION = 1;

/**
 * Duplicate run detected event payload
 *
 * Published when an idempotency check detects a duplicate workflow run.
 * Critical for preventing duplicate executions and understanding retry patterns.
 */
export interface DuplicateRunDetectedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Workflow name (denormalized) */
  workflowName: string;

  /** Idempotency key that was duplicated */
  idempotencyKey: string;

  /** Original workflow run identifier */
  originalRunId: WorkflowRunId;

  /** Original run timestamp */
  originalRunTimestamp?: ISODateString;

  /** Duplicate attempt count */
  duplicateAttemptCount?: number;

  /** Patient associated (if applicable) */
  patientId?: PatientId;

  /** Detected at timestamp */
  detectedAt: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Duplicate run detected event envelope
 */
export type DuplicateRunDetectedEvent = EventEnvelope<DuplicateRunDetectedPayload>;

/**
 * Idempotency key generated event type constant
 */
export const IDEMPOTENCY_KEY_GENERATED = 'dental.automation.idempotency_key.generated' as const;
export const IDEMPOTENCY_KEY_GENERATED_VERSION = 1;

/**
 * Idempotency key generated event payload
 *
 * Published when an idempotency key is generated for a workflow run.
 * Used for debugging idempotency logic.
 */
export interface IdempotencyKeyGeneratedPayload {
  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Trigger event identifier */
  eventId: string;

  /** Generated idempotency key */
  idempotencyKey: string;

  /** Key generation algorithm/strategy */
  generationStrategy?: string;

  /** Input data used for key generation (hashed) */
  inputDataHash?: string;

  /** Patient associated (if applicable) */
  patientId?: PatientId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Idempotency key generated event envelope
 */
export type IdempotencyKeyGeneratedEvent = EventEnvelope<IdempotencyKeyGeneratedPayload>;

// ============================================================================
// 10. INTEGRATION EVENTS
// ============================================================================

/**
 * Webhook called event type constant
 */
export const WEBHOOK_CALLED = 'dental.automation.webhook.called' as const;
export const WEBHOOK_CALLED_VERSION = 1;

/**
 * Webhook called event payload
 *
 * Published when a workflow action calls an external webhook.
 * Used for monitoring external integrations.
 */
export interface WebhookCalledPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Webhook URL (may be sanitized) */
  webhookUrl: string;

  /** HTTP method used */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /** HTTP status code returned */
  statusCode: number;

  /** Response time (milliseconds) */
  responseTime: number;

  /** Request headers (sanitized) */
  requestHeaders?: Record<string, string>;

  /** Response headers */
  responseHeaders?: Record<string, string>;

  /** Request payload size (bytes) */
  requestSizeBytes?: number;

  /** Response payload size (bytes) */
  responseSizeBytes?: number;

  /** Patient associated (if applicable) */
  patientId?: PatientId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Webhook called event envelope
 */
export type WebhookCalledEvent = EventEnvelope<WebhookCalledPayload>;

/**
 * Service called event type constant
 */
export const SERVICE_CALLED = 'dental.automation.service.called' as const;
export const SERVICE_CALLED_VERSION = 1;

/**
 * Service called event payload
 *
 * Published when a workflow action calls an internal service.
 * Used for monitoring internal service dependencies.
 */
export interface ServiceCalledPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Service name */
  serviceName: string;

  /** Service endpoint */
  serviceEndpoint: string;

  /** Service method */
  method: string;

  /** HTTP status code returned */
  statusCode: number;

  /** Response time (milliseconds) */
  responseTime: number;

  /** Success indicator */
  success: boolean;

  /** Patient associated (if applicable) */
  patientId?: PatientId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Service called event envelope
 */
export type ServiceCalledEvent = EventEnvelope<ServiceCalledPayload>;

/**
 * Event emitted event type constant
 */
export const EVENT_EMITTED = 'dental.automation.event.emitted' as const;
export const EVENT_EMITTED_VERSION = 1;

/**
 * Event emitted event payload
 *
 * Published when a workflow action emits a domain event.
 * Used for tracking workflow-generated events.
 */
export interface EventEmittedPayload {
  /** Action run identifier */
  actionRunId: ActionRunId;

  /** Workflow run identifier */
  workflowRunId: WorkflowRunId;

  /** Workflow identifier */
  workflowId: AutomationWorkflowId;

  /** Emitted event type */
  emittedEventType: string;

  /** Emitted event payload (may be sanitized) */
  emittedPayload: Record<string, unknown>;

  /** Event destination (queue, topic, etc.) */
  eventDestination?: string;

  /** Patient associated (if applicable) */
  patientId?: PatientId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId?: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Event emitted event envelope
 */
export type EventEmittedEvent = EventEnvelope<EventEmittedPayload>;

// ============================================================================
// UNION TYPES FOR TYPE-SAFE EVENT HANDLING
// ============================================================================

/**
 * Union type of all automation event payloads
 */
export type AutomationEventPayload =
  | WorkflowCreatedPayload
  | WorkflowUpdatedPayload
  | WorkflowActivatedPayload
  | WorkflowDeactivatedPayload
  | WorkflowDeletedPayload
  | WorkflowRunStartedPayload
  | WorkflowRunCompletedPayload
  | WorkflowRunFailedPayload
  | WorkflowRunCancelledPayload
  | WorkflowRunTimedOutPayload
  | ActionStartedPayload
  | ActionCompletedPayload
  | ActionFailedPayload
  | ActionRetryingPayload
  | ActionSkippedPayload
  | ConditionEvaluatedPayload
  | ConditionErrorPayload
  | TriggerMatchedPayload
  | TriggerFilteredPayload
  | RetryScheduledPayload
  | RetryExhaustedPayload
  | WorkflowErrorPayload
  | ActionErrorPayload
  | SystemErrorPayload
  | WorkflowMetricsUpdatedPayload
  | ActionMetricsUpdatedPayload
  | PerformanceThresholdExceededPayload
  | DuplicateRunDetectedPayload
  | IdempotencyKeyGeneratedPayload
  | WebhookCalledPayload
  | ServiceCalledPayload
  | EventEmittedPayload;

/**
 * Union type of all automation event envelopes
 */
export type AutomationEvent =
  | WorkflowCreatedEvent
  | WorkflowUpdatedEvent
  | WorkflowActivatedEvent
  | WorkflowDeactivatedEvent
  | WorkflowDeletedEvent
  | WorkflowRunStartedEvent
  | WorkflowRunCompletedEvent
  | WorkflowRunFailedEvent
  | WorkflowRunCancelledEvent
  | WorkflowRunTimedOutEvent
  | ActionStartedEvent
  | ActionCompletedEvent
  | ActionFailedEvent
  | ActionRetryingEvent
  | ActionSkippedEvent
  | ConditionEvaluatedEvent
  | ConditionErrorEvent
  | TriggerMatchedEvent
  | TriggerFilteredEvent
  | RetryScheduledEvent
  | RetryExhaustedEvent
  | WorkflowErrorEvent
  | ActionErrorEvent
  | SystemErrorEvent
  | WorkflowMetricsUpdatedEvent
  | ActionMetricsUpdatedEvent
  | PerformanceThresholdExceededEvent
  | DuplicateRunDetectedEvent
  | IdempotencyKeyGeneratedEvent
  | WebhookCalledEvent
  | ServiceCalledEvent
  | EventEmittedEvent;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if an event is a workflow lifecycle event
 */
export function isWorkflowLifecycleEvent(
  event: EventEnvelope<unknown>
): event is
  | WorkflowCreatedEvent
  | WorkflowUpdatedEvent
  | WorkflowActivatedEvent
  | WorkflowDeactivatedEvent
  | WorkflowDeletedEvent {
  return [
    WORKFLOW_CREATED,
    WORKFLOW_UPDATED,
    WORKFLOW_ACTIVATED,
    WORKFLOW_DEACTIVATED,
    WORKFLOW_DELETED,
  ].includes(event.type as any);
}

/**
 * Type guard to check if an event is a workflow execution event
 */
export function isWorkflowExecutionEvent(
  event: EventEnvelope<unknown>
): event is
  | WorkflowRunStartedEvent
  | WorkflowRunCompletedEvent
  | WorkflowRunFailedEvent
  | WorkflowRunCancelledEvent
  | WorkflowRunTimedOutEvent {
  return [
    WORKFLOW_RUN_STARTED,
    WORKFLOW_RUN_COMPLETED,
    WORKFLOW_RUN_FAILED,
    WORKFLOW_RUN_CANCELLED,
    WORKFLOW_RUN_TIMED_OUT,
  ].includes(event.type as any);
}

/**
 * Type guard to check if an event is an action execution event
 */
export function isActionExecutionEvent(
  event: EventEnvelope<unknown>
): event is
  | ActionStartedEvent
  | ActionCompletedEvent
  | ActionFailedEvent
  | ActionRetryingEvent
  | ActionSkippedEvent {
  return [ACTION_STARTED, ACTION_COMPLETED, ACTION_FAILED, ACTION_RETRYING, ACTION_SKIPPED].includes(
    event.type as any
  );
}

/**
 * Type guard to check if an event is an error event
 */
export function isErrorEvent(
  event: EventEnvelope<unknown>
): event is WorkflowErrorEvent | ActionErrorEvent | SystemErrorEvent | ConditionErrorEvent {
  return [WORKFLOW_ERROR, ACTION_ERROR, SYSTEM_ERROR, CONDITION_ERROR].includes(event.type as any);
}

/**
 * Type guard to check if an event is a monitoring event
 */
export function isMonitoringEvent(
  event: EventEnvelope<unknown>
): event is
  | WorkflowMetricsUpdatedEvent
  | ActionMetricsUpdatedEvent
  | PerformanceThresholdExceededEvent {
  return [WORKFLOW_METRICS_UPDATED, ACTION_METRICS_UPDATED, PERFORMANCE_THRESHOLD_EXCEEDED].includes(
    event.type as any
  );
}

/**
 * Type guard to check if an event is an integration event
 */
export function isIntegrationEvent(
  event: EventEnvelope<unknown>
): event is WebhookCalledEvent | ServiceCalledEvent | EventEmittedEvent {
  return [WEBHOOK_CALLED, SERVICE_CALLED, EVENT_EMITTED].includes(event.type as any);
}
