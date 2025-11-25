/**
 * Marketing Module Permissions
 * Covers: campaigns, patient segments, automation, analytics
 *
 * DESIGN PRINCIPLES:
 * - Patient privacy and consent management
 * - Campaign approval workflows
 * - Performance tracking and ROI measurement
 */

/**
 * Patient engagement and campaign management permissions
 */
export const MARKETING_PERMISSIONS = {
  CAMPAIGN: {
    /**
     * Create marketing campaigns
     * Grants: Design email, SMS, or mail campaigns
     * Used by: tenant_admin, marketing staff
     */
    CREATE: 'marketing.campaign.create',

    /**
     * View campaign details
     * Grants: Read campaign configuration and content
     * Used by: tenant_admin, clinic_manager
     */
    READ: 'marketing.campaign.read',

    /**
     * Modify campaigns
     * Grants: Edit campaign settings and content
     * Used by: tenant_admin
     */
    UPDATE: 'marketing.campaign.update',

    /**
     * View campaign list
     * Grants: Access to campaign history
     * Used by: tenant_admin, clinic_manager
     */
    LIST: 'marketing.campaign.list',

    /**
     * Launch campaigns
     * Grants: Execute campaign sends
     * Used by: tenant_admin only (requires review)
     */
    LAUNCH: 'marketing.campaign.launch',
  },

  SEGMENT: {
    /**
     * Manage patient segments
     * Grants: Create targeting rules and audience segments
     * Used by: tenant_admin
     */
    MANAGE: 'marketing.segment.manage',
  },

  AUTOMATION: {
    /**
     * Manage marketing automation
     * Grants: Configure automated workflows and triggers
     * Used by: tenant_admin
     */
    MANAGE: 'marketing.automation.manage',
  },

  ANALYTICS: {
    /**
     * View marketing analytics
     * Grants: Campaign performance metrics and ROI
     * Used by: tenant_admin, clinic_manager
     */
    VIEW: 'marketing.analytics.view',
  },
} as const;

/**
 * Flatten marketing permissions into array for validation and iteration
 */
export const MARKETING_PERMISSION_LIST = Object.values(MARKETING_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const MARKETING_PERMISSION_COUNT = MARKETING_PERMISSION_LIST.length;
