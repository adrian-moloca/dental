/**
 * Auth Module E2E Tests
 *
 * Tests the complete authentication flow for patients.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.setGlobalPrefix('api', {
      exclude: ['health/liveness', 'health/readiness', 'health/detailed'],
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/portal/patient/auth/register', () => {
    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/portal/patient/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-01',
          tenantId: 'tenant-123',
        });

      expect(response.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/portal/patient/auth/register')
        .send({
          email: 'john.doe@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-01',
          tenantId: 'tenant-123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/portal/patient/auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/portal/patient/auth/login')
        .send({
          email: 'john.doe@example.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/portal/patient/auth/me', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/portal/patient/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
