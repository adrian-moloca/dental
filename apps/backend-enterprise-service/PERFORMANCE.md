# Backend Enterprise Service - Performance Optimization Guide

## Overview

This service implements comprehensive performance optimizations across all layers to meet strict performance budgets for Dental OS enterprise operations.

## Performance Budgets (P95 Targets)

| Operation | Target | Status |
|-----------|--------|--------|
| Organization CRUD | 150ms | ✓ Optimized |
| Clinic CRUD | 150ms | ✓ Optimized |
| Assignment Operations | 200ms | ✓ Optimized |
| List Queries | 200ms | ✓ Optimized |
| Search Operations | 300ms | ✓ Optimized |
| Report Generation | 2000ms | ✓ Optimized |

## Optimization Layers

### 1. Database Performance

#### Connection Pooling
- **Min Pool Size**: 5 connections
- **Max Pool Size**: 50 connections
- **Idle Timeout**: 5 minutes
- **Configuration**: See `DB_*` environment variables

#### Indexes

**Organizations:**
```javascript
// Compound indexes for common queries
{ status: 1, subscriptionTier: 1 }
{ status: 1, createdAt: -1 }
{ subscriptionTier: 1, createdAt: -1 }
{ subscriptionEndDate: 1, status: 1 }

// Covered index for list views (projection only)
{ status: 1, subscriptionTier: 1, name: 1, createdAt: -1 }
```

**Clinics:**
```javascript
{ organizationId: 1, status: 1 }
{ organizationId: 1, createdAt: -1 }
{ organizationId: 1, status: 1, createdAt: -1 }
{ managerUserId: 1, status: 1 }
{ 'address.state': 1, 'address.city': 1 }

// Covered index
{ organizationId: 1, status: 1, name: 1, code: 1, createdAt: -1 }
```

**Assignments:**
```javascript
{ providerId: 1, clinicId: 1 } // Unique constraint
{ providerId: 1, isActive: 1, assignedAt: -1 }
{ clinicId: 1, isActive: 1, assignedAt: -1 }
{ organizationId: 1, isActive: 1, assignedAt: -1 }
{ providerId: 1, isPrimaryClinic: 1, isActive: 1 }

// Covered indexes
{ providerId: 1, isActive: 1, clinicId: 1, assignedAt: -1, roles: 1 }
{ clinicId: 1, isActive: 1, providerId: 1, assignedAt: -1, roles: 1 }
```

#### Query Optimizations

**Lean Queries:**
```typescript
// Before: Full Mongoose documents
const orgs = await this.orgModel.find(query).exec();

// After: Plain objects (2-3x faster)
const orgs = await this.orgModel.find(query).lean().exec();
```

**Field Projection:**
```typescript
// Before: Fetch all fields
const orgs = await this.orgModel.find(query).lean().exec();

// After: Select only needed fields (reduces bandwidth 50-80%)
const orgs = await this.orgModel
  .find(query)
  .select('name status subscriptionTier')
  .lean()
  .exec();
```

**Cursor Pagination:**
```typescript
// Before: Offset pagination (slow for large offsets)
.skip(1000).limit(20)

// After: Cursor-based (constant time)
const result = await cursorPaginate(model, query, {
  limit: 20,
  cursor: lastCursor,
  sortField: 'createdAt',
  sortOrder: 'desc',
});
```

**Count Optimization:**
```typescript
// Before: Exact count (slow on large collections)
const total = await model.countDocuments(query);

// After: Estimated count when possible
const { count, isEstimate } = await getOptimizedCount(model, query);
```

### 2. Caching Strategy

#### Redis Cache Architecture

**TTL Strategies:**
```typescript
organization: 300s    // 5 minutes (rarely changes)
clinic: 300s         // 5 minutes (rarely changes)
assignment: 60s      // 1 minute (changes frequently)
list: 30s            // 30 seconds (volatile)
stats: 120s          // 2 minutes (aggregations)
session: 1800s       // 30 minutes (user sessions)
config: 600s         // 10 minutes (configuration)
```

**Cache-Aside Pattern:**
```typescript
// Automatic with getOrSet
const org = await cacheService.getOrSet(
  `organization:${id}`,
  async () => {
    // Fetch from database if not in cache
    return await orgModel.findById(id).lean().exec();
  },
  { ttl: 300 }
);
```

**Cache Invalidation:**
```typescript
// On update
await cacheService.invalidateOrganization(orgId);
await cacheService.invalidateListCache('organization');

// On clinic update
await cacheService.invalidateClinic(clinicId, orgId);

// On assignment change
await cacheService.invalidateAssignment(providerId, clinicId);
```

**Batch Operations:**
```typescript
// Multi-get (MGET)
const orgs = await cacheService.mget(keys);

// Multi-set with pipeline
await cacheService.mset([
  { key: 'org:1', value: org1, ttl: 300 },
  { key: 'org:2', value: org2, ttl: 300 },
]);
```

### 3. N+1 Query Prevention

#### DataLoader Pattern

**Before (N+1 Problem):**
```typescript
// 1 query for assignments
const assignments = await assignmentModel.find({ providerId }).exec();

// N queries for clinics (one per assignment)
for (const assignment of assignments) {
  assignment.clinic = await clinicModel.findById(assignment.clinicId);
}
```

**After (Batched):**
```typescript
// DataLoader automatically batches within 10ms window
const clinicLoader = createClinicLoader();

const assignments = await assignmentModel.find({ providerId }).lean().exec();

// Batched into single query
const clinicsWithData = await Promise.all(
  assignments.map(async (a) => ({
    ...a,
    clinic: await clinicLoader.load(a.clinicId),
  }))
);

// Result: 1 assignment query + 1 batched clinic query = 2 total queries
```

**Usage:**
```typescript
// In service
constructor(@Inject(DATALOADERS) private loaders: DataLoaders) {}

async getProviderClinicsWithDetails(providerId: string) {
  const assignments = await this.assignmentModel
    .find({ providerId, isActive: true })
    .lean()
    .exec();

  // Batch load all clinics in one query
  const clinicIds = assignments.map((a) => a.clinicId);
  const clinics = await Promise.all(
    clinicIds.map((id) => this.loaders.clinicLoader.load(id))
  );

  return assignments.map((a, i) => ({ ...a, clinic: clinics[i] }));
}
```

### 4. Response Optimization

#### Compression
- **Gzip compression** for responses >1KB
- **Level 6** compression (balanced speed/ratio)
- **Automatic** content negotiation

#### ETags
```http
# First request
GET /api/v1/organizations/123
Response:
  ETag: "abc123def456"
  Cache-Control: private, max-age=0, must-revalidate

# Subsequent request
GET /api/v1/organizations/123
Request Headers:
  If-None-Match: "abc123def456"
Response:
  304 Not Modified (no body, saves bandwidth)
```

#### Field Selection
```http
# Request only needed fields
GET /api/v1/organizations?fields=name,status,subscriptionTier

# Response includes only requested fields
{
  "data": [
    { "name": "Dental Corp", "status": "ACTIVE", "subscriptionTier": "PRO" }
  ]
}
```

### 5. Resilience & Resource Management

#### Circuit Breaker

**Configuration:**
- **Failure Threshold**: 5 consecutive failures
- **Success Threshold**: 2 consecutive successes to close
- **Timeout**: 60 seconds before retry
- **States**: CLOSED → OPEN → HALF_OPEN → CLOSED

**Usage:**
```typescript
await circuitBreaker.execute(
  'external-api-call',
  async () => {
    return await externalService.call();
  },
  { failureThreshold: 3, timeout: 30000 }
);
```

#### Request Timeouts

| Operation | Timeout |
|-----------|---------|
| Default | 30s |
| Search | 5s |
| Reports | 120s |
| Export | 120s |
| Background | 300s |

#### Graceful Degradation

```typescript
// Execute with fallback
const data = await degradationService.executeWithFallback(
  async () => {
    return await expensiveOperation();
  },
  async () => {
    // Fallback: return cached stale data
    return await getCachedData();
  },
  'expensive-operation'
);
```

### 6. Monitoring & Metrics

#### Performance Metrics

Access via `/api/v1/performance/metrics/summary`:

```json
{
  "cache": {
    "hitRate": "85.23%",
    "hits": 1234,
    "misses": 215,
    "sets": 456,
    "deletes": 89
  },
  "circuitBreakers": {
    "total": 3,
    "open": 0,
    "halfOpen": 0,
    "closed": 3
  }
}
```

#### Slow Query Logging

Automatically logs queries exceeding 100ms threshold:
```json
{
  "message": "Slow query detected",
  "executionTimeMs": 450,
  "collection": "organizations",
  "docsExamined": 50000,
  "docsReturned": 20
}
```

#### Request Performance

Tracked automatically by PerformanceInterceptor:
```json
{
  "message": "Performance metrics summary",
  "period": "60s",
  "totalRequests": 1234,
  "responseTimes": {
    "avg": 145,
    "p50": 120,
    "p95": 280,
    "p99": 450,
    "max": 980
  }
}
```

## Configuration

### Environment Variables

See `.env.performance.example` for all options. Key settings:

```bash
# Cache
CACHE_ENABLED=true
CACHE_TTL_ORGANIZATION=300
CACHE_TTL_CLINIC=300

# Database
DB_POOL_SIZE=10
DB_MAX_POOL_SIZE=50
DB_SLOW_QUERY_THRESHOLD=100

# Monitoring
MONITORING_ENABLED=true
MONITORING_SLOW_THRESHOLD=1000

# Pagination
PAGINATION_DEFAULT_LIMIT=20
PAGINATION_MAX_LIMIT=100
PAGINATION_USE_CURSOR=false

# Circuit Breaker
CIRCUIT_BREAKER_ENABLED=true
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
```

## Performance Testing

### Load Test Scenarios

**Organization List:**
```bash
# Target: 200 RPS, P95 < 150ms
k6 run --vus 50 --duration 60s load-tests/organizations.js
```

**Clinic Search:**
```bash
# Target: 100 RPS, P95 < 200ms
k6 run --vus 30 --duration 60s load-tests/clinics.js
```

**Assignment Operations:**
```bash
# Target: 50 RPS, P95 < 200ms
k6 run --vus 20 --duration 60s load-tests/assignments.js
```

### Cache Hit Rate Targets

| Resource | Target Hit Rate |
|----------|-----------------|
| Organizations | >80% |
| Clinics | >80% |
| Assignments | >70% |
| Lists | >60% |

### Database Query Targets (P95)

| Query Type | Target |
|------------|--------|
| Single Document | 10ms |
| List Query | 50ms |
| Aggregation | 100ms |
| Complex Join | 200ms |

## Troubleshooting

### High Response Times

1. Check cache hit rate: `GET /api/v1/performance/cache/stats`
2. Review slow queries in logs
3. Check circuit breaker status: `GET /api/v1/performance/circuit-breakers`
4. Verify database indexes: Run explain plans

### Low Cache Hit Rate

1. Increase TTL for stable data
2. Implement cache warming
3. Review invalidation strategy
4. Check Redis connection health

### N+1 Queries

1. Enable query logging: `DB_ENABLE_QUERY_LOGGING=true`
2. Use DataLoader for relationships
3. Review explain plans
4. Add appropriate indexes

### Memory Issues

1. Enable GC: `MEMORY_GC_ENABLED=true`
2. Reduce max batch size: `QUERY_MAX_BATCH_SIZE=50`
3. Lower metrics retention: `MONITORING_RETENTION=1800000`
4. Check for memory leaks in event listeners

## Migration Guide

### From Existing Service

1. **Install Dependencies:**
```bash
npm install ioredis dataloader compression
```

2. **Update Environment:**
```bash
cp .env.performance.example .env.performance
# Edit values as needed
```

3. **Switch to Optimized Module:**
```typescript
// In main.ts
import { AppModule } from './app-optimized.module';
```

4. **Update Services:**
Replace services with optimized versions:
- `organizations.service.ts` → `organizations-optimized.service.ts`
- `clinics.service.ts` → `clinics-optimized.service.ts`
- `assignments.service.ts` → `assignments-optimized.service.ts`

5. **Update Schemas:**
Replace schemas with optimized versions (includes compound indexes):
- `organization.schema.ts` → `organization-optimized.schema.ts`
- `clinic.schema.ts` → `clinic-optimized.schema.ts`
- `assignment.schema.ts` → `assignment-optimized.schema.ts`

6. **Create Indexes:**
```bash
# In MongoDB
use enterprise;
db.organizations.createIndex({ status: 1, subscriptionTier: 1 });
db.clinics.createIndex({ organizationId: 1, status: 1 });
# ... (see schemas for all indexes)
```

## Best Practices

### DO:
- ✓ Use lean queries for read-only operations
- ✓ Implement field projection
- ✓ Use cursor pagination for large datasets
- ✓ Cache frequently accessed data
- ✓ Batch related queries with DataLoader
- ✓ Monitor cache hit rates
- ✓ Set appropriate TTLs

### DON'T:
- ✗ Use offset pagination for large offsets
- ✗ Fetch full documents when only ID needed
- ✗ Make N+1 queries
- ✗ Cache volatile data with long TTL
- ✗ Skip error handling in fallbacks
- ✗ Ignore slow query warnings
- ✗ Over-cache (memory pressure)

## References

- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Redis Caching Strategies](https://redis.io/topics/lru-cache)
- [DataLoader Documentation](https://github.com/graphql/dataloader)
- [NestJS Performance](https://docs.nestjs.com/techniques/performance)
