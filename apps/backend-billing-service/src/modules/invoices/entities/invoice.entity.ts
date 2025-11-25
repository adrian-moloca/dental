import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceStatus } from '../../../common/types';

@Schema({ collection: 'invoices', timestamps: true })
export class Invoice extends Document {
  @Prop({ type: String, required: true, unique: true })
  invoiceNumber!: string;

  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  @Prop({ type: String, required: true, index: true })
  providerId!: string;

  @Prop({ type: String, index: true })
  appointmentId?: string;

  @Prop({ type: String, index: true })
  linkedProcedureId?: string;

  @Prop({
    type: String,
    enum: Object.values(InvoiceStatus),
    default: InvoiceStatus.DRAFT,
    index: true,
  })
  status!: InvoiceStatus;

  @Prop({ type: Date, required: true, index: true })
  issueDate!: Date;

  @Prop({ type: Date, required: true, index: true })
  dueDate!: Date;

  @Prop({ type: Date, index: true })
  paidDate?: Date;

  @Prop({ type: Number, required: true, default: 0 })
  subtotal!: number;

  @Prop({ type: Number, required: true, default: 0 })
  taxAmount!: number;

  @Prop({ type: Number, required: true, default: 0 })
  discountAmount!: number;

  @Prop({ type: Number, required: true, default: 0 })
  total!: number;

  @Prop({ type: Number, required: true, default: 0 })
  amountPaid!: number;

  @Prop({ type: Number, required: true, default: 0 })
  balance!: number;

  @Prop({ type: String, default: 'RON' })
  currency!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'InvoiceItem' }], default: [] })
  items!: Types.ObjectId[];

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  terms?: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  // Audit fields
  @Prop({ type: String })
  createdBy?: string;

  @Prop({ type: String })
  updatedBy?: string;

  @Prop({ type: Date })
  voidedAt?: Date;

  @Prop({ type: String })
  voidedBy?: string;

  @Prop({ type: String })
  voidReason?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
InvoiceSchema.index({ patientId: 1, status: 1 });
InvoiceSchema.index({ issueDate: -1 });
InvoiceSchema.index({ dueDate: 1, status: 1 });
InvoiceSchema.index({ linkedProcedureId: 1 }, { sparse: true }); // For procedure-to-invoice lookup
