/**
 * Billing Domain Types
 *
 * Complete domain types for Billing, Invoicing, Payments, Insurance Claims, and Finance
 * in dental practice management system. Defines invoices, payments, insurance claims,
 * ledger entries, pricing rules, patient financials, and billing integrations.
 *
 * This module implements finance-grade domain types that maintain:
 * - Double-entry accounting integrity (debits == credits)
 * - Immutability and audit trails for all financial transactions
 * - Multi-currency support with proper exchange rate tracking
 * - Regulatory compliance (Romania e-Factura/ANAF, EU VIES, GDPR/HIPAA)
 * - Integration with clinical procedures, imaging, and inventory (COGS)
 *
 * @module shared-domain/billing
 */

import type {
  UUID,
  ISODateString,
  OrganizationId,
  ClinicId,
  Metadata,
} from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { PatientId, ProviderId, ProcedureId } from '../clinical';
import type { ImagingStudyId } from '../imaging';
import type { ProductId, Currency } from '../inventory';

// ============================================================================
// BRANDED TYPES FOR TYPE SAFETY
// ============================================================================

/**
 * Unique identifier for an invoice
 */
export type InvoiceId = UUID & { readonly __brand: 'InvoiceId' };

/**
 * Unique identifier for a payment
 */
export type PaymentId = UUID & { readonly __brand: 'PaymentId' };

/**
 * Unique identifier for an insurance claim
 */
export type InsuranceClaimId = UUID & { readonly __brand: 'InsuranceClaimId' };

/**
 * Unique identifier for a ledger entry
 */
export type LedgerEntryId = UUID & { readonly __brand: 'LedgerEntryId' };

/**
 * Unique identifier for a ledger account
 */
export type LedgerAccountId = UUID & { readonly __brand: 'LedgerAccountId' };

/**
 * Unique identifier for a refund
 */
export type RefundId = UUID & { readonly __brand: 'RefundId' };

/**
 * Unique identifier for a price rule
 */
export type PriceRuleId = UUID & { readonly __brand: 'PriceRuleId' };

/**
 * Unique identifier for a payment plan
 */
export type PaymentPlanId = UUID & { readonly __brand: 'PaymentPlanId' };

/**
 * Unique identifier for a credit note
 */
export type CreditNoteId = UUID & { readonly __brand: 'CreditNoteId' };

/**
 * Unique identifier for an insurance policy
 */
export type InsurancePolicyId = UUID & { readonly __brand: 'InsurancePolicyId' };

/**
 * Unique identifier for a tax rate configuration
 */
export type TaxRateId = UUID & { readonly __brand: 'TaxRateId' };

/**
 * Unique identifier for a commission record
 */
export type CommissionId = UUID & { readonly __brand: 'CommissionId' };

/**
 * Romanian tax identification number (Cod Unic de Înregistrare)
 * Format: RO + 2-10 digits
 */
export type CUI = string & { readonly __brand: 'CUI' };

/**
 * e-Factura invoice number (Romanian ANAF requirement)
 * Format: Series + Number (e.g., "FACT-2025-00123")
 */
export type EFacturaNumber = string & { readonly __brand: 'EFacturaNumber' };

/**
 * PSP (Payment Service Provider) transaction ID
 */
export type PSPTransactionId = string & { readonly __brand: 'PSPTransactionId' };

/**
 * Monetary amount (DECIMAL type, never FLOAT)
 * Always use DECIMAL in database schema
 */
export type MoneyAmount = number & { readonly __brand: 'MoneyAmount' };

// ============================================================================
// INVOICE DOMAIN TYPES
// ============================================================================

/**
 * Invoice status enumeration
 *
 * Lifecycle:
 * DRAFT → SENT → PARTIALLY_PAID → PAID
 *      → SENT → OVERDUE
 *      → VOID (cancellation)
 *      → CANCELLED (pre-issuance)
 * PAID → REFUNDED (partial or full)
 */
export enum InvoiceStatus {
  /**
   * Invoice created but not yet issued (editable)
   */
  DRAFT = 'DRAFT',

  /**
   * Invoice issued and sent to patient/insurance (immutable)
   */
  SENT = 'SENT',

  /**
   * Invoice has been paid in full
   */
  PAID = 'PAID',

  /**
   * Invoice has received partial payment
   */
  PARTIALLY_PAID = 'PARTIALLY_PAID',

  /**
   * Invoice payment is overdue (past due date)
   */
  OVERDUE = 'OVERDUE',

  /**
   * Invoice voided after issuance (requires credit note/reversal)
   * Never delete; use reversals for audit trail
   */
  VOID = 'VOID',

  /**
   * Invoice refunded (partial or full)
   * Original invoice remains; refund creates new credit note
   */
  REFUNDED = 'REFUNDED',

  /**
   * Invoice cancelled before issuance (DRAFT only)
   */
  CANCELLED = 'CANCELLED',
}

/**
 * Invoice item type enumeration
 */
export enum ItemType {
  /**
   * Clinical procedure (e.g., tooth filling, crown)
   */
  PROCEDURE = 'PROCEDURE',

  /**
   * Imaging service (e.g., X-ray, CBCT scan)
   */
  IMAGING = 'IMAGING',

  /**
   * Product/material sold to patient
   */
  PRODUCT = 'PRODUCT',

  /**
   * Discount applied (negative amount)
   */
  DISCOUNT = 'DISCOUNT',

  /**
   * Additional fee (e.g., late fee, processing fee)
   */
  FEE = 'FEE',

  /**
   * Financial adjustment (positive or negative)
   */
  ADJUSTMENT = 'ADJUSTMENT',

  /**
   * Tax line item (VAT, sales tax)
   */
  TAX = 'TAX',
}

/**
 * Individual line item on an invoice
 *
 * Each item represents a billable service, product, or financial adjustment
 */
export interface InvoiceItem {
  /** Unique identifier for this line item */
  readonly id: UUID;

  /** Type of item */
  readonly type: ItemType;

  /** Human-readable description */
  readonly description: string;

  /** Quantity (e.g., 2 crowns, 1 X-ray) */
  readonly quantity: number;

  /** Unit price (before discounts/taxes) */
  readonly unitPrice: MoneyValue;

  /** Total price for this line (quantity * unitPrice, before tax) */
  readonly subtotal: MoneyValue;

  /** Tax rate applied (e.g., 0.19 for 19% VAT) */
  readonly taxRate: number;

  /** Tax amount */
  readonly taxAmount: MoneyValue;

  /** Discount applied to this line item (if any) */
  readonly discount?: MoneyValue;

  /** Total for this line (subtotal + tax - discount) */
  readonly total: MoneyValue;

  /** Reference to clinical procedure (if applicable) */
  readonly procedureId?: ProcedureId;

  /** Reference to imaging study (if applicable) */
  readonly imagingStudyId?: ImagingStudyId;

  /** Reference to product sold (if applicable) */
  readonly productId?: ProductId;

  /** Provider who performed this service */
  readonly providerId?: ProviderId;

  /** Tooth number(s) for dental procedures */
  readonly toothNumbers?: number[];

  /** ADA/CDT procedure code (for procedures) */
  readonly procedureCode?: string;

  /** Notes specific to this line item */
  readonly notes?: string;

  /** Metadata for extensibility */
  readonly metadata?: Metadata;
}

/**
 * Invoice aggregate root
 *
 * Represents a complete invoice for services/products provided.
 * Supports:
 * - Multi-currency invoicing
 * - Multiple payment methods (split payments)
 * - Insurance co-payments
 * - Romanian e-Factura compliance
 * - Audit trail (never delete, use reversals)
 */
export interface Invoice {
  /** Unique identifier */
  readonly id: InvoiceId;

  /** Invoice number (human-readable, sequential per clinic) */
  readonly invoiceNumber: string;

  /** e-Factura number for Romanian ANAF compliance */
  readonly eFacturaNumber?: EFacturaNumber;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic that issued the invoice */
  readonly clinicId: ClinicId;

  /** Patient being billed */
  readonly patientId: PatientId;

  /** Provider responsible for this invoice (primary) */
  readonly providerId: ProviderId;

  /** Invoice status */
  readonly status: InvoiceStatus;

  /** Invoice issue date */
  readonly issueDate: ISODateString;

  /** Payment due date */
  readonly dueDate: ISODateString;

  /** Date invoice was sent to patient/insurance */
  readonly sentDate?: ISODateString;

  /** Date invoice was fully paid */
  readonly paidDate?: ISODateString;

  /** Date invoice was voided */
  readonly voidedDate?: ISODateString;

  /** Invoice currency */
  readonly currency: Currency;

  /** Exchange rate (if different from base currency) */
  readonly exchangeRate?: number;

  /** Line items on this invoice */
  readonly items: InvoiceItem[];

  /** Subtotal (sum of all line subtotals, before tax) */
  readonly subtotal: MoneyValue;

  /** Total tax amount */
  readonly taxTotal: MoneyValue;

  /** Total discounts applied */
  readonly discountTotal: MoneyValue;

  /** Grand total (subtotal + tax - discount) */
  readonly total: MoneyValue;

  /** Amount paid so far */
  readonly amountPaid: MoneyValue;

  /** Amount still owed (total - amountPaid) */
  readonly amountDue: MoneyValue;

  /** Amount refunded (if any) */
  readonly amountRefunded?: MoneyValue;

  /** Insurance claim reference (if applicable) */
  readonly insuranceClaimId?: InsuranceClaimId;

  /** Amount covered by insurance */
  readonly insuranceCoverage?: MoneyValue;

  /** Patient responsibility (after insurance) */
  readonly patientResponsibility?: MoneyValue;

  /** Payment references (all payments applied to this invoice) */
  readonly paymentIds: PaymentId[];

  /** Refund references (if any) */
  readonly refundIds?: RefundId[];

  /** Romanian patient CUI (tax ID) for e-Factura */
  readonly patientCUI?: CUI;

  /** Romanian clinic CUI */
  readonly clinicCUI?: CUI;

  /** Billing address */
  readonly billingAddress?: string;

  /** Notes visible to patient */
  readonly notes?: string;

  /** Internal notes (not visible on invoice) */
  readonly internalNotes?: string;

  /** Terms and conditions */
  readonly terms?: string;

  /** Reference to original invoice (for credit notes/refunds) */
  readonly originalInvoiceId?: InvoiceId;

  /** Reason for void/cancellation */
  readonly voidReason?: string;

  /** User who voided the invoice */
  readonly voidedBy?: UUID;

  /** User who created the invoice */
  readonly createdBy: UUID;

  /** User who last updated the invoice */
  readonly updatedBy?: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata for extensibility */
  readonly metadata?: Metadata;
}

// ============================================================================
// PAYMENT DOMAIN TYPES
// ============================================================================

/**
 * Payment method enumeration
 */
export enum PaymentMethod {
  /** Cash payment */
  CASH = 'CASH',

  /** Credit card payment */
  CREDIT_CARD = 'CREDIT_CARD',

  /** Debit card payment */
  DEBIT_CARD = 'DEBIT_CARD',

  /** Check payment */
  CHECK = 'CHECK',

  /** Insurance payment */
  INSURANCE = 'INSURANCE',

  /** Bank transfer (SEPA, ACH) */
  BANK_TRANSFER = 'BANK_TRANSFER',

  /** Wire transfer */
  WIRE_TRANSFER = 'WIRE_TRANSFER',

  /** Cryptocurrency payment */
  CRYPTO = 'CRYPTO',

  /** Split payment (multiple methods) */
  SPLIT = 'SPLIT',
}

/**
 * Payment status enumeration
 */
export enum PaymentStatus {
  /** Payment initiated but not yet processed */
  PENDING = 'PENDING',

  /** Payment being processed by PSP */
  PROCESSING = 'PROCESSING',

  /** Payment completed successfully */
  COMPLETED = 'COMPLETED',

  /** Payment failed */
  FAILED = 'FAILED',

  /** Payment refunded */
  REFUNDED = 'REFUNDED',

  /** Payment cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * Split payment component
 *
 * Used when a single payment uses multiple payment methods
 * (e.g., $100 cash + $50 credit card)
 */
export interface SplitPaymentComponent {
  /** Payment method for this component */
  readonly method: PaymentMethod;

  /** Amount paid with this method */
  readonly amount: MoneyValue;

  /** PSP transaction ID (for card/bank transfers) */
  readonly pspTransactionId?: PSPTransactionId;

  /** Last 4 digits of card (for cards) */
  readonly cardLast4?: string;

  /** Card brand (Visa, Mastercard, etc.) */
  readonly cardBrand?: string;

  /** Check number (for checks) */
  readonly checkNumber?: string;

  /** Reference number (for bank transfers) */
  readonly referenceNumber?: string;

  /** Notes for this component */
  readonly notes?: string;
}

/**
 * Payment aggregate root
 *
 * Represents a payment received from patient or insurance.
 * Supports:
 * - Multiple payment methods (split payments)
 * - Partial payments
 * - Overpayments (creates credit balance)
 * - PSP integration (Stripe, Netopia)
 * - Refunds
 */
export interface Payment {
  /** Unique identifier */
  readonly id: PaymentId;

  /** Payment reference number (human-readable) */
  readonly paymentNumber: string;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic receiving payment */
  readonly clinicId: ClinicId;

  /** Patient making payment */
  readonly patientId: PatientId;

  /** Invoice(s) this payment applies to */
  readonly invoiceIds: InvoiceId[];

  /** Payment status */
  readonly status: PaymentStatus;

  /** Payment method */
  readonly method: PaymentMethod;

  /** Split payment components (if SPLIT method) */
  readonly splitComponents?: SplitPaymentComponent[];

  /** Payment amount */
  readonly amount: MoneyValue;

  /** Currency of payment */
  readonly currency: Currency;

  /** Exchange rate (if different from invoice currency) */
  readonly exchangeRate?: number;

  /** Payment date (when received) */
  readonly paymentDate: ISODateString;

  /** Date payment was processed */
  readonly processedDate?: ISODateString;

  /** PSP (Stripe, Netopia, etc.) */
  readonly paymentProvider?: string;

  /** PSP transaction ID */
  readonly pspTransactionId?: PSPTransactionId;

  /** Last 4 digits of card (for card payments) */
  readonly cardLast4?: string;

  /** Card brand (Visa, Mastercard, etc.) */
  readonly cardBrand?: string;

  /** Check number (for check payments) */
  readonly checkNumber?: string;

  /** Bank reference (for transfers) */
  readonly bankReference?: string;

  /** Payment receipt URL */
  readonly receiptUrl?: string;

  /** Notes visible to patient */
  readonly notes?: string;

  /** Internal notes */
  readonly internalNotes?: string;

  /** Refund reference (if refunded) */
  readonly refundId?: RefundId;

  /** Amount refunded (if any) */
  readonly amountRefunded?: MoneyValue;

  /** Reason for failure (if failed) */
  readonly failureReason?: string;

  /** User who recorded payment */
  readonly createdBy: UUID;

  /** User who last updated payment */
  readonly updatedBy?: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata for extensibility */
  readonly metadata?: Metadata;
}

/**
 * Refund aggregate
 *
 * Represents a refund issued to patient.
 * Refunds are immutable; never modify original payment.
 */
export interface Refund {
  /** Unique identifier */
  readonly id: RefundId;

  /** Refund reference number */
  readonly refundNumber: string;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic issuing refund */
  readonly clinicId: ClinicId;

  /** Patient receiving refund */
  readonly patientId: PatientId;

  /** Original payment being refunded */
  readonly paymentId: PaymentId;

  /** Invoice(s) affected */
  readonly invoiceIds: InvoiceId[];

  /** Refund amount */
  readonly amount: MoneyValue;

  /** Currency */
  readonly currency: Currency;

  /** Refund date */
  readonly refundDate: ISODateString;

  /** Refund method (same as original payment, or different) */
  readonly method: PaymentMethod;

  /** PSP refund transaction ID */
  readonly pspRefundId?: PSPTransactionId;

  /** Reason for refund */
  readonly reason: string;

  /** Refund status */
  readonly status: PaymentStatus;

  /** User who initiated refund */
  readonly createdBy: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// INSURANCE CLAIM DOMAIN TYPES
// ============================================================================

/**
 * Insurance claim status enumeration
 */
export enum ClaimStatus {
  /** Claim drafted but not submitted */
  DRAFT = 'DRAFT',

  /** Claim submitted to insurance */
  SUBMITTED = 'SUBMITTED',

  /** Claim pending review */
  PENDING = 'PENDING',

  /** Claim approved in full */
  APPROVED = 'APPROVED',

  /** Claim partially approved (partial coverage) */
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',

  /** Claim denied */
  DENIED = 'DENIED',

  /** Claim paid by insurance */
  PAID = 'PAID',

  /** Claim appealed */
  APPEALED = 'APPEALED',
}

/**
 * Coverage information for an insurance policy
 */
export interface CoverageInfo {
  /** Insurance policy ID */
  readonly policyId: InsurancePolicyId;

  /** Insurance carrier name */
  readonly carrierName: string;

  /** Policy number */
  readonly policyNumber: string;

  /** Group number (if applicable) */
  readonly groupNumber?: string;

  /** Policy holder (if different from patient) */
  readonly policyHolder?: string;

  /** Relationship to patient */
  readonly relationshipToPatient?: string;

  /** Coverage percentage (e.g., 0.80 for 80% coverage) */
  readonly coveragePercentage: number;

  /** Annual maximum coverage */
  readonly annualMaximum?: MoneyValue;

  /** Deductible amount */
  readonly deductible?: MoneyValue;

  /** Deductible met so far this year */
  readonly deductibleMet?: MoneyValue;

  /** Coverage used so far this year */
  readonly coverageUsed?: MoneyValue;

  /** Coverage remaining */
  readonly coverageRemaining?: MoneyValue;

  /** Policy start date */
  readonly effectiveDate: ISODateString;

  /** Policy end date */
  readonly expirationDate?: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Benefit breakdown for a specific procedure
 */
export interface BenefitBreakdown {
  /** Procedure code */
  readonly procedureCode: string;

  /** Billed amount */
  readonly billedAmount: MoneyValue;

  /** Amount allowed by insurance */
  readonly allowedAmount: MoneyValue;

  /** Deductible applied */
  readonly deductibleApplied: MoneyValue;

  /** Co-insurance amount (patient responsibility) */
  readonly coInsurance: MoneyValue;

  /** Co-payment amount */
  readonly copay?: MoneyValue;

  /** Amount paid by insurance */
  readonly insurancePaid: MoneyValue;

  /** Patient responsibility */
  readonly patientResponsibility: MoneyValue;

  /** Denial reason (if denied) */
  readonly denialReason?: string;

  /** Notes */
  readonly notes?: string;
}

/**
 * Insurance claim aggregate root
 *
 * Represents a claim submitted to insurance for reimbursement.
 * Handles:
 * - Partial approvals
 * - Multiple procedures per claim
 * - Denial and appeal workflows
 */
export interface InsuranceClaim {
  /** Unique identifier */
  readonly id: InsuranceClaimId;

  /** Claim number */
  readonly claimNumber: string;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic submitting claim */
  readonly clinicId: ClinicId;

  /** Patient */
  readonly patientId: PatientId;

  /** Insurance policy/coverage info */
  readonly coverage: CoverageInfo;

  /** Claim status */
  readonly status: ClaimStatus;

  /** Associated invoice */
  readonly invoiceId: InvoiceId;

  /** Procedures included in this claim */
  readonly procedureIds: ProcedureId[];

  /** Total billed amount */
  readonly billedAmount: MoneyValue;

  /** Amount approved by insurance */
  readonly approvedAmount?: MoneyValue;

  /** Amount paid by insurance */
  readonly paidAmount?: MoneyValue;

  /** Patient responsibility after insurance */
  readonly patientResponsibility?: MoneyValue;

  /** Benefit breakdown per procedure */
  readonly benefits?: BenefitBreakdown[];

  /** Claim submission date */
  readonly submissionDate?: ISODateString;

  /** Date of service (procedure date) */
  readonly serviceDate: ISODateString;

  /** Date claim was approved */
  readonly approvalDate?: ISODateString;

  /** Date claim was paid */
  readonly paidDate?: ISODateString;

  /** Date claim was denied */
  readonly deniedDate?: ISODateString;

  /** Denial reason */
  readonly denialReason?: string;

  /** Appeal submission date */
  readonly appealDate?: ISODateString;

  /** Appeal notes */
  readonly appealNotes?: string;

  /** External claim ID (insurance carrier's ID) */
  readonly externalClaimId?: string;

  /** Claim form type (ADA 2019, etc.) */
  readonly claimFormType?: string;

  /** Attachments (X-rays, clinical notes) */
  readonly attachments?: string[];

  /** Notes */
  readonly notes?: string;

  /** User who created claim */
  readonly createdBy: UUID;

  /** User who last updated claim */
  readonly updatedBy?: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// LEDGER & ACCOUNTING TYPES
// ============================================================================

/**
 * Ledger entry type (debit or credit)
 */
export enum EntryType {
  /** Debit entry (increases assets/expenses, decreases liabilities/revenue) */
  DEBIT = 'DEBIT',

  /** Credit entry (increases liabilities/revenue, decreases assets/expenses) */
  CREDIT = 'CREDIT',
}

/**
 * Ledger account type
 *
 * Chart of accounts for dental practice.
 * CRITICAL: Every transaction must maintain: sum(debits) == sum(credits)
 */
export enum AccountType {
  /** Revenue from services (credit normal balance) */
  REVENUE = 'REVENUE',

  /** Money owed by patients/insurance (debit normal balance) */
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',

  /** Cash in bank/register (debit normal balance) */
  CASH = 'CASH',

  /** Cost of goods sold (materials used in procedures) (debit normal balance) */
  COGS = 'COGS',

  /** Discounts given (contra-revenue, debit normal balance) */
  DISCOUNT = 'DISCOUNT',

  /** Insurance payments received (credit normal balance) */
  INSURANCE = 'INSURANCE',

  /** Refunds issued (debit normal balance) */
  REFUND = 'REFUND',

  /** Adjustments (debit or credit depending on direction) */
  ADJUSTMENT = 'ADJUSTMENT',

  /** Accounts payable (supplier invoices) (credit normal balance) */
  ACCOUNTS_PAYABLE = 'ACCOUNTS_PAYABLE',

  /** Inventory/stock (debit normal balance) */
  INVENTORY = 'INVENTORY',

  /** Prepaid expenses (debit normal balance) */
  PREPAID_EXPENSE = 'PREPAID_EXPENSE',

  /** Accrued expenses (credit normal balance) */
  ACCRUED_EXPENSE = 'ACCRUED_EXPENSE',

  /** Deferred revenue (credit normal balance) */
  DEFERRED_REVENUE = 'DEFERRED_REVENUE',

  /** Doctor commissions payable (credit normal balance) */
  COMMISSION_PAYABLE = 'COMMISSION_PAYABLE',

  /** Tax liability (VAT, sales tax) (credit normal balance) */
  TAX_LIABILITY = 'TAX_LIABILITY',
}

/**
 * Ledger entry
 *
 * Represents a single line in the general ledger.
 * CRITICAL: All ledger entries must be part of a balanced transaction
 * where sum(debits) == sum(credits).
 *
 * Ledger entries are IMMUTABLE. Never modify; use reversals for corrections.
 */
export interface LedgerEntry {
  /** Unique identifier */
  readonly id: LedgerEntryId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic */
  readonly clinicId: ClinicId;

  /** Ledger account */
  readonly accountId: LedgerAccountId;

  /** Account type */
  readonly accountType: AccountType;

  /** Entry type (debit or credit) */
  readonly entryType: EntryType;

  /** Amount (always positive; direction determined by entryType) */
  readonly amount: MoneyValue;

  /** Currency */
  readonly currency: Currency;

  /** Exchange rate (if multi-currency) */
  readonly exchangeRate?: number;

  /** Entry date (accounting date) */
  readonly entryDate: ISODateString;

  /** Transaction description */
  readonly description: string;

  /** Reference to source invoice */
  readonly invoiceId?: InvoiceId;

  /** Reference to source payment */
  readonly paymentId?: PaymentId;

  /** Reference to insurance claim */
  readonly insuranceClaimId?: InsuranceClaimId;

  /** Reference to refund */
  readonly refundId?: RefundId;

  /** Reference to patient */
  readonly patientId?: PatientId;

  /** Reference to provider */
  readonly providerId?: ProviderId;

  /** Transaction batch ID (all entries in same transaction share this) */
  readonly transactionId: UUID;

  /** Reversing entry (if this entry reverses another) */
  readonly reversesEntryId?: LedgerEntryId;

  /** Reversed by entry (if this entry was reversed) */
  readonly reversedByEntryId?: LedgerEntryId;

  /** Fiscal year */
  readonly fiscalYear: number;

  /** Fiscal period (month) */
  readonly fiscalPeriod: number;

  /** User who created entry */
  readonly createdBy: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// PRICING & TAX TYPES
// ============================================================================

/**
 * Price rule type enumeration
 */
export enum RuleType {
  /** Percentage discount */
  DISCOUNT = 'DISCOUNT',

  /** Insurance contracted rate */
  INSURANCE_RATE = 'INSURANCE_RATE',

  /** Provider-specific fee */
  PROVIDER_FEE = 'PROVIDER_FEE',

  /** Procedure base fee */
  PROCEDURE_FEE = 'PROCEDURE_FEE',

  /** Volume-based discount */
  VOLUME_DISCOUNT = 'VOLUME_DISCOUNT',

  /** Membership/subscription discount */
  MEMBERSHIP_DISCOUNT = 'MEMBERSHIP_DISCOUNT',
}

/**
 * Price rule
 *
 * Defines pricing logic for procedures, insurance, volume discounts, etc.
 */
export interface PriceRule {
  /** Unique identifier */
  readonly id: PriceRuleId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic (if clinic-specific) */
  readonly clinicId?: ClinicId;

  /** Rule type */
  readonly type: RuleType;

  /** Rule name */
  readonly name: string;

  /** Rule description */
  readonly description?: string;

  /** Procedure code this rule applies to */
  readonly procedureCode?: string;

  /** Provider this rule applies to */
  readonly providerId?: ProviderId;

  /** Insurance policy this rule applies to */
  readonly insurancePolicyId?: InsurancePolicyId;

  /** Fixed price (if applicable) */
  readonly fixedPrice?: MoneyValue;

  /** Percentage discount (e.g., 0.10 for 10% off) */
  readonly discountPercentage?: number;

  /** Minimum quantity for volume discount */
  readonly minQuantity?: number;

  /** Priority (higher = evaluated first) */
  readonly priority: number;

  /** Effective start date */
  readonly effectiveDate: ISODateString;

  /** Expiration date */
  readonly expirationDate?: ISODateString;

  /** Is rule active? */
  readonly isActive: boolean;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Tax rate configuration
 *
 * Defines VAT/sales tax rates for different jurisdictions and product types.
 * Romania: Standard VAT 19%, Reduced 9%, Exempt 0%
 */
export interface TaxRate {
  /** Unique identifier */
  readonly id: TaxRateId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Tax name (e.g., "Romania VAT Standard") */
  readonly name: string;

  /** Tax jurisdiction (country, state) */
  readonly jurisdiction: string;

  /** Tax rate (e.g., 0.19 for 19%) */
  readonly rate: number;

  /** Tax type (VAT, sales tax, etc.) */
  readonly taxType: string;

  /** Product categories this rate applies to */
  readonly applicableCategories?: string[];

  /** Is this the default rate? */
  readonly isDefault: boolean;

  /** Effective start date */
  readonly effectiveDate: ISODateString;

  /** Expiration date */
  readonly expirationDate?: ISODateString;

  /** Is rate active? */
  readonly isActive: boolean;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// PATIENT FINANCIALS TYPES
// ============================================================================

/**
 * Patient balance summary
 *
 * Aggregate view of patient's financial position.
 */
export interface PatientBalance {
  /** Patient ID */
  readonly patientId: PatientId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Total billed to patient (all time) */
  readonly totalBilled: MoneyValue;

  /** Total paid by patient */
  readonly totalPaid: MoneyValue;

  /** Total covered by insurance */
  readonly totalInsuranceCovered: MoneyValue;

  /** Current balance owed */
  readonly currentBalance: MoneyValue;

  /** Credit balance (overpayment) */
  readonly creditBalance?: MoneyValue;

  /** Overdue amount (past due date) */
  readonly overdueAmount?: MoneyValue;

  /** Number of overdue invoices */
  readonly overdueInvoiceCount?: number;

  /** Last payment date */
  readonly lastPaymentDate?: ISODateString;

  /** Last payment amount */
  readonly lastPaymentAmount?: MoneyValue;

  /** Active payment plan */
  readonly paymentPlanId?: PaymentPlanId;

  /** Currency */
  readonly currency: Currency;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;
}

/**
 * Payment plan
 *
 * Installment payment agreement for patient.
 */
export interface PaymentPlan {
  /** Unique identifier */
  readonly id: PaymentPlanId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic */
  readonly clinicId: ClinicId;

  /** Patient */
  readonly patientId: PatientId;

  /** Invoice(s) covered by this plan */
  readonly invoiceIds: InvoiceId[];

  /** Plan status */
  readonly status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';

  /** Total amount to be paid */
  readonly totalAmount: MoneyValue;

  /** Down payment (if any) */
  readonly downPayment?: MoneyValue;

  /** Amount paid so far */
  readonly amountPaid: MoneyValue;

  /** Remaining balance */
  readonly remainingBalance: MoneyValue;

  /** Number of installments */
  readonly installmentCount: number;

  /** Installment amount */
  readonly installmentAmount: MoneyValue;

  /** Payment frequency (monthly, weekly, etc.) */
  readonly frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

  /** Start date */
  readonly startDate: ISODateString;

  /** Expected end date */
  readonly endDate: ISODateString;

  /** Next payment due date */
  readonly nextPaymentDate?: ISODateString;

  /** Late fee (if applicable) */
  readonly lateFee?: MoneyValue;

  /** Currency */
  readonly currency: Currency;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Credit note
 *
 * Negative invoice issued for refunds, corrections, or adjustments.
 */
export interface CreditNote {
  /** Unique identifier */
  readonly id: CreditNoteId;

  /** Credit note number */
  readonly creditNoteNumber: string;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic */
  readonly clinicId: ClinicId;

  /** Patient */
  readonly patientId: PatientId;

  /** Original invoice being credited */
  readonly originalInvoiceId: InvoiceId;

  /** Credit amount */
  readonly amount: MoneyValue;

  /** Currency */
  readonly currency: Currency;

  /** Reason for credit */
  readonly reason: string;

  /** Issue date */
  readonly issueDate: ISODateString;

  /** Applied to new invoice? */
  readonly appliedToInvoiceId?: InvoiceId;

  /** Refunded to patient? */
  readonly refundId?: RefundId;

  /** User who created credit note */
  readonly createdBy: UUID;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// BILLING INTEGRATION TYPES
// ============================================================================

/**
 * Billable item (from clinical/imaging/inventory)
 *
 * Generic interface for items that can be billed.
 */
export interface BillableItem {
  /** Item type */
  readonly type: ItemType;

  /** Item description */
  readonly description: string;

  /** Quantity */
  readonly quantity: number;

  /** Unit price */
  readonly unitPrice: MoneyValue;

  /** Provider who performed service */
  readonly providerId?: ProviderId;

  /** Reference to source entity */
  readonly sourceId: UUID;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Procedure billing information
 *
 * Links clinical procedures to billing.
 */
export interface ProcedureBilling {
  /** Procedure ID */
  readonly procedureId: ProcedureId;

  /** Procedure code (ADA/CDT) */
  readonly procedureCode: string;

  /** Description */
  readonly description: string;

  /** Tooth number(s) */
  readonly toothNumbers?: number[];

  /** Provider */
  readonly providerId: ProviderId;

  /** Patient */
  readonly patientId: PatientId;

  /** Service date */
  readonly serviceDate: ISODateString;

  /** Fee */
  readonly fee: MoneyValue;

  /** Insurance coverage (if applicable) */
  readonly insuranceCoverage?: MoneyValue;

  /** Patient responsibility */
  readonly patientResponsibility: MoneyValue;

  /** Already billed? */
  readonly isBilled: boolean;

  /** Invoice reference (if billed) */
  readonly invoiceId?: InvoiceId;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Imaging billing information
 *
 * Links imaging studies to billing.
 */
export interface ImagingBilling {
  /** Imaging study ID */
  readonly imagingStudyId: ImagingStudyId;

  /** Study type/modality */
  readonly modality: string;

  /** Description */
  readonly description: string;

  /** Provider who ordered/interpreted */
  readonly providerId: ProviderId;

  /** Patient */
  readonly patientId: PatientId;

  /** Study date */
  readonly studyDate: ISODateString;

  /** Fee */
  readonly fee: MoneyValue;

  /** Insurance coverage (if applicable) */
  readonly insuranceCoverage?: MoneyValue;

  /** Patient responsibility */
  readonly patientResponsibility: MoneyValue;

  /** Already billed? */
  readonly isBilled: boolean;

  /** Invoice reference (if billed) */
  readonly invoiceId?: InvoiceId;

  /** Metadata */
  readonly metadata?: Metadata;
}

/**
 * Product billing information (COGS)
 *
 * Links inventory products to billing.
 * Tracks cost of goods sold for financial reporting.
 */
export interface ProductBilling {
  /** Product ID */
  readonly productId: ProductId;

  /** Product name */
  readonly productName: string;

  /** Quantity sold */
  readonly quantity: number;

  /** Unit selling price */
  readonly unitPrice: MoneyValue;

  /** Unit cost (COGS) */
  readonly unitCost: MoneyValue;

  /** Total selling price */
  readonly totalPrice: MoneyValue;

  /** Total cost (COGS) */
  readonly totalCost: MoneyValue;

  /** Gross profit (totalPrice - totalCost) */
  readonly grossProfit: MoneyValue;

  /** Patient */
  readonly patientId: PatientId;

  /** Sale date */
  readonly saleDate: ISODateString;

  /** Already billed? */
  readonly isBilled: boolean;

  /** Invoice reference (if billed) */
  readonly invoiceId?: InvoiceId;

  /** Metadata */
  readonly metadata?: Metadata;
}

// ============================================================================
// DOCTOR COMMISSION TYPES
// ============================================================================

/**
 * Commission calculation type
 */
export enum CommissionType {
  /** Percentage of revenue */
  PERCENTAGE = 'PERCENTAGE',

  /** Fixed amount per procedure */
  FIXED = 'FIXED',

  /** Tiered (based on volume) */
  TIERED = 'TIERED',

  /** Hybrid (percentage + fixed) */
  HYBRID = 'HYBRID',
}

/**
 * Commission record
 *
 * Tracks doctor commissions for procedures performed.
 * Supports multi-clinic and multi-currency scenarios.
 */
export interface Commission {
  /** Unique identifier */
  readonly id: CommissionId;

  /** Organization (tenant) */
  readonly organizationId: OrganizationId;

  /** Clinic */
  readonly clinicId: ClinicId;

  /** Provider earning commission */
  readonly providerId: ProviderId;

  /** Invoice this commission is based on */
  readonly invoiceId: InvoiceId;

  /** Procedure(s) included */
  readonly procedureIds: ProcedureId[];

  /** Commission type */
  readonly commissionType: CommissionType;

  /** Base amount (revenue from procedures) */
  readonly baseAmount: MoneyValue;

  /** Commission rate (if percentage) */
  readonly commissionRate?: number;

  /** Commission amount */
  readonly commissionAmount: MoneyValue;

  /** Currency */
  readonly currency: Currency;

  /** Service date (when procedures performed) */
  readonly serviceDate: ISODateString;

  /** Commission period (month) */
  readonly commissionPeriod: string;

  /** Paid to provider? */
  readonly isPaid: boolean;

  /** Payment date */
  readonly paidDate?: ISODateString;

  /** Payment reference */
  readonly paymentReference?: string;

  /** Creation timestamp */
  readonly createdAt: ISODateString;

  /** Last update timestamp */
  readonly updatedAt: ISODateString;

  /** Metadata */
  readonly metadata?: Metadata;
}
