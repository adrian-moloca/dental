import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  SterilizationCycleStatus,
  SterilizationCycleType,
  BiologicalIndicatorResult,
} from '@dentalos/shared-domain';

@Schema({ collection: 'sterilization_cycles', timestamps: true })
export class SterilizationCycle extends Document {
  @Prop({ type: String, required: true, unique: true })
  cycleNumber!: string;

  @Prop({
    type: String,
    enum: Object.values(SterilizationCycleType),
    required: true,
    default: SterilizationCycleType.STEAM,
  })
  type!: SterilizationCycleType;

  @Prop({
    type: String,
    enum: Object.values(SterilizationCycleStatus),
    required: true,
    default: SterilizationCycleStatus.PENDING,
  })
  status!: SterilizationCycleStatus;

  @Prop({ type: String, index: true })
  autoclaveId?: string;

  @Prop({ type: String, required: true })
  operatorId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'Instrument', default: [] })
  instruments!: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  instrumentCount!: number;

  @Prop({ type: Number })
  temperature?: number;

  @Prop({ type: Number })
  pressure?: number;

  @Prop({ type: Number })
  durationMinutes?: number;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({
    type: String,
    enum: Object.values(BiologicalIndicatorResult),
  })
  biologicalIndicatorResult?: BiologicalIndicatorResult;

  @Prop({ type: Date })
  biologicalIndicatorTestedAt?: Date;

  @Prop({ type: String })
  biologicalIndicatorTestedBy?: string;

  @Prop({ type: String })
  notes?: string;

  @Prop({ type: String })
  failureReason?: string;

  // Multi-tenancy
  @Prop({ type: String, required: true, index: true })
  tenantId!: string;

  @Prop({ type: String, required: true, index: true })
  organizationId!: string;

  @Prop({ type: String, required: true, index: true })
  clinicId!: string;

  // Audit fields
  @Prop({ type: String, required: true })
  createdBy!: string;

  @Prop({ type: String })
  updatedBy?: string;
}

export const SterilizationCycleSchema = SchemaFactory.createForClass(SterilizationCycle);

// Indexes
SterilizationCycleSchema.index({ tenantId: 1, organizationId: 1, clinicId: 1 });
SterilizationCycleSchema.index({ tenantId: 1, cycleNumber: 1 }, { unique: true });
SterilizationCycleSchema.index({ status: 1 });
SterilizationCycleSchema.index({ autoclaveId: 1 });
SterilizationCycleSchema.index({ startedAt: -1 });
SterilizationCycleSchema.index({ completedAt: -1 });
