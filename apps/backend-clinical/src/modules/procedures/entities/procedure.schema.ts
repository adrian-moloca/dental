import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class MaterialUsed {
  @Prop({ required: true }) itemId!: string;
  @Prop({ required: true }) quantity!: number;
}

@Schema({ timestamps: true, collection: 'procedures' })
export class Procedure {
  @Prop({ required: true }) patientId!: string;
  @Prop({ required: true, index: true }) tenantId!: string;
  @Prop({ required: true }) organizationId!: string;
  @Prop({ required: true }) clinicId!: string;
  @Prop() appointmentId?: string;
  @Prop() treatmentPlanId?: string;
  @Prop({ required: true }) procedureCode!: string;
  @Prop({ required: true }) description!: string;
  @Prop() toothNumber?: number;
  @Prop({ type: [String] }) surfaces?: string[];
  @Prop({
    required: true,
    enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PLANNED',
  })
  status!: string;
  @Prop() performedBy?: string;
  @Prop({ type: [String] }) assistedBy?: string[];
  @Prop({ type: [MaterialUsed] }) materials?: MaterialUsed[];
  @Prop() startedAt?: Date;
  @Prop() completedAt?: Date;
}

export type ProcedureDocument = Procedure & Document;
export const ProcedureSchema = SchemaFactory.createForClass(Procedure);
ProcedureSchema.index({ patientId: 1, tenantId: 1, status: 1 });
