/**
 * Marketing Events Module
 *
 * Exports all marketing domain events for the Dental OS platform.
 *
 * @module shared-events/marketing
 */

// Export all event constants
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
} from './marketing.events';

// Export all version constants
export {
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
} from './marketing.events';

// Export branded types
export type {
  CampaignId,
  SegmentId,
  DeliveryLogId,
  ReferralId,
  LoyaltyAccountId,
  FeedbackId,
  NpsScoreId,
  AutomationRuleId,
  AppointmentId,
  UserId,
} from './marketing.events';

// Export enumerations
export type {
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
} from './marketing.events';

// Export shared types
export type {
  SegmentRule,
  CampaignChange,
  AutomationAction,
} from './marketing.events';

// Export campaign event payloads and envelopes
export type {
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
} from './marketing.events';

// Export segment event payloads and envelopes
export type {
  SegmentCreatedPayload,
  SegmentCreatedEvent,
  SegmentRefreshedPayload,
  SegmentRefreshedEvent,
  SegmentPatientAddedPayload,
  SegmentPatientAddedEvent,
  SegmentPatientRemovedPayload,
  SegmentPatientRemovedEvent,
} from './marketing.events';

// Export referral event payloads and envelopes
export type {
  ReferralCreatedPayload,
  ReferralCreatedEvent,
  ReferralCompletedPayload,
  ReferralCompletedEvent,
  ReferralRedeemedPayload,
  ReferralRedeemedEvent,
  ReferralExpiredPayload,
  ReferralExpiredEvent,
} from './marketing.events';

// Export loyalty event payloads and envelopes
export type {
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
} from './marketing.events';

// Export feedback event payloads and envelopes
export type {
  FeedbackReceivedPayload,
  FeedbackReceivedEvent,
  FeedbackPositivePayload,
  FeedbackPositiveEvent,
  FeedbackNegativePayload,
  FeedbackNegativeEvent,
} from './marketing.events';

// Export NPS event payloads and envelopes
export type {
  NpsSubmittedPayload,
  NpsSubmittedEvent,
  NpsPromoterPayload,
  NpsPromoterEvent,
  NpsDetractorPayload,
  NpsDetractorEvent,
} from './marketing.events';

// Export automation event payloads and envelopes
export type {
  AutomationTriggeredPayload,
  AutomationTriggeredEvent,
  AutomationExecutedPayload,
  AutomationExecutedEvent,
} from './marketing.events';

// Export delivery event payloads and envelopes
export type {
  DeliveryQueuedPayload,
  DeliveryQueuedEvent,
  DeliverySentPayload,
  DeliverySentEvent,
  DeliveryFailedPayload,
  DeliveryFailedEvent,
  DeliveryBouncedPayload,
  DeliveryBouncedEvent,
} from './marketing.events';
