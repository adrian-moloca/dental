"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryDeliveryLogsDtoSchema = exports.DeliveryProviderSchema = exports.DeliveryStatusSchema = exports.QueryAutomationRulesDtoSchema = exports.UpdateAutomationRuleDtoSchema = exports.CreateAutomationRuleDtoSchema = exports.AutomationActionSchema = exports.AutomationConditionSchema = exports.AutomationActionTypeSchema = exports.AutomationTriggerTypeSchema = exports.QueryNpsDtoSchema = exports.SubmitNpsDtoSchema = exports.NpsCategorySchema = exports.NpsScoreSchema = exports.QueryFeedbackDtoSchema = exports.CreateFeedbackDtoSchema = exports.FeedbackRatingSchema = exports.FeedbackCategorySchema = exports.QueryLoyaltyTransactionsDtoSchema = exports.RedeemLoyaltyPointsDtoSchema = exports.AccrueLoyaltyPointsDtoSchema = exports.LoyaltyPointsSchema = exports.LoyaltyTransactionTypeSchema = exports.LoyaltyTierSchema = exports.QueryReferralsDtoSchema = exports.RedeemReferralDtoSchema = exports.CreateReferralDtoSchema = exports.ReferralCodeSchema = exports.ReferralRewardTypeSchema = exports.ReferralStatusSchema = exports.RefreshSegmentDtoSchema = exports.QuerySegmentsDtoSchema = exports.UpdateSegmentDtoSchema = exports.CreateSegmentDtoSchema = exports.SegmentRuleSchema = exports.SegmentRuleFieldSchema = exports.SegmentRuleOperatorSchema = exports.SendCampaignDtoSchema = exports.QueryCampaignsDtoSchema = exports.UpdateCampaignDtoSchema = exports.CreateCampaignDtoSchema = exports.CampaignScheduleSchema = exports.CampaignTemplateSchema = exports.TemplateVariableSchema = exports.CampaignScheduleTypeSchema = exports.CampaignStatusSchema = exports.CampaignChannelSchema = void 0;
const zod_1 = require("zod");
const common_schemas_1 = require("../common.schemas");
exports.CampaignChannelSchema = zod_1.z.enum(['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'], {
    errorMap: () => ({ message: 'Invalid campaign channel' }),
});
exports.CampaignStatusSchema = zod_1.z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid campaign status' }),
});
exports.CampaignScheduleTypeSchema = zod_1.z.enum(['IMMEDIATE', 'SCHEDULED', 'RECURRING'], {
    errorMap: () => ({ message: 'Invalid campaign schedule type' }),
});
exports.TemplateVariableSchema = zod_1.z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Variable name must start with letter or underscore, followed by alphanumeric characters or underscores',
})
    .min(1, 'Variable name cannot be empty')
    .max(50, 'Variable name must be 50 characters or less');
exports.CampaignTemplateSchema = zod_1.z
    .object({
    subject: common_schemas_1.NonEmptyStringSchema.min(1, 'Subject is required')
        .max(500, 'Subject must be 500 characters or less')
        .optional()
        .describe('Required for EMAIL, optional for other channels'),
    body: common_schemas_1.NonEmptyStringSchema.min(1, 'Message body is required').max(50000, 'Message body must be 50000 characters or less'),
    variables: zod_1.z
        .array(exports.TemplateVariableSchema)
        .max(50, 'Maximum 50 template variables allowed')
        .optional()
        .describe('List of variables used in template (e.g., ["firstName", "appointmentDate"])'),
    preheader: zod_1.z
        .string()
        .max(150, 'Preheader must be 150 characters or less')
        .optional()
        .describe('Email preheader text (preview text)'),
    fromName: common_schemas_1.NonEmptyStringSchema.max(100, 'From name must be 100 characters or less').optional(),
    replyTo: common_schemas_1.EmailSchema.optional(),
    language: zod_1.z
        .string()
        .length(2, 'Language code must be 2 characters (ISO 639-1)')
        .regex(/^[a-z]{2}$/, { message: 'Language code must be lowercase letters' })
        .default('en'),
})
    .refine((data) => {
    const bodyVars = [...(data.body.matchAll(/\{\{?(\w+)\}?\}/g) || [])].map((m) => m[1]);
    const subjectVars = data.subject ? [...(data.subject.matchAll(/\{\{?(\w+)\}?\}/g) || [])].map((m) => m[1]) : [];
    const allVarsInTemplate = [...new Set([...bodyVars, ...subjectVars])];
    if (data.variables && data.variables.length > 0) {
        return allVarsInTemplate.every((v) => data.variables.includes(v));
    }
    return true;
}, {
    message: 'All template variables used in subject/body must be declared in variables array',
    path: ['variables'],
});
exports.CampaignScheduleSchema = zod_1.z
    .object({
    type: exports.CampaignScheduleTypeSchema,
    scheduledAt: common_schemas_1.ISODateStringSchema.optional().describe('ISO datetime for scheduled campaigns'),
    timezone: zod_1.z
        .string()
        .regex(/^[A-Za-z]+\/[A-Za-z_]+$/, { message: 'Invalid timezone format (e.g., America/New_York)' })
        .default('UTC'),
    recurrence: zod_1.z
        .object({
        frequency: zod_1.z.enum(['DAILY', 'WEEKLY', 'MONTHLY'], {
            errorMap: () => ({ message: 'Invalid recurrence frequency' }),
        }),
        interval: common_schemas_1.PositiveIntSchema.max(365, 'Interval cannot exceed 365').describe('Every N days/weeks/months'),
        endDate: common_schemas_1.ISODateStringSchema.optional().describe('When to stop recurring'),
        daysOfWeek: zod_1.z
            .array(zod_1.z.number().int().min(0).max(6))
            .max(7, 'Maximum 7 days of week')
            .optional()
            .describe('0=Sunday, 6=Saturday'),
        dayOfMonth: zod_1.z
            .number()
            .int()
            .min(1)
            .max(31)
            .optional()
            .describe('Day of month for MONTHLY frequency'),
    })
        .optional()
        .describe('Required when type is RECURRING'),
})
    .refine((data) => {
    if (data.type === 'SCHEDULED' && !data.scheduledAt) {
        return false;
    }
    return true;
}, {
    message: 'scheduledAt is required when schedule type is SCHEDULED',
    path: ['scheduledAt'],
})
    .refine((data) => {
    if (data.type === 'RECURRING' && !data.recurrence) {
        return false;
    }
    return true;
}, {
    message: 'recurrence configuration is required when schedule type is RECURRING',
    path: ['recurrence'],
})
    .refine((data) => {
    if (data.scheduledAt) {
        const scheduledTime = new Date(data.scheduledAt).getTime();
        const now = Date.now();
        return scheduledTime >= now - 5 * 60 * 1000;
    }
    return true;
}, {
    message: 'Scheduled time cannot be in the past',
    path: ['scheduledAt'],
});
exports.CreateCampaignDtoSchema = zod_1.z
    .object({
    name: common_schemas_1.NonEmptyStringSchema.min(3, 'Campaign name must be at least 3 characters').max(200, 'Campaign name must be 200 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    channel: exports.CampaignChannelSchema,
    targetSegmentId: common_schemas_1.UUIDSchema.describe('ID of the patient segment to target'),
    template: exports.CampaignTemplateSchema,
    schedule: exports.CampaignScheduleSchema,
    status: exports.CampaignStatusSchema.default('DRAFT'),
    smsConfig: zod_1.z
        .object({
        senderId: common_schemas_1.NonEmptyStringSchema.max(11, 'SMS sender ID must be 11 characters or less').optional(),
        unicode: zod_1.z.boolean().default(false).describe('Support unicode characters (reduces char limit)'),
    })
        .optional(),
    whatsappConfig: zod_1.z
        .object({
        templateId: common_schemas_1.NonEmptyStringSchema.max(100).optional().describe('WhatsApp approved template ID'),
        businessAccountId: common_schemas_1.UUIDSchema.optional(),
    })
        .optional(),
    emailConfig: zod_1.z
        .object({
        trackOpens: zod_1.z.boolean().default(true),
        trackClicks: zod_1.z.boolean().default(true),
        unsubscribeLink: zod_1.z.boolean().default(true),
    })
        .optional(),
    enableAbTesting: zod_1.z.boolean().default(false),
    testPercentage: zod_1.z
        .number()
        .min(0, 'Test percentage must be between 0 and 50')
        .max(50, 'Test percentage must be between 0 and 50')
        .optional()
        .describe('Percentage of audience for A/B test variant (0-50%)'),
    sendLimit: common_schemas_1.PositiveIntSchema.max(100000, 'Send limit cannot exceed 100,000 per batch').optional(),
    tags: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema.max(50))
        .max(20, 'Maximum 20 tags allowed')
        .optional(),
})
    .refine((data) => {
    if (data.channel === 'EMAIL' && !data.template.subject) {
        return false;
    }
    return true;
}, {
    message: 'Email campaigns require a subject line in template',
    path: ['template', 'subject'],
})
    .refine((data) => {
    if (data.channel === 'SMS') {
        const maxLength = data.smsConfig?.unicode ? 70 : 160;
        return data.template.body.length <= maxLength * 10;
    }
    return true;
}, {
    message: 'SMS body is too long (max 10 concatenated messages)',
    path: ['template', 'body'],
})
    .refine((data) => {
    if (data.enableAbTesting && !data.testPercentage) {
        return false;
    }
    return true;
}, {
    message: 'Test percentage is required when A/B testing is enabled',
    path: ['testPercentage'],
});
exports.UpdateCampaignDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.min(3).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    targetSegmentId: common_schemas_1.UUIDSchema.optional(),
    template: exports.CampaignTemplateSchema.optional(),
    schedule: exports.CampaignScheduleSchema.optional(),
    status: exports.CampaignStatusSchema.optional(),
    smsConfig: zod_1.z
        .object({
        senderId: common_schemas_1.NonEmptyStringSchema.max(11).optional(),
        unicode: zod_1.z.boolean().optional(),
    })
        .optional(),
    whatsappConfig: zod_1.z
        .object({
        templateId: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
        businessAccountId: common_schemas_1.UUIDSchema.optional(),
    })
        .optional(),
    emailConfig: zod_1.z
        .object({
        trackOpens: zod_1.z.boolean().optional(),
        trackClicks: zod_1.z.boolean().optional(),
        unsubscribeLink: zod_1.z.boolean().optional(),
    })
        .optional(),
    enableAbTesting: zod_1.z.boolean().optional(),
    testPercentage: zod_1.z.number().min(0).max(50).optional(),
    sendLimit: common_schemas_1.PositiveIntSchema.max(100000).optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(20).optional(),
});
exports.QueryCampaignsDtoSchema = zod_1.z
    .object({
    name: zod_1.z.string().max(200).optional(),
    channel: exports.CampaignChannelSchema.optional(),
    status: zod_1.z.array(exports.CampaignStatusSchema).optional(),
    segmentId: common_schemas_1.UUIDSchema.optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    scheduledAfter: common_schemas_1.ISODateStringSchema.optional(),
    scheduledBefore: common_schemas_1.ISODateStringSchema.optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z
        .enum(['name', 'createdAt', 'scheduledAt', 'status', 'channel'])
        .default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
    }
    return true;
}, {
    message: 'createdAfter must be before or equal to createdBefore',
    path: ['createdAfter'],
})
    .refine((data) => {
    if (data.scheduledAfter && data.scheduledBefore) {
        return data.scheduledAfter <= data.scheduledBefore;
    }
    return true;
}, {
    message: 'scheduledAfter must be before or equal to scheduledBefore',
    path: ['scheduledAfter'],
});
exports.SendCampaignDtoSchema = zod_1.z.object({
    campaignId: common_schemas_1.UUIDSchema,
    testMode: zod_1.z.boolean().default(false).describe('Send to test recipients only'),
    testRecipients: zod_1.z
        .array(common_schemas_1.EmailSchema.or(common_schemas_1.PhoneNumberSchema))
        .min(1, 'At least one test recipient required in test mode')
        .max(10, 'Maximum 10 test recipients')
        .optional(),
    overrideSchedule: zod_1.z.boolean().default(false).describe('Override scheduled time and send immediately'),
});
exports.SegmentRuleOperatorSchema = zod_1.z.enum(['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'GT', 'LT', 'GTE', 'LTE', 'IN', 'NOT_IN', 'BETWEEN', 'IS_NULL', 'IS_NOT_NULL'], {
    errorMap: () => ({ message: 'Invalid segment rule operator' }),
});
exports.SegmentRuleFieldSchema = zod_1.z.enum([
    'AGE',
    'GENDER',
    'LAST_VISIT_DATE',
    'DAYS_SINCE_LAST_VISIT',
    'TOTAL_VISITS',
    'TOTAL_SPENT',
    'OUTSTANDING_BALANCE',
    'LOYALTY_POINTS',
    'LOYALTY_TIER',
    'APPOINTMENT_STATUS',
    'TREATMENT_TYPE',
    'DIAGNOSIS',
    'LOCATION',
    'CITY',
    'STATE',
    'POSTAL_CODE',
    'REGISTRATION_DATE',
    'BIRTH_DATE',
    'MARITAL_STATUS',
    'HAS_INSURANCE',
    'INSURANCE_PROVIDER',
    'REFERRAL_SOURCE',
    'CONSENT_STATUS',
    'COMMUNICATION_PREFERENCE',
    'LANGUAGE',
    'TAG',
], {
    errorMap: () => ({ message: 'Invalid segment rule field' }),
});
exports.SegmentRuleSchema = zod_1.z
    .object({
    field: exports.SegmentRuleFieldSchema,
    operator: exports.SegmentRuleOperatorSchema,
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()]))]).optional(),
    logicalOperator: zod_1.z.enum(['AND', 'OR']).default('AND').describe('How this rule combines with the next'),
})
    .refine((data) => {
    if (data.operator === 'IS_NULL' || data.operator === 'IS_NOT_NULL') {
        return true;
    }
    return data.value !== undefined;
}, {
    message: 'Value is required for this operator',
    path: ['value'],
})
    .refine((data) => {
    if (data.operator === 'BETWEEN') {
        return Array.isArray(data.value) && data.value.length === 2;
    }
    return true;
}, {
    message: 'BETWEEN operator requires array of exactly 2 values [min, max]',
    path: ['value'],
})
    .refine((data) => {
    if (data.operator === 'IN' || data.operator === 'NOT_IN') {
        return Array.isArray(data.value) && data.value.length > 0;
    }
    return true;
}, {
    message: 'IN/NOT_IN operators require non-empty array of values',
    path: ['value'],
});
exports.CreateSegmentDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.min(3, 'Segment name must be at least 3 characters').max(100, 'Segment name must be 100 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    rules: zod_1.z
        .array(exports.SegmentRuleSchema)
        .min(1, 'At least one rule is required')
        .max(50, 'Maximum 50 rules per segment'),
    isStatic: zod_1.z
        .boolean()
        .default(false)
        .describe('Static segments are snapshot, dynamic segments update in real-time'),
    estimatedSize: common_schemas_1.NonNegativeIntSchema.optional().describe('Estimated number of patients in segment'),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(20, 'Maximum 20 tags allowed').optional(),
});
exports.UpdateSegmentDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.min(3).max(100).optional(),
    description: zod_1.z.string().max(1000).optional(),
    rules: zod_1.z.array(exports.SegmentRuleSchema).min(1).max(50).optional(),
    isStatic: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(20).optional(),
});
exports.QuerySegmentsDtoSchema = zod_1.z.object({
    name: zod_1.z.string().max(100).optional(),
    isStatic: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).optional(),
    minSize: common_schemas_1.NonNegativeIntSchema.optional(),
    maxSize: common_schemas_1.NonNegativeIntSchema.optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'createdAt', 'size', 'updatedAt']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
});
exports.RefreshSegmentDtoSchema = zod_1.z.object({
    segmentId: common_schemas_1.UUIDSchema,
    fullRefresh: zod_1.z
        .boolean()
        .default(false)
        .describe('Full refresh rebuilds entire segment, incremental only updates changes'),
});
exports.ReferralStatusSchema = zod_1.z.enum(['PENDING', 'COMPLETED', 'EXPIRED', 'REDEEMED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid referral status' }),
});
exports.ReferralRewardTypeSchema = zod_1.z.enum(['POINTS', 'DISCOUNT', 'CASH', 'SERVICE', 'GIFT'], {
    errorMap: () => ({ message: 'Invalid referral reward type' }),
});
exports.ReferralCodeSchema = zod_1.z
    .string()
    .regex(/^[A-Z0-9]{6,20}$/, {
    message: 'Referral code must be 6-20 uppercase alphanumeric characters',
})
    .describe('Unique referral code');
exports.CreateReferralDtoSchema = zod_1.z.object({
    referrerId: common_schemas_1.UUIDSchema.describe('Patient who is referring'),
    refereeEmail: common_schemas_1.EmailSchema.optional().describe('Email of person being referred'),
    refereePhone: common_schemas_1.PhoneNumberSchema.optional().describe('Phone of person being referred'),
    refereeName: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    referralCode: exports.ReferralCodeSchema.optional().describe('Auto-generated if not provided'),
    rewardType: exports.ReferralRewardTypeSchema,
    rewardValue: zod_1.z
        .number()
        .positive('Reward value must be positive')
        .max(10000, 'Reward value cannot exceed 10000'),
    referrerRewardValue: zod_1.z
        .number()
        .nonnegative('Referrer reward value must be non-negative')
        .max(10000, 'Referrer reward value cannot exceed 10000')
        .optional()
        .describe('Reward for the referrer (if different from referee)'),
    expiresAt: common_schemas_1.ISODateStringSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.RedeemReferralDtoSchema = zod_1.z.object({
    referralCode: exports.ReferralCodeSchema,
    refereeId: common_schemas_1.UUIDSchema.describe('Patient who was referred (now registered)'),
    redemptionDate: common_schemas_1.ISODateStringSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.QueryReferralsDtoSchema = zod_1.z
    .object({
    referrerId: common_schemas_1.UUIDSchema.optional(),
    refereeId: common_schemas_1.UUIDSchema.optional(),
    status: zod_1.z.array(exports.ReferralStatusSchema).optional(),
    rewardType: exports.ReferralRewardTypeSchema.optional(),
    referralCode: exports.ReferralCodeSchema.optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    expiringBefore: common_schemas_1.ISODateStringSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'expiresAt', 'status', 'rewardValue']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
    }
    return true;
}, {
    message: 'createdAfter must be before or equal to createdBefore',
    path: ['createdAfter'],
});
exports.LoyaltyTierSchema = zod_1.z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'], {
    errorMap: () => ({ message: 'Invalid loyalty tier' }),
});
exports.LoyaltyTransactionTypeSchema = zod_1.z.enum(['ACCRUAL', 'REDEMPTION', 'EXPIRY', 'ADJUSTMENT', 'REVERSAL'], {
    errorMap: () => ({ message: 'Invalid loyalty transaction type' }),
});
exports.LoyaltyPointsSchema = zod_1.z
    .number()
    .int('Loyalty points must be an integer')
    .min(0, 'Loyalty points cannot be negative')
    .max(1000000, 'Loyalty points cannot exceed 1,000,000');
exports.AccrueLoyaltyPointsDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    amount: common_schemas_1.PositiveIntSchema.max(10000, 'Cannot accrue more than 10,000 points in single transaction'),
    source: zod_1.z
        .enum(['APPOINTMENT', 'PROCEDURE', 'PAYMENT', 'REFERRAL', 'BIRTHDAY', 'PROMOTION', 'MANUAL'], {
        errorMap: () => ({ message: 'Invalid loyalty points source' }),
    })
        .describe('Source of point accrual'),
    sourceId: common_schemas_1.UUIDSchema.optional().describe('ID of related entity (appointment, procedure, etc.)'),
    description: common_schemas_1.NonEmptyStringSchema.max(500),
    expiresAt: common_schemas_1.ISODateStringSchema.optional().describe('Point expiration date'),
    multiplier: zod_1.z
        .number()
        .positive()
        .max(10, 'Multiplier cannot exceed 10x')
        .default(1)
        .describe('Point multiplier for promotions'),
});
exports.RedeemLoyaltyPointsDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    amount: common_schemas_1.PositiveIntSchema.max(100000, 'Cannot redeem more than 100,000 points in single transaction'),
    description: common_schemas_1.NonEmptyStringSchema.max(500),
    redemptionValue: zod_1.z
        .number()
        .positive('Redemption value must be positive')
        .max(10000, 'Redemption value cannot exceed 10000')
        .optional()
        .describe('Monetary value of redemption'),
    relatedInvoiceId: common_schemas_1.UUIDSchema.optional().describe('Invoice where points were applied'),
});
exports.QueryLoyaltyTransactionsDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    transactionType: zod_1.z.array(exports.LoyaltyTransactionTypeSchema).optional(),
    source: zod_1.z
        .array(zod_1.z.enum(['APPOINTMENT', 'PROCEDURE', 'PAYMENT', 'REFERRAL', 'BIRTHDAY', 'PROMOTION', 'MANUAL']))
        .optional(),
    minAmount: common_schemas_1.NonNegativeIntSchema.optional(),
    maxAmount: common_schemas_1.NonNegativeIntSchema.optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'amount', 'transactionType']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
    }
    return true;
}, {
    message: 'createdAfter must be before or equal to createdBefore',
    path: ['createdAfter'],
});
exports.FeedbackCategorySchema = zod_1.z.enum(['SERVICE', 'TREATMENT', 'FACILITY', 'STAFF', 'BILLING', 'SCHEDULING', 'COMMUNICATION', 'OVERALL'], {
    errorMap: () => ({ message: 'Invalid feedback category' }),
});
exports.FeedbackRatingSchema = zod_1.z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5');
exports.CreateFeedbackDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional().describe('Optional for anonymous feedback'),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    category: exports.FeedbackCategorySchema,
    rating: exports.FeedbackRatingSchema,
    comment: zod_1.z.string().max(5000, 'Comment must be 5000 characters or less').optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    wouldRecommend: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(10, 'Maximum 10 tags allowed').optional(),
});
exports.QueryFeedbackDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    category: zod_1.z.array(exports.FeedbackCategorySchema).optional(),
    minRating: exports.FeedbackRatingSchema.optional(),
    maxRating: exports.FeedbackRatingSchema.optional(),
    wouldRecommend: zod_1.z.boolean().optional(),
    isAnonymous: zod_1.z.boolean().optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'rating', 'category']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.minRating && data.maxRating) {
        return data.minRating <= data.maxRating;
    }
    return true;
}, {
    message: 'minRating must be less than or equal to maxRating',
    path: ['minRating'],
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
    }
    return true;
}, {
    message: 'createdAfter must be before or equal to createdBefore',
    path: ['createdAfter'],
});
exports.NpsScoreSchema = zod_1.z
    .number()
    .int('NPS score must be an integer')
    .min(0, 'NPS score must be between 0 and 10')
    .max(10, 'NPS score must be between 0 and 10');
exports.NpsCategorySchema = zod_1.z.enum(['DETRACTOR', 'PASSIVE', 'PROMOTER'], {
    errorMap: () => ({ message: 'Invalid NPS category' }),
});
exports.SubmitNpsDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema.optional().describe('Optional for anonymous NPS'),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    score: exports.NpsScoreSchema,
    comment: zod_1.z.string().max(5000, 'Comment must be 5000 characters or less').optional(),
    followUpQuestion: zod_1.z
        .string()
        .max(500, 'Follow-up question response must be 500 characters or less')
        .optional(),
    isAnonymous: zod_1.z.boolean().default(false),
    source: zod_1.z
        .enum(['EMAIL', 'SMS', 'WEBSITE', 'APP', 'IN_PERSON'], {
        errorMap: () => ({ message: 'Invalid NPS source' }),
    })
        .default('WEBSITE'),
});
exports.QueryNpsDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    category: zod_1.z.array(exports.NpsCategorySchema).optional(),
    minScore: exports.NpsScoreSchema.optional(),
    maxScore: exports.NpsScoreSchema.optional(),
    source: zod_1.z.array(zod_1.z.enum(['EMAIL', 'SMS', 'WEBSITE', 'APP', 'IN_PERSON'])).optional(),
    isAnonymous: zod_1.z.boolean().optional(),
    createdAfter: common_schemas_1.ISODateStringSchema.optional(),
    createdBefore: common_schemas_1.ISODateStringSchema.optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['createdAt', 'score']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.minScore !== undefined && data.maxScore !== undefined) {
        return data.minScore <= data.maxScore;
    }
    return true;
}, {
    message: 'minScore must be less than or equal to maxScore',
    path: ['minScore'],
})
    .refine((data) => {
    if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
    }
    return true;
}, {
    message: 'createdAfter must be before or equal to createdBefore',
    path: ['createdAfter'],
});
exports.AutomationTriggerTypeSchema = zod_1.z.enum([
    'APPOINTMENT_COMPLETED',
    'APPOINTMENT_SCHEDULED',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_NO_SHOW',
    'INVOICE_PAID',
    'INVOICE_OVERDUE',
    'TREATMENT_COMPLETED',
    'PATIENT_REGISTERED',
    'PATIENT_BIRTHDAY',
    'LOYALTY_TIER_CHANGED',
    'FEEDBACK_SUBMITTED',
    'NPS_SUBMITTED',
    'REFERRAL_COMPLETED',
    'DAYS_SINCE_LAST_VISIT',
    'CUSTOM_DATE',
], {
    errorMap: () => ({ message: 'Invalid automation trigger type' }),
});
exports.AutomationActionTypeSchema = zod_1.z.enum([
    'SEND_CAMPAIGN',
    'SEND_EMAIL',
    'SEND_SMS',
    'SEND_PUSH',
    'ACCRUE_LOYALTY_POINTS',
    'CREATE_TASK',
    'UPDATE_SEGMENT',
    'TAG_PATIENT',
    'TRIGGER_WEBHOOK',
    'CREATE_APPOINTMENT_REMINDER',
    'SEND_FEEDBACK_REQUEST',
], {
    errorMap: () => ({ message: 'Invalid automation action type' }),
});
exports.AutomationConditionSchema = zod_1.z.object({
    field: exports.SegmentRuleFieldSchema,
    operator: exports.SegmentRuleOperatorSchema,
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()]))]).optional(),
});
exports.AutomationActionSchema = zod_1.z
    .object({
    type: exports.AutomationActionTypeSchema,
    delay: common_schemas_1.NonNegativeIntSchema.max(365, 'Delay cannot exceed 365 days')
        .optional()
        .describe('Delay in days before executing action'),
    campaignId: common_schemas_1.UUIDSchema.optional(),
    templateId: common_schemas_1.UUIDSchema.optional(),
    emailSubject: zod_1.z.string().max(500).optional(),
    emailBody: zod_1.z.string().max(50000).optional(),
    smsBody: zod_1.z.string().max(1600).optional(),
    pointsAmount: common_schemas_1.PositiveIntSchema.max(10000).optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(10).optional(),
    webhookUrl: zod_1.z.string().url().max(500).optional(),
    webhookPayload: zod_1.z.record(zod_1.z.unknown()).optional(),
    taskTitle: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    taskDescription: zod_1.z.string().max(2000).optional(),
    assigneeId: common_schemas_1.UUIDSchema.optional(),
})
    .refine((data) => {
    if (data.type === 'SEND_CAMPAIGN' && !data.campaignId) {
        return false;
    }
    return true;
}, {
    message: 'campaignId is required for SEND_CAMPAIGN action',
    path: ['campaignId'],
})
    .refine((data) => {
    if (data.type === 'ACCRUE_LOYALTY_POINTS' && !data.pointsAmount) {
        return false;
    }
    return true;
}, {
    message: 'pointsAmount is required for ACCRUE_LOYALTY_POINTS action',
    path: ['pointsAmount'],
})
    .refine((data) => {
    if (data.type === 'TRIGGER_WEBHOOK' && !data.webhookUrl) {
        return false;
    }
    return true;
}, {
    message: 'webhookUrl is required for TRIGGER_WEBHOOK action',
    path: ['webhookUrl'],
});
exports.CreateAutomationRuleDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.min(3, 'Rule name must be at least 3 characters').max(200, 'Rule name must be 200 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    triggerType: exports.AutomationTriggerTypeSchema,
    conditions: zod_1.z
        .array(exports.AutomationConditionSchema)
        .max(20, 'Maximum 20 conditions per rule')
        .optional()
        .describe('Conditions that must be met for rule to fire'),
    actions: zod_1.z
        .array(exports.AutomationActionSchema)
        .min(1, 'At least one action is required')
        .max(10, 'Maximum 10 actions per rule'),
    isActive: zod_1.z.boolean().default(true),
    priority: common_schemas_1.NonNegativeIntSchema.max(100, 'Priority must be between 0 and 100').default(0),
    throttle: zod_1.z
        .object({
        enabled: zod_1.z.boolean().default(false),
        maxExecutions: common_schemas_1.PositiveIntSchema.max(1000),
        timeWindowMinutes: common_schemas_1.PositiveIntSchema.max(10080, 'Time window cannot exceed 7 days (10080 minutes)'),
    })
        .optional()
        .describe('Throttle rule execution to prevent spam'),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(20, 'Maximum 20 tags allowed').optional(),
});
exports.UpdateAutomationRuleDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.min(3).max(200).optional(),
    description: zod_1.z.string().max(1000).optional(),
    conditions: zod_1.z.array(exports.AutomationConditionSchema).max(20).optional(),
    actions: zod_1.z.array(exports.AutomationActionSchema).min(1).max(10).optional(),
    isActive: zod_1.z.boolean().optional(),
    priority: common_schemas_1.NonNegativeIntSchema.max(100).optional(),
    throttle: zod_1.z
        .object({
        enabled: zod_1.z.boolean(),
        maxExecutions: common_schemas_1.PositiveIntSchema.max(1000),
        timeWindowMinutes: common_schemas_1.PositiveIntSchema.max(10080),
    })
        .optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).max(20).optional(),
});
exports.QueryAutomationRulesDtoSchema = zod_1.z.object({
    name: zod_1.z.string().max(200).optional(),
    triggerType: zod_1.z.array(exports.AutomationTriggerTypeSchema).optional(),
    isActive: zod_1.z.boolean().optional(),
    tags: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'createdAt', 'priority', 'triggerType']).default('createdAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
});
exports.DeliveryStatusSchema = zod_1.z.enum(['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED', 'UNSUBSCRIBED', 'COMPLAINED'], {
    errorMap: () => ({ message: 'Invalid delivery status' }),
});
exports.DeliveryProviderSchema = zod_1.z.enum(['SENDGRID', 'TWILIO', 'ONESIGNAL', 'WHATSAPP', 'MAILGUN', 'AWS_SES', 'SMTP', 'FCM'], {
    errorMap: () => ({ message: 'Invalid delivery provider' }),
});
exports.QueryDeliveryLogsDtoSchema = zod_1.z
    .object({
    campaignId: common_schemas_1.UUIDSchema.optional(),
    patientId: common_schemas_1.UUIDSchema.optional(),
    channel: exports.CampaignChannelSchema.optional(),
    status: zod_1.z.array(exports.DeliveryStatusSchema).optional(),
    provider: zod_1.z.array(exports.DeliveryProviderSchema).optional(),
    recipient: zod_1.z
        .string()
        .max(255)
        .optional()
        .describe('Email or phone number of recipient'),
    sentAfter: common_schemas_1.ISODateStringSchema.optional(),
    sentBefore: common_schemas_1.ISODateStringSchema.optional(),
    deliveredAfter: common_schemas_1.ISODateStringSchema.optional(),
    deliveredBefore: common_schemas_1.ISODateStringSchema.optional(),
    hasError: zod_1.z.boolean().optional(),
    errorCode: zod_1.z.string().max(50).optional(),
    wasOpened: zod_1.z.boolean().optional(),
    wasClicked: zod_1.z.boolean().optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z
        .enum(['sentAt', 'deliveredAt', 'status', 'recipient', 'channel'])
        .default('sentAt'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.sentAfter && data.sentBefore) {
        return data.sentAfter <= data.sentBefore;
    }
    return true;
}, {
    message: 'sentAfter must be before or equal to sentBefore',
    path: ['sentAfter'],
})
    .refine((data) => {
    if (data.deliveredAfter && data.deliveredBefore) {
        return data.deliveredAfter <= data.deliveredBefore;
    }
    return true;
}, {
    message: 'deliveredAfter must be before or equal to deliveredBefore',
    path: ['deliveredAfter'],
});
//# sourceMappingURL=marketing.schemas.js.map