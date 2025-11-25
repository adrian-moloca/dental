/**
 * Shared Domain Module
 *
 * Domain-Driven Design building blocks for the Dental OS monorepo.
 * Provides base classes, value objects, domain events, and factories
 * for implementing clean domain models.
 *
 * @module shared-domain
 * @packageDocumentation
 */

// ============================================================================
// Entities
// ============================================================================
export { BaseEntity, AggregateRoot } from './entities';

// ============================================================================
// Value Objects
// ============================================================================
export {
  ValueObject,
  Email,
  Phone,
  PersonName,
  Money,
  Address,
  DateRange,
  TimeSlot,
} from './value-objects';

export type {
  PersonNameValue,
  MoneyValue,
  AddressValue,
  CreateAddressInput,
  DateRangeValue,
  TimeSlotValue,
} from './value-objects';

// ============================================================================
// Domain Events
// ============================================================================
export { DomainEvent } from './events';

export {
  DomainEventCategory,
  EntityEventType,
  AuditEventType,
  IntegrationEventType,
} from './events';

export type {
  EventMetadata,
  EventHandlerMetadata,
  EventCorrelation,
} from './events';

// ============================================================================
// Factories
// ============================================================================
export { EntityFactory, ValueObjectFactory } from './factories';

export type {
  TenantContext,
  EntityCreationOptions,
  BaseEntityFields,
  FactoryResult,
} from './factories';

// ============================================================================
// Scheduling Domain Types
// ============================================================================
export {
  AppointmentStatus,
  CancellationType,
  AppointmentPriority,
  ParticipantRole,
  DayOfWeek,
  TimeSlotType,
  AbsenceType,
  AbsenceStatus,
  ScheduleRecurrence,
  BookingRuleType,
  BookingRuleScope,
  ConflictResolutionStrategy as SchedulingConflictResolutionStrategy,
  WaitlistStatus,
  ConstraintType,
} from './scheduling';

export type {
  Appointment,
  AppointmentParticipant,
  RecurrenceRule,
  AppointmentNote,
  BookingMetadata,
  CancellationDetails,
  ConfirmationDetails,
  CheckInDetails,
  CompletionDetails,
  ResourceAllocation,
  AppointmentStatusTransition,
  AppointmentSummary,
  AppointmentFilter,
  TimeOfDay,
  TimeSlot as SchedulingTimeSlot,
  DailyWorkingHours,
  WorkPeriod,
  WeeklyHours,
  ScheduleException,
  ProviderAbsence,
  ProviderSchedule,
  AvailabilitySearchCriteria,
  AvailableSlot,
  AvailabilitySummary,
  BulkScheduleUpdate,
  TimeSlotConstraint,
  BookingRuleCondition,
  BookingRuleAction,
  BookingRule,
  ConflictDetectionResult,
  SchedulingConflict,
  ConflictResolution,
  WaitlistEntry,
  BookingPolicy,
  BookingValidationResult,
  OverbookingConfig,
  BookingCapacity,
} from './scheduling';

// ============================================================================
// Patient Domain Types
// ============================================================================
export {
  Gender,
  PatientStatus,
  RelationshipType,
  CommunicationChannel,
  PhoneType,
  EmailType,
} from './patient';

export type {
  PersonName as PatientPersonName,
  PhoneContact,
  EmailContact,
  PatientContacts,
  Demographics,
  MedicalFlags,
  InsuranceInfo,
  PatientInsurance,
  CommunicationPreferences,
  ConsentRecord,
  Patient,
  PatientRelationship,
  PatientTimelineEvent,
  PatientSearchCriteria,
  DuplicatePatientMatch,
  PatientGDPRExport,
} from './patient';

// ============================================================================
// Clinical Domain Types
// ============================================================================
export type {
  PatientId,
  ProviderId,
  ClinicalNoteId,
  TreatmentPlanId,
  ProcedureId,
  ConsentId,
  OdontogramId,
  PerioChartId,
  StockItemId,
  ProcedureCode,
  ToothNumber,
} from './clinical';

export {
  ToothSurface,
  ToothCondition,
  FurcationClass,
  ClinicalNoteType,
  TreatmentPlanStatus,
  ProcedureItemStatus,
  TreatmentPhase,
  ProcedureStatus,
  ConsentType,
  ConsentStatus,
} from './clinical';

export type {
  SurfaceCondition,
  ToothStatus,
  OdontogramEntry,
  Odontogram,
  PerioSite,
  PerioTooth,
  PerioChart,
  SOAPNote,
  AttachedFile,
  ClinicalNote,
  ProcedureItem,
  TreatmentOption,
  TreatmentPlan,
  ConsumedStockItem,
  AnesthesiaRecord,
  CompletedProcedure,
  DigitalSignature,
  ClinicalConsent,
  DiagnosticCode,
  PatientDiagnosis,
} from './clinical';

// ============================================================================
// Imaging & Diagnostics Domain Types
// ============================================================================
export type {
  ImagingStudyId,
  ImagingFileId,
  ImagingReportId,
  ImagingAIResultId,
  AnnotationId,
} from './imaging';

export {
  ImagingStudyStatus,
  ImagingModality,
  ImagingRegion,
  Quadrant,
  FileType,
  FindingSeverity,
  FindingType,
  AnnotationType,
  ReportType,
  ReportStatus,
  StudyPriority,
} from './imaging';

export type {
  RadiationExposure,
  ImageQualityMetrics,
  ClinicalIndication,
  PriorStudyReference,
  StudyOrder,
  ImagingStudy,
  DicomMetadata,
  FileStorageMetadata,
  ImagingFile,
  BoundingBox,
  Polygon,
  Annotation,
  AIFinding,
  AIModelInfo,
  ImagingAIResult,
  ReportSection,
  ReportTemplate,
  ReportSignature,
  ReportAmendment,
  ImagingReport,
} from './imaging';

// ============================================================================
// Inventory & Procurement Domain Types
// ============================================================================
export type {
  ProductId,
  ProductVariantId,
  SupplierId,
  PurchaseOrderId,
  GoodsReceiptId,
  LotId,
  StockLocationId,
  StockMovementId,
  SterilizationCycleId,
  BOMId,
  Currency,
} from './inventory';

export {
  ProductCategory,
  UnitOfMeasure,
  ProductStatus,
  StockStatus,
  MovementType,
  LotStatus,
  PurchaseOrderStatus,
  SupplierStatus,
} from './inventory';

export type {
  ProductVariant,
  Product,
  StockLocation,
  StockMovement,
  StockItem,
  Lot,
  ExpirationWarning,
  FEFORule,
  PurchaseOrderItem,
  PurchaseOrder,
  GoodsReceiptItem,
  GoodsReceipt,
  Supplier,
  MaterialUsage,
  ProcedureBillOfMaterials,
  CostAllocation,
  SterilizationCycleReference,
  SterilizableProduct,
  InstrumentCycleTracking,
} from './inventory';

// ============================================================================
// Billing, Invoicing, Payments & Finance Domain Types
// ============================================================================
export type {
  InvoiceId,
  PaymentId,
  InsuranceClaimId,
  LedgerEntryId,
  LedgerAccountId,
  RefundId,
  PriceRuleId,
  PaymentPlanId,
  CreditNoteId,
  InsurancePolicyId,
  TaxRateId,
  CommissionId,
  CUI,
  EFacturaNumber,
  PSPTransactionId,
  MoneyAmount,
} from './billing';

export {
  InvoiceStatus,
  ItemType,
  PaymentMethod,
  PaymentStatus,
  ClaimStatus,
  EntryType,
  AccountType,
  RuleType,
  CommissionType,
} from './billing';

export type {
  InvoiceItem,
  Invoice,
  SplitPaymentComponent,
  Payment,
  Refund,
  CoverageInfo,
  BenefitBreakdown,
  InsuranceClaim,
  LedgerEntry,
  PriceRule,
  TaxRate,
  PaymentPlan,
  CreditNote,
  BillableItem,
  ProcedureBilling,
  ImagingBilling,
  ProductBilling,
  Commission,
} from './billing';

// ============================================================================
// Marketing, Patient Engagement & Loyalty Domain Types
// ============================================================================
export type {
  CampaignId,
  SegmentId,
  ReferralId,
  LoyaltyAccountId,
  LoyaltyTransactionId,
  FeedbackId,
  NpsScoreId,
  AutomationRuleId,
  DeliveryLogId,
  CampaignTemplateId,
  AutomationExecutionId,
} from './marketing';

export {
  CampaignChannel,
  CampaignStatus,
  CampaignScheduleType,
  RecurrenceFrequency,
  SegmentRuleField,
  SegmentRuleOperator,
  SegmentRuleGroupOperator,
  SegmentType,
  ReferralStatus,
  ReferralRewardType,
  LoyaltyTier,
  LoyaltyTransactionType,
  LoyaltyAccrualSource,
  LoyaltyRedemptionType,
  FeedbackCategory,
  FeedbackSentiment,
  NpsCategory,
  AutomationTriggerType,
  AutomationActionType,
  DeliveryStatus,
  DeliveryProvider,
  ConsentType as MarketingConsentType,
} from './marketing';

export type {
  CampaignSchedule,
  RecurrenceRule as CampaignRecurrenceRule,
  CampaignTemplate,
  CampaignAttachment,
  CampaignMetrics,
  Campaign,
  SegmentRule,
  SegmentRuleGroup,
  Segment,
  ReferralReward,
  Referral,
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyAccrualRule,
  FeedbackRecord,
  NpsScore,
  NpsAggregate,
  AutomationCondition,
  AutomationAction,
  AutomationActionParams,
  SendCampaignParams,
  SendMessageParams,
  AccrueLoyaltyPointsParams,
  CreateReferralParams,
  SendNotificationParams,
  AddToSegmentParams,
  RemoveFromSegmentParams,
  CreateTaskParams,
  UpdatePatientTagsParams,
  SendWebhookParams,
  WaitParams,
  AutomationRule,
  AutomationExecution,
  DeliveryLog,
  CommunicationPreference,
  MarketingOpportunity,
  ChurnRiskScore,
  SentimentAnalysisResult,
} from './marketing';

// ============================================================================
// Patient Portal Domain Types (Patient-Facing DTOs)
// ============================================================================
export type {
  PatientPortalUserId,
  PatientAppointmentId,
  PatientInvoiceId,
  PatientReferralCode,
  PatientImagingStudyId,
  PatientTreatmentPlanId,
  PatientPaymentId,
} from './patient-portal';

export {
  PatientMfaMethod,
  PatientAppointmentStatus,
  PatientTreatmentPlanStatus,
  PatientImagingType,
  PatientInvoiceStatus,
  PatientLoyaltyTier,
  PatientReferralStatus,
  PatientDataExportStatus,
  PatientDeletionStatus,
  PatientConsentType,
  PatientErrorCode,
  PatientSortOrder,
  PatientConditionStatus,
  PatientAllergySeverity,
} from './patient-portal';

export type {
  PatientLoginRequest,
  PatientLoginResponse,
  PatientRegisterRequest,
  PatientMfaChallenge,
  PatientMfaVerification,
  PatientProfile,
  PatientProfileSummary,
  PatientContactInfo,
  PatientAddress,
  PatientCommunicationPreferences,
  PatientNotificationPreferences,
  PatientAppointment,
  PatientAppointmentBooking,
  PatientAppointmentReschedule,
  PatientAppointmentCancellation,
  PatientClinicalSummary,
  PatientVisit,
  PatientVisitAttachment,
  PatientTreatmentPlan,
  PatientTreatmentPlanProcedure,
  PatientPaymentPlanOption,
  PatientProcedure,
  PatientCondition,
  PatientAllergy,
  PatientImagingStudy,
  PatientInvoice,
  PatientInvoiceItem,
  PatientPayment,
  PatientBalance,
  PatientActivePaymentPlan,
  PatientPaymentRequest,
  PatientLoyaltyAccount,
  PatientLoyaltyTransaction,
  PatientReferral,
  PatientPendingReferral,
  PatientCompletedReferral,
  PatientOffer,
  PatientFeedbackRequest,
  PatientNpsRequest,
  PatientDataExport,
  PatientDeletionRequest,
  PatientConsent,
  PatientErrorResponse,
  PatientPaginatedResponse,
  PatientDateRange,
  PatientAppointmentFilter,
  PatientInvoiceFilter,
  PatientSortCriteria,
} from './patient-portal';

// ============================================================================
// AI Engine Domain Types
// ============================================================================
export {
  AIJobStatus,
  AITaskType,
} from './ai';

export type {
  AIJob,
  AIResult,
  AIContext,
  PatientContext,
  ClinicalContext,
  ImagingContext,
  BillingContext,
  SchedulingContext,
  MarketingContext,
  ChurnScore,
  ChurnFactor,
  NoShowPrediction,
  PredictionFactor,
  TreatmentRecommendation,
  RecommendedProcedure,
  ImagingFinding,
  Finding,
  Abnormality,
  InventoryForecast,
  ForecastedPeriod,
  RevenueForecast,
  ForecastedRevenuePeriod,
  RevenueFactor,
  EmbeddingVector,
} from './ai';

// ============================================================================
// HR & Workforce Domain Types
// ============================================================================
export {
  StaffRole,
  StaffStatus,
  ContractType,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  HRActivityType,
} from './hr';

export type {
  StaffId,
  ContractId,
  ShiftId,
  ShiftTemplateId,
  AvailabilitySlotId,
  AbsenceId,
  TaskId,
  TaskTemplateId,
  StaffMember,
  StaffContract,
  Shift,
  ShiftTemplate,
  AvailabilitySlot,
  Absence,
  Task,
  TaskTemplate,
  TaskAssignment,
  HRActivityLogEntry,
} from './hr';

// ============================================================================
// Sterilization & Clinical Logistics Domain Types
// ============================================================================
export {
  SterilizationCycleStatus,
  SterilizationCycleType,
  BiologicalIndicatorResult,
  InstrumentStatus,
  InstrumentType,
  LabCaseStatus,
  LabCaseType,
  ClinicalLogisticsTaskType,
  ClinicalLogisticsTaskStatus,
} from './sterilization';

export type {
  InstrumentId,
  LabCaseId,
  ClinicalLogisticsTaskId,
  SterilizationCycle,
  Instrument,
  LabCase,
  LabCaseEvent,
  ClinicalLogisticsTask,
  ChecklistItem,
  ConsumableRequirement,
} from './sterilization';

// ============================================================================
// Enterprise Types
// ============================================================================

export {
  OrganizationStatus,
  ClinicStatus,
  EnterpriseRole,
  ClinicRole,
  ClinicLocationType,
} from './enterprise';

export type {
  OrganizationId,
  ClinicId,
  ClinicLocationId,
  ProviderClinicAssignmentId,
  Organization,
  OrganizationSettings,
  OrganizationAdminUser,
  Clinic,
  ClinicSettings,
  ClinicLocation,
  ProviderClinicAssignment,
} from './enterprise';

// ============================================================================
// Integration Types
// ============================================================================

export * from './integrations';

// ============================================================================
// Offline Sync
// ============================================================================
export * from './offline-sync';

// ============================================================================
// Real-time Collaboration & Presence
// ============================================================================
export * from './realtime';
