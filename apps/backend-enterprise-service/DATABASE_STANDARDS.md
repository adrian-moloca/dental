# MongoDB Database Standards - Backend Enterprise Service

## Table of Contents

1. [Schema Standards](#schema-standards)
2. [Mongoose Hooks](#mongoose-hooks)
3. [Indexing Strategy](#indexing-strategy)
4. [CRUD Standards](#crud-standards)
5. [Query Optimization](#query-optimization)
6. [Transaction Management](#transaction-management)
7. [Naming Conventions](#naming-conventions)
8. [Best Practices](#best-practices)

---

## Schema Standards

### 1. Schema Definition

All schemas MUST follow these standards:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseSchemaPlugin, auditTrailPlugin, eventEmitterPlugin } from '@dentalos/shared-infra';

@Schema({
  collection: 'organizations',  // Explicit collection name (plural, lowercase)
  timestamps: true,              // Enable createdAt/updatedAt
  versionKey: false,             // Disable __v (we use optimistic locking plugin)
})
export class OrganizationDocument extends Document {
  // Required fields
  @Prop({ required: true, index: true })
  name!: string;

  // Optional fields
  @Prop()
  description?: string;

  // Enum fields
  @Prop({
    required: true,
    enum: Object.values(OrganizationStatus),
    index: true
  })
  status!: OrganizationStatus;

  // Embedded objects
  @Prop({ type: Object, required: true })
  address!: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Arrays
  @Prop({ type: [String], default: [] })
  tags!: string[];

  // Timestamps (auto-managed)
  createdAt!: Date;
  updatedAt!: Date;
}

// Create schema
export const OrganizationSchema = SchemaFactory.createForClass(OrganizationDocument);

// Apply plugins
OrganizationSchema.plugin(baseSchemaPlugin, {
  softDelete: true,      // Enable soft delete
  versioning: true,      // Enable optimistic locking
  multiTenant: true,     // Enable tenant scoping
  audit: true,           // Enable audit fields
});

OrganizationSchema.plugin(auditTrailPlugin, {
  excludeFields: ['__v', 'updatedAt'],
  emitEvents: true,
});

OrganizationSchema.plugin(eventEmitterPlugin, {
  eventPrefix: 'enterprise.organization',
  enabled: true,
});
```

### 2. Required vs Optional Fields Strategy

**Required Fields:**
- Core business identifiers (name, code, etc.)
- Foreign keys (organizationId, clinicId, etc.)
- Status fields
- Audit fields (createdBy, updatedBy)
- Multi-tenant fields (tenantId)

**Optional Fields:**
- Descriptive text (description, notes)
- Auxiliary data (website, logoUrl)
- Conditional data (managerUserId - only if manager assigned)

### 3. Default Values Strategy

```typescript
// Use default for arrays
@Prop({ type: [String], default: [] })
tags!: string[];

// Use default for booleans
@Prop({ required: true, default: true })
isActive!: boolean;

// Use default for dates
@Prop({ required: true, default: Date.now })
activatedAt!: Date;

// Use default for numbers
@Prop({ required: true, default: 0 })
retryCount!: number;

// DON'T use default for required business fields
// @Prop({ required: true, default: 'ACTIVE' })  ❌ BAD
// status!: string;

// DO require explicit values
@Prop({ required: true, enum: Object.values(Status) })  // ✅ GOOD
status!: Status;
```

### 4. Validation at Schema Level

```typescript
import { IsEmail, MinLength, MaxLength } from 'class-validator';

@Prop({
  required: true,
  validate: {
    validator: (v: string) => /^[a-z0-9-]+$/.test(v),
    message: 'Code must contain only lowercase letters, numbers, and hyphens'
  }
})
code!: string;

@Prop({
  required: true,
  minlength: 3,
  maxlength: 100,
  trim: true,
})
name!: string;

@Prop({
  required: true,
  validate: {
    validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    message: 'Invalid email format'
  },
  lowercase: true,
  trim: true,
})
email!: string;

// Custom validator function
@Prop({
  required: true,
  validate: {
    validator: function(v: string) {
      // 'this' refers to the document
      return v !== this.get('previousValue');
    },
    message: 'Value must be different from previous value'
  }
})
currentValue!: string;
```

### 5. Virtuals for Computed Fields

```typescript
// Define virtual fields
OrganizationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`;
});

OrganizationSchema.virtual('isExpired').get(function() {
  return this.subscriptionEndDate && this.subscriptionEndDate < new Date();
});

OrganizationSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.subscriptionEndDate) return null;
  const diff = this.subscriptionEndDate.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// Include virtuals in toJSON
OrganizationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
```

### 6. Methods vs Statics Naming

```typescript
// Instance Methods (operate on a single document)
// Use verb + noun pattern
OrganizationSchema.methods.activate = function() {
  this.status = OrganizationStatus.ACTIVE;
  this.activatedAt = new Date();
  return this.save();
};

OrganizationSchema.methods.suspend = function(reason: string) {
  this.status = OrganizationStatus.SUSPENDED;
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  return this.save();
};

OrganizationSchema.methods.canAddClinic = function(): boolean {
  return this.clinicCount < this.maxClinics;
};

OrganizationSchema.methods.calculateUsage = function() {
  return {
    clinics: this.clinicCount,
    maxClinics: this.maxClinics,
    users: this.userCount,
    maxUsers: this.maxUsers,
  };
};

// Static Methods (operate on the model/collection)
// Use find/get/calculate + criteria pattern
OrganizationSchema.statics.findByTaxId = function(taxId: string) {
  return this.findOne({ taxId });
};

OrganizationSchema.statics.findActiveOrganizations = function(tenantId: string) {
  return this.find({
    tenantId,
    status: OrganizationStatus.ACTIVE,
    isDeleted: { $ne: true }
  });
};

OrganizationSchema.statics.findExpiringSubscriptions = function(daysAhead: number) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return this.find({
    subscriptionEndDate: { $lte: futureDate, $gte: new Date() },
    status: OrganizationStatus.ACTIVE,
  });
};

OrganizationSchema.statics.calculateTotalRevenue = async function(tenantId: string) {
  const result = await this.aggregate([
    { $match: { tenantId, status: OrganizationStatus.ACTIVE } },
    { $group: { _id: null, total: { $sum: '$monthlyRevenue' } } }
  ]);
  return result[0]?.total || 0;
};
```

---

## Mongoose Hooks

### 1. Pre-Save Hooks

```typescript
// Validation before save
OrganizationSchema.pre('save', async function(next) {
  // Validate business rules
  if (this.isModified('maxClinics') && this.maxClinics < this.clinicCount) {
    throw new Error('Cannot reduce maxClinics below current clinic count');
  }

  // Auto-generate fields
  if (this.isNew && !this.code) {
    this.code = await generateUniqueCode(this.name);
  }

  // Normalize data
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }

  next();
});

// Auditing
OrganizationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Creation audit already handled by baseSchemaPlugin
    this.version = 1;
  } else {
    // Increment version for optimistic locking
    this.version = (this.version || 0) + 1;
  }

  next();
});
```

### 2. Post-Save Hooks

```typescript
// Event emission (handled by eventEmitterPlugin)
OrganizationSchema.post('save', function(doc) {
  // Custom business logic after save
  if (doc.isNew) {
    console.log(`New organization created: ${doc.name}`);
    // Trigger initialization workflows
  }
});

// Cache invalidation
OrganizationSchema.post('save', async function(doc) {
  await cacheManager.del(`organization:${doc._id}`);
  await cacheManager.del(`organization:taxId:${doc.taxId}`);
});
```

### 3. Pre-Remove Hooks

```typescript
// Cascade delete or prevent deletion
OrganizationSchema.pre('remove', async function(next) {
  // Check if organization has active clinics
  const clinicCount = await mongoose.model('Clinic').countDocuments({
    organizationId: this._id,
    isDeleted: { $ne: true }
  });

  if (clinicCount > 0) {
    throw new Error('Cannot delete organization with active clinics');
  }

  // Clean up related data
  await mongoose.model('Subscription').deleteMany({ organizationId: this._id });

  next();
});
```

### 4. Pre-FindOneAndUpdate Hooks

```typescript
// Ensure audit trails on updates
OrganizationSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;

  // Ensure updatedBy is set
  if (!update.updatedBy && !update.$set?.updatedBy) {
    throw new Error('updatedBy is required for updates');
  }

  // Auto-update timestamp
  if (!update.$set) {
    update.$set = {};
  }
  update.$set.updatedAt = new Date();

  next();
});
```

### 5. Query Middleware vs Document Middleware

```typescript
// Document Middleware (this = document)
OrganizationSchema.pre('save', function(next) {
  console.log('Saving document:', this._id);
  next();
});

// Query Middleware (this = query)
OrganizationSchema.pre('find', function(next) {
  // Auto-filter soft-deleted records
  this.where({ isDeleted: { $ne: true } });
  next();
});

OrganizationSchema.pre('findOne', function(next) {
  // Auto-filter soft-deleted records
  this.where({ isDeleted: { $ne: true } });
  next();
});

OrganizationSchema.pre(/^find/, function(next) {
  // Apply to all find operations
  if (!this.getOptions().showDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});
```

---

## Indexing Strategy

### 1. Single Field Indexes

```typescript
// Primary identifiers
OrganizationSchema.index({ _id: 1 });  // Implicit

// Unique identifiers
OrganizationSchema.index({ taxId: 1 }, { unique: true });
OrganizationSchema.index({ code: 1 }, { unique: true });

// Foreign keys
OrganizationSchema.index({ organizationId: 1 });
OrganizationSchema.index({ clinicId: 1 });

// Status fields (frequently queried)
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ isActive: 1 });

// Date fields (for range queries)
OrganizationSchema.index({ createdAt: -1 });
OrganizationSchema.index({ subscriptionEndDate: 1 });
```

### 2. Compound Indexes (Order Matters!)

```typescript
// Multi-tenant queries (tenantId first!)
OrganizationSchema.index({ tenantId: 1, status: 1 });
OrganizationSchema.index({ tenantId: 1, createdAt: -1 });
OrganizationSchema.index({ tenantId: 1, subscriptionTier: 1 });

// Filtering + sorting (filter fields first, sort field last)
ClinicSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
ClinicSchema.index({ organizationId: 1, isActive: 1, name: 1 });

// Unique compound indexes
ProviderClinicAssignmentSchema.index(
  { providerId: 1, clinicId: 1 },
  { unique: true }
);

// Covering indexes (include all queried fields)
OrganizationSchema.index(
  { tenantId: 1, status: 1, subscriptionTier: 1 },
  { name: 'tenant_status_tier_idx' }
);
```

### 3. Sparse Indexes

```typescript
// Only index documents where field exists
OrganizationSchema.index(
  { billingAccountId: 1 },
  { sparse: true }
);

OrganizationSchema.index(
  { deletedAt: 1 },
  { sparse: true }
);
```

### 4. TTL Indexes

```typescript
// Auto-delete expired sessions after 24 hours
SessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

// Auto-delete temporary tokens after 15 minutes
TokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 900 }
);
```

### 5. Text Indexes for Search

```typescript
// Full-text search
OrganizationSchema.index(
  {
    name: 'text',
    legalName: 'text',
    description: 'text'
  },
  {
    weights: {
      name: 10,
      legalName: 5,
      description: 1
    },
    name: 'organization_text_search'
  }
);

// Usage:
// db.organizations.find({ $text: { $search: "dental clinic" } })
```

### 6. Geospatial Indexes

```typescript
@Schema()
export class ClinicDocument extends Document {
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  })
  location!: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

// 2dsphere index for geospatial queries
ClinicSchema.index({ location: '2dsphere' });

// Usage:
// Find clinics within 5km of a point
// db.clinics.find({
//   location: {
//     $near: {
//       $geometry: { type: "Point", coordinates: [-73.9667, 40.78] },
//       $maxDistance: 5000
//     }
//   }
// })
```

### 7. Index Performance Guidelines

**DO:**
- Index fields used in queries (WHERE, JOIN, ORDER BY)
- Create compound indexes for common query patterns
- Put most selective fields first in compound indexes
- Use sparse indexes for optional fields
- Monitor index usage with `db.collection.getIndexes()`

**DON'T:**
- Over-index (each index has write overhead)
- Create redundant indexes (e.g., {a:1, b:1} and {a:1})
- Index low-cardinality fields alone (e.g., boolean)
- Forget to index foreign keys

---

## CRUD Standards

### 1. Create Operations

```typescript
// In Repository
async create(
  data: Partial<OrganizationDocument>,
  context: { userId: string; tenantId: string },
  options: RepositoryQueryOptions = {},
): Promise<OrganizationDocument> {
  // Validate required fields (beyond schema validation)
  if (!data.name || !data.legalName) {
    throw new BadRequestException('Name and legal name are required');
  }

  // Check for duplicates
  const existing = await this.model.findOne({
    tenantId: context.tenantId,
    taxId: data.taxId,
  });

  if (existing) {
    throw new ConflictException('Organization with this tax ID already exists');
  }

  // Set defaults and audit fields
  const document = new this.model({
    ...data,
    tenantId: context.tenantId,
    createdBy: context.userId,
    updatedBy: context.userId,
    status: data.status || OrganizationStatus.ACTIVE,
  });

  // Save with optional transaction
  await document.save({ session: options.session });

  this.logger.log(`Created organization ${document._id}`);

  return document;
}
```

### 2. Read Operations

```typescript
// Pagination
async findAll(
  filter: FilterQuery<OrganizationDocument>,
  tenantId: string,
  pagination: PaginationOptions = {},
  options: RepositoryQueryOptions = {},
): Promise<PaginatedResult<OrganizationDocument>> {
  const scopedFilter = { ...filter, tenantId };

  const limit = pagination.limit || 20;
  const page = pagination.page || 1;
  const skip = (page - 1) * limit;
  const sort = pagination.sort || { createdAt: -1 };

  // Build query with optimizations
  let query = this.model.find(scopedFilter)
    .limit(limit)
    .skip(skip)
    .sort(sort);

  // Apply lean() for read-only
  if (options.lean) {
    query = query.lean();
  }

  // Select specific fields
  if (options.select) {
    query = query.select(options.select);
  }

  // Populate relations
  if (options.populate) {
    query = query.populate(options.populate);
  }

  // Execute in parallel
  const [data, total] = await Promise.all([
    query.exec(),
    this.model.countDocuments(scopedFilter).exec(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

// Field selection for performance
async findById(
  id: string,
  tenantId: string,
  options: { select?: string[] } = {},
): Promise<OrganizationDocument | null> {
  let query = this.model.findOne({ _id: id, tenantId });

  if (options.select) {
    query = query.select(options.select.join(' '));
  }

  return query.lean().exec();
}
```

### 3. Update Operations

```typescript
// Partial update with optimistic locking
async updateById(
  id: string,
  update: UpdateQuery<OrganizationDocument>,
  context: { userId: string; tenantId: string; expectedVersion?: number },
  options: RepositoryQueryOptions = {},
): Promise<OrganizationDocument | null> {
  const filter: FilterQuery<OrganizationDocument> = {
    _id: id,
    tenantId: context.tenantId,
  };

  // Optimistic locking
  if (context.expectedVersion !== undefined) {
    filter.version = context.expectedVersion;
  }

  const updateData = {
    ...update,
    updatedBy: context.userId,
    $inc: { version: 1 },
  };

  const document = await this.model.findOneAndUpdate(
    filter,
    updateData,
    {
      new: true,
      runValidators: true,
      session: options.session,
    },
  ).exec();

  if (!document && context.expectedVersion !== undefined) {
    throw new ConflictException('Document was modified by another user');
  }

  if (document) {
    this.logger.log(`Updated organization ${id}`);
  }

  return document;
}

// Bulk update
async updateMany(
  filter: FilterQuery<OrganizationDocument>,
  update: UpdateQuery<OrganizationDocument>,
  context: { userId: string; tenantId: string },
): Promise<number> {
  const scopedFilter = { ...filter, tenantId: context.tenantId };
  const updateData = {
    ...update,
    updatedBy: context.userId,
  };

  const result = await this.model.updateMany(scopedFilter, updateData).exec();

  this.logger.log(`Updated ${result.modifiedCount} organizations`);

  return result.modifiedCount;
}
```

### 4. Delete Operations

```typescript
// Soft delete (preferred)
async softDelete(
  id: string,
  context: { userId: string; tenantId: string },
  options: RepositoryQueryOptions = {},
): Promise<OrganizationDocument | null> {
  const document = await this.model.findOneAndUpdate(
    { _id: id, tenantId: context.tenantId },
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: context.userId,
      updatedBy: context.userId,
    },
    {
      new: true,
      session: options.session,
    },
  ).exec();

  if (document) {
    this.logger.log(`Soft deleted organization ${id}`);
  }

  return document;
}

// Hard delete (use with extreme caution)
async hardDelete(
  id: string,
  tenantId: string,
  options: RepositoryQueryOptions = {},
): Promise<OrganizationDocument | null> {
  // Verify no dependencies
  const clinicCount = await mongoose.model('Clinic').countDocuments({
    organizationId: id,
    isDeleted: { $ne: true },
  });

  if (clinicCount > 0) {
    throw new BadRequestException('Cannot delete organization with active clinics');
  }

  const document = await this.model.findOneAndDelete(
    { _id: id, tenantId },
    { session: options.session },
  ).exec();

  if (document) {
    this.logger.warn(`Hard deleted organization ${id}`);
  }

  return document;
}

// Restore soft-deleted document
async restore(
  id: string,
  context: { userId: string; tenantId: string },
): Promise<OrganizationDocument | null> {
  const document = await this.model.findOneAndUpdate(
    {
      _id: id,
      tenantId: context.tenantId,
      isDeleted: true,
    },
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      updatedBy: context.userId,
    },
    { new: true },
  ).exec();

  if (document) {
    this.logger.log(`Restored organization ${id}`);
  }

  return document;
}
```

### 5. Cascading Deletes

```typescript
// In OrganizationRepository
async deleteWithCascade(
  id: string,
  context: { userId: string; tenantId: string },
): Promise<void> {
  await this.withTransaction(async (session) => {
    // Soft delete organization
    await this.softDelete(id, context, { session });

    // Cascade soft delete to clinics
    await mongoose.model('Clinic').updateMany(
      { organizationId: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: context.userId,
      },
      { session },
    );

    // Cascade soft delete to users
    await mongoose.model('User').updateMany(
      { organizationId: id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: context.userId,
      },
      { session },
    );
  });
}
```

---

## Query Optimization

### 1. Use lean() for Read-Only Operations

```typescript
// Without lean (returns Mongoose document)
const orgs = await this.model.find({ tenantId }).exec();
// Memory: ~500KB for 100 docs

// With lean (returns plain JavaScript object)
const orgs = await this.model.find({ tenantId }).lean().exec();
// Memory: ~100KB for 100 docs (5x faster)

// Use lean when:
// - Read-only operations
// - Bulk data fetching
// - API responses
// - Data exports

// DON'T use lean when:
// - Need to call save()
// - Need to use virtuals
// - Need to use methods
// - Need change tracking
```

### 2. Select Only Needed Fields

```typescript
// Bad: Fetch all fields
const orgs = await this.model.find({ tenantId }).exec();

// Good: Select specific fields
const orgs = await this.model
  .find({ tenantId })
  .select('name status email')
  .lean()
  .exec();

// Good: Exclude specific fields
const orgs = await this.model
  .find({ tenantId })
  .select('-auditHistory -internalNotes')
  .lean()
  .exec();

// In Repository
async findForList(tenantId: string): Promise<OrganizationListItem[]> {
  return this.model
    .find({ tenantId })
    .select('_id name status email createdAt')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}
```

### 3. Populate Strategy

```typescript
// Bad: Multiple queries (N+1 problem)
const clinics = await this.clinicModel.find({ tenantId }).lean().exec();
for (const clinic of clinics) {
  clinic.organization = await this.orgModel.findById(clinic.organizationId).lean().exec();
}

// Good: Single query with populate
const clinics = await this.clinicModel
  .find({ tenantId })
  .populate('organizationId', 'name email')  // Only select needed fields
  .lean()
  .exec();

// Better: Multiple populate with field selection
const assignments = await this.assignmentModel
  .find({ tenantId })
  .populate('providerId', 'name email specialization')
  .populate('clinicId', 'name address')
  .lean()
  .exec();

// Best: Conditional populate based on needs
async findWithRelations(
  filter: FilterQuery<ClinicDocument>,
  options: { includeOrg?: boolean; includeManager?: boolean } = {},
): Promise<ClinicDocument[]> {
  let query = this.model.find(filter);

  if (options.includeOrg) {
    query = query.populate('organizationId', 'name email');
  }

  if (options.includeManager) {
    query = query.populate('managerUserId', 'name email');
  }

  return query.lean().exec();
}
```

### 4. Aggregation Pipelines

```typescript
// Complex queries with aggregation
async getOrganizationStats(tenantId: string): Promise<OrganizationStats[]> {
  return this.model.aggregate([
    // Stage 1: Filter by tenant
    {
      $match: {
        tenantId,
        isDeleted: { $ne: true },
      },
    },

    // Stage 2: Lookup clinics
    {
      $lookup: {
        from: 'clinics',
        localField: '_id',
        foreignField: 'organizationId',
        as: 'clinics',
      },
    },

    // Stage 3: Add computed fields
    {
      $addFields: {
        clinicCount: { $size: '$clinics' },
        activeClinics: {
          $size: {
            $filter: {
              input: '$clinics',
              cond: { $eq: ['$$this.status', 'ACTIVE'] },
            },
          },
        },
      },
    },

    // Stage 4: Group by subscription tier
    {
      $group: {
        _id: '$subscriptionTier',
        totalOrgs: { $sum: 1 },
        totalClinics: { $sum: '$clinicCount' },
        avgClinicsPerOrg: { $avg: '$clinicCount' },
      },
    },

    // Stage 5: Sort results
    {
      $sort: { totalOrgs: -1 },
    },
  ]).exec();
}
```

### 5. Batch Operations

```typescript
// Bad: Individual creates
for (const data of dataArray) {
  await this.model.create(data);
}

// Good: Bulk insert
const documents = dataArray.map(data => ({
  ...data,
  tenantId: context.tenantId,
  createdBy: context.userId,
  updatedBy: context.userId,
}));
await this.model.insertMany(documents);

// Good: Bulk update with bulkWrite
const operations = updates.map(({ id, data }) => ({
  updateOne: {
    filter: { _id: id, tenantId: context.tenantId },
    update: { $set: { ...data, updatedBy: context.userId } },
  },
}));
await this.model.bulkWrite(operations);
```

### 6. Cursor-Based Iteration

```typescript
// For large datasets, use cursor
async processAllOrganizations(
  processor: (org: OrganizationDocument) => Promise<void>,
): Promise<void> {
  const cursor = this.model.find({ isDeleted: { $ne: true } }).cursor();

  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    await processor(doc);
  }
}

// With batch processing
async processInBatches(batchSize = 100): Promise<void> {
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await this.model
      .find({ isDeleted: { $ne: true } })
      .skip(skip)
      .limit(batchSize)
      .lean()
      .exec();

    if (batch.length === 0) {
      hasMore = false;
      break;
    }

    await this.processBatch(batch);
    skip += batchSize;
  }
}
```

---

## Transaction Management

### 1. When to Use Transactions

**Use transactions when:**
- Creating related documents that must all succeed or fail together
- Updating multiple documents atomically
- Moving data between collections
- Financial operations
- Any operation requiring ACID guarantees

**Don't use transactions when:**
- Single document operations (already atomic)
- Read-only operations
- Operations that don't require atomicity
- Long-running operations (transactions have timeouts)

### 2. Transaction Examples

```typescript
// Example 1: Create organization with initial clinic
async createOrganizationWithClinic(
  orgData: CreateOrganizationDto,
  clinicData: CreateClinicDto,
  context: { userId: string; tenantId: string },
): Promise<{ organization: OrganizationDocument; clinic: ClinicDocument }> {
  return this.transactionManager.execute(async (session) => {
    // Create organization
    const organization = await this.organizationRepo.create(
      orgData,
      context,
      { session },
    );

    // Create clinic linked to organization
    const clinic = await this.clinicRepo.create(
      {
        ...clinicData,
        organizationId: organization._id.toString(),
      },
      context,
      { session },
    );

    return { organization, clinic };
  });
}

// Example 2: Transfer provider between clinics
async transferProvider(
  providerId: string,
  fromClinicId: string,
  toClinicId: string,
  context: { userId: string; tenantId: string },
): Promise<void> {
  await this.transactionManager.execute(async (session) => {
    // Deactivate old assignment
    await this.assignmentRepo.updateOne(
      { providerId, clinicId: fromClinicId },
      { isActive: false, unassignedAt: new Date(), unassignedBy: context.userId },
      context,
      { session },
    );

    // Create new assignment
    await this.assignmentRepo.create(
      {
        providerId,
        clinicId: toClinicId,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: context.userId,
      },
      context,
      { session },
    );
  });
}

// Example 3: Rollback on error
async complexOperation(): Promise<void> {
  try {
    await this.transactionManager.execute(async (session) => {
      // Step 1
      await this.step1(session);

      // Step 2 - might throw error
      await this.step2(session);

      // Step 3
      await this.step3(session);
    });
  } catch (error) {
    // Transaction automatically rolled back
    this.logger.error('Transaction failed', error);
    throw error;
  }
}
```

### 3. Transaction with Retry

```typescript
// Automatic retry on transient errors
async createWithRetry(
  data: CreateOrganizationDto,
  context: { userId: string; tenantId: string },
): Promise<OrganizationDocument> {
  return this.transactionManager.executeWithRetry(
    async (session) => {
      return this.organizationRepo.create(data, context, { session });
    },
    {}, // options
    3,  // max retries
  );
}
```

### 4. Error Handling in Transactions

```typescript
async complexTransactionWithErrors(): Promise<void> {
  const session = await this.connection.startSession();
  session.startTransaction();

  try {
    // Operation 1
    const org = await this.createOrganization(session);

    // Operation 2 with validation
    if (!org.canAddClinic()) {
      throw new BadRequestException('Organization has reached clinic limit');
    }

    const clinic = await this.createClinic(session, org._id);

    // Commit if all successful
    await session.commitTransaction();
    this.logger.log('Transaction committed');

  } catch (error) {
    // Rollback on any error
    if (session.inTransaction()) {
      await session.abortTransaction();
      this.logger.error('Transaction aborted', error);
    }
    throw error;

  } finally {
    // Always end session
    await session.endSession();
  }
}
```

---

## Naming Conventions

### 1. Collections

- **Plural, lowercase**: `organizations`, `clinics`, `users`
- **Snake_case for multi-word**: `provider_clinic_assignments`, `audit_logs`
- **Consistent prefixes for related collections**: `billing_invoices`, `billing_payments`

### 2. Fields

- **camelCase**: `firstName`, `createdAt`, `organizationId`
- **Boolean prefixes**: `isActive`, `isDeleted`, `hasAccess`, `canEdit`
- **Date suffixes**: `createdAt`, `updatedAt`, `deletedAt`, `expiresAt`
- **Count suffixes**: `clinicCount`, `userCount`, `retryCount`

### 3. Indexes

- **Descriptive names**: `tenant_status_idx`, `email_unique_idx`
- **Compound index naming**: `org_clinic_active_idx`

### 4. Methods and Statics

- **Methods (instance)**: `activate()`, `suspend()`, `canAddClinic()`
- **Statics (model)**: `findByTaxId()`, `findActiveOrganizations()`

---

## Best Practices

### 1. Multi-Tenant Data Isolation

```typescript
// Always include tenantId in queries
const orgs = await this.model.find({
  tenantId: context.tenantId,  // ✅ REQUIRED
  status: 'ACTIVE'
});

// Use repository base class that enforces tenantId
async findById(id: string, tenantId: string): Promise<T | null> {
  return this.model.findOne({ _id: id, tenantId }).exec();
}
```

### 2. Audit Trail

```typescript
// Always track who created/updated
const document = new this.model({
  ...data,
  createdBy: context.userId,  // ✅ REQUIRED
  updatedBy: context.userId,  // ✅ REQUIRED
});
```

### 3. Soft Delete by Default

```typescript
// Prefer soft delete
await this.softDelete(id, context);

// Hard delete only when necessary (GDPR, data retention policies)
await this.hardDelete(id, tenantId);
```

### 4. Performance Budgets

- **Availability search**: <150ms
- **Patient search**: <100ms
- **List queries**: <200ms
- **Single document fetch**: <50ms

Use indexes, lean(), select(), and caching to meet these targets.

### 5. Error Handling

```typescript
try {
  const org = await this.organizationRepo.findById(id, tenantId);
  if (!org) {
    throw new NotFoundException(`Organization ${id} not found`);
  }
  return org;
} catch (error) {
  this.logger.error(`Error finding organization ${id}`, error);
  throw error;
}
```

### 6. Logging

```typescript
this.logger.log(`Created organization ${doc._id}`);
this.logger.warn(`Organization ${id} approaching clinic limit`);
this.logger.error(`Failed to update organization ${id}`, error);
this.logger.debug(`Query filter: ${JSON.stringify(filter)}`);
```

---

## Summary Checklist

**Schema Design:**
- ✅ Explicit collection name
- ✅ Timestamps enabled
- ✅ Required fields validated
- ✅ Indexes defined
- ✅ Plugins applied (baseSchema, auditTrail, eventEmitter)
- ✅ Virtuals for computed fields
- ✅ Methods and statics defined

**CRUD Operations:**
- ✅ Multi-tenant scoping on all queries
- ✅ Audit fields on create/update
- ✅ Soft delete by default
- ✅ Optimistic locking for updates
- ✅ Pagination for list queries

**Performance:**
- ✅ Appropriate indexes
- ✅ Use lean() for read-only
- ✅ Select only needed fields
- ✅ Batch operations for bulk changes
- ✅ Meet performance budgets

**Reliability:**
- ✅ Transactions for multi-document operations
- ✅ Error handling and logging
- ✅ Validation at schema and service levels
- ✅ Event emission for audit trail

---

**Last Updated**: 2025-11-24
**Maintained By**: Backend Enterprise Service Team
