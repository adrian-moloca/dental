import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PriceRuleType, PriceRuleApplicableTo } from '../../../common/types';

@Schema({ collection: 'price_rules', timestamps: true })
export class PriceRule extends Document {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    type: String,
    enum: Object.values(PriceRuleType),
    required: true,
    index: true,
  })
  ruleType!: PriceRuleType;

  @Prop({
    type: String,
    enum: Object.values(PriceRuleApplicableTo),
    required: true,
  })
  applicableTo!: PriceRuleApplicableTo;

  @Prop({ type: String, index: true })
  targetId?: string;

  @Prop({ type: Number, required: true })
  value!: number;

  @Prop({ type: Boolean, default: false })
  isPercentage!: boolean;

  @Prop({ type: Date, required: true, index: true })
  validFrom!: Date;

  @Prop({ type: Date, index: true })
  validTo?: Date;

  @Prop({ type: Number, default: 0 })
  priority!: number;

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

export const PriceRuleSchema = SchemaFactory.createForClass(PriceRule);

// Indexes
PriceRuleSchema.index({ ruleType: 1, applicableTo: 1, targetId: 1 });
PriceRuleSchema.index({ validFrom: 1, validTo: 1 });
PriceRuleSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
