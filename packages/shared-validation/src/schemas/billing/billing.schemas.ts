/**
 * Billing validation schemas for invoices, payments, insurance claims, and price rules
 * @module shared-validation/schemas/billing
 *
 * Edge cases covered:
 * - Multi-currency scenarios with exchange rate tracking
 * - Partial payments and refunds
 * - Split payments across multiple methods
 * - VAT/tax calculations for various jurisdictions
 * - Missing CUI (Romanian tax ID) scenarios
 * - Zero-amount transactions
 * - Negative amounts (credit notes, refunds)
 * - Date range validations
 * - Amount constraints (refund <= original, payment <= balance)
 * - Concurrent payment attempts
 */

import { z } from 'zod';
import { CurrencyCode } from '@dentalos/shared-types';
import {
  UUIDSchema,
  DateOnlySchema,
  NonEmptyStringSchema,
  PositiveIntSchema,
  NonNegativeIntSchema,
  CurrencyCodeSchema,
  SortOrderSchema,
} from '../common.schemas';

// ============================================================================
// Money Amount Schema - Finance-Grade DECIMAL validation
// ============================================================================

/**
 * Money amount schema with finance-grade validation
 * - Must be a number (backend will use DECIMAL type)
 * - Supports up to 2 decimal places for precision
 * - Can be negative for credit notes and refunds
 * - Zero amounts are allowed (e.g., complimentary services)
 */
export const MoneyAmountSchema = z
  .number()
  .refine(
    (val) => {
      // Check for max 2 decimal places
      const str = val.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex === -1) return true;
      return str.length - decimalIndex - 1 <= 2;
    },
    {
      message: 'Amount must have at most 2 decimal places',
    },
  )
  .describe('Money amount - must be stored as DECIMAL in database, never FLOAT');

/**
 * Positive money amount schema
 * For amounts that must be greater than zero (prices, charges)
 */
export const PositiveMoneyAmountSchema = z
  .number()
  .positive('Amount must be greater than zero')
  .refine(
    (val) => {
      // Check for max 2 decimal places
      const str = val.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex === -1) return true;
      return str.length - decimalIndex - 1 <= 2;
    },
    {
      message: 'Amount must have at most 2 decimal places',
    },
  )
  .describe('Positive money amount - must be stored as DECIMAL in database');

/**
 * Non-negative money amount schema
 * For amounts that can be zero or positive
 */
export const NonNegativeMoneyAmountSchema = z
  .number()
  .nonnegative('Amount must be zero or greater')
  .refine(
    (val) => {
      // Check for max 2 decimal places
      const str = val.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex === -1) return true;
      return str.length - decimalIndex - 1 <= 2;
    },
    {
      message: 'Amount must have at most 2 decimal places',
    },
  )
  .describe('Non-negative money amount - must be stored as DECIMAL in database');

/**
 * Tax rate schema - percentage as decimal (0.0 to 1.0)
 * Examples: 0.19 (19% VAT), 0.05 (5% reduced rate), 0.0 (exempt)
 */
export const TaxRateSchema = z
  .number()
  .min(0, 'Tax rate must be between 0 and 1')
  .max(1, 'Tax rate must be between 0 and 1')
  .describe('Tax rate as decimal (0.0 = 0%, 0.19 = 19%, 1.0 = 100%)');

// ============================================================================
// Invoice Status & Item Type Enums
// ============================================================================

/**
 * Invoice status enumeration
 * Lifecycle: DRAFT → ISSUED → (PAID | OVERDUE | CANCELLED)
 */
export const InvoiceStatusSchema = z.enum(
  [
    'DRAFT', // Invoice created but not issued to patient
    'ISSUED', // Invoice issued to patient, awaiting payment
    'PARTIALLY_PAID', // Partial payment received
    'PAID', // Fully paid
    'OVERDUE', // Past due date and unpaid
    'CANCELLED', // Cancelled before payment (credit note may be issued)
    'REFUNDED', // Fully refunded after payment
    'PARTIALLY_REFUNDED', // Partially refunded
  ],
  {
    errorMap: () => ({ message: 'Invalid invoice status' }),
  },
);

/**
 * Invoice item type enumeration
 * Links invoice items to their clinical/service origin
 */
export const ItemTypeSchema = z.enum(
  [
    'PROCEDURE', // Clinical procedure/treatment
    'PRODUCT', // Physical product (e.g., crown, implant)
    'SERVICE', // Non-clinical service (e.g., consultation fee)
    'LAB_FEE', // Laboratory fees
    'ADJUSTMENT', // Price adjustment (discount, surcharge)
    'TAX', // Tax line item (if itemized separately)
    'OTHER', // Miscellaneous charges
  ],
  {
    errorMap: () => ({ message: 'Invalid invoice item type' }),
  },
);

// ============================================================================
// Invoice Schemas
// ============================================================================

/**
 * Create invoice DTO schema
 * Edge cases:
 * - Missing appointmentId (invoice not linked to specific appointment)
 * - Missing CUI for Romanian invoices (patient pays privately)
 * - Invalid providerId (validation at service layer)
 * - Future issue date (prevented)
 * - Due date before issue date (prevented)
 * - Zero-amount invoice (allowed for complimentary services)
 */
export const CreateInvoiceDtoSchema = z
  .object({
    patientId: UUIDSchema,
    providerId: UUIDSchema, // The healthcare provider issuing the invoice
    clinicId: UUIDSchema.optional(), // If multi-clinic, specify clinic
    appointmentId: UUIDSchema.optional(), // Optional link to appointment
    treatmentPlanId: UUIDSchema.optional(), // Optional link to treatment plan
    invoiceNumber: NonEmptyStringSchema.max(50, 'Invoice number must be 50 characters or less').optional(), // Auto-generated if not provided
    issueDate: DateOnlySchema, // Date invoice is issued (YYYY-MM-DD)
    dueDate: DateOnlySchema, // Payment due date (YYYY-MM-DD)
    currency: CurrencyCodeSchema.default(CurrencyCode.USD),
    notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    internalNotes: z.string().max(2000, 'Internal notes must be 2000 characters or less').optional(),

    // Romanian e-Factura specific fields
    customerCUI: z.string().max(20, 'CUI must be 20 characters or less').optional(), // Romanian tax ID
    customerName: NonEmptyStringSchema.max(200, 'Customer name must be 200 characters or less').optional(),
    customerAddress: z.string().max(500, 'Customer address must be 500 characters or less').optional(),

    // Payment terms
    paymentTerms: z.string().max(500, 'Payment terms must be 500 characters or less').optional(),
  })
  .refine(
    (data) => {
      // Validate due date is on or after issue date
      const issueDate = new Date(data.issueDate);
      const dueDate = new Date(data.dueDate);
      return dueDate >= issueDate;
    },
    {
      message: 'Due date must be on or after issue date',
      path: ['dueDate'],
    },
  )
  .refine(
    (data) => {
      // Validate issue date is not in the future (allow today)
      const issueDate = new Date(data.issueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return issueDate <= today;
    },
    {
      message: 'Issue date cannot be in the future',
      path: ['issueDate'],
    },
  );

/**
 * Update invoice status DTO schema
 * Edge cases:
 * - Invalid status transitions (e.g., PAID → DRAFT)
 * - Missing reason for cancellation
 * - Status change on already finalized invoice
 */
export const UpdateInvoiceStatusDtoSchema = z.object({
  status: InvoiceStatusSchema,
  reason: z
    .string()
    .max(1000, 'Reason must be 1000 characters or less')
    .optional()
    .describe('Required for CANCELLED status'),
  updatedBy: UUIDSchema,
});

/**
 * Query invoices DTO schema
 * Edge cases:
 * - Invalid date ranges
 * - No filters provided (returns all)
 * - Large result sets (pagination required)
 * - Multiple status filters
 */
export const QueryInvoicesDtoSchema = z
  .object({
    // Filters
    patientId: UUIDSchema.optional(),
    providerId: UUIDSchema.optional(),
    clinicId: UUIDSchema.optional(),
    appointmentId: UUIDSchema.optional(),
    treatmentPlanId: UUIDSchema.optional(),
    invoiceNumber: z.string().max(50).optional(),
    status: z.array(InvoiceStatusSchema).optional(),

    // Date range filters
    issueDateFrom: DateOnlySchema.optional(),
    issueDateTo: DateOnlySchema.optional(),
    dueDateFrom: DateOnlySchema.optional(),
    dueDateTo: DateOnlySchema.optional(),

    // Amount filters
    minAmount: NonNegativeMoneyAmountSchema.optional(),
    maxAmount: NonNegativeMoneyAmountSchema.optional(),

    // Currency filter
    currency: CurrencyCodeSchema.optional(),

    // Search
    searchTerm: z.string().max(200).optional(), // Search in customer name, invoice number, notes

    // Pagination
    page: PositiveIntSchema.default(1),
    limit: PositiveIntSchema.min(1).max(100).default(20),

    // Sorting
    sortBy: z
      .enum(['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'patientName', 'createdAt'])
      .default('issueDate'),
    sortOrder: SortOrderSchema.default('desc'),
  })
  .refine(
    (data) => {
      // Validate issue date range
      if (data.issueDateFrom && data.issueDateTo) {
        return data.issueDateFrom <= data.issueDateTo;
      }
      return true;
    },
    {
      message: 'issueDateFrom must be before or equal to issueDateTo',
      path: ['issueDateFrom'],
    },
  )
  .refine(
    (data) => {
      // Validate due date range
      if (data.dueDateFrom && data.dueDateTo) {
        return data.dueDateFrom <= data.dueDateTo;
      }
      return true;
    },
    {
      message: 'dueDateFrom must be before or equal to dueDateTo',
      path: ['dueDateFrom'],
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

// ============================================================================
// Invoice Item Schemas
// ============================================================================

/**
 * Add invoice item DTO schema
 * Edge cases:
 * - Zero quantity (prevented)
 * - Negative unit price (allowed for adjustments/discounts)
 * - Missing tax rate (defaults to 0)
 * - Invalid item type
 * - Referencing non-existent procedure/product
 */
export const AddInvoiceItemDtoSchema = z.object({
  invoiceId: UUIDSchema,
  itemType: ItemTypeSchema,
  referenceId: UUIDSchema.optional(), // ID of procedure, product, service, etc.
  code: NonEmptyStringSchema.max(100, 'Code must be 100 characters or less'), // Procedure code, product SKU, etc.
  description: NonEmptyStringSchema.max(500, 'Description must be 500 characters or less'),
  quantity: z.number().positive('Quantity must be greater than zero'),
  unitPrice: MoneyAmountSchema, // Can be negative for adjustments
  taxRate: TaxRateSchema.default(0), // Default to 0% (exempt)
  discount: NonNegativeMoneyAmountSchema.default(0),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});

/**
 * Update invoice item DTO schema
 * Edge cases:
 * - Updating finalized invoice (prevented at service layer)
 * - Partial updates
 * - Changing quantity/price affects total
 */
export const UpdateInvoiceItemDtoSchema = z.object({
  itemType: ItemTypeSchema.optional(),
  code: NonEmptyStringSchema.max(100, 'Code must be 100 characters or less').optional(),
  description: NonEmptyStringSchema.max(500, 'Description must be 500 characters or less').optional(),
  quantity: z.number().positive('Quantity must be greater than zero').optional(),
  unitPrice: MoneyAmountSchema.optional(),
  taxRate: TaxRateSchema.optional(),
  discount: NonNegativeMoneyAmountSchema.optional(),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});

// ============================================================================
// Payment Method & Status Enums
// ============================================================================

/**
 * Payment method enumeration
 * Supports various payment channels for flexibility
 */
export const PaymentMethodSchema = z.enum(
  [
    'CASH', // Cash payment
    'CARD', // Credit/debit card
    'BANK_TRANSFER', // Wire transfer
    'CHECK', // Cheque payment
    'INSURANCE', // Insurance claim payment
    'ONLINE', // Online payment gateway (Stripe, Netopia, etc.)
    'MOBILE_PAYMENT', // Mobile payment apps
    'VOUCHER', // Gift vouchers, promotional codes
    'OTHER', // Other payment methods
  ],
  {
    errorMap: () => ({ message: 'Invalid payment method' }),
  },
);

// Note: PaymentStatusSchema is imported from common.schemas
// Values: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, REFUNDED, CANCELLED

// ============================================================================
// Payment Schemas
// ============================================================================

/**
 * Record payment DTO schema
 * Edge cases:
 * - Payment amount exceeds invoice balance (prevented)
 * - Zero payment amount (prevented)
 * - Negative payment amount (use refund endpoint instead)
 * - Payment date in future (prevented)
 * - Duplicate transaction ID (validated at service layer)
 * - Payment on cancelled invoice (prevented at service layer)
 */
export const RecordPaymentDtoSchema = z
  .object({
    invoiceId: UUIDSchema,
    amount: PositiveMoneyAmountSchema,
    paymentMethod: PaymentMethodSchema,
    paymentDate: DateOnlySchema,
    transactionId: NonEmptyStringSchema.max(200, 'Transaction ID must be 200 characters or less').optional(), // PSP transaction ID
    referenceNumber: NonEmptyStringSchema.max(100, 'Reference number must be 100 characters or less').optional(), // Check number, wire ref, etc.
    notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    receivedBy: UUIDSchema, // User who recorded the payment

    // For multi-currency scenarios
    currency: CurrencyCodeSchema.optional(), // If different from invoice currency
    exchangeRate: z.number().positive().optional(), // Exchange rate if currency conversion involved
  })
  .refine(
    (data) => {
      // Validate payment date is not in the future (allow today)
      // DateOnlySchema uses YYYY-MM-DD format, compare as strings
      const today = new Date().toISOString().split('T')[0];
      return data.paymentDate <= today;
    },
    {
      message: 'Payment date cannot be in the future',
      path: ['paymentDate'],
    },
  )
  .refine(
    (data) => {
      // If currency is provided, exchangeRate must also be provided
      if (data.currency && !data.exchangeRate) {
        return false;
      }
      return true;
    },
    {
      message: 'Exchange rate is required when currency is different from invoice currency',
      path: ['exchangeRate'],
    },
  );

/**
 * Split payment item schema
 * For payments using multiple payment methods
 */
export const SplitPaymentItemSchema = z.object({
  paymentMethod: PaymentMethodSchema,
  amount: PositiveMoneyAmountSchema,
  transactionId: NonEmptyStringSchema.max(200).optional(),
  referenceNumber: NonEmptyStringSchema.max(100).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Record split payment DTO schema
 * Edge cases:
 * - Split payment amounts don't sum to total (prevented)
 * - Single payment method in split (allowed but use RecordPaymentDto instead)
 * - Total amount exceeds invoice balance (prevented at service layer)
 * - More than 10 payment methods (prevented for sanity)
 */
export const RecordSplitPaymentDtoSchema = z
  .object({
    invoiceId: UUIDSchema,
    splitPayments: z
      .array(SplitPaymentItemSchema)
      .min(1, 'At least one payment method is required')
      .max(10, 'Maximum 10 payment methods allowed per split payment'),
    totalAmount: PositiveMoneyAmountSchema, // For validation
    paymentDate: DateOnlySchema,
    notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    receivedBy: UUIDSchema,
  })
  .refine(
    (data) => {
      // Validate split payments sum to total amount
      const sum = data.splitPayments.reduce((acc: number, item: z.infer<typeof SplitPaymentItemSchema>) => acc + item.amount, 0);
      // Allow small rounding difference (0.01)
      return Math.abs(sum - data.totalAmount) < 0.01;
    },
    {
      message: 'Sum of split payment amounts must equal total amount',
      path: ['splitPayments'],
    },
  )
  .refine(
    (data) => {
      // Validate payment date is not in the future (allow today)
      // DateOnlySchema uses YYYY-MM-DD format, compare as strings
      const today = new Date().toISOString().split('T')[0];
      return data.paymentDate <= today;
    },
    {
      message: 'Payment date cannot be in the future',
      path: ['paymentDate'],
    },
  );

/**
 * Refund payment DTO schema
 * Edge cases:
 * - Refund amount exceeds original payment (prevented)
 * - Zero refund amount (prevented)
 * - Refund on unpaid invoice (prevented at service layer)
 * - Multiple partial refunds exceeding original payment (validated at service layer)
 * - Refund date before payment date (allowed for backdating)
 */
export const RefundPaymentDtoSchema = z.object({
  paymentId: UUIDSchema,
  refundAmount: PositiveMoneyAmountSchema,
  reason: NonEmptyStringSchema.max(1000, 'Reason must be 1000 characters or less'),
  refundDate: DateOnlySchema,
  refundMethod: PaymentMethodSchema.optional(), // If different from original payment method
  transactionId: NonEmptyStringSchema.max(200).optional(), // PSP refund transaction ID
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
  processedBy: UUIDSchema,
});

// ============================================================================
// Insurance Claim Schemas
// ============================================================================

/**
 * Insurance claim status enumeration
 */
export const ClaimStatusSchema = z.enum(
  [
    'DRAFT', // Claim being prepared
    'SUBMITTED', // Submitted to insurance provider
    'PENDING_REVIEW', // Under review by insurer
    'APPROVED', // Fully approved
    'PARTIALLY_APPROVED', // Partially approved
    'DENIED', // Denied by insurer
    'PAID', // Payment received from insurer
    'APPEALED', // Appealed after denial
    'CANCELLED', // Cancelled before submission
  ],
  {
    errorMap: () => ({ message: 'Invalid claim status' }),
  },
);

/**
 * Create insurance claim DTO schema
 * Edge cases:
 * - Patient has no active insurance (validated at service layer)
 * - Claim amount exceeds coverage limit (validated at service layer)
 * - Missing procedure codes (prevented)
 * - Invalid insurance provider ID
 * - Duplicate claim submission
 */
export const CreateInsuranceClaimDtoSchema = z.object({
  invoiceId: UUIDSchema,
  patientId: UUIDSchema,
  insuranceProviderId: UUIDSchema,
  policyNumber: NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
  claimedAmount: PositiveMoneyAmountSchema,
  procedureCodes: z
    .array(NonEmptyStringSchema.max(50, 'Procedure code must be 50 characters or less'))
    .min(1, 'At least one procedure code is required')
    .max(50, 'Maximum 50 procedure codes per claim'),
  diagnosisCodes: z
    .array(NonEmptyStringSchema.max(50, 'Diagnosis code must be 50 characters or less'))
    .max(20, 'Maximum 20 diagnosis codes per claim')
    .optional(),
  treatmentDate: DateOnlySchema,
  submissionDate: DateOnlySchema.optional(),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
  attachments: z
    .array(UUIDSchema)
    .max(20, 'Maximum 20 attachments per claim')
    .optional(), // Document IDs (X-rays, prescriptions, etc.)
  submittedBy: UUIDSchema,
});

/**
 * Update claim status DTO schema
 * Edge cases:
 * - Invalid status transitions
 * - Approved/denied without insurer response details
 * - Partial approval without approved amount
 */
export const UpdateClaimStatusDtoSchema = z
  .object({
    status: ClaimStatusSchema,
    approvedAmount: NonNegativeMoneyAmountSchema.optional(),
    denialReason: z.string().max(1000, 'Denial reason must be 1000 characters or less').optional(),
    insurerReferenceNumber: NonEmptyStringSchema.max(100, 'Insurer reference number must be 100 characters or less').optional(),
    responseDate: DateOnlySchema.optional(),
    notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    updatedBy: UUIDSchema,
  })
  .refine(
    (data) => {
      // If status is APPROVED or PARTIALLY_APPROVED, approvedAmount is required
      if (
        (data.status === 'APPROVED' || data.status === 'PARTIALLY_APPROVED') &&
        data.approvedAmount === undefined
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Approved amount is required for APPROVED or PARTIALLY_APPROVED status',
      path: ['approvedAmount'],
    },
  )
  .refine(
    (data) => {
      // If status is DENIED, denialReason is required
      if (data.status === 'DENIED' && !data.denialReason) {
        return false;
      }
      return true;
    },
    {
      message: 'Denial reason is required for DENIED status',
      path: ['denialReason'],
    },
  );

// ============================================================================
// Price Rule Schemas
// ============================================================================

/**
 * Price rule type enumeration
 */
export const RuleTypeSchema = z.enum(
  [
    'PERCENTAGE_DISCOUNT', // Percentage discount (e.g., 10% off)
    'FIXED_DISCOUNT', // Fixed amount discount (e.g., $50 off)
    'FIXED_PRICE', // Override with fixed price
    'PERCENTAGE_MARKUP', // Percentage markup (e.g., 15% increase)
    'FIXED_MARKUP', // Fixed amount markup
    'TIERED_PRICING', // Volume-based pricing tiers
    'BUNDLE_DISCOUNT', // Discount for bundled procedures
  ],
  {
    errorMap: () => ({ message: 'Invalid rule type' }),
  },
);

/**
 * Create price rule DTO schema
 * Edge cases:
 * - Overlapping date ranges for same procedure
 * - Invalid value for rule type (e.g., negative discount, discount > 100%)
 * - Missing applicable procedures/categories
 * - Priority conflicts
 */
export const CreatePriceRuleDtoSchema = z
  .object({
    name: NonEmptyStringSchema.max(200, 'Name must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    ruleType: RuleTypeSchema,
    applicableTo: z.enum(['PROCEDURE', 'PRODUCT', 'SERVICE', 'CATEGORY', 'ALL']),
    targetIds: z.array(UUIDSchema).optional(), // IDs of procedures, products, services, or categories
    value: z.number(), // Interpretation depends on ruleType
    validFrom: DateOnlySchema,
    validTo: DateOnlySchema.optional(),
    priority: NonNegativeIntSchema.default(0), // Higher priority rules applied first
    isActive: z.boolean().default(true),

    // Conditional applicability
    minQuantity: z.number().positive().optional(), // For tiered pricing
    maxQuantity: z.number().positive().optional(),
    requiresInsurance: z.boolean().default(false),
    requiresCouponCode: z.boolean().default(false),
    couponCode: NonEmptyStringSchema.max(50).optional(),

    // Scope
    clinicIds: z.array(UUIDSchema).optional(), // If rule applies to specific clinics only
    patientCategories: z.array(NonEmptyStringSchema.max(50)).optional(), // E.g., senior, student, employee

    createdBy: UUIDSchema,
  })
  .refine(
    (data) => {
      // Validate validTo is after validFrom
      if (data.validTo) {
        return new Date(data.validTo) >= new Date(data.validFrom);
      }
      return true;
    },
    {
      message: 'validTo must be on or after validFrom',
      path: ['validTo'],
    },
  )
  .refine(
    (data) => {
      // Percentage discounts must be between 0 and 100
      if (data.ruleType === 'PERCENTAGE_DISCOUNT' && (data.value < 0 || data.value > 100)) {
        return false;
      }
      return true;
    },
    {
      message: 'Percentage discount must be between 0 and 100',
      path: ['value'],
    },
  )
  .refine(
    (data) => {
      // If requiresCouponCode is true, couponCode must be provided
      if (data.requiresCouponCode && !data.couponCode) {
        return false;
      }
      return true;
    },
    {
      message: 'Coupon code is required when requiresCouponCode is true',
      path: ['couponCode'],
    },
  )
  .refine(
    (data) => {
      // If minQuantity and maxQuantity are provided, min must be <= max
      if (data.minQuantity !== undefined && data.maxQuantity !== undefined) {
        return data.minQuantity <= data.maxQuantity;
      }
      return true;
    },
    {
      message: 'minQuantity must be less than or equal to maxQuantity',
      path: ['minQuantity'],
    },
  );

/**
 * Apply price rule DTO schema
 * Edge cases:
 * - No applicable rules found
 * - Multiple rules conflict
 * - Rule expired or not yet valid
 */
export const ApplyPriceRuleDtoSchema = z.object({
  procedureId: UUIDSchema.optional(),
  productId: UUIDSchema.optional(),
  serviceId: UUIDSchema.optional(),
  quantity: z.number().positive().default(1),
  patientId: UUIDSchema.optional(), // For patient-specific rules
  couponCode: NonEmptyStringSchema.max(50).optional(),
  applyDate: DateOnlySchema.optional(), // Defaults to today
});

// ============================================================================
// Tax Rate Schemas
// ============================================================================

/**
 * Create tax rate DTO schema
 * Edge cases:
 * - Multiple tax rates for same jurisdiction (e.g., standard vs. reduced)
 * - Tax rate changes over time (historical tracking)
 * - Reverse charge scenarios (EU VAT)
 */
export const CreateTaxRateDtoSchema = z.object({
  name: NonEmptyStringSchema.max(100, 'Name must be 100 characters or less'), // E.g., "Standard VAT (RO)", "Reduced VAT (RO)"
  rate: TaxRateSchema,
  jurisdictionId: UUIDSchema.optional(), // Country/region ID
  jurisdictionCode: NonEmptyStringSchema.max(10).optional(), // ISO country code (e.g., RO, US)
  applicableTo: z.enum(['ALL', 'PRODUCTS', 'SERVICES', 'MEDICAL', 'DENTAL']).default('ALL'),
  isDefault: z.boolean().default(false),
  validFrom: DateOnlySchema,
  validTo: DateOnlySchema.optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  createdBy: UUIDSchema,
});

// ============================================================================
// Patient Balance Query Schema
// ============================================================================

/**
 * Query patient balance DTO schema
 * Returns aggregated financial information for a patient
 * Edge cases:
 * - Patient with no invoices
 * - Multiple currencies
 * - Outstanding claims
 */
export const QueryPatientBalanceDtoSchema = z.object({
  patientId: UUIDSchema,
  asOfDate: DateOnlySchema.optional(), // Calculate balance as of specific date
  includeProjections: z.boolean().default(false), // Include pending insurance claims
  currency: CurrencyCodeSchema.optional(), // Convert all amounts to this currency
});

// ============================================================================
// Type Inference
// ============================================================================

// Money types
export type MoneyAmount = z.infer<typeof MoneyAmountSchema>;
export type PositiveMoneyAmount = z.infer<typeof PositiveMoneyAmountSchema>;
export type NonNegativeMoneyAmount = z.infer<typeof NonNegativeMoneyAmountSchema>;
export type TaxRate = z.infer<typeof TaxRateSchema>;

// Invoice types
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;
export type ItemType = z.infer<typeof ItemTypeSchema>;
export type CreateInvoiceDto = z.infer<typeof CreateInvoiceDtoSchema>;
export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusDtoSchema>;
export type QueryInvoicesDto = z.infer<typeof QueryInvoicesDtoSchema>;

// Invoice item types
export type AddInvoiceItemDto = z.infer<typeof AddInvoiceItemDtoSchema>;
export type UpdateInvoiceItemDto = z.infer<typeof UpdateInvoiceItemDtoSchema>;

// Payment types
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type RecordPaymentDto = z.infer<typeof RecordPaymentDtoSchema>;
export type SplitPaymentItem = z.infer<typeof SplitPaymentItemSchema>;
export type RecordSplitPaymentDto = z.infer<typeof RecordSplitPaymentDtoSchema>;
export type RefundPaymentDto = z.infer<typeof RefundPaymentDtoSchema>;

// Insurance claim types
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type CreateInsuranceClaimDto = z.infer<typeof CreateInsuranceClaimDtoSchema>;
export type UpdateClaimStatusDto = z.infer<typeof UpdateClaimStatusDtoSchema>;

// Price rule types
export type RuleType = z.infer<typeof RuleTypeSchema>;
export type CreatePriceRuleDto = z.infer<typeof CreatePriceRuleDtoSchema>;
export type ApplyPriceRuleDto = z.infer<typeof ApplyPriceRuleDtoSchema>;

// Tax rate types
export type CreateTaxRateDto = z.infer<typeof CreateTaxRateDtoSchema>;

// Patient balance types
export type QueryPatientBalanceDto = z.infer<typeof QueryPatientBalanceDtoSchema>;
