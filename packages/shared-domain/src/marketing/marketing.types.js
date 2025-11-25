"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentType = exports.DeliveryProvider = exports.DeliveryStatus = exports.AutomationActionType = exports.AutomationTriggerType = exports.NpsCategory = exports.FeedbackSentiment = exports.FeedbackCategory = exports.LoyaltyRedemptionType = exports.LoyaltyAccrualSource = exports.LoyaltyTransactionType = exports.LoyaltyTier = exports.ReferralRewardType = exports.ReferralStatus = exports.SegmentType = exports.SegmentRuleGroupOperator = exports.SegmentRuleOperator = exports.SegmentRuleField = exports.RecurrenceFrequency = exports.CampaignScheduleType = exports.CampaignStatus = exports.CampaignChannel = void 0;
var CampaignChannel;
(function (CampaignChannel) {
    CampaignChannel["EMAIL"] = "EMAIL";
    CampaignChannel["SMS"] = "SMS";
    CampaignChannel["PUSH"] = "PUSH";
    CampaignChannel["WHATSAPP"] = "WHATSAPP";
})(CampaignChannel || (exports.CampaignChannel = CampaignChannel = {}));
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus["DRAFT"] = "DRAFT";
    CampaignStatus["SCHEDULED"] = "SCHEDULED";
    CampaignStatus["ACTIVE"] = "ACTIVE";
    CampaignStatus["PAUSED"] = "PAUSED";
    CampaignStatus["COMPLETED"] = "COMPLETED";
    CampaignStatus["CANCELLED"] = "CANCELLED";
})(CampaignStatus || (exports.CampaignStatus = CampaignStatus = {}));
var CampaignScheduleType;
(function (CampaignScheduleType) {
    CampaignScheduleType["IMMEDIATE"] = "IMMEDIATE";
    CampaignScheduleType["SCHEDULED"] = "SCHEDULED";
    CampaignScheduleType["RECURRING"] = "RECURRING";
})(CampaignScheduleType || (exports.CampaignScheduleType = CampaignScheduleType = {}));
var RecurrenceFrequency;
(function (RecurrenceFrequency) {
    RecurrenceFrequency["DAILY"] = "DAILY";
    RecurrenceFrequency["WEEKLY"] = "WEEKLY";
    RecurrenceFrequency["MONTHLY"] = "MONTHLY";
    RecurrenceFrequency["QUARTERLY"] = "QUARTERLY";
    RecurrenceFrequency["ANNUAL"] = "ANNUAL";
})(RecurrenceFrequency || (exports.RecurrenceFrequency = RecurrenceFrequency = {}));
var SegmentRuleField;
(function (SegmentRuleField) {
    SegmentRuleField["AGE"] = "AGE";
    SegmentRuleField["GENDER"] = "GENDER";
    SegmentRuleField["ZIP_CODE"] = "ZIP_CODE";
    SegmentRuleField["LANGUAGE"] = "LANGUAGE";
    SegmentRuleField["LAST_VISIT"] = "LAST_VISIT";
    SegmentRuleField["FIRST_VISIT"] = "FIRST_VISIT";
    SegmentRuleField["APPOINTMENT_COUNT"] = "APPOINTMENT_COUNT";
    SegmentRuleField["CANCELLATION_COUNT"] = "CANCELLATION_COUNT";
    SegmentRuleField["NO_SHOW_COUNT"] = "NO_SHOW_COUNT";
    SegmentRuleField["TOTAL_SPENT"] = "TOTAL_SPENT";
    SegmentRuleField["AVERAGE_INVOICE"] = "AVERAGE_INVOICE";
    SegmentRuleField["OUTSTANDING_BALANCE"] = "OUTSTANDING_BALANCE";
    SegmentRuleField["HAS_PAYMENT_PLAN"] = "HAS_PAYMENT_PLAN";
    SegmentRuleField["LOYALTY_TIER"] = "LOYALTY_TIER";
    SegmentRuleField["LOYALTY_POINTS"] = "LOYALTY_POINTS";
    SegmentRuleField["REFERRAL_COUNT"] = "REFERRAL_COUNT";
    SegmentRuleField["NPS_SCORE"] = "NPS_SCORE";
    SegmentRuleField["FEEDBACK_RATING"] = "FEEDBACK_RATING";
    SegmentRuleField["HAS_PROCEDURE"] = "HAS_PROCEDURE";
    SegmentRuleField["HAS_TREATMENT_PLAN"] = "HAS_TREATMENT_PLAN";
    SegmentRuleField["HAS_INSURANCE"] = "HAS_INSURANCE";
    SegmentRuleField["PREFERRED_CHANNEL"] = "PREFERRED_CHANNEL";
    SegmentRuleField["MARKETING_CONSENT"] = "MARKETING_CONSENT";
    SegmentRuleField["EMAIL_ENABLED"] = "EMAIL_ENABLED";
    SegmentRuleField["SMS_ENABLED"] = "SMS_ENABLED";
    SegmentRuleField["TAGS"] = "TAGS";
    SegmentRuleField["STATUS"] = "STATUS";
})(SegmentRuleField || (exports.SegmentRuleField = SegmentRuleField = {}));
var SegmentRuleOperator;
(function (SegmentRuleOperator) {
    SegmentRuleOperator["EQUALS"] = "EQUALS";
    SegmentRuleOperator["NOT_EQUALS"] = "NOT_EQUALS";
    SegmentRuleOperator["CONTAINS"] = "CONTAINS";
    SegmentRuleOperator["NOT_CONTAINS"] = "NOT_CONTAINS";
    SegmentRuleOperator["GREATER_THAN"] = "GREATER_THAN";
    SegmentRuleOperator["GREATER_THAN_OR_EQUAL"] = "GREATER_THAN_OR_EQUAL";
    SegmentRuleOperator["LESS_THAN"] = "LESS_THAN";
    SegmentRuleOperator["LESS_THAN_OR_EQUAL"] = "LESS_THAN_OR_EQUAL";
    SegmentRuleOperator["IN"] = "IN";
    SegmentRuleOperator["NOT_IN"] = "NOT_IN";
    SegmentRuleOperator["BETWEEN"] = "BETWEEN";
    SegmentRuleOperator["IS_NULL"] = "IS_NULL";
    SegmentRuleOperator["IS_NOT_NULL"] = "IS_NOT_NULL";
    SegmentRuleOperator["STARTS_WITH"] = "STARTS_WITH";
    SegmentRuleOperator["ENDS_WITH"] = "ENDS_WITH";
})(SegmentRuleOperator || (exports.SegmentRuleOperator = SegmentRuleOperator = {}));
var SegmentRuleGroupOperator;
(function (SegmentRuleGroupOperator) {
    SegmentRuleGroupOperator["AND"] = "AND";
    SegmentRuleGroupOperator["OR"] = "OR";
})(SegmentRuleGroupOperator || (exports.SegmentRuleGroupOperator = SegmentRuleGroupOperator = {}));
var SegmentType;
(function (SegmentType) {
    SegmentType["DYNAMIC"] = "DYNAMIC";
    SegmentType["STATIC"] = "STATIC";
})(SegmentType || (exports.SegmentType = SegmentType = {}));
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "PENDING";
    ReferralStatus["COMPLETED"] = "COMPLETED";
    ReferralStatus["REDEEMED"] = "REDEEMED";
    ReferralStatus["EXPIRED"] = "EXPIRED";
    ReferralStatus["CANCELLED"] = "CANCELLED";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
var ReferralRewardType;
(function (ReferralRewardType) {
    ReferralRewardType["POINTS"] = "POINTS";
    ReferralRewardType["DISCOUNT"] = "DISCOUNT";
    ReferralRewardType["CASH"] = "CASH";
    ReferralRewardType["SERVICE"] = "SERVICE";
    ReferralRewardType["PRODUCT"] = "PRODUCT";
})(ReferralRewardType || (exports.ReferralRewardType = ReferralRewardType = {}));
var LoyaltyTier;
(function (LoyaltyTier) {
    LoyaltyTier["BRONZE"] = "BRONZE";
    LoyaltyTier["SILVER"] = "SILVER";
    LoyaltyTier["GOLD"] = "GOLD";
    LoyaltyTier["PLATINUM"] = "PLATINUM";
})(LoyaltyTier || (exports.LoyaltyTier = LoyaltyTier = {}));
var LoyaltyTransactionType;
(function (LoyaltyTransactionType) {
    LoyaltyTransactionType["ACCRUAL"] = "ACCRUAL";
    LoyaltyTransactionType["REDEMPTION"] = "REDEMPTION";
    LoyaltyTransactionType["EXPIRY"] = "EXPIRY";
    LoyaltyTransactionType["ADJUSTMENT"] = "ADJUSTMENT";
})(LoyaltyTransactionType || (exports.LoyaltyTransactionType = LoyaltyTransactionType = {}));
var LoyaltyAccrualSource;
(function (LoyaltyAccrualSource) {
    LoyaltyAccrualSource["PROCEDURE"] = "PROCEDURE";
    LoyaltyAccrualSource["INVOICE"] = "INVOICE";
    LoyaltyAccrualSource["REFERRAL"] = "REFERRAL";
    LoyaltyAccrualSource["SIGNUP"] = "SIGNUP";
    LoyaltyAccrualSource["BIRTHDAY"] = "BIRTHDAY";
    LoyaltyAccrualSource["PROMOTION"] = "PROMOTION";
    LoyaltyAccrualSource["ADJUSTMENT"] = "ADJUSTMENT";
})(LoyaltyAccrualSource || (exports.LoyaltyAccrualSource = LoyaltyAccrualSource = {}));
var LoyaltyRedemptionType;
(function (LoyaltyRedemptionType) {
    LoyaltyRedemptionType["DISCOUNT"] = "DISCOUNT";
    LoyaltyRedemptionType["SERVICE"] = "SERVICE";
    LoyaltyRedemptionType["PRODUCT"] = "PRODUCT";
    LoyaltyRedemptionType["CASH"] = "CASH";
})(LoyaltyRedemptionType || (exports.LoyaltyRedemptionType = LoyaltyRedemptionType = {}));
var FeedbackCategory;
(function (FeedbackCategory) {
    FeedbackCategory["SERVICE"] = "SERVICE";
    FeedbackCategory["TREATMENT"] = "TREATMENT";
    FeedbackCategory["FACILITY"] = "FACILITY";
    FeedbackCategory["STAFF"] = "STAFF";
    FeedbackCategory["OVERALL"] = "OVERALL";
})(FeedbackCategory || (exports.FeedbackCategory = FeedbackCategory = {}));
var FeedbackSentiment;
(function (FeedbackSentiment) {
    FeedbackSentiment["POSITIVE"] = "POSITIVE";
    FeedbackSentiment["NEUTRAL"] = "NEUTRAL";
    FeedbackSentiment["NEGATIVE"] = "NEGATIVE";
})(FeedbackSentiment || (exports.FeedbackSentiment = FeedbackSentiment = {}));
var NpsCategory;
(function (NpsCategory) {
    NpsCategory["DETRACTOR"] = "DETRACTOR";
    NpsCategory["PASSIVE"] = "PASSIVE";
    NpsCategory["PROMOTER"] = "PROMOTER";
})(NpsCategory || (exports.NpsCategory = NpsCategory = {}));
var AutomationTriggerType;
(function (AutomationTriggerType) {
    AutomationTriggerType["APPOINTMENT_CREATED"] = "APPOINTMENT_CREATED";
    AutomationTriggerType["APPOINTMENT_CONFIRMED"] = "APPOINTMENT_CONFIRMED";
    AutomationTriggerType["APPOINTMENT_COMPLETED"] = "APPOINTMENT_COMPLETED";
    AutomationTriggerType["APPOINTMENT_CANCELLED"] = "APPOINTMENT_CANCELLED";
    AutomationTriggerType["APPOINTMENT_NO_SHOW"] = "APPOINTMENT_NO_SHOW";
    AutomationTriggerType["APPOINTMENT_REMINDER_DUE"] = "APPOINTMENT_REMINDER_DUE";
    AutomationTriggerType["INVOICE_CREATED"] = "INVOICE_CREATED";
    AutomationTriggerType["INVOICE_PAID"] = "INVOICE_PAID";
    AutomationTriggerType["INVOICE_OVERDUE"] = "INVOICE_OVERDUE";
    AutomationTriggerType["PATIENT_REGISTERED"] = "PATIENT_REGISTERED";
    AutomationTriggerType["PATIENT_BIRTHDAY"] = "PATIENT_BIRTHDAY";
    AutomationTriggerType["PATIENT_INACTIVE"] = "PATIENT_INACTIVE";
    AutomationTriggerType["RECALL_OVERDUE"] = "RECALL_OVERDUE";
    AutomationTriggerType["TREATMENT_PLAN_CREATED"] = "TREATMENT_PLAN_CREATED";
    AutomationTriggerType["TREATMENT_PLAN_APPROVED"] = "TREATMENT_PLAN_APPROVED";
    AutomationTriggerType["PROCEDURE_COMPLETED"] = "PROCEDURE_COMPLETED";
    AutomationTriggerType["FEEDBACK_RECEIVED"] = "FEEDBACK_RECEIVED";
    AutomationTriggerType["NPS_SCORE_RECEIVED"] = "NPS_SCORE_RECEIVED";
    AutomationTriggerType["LOYALTY_POINTS_ACCRUED"] = "LOYALTY_POINTS_ACCRUED";
    AutomationTriggerType["LOYALTY_TIER_ACHIEVED"] = "LOYALTY_TIER_ACHIEVED";
    AutomationTriggerType["LOYALTY_POINTS_EXPIRING"] = "LOYALTY_POINTS_EXPIRING";
    AutomationTriggerType["REFERRAL_CREATED"] = "REFERRAL_CREATED";
    AutomationTriggerType["REFERRAL_COMPLETED"] = "REFERRAL_COMPLETED";
    AutomationTriggerType["SCHEDULED_DAILY"] = "SCHEDULED_DAILY";
    AutomationTriggerType["SCHEDULED_WEEKLY"] = "SCHEDULED_WEEKLY";
    AutomationTriggerType["SCHEDULED_MONTHLY"] = "SCHEDULED_MONTHLY";
})(AutomationTriggerType || (exports.AutomationTriggerType = AutomationTriggerType = {}));
var AutomationActionType;
(function (AutomationActionType) {
    AutomationActionType["SEND_CAMPAIGN"] = "SEND_CAMPAIGN";
    AutomationActionType["SEND_MESSAGE"] = "SEND_MESSAGE";
    AutomationActionType["ACCRUE_LOYALTY_POINTS"] = "ACCRUE_LOYALTY_POINTS";
    AutomationActionType["CREATE_REFERRAL"] = "CREATE_REFERRAL";
    AutomationActionType["SEND_NOTIFICATION"] = "SEND_NOTIFICATION";
    AutomationActionType["ADD_TO_SEGMENT"] = "ADD_TO_SEGMENT";
    AutomationActionType["REMOVE_FROM_SEGMENT"] = "REMOVE_FROM_SEGMENT";
    AutomationActionType["CREATE_TASK"] = "CREATE_TASK";
    AutomationActionType["UPDATE_PATIENT_TAGS"] = "UPDATE_PATIENT_TAGS";
    AutomationActionType["SEND_WEBHOOK"] = "SEND_WEBHOOK";
    AutomationActionType["WAIT"] = "WAIT";
})(AutomationActionType || (exports.AutomationActionType = AutomationActionType = {}));
var DeliveryStatus;
(function (DeliveryStatus) {
    DeliveryStatus["PENDING"] = "PENDING";
    DeliveryStatus["SENT"] = "SENT";
    DeliveryStatus["DELIVERED"] = "DELIVERED";
    DeliveryStatus["FAILED"] = "FAILED";
    DeliveryStatus["BOUNCED"] = "BOUNCED";
    DeliveryStatus["UNSUBSCRIBED"] = "UNSUBSCRIBED";
    DeliveryStatus["OPENED"] = "OPENED";
    DeliveryStatus["CLICKED"] = "CLICKED";
    DeliveryStatus["COMPLAINED"] = "COMPLAINED";
})(DeliveryStatus || (exports.DeliveryStatus = DeliveryStatus = {}));
var DeliveryProvider;
(function (DeliveryProvider) {
    DeliveryProvider["SENDGRID"] = "SENDGRID";
    DeliveryProvider["SES"] = "SES";
    DeliveryProvider["TWILIO"] = "TWILIO";
    DeliveryProvider["ONESIGNAL"] = "ONESIGNAL";
    DeliveryProvider["WHATSAPP"] = "WHATSAPP";
    DeliveryProvider["SMTP"] = "SMTP";
    DeliveryProvider["INTERNAL"] = "INTERNAL";
})(DeliveryProvider || (exports.DeliveryProvider = DeliveryProvider = {}));
var ConsentType;
(function (ConsentType) {
    ConsentType["TRANSACTIONAL"] = "TRANSACTIONAL";
    ConsentType["MARKETING"] = "MARKETING";
    ConsentType["PROMOTIONAL"] = "PROMOTIONAL";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
//# sourceMappingURL=marketing.types.js.map