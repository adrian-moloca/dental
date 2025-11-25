import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'provider_clinic_assignments',
  timestamps: true,
  autoIndex: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
})
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

  @Prop({ required: true, default: true, index: true })
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

// Optimized Compound Indexes

// Query: Unique constraint - one assignment per provider-clinic pair
ProviderClinicAssignmentSchema.index(
  { providerId: 1, clinicId: 1 },
  { unique: true, name: 'provider_clinic_unique' },
);

// Query: Find active assignments for a provider (most common)
ProviderClinicAssignmentSchema.index(
  { providerId: 1, isActive: 1, assignedAt: -1 },
  { name: 'provider_active' },
);

// Query: Find active staff for a clinic (most common)
ProviderClinicAssignmentSchema.index(
  { clinicId: 1, isActive: 1, assignedAt: -1 },
  { name: 'clinic_active' },
);

// Query: Find active assignments for an organization
ProviderClinicAssignmentSchema.index(
  { organizationId: 1, isActive: 1, assignedAt: -1 },
  { name: 'org_active' },
);

// Query: Find primary clinic for provider
ProviderClinicAssignmentSchema.index(
  { providerId: 1, isPrimaryClinic: 1, isActive: 1 },
  { name: 'provider_primary' },
);

// Query: Find assignments by clinic and organization (common for validation)
ProviderClinicAssignmentSchema.index(
  { clinicId: 1, organizationId: 1, isActive: 1 },
  { name: 'clinic_org_active' },
);

// Query: Analytics - assignment history
ProviderClinicAssignmentSchema.index(
  { organizationId: 1, assignedAt: -1 },
  { name: 'org_history' },
);

// Covered query for list views
ProviderClinicAssignmentSchema.index(
  { providerId: 1, isActive: 1, clinicId: 1, assignedAt: -1, roles: 1 },
  { name: 'provider_list_covered' },
);

ProviderClinicAssignmentSchema.index(
  { clinicId: 1, isActive: 1, providerId: 1, assignedAt: -1, roles: 1 },
  { name: 'clinic_list_covered' },
);

ProviderClinicAssignmentSchema.set('autoIndex', process.env.NODE_ENV !== 'production');
