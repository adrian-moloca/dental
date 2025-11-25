/**
 * Marketing Events
 *
 * Domain events for marketing operations including campaigns, segmentation,
 * referrals, loyalty programs, feedback collection, NPS tracking, automation,
 * and delivery management.
 *
 * These events are consumed by:
 * - Marketing Automation Engine (campaign execution, workflow triggers)
 * - Analytics Platform (campaign performance, patient engagement)
 * - CRM Systems (patient lifecycle management)
 * - Notification Services (email, SMS, push delivery)
 * - Reputation Management (review requests, feedback aggregation)
 *
 * Safety & Compliance:
 * - All communication events MUST check opt-in/opt-out status
 * - Rate limiting enforced at patient and system level
 * - Quiet hours respected (typically 9 PM - 9 AM)
 * - GDPR/HIPAA compliant data handling
 * - Consent tracking for all marketing communications
 *
 * @module shared-events/marketing
 */

import type { UUID, OrganizationId, ClinicId, TenantId, ISODateString } from '@dentalos/shared-types';
import type { EventEnvelope } from '../envelope/event-envelope';
import type { PatientId, ProviderId } from '@dentalos/shared-domain';

// ============================================================================
// BRANDED TYPES FOR MARKETING DOMAIN
// ============================================================================

/**
 * Unique identifier for a marketing campaign
 */
export type CampaignId = UUID & { readonly __brand: 'CampaignId' };

/**
 * Unique identifier for a patient segment
 */
export type SegmentId = UUID & { readonly __brand: 'SegmentId' };

/**
 * Unique identifier for a delivery log entry
 */
export type DeliveryLogId = UUID & { readonly __brand: 'DeliveryLogId' };

/**
 * Unique identifier for a referral record
 */
export type ReferralId = UUID & { readonly __brand: 'ReferralId' };

/**
 * Unique identifier for a loyalty account
 */
export type LoyaltyAccountId = UUID & { readonly __brand: 'LoyaltyAccountId' };

/**
 * Unique identifier for a feedback entry
 */
export type FeedbackId = UUID & { readonly __brand: 'FeedbackId' };

/**
 * Unique identifier for an NPS score record
 */
export type NpsScoreId = UUID & { readonly __brand: 'NpsScoreId' };

/**
 * Unique identifier for an automation rule
 */
export type AutomationRuleId = UUID & { readonly __brand: 'AutomationRuleId' };

/**
 * Unique identifier for an appointment
 */
export type AppointmentId = UUID & { readonly __brand: 'AppointmentId' };

/**
 * Unique identifier for a user
 */
export type UserId = UUID & { readonly __brand: 'UserId' };

// ============================================================================
// ENUMERATIONS
// ============================================================================

/**
 * Communication channel for marketing campaigns
 */
export type MarketingChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'POSTAL_MAIL' | 'PHONE_CALL';

/**
 * Campaign status
 */
export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

/**
 * Delivery status for individual communications
 */
export type DeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED'
  | 'FAILED'
  | 'UNSUBSCRIBED';

/**
 * Reward type for referral programs
 */
export type RewardType =
  | 'DISCOUNT_PERCENTAGE'
  | 'DISCOUNT_FIXED'
  | 'CREDIT'
  | 'FREE_SERVICE'
  | 'POINTS'
  | 'GIFT_CARD';

/**
 * Loyalty tier levels
 */
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

/**
 * Points transaction source
 */
export type PointsSource =
  | 'APPOINTMENT_COMPLETED'
  | 'REFERRAL'
  | 'REVIEW'
  | 'PURCHASE'
  | 'SIGNUP_BONUS'
  | 'MANUAL_ADJUSTMENT'
  | 'PROMOTION';

/**
 * Feedback category
 */
export type FeedbackCategory =
  | 'SERVICE_QUALITY'
  | 'STAFF_INTERACTION'
  | 'FACILITY_CLEANLINESS'
  | 'WAIT_TIME'
  | 'TREATMENT_OUTCOME'
  | 'VALUE_FOR_MONEY'
  | 'OVERALL_EXPERIENCE';

/**
 * Sentiment analysis result
 */
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

/**
 * NPS category based on score
 */
export type NpsCategory = 'PROMOTER' | 'PASSIVE' | 'DETRACTOR';

/**
 * Automation trigger type
 */
export type AutomationTriggerType =
  | 'APPOINTMENT_SCHEDULED'
  | 'APPOINTMENT_COMPLETED'
  | 'APPOINTMENT_CANCELLED'
  | 'TREATMENT_PLAN_CREATED'
  | 'PROCEDURE_COMPLETED'
  | 'PATIENT_CREATED'
  | 'PATIENT_BIRTHDAY'
  | 'PATIENT_ANNIVERSARY'
  | 'SEGMENT_MEMBERSHIP'
  | 'FEEDBACK_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_OVERDUE'
  | 'CUSTOM_EVENT';

/**
 * Automation action type
 */
export type AutomationActionType =
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'SEND_PUSH'
  | 'CREATE_TASK'
  | 'UPDATE_SEGMENT'
  | 'ADD_TAG'
  | 'REMOVE_TAG'
  | 'UPDATE_PATIENT_FIELD'
  | 'TRIGGER_WORKFLOW'
  | 'WAIT'
  | 'CONDITION'
  | 'AI_ACTION';

/**
 * Unsubscribe reason
 */
export type UnsubscribeReason =
  | 'TOO_FREQUENT'
  | 'NOT_RELEVANT'
  | 'CHANGED_PROVIDER'
  | 'SPAM'
  | 'PRIVACY_CONCERNS'
  | 'OTHER';

// ============================================================================
// EVENT TYPE CONSTANTS - CAMPAIGN EVENTS
// ============================================================================

/**
 * Campaign created event type constant
 * Published when a new marketing campaign is created
 */
export const CAMPAIGN_CREATED = 'dental.marketing.campaign.created' as const;

/**
 * Campaign updated event type constant
 * Published when campaign settings or content are modified
 */
export const CAMPAIGN_UPDATED = 'dental.marketing.campaign.updated' as const;

/**
 * Campaign triggered event type constant
 * Published when a campaign starts sending to a segment
 */
export const CAMPAIGN_TRIGGERED = 'dental.marketing.campaign.triggered' as const;

/**
 * Campaign delivered event type constant
 * Published when a campaign message is delivered to a patient
 */
export const CAMPAIGN_DELIVERED = 'dental.marketing.campaign.delivered' as const;

/**
 * Campaign opened event type constant
 * Published when a patient opens a campaign message (email/push)
 */
export const CAMPAIGN_OPENED = 'dental.marketing.campaign.opened' as const;

/**
 * Campaign clicked event type constant
 * Published when a patient clicks a link in a campaign message
 */
export const CAMPAIGN_CLICKED = 'dental.marketing.campaign.clicked' as const;

/**
 * Campaign unsubscribed event type constant
 * Published when a patient unsubscribes from a campaign or channel
 */
export const CAMPAIGN_UNSUBSCRIBED = 'dental.marketing.campaign.unsubscribed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - SEGMENT EVENTS
// ============================================================================

/**
 * Segment created event type constant
 * Published when a new patient segment is defined
 */
export const SEGMENT_CREATED = 'dental.marketing.segment.created' as const;

/**
 * Segment refreshed event type constant
 * Published when a dynamic segment is recalculated
 */
export const SEGMENT_REFRESHED = 'dental.marketing.segment.refreshed' as const;

/**
 * Segment patient added event type constant
 * Published when a patient joins a segment
 */
export const SEGMENT_PATIENT_ADDED = 'dental.marketing.segment.patient.added' as const;

/**
 * Segment patient removed event type constant
 * Published when a patient leaves a segment
 */
export const SEGMENT_PATIENT_REMOVED = 'dental.marketing.segment.patient.removed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - REFERRAL EVENTS
// ============================================================================

/**
 * Referral created event type constant
 * Published when a patient creates a referral code
 */
export const REFERRAL_CREATED = 'dental.marketing.referral.created' as const;

/**
 * Referral completed event type constant
 * Published when a referred patient completes qualifying action
 */
export const REFERRAL_COMPLETED = 'dental.marketing.referral.completed' as const;

/**
 * Referral redeemed event type constant
 * Published when a referrer redeems their earned reward
 */
export const REFERRAL_REDEEMED = 'dental.marketing.referral.redeemed' as const;

/**
 * Referral expired event type constant
 * Published when a referral code expires
 */
export const REFERRAL_EXPIRED = 'dental.marketing.referral.expired' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - LOYALTY EVENTS
// ============================================================================

/**
 * Loyalty account created event type constant
 * Published when a patient enrolls in the loyalty program
 */
export const LOYALTY_ACCOUNT_CREATED = 'dental.marketing.loyalty.account.created' as const;

/**
 * Loyalty points accrued event type constant
 * Published when a patient earns loyalty points
 */
export const LOYALTY_POINTS_ACCRUED = 'dental.marketing.loyalty.points.accrued' as const;

/**
 * Loyalty points redeemed event type constant
 * Published when a patient redeems loyalty points
 */
export const LOYALTY_POINTS_REDEEMED = 'dental.marketing.loyalty.points.redeemed' as const;

/**
 * Loyalty points expired event type constant
 * Published when loyalty points expire due to inactivity
 */
export const LOYALTY_POINTS_EXPIRED = 'dental.marketing.loyalty.points.expired' as const;

/**
 * Loyalty tier upgraded event type constant
 * Published when a patient moves to a higher tier
 */
export const LOYALTY_TIER_UPGRADED = 'dental.marketing.loyalty.tier.upgraded' as const;

/**
 * Loyalty tier downgraded event type constant
 * Published when a patient moves to a lower tier
 */
export const LOYALTY_TIER_DOWNGRADED = 'dental.marketing.loyalty.tier.downgraded' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - FEEDBACK EVENTS
// ============================================================================

/**
 * Feedback received event type constant
 * Published when a patient submits feedback or review
 */
export const FEEDBACK_RECEIVED = 'dental.marketing.feedback.received' as const;

/**
 * Feedback positive event type constant
 * Published when high-rated feedback is received (rating >= 4)
 */
export const FEEDBACK_POSITIVE = 'dental.marketing.feedback.positive' as const;

/**
 * Feedback negative event type constant
 * Published when low-rated feedback is received (rating <= 2)
 */
export const FEEDBACK_NEGATIVE = 'dental.marketing.feedback.negative' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - NPS EVENTS
// ============================================================================

/**
 * NPS submitted event type constant
 * Published when a patient submits an NPS score
 */
export const NPS_SUBMITTED = 'dental.marketing.nps.submitted' as const;

/**
 * NPS promoter event type constant
 * Published when a patient submits a promoter score (9-10)
 */
export const NPS_PROMOTER = 'dental.marketing.nps.promoter' as const;

/**
 * NPS detractor event type constant
 * Published when a patient submits a detractor score (0-6)
 */
export const NPS_DETRACTOR = 'dental.marketing.nps.detractor' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - AUTOMATION EVENTS
// ============================================================================

/**
 * Automation triggered event type constant
 * Published when an automation rule is triggered
 */
export const AUTOMATION_TRIGGERED = 'dental.marketing.automation.triggered' as const;

/**
 * Automation executed event type constant
 * Published when an automation action completes
 */
export const AUTOMATION_EXECUTED = 'dental.marketing.automation.executed' as const;

// ============================================================================
// EVENT TYPE CONSTANTS - DELIVERY EVENTS
// ============================================================================

/**
 * Delivery queued event type constant
 * Published when a message is queued for delivery
 */
export const DELIVERY_QUEUED = 'dental.marketing.delivery.queued' as const;

/**
 * Delivery sent event type constant
 * Published when a message is sent to the provider
 */
export const DELIVERY_SENT = 'dental.marketing.delivery.sent' as const;

/**
 * Delivery failed event type constant
 * Published when message delivery fails
 */
export const DELIVERY_FAILED = 'dental.marketing.delivery.failed' as const;

/**
 * Delivery bounced event type constant
 * Published when a message bounces (invalid recipient)
 */
export const DELIVERY_BOUNCED = 'dental.marketing.delivery.bounced' as const;

// ============================================================================
// EVENT VERSION CONSTANTS
// ============================================================================

export const CAMPAIGN_CREATED_VERSION = 1;
export const CAMPAIGN_UPDATED_VERSION = 1;
export const CAMPAIGN_TRIGGERED_VERSION = 1;
export const CAMPAIGN_DELIVERED_VERSION = 1;
export const CAMPAIGN_OPENED_VERSION = 1;
export const CAMPAIGN_CLICKED_VERSION = 1;
export const CAMPAIGN_UNSUBSCRIBED_VERSION = 1;
export const SEGMENT_CREATED_VERSION = 1;
export const SEGMENT_REFRESHED_VERSION = 1;
export const SEGMENT_PATIENT_ADDED_VERSION = 1;
export const SEGMENT_PATIENT_REMOVED_VERSION = 1;
export const REFERRAL_CREATED_VERSION = 1;
export const REFERRAL_COMPLETED_VERSION = 1;
export const REFERRAL_REDEEMED_VERSION = 1;
export const REFERRAL_EXPIRED_VERSION = 1;
export const LOYALTY_ACCOUNT_CREATED_VERSION = 1;
export const LOYALTY_POINTS_ACCRUED_VERSION = 1;
export const LOYALTY_POINTS_REDEEMED_VERSION = 1;
export const LOYALTY_POINTS_EXPIRED_VERSION = 1;
export const LOYALTY_TIER_UPGRADED_VERSION = 1;
export const LOYALTY_TIER_DOWNGRADED_VERSION = 1;
export const FEEDBACK_RECEIVED_VERSION = 1;
export const FEEDBACK_POSITIVE_VERSION = 1;
export const FEEDBACK_NEGATIVE_VERSION = 1;
export const NPS_SUBMITTED_VERSION = 1;
export const NPS_PROMOTER_VERSION = 1;
export const NPS_DETRACTOR_VERSION = 1;
export const AUTOMATION_TRIGGERED_VERSION = 1;
export const AUTOMATION_EXECUTED_VERSION = 1;
export const DELIVERY_QUEUED_VERSION = 1;
export const DELIVERY_SENT_VERSION = 1;
export const DELIVERY_FAILED_VERSION = 1;
export const DELIVERY_BOUNCED_VERSION = 1;

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Segment rule definition for dynamic segmentation
 */
export interface SegmentRule {
  /** Field to filter on */
  field: string;
  /** Comparison operator */
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'between';
  /** Value(s) to compare against */
  value: string | number | boolean | string[] | number[] | null;
  /** Logical operator to combine with next rule */
  logicalOperator?: 'AND' | 'OR';
}

/**
 * Change tracking for campaign updates
 */
export interface CampaignChange {
  /** Field that changed */
  field: string;
  /** Previous value (JSON stringified for complex types) */
  previousValue?: string | number | boolean | null;
  /** New value (JSON stringified for complex types) */
  newValue?: string | number | boolean | null;
  /** Description of the change */
  description?: string;
}

/**
 * Automation action to be executed
 */
export interface AutomationAction {
  /** Type of action */
  actionType: AutomationActionType;
  /** Action configuration */
  config: Record<string, unknown>;
  /** Delay before execution (in milliseconds) */
  delay?: number;
}

// ============================================================================
// 1. CAMPAIGN EVENTS
// ============================================================================

/**
 * Campaign created event payload
 *
 * Published when a new marketing campaign is created.
 * Consumed by automation engine, analytics platform, and reporting systems.
 *
 * @example
 * ```typescript
 * const payload: CampaignCreatedPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   name: 'Teeth Whitening Special - Summer 2025',
 *   channel: 'EMAIL',
 *   targetSegmentId: 'seg-456' as SegmentId,
 *   status: 'DRAFT',
 *   createdBy: 'user-789' as UserId,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface CampaignCreatedPayload {
  /** Unique campaign identifier */
  campaignId: CampaignId;

  /** Campaign name */
  name: string;

  /** Communication channel */
  channel: MarketingChannel;

  /** Target patient segment ID */
  targetSegmentId: SegmentId;

  /** Campaign status */
  status: CampaignStatus;

  /** User who created the campaign */
  createdBy: UserId;

  /** Campaign description */
  description?: string;

  /** Scheduled send date/time */
  scheduledAt?: ISODateString;

  /** Campaign subject line (for email) */
  subject?: string;

  /** Message template ID */
  templateId?: UUID;

  /** Estimated recipient count */
  estimatedReach?: number;

  /** Campaign tags for organization */
  tags?: string[];

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign created event envelope
 */
export type CampaignCreatedEvent = EventEnvelope<CampaignCreatedPayload>;

/**
 * Campaign updated event payload
 *
 * Published when campaign settings, content, or status are modified.
 * Consumed by automation engine and analytics for tracking changes.
 *
 * @example
 * ```typescript
 * const payload: CampaignUpdatedPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   changes: [
 *     { field: 'status', previousValue: 'DRAFT', newValue: 'ACTIVE' },
 *     { field: 'scheduledAt', previousValue: '2025-11-20T10:00:00Z', newValue: '2025-11-21T10:00:00Z' }
 *   ],
 *   updatedBy: 'user-789' as UserId,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T09:00:00Z',
 * };
 * ```
 */
export interface CampaignUpdatedPayload {
  /** Campaign identifier */
  campaignId: CampaignId;

  /** List of changes made */
  changes: CampaignChange[];

  /** User who made the update */
  updatedBy: UserId;

  /** Update reason */
  reason?: string;

  /** New status if changed */
  newStatus?: CampaignStatus;

  /** Previous status if changed */
  previousStatus?: CampaignStatus;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign updated event envelope
 */
export type CampaignUpdatedEvent = EventEnvelope<CampaignUpdatedPayload>;

/**
 * Campaign triggered event payload
 *
 * Published when a campaign starts executing and sending to a segment.
 * Consumed by delivery systems and analytics for tracking campaign progress.
 *
 * @example
 * ```typescript
 * const payload: CampaignTriggeredPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   segmentId: 'seg-456' as SegmentId,
 *   patientCount: 1250,
 *   triggeredAt: '2025-11-21T10:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface CampaignTriggeredPayload {
  /** Campaign identifier */
  campaignId: CampaignId;

  /** Segment being targeted */
  segmentId: SegmentId;

  /** Number of patients in segment */
  patientCount: number;

  /** When campaign was triggered */
  triggeredAt: ISODateString;

  /** Estimated completion time */
  estimatedCompletionAt?: ISODateString;

  /** Batch size for sending */
  batchSize?: number;

  /** Rate limit (messages per minute) */
  rateLimit?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign triggered event envelope
 */
export type CampaignTriggeredEvent = EventEnvelope<CampaignTriggeredPayload>;

/**
 * Campaign delivered event payload
 *
 * Published when a campaign message is delivered to an individual patient.
 * Critical for tracking delivery success and patient engagement.
 *
 * @example
 * ```typescript
 * const payload: CampaignDeliveredPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   patientId: 'pat-456' as PatientId,
 *   deliveryLogId: 'log-789' as DeliveryLogId,
 *   channel: 'EMAIL',
 *   status: 'DELIVERED',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:05:00Z',
 * };
 * ```
 */
export interface CampaignDeliveredPayload {
  /** Campaign identifier */
  campaignId: CampaignId;

  /** Patient who received the message */
  patientId: PatientId;

  /** Delivery log record ID */
  deliveryLogId: DeliveryLogId;

  /** Channel used for delivery */
  channel: MarketingChannel;

  /** Delivery status */
  status: DeliveryStatus;

  /** Recipient email address (for email channel) */
  recipientEmail?: string;

  /** Recipient phone number (for SMS channel) */
  recipientPhone?: string;

  /** External provider message ID */
  providerMessageId?: string;

  /** Delivery attempts count */
  attemptCount?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign delivered event envelope
 */
export type CampaignDeliveredEvent = EventEnvelope<CampaignDeliveredPayload>;

/**
 * Campaign opened event payload
 *
 * Published when a patient opens a campaign email or push notification.
 * Used for engagement tracking and analytics.
 *
 * @example
 * ```typescript
 * const payload: CampaignOpenedPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   patientId: 'pat-456' as PatientId,
 *   deliveryLogId: 'log-789' as DeliveryLogId,
 *   openedAt: '2025-11-21T10:30:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:30:00Z',
 * };
 * ```
 */
export interface CampaignOpenedPayload {
  /** Campaign identifier */
  campaignId: CampaignId;

  /** Patient who opened the message */
  patientId: PatientId;

  /** Delivery log record ID */
  deliveryLogId: DeliveryLogId;

  /** When message was opened */
  openedAt: ISODateString;

  /** User agent (browser/device info) */
  userAgent?: string;

  /** IP address */
  ipAddress?: string;

  /** Device type */
  deviceType?: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';

  /** Operating system */
  operatingSystem?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign opened event envelope
 */
export type CampaignOpenedEvent = EventEnvelope<CampaignOpenedPayload>;

/**
 * Campaign clicked event payload
 *
 * Published when a patient clicks a link in a campaign message.
 * Critical for measuring campaign effectiveness and conversion.
 *
 * @example
 * ```typescript
 * const payload: CampaignClickedPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   patientId: 'pat-456' as PatientId,
 *   deliveryLogId: 'log-789' as DeliveryLogId,
 *   clickedUrl: 'https://dentalclinic.com/whitening-special',
 *   clickedAt: '2025-11-21T10:35:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:35:00Z',
 * };
 * ```
 */
export interface CampaignClickedPayload {
  /** Campaign identifier */
  campaignId: CampaignId;

  /** Patient who clicked the link */
  patientId: PatientId;

  /** Delivery log record ID */
  deliveryLogId: DeliveryLogId;

  /** URL that was clicked */
  clickedUrl: string;

  /** When link was clicked */
  clickedAt: ISODateString;

  /** Link label/text */
  linkLabel?: string;

  /** Link position in message */
  linkPosition?: number;

  /** User agent */
  userAgent?: string;

  /** IP address */
  ipAddress?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign clicked event envelope
 */
export type CampaignClickedEvent = EventEnvelope<CampaignClickedPayload>;

/**
 * Campaign unsubscribed event payload
 *
 * Published when a patient unsubscribes from campaigns or a specific channel.
 * CRITICAL: Must immediately update consent status to prevent future sends.
 *
 * @example
 * ```typescript
 * const payload: CampaignUnsubscribedPayload = {
 *   campaignId: 'camp-123' as CampaignId,
 *   patientId: 'pat-456' as PatientId,
 *   channel: 'EMAIL',
 *   reason: 'TOO_FREQUENT',
 *   unsubscribedAt: '2025-11-21T11:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T11:00:00Z',
 * };
 * ```
 */
export interface CampaignUnsubscribedPayload {
  /** Campaign that triggered unsubscribe (optional) */
  campaignId?: CampaignId;

  /** Patient who unsubscribed */
  patientId: PatientId;

  /** Channel to unsubscribe from */
  channel: MarketingChannel;

  /** Reason for unsubscribing */
  reason?: UnsubscribeReason;

  /** When unsubscribe occurred */
  unsubscribedAt: ISODateString;

  /** Additional comments from patient */
  comment?: string;

  /** Whether to unsubscribe from all marketing */
  unsubscribeFromAll: boolean;

  /** IP address */
  ipAddress?: string;

  /** User agent */
  userAgent?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Campaign unsubscribed event envelope
 */
export type CampaignUnsubscribedEvent = EventEnvelope<CampaignUnsubscribedPayload>;

// ============================================================================
// 2. SEGMENT EVENTS
// ============================================================================

/**
 * Segment created event payload
 *
 * Published when a new patient segment is defined.
 * Consumed by campaign management and analytics systems.
 *
 * @example
 * ```typescript
 * const payload: SegmentCreatedPayload = {
 *   segmentId: 'seg-123' as SegmentId,
 *   name: 'High-Value Patients',
 *   rules: [
 *     { field: 'lifetimeValue', operator: 'greater_than', value: 5000 },
 *     { field: 'lastVisit', operator: 'greater_than', value: '2024-01-01', logicalOperator: 'AND' }
 *   ],
 *   isStatic: false,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T09:00:00Z',
 * };
 * ```
 */
export interface SegmentCreatedPayload {
  /** Unique segment identifier */
  segmentId: SegmentId;

  /** Segment name */
  name: string;

  /** Segmentation rules for dynamic segments */
  rules: SegmentRule[];

  /** Whether segment is static (manual) or dynamic (rule-based) */
  isStatic: boolean;

  /** Segment description */
  description?: string;

  /** Created by user */
  createdBy?: UserId;

  /** Refresh frequency for dynamic segments (in minutes) */
  refreshInterval?: number;

  /** Initial patient count */
  initialPatientCount?: number;

  /** Segment tags */
  tags?: string[];

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Segment created event envelope
 */
export type SegmentCreatedEvent = EventEnvelope<SegmentCreatedPayload>;

/**
 * Segment refreshed event payload
 *
 * Published when a dynamic segment is recalculated.
 * Used to track segment membership changes over time.
 *
 * @example
 * ```typescript
 * const payload: SegmentRefreshedPayload = {
 *   segmentId: 'seg-123' as SegmentId,
 *   previousCount: 1200,
 *   newCount: 1250,
 *   addedPatients: 75,
 *   removedPatients: 25,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T12:00:00Z',
 * };
 * ```
 */
export interface SegmentRefreshedPayload {
  /** Segment identifier */
  segmentId: SegmentId;

  /** Previous patient count */
  previousCount: number;

  /** New patient count after refresh */
  newCount: number;

  /** Number of patients added */
  addedPatients: number;

  /** Number of patients removed */
  removedPatients: number;

  /** Refresh duration in milliseconds */
  refreshDuration?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Segment refreshed event envelope
 */
export type SegmentRefreshedEvent = EventEnvelope<SegmentRefreshedPayload>;

/**
 * Segment patient added event payload
 *
 * Published when a patient joins a segment (manual or automatic).
 * Can trigger automated workflows based on segment membership.
 *
 * @example
 * ```typescript
 * const payload: SegmentPatientAddedPayload = {
 *   segmentId: 'seg-123' as SegmentId,
 *   patientId: 'pat-456' as PatientId,
 *   addedAt: '2025-11-21T13:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T13:00:00Z',
 * };
 * ```
 */
export interface SegmentPatientAddedPayload {
  /** Segment identifier */
  segmentId: SegmentId;

  /** Patient added to segment */
  patientId: PatientId;

  /** When patient was added */
  addedAt: ISODateString;

  /** How patient was added */
  addMethod?: 'AUTOMATIC' | 'MANUAL' | 'IMPORT';

  /** User who added patient (for manual adds) */
  addedBy?: UserId;

  /** Reason for addition */
  reason?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Segment patient added event envelope
 */
export type SegmentPatientAddedEvent = EventEnvelope<SegmentPatientAddedPayload>;

/**
 * Segment patient removed event payload
 *
 * Published when a patient leaves a segment.
 * May trigger workflow cleanup or status updates.
 *
 * @example
 * ```typescript
 * const payload: SegmentPatientRemovedPayload = {
 *   segmentId: 'seg-123' as SegmentId,
 *   patientId: 'pat-456' as PatientId,
 *   removedAt: '2025-11-21T14:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T14:00:00Z',
 * };
 * ```
 */
export interface SegmentPatientRemovedPayload {
  /** Segment identifier */
  segmentId: SegmentId;

  /** Patient removed from segment */
  patientId: PatientId;

  /** When patient was removed */
  removedAt: ISODateString;

  /** How patient was removed */
  removeMethod?: 'AUTOMATIC' | 'MANUAL' | 'RULE_CHANGE';

  /** User who removed patient (for manual removes) */
  removedBy?: UserId;

  /** Reason for removal */
  reason?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Segment patient removed event envelope
 */
export type SegmentPatientRemovedEvent = EventEnvelope<SegmentPatientRemovedPayload>;

// ============================================================================
// 3. REFERRAL EVENTS
// ============================================================================

/**
 * Referral created event payload
 *
 * Published when a patient generates a referral code.
 * Consumed by referral tracking and reward management systems.
 *
 * @example
 * ```typescript
 * const payload: ReferralCreatedPayload = {
 *   referralId: 'ref-123' as ReferralId,
 *   referrerPatientId: 'pat-456' as PatientId,
 *   code: 'JOHN2025',
 *   rewardType: 'DISCOUNT_PERCENTAGE',
 *   rewardAmount: 20,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface ReferralCreatedPayload {
  /** Unique referral identifier */
  referralId: ReferralId;

  /** Patient who created the referral */
  referrerPatientId: PatientId;

  /** Referral code */
  code: string;

  /** Type of reward */
  rewardType: RewardType;

  /** Reward amount (percentage, fixed amount, or points) */
  rewardAmount: number;

  /** Reward description */
  rewardDescription?: string;

  /** Expiration date */
  expiresAt?: ISODateString;

  /** Maximum number of uses */
  maxUses?: number;

  /** Current use count */
  currentUses?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Referral created event envelope
 */
export type ReferralCreatedEvent = EventEnvelope<ReferralCreatedPayload>;

/**
 * Referral completed event payload
 *
 * Published when a referred patient completes the qualifying action.
 * Triggers reward allocation to the referrer.
 *
 * @example
 * ```typescript
 * const payload: ReferralCompletedPayload = {
 *   referralId: 'ref-123' as ReferralId,
 *   referrerPatientId: 'pat-456' as PatientId,
 *   refereePatientId: 'pat-789' as PatientId,
 *   completedAt: '2025-11-25T14:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-25T14:00:00Z',
 * };
 * ```
 */
export interface ReferralCompletedPayload {
  /** Referral identifier */
  referralId: ReferralId;

  /** Patient who made the referral */
  referrerPatientId: PatientId;

  /** Patient who was referred */
  refereePatientId: PatientId;

  /** When referral was completed */
  completedAt: ISODateString;

  /** Qualifying action that completed the referral */
  qualifyingAction?: 'FIRST_APPOINTMENT' | 'FIRST_TREATMENT' | 'FIRST_PAYMENT' | 'REGISTRATION';

  /** Appointment ID if applicable */
  appointmentId?: AppointmentId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Referral completed event envelope
 */
export type ReferralCompletedEvent = EventEnvelope<ReferralCompletedPayload>;

/**
 * Referral redeemed event payload
 *
 * Published when a referrer redeems their earned reward.
 * Consumed by billing and accounting systems.
 *
 * @example
 * ```typescript
 * const payload: ReferralRedeemedPayload = {
 *   referralId: 'ref-123' as ReferralId,
 *   referrerPatientId: 'pat-456' as PatientId,
 *   rewardAmount: 20,
 *   redeemedAt: '2025-11-30T10:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-30T10:00:00Z',
 * };
 * ```
 */
export interface ReferralRedeemedPayload {
  /** Referral identifier */
  referralId: ReferralId;

  /** Patient redeeming the reward */
  referrerPatientId: PatientId;

  /** Reward amount redeemed */
  rewardAmount: number;

  /** When reward was redeemed */
  redeemedAt: ISODateString;

  /** How reward was applied */
  redemptionMethod?: 'ACCOUNT_CREDIT' | 'DISCOUNT_APPLIED' | 'GIFT_CARD' | 'POINTS_ADDED';

  /** Invoice or transaction ID if applicable */
  transactionId?: UUID;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Referral redeemed event envelope
 */
export type ReferralRedeemedEvent = EventEnvelope<ReferralRedeemedPayload>;

/**
 * Referral expired event payload
 *
 * Published when a referral code expires.
 * Used for cleanup and reporting.
 *
 * @example
 * ```typescript
 * const payload: ReferralExpiredPayload = {
 *   referralId: 'ref-123' as ReferralId,
 *   referrerPatientId: 'pat-456' as PatientId,
 *   expiredAt: '2025-12-31T23:59:59Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-12-31T23:59:59Z',
 * };
 * ```
 */
export interface ReferralExpiredPayload {
  /** Referral identifier */
  referralId: ReferralId;

  /** Patient who created the referral */
  referrerPatientId: PatientId;

  /** When referral expired */
  expiredAt: ISODateString;

  /** Number of times referral was used */
  totalUses?: number;

  /** Number of completed referrals */
  completedCount?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Referral expired event envelope
 */
export type ReferralExpiredEvent = EventEnvelope<ReferralExpiredPayload>;

// ============================================================================
// 4. LOYALTY EVENTS
// ============================================================================

/**
 * Loyalty account created event payload
 *
 * Published when a patient enrolls in the loyalty program.
 * Consumed by CRM and marketing automation systems.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyAccountCreatedPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   initialTier: 'BRONZE',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface LoyaltyAccountCreatedPayload {
  /** Unique loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient enrolled in program */
  patientId: PatientId;

  /** Initial tier level */
  initialTier: LoyaltyTier;

  /** Signup bonus points */
  signupBonus?: number;

  /** Enrollment method */
  enrollmentMethod?: 'SELF_SERVICE' | 'STAFF_ENROLLED' | 'AUTOMATIC' | 'IMPORT';

  /** Enrolled by user (for staff enrollments) */
  enrolledBy?: UserId;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty account created event envelope
 */
export type LoyaltyAccountCreatedEvent = EventEnvelope<LoyaltyAccountCreatedPayload>;

/**
 * Loyalty points accrued event payload
 *
 * Published when a patient earns loyalty points.
 * Consumed by loyalty balance tracking and notification systems.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyPointsAccruedPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   amount: 50,
 *   source: 'APPOINTMENT_COMPLETED',
 *   sourceId: 'appt-789' as AppointmentId,
 *   newBalance: 550,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T15:00:00Z',
 * };
 * ```
 */
export interface LoyaltyPointsAccruedPayload {
  /** Loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient earning points */
  patientId: PatientId;

  /** Points amount earned */
  amount: number;

  /** Source of points */
  source: PointsSource;

  /** Source entity ID (appointment, referral, etc.) */
  sourceId?: UUID;

  /** New total balance after accrual */
  newBalance: number;

  /** Previous balance */
  previousBalance?: number;

  /** Points expiration date */
  expiresAt?: ISODateString;

  /** Description of accrual */
  description?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty points accrued event envelope
 */
export type LoyaltyPointsAccruedEvent = EventEnvelope<LoyaltyPointsAccruedPayload>;

/**
 * Loyalty points redeemed event payload
 *
 * Published when a patient redeems loyalty points.
 * Consumed by billing and loyalty balance tracking systems.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyPointsRedeemedPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   amount: 100,
 *   redeemedFor: 'Discount on cleaning appointment',
 *   newBalance: 450,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-22T10:00:00Z',
 * };
 * ```
 */
export interface LoyaltyPointsRedeemedPayload {
  /** Loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient redeeming points */
  patientId: PatientId;

  /** Points amount redeemed */
  amount: number;

  /** What points were redeemed for */
  redeemedFor: string;

  /** New balance after redemption */
  newBalance: number;

  /** Previous balance */
  previousBalance?: number;

  /** Monetary value of redemption */
  monetaryValue?: number;

  /** Associated transaction ID */
  transactionId?: UUID;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty points redeemed event envelope
 */
export type LoyaltyPointsRedeemedEvent = EventEnvelope<LoyaltyPointsRedeemedPayload>;

/**
 * Loyalty points expired event payload
 *
 * Published when loyalty points expire due to inactivity or time limits.
 * Used for balance adjustments and customer notifications.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyPointsExpiredPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   amount: 50,
 *   expiredAt: '2025-11-21T23:59:59Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T23:59:59Z',
 * };
 * ```
 */
export interface LoyaltyPointsExpiredPayload {
  /** Loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient whose points expired */
  patientId: PatientId;

  /** Points amount expired */
  amount: number;

  /** When points expired */
  expiredAt: ISODateString;

  /** New balance after expiration */
  newBalance?: number;

  /** Reason for expiration */
  expirationReason?: 'TIME_LIMIT' | 'INACTIVITY' | 'ACCOUNT_CLOSURE' | 'POLICY_CHANGE';

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty points expired event envelope
 */
export type LoyaltyPointsExpiredEvent = EventEnvelope<LoyaltyPointsExpiredPayload>;

/**
 * Loyalty tier upgraded event payload
 *
 * Published when a patient moves to a higher loyalty tier.
 * Can trigger congratulatory communications and unlock new benefits.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyTierUpgradedPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   previousTier: 'SILVER',
 *   newTier: 'GOLD',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-22T10:00:00Z',
 * };
 * ```
 */
export interface LoyaltyTierUpgradedPayload {
  /** Loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient who was upgraded */
  patientId: PatientId;

  /** Previous tier */
  previousTier: LoyaltyTier;

  /** New tier */
  newTier: LoyaltyTier;

  /** Current points balance */
  currentBalance?: number;

  /** Upgrade bonus points */
  upgradeBonus?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty tier upgraded event envelope
 */
export type LoyaltyTierUpgradedEvent = EventEnvelope<LoyaltyTierUpgradedPayload>;

/**
 * Loyalty tier downgraded event payload
 *
 * Published when a patient moves to a lower loyalty tier.
 * May trigger retention campaigns or notifications about lost benefits.
 *
 * @example
 * ```typescript
 * const payload: LoyaltyTierDowngradedPayload = {
 *   accountId: 'loy-123' as LoyaltyAccountId,
 *   patientId: 'pat-456' as PatientId,
 *   previousTier: 'GOLD',
 *   newTier: 'SILVER',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-22T10:00:00Z',
 * };
 * ```
 */
export interface LoyaltyTierDowngradedPayload {
  /** Loyalty account identifier */
  accountId: LoyaltyAccountId;

  /** Patient who was downgraded */
  patientId: PatientId;

  /** Previous tier */
  previousTier: LoyaltyTier;

  /** New tier */
  newTier: LoyaltyTier;

  /** Current points balance */
  currentBalance?: number;

  /** Reason for downgrade */
  downgradeReason?: 'INACTIVITY' | 'BALANCE_THRESHOLD' | 'POLICY_CHANGE' | 'MANUAL_ADJUSTMENT';

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Loyalty tier downgraded event envelope
 */
export type LoyaltyTierDowngradedEvent = EventEnvelope<LoyaltyTierDowngradedPayload>;

// ============================================================================
// 5. FEEDBACK EVENTS
// ============================================================================

/**
 * Feedback received event payload
 *
 * Published when a patient submits feedback or a review.
 * Consumed by reputation management and quality improvement systems.
 *
 * @example
 * ```typescript
 * const payload: FeedbackReceivedPayload = {
 *   feedbackId: 'fb-123' as FeedbackId,
 *   patientId: 'pat-456' as PatientId,
 *   appointmentId: 'appt-789' as AppointmentId,
 *   providerId: 'prov-101' as ProviderId,
 *   rating: 5,
 *   category: 'OVERALL_EXPERIENCE',
 *   sentiment: 'POSITIVE',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T16:00:00Z',
 * };
 * ```
 */
export interface FeedbackReceivedPayload {
  /** Unique feedback identifier */
  feedbackId: FeedbackId;

  /** Patient who submitted feedback */
  patientId: PatientId;

  /** Appointment the feedback is about */
  appointmentId?: AppointmentId;

  /** Provider the feedback is about */
  providerId?: ProviderId;

  /** Rating (1-5 scale) */
  rating: 1 | 2 | 3 | 4 | 5;

  /** Feedback category */
  category: FeedbackCategory;

  /** Sentiment analysis result */
  sentiment: Sentiment;

  /** Feedback comment */
  comment?: string;

  /** Whether feedback is public (shareable) */
  isPublic: boolean;

  /** Whether patient consents to use in marketing */
  marketingConsent: boolean;

  /** Feedback channel */
  channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'GOOGLE' | 'FACEBOOK' | 'YELP' | 'OTHER';

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Feedback received event envelope
 */
export type FeedbackReceivedEvent = EventEnvelope<FeedbackReceivedPayload>;

/**
 * Feedback positive event payload
 *
 * Published when high-rated feedback is received (rating >= 4).
 * Triggers review request automation and reputation management actions.
 *
 * @example
 * ```typescript
 * const payload: FeedbackPositivePayload = {
 *   feedbackId: 'fb-123' as FeedbackId,
 *   patientId: 'pat-456' as PatientId,
 *   rating: 5,
 *   comment: 'Excellent service! Very professional staff.',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T16:00:00Z',
 * };
 * ```
 */
export interface FeedbackPositivePayload {
  /** Feedback identifier */
  feedbackId: FeedbackId;

  /** Patient who submitted feedback */
  patientId: PatientId;

  /** Rating (4-5) */
  rating: 4 | 5;

  /** Feedback comment */
  comment?: string;

  /** Provider the feedback is about */
  providerId?: ProviderId;

  /** Appointment the feedback is about */
  appointmentId?: AppointmentId;

  /** Whether patient consents to use in marketing */
  marketingConsent?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Feedback positive event envelope
 */
export type FeedbackPositiveEvent = EventEnvelope<FeedbackPositivePayload>;

/**
 * Feedback negative event payload
 *
 * Published when low-rated feedback is received (rating <= 2).
 * CRITICAL: Triggers immediate staff notification and service recovery workflows.
 *
 * @example
 * ```typescript
 * const payload: FeedbackNegativePayload = {
 *   feedbackId: 'fb-123' as FeedbackId,
 *   patientId: 'pat-456' as PatientId,
 *   rating: 2,
 *   comment: 'Long wait time and rushed appointment.',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T16:00:00Z',
 * };
 * ```
 */
export interface FeedbackNegativePayload {
  /** Feedback identifier */
  feedbackId: FeedbackId;

  /** Patient who submitted feedback */
  patientId: PatientId;

  /** Rating (1-2) */
  rating: 1 | 2;

  /** Feedback comment */
  comment?: string;

  /** Provider the feedback is about */
  providerId?: ProviderId;

  /** Appointment the feedback is about */
  appointmentId?: AppointmentId;

  /** Category of complaint */
  category?: FeedbackCategory;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Feedback negative event envelope
 */
export type FeedbackNegativeEvent = EventEnvelope<FeedbackNegativePayload>;

// ============================================================================
// 6. NPS EVENTS
// ============================================================================

/**
 * NPS submitted event payload
 *
 * Published when a patient submits an NPS (Net Promoter Score).
 * Consumed by analytics and customer satisfaction tracking systems.
 *
 * @example
 * ```typescript
 * const payload: NpsSubmittedPayload = {
 *   npsScoreId: 'nps-123' as NpsScoreId,
 *   patientId: 'pat-456' as PatientId,
 *   score: 9,
 *   category: 'PROMOTER',
 *   comment: 'Would definitely recommend to friends and family.',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T17:00:00Z',
 * };
 * ```
 */
export interface NpsSubmittedPayload {
  /** Unique NPS score identifier */
  npsScoreId: NpsScoreId;

  /** Patient who submitted score */
  patientId: PatientId;

  /** NPS score (0-10) */
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  /** NPS category based on score */
  category: NpsCategory;

  /** Optional comment */
  comment?: string;

  /** Survey campaign ID if applicable */
  campaignId?: CampaignId;

  /** Submission channel */
  channel?: 'EMAIL' | 'SMS' | 'IN_APP' | 'WEB' | 'PHONE';

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * NPS submitted event envelope
 */
export type NpsSubmittedEvent = EventEnvelope<NpsSubmittedPayload>;

/**
 * NPS promoter event payload
 *
 * Published when a patient submits a promoter score (9-10).
 * Triggers referral program invitations and testimonial requests.
 *
 * @example
 * ```typescript
 * const payload: NpsPromoterPayload = {
 *   npsScoreId: 'nps-123' as NpsScoreId,
 *   patientId: 'pat-456' as PatientId,
 *   score: 10,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T17:00:00Z',
 * };
 * ```
 */
export interface NpsPromoterPayload {
  /** NPS score identifier */
  npsScoreId: NpsScoreId;

  /** Patient who is a promoter */
  patientId: PatientId;

  /** Score (9-10) */
  score: 9 | 10;

  /** Comment if provided */
  comment?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * NPS promoter event envelope
 */
export type NpsPromoterEvent = EventEnvelope<NpsPromoterPayload>;

/**
 * NPS detractor event payload
 *
 * Published when a patient submits a detractor score (0-6).
 * CRITICAL: Triggers service recovery and retention workflows.
 *
 * @example
 * ```typescript
 * const payload: NpsDetractorPayload = {
 *   npsScoreId: 'nps-123' as NpsScoreId,
 *   patientId: 'pat-456' as PatientId,
 *   score: 4,
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T17:00:00Z',
 * };
 * ```
 */
export interface NpsDetractorPayload {
  /** NPS score identifier */
  npsScoreId: NpsScoreId;

  /** Patient who is a detractor */
  patientId: PatientId;

  /** Score (0-6) */
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Comment if provided */
  comment?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * NPS detractor event envelope
 */
export type NpsDetractorEvent = EventEnvelope<NpsDetractorPayload>;

// ============================================================================
// 7. AUTOMATION EVENTS
// ============================================================================

/**
 * Automation triggered event payload
 *
 * Published when an automation rule is triggered by an event.
 * Consumed by workflow execution engine.
 *
 * @example
 * ```typescript
 * const payload: AutomationTriggeredPayload = {
 *   automationRuleId: 'rule-123' as AutomationRuleId,
 *   triggerType: 'APPOINTMENT_COMPLETED',
 *   context: { appointmentId: 'appt-789', patientId: 'pat-456' },
 *   actionsToExecute: [
 *     { actionType: 'SEND_EMAIL', config: { templateId: 'tmpl-feedback' }, delay: 3600000 }
 *   ],
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T15:00:00Z',
 * };
 * ```
 */
export interface AutomationTriggeredPayload {
  /** Automation rule identifier */
  automationRuleId: AutomationRuleId;

  /** Type of trigger that fired */
  triggerType: AutomationTriggerType;

  /** Context data from the trigger event */
  context: Record<string, unknown>;

  /** Actions to be executed */
  actionsToExecute: AutomationAction[];

  /** Rule name */
  ruleName?: string;

  /** Rule description */
  ruleDescription?: string;

  /** Whether rule is active */
  isActive?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Automation triggered event envelope
 */
export type AutomationTriggeredEvent = EventEnvelope<AutomationTriggeredPayload>;

/**
 * Automation executed event payload
 *
 * Published when an automation action completes (success or failure).
 * Used for monitoring, debugging, and analytics.
 *
 * @example
 * ```typescript
 * const payload: AutomationExecutedPayload = {
 *   automationRuleId: 'rule-123' as AutomationRuleId,
 *   actionType: 'SEND_EMAIL',
 *   success: true,
 *   result: { deliveryLogId: 'log-456', status: 'SENT' },
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T16:00:00Z',
 * };
 * ```
 */
export interface AutomationExecutedPayload {
  /** Automation rule identifier */
  automationRuleId: AutomationRuleId;

  /** Type of action executed */
  actionType: AutomationActionType;

  /** Whether execution was successful */
  success: boolean;

  /** Execution result data */
  result?: Record<string, unknown>;

  /** Error message if failed */
  error?: string;

  /** Error code if failed */
  errorCode?: string;

  /** Execution duration in milliseconds */
  executionDuration?: number;

  /** Retry attempt number */
  retryAttempt?: number;

  /** Context from trigger */
  context?: Record<string, unknown>;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Automation executed event envelope
 */
export type AutomationExecutedEvent = EventEnvelope<AutomationExecutedPayload>;

// ============================================================================
// 8. DELIVERY EVENTS
// ============================================================================

/**
 * Delivery queued event payload
 *
 * Published when a message is queued for delivery.
 * Used for tracking delivery pipeline and monitoring.
 *
 * @example
 * ```typescript
 * const payload: DeliveryQueuedPayload = {
 *   deliveryLogId: 'log-123' as DeliveryLogId,
 *   campaignId: 'camp-456' as CampaignId,
 *   patientId: 'pat-789' as PatientId,
 *   channel: 'EMAIL',
 *   queuedAt: '2025-11-21T10:00:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:00:00Z',
 * };
 * ```
 */
export interface DeliveryQueuedPayload {
  /** Delivery log identifier */
  deliveryLogId: DeliveryLogId;

  /** Campaign identifier */
  campaignId?: CampaignId;

  /** Patient recipient */
  patientId: PatientId;

  /** Delivery channel */
  channel: MarketingChannel;

  /** When message was queued */
  queuedAt: ISODateString;

  /** Scheduled send time */
  scheduledFor?: ISODateString;

  /** Priority (1-10, higher = more urgent) */
  priority?: number;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Delivery queued event envelope
 */
export type DeliveryQueuedEvent = EventEnvelope<DeliveryQueuedPayload>;

/**
 * Delivery sent event payload
 *
 * Published when a message is sent to the delivery provider.
 * Does not guarantee delivery, only that send was attempted.
 *
 * @example
 * ```typescript
 * const payload: DeliverySentPayload = {
 *   deliveryLogId: 'log-123' as DeliveryLogId,
 *   campaignId: 'camp-456' as CampaignId,
 *   patientId: 'pat-789' as PatientId,
 *   channel: 'EMAIL',
 *   sentAt: '2025-11-21T10:05:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:05:00Z',
 * };
 * ```
 */
export interface DeliverySentPayload {
  /** Delivery log identifier */
  deliveryLogId: DeliveryLogId;

  /** Campaign identifier */
  campaignId?: CampaignId;

  /** Patient recipient */
  patientId: PatientId;

  /** Delivery channel */
  channel: MarketingChannel;

  /** When message was sent */
  sentAt: ISODateString;

  /** External provider message ID */
  providerMessageId?: string;

  /** Provider name */
  providerName?: string;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Delivery sent event envelope
 */
export type DeliverySentEvent = EventEnvelope<DeliverySentPayload>;

/**
 * Delivery failed event payload
 *
 * Published when message delivery fails.
 * Triggers retry logic or error handling workflows.
 *
 * @example
 * ```typescript
 * const payload: DeliveryFailedPayload = {
 *   deliveryLogId: 'log-123' as DeliveryLogId,
 *   campaignId: 'camp-456' as CampaignId,
 *   patientId: 'pat-789' as PatientId,
 *   channel: 'EMAIL',
 *   error: 'SMTP connection timeout',
 *   failedAt: '2025-11-21T10:05:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:05:00Z',
 * };
 * ```
 */
export interface DeliveryFailedPayload {
  /** Delivery log identifier */
  deliveryLogId: DeliveryLogId;

  /** Campaign identifier */
  campaignId?: CampaignId;

  /** Patient recipient */
  patientId: PatientId;

  /** Delivery channel */
  channel: MarketingChannel;

  /** Error message */
  error: string;

  /** When delivery failed */
  failedAt: ISODateString;

  /** Error code */
  errorCode?: string;

  /** Error type */
  errorType?: 'TEMPORARY' | 'PERMANENT' | 'CONFIGURATION' | 'RATE_LIMIT';

  /** Attempt number */
  attemptNumber?: number;

  /** Whether retry will be attempted */
  willRetry?: boolean;

  /** Next retry time */
  nextRetryAt?: ISODateString;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Delivery failed event envelope
 */
export type DeliveryFailedEvent = EventEnvelope<DeliveryFailedPayload>;

/**
 * Delivery bounced event payload
 *
 * Published when a message bounces (invalid recipient, mailbox full, etc.).
 * CRITICAL: May require updating patient contact information or removing from lists.
 *
 * @example
 * ```typescript
 * const payload: DeliveryBouncedPayload = {
 *   deliveryLogId: 'log-123' as DeliveryLogId,
 *   campaignId: 'camp-456' as CampaignId,
 *   patientId: 'pat-789' as PatientId,
 *   channel: 'EMAIL',
 *   reason: 'Mailbox full',
 *   bouncedAt: '2025-11-21T10:10:00Z',
 *   tenantId: 'tenant-abc' as TenantId,
 *   organizationId: 'org-def' as OrganizationId,
 *   clinicId: 'clinic-ghi' as ClinicId,
 *   timestamp: '2025-11-21T10:10:00Z',
 * };
 * ```
 */
export interface DeliveryBouncedPayload {
  /** Delivery log identifier */
  deliveryLogId: DeliveryLogId;

  /** Campaign identifier */
  campaignId?: CampaignId;

  /** Patient recipient */
  patientId: PatientId;

  /** Delivery channel */
  channel: MarketingChannel;

  /** Bounce reason */
  reason: string;

  /** When bounce occurred */
  bouncedAt: ISODateString;

  /** Bounce type */
  bounceType?: 'HARD' | 'SOFT' | 'COMPLAINT' | 'SUPPRESSION';

  /** Bounce subtype */
  bounceSubtype?: 'GENERAL' | 'NO_EMAIL' | 'SUPPRESSED' | 'MAILBOX_FULL' | 'MESSAGE_TOO_LARGE' | 'CONTENT_REJECTED';

  /** Whether patient should be suppressed from future sends */
  shouldSuppress?: boolean;

  /** Tenant context */
  tenantId: TenantId;
  organizationId: OrganizationId;
  clinicId: ClinicId;

  /** Audit context */
  timestamp: ISODateString;
  correlationId?: string;

  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Delivery bounced event envelope
 */
export type DeliveryBouncedEvent = EventEnvelope<DeliveryBouncedPayload>;
