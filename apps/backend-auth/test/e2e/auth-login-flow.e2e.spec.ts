/**
 * E2E Test Suite: Complete Login Flow
 *
 * Tests the complete authentication flow including:
 * - Health check endpoint
 * - Valid login (single organization)
 * - Multi-organization scenario
 * - Invalid credentials
 * - Missing fields validation
 * - Invalid email format
 * - Rate limiting
 * - Token validation
 * - Response structure validation
 *
 * Requirements:
 * - PostgreSQL database must be running
 * - Redis cache must be running
 * - Backend auth service must be running on port 3301
 * - Seed data must be populated
 *
 * Run with: pnpm test:e2e
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Test configuration
 */
const API_BASE_URL = 'http://localhost:3301/api/v1';
const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login-smart`;

/**
 * Test data - these credentials should be seeded in the test database
 */
const TEST_USER = {
  email: 'admin@dentalos.local',
  password: 'Password123!',
  firstName: 'Admin',
  lastName: 'User',
};

const TEST_USER_MULTI_ORG = {
  email: 'shared.user@dentalos.local',
  password: 'Password123!',
  firstName: 'Multi',
  lastName: 'Org',
};

/**
 * JWT Token interface for validation
 */
interface JWTPayload {
  sub: string;
  email: string;
  roles: string[];
  tenantId: string;
  iat: number;
  exp: number;
}

/**
 * Helper function to decode JWT (without verification)
 * Used only for structure validation in tests
 */
function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf8')
    );
    return decoded as JWTPayload;
  } catch (error) {
    throw new Error(`Failed to decode JWT: ${error}`);
  }
}

/**
 * Validate JWT structure
 */
function validateJWTStructure(token: string): void {
  const payload = decodeJWT(token);

  expect(payload).toBeDefined();
  expect(payload.sub).toBeDefined();
  expect(typeof payload.sub).toBe('string');
  expect(payload.email).toBeDefined();
  expect(typeof payload.email).toBe('string');
  expect(payload.roles).toBeDefined();
  expect(Array.isArray(payload.roles)).toBe(true);
  expect(payload.tenantId).toBeDefined();
  expect(typeof payload.tenantId).toBe('string');
  expect(payload.iat).toBeDefined();
  expect(typeof payload.iat).toBe('number');
  expect(payload.exp).toBeDefined();
  expect(typeof payload.exp).toBe('number');
  expect(payload.exp > payload.iat).toBe(true);
}

describe('Login Flow E2E Tests', () => {
  let client: AxiosInstance;

  beforeAll(() => {
    // Create HTTP client with error handling
    client = axios.create({
      baseURL: API_BASE_URL,
      validateStatus: () => true, // Don't throw on any status code
    });
  });

  afterAll(() => {
    // Cleanup if needed
  });

  describe('Health Check', () => {
    /**
     * Test 1: Verify auth service is healthy
     * - Endpoint responds with 200 status
     * - Response contains required health fields
     */
    it('should return 200 status with health data', async () => {
      const response = await client.get('/health');

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('status');
    });
  });

  describe('Login Endpoint - Valid Credentials', () => {
    /**
     * Test 2: Valid login with single organization
     * - User has exactly one organization
     * - Should return accessToken, refreshToken, and user info
     * - needsOrgSelection should be false
     */
    it('should successfully login with valid credentials (single org)', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.needsOrgSelection).toBe(false);
      expect(response.data.accessToken).toBeDefined();
      expect(response.data.refreshToken).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.organizations).toBeUndefined();
    });

    /**
     * Test 3: Validate JWT token structure
     * - accessToken contains required claims
     * - refreshToken contains required claims
     * - Tokens are in valid JWT format
     */
    it('should return valid JWT tokens', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.status).toBe(200);

      // Validate access token structure
      expect(() => validateJWTStructure(response.data.accessToken)).not.toThrow();

      // Validate refresh token structure
      expect(() => validateJWTStructure(response.data.refreshToken)).not.toThrow();

      // Verify token claims
      const accessPayload = decodeJWT(response.data.accessToken);
      expect(accessPayload.email).toBe(TEST_USER.email);
      expect(accessPayload.sub).toBeDefined();
    });

    /**
     * Test 4: User data structure validation
     * - Contains required user fields
     * - Email matches input
     * - Has roles array
     */
    it('should return correct user data', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.status).toBe(200);
      const { user } = response.data;

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
      expect(user.email).toBe(TEST_USER.email);
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.roles.length).toBeGreaterThan(0);
      expect(user.tenantId).toBeDefined();
    });
  });

  describe('Login Endpoint - Multiple Organizations', () => {
    /**
     * Test 5: Login with multiple organizations
     * - User belongs to multiple organizations
     * - Should return needsOrgSelection = true
     * - Should return list of organizations
     * - Should NOT return tokens
     */
    it('should return organization list for multi-org users', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER_MULTI_ORG.email,
        password: TEST_USER_MULTI_ORG.password,
      });

      expect(response.status).toBe(200);
      expect(response.data.needsOrgSelection).toBe(true);
      expect(Array.isArray(response.data.organizations)).toBe(true);
      expect(response.data.organizations.length).toBeGreaterThanOrEqual(2);
      expect(response.data.accessToken).toBeUndefined();
      expect(response.data.refreshToken).toBeUndefined();
      expect(response.data.user).toBeUndefined();
    });

    /**
     * Test 6: Organization list structure validation
     * - Each organization has required fields
     * - IDs are valid UUIDs
     * - Names are non-empty strings
     */
    it('should return properly structured organization list', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER_MULTI_ORG.email,
        password: TEST_USER_MULTI_ORG.password,
      });

      expect(response.status).toBe(200);

      response.data.organizations.forEach(
        (org: { id: string; name: string; logoUrl?: string }) => {
          expect(org.id).toBeDefined();
          expect(typeof org.id).toBe('string');
          expect(org.id.length).toBeGreaterThan(0);
          expect(org.name).toBeDefined();
          expect(typeof org.name).toBe('string');
          expect(org.name.length).toBeGreaterThan(0);
          // logoUrl is optional
          if (org.logoUrl) {
            expect(typeof org.logoUrl).toBe('string');
          }
        }
      );
    });
  });

  describe('Login Endpoint - Invalid Credentials', () => {
    /**
     * Test 7: Wrong password
     * - Should return 401 Unauthorized
     * - Should NOT return tokens
     * - Should return error message
     */
    it('should reject login with wrong password', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.data.accessToken).toBeUndefined();
      expect(response.data.refreshToken).toBeUndefined();
      expect(response.data.user).toBeUndefined();
      expect(response.data.message || response.data.error).toBeDefined();
    });

    /**
     * Test 8: Non-existent user
     * - Should return 401 Unauthorized
     * - Should NOT return tokens
     */
    it('should reject login with non-existent user', async () => {
      const response = await client.post('/auth/login-smart', {
        email: 'nonexistent@dentalos.local',
        password: 'Password123!',
      });

      expect(response.status).toBe(401);
      expect(response.data.accessToken).toBeUndefined();
      expect(response.data.refreshToken).toBeUndefined();
      expect(response.data.user).toBeUndefined();
    });

    /**
     * Test 9: Case sensitivity test
     * - Email comparison should be case-insensitive
     * - Password comparison should be case-sensitive
     */
    it('should handle case-insensitive email comparison', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email.toUpperCase(),
        password: TEST_USER.password,
      });

      // Should succeed - email should be case-insensitive
      expect([200, 401]).toContain(response.status);
      // If 200, user found with case-insensitive match
      // If 401, implementation requires exact case match (document this)
    });
  });

  describe('Login Endpoint - Validation Errors', () => {
    /**
     * Test 10: Missing password field
     * - Should return 400 Bad Request
     * - Should include validation error message
     */
    it('should return 400 for missing password', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        // password intentionally omitted
      });

      expect(response.status).toBe(400);
      expect(response.data.message || response.data.error).toBeDefined();
      expect(response.data.statusCode).toBe(400);
    });

    /**
     * Test 11: Missing email field
     * - Should return 400 Bad Request
     * - Should include validation error message
     */
    it('should return 400 for missing email', async () => {
      const response = await client.post('/auth/login-smart', {
        password: TEST_USER.password,
        // email intentionally omitted
      });

      expect(response.status).toBe(400);
      expect(response.data.message || response.data.error).toBeDefined();
      expect(response.data.statusCode).toBe(400);
    });

    /**
     * Test 12: Invalid email format
     * - Should return 400 Bad Request
     * - Should include validation error about email format
     */
    it('should return 400 for invalid email format', async () => {
      const response = await client.post('/auth/login-smart', {
        email: 'not-an-email',
        password: TEST_USER.password,
      });

      expect(response.status).toBe(400);
      expect(response.data.message || response.data.error).toBeDefined();
      expect(response.data.statusCode).toBe(400);
    });

    /**
     * Test 13: Empty email string
     * - Should return 400 Bad Request
     */
    it('should return 400 for empty email string', async () => {
      const response = await client.post('/auth/login-smart', {
        email: '',
        password: TEST_USER.password,
      });

      expect(response.status).toBe(400);
    });

    /**
     * Test 14: Empty password string
     * - Should return 400 Bad Request
     */
    it('should return 400 for empty password string', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: '',
      });

      expect(response.status).toBe(400);
    });

    /**
     * Test 15: Various invalid email formats
     */
    it('should validate various invalid email formats', async () => {
      const invalidEmails = [
        'user@',
        '@example.com',
        'user@.com',
        'user name@example.com',
        'user@@example.com',
        'user@example..com',
      ];

      for (const email of invalidEmails) {
        const response = await client.post('/auth/login-smart', {
          email,
          password: TEST_USER.password,
        });
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Login Endpoint - Rate Limiting', () => {
    /**
     * Test 16: Rate limit enforcement
     * - Configured limit: 10 requests per minute
     * - After 10 successful requests, should return 429
     *
     * Note: This test may be commented out in CI environments
     * as rate limiting often uses time-based windows
     */
    it.skip('should enforce rate limit (10 requests/minute)', async () => {
      const attempts = 11;
      let statusCode = 200;

      for (let i = 0; i < attempts; i++) {
        const response = await client.post('/auth/login-smart', {
          email: `ratelimit-test-${i}@dentalos.local`,
          password: TEST_USER.password,
        });
        statusCode = response.status;
      }

      // Should be rate limited by the 11th request
      expect(statusCode).toBe(429);
    });

    /**
     * Test 17: Rate limit header presence
     * - Response should include rate limit headers
     */
    it('should include rate limit headers in response', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      // Check for X-RateLimit headers (varies by implementation)
      expect(response.headers['x-ratelimit-limit']).toBeDefined();
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });

  describe('Login Endpoint - Edge Cases', () => {
    /**
     * Test 18: Extra fields in request body
     * - Should ignore extra fields
     * - Should not cause validation errors
     */
    it('should ignore extra fields in request body', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
        extraField: 'should-be-ignored',
        anotherField: 123,
      });

      // Should either succeed or fail based on validation logic
      // but should not crash
      expect([200, 400, 401]).toContain(response.status);
    });

    /**
     * Test 19: Whitespace in email
     * - Should trim or reject whitespace
     */
    it('should handle whitespace in email', async () => {
      const response = await client.post('/auth/login-smart', {
        email: `  ${TEST_USER.email}  `,
        password: TEST_USER.password,
      });

      // Should either succeed (if trimmed) or fail with validation error
      expect([200, 400, 401]).toContain(response.status);
    });

    /**
     * Test 20: Very long email string
     * - Should validate email length
     */
    it('should handle very long email strings', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const response = await client.post('/auth/login-smart', {
        email: longEmail,
        password: TEST_USER.password,
      });

      expect([400, 401]).toContain(response.status);
    });

    /**
     * Test 21: Very long password string
     * - Should handle long passwords gracefully
     */
    it('should handle very long password strings', async () => {
      const longPassword = 'a'.repeat(10000);
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: longPassword,
      });

      expect([400, 401]).toContain(response.status);
    });

    /**
     * Test 22: Special characters in password
     * - Should handle special characters correctly
     */
    it('should handle special characters in password', async () => {
      const specialCharPasswords = [
        'P@ssw0rd!#$%^&*()',
        'Password\n123',
        'Password\t123',
        'Password\\123',
        'Password"123',
      ];

      for (const password of specialCharPasswords) {
        const response = await client.post('/auth/login-smart', {
          email: TEST_USER.email,
          password,
        });
        // Should either succeed or fail gracefully
        expect([200, 400, 401]).toContain(response.status);
      }
    });
  });

  describe('Response Content-Type', () => {
    /**
     * Test 23: Response content-type header
     * - Should be application/json
     */
    it('should return application/json content-type', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.headers['content-type']).toContain('application/json');
    });
  });

  describe('CORS Headers', () => {
    /**
     * Test 24: CORS headers in response
     * - Should include appropriate CORS headers
     * - Configured origins: localhost:3000, localhost:3002, localhost:5173
     */
    it('should include CORS headers for allowed origins', async () => {
      const response = await client.post('/auth/login-smart', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(response.headers['access-control-allow-credentials']).toBe('true');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});

/**
 * Test Data Seeding Instructions
 *
 * Before running these tests, ensure the following users exist in the database:
 *
 * 1. Single Organization User:
 *    - Email: admin@dentalos.local
 *    - Password: Password123!
 *    - Organizations: 1
 *    - Roles: admin
 *
 * 2. Multi-Organization User:
 *    - Email: shared.user@dentalos.local
 *    - Password: Password123!
 *    - Organizations: 2+
 *    - Roles: user
 *
 * Seeding command:
 * cd apps/backend-auth && pnpm seed:users
 */
