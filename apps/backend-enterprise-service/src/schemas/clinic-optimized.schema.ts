import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ClinicStatus } from '@dentalos/shared-domain';

@Schema({
  collection: 'clinics',
  timestamps: true,
  autoIndex: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
})
export class ClinicDocument extends Document {
  @Prop({ required: true, index: true })
  organizationId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })
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

  @Prop({ index: true })
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

// Optimized Compound Indexes

// Query: Find active clinics for an organization (most common query)
ClinicSchema.index({ organizationId: 1, status: 1 }, { name: 'org_status' });

// Query: Find clinics by organization sorted by date
ClinicSchema.index({ organizationId: 1, createdAt: -1 }, { name: 'org_date' });

// Query: Find clinics by organization and status, sorted by date
ClinicSchema.index({ organizationId: 1, status: 1, createdAt: -1 }, { name: 'org_status_date' });

// Query: Find clinics by manager
ClinicSchema.index({ managerUserId: 1, status: 1 }, { name: 'manager_status' });

// Query: Lookup by code (unique constraint already creates index)
ClinicSchema.index({ code: 1 }, { unique: true });

// Query: Geographic queries (by state/city)
ClinicSchema.index({ 'address.state': 1, 'address.city': 1 }, { name: 'location' });

// Covered query for list views
ClinicSchema.index(
  { organizationId: 1, status: 1, name: 1, code: 1, createdAt: -1 },
  { name: 'list_view_covered' },
);

ClinicSchema.set('autoIndex', process.env.NODE_ENV !== 'production');
