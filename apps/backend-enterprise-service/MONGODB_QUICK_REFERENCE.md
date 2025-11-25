# MongoDB Quick Reference Guide

Quick reference for common MongoDB patterns in the backend-enterprise-service.

## Table of Contents
- [Schema Definition](#schema-definition)
- [Repository Usage](#repository-usage)
- [Transactions](#transactions)
- [Query Patterns](#query-patterns)
- [Performance Tips](#performance-tips)

---

## Schema Definition

### Basic Schema Template

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { baseSchemaPlugin, auditTrailPlugin, eventEmitterPlugin } from '@dentalos/shared-infra';

@Schema({ collection: 'your_collection', timestamps: true, versionKey: false })
export class YourDocument extends Document {
  @Prop({ required: true, index: true })
  name!: string;

  // Timestamps (auto-managed)
  createdAt!: Date;
  updatedAt!: Date;

  // Audit fields (added by plugin)
  tenantId!: string;
  createdBy!: string;
  updatedBy!: string;
}

export const YourSchema = SchemaFactory.createForClass(YourDocument);

// Apply plugins
YourSchema.plugin(baseSchemaPlugin, {
  softDelete: true,
  versioning: true,
  multiTenant: true,
  audit: true,
});

YourSchema.plugin(auditTrailPlugin, {
  emitEvents: true,
});

YourSchema.plugin(eventEmitterPlugin, {
  eventPrefix: 'enterprise.your_entity',
});

// Indexes
YourSchema.index({ tenantId: 1, status: 1 });
YourSchema.index({ tenantId: 1, createdAt: -1 });
```

### Field Types

```typescript
// String
@Prop({ required: true, trim: true, minlength: 3, maxlength: 100 })
name!: string;

// Number
@Prop({ required: true, min: 0, max: 1000 })
count!: number;

// Boolean
@Prop({ required: true, default: true })
isActive!: boolean;

// Date
@Prop({ required: true, default: Date.now })
startDate!: Date;

// Enum
@Prop({ required: true, enum: ['ACTIVE', 'SUSPENDED', 'DELETED'] })
status!: string;

// Array
@Prop({ type: [String], default: [] })
tags!: string[];

// Embedded Object
@Prop({
  type: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
  },
  required: true,
})
address!: {
  street: string;
  city: string;
  state: string;
  postalCode: string;
};

// Optional Field
@Prop()
description?: string;

// Unique Field
@Prop({ unique: true })
email!: string;
```

---

## Repository Usage

### Create Repository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@dentalos/shared-infra';
import { YourDocument } from '../schemas/your.schema';

@Injectable()
export class YourRepository extends BaseRepository<YourDocument> {
  constructor(
    @InjectModel(YourDocument.name) model: Model<YourDocument>,
  ) {
    super(model, 'YourEntity');
  }

  // Add custom methods here
  async findByCustomField(field: string, tenantId: string) {
    return this.findOne({ customField: field } as any, tenantId);
  }
}
```

### CRUD Operations

```typescript
// CREATE
const doc = await repository.create(
  { name: 'Test', status: 'ACTIVE' },
  { userId: 'user-123', tenantId: 'tenant-123' },
);

// CREATE MANY
const docs = await repository.createMany(
  [{ name: 'Test1' }, { name: 'Test2' }],
  { userId: 'user-123', tenantId: 'tenant-123' },
);

// READ ONE
const doc = await repository.findById(
  'doc-id',
  'tenant-123',
  { select: 'name status', lean: true },
);

// READ MANY (with pagination)
const result = await repository.findMany(
  { status: 'ACTIVE' },
  'tenant-123',
  { page: 1, limit: 20, sort: { createdAt: -1 } },
  { lean: true },
);

// UPDATE
const updated = await repository.updateById(
  'doc-id',
  { status: 'SUSPENDED' },
  { userId: 'user-123', tenantId: 'tenant-123' },
);

// SOFT DELETE
const deleted = await repository.softDeleteById(
  'doc-id',
  { userId: 'user-123', tenantId: 'tenant-123' },
);

// HARD DELETE (careful!)
const hardDeleted = await repository.deleteById(
  'doc-id',
  'tenant-123',
);

// COUNT
const count = await repository.count(
  { status: 'ACTIVE' },
  'tenant-123',
);

// EXISTS
const exists = await repository.exists(
  { email: 'test@example.com' },
  'tenant-123',
);
```

---

## Transactions

### Basic Transaction

```typescript
import { TransactionManager } from '@dentalos/shared-infra';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class YourService {
  private transactionManager: TransactionManager;

  constructor(
    @InjectConnection() connection: Connection,
    private repository: YourRepository,
  ) {
    this.transactionManager = new TransactionManager(connection);
  }

  async createWithTransaction(data: any, context: any) {
    return this.transactionManager.execute(async (session) => {
      return this.repository.create(data, context, { session });
    });
  }
}
```

### Multi-Document Transaction

```typescript
async createMultiple(data: any, context: any) {
  return this.transactionManager.execute(async (session) => {
    // All operations must include { session }
    const doc1 = await this.repo1.create(data.doc1, context, { session });
    const doc2 = await this.repo2.create(data.doc2, context, { session });
    const doc3 = await this.repo3.create(data.doc3, context, { session });

    return { doc1, doc2, doc3 };
  });
}
```

### Transaction with Retry

```typescript
async createWithRetry(data: any, context: any) {
  return this.transactionManager.executeWithRetry(
    async (session) => {
      return this.repository.create(data, context, { session });
    },
    {}, // options
    3,  // max retries
  );
}
```

### Using Repository Transaction Helper

```typescript
async createWithRepoHelper(data: any, context: any) {
  return this.repository.withTransaction(async (session) => {
    return this.repository.create(data, context, { session });
  });
}
```

---

## Query Patterns

### Filtering

```typescript
// Simple filter
const docs = await repository.findMany(
  { status: 'ACTIVE' },
  tenantId,
);

// Multiple conditions (AND)
const docs = await repository.findMany(
  { status: 'ACTIVE', tier: 'PRO' },
  tenantId,
);

// OR conditions
const docs = await repository.findMany(
  { $or: [{ status: 'ACTIVE' }, { status: 'PENDING' }] },
  tenantId,
);

// IN operator
const docs = await repository.findMany(
  { status: { $in: ['ACTIVE', 'PENDING'] } },
  tenantId,
);

// Greater than
const docs = await repository.findMany(
  { createdAt: { $gte: new Date('2024-01-01') } },
  tenantId,
);

// Range query
const docs = await repository.findMany(
  {
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  },
  tenantId,
);

// Regex search
const docs = await repository.findMany(
  { name: { $regex: 'pattern', $options: 'i' } },
  tenantId,
);

// Text search (requires text index)
const docs = await repository.findMany(
  { $text: { $search: 'search terms' } },
  tenantId,
);
```

### Pagination

```typescript
const result = await repository.findMany(
  { status: 'ACTIVE' },
  tenantId,
  {
    page: 1,          // Page number (1-indexed)
    limit: 20,        // Items per page
    sort: {           // Sort order
      createdAt: -1,  // -1 = descending, 1 = ascending
    },
  },
);

console.log(result.data);          // Documents
console.log(result.meta.total);    // Total count
console.log(result.meta.page);     // Current page
console.log(result.meta.totalPages);
console.log(result.meta.hasNextPage);
```

### Sorting

```typescript
// Single field
{ sort: { createdAt: -1 } }

// Multiple fields
{ sort: { status: 1, createdAt: -1 } }

// By text search score
{ sort: { score: { $meta: 'textScore' } } }
```

### Field Selection (Projection)

```typescript
// Include specific fields
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { select: 'name email status' },
);

// Exclude specific fields
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { select: '-password -internalNotes' },
);

// Using object notation
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { select: { name: 1, email: 1, status: 1 } },
);
```

### Lean Queries (Performance)

```typescript
// Returns plain JavaScript objects (faster, less memory)
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { lean: true },
);

// Use lean for:
// - Read-only operations
// - API responses
// - Bulk data fetching
```

### Populate (Relations)

```typescript
// Populate single field
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { populate: 'organizationId' },
);

// Populate multiple fields
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { populate: ['organizationId', 'clinicId'] },
);

// Populate with field selection
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  {
    populate: {
      path: 'organizationId',
      select: 'name email',
    },
  },
);
```

---

## Performance Tips

### 1. Use Indexes

```typescript
// Single field index
YourSchema.index({ status: 1 });

// Compound index (order matters!)
YourSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

// Unique index
YourSchema.index({ email: 1 }, { unique: true });

// Sparse index (only index documents with the field)
YourSchema.index({ optionalField: 1 }, { sparse: true });

// Text index
YourSchema.index({ name: 'text', description: 'text' });
```

### 2. Use lean() for Read-Only

```typescript
// ❌ BAD: Returns Mongoose document (slower)
const docs = await repository.findMany(filter, tenantId);

// ✅ GOOD: Returns plain object (5x faster)
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { lean: true },
);
```

### 3. Select Only Needed Fields

```typescript
// ❌ BAD: Fetches all fields
const docs = await repository.findMany(filter, tenantId);

// ✅ GOOD: Fetches only needed fields
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { select: 'name email status', lean: true },
);
```

### 4. Batch Operations

```typescript
// ❌ BAD: Individual creates
for (const item of items) {
  await repository.create(item, context);
}

// ✅ GOOD: Bulk insert
await repository.createMany(items, context);
```

### 5. Avoid N+1 Queries

```typescript
// ❌ BAD: N+1 problem
const clinics = await clinicRepo.findMany({}, tenantId);
for (const clinic of clinics) {
  clinic.organization = await orgRepo.findById(clinic.organizationId, tenantId);
}

// ✅ GOOD: Use populate
const clinics = await clinicRepo.findMany(
  {},
  tenantId,
  pagination,
  { populate: 'organizationId' },
);
```

### 6. Use Aggregation for Complex Queries

```typescript
const stats = await model.aggregate([
  { $match: { tenantId, status: 'ACTIVE' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);
```

### 7. Limit Result Sets

```typescript
// ❌ BAD: Fetch all (can be millions)
const docs = await repository.findAll({}, tenantId);

// ✅ GOOD: Use pagination
const result = await repository.findMany(
  {},
  tenantId,
  { page: 1, limit: 20 },
);
```

### 8. Cache Frequently Accessed Data

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class YourService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private repository: YourRepository,
  ) {}

  async findById(id: string, tenantId: string) {
    const cacheKey = `entity:${id}`;

    // Check cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Fetch from database
    const doc = await this.repository.findById(id, tenantId, { lean: true });

    // Store in cache (5 minutes)
    await this.cacheManager.set(cacheKey, doc, 300000);

    return doc;
  }
}
```

---

## Common Patterns

### Soft Delete Query

```typescript
// Find including deleted
const docs = await repository.findMany(
  filter,
  tenantId,
  pagination,
  { showDeleted: true },
);

// Find only deleted
const docs = await repository.findMany(
  { isDeleted: true },
  tenantId,
);
```

### Date Range Query

```typescript
const docs = await repository.findMany(
  {
    createdAt: {
      $gte: new Date('2024-01-01'),
      $lte: new Date('2024-12-31'),
    },
  },
  tenantId,
);
```

### Case-Insensitive Search

```typescript
const docs = await repository.findMany(
  {
    email: {
      $regex: 'search@example.com',
      $options: 'i', // case-insensitive
    },
  },
  tenantId,
);
```

### Count by Category

```typescript
const stats = await model.aggregate([
  { $match: { tenantId } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
]);
```

### Find Top N

```typescript
const topDocs = await repository.findMany(
  filter,
  tenantId,
  {
    limit: 10,
    sort: { score: -1 },
  },
  { lean: true },
);
```

---

## Debugging

### Enable Query Logging

```typescript
// In your module
mongoose.set('debug', true);
```

### Explain Query

```typescript
const result = await model.find(filter).explain();
console.log(result);
```

### Check Indexes

```typescript
const indexes = await model.collection.getIndexes();
console.log(indexes);
```

### Monitor Performance

```typescript
const start = Date.now();
const docs = await repository.findMany(filter, tenantId);
console.log(`Query took ${Date.now() - start}ms`);
```

---

## Checklist

**Before Creating a Schema:**
- ✅ Add proper indexes
- ✅ Apply baseSchemaPlugin
- ✅ Apply auditTrailPlugin
- ✅ Apply eventEmitterPlugin
- ✅ Define virtuals if needed
- ✅ Add validation rules

**Before Writing a Query:**
- ✅ Include tenantId filter
- ✅ Use pagination for lists
- ✅ Use lean() for read-only
- ✅ Select only needed fields
- ✅ Check if indexes exist

**Before Using Transactions:**
- ✅ Keep transactions short
- ✅ Pass session to all operations
- ✅ Handle errors properly
- ✅ Consider using retry for conflicts

---

**Last Updated**: 2025-11-24
**Maintained By**: Backend Enterprise Service Team
