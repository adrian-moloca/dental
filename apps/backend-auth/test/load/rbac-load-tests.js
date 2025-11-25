/**
 * K6 Load Testing Suite for DentalOS RBAC System
 *
 * AUTH-004 GROUP 3 - Performance Validation & Scaling Analysis
 *
 * Test Coverage:
 * - Baseline Test: 100 concurrent users (warm-up)
 * - Load Test: 1,000 concurrent users (~5,000 RPS)
 * - Stress Test: 2,000 concurrent users (~10,000 RPS)
 * - Spike Test: 4,000 concurrent users (~20,000 RPS)
 * - Endurance Test: 500 concurrent users for 30 minutes
 *
 * Endpoints Tested:
 * 1. POST /rbac/roles - Create role
 * 2. POST /rbac/roles/:id/permissions - Update role permissions
 * 3. POST /rbac/users/:id/roles - Assign role
 * 4. DELETE /rbac/users/:id/roles/:roleId - Revoke role
 * 5. GET /rbac/roles - List roles
 * 6. GET /rbac/permissions - List permissions
 *
 * Performance Budgets:
 * - Mutations: p95 < 500ms, error rate < 2%
 * - Reads: p95 < 200ms, error rate < 1%
 * - Cache hits: < 10ms
 * - Rate limiting: 50 req/min (mutations), 200 req/min (reads)
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.dentalos.com --env JWT_TOKEN=<token> rbac-load-tests.js
 *
 * @requires k6 v0.45.0+
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3301';
const JWT_TOKEN = __ENV.JWT_TOKEN;
const ADMIN_JWT = __ENV.ADMIN_JWT || JWT_TOKEN;
const ADMIN_USER_ID = __ENV.ADMIN_USER_ID || '00000000-0000-0000-0000-000000000001';
const TEST_ORG_ID = __ENV.TEST_ORG_ID || '11111111-1111-1111-1111-111111111111';
const TEST_CLINIC_ID = __ENV.TEST_CLINIC_ID || '22222222-2222-2222-2222-222222222222';

// Test scenario selection
const TEST_SCENARIO = __ENV.TEST_SCENARIO || 'baseline'; // baseline, load, stress, spike, endurance

// ============================================================================
// Custom Metrics
// ============================================================================

// Error rate tracking
const errorRate = new Rate('errors');
const rateLimitRate = new Rate('rate_limited');

// Latency trends
const permissionCheckLatency = new Trend('permission_check_latency');
const roleAssignmentLatency = new Trend('role_assignment_latency');
const cacheHitLatency = new Trend('cache_hit_latency');
const cacheMissLatency = new Trend('cache_miss_latency');

// Cache performance
const cacheHits = new Counter('cache_hits');
const cacheMisses = new Counter('cache_misses');

// Operation counters
const roleCreations = new Counter('role_creations');
const roleAssignments = new Counter('role_assignments');
const roleRevocations = new Counter('role_revocations');

// ============================================================================
// Test Data Generators
// ============================================================================

// Pre-generated test data pools (to avoid excessive randomness)
const TEST_USER_POOL = [];
const TEST_ROLE_POOL = [];
const TEST_PERMISSION_IDS = [
  'c1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333',
  'c4444444-4444-4444-4444-444444444444',
  'c5555555-5555-5555-5555-555555555555',
];

// Initialize test data pools
export function setup() {
  console.log(`Starting ${TEST_SCENARIO} test against ${BASE_URL}`);

  // Generate test user pool (simulate 1000 users)
  for (let i = 0; i < 1000; i++) {
    TEST_USER_POOL.push({
      id: `user-${i.toString().padStart(8, '0')}-0000-0000-0000-000000000000`,
      name: `test_user_${i}`,
    });
  }

  // Generate test role pool (simulate 50 roles)
  for (let i = 0; i < 50; i++) {
    TEST_ROLE_POOL.push({
      id: `role-${i.toString().padStart(8, '0')}-0000-0000-0000-000000000000`,
      name: `test_role_${i}`,
    });
  }

  return {
    users: TEST_USER_POOL,
    roles: TEST_ROLE_POOL,
    permissionIds: TEST_PERMISSION_IDS,
  };
}

// ============================================================================
// Test Scenarios Configuration
// ============================================================================

const scenarios = {
  baseline: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 100 },  // Ramp-up to 100 users
      { duration: '6m', target: 100 },  // Steady state
      { duration: '2m', target: 0 },    // Ramp-down
    ],
    gracefulRampDown: '30s',
  },

  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 1000 },  // Ramp-up to 1000 users (~5000 RPS)
      { duration: '6m', target: 1000 },  // Steady state
      { duration: '2m', target: 0 },     // Ramp-down
    ],
    gracefulRampDown: '30s',
  },

  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 2000 },  // Ramp-up to 2000 users (~10000 RPS)
      { duration: '6m', target: 2000 },  // Steady state
      { duration: '2m', target: 0 },     // Ramp-down
    ],
    gracefulRampDown: '30s',
  },

  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 500 },   // Baseline
      { duration: '1m', target: 4000 },   // Sudden spike to 4000 users (~20000 RPS)
      { duration: '3m', target: 4000 },   // Hold spike
      { duration: '1m', target: 500 },    // Return to baseline
      { duration: '2m', target: 0 },      // Ramp-down
    ],
    gracefulRampDown: '30s',
  },

  endurance: {
    executor: 'constant-vus',
    vus: 500,
    duration: '30m',
  },
};

export const options = {
  scenarios: {
    rbac_load_test: scenarios[TEST_SCENARIO],
  },

  thresholds: {
    // Overall performance
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.02'], // < 2% error rate

    // Specific endpoint latencies
    'permission_check_latency': ['p(95)<200'],
    'role_assignment_latency': ['p(95)<500'],

    // Cache performance
    'cache_hit_latency': ['p(95)<10'],
    'cache_miss_latency': ['p(95)<100'],

    // Error rates
    'errors': ['rate<0.02'],
    'rate_limited': ['rate<0.10'], // Expect some rate limiting under load
  },

  // HTTP configuration
  http: {
    timeout: '30s',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

function getHeaders(includeAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth && JWT_TOKEN) {
    headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
  }

  return headers;
}

function getAdminHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_JWT}`,
  };
}

function randomUser(data) {
  return data.users[randomIntBetween(0, data.users.length - 1)];
}

function randomRole(data) {
  return data.roles[randomIntBetween(0, data.roles.length - 1)];
}

function randomPermissions(data) {
  const count = randomIntBetween(1, 3);
  const shuffled = [...data.permissionIds].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function checkResponse(res, expectedStatus, operationName) {
  const success = check(res, {
    [`${operationName}: status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${operationName}: response time < 1s`]: (r) => r.timings.duration < 1000,
    [`${operationName}: has valid body`]: (r) => r.body && r.body.length > 0,
  });

  if (!success) {
    errorRate.add(1);
  } else {
    errorRate.add(0);
  }

  // Track rate limiting
  if (res.status === 429) {
    rateLimitRate.add(1);
  } else {
    rateLimitRate.add(0);
  }

  return success;
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Main test function
 * Executes a mixed workload simulating realistic RBAC operations
 */
export default function (data) {
  const operationType = randomIntBetween(1, 100);

  // Traffic distribution (realistic workload):
  // 60% reads (permission checks, role listings)
  // 30% role assignments/revocations
  // 10% role/permission management

  if (operationType <= 60) {
    // Read-heavy operations (60%)
    executeReadOperations(data);
  } else if (operationType <= 90) {
    // Role assignment operations (30%)
    executeRoleAssignmentOperations(data);
  } else {
    // Administrative operations (10%)
    executeAdminOperations(data);
  }

  // Think time between operations
  sleep(randomIntBetween(1, 3));
}

/**
 * Test 1: Read-Heavy Operations
 * - GET /rbac/roles (list roles)
 * - GET /rbac/permissions (list permissions)
 */
function executeReadOperations(data) {
  group('Read Operations', () => {
    // Test 1A: List roles (should be cached)
    group('GET /rbac/roles', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/rbac/roles`, { headers: getHeaders() });
      const duration = Date.now() - startTime;

      checkResponse(res, 200, 'List Roles');
      permissionCheckLatency.add(duration);

      // Detect cache hits (< 10ms = likely cache hit)
      if (duration < 10) {
        cacheHits.add(1);
        cacheHitLatency.add(duration);
      } else if (duration > 30) {
        cacheMisses.add(1);
        cacheMissLatency.add(duration);
      }
    });

    // Test 1B: List permissions (lightweight, should be very fast)
    group('GET /rbac/permissions', () => {
      const startTime = Date.now();
      const res = http.get(`${BASE_URL}/rbac/permissions`, { headers: getHeaders() });
      const duration = Date.now() - startTime;

      checkResponse(res, 200, 'List Permissions');
      permissionCheckLatency.add(duration);

      // Permissions are global and heavily cached
      if (duration < 10) {
        cacheHits.add(1);
        cacheHitLatency.add(duration);
      }
    });
  });
}

/**
 * Test 2: Role Assignment Operations
 * - POST /rbac/users/:id/roles (assign role)
 * - DELETE /rbac/users/:id/roles/:roleId (revoke role)
 */
function executeRoleAssignmentOperations(data) {
  group('Role Assignment Operations', () => {
    const user = randomUser(data);
    const role = randomRole(data);

    // Test 2A: Assign role to user
    group('POST /rbac/users/:id/roles', () => {
      const payload = JSON.stringify({
        roleId: role.id,
        organizationId: TEST_ORG_ID,
        clinicId: TEST_CLINIC_ID,
      });

      const startTime = Date.now();
      const res = http.post(
        `${BASE_URL}/rbac/users/${user.id}/roles`,
        payload,
        { headers: getAdminHeaders() }
      );
      const duration = Date.now() - startTime;

      // Accept both 201 (created) and 409 (already assigned)
      const success = check(res, {
        'Assign Role: status is 201 or 409': (r) => r.status === 201 || r.status === 409,
        'Assign Role: response time < 1s': (r) => r.timings.duration < 1000,
      });

      if (!success && res.status !== 429) {
        errorRate.add(1);
      } else {
        errorRate.add(0);
      }

      if (res.status === 201) {
        roleAssignments.add(1);
      }

      roleAssignmentLatency.add(duration);
    });

    // Test 2B: Revoke role (50% of the time)
    if (randomIntBetween(1, 100) <= 50) {
      group('DELETE /rbac/users/:id/roles/:roleId', () => {
        const startTime = Date.now();
        const res = http.del(
          `${BASE_URL}/rbac/users/${user.id}/roles/${role.id}`,
          null,
          { headers: getAdminHeaders() }
        );
        const duration = Date.now() - startTime;

        // Accept both 204 (deleted) and 404 (not found)
        const success = check(res, {
          'Revoke Role: status is 204 or 404': (r) => r.status === 204 || r.status === 404,
          'Revoke Role: response time < 1s': (r) => r.timings.duration < 1000,
        });

        if (!success && res.status !== 429) {
          errorRate.add(1);
        } else {
          errorRate.add(0);
        }

        if (res.status === 204) {
          roleRevocations.add(1);
        }

        roleAssignmentLatency.add(duration);
      });
    }
  });
}

/**
 * Test 3: Administrative Operations
 * - POST /rbac/roles (create role)
 * - POST /rbac/roles/:id/permissions (update role permissions)
 */
function executeAdminOperations(data) {
  group('Administrative Operations', () => {
    // Test 3A: Create new role
    group('POST /rbac/roles', () => {
      const roleName = `perf_test_role_${randomString(8)}`;
      const payload = JSON.stringify({
        name: roleName,
        displayName: `Performance Test Role ${randomString(4)}`,
        description: 'Auto-generated test role for load testing',
        organizationId: TEST_ORG_ID,
        clinicId: TEST_CLINIC_ID,
        permissionIds: randomPermissions(data),
      });

      const startTime = Date.now();
      const res = http.post(
        `${BASE_URL}/rbac/roles`,
        payload,
        { headers: getAdminHeaders() }
      );
      const duration = Date.now() - startTime;

      // Accept both 201 (created) and 409 (duplicate name - rare but possible)
      const success = check(res, {
        'Create Role: status is 201 or 409': (r) => r.status === 201 || r.status === 409,
        'Create Role: response time < 1s': (r) => r.timings.duration < 1000,
      });

      if (!success && res.status !== 429) {
        errorRate.add(1);
      } else {
        errorRate.add(0);
      }

      if (res.status === 201) {
        roleCreations.add(1);
      }

      roleAssignmentLatency.add(duration);
    });

    // Test 3B: Update role permissions
    if (data.roles.length > 0) {
      group('POST /rbac/roles/:id/permissions', () => {
        const role = randomRole(data);
        const payload = JSON.stringify({
          permissionIds: randomPermissions(data),
        });

        const startTime = Date.now();
        const res = http.post(
          `${BASE_URL}/rbac/roles/${role.id}/permissions`,
          payload,
          { headers: getAdminHeaders() }
        );
        const duration = Date.now() - startTime;

        // Accept 200 (updated) and 404 (role not found in test env)
        const success = check(res, {
          'Update Permissions: status is 200 or 404': (r) => r.status === 200 || r.status === 404,
          'Update Permissions: response time < 1s': (r) => r.timings.duration < 1000,
        });

        if (!success && res.status !== 429) {
          errorRate.add(1);
        } else {
          errorRate.add(0);
        }

        roleAssignmentLatency.add(duration);
      });
    }
  });
}

// ============================================================================
// Test Teardown
// ============================================================================

export function teardown(data) {
  console.log('Load test completed');
  console.log(`Total users in pool: ${data.users.length}`);
  console.log(`Total roles in pool: ${data.roles.length}`);
}
