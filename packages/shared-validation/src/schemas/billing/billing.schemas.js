"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryPatientBalanceDtoSchema = exports.CreateTaxRateDtoSchema = exports.ApplyPriceRuleDtoSchema = exports.CreatePriceRuleDtoSchema = exports.RuleTypeSchema = exports.UpdateClaimStatusDtoSchema = exports.CreateInsuranceClaimDtoSchema = exports.ClaimStatusSchema = exports.RefundPaymentDtoSchema = exports.RecordSplitPaymentDtoSchema = exports.SplitPaymentItemSchema = exports.RecordPaymentDtoSchema = exports.PaymentMethodSchema = exports.UpdateInvoiceItemDtoSchema = exports.AddInvoiceItemDtoSchema = exports.QueryInvoicesDtoSchema = exports.UpdateInvoiceStatusDtoSchema = exports.CreateInvoiceDtoSchema = exports.ItemTypeSchema = exports.InvoiceStatusSchema = exports.TaxRateSchema = exports.NonNegativeMoneyAmountSchema = exports.PositiveMoneyAmountSchema = exports.MoneyAmountSchema = void 0;
const zod_1 = require("zod");
const shared_types_1 = require("@dentalos/shared-types");
const common_schemas_1 = require("../common.schemas");
exports.MoneyAmountSchema = zod_1.z
    .number()
    .refine((val) => {
    const str = val.toString();
    const decimalIndex = str.indexOf('.');
    if (decimalIndex === -1)
        return true;
    return str.length - decimalIndex - 1 <= 2;
}, {
    message: 'Amount must have at most 2 decimal places',
})
    .describe('Money amount - must be stored as DECIMAL in database, never FLOAT');
exports.PositiveMoneyAmountSchema = zod_1.z
    .number()
    .positive('Amount must be greater than zero')
    .refine((val) => {
    const str = val.toString();
    const decimalIndex = str.indexOf('.');
    if (decimalIndex === -1)
        return true;
    return str.length - decimalIndex - 1 <= 2;
}, {
    message: 'Amount must have at most 2 decimal places',
})
    .describe('Positive money amount - must be stored as DECIMAL in database');
exports.NonNegativeMoneyAmountSchema = zod_1.z
    .number()
    .nonnegative('Amount must be zero or greater')
    .refine((val) => {
    const str = val.toString();
    const decimalIndex = str.indexOf('.');
    if (decimalIndex === -1)
        return true;
    return str.length - decimalIndex - 1 <= 2;
}, {
    message: 'Amount must have at most 2 decimal places',
})
    .describe('Non-negative money amount - must be stored as DECIMAL in database');
exports.TaxRateSchema = zod_1.z
    .number()
    .min(0, 'Tax rate must be between 0 and 1')
    .max(1, 'Tax rate must be between 0 and 1')
    .describe('Tax rate as decimal (0.0 = 0%, 0.19 = 19%, 1.0 = 100%)');
exports.InvoiceStatusSchema = zod_1.z.enum([
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'OVERDUE',
    'CANCELLED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
], {
    errorMap: () => ({ message: 'Invalid invoice status' }),
});
exports.ItemTypeSchema = zod_1.z.enum([
    'PROCEDURE',
    'PRODUCT',
    'SERVICE',
    'LAB_FEE',
    'ADJUSTMENT',
    'TAX',
    'OTHER',
], {
    errorMap: () => ({ message: 'Invalid invoice item type' }),
});
exports.CreateInvoiceDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema,
    providerId: common_schemas_1.UUIDSchema,
    clinicId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    invoiceNumber: common_schemas_1.NonEmptyStringSchema.max(50, 'Invoice number must be 50 characters or less').optional(),
    issueDate: common_schemas_1.DateOnlySchema,
    dueDate: common_schemas_1.DateOnlySchema,
    currency: common_schemas_1.CurrencyCodeSchema.default(shared_types_1.CurrencyCode.USD),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    internalNotes: zod_1.z.string().max(2000, 'Internal notes must be 2000 characters or less').optional(),
    customerCUI: zod_1.z.string().max(20, 'CUI must be 20 characters or less').optional(),
    customerName: common_schemas_1.NonEmptyStringSchema.max(200, 'Customer name must be 200 characters or less').optional(),
    customerAddress: zod_1.z.string().max(500, 'Customer address must be 500 characters or less').optional(),
    paymentTerms: zod_1.z.string().max(500, 'Payment terms must be 500 characters or less').optional(),
})
    .refine((data) => {
    const issueDate = new Date(data.issueDate);
    const dueDate = new Date(data.dueDate);
    return dueDate >= issueDate;
}, {
    message: 'Due date must be on or after issue date',
    path: ['dueDate'],
})
    .refine((data) => {
    const issueDate = new Date(data.issueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return issueDate <= today;
}, {
    message: 'Issue date cannot be in the future',
    path: ['issueDate'],
});
exports.UpdateInvoiceStatusDtoSchema = zod_1.z.object({
    status: exports.InvoiceStatusSchema,
    reason: zod_1.z
        .string()
        .max(1000, 'Reason must be 1000 characters or less')
        .optional()
        .describe('Required for CANCELLED status'),
    updatedBy: common_schemas_1.UUIDSchema,
});
exports.QueryInvoicesDtoSchema = zod_1.z
    .object({
    patientId: common_schemas_1.UUIDSchema.optional(),
    providerId: common_schemas_1.UUIDSchema.optional(),
    clinicId: common_schemas_1.UUIDSchema.optional(),
    appointmentId: common_schemas_1.UUIDSchema.optional(),
    treatmentPlanId: common_schemas_1.UUIDSchema.optional(),
    invoiceNumber: zod_1.z.string().max(50).optional(),
    status: zod_1.z.array(exports.InvoiceStatusSchema).optional(),
    issueDateFrom: common_schemas_1.DateOnlySchema.optional(),
    issueDateTo: common_schemas_1.DateOnlySchema.optional(),
    dueDateFrom: common_schemas_1.DateOnlySchema.optional(),
    dueDateTo: common_schemas_1.DateOnlySchema.optional(),
    minAmount: exports.NonNegativeMoneyAmountSchema.optional(),
    maxAmount: exports.NonNegativeMoneyAmountSchema.optional(),
    currency: common_schemas_1.CurrencyCodeSchema.optional(),
    searchTerm: zod_1.z.string().max(200).optional(),
    page: common_schemas_1.PositiveIntSchema.default(1),
    limit: common_schemas_1.PositiveIntSchema.min(1).max(100).default(20),
    sortBy: zod_1.z
        .enum(['invoiceNumber', 'issueDate', 'dueDate', 'totalAmount', 'status', 'patientName', 'createdAt'])
        .default('issueDate'),
    sortOrder: common_schemas_1.SortOrderSchema.default('desc'),
})
    .refine((data) => {
    if (data.issueDateFrom && data.issueDateTo) {
        return data.issueDateFrom <= data.issueDateTo;
    }
    return true;
}, {
    message: 'issueDateFrom must be before or equal to issueDateTo',
    path: ['issueDateFrom'],
})
    .refine((data) => {
    if (data.dueDateFrom && data.dueDateTo) {
        return data.dueDateFrom <= data.dueDateTo;
    }
    return true;
}, {
    message: 'dueDateFrom must be before or equal to dueDateTo',
    path: ['dueDateFrom'],
})
    .refine((data) => {
    if (data.minAmount !== undefined && data.maxAmount !== undefined) {
        return data.minAmount <= data.maxAmount;
    }
    return true;
}, {
    message: 'minAmount must be less than or equal to maxAmount',
    path: ['minAmount'],
});
exports.AddInvoiceItemDtoSchema = zod_1.z.object({
    invoiceId: common_schemas_1.UUIDSchema,
    itemType: exports.ItemTypeSchema,
    referenceId: common_schemas_1.UUIDSchema.optional(),
    code: common_schemas_1.NonEmptyStringSchema.max(100, 'Code must be 100 characters or less'),
    description: common_schemas_1.NonEmptyStringSchema.max(500, 'Description must be 500 characters or less'),
    quantity: zod_1.z.number().positive('Quantity must be greater than zero'),
    unitPrice: exports.MoneyAmountSchema,
    taxRate: exports.TaxRateSchema.default(0),
    discount: exports.NonNegativeMoneyAmountSchema.default(0),
    notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});
exports.UpdateInvoiceItemDtoSchema = zod_1.z.object({
    itemType: exports.ItemTypeSchema.optional(),
    code: common_schemas_1.NonEmptyStringSchema.max(100, 'Code must be 100 characters or less').optional(),
    description: common_schemas_1.NonEmptyStringSchema.max(500, 'Description must be 500 characters or less').optional(),
    quantity: zod_1.z.number().positive('Quantity must be greater than zero').optional(),
    unitPrice: exports.MoneyAmountSchema.optional(),
    taxRate: exports.TaxRateSchema.optional(),
    discount: exports.NonNegativeMoneyAmountSchema.optional(),
    notes: zod_1.z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
});
exports.PaymentMethodSchema = zod_1.z.enum([
    'CASH',
    'CARD',
    'BANK_TRANSFER',
    'CHECK',
    'INSURANCE',
    'ONLINE',
    'MOBILE_PAYMENT',
    'VOUCHER',
    'OTHER',
], {
    errorMap: () => ({ message: 'Invalid payment method' }),
});
exports.RecordPaymentDtoSchema = zod_1.z
    .object({
    invoiceId: common_schemas_1.UUIDSchema,
    amount: exports.PositiveMoneyAmountSchema,
    paymentMethod: exports.PaymentMethodSchema,
    paymentDate: common_schemas_1.DateOnlySchema,
    transactionId: common_schemas_1.NonEmptyStringSchema.max(200, 'Transaction ID must be 200 characters or less').optional(),
    referenceNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Reference number must be 100 characters or less').optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    receivedBy: common_schemas_1.UUIDSchema,
    currency: common_schemas_1.CurrencyCodeSchema.optional(),
    exchangeRate: zod_1.z.number().positive().optional(),
})
    .refine((data) => {
    const today = new Date().toISOString().split('T')[0];
    return data.paymentDate <= today;
}, {
    message: 'Payment date cannot be in the future',
    path: ['paymentDate'],
})
    .refine((data) => {
    if (data.currency && !data.exchangeRate) {
        return false;
    }
    return true;
}, {
    message: 'Exchange rate is required when currency is different from invoice currency',
    path: ['exchangeRate'],
});
exports.SplitPaymentItemSchema = zod_1.z.object({
    paymentMethod: exports.PaymentMethodSchema,
    amount: exports.PositiveMoneyAmountSchema,
    transactionId: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    referenceNumber: common_schemas_1.NonEmptyStringSchema.max(100).optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.RecordSplitPaymentDtoSchema = zod_1.z
    .object({
    invoiceId: common_schemas_1.UUIDSchema,
    splitPayments: zod_1.z
        .array(exports.SplitPaymentItemSchema)
        .min(1, 'At least one payment method is required')
        .max(10, 'Maximum 10 payment methods allowed per split payment'),
    totalAmount: exports.PositiveMoneyAmountSchema,
    paymentDate: common_schemas_1.DateOnlySchema,
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    receivedBy: common_schemas_1.UUIDSchema,
})
    .refine((data) => {
    const sum = data.splitPayments.reduce((acc, item) => acc + item.amount, 0);
    return Math.abs(sum - data.totalAmount) < 0.01;
}, {
    message: 'Sum of split payment amounts must equal total amount',
    path: ['splitPayments'],
})
    .refine((data) => {
    const today = new Date().toISOString().split('T')[0];
    return data.paymentDate <= today;
}, {
    message: 'Payment date cannot be in the future',
    path: ['paymentDate'],
});
exports.RefundPaymentDtoSchema = zod_1.z.object({
    paymentId: common_schemas_1.UUIDSchema,
    refundAmount: exports.PositiveMoneyAmountSchema,
    reason: common_schemas_1.NonEmptyStringSchema.max(1000, 'Reason must be 1000 characters or less'),
    refundDate: common_schemas_1.DateOnlySchema,
    refundMethod: exports.PaymentMethodSchema.optional(),
    transactionId: common_schemas_1.NonEmptyStringSchema.max(200).optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    processedBy: common_schemas_1.UUIDSchema,
});
exports.ClaimStatusSchema = zod_1.z.enum([
    'DRAFT',
    'SUBMITTED',
    'PENDING_REVIEW',
    'APPROVED',
    'PARTIALLY_APPROVED',
    'DENIED',
    'PAID',
    'APPEALED',
    'CANCELLED',
], {
    errorMap: () => ({ message: 'Invalid claim status' }),
});
exports.CreateInsuranceClaimDtoSchema = zod_1.z.object({
    invoiceId: common_schemas_1.UUIDSchema,
    patientId: common_schemas_1.UUIDSchema,
    insuranceProviderId: common_schemas_1.UUIDSchema,
    policyNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Policy number must be 100 characters or less'),
    claimedAmount: exports.PositiveMoneyAmountSchema,
    procedureCodes: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema.max(50, 'Procedure code must be 50 characters or less'))
        .min(1, 'At least one procedure code is required')
        .max(50, 'Maximum 50 procedure codes per claim'),
    diagnosisCodes: zod_1.z
        .array(common_schemas_1.NonEmptyStringSchema.max(50, 'Diagnosis code must be 50 characters or less'))
        .max(20, 'Maximum 20 diagnosis codes per claim')
        .optional(),
    treatmentDate: common_schemas_1.DateOnlySchema,
    submissionDate: common_schemas_1.DateOnlySchema.optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    attachments: zod_1.z
        .array(common_schemas_1.UUIDSchema)
        .max(20, 'Maximum 20 attachments per claim')
        .optional(),
    submittedBy: common_schemas_1.UUIDSchema,
});
exports.UpdateClaimStatusDtoSchema = zod_1.z
    .object({
    status: exports.ClaimStatusSchema,
    approvedAmount: exports.NonNegativeMoneyAmountSchema.optional(),
    denialReason: zod_1.z.string().max(1000, 'Denial reason must be 1000 characters or less').optional(),
    insurerReferenceNumber: common_schemas_1.NonEmptyStringSchema.max(100, 'Insurer reference number must be 100 characters or less').optional(),
    responseDate: common_schemas_1.DateOnlySchema.optional(),
    notes: zod_1.z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
    updatedBy: common_schemas_1.UUIDSchema,
})
    .refine((data) => {
    if ((data.status === 'APPROVED' || data.status === 'PARTIALLY_APPROVED') &&
        data.approvedAmount === undefined) {
        return false;
    }
    return true;
}, {
    message: 'Approved amount is required for APPROVED or PARTIALLY_APPROVED status',
    path: ['approvedAmount'],
})
    .refine((data) => {
    if (data.status === 'DENIED' && !data.denialReason) {
        return false;
    }
    return true;
}, {
    message: 'Denial reason is required for DENIED status',
    path: ['denialReason'],
});
exports.RuleTypeSchema = zod_1.z.enum([
    'PERCENTAGE_DISCOUNT',
    'FIXED_DISCOUNT',
    'FIXED_PRICE',
    'PERCENTAGE_MARKUP',
    'FIXED_MARKUP',
    'TIERED_PRICING',
    'BUNDLE_DISCOUNT',
], {
    errorMap: () => ({ message: 'Invalid rule type' }),
});
exports.CreatePriceRuleDtoSchema = zod_1.z
    .object({
    name: common_schemas_1.NonEmptyStringSchema.max(200, 'Name must be 200 characters or less'),
    description: zod_1.z.string().max(1000, 'Description must be 1000 characters or less').optional(),
    ruleType: exports.RuleTypeSchema,
    applicableTo: zod_1.z.enum(['PROCEDURE', 'PRODUCT', 'SERVICE', 'CATEGORY', 'ALL']),
    targetIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    value: zod_1.z.number(),
    validFrom: common_schemas_1.DateOnlySchema,
    validTo: common_schemas_1.DateOnlySchema.optional(),
    priority: common_schemas_1.NonNegativeIntSchema.default(0),
    isActive: zod_1.z.boolean().default(true),
    minQuantity: zod_1.z.number().positive().optional(),
    maxQuantity: zod_1.z.number().positive().optional(),
    requiresInsurance: zod_1.z.boolean().default(false),
    requiresCouponCode: zod_1.z.boolean().default(false),
    couponCode: common_schemas_1.NonEmptyStringSchema.max(50).optional(),
    clinicIds: zod_1.z.array(common_schemas_1.UUIDSchema).optional(),
    patientCategories: zod_1.z.array(common_schemas_1.NonEmptyStringSchema.max(50)).optional(),
    createdBy: common_schemas_1.UUIDSchema,
})
    .refine((data) => {
    if (data.validTo) {
        return new Date(data.validTo) >= new Date(data.validFrom);
    }
    return true;
}, {
    message: 'validTo must be on or after validFrom',
    path: ['validTo'],
})
    .refine((data) => {
    if (data.ruleType === 'PERCENTAGE_DISCOUNT' && (data.value < 0 || data.value > 100)) {
        return false;
    }
    return true;
}, {
    message: 'Percentage discount must be between 0 and 100',
    path: ['value'],
})
    .refine((data) => {
    if (data.requiresCouponCode && !data.couponCode) {
        return false;
    }
    return true;
}, {
    message: 'Coupon code is required when requiresCouponCode is true',
    path: ['couponCode'],
})
    .refine((data) => {
    if (data.minQuantity !== undefined && data.maxQuantity !== undefined) {
        return data.minQuantity <= data.maxQuantity;
    }
    return true;
}, {
    message: 'minQuantity must be less than or equal to maxQuantity',
    path: ['minQuantity'],
});
exports.ApplyPriceRuleDtoSchema = zod_1.z.object({
    procedureId: common_schemas_1.UUIDSchema.optional(),
    productId: common_schemas_1.UUIDSchema.optional(),
    serviceId: common_schemas_1.UUIDSchema.optional(),
    quantity: zod_1.z.number().positive().default(1),
    patientId: common_schemas_1.UUIDSchema.optional(),
    couponCode: common_schemas_1.NonEmptyStringSchema.max(50).optional(),
    applyDate: common_schemas_1.DateOnlySchema.optional(),
});
exports.CreateTaxRateDtoSchema = zod_1.z.object({
    name: common_schemas_1.NonEmptyStringSchema.max(100, 'Name must be 100 characters or less'),
    rate: exports.TaxRateSchema,
    jurisdictionId: common_schemas_1.UUIDSchema.optional(),
    jurisdictionCode: common_schemas_1.NonEmptyStringSchema.max(10).optional(),
    applicableTo: zod_1.z.enum(['ALL', 'PRODUCTS', 'SERVICES', 'MEDICAL', 'DENTAL']).default('ALL'),
    isDefault: zod_1.z.boolean().default(false),
    validFrom: common_schemas_1.DateOnlySchema,
    validTo: common_schemas_1.DateOnlySchema.optional(),
    description: zod_1.z.string().max(500).optional(),
    isActive: zod_1.z.boolean().default(true),
    createdBy: common_schemas_1.UUIDSchema,
});
exports.QueryPatientBalanceDtoSchema = zod_1.z.object({
    patientId: common_schemas_1.UUIDSchema,
    asOfDate: common_schemas_1.DateOnlySchema.optional(),
    includeProjections: zod_1.z.boolean().default(false),
    currency: common_schemas_1.CurrencyCodeSchema.optional(),
});
//# sourceMappingURL=billing.schemas.js.map