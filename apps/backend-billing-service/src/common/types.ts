import { z } from 'zod';

// Branded types for type safety
export const InvoiceIdSchema = z.string().uuid().brand('InvoiceId');
export type InvoiceId = z.infer<typeof InvoiceIdSchema>;

export const PaymentIdSchema = z.string().uuid().brand('PaymentId');
export type PaymentId = z.infer<typeof PaymentIdSchema>;

export const InvoiceItemIdSchema = z.string().uuid().brand('InvoiceItemId');
export type InvoiceItemId = z.infer<typeof InvoiceItemIdSchema>;

export const InsuranceClaimIdSchema = z.string().uuid().brand('InsuranceClaimId');
export type InsuranceClaimId = z.infer<typeof InsuranceClaimIdSchema>;

export const LedgerEntryIdSchema = z.string().uuid().brand('LedgerEntryId');
export type LedgerEntryId = z.infer<typeof LedgerEntryIdSchema>;

export const PriceRuleIdSchema = z.string().uuid().brand('PriceRuleId');
export type PriceRuleId = z.infer<typeof PriceRuleIdSchema>;

export const TaxRateIdSchema = z.string().uuid().brand('TaxRateId');
export type TaxRateId = z.infer<typeof TaxRateIdSchema>;

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  VOID = 'VOID',
  REFUNDED = 'REFUNDED',
}

// Invoice Item Type
export enum InvoiceItemType {
  PROCEDURE = 'PROCEDURE',
  IMAGING = 'IMAGING',
  PRODUCT = 'PRODUCT',
  DISCOUNT = 'DISCOUNT',
  FEE = 'FEE',
  ADJUSTMENT = 'ADJUSTMENT',
}

// Payment Method
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  INSURANCE = 'INSURANCE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  SPLIT = 'SPLIT',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Insurance Claim Status
export enum InsuranceClaimStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  PAID = 'PAID',
}

// Ledger Entry Type
export enum LedgerEntryType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

// Ledger Account
export enum LedgerAccount {
  REVENUE = 'REVENUE',
  ACCOUNTS_RECEIVABLE = 'ACCOUNTS_RECEIVABLE',
  CASH = 'CASH',
  COGS = 'COGS',
  DISCOUNT = 'DISCOUNT',
  INSURANCE_RECEIVABLE = 'INSURANCE_RECEIVABLE',
  REFUNDS = 'REFUNDS',
  ADJUSTMENTS = 'ADJUSTMENTS',
  TAX_PAYABLE = 'TAX_PAYABLE',
}

// Price Rule Type
export enum PriceRuleType {
  DISCOUNT = 'DISCOUNT',
  INSURANCE_RATE = 'INSURANCE_RATE',
  PROVIDER_FEE = 'PROVIDER_FEE',
  PROCEDURE_FEE = 'PROCEDURE_FEE',
}

// Price Rule Applicable To
export enum PriceRuleApplicableTo {
  PROCEDURE_CODE = 'PROCEDURE_CODE',
  PATIENT_TYPE = 'PATIENT_TYPE',
  INSURANCE_PROVIDER = 'INSURANCE_PROVIDER',
}

// Tax Applicable To
export enum TaxApplicableTo {
  SERVICE = 'SERVICE',
  PRODUCT = 'PRODUCT',
  ALL = 'ALL',
}

// Currency
export type Currency = 'USD' | 'EUR' | 'GBP' | 'RON';

// Decimal for money calculations
export interface MoneyAmount {
  amount: number;
  currency: Currency;
}

// ============================================
// E-Factura Types
// ============================================

/**
 * E-Factura Submission ID (branded type)
 */
export const EFacturaSubmissionIdSchema = z.string().uuid().brand('EFacturaSubmissionId');
export type EFacturaSubmissionId = z.infer<typeof EFacturaSubmissionIdSchema>;

/**
 * E-Factura Submission Status
 * Represents the lifecycle states of an e-factura submission to ANAF
 */
export enum EFacturaSubmissionStatus {
  /** Initial state - submission created but not yet sent to ANAF */
  PENDING = 'PENDING',
  /** XML submitted to ANAF, awaiting processing */
  SUBMITTED = 'SUBMITTED',
  /** ANAF is processing the submission */
  PROCESSING = 'PROCESSING',
  /** ANAF validated the invoice successfully */
  VALIDATED = 'VALIDATED',
  /** ANAF signed the invoice - final successful state */
  SIGNED = 'SIGNED',
  /** ANAF rejected the invoice due to validation errors */
  REJECTED = 'REJECTED',
  /** Technical error occurred during submission */
  ERROR = 'ERROR',
  /** Submission was manually cancelled */
  CANCELLED = 'CANCELLED',
}

/**
 * E-Factura Log Action Types
 */
export enum EFacturaLogAction {
  /** Initial submission to ANAF */
  SUBMIT = 'SUBMIT',
  /** Status check API call */
  STATUS_CHECK = 'STATUS_CHECK',
  /** Download signed invoice */
  DOWNLOAD = 'DOWNLOAD',
  /** Retry submission */
  RETRY = 'RETRY',
  /** Cancel submission */
  CANCEL = 'CANCEL',
  /** Validation error received */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** API error occurred */
  API_ERROR = 'API_ERROR',
}
