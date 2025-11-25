import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'patient_balances', timestamps: true })
export class PatientBalance extends Document {
  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  @Prop({ type: Number, required: true, default: 0 })
  currentBalance!: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalInvoiced!: number;

  @Prop({ type: Number, required: true, default: 0 })
  totalPaid!: number;

  @Prop({ type: Number, required: true, default: 0 })
  overdueAmount!: number;

  @Prop({ type: Date })
  lastPaymentDate?: Date;

  @Prop({ type: String, default: 'USD' })
  currency!: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;
}

export const PatientBalanceSchema = SchemaFactory.createForClass(PatientBalance);

// Indexes
PatientBalanceSchema.index(
  { patientId: 1, tenantId: 1, organizationId: 1, clinicId: 1 },
  { unique: true },
);
PatientBalanceSchema.index({ currentBalance: 1 });
PatientBalanceSchema.index({ overdueAmount: 1 });
