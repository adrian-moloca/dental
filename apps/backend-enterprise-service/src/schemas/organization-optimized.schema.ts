import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrganizationStatus } from '@dentalos/shared-domain';

@Schema({
  collection: 'organizations',
  timestamps: true,
  // Performance optimizations
  autoIndex: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
})
export class OrganizationDocument extends Document {
  @Prop({ required: true, unique: true, index: true })
  name!: string;

  @Prop({ required: true })
  legalName!: string;

  @Prop({ required: true, unique: true, index: true })
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

// Optimized Compound Indexes
// Query: Find active organizations by subscription tier
OrganizationSchema.index({ status: 1, subscriptionTier: 1 });

// Query: Find organizations sorted by creation date (common for list views)
OrganizationSchema.index({ createdAt: -1 });

// Query: Find organizations by status sorted by date
OrganizationSchema.index({ status: 1, createdAt: -1 });

// Query: Subscription tier analytics
OrganizationSchema.index({ subscriptionTier: 1, createdAt: -1 });

// Query: Find organizations with expiring subscriptions
OrganizationSchema.index({ subscriptionEndDate: 1, status: 1 });

// Performance: Covered query for list views (projection only)
// Returns only essential fields without fetching full documents
OrganizationSchema.index(
  { status: 1, subscriptionTier: 1, name: 1, createdAt: -1 },
  { name: 'list_view_covered' },
);

// Disable autoIndex in production (create indexes manually)
OrganizationSchema.set('autoIndex', process.env.NODE_ENV !== 'production');
