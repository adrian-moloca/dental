/**
 * Test Fixtures for Cabinet Selection Tests
 *
 * Reusable test data generators for:
 * - Users
 * - Cabinets
 * - Subscriptions
 * - UserCabinet relationships
 * - JWT tokens
 *
 * @module backend-auth/test/fixtures
 */

import type { UUID, OrganizationId } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import type { CurrentUser } from '@dentalos/shared-auth';
import { ModuleCode, SubscriptionStatus } from '@dentalos/shared-auth';
import type {
  CabinetSummary,
  SubscriptionSummary,
  SubscriptionModule,
} from '../../src/modules/auth/services/subscription-client.service';
import type { UserCabinet } from '../../src/modules/users/entities/user-cabinet.entity';

/**
 * Counter for generating unique test IDs
 */
let idCounter = 0;
export const resetIdCounter = () => {
  idCounter = 0;
};

/**
 * Generate unique test UUID with prefix
 */
export const generateTestUuid = (prefix: string): UUID => {
  const id = ++idCounter;
  return `${prefix}-${id.toString().padStart(36 - prefix.length - 1, '0')}` as UUID;
};

/**
 * Generate unique test organization ID
 */
export const generateOrgId = (suffix?: string): OrganizationId => {
  if (suffix) {
    return `550e8400-e29b-41d4-a716-4466554400${suffix.padStart(2, '0')}` as OrganizationId;
  }
  return generateTestUuid('org') as OrganizationId;
};

/**
 * Generate unique test user ID
 */
export const generateUserId = (suffix?: string): UUID => {
  if (suffix) {
    return `650e8400-e29b-41d4-a716-4466554400${suffix.padStart(2, '0')}` as UUID;
  }
  return generateTestUuid('user');
};

/**
 * Generate unique test cabinet ID
 */
export const generateCabinetId = (suffix?: string): UUID => {
  if (suffix) {
    return `750e8400-e29b-41d4-a716-4466554400${suffix.padStart(2, '0')}` as UUID;
  }
  return generateTestUuid('cabinet');
};

/**
 * Generate unique test session ID
 */
export const generateSessionId = (suffix?: string): UUID => {
  if (suffix) {
    return `850e8400-e29b-41d4-a716-4466554400${suffix.padStart(2, '0')}` as UUID;
  }
  return generateTestUuid('session');
};

/**
 * Generate unique test subscription ID
 */
export const generateSubscriptionId = (suffix?: string): UUID => {
  if (suffix) {
    return `950e8400-e29b-41d4-a716-4466554400${suffix.padStart(2, '0')}` as UUID;
  }
  return generateTestUuid('sub');
};

/**
 * Core module fixtures
 */
export const CORE_MODULES = [
  ModuleCode.SCHEDULING,
  ModuleCode.PATIENT_MANAGEMENT,
  ModuleCode.CLINICAL_BASIC,
  ModuleCode.BILLING_BASIC,
];

/**
 * Premium module fixtures
 */
export const PREMIUM_MODULES = [
  ModuleCode.CLINICAL_ADVANCED,
  ModuleCode.IMAGING,
  ModuleCode.INVENTORY,
  ModuleCode.MARKETING,
  ModuleCode.INSURANCE,
  ModuleCode.TELEDENTISTRY,
  ModuleCode.ANALYTICS_ADVANCED,
  ModuleCode.MULTI_LOCATION,
];

/**
 * All available modules
 */
export const ALL_MODULES = [...CORE_MODULES, ...PREMIUM_MODULES];

/**
 * Create subscription module fixture
 */
export const createSubscriptionModule = (
  moduleCode: ModuleCode,
  overrides?: Partial<SubscriptionModule>
): SubscriptionModule => {
  const isCore = CORE_MODULES.includes(moduleCode);
  const basePrice = isCore ? 49.99 : 79.99;

  return {
    id: generateTestUuid('mod'),
    moduleId: generateTestUuid(`module-${moduleCode}`),
    moduleCode,
    moduleName: formatModuleName(moduleCode),
    isActive: true,
    price: basePrice,
    billingCycle: 'MONTHLY',
    currency: 'USD',
    isCore,
    ...overrides,
  };
};

/**
 * Format module code to display name
 */
const formatModuleName = (moduleCode: ModuleCode): string => {
  const names: Record<ModuleCode, string> = {
    [ModuleCode.SCHEDULING]: 'Scheduling & Appointments',
    [ModuleCode.PATIENT_MANAGEMENT]: 'Patient Management',
    [ModuleCode.CLINICAL_BASIC]: 'Clinical EHR (Basic)',
    [ModuleCode.CLINICAL_ADVANCED]: 'Clinical EHR (Advanced)',
    [ModuleCode.BILLING_BASIC]: 'Billing & Payments (Basic)',
    [ModuleCode.IMAGING]: 'Imaging & X-rays',
    [ModuleCode.INVENTORY]: 'Inventory Management',
    [ModuleCode.MARKETING]: 'Marketing & Communications',
    [ModuleCode.INSURANCE]: 'Insurance Claims',
    [ModuleCode.TELEDENTISTRY]: 'Teledentistry',
    [ModuleCode.ANALYTICS_ADVANCED]: 'Advanced Analytics',
    [ModuleCode.MULTI_LOCATION]: 'Multi-Location Management',
  };
  return names[moduleCode] || moduleCode;
};

/**
 * Create cabinet fixture
 */
export const createCabinetFixture = (overrides?: Partial<CabinetSummary>): CabinetSummary => ({
  id: generateCabinetId(),
  organizationId: generateOrgId(),
  name: 'Test Dental Clinic',
  code: 'CAB-001',
  isDefault: true,
  ownerId: generateUserId(),
  status: EntityStatus.ACTIVE,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Create subscription fixture with active status
 */
export const createActiveSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  id: generateSubscriptionId(),
  organizationId: generateOrgId(),
  cabinetId: generateCabinetId(),
  status: 'ACTIVE',
  billingCycle: 'MONTHLY',
  totalPrice: 199.99,
  currency: 'USD',
  isTrial: false,
  inGracePeriod: false,
  modules: CORE_MODULES.map(code => createSubscriptionModule(code)),
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

/**
 * Create trial subscription fixture
 */
export const createTrialSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  ...createActiveSubscription(),
  status: 'TRIAL',
  isTrial: true,
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  ...overrides,
});

/**
 * Create expired subscription fixture
 */
export const createExpiredSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  ...createActiveSubscription(),
  status: 'EXPIRED',
  modules: [], // No modules when expired
  isTrialExpired: true,
  ...overrides,
});

/**
 * Create suspended subscription fixture
 */
export const createSuspendedSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  ...createActiveSubscription(),
  status: 'SUSPENDED',
  modules: [], // No modules when suspended
  ...overrides,
});

/**
 * Create cancelled subscription fixture
 */
export const createCancelledSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  ...createActiveSubscription(),
  status: 'CANCELLED',
  modules: [], // No modules when cancelled
  ...overrides,
});

/**
 * Create premium subscription with all modules
 */
export const createPremiumSubscription = (
  overrides?: Partial<SubscriptionSummary>
): SubscriptionSummary => ({
  ...createActiveSubscription(),
  totalPrice: 799.99,
  modules: ALL_MODULES.map(code => createSubscriptionModule(code)),
  ...overrides,
});

/**
 * Create UserCabinet relationship fixture
 */
export const createUserCabinetFixture = (
  overrides?: Partial<UserCabinet>
): UserCabinet => ({
  id: generateTestUuid('uc'),
  userId: generateUserId(),
  cabinetId: generateCabinetId(),
  organizationId: generateOrgId(),
  isPrimary: true,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  deletedAt: null,
  ...overrides,
});

/**
 * Create CurrentUser fixture
 */
export const createCurrentUserFixture = (
  overrides?: Partial<CurrentUser>
): CurrentUser => {
  const organizationId = overrides?.organizationId || generateOrgId();

  return {
    userId: generateUserId(),
    email: 'test@example.com',
    roles: ['user'],
    permissions: [],
    organizationId,
    tenantId: organizationId,
    tenantContext: {
      organizationId,
      tenantId: organizationId,
    },
    subscription: {
      id: generateSubscriptionId(),
      status: SubscriptionStatus.ACTIVE,
      modules: CORE_MODULES,
    },
    ...overrides,
  };
};

/**
 * Create user with specific role
 */
export const createDentistUser = (overrides?: Partial<CurrentUser>): CurrentUser =>
  createCurrentUserFixture({
    roles: ['dentist'],
    permissions: [
      'patient:read',
      'patient:write',
      'clinical:read',
      'clinical:write',
      'imaging:read',
      'imaging:write',
    ],
    ...overrides,
  });

export const createReceptionistUser = (overrides?: Partial<CurrentUser>): CurrentUser =>
  createCurrentUserFixture({
    roles: ['receptionist'],
    permissions: [
      'scheduling:read',
      'scheduling:write',
      'patient:read',
      'billing:read',
    ],
    ...overrides,
  });

export const createAdminUser = (overrides?: Partial<CurrentUser>): CurrentUser =>
  createCurrentUserFixture({
    roles: ['admin', 'dentist'],
    permissions: ['*'], // All permissions
    ...overrides,
  });

/**
 * Create JWT payload fixture
 */
export interface JwtPayload {
  sub: UUID;
  email: string;
  organizationId: OrganizationId;
  cabinetId?: UUID;
  sessionId?: UUID;
  roles?: string[];
  subscription?: {
    id: UUID;
    status: string;
    modules: ModuleCode[];
    isTrial?: boolean;
    trialEndsAt?: Date;
  };
  iat?: number;
  exp?: number;
}

export const createJwtPayload = (overrides?: Partial<JwtPayload>): JwtPayload => {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: generateUserId(),
    email: 'test@example.com',
    organizationId: generateOrgId(),
    cabinetId: generateCabinetId(),
    sessionId: generateSessionId(),
    roles: ['user'],
    subscription: {
      id: generateSubscriptionId(),
      status: 'ACTIVE',
      modules: CORE_MODULES,
    },
    iat: now,
    exp: now + 3600, // 1 hour
    ...overrides,
  };
};

/**
 * Create multiple cabinets for multi-cabinet scenarios
 */
export const createMultipleCabinets = (
  count: number,
  organizationId: OrganizationId,
  userId: UUID
): CabinetSummary[] => {
  const cabinets: CabinetSummary[] = [];

  for (let i = 0; i < count; i++) {
    cabinets.push(
      createCabinetFixture({
        id: generateCabinetId(i.toString()),
        organizationId,
        ownerId: userId,
        name: `Clinic ${i + 1}`,
        code: `CAB-${(i + 1).toString().padStart(3, '0')}`,
        isDefault: i === 0,
      })
    );
  }

  return cabinets;
};

/**
 * Create user-cabinet relationships for multiple cabinets
 */
export const createUserCabinetRelationships = (
  userId: UUID,
  cabinets: CabinetSummary[]
): UserCabinet[] => {
  return cabinets.map((cabinet, index) =>
    createUserCabinetFixture({
      id: generateTestUuid(`uc-${index}`),
      userId,
      cabinetId: cabinet.id,
      organizationId: cabinet.organizationId,
      isPrimary: index === 0, // First is primary
      isActive: true,
    })
  );
};

/**
 * Create subscription for each cabinet
 */
export const createSubscriptionsForCabinets = (
  cabinets: CabinetSummary[]
): SubscriptionSummary[] => {
  return cabinets.map((cabinet, index) => {
    const isTrial = index % 3 === 1; // Every 3rd is trial
    const isExpired = index % 5 === 4; // Every 5th is expired

    if (isExpired) {
      return createExpiredSubscription({
        cabinetId: cabinet.id,
        organizationId: cabinet.organizationId,
      });
    }

    if (isTrial) {
      return createTrialSubscription({
        cabinetId: cabinet.id,
        organizationId: cabinet.organizationId,
      });
    }

    return createActiveSubscription({
      cabinetId: cabinet.id,
      organizationId: cabinet.organizationId,
    });
  });
};

/**
 * Test scenario builders
 */

/**
 * Build single cabinet scenario
 */
export const buildSingleCabinetScenario = () => {
  const organizationId = generateOrgId('01');
  const userId = generateUserId('01');
  const cabinet = createCabinetFixture({
    id: generateCabinetId('01'),
    organizationId,
    ownerId: userId,
  });
  const subscription = createActiveSubscription({
    cabinetId: cabinet.id,
    organizationId,
  });
  const userCabinet = createUserCabinetFixture({
    userId,
    cabinetId: cabinet.id,
    organizationId,
    isPrimary: true,
  });
  const user = createCurrentUserFixture({
    userId,
    organizationId,
  });

  return { organizationId, userId, cabinet, subscription, userCabinet, user };
};

/**
 * Build multiple cabinets scenario
 */
export const buildMultipleCabinetsScenario = (cabinetCount: number = 3) => {
  const organizationId = generateOrgId('01');
  const userId = generateUserId('01');
  const cabinets = createMultipleCabinets(cabinetCount, organizationId, userId);
  const subscriptions = createSubscriptionsForCabinets(cabinets);
  const userCabinets = createUserCabinetRelationships(userId, cabinets);
  const user = createCurrentUserFixture({
    userId,
    organizationId,
  });

  return { organizationId, userId, cabinets, subscriptions, userCabinets, user };
};

/**
 * Build cross-organization isolation scenario
 */
export const buildCrossOrgScenario = () => {
  const org1 = generateOrgId('01');
  const org2 = generateOrgId('02');
  const user1 = generateUserId('01');
  const user2 = generateUserId('02');

  const cabinet1 = createCabinetFixture({
    id: generateCabinetId('01'),
    organizationId: org1,
    ownerId: user1,
  });

  const cabinet2 = createCabinetFixture({
    id: generateCabinetId('02'),
    organizationId: org2,
    ownerId: user2,
  });

  const subscription1 = createActiveSubscription({
    cabinetId: cabinet1.id,
    organizationId: org1,
  });

  const subscription2 = createActiveSubscription({
    cabinetId: cabinet2.id,
    organizationId: org2,
  });

  return {
    org1,
    org2,
    user1,
    user2,
    cabinet1,
    cabinet2,
    subscription1,
    subscription2,
  };
};

/**
 * Build expired subscription scenario
 */
export const buildExpiredSubscriptionScenario = () => {
  const organizationId = generateOrgId('01');
  const userId = generateUserId('01');
  const cabinet = createCabinetFixture({
    id: generateCabinetId('01'),
    organizationId,
    ownerId: userId,
  });
  const subscription = createExpiredSubscription({
    cabinetId: cabinet.id,
    organizationId,
  });
  const userCabinet = createUserCabinetFixture({
    userId,
    cabinetId: cabinet.id,
    organizationId,
  });
  const user = createCurrentUserFixture({
    userId,
    organizationId,
    subscription: {
      id: subscription.id,
      status: SubscriptionStatus.EXPIRED,
      modules: [],
    },
  });

  return { organizationId, userId, cabinet, subscription, userCabinet, user };
};

/**
 * Build premium subscription scenario
 */
export const buildPremiumSubscriptionScenario = () => {
  const organizationId = generateOrgId('01');
  const userId = generateUserId('01');
  const cabinet = createCabinetFixture({
    id: generateCabinetId('01'),
    organizationId,
    ownerId: userId,
  });
  const subscription = createPremiumSubscription({
    cabinetId: cabinet.id,
    organizationId,
  });
  const userCabinet = createUserCabinetFixture({
    userId,
    cabinetId: cabinet.id,
    organizationId,
  });
  const user = createCurrentUserFixture({
    userId,
    organizationId,
    subscription: {
      id: subscription.id,
      status: SubscriptionStatus.ACTIVE,
      modules: ALL_MODULES,
    },
  });

  return { organizationId, userId, cabinet, subscription, userCabinet, user };
};
