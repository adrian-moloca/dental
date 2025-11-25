/**
 * Health Aggregator E2E Tests
 *
 * Integration tests for the health aggregator service.
 * Tests API endpoints, health polling, alerting, and storage.
 *
 * @module test/e2e
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health Aggregator (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('System Probes', () => {
    it('/api/v1/health/liveness (GET) - should return OK', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/liveness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('/api/v1/health/readiness (GET) - should return readiness status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/readiness')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Health Aggregation', () => {
    it('/api/v1/health/all (GET) - should return aggregated health', async () => {
      // Wait a bit for initial health checks to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return request(app.getHttpServer())
        .get('/api/v1/health/all')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('totalServices');
          expect(res.body).toHaveProperty('healthyServices');
          expect(res.body).toHaveProperty('degradedServices');
          expect(res.body).toHaveProperty('downServices');
          expect(res.body).toHaveProperty('overallStatus');
          expect(res.body).toHaveProperty('services');
          expect(Array.isArray(res.body.services)).toBe(true);
        });
    });

    it('/api/v1/health/stats (GET) - should return statistics', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/stats')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('services');
          expect(res.body).toHaveProperty('storage');
          expect(res.body).toHaveProperty('alerting');
          expect(res.body).toHaveProperty('registry');
        });
    });

    it('/api/v1/health/registry (GET) - should return service registry', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/registry')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('services');
          expect(Array.isArray(res.body.services)).toBe(true);
          expect(res.body.count).toBeGreaterThan(0);
        });
    });
  });

  describe('Service-Specific Endpoints', () => {
    it('/api/v1/health/services/:serviceName (GET) - should return service health', async () => {
      // Wait for health checks
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return request(app.getHttpServer())
        .get('/api/v1/health/services/auth')
        .expect((res) => {
          // May be 200 if service exists and has data, or 404 if no data yet
          if (res.status === 200) {
            expect(res.body).toHaveProperty('name', 'auth');
            expect(res.body).toHaveProperty('displayName');
            expect(res.body).toHaveProperty('status');
          }
        });
    });

    it('/api/v1/health/services/invalid-service (GET) - should return 404', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/services/invalid-service')
        .expect(404);
    });

    it('/api/v1/health/history/:serviceName (GET) - should return service history', async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return request(app.getHttpServer())
        .get('/api/v1/health/history/auth?limit=10')
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('serviceName', 'auth');
            expect(res.body).toHaveProperty('history');
            expect(Array.isArray(res.body.history)).toBe(true);
          }
        });
    });
  });

  describe('Dependency Graph', () => {
    it('/api/v1/health/graph (GET) - should return dependency graph', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/graph')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('nodes');
          expect(res.body).toHaveProperty('edges');
          expect(Array.isArray(res.body.nodes)).toBe(true);
          expect(Array.isArray(res.body.edges)).toBe(true);
        });
    });
  });

  describe('Alerts', () => {
    it('/api/v1/health/alerts (GET) - should return alert history', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/alerts?limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('alerts');
          expect(Array.isArray(res.body.alerts)).toBe(true);
        });
    });

    it('/api/v1/health/alerts (GET) - should filter by service', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/alerts?service=auth&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('alerts');
          expect(Array.isArray(res.body.alerts)).toBe(true);
        });
    });
  });

  describe('Force Health Check', () => {
    it('/api/v1/health/check (POST) - should trigger health check for all services', () => {
      return request(app.getHttpServer())
        .post('/api/v1/health/check')
        .expect(202)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('all services');
        });
    });

    it('/api/v1/health/check (POST) - should trigger health check for specific service', () => {
      return request(app.getHttpServer())
        .post('/api/v1/health/check?service=auth')
        .expect(202)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('auth');
        });
    });

    it('/api/v1/health/check (POST) - should return 404 for invalid service', () => {
      return request(app.getHttpServer())
        .post('/api/v1/health/check?service=invalid-service')
        .expect(404);
    });
  });

  describe('Input Validation', () => {
    it('/api/v1/health/history/:serviceName (GET) - should validate limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/history/auth?limit=999')
        .expect(400);
    });

    it('/api/v1/health/alerts (GET) - should validate limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health/alerts?limit=999')
        .expect(400);
    });
  });
});
