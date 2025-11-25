import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';
import { InvoicesService } from '../../src/modules/invoices/invoices.service';
import { InvoiceItemsService } from '../../src/modules/invoice-items/invoice-items.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { LedgerService } from '../../src/modules/ledger/ledger.service';
import { PatientBalancesService } from '../../src/modules/patient-balances/patient-balances.service';
import { InvoicesModule } from '../../src/modules/invoices/invoices.module';
import { InvoiceItemsModule } from '../../src/modules/invoice-items/invoice-items.module';
import { PaymentsModule } from '../../src/modules/payments/payments.module';
import { LedgerModule } from '../../src/modules/ledger/ledger.module';
import { PatientBalancesModule } from '../../src/modules/patient-balances/patient-balances.module';
import { InvoiceItemType, PaymentMethod, InvoiceStatus } from '../../src/common/types';
import { Money } from '../../src/common/utils/money.utils';

describe('Invoice Flow Integration Tests', () => {
  let module: TestingModule;
  let invoicesService: InvoicesService;
  let invoiceItemsService: InvoiceItemsService;
  let paymentsService: PaymentsService;
  let ledgerService: LedgerService;
  let patientBalancesService: PatientBalancesService;

  const tenantContext = {
    tenantId: 'test-tenant-id',
    organizationId: 'test-org-id',
    clinicId: 'test-clinic-id',
    userId: 'test-user-id',
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        MongooseModule.forRoot('mongodb://localhost:27017/billing-test'),
        EventEmitterModule.forRoot(),
        InvoicesModule,
        InvoiceItemsModule,
        PaymentsModule,
        LedgerModule,
        PatientBalancesModule,
      ],
    }).compile();

    invoicesService = module.get<InvoicesService>(InvoicesService);
    invoiceItemsService = module.get<InvoiceItemsService>(InvoiceItemsService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    ledgerService = module.get<LedgerService>(LedgerService);
    patientBalancesService = module.get<PatientBalancesService>(
      PatientBalancesService,
    );
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Complete Invoice Lifecycle', () => {
    it('should create invoice, add items, issue, receive payment, and verify ledger', async () => {
      // 1. Create invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await invoicesService.create(
        {
          patientId: 'patient-123',
          providerId: 'provider-456',
          appointmentId: 'appointment-789',
          issueDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          currency: 'USD',
        },
        tenantContext,
      );

      expect(invoice).toBeDefined();
      expect(invoice.status).toBe(InvoiceStatus.DRAFT);
      expect(invoice.total).toBe(0);

      // 2. Add procedure item
      const procedureItem = await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          referenceId: 'procedure-001',
          code: 'D0150',
          description: 'Comprehensive Oral Evaluation',
          quantity: 1,
          unitPrice: 100,
          taxRate: 0.1,
          providerId: 'provider-456',
        },
        tenantContext,
      );

      expect(procedureItem).toBeDefined();
      expect(procedureItem.totalPrice).toBe(100);
      expect(procedureItem.taxAmount).toBe(10);

      // 3. Add imaging item
      const imagingItem = await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.IMAGING,
          referenceId: 'imaging-001',
          code: 'D0330',
          description: 'Panoramic Radiograph',
          quantity: 1,
          unitPrice: 150,
          taxRate: 0.1,
        },
        tenantContext,
      );

      expect(imagingItem).toBeDefined();

      // 4. Verify invoice totals were recalculated
      const updatedInvoice = await invoicesService.findOne(
        invoice._id.toString(),
        tenantContext,
      );

      expect(updatedInvoice.subtotal).toBe(250); // 100 + 150
      expect(updatedInvoice.taxAmount).toBe(25); // 10% of 250
      expect(updatedInvoice.total).toBe(275); // 250 + 25
      expect(updatedInvoice.balance).toBe(275);

      // 5. Issue invoice (creates ledger entries)
      await invoicesService.issueInvoice(invoice._id.toString(), tenantContext);

      const issuedInvoice = await invoicesService.findOne(
        invoice._id.toString(),
        tenantContext,
      );

      expect(issuedInvoice.status).toBe(InvoiceStatus.SENT);

      // 6. Verify ledger entries for invoice issuance
      const invoiceLedgerEntries = await ledgerService.getEntriesForInvoice(
        invoice._id,
      );

      expect(invoiceLedgerEntries.length).toBeGreaterThan(0);

      // Verify double-entry balance
      const debits = Money.sum(
        invoiceLedgerEntries
          .filter((e) => e.entryType === 'DEBIT')
          .map((e) => new Money(e.amount)),
      );

      const credits = Money.sum(
        invoiceLedgerEntries
          .filter((e) => e.entryType === 'CREDIT')
          .map((e) => new Money(e.amount)),
      );

      expect(debits.equals(credits)).toBe(true);

      // 7. Record payment
      const payment = await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: 'patient-123',
          paymentDate: new Date().toISOString(),
          amount: 275,
          currency: 'USD',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          transactionId: 'txn-12345',
        },
        tenantContext,
      );

      expect(payment).toBeDefined();
      expect(payment.amount).toBe(275);
      expect(payment.status).toBe('COMPLETED');

      // 8. Verify invoice is paid
      const paidInvoice = await invoicesService.findOne(
        invoice._id.toString(),
        tenantContext,
      );

      expect(paidInvoice.status).toBe(InvoiceStatus.PAID);
      expect(paidInvoice.amountPaid).toBe(275);
      expect(paidInvoice.balance).toBe(0);

      // 9. Verify payment ledger entries
      const paymentLedgerEntries = await ledgerService.getEntriesForPayment(
        payment._id,
      );

      expect(paymentLedgerEntries.length).toBe(2); // DEBIT Cash, CREDIT A/R

      // 10. Verify patient balance
      const patientBalance = await patientBalancesService.getBalance(
        'patient-123',
        tenantContext,
      );

      expect(patientBalance.currentBalance).toBe(0);
      expect(patientBalance.totalInvoiced).toBe(275);
      expect(patientBalance.totalPaid).toBe(275);
    });

    it('should handle partial payment correctly', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create invoice
      const invoice = await invoicesService.create(
        {
          patientId: 'patient-456',
          providerId: 'provider-789',
          issueDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          currency: 'USD',
        },
        tenantContext,
      );

      // Add item
      await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          code: 'D0220',
          description: 'Intraoral X-ray',
          quantity: 1,
          unitPrice: 200,
          taxRate: 0.1,
        },
        tenantContext,
      );

      // Issue invoice
      await invoicesService.issueInvoice(invoice._id.toString(), tenantContext);

      // Partial payment
      await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: 'patient-456',
          paymentDate: new Date().toISOString(),
          amount: 110, // Half of 220 total
          currency: 'USD',
          paymentMethod: PaymentMethod.CASH,
        },
        tenantContext,
      );

      const partiallyPaidInvoice = await invoicesService.findOne(
        invoice._id.toString(),
        tenantContext,
      );

      expect(partiallyPaidInvoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(partiallyPaidInvoice.amountPaid).toBe(110);
      expect(partiallyPaidInvoice.balance).toBe(110);
    });

    it('should handle refund correctly', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Create and pay invoice
      const invoice = await invoicesService.create(
        {
          patientId: 'patient-789',
          providerId: 'provider-123',
          issueDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          currency: 'USD',
        },
        tenantContext,
      );

      await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          code: 'D1110',
          description: 'Adult Prophylaxis',
          quantity: 1,
          unitPrice: 100,
          taxRate: 0.1,
        },
        tenantContext,
      );

      await invoicesService.issueInvoice(invoice._id.toString(), tenantContext);

      const payment = await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: 'patient-789',
          paymentDate: new Date().toISOString(),
          amount: 110,
          currency: 'USD',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          transactionId: 'txn-refund-test',
        },
        tenantContext,
      );

      // Process refund
      const refundedPayment = await paymentsService.createRefund(
        {
          paymentId: payment._id.toString(),
          amount: 55, // Partial refund
          reason: 'Service not completed',
        },
        tenantContext,
      );

      expect(refundedPayment.refundedAmount).toBe(55);
      expect(refundedPayment.status).toBe('COMPLETED'); // Still completed, not fully refunded

      // Verify invoice updated
      const refundedInvoice = await invoicesService.findOne(
        invoice._id.toString(),
        tenantContext,
      );

      expect(refundedInvoice.amountPaid).toBe(55); // 110 - 55
      expect(refundedInvoice.balance).toBe(55);
    });

    it('should handle split payment correctly', async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await invoicesService.create(
        {
          patientId: 'patient-split',
          providerId: 'provider-split',
          issueDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          currency: 'USD',
        },
        tenantContext,
      );

      await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          code: 'D2750',
          description: 'Crown - Porcelain',
          quantity: 1,
          unitPrice: 1000,
          taxRate: 0.1,
        },
        tenantContext,
      );

      await invoicesService.issueInvoice(invoice._id.toString(), tenantContext);

      // Split payment: cash + insurance
      const splitPayment = await paymentsService.create(
        {
          invoiceId: invoice._id.toString(),
          patientId: 'patient-split',
          paymentDate: new Date().toISOString(),
          amount: 1100,
          currency: 'USD',
          paymentMethod: PaymentMethod.SPLIT,
          splitPayments: [
            {
              method: PaymentMethod.CASH,
              amount: 550,
              transactionId: 'cash-001',
            },
            {
              method: PaymentMethod.INSURANCE,
              amount: 550,
              transactionId: 'ins-001',
            },
          ],
        },
        tenantContext,
      );

      expect(splitPayment).toBeDefined();
      expect(splitPayment.splitPayments).toHaveLength(2);
      expect(
        splitPayment.splitPayments?.reduce((sum, sp) => sum + sp.amount, 0),
      ).toBe(1100);
    });
  });

  describe('Ledger Double-Entry Verification', () => {
    it('should maintain ledger balance for all transactions', async () => {
      // This test verifies that for every batch of ledger entries,
      // debits equal credits (double-entry bookkeeping integrity)

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await invoicesService.create(
        {
          patientId: 'patient-ledger-test',
          providerId: 'provider-ledger-test',
          issueDate: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
          currency: 'USD',
        },
        tenantContext,
      );

      await invoiceItemsService.create(
        invoice._id.toString(),
        {
          itemType: InvoiceItemType.PROCEDURE,
          code: 'D0150',
          description: 'Comprehensive Exam',
          quantity: 1,
          unitPrice: 100,
          taxRate: 0.1,
        },
        tenantContext,
      );

      await invoicesService.issueInvoice(invoice._id.toString(), tenantContext);

      // Get all ledger entries for this invoice
      const entries = await ledgerService.getEntriesForInvoice(invoice._id);

      // Group by batch
      const batches = entries.reduce((acc, entry) => {
        const batchId = entry.batchId || 'no-batch';
        if (!acc[batchId]) acc[batchId] = [];
        acc[batchId].push(entry);
        return acc;
      }, {} as Record<string, any[]>);

      // Verify each batch is balanced
      for (const batchId in batches) {
        const batchEntries = batches[batchId];

        const debits = Money.sum(
          batchEntries
            .filter((e) => e.entryType === 'DEBIT')
            .map((e) => new Money(e.amount)),
        );

        const credits = Money.sum(
          batchEntries
            .filter((e) => e.entryType === 'CREDIT')
            .map((e) => new Money(e.amount)),
        );

        expect(debits.equals(credits)).toBe(true);
      }
    });
  });
});
