# MongoDB Database Standards - Complete Guide

Welcome to the comprehensive MongoDB database standards for backend-enterprise-service. This guide provides everything you need to work with MongoDB in our enterprise healthcare platform.

## Quick Start

### I'm New Here
Start with: **[MONGODB_QUICK_REFERENCE.md](./MONGODB_QUICK_REFERENCE.md)** (15 min read)

Get up and running quickly with:
- Schema templates
- Common CRUD patterns
- Performance tips
- Code snippets

### I Need to Understand the Full Standards
Read: **[DATABASE_STANDARDS.md](./DATABASE_STANDARDS.md)** (45 min read)

Comprehensive coverage of:
- Schema design standards
- Mongoose hooks and middleware
- Indexing strategy
- CRUD operation standards
- Query optimization
- Transaction management
- Naming conventions
- Best practices

### I'm Working with Transactions
Reference: **[TRANSACTION_EXAMPLES.md](./TRANSACTION_EXAMPLES.md)** (30 min read)

Real-world examples of:
- Basic and complex transactions
- Multi-document operations
- Optimistic locking
- Cascading operations
- Error handling
- Retry patterns

### I Want to See the Implementation
Check: **[DATABASE_IMPLEMENTATION_SUMMARY.md](./DATABASE_IMPLEMENTATION_SUMMARY.md)** (20 min read)

Overview of:
- What's been implemented
- How to integrate
- Migration path
- Testing strategies
- Performance standards

## Document Index

| Document | Purpose | Time to Read | When to Use |
|----------|---------|--------------|-------------|
| **MONGODB_QUICK_REFERENCE.md** | Quick patterns and snippets | 15 min | Daily development reference |
| **DATABASE_STANDARDS.md** | Complete standards documentation | 45 min | Deep understanding, schema design |
| **TRANSACTION_EXAMPLES.md** | Transaction patterns and examples | 30 min | Working with transactions |
| **DATABASE_IMPLEMENTATION_SUMMARY.md** | Implementation overview | 20 min | Understanding the architecture |
| **organization.schema.enhanced.ts** | Example schema implementation | 10 min | Creating new schemas |
| **organization.repository.ts** | Example repository | 10 min | Creating new repositories |

## Core Concepts

### 1. Schema Plugins

All schemas use these plugins from `@dentalos/shared-infra`:

```typescript
// Provides: tenantId, audit fields, soft delete, versioning
OrganizationSchema.plugin(baseSchemaPlugin, {
  softDelete: true,
  versioning: true,
  multiTenant: true,
  audit: true,
});

// Provides: change tracking and audit history
OrganizationSchema.plugin(auditTrailPlugin, {
  emitEvents: true,
});

// Provides: domain event publishing
OrganizationSchema.plugin(eventEmitterPlugin, {
  eventPrefix: 'enterprise.organization',
});
```

### 2. Repository Pattern

All data access uses repositories extending `BaseRepository`:

```typescript
@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(@InjectModel(OrganizationDocument.name) model: Model<OrganizationDocument>) {
    super(model, 'Organization');
  }
}
```

### 3. Transaction Management

All multi-document operations use `TransactionManager`:

```typescript
await transactionManager.execute(async (session) => {
  await repo1.create(data1, context, { session });
  await repo2.create(data2, context, { session });
});
```

## Common Tasks

### Creating a New Schema

1. Define schema with plugins:
   ```typescript
   @Schema({ collection: 'your_collection', timestamps: true })
   export class YourDocument extends Document { ... }

   export const YourSchema = SchemaFactory.createForClass(YourDocument);
   YourSchema.plugin(baseSchemaPlugin, { ... });
   ```

2. Add indexes:
   ```typescript
   YourSchema.index({ tenantId: 1, status: 1 });
   YourSchema.index({ tenantId: 1, createdAt: -1 });
   ```

3. See: [organization.schema.enhanced.ts](./src/schemas/organization.schema.enhanced.ts)

### Creating a Repository

1. Extend BaseRepository:
   ```typescript
   @Injectable()
   export class YourRepository extends BaseRepository<YourDocument> {
     constructor(@InjectModel(YourDocument.name) model: Model<YourDocument>) {
       super(model, 'YourEntity');
     }
   }
   ```

2. Add domain-specific methods:
   ```typescript
   async findByCustomField(field: string, tenantId: string) {
     return this.findOne({ customField: field }, tenantId);
   }
   ```

3. See: [organization.repository.ts](./src/repositories/organization.repository.ts)

### Writing a Query

Always include:
- ✅ tenantId filter
- ✅ Pagination for lists
- ✅ lean() for read-only
- ✅ Field selection

```typescript
const result = await repository.findMany(
  { status: 'ACTIVE' },
  tenantId,
  { page: 1, limit: 20, sort: { createdAt: -1 } },
  { lean: true, select: 'name email status' },
);
```

### Using Transactions

For multi-document operations:

```typescript
return this.transactionManager.execute(async (session) => {
  const doc1 = await repo1.create(data1, context, { session });
  const doc2 = await repo2.create(data2, context, { session });
  return { doc1, doc2 };
});
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  (OrganizationService, ClinicService, etc.)                 │
│  - Business logic                                            │
│  - Transaction orchestration                                 │
│  - Event emission                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ uses
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Repository Layer                            │
│  (OrganizationRepository, ClinicRepository, etc.)           │
│  - CRUD operations                                           │
│  - Domain-specific queries                                   │
│  - Multi-tenant scoping                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ extends
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              BaseRepository (shared-infra)                   │
│  - Standard CRUD operations                                  │
│  - Pagination                                                │
│  - Transaction support                                       │
│  - Query optimization                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ uses
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Mongoose Models                            │
│  - Schema definitions                                        │
│  - Plugins applied                                           │
│  - Hooks and middleware                                      │
│  - Indexes                                                   │
└─────────────────────────────────────────────────────────────┘
```

## Plugin System

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Schema                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ applies plugins
                     ↓
┌─────────────────────────────────────────────────────────────┐
│               baseSchemaPlugin                               │
│  + tenantId                                                  │
│  + createdBy, updatedBy                                     │
│  + isDeleted, deletedAt, deletedBy                          │
│  + version (optimistic locking)                             │
│  + timestamps                                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             auditTrailPlugin                                 │
│  + auditHistory[]                                           │
│  + Tracks all changes                                        │
│  + Emits audit events                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            eventEmitterPlugin                                │
│  + Auto-emits domain events                                  │
│  + Integrates with EventEmitter2                            │
│  + Custom payload transformation                             │
└─────────────────────────────────────────────────────────────┘
```

## Performance Standards

| Operation | Budget | Strategy |
|-----------|--------|----------|
| Single fetch | <50ms | lean() + select + index |
| List query | <200ms | pagination + index + lean() |
| Search | <100ms | text index + caching |
| Complex query | <150ms | compound index + aggregation |

## Testing Standards

### Unit Tests
```typescript
describe('Repository', () => {
  it('should enforce tenant scoping', async () => {
    const doc = await repo.create(data, context);
    expect(doc.tenantId).toBe(context.tenantId);
  });
});
```

### Integration Tests
```typescript
describe('Service (Integration)', () => {
  it('should create with transaction', async () => {
    const result = await service.create(dto, context);
    expect(result).toBeDefined();
  });
});
```

## Common Issues and Solutions

### Issue: Slow Queries
**Solution**:
1. Check if index exists
2. Use lean() for read-only
3. Select only needed fields
4. Add pagination

### Issue: Transaction Conflicts
**Solution**:
1. Use executeWithRetry()
2. Implement optimistic locking
3. Keep transactions short

### Issue: Memory Usage
**Solution**:
1. Use lean() for large result sets
2. Implement cursor-based iteration
3. Add pagination to all lists

### Issue: N+1 Queries
**Solution**:
1. Use populate for relations
2. Batch operations with insertMany/bulkWrite
3. Use aggregation pipelines

## Checklists

### Before Committing Schema Changes
- ✅ Plugins applied
- ✅ Indexes defined
- ✅ Validation rules added
- ✅ Methods documented
- ✅ Tests written

### Before Deploying Query Changes
- ✅ Performance tested
- ✅ Indexes verified
- ✅ Tenant scoping checked
- ✅ Error handling implemented
- ✅ Logging added

### Before Using Transactions
- ✅ Transaction kept short
- ✅ Session passed to all ops
- ✅ Error handling in place
- ✅ Retry logic considered
- ✅ Tested with failures

## Getting Help

### Documentation
1. Start with **MONGODB_QUICK_REFERENCE.md** for quick answers
2. Read **DATABASE_STANDARDS.md** for comprehensive guidance
3. Check **TRANSACTION_EXAMPLES.md** for transaction patterns
4. Review code examples in `schemas/` and `repositories/`

### Code Examples
- `schemas/organization.schema.enhanced.ts` - Complete schema
- `repositories/organization.repository.ts` - Complete repository

### Shared Infrastructure
All utilities are in `@dentalos/shared-infra/database`:
- `BaseRepository`
- `TransactionManager`
- `QueryBuilder`
- Schema plugins (baseSchemaPlugin, auditTrailPlugin, eventEmitterPlugin)

### Need More Help?
1. Review the standards documents
2. Check existing implementations
3. Ask the team
4. Create an issue for documentation gaps

## What's Next?

After reading this guide:

1. **New to the project?** → Read MONGODB_QUICK_REFERENCE.md
2. **Creating a schema?** → Read DATABASE_STANDARDS.md sections 1-2
3. **Writing queries?** → Read DATABASE_STANDARDS.md sections 4-5
4. **Using transactions?** → Read TRANSACTION_EXAMPLES.md
5. **Optimizing performance?** → Read DATABASE_STANDARDS.md section 5

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-24 | 1.0 | Initial comprehensive implementation |

---

**Maintained By**: Backend Enterprise Service Team
**Last Updated**: 2025-11-24
**Status**: Complete and Production-Ready
