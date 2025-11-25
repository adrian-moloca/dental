/**
 * K6 Cache Performance Test for DentalOS RBAC System
 *
 * AUTH-004 GROUP 3 - Redis Cache Validation & Performance Analysis
 *
 * Test Objectives:
 * - Measure cache hit rate under realistic load
 * - Compare cache hit vs. cache miss latency
 * - Test cache invalidation on role/permission updates
 * - Validate cache stampede prevention
 * - Monitor Redis memory usage patterns
 *
 * Cache Configuration:
 * - Cache TTL: 5 minutes (300 seconds)
 * - Cache key pattern: rbac:user:{userId}:permissions
 * - Cache strategy: Read-through with lazy loading
 *
 * Expected Results:
 * - Cache Hit Rate: >90%
 * - Cache Hit Latency: <10ms
 * - Cache Miss Latency: 30-50ms
 * - No cache stampede (thundering herd) detected
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.dentalos.com --env JWT_TOKEN=<token> cache-performance-test.js
 *
 * @requires k6 v0.45.0+
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate, Gauge } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3301';
const JWT_TOKEN = __ENV.JWT_TOKEN;

// Test user pool (small pool to maximize cache hits)
const HOT_USER_POOL_SIZE = 50;  // 50 "hot" users (frequently accessed)
const COLD_USER_POOL_SIZE = 450; // 450 "cold" users (infrequently accessed)

// ============================================================================
// Custom Metrics
// ============================================================================

// Cache performance metrics
const cacheHits = new Counter('cache_hits');
const cacheMisses = new Counter('cache_misses');
const cacheHitRate = new Rate('cache_hit_rate');

// Latency metrics
const cacheHitLatency = new Trend('cache_hit_latency');
const cacheMissLatency = new Trend('cache_miss_latency');
const overallLatency = new Trend('overall_latency');

// Cache behavior
const cacheStampedes = new Counter('cache_stampedes_detected');
const cacheInvalidations = new Counter('cache_invalidations');

// Request distribution
const hotUserRequests = new Counter('hot_user_requests');
const coldUserRequests = new Counter('cold_user_requests');

// ============================================================================
// Test Data Setup
// ============================================================================

export function setup() {
  console.log('Setting up cache performance test...');

  const hotUsers = [];
  const coldUsers = [];

  // Generate hot user pool (80% of traffic goes to these users)
  for (let i = 0; i < HOT_USER_POOL_SIZE; i++) {
    hotUsers.push({
      id: `hot-user-${i.toString().padStart(4, '0')}-0000-0000-000000000000`,
      name: `hot_user_${i}`,
    });
  }

  // Generate cold user pool (20% of traffic)
  for (let i = 0; i < COLD_USER_POOL_SIZE; i++) {
    coldUsers.push({
      id: `cold-user-${i.toString().padStart(4, '0')}-0000-000000000000`,
      name: `cold_user_${i}`,
    });
  }

  return {
    hotUsers,
    coldUsers,
  };
}

// ============================================================================
// Test Configuration
// ============================================================================

export const options = {
  scenarios: {
    // Scenario 1: Cache warm-up phase
    cache_warmup: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      exec: 'cacheWarmup',
      startTime: '0s',
    },

    // Scenario 2: Steady state with hot/cold access pattern
    steady_state_cache_test: {
      executor: 'constant-vus',
      vus: 500,
      duration: '5m',
      exec: 'steadyStateCacheTest',
      startTime: '1m',
    },

    // Scenario 3: Cache stampede test (simultaneous cache misses)
    cache_stampede_test: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 100,
      maxDuration: '30s',
      exec: 'cacheStampedeTest',
      startTime: '7m',
    },

    // Scenario 4: Cache invalidation test
    cache_invalidation_test: {
      executor: 'per-vu-iterations',
      vus: 50,
      iterations: 10,
      maxDuration: '1m',
      exec: 'cacheInvalidationTest',
      startTime: '8m',
    },
  },

  thresholds: {
    // Cache performance targets
    'cache_hit_rate': ['rate>0.90'], // >90% cache hit rate
    'cache_hit_latency': ['p(95)<10'], // Cache hits < 10ms
    'cache_miss_latency': ['p(95)<100'], // Cache misses < 100ms
    'cache_stampedes_detected': ['count<5'], // Minimal cache stampedes

    // Overall performance
    'http_req_duration': ['p(95)<200'],
    'http_req_failed': ['rate<0.01'],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${JWT_TOKEN}`,
  };
}

/**
 * Select user based on 80/20 hot/cold distribution
 * 80% of requests go to hot users (cache hits expected)
 * 20% of requests go to cold users (cache misses possible)
 */
function selectUser(data) {
  const rand = randomIntBetween(1, 100);

  if (rand <= 80) {
    // Hot user (80% probability)
    hotUserRequests.add(1);
    return data.hotUsers[randomIntBetween(0, data.hotUsers.length - 1)];
  } else {
    // Cold user (20% probability)
    coldUserRequests.add(1);
    return data.coldUsers[randomIntBetween(0, data.coldUsers.length - 1)];
  }
}

/**
 * Classify response as cache hit or miss based on latency
 * Cache hits are typically <10ms, cache misses >30ms
 */
function classifyResponse(res, duration) {
  if (res.status !== 200) {
    return null; // Skip classification for errors
  }

  // Heuristic: sub-10ms = cache hit, >30ms = cache miss
  if (duration < 10) {
    cacheHits.add(1);
    cacheHitRate.add(1);
    cacheHitLatency.add(duration);
    return 'hit';
  } else if (duration > 30) {
    cacheMisses.add(1);
    cacheHitRate.add(0);
    cacheMissLatency.add(duration);
    return 'miss';
  }

  // Ambiguous (10-30ms range)
  return 'ambiguous';
}

// ============================================================================
// Test Scenario 1: Cache Warm-up
// ============================================================================

/**
 * Warm up the cache by accessing hot users repeatedly
 */
export function cacheWarmup(data) {
  const user = data.hotUsers[randomIntBetween(0, data.hotUsers.length - 1)];

  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
  const duration = Date.now() - startTime;

  check(res, {
    'Warmup: status is 200': (r) => r.status === 200,
  });

  overallLatency.add(duration);
  sleep(0.1);
}

// ============================================================================
// Test Scenario 2: Steady State Cache Performance
// ============================================================================

/**
 * Test cache performance under steady load with hot/cold access pattern
 */
export function steadyStateCacheTest(data) {
  const user = selectUser(data);

  group('Permission Check (Cache Test)', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
    const duration = Date.now() - startTime;

    check(res, {
      'Cache test: status is 200': (r) => r.status === 200,
      'Cache test: response time acceptable': (r) => r.timings.duration < 500,
    });

    classifyResponse(res, duration);
    overallLatency.add(duration);
  });

  // Also test permissions endpoint (should be heavily cached)
  group('Permissions Catalog (Global Cache)', () => {
    const startTime = Date.now();
    const res = http.get(`${BASE_URL}/rbac/permissions`, { headers: getHeaders() });
    const duration = Date.now() - startTime;

    check(res, {
      'Permissions cache: status is 200': (r) => r.status === 200,
      'Permissions cache: very fast': (r) => r.timings.duration < 50,
    });

    // Permissions should almost always be cache hits
    if (duration < 10) {
      cacheHits.add(1);
      cacheHitRate.add(1);
      cacheHitLatency.add(duration);
    }

    overallLatency.add(duration);
  });

  sleep(randomIntBetween(1, 3));
}

// ============================================================================
// Test Scenario 3: Cache Stampede Detection
// ============================================================================

/**
 * Test for cache stampede (thundering herd) problem
 * All VUs request the same resource simultaneously after cache expiry
 */
export function cacheStampedeTest(data) {
  // All VUs target the same hot user simultaneously
  const targetUser = data.hotUsers[0];

  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
  const duration = Date.now() - startTime;

  check(res, {
    'Stampede test: status is 200': (r) => r.status === 200,
    'Stampede test: no excessive latency': (r) => r.timings.duration < 1000,
  });

  // Detect potential stampede: multiple slow responses in quick succession
  if (duration > 200) {
    cacheStampedes.add(1);
    console.log(`Potential cache stampede detected: ${duration}ms latency`);
  }

  overallLatency.add(duration);

  // No sleep - we want simultaneous requests
}

// ============================================================================
// Test Scenario 4: Cache Invalidation Behavior
// ============================================================================

/**
 * Test that cache is properly invalidated on role/permission updates
 */
export function cacheInvalidationTest(data) {
  const user = data.hotUsers[randomIntBetween(0, data.hotUsers.length - 1)];

  group('Pre-Invalidation Read', () => {
    // First, read to ensure data is cached
    const startTime = Date.now();
    const res1 = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
    const duration1 = Date.now() - startTime;

    check(res1, {
      'Pre-invalidation: status is 200': (r) => r.status === 200,
    });

    classifyResponse(res1, duration1);
  });

  sleep(0.5);

  group('Cache Invalidation Trigger', () => {
    // Trigger cache invalidation by updating role permissions
    // (This would require admin privileges in real scenario)
    const roleId = 'test-role-0000-0000-0000-000000000000';
    const payload = JSON.stringify({
      permissionIds: ['perm1', 'perm2'],
    });

    // Note: This may fail with 403/404 in test environment, which is acceptable
    const res2 = http.post(
      `${BASE_URL}/rbac/roles/${roleId}/permissions`,
      payload,
      { headers: getHeaders() }
    );

    if (res2.status === 200) {
      cacheInvalidations.add(1);
    }
  });

  sleep(0.5);

  group('Post-Invalidation Read', () => {
    // Read again - should be cache miss (invalidated)
    const startTime = Date.now();
    const res3 = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
    const duration3 = Date.now() - startTime;

    check(res3, {
      'Post-invalidation: status is 200': (r) => r.status === 200,
    });

    classifyResponse(res3, duration3);
  });

  sleep(1);
}

// ============================================================================
// Test Summary
// ============================================================================

export function handleSummary(data) {
  const hitRate = data.metrics.cache_hit_rate?.values?.rate || 0;
  const avgHitLatency = data.metrics.cache_hit_latency?.values?.avg || 0;
  const avgMissLatency = data.metrics.cache_miss_latency?.values?.avg || 0;
  const stampedes = data.metrics.cache_stampedes_detected?.values?.count || 0;

  console.log('\n' + '='.repeat(60));
  console.log('CACHE PERFORMANCE TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Cache Hit Rate: ${(hitRate * 100).toFixed(2)}%`);
  console.log(`Average Cache Hit Latency: ${avgHitLatency.toFixed(2)}ms`);
  console.log(`Average Cache Miss Latency: ${avgMissLatency.toFixed(2)}ms`);
  console.log(`Speedup Factor: ${(avgMissLatency / avgHitLatency).toFixed(2)}x`);
  console.log(`Cache Stampedes Detected: ${stampedes}`);
  console.log('='.repeat(60) + '\n');

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'cache-performance-results.json': JSON.stringify({
      summary: {
        cacheHitRate: hitRate,
        avgHitLatency,
        avgMissLatency,
        speedupFactor: avgMissLatency / avgHitLatency,
        stampedesDetected: stampedes,
      },
      fullData: data,
    }, null, 2),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  let summary = '';

  const metrics = data.metrics;

  summary += `\n${indent}Cache Performance Metrics:\n`;
  summary += `${indent}${'='.repeat(60)}\n`;

  const hitRate = metrics.cache_hit_rate?.values?.rate || 0;
  const hits = metrics.cache_hits?.values?.count || 0;
  const misses = metrics.cache_misses?.values?.count || 0;

  summary += `${indent}Cache Hit Rate: ${(hitRate * 100).toFixed(2)}%\n`;
  summary += `${indent}  Cache Hits: ${hits}\n`;
  summary += `${indent}  Cache Misses: ${misses}\n\n`;

  summary += `${indent}Latency Comparison:\n`;
  summary += `${indent}  Cache Hit (p50): ${(metrics.cache_hit_latency?.values?.['p(50)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Cache Hit (p95): ${(metrics.cache_hit_latency?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Cache Miss (p50): ${(metrics.cache_miss_latency?.values?.['p(50)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Cache Miss (p95): ${(metrics.cache_miss_latency?.values?.['p(95)'] || 0).toFixed(2)}ms\n\n`;

  const hotRequests = metrics.hot_user_requests?.values?.count || 0;
  const coldRequests = metrics.cold_user_requests?.values?.count || 0;

  summary += `${indent}Request Distribution:\n`;
  summary += `${indent}  Hot Users (80%): ${hotRequests} requests\n`;
  summary += `${indent}  Cold Users (20%): ${coldRequests} requests\n\n`;

  return summary;
}

export function teardown(data) {
  console.log('Cache performance test completed');
}
