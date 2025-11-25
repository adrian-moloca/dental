import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'provider_clinic_assignments', timestamps: true })
export class ProviderClinicAssignmentDocument extends Document {
  @Prop({ required: true, index: true })
  providerId!: string;

  @Prop({ required: true, index: true })
  clinicId!: string;

  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ type: [String], default: [] })
  roles!: string[];

  @Prop({ type: Object })
  workingHoursOverride?: any;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ required: true, default: false })
  isPrimaryClinic!: boolean;

  @Prop({ required: true })
  assignedAt!: Date;

  @Prop({ required: true })
  assignedBy!: string;

  @Prop()
  unassignedAt?: Date;

  @Prop()
  unassignedBy?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ProviderClinicAssignmentSchema = SchemaFactory.createForClass(
  ProviderClinicAssignmentDocument,
);

ProviderClinicAssignmentSchema.index({ providerId: 1, clinicId: 1 }, { unique: true });
ProviderClinicAssignmentSchema.index({ organizationId: 1, isActive: 1 });
ProviderClinicAssignmentSchema.index({ clinicId: 1, isActive: 1 });
