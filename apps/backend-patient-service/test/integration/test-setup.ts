/**
 * Integration Test Setup Utilities
 *
 * Provides utilities for setting up NestJS integration tests with MongoDB Memory Server
 *
 * @module test/integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import type { CurrentUser } from '@dentalos/shared-auth';
import { createTestUser } from '@dentalos/shared-testing';

/**
 * Test context for integration tests
 */
export interface TestContext {
  app: INestApplication;
  mongoServer: MongoMemoryServer;
  user: CurrentUser;
}

/**
 * Creates a test NestJS application with MongoDB Memory Server
 *
 * @param moduleImports - Additional modules to import
 * @param user - Optional user context (defaults to test user)
 * @returns Test context with app and mongo server
 */
export async function createTestApp(
  moduleImports: any[],
  user?: CurrentUser,
): Promise<TestContext> {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  const testUser = user || createTestUser();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            mongoUri,
            jwtSecret: 'test-secret',
            jwtExpiration: '1h',
          }),
        ],
      }),
      MongooseModule.forRoot(mongoUri),
      ...moduleImports,
    ],
  })
    .overrideProvider('JwtAuthGuard')
    .useValue({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = testUser;
        return true;
      },
    })
    .overrideProvider('TenantIsolationGuard')
    .useValue({ canActivate: () => true })
    .overrideProvider('PermissionsGuard')
    .useValue({ canActivate: () => true })
    .compile();

  const app = moduleRef.createNestApplication();

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  return {
    app,
    mongoServer,
    user: testUser,
  };
}

/**
 * Closes the test application and mongo server
 *
 * @param context - Test context to close
 */
export async function closeTestApp(context: TestContext): Promise<void> {
  await context.app.close();
  await context.mongoServer.stop();
}

/**
 * Creates a mock JWT token for testing
 *
 * @param user - User context
 * @returns Mock JWT token
 */
export function createMockToken(user: CurrentUser): string {
  // In integration tests, we bypass JWT validation, so this is just a placeholder
  return 'mock-jwt-token';
}

/**
 * Makes an authenticated request
 *
 * @param app - NestJS application
 * @param method - HTTP method
 * @param path - Request path
 * @returns Supertest request
 */
export function authenticatedRequest(
  app: INestApplication,
  method: 'get' | 'post' | 'patch' | 'delete',
  path: string,
) {
  const req = request(app.getHttpServer())[method](path);
  return req.set('Authorization', 'Bearer mock-token');
}

/**
 * Test data factory for creating patient DTOs
 */
export class PatientDataFactory {
  static createFullPatientDto(overrides?: any) {
    return {
      clinicId: overrides?.clinicId || 'clinic-test-001',
      patientNumber: overrides?.patientNumber || `PAT-${Date.now()}`,
      person: {
        firstName: overrides?.firstName || 'Test',
        lastName: overrides?.lastName || 'Patient',
        middleName: overrides?.middleName,
        preferredName: overrides?.preferredName,
        dateOfBirth: overrides?.dateOfBirth || new Date('1990-01-01'),
        gender: overrides?.gender || 'male',
        ssn: overrides?.ssn,
      },
      contacts: {
        phones: overrides?.phones || [
          {
            type: 'mobile',
            number: '+1-555-0100',
            isPrimary: true,
          },
        ],
        emails: overrides?.emails || [
          {
            type: 'personal',
            address: `test${Date.now()}@example.com`,
            isPrimary: true,
          },
        ],
        addresses: overrides?.addresses || [
          {
            street: '123 Test Street',
            city: 'Test City',
            state: 'TS',
            postalCode: '12345',
            country: 'US',
            isPrimary: true,
          },
        ],
      },
      demographics: overrides?.demographics || {
        preferredLanguage: 'en',
        ethnicity: 'Test Ethnicity',
        race: 'Test Race',
        occupation: 'Test Occupation',
        maritalStatus: 'single',
      },
      medical: overrides?.medical || {
        allergies: ['Penicillin'],
        medications: ['None'],
        conditions: ['None'],
        flags: [],
      },
      tags: overrides?.tags || ['test-patient'],
      communicationPreferences: overrides?.communicationPreferences || {
        preferredChannel: 'email',
        appointmentReminders: true,
        marketingConsent: false,
        recallReminders: true,
        smsNotifications: false,
        emailNotifications: true,
      },
      consent: {
        gdprConsent: true,
        marketingConsent: false,
        dataProcessingConsent: true,
        treatmentConsent: true,
      },
      assignedProviderId: overrides?.assignedProviderId,
      referredBy: overrides?.referredBy,
      notes: overrides?.notes,
      ...overrides,
    };
  }

  static createMinimalPatientDto(overrides?: any) {
    return {
      clinicId: overrides?.clinicId || 'clinic-test-001',
      person: {
        firstName: overrides?.firstName || 'Minimal',
        lastName: overrides?.lastName || 'Patient',
        dateOfBirth: overrides?.dateOfBirth || new Date('1995-05-15'),
        gender: overrides?.gender || 'female',
      },
      consent: {
        gdprConsent: true,
      },
      ...overrides,
    };
  }

  static createInvalidPatientDto() {
    return {
      // Missing required fields
      person: {
        firstName: 'Invalid',
        // Missing lastName
        // Missing dateOfBirth
        // Missing gender
      },
      // Missing consent
    };
  }
}

/**
 * Test data factory for creating relationship DTOs
 */
export class RelationshipDataFactory {
  static createRelationshipDto(
    relatedPatientId: string,
    type: string = 'parent',
    overrides?: any,
  ) {
    return {
      relatedPatientId,
      relationshipType: type,
      notes: overrides?.notes,
      isEmergencyContact: overrides?.isEmergencyContact || false,
      canMakeDecisions: overrides?.canMakeDecisions || false,
      canViewRecords: overrides?.canViewRecords || false,
      ...overrides,
    };
  }
}

/**
 * Assertion helpers
 */
export class TestAssertions {
  static expectSuccessResponse(response: request.Response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(true);
  }

  static expectErrorResponse(
    response: request.Response,
    statusCode: number,
    errorMessage?: string,
  ) {
    expect(response.status).toBe(statusCode);
    if (errorMessage) {
      expect(response.body.message).toContain(errorMessage);
    }
  }

  static expectValidPatient(patient: any) {
    expect(patient).toBeDefined();
    expect(patient.id).toBeDefined();
    expect(patient.person).toBeDefined();
    expect(patient.person.firstName).toBeDefined();
    expect(patient.person.lastName).toBeDefined();
    expect(patient.organizationId).toBeDefined();
    expect(patient.clinicId).toBeDefined();
    expect(patient.createdAt).toBeDefined();
    expect(patient.updatedAt).toBeDefined();
  }

  static expectPaginatedResponse(response: request.Response) {
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.total).toBeGreaterThanOrEqual(0);
    expect(response.body.pagination.page).toBeGreaterThan(0);
    expect(response.body.pagination.limit).toBeGreaterThan(0);
    expect(response.body.pagination.totalPages).toBeGreaterThanOrEqual(0);
  }
}
