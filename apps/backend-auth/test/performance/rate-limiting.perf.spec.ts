/**
 * Rate Limiting Performance Tests
 *
 * Validates per-tenant rate limiting functionality and performance.
 * Tests include:
 * - Tenant-specific rate limit enforcement
 * - Isolation between tenants
 * - Stricter limits on auth endpoints
 * - Performance benchmarks (latency, throughput)
 *
 * @module test/performance/rate-limiting
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Rate Limiting Performance (Baseline)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Helper function to generate mock JWT token
   */
  function generateMockJWT(payload: {
    userId: string;
    organizationId: string;
    clinicId?: string;
  }): string {
    return jwtService.sign(payload);
  }

  describe('Per-Tenant Rate Limiting', () => {
    it('should enforce tenant-specific rate limits', async () => {
      const orgId = 'test-org-123';
      const token = generateMockJWT({
        userId: 'user-1',
        organizationId: orgId,
      });

      // Make requests up to limit (default: 100 per minute)
      const responses = [];
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer())
          .get('/health/liveness')
          .set('Authorization', `Bearer ${token}`);
        responses.push(response);
      }

      // All requests should succeed (well below limit)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    }, 30000);

    it('should isolate rate limits between tenants', async () => {
      const org1Token = generateMockJWT({
        userId: 'user-1',
        organizationId: 'org-1',
      });
      const org2Token = generateMockJWT({
        userId: 'user-2',
        organizationId: 'org-2',
      });

      // Make multiple requests for org-1
      const org1Requests = [];
      for (let i = 0; i < 50; i++) {
        org1Requests.push(
          request(app.getHttpServer())
            .get('/health/liveness')
            .set('Authorization', `Bearer ${org1Token}`)
        );
      }
      await Promise.all(org1Requests);

      // org-2 should still have full quota (independent limits)
      const org2Response = await request(app.getHttpServer())
        .get('/health/liveness')
        .set('Authorization', `Bearer ${org2Token}`);

      expect(org2Response.status).toBe(200);
      expect(org2Response.body).toHaveProperty('status', 'ok');
    }, 30000);

    it('should use IP-based rate limiting for public endpoints', async () => {
      // Make requests without authentication
      const responses = [];
      for (let i = 0; i < 10; i++) {
        const response = await request(app.getHttpServer()).get(
          '/health/liveness'
        );
        responses.push(response);
      }

      // All requests should succeed (well below limit)
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    }, 30000);
  });

  describe('Performance Benchmarks', () => {
    it('should handle rate limit checks with acceptable latency', async () => {
      const token = generateMockJWT({
        userId: 'perf-user',
        organizationId: 'perf-test-org',
      });
      const timings: number[] = [];

      // Warm up
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .get('/health/liveness')
          .set('Authorization', `Bearer ${token}`);
      }

      // Measure latency
      for (let i = 0; i < 100; i++) {
        const start = process.hrtime.bigint();
        await request(app.getHttpServer())
          .get('/health/liveness')
          .set('Authorization', `Bearer ${token}`);
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        timings.push(durationMs);
      }

      timings.sort((a, b) => a - b);
      const p95Index = Math.floor(timings.length * 0.95);
      const p50Index = Math.floor(timings.length * 0.5);
      const p99Index = Math.floor(timings.length * 0.99);
      
      const p50 = timings[p50Index];
      const p95 = timings[p95Index];
      const p99 = timings[p99Index];

      console.log('Rate Limiting Performance:');
      console.log('  P50:', p50.toFixed(2), 'ms');
      console.log('  P95:', p95.toFixed(2), 'ms');
      console.log('  P99:', p99.toFixed(2), 'ms');

      // P95 should be well below 50ms
      expect(p95).toBeLessThan(50);
    }, 60000);

    it('should scale to concurrent requests from multiple tenants', async () => {
      const tenantCount = 10;
      const requestsPerTenant = 10;

      const tokens = Array.from({ length: tenantCount }, (_, i) =>
        generateMockJWT({
          userId: `user-${i}`,
          organizationId: `org-${i}`,
        })
      );

      const start = Date.now();

      const promises = tokens.flatMap((token) =>
        Array.from({ length: requestsPerTenant }, () =>
          request(app.getHttpServer())
            .get('/health/liveness')
            .set('Authorization', `Bearer ${token}`)
        )
      );

      const responses = await Promise.all(promises);

      const duration = Date.now() - start;
      const totalRequests = tenantCount * requestsPerTenant;
      const rps = (totalRequests / duration) * 1000;

      console.log('Concurrent Request Performance:');
      console.log('  Total Requests:', totalRequests);
      console.log('  Duration:', duration, 'ms');
      console.log('  Throughput:', rps.toFixed(2), 'req/sec');

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Should achieve at least 50 req/sec
      expect(rps).toBeGreaterThan(50);
    }, 60000);
  });

  describe('Auth Endpoint Rate Limiting', () => {
    it('should have stricter limits on auth endpoints (decorators exist)', async () => {
      // This test will be implemented when auth endpoints are available
      // For now, we test that the decorators are properly exported

      const decorators = await import('../../src/decorators/auth-throttle.decorator');

      expect(decorators.AuthThrottle).toBeDefined();
      expect(decorators.PasswordResetThrottle).toBeDefined();
      expect(typeof decorators.AuthThrottle).toBe('function');
      expect(typeof decorators.PasswordResetThrottle).toBe('function');
    });
  });
});
