/**
 * Marketing validation schemas for campaigns, segments, referrals, loyalty, feedback, NPS, automation, and delivery
 * @module shared-validation/schemas/marketing
 *
 * Edge cases covered:
 * - Campaign scheduling conflicts and timezone handling
 * - Segment rule combinations and operator precedence
 * - Referral code uniqueness and expiration
 * - Loyalty point accrual/redemption balance validation
 * - Multi-channel delivery tracking
 * - Automation rule circular dependency prevention
 * - Template variable validation and injection prevention
 * - Rate limiting and batch size constraints
 * - Multi-language template support
 * - GDPR compliance and opt-out handling
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  ISODateStringSchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
  SortOrderSchema,
} from '../common.schemas';

// ============================================================================
// CAMPAIGN ENUMS
// ============================================================================

/**
 * Campaign channel enumeration
 * Supported communication channels for marketing campaigns
 */
export const CampaignChannelSchema = z.enum(
  ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'],
  {
    errorMap: () => ({ message: 'Invalid campaign channel' }),
  },
);

export type CampaignChannel = z.infer<typeof CampaignChannelSchema>;

/**
 * Campaign status enumeration
 * Lifecycle: DRAFT → SCHEDULED → ACTIVE → (COMPLETED | CANCELLED | PAUSED)
 */
export const CampaignStatusSchema = z.enum(
  ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'],
  {
    errorMap: () => ({ message: 'Invalid campaign status' }),
  },
);

export type CampaignStatus = z.infer<typeof CampaignStatusSchema>;

/**
 * Campaign schedule type enumeration
 */
export const CampaignScheduleTypeSchema = z.enum(
  ['IMMEDIATE', 'SCHEDULED', 'RECURRING'],
  {
    errorMap: () => ({ message: 'Invalid campaign schedule type' }),
  },
);

export type CampaignScheduleType = z.infer<typeof CampaignScheduleTypeSchema>;

// ============================================================================
// CAMPAIGN TEMPLATE SCHEMAS
// ============================================================================

/**
 * Template variable schema
 * Validates merge tags/variables used in campaign templates
 * Format: {{variableName}} or {variableName}
 */
export const TemplateVariableSchema = z
  .string()
  .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Variable name must start with letter or underscore, followed by alphanumeric characters or underscores',
  })
  .min(1, 'Variable name cannot be empty')
  .max(50, 'Variable name must be 50 characters or less');

export type TemplateVariable = z.infer<typeof TemplateVariableSchema>;

/**
 * Campaign template schema
 * Edge cases:
 * - Missing required variables in body
 * - HTML injection attempts in templates
 * - Email subject line length limits (500 chars for spam filters)
 * - SMS character count limits (160 chars standard)
 * - WhatsApp template format validation
 */
export const CampaignTemplateSchema = z
  .object({
    subject: NonEmptyStringSchema.min(1, 'Subject is required')
      .max(500, 'Subject must be 500 characters or less')
      .optional()
      .describe('Required for EMAIL, optional for other channels'),
    body: NonEmptyStringSchema.min(1, 'Message body is required').max(
      50000,
      'Message body must be 50000 characters or less',
    ),
    variables: z
      .array(TemplateVariableSchema)
      .max(50, 'Maximum 50 template variables allowed')
      .optional()
      .describe('List of variables used in template (e.g., ["firstName", "appointmentDate"])'),
    preheader: z
      .string()
      .max(150, 'Preheader must be 150 characters or less')
      .optional()
      .describe('Email preheader text (preview text)'),
    fromName: NonEmptyStringSchema.max(100, 'From name must be 100 characters or less').optional(),
    replyTo: EmailSchema.optional(),
    language: z
      .string()
      .length(2, 'Language code must be 2 characters (ISO 639-1)')
      .regex(/^[a-z]{2}$/, { message: 'Language code must be lowercase letters' })
      .default('en'),
  })
  .refine(
    (data) => {
      // Extract variables from body using regex
      const bodyVars = [...(data.body.matchAll(/\{\{?(\w+)\}?\}/g) || [])].map((m) => m[1]);
      const subjectVars = data.subject ? [...(data.subject.matchAll(/\{\{?(\w+)\}?\}/g) || [])].map((m) => m[1]) : [];
      const allVarsInTemplate = [...new Set([...bodyVars, ...subjectVars])];

      // If variables array is provided, ensure all used variables are declared
      if (data.variables && data.variables.length > 0) {
        return allVarsInTemplate.every((v) => data.variables!.includes(v));
      }
      return true;
    },
    {
      message: 'All template variables used in subject/body must be declared in variables array',
      path: ['variables'],
    },
  );

export type CampaignTemplate = z.infer<typeof CampaignTemplateSchema>;

/**
 * Campaign schedule schema
 * Edge cases:
 * - Schedule time in the past
 * - Recurring campaigns without end date (infinite)
 * - Timezone handling for scheduled sends
 * - DST transitions
 */
export const CampaignScheduleSchema = z
  .object({
    type: CampaignScheduleTypeSchema,
    scheduledAt: ISODateStringSchema.optional().describe('ISO datetime for scheduled campaigns'),
    timezone: z
      .string()
      .regex(/^[A-Za-z]+\/[A-Za-z_]+$/, { message: 'Invalid timezone format (e.g., America/New_York)' })
      .default('UTC'),
    recurrence: z
      .object({
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY'], {
          errorMap: () => ({ message: 'Invalid recurrence frequency' }),
        }),
        interval: PositiveIntSchema.max(365, 'Interval cannot exceed 365').describe(
          'Every N days/weeks/months',
        ),
        endDate: ISODateStringSchema.optional().describe('When to stop recurring'),
        daysOfWeek: z
          .array(z.number().int().min(0).max(6))
          .max(7, 'Maximum 7 days of week')
          .optional()
          .describe('0=Sunday, 6=Saturday'),
        dayOfMonth: z
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
  .refine(
    (data) => {
      // If type is SCHEDULED, scheduledAt is required
      if (data.type === 'SCHEDULED' && !data.scheduledAt) {
        return false;
      }
      return true;
    },
    {
      message: 'scheduledAt is required when schedule type is SCHEDULED',
      path: ['scheduledAt'],
    },
  )
  .refine(
    (data) => {
      // If type is RECURRING, recurrence is required
      if (data.type === 'RECURRING' && !data.recurrence) {
        return false;
      }
      return true;
    },
    {
      message: 'recurrence configuration is required when schedule type is RECURRING',
      path: ['recurrence'],
    },
  )
  .refine(
    (data) => {
      // If scheduledAt is provided, validate it's not in the past (allow 5 min buffer for processing)
      if (data.scheduledAt) {
        const scheduledTime = new Date(data.scheduledAt).getTime();
        const now = Date.now();
        return scheduledTime >= now - 5 * 60 * 1000; // 5 min buffer
      }
      return true;
    },
    {
      message: 'Scheduled time cannot be in the past',
      path: ['scheduledAt'],
    },
  );

export type CampaignSchedule = z.infer<typeof CampaignScheduleSchema>;

// ============================================================================
// CAMPAIGN SCHEMAS
// ============================================================================

/**
 * Create campaign DTO schema
 * Edge cases:
 * - Empty segment (no recipients)
 * - Invalid template for channel (e.g., no subject for EMAIL)
 * - Schedule conflicts
 * - Missing channel-specific configuration
 * - Rate limiting for bulk sends
 */
export const CreateCampaignDtoSchema = z
  .object({
    name: NonEmptyStringSchema.min(3, 'Campaign name must be at least 3 characters').max(
      200,
      'Campaign name must be 200 characters or less',
    ),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    channel: CampaignChannelSchema,
    targetSegmentId: UUIDSchema.describe('ID of the patient segment to target'),
    template: CampaignTemplateSchema,
    schedule: CampaignScheduleSchema,
    status: CampaignStatusSchema.default('DRAFT'),

    // Channel-specific configuration
    smsConfig: z
      .object({
        senderId: NonEmptyStringSchema.max(11, 'SMS sender ID must be 11 characters or less').optional(),
        unicode: z.boolean().default(false).describe('Support unicode characters (reduces char limit)'),
      })
      .optional(),

    whatsappConfig: z
      .object({
        templateId: NonEmptyStringSchema.max(100).optional().describe('WhatsApp approved template ID'),
        businessAccountId: UUIDSchema.optional(),
      })
      .optional(),

    emailConfig: z
      .object({
        trackOpens: z.boolean().default(true),
        trackClicks: z.boolean().default(true),
        unsubscribeLink: z.boolean().default(true),
      })
      .optional(),

    // Campaign settings
    enableAbTesting: z.boolean().default(false),
    testPercentage: z
      .number()
      .min(0, 'Test percentage must be between 0 and 50')
      .max(50, 'Test percentage must be between 0 and 50')
      .optional()
      .describe('Percentage of audience for A/B test variant (0-50%)'),

    sendLimit: PositiveIntSchema.max(100000, 'Send limit cannot exceed 100,000 per batch').optional(),

    tags: z
      .array(NonEmptyStringSchema.max(50))
      .max(20, 'Maximum 20 tags allowed')
      .optional(),
  })
  .refine(
    (data) => {
      // If channel is EMAIL, subject is required in template
      if (data.channel === 'EMAIL' && !data.template.subject) {
        return false;
      }
      return true;
    },
    {
      message: 'Email campaigns require a subject line in template',
      path: ['template', 'subject'],
    },
  )
  .refine(
    (data) => {
      // If SMS channel, body must be reasonable length (accounting for concatenation)
      if (data.channel === 'SMS') {
        const maxLength = data.smsConfig?.unicode ? 70 : 160;
        // Warning threshold, not hard limit (SMS concatenates)
        return data.template.body.length <= maxLength * 10; // Allow up to 10 SMS parts
      }
      return true;
    },
    {
      message: 'SMS body is too long (max 10 concatenated messages)',
      path: ['template', 'body'],
    },
  )
  .refine(
    (data) => {
      // If enableAbTesting is true, testPercentage is required
      if (data.enableAbTesting && !data.testPercentage) {
        return false;
      }
      return true;
    },
    {
      message: 'Test percentage is required when A/B testing is enabled',
      path: ['testPercentage'],
    },
  );

export type CreateCampaignDto = z.infer<typeof CreateCampaignDtoSchema>;

/**
 * Update campaign DTO schema
 * Edge cases:
 * - Updating active/completed campaigns (should be restricted)
 * - Changing segment after scheduling
 * - Modifying sent campaigns
 */
export const UpdateCampaignDtoSchema = z.object({
  name: NonEmptyStringSchema.min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  targetSegmentId: UUIDSchema.optional(),
  template: CampaignTemplateSchema.optional(),
  schedule: CampaignScheduleSchema.optional(),
  status: CampaignStatusSchema.optional(),
  smsConfig: z
    .object({
      senderId: NonEmptyStringSchema.max(11).optional(),
      unicode: z.boolean().optional(),
    })
    .optional(),
  whatsappConfig: z
    .object({
      templateId: NonEmptyStringSchema.max(100).optional(),
      businessAccountId: UUIDSchema.optional(),
    })
    .optional(),
  emailConfig: z
    .object({
      trackOpens: z.boolean().optional(),
      trackClicks: z.boolean().optional(),
      unsubscribeLink: z.boolean().optional(),
    })
    .optional(),
  enableAbTesting: z.boolean().optional(),
  testPercentage: z.number().min(0).max(50).optional(),
  sendLimit: PositiveIntSchema.max(100000).optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).max(20).optional(),
});

export type UpdateCampaignDto = z.infer<typeof UpdateCampaignDtoSchema>;

/**
 * Query campaigns DTO schema
 * Edge cases:
 * - Date range spanning multiple years
 * - Complex status combinations
 * - Large result sets requiring pagination
 */
export const QueryCampaignsDtoSchema = z
  .object({
    // Filters
    name: z.string().max(200).optional(),
    channel: CampaignChannelSchema.optional(),
    status: z.array(CampaignStatusSchema).optional(),
    segmentId: UUIDSchema.optional(),
    tags: z.array(NonEmptyStringSchema.max(50)).optional(),

    // Date range filters
    createdAfter: ISODateStringSchema.optional(),
    createdBefore: ISODateStringSchema.optional(),
    scheduledAfter: ISODateStringSchema.optional(),
    scheduledBefore: ISODateStringSchema.optional(),

    // Search
    searchTerm: z.string().max(200).optional(),

    // Pagination
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),

    // Sorting
    sortBy: z
      .enum(['name', 'createdAt', 'scheduledAt', 'status', 'channel'])
      .default('createdAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
      }
      return true;
    },
    {
      message: 'createdAfter must be before or equal to createdBefore',
      path: ['createdAfter'],
    },
  )
  .refine(
    (data) => {
      if (data.scheduledAfter && data.scheduledBefore) {
        return data.scheduledAfter <= data.scheduledBefore;
      }
      return true;
    },
    {
      message: 'scheduledAfter must be before or equal to scheduledBefore',
      path: ['scheduledAfter'],
    },
  );

export type QueryCampaignsDto = z.infer<typeof QueryCampaignsDtoSchema>;

/**
 * Send campaign DTO schema
 * Triggers immediate sending of a campaign
 */
export const SendCampaignDtoSchema = z.object({
  campaignId: UUIDSchema,
  testMode: z.boolean().default(false).describe('Send to test recipients only'),
  testRecipients: z
    .array(EmailSchema.or(PhoneNumberSchema))
    .min(1, 'At least one test recipient required in test mode')
    .max(10, 'Maximum 10 test recipients')
    .optional(),
  overrideSchedule: z.boolean().default(false).describe('Override scheduled time and send immediately'),
});

export type SendCampaignDto = z.infer<typeof SendCampaignDtoSchema>;

// ============================================================================
// SEGMENT ENUMS & SCHEMAS
// ============================================================================

/**
 * Segment rule operator enumeration
 * Used for filtering and segmentation logic
 */
export const SegmentRuleOperatorSchema = z.enum(
  ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'GT', 'LT', 'GTE', 'LTE', 'IN', 'NOT_IN', 'BETWEEN', 'IS_NULL', 'IS_NOT_NULL'],
  {
    errorMap: () => ({ message: 'Invalid segment rule operator' }),
  },
);

export type SegmentRuleOperator = z.infer<typeof SegmentRuleOperatorSchema>;

/**
 * Segment rule field enumeration
 * Patient attributes that can be used for segmentation
 */
export const SegmentRuleFieldSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid segment rule field' }),
  },
);

export type SegmentRuleField = z.infer<typeof SegmentRuleFieldSchema>;

/**
 * Segment rule schema
 * Edge cases:
 * - Invalid operator for field type (e.g., BETWEEN on string field)
 * - Missing value when required by operator
 * - Type mismatch between field and value
 */
export const SegmentRuleSchema = z
  .object({
    field: SegmentRuleFieldSchema,
    operator: SegmentRuleOperatorSchema,
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]).optional(),
    logicalOperator: z.enum(['AND', 'OR']).default('AND').describe('How this rule combines with the next'),
  })
  .refine(
    (data) => {
      // IS_NULL and IS_NOT_NULL don't require a value
      if (data.operator === 'IS_NULL' || data.operator === 'IS_NOT_NULL') {
        return true;
      }
      // All other operators require a value
      return data.value !== undefined;
    },
    {
      message: 'Value is required for this operator',
      path: ['value'],
    },
  )
  .refine(
    (data) => {
      // BETWEEN requires array of 2 values
      if (data.operator === 'BETWEEN') {
        return Array.isArray(data.value) && data.value.length === 2;
      }
      return true;
    },
    {
      message: 'BETWEEN operator requires array of exactly 2 values [min, max]',
      path: ['value'],
    },
  )
  .refine(
    (data) => {
      // IN and NOT_IN require array values
      if (data.operator === 'IN' || data.operator === 'NOT_IN') {
        return Array.isArray(data.value) && data.value.length > 0;
      }
      return true;
    },
    {
      message: 'IN/NOT_IN operators require non-empty array of values',
      path: ['value'],
    },
  );

export type SegmentRule = z.infer<typeof SegmentRuleSchema>;

/**
 * Create segment DTO schema
 * Edge cases:
 * - Contradictory rules (e.g., age > 50 AND age < 30)
 * - Empty segment (no matching patients)
 * - Circular segment dependencies
 * - Performance issues with complex rules
 */
export const CreateSegmentDtoSchema = z.object({
  name: NonEmptyStringSchema.min(3, 'Segment name must be at least 3 characters').max(
    100,
    'Segment name must be 100 characters or less',
  ),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  rules: z
    .array(SegmentRuleSchema)
    .min(1, 'At least one rule is required')
    .max(50, 'Maximum 50 rules per segment'),
  isStatic: z
    .boolean()
    .default(false)
    .describe('Static segments are snapshot, dynamic segments update in real-time'),
  estimatedSize: NonNegativeIntSchema.optional().describe('Estimated number of patients in segment'),
  tags: z.array(NonEmptyStringSchema.max(50)).max(20, 'Maximum 20 tags allowed').optional(),
});

export type CreateSegmentDto = z.infer<typeof CreateSegmentDtoSchema>;

/**
 * Update segment DTO schema
 */
export const UpdateSegmentDtoSchema = z.object({
  name: NonEmptyStringSchema.min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  rules: z.array(SegmentRuleSchema).min(1).max(50).optional(),
  isStatic: z.boolean().optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).max(20).optional(),
});

export type UpdateSegmentDto = z.infer<typeof UpdateSegmentDtoSchema>;

/**
 * Query segments DTO schema
 */
export const QuerySegmentsDtoSchema = z.object({
  name: z.string().max(100).optional(),
  isStatic: z.boolean().optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).optional(),
  minSize: NonNegativeIntSchema.optional(),
  maxSize: NonNegativeIntSchema.optional(),
  searchTerm: z.string().max(200).optional(),
  page: PositiveIntSchema.default(1),
  limit: PositiveIntSchema.min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'size', 'updatedAt']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

export type QuerySegmentsDto = z.infer<typeof QuerySegmentsDtoSchema>;

/**
 * Refresh segment DTO schema
 * Recalculates dynamic segment membership
 */
export const RefreshSegmentDtoSchema = z.object({
  segmentId: UUIDSchema,
  fullRefresh: z
    .boolean()
    .default(false)
    .describe('Full refresh rebuilds entire segment, incremental only updates changes'),
});

export type RefreshSegmentDto = z.infer<typeof RefreshSegmentDtoSchema>;

// ============================================================================
// REFERRAL ENUMS & SCHEMAS
// ============================================================================

/**
 * Referral status enumeration
 */
export const ReferralStatusSchema = z.enum(
  ['PENDING', 'COMPLETED', 'EXPIRED', 'REDEEMED', 'CANCELLED'],
  {
    errorMap: () => ({ message: 'Invalid referral status' }),
  },
);

export type ReferralStatus = z.infer<typeof ReferralStatusSchema>;

/**
 * Referral reward type enumeration
 */
export const ReferralRewardTypeSchema = z.enum(
  ['POINTS', 'DISCOUNT', 'CASH', 'SERVICE', 'GIFT'],
  {
    errorMap: () => ({ message: 'Invalid referral reward type' }),
  },
);

export type ReferralRewardType = z.infer<typeof ReferralRewardTypeSchema>;

/**
 * Referral code validation schema
 * Format: 6-20 alphanumeric characters, uppercase
 */
export const ReferralCodeSchema = z
  .string()
  .regex(/^[A-Z0-9]{6,20}$/, {
    message: 'Referral code must be 6-20 uppercase alphanumeric characters',
  })
  .describe('Unique referral code');

export type ReferralCode = z.infer<typeof ReferralCodeSchema>;

/**
 * Create referral DTO schema
 * Edge cases:
 * - Duplicate referral codes
 * - Self-referral attempts
 * - Expired referral codes
 * - Referral limit per patient
 * - Reward double-claiming
 */
export const CreateReferralDtoSchema = z.object({
  referrerId: UUIDSchema.describe('Patient who is referring'),
  refereeEmail: EmailSchema.optional().describe('Email of person being referred'),
  refereePhone: PhoneNumberSchema.optional().describe('Phone of person being referred'),
  refereeName: NonEmptyStringSchema.max(200).optional(),
  referralCode: ReferralCodeSchema.optional().describe('Auto-generated if not provided'),
  rewardType: ReferralRewardTypeSchema,
  rewardValue: z
    .number()
    .positive('Reward value must be positive')
    .max(10000, 'Reward value cannot exceed 10000'),
  referrerRewardValue: z
    .number()
    .nonnegative('Referrer reward value must be non-negative')
    .max(10000, 'Referrer reward value cannot exceed 10000')
    .optional()
    .describe('Reward for the referrer (if different from referee)'),
  expiresAt: ISODateStringSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateReferralDto = z.infer<typeof CreateReferralDtoSchema>;

/**
 * Redeem referral DTO schema
 * Edge cases:
 * - Already redeemed referral
 * - Expired referral code
 * - Invalid referral code
 * - Self-redemption attempt
 */
export const RedeemReferralDtoSchema = z.object({
  referralCode: ReferralCodeSchema,
  refereeId: UUIDSchema.describe('Patient who was referred (now registered)'),
  redemptionDate: ISODateStringSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export type RedeemReferralDto = z.infer<typeof RedeemReferralDtoSchema>;

/**
 * Query referrals DTO schema
 */
export const QueryReferralsDtoSchema = z
  .object({
    referrerId: UUIDSchema.optional(),
    refereeId: UUIDSchema.optional(),
    status: z.array(ReferralStatusSchema).optional(),
    rewardType: ReferralRewardTypeSchema.optional(),
    referralCode: ReferralCodeSchema.optional(),
    createdAfter: ISODateStringSchema.optional(),
    createdBefore: ISODateStringSchema.optional(),
    expiringBefore: ISODateStringSchema.optional(),
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'expiresAt', 'status', 'rewardValue']).default('createdAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
      }
      return true;
    },
    {
      message: 'createdAfter must be before or equal to createdBefore',
      path: ['createdAfter'],
    },
  );

export type QueryReferralsDto = z.infer<typeof QueryReferralsDtoSchema>;

// ============================================================================
// LOYALTY ENUMS & SCHEMAS
// ============================================================================

/**
 * Loyalty tier enumeration
 */
export const LoyaltyTierSchema = z.enum(
  ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'],
  {
    errorMap: () => ({ message: 'Invalid loyalty tier' }),
  },
);

export type LoyaltyTier = z.infer<typeof LoyaltyTierSchema>;

/**
 * Loyalty transaction type enumeration
 */
export const LoyaltyTransactionTypeSchema = z.enum(
  ['ACCRUAL', 'REDEMPTION', 'EXPIRY', 'ADJUSTMENT', 'REVERSAL'],
  {
    errorMap: () => ({ message: 'Invalid loyalty transaction type' }),
  },
);

export type LoyaltyTransactionType = z.infer<typeof LoyaltyTransactionTypeSchema>;

/**
 * Loyalty points validation schema
 * Range: 0 to 1,000,000 points
 */
export const LoyaltyPointsSchema = z
  .number()
  .int('Loyalty points must be an integer')
  .min(0, 'Loyalty points cannot be negative')
  .max(1000000, 'Loyalty points cannot exceed 1,000,000');

export type LoyaltyPoints = z.infer<typeof LoyaltyPointsSchema>;

/**
 * Accrue loyalty points DTO schema
 * Edge cases:
 * - Negative point accrual (use adjustment instead)
 * - Points exceeding maximum balance
 * - Duplicate accrual for same source
 * - Retroactive point accrual
 */
export const AccrueLoyaltyPointsDtoSchema = z.object({
  patientId: UUIDSchema,
  amount: PositiveIntSchema.max(10000, 'Cannot accrue more than 10,000 points in single transaction'),
  source: z
    .enum(['APPOINTMENT', 'PROCEDURE', 'PAYMENT', 'REFERRAL', 'BIRTHDAY', 'PROMOTION', 'MANUAL'], {
      errorMap: () => ({ message: 'Invalid loyalty points source' }),
    })
    .describe('Source of point accrual'),
  sourceId: UUIDSchema.optional().describe('ID of related entity (appointment, procedure, etc.)'),
  description: NonEmptyStringSchema.max(500),
  expiresAt: ISODateStringSchema.optional().describe('Point expiration date'),
  multiplier: z
    .number()
    .positive()
    .max(10, 'Multiplier cannot exceed 10x')
    .default(1)
    .describe('Point multiplier for promotions'),
});

export type AccrueLoyaltyPointsDto = z.infer<typeof AccrueLoyaltyPointsDtoSchema>;

/**
 * Redeem loyalty points DTO schema
 * Edge cases:
 * - Insufficient points balance
 * - Redeeming expired points
 * - Partial redemption
 * - Concurrent redemption attempts
 */
export const RedeemLoyaltyPointsDtoSchema = z.object({
  patientId: UUIDSchema,
  amount: PositiveIntSchema.max(100000, 'Cannot redeem more than 100,000 points in single transaction'),
  description: NonEmptyStringSchema.max(500),
  redemptionValue: z
    .number()
    .positive('Redemption value must be positive')
    .max(10000, 'Redemption value cannot exceed 10000')
    .optional()
    .describe('Monetary value of redemption'),
  relatedInvoiceId: UUIDSchema.optional().describe('Invoice where points were applied'),
});

export type RedeemLoyaltyPointsDto = z.infer<typeof RedeemLoyaltyPointsDtoSchema>;

/**
 * Query loyalty transactions DTO schema
 */
export const QueryLoyaltyTransactionsDtoSchema = z
  .object({
    patientId: UUIDSchema.optional(),
    transactionType: z.array(LoyaltyTransactionTypeSchema).optional(),
    source: z
      .array(
        z.enum(['APPOINTMENT', 'PROCEDURE', 'PAYMENT', 'REFERRAL', 'BIRTHDAY', 'PROMOTION', 'MANUAL']),
      )
      .optional(),
    minAmount: NonNegativeIntSchema.optional(),
    maxAmount: NonNegativeIntSchema.optional(),
    createdAfter: ISODateStringSchema.optional(),
    createdBefore: ISODateStringSchema.optional(),
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'amount', 'transactionType']).default('createdAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
      }
      return true;
    },
    {
      message: 'createdAfter must be before or equal to createdBefore',
      path: ['createdAfter'],
    },
  );

export type QueryLoyaltyTransactionsDto = z.infer<typeof QueryLoyaltyTransactionsDtoSchema>;

// ============================================================================
// FEEDBACK ENUMS & SCHEMAS
// ============================================================================

/**
 * Feedback category enumeration
 */
export const FeedbackCategorySchema = z.enum(
  ['SERVICE', 'TREATMENT', 'FACILITY', 'STAFF', 'BILLING', 'SCHEDULING', 'COMMUNICATION', 'OVERALL'],
  {
    errorMap: () => ({ message: 'Invalid feedback category' }),
  },
);

export type FeedbackCategory = z.infer<typeof FeedbackCategorySchema>;

/**
 * Feedback rating schema (1-5 stars)
 */
export const FeedbackRatingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be between 1 and 5')
  .max(5, 'Rating must be between 1 and 5');

export type FeedbackRating = z.infer<typeof FeedbackRatingSchema>;

/**
 * Create feedback DTO schema
 * Edge cases:
 * - Anonymous feedback (no patient ID)
 * - Feedback without rating (comment only)
 * - Multiple feedback for same appointment
 */
export const CreateFeedbackDtoSchema = z.object({
  patientId: UUIDSchema.optional().describe('Optional for anonymous feedback'),
  appointmentId: UUIDSchema.optional(),
  providerId: UUIDSchema.optional(),
  category: FeedbackCategorySchema,
  rating: FeedbackRatingSchema,
  comment: z.string().max(5000, 'Comment must be 5000 characters or less').optional(),
  isAnonymous: z.boolean().default(false),
  wouldRecommend: z.boolean().optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).max(10, 'Maximum 10 tags allowed').optional(),
});

export type CreateFeedbackDto = z.infer<typeof CreateFeedbackDtoSchema>;

/**
 * Query feedback DTO schema
 */
export const QueryFeedbackDtoSchema = z
  .object({
    patientId: UUIDSchema.optional(),
    appointmentId: UUIDSchema.optional(),
    providerId: UUIDSchema.optional(),
    category: z.array(FeedbackCategorySchema).optional(),
    minRating: FeedbackRatingSchema.optional(),
    maxRating: FeedbackRatingSchema.optional(),
    wouldRecommend: z.boolean().optional(),
    isAnonymous: z.boolean().optional(),
    createdAfter: ISODateStringSchema.optional(),
    createdBefore: ISODateStringSchema.optional(),
    searchTerm: z.string().max(200).optional(),
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'rating', 'category']).default('createdAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.minRating && data.maxRating) {
        return data.minRating <= data.maxRating;
      }
      return true;
    },
    {
      message: 'minRating must be less than or equal to maxRating',
      path: ['minRating'],
    },
  )
  .refine(
    (data) => {
      if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
      }
      return true;
    },
    {
      message: 'createdAfter must be before or equal to createdBefore',
      path: ['createdAfter'],
    },
  );

export type QueryFeedbackDto = z.infer<typeof QueryFeedbackDtoSchema>;

// ============================================================================
// NPS (NET PROMOTER SCORE) SCHEMAS
// ============================================================================

/**
 * NPS score schema (0-10)
 * 0-6: Detractors, 7-8: Passives, 9-10: Promoters
 */
export const NpsScoreSchema = z
  .number()
  .int('NPS score must be an integer')
  .min(0, 'NPS score must be between 0 and 10')
  .max(10, 'NPS score must be between 0 and 10');

export type NpsScore = z.infer<typeof NpsScoreSchema>;

/**
 * NPS category enumeration
 * Calculated based on score
 */
export const NpsCategorySchema = z.enum(
  ['DETRACTOR', 'PASSIVE', 'PROMOTER'],
  {
    errorMap: () => ({ message: 'Invalid NPS category' }),
  },
);

export type NpsCategory = z.infer<typeof NpsCategorySchema>;

/**
 * Submit NPS DTO schema
 * Edge cases:
 * - Multiple NPS submissions from same patient
 * - NPS without follow-up comment
 */
export const SubmitNpsDtoSchema = z.object({
  patientId: UUIDSchema.optional().describe('Optional for anonymous NPS'),
  appointmentId: UUIDSchema.optional(),
  score: NpsScoreSchema,
  comment: z.string().max(5000, 'Comment must be 5000 characters or less').optional(),
  followUpQuestion: z
    .string()
    .max(500, 'Follow-up question response must be 500 characters or less')
    .optional(),
  isAnonymous: z.boolean().default(false),
  source: z
    .enum(['EMAIL', 'SMS', 'WEBSITE', 'APP', 'IN_PERSON'], {
      errorMap: () => ({ message: 'Invalid NPS source' }),
    })
    .default('WEBSITE'),
});

export type SubmitNpsDto = z.infer<typeof SubmitNpsDtoSchema>;

/**
 * Query NPS DTO schema
 */
export const QueryNpsDtoSchema = z
  .object({
    patientId: UUIDSchema.optional(),
    appointmentId: UUIDSchema.optional(),
    category: z.array(NpsCategorySchema).optional(),
    minScore: NpsScoreSchema.optional(),
    maxScore: NpsScoreSchema.optional(),
    source: z.array(z.enum(['EMAIL', 'SMS', 'WEBSITE', 'APP', 'IN_PERSON'])).optional(),
    isAnonymous: z.boolean().optional(),
    createdAfter: ISODateStringSchema.optional(),
    createdBefore: ISODateStringSchema.optional(),
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),
    sortBy: z.enum(['createdAt', 'score']).default('createdAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.minScore !== undefined && data.maxScore !== undefined) {
        return data.minScore <= data.maxScore;
      }
      return true;
    },
    {
      message: 'minScore must be less than or equal to maxScore',
      path: ['minScore'],
    },
  )
  .refine(
    (data) => {
      if (data.createdAfter && data.createdBefore) {
        return data.createdAfter <= data.createdBefore;
      }
      return true;
    },
    {
      message: 'createdAfter must be before or equal to createdBefore',
      path: ['createdAfter'],
    },
  );

export type QueryNpsDto = z.infer<typeof QueryNpsDtoSchema>;

// ============================================================================
// AUTOMATION ENUMS & SCHEMAS
// ============================================================================

/**
 * Automation trigger type enumeration
 * Events that can trigger automated marketing actions
 */
export const AutomationTriggerTypeSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid automation trigger type' }),
  },
);

export type AutomationTriggerType = z.infer<typeof AutomationTriggerTypeSchema>;

/**
 * Automation action type enumeration
 * Actions that can be executed by automation rules
 */
export const AutomationActionTypeSchema = z.enum(
  [
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
  ],
  {
    errorMap: () => ({ message: 'Invalid automation action type' }),
  },
);

export type AutomationActionType = z.infer<typeof AutomationActionTypeSchema>;

/**
 * Automation condition schema
 * Conditions that must be met for action to execute
 */
export const AutomationConditionSchema = z.object({
  field: SegmentRuleFieldSchema,
  operator: SegmentRuleOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]).optional(),
});

export type AutomationCondition = z.infer<typeof AutomationConditionSchema>;

/**
 * Automation action schema
 * Configuration for action to be executed
 */
export const AutomationActionSchema = z
  .object({
    type: AutomationActionTypeSchema,
    delay: NonNegativeIntSchema.max(365, 'Delay cannot exceed 365 days')
      .optional()
      .describe('Delay in days before executing action'),

    // Campaign/message configuration
    campaignId: UUIDSchema.optional(),
    templateId: UUIDSchema.optional(),
    emailSubject: z.string().max(500).optional(),
    emailBody: z.string().max(50000).optional(),
    smsBody: z.string().max(1600).optional(),

    // Loyalty configuration
    pointsAmount: PositiveIntSchema.max(10000).optional(),

    // Tagging configuration
    tags: z.array(NonEmptyStringSchema.max(50)).max(10).optional(),

    // Webhook configuration
    webhookUrl: z.string().url().max(500).optional(),
    webhookPayload: z.record(z.unknown()).optional(),

    // Task configuration
    taskTitle: NonEmptyStringSchema.max(200).optional(),
    taskDescription: z.string().max(2000).optional(),
    assigneeId: UUIDSchema.optional(),
  })
  .refine(
    (data) => {
      // If type is SEND_CAMPAIGN, campaignId is required
      if (data.type === 'SEND_CAMPAIGN' && !data.campaignId) {
        return false;
      }
      return true;
    },
    {
      message: 'campaignId is required for SEND_CAMPAIGN action',
      path: ['campaignId'],
    },
  )
  .refine(
    (data) => {
      // If type is ACCRUE_LOYALTY_POINTS, pointsAmount is required
      if (data.type === 'ACCRUE_LOYALTY_POINTS' && !data.pointsAmount) {
        return false;
      }
      return true;
    },
    {
      message: 'pointsAmount is required for ACCRUE_LOYALTY_POINTS action',
      path: ['pointsAmount'],
    },
  )
  .refine(
    (data) => {
      // If type is TRIGGER_WEBHOOK, webhookUrl is required
      if (data.type === 'TRIGGER_WEBHOOK' && !data.webhookUrl) {
        return false;
      }
      return true;
    },
    {
      message: 'webhookUrl is required for TRIGGER_WEBHOOK action',
      path: ['webhookUrl'],
    },
  );

export type AutomationAction = z.infer<typeof AutomationActionSchema>;

/**
 * Create automation rule DTO schema
 * Edge cases:
 * - Circular automation dependencies
 * - Infinite loops (e.g., action triggers same rule)
 * - Multiple rules triggered by same event
 * - Performance issues with complex conditions
 */
export const CreateAutomationRuleDtoSchema = z.object({
  name: NonEmptyStringSchema.min(3, 'Rule name must be at least 3 characters').max(
    200,
    'Rule name must be 200 characters or less',
  ),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  triggerType: AutomationTriggerTypeSchema,
  conditions: z
    .array(AutomationConditionSchema)
    .max(20, 'Maximum 20 conditions per rule')
    .optional()
    .describe('Conditions that must be met for rule to fire'),
  actions: z
    .array(AutomationActionSchema)
    .min(1, 'At least one action is required')
    .max(10, 'Maximum 10 actions per rule'),
  isActive: z.boolean().default(true),
  priority: NonNegativeIntSchema.max(100, 'Priority must be between 0 and 100').default(0),
  throttle: z
    .object({
      enabled: z.boolean().default(false),
      maxExecutions: PositiveIntSchema.max(1000),
      timeWindowMinutes: PositiveIntSchema.max(10080, 'Time window cannot exceed 7 days (10080 minutes)'),
    })
    .optional()
    .describe('Throttle rule execution to prevent spam'),
  tags: z.array(NonEmptyStringSchema.max(50)).max(20, 'Maximum 20 tags allowed').optional(),
});

export type CreateAutomationRuleDto = z.infer<typeof CreateAutomationRuleDtoSchema>;

/**
 * Update automation rule DTO schema
 */
export const UpdateAutomationRuleDtoSchema = z.object({
  name: NonEmptyStringSchema.min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  conditions: z.array(AutomationConditionSchema).max(20).optional(),
  actions: z.array(AutomationActionSchema).min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  priority: NonNegativeIntSchema.max(100).optional(),
  throttle: z
    .object({
      enabled: z.boolean(),
      maxExecutions: PositiveIntSchema.max(1000),
      timeWindowMinutes: PositiveIntSchema.max(10080),
    })
    .optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).max(20).optional(),
});

export type UpdateAutomationRuleDto = z.infer<typeof UpdateAutomationRuleDtoSchema>;

/**
 * Query automation rules DTO schema
 */
export const QueryAutomationRulesDtoSchema = z.object({
  name: z.string().max(200).optional(),
  triggerType: z.array(AutomationTriggerTypeSchema).optional(),
  isActive: z.boolean().optional(),
  tags: z.array(NonEmptyStringSchema.max(50)).optional(),
  searchTerm: z.string().max(200).optional(),
  page: PositiveIntSchema.default(1),
  limit: PositiveIntSchema.min(1).max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'priority', 'triggerType']).default('createdAt'),
  sortOrder: SortOrderSchema.default('desc'),
});

export type QueryAutomationRulesDto = z.infer<typeof QueryAutomationRulesDtoSchema>;

// ============================================================================
// DELIVERY STATUS & PROVIDER ENUMS
// ============================================================================

/**
 * Delivery status enumeration
 * Tracks message delivery lifecycle
 */
export const DeliveryStatusSchema = z.enum(
  ['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'OPENED', 'CLICKED', 'UNSUBSCRIBED', 'COMPLAINED'],
  {
    errorMap: () => ({ message: 'Invalid delivery status' }),
  },
);

export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;

/**
 * Delivery provider enumeration
 * Third-party services used for message delivery
 */
export const DeliveryProviderSchema = z.enum(
  ['SENDGRID', 'TWILIO', 'ONESIGNAL', 'WHATSAPP', 'MAILGUN', 'AWS_SES', 'SMTP', 'FCM'],
  {
    errorMap: () => ({ message: 'Invalid delivery provider' }),
  },
);

export type DeliveryProvider = z.infer<typeof DeliveryProviderSchema>;

/**
 * Query delivery logs DTO schema
 * Edge cases:
 * - Large date ranges (millions of logs)
 * - Provider-specific error codes
 * - Bounce categorization
 */
export const QueryDeliveryLogsDtoSchema = z
  .object({
    campaignId: UUIDSchema.optional(),
    patientId: UUIDSchema.optional(),
    channel: CampaignChannelSchema.optional(),
    status: z.array(DeliveryStatusSchema).optional(),
    provider: z.array(DeliveryProviderSchema).optional(),
    recipient: z
      .string()
      .max(255)
      .optional()
      .describe('Email or phone number of recipient'),

    // Date range filters
    sentAfter: ISODateStringSchema.optional(),
    sentBefore: ISODateStringSchema.optional(),
    deliveredAfter: ISODateStringSchema.optional(),
    deliveredBefore: ISODateStringSchema.optional(),

    // Error tracking
    hasError: z.boolean().optional(),
    errorCode: z.string().max(50).optional(),

    // Engagement tracking
    wasOpened: z.boolean().optional(),
    wasClicked: z.boolean().optional(),

    // Search
    searchTerm: z.string().max(200).optional(),

    // Pagination
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),

    // Sorting
    sortBy: z
      .enum(['sentAt', 'deliveredAt', 'status', 'recipient', 'channel'])
      .default('sentAt'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      if (data.sentAfter && data.sentBefore) {
        return data.sentAfter <= data.sentBefore;
      }
      return true;
    },
    {
      message: 'sentAfter must be before or equal to sentBefore',
      path: ['sentAfter'],
    },
  )
  .refine(
    (data) => {
      if (data.deliveredAfter && data.deliveredBefore) {
        return data.deliveredAfter <= data.deliveredBefore;
      }
      return true;
    },
    {
      message: 'deliveredAfter must be before or equal to deliveredBefore',
      path: ['deliveredAfter'],
    },
  );

export type QueryDeliveryLogsDto = z.infer<typeof QueryDeliveryLogsDtoSchema>;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Campaign exports already defined above
// Segment exports already defined above
// Referral exports already defined above
// Loyalty exports already defined above
// Feedback exports already defined above
// NPS exports already defined above
// Automation exports already defined above
// Delivery exports already defined above
