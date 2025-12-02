import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InvoiceItemType } from '../../../common/types';

@Schema({ collection: 'invoice_items', timestamps: true })
export class InvoiceItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(InvoiceItemType),
    required: true,
  })
  itemType!: InvoiceItemType;

  @Prop({ type: String })
  referenceId?: string;

  @Prop({ type: String, index: true })
  linkedProcedureId?: string;

  @Prop({ type: String, required: false })
  code?: string;

  @Prop({ type: String })
  procedureCode?: string;

  @Prop({ type: String })
  toothNumber?: string;

  @Prop({ type: [String] })
  surfaces?: string[];

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: Number, required: true, default: 1 })
  quantity!: number;

  @Prop({ type: Number, required: true })
  unitPrice!: number;

  @Prop({ type: Number, required: true })
  totalPrice!: number;

  @Prop({ type: Number, default: 0.19 })
  taxRate!: number;

  @Prop({ type: Number, default: 0 })
  taxAmount!: number;

  @Prop({ type: String, index: true })
  providerId?: string;

  @Prop({ type: Number, default: 0 })
  costOfGoodsSold?: number;

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
}

export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

// Indexes
InvoiceItemSchema.index({ invoiceId: 1, itemType: 1 });
InvoiceItemSchema.index({ referenceId: 1 });
InvoiceItemSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
