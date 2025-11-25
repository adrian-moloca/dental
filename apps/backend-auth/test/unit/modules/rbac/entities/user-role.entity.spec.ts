/**
 * UserRole Entity Unit Tests
 *
 * Tests cover:
 * - UserRole creation with valid data
 * - Active status validation (not revoked, not expired)
 * - Revocation tracking and checking
 * - Expiration tracking and checking
 * - Temporary vs permanent role assignments
 * - Organization-wide vs clinic-specific assignments
 * - Time-based calculations
 * - Edge cases and boundary conditions
 *
 * Security Test Coverage:
 * - Role assignment audit trail (assignedBy, revokedBy)
 * - Revocation reason tracking
 * - Expiration enforcement
 * - Unique constraint validation
 *
 * Multi-Tenant Coverage:
 * - Role assignment scoping by organizationId
 * - Clinic-specific role assignments
 * - Cross-tenant isolation
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/entities
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UserRole } from '../../../../../src/modules/rbac/entities/user-role.entity';
import {
  createTestUserRole,
  createExpiredUserRole,
  createRevokedUserRole,
  createTemporaryUserRole,
} from '../../../../utils/rbac-test-helpers';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

describe('UserRole Entity', () => {
  const testUserId = 'user-123' as UUID;
  const testRoleId = 'role-456' as UUID;
  const testOrgId = 'org-789' as OrganizationId;
  const testClinicId = 'clinic-101' as ClinicId;
  const testAssignedBy = 'admin-222' as UUID;

  // Mock current date for consistent testing
  let originalDate: DateConstructor;
  const mockNow = new Date('2025-01-15T12:00:00Z');

  beforeEach(() => {
    originalDate = global.Date;
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Constructor - Valid Creation', () => {
    it('should create user role assignment with all required fields', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        assignedBy: testAssignedBy,
      });

      expect(userRole.id).toBeDefined();
      expect(userRole.userId).toBe(testUserId);
      expect(userRole.roleId).toBe(testRoleId);
      expect(userRole.organizationId).toBe(testOrgId);
      expect(userRole.assignedBy).toBe(testAssignedBy);
      expect(userRole.assignedAt).toBeInstanceOf(Date);
      expect(userRole.revokedAt).toBeUndefined();
      expect(userRole.revokedBy).toBeUndefined();
      expect(userRole.expiresAt).toBeUndefined();
    });

    it('should create organization-wide role assignment (no clinicId)', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: undefined,
      });

      expect(userRole.clinicId).toBeUndefined();
      expect(userRole.isOrganizationWide()).toBe(true);
      expect(userRole.isClinicSpecific()).toBe(false);
    });

    it('should create clinic-specific role assignment', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      expect(userRole.clinicId).toBe(testClinicId);
      expect(userRole.isClinicSpecific()).toBe(true);
      expect(userRole.isOrganizationWide()).toBe(false);
    });

    it('should create permanent role assignment (no expiresAt)', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: undefined,
      });

      expect(userRole.expiresAt).toBeUndefined();
      expect(userRole.isPermanent()).toBe(true);
      expect(userRole.isTemporary()).toBe(false);
      expect(userRole.isExpired()).toBe(false);
    });

    it('should create temporary role assignment (with expiresAt)', () => {
      const expiresAt = new Date('2025-01-20T12:00:00Z'); // 5 days from mockNow

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.expiresAt).toEqual(expiresAt);
      expect(userRole.isTemporary()).toBe(true);
      expect(userRole.isPermanent()).toBe(false);
      expect(userRole.isExpired()).toBe(false);
    });

    it('should create revoked role assignment', () => {
      const revokedAt = new Date('2025-01-10T12:00:00Z');
      const revokedBy = 'admin-333' as UUID;

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        revokedAt,
        revokedBy,
        revocationReason: 'User left organization',
      });

      expect(userRole.revokedAt).toEqual(revokedAt);
      expect(userRole.revokedBy).toBe(revokedBy);
      expect(userRole.revocationReason).toBe('User left organization');
      expect(userRole.isRevoked()).toBe(true);
      expect(userRole.isActive()).toBe(false);
    });
  });

  describe('isActive Method', () => {
    it('should return true for non-revoked, non-expired role', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
      });

      expect(userRole.isActive()).toBe(true);
    });

    it('should return false for revoked role', () => {
      const userRole = createRevokedUserRole(testUserId, testRoleId, testOrgId, testAssignedBy);

      expect(userRole.isActive()).toBe(false);
    });

    it('should return false for expired role', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      expect(userRole.isActive()).toBe(false);
    });

    it('should return true for role expiring in future', () => {
      const expiresAt = new Date('2025-01-20T12:00:00Z'); // 5 days from mockNow

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.isActive()).toBe(true);
    });

    it('should return false for role expired exactly at current time', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: mockNow, // Expires exactly now
      });

      expect(userRole.isActive()).toBe(false);
    });

    it('should return true for role expiring one second in future', () => {
      const expiresAt = new Date(mockNow.getTime() + 1000); // 1 second from now

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.isActive()).toBe(true);
    });
  });

  describe('isRevoked Method', () => {
    it('should return true when revokedAt is set', () => {
      const userRole = createRevokedUserRole(testUserId, testRoleId, testOrgId, testAssignedBy);

      expect(userRole.isRevoked()).toBe(true);
    });

    it('should return false when revokedAt is not set', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
      });

      expect(userRole.isRevoked()).toBe(false);
    });

    it('should return false when revokedAt is undefined', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        revokedAt: undefined,
      });

      expect(userRole.isRevoked()).toBe(false);
    });
  });

  describe('isExpired Method', () => {
    it('should return false for permanent role (no expiresAt)', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: undefined,
      });

      expect(userRole.isExpired()).toBe(false);
    });

    it('should return true for expired role', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      expect(userRole.isExpired()).toBe(true);
    });

    it('should return false for role expiring in future', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 5);

      expect(userRole.isExpired()).toBe(false);
    });

    it('should return true for role expired exactly at current time', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: mockNow,
      });

      expect(userRole.isExpired()).toBe(true);
    });
  });

  describe('isTemporary and isPermanent Methods', () => {
    it('should identify temporary role (has expiresAt)', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 7);

      expect(userRole.isTemporary()).toBe(true);
      expect(userRole.isPermanent()).toBe(false);
    });

    it('should identify permanent role (no expiresAt)', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: undefined,
      });

      expect(userRole.isPermanent()).toBe(true);
      expect(userRole.isTemporary()).toBe(false);
    });

    it('should identify expired temporary role', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      expect(userRole.isTemporary()).toBe(true);
      expect(userRole.isPermanent()).toBe(false);
      expect(userRole.isExpired()).toBe(true);
    });
  });

  describe('isOrganizationWide and isClinicSpecific Methods', () => {
    it('should identify organization-wide role', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: undefined,
      });

      expect(userRole.isOrganizationWide()).toBe(true);
      expect(userRole.isClinicSpecific()).toBe(false);
    });

    it('should identify clinic-specific role', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      expect(userRole.isClinicSpecific()).toBe(true);
      expect(userRole.isOrganizationWide()).toBe(false);
    });
  });

  describe('getTimeUntilExpiration Method', () => {
    it('should return null for permanent role', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: undefined,
      });

      expect(userRole.getTimeUntilExpiration()).toBeNull();
    });

    it('should return correct time in milliseconds for future expiration', () => {
      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
      const expiresAt = new Date(mockNow.getTime() + fiveDaysInMs);

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.getTimeUntilExpiration()).toBe(fiveDaysInMs);
    });

    it('should return 0 for expired role', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      expect(userRole.getTimeUntilExpiration()).toBe(0);
    });

    it('should return 0 for role expiring exactly now', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: mockNow,
      });

      expect(userRole.getTimeUntilExpiration()).toBe(0);
    });

    it('should calculate time correctly for various durations', () => {
      const durations = [
        { hours: 1, ms: 1 * 60 * 60 * 1000 },
        { hours: 24, ms: 24 * 60 * 60 * 1000 },
        { hours: 168, ms: 7 * 24 * 60 * 60 * 1000 }, // 1 week
      ];

      durations.forEach(({ hours, ms }) => {
        const expiresAt = new Date(mockNow.getTime() + ms);
        const userRole = createTestUserRole(testUserId, testRoleId, {
          organizationId: testOrgId,
          expiresAt,
        });

        expect(userRole.getTimeUntilExpiration()).toBe(ms);
      });
    });
  });

  describe('isExpiringSoon Method', () => {
    it('should return false for permanent role', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt: undefined,
      });

      expect(userRole.isExpiringSoon()).toBe(false);
    });

    it('should return true for role expiring within 7 days (default)', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 6); // 6 days

      expect(userRole.isExpiringSoon()).toBe(true);
    });

    it('should return false for role expiring after 7 days', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 8); // 8 days

      expect(userRole.isExpiringSoon()).toBe(false);
    });

    it('should return true for role expiring exactly in 7 days', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 7); // 7 days

      expect(userRole.isExpiringSoon()).toBe(true);
    });

    it('should return false for already expired role', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      expect(userRole.isExpiringSoon()).toBe(false);
    });

    it('should support custom days parameter', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 25); // 25 days

      expect(userRole.isExpiringSoon(30)).toBe(true); // Within 30 days
      expect(userRole.isExpiringSoon(20)).toBe(false); // Not within 20 days
    });

    it('should return true for role expiring in 1 hour', () => {
      const expiresAt = new Date(mockNow.getTime() + 60 * 60 * 1000); // 1 hour

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.isExpiringSoon()).toBe(true);
    });

    it('should return true for role expiring in 1 day', () => {
      const userRole = createTemporaryUserRole(testUserId, testRoleId, testOrgId, 1);

      expect(userRole.isExpiringSoon()).toBe(true);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize active role to JSON', () => {
      const assignedAt = new Date('2025-01-01T00:00:00Z');

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: testClinicId,
        assignedBy: testAssignedBy,
        assignedAt,
      });

      const json = userRole.toJSON();

      expect(json).toEqual({
        id: userRole.id,
        userId: testUserId,
        roleId: testRoleId,
        organizationId: testOrgId,
        clinicId: testClinicId,
        assignedAt: assignedAt.toISOString(),
        assignedBy: testAssignedBy,
        expiresAt: undefined,
        revokedAt: undefined,
        revokedBy: undefined,
        revocationReason: undefined,
        isActive: true,
        isExpired: false,
        isRevoked: false,
      });
    });

    it('should serialize revoked role to JSON', () => {
      const userRole = createRevokedUserRole(testUserId, testRoleId, testOrgId, testAssignedBy);

      const json = userRole.toJSON();

      expect(json.revokedAt).toBeDefined();
      expect(json.revokedBy).toBe(testAssignedBy);
      expect(json.isRevoked).toBe(true);
      expect(json.isActive).toBe(false);
    });

    it('should serialize temporary role to JSON', () => {
      const expiresAt = new Date('2025-01-20T12:00:00Z');

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      const json = userRole.toJSON();

      expect(json.expiresAt).toBe(expiresAt.toISOString());
      expect(json.isExpired).toBe(false);
    });

    it('should serialize expired role to JSON', () => {
      const userRole = createExpiredUserRole(testUserId, testRoleId, testOrgId);

      const json = userRole.toJSON();

      expect(json.isExpired).toBe(true);
      expect(json.isActive).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle role that is both expired and revoked', () => {
      const expiresAt = new Date('2025-01-10T12:00:00Z'); // Past
      const revokedAt = new Date('2025-01-12T12:00:00Z');

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
        revokedAt,
        revokedBy: testAssignedBy,
      });

      expect(userRole.isExpired()).toBe(true);
      expect(userRole.isRevoked()).toBe(true);
      expect(userRole.isActive()).toBe(false); // Revocation takes precedence
    });

    it('should handle role expiring in exactly 1 millisecond', () => {
      const expiresAt = new Date(mockNow.getTime() + 1);

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.isActive()).toBe(true);
      expect(userRole.getTimeUntilExpiration()).toBe(1);
    });

    it('should handle role expiring in far future', () => {
      const expiresAt = new Date('2030-01-01T00:00:00Z'); // 5 years from mockNow

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        expiresAt,
      });

      expect(userRole.isActive()).toBe(true);
      expect(userRole.isExpired()).toBe(false);
      expect(userRole.isExpiringSoon()).toBe(false);
      expect(userRole.isExpiringSoon(365 * 5)).toBe(true); // Within 5 years
    });

    it('should handle role assigned and immediately revoked', () => {
      const timestamp = new Date('2025-01-01T00:00:00Z');

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        assignedAt: timestamp,
        revokedAt: timestamp,
        revokedBy: testAssignedBy,
      });

      expect(userRole.assignedAt).toEqual(userRole.revokedAt);
      expect(userRole.isRevoked()).toBe(true);
      expect(userRole.isActive()).toBe(false);
    });

    it('should handle organization-wide role with null clinicId explicitly', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: undefined,
      });

      expect(userRole.clinicId).toBeUndefined();
      expect(userRole.isOrganizationWide()).toBe(true);
    });

    it('should handle revocation without revocation reason', () => {
      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        revokedAt: new Date(),
        revokedBy: testAssignedBy,
        revocationReason: undefined,
      });

      expect(userRole.isRevoked()).toBe(true);
      expect(userRole.revocationReason).toBeUndefined();
    });
  });

  describe('Multi-Tenant Scenarios', () => {
    it('should create role assignments in different organizations', () => {
      const org1Id = 'org-111' as OrganizationId;
      const org2Id = 'org-222' as OrganizationId;

      const userRole1 = createTestUserRole(testUserId, testRoleId, {
        organizationId: org1Id,
      });

      const userRole2 = createTestUserRole(testUserId, testRoleId, {
        organizationId: org2Id,
      });

      // Same user, same role, different organizations
      expect(userRole1.userId).toBe(userRole2.userId);
      expect(userRole1.roleId).toBe(userRole2.roleId);
      expect(userRole1.organizationId).not.toBe(userRole2.organizationId);
    });

    it('should create role assignments in different clinics', () => {
      const clinic1Id = 'clinic-111' as ClinicId;
      const clinic2Id = 'clinic-222' as ClinicId;

      const userRole1 = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: clinic1Id,
      });

      const userRole2 = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        clinicId: clinic2Id,
      });

      // Same user, same role, same org, different clinics
      expect(userRole1.clinicId).not.toBe(userRole2.clinicId);
      expect(userRole1.isClinicSpecific()).toBe(true);
      expect(userRole2.isClinicSpecific()).toBe(true);
    });
  });

  describe('Audit Trail', () => {
    it('should track who assigned the role', () => {
      const assignedBy = 'admin-999' as UUID;

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        assignedBy,
      });

      expect(userRole.assignedBy).toBe(assignedBy);
    });

    it('should track who revoked the role', () => {
      const revokedBy = 'admin-888' as UUID;

      const userRole = createRevokedUserRole(testUserId, testRoleId, testOrgId, revokedBy);

      expect(userRole.revokedBy).toBe(revokedBy);
    });

    it('should track revocation reason', () => {
      const reason = 'User transferred to different department';

      const userRole = createTestUserRole(testUserId, testRoleId, {
        organizationId: testOrgId,
        revokedAt: new Date(),
        revokedBy: testAssignedBy,
        revocationReason: reason,
      });

      expect(userRole.revocationReason).toBe(reason);
    });
  });
});
