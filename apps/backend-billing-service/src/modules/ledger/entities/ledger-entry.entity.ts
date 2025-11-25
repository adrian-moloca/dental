import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LedgerEntryType, LedgerAccount } from '../../../common/types';

@Schema({ collection: 'ledger_entries', timestamps: true })
export class LedgerEntry extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', index: true })
  invoiceId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment', index: true })
  paymentId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(LedgerEntryType),
    required: true,
  })
  entryType!: LedgerEntryType;

  @Prop({
    type: String,
    enum: Object.values(LedgerAccount),
    required: true,
    index: true,
  })
  account!: LedgerAccount;

  @Prop({ type: Number, required: true })
  amount!: number;

  @Prop({ type: String, default: 'USD' })
  currency!: string;

  @Prop({ type: String, required: true })
  description!: string;

  @Prop({ type: String, index: true })
  referenceId?: string;

  @Prop({ type: String, index: true })
  referenceType?: string;

  @Prop({ type: Date, required: true, index: true })
  timestamp!: Date;

  @Prop({ type: String })
  batchId?: string;

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

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);

// Indexes
LedgerEntrySchema.index({ account: 1, timestamp: -1 });
LedgerEntrySchema.index({ batchId: 1 });
LedgerEntrySchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
LedgerEntrySchema.index({ referenceId: 1, referenceType: 1 });
