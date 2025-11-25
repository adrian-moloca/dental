/**
 * Analytics Module Permissions
 * Covers: dashboards, reports, data queries, business intelligence
 *
 * DESIGN PRINCIPLES:
 * - Data access controls for sensitive metrics
 * - Export capabilities for decision-makers
 * - Custom query access restricted to trained users
 */

/**
 * Reporting and business intelligence permissions
 */
export const ANALYTICS_PERMISSIONS = {
  DASHBOARD: {
    /**
     * View analytics dashboards
     * Grants: Access to pre-built KPI dashboards
     * Used by: clinic_manager, tenant_admin
     */
    VIEW: 'analytics.dashboard.view',
  },

  REPORTS: {
    /**
     * View standard reports
     * Grants: Access to report library
     * Used by: clinic_manager, billing_specialist, tenant_admin
     */
    VIEW: 'analytics.reports.view',

    /**
     * Export reports
     * Grants: Download reports as CSV, Excel, or PDF
     * Used by: tenant_admin, clinic_manager
     */
    EXPORT: 'analytics.reports.export',
  },

  DATA: {
    /**
     * Run custom data queries
     * Grants: Ad-hoc querying and custom report building
     * Used by: tenant_admin only (requires data literacy)
     */
    QUERY: 'analytics.data.query',
  },
} as const;

/**
 * Flatten analytics permissions into array for validation and iteration
 */
export const ANALYTICS_PERMISSION_LIST = Object.values(ANALYTICS_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const ANALYTICS_PERMISSION_COUNT = ANALYTICS_PERMISSION_LIST.length;
