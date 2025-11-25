import type { UUID, ISODateString, OrganizationId, ClinicId, Metadata } from '@dentalos/shared-types';
import type { MoneyValue } from '../value-objects';
import type { PatientId, ProviderId, ProcedureId } from '../clinical';
import type { ImagingStudyId } from '../imaging';
import type { ProductId, Currency } from '../inventory';
export type InvoiceId = UUID & {
    readonly __brand: 'InvoiceId';
};
export type PaymentId = UUID & {
    readonly __brand: 'PaymentId';
};
export type InsuranceClaimId = UUID & {
    readonly __brand: 'InsuranceClaimId';
};
export type LedgerEntryId = UUID & {
    readonly __brand: 'LedgerEntryId';
};
export type LedgerAccountId = UUID & {
    readonly __brand: 'LedgerAccountId';
};
export type RefundId = UUID & {
    readonly __brand: 'RefundId';
};
export type PriceRuleId = UUID & {
    readonly __brand: 'PriceRuleId';
};
export type PaymentPlanId = UUID & {
    readonly __brand: 'PaymentPlanId';
};
export type CreditNoteId = UUID & {
    readonly __brand: 'CreditNoteId';
};
export type InsurancePolicyId = UUID & {
    readonly __brand: 'InsurancePolicyId';
};
export type TaxRateId = UUID & {
    readonly __brand: 'TaxRateId';
};
export type CommissionId = UUID & {
    readonly __brand: 'CommissionId';
};
export type CUI = string & {
    readonly __brand: 'CUI';
};
export type EFacturaNumber = string & {
    readonly __brand: 'EFacturaNumber';
};
export type PSPTransactionId = string & {
    readonly __brand: 'PSPTransactionId';
};
export type MoneyAmount = number & {
    readonly __brand: 'MoneyAmount';
};
export declare enum InvoiceStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PAID = "PAID",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    OVERDUE = "OVERDUE",
    VOID = "VOID",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED"
}
export declare enum ItemType {
    PROCEDURE = "PROCEDURE",
    IMAGING = "IMAGING",
    PRODUCT = "PRODUCT",
    DISCOUNT = "DISCOUNT",
    FEE = "FEE",
    ADJUSTMENT = "ADJUSTMENT",
    TAX = "TAX"
}
export interface InvoiceItem {
    readonly id: UUID;
    readonly type: ItemType;
    readonly description: string;
    readonly quantity: number;
    readonly unitPrice: MoneyValue;
    readonly subtotal: MoneyValue;
    readonly taxRate: number;
    readonly taxAmount: MoneyValue;
    readonly discount?: MoneyValue;
    readonly total: MoneyValue;
    readonly procedureId?: ProcedureId;
    readonly imagingStudyId?: ImagingStudyId;
    readonly productId?: ProductId;
    readonly providerId?: ProviderId;
    readonly toothNumbers?: number[];
    readonly procedureCode?: string;
    readonly notes?: string;
    readonly metadata?: Metadata;
}
export interface Invoice {
    readonly id: InvoiceId;
    readonly invoiceNumber: string;
    readonly eFacturaNumber?: EFacturaNumber;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly providerId: ProviderId;
    readonly status: InvoiceStatus;
    readonly issueDate: ISODateString;
    readonly dueDate: ISODateString;
    readonly sentDate?: ISODateString;
    readonly paidDate?: ISODateString;
    readonly voidedDate?: ISODateString;
    readonly currency: Currency;
    readonly exchangeRate?: number;
    readonly items: InvoiceItem[];
    readonly subtotal: MoneyValue;
    readonly taxTotal: MoneyValue;
    readonly discountTotal: MoneyValue;
    readonly total: MoneyValue;
    readonly amountPaid: MoneyValue;
    readonly amountDue: MoneyValue;
    readonly amountRefunded?: MoneyValue;
    readonly insuranceClaimId?: InsuranceClaimId;
    readonly insuranceCoverage?: MoneyValue;
    readonly patientResponsibility?: MoneyValue;
    readonly paymentIds: PaymentId[];
    readonly refundIds?: RefundId[];
    readonly patientCUI?: CUI;
    readonly clinicCUI?: CUI;
    readonly billingAddress?: string;
    readonly notes?: string;
    readonly internalNotes?: string;
    readonly terms?: string;
    readonly originalInvoiceId?: InvoiceId;
    readonly voidReason?: string;
    readonly voidedBy?: UUID;
    readonly createdBy: UUID;
    readonly updatedBy?: UUID;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export declare enum PaymentMethod {
    CASH = "CASH",
    CREDIT_CARD = "CREDIT_CARD",
    DEBIT_CARD = "DEBIT_CARD",
    CHECK = "CHECK",
    INSURANCE = "INSURANCE",
    BANK_TRANSFER = "BANK_TRANSFER",
    WIRE_TRANSFER = "WIRE_TRANSFER",
    CRYPTO = "CRYPTO",
    SPLIT = "SPLIT"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    CANCELLED = "CANCELLED"
}
export interface SplitPaymentComponent {
    readonly method: PaymentMethod;
    readonly amount: MoneyValue;
    readonly pspTransactionId?: PSPTransactionId;
    readonly cardLast4?: string;
    readonly cardBrand?: string;
    readonly checkNumber?: string;
    readonly referenceNumber?: string;
    readonly notes?: string;
}
export interface Payment {
    readonly id: PaymentId;
    readonly paymentNumber: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly invoiceIds: InvoiceId[];
    readonly status: PaymentStatus;
    readonly method: PaymentMethod;
    readonly splitComponents?: SplitPaymentComponent[];
    readonly amount: MoneyValue;
    readonly currency: Currency;
    readonly exchangeRate?: number;
    readonly paymentDate: ISODateString;
    readonly processedDate?: ISODateString;
    readonly paymentProvider?: string;
    readonly pspTransactionId?: PSPTransactionId;
    readonly cardLast4?: string;
    readonly cardBrand?: string;
    readonly checkNumber?: string;
    readonly bankReference?: string;
    readonly receiptUrl?: string;
    readonly notes?: string;
    readonly internalNotes?: string;
    readonly refundId?: RefundId;
    readonly amountRefunded?: MoneyValue;
    readonly failureReason?: string;
    readonly createdBy: UUID;
    readonly updatedBy?: UUID;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export interface Refund {
    readonly id: RefundId;
    readonly refundNumber: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly paymentId: PaymentId;
    readonly invoiceIds: InvoiceId[];
    readonly amount: MoneyValue;
    readonly currency: Currency;
    readonly refundDate: ISODateString;
    readonly method: PaymentMethod;
    readonly pspRefundId?: PSPTransactionId;
    readonly reason: string;
    readonly status: PaymentStatus;
    readonly createdBy: UUID;
    readonly createdAt: ISODateString;
    readonly metadata?: Metadata;
}
export declare enum ClaimStatus {
    DRAFT = "DRAFT",
    SUBMITTED = "SUBMITTED",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    PARTIALLY_APPROVED = "PARTIALLY_APPROVED",
    DENIED = "DENIED",
    PAID = "PAID",
    APPEALED = "APPEALED"
}
export interface CoverageInfo {
    readonly policyId: InsurancePolicyId;
    readonly carrierName: string;
    readonly policyNumber: string;
    readonly groupNumber?: string;
    readonly policyHolder?: string;
    readonly relationshipToPatient?: string;
    readonly coveragePercentage: number;
    readonly annualMaximum?: MoneyValue;
    readonly deductible?: MoneyValue;
    readonly deductibleMet?: MoneyValue;
    readonly coverageUsed?: MoneyValue;
    readonly coverageRemaining?: MoneyValue;
    readonly effectiveDate: ISODateString;
    readonly expirationDate?: ISODateString;
    readonly metadata?: Metadata;
}
export interface BenefitBreakdown {
    readonly procedureCode: string;
    readonly billedAmount: MoneyValue;
    readonly allowedAmount: MoneyValue;
    readonly deductibleApplied: MoneyValue;
    readonly coInsurance: MoneyValue;
    readonly copay?: MoneyValue;
    readonly insurancePaid: MoneyValue;
    readonly patientResponsibility: MoneyValue;
    readonly denialReason?: string;
    readonly notes?: string;
}
export interface InsuranceClaim {
    readonly id: InsuranceClaimId;
    readonly claimNumber: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly coverage: CoverageInfo;
    readonly status: ClaimStatus;
    readonly invoiceId: InvoiceId;
    readonly procedureIds: ProcedureId[];
    readonly billedAmount: MoneyValue;
    readonly approvedAmount?: MoneyValue;
    readonly paidAmount?: MoneyValue;
    readonly patientResponsibility?: MoneyValue;
    readonly benefits?: BenefitBreakdown[];
    readonly submissionDate?: ISODateString;
    readonly serviceDate: ISODateString;
    readonly approvalDate?: ISODateString;
    readonly paidDate?: ISODateString;
    readonly deniedDate?: ISODateString;
    readonly denialReason?: string;
    readonly appealDate?: ISODateString;
    readonly appealNotes?: string;
    readonly externalClaimId?: string;
    readonly claimFormType?: string;
    readonly attachments?: string[];
    readonly notes?: string;
    readonly createdBy: UUID;
    readonly updatedBy?: UUID;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export declare enum EntryType {
    DEBIT = "DEBIT",
    CREDIT = "CREDIT"
}
export declare enum AccountType {
    REVENUE = "REVENUE",
    ACCOUNTS_RECEIVABLE = "ACCOUNTS_RECEIVABLE",
    CASH = "CASH",
    COGS = "COGS",
    DISCOUNT = "DISCOUNT",
    INSURANCE = "INSURANCE",
    REFUND = "REFUND",
    ADJUSTMENT = "ADJUSTMENT",
    ACCOUNTS_PAYABLE = "ACCOUNTS_PAYABLE",
    INVENTORY = "INVENTORY",
    PREPAID_EXPENSE = "PREPAID_EXPENSE",
    ACCRUED_EXPENSE = "ACCRUED_EXPENSE",
    DEFERRED_REVENUE = "DEFERRED_REVENUE",
    COMMISSION_PAYABLE = "COMMISSION_PAYABLE",
    TAX_LIABILITY = "TAX_LIABILITY"
}
export interface LedgerEntry {
    readonly id: LedgerEntryId;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly accountId: LedgerAccountId;
    readonly accountType: AccountType;
    readonly entryType: EntryType;
    readonly amount: MoneyValue;
    readonly currency: Currency;
    readonly exchangeRate?: number;
    readonly entryDate: ISODateString;
    readonly description: string;
    readonly invoiceId?: InvoiceId;
    readonly paymentId?: PaymentId;
    readonly insuranceClaimId?: InsuranceClaimId;
    readonly refundId?: RefundId;
    readonly patientId?: PatientId;
    readonly providerId?: ProviderId;
    readonly transactionId: UUID;
    readonly reversesEntryId?: LedgerEntryId;
    readonly reversedByEntryId?: LedgerEntryId;
    readonly fiscalYear: number;
    readonly fiscalPeriod: number;
    readonly createdBy: UUID;
    readonly createdAt: ISODateString;
    readonly metadata?: Metadata;
}
export declare enum RuleType {
    DISCOUNT = "DISCOUNT",
    INSURANCE_RATE = "INSURANCE_RATE",
    PROVIDER_FEE = "PROVIDER_FEE",
    PROCEDURE_FEE = "PROCEDURE_FEE",
    VOLUME_DISCOUNT = "VOLUME_DISCOUNT",
    MEMBERSHIP_DISCOUNT = "MEMBERSHIP_DISCOUNT"
}
export interface PriceRule {
    readonly id: PriceRuleId;
    readonly organizationId: OrganizationId;
    readonly clinicId?: ClinicId;
    readonly type: RuleType;
    readonly name: string;
    readonly description?: string;
    readonly procedureCode?: string;
    readonly providerId?: ProviderId;
    readonly insurancePolicyId?: InsurancePolicyId;
    readonly fixedPrice?: MoneyValue;
    readonly discountPercentage?: number;
    readonly minQuantity?: number;
    readonly priority: number;
    readonly effectiveDate: ISODateString;
    readonly expirationDate?: ISODateString;
    readonly isActive: boolean;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export interface TaxRate {
    readonly id: TaxRateId;
    readonly organizationId: OrganizationId;
    readonly name: string;
    readonly jurisdiction: string;
    readonly rate: number;
    readonly taxType: string;
    readonly applicableCategories?: string[];
    readonly isDefault: boolean;
    readonly effectiveDate: ISODateString;
    readonly expirationDate?: ISODateString;
    readonly isActive: boolean;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export interface PatientBalance {
    readonly patientId: PatientId;
    readonly organizationId: OrganizationId;
    readonly totalBilled: MoneyValue;
    readonly totalPaid: MoneyValue;
    readonly totalInsuranceCovered: MoneyValue;
    readonly currentBalance: MoneyValue;
    readonly creditBalance?: MoneyValue;
    readonly overdueAmount?: MoneyValue;
    readonly overdueInvoiceCount?: number;
    readonly lastPaymentDate?: ISODateString;
    readonly lastPaymentAmount?: MoneyValue;
    readonly paymentPlanId?: PaymentPlanId;
    readonly currency: Currency;
    readonly updatedAt: ISODateString;
}
export interface PaymentPlan {
    readonly id: PaymentPlanId;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly invoiceIds: InvoiceId[];
    readonly status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';
    readonly totalAmount: MoneyValue;
    readonly downPayment?: MoneyValue;
    readonly amountPaid: MoneyValue;
    readonly remainingBalance: MoneyValue;
    readonly installmentCount: number;
    readonly installmentAmount: MoneyValue;
    readonly frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    readonly startDate: ISODateString;
    readonly endDate: ISODateString;
    readonly nextPaymentDate?: ISODateString;
    readonly lateFee?: MoneyValue;
    readonly currency: Currency;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
export interface CreditNote {
    readonly id: CreditNoteId;
    readonly creditNoteNumber: string;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly patientId: PatientId;
    readonly originalInvoiceId: InvoiceId;
    readonly amount: MoneyValue;
    readonly currency: Currency;
    readonly reason: string;
    readonly issueDate: ISODateString;
    readonly appliedToInvoiceId?: InvoiceId;
    readonly refundId?: RefundId;
    readonly createdBy: UUID;
    readonly createdAt: ISODateString;
    readonly metadata?: Metadata;
}
export interface BillableItem {
    readonly type: ItemType;
    readonly description: string;
    readonly quantity: number;
    readonly unitPrice: MoneyValue;
    readonly providerId?: ProviderId;
    readonly sourceId: UUID;
    readonly metadata?: Metadata;
}
export interface ProcedureBilling {
    readonly procedureId: ProcedureId;
    readonly procedureCode: string;
    readonly description: string;
    readonly toothNumbers?: number[];
    readonly providerId: ProviderId;
    readonly patientId: PatientId;
    readonly serviceDate: ISODateString;
    readonly fee: MoneyValue;
    readonly insuranceCoverage?: MoneyValue;
    readonly patientResponsibility: MoneyValue;
    readonly isBilled: boolean;
    readonly invoiceId?: InvoiceId;
    readonly metadata?: Metadata;
}
export interface ImagingBilling {
    readonly imagingStudyId: ImagingStudyId;
    readonly modality: string;
    readonly description: string;
    readonly providerId: ProviderId;
    readonly patientId: PatientId;
    readonly studyDate: ISODateString;
    readonly fee: MoneyValue;
    readonly insuranceCoverage?: MoneyValue;
    readonly patientResponsibility: MoneyValue;
    readonly isBilled: boolean;
    readonly invoiceId?: InvoiceId;
    readonly metadata?: Metadata;
}
export interface ProductBilling {
    readonly productId: ProductId;
    readonly productName: string;
    readonly quantity: number;
    readonly unitPrice: MoneyValue;
    readonly unitCost: MoneyValue;
    readonly totalPrice: MoneyValue;
    readonly totalCost: MoneyValue;
    readonly grossProfit: MoneyValue;
    readonly patientId: PatientId;
    readonly saleDate: ISODateString;
    readonly isBilled: boolean;
    readonly invoiceId?: InvoiceId;
    readonly metadata?: Metadata;
}
export declare enum CommissionType {
    PERCENTAGE = "PERCENTAGE",
    FIXED = "FIXED",
    TIERED = "TIERED",
    HYBRID = "HYBRID"
}
export interface Commission {
    readonly id: CommissionId;
    readonly organizationId: OrganizationId;
    readonly clinicId: ClinicId;
    readonly providerId: ProviderId;
    readonly invoiceId: InvoiceId;
    readonly procedureIds: ProcedureId[];
    readonly commissionType: CommissionType;
    readonly baseAmount: MoneyValue;
    readonly commissionRate?: number;
    readonly commissionAmount: MoneyValue;
    readonly currency: Currency;
    readonly serviceDate: ISODateString;
    readonly commissionPeriod: string;
    readonly isPaid: boolean;
    readonly paidDate?: ISODateString;
    readonly paymentReference?: string;
    readonly createdAt: ISODateString;
    readonly updatedAt: ISODateString;
    readonly metadata?: Metadata;
}
