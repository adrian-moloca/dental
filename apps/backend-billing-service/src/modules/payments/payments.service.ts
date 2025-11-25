import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto, CreateRefundDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod, InvoiceStatus } from '../../common/types';
import { Money } from '../../common/utils/money.utils';
import { LedgerService } from '../ledger/ledger.service';
import { InvoicesService } from '../invoices/invoices.service';
import { PatientBalancesService } from '../patient-balances/patient-balances.service';

interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId?: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<Payment>,
    @InjectModel(Invoice.name)
    private invoiceModel: Model<Invoice>,
    private ledgerService: LedgerService,
    private invoicesService: InvoicesService,
    private patientBalancesService: PatientBalancesService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, context: TenantContext): Promise<Payment> {
    const invoice = await this.invoiceModel.findOne({
      _id: createPaymentDto.invoiceId,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${createPaymentDto.invoiceId} not found`);
    }

    // Validate payment amount
    const paymentAmount = new Money(createPaymentDto.amount);
    const invoiceBalance = new Money(invoice.balance);

    if (paymentAmount.greaterThan(invoiceBalance)) {
      throw new BadRequestException(
        `Payment amount ${paymentAmount.toFixed()} exceeds invoice balance ${invoiceBalance.toFixed()}`,
      );
    }

    // Validate split payments
    if (createPaymentDto.paymentMethod === PaymentMethod.SPLIT) {
      if (!createPaymentDto.splitPayments || createPaymentDto.splitPayments.length === 0) {
        throw new BadRequestException('Split payments required for SPLIT payment method');
      }

      const splitTotal = Money.sum(
        createPaymentDto.splitPayments.map((sp) => new Money(sp.amount)),
      );

      if (!splitTotal.equals(paymentAmount)) {
        throw new BadRequestException(
          `Split payments total ${splitTotal.toFixed()} does not match payment amount ${paymentAmount.toFixed()}`,
        );
      }
    }

    const payment = new this.paymentModel({
      ...createPaymentDto,
      invoiceId: new Types.ObjectId(createPaymentDto.invoiceId),
      status: PaymentStatus.COMPLETED,
      refundedAmount: 0,
      ...context,
      createdBy: context.userId,
      processedBy: context.userId,
    });

    await payment.save();

    // Update invoice
    await this.invoicesService.markAsPaid(invoice._id, paymentAmount.toNumber(), context);

    // Create ledger entries
    await this.ledgerService.createPaymentReceivedEntries(
      payment._id,
      invoice._id,
      paymentAmount.toNumber(),
      context,
    );

    // Update patient balance
    await this.patientBalancesService.recordPayment(
      createPaymentDto.patientId,
      paymentAmount.toNumber(),
      context,
    );

    this.logger.log(
      `Payment ${payment._id} recorded for invoice ${invoice.invoiceNumber}: ${paymentAmount.toFixed()}`,
    );

    // Emit event
    this.eventEmitter.emit('payment.received', {
      paymentId: payment._id.toString(),
      invoiceId: invoice._id.toString(),
      patientId: payment.patientId,
      amount: payment.amount,
      method: payment.paymentMethod,
      ...context,
    });

    return payment;
  }

  async findOne(id: string, context: TenantContext): Promise<Payment> {
    const payment = await this.paymentModel.findOne({
      _id: id,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  async findByInvoice(invoiceId: string, context: TenantContext): Promise<Payment[]> {
    return this.paymentModel.find({
      invoiceId: new Types.ObjectId(invoiceId),
      tenantId: context.tenantId,
      organizationId: context.organizationId,
    });
  }

  async findByPatient(patientId: string, context: TenantContext): Promise<Payment[]> {
    return this.paymentModel
      .find({
        patientId,
        tenantId: context.tenantId,
        organizationId: context.organizationId,
      })
      .sort({ paymentDate: -1 });
  }

  async createRefund(createRefundDto: CreateRefundDto, context: TenantContext): Promise<Payment> {
    const payment = await this.findOne(createRefundDto.paymentId, context);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Cannot refund payment with status ${payment.status}`);
    }

    const refundAmount = new Money(createRefundDto.amount);
    const alreadyRefunded = new Money(payment.refundedAmount);
    const paymentAmount = new Money(payment.amount);
    const availableToRefund = paymentAmount.subtract(alreadyRefunded);

    if (refundAmount.greaterThan(availableToRefund)) {
      throw new BadRequestException(
        `Refund amount ${refundAmount.toFixed()} exceeds available amount ${availableToRefund.toFixed()}`,
      );
    }

    // Update payment
    const newRefundedAmount = alreadyRefunded.add(refundAmount);
    payment.refundedAmount = newRefundedAmount.toNumber();
    payment.refundedAt = new Date();
    payment.refundReason = createRefundDto.reason;

    if (newRefundedAmount.equals(paymentAmount)) {
      payment.status = PaymentStatus.REFUNDED;
    }

    await payment.save();

    // Update invoice (reduce amountPaid)
    const invoice = await this.invoiceModel.findById(payment.invoiceId);
    if (invoice) {
      const currentPaid = new Money(invoice.amountPaid);
      const newPaid = currentPaid.subtract(refundAmount);
      const total = new Money(invoice.total);
      const newBalance = total.subtract(newPaid);

      invoice.amountPaid = newPaid.toNumber();
      invoice.balance = newBalance.toNumber();

      // Update status if needed
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
    await this.patientBalancesService.recordPayment(
      payment.patientId,
      -refundAmount.toNumber(), // Negative to increase balance
      context,
    );

    this.logger.log(`Refund ${refundAmount.toFixed()} processed for payment ${payment._id}`);

    // Emit event
    this.eventEmitter.emit('payment.refunded', {
      paymentId: payment._id.toString(),
      invoiceId: payment.invoiceId.toString(),
      patientId: payment.patientId,
      refundAmount: refundAmount.toNumber(),
      reason: createRefundDto.reason,
      ...context,
    });

    return payment;
  }
}
