import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TaxApplicableTo } from '../../../common/types';

@Schema({ collection: 'tax_rates', timestamps: true })
export class TaxRate extends Document {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: Number, required: true })
  rate!: number;

  @Prop({ type: String, index: true })
  jurisdictionId?: string;

  @Prop({
    type: String,
    enum: Object.values(TaxApplicableTo),
    default: TaxApplicableTo.ALL,
  })
  applicableTo!: TaxApplicableTo;

  @Prop({ type: Boolean, default: true })
  isActive!: boolean;

  @Prop({ type: String })
  description?: string;

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
  updatedBy?: string;
}

export const TaxRateSchema = SchemaFactory.createForClass(TaxRate);

// Indexes
TaxRateSchema.index({ jurisdictionId: 1, applicableTo: 1 });
TaxRateSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
