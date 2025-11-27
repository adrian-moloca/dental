/**
 * Medical Records Retention Policy Configuration
 *
 * Romanian law requires clinical/medical records to be retained for 10 years.
 * This module enforces these requirements and prevents premature deletion.
 *
 * Legal References:
 * - Romanian Law 46/2003 (Patient Rights)
 * - Order of Ministry of Health 1782/2006 (Medical Records)
 * - GDPR Article 17(3)(c) - Exception for legal obligations
 */

export interface RetentionPolicyConfig {
  /**
   * Retention period in years
   * Romanian law: 10 years from last activity
   */
  retentionYears: number;

  /**
   * Record types covered by this policy
   */
  recordTypes: RecordType[];

  /**
   * Actions to take when retention expires
   */
  expiryAction: RetentionExpiryAction;

  /**
   * Grace period before final action (days)
   */
  gracePeriodDays: number;

  /**
   * Notification settings
   */
  notifications: {
    /**
     * Days before expiry to send notification
     */
    notifyDaysBefore: number[];

    /**
     * Roles to notify
     */
    notifyRoles: string[];
  };
}

export type RecordType =
  | 'clinical_note'
  | 'treatment_plan'
  | 'consent_form'
  | 'odontogram'
  | 'perio_chart'
  | 'procedure'
  | 'prescription'
  | 'imaging_study'
  | 'lab_result';

export type RetentionExpiryAction =
  | 'archive' // Move to cold storage
  | 'anonymize' // Remove PII, keep for statistics
  | 'flag_for_review' // Manual review before deletion
  | 'auto_delete'; // Automatic deletion (not recommended for medical)

/**
 * Romanian medical records retention policy
 */
export const ROMANIAN_RETENTION_POLICY: RetentionPolicyConfig = {
  retentionYears: 10,
  recordTypes: [
    'clinical_note',
    'treatment_plan',
    'consent_form',
    'odontogram',
    'perio_chart',
    'procedure',
    'prescription',
    'imaging_study',
    'lab_result',
  ],
  expiryAction: 'archive', // Archive to cold storage, never delete
  gracePeriodDays: 90, // 90 days grace period before archival
  notifications: {
    notifyDaysBefore: [365, 180, 90, 30], // 1 year, 6 months, 3 months, 1 month
    notifyRoles: ['clinic_admin', 'data_protection_officer'],
  },
};

/**
 * Default retention policies by country
 */
export const RETENTION_POLICIES_BY_COUNTRY: Record<string, RetentionPolicyConfig> = {
  RO: ROMANIAN_RETENTION_POLICY,
  // Add other countries as needed
  DEFAULT: {
    retentionYears: 7,
    recordTypes: [
      'clinical_note',
      'treatment_plan',
      'consent_form',
      'odontogram',
      'perio_chart',
      'procedure',
    ],
    expiryAction: 'flag_for_review',
    gracePeriodDays: 60,
    notifications: {
      notifyDaysBefore: [180, 90, 30],
      notifyRoles: ['clinic_admin'],
    },
  },
};

/**
 * Get retention policy for a country
 */
export function getRetentionPolicy(countryCode: string): RetentionPolicyConfig {
  return (
    RETENTION_POLICIES_BY_COUNTRY[countryCode.toUpperCase()] ||
    RETENTION_POLICIES_BY_COUNTRY.DEFAULT
  );
}

/**
 * Calculate retention expiry date
 */
export function calculateRetentionExpiry(
  lastActivityDate: Date,
  policy: RetentionPolicyConfig,
): Date {
  const expiry = new Date(lastActivityDate);
  expiry.setFullYear(expiry.getFullYear() + policy.retentionYears);
  return expiry;
}

/**
 * Check if a record is within retention period
 */
export function isWithinRetentionPeriod(
  lastActivityDate: Date,
  policy: RetentionPolicyConfig,
): boolean {
  const expiry = calculateRetentionExpiry(lastActivityDate, policy);
  return new Date() < expiry;
}

/**
 * Get days until retention expiry
 */
export function getDaysUntilRetentionExpiry(
  lastActivityDate: Date,
  policy: RetentionPolicyConfig,
): number {
  const expiry = calculateRetentionExpiry(lastActivityDate, policy);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
