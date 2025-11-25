import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { HttpModule } from '@nestjs/axios';
import request from 'supertest';
import { AuthenticationController } from '../../src/modules/auth/controllers/authentication.controller';
import { AuthService } from '../../src/modules/auth/services/auth.service';
import { SubscriptionClientService } from '../../src/modules/auth/services/subscription-client.service';
import { UserRepository } from '../../src/modules/users/repositories/user.repository';
import { PasswordService } from '../../src/modules/users/services/password.service';
import { SessionService } from '../../src/modules/sessions/services/session.service';
import { User, UserStatus } from '../../src/modules/users/entities/user.entity';
import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';

describe('Auth-Subscription Integration (E2E)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let sessionService: SessionService;
  let jwtService: JwtService;
  let subscriptionClient: any;

  const TEST_ORG_ID = '550e8400-e29b-41d4-a716-446655440001' as OrganizationId;
  const TEST_USER_ID = '450e8400-e29b-41d4-a716-446655440001' as UUID;
  const TEST_CABINET_ID = '650e8400-e29b-41d4-a716-446655440001' as UUID;
  const TEST_SUBSCRIPTION_ID = '750e8400-e29b-41d4-a716-446655440001' as UUID;
  const TEST_SESSION_ID = '850e8400-e29b-41d4-a716-446655440001' as UUID;

  const testUser: Partial<User> = {
    id: TEST_USER_ID,
    email: 'test@example.com',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$test',
    firstName: 'Test',
    lastName: 'User',
    organizationId: TEST_ORG_ID,
    roles: ['USER'],
    permissions: [],
    status: UserStatus.ACTIVE,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCabinetResponse = {
    id: TEST_CABINET_ID,
    organizationId: TEST_ORG_ID,
    name: 'Test Cabinet',
    code: 'CAB001',
    isDefault: true,
    status: EntityStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockActiveSubscriptionResponse = {
    id: TEST_SUBSCRIPTION_ID,
    organizationId: TEST_ORG_ID,
    cabinetId: TEST_CABINET_ID,
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    totalPrice: 299.99,
    currency: 'USD',
    inGracePeriod: false,
    activeModuleCount: 6,
    modules: [
      {
        id: 'mod-1' as UUID,
        moduleId: 'core-1' as UUID,
        moduleCode: 'scheduling',
        moduleName: 'Scheduling',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: true,
      },
      {
        id: 'mod-2' as UUID,
        moduleId: 'core-2' as UUID,
        moduleCode: 'patient_management',
        moduleName: 'Patient Management',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: true,
      },
      {
        id: 'mod-3' as UUID,
        moduleId: 'core-3' as UUID,
        moduleCode: 'clinical_basic',
        moduleName: 'Clinical Basic',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: true,
      },
      {
        id: 'mod-4' as UUID,
        moduleId: 'core-4' as UUID,
        moduleCode: 'billing_basic',
        moduleName: 'Billing Basic',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: true,
      },
      {
        id: 'mod-5' as UUID,
        moduleId: 'prem-1' as UUID,
        moduleCode: 'inventory',
        moduleName: 'Inventory',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: false,
      },
      {
        id: 'mod-6' as UUID,
        moduleId: 'prem-2' as UUID,
        moduleCode: 'imaging',
        moduleName: 'Imaging',
        isActive: true,
        price: 49.99,
        billingCycle: 'MONTHLY',
        currency: 'USD',
        isCore: false,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockExpiredSubscriptionResponse = {
    ...mockActiveSubscriptionResponse,
    status: 'EXPIRED',
    modules: mockActiveSubscriptionResponse.modules.map(m => ({
      ...m,
      isActive: false,
    })),
  };

  const mockSessionResponse = {
    id: TEST_SESSION_ID,
    userId: TEST_USER_ID,
    organizationId: TEST_ORG_ID,
    refreshTokenHash: 'hash',
    deviceInfo: {
      deviceId: 'device-1',
      deviceName: 'Test Device',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
    isActive: () => true,
  };

  beforeAll(async () => {
    const mockConfigService = {
      get: vi.fn((key: string) => {
        const config: Record<string, any> = {
          'SUBSCRIPTION_SERVICE_URL': 'http://localhost:3311',
          'SUBSCRIPTION_SERVICE_TIMEOUT': 5000,
          'jwt': {
            accessExpiration: '15m',
            refreshExpiration: '7d',
            refreshSecret: 'test-refresh-secret-min-32-chars-long',
          },
        };
        return config[key];
      }),
    };

    const moduleBuilder = Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
        JwtModule.register({
          secret: 'test-secret-key',
          signOptions: { expiresIn: '15m' },
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AuthenticationController],
      providers: [
        AuthService,
        {
          provide: SubscriptionClientService,
          useValue: {
            getUserCabinets: vi.fn(),
            getDefaultCabinet: vi.fn(),
            getCabinetSubscription: vi.fn(),
            getCabinetById: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserRepository,
          useValue: {
            findByEmail: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            updateLastLogin: vi.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: vi.fn(),
            verifyPassword: vi.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            createSession: vi.fn(),
            validateRefreshToken: vi.fn(),
            rotateSession: vi.fn(),
            invalidateSession: vi.fn(),
            listActiveSessions: vi.fn(),
            validateSessionOwnership: vi.fn(),
          },
        },
      ],
    });

    module = await moduleBuilder.compile();
    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );

    await app.init();

    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    sessionService = module.get<SessionService>(SessionService);
    jwtService = module.get<JwtService>(JwtService);
    subscriptionClient = module.get(SubscriptionClientService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Login with subscription context', () => {
    it('should include cabinetId in JWT token on successful login', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.tokenType).toBe('Bearer');

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded).toHaveProperty('cabinetId');
      expect(decoded.cabinetId).toBe(TEST_CABINET_ID);
    });

    it('should include subscription.status in JWT token', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded).toHaveProperty('subscription');
      expect(decoded.subscription).toHaveProperty('status');
      expect(decoded.subscription.status).toBe('ACTIVE');
    });

    it('should include subscription.modules[] array with module codes', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.subscription).toHaveProperty('modules');
      expect(Array.isArray(decoded.subscription.modules)).toBe(true);
      expect(decoded.subscription.modules).toContain('inventory');
      expect(decoded.subscription.modules).toContain('imaging');
      expect(decoded.subscription.modules).toContain('scheduling');
      expect(decoded.subscription.modules).toContain('patient_management');
      expect(decoded.subscription.modules).toContain('clinical_basic');
      expect(decoded.subscription.modules).toContain('billing_basic');
      expect(decoded.subscription.modules.length).toBe(6);
    });
  });

  describe('2. Graceful degradation', () => {
    it('should allow login even if subscription service is down', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.tokenType).toBe('Bearer');
    });

    it('should return valid JWT without subscription context when service unavailable', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('organizationId');
      expect(decoded.sub).toBe(TEST_USER_ID);
      expect(decoded.email).toBe('test@example.com');
    });

    it('should not include subscription fields in JWT when service unavailable', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.cabinetId).toBeUndefined();
      expect(decoded.subscription).toBeUndefined();
    });
  });

  describe('3. Cabinet selection', () => {
    it('should select default cabinet when user has multiple cabinets', async () => {
      const defaultCabinet = { ...mockCabinetResponse, isDefault: true };
      const secondaryCabinet = {
        ...mockCabinetResponse,
        id: '660e8400-e29b-41d4-a716-446655440001' as UUID,
        name: 'Secondary Cabinet',
        isDefault: false,
      };

      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([secondaryCabinet, defaultCabinet]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.cabinetId).toBe(TEST_CABINET_ID);
    });

    it('should select first cabinet when user has no default', async () => {
      const firstCabinet = { ...mockCabinetResponse, isDefault: false };
      const secondCabinet = {
        ...mockCabinetResponse,
        id: '660e8400-e29b-41d4-a716-446655440001' as UUID,
        name: 'Second Cabinet',
        isDefault: false,
      };

      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([firstCabinet, secondCabinet]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.cabinetId).toBe(TEST_CABINET_ID);
    });

    it('should match subscription data to selected cabinet', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(subscriptionClient.getCabinetSubscription).toHaveBeenCalledWith(
        TEST_CABINET_ID,
        TEST_ORG_ID
      );
      expect(decoded.cabinetId).toBe(TEST_CABINET_ID);
      expect(decoded.subscription.status).toBe('ACTIVE');
    });
  });

  describe('4. Module authorization scenarios', () => {
    it('should include inventory module in JWT when subscription is active', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.subscription.modules).toContain('inventory');
    });

    it('should not include imaging module when not in subscription', async () => {
      const subscriptionWithoutImaging = {
        ...mockActiveSubscriptionResponse,
        modules: mockActiveSubscriptionResponse.modules.filter(
          m => m.moduleCode !== 'imaging'
        ),
      };

      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(subscriptionWithoutImaging);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.subscription.modules).not.toContain('imaging');
      expect(decoded.subscription.modules).toContain('inventory');
    });

    it('should return EXPIRED status for expired subscription', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockExpiredSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.subscription.status).toBe('EXPIRED');
    });

    it('should only include active modules in JWT', async () => {
      const mixedActiveModules = {
        ...mockActiveSubscriptionResponse,
        modules: [
          ...mockActiveSubscriptionResponse.modules.slice(0, 4),
          {
            ...mockActiveSubscriptionResponse.modules[4],
            isActive: false,
          },
          mockActiveSubscriptionResponse.modules[5],
        ],
      };

      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mixedActiveModules);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;
      expect(decoded.subscription.modules).not.toContain('inventory');
      expect(decoded.subscription.modules).toContain('imaging');
      expect(decoded.subscription.modules.length).toBe(5);
    });
  });

  describe('5. JWT payload structure validation', () => {
    it('should have all required JWT fields', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('roles');
      expect(decoded).toHaveProperty('permissions');
      expect(decoded).toHaveProperty('organizationId');
      expect(decoded).toHaveProperty('cabinetId');
      expect(decoded).toHaveProperty('subscription');
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
    });

    it('should have subscription object with correct structure', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValue(testUser as User);
      vi.spyOn(passwordService, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(userRepository, 'updateLastLogin').mockResolvedValue(undefined);
      vi.spyOn(sessionService, 'createSession').mockResolvedValue(mockSessionResponse as any);

      subscriptionClient.getUserCabinets.mockResolvedValue([mockCabinetResponse]);
      subscriptionClient.getCabinetSubscription.mockResolvedValue(mockActiveSubscriptionResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          organizationId: TEST_ORG_ID,
        })
        .expect(200);

      const decoded = jwtService.decode(response.body.accessToken) as any;

      expect(decoded.subscription).toBeDefined();
      expect(typeof decoded.subscription).toBe('object');
      expect(decoded.subscription).toHaveProperty('status');
      expect(decoded.subscription).toHaveProperty('modules');
      expect(typeof decoded.subscription.status).toBe('string');
      expect(Array.isArray(decoded.subscription.modules)).toBe(true);
    });
  });
});
