import { registerAs } from '@nestjs/config';

export default registerAs('billing', () => ({
  currency: process.env.BILLING_CURRENCY || 'USD',
  autoGenerateInvoices: process.env.BILLING_AUTO_GENERATE_INVOICES === 'true',
  invoiceDueDays: parseInt(process.env.INVOICE_DUE_DAYS || '30', 10),
  overdueThresholdDays: parseInt(process.env.OVERDUE_THRESHOLD_DAYS || '7', 10),
  taxDefaultRate: parseFloat(process.env.TAX_DEFAULT_RATE || '0.10'),
  ledgerAutoPost: process.env.LEDGER_AUTO_POST === 'true',
  ledgerRequireBalance: process.env.LEDGER_REQUIRE_BALANCE !== 'false',
}));
