import type { UUID, OrganizationId, ClinicId, TenantId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientId, ProviderId } from '@dentalos/shared-domain';
export type CampaignId = UUID & {
    readonly __brand: 'CampaignId';
};
export type SegmentId = UUID & {
    readonly __brand: 'SegmentId';
};
export type DeliveryLogId = UUID & {
    readonly __brand: 'DeliveryLogId';
};
export type ReferralId = UUID & {
    readonly __brand: 'ReferralId';
};
export type LoyaltyAccountId = UUID & {
    readonly __brand: 'LoyaltyAccountId';
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
export type AppointmentId = UUID & {
    readonly __brand: 'AppointmentId';
};
export type UserId = UUID & {
    readonly __brand: 'UserId';
};
export type MarketingChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'POSTAL_MAIL' | 'PHONE_CALL';
export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type DeliveryStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'FAILED' | 'UNSUBSCRIBED';
export type RewardType = 'DISCOUNT_PERCENTAGE' | 'DISCOUNT_FIXED' | 'CREDIT' | 'FREE_SERVICE' | 'POINTS' | 'GIFT_CARD';
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
export type PointsSource = 'APPOINTMENT_COMPLETED' | 'REFERRAL' | 'REVIEW' | 'PURCHASE' | 'SIGNUP_BONUS' | 'MANUAL_ADJUSTMENT' | 'PROMOTION';
export type FeedbackCategory = 'SERVICE_QUALITY' | 'STAFF_INTERACTION' | 'FACILITY_CLEANLINESS' | 'WAIT_TIME' | 'TREATMENT_OUTCOME' | 'VALUE_FOR_MONEY' | 'OVERALL_EXPERIENCE';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
export type NpsCategory = 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';
export type AutomationTriggerType = 'APPOINTMENT_SCHEDULED' | 'APPOINTMENT_COMPLETED' | 'APPOINTMENT_CANCELLED' | 'TREATMENT_PLAN_CREATED' | 'PROCEDURE_COMPLETED' | 'PATIENT_CREATED' | 'PATIENT_BIRTHDAY' | 'PATIENT_ANNIVERSARY' | 'SEGMENT_MEMBERSHIP' | 'FEEDBACK_RECEIVED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'CUSTOM_EVENT';
export type AutomationActionType = 'SEND_EMAIL' | 'SEND_SMS' | 'SEND_PUSH' | 'CREATE_TASK' | 'UPDATE_SEGMENT' | 'ADD_TAG' | 'REMOVE_TAG' | 'UPDATE_PATIENT_FIELD' | 'TRIGGER_WORKFLOW' | 'WAIT' | 'CONDITION' | 'AI_ACTION';
export type UnsubscribeReason = 'TOO_FREQUENT' | 'NOT_RELEVANT' | 'CHANGED_PROVIDER' | 'SPAM' | 'PRIVACY_CONCERNS' | 'OTHER';
export declare const CAMPAIGN_CREATED: "dental.marketing.campaign.created";
export declare const CAMPAIGN_UPDATED: "dental.marketing.campaign.updated";
export declare const CAMPAIGN_TRIGGERED: "dental.marketing.campaign.triggered";
export declare const CAMPAIGN_DELIVERED: "dental.marketing.campaign.delivered";
export declare const CAMPAIGN_OPENED: "dental.marketing.campaign.opened";
export declare const CAMPAIGN_CLICKED: "dental.marketing.campaign.clicked";
export declare const CAMPAIGN_UNSUBSCRIBED: "dental.marketing.campaign.unsubscribed";
export declare const SEGMENT_CREATED: "dental.marketing.segment.created";
export declare const SEGMENT_REFRESHED: "dental.marketing.segment.refreshed";
export declare const SEGMENT_PATIENT_ADDED: "dental.marketing.segment.patient.added";
export declare const SEGMENT_PATIENT_REMOVED: "dental.marketing.segment.patient.removed";
export declare const REFERRAL_CREATED: "dental.marketing.referral.created";
export declare const REFERRAL_COMPLETED: "dental.marketing.referral.completed";
export declare const REFERRAL_REDEEMED: "dental.marketing.referral.redeemed";
export declare const REFERRAL_EXPIRED: "dental.marketing.referral.expired";
export declare const LOYALTY_ACCOUNT_CREATED: "dental.marketing.loyalty.account.created";
export declare const LOYALTY_POINTS_ACCRUED: "dental.marketing.loyalty.points.accrued";
export declare const LOYALTY_POINTS_REDEEMED: "dental.marketing.loyalty.points.redeemed";
export declare const LOYALTY_POINTS_EXPIRED: "dental.marketing.loyalty.points.expired";
export declare const LOYALTY_TIER_UPGRADED: "dental.marketing.loyalty.tier.upgraded";
export declare const LOYALTY_TIER_DOWNGRADED: "dental.marketing.loyalty.tier.downgraded";
export declare const FEEDBACK_RECEIVED: "dental.marketing.feedback.received";
export declare const FEEDBACK_POSITIVE: "dental.marketing.feedback.positive";
export declare const FEEDBACK_NEGATIVE: "dental.marketing.feedback.negative";
export declare const NPS_SUBMITTED: "dental.marketing.nps.submitted";
export declare const NPS_PROMOTER: "dental.marketing.nps.promoter";
export declare const NPS_DETRACTOR: "dental.marketing.nps.detractor";
export declare const AUTOMATION_TRIGGERED: "dental.marketing.automation.triggered";
export declare const AUTOMATION_EXECUTED: "dental.marketing.automation.executed";
export declare const DELIVERY_QUEUED: "dental.marketing.delivery.queued";
export declare const DELIVERY_SENT: "dental.marketing.delivery.sent";
export declare const DELIVERY_FAILED: "dental.marketing.delivery.failed";
export declare const DELIVERY_BOUNCED: "dental.marketing.delivery.bounced";
export declare const CAMPAIGN_CREATED_VERSION = 1;
export declare const CAMPAIGN_UPDATED_VERSION = 1;
export declare const CAMPAIGN_TRIGGERED_VERSION = 1;
export declare const CAMPAIGN_DELIVERED_VERSION = 1;
export declare const CAMPAIGN_OPENED_VERSION = 1;
export declare const CAMPAIGN_CLICKED_VERSION = 1;
export declare const CAMPAIGN_UNSUBSCRIBED_VERSION = 1;
export declare const SEGMENT_CREATED_VERSION = 1;
export declare const SEGMENT_REFRESHED_VERSION = 1;
export declare const SEGMENT_PATIENT_ADDED_VERSION = 1;
export declare const SEGMENT_PATIENT_REMOVED_VERSION = 1;
export declare const REFERRAL_CREATED_VERSION = 1;
export declare const REFERRAL_COMPLETED_VERSION = 1;
export declare const REFERRAL_REDEEMED_VERSION = 1;
export declare const REFERRAL_EXPIRED_VERSION = 1;
export declare const LOYALTY_ACCOUNT_CREATED_VERSION = 1;
export declare const LOYALTY_POINTS_ACCRUED_VERSION = 1;
export declare const LOYALTY_POINTS_REDEEMED_VERSION = 1;
export declare const LOYALTY_POINTS_EXPIRED_VERSION = 1;
export declare const LOYALTY_TIER_UPGRADED_VERSION = 1;
export declare const LOYALTY_TIER_DOWNGRADED_VERSION = 1;
export declare const FEEDBACK_RECEIVED_VERSION = 1;
export declare const FEEDBACK_POSITIVE_VERSION = 1;
export declare const FEEDBACK_NEGATIVE_VERSION = 1;
export declare const NPS_SUBMITTED_VERSION = 1;
export declare const NPS_PROMOTER_VERSION = 1;
export declare const NPS_DETRACTOR_VERSION = 1;
export declare const AUTOMATION_TRIGGERED_VERSION = 1;
export declare const AUTOMATION_EXECUTED_VERSION = 1;
export declare const DELIVERY_QUEUED_VERSION = 1;
export declare const DELIVERY_SENT_VERSION = 1;
export declare const DELIVERY_FAILED_VERSION = 1;
export declare const DELIVERY_BOUNCED_VERSION = 1;
export interface SegmentRule {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
    value: string | number | boolean | string[] | number[] | null;
    logicalOperator?: 'AND' | 'OR';
}
export interface CampaignChange {
    field: string;
    previousValue?: string | number | boolean | null;
    newValue?: string | number | boolean | null;
    description?: string;
}
export interface AutomationAction {
    actionType: AutomationActionType;
    config: Record<string, unknown>;
    delay?: number;
}
export interface CampaignCreatedPayload {
    campaignId: CampaignId;
    name: string;
    channel: MarketingChannel;
    targetSegmentId: SegmentId;
    status: CampaignStatus;
    createdBy: UserId;
    description?: string;
    scheduledAt?: ISODateString;
    subject?: string;
    templateId?: UUID;
    estimatedReach?: number;
    tags?: string[];
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignCreatedEvent = EventEnvelope<CampaignCreatedPayload>;
export interface CampaignUpdatedPayload {
    campaignId: CampaignId;
    changes: CampaignChange[];
    updatedBy: UserId;
    reason?: string;
    newStatus?: CampaignStatus;
    previousStatus?: CampaignStatus;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignUpdatedEvent = EventEnvelope<CampaignUpdatedPayload>;
export interface CampaignTriggeredPayload {
    campaignId: CampaignId;
    segmentId: SegmentId;
    patientCount: number;
    triggeredAt: ISODateString;
    estimatedCompletionAt?: ISODateString;
    batchSize?: number;
    rateLimit?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignTriggeredEvent = EventEnvelope<CampaignTriggeredPayload>;
export interface CampaignDeliveredPayload {
    campaignId: CampaignId;
    patientId: PatientId;
    deliveryLogId: DeliveryLogId;
    channel: MarketingChannel;
    status: DeliveryStatus;
    recipientEmail?: string;
    recipientPhone?: string;
    providerMessageId?: string;
    attemptCount?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignDeliveredEvent = EventEnvelope<CampaignDeliveredPayload>;
export interface CampaignOpenedPayload {
    campaignId: CampaignId;
    patientId: PatientId;
    deliveryLogId: DeliveryLogId;
    openedAt: ISODateString;
    userAgent?: string;
    ipAddress?: string;
    deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
    operatingSystem?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignOpenedEvent = EventEnvelope<CampaignOpenedPayload>;
export interface CampaignClickedPayload {
    campaignId: CampaignId;
    patientId: PatientId;
    deliveryLogId: DeliveryLogId;
    clickedUrl: string;
    clickedAt: ISODateString;
    linkLabel?: string;
    linkPosition?: number;
    userAgent?: string;
    ipAddress?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignClickedEvent = EventEnvelope<CampaignClickedPayload>;
export interface CampaignUnsubscribedPayload {
    campaignId?: CampaignId;
    patientId: PatientId;
    channel: MarketingChannel;
    reason?: UnsubscribeReason;
    unsubscribedAt: ISODateString;
    comment?: string;
    unsubscribeFromAll: boolean;
    ipAddress?: string;
    userAgent?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type CampaignUnsubscribedEvent = EventEnvelope<CampaignUnsubscribedPayload>;
export interface SegmentCreatedPayload {
    segmentId: SegmentId;
    name: string;
    rules: SegmentRule[];
    isStatic: boolean;
    description?: string;
    createdBy?: UserId;
    refreshInterval?: number;
    initialPatientCount?: number;
    tags?: string[];
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type SegmentCreatedEvent = EventEnvelope<SegmentCreatedPayload>;
export interface SegmentRefreshedPayload {
    segmentId: SegmentId;
    previousCount: number;
    newCount: number;
    addedPatients: number;
    removedPatients: number;
    refreshDuration?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type SegmentRefreshedEvent = EventEnvelope<SegmentRefreshedPayload>;
export interface SegmentPatientAddedPayload {
    segmentId: SegmentId;
    patientId: PatientId;
    addedAt: ISODateString;
    addMethod?: 'AUTOMATIC' | 'MANUAL' | 'IMPORT';
    addedBy?: UserId;
    reason?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type SegmentPatientAddedEvent = EventEnvelope<SegmentPatientAddedPayload>;
export interface SegmentPatientRemovedPayload {
    segmentId: SegmentId;
    patientId: PatientId;
    removedAt: ISODateString;
    removeMethod?: 'AUTOMATIC' | 'MANUAL' | 'RULE_CHANGE';
    removedBy?: UserId;
    reason?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type SegmentPatientRemovedEvent = EventEnvelope<SegmentPatientRemovedPayload>;
export interface ReferralCreatedPayload {
    referralId: ReferralId;
    referrerPatientId: PatientId;
    code: string;
    rewardType: RewardType;
    rewardAmount: number;
    rewardDescription?: string;
    expiresAt?: ISODateString;
    maxUses?: number;
    currentUses?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type ReferralCreatedEvent = EventEnvelope<ReferralCreatedPayload>;
export interface ReferralCompletedPayload {
    referralId: ReferralId;
    referrerPatientId: PatientId;
    refereePatientId: PatientId;
    completedAt: ISODateString;
    qualifyingAction?: 'FIRST_APPOINTMENT' | 'FIRST_TREATMENT' | 'FIRST_PAYMENT' | 'REGISTRATION';
    appointmentId?: AppointmentId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type ReferralCompletedEvent = EventEnvelope<ReferralCompletedPayload>;
export interface ReferralRedeemedPayload {
    referralId: ReferralId;
    referrerPatientId: PatientId;
    rewardAmount: number;
    redeemedAt: ISODateString;
    redemptionMethod?: 'ACCOUNT_CREDIT' | 'DISCOUNT_APPLIED' | 'GIFT_CARD' | 'POINTS_ADDED';
    transactionId?: UUID;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type ReferralRedeemedEvent = EventEnvelope<ReferralRedeemedPayload>;
export interface ReferralExpiredPayload {
    referralId: ReferralId;
    referrerPatientId: PatientId;
    expiredAt: ISODateString;
    totalUses?: number;
    completedCount?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type ReferralExpiredEvent = EventEnvelope<ReferralExpiredPayload>;
export interface LoyaltyAccountCreatedPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    initialTier: LoyaltyTier;
    signupBonus?: number;
    enrollmentMethod?: 'SELF_SERVICE' | 'STAFF_ENROLLED' | 'AUTOMATIC' | 'IMPORT';
    enrolledBy?: UserId;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyAccountCreatedEvent = EventEnvelope<LoyaltyAccountCreatedPayload>;
export interface LoyaltyPointsAccruedPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    amount: number;
    source: PointsSource;
    sourceId?: UUID;
    newBalance: number;
    previousBalance?: number;
    expiresAt?: ISODateString;
    description?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyPointsAccruedEvent = EventEnvelope<LoyaltyPointsAccruedPayload>;
export interface LoyaltyPointsRedeemedPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    amount: number;
    redeemedFor: string;
    newBalance: number;
    previousBalance?: number;
    monetaryValue?: number;
    transactionId?: UUID;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyPointsRedeemedEvent = EventEnvelope<LoyaltyPointsRedeemedPayload>;
export interface LoyaltyPointsExpiredPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    amount: number;
    expiredAt: ISODateString;
    newBalance?: number;
    expirationReason?: 'TIME_LIMIT' | 'INACTIVITY' | 'ACCOUNT_CLOSURE' | 'POLICY_CHANGE';
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyPointsExpiredEvent = EventEnvelope<LoyaltyPointsExpiredPayload>;
export interface LoyaltyTierUpgradedPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    previousTier: LoyaltyTier;
    newTier: LoyaltyTier;
    currentBalance?: number;
    upgradeBonus?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyTierUpgradedEvent = EventEnvelope<LoyaltyTierUpgradedPayload>;
export interface LoyaltyTierDowngradedPayload {
    accountId: LoyaltyAccountId;
    patientId: PatientId;
    previousTier: LoyaltyTier;
    newTier: LoyaltyTier;
    currentBalance?: number;
    downgradeReason?: 'INACTIVITY' | 'BALANCE_THRESHOLD' | 'POLICY_CHANGE' | 'MANUAL_ADJUSTMENT';
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type LoyaltyTierDowngradedEvent = EventEnvelope<LoyaltyTierDowngradedPayload>;
export interface FeedbackReceivedPayload {
    feedbackId: FeedbackId;
    patientId: PatientId;
    appointmentId?: AppointmentId;
    providerId?: ProviderId;
    rating: 1 | 2 | 3 | 4 | 5;
    category: FeedbackCategory;
    sentiment: Sentiment;
    comment?: string;
    isPublic: boolean;
    marketingConsent: boolean;
    channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'GOOGLE' | 'FACEBOOK' | 'YELP' | 'OTHER';
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type FeedbackReceivedEvent = EventEnvelope<FeedbackReceivedPayload>;
export interface FeedbackPositivePayload {
    feedbackId: FeedbackId;
    patientId: PatientId;
    rating: 4 | 5;
    comment?: string;
    providerId?: ProviderId;
    appointmentId?: AppointmentId;
    marketingConsent?: boolean;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type FeedbackPositiveEvent = EventEnvelope<FeedbackPositivePayload>;
export interface FeedbackNegativePayload {
    feedbackId: FeedbackId;
    patientId: PatientId;
    rating: 1 | 2;
    comment?: string;
    providerId?: ProviderId;
    appointmentId?: AppointmentId;
    category?: FeedbackCategory;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type FeedbackNegativeEvent = EventEnvelope<FeedbackNegativePayload>;
export interface NpsSubmittedPayload {
    npsScoreId: NpsScoreId;
    patientId: PatientId;
    score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
    category: NpsCategory;
    comment?: string;
    campaignId?: CampaignId;
    channel?: 'EMAIL' | 'SMS' | 'IN_APP' | 'WEB' | 'PHONE';
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type NpsSubmittedEvent = EventEnvelope<NpsSubmittedPayload>;
export interface NpsPromoterPayload {
    npsScoreId: NpsScoreId;
    patientId: PatientId;
    score: 9 | 10;
    comment?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type NpsPromoterEvent = EventEnvelope<NpsPromoterPayload>;
export interface NpsDetractorPayload {
    npsScoreId: NpsScoreId;
    patientId: PatientId;
    score: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    comment?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type NpsDetractorEvent = EventEnvelope<NpsDetractorPayload>;
export interface AutomationTriggeredPayload {
    automationRuleId: AutomationRuleId;
    triggerType: AutomationTriggerType;
    context: Record<string, unknown>;
    actionsToExecute: AutomationAction[];
    ruleName?: string;
    ruleDescription?: string;
    isActive?: boolean;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type AutomationTriggeredEvent = EventEnvelope<AutomationTriggeredPayload>;
export interface AutomationExecutedPayload {
    automationRuleId: AutomationRuleId;
    actionType: AutomationActionType;
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
    errorCode?: string;
    executionDuration?: number;
    retryAttempt?: number;
    context?: Record<string, unknown>;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type AutomationExecutedEvent = EventEnvelope<AutomationExecutedPayload>;
export interface DeliveryQueuedPayload {
    deliveryLogId: DeliveryLogId;
    campaignId?: CampaignId;
    patientId: PatientId;
    channel: MarketingChannel;
    queuedAt: ISODateString;
    scheduledFor?: ISODateString;
    priority?: number;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type DeliveryQueuedEvent = EventEnvelope<DeliveryQueuedPayload>;
export interface DeliverySentPayload {
    deliveryLogId: DeliveryLogId;
    campaignId?: CampaignId;
    patientId: PatientId;
    channel: MarketingChannel;
    sentAt: ISODateString;
    providerMessageId?: string;
    providerName?: string;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type DeliverySentEvent = EventEnvelope<DeliverySentPayload>;
export interface DeliveryFailedPayload {
    deliveryLogId: DeliveryLogId;
    campaignId?: CampaignId;
    patientId: PatientId;
    channel: MarketingChannel;
    error: string;
    failedAt: ISODateString;
    errorCode?: string;
    errorType?: 'TEMPORARY' | 'PERMANENT' | 'CONFIGURATION' | 'RATE_LIMIT';
    attemptNumber?: number;
    willRetry?: boolean;
    nextRetryAt?: ISODateString;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type DeliveryFailedEvent = EventEnvelope<DeliveryFailedPayload>;
export interface DeliveryBouncedPayload {
    deliveryLogId: DeliveryLogId;
    campaignId?: CampaignId;
    patientId: PatientId;
    channel: MarketingChannel;
    reason: string;
    bouncedAt: ISODateString;
    bounceType?: 'HARD' | 'SOFT' | 'COMPLAINT' | 'SUPPRESSION';
    bounceSubtype?: 'GENERAL' | 'NO_EMAIL' | 'SUPPRESSED' | 'MAILBOX_FULL' | 'MESSAGE_TOO_LARGE' | 'CONTENT_REJECTED';
    shouldSuppress?: boolean;
    tenantId: TenantId;
    organizationId: OrganizationId;
    clinicId: ClinicId;
    timestamp: ISODateString;
    correlationId?: string;
    metadata?: Record<string, unknown>;
}
export type DeliveryBouncedEvent = EventEnvelope<DeliveryBouncedPayload>;
