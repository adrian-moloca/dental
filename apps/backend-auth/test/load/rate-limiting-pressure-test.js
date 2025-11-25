/**
 * K6 Rate Limiting Pressure Test for DentalOS RBAC System
 *
 * AUTH-004 GROUP 3 - Rate Limiting Validation Under Extreme Load
 *
 * Test Objectives:
 * - Verify rate limiting enforcement at configured thresholds
 * - Test rate limit behavior under concurrent requests
 * - Validate rate limit response headers and messages
 * - Ensure rate limiting doesn't affect legitimate traffic
 *
 * Rate Limits (per user):
 * - Mutations (POST/DELETE): 50 requests/minute
 * - Reads (GET): 200 requests/minute
 *
 * Expected Behavior:
 * - Requests 1-50: Status 2xx (success)
 * - Requests 51+: Status 429 (rate limited)
 * - Rate limit headers present in responses
 * - Rate limit resets after 60 seconds
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.dentalos.com --env JWT_TOKEN=<token> rate-limiting-pressure-test.js
 *
 * @requires k6 v0.45.0+
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

// ============================================================================
// Configuration
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3301';
const JWT_TOKEN = __ENV.JWT_TOKEN;
const TEST_USER_ID = '99999999-9999-9999-9999-999999999999';
const TEST_ROLE_ID = '88888888-8888-8888-8888-888888888888';
const TEST_ORG_ID = '11111111-1111-1111-1111-111111111111';

// ============================================================================
// Custom Metrics
// ============================================================================

const successfulRequests = new Counter('successful_requests');
const rateLimitedRequests = new Counter('rate_limited_requests');
const rateLimitAccuracy = new Rate('rate_limit_accuracy');

// ============================================================================
// Test Configuration
// ============================================================================

export const options = {
  scenarios: {
    // Scenario 1: Test mutation rate limit (50 req/min)
    mutation_rate_limit: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 60, // Try 60 requests (should hit limit at 51)
      maxDuration: '2m',
      exec: 'testMutationRateLimit',
      startTime: '0s',
    },

    // Scenario 2: Test read rate limit (200 req/min)
    read_rate_limit: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 250, // Try 250 requests (should hit limit at 201)
      maxDuration: '2m',
      exec: 'testReadRateLimit',
      startTime: '3m', // Start after mutation test
    },

    // Scenario 3: Test concurrent requests hitting rate limit
    concurrent_rate_limit: {
      executor: 'constant-vus',
      vus: 10, // 10 concurrent users
      duration: '1m',
      exec: 'testConcurrentRateLimit',
      startTime: '6m', // Start after read test
    },

    // Scenario 4: Test rate limit reset (after 60s)
    rate_limit_reset: {
      executor: 'per-vu-iterations',
      vus: 1,
      iterations: 10,
      maxDuration: '2m',
      exec: 'testRateLimitReset',
      startTime: '8m', // Start after concurrent test
    },
  },

  thresholds: {
    'rate_limit_accuracy': ['rate>0.95'], // 95%+ accuracy in rate limiting
    'rate_limited_requests': ['count>0'], // We expect some rate limiting
    'http_req_duration': ['p(95)<1000'],
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
 * Check if response indicates rate limiting
 */
function isRateLimited(res) {
  return res.status === 429;
}

/**
 * Verify rate limit response format
 */
function checkRateLimitResponse(res, requestNum, limit) {
  const isLimited = isRateLimited(res);

  const checks = {
    'Rate limit enforced correctly': (r) => {
      // Requests within limit should succeed (2xx)
      if (requestNum <= limit) {
        return r.status >= 200 && r.status < 300;
      }
      // Requests over limit should be rate limited (429)
      return r.status === 429;
    },
    'Rate limit response has message': (r) => {
      if (r.status === 429) {
        const body = JSON.parse(r.body || '{}');
        return body.message && body.message.includes('Too Many Requests');
      }
      return true;
    },
  };

  const result = check(res, checks);

  if (result) {
    rateLimitAccuracy.add(1);
  } else {
    rateLimitAccuracy.add(0);
  }

  if (isLimited) {
    rateLimitedRequests.add(1);
  } else {
    successfulRequests.add(1);
  }

  return result;
}

// ============================================================================
// Test Scenario 1: Mutation Rate Limit (50 req/min)
// ============================================================================

/**
 * Test that mutation endpoints enforce 50 req/min limit
 */
export function testMutationRateLimit() {
  console.log('Testing mutation rate limit (50 req/min)...');

  const MUTATION_LIMIT = 50;
  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 1; i <= 60; i++) {
    const payload = JSON.stringify({
      roleId: TEST_ROLE_ID,
      organizationId: TEST_ORG_ID,
    });

    const res = http.post(
      `${BASE_URL}/rbac/users/${TEST_USER_ID}/roles`,
      payload,
      { headers: getHeaders() }
    );

    checkRateLimitResponse(res, i, MUTATION_LIMIT);

    if (isRateLimited(res)) {
      rateLimitedCount++;
      console.log(`Request ${i}: Rate limited (expected after ${MUTATION_LIMIT})`);
    } else if (res.status === 201 || res.status === 409) {
      successCount++;
    }

    // Small delay to avoid overwhelming the server
    sleep(0.05); // 50ms between requests = 1200 req/min theoretical
  }

  console.log(`Mutation test complete: ${successCount} successful, ${rateLimitedCount} rate limited`);

  check(null, {
    'Mutation rate limit enforced': () => rateLimitedCount > 0,
    'Successful requests within limit': () => successCount <= MUTATION_LIMIT,
  });
}

// ============================================================================
// Test Scenario 2: Read Rate Limit (200 req/min)
// ============================================================================

/**
 * Test that read endpoints enforce 200 req/min limit
 */
export function testReadRateLimit() {
  console.log('Testing read rate limit (200 req/min)...');

  const READ_LIMIT = 200;
  let successCount = 0;
  let rateLimitedCount = 0;

  for (let i = 1; i <= 250; i++) {
    const res = http.get(
      `${BASE_URL}/rbac/permissions`,
      { headers: getHeaders() }
    );

    checkRateLimitResponse(res, i, READ_LIMIT);

    if (isRateLimited(res)) {
      rateLimitedCount++;
      if (i === READ_LIMIT + 1) {
        console.log(`Request ${i}: Rate limited (expected after ${READ_LIMIT})`);
      }
    } else if (res.status === 200) {
      successCount++;
    }

    // Small delay between requests
    sleep(0.02); // 20ms = 3000 req/min theoretical
  }

  console.log(`Read test complete: ${successCount} successful, ${rateLimitedCount} rate limited`);

  check(null, {
    'Read rate limit enforced': () => rateLimitedCount > 0,
    'Successful requests within limit': () => successCount <= READ_LIMIT,
  });
}

// ============================================================================
// Test Scenario 3: Concurrent Rate Limit Behavior
// ============================================================================

/**
 * Test rate limiting behavior with concurrent requests from multiple users
 */
export function testConcurrentRateLimit() {
  const vuId = __VU;
  const iteration = __ITER;

  // Each VU makes requests rapidly
  for (let i = 0; i < 10; i++) {
    const res = http.get(
      `${BASE_URL}/rbac/roles`,
      { headers: getHeaders() }
    );

    check(res, {
      'Concurrent request succeeded or rate limited': (r) =>
        r.status === 200 || r.status === 429,
      'Response time acceptable under load': (r) =>
        r.timings.duration < 2000,
    });

    if (isRateLimited(res)) {
      rateLimitedRequests.add(1);
    } else if (res.status === 200) {
      successfulRequests.add(1);
    }

    sleep(0.1);
  }
}

// ============================================================================
// Test Scenario 4: Rate Limit Reset Behavior
// ============================================================================

/**
 * Test that rate limits reset after the time window expires
 */
export function testRateLimitReset() {
  console.log('Testing rate limit reset behavior...');

  // Make a few requests to establish baseline
  for (let i = 1; i <= 5; i++) {
    const res = http.get(
      `${BASE_URL}/rbac/permissions`,
      { headers: getHeaders() }
    );

    check(res, {
      'After reset, requests succeed': (r) => r.status === 200,
      'No lingering rate limits': (r) => r.status !== 429,
    });

    if (res.status === 200) {
      successfulRequests.add(1);
    } else if (res.status === 429) {
      rateLimitedRequests.add(1);
      console.log('WARNING: Rate limit still active after expected reset');
    }

    sleep(1);
  }

  console.log('Rate limit reset test complete');
}

// ============================================================================
// Test Summary
// ============================================================================

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'rate-limiting-results.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';

  let summary = `\n${indent}Rate Limiting Test Summary\n`;
  summary += `${indent}${'='.repeat(60)}\n\n`;

  const metrics = data.metrics;

  summary += `${indent}Total Requests:\n`;
  summary += `${indent}  Successful: ${metrics.successful_requests?.values?.count || 0}\n`;
  summary += `${indent}  Rate Limited: ${metrics.rate_limited_requests?.values?.count || 0}\n\n`;

  summary += `${indent}Rate Limit Accuracy: ${((metrics.rate_limit_accuracy?.values?.rate || 0) * 100).toFixed(2)}%\n\n`;

  summary += `${indent}Performance:\n`;
  summary += `${indent}  p95 Latency: ${(metrics.http_req_duration?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  p99 Latency: ${(metrics.http_req_duration?.values?.['p(99)'] || 0).toFixed(2)}ms\n\n`;

  const thresholdsOk = Object.entries(data.root_group?.checks || {})
    .filter(([_, value]) => value.passes > 0)
    .length;
  const thresholdsFailed = Object.entries(data.root_group?.checks || {})
    .filter(([_, value]) => value.fails > 0)
    .length;

  summary += `${indent}Checks:\n`;
  summary += `${indent}  Passed: ${thresholdsOk}\n`;
  summary += `${indent}  Failed: ${thresholdsFailed}\n\n`;

  return summary;
}
