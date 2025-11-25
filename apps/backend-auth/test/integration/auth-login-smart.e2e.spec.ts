/**
 * Login Smart Endpoint - Integration Test
 *
 * Tests the /api/v1/auth/login-smart endpoint to verify it returns
 * the correct data structure with proper authentication tokens.
 *
 * @group integration
 * @module backend-auth/test/integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('POST /api/v1/auth/login-smart - Integration Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Login Smart Response Structure Verification', () => {
    it('should return proper data structure with authentication tokens for admin user', async () => {
      // Arrange
      const loginPayload = {
        email: 'admin@dentalos.local',
        password: 'Password123!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login-smart')
        .send(loginPayload)
        .expect(200);

      // Assert - Response structure (wrapped by TransformInterceptor)
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeDefined();
      expect(response.body.data).not.toBeNull();

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.timestamp).toBeDefined();

      // Assert - Data object is NOT empty
      expect(response.body.data).not.toEqual({});
      expect(Object.keys(response.body.data).length).toBeGreaterThan(0);

      // Assert - AccessToken exists and is a string
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.accessToken).toBeDefined();
      expect(typeof response.body.data.accessToken).toBe('string');
      expect(response.body.data.accessToken.length).toBeGreaterThan(0);

      // Assert - RefreshToken exists and is a string
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.refreshToken).toBeDefined();
      expect(typeof response.body.data.refreshToken).toBe('string');
      expect(response.body.data.refreshToken.length).toBeGreaterThan(0);

      // Assert - User object exists
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user).not.toBeNull();
      expect(typeof response.body.data.user).toBe('object');

      // Assert - User email matches expected value
      expect(response.body.data.user).toHaveProperty('email');
      expect(response.body.data.user.email).toBe('admin@dentalos.local');

      // Additional verifications for complete data structure
      expect(response.body.data.user).toHaveProperty('id');
      expect(typeof response.body.data.user.id).toBe('string');

      expect(response.body.data.user).toHaveProperty('firstName');
      expect(typeof response.body.data.user.firstName).toBe('string');

      expect(response.body.data.user).toHaveProperty('lastName');
      expect(typeof response.body.data.user.lastName).toBe('string');

      expect(response.body.data.user).toHaveProperty('roles');
      expect(Array.isArray(response.body.data.user.roles)).toBe(true);

      // Verify tokens are valid JWT format (header.payload.signature)
      const accessTokenParts = response.body.data.accessToken.split('.');
      expect(accessTokenParts).toHaveLength(3);

      const refreshTokenParts = response.body.data.refreshToken.split('.');
      expect(refreshTokenParts).toHaveLength(3);

      // Log actual response for debugging
      console.log('\n=== Login Smart Response ===');
      console.log('Success:', response.body.success);
      console.log('Timestamp:', response.body.timestamp);
      console.log('Data keys:', Object.keys(response.body.data));
      console.log('User email:', response.body.data.user?.email);
      console.log('User roles:', response.body.data.user?.roles);
      console.log('Access token (first 50 chars):', response.body.data.accessToken?.substring(0, 50) + '...');
      console.log('Refresh token (first 50 chars):', response.body.data.refreshToken?.substring(0, 50) + '...');
      console.log('===========================\n');
    });

    it('should return valid tokens that can be used for authentication', async () => {
      // Arrange - Login to get tokens
      const loginPayload = {
        email: 'admin@dentalos.local',
        password: 'Password123!',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login-smart')
        .send(loginPayload)
        .expect(200);

      const accessToken = loginResponse.body.data.accessToken;

      // Act - Use the access token to access a protected endpoint
      const meResponse = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Assert - The token works and returns user data
      expect(meResponse.body.success).toBe(true);
      expect(meResponse.body.data).toBeDefined();
      expect(meResponse.body.data.email).toBe('admin@dentalos.local');
    });

    it('should handle invalid credentials with proper error response', async () => {
      // Arrange
      const invalidLoginPayload = {
        email: 'admin@dentalos.local',
        password: 'WrongPassword123!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login-smart')
        .send(invalidLoginPayload)
        .expect(401);

      // Assert - Error response structure
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing email with validation error', async () => {
      // Arrange
      const invalidPayload = {
        password: 'Password123!',
        // Missing email
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login-smart')
        .send(invalidPayload)
        .expect(400);

      // Assert - Validation error response
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle missing password with validation error', async () => {
      // Arrange
      const invalidPayload = {
        email: 'admin@dentalos.local',
        // Missing password
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login-smart')
        .send(invalidPayload)
        .expect(400);

      // Assert - Validation error response
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
