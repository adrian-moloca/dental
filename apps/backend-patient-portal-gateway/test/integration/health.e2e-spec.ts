/**
 * Health Check E2E Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Health Checks E2E', () => {
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

  it('GET /health/liveness should return 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/liveness');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });

  it('GET /health/readiness should return 200', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/readiness');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
  });
});
