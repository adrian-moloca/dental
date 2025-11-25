import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { InsuranceClaimStatus } from '../../../common/types';

@Schema({ collection: 'insurance_claims', timestamps: true })
export class InsuranceClaim extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId!: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  patientId!: string;

  @Prop({ type: String, required: true, index: true })
  insuranceProviderId!: string;

  @Prop({ type: String, required: true, unique: true })
  claimNumber!: string;

  @Prop({
    type: String,
    enum: Object.values(InsuranceClaimStatus),
    default: InsuranceClaimStatus.DRAFT,
    index: true,
  })
  status!: InsuranceClaimStatus;

  @Prop({ type: Date, index: true })
  submittedDate?: Date;

  @Prop({ type: Date })
  approvedDate?: Date;

  @Prop({ type: Number, required: true })
  claimedAmount!: number;

  @Prop({ type: Number, default: 0 })
  approvedAmount!: number;

  @Prop({ type: Number, default: 0 })
  paidAmount!: number;

  @Prop({ type: String })
  deniedReason?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: Object })
  claimData?: Record<string, any>;

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
  submittedBy?: string;
}

export const InsuranceClaimSchema = SchemaFactory.createForClass(InsuranceClaim);

// Indexes
InsuranceClaimSchema.index({ invoiceId: 1, status: 1 });
InsuranceClaimSchema.index({ patientId: 1, status: 1 });
InsuranceClaimSchema.index({ insuranceProviderId: 1, submittedDate: -1 });
InsuranceClaimSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
