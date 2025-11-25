/**
 * Clinical Module Permissions
 * Covers: diagnoses, treatments, charts, prescriptions, imaging, medical records
 *
 * DESIGN PRINCIPLES:
 * - Fine-grained clinical permissions for HIPAA compliance
 * - Clear separation between diagnostic and treatment permissions
 * - Audit-trail requirements for sensitive operations
 */

/**
 * Clinical care and electronic health record permissions
 */
export const CLINICAL_PERMISSIONS = {
  DIAGNOSIS: {
    /**
     * Create new patient diagnoses
     * Grants: Record diagnosis codes and clinical findings
     * Used by: doctor only (clinical decision-making)
     */
    CREATE: 'clinical.diagnosis.create',

    /**
     * View patient diagnoses
     * Grants: Read diagnosis history and details
     * Used by: doctor, assistant (supporting care)
     */
    READ: 'clinical.diagnosis.read',

    /**
     * Update existing diagnoses
     * Grants: Modify diagnosis codes or notes
     * Used by: doctor only (clinical authority)
     */
    UPDATE: 'clinical.diagnosis.update',

    /**
     * View patient diagnosis history
     * Grants: Access to diagnosis lists and timelines
     * Used by: doctor, assistant
     */
    LIST: 'clinical.diagnosis.list',
  },

  TREATMENT: {
    /**
     * Create treatment plans
     * Grants: Design treatment plans with procedures and timeline
     * Used by: doctor only
     */
    CREATE: 'clinical.treatment.create',

    /**
     * View treatment plan details
     * Grants: Read treatment plan stages and procedures
     * Used by: doctor, assistant, receptionist (for scheduling)
     */
    READ: 'clinical.treatment.read',

    /**
     * Update treatment plans
     * Grants: Modify treatment stages, mark procedures complete
     * Used by: doctor only
     */
    UPDATE: 'clinical.treatment.update',

    /**
     * View all treatment plans
     * Grants: List of patient treatment plans
     * Used by: doctor, assistant
     */
    LIST: 'clinical.treatment.list',

    /**
     * Approve treatment plans
     * Grants: Mark treatment plan as approved for execution
     * Used by: doctor only (final authorization)
     */
    APPROVE: 'clinical.treatment.approve',
  },

  CHART: {
    /**
     * View complete patient clinical chart
     * Grants: Access to full EHR including history, notes, vitals
     * Used by: doctor, assistant, receptionist (limited demographics)
     */
    READ: 'clinical.chart.read',

    /**
     * Update patient charting and clinical notes
     * Grants: Add progress notes, update vitals, modify chart sections
     * Used by: doctor, assistant (limited sections)
     */
    UPDATE: 'clinical.chart.update',
  },

  PRESCRIPTION: {
    /**
     * Create prescriptions
     * Grants: Prescribe medications and controlled substances
     * Used by: doctor only (requires DEA license validation)
     */
    CREATE: 'clinical.prescription.create',

    /**
     * View prescription history
     * Grants: Read patient medication records
     * Used by: doctor, assistant
     */
    READ: 'clinical.prescription.read',

    /**
     * Cancel or modify prescriptions
     * Grants: Revoke or amend prescriptions
     * Used by: doctor only
     */
    UPDATE: 'clinical.prescription.update',
  },

  IMAGING: {
    /**
     * Upload clinical imaging
     * Grants: Upload X-rays, photos, CBCT scans
     * Used by: doctor, assistant
     */
    UPLOAD: 'clinical.imaging.upload',

    /**
     * View patient imaging
     * Grants: Access to radiographs and clinical photos
     * Used by: doctor, assistant
     */
    READ: 'clinical.imaging.read',

    /**
     * Delete imaging files
     * Grants: Remove images from patient record
     * Used by: doctor only (permanent deletion restricted)
     */
    DELETE: 'clinical.imaging.delete',
  },

  RECORDS: {
    /**
     * Export patient clinical records
     * Grants: Generate patient record exports (PDF, CCDA)
     * Used by: doctor, tenant_admin (GDPR/data portability compliance)
     */
    EXPORT: 'clinical.records.export',
  },
} as const;

/**
 * Flatten clinical permissions into array for validation and iteration
 */
export const CLINICAL_PERMISSION_LIST = Object.values(CLINICAL_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const CLINICAL_PERMISSION_COUNT = CLINICAL_PERMISSION_LIST.length;
