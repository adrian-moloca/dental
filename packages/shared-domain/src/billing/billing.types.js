"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionType = exports.RuleType = exports.AccountType = exports.EntryType = exports.ClaimStatus = exports.PaymentStatus = exports.PaymentMethod = exports.ItemType = exports.InvoiceStatus = void 0;
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["SENT"] = "SENT";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["OVERDUE"] = "OVERDUE";
    InvoiceStatus["VOID"] = "VOID";
    InvoiceStatus["REFUNDED"] = "REFUNDED";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var ItemType;
(function (ItemType) {
    ItemType["PROCEDURE"] = "PROCEDURE";
    ItemType["IMAGING"] = "IMAGING";
    ItemType["PRODUCT"] = "PRODUCT";
    ItemType["DISCOUNT"] = "DISCOUNT";
    ItemType["FEE"] = "FEE";
    ItemType["ADJUSTMENT"] = "ADJUSTMENT";
    ItemType["TAX"] = "TAX";
})(ItemType || (exports.ItemType = ItemType = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CREDIT_CARD"] = "CREDIT_CARD";
    PaymentMethod["DEBIT_CARD"] = "DEBIT_CARD";
    PaymentMethod["CHECK"] = "CHECK";
    PaymentMethod["INSURANCE"] = "INSURANCE";
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["WIRE_TRANSFER"] = "WIRE_TRANSFER";
    PaymentMethod["CRYPTO"] = "CRYPTO";
    PaymentMethod["SPLIT"] = "SPLIT";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var ClaimStatus;
(function (ClaimStatus) {
    ClaimStatus["DRAFT"] = "DRAFT";
    ClaimStatus["SUBMITTED"] = "SUBMITTED";
    ClaimStatus["PENDING"] = "PENDING";
    ClaimStatus["APPROVED"] = "APPROVED";
    ClaimStatus["PARTIALLY_APPROVED"] = "PARTIALLY_APPROVED";
    ClaimStatus["DENIED"] = "DENIED";
    ClaimStatus["PAID"] = "PAID";
    ClaimStatus["APPEALED"] = "APPEALED";
})(ClaimStatus || (exports.ClaimStatus = ClaimStatus = {}));
var EntryType;
(function (EntryType) {
    EntryType["DEBIT"] = "DEBIT";
    EntryType["CREDIT"] = "CREDIT";
})(EntryType || (exports.EntryType = EntryType = {}));
var AccountType;
(function (AccountType) {
    AccountType["REVENUE"] = "REVENUE";
    AccountType["ACCOUNTS_RECEIVABLE"] = "ACCOUNTS_RECEIVABLE";
    AccountType["CASH"] = "CASH";
    AccountType["COGS"] = "COGS";
    AccountType["DISCOUNT"] = "DISCOUNT";
    AccountType["INSURANCE"] = "INSURANCE";
    AccountType["REFUND"] = "REFUND";
    AccountType["ADJUSTMENT"] = "ADJUSTMENT";
    AccountType["ACCOUNTS_PAYABLE"] = "ACCOUNTS_PAYABLE";
    AccountType["INVENTORY"] = "INVENTORY";
    AccountType["PREPAID_EXPENSE"] = "PREPAID_EXPENSE";
    AccountType["ACCRUED_EXPENSE"] = "ACCRUED_EXPENSE";
    AccountType["DEFERRED_REVENUE"] = "DEFERRED_REVENUE";
    AccountType["COMMISSION_PAYABLE"] = "COMMISSION_PAYABLE";
    AccountType["TAX_LIABILITY"] = "TAX_LIABILITY";
})(AccountType || (exports.AccountType = AccountType = {}));
var RuleType;
(function (RuleType) {
    RuleType["DISCOUNT"] = "DISCOUNT";
    RuleType["INSURANCE_RATE"] = "INSURANCE_RATE";
    RuleType["PROVIDER_FEE"] = "PROVIDER_FEE";
    RuleType["PROCEDURE_FEE"] = "PROCEDURE_FEE";
    RuleType["VOLUME_DISCOUNT"] = "VOLUME_DISCOUNT";
    RuleType["MEMBERSHIP_DISCOUNT"] = "MEMBERSHIP_DISCOUNT";
})(RuleType || (exports.RuleType = RuleType = {}));
var CommissionType;
(function (CommissionType) {
    CommissionType["PERCENTAGE"] = "PERCENTAGE";
    CommissionType["FIXED"] = "FIXED";
    CommissionType["TIERED"] = "TIERED";
    CommissionType["HYBRID"] = "HYBRID";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
//# sourceMappingURL=billing.types.js.map