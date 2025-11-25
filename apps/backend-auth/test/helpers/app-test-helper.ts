/**
 * App Test Helper
 * Utilities for creating and managing NestJS test applications
 *
 * @module backend-auth/test/helpers
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  createTestTenantContext,
  createTestUser,
  createTestSession,
  MockLogger,
  createMockLogger,
  MockRedisClient,
  MockPostgresClient,
  InMemoryEventBus,
} from '@dentalos/shared-testing';
import type { TenantContext } from '@dentalos/shared-types';

/**
 * Test app configuration
 */
export interface TestAppConfig {
  /**
   * Enable global validation pipe
   * @default true
   */
  enableValidation?: boolean;

  /**
   * Mock database client
   * @default true
   */
  mockDatabase?: boolean;

  /**
   * Mock Redis client
   * @default true
   */
  mockRedis?: boolean;

  /**
   * Mock event bus
   * @default true
   */
  mockEventBus?: boolean;

  /**
   * Mock logger
   * @default true
   */
  mockLogger?: boolean;

  /**
   * Additional module overrides
   */
  moduleOverrides?: Record<string, any>;
}

/**
 * Test application instance
 */
export interface TestApp {
  app: INestApplication;
  module: TestingModule;
  mocks: {
    logger: MockLogger;
    database: MockPostgresClient;
    redis: MockRedisClient;
    eventBus: InMemoryEventBus;
  };
}

/**
 * Creates a NestJS test application
 *
 * @param appModule - The root application module to test
 * @param config - Test app configuration
 * @returns Test application instance
 *
 * @example
 * ```typescript
 * import { AppModule } from '../../src/app.module';
 * import { createTestApp, closeTestApp } from '../helpers/app-test-helper';
 *
 * describe('AppModule', () => {
 *   let testApp: TestApp;
 *
 *   beforeAll(async () => {
 *     testApp = await createTestApp(AppModule);
 *   });
 *
 *   afterAll(async () => {
 *     await closeTestApp(testApp);
 *   });
 *
 *   it('should initialize app', () => {
 *     expect(testApp.app).toBeDefined();
 *   });
 * });
 * ```
 */
export async function createTestApp(
  appModule: any,
  config: TestAppConfig = {}
): Promise<TestApp> {
  const {
    enableValidation = true,
    mockDatabase = true,
    mockRedis = true,
    mockEventBus = true,
    mockLogger = true,
    moduleOverrides = {},
  } = config;

  // Create mock instances
  const logger = mockLogger ? createMockLogger() : null;
  const database = mockDatabase ? new MockPostgresClient() : null;
  const redis = mockRedis ? new MockRedisClient() : null;
  const eventBus = mockEventBus ? new InMemoryEventBus() : null;

  // Build test module with overrides
  const moduleBuilder = Test.createTestingModule({
    imports: [appModule],
  });

  // Override providers with mocks
  if (logger) {
    moduleBuilder.overrideProvider('Logger').useValue(logger);
  }

  if (database) {
    moduleBuilder.overrideProvider('DATABASE_CONNECTION').useValue(database);
  }

  if (redis) {
    moduleBuilder.overrideProvider('REDIS_CLIENT').useValue(redis);
  }

  if (eventBus) {
    moduleBuilder.overrideProvider('EVENT_BUS').useValue(eventBus);
  }

  // Apply additional overrides
  Object.entries(moduleOverrides).forEach(([token, value]) => {
    moduleBuilder.overrideProvider(token).useValue(value);
  });

  // Compile module
  const module = await moduleBuilder.compile();

  // Create app instance
  const app = module.createNestApplication();

  // Apply global validation pipe if enabled
  if (enableValidation) {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
  }

  // Initialize app
  await app.init();

  return {
    app,
    module,
    mocks: {
      logger: logger!,
      database: database!,
      redis: redis!,
      eventBus: eventBus!,
    },
  };
}

/**
 * Closes and cleans up test application
 *
 * @param testApp - Test application instance
 *
 * @example
 * ```typescript
 * afterAll(async () => {
 *   await closeTestApp(testApp);
 * });
 * ```
 */
export async function closeTestApp(testApp: TestApp): Promise<void> {
  if (testApp.app) {
    await testApp.app.close();
  }

  // Clear mock data
  if (testApp.mocks.logger) {
    testApp.mocks.logger.clearLogs();
  }

  if (testApp.mocks.database) {
    testApp.mocks.database.clearAll();
  }

  if (testApp.mocks.redis) {
    await testApp.mocks.redis.flushall();
  }

  if (testApp.mocks.eventBus) {
    testApp.mocks.eventBus.clearAll();
  }
}

/**
 * Creates a test tenant context with default values
 *
 * @returns Test tenant context
 *
 * @example
 * ```typescript
 * const context = mockTenantContext();
 * // { organizationId: 'org-test-001', clinicId: 'clinic-test-001' }
 * ```
 */
export function mockTenantContext(overrides?: Partial<TenantContext>): TenantContext {
  return createTestTenantContext(overrides);
}

/**
 * Creates a test correlation ID
 *
 * @returns Test correlation ID (UUID v4)
 *
 * @example
 * ```typescript
 * const correlationId = mockCorrelationId();
 * ```
 */
export function mockCorrelationId(): string {
  return 'test-correlation-' + Math.random().toString(36).substring(2, 15);
}

/**
 * Creates a mock JWT payload for testing
 *
 * @param overrides - Partial JWT payload to override defaults
 * @returns Mock JWT payload
 *
 * @example
 * ```typescript
 * const jwtPayload = mockJWT({
 *   userId: 'user-123',
 *   roles: ['DENTIST'],
 * });
 * ```
 */
export interface MockJWTPayload {
  sub: string; // User ID
  organizationId: string;
  clinicId?: string;
  roles: string[];
  email: string;
  iat: number;
  exp: number;
}

export function mockJWT(overrides?: Partial<MockJWTPayload>): MockJWTPayload {
  const user = createTestUser();
  const context = createTestTenantContext();
  const session = createTestSession();

  const now = Math.floor(Date.now() / 1000);

  return {
    sub: user.id,
    organizationId: context.organizationId,
    clinicId: context.clinicId,
    roles: ['USER'],
    email: user.email,
    iat: now,
    exp: now + 3600, // 1 hour from now
    ...overrides,
  };
}

/**
 * Creates a mock JWT token string (base64 encoded)
 *
 * @param payload - JWT payload
 * @returns Mock JWT token string
 *
 * @example
 * ```typescript
 * const token = mockJWTToken({ userId: 'user-123' });
 * // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsIm...'
 * ```
 */
export function mockJWTToken(payload?: Partial<MockJWTPayload>): string {
  const jwtPayload = mockJWT(payload);

  // Create mock JWT structure (header.payload.signature)
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
  const signature = 'mock-signature';

  return `${header}.${body}.${signature}`;
}

/**
 * Creates HTTP request headers with authentication and correlation ID
 *
 * @param options - Header options
 * @returns HTTP headers object
 *
 * @example
 * ```typescript
 * const headers = mockAuthHeaders({
 *   correlationId: 'test-123',
 *   tenantContext: { organizationId: 'org-1' },
 * });
 *
 * const response = await request(app.getHttpServer())
 *   .get('/users')
 *   .set(headers);
 * ```
 */
export interface MockAuthHeadersOptions {
  /**
   * JWT token (if not provided, generates one)
   */
  token?: string;

  /**
   * Correlation ID (if not provided, generates one)
   */
  correlationId?: string;

  /**
   * Tenant context for JWT payload
   */
  tenantContext?: Partial<TenantContext>;

  /**
   * Additional headers
   */
  additionalHeaders?: Record<string, string>;
}

export function mockAuthHeaders(options: MockAuthHeadersOptions = {}): Record<string, string> {
  const {
    token,
    correlationId = mockCorrelationId(),
    tenantContext,
    additionalHeaders = {},
  } = options;

  const jwtToken = token || mockJWTToken(tenantContext);

  return {
    Authorization: `Bearer ${jwtToken}`,
    'X-Correlation-ID': correlationId,
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
}

/**
 * Waits for a condition to be true with timeout
 *
 * @param condition - Function that returns true when condition is met
 * @param timeout - Timeout in milliseconds
 * @param interval - Polling interval in milliseconds
 *
 * @example
 * ```typescript
 * await waitForCondition(
 *   () => mockLogger.hasMessage('User created'),
 *   5000,
 *   100
 * );
 * ```
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await Promise.resolve(condition());
    if (result) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}
