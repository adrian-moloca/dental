import type { UUID, ISODateString, OrganizationId, ClinicId, TenantId, Metadata } from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { PatientId, ProviderId, ProcedureId } from '../clinical';
import type { InvoiceId } from '../billing';
export type UserId = UUID & {
    readonly __brand: 'UserId';
};
export type CampaignId = UUID & {
    readonly __brand: 'CampaignId';
};
export type SegmentId = UUID & {
    readonly __brand: 'SegmentId';
};
export type ReferralId = UUID & {
    readonly __brand: 'ReferralId';
};
export type LoyaltyAccountId = UUID & {
    readonly __brand: 'LoyaltyAccountId';
};
export type LoyaltyTransactionId = UUID & {
    readonly __brand: 'LoyaltyTransactionId';
};
export type FeedbackId = UUID & {
    readonly __brand: 'FeedbackId';
};
export type NpsScoreId = UUID & {
    readonly __brand: 'NpsScoreId';
};
export type AutomationRuleId = UUID & {
    readonly __brand: 'AutomationRuleId';
};
export type DeliveryLogId = UUID & {
    readonly __brand: 'DeliveryLogId';
};
export type CampaignTemplateId = UUID & {
    readonly __brand: 'CampaignTemplateId';
};
export type AutomationExecutionId = UUID & {
    readonly __brand: 'AutomationExecutionId';
};
export declare enum CampaignChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP"
}
export declare enum CampaignStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    PAUSED = "PAUSED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum CampaignScheduleType {
    IMMEDIATE = "IMMEDIATE",
    SCHEDULED = "SCHEDULED",
    RECURRING = "RECURRING"
}
export declare enum RecurrenceFrequency {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    QUARTERLY = "QUARTERLY",
    ANNUAL = "ANNUAL"
}
export interface CampaignSchedule {
    type: CampaignScheduleType;
    startDate?: ISODateString;
    endDate?: ISODateString;
    recurrenceRule?: RecurrenceRule;
    timezone?: string;
}
export interface RecurrenceRule {
    frequency: RecurrenceFrequency;
    interval: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    monthOfYear?: number;
    maxOccurrences?: number;
}
export interface CampaignTemplate {
    templateId?: CampaignTemplateId;
    subject?: string;
    body: string;
    variables: string[];
    attachments?: CampaignAttachment[];
    htmlBody?: string;
    previewText?: string;
    senderName?: string;
    replyTo?: string;
}
export interface CampaignAttachment {
    fileId: UUID;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url?: string;
}
export interface CampaignMetrics {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    complained: number;
    converted?: number;
    openRate?: number;
    clickRate?: number;
    bounceRate?: number;
    unsubscribeRate?: number;
    conversionRate?: number;
    lastUpdatedAt: ISODateString;
}
export interface Campaign {
    id: CampaignId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    campaignType: string;
    channel: CampaignChannel;
    template: CampaignTemplate;
    targetSegmentId: SegmentId;
    excludeSegmentIds?: SegmentId[];
    estimatedAudience?: number;
    schedule: CampaignSchedule;
    status: CampaignStatus;
    startedAt?: ISODateString;
    completedAt?: ISODateString;
    pausedAt?: ISODateString;
    cancelledAt?: ISODateString;
    cancellationReason?: string;
    metrics: CampaignMetrics;
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    trackConversions?: boolean;
    requiresMarketingConsent: boolean;
    complianceNotes?: string;
    createdBy: UserId;
    updatedBy: UserId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum SegmentRuleField {
    AGE = "AGE",
    GENDER = "GENDER",
    ZIP_CODE = "ZIP_CODE",
    LANGUAGE = "LANGUAGE",
    LAST_VISIT = "LAST_VISIT",
    FIRST_VISIT = "FIRST_VISIT",
    APPOINTMENT_COUNT = "APPOINTMENT_COUNT",
    CANCELLATION_COUNT = "CANCELLATION_COUNT",
    NO_SHOW_COUNT = "NO_SHOW_COUNT",
    TOTAL_SPENT = "TOTAL_SPENT",
    AVERAGE_INVOICE = "AVERAGE_INVOICE",
    OUTSTANDING_BALANCE = "OUTSTANDING_BALANCE",
    HAS_PAYMENT_PLAN = "HAS_PAYMENT_PLAN",
    LOYALTY_TIER = "LOYALTY_TIER",
    LOYALTY_POINTS = "LOYALTY_POINTS",
    REFERRAL_COUNT = "REFERRAL_COUNT",
    NPS_SCORE = "NPS_SCORE",
    FEEDBACK_RATING = "FEEDBACK_RATING",
    HAS_PROCEDURE = "HAS_PROCEDURE",
    HAS_TREATMENT_PLAN = "HAS_TREATMENT_PLAN",
    HAS_INSURANCE = "HAS_INSURANCE",
    PREFERRED_CHANNEL = "PREFERRED_CHANNEL",
    MARKETING_CONSENT = "MARKETING_CONSENT",
    EMAIL_ENABLED = "EMAIL_ENABLED",
    SMS_ENABLED = "SMS_ENABLED",
    TAGS = "TAGS",
    STATUS = "STATUS"
}
export declare enum SegmentRuleOperator {
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
    IN = "IN",
    NOT_IN = "NOT_IN",
    BETWEEN = "BETWEEN",
    IS_NULL = "IS_NULL",
    IS_NOT_NULL = "IS_NOT_NULL",
    STARTS_WITH = "STARTS_WITH",
    ENDS_WITH = "ENDS_WITH"
}
export interface SegmentRule {
    field: SegmentRuleField;
    operator: SegmentRuleOperator;
    value?: string | number | boolean | string[] | number[];
    ruleId?: UUID;
}
export declare enum SegmentRuleGroupOperator {
    AND = "AND",
    OR = "OR"
}
export interface SegmentRuleGroup {
    groupId?: UUID;
    operator: SegmentRuleGroupOperator;
    rules: SegmentRule[];
    groups?: SegmentRuleGroup[];
}
export declare enum SegmentType {
    DYNAMIC = "DYNAMIC",
    STATIC = "STATIC"
}
export interface Segment {
    id: SegmentId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    type: SegmentType;
    ruleGroups?: SegmentRuleGroup[];
    patientIds?: PatientId[];
    patientCount: number;
    lastRefreshedAt?: ISODateString;
    refreshIntervalSeconds?: number;
    tags?: string[];
    isArchived: boolean;
    createdBy: UserId;
    updatedBy: UserId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum ReferralStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    REDEEMED = "REDEEMED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}
export declare enum ReferralRewardType {
    POINTS = "POINTS",
    DISCOUNT = "DISCOUNT",
    CASH = "CASH",
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT"
}
export interface ReferralReward {
    type: ReferralRewardType;
    amount: number;
    currency?: string;
    procedureId?: ProcedureId;
    serviceDescription?: string;
    productId?: UUID;
    productDescription?: string;
    expiresAt?: ISODateString;
    terms?: string;
}
export interface Referral {
    id: ReferralId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    referrerPatientId: PatientId;
    refereePatientId?: PatientId;
    refereeEmail?: string;
    refereePhone?: string;
    refereeName?: string;
    code: string;
    source?: string;
    status: ReferralStatus;
    referrerReward: ReferralReward;
    refereeReward?: ReferralReward;
    referralDate: ISODateString;
    completedAt?: ISODateString;
    redeemedAt?: ISODateString;
    expiresAt?: ISODateString;
    cancelledAt?: ISODateString;
    cancellationReason?: string;
    createdBy: UserId;
    updatedBy: UserId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum LoyaltyTier {
    BRONZE = "BRONZE",
    SILVER = "SILVER",
    GOLD = "GOLD",
    PLATINUM = "PLATINUM"
}
export declare enum LoyaltyTransactionType {
    ACCRUAL = "ACCRUAL",
    REDEMPTION = "REDEMPTION",
    EXPIRY = "EXPIRY",
    ADJUSTMENT = "ADJUSTMENT"
}
export declare enum LoyaltyAccrualSource {
    PROCEDURE = "PROCEDURE",
    INVOICE = "INVOICE",
    REFERRAL = "REFERRAL",
    SIGNUP = "SIGNUP",
    BIRTHDAY = "BIRTHDAY",
    PROMOTION = "PROMOTION",
    ADJUSTMENT = "ADJUSTMENT"
}
export declare enum LoyaltyRedemptionType {
    DISCOUNT = "DISCOUNT",
    SERVICE = "SERVICE",
    PRODUCT = "PRODUCT",
    CASH = "CASH"
}
export interface LoyaltyAccount {
    id: LoyaltyAccountId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    patientId: PatientId;
    currentPoints: number;
    totalEarned: number;
    totalRedeemed: number;
    totalExpired: number;
    totalAdjusted: number;
    tier: LoyaltyTier;
    tierAchievedAt?: ISODateString;
    pointsToNextTier?: number;
    nextExpirationDate?: ISODateString;
    pointsExpiringNext?: number;
    isActive: boolean;
    isSuspended: boolean;
    suspensionReason?: string;
    closedAt?: ISODateString;
    closureReason?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UserId;
    updatedBy: UserId;
    metadata?: Metadata;
}
export interface LoyaltyTransaction {
    id: LoyaltyTransactionId;
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    type: LoyaltyTransactionType;
    amount: number;
    description: string;
    source?: LoyaltyAccrualSource;
    procedureId?: ProcedureId;
    invoiceId?: InvoiceId;
    referralId?: ReferralId;
    redemptionType?: LoyaltyRedemptionType;
    redemptionValue?: MoneyValue;
    redemptionInvoiceId?: InvoiceId;
    redemptionProcedureId?: ProcedureId;
    redemptionProductId?: UUID;
    expiryDate?: ISODateString;
    isExpired: boolean;
    balanceBefore: number;
    balanceAfter: number;
    transactionDate: ISODateString;
    createdBy: UserId;
    createdAt: ISODateString;
    metadata?: Metadata;
}
export interface LoyaltyAccrualRule {
    id: UUID;
    name: string;
    description?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    procedureId?: ProcedureId;
    procedureCategory?: string;
    invoiceThreshold?: MoneyValue;
    pointsPerUnit: number;
    bonusPoints?: number;
    multiplier?: number;
    applicableTiers?: LoyaltyTier[];
    effectiveFrom?: ISODateString;
    effectiveTo?: ISODateString;
    isActive: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UserId;
    updatedBy: UserId;
}
export declare enum FeedbackCategory {
    SERVICE = "SERVICE",
    TREATMENT = "TREATMENT",
    FACILITY = "FACILITY",
    STAFF = "STAFF",
    OVERALL = "OVERALL"
}
export declare enum FeedbackSentiment {
    POSITIVE = "POSITIVE",
    NEUTRAL = "NEUTRAL",
    NEGATIVE = "NEGATIVE"
}
export interface FeedbackRecord {
    id: FeedbackId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    patientId: PatientId;
    appointmentId?: UUID;
    providerId?: ProviderId;
    rating: 1 | 2 | 3 | 4 | 5;
    category: FeedbackCategory;
    comment?: string;
    sentiment: FeedbackSentiment;
    aiSentiment?: FeedbackSentiment;
    sentimentConfidence?: number;
    keywords?: string[];
    requiresFollowUp: boolean;
    followUpCompleted: boolean;
    followUpDate?: ISODateString;
    followUpNotes?: string;
    submittedAt: ISODateString;
    submissionSource?: string;
    submissionDevice?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum NpsCategory {
    DETRACTOR = "DETRACTOR",
    PASSIVE = "PASSIVE",
    PROMOTER = "PROMOTER"
}
export interface NpsScore {
    id: NpsScoreId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    patientId: PatientId;
    appointmentId?: UUID;
    providerId?: ProviderId;
    score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    category: NpsCategory;
    comment?: string;
    requiresFollowUp: boolean;
    followUpCompleted: boolean;
    followUpDate?: ISODateString;
    followUpNotes?: string;
    reviewInvitationSent: boolean;
    reviewInvitationDate?: ISODateString;
    publicReviewLeft: boolean;
    publicReviewPlatform?: string;
    submittedAt: ISODateString;
    submissionSource?: string;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export interface NpsAggregate {
    totalResponses: number;
    detractors: number;
    passives: number;
    promoters: number;
    detractorPercentage: number;
    passivePercentage: number;
    promoterPercentage: number;
    score: number;
    periodStart: ISODateString;
    periodEnd: ISODateString;
    calculatedAt: ISODateString;
}
export declare enum AutomationTriggerType {
    APPOINTMENT_CREATED = "APPOINTMENT_CREATED",
    APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED",
    APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED",
    APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
    APPOINTMENT_NO_SHOW = "APPOINTMENT_NO_SHOW",
    APPOINTMENT_REMINDER_DUE = "APPOINTMENT_REMINDER_DUE",
    INVOICE_CREATED = "INVOICE_CREATED",
    INVOICE_PAID = "INVOICE_PAID",
    INVOICE_OVERDUE = "INVOICE_OVERDUE",
    PATIENT_REGISTERED = "PATIENT_REGISTERED",
    PATIENT_BIRTHDAY = "PATIENT_BIRTHDAY",
    PATIENT_INACTIVE = "PATIENT_INACTIVE",
    RECALL_OVERDUE = "RECALL_OVERDUE",
    TREATMENT_PLAN_CREATED = "TREATMENT_PLAN_CREATED",
    TREATMENT_PLAN_APPROVED = "TREATMENT_PLAN_APPROVED",
    PROCEDURE_COMPLETED = "PROCEDURE_COMPLETED",
    FEEDBACK_RECEIVED = "FEEDBACK_RECEIVED",
    NPS_SCORE_RECEIVED = "NPS_SCORE_RECEIVED",
    LOYALTY_POINTS_ACCRUED = "LOYALTY_POINTS_ACCRUED",
    LOYALTY_TIER_ACHIEVED = "LOYALTY_TIER_ACHIEVED",
    LOYALTY_POINTS_EXPIRING = "LOYALTY_POINTS_EXPIRING",
    REFERRAL_CREATED = "REFERRAL_CREATED",
    REFERRAL_COMPLETED = "REFERRAL_COMPLETED",
    SCHEDULED_DAILY = "SCHEDULED_DAILY",
    SCHEDULED_WEEKLY = "SCHEDULED_WEEKLY",
    SCHEDULED_MONTHLY = "SCHEDULED_MONTHLY"
}
export declare enum AutomationActionType {
    SEND_CAMPAIGN = "SEND_CAMPAIGN",
    SEND_MESSAGE = "SEND_MESSAGE",
    ACCRUE_LOYALTY_POINTS = "ACCRUE_LOYALTY_POINTS",
    CREATE_REFERRAL = "CREATE_REFERRAL",
    SEND_NOTIFICATION = "SEND_NOTIFICATION",
    ADD_TO_SEGMENT = "ADD_TO_SEGMENT",
    REMOVE_FROM_SEGMENT = "REMOVE_FROM_SEGMENT",
    CREATE_TASK = "CREATE_TASK",
    UPDATE_PATIENT_TAGS = "UPDATE_PATIENT_TAGS",
    SEND_WEBHOOK = "SEND_WEBHOOK",
    WAIT = "WAIT"
}
export interface AutomationCondition {
    conditionId?: UUID;
    field: string;
    operator: SegmentRuleOperator;
    value?: string | number | boolean | string[] | number[];
}
export interface AutomationAction {
    actionId?: UUID;
    type: AutomationActionType;
    params: AutomationActionParams;
    order: number;
    stopOnFailure?: boolean;
    retryAttempts?: number;
    retryDelaySeconds?: number;
}
export type AutomationActionParams = SendCampaignParams | SendMessageParams | AccrueLoyaltyPointsParams | CreateReferralParams | SendNotificationParams | AddToSegmentParams | RemoveFromSegmentParams | CreateTaskParams | UpdatePatientTagsParams | SendWebhookParams | WaitParams;
export interface SendCampaignParams {
    campaignId: CampaignId;
    templateVariables?: Record<string, string>;
}
export interface SendMessageParams {
    channel: CampaignChannel;
    template: CampaignTemplate;
    recipientPatientId?: PatientId;
}
export interface AccrueLoyaltyPointsParams {
    points: number;
    source: LoyaltyAccrualSource;
    description: string;
    expiryMonths?: number;
}
export interface CreateReferralParams {
    referrerPatientId?: PatientId;
    referrerReward: ReferralReward;
    refereeReward?: ReferralReward;
    expiryDays?: number;
}
export interface SendNotificationParams {
    recipient: string;
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}
export interface AddToSegmentParams {
    segmentId: SegmentId;
}
export interface RemoveFromSegmentParams {
    segmentId: SegmentId;
}
export interface CreateTaskParams {
    title: string;
    description: string;
    assignee: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}
export interface UpdatePatientTagsParams {
    addTags?: string[];
    removeTags?: string[];
}
export interface SendWebhookParams {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
}
export interface WaitParams {
    durationSeconds: number;
}
export interface AutomationRule {
    id: AutomationRuleId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    name: string;
    description?: string;
    triggerType: AutomationTriggerType;
    conditions: AutomationCondition[];
    actions: AutomationAction[];
    isActive: boolean;
    isPaused: boolean;
    maxExecutionsPerPatientPerDay?: number;
    executionDelaySeconds?: number;
    schedule?: {
        hour?: number;
        dayOfWeek?: number;
        dayOfMonth?: number;
        timezone?: string;
    };
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    lastExecutedAt?: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    createdBy: UserId;
    updatedBy: UserId;
    metadata?: Metadata;
}
export interface AutomationExecution {
    id: AutomationExecutionId;
    ruleId: AutomationRuleId;
    tenantId: TenantId;
    patientId: PatientId;
    triggerType: AutomationTriggerType;
    triggerData: Record<string, unknown>;
    startedAt: ISODateString;
    completedAt?: ISODateString;
    durationMs?: number;
    status: 'pending' | 'running' | 'success' | 'failed' | 'partial';
    conditionsMet: boolean;
    conditionResults?: Array<{
        conditionId: UUID;
        met: boolean;
        actualValue?: unknown;
    }>;
    actionsExecuted: number;
    actionsSucceeded: number;
    actionsFailed: number;
    actionResults?: Array<{
        actionId: UUID;
        actionType: AutomationActionType;
        status: 'success' | 'failed' | 'skipped';
        startedAt: ISODateString;
        completedAt?: ISODateString;
        error?: string;
        output?: unknown;
    }>;
    error?: string;
    errorStack?: string;
    retryAttempt: number;
    parentExecutionId?: AutomationExecutionId;
    createdAt: ISODateString;
}
export declare enum DeliveryStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
    BOUNCED = "BOUNCED",
    UNSUBSCRIBED = "UNSUBSCRIBED",
    OPENED = "OPENED",
    CLICKED = "CLICKED",
    COMPLAINED = "COMPLAINED"
}
export declare enum DeliveryProvider {
    SENDGRID = "SENDGRID",
    SES = "SES",
    TWILIO = "TWILIO",
    ONESIGNAL = "ONESIGNAL",
    WHATSAPP = "WHATSAPP",
    SMTP = "SMTP",
    INTERNAL = "INTERNAL"
}
export interface DeliveryLog {
    id: DeliveryLogId;
    campaignId?: CampaignId;
    automationExecutionId?: AutomationExecutionId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    patientId: PatientId;
    recipientEmail?: string;
    recipientPhone?: string;
    recipientDeviceToken?: string;
    channel: CampaignChannel;
    provider: DeliveryProvider;
    providerMessageId?: string;
    status: DeliveryStatus;
    subject?: string;
    body: string;
    htmlBody?: string;
    queuedAt: ISODateString;
    sentAt?: ISODateString;
    deliveredAt?: ISODateString;
    openedAt?: ISODateString;
    clickedAt?: ISODateString;
    bouncedAt?: ISODateString;
    unsubscribedAt?: ISODateString;
    complainedAt?: ISODateString;
    error?: string;
    bounceType?: 'hard' | 'soft';
    bounceReason?: string;
    openCount?: number;
    clickCount?: number;
    clickedLinks?: string[];
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    retryAttempt: number;
    nextRetryAt?: ISODateString;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export declare enum ConsentType {
    TRANSACTIONAL = "TRANSACTIONAL",
    MARKETING = "MARKETING",
    PROMOTIONAL = "PROMOTIONAL"
}
export interface CommunicationPreference {
    patientId: PatientId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId?: ClinicId;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    whatsappEnabled: boolean;
    emailMarketingConsent: boolean;
    emailMarketingConsentDate?: ISODateString;
    smsMarketingConsent: boolean;
    smsMarketingConsentDate?: ISODateString;
    pushMarketingConsent: boolean;
    pushMarketingConsentDate?: ISODateString;
    whatsappMarketingConsent: boolean;
    whatsappMarketingConsentDate?: ISODateString;
    emailUnsubscribed: boolean;
    emailUnsubscribedAt?: ISODateString;
    smsUnsubscribed: boolean;
    smsUnsubscribedAt?: ISODateString;
    pushUnsubscribed: boolean;
    pushUnsubscribedAt?: ISODateString;
    whatsappUnsubscribed: boolean;
    whatsappUnsubscribedAt?: ISODateString;
    preferredContactHourStart?: number;
    preferredContactHourEnd?: number;
    maxMessagesPerDay?: number;
    maxMessagesPerWeek?: number;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    metadata?: Metadata;
}
export interface MarketingOpportunity {
    id: UUID;
    patientId: PatientId;
    source: string;
    opportunityType: string;
    description: string;
    suggestedCampaignType?: string;
    suggestedSegmentId?: SegmentId;
    context: Record<string, unknown>;
    confidence?: number;
    detectedAt: ISODateString;
    expiresAt?: ISODateString;
    actedUpon: boolean;
    actionTakenAt?: ISODateString;
    actionTaken?: string;
}
export interface ChurnRiskScore {
    patientId: PatientId;
    score: number;
    category: 'low' | 'medium' | 'high';
    factors: Array<{
        factor: string;
        weight: number;
        description: string;
    }>;
    computedAt: ISODateString;
    modelVersion?: string;
}
export interface SentimentAnalysisResult {
    feedbackId?: FeedbackId;
    npsScoreId?: NpsScoreId;
    text: string;
    sentiment: FeedbackSentiment;
    confidence: number;
    keywords: string[];
    language?: string;
    analyzedAt: ISODateString;
    modelVersion?: string;
}
