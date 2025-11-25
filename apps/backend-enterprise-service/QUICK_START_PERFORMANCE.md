# Performance Quick Start Guide
## Backend Enterprise Service

---

## Installation & Setup (5 minutes)

### 1. Install Dependencies
```bash
cd /home/adrian/Desktop/SBD-Projects/personal/preclinic/dental/apps/backend-enterprise-service
npm install ioredis dataloader compression
```

### 2. Configure Environment
```bash
# Copy performance configuration
cp .env.performance.example .env

# Edit critical settings
nano .env

# Required settings:
MONGODB_URI=mongodb://localhost:27017/enterprise
REDIS_HOST=localhost
REDIS_PORT=6381
CACHE_ENABLED=true
```

### 3. Create Database Indexes
```javascript
// Connect to MongoDB
mongosh

use enterprise;

// Organizations
db.organizations.createIndex({ status: 1, subscriptionTier: 1 });
db.organizations.createIndex({ status: 1, createdAt: -1 });
db.organizations.createIndex({ subscriptionTier: 1, createdAt: -1 });

// Clinics
db.clinics.createIndex({ organizationId: 1, status: 1 });
db.clinics.createIndex({ organizationId: 1, createdAt: -1 });
db.clinics.createIndex({ organizationId: 1, status: 1, createdAt: -1 });

// Assignments
db.provider_clinic_assignments.createIndex({ providerId: 1, clinicId: 1 }, { unique: true });
db.provider_clinic_assignments.createIndex({ providerId: 1, isActive: 1, assignedAt: -1 });
db.provider_clinic_assignments.createIndex({ clinicId: 1, isActive: 1, assignedAt: -1 });
db.provider_clinic_assignments.createIndex({ organizationId: 1, isActive: 1, assignedAt: -1 });

// Verify indexes
db.organizations.getIndexes();
db.clinics.getIndexes();
db.provider_clinic_assignments.getIndexes();
```

### 4. Start Redis
```bash
# Using Docker
docker run -d -p 6381:6379 redis:7-alpine

# Or local Redis
redis-server --port 6381
```

### 5. Start Service
```bash
# Development with optimizations
npm run start:dev

# Or directly with optimized entry point
ts-node src/main-optimized.ts
```

---

## Verify Performance (2 minutes)

### Check Health
```bash
curl http://localhost:3017/api/v1/performance/health
```

Expected response:
```json
{
  "status": "ok",
  "components": {
    "cache": { "status": "ok", "latency": 2 },
    "circuitBreaker": { "status": "ok" },
    "degradation": { "status": "ok" }
  }
}
```

### Check Cache Stats
```bash
curl http://localhost:3017/api/v1/performance/cache/stats
```

Expected after 5 minutes:
```json
{
  "hits": 1234,
  "misses": 215,
  "hitRate": 0.85,  // Target: >0.60
  "sets": 456,
  "deletes": 89,
  "errors": 0
}
```

### Check Performance Metrics
```bash
curl http://localhost:3017/api/v1/performance/metrics/summary
```

Expected:
```json
{
  "cache": { "hitRate": "85.23%" },
  "responseTimes": {
    "avg": 145,
    "p95": 280  // Target: <300ms
  }
}
```

---

## Usage Examples

### 1. Basic Query (Cached)
```bash
# First request: Cache miss, ~150ms
curl http://localhost:3017/api/v1/organizations/123

# Second request: Cache hit, ~15ms
curl http://localhost:3017/api/v1/organizations/123
```

### 2. Field Selection (Reduce Payload)
```bash
# Full document: ~15KB
curl http://localhost:3017/api/v1/organizations

# Selected fields only: ~3KB (80% reduction)
curl "http://localhost:3017/api/v1/organizations?fields=name,status,subscriptionTier"
```

### 3. Cursor Pagination (Fast)
```bash
# First page
curl "http://localhost:3017/api/v1/organizations?limit=20"

# Response includes nextCursor:
# { "meta": { "nextCursor": "abc123..." } }

# Next page (constant time, even for page 1000)
curl "http://localhost:3017/api/v1/organizations?limit=20&cursor=abc123..."
```

### 4. ETag Caching
```bash
# First request
curl -i http://localhost:3017/api/v1/organizations/123
# Response headers:
#   ETag: "abc123"
#   Cache-Control: private, max-age=0, must-revalidate

# Subsequent request with ETag
curl -H "If-None-Match: abc123" http://localhost:3017/api/v1/organizations/123
# Response: 304 Not Modified (no body, saves bandwidth)
```

---

## Common Tasks

### Clear Cache (After Data Migration)
```bash
curl -X POST http://localhost:3017/api/v1/performance/cache/clear
```

### Reset Circuit Breakers (After External Service Recovery)
```bash
curl -X POST http://localhost:3017/api/v1/performance/circuit-breakers/reset-all
```

### Check Slow Queries (Debugging)
```bash
# Enable query logging
export DB_ENABLE_QUERY_LOGGING=true

# Restart service
npm run start:dev

# Check logs for:
# "Slow query detected" warnings
```

### Analyze Query Performance
```typescript
import { analyzeQueryPerformance } from './common/utils/database-performance.util';

const query = this.orgModel.find({ status: 'ACTIVE' });
const analysis = await analyzeQueryPerformance(query, this.logger);

// Output:
// {
//   executionTimeMs: 45,
//   totalDocsExamined: 100,
//   totalKeysExamined: 100,
//   needsOptimization: false,
//   recommendations: []
// }
```

---

## Performance Checklist

### Development
- [ ] Use lean queries: `.lean().exec()`
- [ ] Select only needed fields: `.select('name status')`
- [ ] Use cursor pagination for large datasets
- [ ] Cache frequently accessed data
- [ ] Batch related queries with DataLoader
- [ ] Check query explain plans for new queries

### Testing
- [ ] Cache hit rate >60% after 10 minutes
- [ ] P95 response time <300ms
- [ ] No slow query warnings
- [ ] No circuit breakers OPEN
- [ ] Memory usage stable

### Production
- [ ] All indexes created
- [ ] Redis connection healthy
- [ ] Performance monitoring enabled
- [ ] Circuit breakers configured
- [ ] Cache TTLs optimized

---

## Troubleshooting

### Problem: Low Cache Hit Rate (<40%)

**Check:**
```bash
curl http://localhost:3017/api/v1/performance/cache/stats
```

**Solutions:**
- Increase TTL: `CACHE_TTL_ORGANIZATION=600`
- Check Redis connection: `redis-cli -p 6381 ping`
- Review cache invalidation logic
- Enable cache warming: `CACHE_WARM_ON_STARTUP=true`

---

### Problem: Slow Response Times (>500ms)

**Check:**
```bash
curl http://localhost:3017/api/v1/performance/metrics/summary
```

**Solutions:**
- Review slow query logs
- Check database indexes: `db.collection.getIndexes()`
- Increase connection pool: `DB_MAX_POOL_SIZE=100`
- Enable cursor pagination: `PAGINATION_USE_CURSOR=true`

---

### Problem: High Memory Usage

**Check:**
```bash
# Node.js memory usage
node --expose-gc src/main-optimized.ts

# Monitor in logs
```

**Solutions:**
- Enable GC: `MEMORY_GC_ENABLED=true`
- Reduce batch size: `QUERY_MAX_BATCH_SIZE=50`
- Lower metrics retention: `MONITORING_RETENTION=1800000`
- Check for memory leaks in event listeners

---

## Performance Targets (Reference)

| Metric | Target | Check Command |
|--------|--------|---------------|
| Cache Hit Rate | >60% | `curl .../cache/stats` |
| P95 Response Time | <300ms | `curl .../metrics/summary` |
| Database Queries/Request | 1-2 | Enable query logging |
| Circuit Breakers OPEN | 0 | `curl .../circuit-breakers` |

---

## Files Reference

### Use These Optimized Files

**Services:**
- `/src/modules/organizations/organizations-optimized.service.ts`
- `/src/modules/clinics/clinics-optimized.service.ts`
- `/src/modules/assignments/assignments-optimized.service.ts`

**Schemas:**
- `/src/schemas/organization-optimized.schema.ts`
- `/src/schemas/clinic-optimized.schema.ts`
- `/src/schemas/assignment-optimized.schema.ts`

**Entry Points:**
- `/src/app-optimized.module.ts`
- `/src/main-optimized.ts`

**Config:**
- `/src/config/performance.config.ts`
- `/.env.performance.example`

---

## Next Steps

1. **Review Documentation:**
   - `PERFORMANCE.md` - Complete guide
   - `PERFORMANCE_IMPLEMENTATION_SUMMARY.md` - Implementation details

2. **Run Load Tests:**
   - See `PERFORMANCE.md` section "Performance Testing"

3. **Monitor Production:**
   - Set up alerts for cache hit rate <60%
   - Monitor P95 response times
   - Track circuit breaker status

4. **Optimize Further:**
   - Adjust TTLs based on usage patterns
   - Add more compound indexes for new query patterns
   - Fine-tune connection pool sizes

---

**Questions?** See `PERFORMANCE.md` for detailed documentation.

**Issues?** Check troubleshooting section above or review logs for slow query warnings.
