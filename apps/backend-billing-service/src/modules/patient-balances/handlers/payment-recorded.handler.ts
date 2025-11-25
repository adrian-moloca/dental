/**
 * Payment Recorded Event Handler
 *
 * Listens to payment.received events and updates patient balances in real-time.
 * Ensures accurate patient balance tracking across the revenue cycle.
 *
 * Business Flow:
 * 1. Receive payment.received event from Payments Service
 * 2. Find associated invoice by paymentId
 * 3. Calculate outstanding balance = invoice.total - payment.amount
 * 4. Update patient.balance
 * 5. Emit patient.balance_updated event
 * 6. Handle partial payments correctly
 *
 * Performance Target: <100ms (patient balance must update within 1 second)
 */

import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PatientBalance } from '../entities/patient-balance.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Money } from '../../../common/utils/money.utils';

interface PaymentReceivedEvent {
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  method: string;
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
}

@Injectable()
export class PaymentRecordedHandler {
  private readonly logger = new Logger(PaymentRecordedHandler.name);

  constructor(
    @InjectModel(PatientBalance.name) private patientBalanceModel: Model<PatientBalance>,
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Handle payment.received event
   * Updates patient balance in real-time
   */
  @OnEvent('payment.received', { async: true })
  async handlePaymentReceived(event: PaymentReceivedEvent): Promise<void> {
    const startTime = Date.now();

    this.logger.log('Processing payment.received event', {
      paymentId: event.paymentId,
      invoiceId: event.invoiceId,
      patientId: event.patientId,
      amount: event.amount,
    });

    try {
      // Find invoice to get complete payment context
      const invoice = await this.invoiceModel.findOne({
        _id: event.invoiceId,
        tenantId: event.tenantId,
        organizationId: event.organizationId,
      });

      if (!invoice) {
        this.logger.warn('Invoice not found for payment - cannot update balance', {
          paymentId: event.paymentId,
          invoiceId: event.invoiceId,
        });
        return;
      }

      const context: TenantContext = {
        tenantId: event.tenantId,
        organizationId: event.organizationId,
        clinicId: event.clinicId,
      };

      // Get or create patient balance record
      let patientBalance = await this.patientBalanceModel.findOne({
        patientId: event.patientId,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
      });

      if (!patientBalance) {
        patientBalance = new this.patientBalanceModel({
          patientId: event.patientId,
          currentBalance: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          overdueAmount: 0,
          currency: invoice.currency || 'RON',
          ...context,
        });
      }

      // Calculate new balance
      const currentBalance = new Money(patientBalance.currentBalance);
      const paymentAmount = new Money(event.amount);
      const totalPaid = new Money(patientBalance.totalPaid);

      const previousBalance = currentBalance.toNumber();
      const newBalance = currentBalance.subtract(paymentAmount);
      const newTotalPaid = totalPaid.add(paymentAmount);

      // Update balance
      patientBalance.currentBalance = newBalance.toNumber();
      patientBalance.totalPaid = newTotalPaid.toNumber();
      patientBalance.lastPaymentDate = new Date();

      // Recalculate overdue amount if balance decreased
      if (newBalance.toNumber() < previousBalance) {
        // Find all overdue invoices for this patient
        const overdueInvoices = await this.invoiceModel.find({
          patientId: event.patientId,
          tenantId: context.tenantId,
          status: 'OVERDUE',
        });

        const overdueTotal = Money.sum(overdueInvoices.map((inv) => new Money(inv.balance)));
        patientBalance.overdueAmount = overdueTotal.toNumber();
      }

      await patientBalance.save();

      const duration = Date.now() - startTime;

      this.logger.log('Patient balance updated from payment', {
        patientId: event.patientId,
        paymentId: event.paymentId,
        previousBalance,
        paymentAmount: event.amount,
        newBalance: newBalance.toNumber(),
        duration: `${duration}ms`,
      });

      // Emit patient.balance_updated event
      try {
        this.eventEmitter.emit('patient.balance_updated', {
          patientId: event.patientId,
          previousBalance,
          newBalance: newBalance.toNumber(),
          changeAmount: -paymentAmount.toNumber(),
          changeReason: 'PAYMENT_RECEIVED',
          paymentId: event.paymentId,
          invoiceId: event.invoiceId,
          timestamp: new Date().toISOString(),
          ...context,
        });
      } catch (eventError) {
        this.logger.error('Failed to emit patient.balance_updated event', {
          error: eventError,
          patientId: event.patientId,
        });
      }

      // Performance check
      if (duration > 100) {
        this.logger.warn('Patient balance update exceeded performance budget', {
          duration: `${duration}ms`,
          target: '100ms',
          patientId: event.patientId,
        });
      }
    } catch (error) {
      this.logger.error('Failed to update patient balance from payment', {
        error,
        paymentId: event.paymentId,
        patientId: event.patientId,
      });
      // Don't throw - graceful degradation
    }
  }

  /**
   * Handle invoice.generated event
   * Increases patient balance when invoice is created
   */
  @OnEvent('invoice.generated', { async: true })
  async handleInvoiceGenerated(event: any): Promise<void> {
    const startTime = Date.now();

    this.logger.log('Processing invoice.generated event', {
      invoiceId: event.payload?.invoiceId,
      patientId: event.payload?.patientId,
      total: event.payload?.total,
    });

    try {
      const payload = event.payload;
      if (!payload || !payload.patientId || !payload.total) {
        this.logger.warn('Invalid invoice.generated event payload', { event });
        return;
      }

      const context: TenantContext = {
        tenantId: event.tenantContext.tenantId,
        organizationId: event.tenantContext.organizationId,
        clinicId: event.tenantContext.clinicId,
      };

      // Get or create patient balance record
      let patientBalance = await this.patientBalanceModel.findOne({
        patientId: payload.patientId,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
      });

      if (!patientBalance) {
        patientBalance = new this.patientBalanceModel({
          patientId: payload.patientId,
          currentBalance: 0,
          totalInvoiced: 0,
          totalPaid: 0,
          overdueAmount: 0,
          currency: payload.currency || 'RON',
          ...context,
        });
      }

      // Increase balance by invoice total
      const currentBalance = new Money(patientBalance.currentBalance);
      const totalInvoiced = new Money(patientBalance.totalInvoiced);
      const invoiceTotal = new Money(payload.total);

      const previousBalance = currentBalance.toNumber();
      const newBalance = currentBalance.add(invoiceTotal);
      const newTotalInvoiced = totalInvoiced.add(invoiceTotal);

      patientBalance.currentBalance = newBalance.toNumber();
      patientBalance.totalInvoiced = newTotalInvoiced.toNumber();

      await patientBalance.save();

      const duration = Date.now() - startTime;

      this.logger.log('Patient balance updated from invoice', {
        patientId: payload.patientId,
        invoiceId: payload.invoiceId,
        previousBalance,
        invoiceTotal: payload.total,
        newBalance: newBalance.toNumber(),
        duration: `${duration}ms`,
      });

      // Emit patient.balance_updated event
      try {
        this.eventEmitter.emit('patient.balance_updated', {
          patientId: payload.patientId,
          previousBalance,
          newBalance: newBalance.toNumber(),
          changeAmount: invoiceTotal.toNumber(),
          changeReason: 'INVOICE_GENERATED',
          invoiceId: payload.invoiceId,
          timestamp: new Date().toISOString(),
          ...context,
        });
      } catch (eventError) {
        this.logger.error('Failed to emit patient.balance_updated event', {
          error: eventError,
          patientId: payload.patientId,
        });
      }

      if (duration > 100) {
        this.logger.warn('Patient balance update exceeded performance budget', {
          duration: `${duration}ms`,
          target: '100ms',
          patientId: payload.patientId,
        });
      }
    } catch (error) {
      this.logger.error('Failed to update patient balance from invoice', {
        error,
        event,
      });
    }
  }
}
