/**
 * RolePermission Entity Unit Tests
 *
 * Tests cover:
 * - RolePermission creation with valid data
 * - Organization scoping validation
 * - Age calculation in days
 * - Recently granted permission checking
 * - Audit trail tracking
 * - Edge cases and boundary conditions
 *
 * Security Test Coverage:
 * - Permission grant audit trail (grantedBy)
 * - Organization ID denormalization
 * - Unique constraint validation (roleId, permissionId)
 *
 * Multi-Tenant Coverage:
 * - Role permission scoping by organizationId
 * - Cross-tenant isolation verification
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/entities
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RolePermission } from '../../../../../src/modules/rbac/entities/role-permission.entity';
import { createTestRolePermission } from '../../../../utils/rbac-test-helpers';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

describe('RolePermission Entity', () => {
  const testRoleId = 'role-123' as UUID;
  const testPermissionId = 'perm-456' as UUID;
  const testOrgId = 'org-789' as OrganizationId;
  const testGrantedBy = 'admin-222' as UUID;

  // Mock current date for consistent testing
  const mockNow = new Date('2025-01-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Constructor - Valid Creation', () => {
    it('should create role permission with all required fields', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedBy: testGrantedBy,
      });

      expect(rolePermission.id).toBeDefined();
      expect(rolePermission.roleId).toBe(testRoleId);
      expect(rolePermission.permissionId).toBe(testPermissionId);
      expect(rolePermission.organizationId).toBe(testOrgId);
      expect(rolePermission.grantedBy).toBe(testGrantedBy);
      expect(rolePermission.grantedAt).toBeInstanceOf(Date);
    });

    it('should create role permission with specific granted timestamp', () => {
      const grantedAt = new Date('2025-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt,
      });

      expect(rolePermission.grantedAt).toEqual(grantedAt);
    });

    it('should create role permission with current timestamp by default', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      expect(rolePermission.grantedAt).toBeInstanceOf(Date);
    });
  });

  describe('belongsToOrganization Method', () => {
    it('should return true for matching organizationId', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      expect(rolePermission.belongsToOrganization(testOrgId)).toBe(true);
    });

    it('should return false for non-matching organizationId', () => {
      const otherOrgId = 'org-999' as OrganizationId;

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      expect(rolePermission.belongsToOrganization(otherOrgId)).toBe(false);
    });

    it('should be case-sensitive for organizationId', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      // Different casing should not match
      expect(rolePermission.belongsToOrganization(testOrgId.toUpperCase() as OrganizationId)).toBe(false);
    });
  });

  describe('getAgeInDays Method', () => {
    it('should return 0 days for permission granted today', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: mockNow,
      });

      expect(rolePermission.getAgeInDays()).toBe(0);
    });

    it('should return 1 day for permission granted yesterday', () => {
      const yesterday = new Date(mockNow);
      yesterday.setDate(yesterday.getDate() - 1);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: yesterday,
      });

      expect(rolePermission.getAgeInDays()).toBe(1);
    });

    it('should return 7 days for permission granted a week ago', () => {
      const weekAgo = new Date(mockNow);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: weekAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(7);
    });

    it('should return 30 days for permission granted a month ago', () => {
      const monthAgo = new Date(mockNow);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: monthAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(30);
    });

    it('should return 365 days for permission granted a year ago', () => {
      const yearAgo = new Date(mockNow);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: yearAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(365);
    });

    it('should floor partial days correctly', () => {
      const twelveHoursAgo = new Date(mockNow.getTime() - 12 * 60 * 60 * 1000);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: twelveHoursAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(0); // Should floor to 0
    });

    it('should handle permission granted 23 hours 59 minutes ago', () => {
      const almostOneDayAgo = new Date(mockNow.getTime() - 23 * 60 * 60 * 1000 - 59 * 60 * 1000);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: almostOneDayAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(0); // Should floor to 0
    });

    it('should handle permission granted exactly 24 hours ago', () => {
      const exactlyOneDayAgo = new Date(mockNow.getTime() - 24 * 60 * 60 * 1000);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: exactlyOneDayAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(1);
    });
  });

  describe('isRecentlyGranted Method', () => {
    it('should return true for permission granted today (default 7 days)', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: mockNow,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(true);
    });

    it('should return true for permission granted 3 days ago (default 7 days)', () => {
      const threeDaysAgo = new Date(mockNow);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: threeDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(true);
    });

    it('should return true for permission granted exactly 7 days ago (default 7 days)', () => {
      const sevenDaysAgo = new Date(mockNow);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: sevenDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(true);
    });

    it('should return false for permission granted 8 days ago (default 7 days)', () => {
      const eightDaysAgo = new Date(mockNow);
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: eightDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(false);
    });

    it('should return false for permission granted 30 days ago (default 7 days)', () => {
      const thirtyDaysAgo = new Date(mockNow);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: thirtyDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(false);
    });

    it('should support custom days parameter', () => {
      const fiveDaysAgo = new Date(mockNow);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: fiveDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted(7)).toBe(true); // Within 7 days
      expect(rolePermission.isRecentlyGranted(3)).toBe(false); // Not within 3 days
      expect(rolePermission.isRecentlyGranted(10)).toBe(true); // Within 10 days
    });

    it('should return true for permission granted 1 hour ago', () => {
      const oneHourAgo = new Date(mockNow.getTime() - 60 * 60 * 1000);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: oneHourAgo,
      });

      expect(rolePermission.isRecentlyGranted()).toBe(true);
    });

    it('should handle custom parameter of 1 day', () => {
      const twoDaysAgo = new Date(mockNow);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: twoDaysAgo,
      });

      expect(rolePermission.isRecentlyGranted(1)).toBe(false);
      expect(rolePermission.isRecentlyGranted(3)).toBe(true);
    });

    it('should handle custom parameter of 0 days', () => {
      const oneHourAgo = new Date(mockNow.getTime() - 60 * 60 * 1000);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: oneHourAgo,
      });

      expect(rolePermission.isRecentlyGranted(0)).toBe(true); // 0 days means "same day"
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize role permission to JSON with all fields', () => {
      const grantedAt = new Date('2025-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedBy: testGrantedBy,
        grantedAt,
      });

      const json = rolePermission.toJSON();

      expect(json).toEqual({
        id: rolePermission.id,
        roleId: testRoleId,
        permissionId: testPermissionId,
        organizationId: testOrgId,
        grantedAt: grantedAt.toISOString(),
        grantedBy: testGrantedBy,
      });
    });

    it('should serialize recently granted permission', () => {
      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: mockNow,
      });

      const json = rolePermission.toJSON();

      expect(json.grantedAt).toBe(mockNow.toISOString());
    });

    it('should serialize old permission grant', () => {
      const longAgo = new Date('2020-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: longAgo,
      });

      const json = rolePermission.toJSON();

      expect(json.grantedAt).toBe(longAgo.toISOString());
    });
  });

  describe('Edge Cases', () => {
    it('should handle permission granted in the future', () => {
      const future = new Date('2026-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: future,
      });

      // Age should be negative (but Math.floor will handle it)
      const age = rolePermission.getAgeInDays();
      expect(age).toBeLessThan(0);
      expect(rolePermission.isRecentlyGranted()).toBe(true); // Technically "recent"
    });

    it('should handle same role receiving same permission multiple times (should be prevented by unique constraint)', () => {
      const rolePermission1 = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      const rolePermission2 = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
      });

      // Same roleId and permissionId - unique constraint should prevent this in DB
      expect(rolePermission1.roleId).toBe(rolePermission2.roleId);
      expect(rolePermission1.permissionId).toBe(rolePermission2.permissionId);
      expect(rolePermission1.id).not.toBe(rolePermission2.id); // Different IDs
    });

    it('should handle permission granted at exact millisecond precision', () => {
      const preciseTime = new Date('2025-01-15T12:00:00.123Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: preciseTime,
      });

      expect(rolePermission.grantedAt.getMilliseconds()).toBe(123);
    });

    it('should handle very old permission grant', () => {
      const veryOld = new Date('2000-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: veryOld,
      });

      const ageInDays = rolePermission.getAgeInDays();
      expect(ageInDays).toBeGreaterThan(9000); // More than 25 years
      expect(rolePermission.isRecentlyGranted()).toBe(false);
      expect(rolePermission.isRecentlyGranted(10000)).toBe(true); // Within 10000 days
    });
  });

  describe('Multi-Tenant Scenarios', () => {
    it('should create role permissions in different organizations', () => {
      const org1Id = 'org-111' as OrganizationId;
      const org2Id = 'org-222' as OrganizationId;

      const rolePermission1 = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: org1Id,
      });

      const rolePermission2 = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: org2Id,
      });

      // Same role and permission, different organizations
      expect(rolePermission1.roleId).toBe(rolePermission2.roleId);
      expect(rolePermission1.permissionId).toBe(rolePermission2.permissionId);
      expect(rolePermission1.organizationId).not.toBe(rolePermission2.organizationId);
      expect(rolePermission1.belongsToOrganization(org1Id)).toBe(true);
      expect(rolePermission2.belongsToOrganization(org2Id)).toBe(true);
    });

    it('should ensure organization scoping for different roles', () => {
      const role1Id = 'role-111' as UUID;
      const role2Id = 'role-222' as UUID;

      const rolePermission1 = createTestRolePermission(role1Id, testPermissionId, {
        organizationId: testOrgId,
      });

      const rolePermission2 = createTestRolePermission(role2Id, testPermissionId, {
        organizationId: testOrgId,
      });

      // Different roles, same permission, same organization
      expect(rolePermission1.roleId).not.toBe(rolePermission2.roleId);
      expect(rolePermission1.permissionId).toBe(rolePermission2.permissionId);
      expect(rolePermission1.organizationId).toBe(rolePermission2.organizationId);
    });

    it('should verify organization isolation', () => {
      const org1Id = 'org-111' as OrganizationId;
      const org2Id = 'org-222' as OrganizationId;

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: org1Id,
      });

      expect(rolePermission.belongsToOrganization(org1Id)).toBe(true);
      expect(rolePermission.belongsToOrganization(org2Id)).toBe(false);
    });
  });

  describe('Audit Trail', () => {
    it('should track who granted the permission', () => {
      const grantedBy = 'admin-999' as UUID;

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedBy,
      });

      expect(rolePermission.grantedBy).toBe(grantedBy);
    });

    it('should track exact timestamp of grant', () => {
      const exactTime = new Date('2025-01-10T14:30:45.678Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: exactTime,
      });

      expect(rolePermission.grantedAt).toEqual(exactTime);
      expect(rolePermission.grantedAt.toISOString()).toBe(exactTime.toISOString());
    });

    it('should maintain audit trail after serialization', () => {
      const grantedBy = 'admin-555' as UUID;
      const grantedAt = new Date('2025-01-01T00:00:00Z');

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedBy,
        grantedAt,
      });

      const json = rolePermission.toJSON();

      expect(json.grantedBy).toBe(grantedBy);
      expect(json.grantedAt).toBe(grantedAt.toISOString());
    });
  });

  describe('Time-Based Calculations', () => {
    it('should calculate age consistently across multiple calls', () => {
      const threeDaysAgo = new Date(mockNow);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: threeDaysAgo,
      });

      const age1 = rolePermission.getAgeInDays();
      const age2 = rolePermission.getAgeInDays();

      expect(age1).toBe(age2);
      expect(age1).toBe(3);
    });

    it('should handle leap year calculations', () => {
      // Set mock time to leap year
      const leapYearDate = new Date('2024-02-29T12:00:00Z');
      vi.setSystemTime(leapYearDate);

      const oneYearAgo = new Date(leapYearDate);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const rolePermission = createTestRolePermission(testRoleId, testPermissionId, {
        organizationId: testOrgId,
        grantedAt: oneYearAgo,
      });

      expect(rolePermission.getAgeInDays()).toBe(366); // Leap year
    });
  });
});
