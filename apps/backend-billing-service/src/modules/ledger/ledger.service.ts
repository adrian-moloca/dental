import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerEntryType, LedgerAccount } from '../../common/types';
import { Money } from '../../common/utils/money.utils';
import { v4 as uuidv4 } from 'uuid';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

interface LedgerEntryInput {
  entryType: LedgerEntryType;
  account: LedgerAccount;
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  invoiceId?: Types.ObjectId;
  paymentId?: Types.ObjectId;
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectModel(LedgerEntry.name)
    private ledgerEntryModel: Model<LedgerEntry>,
  ) {}

  /**
   * Create ledger entries for invoice issuance
   * Double-entry: DEBIT Accounts Receivable, CREDIT Revenue
   */
  async createInvoiceIssuedEntries(
    invoiceId: Types.ObjectId,
    totalAmount: number,
    taxAmount: number,
    revenueAmount: number,
    context: TenantContext,
  ): Promise<void> {
    const batchId = uuidv4();
    const timestamp = new Date();

    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.ACCOUNTS_RECEIVABLE,
        amount: totalAmount,
        description: 'Invoice issued - Accounts Receivable',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE',
      },
      {
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.REVENUE,
        amount: revenueAmount,
        description: 'Invoice issued - Revenue',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE',
      },
    ];

    // If there's tax, credit tax payable
    if (taxAmount > 0) {
      entries.push({
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.TAX_PAYABLE,
        amount: taxAmount,
        description: 'Invoice issued - Tax Payable',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE',
      });
    }

    await this.createBatchEntries(entries, batchId, timestamp, context);

    // Verify balance
    await this.verifyBatchBalance(batchId);
  }

  /**
   * Create ledger entries for COGS (Cost of Goods Sold)
   * Double-entry: DEBIT COGS, CREDIT (handled by inventory service)
   */
  async createCogsEntries(
    invoiceId: Types.ObjectId,
    cogsAmount: number,
    context: TenantContext,
  ): Promise<void> {
    if (cogsAmount <= 0) return;

    const batchId = uuidv4();
    const timestamp = new Date();

    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.COGS,
        amount: cogsAmount,
        description: 'Cost of Goods Sold',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE_COGS',
      },
    ];

    await this.createBatchEntries(entries, batchId, timestamp, context);
  }

  /**
   * Create ledger entries for payment received
   * Double-entry: DEBIT Cash, CREDIT Accounts Receivable
   */
  async createPaymentReceivedEntries(
    paymentId: Types.ObjectId,
    invoiceId: Types.ObjectId,
    amount: number,
    context: TenantContext,
  ): Promise<void> {
    const batchId = uuidv4();
    const timestamp = new Date();

    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.CASH,
        amount,
        description: 'Payment received - Cash',
        paymentId,
        invoiceId,
        referenceId: paymentId.toString(),
        referenceType: 'PAYMENT',
      },
      {
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.ACCOUNTS_RECEIVABLE,
        amount,
        description: 'Payment received - A/R reduction',
        paymentId,
        invoiceId,
        referenceId: paymentId.toString(),
        referenceType: 'PAYMENT',
      },
    ];

    await this.createBatchEntries(entries, batchId, timestamp, context);
    await this.verifyBatchBalance(batchId);
  }

  /**
   * Create ledger entries for refund
   * Double-entry: DEBIT Refunds, CREDIT Cash
   */
  async createRefundEntries(
    paymentId: Types.ObjectId,
    invoiceId: Types.ObjectId,
    amount: number,
    context: TenantContext,
  ): Promise<void> {
    const batchId = uuidv4();
    const timestamp = new Date();

    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.REFUNDS,
        amount,
        description: 'Refund issued',
        paymentId,
        invoiceId,
        referenceId: paymentId.toString(),
        referenceType: 'REFUND',
      },
      {
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.CASH,
        amount,
        description: 'Refund issued - Cash',
        paymentId,
        invoiceId,
        referenceId: paymentId.toString(),
        referenceType: 'REFUND',
      },
    ];

    await this.createBatchEntries(entries, batchId, timestamp, context);
    await this.verifyBatchBalance(batchId);
  }

  /**
   * Create ledger entries for invoice void
   * Reversal of original invoice entries
   */
  async createInvoiceVoidEntries(
    invoiceId: Types.ObjectId,
    totalAmount: number,
    taxAmount: number,
    revenueAmount: number,
    context: TenantContext,
  ): Promise<void> {
    const batchId = uuidv4();
    const timestamp = new Date();

    // Reverse the original entries
    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.ACCOUNTS_RECEIVABLE,
        amount: totalAmount,
        description: 'Invoice voided - A/R reversal',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE_VOID',
      },
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.REVENUE,
        amount: revenueAmount,
        description: 'Invoice voided - Revenue reversal',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE_VOID',
      },
    ];

    if (taxAmount > 0) {
      entries.push({
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.TAX_PAYABLE,
        amount: taxAmount,
        description: 'Invoice voided - Tax reversal',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'INVOICE_VOID',
      });
    }

    await this.createBatchEntries(entries, batchId, timestamp, context);
    await this.verifyBatchBalance(batchId);
  }

  /**
   * Create ledger entries for discount
   * Double-entry: DEBIT Discount, CREDIT Accounts Receivable
   */
  async createDiscountEntries(
    invoiceId: Types.ObjectId,
    discountAmount: number,
    context: TenantContext,
  ): Promise<void> {
    if (discountAmount <= 0) return;

    const batchId = uuidv4();
    const timestamp = new Date();

    const entries: LedgerEntryInput[] = [
      {
        entryType: LedgerEntryType.DEBIT,
        account: LedgerAccount.DISCOUNT,
        amount: discountAmount,
        description: 'Discount applied',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'DISCOUNT',
      },
      {
        entryType: LedgerEntryType.CREDIT,
        account: LedgerAccount.ACCOUNTS_RECEIVABLE,
        amount: discountAmount,
        description: 'Discount applied - A/R reduction',
        invoiceId,
        referenceId: invoiceId.toString(),
        referenceType: 'DISCOUNT',
      },
    ];

    await this.createBatchEntries(entries, batchId, timestamp, context);
    await this.verifyBatchBalance(batchId);
  }

  /**
   * Create a batch of ledger entries
   */
  private async createBatchEntries(
    entries: LedgerEntryInput[],
    batchId: string,
    timestamp: Date,
    context: TenantContext,
  ): Promise<void> {
    const ledgerEntries = entries.map((entry) => ({
      ...entry,
      batchId,
      timestamp,
      currency: 'USD',
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.userId,
    }));

    await this.ledgerEntryModel.insertMany(ledgerEntries);

    this.logger.log(`Created ${entries.length} ledger entries in batch ${batchId}`);
  }

  /**
   * Verify that debits equal credits for a batch
   * CRITICAL: This ensures double-entry bookkeeping integrity
   */
  private async verifyBatchBalance(batchId: string): Promise<void> {
    const entries = await this.ledgerEntryModel.find({ batchId });

    const debits = Money.sum(
      entries.filter((e) => e.entryType === LedgerEntryType.DEBIT).map((e) => new Money(e.amount)),
    );

    const credits = Money.sum(
      entries.filter((e) => e.entryType === LedgerEntryType.CREDIT).map((e) => new Money(e.amount)),
    );

    if (!debits.equals(credits)) {
      const error = `Ledger batch ${batchId} is unbalanced! Debits: ${debits.toFixed()}, Credits: ${credits.toFixed()}`;
      this.logger.error(error);
      throw new Error(error);
    }

    this.logger.log(`Ledger batch ${batchId} verified balanced: ${debits.toFixed()}`);
  }

  /**
   * Get ledger entries for an invoice
   */
  async getEntriesForInvoice(invoiceId: Types.ObjectId): Promise<LedgerEntry[]> {
    return this.ledgerEntryModel.find({ invoiceId }).sort({ timestamp: -1 });
  }

  /**
   * Get ledger entries for a payment
   */
  async getEntriesForPayment(paymentId: Types.ObjectId): Promise<LedgerEntry[]> {
    return this.ledgerEntryModel.find({ paymentId }).sort({ timestamp: -1 });
  }

  /**
   * Get account balance
   */
  async getAccountBalance(account: LedgerAccount, context: TenantContext): Promise<Money> {
    const entries = await this.ledgerEntryModel.find({
      account,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });

    const debits = Money.sum(
      entries.filter((e) => e.entryType === LedgerEntryType.DEBIT).map((e) => new Money(e.amount)),
    );

    const credits = Money.sum(
      entries.filter((e) => e.entryType === LedgerEntryType.CREDIT).map((e) => new Money(e.amount)),
    );

    // For asset accounts (Cash, A/R), balance = debits - credits
    // For liability/equity accounts (Revenue, Tax Payable), balance = credits - debits
    if (
      [
        LedgerAccount.CASH,
        LedgerAccount.ACCOUNTS_RECEIVABLE,
        LedgerAccount.COGS,
        LedgerAccount.DISCOUNT,
        LedgerAccount.REFUNDS,
      ].includes(account)
    ) {
      return debits.subtract(credits);
    } else {
      return credits.subtract(debits);
    }
  }
}
