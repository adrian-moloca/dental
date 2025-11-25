import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClinicStatus } from '@dentalos/shared-domain';

@Schema({ collection: 'clinics', timestamps: true })
export class ClinicDocument extends Document {
  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ required: true, enum: Object.values(ClinicStatus), index: true })
  status!: ClinicStatus;

  @Prop({ type: Object, required: true })
  address!: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true })
  email!: string;

  @Prop()
  website?: string;

  @Prop()
  managerUserId?: string;

  @Prop()
  managerName?: string;

  @Prop()
  managerEmail?: string;

  @Prop({ required: true })
  timezone!: string;

  @Prop({ required: true, default: 'en-US' })
  locale!: string;

  @Prop({ type: Object })
  operatingHours?: any;

  @Prop()
  licenseNumber?: string;

  @Prop()
  accreditationDetails?: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ required: true })
  updatedBy!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ClinicSchema = SchemaFactory.createForClass(ClinicDocument);

ClinicSchema.index({ organizationId: 1, status: 1 });
ClinicSchema.index({ organizationId: 1, createdAt: -1 });
ClinicSchema.index({ code: 1 }, { unique: true });
