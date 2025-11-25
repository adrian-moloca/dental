/**
 * Marketing Domain Types
 *
 * Complete domain types for Marketing, Patient Engagement, Loyalty Programs,
 * Referrals, Feedback/NPS, and Marketing Automation in dental practice management system.
 * Defines campaigns, segments, referrals, loyalty accounts, feedback, NPS, automation rules,
 * and communication delivery tracking.
 *
 * This module implements comprehensive marketing domain types that support:
 * - Multi-channel campaign management (Email, SMS, Push, WhatsApp)
 * - Dynamic patient segmentation with rule-based filtering
 * - Referral program management with reward tracking
 * - Loyalty/points program with tiered benefits
 * - Patient feedback and NPS (Net Promoter Score) tracking
 * - Marketing automation engine (trigger-based workflows)
 * - Communication delivery tracking and analytics
 * - AI integration readiness (churn scoring, sentiment analysis)
 * - GDPR/TCPA compliance (consent management, opt-out tracking)
 *
 * Real-world dental practice marketing workflows:
 * - Recall campaigns: Automated reminders for 6-month cleanings, overdue hygiene visits
 * - Birthday campaigns: Personalized birthday greetings with special offers
 * - Treatment follow-up: Post-procedure check-ins, satisfaction surveys
 * - Reactivation campaigns: Win-back campaigns for inactive patients
 * - Referral incentives: Patient referral rewards (points, discounts, gift cards)
 * - Loyalty rewards: Points for procedures, redemption for services/products
 * - NPS tracking: Post-visit feedback collection and analysis
 * - Educational content: Oral health tips, treatment education sequences
 * - Seasonal promotions: Teeth whitening specials, back-to-school checkups
 * - Emergency slots: Last-minute availability notifications to waitlist
 *
 * Compliance considerations:
 * - TCPA: Requires explicit consent for marketing SMS/calls (US)
 * - CAN-SPAM: Unsubscribe links, sender identification (Email)
 * - GDPR: Consent tracking, right to erasure, data portability (EU)
 * - HIPAA: PHI protection in marketing communications (US)
 * - State dental board regulations: Professional advertising standards
 *
 * @module shared-domain/marketing
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  TenantId,
  Metadata,
} from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { PatientId, ProviderId, ProcedureId } from '../clinical';
import type { InvoiceId } from '../billing';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for a user (staff member, provider, admin)
 * Re-defined here to avoid circular dependency with auth module
 */
export type UserId = UUID & { readonly __brand: 'UserId' };

/**
 * Unique identifier for a marketing campaign
 */
export type CampaignId = UUID & { readonly __brand: 'CampaignId' };

/**
 * Unique identifier for a patient segment
 */
export type SegmentId = UUID & { readonly __brand: 'SegmentId' };

/**
 * Unique identifier for a referral
 */
export type ReferralId = UUID & { readonly __brand: 'ReferralId' };

/**
 * Unique identifier for a loyalty account
 */
export type LoyaltyAccountId = UUID & { readonly __brand: 'LoyaltyAccountId' };

/**
 * Unique identifier for a loyalty transaction
 */
export type LoyaltyTransactionId = UUID & { readonly __brand: 'LoyaltyTransactionId' };

/**
 * Unique identifier for a feedback record
 */
export type FeedbackId = UUID & { readonly __brand: 'FeedbackId' };

/**
 * Unique identifier for an NPS score submission
 */
export type NpsScoreId = UUID & { readonly __brand: 'NpsScoreId' };

/**
 * Unique identifier for an automation rule
 */
export type AutomationRuleId = UUID & { readonly __brand: 'AutomationRuleId' };

/**
 * Unique identifier for a delivery log entry
 */
export type DeliveryLogId = UUID & { readonly __brand: 'DeliveryLogId' };

/**
 * Unique identifier for a campaign template
 */
export type CampaignTemplateId = UUID & { readonly __brand: 'CampaignTemplateId' };

/**
 * Unique identifier for an automation execution
 */
export type AutomationExecutionId = UUID & { readonly __brand: 'AutomationExecutionId' };

// ============================================================================
// CAMPAIGN DOMAIN TYPES
// ============================================================================

/**
 * Campaign communication channel
 *
 * Supported channels for patient communication:
 * - EMAIL: Email campaigns (newsletters, promotions, recalls)
 * - SMS: Text message campaigns (reminders, confirmations)
 * - PUSH: Mobile app push notifications
 * - WHATSAPP: WhatsApp Business API messages
 *
 * Edge cases:
 * - Patient must have opted in for each channel separately (GDPR/TCPA)
 * - SMS has character limits (160 chars standard, 1600 for long)
 * - WhatsApp requires message templates for promotional content
 * - Push requires active app installation and notification permissions
 */
export enum CampaignChannel {
  /** Email communication */
  EMAIL = 'EMAIL',
  /** SMS/text message */
  SMS = 'SMS',
  /** Mobile app push notification */
  PUSH = 'PUSH',
  /** WhatsApp Business message */
  WHATSAPP = 'WHATSAPP',
}

/**
 * Campaign status enumeration
 *
 * Campaign lifecycle:
 * DRAFT → SCHEDULED → ACTIVE → COMPLETED
 *       → PAUSED → ACTIVE (resume)
 *       → CANCELLED (abort)
 *
 * Edge cases:
 * - DRAFT: Campaign being created, not yet scheduled
 * - SCHEDULED: Campaign scheduled, not yet sent
 * - ACTIVE: Campaign currently sending/active
 * - PAUSED: Campaign temporarily paused (can resume)
 * - COMPLETED: Campaign finished, all messages sent
 * - CANCELLED: Campaign cancelled before completion
 */
export enum CampaignStatus {
  /** Draft campaign (not scheduled) */
  DRAFT = 'DRAFT',
  /** Scheduled for future send */
  SCHEDULED = 'SCHEDULED',
  /** Currently active/sending */
  ACTIVE = 'ACTIVE',
  /** Temporarily paused */
  PAUSED = 'PAUSED',
  /** Completed successfully */
  COMPLETED = 'COMPLETED',
  /** Cancelled/aborted */
  CANCELLED = 'CANCELLED',
}

/**
 * Campaign schedule type
 *
 * Determines when and how often campaign messages are sent.
 *
 * Real-world dental examples:
 * - IMMEDIATE: Emergency slot notifications (send now)
 * - SCHEDULED: Birthday campaigns (send on specific date)
 * - RECURRING: Monthly oral health tips, quarterly recall reminders
 *
 * Edge cases:
 * - IMMEDIATE campaigns send as soon as activated
 * - SCHEDULED campaigns send at specific date/time
 * - RECURRING campaigns follow recurrence rule (daily, weekly, monthly)
 */
export enum CampaignScheduleType {
  /** Send immediately upon activation */
  IMMEDIATE = 'IMMEDIATE',
  /** Send at specific date/time */
  SCHEDULED = 'SCHEDULED',
  /** Send on recurring schedule */
  RECURRING = 'RECURRING',
}

/**
 * Recurrence frequency for recurring campaigns
 *
 * Standard recurrence patterns for automated marketing campaigns.
 */
export enum RecurrenceFrequency {
  /** Daily recurrence */
  DAILY = 'DAILY',
  /** Weekly recurrence */
  WEEKLY = 'WEEKLY',
  /** Monthly recurrence */
  MONTHLY = 'MONTHLY',
  /** Quarterly recurrence */
  QUARTERLY = 'QUARTERLY',
  /** Annual recurrence */
  ANNUAL = 'ANNUAL',
}

/**
 * Campaign schedule configuration
 *
 * Defines when and how often a campaign executes.
 *
 * Edge cases:
 * - startDate required for SCHEDULED and RECURRING
 * - endDate optional for RECURRING (runs indefinitely if not set)
 * - recurrenceRule required for RECURRING type
 * - Timezone considerations for multi-location practices
 */
export interface CampaignSchedule {
  /** Schedule type */
  type: CampaignScheduleType;
  /** Start date/time (required for SCHEDULED and RECURRING) */
  startDate?: ISODateString;
  /** End date/time (optional, for RECURRING campaigns) */
  endDate?: ISODateString;
  /** Recurrence rule (required for RECURRING type) */
  recurrenceRule?: RecurrenceRule;
  /** Timezone for scheduling (IANA timezone, e.g., "America/New_York") */
  timezone?: string;
}

/**
 * Recurrence rule for recurring campaigns
 *
 * Defines how often a recurring campaign executes.
 *
 * Real-world examples:
 * - Recall reminders: Every 6 months (MONTHLY, interval=6)
 * - Weekly health tips: Every week (WEEKLY, interval=1, dayOfWeek="Monday")
 * - Birthday campaigns: Annual (ANNUAL, interval=1)
 */
export interface RecurrenceRule {
  /** Recurrence frequency */
  frequency: RecurrenceFrequency;
  /** Interval between occurrences (e.g., 2 = every 2 weeks) */
  interval: number;
  /** Day of week for WEEKLY recurrence (0=Sunday, 6=Saturday) */
  dayOfWeek?: number;
  /** Day of month for MONTHLY recurrence (1-31) */
  dayOfMonth?: number;
  /** Month of year for ANNUAL recurrence (1=Jan, 12=Dec) */
  monthOfYear?: number;
  /** Maximum number of occurrences (optional limit) */
  maxOccurrences?: number;
}

/**
 * Campaign template configuration
 *
 * Defines message content with variable substitution.
 *
 * Supported variables (patient data):
 * - {{firstName}}: Patient first name
 * - {{lastName}}: Patient last name
 * - {{preferredName}}: Patient preferred name
 * - {{nextAppointment}}: Next appointment date/time
 * - {{lastVisit}}: Last visit date
 * - {{loyaltyPoints}}: Current loyalty points balance
 * - {{referralCode}}: Patient's unique referral code
 * - {{clinicName}}: Clinic name
 * - {{providerName}}: Provider name
 *
 * Edge cases:
 * - Subject required for EMAIL channel, ignored for SMS/PUSH/WHATSAPP
 * - Body text must respect channel limits (160 chars for SMS)
 * - Variables missing data should gracefully degrade (empty string)
 * - Attachments only supported for EMAIL channel
 * - HTML formatting only for EMAIL (plain text for other channels)
 */
export interface CampaignTemplate {
  /** Template identifier (optional, if based on saved template) */
  templateId?: CampaignTemplateId;
  /** Message subject line (EMAIL only) */
  subject?: string;
  /** Message body (supports variable substitution) */
  body: string;
  /** Template variables used in subject/body */
  variables: string[];
  /** Attachments (EMAIL only) */
  attachments?: CampaignAttachment[];
  /** HTML content (EMAIL only, alternative to plain text body) */
  htmlBody?: string;
  /** Preview text (EMAIL only, appears in inbox preview) */
  previewText?: string;
  /** Sender name override (default: clinic name) */
  senderName?: string;
  /** Reply-to email address (EMAIL only) */
  replyTo?: string;
}

/**
 * Campaign attachment metadata
 *
 * Represents files attached to email campaigns.
 *
 * Edge cases:
 * - Only supported for EMAIL channel
 * - File size limits enforced by email provider (typically 25MB)
 * - Certain file types may be blocked (executables, etc.)
 * - Files stored in document management system, referenced here
 */
export interface CampaignAttachment {
  /** File identifier in document management system */
  fileId: UUID;
  /** Original filename */
  filename: string;
  /** MIME type */
  mimeType: string;
  /** File size in bytes */
  sizeBytes: number;
  /** File URL (if externally hosted) */
  url?: string;
}

/**
 * Campaign metrics aggregate
 *
 * Tracks campaign performance across all sends.
 *
 * Real-world dental metrics:
 * - Open rate: 20-30% typical for dental email campaigns
 * - Click rate: 2-5% typical for calls-to-action
 * - Bounce rate: <2% healthy, >5% indicates list quality issues
 * - Unsubscribe rate: <0.5% healthy, >2% indicates poor targeting
 *
 * Edge cases:
 * - Metrics vary by channel (email tracked differently than SMS)
 * - Opens tracked via pixel (not reliable with privacy features)
 * - Clicks tracked via redirect links
 * - Bounces categorized as hard (permanent) vs soft (temporary)
 * - Unsubscribes must be honored immediately (CAN-SPAM/GDPR)
 */
export interface CampaignMetrics {
  /** Total messages sent */
  sent: number;
  /** Total messages delivered (sent - bounced) */
  delivered: number;
  /** Total messages opened (email only) */
  opened: number;
  /** Total clicks on links */
  clicked: number;
  /** Total bounces (hard + soft) */
  bounced: number;
  /** Total unsubscribes/opt-outs */
  unsubscribed: number;
  /** Total spam complaints */
  complained: number;
  /** Total conversions (appointments booked, etc.) */
  converted?: number;
  /** Open rate (opened / delivered) */
  openRate?: number;
  /** Click-through rate (clicked / delivered) */
  clickRate?: number;
  /** Bounce rate (bounced / sent) */
  bounceRate?: number;
  /** Unsubscribe rate (unsubscribed / delivered) */
  unsubscribeRate?: number;
  /** Conversion rate (converted / delivered) */
  conversionRate?: number;
  /** Last metrics update timestamp */
  lastUpdatedAt: ISODateString;
}

/**
 * Campaign entity (aggregate root)
 *
 * Represents a marketing campaign targeting a patient segment.
 *
 * Real-world dental campaign examples:
 * - "6-Month Recall Reminder": Email/SMS to patients overdue for cleaning
 * - "Birthday Greetings": Personalized birthday message with discount offer
 * - "Treatment Follow-Up": Post-procedure satisfaction survey
 * - "Reactivation Campaign": Win-back campaign for inactive patients (12+ months)
 * - "Referral Promotion": Refer-a-friend campaign with rewards
 * - "Seasonal Whitening": Limited-time teeth whitening promotion
 * - "Emergency Slot Alert": Last-minute availability notification
 *
 * Edge cases:
 * - Campaign can target static segment (fixed patient list) or dynamic segment (rule-based)
 * - Segment evaluation happens at send time for dynamic segments
 * - Patients can be excluded if they've opted out since campaign creation
 * - Multi-clinic campaigns require careful tenant scoping
 * - A/B testing supported via multiple templates (future enhancement)
 * - Campaign pausing should not lose progress (resume from where left off)
 */
export interface Campaign {
  /** Unique campaign identifier */
  id: CampaignId;

  // Multi-tenant context
  /** Tenant ID (effective scope: clinicId if present, else organizationId) */
  tenantId: TenantId;
  /** Organization this campaign belongs to */
  organizationId: OrganizationId;
  /** Clinic this campaign is scoped to (optional, org-wide if undefined) */
  clinicId?: ClinicId;

  // Campaign definition
  /** Campaign name (internal) */
  name: string;
  /** Campaign description (internal) */
  description?: string;
  /** Campaign type/category (recall, birthday, promotion, etc.) */
  campaignType: string;
  /** Communication channel */
  channel: CampaignChannel;
  /** Message template */
  template: CampaignTemplate;

  // Targeting
  /** Target segment ID (dynamic or static) */
  targetSegmentId: SegmentId;
  /** Exclude segment IDs (patients to exclude) */
  excludeSegmentIds?: SegmentId[];
  /** Estimated audience size at campaign creation */
  estimatedAudience?: number;

  // Scheduling
  /** Campaign schedule configuration */
  schedule: CampaignSchedule;
  /** Current campaign status */
  status: CampaignStatus;

  // Execution tracking
  /** Actual start date/time (when first message sent) */
  startedAt?: ISODateString;
  /** Actual completion date/time (when last message sent) */
  completedAt?: ISODateString;
  /** Paused date/time (if paused) */
  pausedAt?: ISODateString;
  /** Cancelled date/time (if cancelled) */
  cancelledAt?: ISODateString;
  /** Cancellation reason */
  cancellationReason?: string;

  // Performance metrics
  /** Campaign performance metrics */
  metrics: CampaignMetrics;

  // Attribution and tracking
  /** UTM campaign parameter (for web tracking) */
  utmCampaign?: string;
  /** UTM source parameter */
  utmSource?: string;
  /** UTM medium parameter */
  utmMedium?: string;
  /** Conversion tracking enabled */
  trackConversions?: boolean;

  // Compliance
  /** Whether marketing consent required (vs transactional) */
  requiresMarketingConsent: boolean;
  /** Legal compliance notes */
  complianceNotes?: string;

  // Ownership and audit
  /** User who created campaign */
  createdBy: UserId;
  /** User who last updated campaign */
  updatedBy: UserId;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// SEGMENT DOMAIN TYPES
// ============================================================================

/**
 * Segment rule field enumeration
 *
 * Fields available for segmentation rules (patient attributes).
 *
 * Real-world dental segmentation examples:
 * - High-value patients: TOTAL_SPENT > $5000
 * - Overdue recall: LAST_VISIT < 6 months ago
 * - New patients: FIRST_VISIT > 30 days ago AND APPOINTMENT_COUNT < 3
 * - Inactive patients: LAST_VISIT > 12 months ago
 * - Loyalty members: LOYALTY_TIER IN [GOLD, PLATINUM]
 * - Local patients: ZIP_CODE IN [specific zip codes]
 * - Pediatric patients: AGE < 18
 *
 * Edge cases:
 * - Date fields support relative comparisons (e.g., "last 6 months")
 * - Numeric fields support ranges (e.g., age 25-45)
 * - String fields support contains/starts with/ends with
 * - Array fields support IN operator (e.g., tags contains "VIP")
 */
export enum SegmentRuleField {
  // Demographics
  /** Patient age (calculated from DOB) */
  AGE = 'AGE',
  /** Patient gender */
  GENDER = 'GENDER',
  /** ZIP/postal code */
  ZIP_CODE = 'ZIP_CODE',
  /** Preferred language */
  LANGUAGE = 'LANGUAGE',

  // Visit history
  /** Date of last visit */
  LAST_VISIT = 'LAST_VISIT',
  /** Date of first visit */
  FIRST_VISIT = 'FIRST_VISIT',
  /** Total number of appointments */
  APPOINTMENT_COUNT = 'APPOINTMENT_COUNT',
  /** Number of cancelled appointments */
  CANCELLATION_COUNT = 'CANCELLATION_COUNT',
  /** Number of no-shows */
  NO_SHOW_COUNT = 'NO_SHOW_COUNT',

  // Financial
  /** Total amount spent (lifetime value) */
  TOTAL_SPENT = 'TOTAL_SPENT',
  /** Average invoice amount */
  AVERAGE_INVOICE = 'AVERAGE_INVOICE',
  /** Outstanding balance */
  OUTSTANDING_BALANCE = 'OUTSTANDING_BALANCE',
  /** Has payment plan */
  HAS_PAYMENT_PLAN = 'HAS_PAYMENT_PLAN',

  // Loyalty and engagement
  /** Loyalty tier */
  LOYALTY_TIER = 'LOYALTY_TIER',
  /** Current loyalty points */
  LOYALTY_POINTS = 'LOYALTY_POINTS',
  /** Number of referrals made */
  REFERRAL_COUNT = 'REFERRAL_COUNT',
  /** NPS score */
  NPS_SCORE = 'NPS_SCORE',
  /** Last feedback rating */
  FEEDBACK_RATING = 'FEEDBACK_RATING',

  // Treatment history
  /** Has specific procedure (by code) */
  HAS_PROCEDURE = 'HAS_PROCEDURE',
  /** Has active treatment plan */
  HAS_TREATMENT_PLAN = 'HAS_TREATMENT_PLAN',
  /** Has dental insurance */
  HAS_INSURANCE = 'HAS_INSURANCE',

  // Communication preferences
  /** Preferred communication channel */
  PREFERRED_CHANNEL = 'PREFERRED_CHANNEL',
  /** Marketing consent */
  MARKETING_CONSENT = 'MARKETING_CONSENT',
  /** Email enabled */
  EMAIL_ENABLED = 'EMAIL_ENABLED',
  /** SMS enabled */
  SMS_ENABLED = 'SMS_ENABLED',

  // Categorization
  /** Patient tags */
  TAGS = 'TAGS',
  /** Patient status (active, inactive, archived) */
  STATUS = 'STATUS',
}

/**
 * Segment rule operator enumeration
 *
 * Comparison operators for segment rules.
 *
 * Edge cases:
 * - EQUALS/NOT_EQUALS: Exact match (strings, numbers, dates)
 * - GREATER_THAN/LESS_THAN: Numeric/date comparison
 * - CONTAINS/NOT_CONTAINS: String substring match
 * - IN/NOT_IN: Array membership (e.g., tags IN ["VIP", "Referral"])
 * - BETWEEN: Numeric/date range (inclusive)
 * - IS_NULL/IS_NOT_NULL: Null checks for optional fields
 */
export enum SegmentRuleOperator {
  /** Equals (exact match) */
  EQUALS = 'EQUALS',
  /** Not equals */
  NOT_EQUALS = 'NOT_EQUALS',
  /** Contains (substring match) */
  CONTAINS = 'CONTAINS',
  /** Does not contain */
  NOT_CONTAINS = 'NOT_CONTAINS',
  /** Greater than */
  GREATER_THAN = 'GREATER_THAN',
  /** Greater than or equal */
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  /** Less than */
  LESS_THAN = 'LESS_THAN',
  /** Less than or equal */
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  /** In array (membership test) */
  IN = 'IN',
  /** Not in array */
  NOT_IN = 'NOT_IN',
  /** Between (inclusive range) */
  BETWEEN = 'BETWEEN',
  /** Is null */
  IS_NULL = 'IS_NULL',
  /** Is not null */
  IS_NOT_NULL = 'IS_NOT_NULL',
  /** Starts with (string prefix) */
  STARTS_WITH = 'STARTS_WITH',
  /** Ends with (string suffix) */
  ENDS_WITH = 'ENDS_WITH',
}

/**
 * Segment rule configuration
 *
 * Single rule in segment definition (field + operator + value).
 *
 * Real-world examples:
 * - { field: "LAST_VISIT", operator: "LESS_THAN", value: "2024-06-01" }
 * - { field: "TOTAL_SPENT", operator: "GREATER_THAN", value: 5000 }
 * - { field: "TAGS", operator: "IN", value: ["VIP", "High-Value"] }
 * - { field: "AGE", operator: "BETWEEN", value: [25, 45] }
 *
 * Edge cases:
 * - Value type must match field type (string, number, date)
 * - BETWEEN operator requires array value [min, max]
 * - IN/NOT_IN operators require array value
 * - IS_NULL/IS_NOT_NULL operators ignore value
 * - Date values support ISO strings and relative expressions ("30 days ago")
 */
export interface SegmentRule {
  /** Field to evaluate */
  field: SegmentRuleField;
  /** Comparison operator */
  operator: SegmentRuleOperator;
  /** Comparison value (type depends on field and operator) */
  value?: string | number | boolean | string[] | number[];
  /** Rule ID (for complex rule editing) */
  ruleId?: UUID;
}

/**
 * Segment rule group logical operator
 *
 * Defines how rules within a group are combined.
 */
export enum SegmentRuleGroupOperator {
  /** All rules must match (AND) */
  AND = 'AND',
  /** At least one rule must match (OR) */
  OR = 'OR',
}

/**
 * Segment rule group
 *
 * Groups rules with logical operator (AND/OR).
 *
 * Enables complex segmentation logic:
 * - (AGE > 18 AND LAST_VISIT < 6 months ago) OR (TAGS contains "Priority")
 * - (TOTAL_SPENT > 5000) AND (LOYALTY_TIER IN [GOLD, PLATINUM])
 *
 * Edge cases:
 * - Empty rules array treated as no filter (matches all)
 * - Nested groups enable complex logic (groups within groups)
 * - Maximum nesting depth should be limited (e.g., 3 levels)
 */
export interface SegmentRuleGroup {
  /** Group ID (for editing) */
  groupId?: UUID;
  /** Logical operator for combining rules in this group */
  operator: SegmentRuleGroupOperator;
  /** Rules in this group */
  rules: SegmentRule[];
  /** Nested rule groups (for complex logic) */
  groups?: SegmentRuleGroup[];
}

/**
 * Segment type enumeration
 *
 * Distinguishes between static and dynamic segments.
 *
 * Edge cases:
 * - DYNAMIC: Segment evaluated at query time (patient list changes)
 * - STATIC: Fixed patient list (snapshot at creation time)
 * - Static segments useful for one-time campaigns or regulatory compliance
 * - Dynamic segments automatically include new matching patients
 */
export enum SegmentType {
  /** Dynamic segment (rule-based, evaluated at query time) */
  DYNAMIC = 'DYNAMIC',
  /** Static segment (fixed patient list) */
  STATIC = 'STATIC',
}

/**
 * Patient segment entity (aggregate root)
 *
 * Defines a group of patients for targeted campaigns.
 *
 * Real-world dental segments:
 * - "Overdue Recall": Patients >6 months since last hygiene visit
 * - "High-Value VIP": Patients with >$10k lifetime value
 * - "New Patient Onboarding": Patients with <3 visits in last 90 days
 * - "Inactive Reactivation": Patients with no visits in 12+ months
 * - "Birthday Club": Patients with birthdays this month
 * - "Treatment Plan Pending": Patients with approved treatment plans not started
 * - "Loyalty Gold+": Patients in Gold or Platinum loyalty tiers
 *
 * Edge cases:
 * - Dynamic segments re-evaluated each time campaign runs
 * - Static segments are snapshots (patient list fixed at creation)
 * - Large segments (>10k patients) may need pagination
 * - Segment refresh for dynamic segments can be cached (refresh interval)
 * - Excluded segments applied after included segments evaluated
 * - Patient count estimation may be expensive for complex rules
 */
export interface Segment {
  /** Unique segment identifier */
  id: SegmentId;

  // Multi-tenant context
  /** Tenant ID (effective scope: clinicId if present, else organizationId) */
  tenantId: TenantId;
  /** Organization this segment belongs to */
  organizationId: OrganizationId;
  /** Clinic this segment is scoped to (optional, org-wide if undefined) */
  clinicId?: ClinicId;

  // Segment definition
  /** Segment name */
  name: string;
  /** Segment description */
  description?: string;
  /** Segment type (dynamic or static) */
  type: SegmentType;

  // Rule-based segmentation (for DYNAMIC segments)
  /** Segment rules (rule groups for complex logic) */
  ruleGroups?: SegmentRuleGroup[];

  // Static patient list (for STATIC segments)
  /** Patient IDs (for static segments) */
  patientIds?: PatientId[];

  // Metrics
  /** Current patient count (cached) */
  patientCount: number;
  /** Last time patient count was refreshed */
  lastRefreshedAt?: ISODateString;
  /** Auto-refresh interval in seconds (for dynamic segments) */
  refreshIntervalSeconds?: number;

  // Categorization
  /** Tags for segment organization */
  tags?: string[];
  /** Whether segment is archived (hidden from UI) */
  isArchived: boolean;

  // Audit
  /** User who created segment */
  createdBy: UserId;
  /** User who last updated segment */
  updatedBy: UserId;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// REFERRAL DOMAIN TYPES
// ============================================================================

/**
 * Referral status enumeration
 *
 * Lifecycle of a referral:
 * PENDING → COMPLETED → REDEEMED
 *        → EXPIRED
 *        → CANCELLED
 *
 * Edge cases:
 * - PENDING: Referee has been invited, not yet completed first visit
 * - COMPLETED: Referee completed first visit, referrer eligible for reward
 * - REDEEMED: Referrer has claimed/received reward
 * - EXPIRED: Referral expired before referee completed visit
 * - CANCELLED: Referral cancelled (referee declined, duplicate, etc.)
 */
export enum ReferralStatus {
  /** Referral invited, pending first visit */
  PENDING = 'PENDING',
  /** Referee completed first visit, reward earned */
  COMPLETED = 'COMPLETED',
  /** Referrer redeemed reward */
  REDEEMED = 'REDEEMED',
  /** Referral expired before completion */
  EXPIRED = 'EXPIRED',
  /** Referral cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Referral reward type enumeration
 *
 * Types of rewards for successful referrals.
 *
 * Real-world dental referral rewards:
 * - POINTS: Loyalty points (e.g., 500 points = $50 value)
 * - DISCOUNT: Discount on next service (e.g., $50 off)
 * - CASH: Cash reward or account credit (e.g., $50 credit)
 * - SERVICE: Free service (e.g., free whitening, free cleaning)
 * - PRODUCT: Free product (e.g., electric toothbrush)
 *
 * Edge cases:
 * - Reward amount interpretation depends on type (points vs dollars)
 * - SERVICE/PRODUCT rewards tracked separately (inventory integration)
 * - Double-sided rewards (both referrer and referee get rewards)
 * - Tiered rewards (more referrals = bigger rewards)
 */
export enum ReferralRewardType {
  /** Loyalty points reward */
  POINTS = 'POINTS',
  /** Discount on service */
  DISCOUNT = 'DISCOUNT',
  /** Cash/account credit */
  CASH = 'CASH',
  /** Free service */
  SERVICE = 'SERVICE',
  /** Free product */
  PRODUCT = 'PRODUCT',
}

/**
 * Referral reward configuration
 *
 * Defines reward for successful referral.
 *
 * Edge cases:
 * - Amount interpretation depends on type (500 points vs $50 cash)
 * - SERVICE type requires procedureId or service description
 * - PRODUCT type requires productId or product description
 * - Expiration date for reward redemption
 * - Minimum purchase requirement for DISCOUNT rewards
 */
export interface ReferralReward {
  /** Reward type */
  type: ReferralRewardType;
  /** Reward amount (points, dollars, etc.) */
  amount: number;
  /** Reward currency (for CASH/DISCOUNT) */
  currency?: string;
  /** Procedure ID (for SERVICE reward) */
  procedureId?: ProcedureId;
  /** Service description (for SERVICE reward) */
  serviceDescription?: string;
  /** Product ID (for PRODUCT reward) */
  productId?: UUID;
  /** Product description (for PRODUCT reward) */
  productDescription?: string;
  /** Reward expiration date */
  expiresAt?: ISODateString;
  /** Terms and conditions */
  terms?: string;
}

/**
 * Referral entity
 *
 * Represents a patient-to-patient referral.
 *
 * Real-world dental referral workflow:
 * 1. Patient A (referrer) receives unique referral code
 * 2. Patient A shares code with friend/family (referee)
 * 3. Referee signs up using referral code
 * 4. Referee completes first appointment
 * 5. Referrer receives reward (points, discount, cash)
 * 6. Optional: Referee also receives welcome bonus
 *
 * Edge cases:
 * - Referral code must be unique across organization
 * - Referee must be new patient (not existing patient)
 * - First visit completion triggers reward eligibility
 * - Reward redemption tracked separately from completion
 * - Referral expiration (e.g., referee must visit within 90 days)
 * - Fraud prevention (limit referrals per patient, detect abuse)
 * - Double-sided rewards (both parties receive benefits)
 * - Referral attribution (referee entered code at registration)
 */
export interface Referral {
  /** Unique referral identifier */
  id: ReferralId;

  // Multi-tenant context
  /** Tenant ID (effective scope: clinicId if present, else organizationId) */
  tenantId: TenantId;
  /** Organization this referral belongs to */
  organizationId: OrganizationId;
  /** Clinic this referral is scoped to (optional, org-wide if undefined) */
  clinicId?: ClinicId;

  // Referral parties
  /** Referrer patient ID (existing patient who referred) */
  referrerPatientId: PatientId;
  /** Referee patient ID (new patient who was referred) */
  refereePatientId?: PatientId;
  /** Referee email (before patient record created) */
  refereeEmail?: string;
  /** Referee phone (before patient record created) */
  refereePhone?: string;
  /** Referee name (before patient record created) */
  refereeName?: string;

  // Referral tracking
  /** Unique referral code */
  code: string;
  /** Referral source (email, SMS, word-of-mouth, etc.) */
  source?: string;
  /** Current referral status */
  status: ReferralStatus;

  // Rewards
  /** Referrer reward configuration */
  referrerReward: ReferralReward;
  /** Referee reward configuration (optional welcome bonus) */
  refereeReward?: ReferralReward;

  // Lifecycle dates
  /** Date referral was created */
  referralDate: ISODateString;
  /** Date referee completed first visit */
  completedAt?: ISODateString;
  /** Date referrer redeemed reward */
  redeemedAt?: ISODateString;
  /** Referral expiration date */
  expiresAt?: ISODateString;
  /** Date referral was cancelled */
  cancelledAt?: ISODateString;
  /** Cancellation reason */
  cancellationReason?: string;

  // Audit
  /** User who created referral */
  createdBy: UserId;
  /** User who last updated referral */
  updatedBy: UserId;
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// LOYALTY DOMAIN TYPES
// ============================================================================

/**
 * Loyalty tier enumeration
 *
 * Tiered loyalty program levels with increasing benefits.
 *
 * Real-world dental loyalty tiers:
 * - BRONZE: 0-999 points (standard benefits)
 * - SILVER: 1000-2499 points (10% discount on select services)
 * - GOLD: 2500-4999 points (15% discount, priority scheduling)
 * - PLATINUM: 5000+ points (20% discount, concierge service, free whitening)
 *
 * Edge cases:
 * - Tier thresholds defined in organization settings
 * - Tier benefits managed separately (discounts, perks)
 * - Tier advancement triggers (points threshold, annual spend)
 * - Tier retention rules (maintain tier for 12 months)
 * - Tier downgrade rules (drop tier if points expire)
 */
export enum LoyaltyTier {
  /** Bronze tier (entry level) */
  BRONZE = 'BRONZE',
  /** Silver tier (mid level) */
  SILVER = 'SILVER',
  /** Gold tier (high level) */
  GOLD = 'GOLD',
  /** Platinum tier (VIP level) */
  PLATINUM = 'PLATINUM',
}

/**
 * Loyalty transaction type enumeration
 *
 * Types of loyalty point transactions.
 *
 * Edge cases:
 * - ACCRUAL: Points earned (procedure completion, referral, etc.)
 * - REDEMPTION: Points spent (discount applied, reward claimed)
 * - EXPIRY: Points expired (automatic expiration after inactivity)
 * - ADJUSTMENT: Manual adjustment (correction, promotion, compensation)
 */
export enum LoyaltyTransactionType {
  /** Points earned/accrued */
  ACCRUAL = 'ACCRUAL',
  /** Points spent/redeemed */
  REDEMPTION = 'REDEMPTION',
  /** Points expired */
  EXPIRY = 'EXPIRY',
  /** Manual adjustment */
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Loyalty accrual source enumeration
 *
 * Sources of loyalty point accruals.
 *
 * Real-world dental accrual sources:
 * - PROCEDURE: Points earned for completed procedures (e.g., 1 point per $1 spent)
 * - INVOICE: Points earned when invoice paid in full
 * - REFERRAL: Bonus points for successful referrals (e.g., 500 points)
 * - SIGNUP: Welcome bonus for joining loyalty program (e.g., 100 points)
 * - BIRTHDAY: Birthday bonus (e.g., 250 points)
 * - PROMOTION: Special promotion bonus (e.g., double points weekend)
 * - ADJUSTMENT: Manual adjustment by staff
 */
export enum LoyaltyAccrualSource {
  /** Points earned from procedure */
  PROCEDURE = 'PROCEDURE',
  /** Points earned from invoice payment */
  INVOICE = 'INVOICE',
  /** Bonus points from referral */
  REFERRAL = 'REFERRAL',
  /** Welcome bonus for signup */
  SIGNUP = 'SIGNUP',
  /** Birthday bonus */
  BIRTHDAY = 'BIRTHDAY',
  /** Promotional bonus */
  PROMOTION = 'PROMOTION',
  /** Manual adjustment */
  ADJUSTMENT = 'ADJUSTMENT',
}

/**
 * Loyalty redemption type enumeration
 *
 * Types of loyalty point redemptions.
 *
 * Real-world dental redemptions:
 * - DISCOUNT: Points redeemed for service discount (e.g., 1000 points = $10 off)
 * - SERVICE: Points redeemed for free service (e.g., 2500 points = free cleaning)
 * - PRODUCT: Points redeemed for product (e.g., 500 points = electric toothbrush)
 * - CASH: Points converted to account credit (e.g., 100 points = $1 credit)
 */
export enum LoyaltyRedemptionType {
  /** Discount on service */
  DISCOUNT = 'DISCOUNT',
  /** Free service */
  SERVICE = 'SERVICE',
  /** Free product */
  PRODUCT = 'PRODUCT',
  /** Account credit */
  CASH = 'CASH',
}

/**
 * Loyalty account entity (aggregate root)
 *
 * Patient's loyalty program account with points balance and tier.
 *
 * Real-world dental loyalty programs:
 * - Accrual rates: 1 point per $1 spent on procedures
 * - Redemption rates: 100 points = $1 discount
 * - Point expiration: Points expire after 24 months of inactivity
 * - Tier benefits: Higher tiers get priority scheduling, special events
 * - Birthday bonuses: 250 points on birthday month
 * - Referral bonuses: 500 points per successful referral
 *
 * Edge cases:
 * - Account created automatically when patient opts into program
 * - Points can be negative temporarily (pending adjustments)
 * - Expired points deducted from oldest first (FIFO)
 * - Tier recalculated on each transaction
 * - Account suspension for fraud/abuse
 * - Account closure requires points redemption or forfeiture
 */
export interface LoyaltyAccount {
  /** Unique loyalty account identifier */
  id: LoyaltyAccountId;

  // Multi-tenant context
  /** Tenant ID (effective scope: clinicId if present, else organizationId) */
  tenantId: TenantId;
  /** Organization this account belongs to */
  organizationId: OrganizationId;
  /** Clinic this account is scoped to (optional, org-wide if undefined) */
  clinicId?: ClinicId;

  // Account ownership
  /** Patient this account belongs to */
  patientId: PatientId;

  // Points balance
  /** Current points balance (available for redemption) */
  currentPoints: number;
  /** Total points earned (lifetime) */
  totalEarned: number;
  /** Total points redeemed (lifetime) */
  totalRedeemed: number;
  /** Total points expired (lifetime) */
  totalExpired: number;
  /** Total points adjusted (lifetime, can be negative) */
  totalAdjusted: number;

  // Tier status
  /** Current loyalty tier */
  tier: LoyaltyTier;
  /** Date tier was achieved */
  tierAchievedAt?: ISODateString;
  /** Points required for next tier */
  pointsToNextTier?: number;

  // Expiration tracking
  /** Next expiration date (when oldest points expire) */
  nextExpirationDate?: ISODateString;
  /** Points expiring on next expiration date */
  pointsExpiringNext?: number;

  // Account status
  /** Account active (can earn/redeem points) */
  isActive: boolean;
  /** Account suspended (cannot earn/redeem, pending review) */
  isSuspended: boolean;
  /** Suspension reason */
  suspensionReason?: string;
  /** Date account was closed */
  closedAt?: ISODateString;
  /** Closure reason */
  closureReason?: string;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created account */
  createdBy: UserId;
  /** User who last updated account */
  updatedBy: UserId;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Loyalty transaction entity
 *
 * Individual loyalty point transaction (accrual, redemption, expiry, adjustment).
 *
 * Real-world transaction examples:
 * - Accrual: +150 points for $150 cleaning procedure
 * - Redemption: -1000 points for $10 discount on crown
 * - Expiry: -500 points expired after 24 months inactivity
 * - Adjustment: +100 points for customer service recovery
 *
 * Edge cases:
 * - Accrual transactions have expiry date (e.g., 24 months from accrual)
 * - Redemption transactions linked to invoice/procedure
 * - Expiry transactions happen automatically (batch process)
 * - Adjustment transactions require reason and approval
 * - Transactions are immutable (no edits, only reversals)
 * - FIFO expiration (oldest points expire first)
 */
export interface LoyaltyTransaction {
  /** Unique transaction identifier */
  id: LoyaltyTransactionId;

  // Account context
  /** Loyalty account this transaction belongs to */
  accountId: LoyaltyAccountId;
  /** Patient ID (denormalized for querying) */
  patientId: PatientId;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Transaction details
  /** Transaction type */
  type: LoyaltyTransactionType;
  /** Point amount (positive for accrual, negative for redemption/expiry) */
  amount: number;
  /** Transaction description */
  description: string;

  // Source tracking (for accruals)
  /** Accrual source (if type = ACCRUAL) */
  source?: LoyaltyAccrualSource;
  /** Related procedure ID (if source = PROCEDURE) */
  procedureId?: ProcedureId;
  /** Related invoice ID (if source = INVOICE) */
  invoiceId?: InvoiceId;
  /** Related referral ID (if source = REFERRAL) */
  referralId?: ReferralId;

  // Redemption tracking (for redemptions)
  /** Redemption type (if type = REDEMPTION) */
  redemptionType?: LoyaltyRedemptionType;
  /** Monetary value of redemption */
  redemptionValue?: MoneyValue;
  /** Related invoice ID (discount applied) */
  redemptionInvoiceId?: InvoiceId;
  /** Related procedure ID (service redeemed) */
  redemptionProcedureId?: ProcedureId;
  /** Related product ID (product redeemed) */
  redemptionProductId?: UUID;

  // Expiration tracking
  /** Expiry date for accrued points (if type = ACCRUAL) */
  expiryDate?: ISODateString;
  /** Whether points have expired */
  isExpired: boolean;

  // Balance tracking
  /** Account balance before transaction */
  balanceBefore: number;
  /** Account balance after transaction */
  balanceAfter: number;

  // Audit
  /** Transaction timestamp */
  transactionDate: ISODateString;
  /** User who created transaction */
  createdBy: UserId;
  /** Creation timestamp */
  createdAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Loyalty accrual rule configuration
 *
 * Defines how points are earned for procedures and invoices.
 *
 * Real-world accrual rules:
 * - "Standard Rate": 1 point per $1 spent (all procedures)
 * - "Preventive Bonus": 2 points per $1 for cleanings/exams
 * - "High-Value Procedures": 1.5 points per $1 for crowns/implants
 * - "Invoice Milestone": 500 bonus points for invoices >$1000
 *
 * Edge cases:
 * - Rules can be procedure-specific or invoice-threshold-based
 * - Multiple rules can apply (additive bonuses)
 * - Rules can have effective date ranges (seasonal promotions)
 * - Rules can be tier-specific (Gold members get 1.5x points)
 */
export interface LoyaltyAccrualRule {
  /** Rule identifier */
  id: UUID;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Rule conditions
  /** Specific procedure ID (if procedure-specific) */
  procedureId?: ProcedureId;
  /** Procedure category (if category-specific) */
  procedureCategory?: string;
  /** Minimum invoice amount (if invoice-threshold-based) */
  invoiceThreshold?: MoneyValue;

  // Point calculation
  /** Points per unit (e.g., 1 point per $1, 2 points per $1) */
  pointsPerUnit: number;
  /** Flat bonus points (added to calculated points) */
  bonusPoints?: number;
  /** Multiplier (for tier-based bonuses, e.g., 1.5x for Gold) */
  multiplier?: number;

  // Tier restrictions
  /** Applicable tiers (if tier-specific) */
  applicableTiers?: LoyaltyTier[];

  // Validity period
  /** Rule effective start date */
  effectiveFrom?: ISODateString;
  /** Rule effective end date */
  effectiveTo?: ISODateString;

  // Status
  /** Rule active */
  isActive: boolean;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created rule */
  createdBy: UserId;
  /** User who last updated rule */
  updatedBy: UserId;
}

// ============================================================================
// FEEDBACK & NPS DOMAIN TYPES
// ============================================================================

/**
 * Feedback category enumeration
 *
 * Categories for patient feedback classification.
 *
 * Real-world dental feedback categories:
 * - SERVICE: Front desk, scheduling, billing, customer service
 * - TREATMENT: Clinical care quality, treatment outcomes
 * - FACILITY: Office cleanliness, comfort, amenities, parking
 * - STAFF: Provider, hygienist, assistant, front desk interactions
 * - OVERALL: General practice experience
 *
 * Edge cases:
 * - Multiple categories can apply to single feedback
 * - Category helps route feedback to appropriate department
 * - Category used for analytics (identify improvement areas)
 */
export enum FeedbackCategory {
  /** Service quality (scheduling, billing, customer service) */
  SERVICE = 'SERVICE',
  /** Clinical treatment quality */
  TREATMENT = 'TREATMENT',
  /** Facility and amenities */
  FACILITY = 'FACILITY',
  /** Staff interactions */
  STAFF = 'STAFF',
  /** Overall experience */
  OVERALL = 'OVERALL',
}

/**
 * Feedback sentiment enumeration
 *
 * Sentiment classification for feedback analysis.
 *
 * Edge cases:
 * - POSITIVE: Rating 4-5, positive keywords detected
 * - NEUTRAL: Rating 3, mixed or no strong sentiment
 * - NEGATIVE: Rating 1-2, negative keywords detected
 * - Sentiment can be auto-detected via AI or manually classified
 * - Sentiment triggers follow-up actions (NEGATIVE → manager alert)
 */
export enum FeedbackSentiment {
  /** Positive feedback */
  POSITIVE = 'POSITIVE',
  /** Neutral feedback */
  NEUTRAL = 'NEUTRAL',
  /** Negative feedback */
  NEGATIVE = 'NEGATIVE',
}

/**
 * Feedback record entity
 *
 * Patient feedback submission (rating + comment + sentiment).
 *
 * Real-world dental feedback workflow:
 * 1. Patient completes appointment
 * 2. Automated email/SMS sent with feedback request
 * 3. Patient clicks link, provides rating (1-5) and optional comment
 * 4. Feedback stored, sentiment analyzed (AI or keywords)
 * 5. NEGATIVE feedback triggers manager alert
 * 6. Feedback aggregated for provider/clinic performance metrics
 *
 * Edge cases:
 * - Feedback can be anonymous (patientId present but not displayed)
 * - Feedback linked to specific appointment and provider
 * - Multiple feedback records per patient (track changes over time)
 * - Sentiment auto-detected via AI or manual classification
 * - Negative feedback triggers follow-up workflow
 * - Feedback used for provider performance reviews
 * - Aggregated metrics: average rating, sentiment distribution
 */
export interface FeedbackRecord {
  /** Unique feedback identifier */
  id: FeedbackId;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Feedback context
  /** Patient who submitted feedback */
  patientId: PatientId;
  /** Appointment this feedback is about */
  appointmentId?: UUID;
  /** Provider this feedback is about */
  providerId?: ProviderId;

  // Feedback content
  /** Rating (1-5 scale) */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Feedback category */
  category: FeedbackCategory;
  /** Text comment (optional) */
  comment?: string;
  /** Sentiment classification */
  sentiment: FeedbackSentiment;

  // Sentiment analysis
  /** AI-detected sentiment (if different from manual classification) */
  aiSentiment?: FeedbackSentiment;
  /** Sentiment confidence score (0.0-1.0) */
  sentimentConfidence?: number;
  /** Extracted keywords from comment */
  keywords?: string[];

  // Follow-up tracking
  /** Whether negative feedback requires follow-up */
  requiresFollowUp: boolean;
  /** Follow-up completed */
  followUpCompleted: boolean;
  /** Follow-up date */
  followUpDate?: ISODateString;
  /** Follow-up notes */
  followUpNotes?: string;

  // Submission metadata
  /** Submission timestamp */
  submittedAt: ISODateString;
  /** Submission source (email, SMS, portal, in-person) */
  submissionSource?: string;
  /** Submission device (mobile, desktop, tablet) */
  submissionDevice?: string;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * NPS (Net Promoter Score) category enumeration
 *
 * NPS categorization based on score (0-10).
 *
 * NPS methodology:
 * - DETRACTOR: Score 0-6 (unhappy, may damage brand via negative word-of-mouth)
 * - PASSIVE: Score 7-8 (satisfied but unenthusiastic, vulnerable to competition)
 * - PROMOTER: Score 9-10 (loyal enthusiasts, will refer others)
 *
 * NPS calculation: % Promoters - % Detractors (range: -100 to +100)
 * - <0: More detractors than promoters (critical issue)
 * - 0-30: Good NPS (room for improvement)
 * - 30-70: Great NPS (strong loyalty)
 * - 70+: Excellent NPS (world-class)
 *
 * Edge cases:
 * - Category derived from score (immutable once set)
 * - Passives not included in NPS calculation (only promoters vs detractors)
 */
export enum NpsCategory {
  /** Detractor (score 0-6) */
  DETRACTOR = 'DETRACTOR',
  /** Passive (score 7-8) */
  PASSIVE = 'PASSIVE',
  /** Promoter (score 9-10) */
  PROMOTER = 'PROMOTER',
}

/**
 * NPS score submission entity
 *
 * Individual NPS survey response from patient.
 *
 * Real-world dental NPS workflow:
 * 1. Patient completes appointment
 * 2. Automated email/SMS sent with NPS survey link
 * 3. Patient answers: "How likely are you to recommend us? (0-10)"
 * 4. Optional: "What's the primary reason for your score?"
 * 5. Score categorized (Detractor/Passive/Promoter)
 * 6. Detractors trigger follow-up workflow
 * 7. Promoters invited to leave online review
 * 8. Aggregated metrics calculated (overall NPS)
 *
 * Edge cases:
 * - Score must be 0-10 (11-point scale)
 * - Category auto-calculated from score
 * - Comment optional but valuable for insights
 * - Multiple NPS submissions per patient tracked over time
 * - NPS trends analyzed (quarterly, annually)
 * - Detractors (0-6) trigger immediate follow-up
 * - Promoters (9-10) invited to leave public reviews
 */
export interface NpsScore {
  /** Unique NPS score identifier */
  id: NpsScoreId;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // NPS context
  /** Patient who submitted score */
  patientId: PatientId;
  /** Appointment this NPS is about (optional) */
  appointmentId?: UUID;
  /** Provider this NPS is about (optional) */
  providerId?: ProviderId;

  // NPS score
  /** NPS score (0-10) */
  score: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** NPS category (derived from score) */
  category: NpsCategory;
  /** Text comment explaining score (optional) */
  comment?: string;

  // Follow-up tracking
  /** Whether detractor requires follow-up */
  requiresFollowUp: boolean;
  /** Follow-up completed */
  followUpCompleted: boolean;
  /** Follow-up date */
  followUpDate?: ISODateString;
  /** Follow-up notes */
  followUpNotes?: string;

  // Promoter action tracking
  /** Promoter invited to leave online review */
  reviewInvitationSent: boolean;
  /** Review invitation sent date */
  reviewInvitationDate?: ISODateString;
  /** Promoter left public review */
  publicReviewLeft: boolean;
  /** Public review platform (Google, Yelp, Facebook) */
  publicReviewPlatform?: string;

  // Submission metadata
  /** Submission timestamp */
  submittedAt: ISODateString;
  /** Submission source (email, SMS, portal, in-person) */
  submissionSource?: string;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * NPS aggregate metrics
 *
 * Aggregated NPS metrics for a time period or segment.
 *
 * NPS calculation:
 * - % Promoters = (promoters / totalResponses) * 100
 * - % Detractors = (detractors / totalResponses) * 100
 * - NPS Score = % Promoters - % Detractors (range: -100 to +100)
 *
 * Edge cases:
 * - Passives excluded from NPS calculation
 * - Minimum sample size for statistical significance (typically 30+)
 * - NPS tracked over time (trends analysis)
 * - NPS segmented by clinic, provider, patient segment
 */
export interface NpsAggregate {
  /** Total NPS responses */
  totalResponses: number;
  /** Number of detractors (score 0-6) */
  detractors: number;
  /** Number of passives (score 7-8) */
  passives: number;
  /** Number of promoters (score 9-10) */
  promoters: number;
  /** Percentage of detractors */
  detractorPercentage: number;
  /** Percentage of passives */
  passivePercentage: number;
  /** Percentage of promoters */
  promoterPercentage: number;
  /** NPS score (% promoters - % detractors) */
  score: number;
  /** Time period start */
  periodStart: ISODateString;
  /** Time period end */
  periodEnd: ISODateString;
  /** Last calculation timestamp */
  calculatedAt: ISODateString;
}

// ============================================================================
// AUTOMATION DOMAIN TYPES
// ============================================================================

/**
 * Automation trigger type enumeration
 *
 * Events that can trigger automation rules.
 *
 * Real-world dental automation triggers:
 * - APPOINTMENT_COMPLETED: Send feedback survey, accrue loyalty points
 * - INVOICE_PAID: Accrue loyalty points, send thank you message
 * - BIRTHDAY: Send birthday greeting with special offer
 * - MISSED_APPOINTMENT: Send rescheduling reminder
 * - FEEDBACK_RECEIVED: Alert manager if negative feedback
 * - TREATMENT_PLAN_APPROVED: Send pre-treatment instructions
 * - NEW_PATIENT_REGISTERED: Send welcome email sequence
 * - OVERDUE_RECALL: Send recall reminder campaign
 * - LOYALTY_TIER_ACHIEVED: Send tier upgrade congratulations
 *
 * Edge cases:
 * - Triggers fire in real-time or via scheduled batch processing
 * - Some triggers fire once per patient (signup), others recur (birthday)
 * - Trigger data payload varies by type (appointment details, invoice amount, etc.)
 */
export enum AutomationTriggerType {
  // Appointment triggers
  /** Appointment created */
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  /** Appointment confirmed */
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  /** Appointment completed */
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  /** Appointment cancelled */
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  /** Patient no-show */
  APPOINTMENT_NO_SHOW = 'APPOINTMENT_NO_SHOW',
  /** Appointment reminder due (X hours before) */
  APPOINTMENT_REMINDER_DUE = 'APPOINTMENT_REMINDER_DUE',

  // Invoice/payment triggers
  /** Invoice created */
  INVOICE_CREATED = 'INVOICE_CREATED',
  /** Invoice paid in full */
  INVOICE_PAID = 'INVOICE_PAID',
  /** Invoice overdue */
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',

  // Patient lifecycle triggers
  /** New patient registered */
  PATIENT_REGISTERED = 'PATIENT_REGISTERED',
  /** Patient birthday */
  PATIENT_BIRTHDAY = 'PATIENT_BIRTHDAY',
  /** Patient became inactive (no visit X months) */
  PATIENT_INACTIVE = 'PATIENT_INACTIVE',
  /** Recall overdue (no visit X months) */
  RECALL_OVERDUE = 'RECALL_OVERDUE',

  // Treatment triggers
  /** Treatment plan created */
  TREATMENT_PLAN_CREATED = 'TREATMENT_PLAN_CREATED',
  /** Treatment plan approved */
  TREATMENT_PLAN_APPROVED = 'TREATMENT_PLAN_APPROVED',
  /** Procedure completed */
  PROCEDURE_COMPLETED = 'PROCEDURE_COMPLETED',

  // Feedback triggers
  /** Feedback received */
  FEEDBACK_RECEIVED = 'FEEDBACK_RECEIVED',
  /** NPS score received */
  NPS_SCORE_RECEIVED = 'NPS_SCORE_RECEIVED',

  // Loyalty triggers
  /** Loyalty points accrued */
  LOYALTY_POINTS_ACCRUED = 'LOYALTY_POINTS_ACCRUED',
  /** Loyalty tier achieved */
  LOYALTY_TIER_ACHIEVED = 'LOYALTY_TIER_ACHIEVED',
  /** Loyalty points expiring soon */
  LOYALTY_POINTS_EXPIRING = 'LOYALTY_POINTS_EXPIRING',

  // Referral triggers
  /** Referral created */
  REFERRAL_CREATED = 'REFERRAL_CREATED',
  /** Referral completed */
  REFERRAL_COMPLETED = 'REFERRAL_COMPLETED',

  // Scheduled triggers
  /** Daily scheduled trigger */
  SCHEDULED_DAILY = 'SCHEDULED_DAILY',
  /** Weekly scheduled trigger */
  SCHEDULED_WEEKLY = 'SCHEDULED_WEEKLY',
  /** Monthly scheduled trigger */
  SCHEDULED_MONTHLY = 'SCHEDULED_MONTHLY',
}

/**
 * Automation action type enumeration
 *
 * Actions that automation rules can execute.
 *
 * Real-world dental automation actions:
 * - SEND_CAMPAIGN: Send email/SMS campaign to patient
 * - ACCRUE_LOYALTY: Add loyalty points to patient account
 * - CREATE_REFERRAL: Generate referral code for patient
 * - SEND_NOTIFICATION: Send notification to staff/provider
 * - UPDATE_SEGMENT: Add/remove patient from segment
 * - CREATE_TASK: Create task for staff (call patient, schedule follow-up)
 * - SEND_WEBHOOK: Trigger external integration (Zapier, etc.)
 *
 * Edge cases:
 * - Actions execute sequentially (order matters)
 * - Action failure can halt or continue rule execution
 * - Actions can have retry logic (transient failures)
 * - Actions logged for audit trail
 */
export enum AutomationActionType {
  /** Send campaign to patient */
  SEND_CAMPAIGN = 'SEND_CAMPAIGN',
  /** Send single message (not full campaign) */
  SEND_MESSAGE = 'SEND_MESSAGE',
  /** Accrue loyalty points */
  ACCRUE_LOYALTY_POINTS = 'ACCRUE_LOYALTY_POINTS',
  /** Create referral for patient */
  CREATE_REFERRAL = 'CREATE_REFERRAL',
  /** Send notification to staff */
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  /** Add patient to segment */
  ADD_TO_SEGMENT = 'ADD_TO_SEGMENT',
  /** Remove patient from segment */
  REMOVE_FROM_SEGMENT = 'REMOVE_FROM_SEGMENT',
  /** Create task for staff */
  CREATE_TASK = 'CREATE_TASK',
  /** Update patient tags */
  UPDATE_PATIENT_TAGS = 'UPDATE_PATIENT_TAGS',
  /** Send webhook to external system */
  SEND_WEBHOOK = 'SEND_WEBHOOK',
  /** Wait for duration (delay next action) */
  WAIT = 'WAIT',
}

/**
 * Automation condition configuration
 *
 * Condition that must be met for automation rule to execute.
 *
 * Real-world examples:
 * - { field: "PATIENT_STATUS", operator: "EQUALS", value: "ACTIVE" }
 * - { field: "FEEDBACK_RATING", operator: "LESS_THAN", value: 3 }
 * - { field: "APPOINTMENT_TYPE", operator: "EQUALS", value: "CLEANING" }
 * - { field: "INVOICE_AMOUNT", operator: "GREATER_THAN", value: 500 }
 *
 * Edge cases:
 * - Conditions evaluated against trigger event data
 * - Multiple conditions combined with AND logic
 * - Conditions reference patient data, appointment data, etc.
 * - Conditions can use template variables from trigger
 */
export interface AutomationCondition {
  /** Condition ID (for editing) */
  conditionId?: UUID;
  /** Field to evaluate (from trigger context) */
  field: string;
  /** Comparison operator */
  operator: SegmentRuleOperator;
  /** Comparison value */
  value?: string | number | boolean | string[] | number[];
}

/**
 * Automation action configuration
 *
 * Action to execute when automation rule triggers.
 *
 * Edge cases:
 * - Params structure varies by action type
 * - Actions execute in sequence order
 * - Action failure can halt or continue (configurable)
 * - Actions support retry logic with exponential backoff
 */
export interface AutomationAction {
  /** Action ID (for editing) */
  actionId?: UUID;
  /** Action type */
  type: AutomationActionType;
  /** Action parameters (structure varies by type) */
  params: AutomationActionParams;
  /** Execution order (actions run in ascending order) */
  order: number;
  /** Stop rule execution if this action fails */
  stopOnFailure?: boolean;
  /** Retry attempts for transient failures */
  retryAttempts?: number;
  /** Delay between retries (seconds) */
  retryDelaySeconds?: number;
}

/**
 * Automation action parameters (union type)
 *
 * Parameters vary by action type.
 */
export type AutomationActionParams =
  | SendCampaignParams
  | SendMessageParams
  | AccrueLoyaltyPointsParams
  | CreateReferralParams
  | SendNotificationParams
  | AddToSegmentParams
  | RemoveFromSegmentParams
  | CreateTaskParams
  | UpdatePatientTagsParams
  | SendWebhookParams
  | WaitParams;

/**
 * Send campaign action parameters
 */
export interface SendCampaignParams {
  /** Campaign ID to send */
  campaignId: CampaignId;
  /** Override template variables */
  templateVariables?: Record<string, string>;
}

/**
 * Send message action parameters
 */
export interface SendMessageParams {
  /** Communication channel */
  channel: CampaignChannel;
  /** Message template */
  template: CampaignTemplate;
  /** Recipient patient ID (if different from trigger patient) */
  recipientPatientId?: PatientId;
}

/**
 * Accrue loyalty points action parameters
 */
export interface AccrueLoyaltyPointsParams {
  /** Points to accrue */
  points: number;
  /** Accrual source */
  source: LoyaltyAccrualSource;
  /** Description */
  description: string;
  /** Point expiration (months from now) */
  expiryMonths?: number;
}

/**
 * Create referral action parameters
 */
export interface CreateReferralParams {
  /** Referrer patient ID (if different from trigger patient) */
  referrerPatientId?: PatientId;
  /** Referrer reward configuration */
  referrerReward: ReferralReward;
  /** Referee reward configuration */
  refereeReward?: ReferralReward;
  /** Referral expiration (days from now) */
  expiryDays?: number;
}

/**
 * Send notification action parameters
 */
export interface SendNotificationParams {
  /** Notification recipient (user ID or role) */
  recipient: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Notification priority */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Add to segment action parameters
 */
export interface AddToSegmentParams {
  /** Segment ID to add patient to */
  segmentId: SegmentId;
}

/**
 * Remove from segment action parameters
 */
export interface RemoveFromSegmentParams {
  /** Segment ID to remove patient from */
  segmentId: SegmentId;
}

/**
 * Create task action parameters
 */
export interface CreateTaskParams {
  /** Task title */
  title: string;
  /** Task description */
  description: string;
  /** Task assignee (user ID or role) */
  assignee: string;
  /** Task due date (ISO string or relative like "3 days") */
  dueDate?: string;
  /** Task priority */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Update patient tags action parameters
 */
export interface UpdatePatientTagsParams {
  /** Tags to add */
  addTags?: string[];
  /** Tags to remove */
  removeTags?: string[];
}

/**
 * Send webhook action parameters
 */
export interface SendWebhookParams {
  /** Webhook URL */
  url: string;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body (JSON) */
  body?: Record<string, unknown>;
}

/**
 * Wait action parameters
 */
export interface WaitParams {
  /** Wait duration in seconds */
  durationSeconds: number;
}

/**
 * Automation rule entity (aggregate root)
 *
 * Defines trigger-based automation workflow.
 *
 * Real-world dental automation rules:
 * - "Post-Visit Feedback": After appointment completed, send feedback survey
 * - "Loyalty Points Accrual": After invoice paid, accrue loyalty points (1 point per $1)
 * - "Birthday Campaign": On patient birthday, send birthday greeting with offer
 * - "Negative Feedback Alert": When feedback rating <3, notify manager
 * - "Recall Reminder": When patient overdue for 6-month cleaning, send recall campaign
 * - "Welcome Sequence": When new patient registered, send welcome email series
 * - "Reactivation Campaign": When patient inactive 12+ months, send win-back campaign
 *
 * Edge cases:
 * - Rules can have multiple conditions (all must be true)
 * - Rules can have multiple actions (execute sequentially)
 * - Rules can be paused without deletion (soft disable)
 * - Rule execution logged for audit trail
 * - Rule failure handling (stop on error vs continue)
 * - Rules can reference trigger event data in actions
 * - Infinite loop prevention (max executions per patient per day)
 */
export interface AutomationRule {
  /** Unique automation rule identifier */
  id: AutomationRuleId;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Rule definition
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Trigger type */
  triggerType: AutomationTriggerType;
  /** Conditions (all must be true) */
  conditions: AutomationCondition[];
  /** Actions (execute in order) */
  actions: AutomationAction[];

  // Status
  /** Rule active (will execute) */
  isActive: boolean;
  /** Rule paused (temporarily disabled) */
  isPaused: boolean;

  // Execution limits
  /** Max executions per patient per day (prevent infinite loops) */
  maxExecutionsPerPatientPerDay?: number;
  /** Execution delay (seconds after trigger) */
  executionDelaySeconds?: number;

  // Scheduling (for scheduled triggers)
  /** Schedule configuration (for SCHEDULED_* triggers) */
  schedule?: {
    /** Hour of day (0-23) */
    hour?: number;
    /** Day of week (0-6, 0=Sunday) */
    dayOfWeek?: number;
    /** Day of month (1-31) */
    dayOfMonth?: number;
    /** Timezone (IANA timezone) */
    timezone?: string;
  };

  // Performance metrics
  /** Total executions (lifetime) */
  totalExecutions: number;
  /** Successful executions */
  successfulExecutions: number;
  /** Failed executions */
  failedExecutions: number;
  /** Last execution timestamp */
  lastExecutedAt?: ISODateString;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;
  /** User who created rule */
  createdBy: UserId;
  /** User who last updated rule */
  updatedBy: UserId;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

/**
 * Automation execution log entity
 *
 * Records individual automation rule execution.
 *
 * Edge cases:
 * - Execution logged even if conditions not met (for debugging)
 * - Action results captured (success/failure, error messages)
 * - Execution can be retried manually (replay)
 * - Large payloads truncated to prevent bloat
 */
export interface AutomationExecution {
  /** Unique execution identifier */
  id: AutomationExecutionId;

  // Context
  /** Automation rule that executed */
  ruleId: AutomationRuleId;
  /** Tenant ID */
  tenantId: TenantId;
  /** Patient this execution was for */
  patientId: PatientId;

  // Trigger context
  /** Trigger type */
  triggerType: AutomationTriggerType;
  /** Trigger event data (payload) */
  triggerData: Record<string, unknown>;

  // Execution status
  /** Execution started */
  startedAt: ISODateString;
  /** Execution completed */
  completedAt?: ISODateString;
  /** Execution duration (milliseconds) */
  durationMs?: number;
  /** Execution status */
  status: 'pending' | 'running' | 'success' | 'failed' | 'partial';

  // Condition evaluation
  /** Conditions met (rule should execute) */
  conditionsMet: boolean;
  /** Condition evaluation results */
  conditionResults?: Array<{
    conditionId: UUID;
    met: boolean;
    actualValue?: unknown;
  }>;

  // Action execution
  /** Actions executed */
  actionsExecuted: number;
  /** Actions succeeded */
  actionsSucceeded: number;
  /** Actions failed */
  actionsFailed: number;
  /** Action execution results */
  actionResults?: Array<{
    actionId: UUID;
    actionType: AutomationActionType;
    status: 'success' | 'failed' | 'skipped';
    startedAt: ISODateString;
    completedAt?: ISODateString;
    error?: string;
    output?: unknown;
  }>;

  // Error tracking
  /** Execution error (if failed) */
  error?: string;
  /** Error stack trace */
  errorStack?: string;

  // Retry tracking
  /** Retry attempt number (0 = first attempt) */
  retryAttempt: number;
  /** Parent execution ID (if retry) */
  parentExecutionId?: AutomationExecutionId;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
}

// ============================================================================
// DELIVERY & COMMUNICATION TRACKING TYPES
// ============================================================================

/**
 * Delivery status enumeration
 *
 * Status of individual message delivery.
 *
 * Delivery lifecycle:
 * PENDING → SENT → DELIVERED
 *        → FAILED
 *        → BOUNCED
 *        → UNSUBSCRIBED
 *
 * Edge cases:
 * - PENDING: Message queued, not yet sent
 * - SENT: Message handed off to provider, not yet delivered
 * - DELIVERED: Message successfully delivered to recipient
 * - FAILED: Temporary failure (will retry)
 * - BOUNCED: Permanent failure (invalid email, phone disconnected)
 * - UNSUBSCRIBED: Recipient unsubscribed, message not sent
 */
export enum DeliveryStatus {
  /** Message queued for sending */
  PENDING = 'PENDING',
  /** Message sent to provider */
  SENT = 'SENT',
  /** Message delivered to recipient */
  DELIVERED = 'DELIVERED',
  /** Temporary delivery failure */
  FAILED = 'FAILED',
  /** Permanent delivery failure (bounce) */
  BOUNCED = 'BOUNCED',
  /** Message not sent (recipient unsubscribed) */
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  /** Message opened by recipient (email only) */
  OPENED = 'OPENED',
  /** Link clicked by recipient */
  CLICKED = 'CLICKED',
  /** Spam complaint from recipient */
  COMPLAINED = 'COMPLAINED',
}

/**
 * Delivery provider enumeration
 *
 * Third-party providers for message delivery.
 *
 * Real-world providers:
 * - SENDGRID: Email delivery (SendGrid)
 * - SES: Email delivery (Amazon SES)
 * - TWILIO: SMS delivery (Twilio)
 * - ONESIGNAL: Push notifications (OneSignal)
 * - WHATSAPP: WhatsApp Business API
 *
 * Edge cases:
 * - Provider selection based on channel and configuration
 * - Provider failover (if primary fails, try secondary)
 * - Provider-specific tracking (webhook events)
 */
export enum DeliveryProvider {
  /** SendGrid email provider */
  SENDGRID = 'SENDGRID',
  /** Amazon SES email provider */
  SES = 'SES',
  /** Twilio SMS provider */
  TWILIO = 'TWILIO',
  /** OneSignal push notification provider */
  ONESIGNAL = 'ONESIGNAL',
  /** WhatsApp Business API */
  WHATSAPP = 'WHATSAPP',
  /** Custom SMTP email provider */
  SMTP = 'SMTP',
  /** Internal delivery (no external provider) */
  INTERNAL = 'INTERNAL',
}

/**
 * Delivery log entity
 *
 * Records individual message delivery attempt.
 *
 * Edge cases:
 * - One log entry per message sent (even if bounced)
 * - Webhook events update delivery status asynchronously
 * - Open/click tracking via pixel/redirect links
 * - Bounce classification (hard vs soft)
 * - Unsubscribe tracking (must honor immediately)
 * - Spam complaints trigger sender reputation review
 */
export interface DeliveryLog {
  /** Unique delivery log identifier */
  id: DeliveryLogId;

  // Context
  /** Campaign this delivery belongs to */
  campaignId?: CampaignId;
  /** Automation execution that triggered delivery */
  automationExecutionId?: AutomationExecutionId;
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Recipient
  /** Patient recipient */
  patientId: PatientId;
  /** Recipient email (if channel = EMAIL) */
  recipientEmail?: string;
  /** Recipient phone (if channel = SMS/WHATSAPP) */
  recipientPhone?: string;
  /** Recipient device token (if channel = PUSH) */
  recipientDeviceToken?: string;

  // Delivery details
  /** Communication channel */
  channel: CampaignChannel;
  /** Delivery provider */
  provider: DeliveryProvider;
  /** Provider message ID (for tracking) */
  providerMessageId?: string;
  /** Current delivery status */
  status: DeliveryStatus;

  // Message content
  /** Message subject (email only) */
  subject?: string;
  /** Message body */
  body: string;
  /** Message HTML body (email only) */
  htmlBody?: string;

  // Timestamps
  /** Message queued timestamp */
  queuedAt: ISODateString;
  /** Message sent timestamp */
  sentAt?: ISODateString;
  /** Message delivered timestamp */
  deliveredAt?: ISODateString;
  /** Message opened timestamp (email only) */
  openedAt?: ISODateString;
  /** Message clicked timestamp */
  clickedAt?: ISODateString;
  /** Message bounced timestamp */
  bouncedAt?: ISODateString;
  /** Unsubscribe timestamp */
  unsubscribedAt?: ISODateString;
  /** Spam complaint timestamp */
  complainedAt?: ISODateString;

  // Error tracking
  /** Delivery error message */
  error?: string;
  /** Bounce type (hard, soft) */
  bounceType?: 'hard' | 'soft';
  /** Bounce reason */
  bounceReason?: string;

  // Engagement tracking
  /** Number of times opened (email only) */
  openCount?: number;
  /** Number of clicks */
  clickCount?: number;
  /** Clicked links (URLs) */
  clickedLinks?: string[];

  // Device/location tracking
  /** User agent (from open/click event) */
  userAgent?: string;
  /** IP address (from open/click event) */
  ipAddress?: string;
  /** Geographic location (from IP) */
  location?: string;

  // Retry tracking
  /** Retry attempt number (0 = first attempt) */
  retryAttempt: number;
  /** Next retry scheduled time */
  nextRetryAt?: ISODateString;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// COMMUNICATION PREFERENCE TYPES
// ============================================================================

/**
 * Consent type enumeration
 *
 * Types of communication consent.
 *
 * Legal distinctions:
 * - TRANSACTIONAL: Appointment reminders, service updates (no consent required)
 * - MARKETING: Promotional campaigns, newsletters (explicit consent required)
 * - PROMOTIONAL: Special offers, discounts (explicit consent required)
 *
 * Edge cases:
 * - Transactional messages allowed even if marketing consent not given
 * - Marketing consent must be explicit opt-in (GDPR/TCPA)
 * - Promotional consent separate from general marketing (granular control)
 * - Consent tracked per channel (email vs SMS consent independent)
 */
export enum ConsentType {
  /** Transactional communications (no consent required) */
  TRANSACTIONAL = 'TRANSACTIONAL',
  /** Marketing communications (consent required) */
  MARKETING = 'MARKETING',
  /** Promotional communications (consent required) */
  PROMOTIONAL = 'PROMOTIONAL',
}

/**
 * Communication preference entity
 *
 * Patient communication channel preferences and consent.
 *
 * Real-world consent management:
 * - Default: All channels disabled (opt-in required)
 * - Transactional: Always allowed (appointment reminders)
 * - Marketing: Explicit opt-in required (GDPR/TCPA)
 * - Unsubscribe: Must honor immediately (legal requirement)
 * - Preference center: Patient can manage preferences via portal
 *
 * Edge cases:
 * - Preferences stored per patient (not global)
 * - Channel-specific consent (email yes, SMS no)
 * - Consent type-specific (transactional yes, marketing no)
 * - Unsubscribe applies to marketing only (transactional continues)
 * - Consent withdrawal must be honored within 24 hours
 * - Audit trail required (when consent given/withdrawn)
 */
export interface CommunicationPreference {
  /** Patient these preferences belong to */
  patientId: PatientId;

  // Multi-tenant context
  /** Tenant ID */
  tenantId: TenantId;
  /** Organization ID */
  organizationId: OrganizationId;
  /** Clinic ID (optional) */
  clinicId?: ClinicId;

  // Channel preferences
  /** Email communications enabled */
  emailEnabled: boolean;
  /** SMS communications enabled */
  smsEnabled: boolean;
  /** Push notifications enabled */
  pushEnabled: boolean;
  /** WhatsApp communications enabled */
  whatsappEnabled: boolean;

  // Consent tracking (per consent type)
  /** Marketing consent (email) */
  emailMarketingConsent: boolean;
  /** Marketing consent date (email) */
  emailMarketingConsentDate?: ISODateString;
  /** Marketing consent (SMS) */
  smsMarketingConsent: boolean;
  /** Marketing consent date (SMS) */
  smsMarketingConsentDate?: ISODateString;
  /** Marketing consent (push) */
  pushMarketingConsent: boolean;
  /** Marketing consent date (push) */
  pushMarketingConsentDate?: ISODateString;
  /** Marketing consent (WhatsApp) */
  whatsappMarketingConsent: boolean;
  /** Marketing consent date (WhatsApp) */
  whatsappMarketingConsentDate?: ISODateString;

  // Unsubscribe tracking
  /** Email unsubscribe status */
  emailUnsubscribed: boolean;
  /** Email unsubscribe date */
  emailUnsubscribedAt?: ISODateString;
  /** SMS unsubscribe status */
  smsUnsubscribed: boolean;
  /** SMS unsubscribe date */
  smsUnsubscribedAt?: ISODateString;
  /** Push unsubscribe status */
  pushUnsubscribed: boolean;
  /** Push unsubscribe date */
  pushUnsubscribedAt?: ISODateString;
  /** WhatsApp unsubscribe status */
  whatsappUnsubscribed: boolean;
  /** WhatsApp unsubscribe date */
  whatsappUnsubscribedAt?: ISODateString;

  // Frequency preferences
  /** Preferred contact hours (start hour, 0-23) */
  preferredContactHourStart?: number;
  /** Preferred contact hours (end hour, 0-23) */
  preferredContactHourEnd?: number;
  /** Maximum messages per day */
  maxMessagesPerDay?: number;
  /** Maximum messages per week */
  maxMessagesPerWeek?: number;

  // Audit
  /** Creation timestamp */
  createdAt: ISODateString;
  /** Last update timestamp */
  updatedAt: ISODateString;

  // Extensibility
  /** Custom metadata */
  metadata?: Metadata;
}

// ============================================================================
// AI INTEGRATION TYPES (Future Readiness)
// ============================================================================

/**
 * Marketing opportunity detection
 *
 * AI-detected marketing opportunity for patient engagement.
 *
 * Real-world AI-detected opportunities:
 * - "Patient overdue for recall" → Send recall campaign
 * - "High-value patient inactive" → Send reactivation campaign
 * - "Treatment plan approved but not scheduled" → Send scheduling reminder
 * - "Positive NPS score" → Invite to leave online review
 * - "Recent whitening procedure" → Offer maintenance whitening kit
 *
 * Edge cases:
 * - Opportunities detected via ML models or rule-based heuristics
 * - Opportunity scoring (confidence level)
 * - Opportunity expiration (time-sensitive)
 * - Opportunity deduplication (don't spam patient)
 */
export interface MarketingOpportunity {
  /** Opportunity identifier */
  id: UUID;
  /** Patient this opportunity is for */
  patientId: PatientId;
  /** Opportunity source (AI model, rule engine, manual) */
  source: string;
  /** Opportunity type */
  opportunityType: string;
  /** Opportunity description */
  description: string;
  /** Suggested campaign type */
  suggestedCampaignType?: string;
  /** Suggested segment */
  suggestedSegmentId?: SegmentId;
  /** Opportunity context (relevant data) */
  context: Record<string, unknown>;
  /** Confidence score (0.0-1.0) */
  confidence?: number;
  /** Opportunity detected timestamp */
  detectedAt: ISODateString;
  /** Opportunity expiration */
  expiresAt?: ISODateString;
  /** Opportunity acted upon */
  actedUpon: boolean;
  /** Action taken timestamp */
  actionTakenAt?: ISODateString;
  /** Action taken (campaign sent, task created, etc.) */
  actionTaken?: string;
}

/**
 * Churn risk score
 *
 * AI-calculated churn risk for patient retention.
 *
 * Churn risk factors:
 * - Time since last visit (most significant)
 * - Cancelled appointment count
 * - No-show count
 * - Declined treatment plans
 * - Negative feedback
 * - Reduced visit frequency
 *
 * Edge cases:
 * - Score recalculated periodically (weekly/monthly)
 * - High-risk patients flagged for retention campaigns
 * - Churn prediction model trained on historical data
 * - Score threshold for "at-risk" segment (e.g., >0.7)
 */
export interface ChurnRiskScore {
  /** Patient this score is for */
  patientId: PatientId;
  /** Churn risk score (0.0-1.0, higher = more likely to churn) */
  score: number;
  /** Risk category (low, medium, high) */
  category: 'low' | 'medium' | 'high';
  /** Contributing factors */
  factors: Array<{
    factor: string;
    weight: number;
    description: string;
  }>;
  /** Score computed timestamp */
  computedAt: ISODateString;
  /** Model version used */
  modelVersion?: string;
}

/**
 * Sentiment analysis result
 *
 * AI-analyzed sentiment from patient feedback.
 *
 * Sentiment analysis inputs:
 * - Feedback comments
 * - NPS comments
 * - Online reviews
 * - Email responses
 *
 * Edge cases:
 * - Sentiment confidence score (low confidence = manual review)
 * - Keyword extraction (identify themes)
 * - Multi-language support (translation required)
 * - Sarcasm detection (challenging for AI)
 */
export interface SentimentAnalysisResult {
  /** Feedback record this analysis is for */
  feedbackId?: FeedbackId;
  /** NPS score this analysis is for */
  npsScoreId?: NpsScoreId;
  /** Text analyzed */
  text: string;
  /** Detected sentiment */
  sentiment: FeedbackSentiment;
  /** Confidence score (0.0-1.0) */
  confidence: number;
  /** Extracted keywords/themes */
  keywords: string[];
  /** Detected language (ISO 639-1 code) */
  language?: string;
  /** Analysis timestamp */
  analyzedAt: ISODateString;
  /** Model version used */
  modelVersion?: string;
}
