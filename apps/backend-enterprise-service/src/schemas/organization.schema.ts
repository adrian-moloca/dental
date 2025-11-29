import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrganizationStatus } from '@dentalos/shared-domain';
import { baseSchemaPlugin, auditTrailPlugin, eventEmitterPlugin } from '@dentalos/shared-infra';

/**
 * Organization document schema
 *
 * Represents a top-level organization that can manage multiple clinics
 */
@Schema({
  collection: 'organizations',
  timestamps: true,
  versionKey: false,
})
export class OrganizationDocument extends Document {
  // Core identification
  @Prop({
    required: true,
    index: true,
    minlength: 3,
    maxlength: 100,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 200,
    trim: true,
  })
  legalName!: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[A-Z0-9-]+$/i.test(v),
      message: 'Tax ID must contain only alphanumeric characters and hyphens',
    },
  })
  taxId!: string;

  // Status and lifecycle
  @Prop({
    required: true,
    enum: Object.values(OrganizationStatus),
    index: true,
    default: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;

  // Contact information
  @Prop({
    required: true,
    minlength: 2,
    maxlength: 100,
    trim: true,
  })
  primaryContactName!: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format',
    },
  })
  primaryContactEmail!: string;

  @Prop({
    required: true,
    trim: true,
    validate: {
      validator: (v: string) => /^\+?[\d\s-()]+$/.test(v),
      message: 'Invalid phone format',
    },
  })
  primaryContactPhone!: string;

  // Address (embedded document)
  @Prop({
    type: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: 'US' },
    },
    required: true,
  })
  address!: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Optional fields
  @Prop({ trim: true })
  website?: string;

  @Prop()
  logoUrl?: string;

  // Subscription management
  @Prop({
    required: true,
    enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
    index: true,
    default: 'FREE',
  })
  subscriptionTier!: string;

  @Prop({ required: true, default: Date.now })
  subscriptionStartDate!: Date;

  @Prop()
  subscriptionEndDate?: Date;

  // Limits and quotas
  @Prop({
    required: true,
    min: 1,
    max: 1000,
    default: 1,
  })
  maxClinics!: number;

  @Prop({
    required: true,
    min: 1,
    max: 10000,
    default: 5,
  })
  maxUsers!: number;

  @Prop({
    required: true,
    min: 1,
    max: 10000,
    default: 10,
  })
  maxStorageGB!: number;

  // Current usage (for quota tracking)
  @Prop({ required: true, default: 0, min: 0 })
  currentClinicCount!: number;

  @Prop({ required: true, default: 0, min: 0 })
  currentUserCount!: number;

  @Prop({ required: true, default: 0, min: 0 })
  currentStorageGB!: number;

  // Billing
  @Prop()
  billingAccountId?: string;

  // Versioning for optimistic locking
  @Prop({ required: true, default: 1 })
  version!: number;

  // Audit fields (added by baseSchemaPlugin)
  tenantId!: string;
  createdBy!: string;
  updatedBy!: string;

  // Soft delete fields (added by baseSchemaPlugin)
  isDeleted!: boolean;
  deletedAt?: Date;
  deletedBy?: string;

  // Timestamps
  createdAt!: Date;
  updatedAt!: Date;
}

// Create schema
export const OrganizationSchema = SchemaFactory.createForClass(OrganizationDocument);

// Apply plugins
OrganizationSchema.plugin(baseSchemaPlugin, {
  softDelete: true,
  versioning: true,
  multiTenant: true,
  audit: true,
});

OrganizationSchema.plugin(auditTrailPlugin, {
  excludeFields: ['__v', 'updatedAt', 'version'],
  emitEvents: true,
});

OrganizationSchema.plugin(eventEmitterPlugin, {
  eventPrefix: 'enterprise.organization',
  enabled: true,
  payloadTransformer: (doc: any, eventType: any) => ({
    id: doc._id.toString(),
    tenantId: doc.tenantId,
    name: doc.name,
    legalName: doc.legalName,
    taxId: doc.taxId,
    status: doc.status,
    subscriptionTier: doc.subscriptionTier,
    eventType,
    timestamp: new Date().toISOString(),
    ...(eventType === 'created' && { createdBy: doc.createdBy }),
    ...(eventType === 'updated' && { updatedBy: doc.updatedBy }),
    ...(eventType === 'deleted' && { deletedBy: doc.deletedBy }),
  }),
});

// Indexes
OrganizationSchema.index({ tenantId: 1, status: 1 });
OrganizationSchema.index({ tenantId: 1, createdAt: -1 });
OrganizationSchema.index({ tenantId: 1, subscriptionTier: 1 });
OrganizationSchema.index({ taxId: 1 }, { unique: true });
OrganizationSchema.index({ subscriptionEndDate: 1 }, { sparse: true });

// Compound index for common queries
OrganizationSchema.index(
  { tenantId: 1, status: 1, subscriptionTier: 1 },
  { name: 'tenant_status_tier_idx' },
);

// Text index for search
OrganizationSchema.index(
  {
    name: 'text',
    legalName: 'text',
  },
  {
    weights: {
      name: 10,
      legalName: 5,
    },
    name: 'organization_text_search',
  },
);

// Virtuals
OrganizationSchema.virtual('fullAddress').get(function () {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
});

OrganizationSchema.virtual('isExpired').get(function () {
  return this.subscriptionEndDate && this.subscriptionEndDate < new Date();
});

OrganizationSchema.virtual('daysUntilExpiration').get(function () {
  if (!this.subscriptionEndDate) return null;
  const diff = this.subscriptionEndDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

OrganizationSchema.virtual('clinicUsagePercentage').get(function () {
  return (this.currentClinicCount / this.maxClinics) * 100;
});

OrganizationSchema.virtual('userUsagePercentage').get(function () {
  return (this.currentUserCount / this.maxUsers) * 100;
});

OrganizationSchema.virtual('storageUsagePercentage').get(function () {
  return (this.currentStorageGB / this.maxStorageGB) * 100;
});

// Instance methods
OrganizationSchema.methods.activate = function () {
  this.status = OrganizationStatus.ACTIVE;
  return this.save();
};

OrganizationSchema.methods.suspend = function (reason?: string) {
  this.status = OrganizationStatus.SUSPENDED;
  if (reason) {
    this.set('suspensionReason', reason);
  }
  return this.save();
};

OrganizationSchema.methods.canAddClinic = function (): boolean {
  return this.currentClinicCount < this.maxClinics;
};

OrganizationSchema.methods.canAddUser = function (): boolean {
  return this.currentUserCount < this.maxUsers;
};

OrganizationSchema.methods.hasStorageAvailable = function (requiredGB: number): boolean {
  return this.currentStorageGB + requiredGB <= this.maxStorageGB;
};

OrganizationSchema.methods.incrementClinicCount = async function () {
  if (!this.canAddClinic()) {
    throw new Error('Organization has reached maximum clinic limit');
  }
  this.currentClinicCount += 1;
  return this.save();
};

OrganizationSchema.methods.decrementClinicCount = async function () {
  if (this.currentClinicCount > 0) {
    this.currentClinicCount -= 1;
    return this.save();
  }
};

OrganizationSchema.methods.getUsageSummary = function () {
  return {
    clinics: {
      current: this.currentClinicCount,
      max: this.maxClinics,
      percentage: this.clinicUsagePercentage,
    },
    users: {
      current: this.currentUserCount,
      max: this.maxUsers,
      percentage: this.userUsagePercentage,
    },
    storage: {
      current: this.currentStorageGB,
      max: this.maxStorageGB,
      percentage: this.storageUsagePercentage,
    },
  };
};

// Static methods
OrganizationSchema.statics.findByTaxId = function (taxId: string) {
  return this.findOne({ taxId, isDeleted: { $ne: true } });
};

OrganizationSchema.statics.findActiveOrganizations = function (tenantId: string) {
  return this.find({
    tenantId,
    status: OrganizationStatus.ACTIVE,
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });
};

OrganizationSchema.statics.findExpiringSubscriptions = function (daysAhead: number) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return this.find({
    subscriptionEndDate: { $lte: futureDate, $gte: new Date() },
    status: OrganizationStatus.ACTIVE,
    isDeleted: { $ne: true },
  }).sort({ subscriptionEndDate: 1 });
};

OrganizationSchema.statics.findBySubscriptionTier = function (tier: string, tenantId?: string) {
  const filter: any = {
    subscriptionTier: tier,
    isDeleted: { $ne: true },
  };

  if (tenantId) {
    filter.tenantId = tenantId;
  }

  return this.find(filter).sort({ createdAt: -1 });
};

// Pre-save hooks
OrganizationSchema.pre('save', async function (next) {
  // Validate business rules
  if (this.isModified('maxClinics') && this.maxClinics < this.currentClinicCount) {
    throw new Error('Cannot reduce maxClinics below current clinic count');
  }

  if (this.isModified('maxUsers') && this.maxUsers < this.currentUserCount) {
    throw new Error('Cannot reduce maxUsers below current user count');
  }

  if (this.isModified('maxStorageGB') && this.maxStorageGB < this.currentStorageGB) {
    throw new Error('Cannot reduce maxStorageGB below current storage usage');
  }

  // Normalize data
  if (this.isModified('primaryContactEmail')) {
    this.primaryContactEmail = this.primaryContactEmail.toLowerCase().trim();
  }

  if (this.isModified('name')) {
    this.name = this.name.trim();
  }

  // Set tenantId to self on creation (organizations are their own tenant root)
  if (this.isNew && !this.tenantId) {
    // This will be set after _id is assigned
    (this as any).once('save', () => {
      this.tenantId = this._id.toString();
    });
  }

  next();
});

// Pre-remove hook
OrganizationSchema.pre('deleteOne', async function (this: any, next: any) {
  // Check if organization has active clinics
  const mongoose = await import('mongoose');
  const Clinic = mongoose.default.model('Clinic');

  const clinicCount = await Clinic.countDocuments({
    organizationId: this._id,
    isDeleted: { $ne: true },
  });

  if (clinicCount > 0) {
    throw new Error('Cannot delete organization with active clinics');
  }

  next();
});

// Configure toJSON
OrganizationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    if (!ret.isDeleted) {
      delete ret.isDeleted;
      delete ret.deletedAt;
      delete ret.deletedBy;
    }
    return ret;
  },
});

OrganizationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});
