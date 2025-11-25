/**
 * Test Data Factory
 *
 * Factory functions for creating test data with realistic values.
 * Supports multi-tenant scenarios and edge cases.
 */

import { v4 as uuidv4 } from 'uuid';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { EntityStatus } from '@dentalos/shared-types';
import {
  Subscription,
  SubscriptionStatus,
  BillingCycle,
} from '../../src/modules/subscriptions/entities/subscription.entity';
import { Cabinet } from '../../src/modules/cabinets/entities/cabinet.entity';
import type { CreateCabinetDto } from '../../src/modules/cabinets/dto';
import type { CreateSubscriptionDto } from '../../src/modules/subscriptions/dto/create-subscription.dto';

/**
 * Test organization IDs for multi-tenant scenarios
 */
export const TEST_ORG_1 = 'org-test-1' as OrganizationId;
export const TEST_ORG_2 = 'org-test-2' as OrganizationId;
export const TEST_ORG_3 = 'org-test-3' as OrganizationId;

/**
 * Test user IDs
 */
export const TEST_USER_1 = uuidv4() as UUID;
export const TEST_USER_2 = uuidv4() as UUID;

/**
 * Core module IDs (matching service mock data)
 */
export const CORE_MODULE_IDS = {
  SCHEDULING: '11111111-1111-1111-1111-111111111111' as UUID,
  PATIENT360: '22222222-2222-2222-2222-222222222222' as UUID,
  CLINICAL: '33333333-3333-3333-3333-333333333333' as UUID,
  BILLING: '44444444-4444-4444-4444-444444444444' as UUID,
};

/**
 * Create test cabinet data
 */
export function createCabinetDto(
  overrides?: Partial<CreateCabinetDto>,
): CreateCabinetDto {
  return {
    name: 'Test Dental Cabinet',
    code: `CAB-${Date.now()}`,
    isDefault: false,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1-555-0100',
    email: 'cabinet@test.com',
    settings: {
      timezone: 'America/New_York',
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
    },
    ...overrides,
  };
}

/**
 * Create test subscription data
 */
export function createSubscriptionDto(
  cabinetId: UUID,
  overrides?: Partial<CreateSubscriptionDto>,
): CreateSubscriptionDto {
  return {
    cabinetId,
    billingCycle: BillingCycle.MONTHLY,
    autoStartTrial: true,
    currency: 'USD',
    ...overrides,
  };
}

/**
 * Create multiple cabinets for multi-tenant testing
 */
export function createMultiTenantCabinets() {
  return {
    org1Cabinet1: createCabinetDto({
      name: 'Org 1 - Main Office',
      code: 'ORG1-CAB1',
      isDefault: true,
    }),
    org1Cabinet2: createCabinetDto({
      name: 'Org 1 - Branch Office',
      code: 'ORG1-CAB2',
      isDefault: false,
    }),
    org2Cabinet1: createCabinetDto({
      name: 'Org 2 - Downtown',
      code: 'ORG2-CAB1',
      isDefault: true,
    }),
    org2Cabinet2: createCabinetDto({
      name: 'Org 2 - Uptown',
      code: 'ORG2-CAB2',
      isDefault: false,
    }),
  };
}

/**
 * Create subscription test scenarios
 */
export function createSubscriptionScenarios(cabinetId: UUID) {
  return {
    trialMonthly: createSubscriptionDto(cabinetId, {
      billingCycle: BillingCycle.MONTHLY,
      autoStartTrial: true,
    }),
    trialYearly: createSubscriptionDto(cabinetId, {
      billingCycle: BillingCycle.YEARLY,
      autoStartTrial: true,
    }),
    noTrial: createSubscriptionDto(cabinetId, {
      autoStartTrial: false,
    }),
  };
}

/**
 * Create edge case test data
 */
export function createEdgeCases() {
  return {
    longName: createCabinetDto({
      name: 'A'.repeat(250),
    }),
    minimalData: createCabinetDto({
      name: 'Minimal Cabinet',
      code: undefined,
      address: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
      country: undefined,
      phone: undefined,
      email: undefined,
      settings: undefined,
    }),
    specialCharacters: createCabinetDto({
      name: 'Café Dentaire & Specialists',
      code: 'CAB-ÜÑÏ',
      address: '123 Straße, Apt #5-B',
    }),
  };
}

/**
 * Wait for a specific time (for testing time-based logic)
 */
export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create date in the past
 */
export function pastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

/**
 * Create date in the future
 */
export function futureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
}
