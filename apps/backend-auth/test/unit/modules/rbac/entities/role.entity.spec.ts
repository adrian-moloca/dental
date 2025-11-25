/**
 * Role Entity Unit Tests
 *
 * Tests cover:
 * - Role creation with valid data
 * - Role name validation (^[a-z_]+$ pattern)
 * - System role identification and protection
 * - Role modification/deletion validation
 * - Organization-wide vs clinic-specific roles
 * - Helper method functionality
 * - Edge cases and boundary conditions
 *
 * Security Test Coverage:
 * - System roles cannot be modified
 * - System roles cannot be deleted
 * - Role name format validation
 * - Unique constraint enforcement (name, organizationId, clinicId)
 *
 * Multi-Tenant Coverage:
 * - Role scoping by organizationId
 * - Clinic-specific role scoping
 * - Organization-wide role behavior
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/entities
 */

import { describe, it, expect } from 'vitest';
import { Role, SystemRole } from '../../../../../src/modules/rbac/entities/role.entity';
import { createTestRole, createTestSystemRole } from '../../../../utils/rbac-test-helpers';
import type { OrganizationId, ClinicId, UUID } from '@dentalos/shared-types';

describe('Role Entity', () => {
  const testOrgId = 'org-123' as OrganizationId;
  const testClinicId = 'clinic-456' as ClinicId;

  describe('Constructor - Valid Creation', () => {
    it('should create role with all required fields', () => {
      const role = createTestRole({
        name: 'doctor',
        displayName: 'Doctor',
        description: 'Medical doctor with full clinical access',
        organizationId: testOrgId,
      });

      expect(role.id).toBeDefined();
      expect(role.name).toBe('doctor');
      expect(role.displayName).toBe('Doctor');
      expect(role.description).toBe('Medical doctor with full clinical access');
      expect(role.organizationId).toBe(testOrgId);
      expect(role.isSystem).toBe(false);
      expect(role.isActive).toBe(true);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should create organization-wide role (no clinicId)', () => {
      const role = createTestRole({
        name: 'org_admin',
        organizationId: testOrgId,
        clinicId: undefined,
      });

      expect(role.clinicId).toBeUndefined();
      expect(role.isOrganizationWide()).toBe(true);
      expect(role.isClinicSpecific()).toBe(false);
    });

    it('should create clinic-specific role (with clinicId)', () => {
      const role = createTestRole({
        name: 'clinic_manager',
        organizationId: testOrgId,
        clinicId: testClinicId,
      });

      expect(role.clinicId).toBe(testClinicId);
      expect(role.isClinicSpecific()).toBe(true);
      expect(role.isOrganizationWide()).toBe(false);
    });

    it('should create system role (super_admin)', () => {
      const role = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);

      expect(role.name).toBe(SystemRole.SUPER_ADMIN);
      expect(role.isSystem).toBe(true);
      expect(role.isSystemRole()).toBe(true);
      expect(role.canBeModified()).toBe(false);
      expect(role.canBeDeleted()).toBe(false);
    });

    it('should create system role (tenant_admin)', () => {
      const role = createTestSystemRole(SystemRole.TENANT_ADMIN, testOrgId);

      expect(role.name).toBe(SystemRole.TENANT_ADMIN);
      expect(role.isSystem).toBe(true);
      expect(role.isSystemRole()).toBe(true);
      expect(role.canBeModified()).toBe(false);
      expect(role.canBeDeleted()).toBe(false);
    });

    it('should create soft-deleted role', () => {
      const deletedAt = new Date('2025-01-01T00:00:00Z');
      const role = createTestRole({
        name: 'archived_role',
        organizationId: testOrgId,
        deletedAt,
        isActive: false,
      });

      expect(role.deletedAt).toEqual(deletedAt);
      expect(role.isActive).toBe(false);
      expect(role.canBeModified()).toBe(false); // Deleted roles cannot be modified
    });
  });

  describe('Role Name Validation', () => {
    it('should validate correct role name (lowercase with underscores)', () => {
      const role = createTestRole({ name: 'clinic_manager' });
      expect(role.isValidName()).toBe(true);
    });

    it('should validate role name with only lowercase letters', () => {
      const role = createTestRole({ name: 'doctor' });
      expect(role.isValidName()).toBe(true);
    });

    it('should validate role name with multiple underscores', () => {
      const role = createTestRole({ name: 'senior_clinic_manager' });
      expect(role.isValidName()).toBe(true);
    });

    it('should reject role name with uppercase letters', () => {
      const role = createTestRole({ name: 'Doctor' });
      expect(role.isValidName()).toBe(false);
    });

    it('should reject role name with spaces', () => {
      const role = createTestRole({ name: 'clinic manager' });
      expect(role.isValidName()).toBe(false);
    });

    it('should reject role name with hyphens', () => {
      const role = createTestRole({ name: 'clinic-manager' });
      expect(role.isValidName()).toBe(false);
    });

    it('should reject role name with special characters', () => {
      const role = createTestRole({ name: 'clinic@manager' });
      expect(role.isValidName()).toBe(false);
    });

    it('should reject role name with numbers', () => {
      const role = createTestRole({ name: 'doctor123' });
      expect(role.isValidName()).toBe(false);
    });

    it('should reject empty role name', () => {
      const role = createTestRole({ name: '' });
      expect(role.isValidName()).toBe(false);
    });
  });

  describe('System Role Identification', () => {
    it('should identify super_admin as system role', () => {
      const role = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
      expect(role.isSystemRole()).toBe(true);
    });

    it('should identify tenant_admin as system role', () => {
      const role = createTestSystemRole(SystemRole.TENANT_ADMIN, testOrgId);
      expect(role.isSystemRole()).toBe(true);
    });

    it('should identify custom role as non-system role', () => {
      const role = createTestRole({ name: 'doctor', isSystem: false });
      expect(role.isSystemRole()).toBe(false);
    });

    it('should identify system role by name even if isSystem flag is false', () => {
      const role = createTestRole({
        name: SystemRole.SUPER_ADMIN,
        isSystem: false, // Incorrectly set
      });
      expect(role.isSystemRole()).toBe(true); // Should still be identified as system role
    });

    it('should not identify custom role with similar name as system role', () => {
      const role = createTestRole({ name: 'custom_admin', isSystem: false });
      expect(role.isSystemRole()).toBe(false);
    });
  });

  describe('Role Modification Validation', () => {
    it('should allow modification of custom role', () => {
      const role = createTestRole({
        name: 'doctor',
        isSystem: false,
        deletedAt: undefined,
      });
      expect(role.canBeModified()).toBe(true);
    });

    it('should prevent modification of system role', () => {
      const role = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
      expect(role.canBeModified()).toBe(false);
    });

    it('should prevent modification of deleted role', () => {
      const role = createTestRole({
        name: 'doctor',
        isSystem: false,
        deletedAt: new Date(),
      });
      expect(role.canBeModified()).toBe(false);
    });

    it('should prevent modification of deleted system role', () => {
      const role = createTestRole({
        name: SystemRole.SUPER_ADMIN,
        isSystem: true,
        deletedAt: new Date(),
      });
      expect(role.canBeModified()).toBe(false);
    });
  });

  describe('Role Deletion Validation', () => {
    it('should allow deletion of custom role', () => {
      const role = createTestRole({
        name: 'doctor',
        isSystem: false,
      });
      expect(role.canBeDeleted()).toBe(true);
    });

    it('should prevent deletion of super_admin system role', () => {
      const role = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);
      expect(role.canBeDeleted()).toBe(false);
    });

    it('should prevent deletion of tenant_admin system role', () => {
      const role = createTestSystemRole(SystemRole.TENANT_ADMIN, testOrgId);
      expect(role.canBeDeleted()).toBe(false);
    });

    it('should prevent deletion even if system role is marked inactive', () => {
      const role = createTestRole({
        name: SystemRole.SUPER_ADMIN,
        isSystem: true,
        isActive: false,
      });
      expect(role.canBeDeleted()).toBe(false);
    });
  });

  describe('Organization and Clinic Scoping', () => {
    it('should identify organization-wide role (no clinicId)', () => {
      const role = createTestRole({
        organizationId: testOrgId,
        clinicId: undefined,
      });
      expect(role.isOrganizationWide()).toBe(true);
      expect(role.isClinicSpecific()).toBe(false);
    });

    it('should identify clinic-specific role (with clinicId)', () => {
      const role = createTestRole({
        organizationId: testOrgId,
        clinicId: testClinicId,
      });
      expect(role.isClinicSpecific()).toBe(true);
      expect(role.isOrganizationWide()).toBe(false);
    });

    it('should handle null clinicId as organization-wide', () => {
      const role = createTestRole({
        organizationId: testOrgId,
        clinicId: undefined,
      });
      expect(role.clinicId).toBeUndefined();
      expect(role.isOrganizationWide()).toBe(true);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize role to JSON with all fields', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const updatedAt = new Date('2025-01-02T00:00:00Z');

      const role = createTestRole({
        name: 'doctor',
        displayName: 'Doctor',
        description: 'Medical doctor',
        organizationId: testOrgId,
        clinicId: testClinicId,
        isSystem: false,
        isActive: true,
        createdAt,
        updatedAt,
      });

      const json = role.toJSON();

      expect(json).toEqual({
        id: role.id,
        name: 'doctor',
        displayName: 'Doctor',
        description: 'Medical doctor',
        organizationId: testOrgId,
        clinicId: testClinicId,
        isSystem: false,
        isActive: true,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        deletedAt: undefined,
      });
    });

    it('should serialize role with deletedAt timestamp', () => {
      const deletedAt = new Date('2025-01-03T00:00:00Z');
      const role = createTestRole({
        deletedAt,
      });

      const json = role.toJSON();

      expect(json.deletedAt).toBe(deletedAt.toISOString());
    });

    it('should serialize organization-wide role without clinicId', () => {
      const role = createTestRole({
        organizationId: testOrgId,
        clinicId: undefined,
      });

      const json = role.toJSON();

      expect(json.clinicId).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle role with minimum valid name (single letter)', () => {
      const role = createTestRole({ name: 'a' });
      expect(role.isValidName()).toBe(true);
    });

    it('should handle role with very long valid name', () => {
      const longName = 'a'.repeat(100);
      const role = createTestRole({ name: longName });
      expect(role.isValidName()).toBe(true);
      expect(role.name.length).toBe(100);
    });

    it('should handle role with only underscores', () => {
      const role = createTestRole({ name: '___' });
      expect(role.isValidName()).toBe(true);
    });

    it('should handle role created and updated at same time', () => {
      const timestamp = new Date('2025-01-01T00:00:00Z');
      const role = createTestRole({
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      expect(role.createdAt).toEqual(role.updatedAt);
    });

    it('should handle inactive but not deleted role', () => {
      const role = createTestRole({
        isActive: false,
        deletedAt: undefined,
      });

      expect(role.isActive).toBe(false);
      expect(role.deletedAt).toBeUndefined();
      expect(role.canBeModified()).toBe(true); // Can still be modified if not deleted
    });

    it('should handle active but soft-deleted role (inconsistent state)', () => {
      const role = createTestRole({
        isActive: true,
        deletedAt: new Date(),
      });

      expect(role.isActive).toBe(true);
      expect(role.deletedAt).toBeDefined();
      expect(role.canBeModified()).toBe(false); // Cannot modify deleted role
    });
  });

  describe('Multi-Tenant Scenarios', () => {
    it('should create roles with same name in different organizations', () => {
      const org1Id = 'org-111' as OrganizationId;
      const org2Id = 'org-222' as OrganizationId;

      const role1 = createTestRole({
        name: 'doctor',
        organizationId: org1Id,
      });

      const role2 = createTestRole({
        name: 'doctor',
        organizationId: org2Id,
      });

      // Same name, different organizations - should be allowed
      expect(role1.name).toBe(role2.name);
      expect(role1.organizationId).not.toBe(role2.organizationId);
    });

    it('should create roles with same name in different clinics within same org', () => {
      const clinic1Id = 'clinic-111' as ClinicId;
      const clinic2Id = 'clinic-222' as ClinicId;

      const role1 = createTestRole({
        name: 'receptionist',
        organizationId: testOrgId,
        clinicId: clinic1Id,
      });

      const role2 = createTestRole({
        name: 'receptionist',
        organizationId: testOrgId,
        clinicId: clinic2Id,
      });

      // Same name, same org, different clinics - should be allowed
      expect(role1.name).toBe(role2.name);
      expect(role1.organizationId).toBe(role2.organizationId);
      expect(role1.clinicId).not.toBe(role2.clinicId);
    });

    it('should handle system roles across multiple organizations', () => {
      const org1Id = 'org-111' as OrganizationId;
      const org2Id = 'org-222' as OrganizationId;

      const superAdmin1 = createTestSystemRole(SystemRole.SUPER_ADMIN, org1Id);
      const superAdmin2 = createTestSystemRole(SystemRole.SUPER_ADMIN, org2Id);

      // System roles exist in multiple organizations
      expect(superAdmin1.name).toBe(superAdmin2.name);
      expect(superAdmin1.isSystem).toBe(true);
      expect(superAdmin2.isSystem).toBe(true);
    });
  });

  describe('Role State Combinations', () => {
    it('should handle active system role', () => {
      const role = createTestSystemRole(SystemRole.SUPER_ADMIN, testOrgId);

      expect(role.isActive).toBe(true);
      expect(role.isSystem).toBe(true);
      expect(role.canBeModified()).toBe(false);
      expect(role.canBeDeleted()).toBe(false);
    });

    it('should handle inactive custom role', () => {
      const role = createTestRole({
        name: 'doctor',
        isSystem: false,
        isActive: false,
      });

      expect(role.isActive).toBe(false);
      expect(role.isSystem).toBe(false);
      expect(role.canBeModified()).toBe(true);
      expect(role.canBeDeleted()).toBe(true);
    });

    it('should handle deleted custom role', () => {
      const role = createTestRole({
        name: 'doctor',
        isSystem: false,
        isActive: false,
        deletedAt: new Date(),
      });

      expect(role.deletedAt).toBeDefined();
      expect(role.canBeModified()).toBe(false);
      expect(role.canBeDeleted()).toBe(true); // Can still be "deleted" (already soft-deleted)
    });
  });
});
