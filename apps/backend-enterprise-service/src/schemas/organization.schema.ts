import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrganizationStatus } from '@dentalos/shared-domain';

@Schema({ collection: 'organizations', timestamps: true })
export class OrganizationDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  name!: string;

  @Prop({ required: true })
  legalName!: string;

  @Prop({ required: true, unique: true })
  taxId!: string;

  @Prop({ required: true, enum: Object.values(OrganizationStatus), index: true })
  status!: OrganizationStatus;

  @Prop({ required: true })
  primaryContactName!: string;

  @Prop({ required: true })
  primaryContactEmail!: string;

  @Prop({ required: true })
  primaryContactPhone!: string;

  @Prop({ type: Object, required: true })
  address!: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop()
  website?: string;

  @Prop()
  logoUrl?: string;

  @Prop({ required: true, enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'], index: true })
  subscriptionTier!: string;

  @Prop({ required: true })
  subscriptionStartDate!: Date;

  @Prop()
  subscriptionEndDate?: Date;

  @Prop({ required: true })
  maxClinics!: number;

  @Prop({ required: true })
  maxUsers!: number;

  @Prop({ required: true })
  maxStorageGB!: number;

  @Prop()
  billingAccountId?: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ required: true })
  updatedBy!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationDocument);

OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ subscriptionTier: 1 });
OrganizationSchema.index({ createdAt: -1 });
