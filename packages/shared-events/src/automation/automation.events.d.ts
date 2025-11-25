import type { UUID, OrganizationId, ClinicId, TenantId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientId } from '@dentalos/shared-domain';
export type AutomationWorkflowId = UUID & {
    readonly __brand: 'AutomationWorkflowId';
};
export type WorkflowRunId = UUID & {
    readonly __brand: 'WorkflowRunId';
};
export type ActionRunId = UUID & {
    readonly __brand: 'ActionRunId';
};
export type UserId = UUID & {
    readonly __brand: 'UserId';
};
export type WorkflowTriggerType = 'APPOINTMENT_SCHEDULED' | 'APPOINTMENT_COMPLETED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_NO_SHOW' | 'TREATMENT_PLAN_CREATED' | 'TREATMENT_PLAN_APPROVED' | 'PROCEDURE_COMPLETED' | 'INVOICE_CREATED' | 'INVOICE_PAID' | 'INVOICE_OVERDUE' | 'PATIENT_CREATED' | 'PATIENT_BIRTHDAY' | 'PATIENT_ANNIVERSARY' | 'PATIENT_INACTIVE' | 'SEGMENT_MEMBERSHIP_CHANGED' | 'FEEDBACK_RECEIVED' | 'NPS_SCORE_RECEIVED' | 'PAYMENT_RECEIVED' | 'PAYMENT_FAILED' | 'LOYALTY_POINTS_EARNED' | 'LOYALTY_TIER_CHANGED' | 'REFERRAL_COMPLETED' | 'RECALL_OVERDUE' | 'SCHEDULED_TIME' | 'WEBHOOK_RECEIVED' | 'CUSTOM_EVENT';
export type WorkflowActionType = 'SEND_EMAIL' | 'SEND_SMS' | 'SEND_PUSH_NOTIFICATION' | 'SEND_WHATSAPP' | 'CREATE_TASK' | 'UPDATE_PATIENT_FIELD' | 'ADD_PATIENT_TAG' | 'REMOVE_PATIENT_TAG' | 'ADD_TO_SEGMENT' | 'REMOVE_FROM_SEGMENT' | 'ACCRUE_LOYALTY_POINTS' | 'CREATE_REFERRAL' | 'TRIGGER_WORKFLOW' | 'WAIT_DURATION' | 'WAIT_UNTIL' | 'CONDITION_CHECK' | 'AI_ACTION' | 'CALL_WEBHOOK' | 'CALL_API' | 'EXECUTE_SCRIPT' | 'CREATE_APPOINTMENT' | 'SEND_INTERNAL_NOTIFICATION';
export type WorkflowStatus = 'ACTIVE' | 'INACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DRAFT';
export type WorkflowRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'TIMED_OUT';
export type ActionRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'RETRYING';
export type ErrorType = 'VALIDATION_ERROR' | 'PERMISSION_ERROR' | 'RATE_LIMIT_ERROR' | 'CONSENT_ERROR' | 'QUIET_HOURS_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT_ERROR' | 'SERVICE_UNAVAILABLE' | 'CONFIGURATION_ERROR' | 'IDEMPOTENCY_ERROR' | 'CONDITION_ERROR' | 'ACTION_ERROR' | 'LOOP_DETECTED' | 'UNKNOWN_ERROR';
export interface ErrorContext {
    type: ErrorType;
    message: string;
    stack?: string;
    code?: string;
    details?: Record<string, unknown>;
}
export interface RetryContext {
    attempt: number;
    maxRetries: number;
    nextRetryAt?: ISODateString;
    backoffMs?: number;
    backoffMultiplier?: number;
}
export interface PerformanceMetrics {
    durationMs: number;
    memoryBytes?: number;
    actionsExecuted?: number;
    apiCallsCount?: number;
    avgActionDurationMs?: number;
}
export interface WorkflowChange {
    field: string;
    previousValue?: string | number | boolean | null;
    newValue?: string | number | boolean | null;
    description?: string;
}
export declare const WORKFLOW_CREATED: "dental.automation.workflow.created";
export declare const WORKFLOW_CREATED_VERSION = 1;
export interface WorkflowCreatedPayload {
    workflowId: AutomationWorkflowId;
    name: string;
    description?: string;
    triggerType: WorkflowTriggerType;
    actionTypes: WorkflowActionType[];
    actionCount: number;
    status: WorkflowStatus;
    createdBy: UserId;
    tags?: string[];
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowCreatedEvent = EventEnvelope<WorkflowCreatedPayload>;
export declare const WORKFLOW_UPDATED: "dental.automation.workflow.updated";
export declare const WORKFLOW_UPDATED_VERSION = 1;
export interface WorkflowUpdatedPayload {
    workflowId: AutomationWorkflowId;
    name: string;
    changes: WorkflowChange[];
    updatedBy: UserId;
    reason?: string;
    newStatus?: WorkflowStatus;
    previousStatus?: WorkflowStatus;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowUpdatedEvent = EventEnvelope<WorkflowUpdatedPayload>;
export declare const WORKFLOW_ACTIVATED: "dental.automation.workflow.activated";
export declare const WORKFLOW_ACTIVATED_VERSION = 1;
export interface WorkflowActivatedPayload {
    workflowId: AutomationWorkflowId;
    name: string;
    triggerType: WorkflowTriggerType;
    activatedBy: UserId;
    reason?: string;
    estimatedFrequency?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowActivatedEvent = EventEnvelope<WorkflowActivatedPayload>;
export declare const WORKFLOW_DEACTIVATED: "dental.automation.workflow.deactivated";
export declare const WORKFLOW_DEACTIVATED_VERSION = 1;
export interface WorkflowDeactivatedPayload {
    workflowId: AutomationWorkflowId;
    name: string;
    reason: string;
    deactivatedBy: UserId;
    totalRuns?: number;
    successRate?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowDeactivatedEvent = EventEnvelope<WorkflowDeactivatedPayload>;
export declare const WORKFLOW_DELETED: "dental.automation.workflow.deleted";
export declare const WORKFLOW_DELETED_VERSION = 1;
export interface WorkflowDeletedPayload {
    workflowId: AutomationWorkflowId;
    name: string;
    deletedBy: UserId;
    reason?: string;
    totalLifetimeRuns?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowDeletedEvent = EventEnvelope<WorkflowDeletedPayload>;
export declare const WORKFLOW_RUN_STARTED: "dental.automation.workflow.run.started";
export declare const WORKFLOW_RUN_STARTED_VERSION = 1;
export interface WorkflowRunStartedPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    triggerEvent: string;
    triggerPayload: Record<string, unknown>;
    idempotencyKey: string;
    patientId?: PatientId;
    estimatedActionCount: number;
    estimatedDurationMs?: number;
    startedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowRunStartedEvent = EventEnvelope<WorkflowRunStartedPayload>;
export declare const WORKFLOW_RUN_COMPLETED: "dental.automation.workflow.run.completed";
export declare const WORKFLOW_RUN_COMPLETED_VERSION = 1;
export interface WorkflowRunCompletedPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    patientId?: PatientId;
    duration: number;
    actionsExecuted: number;
    actionsSucceeded: number;
    actionsFailed: number;
    actionsSkipped: number;
    performanceMetrics: PerformanceMetrics;
    completedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowRunCompletedEvent = EventEnvelope<WorkflowRunCompletedPayload>;
export declare const WORKFLOW_RUN_FAILED: "dental.automation.workflow.run.failed";
export declare const WORKFLOW_RUN_FAILED_VERSION = 1;
export interface WorkflowRunFailedPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    patientId?: PatientId;
    error: ErrorContext;
    failedActionId?: ActionRunId;
    failedActionType?: WorkflowActionType;
    duration?: number;
    willRetry: boolean;
    retryContext?: RetryContext;
    failedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowRunFailedEvent = EventEnvelope<WorkflowRunFailedPayload>;
export declare const WORKFLOW_RUN_CANCELLED: "dental.automation.workflow.run.cancelled";
export declare const WORKFLOW_RUN_CANCELLED_VERSION = 1;
export interface WorkflowRunCancelledPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    patientId?: PatientId;
    reason: string;
    cancelledBy: UserId;
    duration?: number;
    actionsCompletedBeforeCancellation?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowRunCancelledEvent = EventEnvelope<WorkflowRunCancelledPayload>;
export declare const WORKFLOW_RUN_TIMED_OUT: "dental.automation.workflow.run.timed_out";
export declare const WORKFLOW_RUN_TIMED_OUT_VERSION = 1;
export interface WorkflowRunTimedOutPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    patientId?: PatientId;
    timeout: number;
    duration: number;
    actionsCompletedBeforeTimeout: number;
    lastRunningActionType?: WorkflowActionType;
    timedOutAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowRunTimedOutEvent = EventEnvelope<WorkflowRunTimedOutPayload>;
export declare const ACTION_STARTED: "dental.automation.action.started";
export declare const ACTION_STARTED_VERSION = 1;
export interface ActionStartedPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    actionConfig: Record<string, unknown>;
    actionOrder: number;
    patientId?: PatientId;
    startedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionStartedEvent = EventEnvelope<ActionStartedPayload>;
export declare const ACTION_COMPLETED: "dental.automation.action.completed";
export declare const ACTION_COMPLETED_VERSION = 1;
export interface ActionCompletedPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    patientId?: PatientId;
    result: Record<string, unknown>;
    duration: number;
    completedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionCompletedEvent = EventEnvelope<ActionCompletedPayload>;
export declare const ACTION_FAILED: "dental.automation.action.failed";
export declare const ACTION_FAILED_VERSION = 1;
export interface ActionFailedPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    patientId?: PatientId;
    error: ErrorContext;
    retryCount: number;
    duration?: number;
    failedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionFailedEvent = EventEnvelope<ActionFailedPayload>;
export declare const ACTION_RETRYING: "dental.automation.action.retrying";
export declare const ACTION_RETRYING_VERSION = 1;
export interface ActionRetryingPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    patientId?: PatientId;
    retryAttempt: number;
    maxRetries: number;
    nextRetryAt: ISODateString;
    backoffMs: number;
    previousError?: ErrorContext;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionRetryingEvent = EventEnvelope<ActionRetryingPayload>;
export declare const ACTION_SKIPPED: "dental.automation.action.skipped";
export declare const ACTION_SKIPPED_VERSION = 1;
export interface ActionSkippedPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    patientId?: PatientId;
    reason: string;
    conditionNotMet?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionSkippedEvent = EventEnvelope<ActionSkippedPayload>;
export declare const CONDITION_EVALUATED: "dental.automation.condition.evaluated";
export declare const CONDITION_EVALUATED_VERSION = 1;
export interface ConditionEvaluatedPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    conditionExpression: string;
    result: boolean;
    evaluatedValues?: Record<string, unknown>;
    evaluationDurationMs?: number;
    patientId?: PatientId;
    evaluatedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ConditionEvaluatedEvent = EventEnvelope<ConditionEvaluatedPayload>;
export declare const CONDITION_ERROR: "dental.automation.condition.error";
export declare const CONDITION_ERROR_VERSION = 1;
export interface ConditionErrorPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    conditionExpression: string;
    error: ErrorContext;
    patientId?: PatientId;
    errorAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ConditionErrorEvent = EventEnvelope<ConditionErrorPayload>;
export declare const TRIGGER_MATCHED: "dental.automation.trigger.matched";
export declare const TRIGGER_MATCHED_VERSION = 1;
export interface TriggerMatchedPayload {
    workflowId: AutomationWorkflowId;
    workflowName: string;
    triggerType: WorkflowTriggerType;
    sourceEvent: string;
    sourcePayload: Record<string, unknown>;
    patientId?: PatientId;
    matchedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type TriggerMatchedEvent = EventEnvelope<TriggerMatchedPayload>;
export declare const TRIGGER_FILTERED: "dental.automation.trigger.filtered";
export declare const TRIGGER_FILTERED_VERSION = 1;
export interface TriggerFilteredPayload {
    workflowId: AutomationWorkflowId;
    workflowName: string;
    triggerType: WorkflowTriggerType;
    sourceEvent: string;
    sourcePayload: Record<string, unknown>;
    reason: string;
    filterRule?: string;
    patientId?: PatientId;
    filteredAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type TriggerFilteredEvent = EventEnvelope<TriggerFilteredPayload>;
export declare const RETRY_SCHEDULED: "dental.automation.retry.scheduled";
export declare const RETRY_SCHEDULED_VERSION = 1;
export interface RetryScheduledPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionRunId?: ActionRunId;
    actionType?: WorkflowActionType;
    patientId?: PatientId;
    retryContext: RetryContext;
    previousError: ErrorContext;
    scheduledAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type RetryScheduledEvent = EventEnvelope<RetryScheduledPayload>;
export declare const RETRY_EXHAUSTED: "dental.automation.retry.exhausted";
export declare const RETRY_EXHAUSTED_VERSION = 1;
export interface RetryExhaustedPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    actionRunId?: ActionRunId;
    actionType?: WorkflowActionType;
    patientId?: PatientId;
    maxRetries: number;
    totalRetryDurationMs: number;
    lastError: ErrorContext;
    exhaustedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type RetryExhaustedEvent = EventEnvelope<RetryExhaustedPayload>;
export declare const WORKFLOW_ERROR: "dental.automation.workflow.error";
export declare const WORKFLOW_ERROR_VERSION = 1;
export interface WorkflowErrorPayload {
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    workflowName: string;
    patientId?: PatientId;
    error: ErrorContext;
    occurredAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowErrorEvent = EventEnvelope<WorkflowErrorPayload>;
export declare const ACTION_ERROR: "dental.automation.action.error";
export declare const ACTION_ERROR_VERSION = 1;
export interface ActionErrorPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    actionType: WorkflowActionType;
    patientId?: PatientId;
    error: ErrorContext;
    occurredAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionErrorEvent = EventEnvelope<ActionErrorPayload>;
export declare const SYSTEM_ERROR: "dental.automation.system.error";
export declare const SYSTEM_ERROR_VERSION = 1;
export interface SystemErrorPayload {
    component: string;
    error: ErrorContext;
    impactedWorkflowIds?: AutomationWorkflowId[];
    impactedWorkflowRunIds?: WorkflowRunId[];
    occurredAt: ISODateString;
    tenantId?: TenantId;
    organizationId?: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type SystemErrorEvent = EventEnvelope<SystemErrorPayload>;
export declare const WORKFLOW_METRICS_UPDATED: "dental.automation.workflow.metrics.updated";
export declare const WORKFLOW_METRICS_UPDATED_VERSION = 1;
export interface WorkflowMetricsUpdatedPayload {
    workflowId: AutomationWorkflowId;
    workflowName: string;
    totalRuns: number;
    successCount: number;
    failureCount: number;
    cancelledCount: number;
    successRate: number;
    avgDuration: number;
    medianDuration?: number;
    p95Duration?: number;
    lastRunAt?: ISODateString;
    periodStart?: ISODateString;
    periodEnd?: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WorkflowMetricsUpdatedEvent = EventEnvelope<WorkflowMetricsUpdatedPayload>;
export declare const ACTION_METRICS_UPDATED: "dental.automation.action.metrics.updated";
export declare const ACTION_METRICS_UPDATED_VERSION = 1;
export interface ActionMetricsUpdatedPayload {
    actionType: WorkflowActionType;
    executionCount: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    avgDuration: number;
    medianDuration?: number;
    p95Duration?: number;
    commonErrors?: Array<{
        errorType: ErrorType;
        count: number;
        percentage: number;
    }>;
    periodStart?: ISODateString;
    periodEnd?: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ActionMetricsUpdatedEvent = EventEnvelope<ActionMetricsUpdatedPayload>;
export declare const PERFORMANCE_THRESHOLD_EXCEEDED: "dental.automation.performance.threshold_exceeded";
export declare const PERFORMANCE_THRESHOLD_EXCEEDED_VERSION = 1;
export interface PerformanceThresholdExceededPayload {
    workflowId?: AutomationWorkflowId;
    workflowName?: string;
    actionType?: WorkflowActionType;
    metric: 'DURATION' | 'FAILURE_RATE' | 'TIMEOUT_RATE' | 'RETRY_RATE' | 'ERROR_RATE';
    threshold: number;
    actualValue: number;
    thresholdUnit: string;
    observationPeriodMs?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type PerformanceThresholdExceededEvent = EventEnvelope<PerformanceThresholdExceededPayload>;
export declare const DUPLICATE_RUN_DETECTED: "dental.automation.duplicate_run.detected";
export declare const DUPLICATE_RUN_DETECTED_VERSION = 1;
export interface DuplicateRunDetectedPayload {
    workflowId: AutomationWorkflowId;
    workflowName: string;
    idempotencyKey: string;
    originalRunId: WorkflowRunId;
    originalRunTimestamp?: ISODateString;
    duplicateAttemptCount?: number;
    patientId?: PatientId;
    detectedAt: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type DuplicateRunDetectedEvent = EventEnvelope<DuplicateRunDetectedPayload>;
export declare const IDEMPOTENCY_KEY_GENERATED: "dental.automation.idempotency_key.generated";
export declare const IDEMPOTENCY_KEY_GENERATED_VERSION = 1;
export interface IdempotencyKeyGeneratedPayload {
    workflowId: AutomationWorkflowId;
    eventId: string;
    idempotencyKey: string;
    generationStrategy?: string;
    inputDataHash?: string;
    patientId?: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type IdempotencyKeyGeneratedEvent = EventEnvelope<IdempotencyKeyGeneratedPayload>;
export declare const WEBHOOK_CALLED: "dental.automation.webhook.called";
export declare const WEBHOOK_CALLED_VERSION = 1;
export interface WebhookCalledPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    webhookUrl: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    statusCode: number;
    responseTime: number;
    requestHeaders?: Record<string, string>;
    responseHeaders?: Record<string, string>;
    requestSizeBytes?: number;
    responseSizeBytes?: number;
    patientId?: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type WebhookCalledEvent = EventEnvelope<WebhookCalledPayload>;
export declare const SERVICE_CALLED: "dental.automation.service.called";
export declare const SERVICE_CALLED_VERSION = 1;
export interface ServiceCalledPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    serviceName: string;
    serviceEndpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    success: boolean;
    patientId?: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type ServiceCalledEvent = EventEnvelope<ServiceCalledPayload>;
export declare const EVENT_EMITTED: "dental.automation.event.emitted";
export declare const EVENT_EMITTED_VERSION = 1;
export interface EventEmittedPayload {
    actionRunId: ActionRunId;
    workflowRunId: WorkflowRunId;
    workflowId: AutomationWorkflowId;
    emittedEventType: string;
    emittedPayload: Record<string, unknown>;
    eventDestination?: string;
    patientId?: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    timestamp: ISODateString;
    correlationId: string;
    metadata?: Record<string, unknown>;
}
export type EventEmittedEvent = EventEnvelope<EventEmittedPayload>;
export type AutomationEventPayload = WorkflowCreatedPayload | WorkflowUpdatedPayload | WorkflowActivatedPayload | WorkflowDeactivatedPayload | WorkflowDeletedPayload | WorkflowRunStartedPayload | WorkflowRunCompletedPayload | WorkflowRunFailedPayload | WorkflowRunCancelledPayload | WorkflowRunTimedOutPayload | ActionStartedPayload | ActionCompletedPayload | ActionFailedPayload | ActionRetryingPayload | ActionSkippedPayload | ConditionEvaluatedPayload | ConditionErrorPayload | TriggerMatchedPayload | TriggerFilteredPayload | RetryScheduledPayload | RetryExhaustedPayload | WorkflowErrorPayload | ActionErrorPayload | SystemErrorPayload | WorkflowMetricsUpdatedPayload | ActionMetricsUpdatedPayload | PerformanceThresholdExceededPayload | DuplicateRunDetectedPayload | IdempotencyKeyGeneratedPayload | WebhookCalledPayload | ServiceCalledPayload | EventEmittedPayload;
export type AutomationEvent = WorkflowCreatedEvent | WorkflowUpdatedEvent | WorkflowActivatedEvent | WorkflowDeactivatedEvent | WorkflowDeletedEvent | WorkflowRunStartedEvent | WorkflowRunCompletedEvent | WorkflowRunFailedEvent | WorkflowRunCancelledEvent | WorkflowRunTimedOutEvent | ActionStartedEvent | ActionCompletedEvent | ActionFailedEvent | ActionRetryingEvent | ActionSkippedEvent | ConditionEvaluatedEvent | ConditionErrorEvent | TriggerMatchedEvent | TriggerFilteredEvent | RetryScheduledEvent | RetryExhaustedEvent | WorkflowErrorEvent | ActionErrorEvent | SystemErrorEvent | WorkflowMetricsUpdatedEvent | ActionMetricsUpdatedEvent | PerformanceThresholdExceededEvent | DuplicateRunDetectedEvent | IdempotencyKeyGeneratedEvent | WebhookCalledEvent | ServiceCalledEvent | EventEmittedEvent;
export declare function isWorkflowLifecycleEvent(event: EventEnvelope<unknown>): event is WorkflowCreatedEvent | WorkflowUpdatedEvent | WorkflowActivatedEvent | WorkflowDeactivatedEvent | WorkflowDeletedEvent;
export declare function isWorkflowExecutionEvent(event: EventEnvelope<unknown>): event is WorkflowRunStartedEvent | WorkflowRunCompletedEvent | WorkflowRunFailedEvent | WorkflowRunCancelledEvent | WorkflowRunTimedOutEvent;
export declare function isActionExecutionEvent(event: EventEnvelope<unknown>): event is ActionStartedEvent | ActionCompletedEvent | ActionFailedEvent | ActionRetryingEvent | ActionSkippedEvent;
export declare function isErrorEvent(event: EventEnvelope<unknown>): event is WorkflowErrorEvent | ActionErrorEvent | SystemErrorEvent | ConditionErrorEvent;
export declare function isMonitoringEvent(event: EventEnvelope<unknown>): event is WorkflowMetricsUpdatedEvent | ActionMetricsUpdatedEvent | PerformanceThresholdExceededEvent;
export declare function isIntegrationEvent(event: EventEnvelope<unknown>): event is WebhookCalledEvent | ServiceCalledEvent | EventEmittedEvent;
