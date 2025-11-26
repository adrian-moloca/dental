import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from '../payments/entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { LedgerService } from '../ledger/ledger.service';
import { PatientBalancesService } from '../patient-balances/patient-balances.service';
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '../../common/types';
import { Money } from '../../common/utils/money.utils';
import { StripeWebhookPayload } from './interfaces/stripe.interface';

@Injectable()
export class StripeEventListener {
  private readonly logger = new Logger(StripeEventListener.name);

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    private ledgerService: LedgerService,
    private patientBalancesService: PatientBalancesService,
  ) {}

  @OnEvent('stripe.payment.succeeded')
  async handlePaymentSucceeded(payload: StripeWebhookPayload): Promise<void> {
    this.logger.log(`Processing successful payment: ${payload.paymentIntentId}`);

    if (!payload.invoiceId || !payload.patientId || !payload.amount) {
      this.logger.warn('Missing required fields in payment succeeded event');
      return;
    }

    const context = {
      tenantId: payload.tenantId || '',
      organizationId: payload.organizationId || '',
      clinicId: payload.clinicId || '',
    };

    // Check if payment already recorded
    const existingPayment = await this.paymentModel.findOne({
      transactionId: payload.paymentIntentId,
      tenantId: context.tenantId,
    });

    if (existingPayment) {
      this.logger.debug(`Payment ${payload.paymentIntentId} already recorded`);
      return;
    }

    // Find invoice
    const invoice = await this.invoiceModel.findOne({
      _id: new Types.ObjectId(payload.invoiceId),
      tenantId: context.tenantId,
    });

    if (!invoice) {
      this.logger.error(
        `Invoice ${payload.invoiceId} not found for payment ${payload.paymentIntentId}`,
      );
      return;
    }

    // Convert amount from smallest unit (bani/cents) to standard unit
    const paymentAmount = new Money(payload.amount / 100);

    // Create payment record
    const payment = new this.paymentModel({
      invoiceId: invoice._id,
      patientId: payload.patientId,
      paymentDate: new Date(),
      amount: paymentAmount.toNumber(),
      currency: invoice.currency || 'RON',
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.COMPLETED,
      transactionId: payload.paymentIntentId,
      refundedAmount: 0,
      ...context,
      createdBy: 'stripe-webhook',
      processedBy: 'stripe-webhook',
    });

    await payment.save();

    // Update invoice
    const currentPaid = new Money(invoice.amountPaid || 0);
    const newPaid = currentPaid.add(paymentAmount);
    const total = new Money(invoice.total);
    const newBalance = total.subtract(newPaid);

    invoice.amountPaid = newPaid.toNumber();
    invoice.balance = newBalance.toNumber();

    if (newBalance.isZero() || newBalance.lessThan(new Money(0.01))) {
      invoice.status = InvoiceStatus.PAID;
    } else {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await invoice.save();

    // Create ledger entries
    await this.ledgerService.createPaymentReceivedEntries(
      payment._id,
      invoice._id,
      paymentAmount.toNumber(),
      context,
    );

    // Update patient balance
    await this.patientBalancesService.recordPayment(
      payload.patientId,
      paymentAmount.toNumber(),
      context,
    );

    this.logger.log(
      `Payment ${payment._id} recorded for invoice ${invoice.invoiceNumber}: ${paymentAmount.toFixed()} via Stripe`,
    );
  }

  @OnEvent('stripe.payment.failed')
  async handlePaymentFailed(payload: StripeWebhookPayload): Promise<void> {
    this.logger.warn(
      `Payment failed: ${payload.paymentIntentId}, code: ${payload.failureCode}, message: ${payload.failureMessage}`,
    );

    // Could create a failed payment record for audit purposes
    // Or send notification to patient/staff
  }

  @OnEvent('stripe.charge.refunded')
  async handleChargeRefunded(payload: StripeWebhookPayload): Promise<void> {
    this.logger.log(`Processing refund for payment: ${payload.paymentIntentId}`);

    if (!payload.paymentIntentId || !payload.amount) {
      this.logger.warn('Missing required fields in charge refunded event');
      return;
    }

    const context = {
      tenantId: payload.tenantId || '',
      organizationId: payload.organizationId || '',
      clinicId: payload.clinicId || '',
    };

    // Find the original payment
    const payment = await this.paymentModel.findOne({
      transactionId: payload.paymentIntentId,
      tenantId: context.tenantId,
    });

    if (!payment) {
      this.logger.error(`Payment not found for Stripe ID: ${payload.paymentIntentId}`);
      return;
    }

    // Convert amount from smallest unit
    const refundAmount = new Money(payload.amount / 100);

    // Update payment
    const currentRefunded = new Money(payment.refundedAmount);
    const newRefunded = currentRefunded.add(refundAmount);
    const paymentAmount = new Money(payment.amount);

    payment.refundedAmount = newRefunded.toNumber();
    payment.refundedAt = new Date();
    payment.refundReason = 'Stripe refund';

    if (newRefunded.equals(paymentAmount)) {
      payment.status = PaymentStatus.REFUNDED;
    }

    await payment.save();

    // Update invoice
    const invoice = await this.invoiceModel.findById(payment.invoiceId);
    if (invoice) {
      const currentPaid = new Money(invoice.amountPaid);
      const newPaid = currentPaid.subtract(refundAmount);
      const total = new Money(invoice.total);
      const newBalance = total.subtract(newPaid);

      invoice.amountPaid = Math.max(0, newPaid.toNumber());
      invoice.balance = newBalance.toNumber();

      if (invoice.status === InvoiceStatus.PAID) {
        invoice.status = newBalance.isZero() ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
      }

      await invoice.save();
    }

    // Create ledger entries for refund
    await this.ledgerService.createRefundEntries(
      payment._id,
      payment.invoiceId as Types.ObjectId,
      refundAmount.toNumber(),
      context,
    );

    // Update patient balance
    if (payment.patientId) {
      await this.patientBalancesService.recordPayment(
        payment.patientId,
        -refundAmount.toNumber(),
        context,
      );
    }

    this.logger.log(`Refund ${refundAmount.toFixed()} processed for payment ${payment._id}`);
  }

  @OnEvent('stripe.dispute.created')
  async handleDisputeCreated(payload: StripeWebhookPayload): Promise<void> {
    this.logger.warn(`Dispute created for charge: ${payload.chargeId}`);

    // In production, this should:
    // 1. Notify admin
    // 2. Create audit record
    // 3. Potentially freeze related operations
  }
}
