/**
 * Shared Events Package
 *
 * Event contracts, envelopes, and infrastructure for event-driven architecture
 * in the Dental OS monorepo.
 *
 * This package provides:
 * - Event envelope and metadata structures
 * - Domain event contracts for core entities
 * - Publisher interfaces for event publishing
 * - Routing utilities and exchange constants
 * - Outbox pattern interfaces
 * - Zod validation schemas
 *
 * @module shared-events
 * @packageDocumentation
 */

// ============================================================================
// Envelope
// ============================================================================
export { EventMetadata } from './envelope/event-metadata';
export { EventEnvelope, TenantContext } from './envelope/event-envelope';

// ============================================================================
// Event Contracts
// ============================================================================

// User Events
export { UserCreated, UserUpdated, UserDeleted } from './contracts/user.events';

// Tenant Events
export {
  TenantCreated,
  TenantUpdated,
  TenantDeleted,
  ClinicCreated,
  ClinicUpdated,
  ClinicDeleted,
} from './contracts/tenant.events';

// Patient Events (Legacy Contracts)
export {
  PatientCreated,
  PatientUpdated,
  PatientDeleted,
} from './contracts/patient.events';

// Patient Events (New Event Envelopes)
export {
  PATIENT_CREATED_EVENT,
  PATIENT_CREATED_EVENT_VERSION,
  isPatientCreatedEvent,
  createPatientCreatedEvent,
  PATIENT_UPDATED_EVENT,
  PATIENT_UPDATED_EVENT_VERSION,
  isPatientUpdatedEvent,
  createPatientUpdatedEvent,
  PATIENT_MERGED_EVENT,
  PATIENT_MERGED_EVENT_VERSION,
  isPatientMergedEvent,
  createPatientMergedEvent,
  PATIENT_DELETED_EVENT,
  PATIENT_DELETED_EVENT_VERSION,
  isPatientDeletedEvent,
  createPatientDeletedEvent,
  PATIENT_ANONYMIZED_EVENT,
  PATIENT_ANONYMIZED_EVENT_VERSION,
  isPatientAnonymizedEvent,
  createPatientAnonymizedEvent,
} from './patient';

export type {
  PatientCreatedPayload,
  PatientCreatedEvent,
  PatientRegistrationSource,
  PatientGender,
  PatientStatus,
  EmergencyContact,
  PatientInsuranceInfo,
  PatientUpdatedPayload,
  PatientUpdatedEvent,
  PatientUpdateReason,
  ChangedField,
  PatientMergedPayload,
  PatientMergedEvent,
  MergeStrategy,
  MergeConflictResolution,
  MergedDataSummary,
  PatientDeletedPayload,
  PatientDeletedEvent,
  DeletionType,
  DeletionReason,
  RetentionPolicy,
  DeletionImpact,
  PatientAnonymizedPayload,
  PatientAnonymizedEvent,
  AnonymizationMethod,
  AnonymizationReason,
  AnonymizedField,
  RetainedDataDetails,
  AnonymizationImpact,
} from './patient';

// Appointment Events (Legacy Contracts)
export {
  AppointmentBooked,
  AppointmentRescheduled,
  AppointmentCancelled,
  AppointmentCompleted,
} from './contracts/appointment.events';

// Scheduling Events (New Event Envelopes)
export {
  APPOINTMENT_BOOKED_EVENT_TYPE,
  APPOINTMENT_BOOKED_EVENT_VERSION,
  isAppointmentBookedEvent,
  createAppointmentBookedEvent,
  APPOINTMENT_RESCHEDULED_EVENT_TYPE,
  APPOINTMENT_RESCHEDULED_EVENT_VERSION,
  isAppointmentRescheduledEvent,
  createAppointmentRescheduledEvent,
  APPOINTMENT_CANCELED_EVENT_TYPE,
  APPOINTMENT_CANCELED_EVENT_VERSION,
  isAppointmentCanceledEvent,
  createAppointmentCanceledEvent,
} from './scheduling';

export type {
  AppointmentBookedPayload,
  AppointmentBookedEvent,
  BookingSource,
  AppointmentPriority,
  ParticipantRole,
  AppointmentParticipantData,
  AppointmentRescheduledPayload,
  AppointmentRescheduledEvent,
  RescheduleReasonCategory,
  RescheduleInitiator,
  TimeSlotChange,
  ResourceChange,
  AppointmentCanceledPayload,
  AppointmentCanceledEvent,
  CancellationType,
  CancellationReasonCategory,
  CancellationPolicyDetails,
  CancellationNotificationDetails,
  ResourceReleaseDetails,
} from './scheduling';

// ============================================================================
// Clinical Events
// ============================================================================
export {
  CLINICAL_NOTE_CREATED_EVENT,
  CLINICAL_NOTE_CREATED_VERSION,
  isClinicalNoteCreatedEvent,
  createClinicalNoteCreatedEvent,
  TREATMENT_PLAN_CREATED_EVENT,
  TREATMENT_PLAN_CREATED_VERSION,
  isTreatmentPlanCreatedEvent,
  createTreatmentPlanCreatedEvent,
  TREATMENT_PLAN_UPDATED_EVENT,
  TREATMENT_PLAN_UPDATED_VERSION,
  isTreatmentPlanUpdatedEvent,
  createTreatmentPlanUpdatedEvent,
  PROCEDURE_COMPLETED_EVENT,
  PROCEDURE_COMPLETED_VERSION,
  isProcedureCompletedEvent,
  createProcedureCompletedEvent,
  CONSENT_SIGNED_EVENT,
  CONSENT_SIGNED_VERSION,
  isConsentSignedEvent,
  createConsentSignedEvent,
  TOOTH_STATUS_UPDATED_EVENT,
  TOOTH_STATUS_UPDATED_VERSION,
  isToothStatusUpdatedEvent,
  createToothStatusUpdatedEvent,
} from './clinical';

export type {
  ClinicalNoteCreatedPayload,
  ClinicalNoteCreatedEvent,
  ClinicalNoteType,
  TreatmentPlanCreatedPayload,
  TreatmentPlanCreatedEvent,
  TreatmentPlanUpdatedPayload,
  TreatmentPlanUpdatedEvent,
  TreatmentPlanChange,
  ProcedureCompletedPayload,
  ProcedureCompletedEvent,
  StockItemUsed,
  ConsentSignedPayload,
  ConsentSignedEvent,
  ConsentType,
  SignatureMethod,
  ToothStatusUpdatedPayload,
  ToothStatusUpdatedEvent,
  ToothNumberingSystem,
  ToothSurface,
  ToothCondition,
} from './clinical';

// ============================================================================
// Imaging Events
// ============================================================================
export {
  IMAGING_STUDY_CREATED_EVENT,
  IMAGING_STUDY_CREATED_VERSION,
  isImagingStudyCreatedEvent,
  createImagingStudyCreatedEvent,
  IMAGING_STUDY_UPDATED_EVENT,
  IMAGING_STUDY_UPDATED_VERSION,
  isImagingStudyUpdatedEvent,
  createImagingStudyUpdatedEvent,
  IMAGING_REPORT_CREATED_EVENT,
  IMAGING_REPORT_CREATED_VERSION,
  isImagingReportCreatedEvent,
  createImagingReportCreatedEvent,
  IMAGING_AI_RESULT_CREATED_EVENT,
  IMAGING_AI_RESULT_CREATED_VERSION,
  isImagingAIResultCreatedEvent,
  createImagingAIResultCreatedEvent,
} from './imaging';

export type {
  ImagingModality,
  ImagingRegion,
  ImagingStudyStatus,
  ReportStatus,
  ReportType,
  AIFindingSeverity,
  CriticalFinding,
  StudyChange,
  ImagingStudyCreatedPayload,
  ImagingStudyCreatedEvent,
  ImagingStudyUpdatedPayload,
  ImagingStudyUpdatedEvent,
  ImagingReportCreatedPayload,
  ImagingReportCreatedEvent,
  ImagingAIResultCreatedPayload,
  ImagingAIResultCreatedEvent,
} from './imaging';

// ============================================================================
// Inventory Events
// ============================================================================
export {
  STOCK_DEDUCTED_EVENT,
  STOCK_DEDUCTED_VERSION,
  isStockDeductedEvent,
  createStockDeductedEvent,
  STOCK_RESTOCKED_EVENT,
  STOCK_RESTOCKED_VERSION,
  isStockRestockedEvent,
  createStockRestockedEvent,
  STOCK_LOW_EVENT,
  STOCK_LOW_VERSION,
  isStockLowEvent,
  createStockLowEvent,
  STOCK_EXPIRED_EVENT,
  STOCK_EXPIRED_VERSION,
  isStockExpiredEvent,
  createStockExpiredEvent,
  PURCHASE_ORDER_CREATED_EVENT,
  PURCHASE_ORDER_CREATED_VERSION,
  isPurchaseOrderCreatedEvent,
  createPurchaseOrderCreatedEvent,
  GOODS_RECEIPT_CREATED_EVENT,
  GOODS_RECEIPT_CREATED_VERSION,
  isGoodsReceiptCreatedEvent,
  createGoodsReceiptCreatedEvent,
} from './inventory';

export type {
  StockDeductionReason,
  StockRestockReason,
  ExpiredStockAction,
  PurchaseOrderUrgency,
  GoodsReceiptItem,
  StockDeductedPayload,
  StockDeductedEvent,
  StockRestockedPayload,
  StockRestockedEvent,
  StockLowPayload,
  StockLowEvent,
  StockExpiredPayload,
  StockExpiredEvent,
  PurchaseOrderCreatedPayload,
  PurchaseOrderCreatedEvent,
  GoodsReceiptCreatedPayload,
  GoodsReceiptCreatedEvent,
} from './inventory';

// ============================================================================
// Billing Events
// ============================================================================
export {
  INVOICE_CREATED_EVENT,
  INVOICE_CREATED_VERSION,
  isInvoiceCreatedEvent,
  createInvoiceCreatedEvent,
  INVOICE_PAID_EVENT,
  INVOICE_PAID_VERSION,
  isInvoicePaidEvent,
  createInvoicePaidEvent,
  PAYMENT_RECEIVED_EVENT,
  PAYMENT_RECEIVED_VERSION,
  isPaymentReceivedEvent,
  createPaymentReceivedEvent,
  PAYMENT_REFUNDED_EVENT,
  PAYMENT_REFUNDED_VERSION,
  isPaymentRefundedEvent,
  createPaymentRefundedEvent,
  INVOICE_OVERDUE_EVENT,
  INVOICE_OVERDUE_VERSION,
  isInvoiceOverdueEvent,
  createInvoiceOverdueEvent,
  LEDGER_ENTRY_CREATED_EVENT,
  LEDGER_ENTRY_CREATED_VERSION,
  isLedgerEntryCreatedEvent,
  createLedgerEntryCreatedEvent,
} from './billing';

export type {
  InvoiceStatus,
  PaymentMethod,
  LedgerEntryType,
  RefundReason,
  CurrencyCode,
  InvoiceCreatedPayload,
  InvoiceCreatedEvent,
  InvoicePaidPayload,
  InvoicePaidEvent,
  PaymentReceivedPayload,
  PaymentReceivedEvent,
  PaymentRefundedPayload,
  PaymentRefundedEvent,
  InvoiceOverduePayload,
  InvoiceOverdueEvent,
  LedgerEntryCreatedPayload,
  LedgerEntryCreatedEvent,
} from './billing';

// ============================================================================
// Marketing Events
// ============================================================================
export {
  // Campaign events
  CAMPAIGN_CREATED,
  CAMPAIGN_UPDATED,
  CAMPAIGN_TRIGGERED,
  CAMPAIGN_DELIVERED,
  CAMPAIGN_OPENED,
  CAMPAIGN_CLICKED,
  CAMPAIGN_UNSUBSCRIBED,
  // Segment events
  SEGMENT_CREATED,
  SEGMENT_REFRESHED,
  SEGMENT_PATIENT_ADDED,
  SEGMENT_PATIENT_REMOVED,
  // Referral events
  REFERRAL_CREATED,
  REFERRAL_COMPLETED,
  REFERRAL_REDEEMED,
  REFERRAL_EXPIRED,
  // Loyalty events
  LOYALTY_ACCOUNT_CREATED,
  LOYALTY_POINTS_ACCRUED,
  LOYALTY_POINTS_REDEEMED,
  LOYALTY_POINTS_EXPIRED,
  LOYALTY_TIER_UPGRADED,
  LOYALTY_TIER_DOWNGRADED,
  // Feedback events
  FEEDBACK_RECEIVED,
  FEEDBACK_POSITIVE,
  FEEDBACK_NEGATIVE,
  // NPS events
  NPS_SUBMITTED,
  NPS_PROMOTER,
  NPS_DETRACTOR,
  // Automation events
  AUTOMATION_TRIGGERED,
  AUTOMATION_EXECUTED,
  // Delivery events
  DELIVERY_QUEUED,
  DELIVERY_SENT,
  DELIVERY_FAILED,
  DELIVERY_BOUNCED,
  // Version constants
  CAMPAIGN_CREATED_VERSION,
  CAMPAIGN_UPDATED_VERSION,
  CAMPAIGN_TRIGGERED_VERSION,
  CAMPAIGN_DELIVERED_VERSION,
  CAMPAIGN_OPENED_VERSION,
  CAMPAIGN_CLICKED_VERSION,
  CAMPAIGN_UNSUBSCRIBED_VERSION,
  SEGMENT_CREATED_VERSION,
  SEGMENT_REFRESHED_VERSION,
  SEGMENT_PATIENT_ADDED_VERSION,
  SEGMENT_PATIENT_REMOVED_VERSION,
  REFERRAL_CREATED_VERSION,
  REFERRAL_COMPLETED_VERSION,
  REFERRAL_REDEEMED_VERSION,
  REFERRAL_EXPIRED_VERSION,
  LOYALTY_ACCOUNT_CREATED_VERSION,
  LOYALTY_POINTS_ACCRUED_VERSION,
  LOYALTY_POINTS_REDEEMED_VERSION,
  LOYALTY_POINTS_EXPIRED_VERSION,
  LOYALTY_TIER_UPGRADED_VERSION,
  LOYALTY_TIER_DOWNGRADED_VERSION,
  FEEDBACK_RECEIVED_VERSION,
  FEEDBACK_POSITIVE_VERSION,
  FEEDBACK_NEGATIVE_VERSION,
  NPS_SUBMITTED_VERSION,
  NPS_PROMOTER_VERSION,
  NPS_DETRACTOR_VERSION,
  AUTOMATION_TRIGGERED_VERSION,
  AUTOMATION_EXECUTED_VERSION,
  DELIVERY_QUEUED_VERSION,
  DELIVERY_SENT_VERSION,
  DELIVERY_FAILED_VERSION,
  DELIVERY_BOUNCED_VERSION,
} from './marketing';

export type {
  // Branded types
  CampaignId,
  SegmentId,
  DeliveryLogId,
  ReferralId,
  LoyaltyAccountId,
  FeedbackId,
  NpsScoreId,
  AutomationRuleId,
  // Enumerations
  MarketingChannel,
  CampaignStatus,
  DeliveryStatus,
  RewardType,
  LoyaltyTier,
  PointsSource,
  FeedbackCategory,
  Sentiment,
  NpsCategory,
  AutomationTriggerType,
  AutomationActionType,
  UnsubscribeReason,
  // Shared types
  SegmentRule,
  CampaignChange,
  AutomationAction,
  // Campaign events
  CampaignCreatedPayload,
  CampaignCreatedEvent,
  CampaignUpdatedPayload,
  CampaignUpdatedEvent,
  CampaignTriggeredPayload,
  CampaignTriggeredEvent,
  CampaignDeliveredPayload,
  CampaignDeliveredEvent,
  CampaignOpenedPayload,
  CampaignOpenedEvent,
  CampaignClickedPayload,
  CampaignClickedEvent,
  CampaignUnsubscribedPayload,
  CampaignUnsubscribedEvent,
  // Segment events
  SegmentCreatedPayload,
  SegmentCreatedEvent,
  SegmentRefreshedPayload,
  SegmentRefreshedEvent,
  SegmentPatientAddedPayload,
  SegmentPatientAddedEvent,
  SegmentPatientRemovedPayload,
  SegmentPatientRemovedEvent,
  // Referral events
  ReferralCreatedPayload,
  ReferralCreatedEvent,
  ReferralCompletedPayload,
  ReferralCompletedEvent,
  ReferralRedeemedPayload,
  ReferralRedeemedEvent,
  ReferralExpiredPayload,
  ReferralExpiredEvent,
  // Loyalty events
  LoyaltyAccountCreatedPayload,
  LoyaltyAccountCreatedEvent,
  LoyaltyPointsAccruedPayload,
  LoyaltyPointsAccruedEvent,
  LoyaltyPointsRedeemedPayload,
  LoyaltyPointsRedeemedEvent,
  LoyaltyPointsExpiredPayload,
  LoyaltyPointsExpiredEvent,
  LoyaltyTierUpgradedPayload,
  LoyaltyTierUpgradedEvent,
  LoyaltyTierDowngradedPayload,
  LoyaltyTierDowngradedEvent,
  // Feedback events
  FeedbackReceivedPayload,
  FeedbackReceivedEvent,
  FeedbackPositivePayload,
  FeedbackPositiveEvent,
  FeedbackNegativePayload,
  FeedbackNegativeEvent,
  // NPS events
  NpsSubmittedPayload,
  NpsSubmittedEvent,
  NpsPromoterPayload,
  NpsPromoterEvent,
  NpsDetractorPayload,
  NpsDetractorEvent,
  // Automation events
  AutomationTriggeredPayload,
  AutomationTriggeredEvent,
  AutomationExecutedPayload,
  AutomationExecutedEvent,
  // Delivery events
  DeliveryQueuedPayload,
  DeliveryQueuedEvent,
  DeliverySentPayload,
  DeliverySentEvent,
  DeliveryFailedPayload,
  DeliveryFailedEvent,
  DeliveryBouncedPayload,
  DeliveryBouncedEvent,
} from './marketing';

// ============================================================================
// Automation Events
// ============================================================================
export {
  // Workflow lifecycle events
  WORKFLOW_CREATED,
  WORKFLOW_UPDATED,
  WORKFLOW_ACTIVATED,
  WORKFLOW_DEACTIVATED,
  WORKFLOW_DELETED,
  // Workflow execution events
  WORKFLOW_RUN_STARTED,
  WORKFLOW_RUN_COMPLETED,
  WORKFLOW_RUN_FAILED,
  WORKFLOW_RUN_CANCELLED,
  WORKFLOW_RUN_TIMED_OUT,
  // Action execution events
  ACTION_STARTED,
  ACTION_COMPLETED,
  ACTION_FAILED,
  ACTION_RETRYING,
  ACTION_SKIPPED,
  // Condition evaluation events
  CONDITION_EVALUATED,
  CONDITION_ERROR,
  // Trigger events
  TRIGGER_MATCHED,
  TRIGGER_FILTERED,
  // Retry events
  RETRY_SCHEDULED,
  RETRY_EXHAUSTED,
  // Error events
  WORKFLOW_ERROR,
  ACTION_ERROR,
  SYSTEM_ERROR,
  // Monitoring events
  WORKFLOW_METRICS_UPDATED,
  ACTION_METRICS_UPDATED,
  PERFORMANCE_THRESHOLD_EXCEEDED,
  // Idempotency events
  DUPLICATE_RUN_DETECTED,
  IDEMPOTENCY_KEY_GENERATED,
  // Integration events
  WEBHOOK_CALLED,
  SERVICE_CALLED,
  EVENT_EMITTED,
  // Version constants
  WORKFLOW_CREATED_VERSION,
  WORKFLOW_UPDATED_VERSION,
  WORKFLOW_ACTIVATED_VERSION,
  WORKFLOW_DEACTIVATED_VERSION,
  WORKFLOW_DELETED_VERSION,
  WORKFLOW_RUN_STARTED_VERSION,
  WORKFLOW_RUN_COMPLETED_VERSION,
  WORKFLOW_RUN_FAILED_VERSION,
  WORKFLOW_RUN_CANCELLED_VERSION,
  WORKFLOW_RUN_TIMED_OUT_VERSION,
  ACTION_STARTED_VERSION,
  ACTION_COMPLETED_VERSION,
  ACTION_FAILED_VERSION,
  ACTION_RETRYING_VERSION,
  ACTION_SKIPPED_VERSION,
  CONDITION_EVALUATED_VERSION,
  CONDITION_ERROR_VERSION,
  TRIGGER_MATCHED_VERSION,
  TRIGGER_FILTERED_VERSION,
  RETRY_SCHEDULED_VERSION,
  RETRY_EXHAUSTED_VERSION,
  WORKFLOW_ERROR_VERSION,
  ACTION_ERROR_VERSION,
  SYSTEM_ERROR_VERSION,
  WORKFLOW_METRICS_UPDATED_VERSION,
  ACTION_METRICS_UPDATED_VERSION,
  PERFORMANCE_THRESHOLD_EXCEEDED_VERSION,
  DUPLICATE_RUN_DETECTED_VERSION,
  IDEMPOTENCY_KEY_GENERATED_VERSION,
  WEBHOOK_CALLED_VERSION,
  SERVICE_CALLED_VERSION,
  EVENT_EMITTED_VERSION,
  // Type guards
  isWorkflowLifecycleEvent,
  isWorkflowExecutionEvent,
  isActionExecutionEvent,
  isErrorEvent,
  isMonitoringEvent,
  isIntegrationEvent,
} from './automation';

export type {
  // Branded types
  AutomationWorkflowId,
  WorkflowRunId,
  ActionRunId,
  // Enumerations
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowStatus,
  WorkflowRunStatus,
  ActionRunStatus,
  ErrorType,
  // Shared types
  ErrorContext,
  RetryContext,
  PerformanceMetrics,
  WorkflowChange,
  // Workflow lifecycle events
  WorkflowCreatedPayload,
  WorkflowCreatedEvent,
  WorkflowUpdatedPayload,
  WorkflowUpdatedEvent,
  WorkflowActivatedPayload,
  WorkflowActivatedEvent,
  WorkflowDeactivatedPayload,
  WorkflowDeactivatedEvent,
  WorkflowDeletedPayload,
  WorkflowDeletedEvent,
  // Workflow execution events
  WorkflowRunStartedPayload,
  WorkflowRunStartedEvent,
  WorkflowRunCompletedPayload,
  WorkflowRunCompletedEvent,
  WorkflowRunFailedPayload,
  WorkflowRunFailedEvent,
  WorkflowRunCancelledPayload,
  WorkflowRunCancelledEvent,
  WorkflowRunTimedOutPayload,
  WorkflowRunTimedOutEvent,
  // Action execution events
  ActionStartedPayload,
  ActionStartedEvent,
  ActionCompletedPayload,
  ActionCompletedEvent,
  ActionFailedPayload,
  ActionFailedEvent,
  ActionRetryingPayload,
  ActionRetryingEvent,
  ActionSkippedPayload,
  ActionSkippedEvent,
  // Condition evaluation events
  ConditionEvaluatedPayload,
  ConditionEvaluatedEvent,
  ConditionErrorPayload,
  ConditionErrorEvent,
  // Trigger events
  TriggerMatchedPayload,
  TriggerMatchedEvent,
  TriggerFilteredPayload,
  TriggerFilteredEvent,
  // Retry events
  RetryScheduledPayload,
  RetryScheduledEvent,
  RetryExhaustedPayload,
  RetryExhaustedEvent,
  // Error events
  WorkflowErrorPayload,
  WorkflowErrorEvent,
  ActionErrorPayload,
  ActionErrorEvent,
  SystemErrorPayload,
  SystemErrorEvent,
  // Monitoring events
  WorkflowMetricsUpdatedPayload,
  WorkflowMetricsUpdatedEvent,
  ActionMetricsUpdatedPayload,
  ActionMetricsUpdatedEvent,
  PerformanceThresholdExceededPayload,
  PerformanceThresholdExceededEvent,
  // Idempotency events
  DuplicateRunDetectedPayload,
  DuplicateRunDetectedEvent,
  IdempotencyKeyGeneratedPayload,
  IdempotencyKeyGeneratedEvent,
  // Integration events
  WebhookCalledPayload,
  WebhookCalledEvent,
  ServiceCalledPayload,
  ServiceCalledEvent,
  EventEmittedPayload,
  EventEmittedEvent,
  // Union types
  AutomationEventPayload,
  AutomationEvent,
} from './automation';

// ============================================================================
// Patient Portal Events
// ============================================================================
export {
  // Patient Auth Events
  PATIENT_REGISTERED,
  PATIENT_LOGGED_IN,
  PATIENT_LOGGED_OUT,
  PATIENT_MFA_ENABLED,
  PATIENT_PASSWORD_CHANGED,
  // Patient Profile Events
  PATIENT_PROFILE_VIEWED,
  PATIENT_PROFILE_UPDATED,
  PATIENT_PREFERENCES_UPDATED,
  // Patient Appointment Events
  PATIENT_APPOINTMENT_VIEWED,
  PATIENT_APPOINTMENT_BOOKED,
  PATIENT_APPOINTMENT_RESCHEDULED,
  PATIENT_APPOINTMENT_CANCELLED,
  // Patient Clinical Events
  PATIENT_CLINICAL_SUMMARY_VIEWED,
  PATIENT_VISIT_DETAILS_VIEWED,
  PATIENT_TREATMENT_PLAN_VIEWED,
  // Patient Imaging Events
  PATIENT_IMAGING_LIST_VIEWED,
  PATIENT_IMAGING_STUDY_VIEWED,
  // Patient Billing Events
  PATIENT_INVOICES_VIEWED,
  PATIENT_INVOICE_VIEWED,
  PATIENT_PAYMENT_INITIATED,
  PATIENT_PAYMENT_COMPLETED,
  PATIENT_PAYMENT_FAILED,
  // Patient Engagement Events
  PATIENT_LOYALTY_VIEWED,
  PATIENT_REFERRAL_SHARED,
  PATIENT_OFFER_VIEWED,
  PATIENT_OFFER_REDEEMED,
  PATIENT_FEEDBACK_SUBMITTED,
  PATIENT_NPS_SUBMITTED,
  // Patient GDPR Events
  PATIENT_DATA_EXPORT_REQUESTED,
  PATIENT_DATA_EXPORT_DOWNLOADED,
  PATIENT_DELETION_REQUESTED,
  PATIENT_CONSENT_UPDATED,
  // Patient Session Events
  PATIENT_SESSION_STARTED,
  PATIENT_SESSION_ENDED,
  // Patient Error Events
  PATIENT_ERROR_OCCURRED,
  // Version constants
  PATIENT_REGISTERED_VERSION,
  PATIENT_LOGGED_IN_VERSION,
  PATIENT_LOGGED_OUT_VERSION,
  PATIENT_MFA_ENABLED_VERSION,
  PATIENT_PASSWORD_CHANGED_VERSION,
  PATIENT_PROFILE_VIEWED_VERSION,
  PATIENT_PROFILE_UPDATED_VERSION,
  PATIENT_PREFERENCES_UPDATED_VERSION,
  PATIENT_APPOINTMENT_VIEWED_VERSION,
  PATIENT_APPOINTMENT_BOOKED_VERSION,
  PATIENT_APPOINTMENT_RESCHEDULED_VERSION,
  PATIENT_APPOINTMENT_CANCELLED_VERSION,
  PATIENT_CLINICAL_SUMMARY_VIEWED_VERSION,
  PATIENT_VISIT_DETAILS_VIEWED_VERSION,
  PATIENT_TREATMENT_PLAN_VIEWED_VERSION,
  PATIENT_IMAGING_LIST_VIEWED_VERSION,
  PATIENT_IMAGING_STUDY_VIEWED_VERSION,
  PATIENT_INVOICES_VIEWED_VERSION,
  PATIENT_INVOICE_VIEWED_VERSION,
  PATIENT_PAYMENT_INITIATED_VERSION,
  PATIENT_PAYMENT_COMPLETED_VERSION,
  PATIENT_PAYMENT_FAILED_VERSION,
  PATIENT_LOYALTY_VIEWED_VERSION,
  PATIENT_REFERRAL_SHARED_VERSION,
  PATIENT_OFFER_VIEWED_VERSION,
  PATIENT_OFFER_REDEEMED_VERSION,
  PATIENT_FEEDBACK_SUBMITTED_VERSION,
  PATIENT_NPS_SUBMITTED_VERSION,
  PATIENT_DATA_EXPORT_REQUESTED_VERSION,
  PATIENT_DATA_EXPORT_DOWNLOADED_VERSION,
  PATIENT_DELETION_REQUESTED_VERSION,
  PATIENT_CONSENT_UPDATED_VERSION,
  PATIENT_SESSION_STARTED_VERSION,
  PATIENT_SESSION_ENDED_VERSION,
  PATIENT_ERROR_OCCURRED_VERSION,
} from './patient-portal';

export type {
  // Branded types for patient portal
  SessionId,
  VisitId,
  // Enumerations
  PortalSource,
  MobilePlatform,
  MfaMethod,
  DeviceType,
  PreferenceType,
  CancellationReason,
  RescheduleReason,
  PaymentErrorCode,
  ReferralChannel,
  // Shared types
  SessionContext,
  // Patient Auth Events
  PatientRegisteredPayload,
  PatientRegisteredEvent,
  PatientLoggedInPayload,
  PatientLoggedInEvent,
  PatientLoggedOutPayload,
  PatientLoggedOutEvent,
  PatientMfaEnabledPayload,
  PatientMfaEnabledEvent,
  PatientPasswordChangedPayload,
  PatientPasswordChangedEvent,
  // Patient Profile Events
  PatientProfileViewedPayload,
  PatientProfileViewedEvent,
  PatientProfileUpdatedPayload,
  PatientProfileUpdatedEvent,
  PatientPreferencesUpdatedPayload,
  PatientPreferencesUpdatedEvent,
  // Patient Appointment Events
  PatientAppointmentViewedPayload,
  PatientAppointmentViewedEvent,
  PatientAppointmentBookedPayload,
  PatientAppointmentBookedEvent,
  PatientAppointmentRescheduledPayload,
  PatientAppointmentRescheduledEvent,
  PatientAppointmentCancelledPayload,
  PatientAppointmentCancelledEvent,
  // Patient Clinical Events
  PatientClinicalSummaryViewedPayload,
  PatientClinicalSummaryViewedEvent,
  PatientVisitDetailsViewedPayload,
  PatientVisitDetailsViewedEvent,
  PatientTreatmentPlanViewedPayload,
  PatientTreatmentPlanViewedEvent,
  // Patient Imaging Events
  PatientImagingListViewedPayload,
  PatientImagingListViewedEvent,
  PatientImagingStudyViewedPayload,
  PatientImagingStudyViewedEvent,
  // Patient Billing Events
  PatientInvoicesViewedPayload,
  PatientInvoicesViewedEvent,
  PatientInvoiceViewedPayload,
  PatientInvoiceViewedEvent,
  PatientPaymentInitiatedPayload,
  PatientPaymentInitiatedEvent,
  PatientPaymentCompletedPayload,
  PatientPaymentCompletedEvent,
  PatientPaymentFailedPayload,
  PatientPaymentFailedEvent,
  // Patient Engagement Events
  PatientLoyaltyViewedPayload,
  PatientLoyaltyViewedEvent,
  PatientReferralSharedPayload,
  PatientReferralSharedEvent,
  PatientOfferViewedPayload,
  PatientOfferViewedEvent,
  PatientOfferRedeemedPayload,
  PatientOfferRedeemedEvent,
  PatientFeedbackSubmittedPayload,
  PatientFeedbackSubmittedEvent,
  PatientNpsSubmittedPayload,
  PatientNpsSubmittedEvent,
  // Patient GDPR Events
  PatientDataExportRequestedPayload,
  PatientDataExportRequestedEvent,
  PatientDataExportDownloadedPayload,
  PatientDataExportDownloadedEvent,
  PatientDeletionRequestedPayload,
  PatientDeletionRequestedEvent,
  PatientConsentUpdatedPayload,
  PatientConsentUpdatedEvent,
  // Patient Session Events
  PatientSessionStartedPayload,
  PatientSessionStartedEvent,
  PatientSessionEndedPayload,
  PatientSessionEndedEvent,
  // Patient Error Events
  PatientErrorOccurredPayload,
  PatientErrorOccurredEvent,
} from './patient-portal';

// ============================================================================
// Publishers
// ============================================================================
export {
  EventPublisher,
  PublisherError,
} from './publishers/event-publisher.interface';

export {
  DomainEventBus,
  EventHandler,
  EventBusError,
} from './publishers/domain-event-bus.interface';

// ============================================================================
// Routing
// ============================================================================
export {
  DOMAIN_EVENTS_EXCHANGE,
  INTEGRATION_EVENTS_EXCHANGE,
  DEAD_LETTER_EXCHANGE,
  ExchangeName,
} from './routing/exchange.constants';

export {
  buildRoutingKey,
  parseRoutingKey,
  matchesPattern,
  RoutingKeyComponents,
} from './routing/routing-key.builder';

// ============================================================================
// Outbox
// ============================================================================
export {
  OutboxEvent,
  OutboxEventStatus,
  CreateOutboxEventInput,
  OutboxEventFilter,
} from './outbox/outbox-event.interface';

// ============================================================================
// AI Events
// ============================================================================
export {
  AI_JOB_CREATED_EVENT_TYPE,
  AI_JOB_CREATED_EVENT_VERSION,
  isAIJobCreatedEvent,
  createAIJobCreatedEvent,
  AI_JOB_STARTED_EVENT_TYPE,
  AI_JOB_STARTED_EVENT_VERSION,
  isAIJobStartedEvent,
  createAIJobStartedEvent,
  AI_JOB_COMPLETED_EVENT_TYPE,
  AI_JOB_COMPLETED_EVENT_VERSION,
  isAIJobCompletedEvent,
  createAIJobCompletedEvent,
  AI_JOB_FAILED_EVENT_TYPE,
  AI_JOB_FAILED_EVENT_VERSION,
  isAIJobFailedEvent,
  createAIJobFailedEvent,
  AI_PREDICTION_GENERATED_EVENT_TYPE,
  AI_PREDICTION_GENERATED_EVENT_VERSION,
  isAIPredictionGeneratedEvent,
  createAIPredictionGeneratedEvent,
  AI_PATIENT_RISK_UPDATED_EVENT_TYPE,
  AI_PATIENT_RISK_UPDATED_EVENT_VERSION,
  isAIPatientRiskUpdatedEvent,
  createAIPatientRiskUpdatedEvent,
  AI_IMAGING_FINDINGS_GENERATED_EVENT_TYPE,
  AI_IMAGING_FINDINGS_GENERATED_EVENT_VERSION,
  isAIImagingFindingsGeneratedEvent,
  createAIImagingFindingsGeneratedEvent,
  AI_CHURN_SCORE_GENERATED_EVENT_TYPE,
  AI_CHURN_SCORE_GENERATED_EVENT_VERSION,
  isAIChurnScoreGeneratedEvent,
  createAIChurnScoreGeneratedEvent,
  AI_SCHEDULING_FORECAST_GENERATED_EVENT_TYPE,
  AI_SCHEDULING_FORECAST_GENERATED_EVENT_VERSION,
  isAISchedulingForecastGeneratedEvent,
  createAISchedulingForecastGeneratedEvent,
  AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_TYPE,
  AI_MARKETING_PERSONALIZATION_GENERATED_EVENT_VERSION,
  isAIMarketingPersonalizationGeneratedEvent,
  createAIMarketingPersonalizationGeneratedEvent,
} from './ai';

export type {
  AIJobCreatedPayload,
  AIJobCreatedEvent,
  AIJobStartedPayload,
  AIJobStartedEvent,
  AIJobCompletedPayload,
  AIJobCompletedEvent,
  AIJobFailedPayload,
  AIJobFailedEvent,
  AIPredictionGeneratedPayload,
  AIPredictionGeneratedEvent,
  AIPatientRiskUpdatedPayload,
  AIPatientRiskUpdatedEvent,
  AIImagingFindingsGeneratedPayload,
  AIImagingFindingsGeneratedEvent,
  AIChurnScoreGeneratedPayload,
  AIChurnScoreGeneratedEvent,
  AISchedulingForecastGeneratedPayload,
  AISchedulingForecastGeneratedEvent,
  AIMarketingPersonalizationGeneratedPayload,
  AIMarketingPersonalizationGeneratedEvent,
} from './ai';

// ============================================================================
// HR & Workforce Events
// ============================================================================
export {
  STAFF_CREATED_EVENT_TYPE,
  STAFF_CREATED_EVENT_VERSION,
  isStaffCreatedEvent,
  createStaffCreatedEvent,
  STAFF_UPDATED_EVENT_TYPE,
  STAFF_UPDATED_EVENT_VERSION,
  isStaffUpdatedEvent,
  createStaffUpdatedEvent,
  STAFF_STATUS_CHANGED_EVENT_TYPE,
  STAFF_STATUS_CHANGED_EVENT_VERSION,
  isStaffStatusChangedEvent,
  createStaffStatusChangedEvent,
  SHIFT_CREATED_EVENT_TYPE,
  SHIFT_CREATED_EVENT_VERSION,
  isShiftCreatedEvent,
  createShiftCreatedEvent,
  SHIFT_ASSIGNED_EVENT_TYPE,
  SHIFT_ASSIGNED_EVENT_VERSION,
  isShiftAssignedEvent,
  createShiftAssignedEvent,
  ABSENCE_CREATED_EVENT_TYPE,
  ABSENCE_CREATED_EVENT_VERSION,
  isAbsenceCreatedEvent,
  createAbsenceCreatedEvent,
  TASK_CREATED_EVENT_TYPE,
  TASK_CREATED_EVENT_VERSION,
  isTaskCreatedEvent,
  createTaskCreatedEvent,
  TASK_COMPLETED_EVENT_TYPE,
  TASK_COMPLETED_EVENT_VERSION,
  isTaskCompletedEvent,
  createTaskCompletedEvent,
  TASK_ESCALATED_EVENT_TYPE,
  TASK_ESCALATED_EVENT_VERSION,
  isTaskEscalatedEvent,
  createTaskEscalatedEvent,
} from './hr';

export type {
  StaffCreatedPayload,
  StaffCreatedEvent,
  StaffUpdatedPayload,
  StaffUpdatedEvent,
  StaffStatusChangedPayload,
  StaffStatusChangedEvent,
  ShiftCreatedPayload,
  ShiftCreatedEvent,
  ShiftAssignedPayload,
  ShiftAssignedEvent,
  AbsenceCreatedPayload,
  AbsenceCreatedEvent,
  TaskCreatedPayload,
  TaskCreatedEvent,
  TaskCompletedPayload,
  TaskCompletedEvent,
  TaskEscalatedPayload,
  TaskEscalatedEvent,
} from './hr';

// ============================================================================
// Sterilization & Clinical Logistics Events
// ============================================================================
export {
  STERILIZATION_CYCLE_CREATED_EVENT_TYPE,
  STERILIZATION_CYCLE_CREATED_EVENT_VERSION,
  STERILIZATION_CYCLE_COMPLETED_EVENT_TYPE,
  STERILIZATION_CYCLE_COMPLETED_EVENT_VERSION,
  STERILIZATION_INSTRUMENT_RETIRED_EVENT_TYPE,
  STERILIZATION_INSTRUMENT_RETIRED_EVENT_VERSION,
  LAB_CASE_CREATED_EVENT_TYPE,
  LAB_CASE_CREATED_EVENT_VERSION,
  LAB_CASE_SENT_EVENT_TYPE,
  LAB_CASE_SENT_EVENT_VERSION,
  LAB_CASE_RECEIVED_EVENT_TYPE,
  LAB_CASE_RECEIVED_EVENT_VERSION,
  LAB_CASE_REJECTED_EVENT_TYPE,
  LAB_CASE_REJECTED_EVENT_VERSION,
  CLINICAL_ROOM_PREP_REQUIRED_EVENT_TYPE,
  CLINICAL_ROOM_PREP_REQUIRED_EVENT_VERSION,
  isSterilizationCycleCreatedEvent,
  createSterilizationCycleCreatedEvent,
  isSterilizationCycleCompletedEvent,
  createSterilizationCycleCompletedEvent,
  isSterilizationInstrumentRetiredEvent,
  createSterilizationInstrumentRetiredEvent,
  isLabCaseCreatedEvent,
  createLabCaseCreatedEvent,
  isLabCaseSentEvent,
  createLabCaseSentEvent,
  isLabCaseReceivedEvent,
  createLabCaseReceivedEvent,
  isLabCaseRejectedEvent,
  createLabCaseRejectedEvent,
  isClinicalRoomPrepRequiredEvent,
  createClinicalRoomPrepRequiredEvent,
} from './sterilization';

export type {
  SterilizationCycleCreatedPayload,
  SterilizationCycleCreatedEvent,
  SterilizationCycleCompletedPayload,
  SterilizationCycleCompletedEvent,
  SterilizationInstrumentRetiredPayload,
  SterilizationInstrumentRetiredEvent,
  LabCaseCreatedPayload,
  LabCaseCreatedEvent,
  LabCaseSentPayload,
  LabCaseSentEvent,
  LabCaseReceivedPayload,
  LabCaseReceivedEvent,
  LabCaseRejectedPayload,
  LabCaseRejectedEvent,
  ClinicalRoomPrepRequiredPayload,
  ClinicalRoomPrepRequiredEvent,
} from './sterilization';

// ============================================================================
// Enterprise Events
// ============================================================================
export {
  ENTERPRISE_ORGANIZATION_CREATED_EVENT_TYPE,
  ENTERPRISE_ORGANIZATION_CREATED_EVENT_VERSION,
  ENTERPRISE_CLINIC_CREATED_EVENT_TYPE,
  ENTERPRISE_CLINIC_CREATED_EVENT_VERSION,
  ENTERPRISE_STAFF_ASSIGNED_EVENT_TYPE,
  ENTERPRISE_STAFF_ASSIGNED_EVENT_VERSION,
  ENTERPRISE_SETTINGS_UPDATED_EVENT_TYPE,
  ENTERPRISE_SETTINGS_UPDATED_EVENT_VERSION,
  isEnterpriseOrganizationCreatedEvent,
  createEnterpriseOrganizationCreatedEvent,
  isEnterpriseClinicCreatedEvent,
  createEnterpriseClinicCreatedEvent,
  isEnterpriseStaffAssignedEvent,
  createEnterpriseStaffAssignedEvent,
  isEnterpriseSettingsUpdatedEvent,
  createEnterpriseSettingsUpdatedEvent,
} from './enterprise';

export type {
  EnterpriseOrganizationCreatedPayload,
  EnterpriseOrganizationCreatedEvent,
  EnterpriseClinicCreatedPayload,
  EnterpriseClinicCreatedEvent,
  EnterpriseStaffAssignedPayload,
  EnterpriseStaffAssignedEvent,
  EnterpriseSettingsUpdatedPayload,
  EnterpriseSettingsUpdatedEvent,
} from './enterprise';

// ============================================================================
// Integration Events
// ============================================================================
export * from './integrations';

// ============================================================================
// Schemas
// ============================================================================
export {
  EventMetadataSchema,
  TenantContextSchema,
  EventEnvelopeSchema,
  BaseEventEnvelopeSchema,
  EventMetadataSchemaType,
  TenantContextSchemaType,
  BaseEventEnvelopeSchemaType,
} from './schemas/event-envelope.schema';

// Offline Sync Events
export * from './offline-sync';
