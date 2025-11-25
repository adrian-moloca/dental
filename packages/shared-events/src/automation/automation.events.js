"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKFLOW_METRICS_UPDATED_VERSION = exports.WORKFLOW_METRICS_UPDATED = exports.SYSTEM_ERROR_VERSION = exports.SYSTEM_ERROR = exports.ACTION_ERROR_VERSION = exports.ACTION_ERROR = exports.WORKFLOW_ERROR_VERSION = exports.WORKFLOW_ERROR = exports.RETRY_EXHAUSTED_VERSION = exports.RETRY_EXHAUSTED = exports.RETRY_SCHEDULED_VERSION = exports.RETRY_SCHEDULED = exports.TRIGGER_FILTERED_VERSION = exports.TRIGGER_FILTERED = exports.TRIGGER_MATCHED_VERSION = exports.TRIGGER_MATCHED = exports.CONDITION_ERROR_VERSION = exports.CONDITION_ERROR = exports.CONDITION_EVALUATED_VERSION = exports.CONDITION_EVALUATED = exports.ACTION_SKIPPED_VERSION = exports.ACTION_SKIPPED = exports.ACTION_RETRYING_VERSION = exports.ACTION_RETRYING = exports.ACTION_FAILED_VERSION = exports.ACTION_FAILED = exports.ACTION_COMPLETED_VERSION = exports.ACTION_COMPLETED = exports.ACTION_STARTED_VERSION = exports.ACTION_STARTED = exports.WORKFLOW_RUN_TIMED_OUT_VERSION = exports.WORKFLOW_RUN_TIMED_OUT = exports.WORKFLOW_RUN_CANCELLED_VERSION = exports.WORKFLOW_RUN_CANCELLED = exports.WORKFLOW_RUN_FAILED_VERSION = exports.WORKFLOW_RUN_FAILED = exports.WORKFLOW_RUN_COMPLETED_VERSION = exports.WORKFLOW_RUN_COMPLETED = exports.WORKFLOW_RUN_STARTED_VERSION = exports.WORKFLOW_RUN_STARTED = exports.WORKFLOW_DELETED_VERSION = exports.WORKFLOW_DELETED = exports.WORKFLOW_DEACTIVATED_VERSION = exports.WORKFLOW_DEACTIVATED = exports.WORKFLOW_ACTIVATED_VERSION = exports.WORKFLOW_ACTIVATED = exports.WORKFLOW_UPDATED_VERSION = exports.WORKFLOW_UPDATED = exports.WORKFLOW_CREATED_VERSION = exports.WORKFLOW_CREATED = void 0;
exports.EVENT_EMITTED_VERSION = exports.EVENT_EMITTED = exports.SERVICE_CALLED_VERSION = exports.SERVICE_CALLED = exports.WEBHOOK_CALLED_VERSION = exports.WEBHOOK_CALLED = exports.IDEMPOTENCY_KEY_GENERATED_VERSION = exports.IDEMPOTENCY_KEY_GENERATED = exports.DUPLICATE_RUN_DETECTED_VERSION = exports.DUPLICATE_RUN_DETECTED = exports.PERFORMANCE_THRESHOLD_EXCEEDED_VERSION = exports.PERFORMANCE_THRESHOLD_EXCEEDED = exports.ACTION_METRICS_UPDATED_VERSION = exports.ACTION_METRICS_UPDATED = void 0;
exports.isWorkflowLifecycleEvent = isWorkflowLifecycleEvent;
exports.isWorkflowExecutionEvent = isWorkflowExecutionEvent;
exports.isActionExecutionEvent = isActionExecutionEvent;
exports.isErrorEvent = isErrorEvent;
exports.isMonitoringEvent = isMonitoringEvent;
exports.isIntegrationEvent = isIntegrationEvent;
exports.WORKFLOW_CREATED = 'dental.automation.workflow.created';
exports.WORKFLOW_CREATED_VERSION = 1;
exports.WORKFLOW_UPDATED = 'dental.automation.workflow.updated';
exports.WORKFLOW_UPDATED_VERSION = 1;
exports.WORKFLOW_ACTIVATED = 'dental.automation.workflow.activated';
exports.WORKFLOW_ACTIVATED_VERSION = 1;
exports.WORKFLOW_DEACTIVATED = 'dental.automation.workflow.deactivated';
exports.WORKFLOW_DEACTIVATED_VERSION = 1;
exports.WORKFLOW_DELETED = 'dental.automation.workflow.deleted';
exports.WORKFLOW_DELETED_VERSION = 1;
exports.WORKFLOW_RUN_STARTED = 'dental.automation.workflow.run.started';
exports.WORKFLOW_RUN_STARTED_VERSION = 1;
exports.WORKFLOW_RUN_COMPLETED = 'dental.automation.workflow.run.completed';
exports.WORKFLOW_RUN_COMPLETED_VERSION = 1;
exports.WORKFLOW_RUN_FAILED = 'dental.automation.workflow.run.failed';
exports.WORKFLOW_RUN_FAILED_VERSION = 1;
exports.WORKFLOW_RUN_CANCELLED = 'dental.automation.workflow.run.cancelled';
exports.WORKFLOW_RUN_CANCELLED_VERSION = 1;
exports.WORKFLOW_RUN_TIMED_OUT = 'dental.automation.workflow.run.timed_out';
exports.WORKFLOW_RUN_TIMED_OUT_VERSION = 1;
exports.ACTION_STARTED = 'dental.automation.action.started';
exports.ACTION_STARTED_VERSION = 1;
exports.ACTION_COMPLETED = 'dental.automation.action.completed';
exports.ACTION_COMPLETED_VERSION = 1;
exports.ACTION_FAILED = 'dental.automation.action.failed';
exports.ACTION_FAILED_VERSION = 1;
exports.ACTION_RETRYING = 'dental.automation.action.retrying';
exports.ACTION_RETRYING_VERSION = 1;
exports.ACTION_SKIPPED = 'dental.automation.action.skipped';
exports.ACTION_SKIPPED_VERSION = 1;
exports.CONDITION_EVALUATED = 'dental.automation.condition.evaluated';
exports.CONDITION_EVALUATED_VERSION = 1;
exports.CONDITION_ERROR = 'dental.automation.condition.error';
exports.CONDITION_ERROR_VERSION = 1;
exports.TRIGGER_MATCHED = 'dental.automation.trigger.matched';
exports.TRIGGER_MATCHED_VERSION = 1;
exports.TRIGGER_FILTERED = 'dental.automation.trigger.filtered';
exports.TRIGGER_FILTERED_VERSION = 1;
exports.RETRY_SCHEDULED = 'dental.automation.retry.scheduled';
exports.RETRY_SCHEDULED_VERSION = 1;
exports.RETRY_EXHAUSTED = 'dental.automation.retry.exhausted';
exports.RETRY_EXHAUSTED_VERSION = 1;
exports.WORKFLOW_ERROR = 'dental.automation.workflow.error';
exports.WORKFLOW_ERROR_VERSION = 1;
exports.ACTION_ERROR = 'dental.automation.action.error';
exports.ACTION_ERROR_VERSION = 1;
exports.SYSTEM_ERROR = 'dental.automation.system.error';
exports.SYSTEM_ERROR_VERSION = 1;
exports.WORKFLOW_METRICS_UPDATED = 'dental.automation.workflow.metrics.updated';
exports.WORKFLOW_METRICS_UPDATED_VERSION = 1;
exports.ACTION_METRICS_UPDATED = 'dental.automation.action.metrics.updated';
exports.ACTION_METRICS_UPDATED_VERSION = 1;
exports.PERFORMANCE_THRESHOLD_EXCEEDED = 'dental.automation.performance.threshold_exceeded';
exports.PERFORMANCE_THRESHOLD_EXCEEDED_VERSION = 1;
exports.DUPLICATE_RUN_DETECTED = 'dental.automation.duplicate_run.detected';
exports.DUPLICATE_RUN_DETECTED_VERSION = 1;
exports.IDEMPOTENCY_KEY_GENERATED = 'dental.automation.idempotency_key.generated';
exports.IDEMPOTENCY_KEY_GENERATED_VERSION = 1;
exports.WEBHOOK_CALLED = 'dental.automation.webhook.called';
exports.WEBHOOK_CALLED_VERSION = 1;
exports.SERVICE_CALLED = 'dental.automation.service.called';
exports.SERVICE_CALLED_VERSION = 1;
exports.EVENT_EMITTED = 'dental.automation.event.emitted';
exports.EVENT_EMITTED_VERSION = 1;
function isWorkflowLifecycleEvent(event) {
    return [
        exports.WORKFLOW_CREATED,
        exports.WORKFLOW_UPDATED,
        exports.WORKFLOW_ACTIVATED,
        exports.WORKFLOW_DEACTIVATED,
        exports.WORKFLOW_DELETED,
    ].includes(event.type);
}
function isWorkflowExecutionEvent(event) {
    return [
        exports.WORKFLOW_RUN_STARTED,
        exports.WORKFLOW_RUN_COMPLETED,
        exports.WORKFLOW_RUN_FAILED,
        exports.WORKFLOW_RUN_CANCELLED,
        exports.WORKFLOW_RUN_TIMED_OUT,
    ].includes(event.type);
}
function isActionExecutionEvent(event) {
    return [exports.ACTION_STARTED, exports.ACTION_COMPLETED, exports.ACTION_FAILED, exports.ACTION_RETRYING, exports.ACTION_SKIPPED].includes(event.type);
}
function isErrorEvent(event) {
    return [exports.WORKFLOW_ERROR, exports.ACTION_ERROR, exports.SYSTEM_ERROR, exports.CONDITION_ERROR].includes(event.type);
}
function isMonitoringEvent(event) {
    return [exports.WORKFLOW_METRICS_UPDATED, exports.ACTION_METRICS_UPDATED, exports.PERFORMANCE_THRESHOLD_EXCEEDED].includes(event.type);
}
function isIntegrationEvent(event) {
    return [exports.WEBHOOK_CALLED, exports.SERVICE_CALLED, exports.EVENT_EMITTED].includes(event.type);
}
//# sourceMappingURL=automation.events.js.map