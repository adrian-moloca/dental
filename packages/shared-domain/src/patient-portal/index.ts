/**
 * Patient Portal Domain Types Module
 *
 * Barrel export for patient-facing DTOs and types.
 *
 * @module shared-domain/patient-portal
 */

// Re-export all types from patient-portal.types.ts
export type {
  // Branded types
  PatientPortalUserId,
  PatientAppointmentId,
  PatientInvoiceId,
  PatientReferralCode,
  PatientImagingStudyId,
  PatientTreatmentPlanId,
  PatientPaymentId,

  // Auth types
  PatientLoginRequest,
  PatientLoginResponse,
  PatientRegisterRequest,
  PatientMfaChallenge,
  PatientMfaVerification,
  PatientProfile,

  // Profile types
  PatientProfileSummary,
  PatientContactInfo,
  PatientAddress,
  PatientCommunicationPreferences,
  PatientNotificationPreferences,

  // Appointment types
  PatientAppointment,
  PatientAppointmentBooking,
  PatientAppointmentReschedule,
  PatientAppointmentCancellation,

  // Clinical types
  PatientClinicalSummary,
  PatientVisit,
  PatientVisitAttachment,
  PatientTreatmentPlan,
  PatientTreatmentPlanProcedure,
  PatientPaymentPlanOption,
  PatientProcedure,
  PatientCondition,
  PatientAllergy,

  // Imaging types
  PatientImagingStudy,

  // Billing types
  PatientInvoice,
  PatientInvoiceItem,
  PatientPayment,
  PatientBalance,
  PatientActivePaymentPlan,
  PatientPaymentRequest,

  // Engagement types
  PatientLoyaltyAccount,
  PatientLoyaltyTransaction,
  PatientReferral,
  PatientPendingReferral,
  PatientCompletedReferral,
  PatientOffer,
  PatientFeedbackRequest,
  PatientNpsRequest,

  // GDPR types
  PatientDataExport,
  PatientDeletionRequest,
  PatientConsent,

  // Error types
  PatientErrorResponse,

  // Pagination/filter types
  PatientPaginatedResponse,
  PatientDateRange,
  PatientAppointmentFilter,
  PatientInvoiceFilter,
  PatientSortCriteria,
} from './patient-portal.types';

// Re-export all enums
export {
  PatientMfaMethod,
  PatientAppointmentStatus,
  PatientTreatmentPlanStatus,
  PatientImagingType,
  PatientInvoiceStatus,
  PatientLoyaltyTier,
  PatientReferralStatus,
  PatientDataExportStatus,
  PatientDeletionStatus,
  PatientConsentType,
  PatientErrorCode,
  PatientSortOrder,
  PatientConditionStatus,
  PatientAllergySeverity,
} from './patient-portal.types';
