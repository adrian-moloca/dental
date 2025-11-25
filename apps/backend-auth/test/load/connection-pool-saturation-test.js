/**
 * K6 Database Connection Pool Saturation Test for DentalOS RBAC System
 *
 * AUTH-004 GROUP 3 - Database Connection Pool Analysis
 *
 * Test Objectives:
 * - Identify connection pool saturation point
 * - Measure latency degradation as pool approaches limits
 * - Detect connection pool exhaustion errors
 * - Validate connection pool configuration
 * - Test connection leak detection
 *
 * Expected Connection Pool Configuration:
 * - Min connections: 10
 * - Max connections: 50 (typical for TypeORM default)
 * - Connection timeout: 30s
 * - Idle timeout: 10s
 *
 * Saturation Indicators:
 * - Latency spikes (>2s for simple queries)
 * - Connection timeout errors
 * - HTTP 503 Service Unavailable
 * - Error messages containing "connection pool"
 *
 * Usage:
 *   k6 run --env BASE_URL=https://api.dentalos.com --env JWT_TOKEN=<token> connection-pool-saturation-test.js
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

// ============================================================================
// Custom Metrics
// ============================================================================

// Connection pool metrics
const connectionErrors = new Counter('connection_pool_errors');
const timeoutErrors = new Counter('timeout_errors');
const saturationDetected = new Rate('saturation_detected');

// Performance degradation
const latencyUnderLowLoad = new Trend('latency_low_load');
const latencyUnderMediumLoad = new Trend('latency_medium_load');
const latencyUnderHighLoad = new Trend('latency_high_load');
const latencyUnderSaturation = new Trend('latency_saturation');

// Load levels
const currentVUs = new Gauge('current_vus');

// ============================================================================
// Test Configuration
// ============================================================================

export const options = {
  scenarios: {
    // Scenario 1: Baseline performance (low load)
    low_load_baseline: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
      exec: 'testLowLoad',
      startTime: '0s',
    },

    // Scenario 2: Medium load
    medium_load: {
      executor: 'constant-vus',
      vus: 500,
      duration: '2m',
      exec: 'testMediumLoad',
      startTime: '2m',
    },

    // Scenario 3: High load
    high_load: {
      executor: 'constant-vus',
      vus: 1500,
      duration: '2m',
      exec: 'testHighLoad',
      startTime: '4m',
    },

    // Scenario 4: Progressive saturation (push to limits)
    progressive_saturation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 2000 },
        { duration: '1m', target: 3000 },
        { duration: '1m', target: 4000 }, // Push hard
        { duration: '1m', target: 0 },
      ],
      exec: 'testSaturation',
      startTime: '6m',
    },

    // Scenario 5: Burst test (sudden spike)
    burst_test: {
      executor: 'ramping-vus',
      startVUs: 100,
      stages: [
        { duration: '10s', target: 3000 }, // Sudden burst
        { duration: '30s', target: 3000 }, // Hold
        { duration: '20s', target: 100 },  // Return
      ],
      exec: 'testBurst',
      startTime: '12m',
    },
  },

  thresholds: {
    // Connection pool health
    'connection_pool_errors': ['count<10'], // Allow some errors but not many
    'timeout_errors': ['count<20'],
    'saturation_detected': ['rate<0.10'], // <10% of requests show saturation

    // Performance degradation limits
    'latency_low_load': ['p(95)<100'],
    'latency_medium_load': ['p(95)<200'],
    'latency_high_load': ['p(95)<500'],
    'latency_saturation': ['p(95)<2000'], // Even under saturation, <2s

    // Overall
    'http_req_duration': ['p(95)<1000'],
    'http_req_failed': ['rate<0.05'], // <5% failure rate
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
 * Check for connection pool related errors
 */
function checkConnectionPoolErrors(res) {
  const body = res.body || '';
  const bodyLower = body.toLowerCase();

  // Common connection pool error indicators
  const errorPatterns = [
    'connection pool',
    'connection timeout',
    'too many connections',
    'connection refused',
    'etimedout',
    'econnrefused',
    'connection lost',
    'database connection',
  ];

  const hasConnectionError = errorPatterns.some(pattern =>
    bodyLower.includes(pattern)
  );

  if (hasConnectionError) {
    connectionErrors.add(1);
    console.log(`Connection pool error detected: ${res.status} - ${body.substring(0, 100)}`);
  }

  return hasConnectionError;
}

/**
 * Check for timeout errors
 */
function checkTimeoutErrors(res) {
  if (res.error && res.error.includes('timeout')) {
    timeoutErrors.add(1);
    return true;
  }

  if (res.timings.duration > 30000) { // 30s timeout
    timeoutErrors.add(1);
    return true;
  }

  return false;
}

/**
 * Check for saturation indicators
 */
function checkSaturation(res, duration) {
  const isSaturated =
    res.status >= 500 || // Server errors
    duration > 2000 ||   // >2s latency for simple query
    checkConnectionPoolErrors(res) ||
    checkTimeoutErrors(res);

  saturationDetected.add(isSaturated ? 1 : 0);

  return isSaturated;
}

/**
 * Execute database-heavy query
 * Tests endpoints that require database connections
 */
function executeDatabaseQuery() {
  const endpoints = [
    { url: `${BASE_URL}/rbac/roles`, method: 'GET' },
    { url: `${BASE_URL}/rbac/permissions`, method: 'GET' },
  ];

  const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];

  const startTime = Date.now();
  const res = http.get(endpoint.url, { headers: getHeaders() });
  const duration = Date.now() - startTime;

  return { res, duration };
}

// ============================================================================
// Test Scenario 1: Low Load Baseline
// ============================================================================

export function testLowLoad() {
  currentVUs.add(50);

  const { res, duration } = executeDatabaseQuery();

  check(res, {
    'Low load: status is 200': (r) => r.status === 200,
    'Low load: fast response': (r) => r.timings.duration < 200,
    'Low load: no connection errors': (r) => !checkConnectionPoolErrors(r),
  });

  latencyUnderLowLoad.add(duration);
  checkSaturation(res, duration);

  sleep(randomIntBetween(1, 2));
}

// ============================================================================
// Test Scenario 2: Medium Load
// ============================================================================

export function testMediumLoad() {
  currentVUs.add(500);

  const { res, duration } = executeDatabaseQuery();

  check(res, {
    'Medium load: status is 200': (r) => r.status === 200,
    'Medium load: acceptable response': (r) => r.timings.duration < 500,
    'Medium load: no critical errors': (r) => r.status < 500,
  });

  latencyUnderMediumLoad.add(duration);
  checkSaturation(res, duration);

  sleep(randomIntBetween(0, 1));
}

// ============================================================================
// Test Scenario 3: High Load
// ============================================================================

export function testHighLoad() {
  currentVUs.add(1500);

  const { res, duration } = executeDatabaseQuery();

  check(res, {
    'High load: response received': (r) => r.status > 0,
    'High load: no timeout': (r) => r.timings.duration < 10000,
  });

  latencyUnderHighLoad.add(duration);
  checkSaturation(res, duration);

  sleep(0.5);
}

// ============================================================================
// Test Scenario 4: Progressive Saturation
// ============================================================================

export function testSaturation() {
  const vus = __VU;
  currentVUs.add(vus);

  group('Saturation Test', () => {
    const { res, duration } = executeDatabaseQuery();

    const isSaturated = checkSaturation(res, duration);

    check(res, {
      'Saturation: response received': (r) => r.status > 0,
      'Saturation: handled gracefully': (r) =>
        r.status === 200 || r.status === 429 || r.status === 503,
    });

    latencyUnderSaturation.add(duration);

    if (isSaturated) {
      console.log(`Saturation detected at ${vus} VUs: ${duration}ms latency, status ${res.status}`);
    }
  });

  sleep(0.2);
}

// ============================================================================
// Test Scenario 5: Burst Test
// ============================================================================

export function testBurst() {
  const { res, duration } = executeDatabaseQuery();

  check(res, {
    'Burst: system responsive': (r) => r.status === 200 || r.status === 503,
    'Burst: no crashes': (r) => r.status !== 0,
  });

  checkSaturation(res, duration);
  latencyUnderSaturation.add(duration);

  // No sleep - burst scenario
}

// ============================================================================
// Test Summary
// ============================================================================

export function handleSummary(data) {
  const metrics = data.metrics;

  const lowLoadP95 = metrics.latency_low_load?.values?.['p(95)'] || 0;
  const mediumLoadP95 = metrics.latency_medium_load?.values?.['p(95)'] || 0;
  const highLoadP95 = metrics.latency_high_load?.values?.['p(95)'] || 0;
  const saturationP95 = metrics.latency_saturation?.values?.['p(95)'] || 0;

  const connectionErrs = metrics.connection_pool_errors?.values?.count || 0;
  const timeoutErrs = metrics.timeout_errors?.values?.count || 0;
  const saturationRate = metrics.saturation_detected?.values?.rate || 0;

  console.log('\n' + '='.repeat(70));
  console.log('DATABASE CONNECTION POOL SATURATION TEST SUMMARY');
  console.log('='.repeat(70));
  console.log('\nLatency Progression:');
  console.log(`  Low Load (50 VUs):      p95 = ${lowLoadP95.toFixed(2)}ms`);
  console.log(`  Medium Load (500 VUs):  p95 = ${mediumLoadP95.toFixed(2)}ms`);
  console.log(`  High Load (1500 VUs):   p95 = ${highLoadP95.toFixed(2)}ms`);
  console.log(`  Saturation (4000 VUs):  p95 = ${saturationP95.toFixed(2)}ms`);

  console.log('\nDegradation Factors:');
  console.log(`  Low → Medium: ${(mediumLoadP95 / lowLoadP95).toFixed(2)}x`);
  console.log(`  Medium → High: ${(highLoadP95 / mediumLoadP95).toFixed(2)}x`);
  console.log(`  High → Saturation: ${(saturationP95 / highLoadP95).toFixed(2)}x`);

  console.log('\nConnection Pool Health:');
  console.log(`  Connection Pool Errors: ${connectionErrs}`);
  console.log(`  Timeout Errors: ${timeoutErrs}`);
  console.log(`  Saturation Rate: ${(saturationRate * 100).toFixed(2)}%`);

  // Estimate saturation point
  let estimatedSaturationPoint = 'Not reached';
  if (saturationRate > 0.05) {
    // If we see >5% saturation, we've hit limits
    if (saturationP95 > 2000) {
      estimatedSaturationPoint = '~2000-3000 VUs';
    } else if (highLoadP95 > 1000) {
      estimatedSaturationPoint = '~1500-2000 VUs';
    }
  } else {
    estimatedSaturationPoint = '>4000 VUs (not reached in test)';
  }

  console.log(`\nEstimated Saturation Point: ${estimatedSaturationPoint}`);
  console.log('='.repeat(70) + '\n');

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'connection-pool-results.json': JSON.stringify({
      summary: {
        lowLoadP95,
        mediumLoadP95,
        highLoadP95,
        saturationP95,
        connectionErrors: connectionErrs,
        timeoutErrors: timeoutErrs,
        saturationRate,
        estimatedSaturationPoint,
      },
      fullData: data,
    }, null, 2),
  };
}

function textSummary(data, options = {}) {
  const indent = options.indent || '';
  let summary = '';

  const metrics = data.metrics;

  summary += `\n${indent}Connection Pool Performance:\n`;
  summary += `${indent}${'='.repeat(60)}\n`;

  summary += `${indent}Latency by Load Level:\n`;
  summary += `${indent}  Low:    p50=${(metrics.latency_low_load?.values?.['p(50)'] || 0).toFixed(2)}ms, p95=${(metrics.latency_low_load?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Medium: p50=${(metrics.latency_medium_load?.values?.['p(50)'] || 0).toFixed(2)}ms, p95=${(metrics.latency_medium_load?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  High:   p50=${(metrics.latency_high_load?.values?.['p(50)'] || 0).toFixed(2)}ms, p95=${(metrics.latency_high_load?.values?.['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `${indent}  Sat:    p50=${(metrics.latency_saturation?.values?.['p(50)'] || 0).toFixed(2)}ms, p95=${(metrics.latency_saturation?.values?.['p(95)'] || 0).toFixed(2)}ms\n\n`;

  summary += `${indent}Error Counts:\n`;
  summary += `${indent}  Connection Pool Errors: ${metrics.connection_pool_errors?.values?.count || 0}\n`;
  summary += `${indent}  Timeout Errors: ${metrics.timeout_errors?.values?.count || 0}\n`;
  summary += `${indent}  Failed Requests: ${metrics.http_req_failed?.values?.count || 0}\n\n`;

  return summary;
}

export function teardown(data) {
  console.log('Connection pool saturation test completed');
}
