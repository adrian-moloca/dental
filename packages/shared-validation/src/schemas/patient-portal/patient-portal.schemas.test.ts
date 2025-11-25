/**
 * Patient Portal validation schemas tests
 * @module shared-validation/schemas/patient-portal
 */

import { describe, it, expect } from '@jest/globals';
import {
  // Auth schemas
  PatientRegisterDtoSchema,
  PatientLoginDtoSchema,
  PatientMfaChallengeRequestSchema,
  PatientMfaVerifyRequestSchema,
  PatientChangePasswordDtoSchema,
  PatientRequestPasswordResetDtoSchema,
  PatientResetPasswordDtoSchema,
  PatientVerifyEmailDtoSchema,

  // Profile schemas
  UpdatePatientProfileDtoSchema,
  UpdatePatientPreferencesDtoSchema,

  // Appointment schemas
  BookAppointmentDtoSchema,
  PatientRescheduleAppointmentDtoSchema,
  PatientCancelAppointmentDtoSchema,
  QueryAppointmentsDtoSchema,
  QueryAvailabilityDtoSchema,

  // Billing schemas
  PatientPaymentDtoSchema,
  PatientQueryInvoicesDtoSchema,
  QueryPaymentHistoryDtoSchema,

  // Engagement schemas
  PatientSubmitFeedbackDtoSchema,
  PatientSubmitNpsDtoSchema,

  // GDPR schemas
  RequestDataExportDtoSchema,
  RequestDeletionDtoSchema,

  // Common schemas
  PatientPaginationSchema,
  PatientDateRangeSchema,
  PatientSortSchema,

  // Document schemas
  QueryDocumentsDtoSchema,

  // Notification schemas
  UpdateNotificationSettingsDtoSchema,

  // Insurance schemas
  AddInsuranceDtoSchema,
  UpdateInsuranceDtoSchema,
} from './patient-portal.schemas';

describe('Patient Portal Validation Schemas', () => {
  // ============================================================================
  // AUTH SCHEMAS
  // ============================================================================

  describe('PatientRegisterDtoSchema', () => {
    it('should validate a valid registration', () => {
      const validData = {
        email: 'patient@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01').toISOString(),
        phone: '+14155552671',
        acceptedTerms: true as const,
        marketingConsent: false,
      };

      const result = PatientRegisterDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'patient@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01').toISOString(),
        phone: '+14155552671',
        acceptedTerms: true as const,
      };

      const result = PatientRegisterDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should reject age under 13 (COPPA)', () => {
      const today = new Date();
      const underAge = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());

      const invalidData = {
        email: 'child@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'Child',
        lastName: 'User',
        dateOfBirth: underAge.toISOString(),
        phone: '+14155552671',
        acceptedTerms: true as const,
      };

      const result = PatientRegisterDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 13 years old');
      }
    });

    it('should reject if passwords do not match', () => {
      const invalidData = {
        email: 'patient@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01').toISOString(),
        phone: '+14155552671',
        acceptedTerms: true as const,
      };

      const result = PatientRegisterDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('do not match');
      }
    });

    it('should reject if terms not accepted', () => {
      const invalidData = {
        email: 'patient@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01').toISOString(),
        phone: '+14155552671',
        acceptedTerms: false,
      };

      const result = PatientRegisterDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PatientMfaVerifyRequestSchema', () => {
    it('should validate a valid 6-digit code', () => {
      const validData = {
        challengeId: '123e4567-e89b-12d3-a456-426614174000',
        code: '123456',
      };

      const result = PatientMfaVerifyRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject non-numeric code', () => {
      const invalidData = {
        challengeId: '123e4567-e89b-12d3-a456-426614174000',
        code: '12345A',
      };

      const result = PatientMfaVerifyRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject code with wrong length', () => {
      const invalidData = {
        challengeId: '123e4567-e89b-12d3-a456-426614174000',
        code: '12345',
      };

      const result = PatientMfaVerifyRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // APPOINTMENT SCHEMAS
  // ============================================================================

  describe('BookAppointmentDtoSchema', () => {
    it('should validate a valid appointment booking', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const validData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CLEANING',
        appointmentDate: futureDate.toISOString(),
        appointmentTime: '14:00',
        notes: 'First visit',
      };

      const result = BookAppointmentDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject time outside business hours', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const invalidData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'CLEANING',
        appointmentDate: futureDate.toISOString(),
        appointmentTime: '22:00',
      };

      const result = BookAppointmentDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('business hours');
      }
    });

    it('should accept emergency appointments with shorter notice', () => {
      const soonDate = new Date();
      soonDate.setMinutes(soonDate.getMinutes() + 30);

      const validData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        serviceCode: 'EMERGENCY',
        appointmentDate: soonDate.toISOString(),
        appointmentTime: '14:00',
        isEmergency: true,
      };

      // Note: This test may fail if the time is too close
      // In a real scenario, emergency bookings have relaxed time requirements
      const result = BookAppointmentDtoSchema.safeParse(validData);
      // Emergency appointments are allowed with less than 1 hour notice
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // BILLING SCHEMAS
  // ============================================================================

  describe('PatientPaymentDtoSchema', () => {
    it('should validate a valid payment', () => {
      const validData = {
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150.00,
        paymentMethod: 'CREDIT_CARD' as const,
        cardToken: 'tok_visa_1234567890',
        saveCard: false,
      };

      const result = PatientPaymentDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject payment over $1000 without additional verification', () => {
      const invalidData = {
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 1500.00,
        paymentMethod: 'CREDIT_CARD' as const,
        cardToken: 'tok_visa_1234567890',
      };

      const result = PatientPaymentDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('additional verification');
      }
    });

    it('should reject payment over $100,000', () => {
      const invalidData = {
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150000.00,
        paymentMethod: 'CREDIT_CARD' as const,
        cardToken: 'tok_visa_1234567890',
      };

      const result = PatientPaymentDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.message.includes('$100,000'))).toBe(true);
      }
    });

    it('should require card token for card payments', () => {
      const invalidData = {
        invoiceId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150.00,
        paymentMethod: 'CREDIT_CARD' as const,
      };

      const result = PatientPaymentDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Card token is required');
      }
    });
  });

  describe('PatientQueryInvoicesDtoSchema', () => {
    it('should validate a valid invoice query', () => {
      const validData = {
        status: 'OUTSTANDING' as const,
        dateFrom: new Date('2024-01-01').toISOString(),
        dateTo: new Date('2024-12-31').toISOString(),
        minAmount: 0,
        maxAmount: 1000,
        page: 1,
        pageSize: 20,
      };

      const result = PatientQueryInvoicesDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidData = {
        dateFrom: new Date('2024-12-31').toISOString(),
        dateTo: new Date('2024-01-01').toISOString(),
      };

      const result = PatientQueryInvoicesDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('before or equal to');
      }
    });

    it('should reject invalid amount range', () => {
      const invalidData = {
        minAmount: 1000,
        maxAmount: 100,
      };

      const result = PatientQueryInvoicesDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than or equal to');
      }
    });
  });

  // ============================================================================
  // ENGAGEMENT SCHEMAS
  // ============================================================================

  describe('PatientSubmitFeedbackDtoSchema', () => {
    it('should validate a valid feedback submission', () => {
      const validData = {
        appointmentId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        category: 'OVERALL' as const,
        comment: 'Excellent service!',
        isAnonymous: false,
      };

      const result = PatientSubmitFeedbackDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject rating out of range', () => {
      const invalidData = {
        rating: 6,
        category: 'OVERALL' as const,
      };

      const result = PatientSubmitFeedbackDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow anonymous feedback', () => {
      const validData = {
        rating: 4,
        category: 'SERVICE' as const,
        comment: 'Good but could be better',
        isAnonymous: true,
      };

      const result = PatientSubmitFeedbackDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('PatientSubmitNpsDtoSchema', () => {
    it('should validate a valid NPS submission', () => {
      const validData = {
        score: 9,
        comment: 'Very likely to recommend',
        source: 'PORTAL' as const,
      };

      const result = PatientSubmitNpsDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject score out of range', () => {
      const invalidData = {
        score: 11,
      };

      const result = PatientSubmitNpsDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept all valid NPS scores (0-10)', () => {
      for (let score = 0; score <= 10; score++) {
        const data = { score };
        const result = PatientSubmitNpsDtoSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  // ============================================================================
  // GDPR SCHEMAS
  // ============================================================================

  describe('RequestDeletionDtoSchema', () => {
    it('should validate a valid deletion request', () => {
      const validData = {
        reason: 'No longer need the service',
        confirmationText: 'DELETE MY ACCOUNT',
        acknowledgeDataLoss: true as const,
      };

      const result = RequestDeletionDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject incorrect confirmation text', () => {
      const invalidData = {
        confirmationText: 'delete my account',
        acknowledgeDataLoss: true as const,
      };

      const result = RequestDeletionDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('DELETE MY ACCOUNT');
      }
    });

    it('should reject if data loss not acknowledged', () => {
      const invalidData = {
        confirmationText: 'DELETE MY ACCOUNT',
        acknowledgeDataLoss: false,
      };

      const result = RequestDeletionDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('RequestDataExportDtoSchema', () => {
    it('should validate a valid export request', () => {
      const validData = {
        format: 'JSON' as const,
        includeAppointments: true,
        includeMedicalRecords: true,
        includeBillingRecords: true,
        includeDocuments: false,
      };

      const result = RequestDataExportDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const validData = {};

      const result = RequestDataExportDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.format).toBe('JSON');
        expect(result.data.includeAppointments).toBe(true);
      }
    });
  });

  // ============================================================================
  // COMMON SCHEMAS
  // ============================================================================

  describe('PatientPaginationSchema', () => {
    it('should validate valid pagination', () => {
      const validData = {
        page: 1,
        pageSize: 20,
      };

      const result = PatientPaginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const validData = {};

      const result = PatientPaginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(20);
      }
    });

    it('should reject page size over 100', () => {
      const invalidData = {
        page: 1,
        pageSize: 150,
      };

      const result = PatientPaginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('PatientDateRangeSchema', () => {
    it('should validate valid date range', () => {
      const validData = {
        from: new Date('2024-01-01').toISOString(),
        to: new Date('2024-12-31').toISOString(),
      };

      const result = PatientDateRangeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date range', () => {
      const invalidData = {
        from: new Date('2024-12-31').toISOString(),
        to: new Date('2024-01-01').toISOString(),
      };

      const result = PatientDateRangeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  // ============================================================================
  // PROFILE SCHEMAS
  // ============================================================================

  describe('UpdatePatientProfileDtoSchema', () => {
    it('should validate partial profile update', () => {
      const validData = {
        firstName: 'Jane',
        phone: '+14155552671',
      };

      const result = UpdatePatientProfileDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty update', () => {
      const invalidData = {};

      const result = UpdatePatientProfileDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one field');
      }
    });

    it('should validate address update', () => {
      const validData = {
        address: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94102',
          country: 'US',
        },
      };

      const result = UpdatePatientProfileDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('UpdatePatientPreferencesDtoSchema', () => {
    it('should validate notification preferences', () => {
      const validData = {
        emailEnabled: true,
        smsEnabled: false,
        appointmentReminders: true,
        marketingConsent: false,
      };

      const result = UpdatePatientPreferencesDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow partial preferences update', () => {
      const validData = {
        marketingConsent: true,
      };

      const result = UpdatePatientPreferencesDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // INSURANCE SCHEMAS
  // ============================================================================

  describe('AddInsuranceDtoSchema', () => {
    it('should validate valid insurance information', () => {
      const validData = {
        insuranceProviderId: '123e4567-e89b-12d3-a456-426614174000',
        policyNumber: 'POL123456',
        policyHolderName: 'John Doe',
        policyHolderDateOfBirth: new Date('1980-01-01').toISOString(),
        relationshipToPolicyHolder: 'SELF' as const,
        effectiveDate: new Date('2024-01-01').toISOString(),
        isPrimary: true,
      };

      const result = AddInsuranceDtoSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject if expiration before effective date', () => {
      const invalidData = {
        insuranceProviderId: '123e4567-e89b-12d3-a456-426614174000',
        policyNumber: 'POL123456',
        policyHolderName: 'John Doe',
        policyHolderDateOfBirth: new Date('1980-01-01').toISOString(),
        relationshipToPolicyHolder: 'SELF' as const,
        effectiveDate: new Date('2024-12-31').toISOString(),
        expirationDate: new Date('2024-01-01').toISOString(),
        isPrimary: true,
      };

      const result = AddInsuranceDtoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
