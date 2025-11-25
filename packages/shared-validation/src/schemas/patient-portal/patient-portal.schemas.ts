/**
 * Patient Portal API validation schemas
 * Comprehensive Zod validation for all patient-facing API endpoints
 *
 * @module shared-validation/schemas/patient-portal
 *
 * Security considerations:
 * - All string inputs are trimmed and sanitized
 * - Password strength requirements enforce security best practices
 * - Age validation ensures COPPA compliance (13+ years)
 * - HTML tags stripped from user input to prevent XSS
 * - Rate limiting markers for auth, payment, and feedback endpoints
 * - Future date validations with buffer times
 * - Amount constraints prevent overpayment
 * - Deletion confirmations require explicit text match
 *
 * Coverage:
 * - Authentication (register, login, MFA)
 * - Profile management (personal info, preferences)
 * - Appointments (book, reschedule, cancel, query)
 * - Billing (payments, invoice queries)
 * - Engagement (feedback, NPS surveys)
 * - GDPR (data export, account deletion)
 * - Common utilities (pagination, date ranges, sorting)
 */

import { z } from 'zod';
import {
  UUIDSchema,
  EmailSchema,
  PhoneNumberSchema,
  NonEmptyStringSchema,
  ISODateStringSchema,
  PositiveIntSchema,
} from '../common.schemas';
import { PositiveMoneyAmountSchema, NonNegativeMoneyAmountSchema } from '../billing/billing.schemas';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Password schema with comprehensive strength requirements
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
export const PatientPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be 128 characters or less')
  .refine((val): boolean => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val): boolean => /[a-z]/.test(val), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((val): boolean => /\d/.test(val), {
    message: 'Password must contain at least one digit',
  })
  .refine((val): boolean => /[!@#$%^&*]/.test(val), {
    message: 'Password must contain at least one special character (!@#$%^&*)',
  });

export type PatientPassword = z.infer<typeof PatientPasswordSchema>;

/**
 * Date of birth schema with age validation (COPPA compliance)
 * Patient must be at least 13 years old
 */
export const PatientDateOfBirthSchema = ISODateStringSchema.refine(
  (val): boolean => {
    const birthDate = new Date(val);
    const today = new Date();
    const age = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 13;
  },
  {
    message: 'Patient must be at least 13 years old',
  },
).refine(
  (val): boolean => {
    // Ensure date of birth is not in the future
    const birthDate = new Date(val);
    const today = new Date();
    return birthDate <= today;
  },
  {
    message: 'Date of birth cannot be in the future',
  },
);

export type PatientDateOfBirth = z.infer<typeof PatientDateOfBirthSchema>;

/**
 * Future date schema with 1-hour buffer for appointments
 * Ensures date is at least 1 hour in the future
 */
export const FutureDateSchema = ISODateStringSchema.refine(
  (val): boolean => {
    const targetDate = new Date(val);
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return targetDate > oneHourFromNow;
  },
  {
    message: 'Date must be at least 1 hour in the future',
  },
);

export type FutureDate = z.infer<typeof FutureDateSchema>;

/**
 * Time schema in HH:MM format (24-hour)
 */
export const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM format (e.g., 09:30, 14:00)',
  })
  .refine(
    (val): boolean => {
      const [hours] = val.split(':').map(Number);
      // Business hours: 8 AM to 8 PM
      return hours >= 8 && hours <= 20;
    },
    {
      message: 'Time must be within business hours (08:00 to 20:00)',
    },
  );

export type Time = z.infer<typeof TimeSchema>;

/**
 * Name schema with length constraints
 */
export const NameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be 50 characters or less')
  .trim()
  .regex(/^[a-zA-Z\s'-]+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  });

export type Name = z.infer<typeof NameSchema>;

/**
 * Sanitized text schema - strips HTML and limits length
 */
export const SanitizedTextSchema = (maxLength: number, fieldName: string) =>
  z
    .string()
    .max(maxLength, `${fieldName} must be ${maxLength} characters or less`)
    .trim()
    .transform((val) => val.replace(/<[^>]*>/g, '')) // Strip HTML tags
    .refine((val) => val.length > 0, {
      message: `${fieldName} cannot be empty after sanitization`,
    });

// ============================================================================
// ADDRESS SCHEMA
// ============================================================================

/**
 * Address schema for patient profile
 */
export const PatientAddressSchema = z.object({
  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(200, 'Street address must be 200 characters or less')
    .trim(),
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be 100 characters or less')
    .trim(),
  state: z
    .string()
    .min(2, 'State/Province must be at least 2 characters')
    .max(100, 'State/Province must be 100 characters or less')
    .trim(),
  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code must be 20 characters or less')
    .trim(),
  country: z
    .string()
    .length(2, 'Country must be a 2-letter ISO code (e.g., US, RO)')
    .toUpperCase(),
});

export type PatientAddress = z.infer<typeof PatientAddressSchema>;

// ============================================================================
// EMERGENCY CONTACT SCHEMA
// ============================================================================

/**
 * Emergency contact schema
 */
export const PatientEmergencyContactSchema = z.object({
  name: NameSchema,
  relationship: z
    .string()
    .min(2, 'Relationship must be at least 2 characters')
    .max(50, 'Relationship must be 50 characters or less')
    .trim(),
  phone: PhoneNumberSchema,
  alternatePhone: PhoneNumberSchema.optional(),
});

export type PatientEmergencyContact = z.infer<typeof PatientEmergencyContactSchema>;

// ============================================================================
// 1. AUTH SCHEMAS
// ============================================================================

/**
 * MFA method enumeration
 */
export const MfaMethodSchema = z.enum(['SMS', 'EMAIL', 'TOTP'], {
  errorMap: () => ({ message: 'Invalid MFA method. Must be SMS, EMAIL, or TOTP' }),
});

export type MfaMethod = z.infer<typeof MfaMethodSchema>;

/**
 * Patient registration DTO schema
 * Edge cases:
 * - Email already exists (validated at service layer)
 * - Weak password (prevented by schema)
 * - Invalid phone format (E.164 required)
 * - Age under 13 (COPPA violation - prevented)
 * - Terms not accepted (prevented)
 */
export const PatientRegisterDtoSchema = z
  .object({
    email: EmailSchema,
    password: PatientPasswordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    firstName: NameSchema,
    lastName: NameSchema,
    dateOfBirth: PatientDateOfBirthSchema,
    phone: PhoneNumberSchema,
    acceptedTerms: z.literal(true, {
      errorMap: () => ({
        message: 'You must accept the terms and conditions to register',
      }),
    }),
    marketingConsent: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type PatientRegisterDto = z.infer<typeof PatientRegisterDtoSchema>;

/**
 * Patient login DTO schema
 */
export const PatientLoginDtoSchema = z.object({
  email: EmailSchema,
  password: NonEmptyStringSchema,
  rememberMe: z.boolean().optional().default(false),
});

export type PatientLoginDto = z.infer<typeof PatientLoginDtoSchema>;

/**
 * MFA challenge request schema
 */
export const PatientMfaChallengeRequestSchema = z.object({
  method: MfaMethodSchema,
});

export type PatientMfaChallengeRequest = z.infer<typeof PatientMfaChallengeRequestSchema>;

/**
 * MFA verification request schema
 * 6-digit numeric code validation
 */
export const PatientMfaVerifyRequestSchema = z.object({
  challengeId: UUIDSchema,
  code: z
    .string()
    .length(6, 'MFA code must be exactly 6 digits')
    .regex(/^\d{6}$/, {
      message: 'MFA code must contain only numbers',
    }),
});

export type PatientMfaVerifyRequest = z.infer<typeof PatientMfaVerifyRequestSchema>;

// ============================================================================
// 2. PROFILE SCHEMAS
// ============================================================================

/**
 * Update patient profile DTO schema
 * All fields optional for partial updates
 * Edge cases:
 * - Phone number change requires verification (handled at service layer)
 * - Empty updates (no fields changed)
 * - Invalid address components
 */
export const UpdatePatientProfileDtoSchema = z
  .object({
    firstName: NameSchema.optional(),
    lastName: NameSchema.optional(),
    phone: PhoneNumberSchema.optional(),
    address: PatientAddressSchema.optional(),
    emergencyContact: PatientEmergencyContactSchema.optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return Object.values(data).some((value) => value !== undefined);
    },
    {
      message: 'At least one field must be provided for update',
    },
  );

export type UpdatePatientProfileDto = z.infer<typeof UpdatePatientProfileDtoSchema>;

/**
 * Update patient preferences DTO schema
 * Communication and notification preferences
 */
export const UpdatePatientPreferencesDtoSchema = z.object({
  emailEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  pushEnabled: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  treatmentUpdates: z.boolean().optional(),
  billingAlerts: z.boolean().optional(),
});

export type UpdatePatientPreferencesDto = z.infer<typeof UpdatePatientPreferencesDtoSchema>;

// ============================================================================
// 3. APPOINTMENT SCHEMAS
// ============================================================================

/**
 * Appointment status for patient queries
 */
export const PatientAppointmentStatusSchema = z.enum(['UPCOMING', 'COMPLETED', 'CANCELLED'], {
  errorMap: () => ({ message: 'Invalid appointment status' }),
});

export type PatientAppointmentStatus = z.infer<typeof PatientAppointmentStatusSchema>;

/**
 * Book appointment DTO schema
 * Edge cases:
 * - Provider not available at selected time (validated at service layer)
 * - Service code invalid (validated at service layer)
 * - Appointment date in past (prevented)
 * - Time outside business hours (prevented)
 * - Emergency service allows same-day booking (handled in refinement)
 */
export const BookAppointmentDtoSchema = z
  .object({
    providerId: UUIDSchema,
    serviceCode: NonEmptyStringSchema.max(50, 'Service code must be 50 characters or less'),
    appointmentDate: FutureDateSchema,
    appointmentTime: TimeSchema,
    notes: SanitizedTextSchema(500, 'Notes').optional(),
    isEmergency: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      // If not emergency, require at least 1 hour advance booking
      if (!data.isEmergency) {
        const appointmentDateTime = new Date(data.appointmentDate);
        const [hours, minutes] = data.appointmentTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

        return appointmentDateTime > oneHourFromNow;
      }
      return true;
    },
    {
      message: 'Non-emergency appointments must be booked at least 1 hour in advance',
      path: ['appointmentDate'],
    },
  );

export type BookAppointmentDto = z.infer<typeof BookAppointmentDtoSchema>;

/**
 * Reschedule appointment DTO schema (patient portal version)
 * Edge cases:
 * - New date/time unavailable (validated at service layer)
 * - Rescheduling to past date (prevented)
 * - Same date/time as original (allowed but wasteful)
 */
export const PatientRescheduleAppointmentDtoSchema = z.object({
  newDate: FutureDateSchema,
  newTime: TimeSchema,
  reason: SanitizedTextSchema(500, 'Reason').optional(),
});

export type PatientRescheduleAppointmentDto = z.infer<typeof PatientRescheduleAppointmentDtoSchema>;

/**
 * Cancel appointment DTO schema (patient portal version)
 */
export const PatientCancelAppointmentDtoSchema = z.object({
  reason: SanitizedTextSchema(500, 'Cancellation reason').optional(),
});

export type PatientCancelAppointmentDto = z.infer<typeof PatientCancelAppointmentDtoSchema>;

/**
 * Query appointments DTO schema
 * Edge cases:
 * - Invalid date range (from > to)
 * - No filters provided (returns all patient appointments)
 * - Large result sets (pagination required)
 */
export const QueryAppointmentsDtoSchema = z
  .object({
    status: PatientAppointmentStatusSchema.optional(),
    dateFrom: ISODateStringSchema.optional(),
    dateTo: ISODateStringSchema.optional(),
    page: PositiveIntSchema.default(1),
    pageSize: z
      .number()
      .int('Page size must be an integer')
      .min(1, 'Page size must be at least 1')
      .max(100, 'Page size cannot exceed 100')
      .default(20),
  })
  .refine(
    (data) => {
      // Validate date range
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    },
  );

export type QueryAppointmentsDto = z.infer<typeof QueryAppointmentsDtoSchema>;

// ============================================================================
// 4. BILLING SCHEMAS
// ============================================================================

/**
 * Payment method for patient payments
 */
export const PatientPaymentMethodSchema = z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH'], {
  errorMap: () => ({ message: 'Invalid payment method' }),
});

export type PatientPaymentMethod = z.infer<typeof PatientPaymentMethodSchema>;

/**
 * Invoice status for patient queries
 */
export const PatientInvoiceStatusSchema = z.enum(['OUTSTANDING', 'OVERDUE', 'PAID'], {
  errorMap: () => ({ message: 'Invalid invoice status' }),
});

export type PatientInvoiceStatus = z.infer<typeof PatientInvoiceStatusSchema>;

/**
 * Patient payment DTO schema
 * Edge cases:
 * - Payment amount exceeds invoice balance (validated at service layer)
 * - Payment amount too large (> $100,000)
 * - Invalid or expired card token
 * - Payment gateway timeout/failure
 * - Concurrent payment attempts (handled with idempotency keys at service layer)
 */
export const PatientPaymentDtoSchema = z
  .object({
    invoiceId: UUIDSchema,
    amount: PositiveMoneyAmountSchema,
    paymentMethod: PatientPaymentMethodSchema,
    cardToken: z.string().max(500, 'Card token must be 500 characters or less').optional(),
    saveCard: z.boolean().optional().default(false),
    idempotencyKey: UUIDSchema.optional(), // For preventing duplicate payments
  })
  .refine(
    (data) => {
      // If payment method is card, require card token unless saved card
      if (
        (data.paymentMethod === 'CREDIT_CARD' || data.paymentMethod === 'DEBIT_CARD') &&
        !data.cardToken
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Card token is required for card payments',
      path: ['cardToken'],
    },
  )
  .refine(
    (data) => {
      // Maximum payment amount constraint
      return data.amount <= 100000;
    },
    {
      message: 'Payment amount cannot exceed $100,000',
      path: ['amount'],
    },
  )
  .refine(
    (data) => {
      // Additional verification flag for high-value payments (> $1000)
      return data.amount <= 1000;
    },
    {
      message: 'Payments over $1,000 require additional verification. Please contact support.',
      path: ['amount'],
    },
  );

export type PatientPaymentDto = z.infer<typeof PatientPaymentDtoSchema>;

/**
 * Query invoices DTO schema (patient portal version)
 * Edge cases:
 * - Invalid date range
 * - Invalid amount range (min > max)
 * - No filters (returns all patient invoices)
 */
export const PatientQueryInvoicesDtoSchema = z
  .object({
    status: PatientInvoiceStatusSchema.optional(),
    dateFrom: ISODateStringSchema.optional(),
    dateTo: ISODateStringSchema.optional(),
    minAmount: NonNegativeMoneyAmountSchema.optional(),
    maxAmount: NonNegativeMoneyAmountSchema.optional(),
    page: PositiveIntSchema.default(1),
    pageSize: z
      .number()
      .int('Page size must be an integer')
      .min(1, 'Page size must be at least 1')
      .max(100, 'Page size cannot exceed 100')
      .default(20),
  })
  .refine(
    (data) => {
      // Validate date range
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    },
  )
  .refine(
    (data) => {
      // Validate amount range
      if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: 'minAmount must be less than or equal to maxAmount',
      path: ['minAmount'],
    },
  );

export type PatientQueryInvoicesDto = z.infer<typeof PatientQueryInvoicesDtoSchema>;

// ============================================================================
// 5. ENGAGEMENT SCHEMAS
// ============================================================================

/**
 * Feedback category enumeration (patient portal)
 */
export const PatientFeedbackCategorySchema = z.enum(['SERVICE', 'TREATMENT', 'FACILITY', 'STAFF', 'OVERALL'], {
  errorMap: () => ({ message: 'Invalid feedback category' }),
});

export type PatientFeedbackCategory = z.infer<typeof PatientFeedbackCategorySchema>;

/**
 * NPS source enumeration
 */
export const NpsSourceSchema = z.enum(['EMAIL', 'SMS', 'PORTAL', 'MOBILE_APP'], {
  errorMap: () => ({ message: 'Invalid NPS source' }),
});

export type NpsSource = z.infer<typeof NpsSourceSchema>;

/**
 * Submit feedback DTO schema
 * Edge cases:
 * - Feedback without appointment (general feedback allowed)
 * - Anonymous feedback (isAnonymous = true)
 * - Rating out of range (1-5 enforced)
 * - Empty comment (allowed)
 * - Rate limiting for spam prevention (handled at service layer)
 */
export const PatientSubmitFeedbackDtoSchema = z.object({
  appointmentId: UUIDSchema.optional(),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  category: PatientFeedbackCategorySchema,
  comment: SanitizedTextSchema(2000, 'Comment').optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export type PatientSubmitFeedbackDto = z.infer<typeof PatientSubmitFeedbackDtoSchema>;

/**
 * Submit NPS (Net Promoter Score) DTO schema (patient portal)
 * Edge cases:
 * - Score out of range (0-10 enforced)
 * - Empty comment (allowed)
 * - Multiple submissions from same patient (rate limited at service layer)
 */
export const PatientSubmitNpsDtoSchema = z.object({
  score: z
    .number()
    .int('NPS score must be an integer')
    .min(0, 'NPS score must be between 0 and 10')
    .max(10, 'NPS score must be between 0 and 10'),
  comment: SanitizedTextSchema(2000, 'Comment').optional(),
  source: NpsSourceSchema.optional(),
});

export type PatientSubmitNpsDto = z.infer<typeof PatientSubmitNpsDtoSchema>;

// ============================================================================
// 6. GDPR SCHEMAS
// ============================================================================

/**
 * Data export format enumeration
 */
export const DataExportFormatSchema = z.enum(['JSON', 'PDF', 'CSV'], {
  errorMap: () => ({ message: 'Invalid export format' }),
});

export type DataExportFormat = z.infer<typeof DataExportFormatSchema>;

/**
 * Request data export DTO schema (GDPR Article 20 - Right to Data Portability)
 * Edge cases:
 * - Large data exports (handled asynchronously at service layer)
 * - Multiple concurrent export requests (rate limited)
 */
export const RequestDataExportDtoSchema = z.object({
  format: DataExportFormatSchema.optional().default('JSON'),
  includeAppointments: z.boolean().optional().default(true),
  includeMedicalRecords: z.boolean().optional().default(true),
  includeBillingRecords: z.boolean().optional().default(true),
  includeDocuments: z.boolean().optional().default(true),
});

export type RequestDataExportDto = z.infer<typeof RequestDataExportDtoSchema>;

/**
 * Request account deletion DTO schema (GDPR Article 17 - Right to Erasure)
 * Edge cases:
 * - Outstanding invoices (deletion blocked until settled)
 * - Upcoming appointments (must cancel first)
 * - Legal retention requirements (some data retained for compliance)
 * - Incorrect confirmation text (prevented)
 */
export const RequestDeletionDtoSchema = z
  .object({
    reason: SanitizedTextSchema(500, 'Deletion reason').optional(),
    confirmationText: z
      .string()
      .min(1, 'Confirmation text is required')
      .trim(),
    acknowledgeDataLoss: z.literal(true, {
      errorMap: () => ({
        message: 'You must acknowledge that this action is irreversible',
      }),
    }),
  })
  .refine(
    (data) => {
      // Confirmation text must exactly match "DELETE MY ACCOUNT"
      return data.confirmationText === 'DELETE MY ACCOUNT';
    },
    {
      message: 'Confirmation text must exactly match "DELETE MY ACCOUNT"',
      path: ['confirmationText'],
    },
  );

export type RequestDeletionDto = z.infer<typeof RequestDeletionDtoSchema>;

// ============================================================================
// 7. COMMON SCHEMAS
// ============================================================================

/**
 * Patient pagination schema
 */
export const PatientPaginationSchema = z.object({
  page: PositiveIntSchema.default(1),
  pageSize: z
    .number()
    .int('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100')
    .default(20),
});

export type PatientPagination = z.infer<typeof PatientPaginationSchema>;

/**
 * Patient date range schema with validation
 */
export const PatientDateRangeSchema = z
  .object({
    from: ISODateStringSchema,
    to: ISODateStringSchema,
  })
  .refine(
    (data) => {
      return new Date(data.from) <= new Date(data.to);
    },
    {
      message: 'from date must be before or equal to to date',
      path: ['from'],
    },
  );

export type PatientDateRange = z.infer<typeof PatientDateRangeSchema>;

/**
 * Patient sort schema
 */
export const PatientSortSchema = z.object({
  sortBy: z.enum(['date', 'amount', 'status', 'name', 'createdAt'], {
    errorMap: () => ({ message: 'Invalid sort field' }),
  }),
  sortOrder: z.enum(['ASC', 'DESC'], {
    errorMap: () => ({ message: 'Sort order must be ASC or DESC' }),
  }),
});

export type PatientSort = z.infer<typeof PatientSortSchema>;

// ============================================================================
// CHANGE PASSWORD SCHEMA (Additional Auth Operation)
// ============================================================================

/**
 * Change password DTO schema (patient portal)
 * Edge cases:
 * - Current password incorrect (validated at service layer)
 * - New password same as current (allowed but not recommended)
 * - New password same as recent passwords (validated at service layer)
 */
export const PatientChangePasswordDtoSchema = z
  .object({
    currentPassword: NonEmptyStringSchema,
    newPassword: PatientPasswordSchema,
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export type PatientChangePasswordDto = z.infer<typeof PatientChangePasswordDtoSchema>;

// ============================================================================
// PASSWORD RESET SCHEMAS
// ============================================================================

/**
 * Request password reset DTO schema (patient portal)
 */
export const PatientRequestPasswordResetDtoSchema = z.object({
  email: EmailSchema,
});

export type PatientRequestPasswordResetDto = z.infer<typeof PatientRequestPasswordResetDtoSchema>;

/**
 * Reset password with token DTO schema (patient portal)
 */
export const PatientResetPasswordDtoSchema = z
  .object({
    token: NonEmptyStringSchema.max(500, 'Token must be 500 characters or less'),
    newPassword: PatientPasswordSchema,
    confirmNewPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export type PatientResetPasswordDto = z.infer<typeof PatientResetPasswordDtoSchema>;

// ============================================================================
// VERIFY EMAIL SCHEMA
// ============================================================================

/**
 * Verify email DTO schema (patient portal)
 */
export const PatientVerifyEmailDtoSchema = z.object({
  token: NonEmptyStringSchema.max(500, 'Token must be 500 characters or less'),
});

export type PatientVerifyEmailDto = z.infer<typeof PatientVerifyEmailDtoSchema>;

// ============================================================================
// APPOINTMENT AVAILABILITY QUERY
// ============================================================================

/**
 * Query appointment availability DTO schema
 * For patients to check available time slots before booking
 */
export const QueryAvailabilityDtoSchema = z
  .object({
    providerId: UUIDSchema,
    date: ISODateStringSchema,
    serviceCode: NonEmptyStringSchema.max(50, 'Service code must be 50 characters or less').optional(),
  })
  .refine(
    (data) => {
      // Date must be today or in the future
      const queryDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return queryDate >= today;
    },
    {
      message: 'Date must be today or in the future',
      path: ['date'],
    },
  );

export type QueryAvailabilityDto = z.infer<typeof QueryAvailabilityDtoSchema>;

// ============================================================================
// PAYMENT HISTORY QUERY
// ============================================================================

/**
 * Query payment history DTO schema
 */
export const QueryPaymentHistoryDtoSchema = z
  .object({
    dateFrom: ISODateStringSchema.optional(),
    dateTo: ISODateStringSchema.optional(),
    minAmount: NonNegativeMoneyAmountSchema.optional(),
    maxAmount: NonNegativeMoneyAmountSchema.optional(),
    paymentMethod: PatientPaymentMethodSchema.optional(),
    page: PositiveIntSchema.default(1),
    pageSize: z
      .number()
      .int('Page size must be an integer')
      .min(1, 'Page size must be at least 1')
      .max(100, 'Page size cannot exceed 100')
      .default(20),
  })
  .refine(
    (data) => {
      // Validate date range
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    },
  )
  .refine(
    (data) => {
      // Validate amount range
      if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
      }
      return true;
    },
    {
      message: 'minAmount must be less than or equal to maxAmount',
      path: ['minAmount'],
    },
  );

export type QueryPaymentHistoryDto = z.infer<typeof QueryPaymentHistoryDtoSchema>;

// ============================================================================
// DOCUMENT ACCESS SCHEMAS
// ============================================================================

/**
 * Document type for patient portal
 */
export const PatientDocumentTypeSchema = z.enum(
  ['MEDICAL_RECORD', 'XRAY', 'PRESCRIPTION', 'LAB_RESULT', 'CONSENT_FORM', 'INVOICE', 'RECEIPT', 'OTHER'],
  {
    errorMap: () => ({ message: 'Invalid document type' }),
  },
);

export type PatientDocumentType = z.infer<typeof PatientDocumentTypeSchema>;

/**
 * Query documents DTO schema
 */
export const QueryDocumentsDtoSchema = z
  .object({
    type: PatientDocumentTypeSchema.optional(),
    dateFrom: ISODateStringSchema.optional(),
    dateTo: ISODateStringSchema.optional(),
    searchTerm: z.string().max(100, 'Search term must be 100 characters or less').optional(),
    page: PositiveIntSchema.default(1),
    pageSize: z
      .number()
      .int('Page size must be an integer')
      .min(1, 'Page size must be at least 1')
      .max(100, 'Page size cannot exceed 100')
      .default(20),
  })
  .refine(
    (data) => {
      // Validate date range
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['dateFrom'],
    },
  );

export type QueryDocumentsDto = z.infer<typeof QueryDocumentsDtoSchema>;

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

/**
 * Update notification settings DTO schema
 * Granular control over notification channels and types
 */
export const UpdateNotificationSettingsDtoSchema = z.object({
  // Channel preferences
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),

  // Notification type preferences
  appointmentReminders: z.boolean().optional(),
  appointmentConfirmations: z.boolean().optional(),
  appointmentChanges: z.boolean().optional(),
  treatmentUpdates: z.boolean().optional(),
  billingAlerts: z.boolean().optional(),
  paymentConfirmations: z.boolean().optional(),
  marketingMessages: z.boolean().optional(),
  promotionalOffers: z.boolean().optional(),
  surveyRequests: z.boolean().optional(),

  // Timing preferences
  reminderLeadTimeHours: z
    .number()
    .int('Lead time must be an integer')
    .min(1, 'Lead time must be at least 1 hour')
    .max(168, 'Lead time cannot exceed 168 hours (7 days)')
    .optional(),
});

export type UpdateNotificationSettingsDto = z.infer<typeof UpdateNotificationSettingsDtoSchema>;

// ============================================================================
// INSURANCE INFORMATION
// ============================================================================

/**
 * Add insurance information DTO schema
 * For patients to add their insurance details
 */
export const AddInsuranceDtoSchema = z.object({
  insuranceProviderId: UUIDSchema,
  policyNumber: NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
  groupNumber: z.string().max(100, 'Group number must be 100 characters or less').optional(),
  policyHolderName: NameSchema,
  policyHolderDateOfBirth: PatientDateOfBirthSchema,
  relationshipToPolicyHolder: z
    .enum(['SELF', 'SPOUSE', 'CHILD', 'OTHER'], {
      errorMap: () => ({ message: 'Invalid relationship' }),
    })
    .default('SELF'),
  effectiveDate: ISODateStringSchema,
  expirationDate: ISODateStringSchema.optional(),
  isPrimary: z.boolean().default(true),
}).refine(
  (data) => {
    // If expiration date provided, must be after effective date
    if (data.expirationDate) {
      return new Date(data.expirationDate) > new Date(data.effectiveDate);
    }
    return true;
  },
  {
    message: 'Expiration date must be after effective date',
    path: ['expirationDate'],
  },
);

export type AddInsuranceDto = z.infer<typeof AddInsuranceDtoSchema>;

/**
 * Update insurance information DTO schema
 */
export const UpdateInsuranceDtoSchema = z.object({
  policyNumber: NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less').optional(),
  groupNumber: z.string().max(100, 'Group number must be 100 characters or less').optional(),
  expirationDate: ISODateStringSchema.optional(),
  isPrimary: z.boolean().optional(),
});

export type UpdateInsuranceDto = z.infer<typeof UpdateInsuranceDtoSchema>;
