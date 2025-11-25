/**
 * Marketing Domain Module
 *
 * Complete domain types for marketing, patient engagement, loyalty programs,
 * referrals, feedback/NPS tracking, and marketing automation.
 *
 * @module shared-domain/marketing
 */

// ============================================================================
// Branded Types
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
} from './marketing.types';

// ============================================================================
// Campaign Types
// ============================================================================
export {
  CampaignChannel,
  CampaignStatus,
  CampaignScheduleType,
  RecurrenceFrequency,
} from './marketing.types';

export type {
  CampaignSchedule,
  RecurrenceRule,
  CampaignTemplate,
  CampaignAttachment,
  CampaignMetrics,
  Campaign,
} from './marketing.types';

// ============================================================================
// Segment Types
// ============================================================================
export {
  SegmentRuleField,
  SegmentRuleOperator,
  SegmentRuleGroupOperator,
  SegmentType,
} from './marketing.types';

export type {
  SegmentRule,
  SegmentRuleGroup,
  Segment,
} from './marketing.types';

// ============================================================================
// Referral Types
// ============================================================================
export {
  ReferralStatus,
  ReferralRewardType,
} from './marketing.types';

export type {
  ReferralReward,
  Referral,
} from './marketing.types';

// ============================================================================
// Loyalty Types
// ============================================================================
export {
  LoyaltyTier,
  LoyaltyTransactionType,
  LoyaltyAccrualSource,
  LoyaltyRedemptionType,
} from './marketing.types';

export type {
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyAccrualRule,
} from './marketing.types';

// ============================================================================
// Feedback & NPS Types
// ============================================================================
export {
  FeedbackCategory,
  FeedbackSentiment,
  NpsCategory,
} from './marketing.types';

export type {
  FeedbackRecord,
  NpsScore,
  NpsAggregate,
} from './marketing.types';

// ============================================================================
// Automation Types
// ============================================================================
export {
  AutomationTriggerType,
  AutomationActionType,
} from './marketing.types';

export type {
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
} from './marketing.types';

// ============================================================================
// Delivery & Communication Types
// ============================================================================
export {
  DeliveryStatus,
  DeliveryProvider,
  ConsentType,
} from './marketing.types';

export type {
  DeliveryLog,
  CommunicationPreference,
} from './marketing.types';

// ============================================================================
// AI Integration Types (Future Readiness)
// ============================================================================
export type {
  MarketingOpportunity,
  ChurnRiskScore,
  SentimentAnalysisResult,
} from './marketing.types';
