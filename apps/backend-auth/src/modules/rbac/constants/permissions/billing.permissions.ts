/**
 * Billing Module Permissions
 * Covers: invoices, payments, insurance, financial reports
 *
 * DESIGN PRINCIPLES:
 * - Financial permissions require strict audit trails
 * - Separation of duties for fraud prevention
 * - Compliance with PCI-DSS and financial regulations
 */

/**
 * Financial operations and revenue cycle management permissions
 */
export const BILLING_PERMISSIONS = {
  INVOICE: {
    /**
     * Create invoices for services
     * Grants: Generate invoices with line items and tax
     * Used by: receptionist, billing_specialist, doctor (procedure-triggered)
     */
    CREATE: 'billing.invoice.create',

    /**
     * View invoice details
     * Grants: Read invoice line items, amounts, and status
     * Used by: receptionist, billing_specialist, clinic_manager
     */
    READ: 'billing.invoice.read',

    /**
     * Modify invoice line items
     * Grants: Edit invoice before finalization
     * Used by: billing_specialist only (to prevent fraud)
     */
    UPDATE: 'billing.invoice.update',

    /**
     * Void or cancel invoices
     * Grants: Permanently cancel invoices (requires audit trail)
     * Used by: billing_specialist, tenant_admin
     */
    DELETE: 'billing.invoice.delete',

    /**
     * View invoice lists
     * Grants: Access to invoice history and search
     * Used by: receptionist, billing_specialist
     */
    LIST: 'billing.invoice.list',
  },

  PAYMENT: {
    /**
     * Record patient payments
     * Grants: Process cash, card, check, or payment plan payments
     * Used by: receptionist, billing_specialist
     */
    CREATE: 'billing.payment.create',

    /**
     * View payment history
     * Grants: Read payment records and receipts
     * Used by: receptionist, billing_specialist
     */
    READ: 'billing.payment.read',

    /**
     * Issue refunds
     * Grants: Process refunds to patients (requires reason)
     * Used by: billing_specialist, tenant_admin (requires approval)
     */
    REFUND: 'billing.payment.refund',

    /**
     * View payment lists
     * Grants: Access to payment history and reconciliation
     * Used by: billing_specialist, clinic_manager
     */
    LIST: 'billing.payment.list',
  },

  INSURANCE: {
    /**
     * Manage insurance claims
     * Grants: Submit claims, verify eligibility, post EOBs
     * Used by: billing_specialist only (specialized workflow)
     */
    MANAGE: 'billing.insurance.manage',
  },

  REPORTS: {
    /**
     * View financial reports
     * Grants: Access to revenue, AR aging, collection reports
     * Used by: billing_specialist, clinic_manager, tenant_admin
     */
    VIEW: 'billing.reports.view',
  },
} as const;

/**
 * Flatten billing permissions into array for validation and iteration
 */
export const BILLING_PERMISSION_LIST = Object.values(BILLING_PERMISSIONS).flatMap((category) =>
  Object.values(category)
);

/**
 * Permission count for this module
 */
export const BILLING_PERMISSION_COUNT = BILLING_PERMISSION_LIST.length;
