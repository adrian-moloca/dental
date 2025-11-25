import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class ProcedureItem {
  @Prop({ required: true }) procedureCode!: string;
  @Prop() toothNumber?: number;
  @Prop({ required: true }) description!: string;
  @Prop({ required: true }) estimatedCost!: number;
  @Prop({ required: true, default: 1 }) phase!: number;
}

@Schema({ _id: false })
export class TreatmentOption {
  @Prop({ required: true }) optionId!: string;
  @Prop({ required: true }) optionName!: string;
  @Prop({ required: true }) description!: string;
  @Prop({ type: [ProcedureItem], required: true }) procedures!: ProcedureItem[];
  @Prop({ required: true }) totalCost!: number;
  @Prop({ default: false }) isAccepted!: boolean;
}

@Schema({ timestamps: true, collection: 'treatment_plans' })
export class TreatmentPlan {
  @Prop({ required: true }) patientId!: string;
  @Prop({ required: true, index: true }) tenantId!: string;
  @Prop({ required: true }) organizationId!: string;
  @Prop({ required: true }) clinicId!: string;
  @Prop({ required: true, default: 1 }) version!: number;
  @Prop({
    required: true,
    enum: ['DRAFT', 'PRESENTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  })
  status!: string;
  @Prop({ type: [TreatmentOption], required: true }) options!: TreatmentOption[];
  @Prop() acceptedOptionId?: string;
  @Prop() acceptedAt?: Date;
  @Prop({ required: true }) createdBy!: string;
  @Prop() presentedBy?: string;
}

export type TreatmentPlanDocument = TreatmentPlan & Document;
export const TreatmentPlanSchema = SchemaFactory.createForClass(TreatmentPlan);
TreatmentPlanSchema.index({ patientId: 1, tenantId: 1, createdAt: -1 });
