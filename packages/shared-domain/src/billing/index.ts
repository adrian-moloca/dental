/**
 * Billing Domain Module
 *
 * Exports all billing, invoicing, payments, insurance, and finance types.
 *
 * @module shared-domain/billing
 */

// ============================================================================
// Branded Types
// ============================================================================
export type {
  InvoiceId,
  PaymentId,
  InsuranceClaimId,
  LedgerEntryId,
  LedgerAccountId,
  RefundId,
  PriceRuleId,
  PaymentPlanId,
  CreditNoteId,
  InsurancePolicyId,
  TaxRateId,
  CommissionId,
  CUI,
  EFacturaNumber,
  PSPTransactionId,
  MoneyAmount,
} from './billing.types';

// ============================================================================
// Invoice Types
// ============================================================================
export {
  InvoiceStatus,
  ItemType,
} from './billing.types';

export type {
  InvoiceItem,
  Invoice,
} from './billing.types';

// ============================================================================
// Payment Types
// ============================================================================
export {
  PaymentMethod,
  PaymentStatus,
} from './billing.types';

export type {
  SplitPaymentComponent,
  Payment,
  Refund,
} from './billing.types';

// ============================================================================
// Insurance Claim Types
// ============================================================================
export {
  ClaimStatus,
} from './billing.types';

export type {
  CoverageInfo,
  BenefitBreakdown,
  InsuranceClaim,
} from './billing.types';

// ============================================================================
// Ledger & Accounting Types
// ============================================================================
export {
  EntryType,
  AccountType,
} from './billing.types';

export type {
  LedgerEntry,
} from './billing.types';

// ============================================================================
// Pricing & Tax Types
// ============================================================================
export {
  RuleType,
} from './billing.types';

export type {
  PriceRule,
  TaxRate,
} from './billing.types';

// ============================================================================
// Patient Financials Types
// ============================================================================
export type {
  PatientBalance,
  PaymentPlan,
  CreditNote,
} from './billing.types';

// ============================================================================
// Billing Integration Types
// ============================================================================
export type {
  BillableItem,
  ProcedureBilling,
  ImagingBilling,
  ProductBilling,
} from './billing.types';

// ============================================================================
// Commission Types
// ============================================================================
export {
  CommissionType,
} from './billing.types';

export type {
  Commission,
} from './billing.types';
