import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../../common/types';

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
}

@Schema({ collection: 'payments', timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId!: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  @Prop({ type: Date, required: true, index: true })
  paymentDate!: Date;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, default: 'RON' })
  currency!: string;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  })
  paymentMethod!: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true,
  })
  status!: PaymentStatus;

  @Prop({ type: String })
  transactionId?: string;

  @Prop({ type: String })
  confirmationNumber?: string;

  @Prop({ type: Array, default: [] })
  splitPayments?: SplitPayment[];

  @Prop({ type: Number, default: 0 })
  refundedAmount!: number;

  @Prop({ type: Date })
  refundedAt?: Date;

  @Prop({ type: String })
  refundReason?: string;

  @Prop({ type: String })
  notes?: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  // Audit
  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  processedBy?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ invoiceId: 1, status: 1 });
PaymentSchema.index({ patientId: 1, paymentDate: -1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
