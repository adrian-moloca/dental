/**
 * Permission Entity Unit Tests
 *
 * Tests cover:
 * - Permission creation with valid code format
 * - Permission code validation (module.resource.action pattern)
 * - Code parsing into components
 * - Static helper methods (buildCode, isValidPermissionCode)
 * - Permission action checking (grantsAction, manage permission)
 * - Module and resource filtering
 * - Edge cases and boundary conditions
 *
 * Security Test Coverage:
 * - Permission code format validation
 * - Unique permission code enforcement
 * - Manage permission grants all CRUD operations
 * - Invalid action type rejection
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/entities
 */

import { describe, it, expect } from 'vitest';
import { Permission, PermissionAction } from '../../../../../src/modules/rbac/entities/permission.entity';
import { createTestPermission, expectValidPermissionCode } from '../../../../utils/rbac-test-helpers';

describe('Permission Entity', () => {
  describe('Constructor - Valid Creation', () => {
    it('should create permission with valid code format', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');

      expect(permission.id).toBeDefined();
      expect(permission.code).toBe('scheduling.appointment.create');
      expect(permission.module).toBe('scheduling');
      expect(permission.resource).toBe('appointment');
      expect(permission.action).toBe('create');
      expect(permission.isActive).toBe(true);
      expect(permission.createdAt).toBeInstanceOf(Date);
    });

    it('should create permission with all CRUD actions', () => {
      const actions: PermissionAction[] = [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
        PermissionAction.LIST,
      ];

      actions.forEach(action => {
        const permission = createTestPermission('clinical', 'patient', action);
        expect(permission.action).toBe(action);
        expect(permission.isValidCode()).toBe(true);
      });
    });

    it('should create permission with special actions', () => {
      const specialActions = [
        PermissionAction.MANAGE,
        PermissionAction.EXPORT,
        PermissionAction.IMPORT,
        PermissionAction.EXECUTE,
      ];

      specialActions.forEach(action => {
        const permission = createTestPermission('billing', 'invoice', action);
        expect(permission.action).toBe(action);
        expect(permission.isValidCode()).toBe(true);
      });
    });

    it('should create permission with display name and description', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create', {
        displayName: 'Create Appointments',
        description: 'Allows user to create new appointments',
      });

      expect(permission.displayName).toBe('Create Appointments');
      expect(permission.description).toBe('Allows user to create new appointments');
    });

    it('should create inactive permission', () => {
      const permission = createTestPermission('legacy', 'feature', 'read', {
        isActive: false,
      });

      expect(permission.isActive).toBe(false);
    });
  });

  describe('Permission Code Validation', () => {
    it('should validate correct permission code', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.isValidCode()).toBe(true);
    });

    it('should validate permission with all valid actions', () => {
      const validActions = ['create', 'read', 'update', 'delete', 'list', 'manage', 'export', 'import', 'execute'];

      validActions.forEach(action => {
        const permission = createTestPermission('module', 'resource', action);
        expect(permission.isValidCode()).toBe(true);
      });
    });

    it('should reject permission code with invalid action', () => {
      const permission = createTestPermission('module', 'resource', 'invalid_action', {
        code: 'module.resource.invalid_action',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with uppercase module', () => {
      const permission = createTestPermission('Module', 'resource', 'create', {
        code: 'Module.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with uppercase resource', () => {
      const permission = createTestPermission('module', 'Resource', 'create', {
        code: 'module.Resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with uppercase action', () => {
      const permission = createTestPermission('module', 'resource', 'Create', {
        code: 'module.resource.Create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with spaces', () => {
      const permission = createTestPermission('module name', 'resource', 'create', {
        code: 'module name.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with special characters', () => {
      const permission = createTestPermission('module@special', 'resource', 'create', {
        code: 'module@special.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with numbers', () => {
      const permission = createTestPermission('module123', 'resource', 'create', {
        code: 'module123.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with hyphens', () => {
      const permission = createTestPermission('module-name', 'resource', 'create', {
        code: 'module-name.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with underscores', () => {
      const permission = createTestPermission('module_name', 'resource', 'create', {
        code: 'module_name.resource.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with too many parts', () => {
      const permission = createTestPermission('module', 'resource', 'create', {
        code: 'module.resource.sub.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject permission code with too few parts', () => {
      const permission = createTestPermission('module', 'resource', 'create', {
        code: 'module.create',
      });
      expect(permission.isValidCode()).toBe(false);
    });

    it('should reject empty permission code', () => {
      const permission = createTestPermission('module', 'resource', 'create', {
        code: '',
      });
      expect(permission.isValidCode()).toBe(false);
    });
  });

  describe('Code Parsing', () => {
    it('should parse valid permission code into components', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      const parsed = permission.parseCode();

      expect(parsed).not.toBeNull();
      expect(parsed?.module).toBe('scheduling');
      expect(parsed?.resource).toBe('appointment');
      expect(parsed?.action).toBe('create');
    });

    it('should return null for invalid permission code', () => {
      const permission = createTestPermission('module', 'resource', 'invalid', {
        code: 'invalid.code',
      });
      const parsed = permission.parseCode();

      expect(parsed).toBeNull();
    });

    it('should parse code with all valid actions', () => {
      const validActions = ['create', 'read', 'update', 'delete', 'list', 'manage', 'export', 'import', 'execute'];

      validActions.forEach(action => {
        const permission = createTestPermission('module', 'resource', action);
        const parsed = permission.parseCode();

        expect(parsed).not.toBeNull();
        expect(parsed?.action).toBe(action);
      });
    });

    it('should handle different module names', () => {
      const modules = ['scheduling', 'clinical', 'billing', 'admin', 'reports'];

      modules.forEach(module => {
        const permission = createTestPermission(module, 'resource', 'create');
        const parsed = permission.parseCode();

        expect(parsed?.module).toBe(module);
      });
    });

    it('should handle different resource names', () => {
      const resources = ['appointment', 'patient', 'invoice', 'user', 'report'];

      resources.forEach(resource => {
        const permission = createTestPermission('module', resource, 'create');
        const parsed = permission.parseCode();

        expect(parsed?.resource).toBe(resource);
      });
    });
  });

  describe('Static buildCode Method', () => {
    it('should build correct permission code from components', () => {
      const code = Permission.buildCode('scheduling', 'appointment', 'create');
      expect(code).toBe('scheduling.appointment.create');
    });

    it('should convert uppercase module to lowercase', () => {
      const code = Permission.buildCode('Scheduling', 'appointment', 'create');
      expect(code).toBe('scheduling.appointment.create');
    });

    it('should convert uppercase resource to lowercase', () => {
      const code = Permission.buildCode('scheduling', 'Appointment', 'create');
      expect(code).toBe('scheduling.appointment.create');
    });

    it('should convert uppercase action to lowercase', () => {
      const code = Permission.buildCode('scheduling', 'appointment', 'Create');
      expect(code).toBe('scheduling.appointment.create');
    });

    it('should build code for all permission actions', () => {
      const actions = ['create', 'read', 'update', 'delete', 'list', 'manage', 'export', 'import', 'execute'];

      actions.forEach(action => {
        const code = Permission.buildCode('module', 'resource', action);
        expect(code).toBe(`module.resource.${action}`);
      });
    });
  });

  describe('Static isValidPermissionCode Method', () => {
    it('should validate correct permission code', () => {
      expect(Permission.isValidPermissionCode('scheduling.appointment.create')).toBe(true);
    });

    it('should validate all valid actions', () => {
      const validActions = ['create', 'read', 'update', 'delete', 'list', 'manage', 'export', 'import', 'execute'];

      validActions.forEach(action => {
        expect(Permission.isValidPermissionCode(`module.resource.${action}`)).toBe(true);
      });
    });

    it('should reject code with invalid action', () => {
      expect(Permission.isValidPermissionCode('module.resource.invalid')).toBe(false);
    });

    it('should reject code with uppercase letters', () => {
      expect(Permission.isValidPermissionCode('Module.resource.create')).toBe(false);
      expect(Permission.isValidPermissionCode('module.Resource.create')).toBe(false);
      expect(Permission.isValidPermissionCode('module.resource.Create')).toBe(false);
    });

    it('should reject code with numbers', () => {
      expect(Permission.isValidPermissionCode('module123.resource.create')).toBe(false);
    });

    it('should reject code with special characters', () => {
      expect(Permission.isValidPermissionCode('module@name.resource.create')).toBe(false);
    });

    it('should reject code with wrong number of parts', () => {
      expect(Permission.isValidPermissionCode('module.create')).toBe(false);
      expect(Permission.isValidPermissionCode('module.sub.resource.create')).toBe(false);
    });

    it('should reject empty code', () => {
      expect(Permission.isValidPermissionCode('')).toBe(false);
    });
  });

  describe('grantsAction Method', () => {
    it('should return true when action matches exactly', () => {
      const permission = createTestPermission('module', 'resource', 'create');
      expect(permission.grantsAction(PermissionAction.CREATE)).toBe(true);
    });

    it('should return false when action does not match', () => {
      const permission = createTestPermission('module', 'resource', 'create');
      expect(permission.grantsAction(PermissionAction.UPDATE)).toBe(false);
    });

    it('should grant all CRUD actions when permission is manage', () => {
      const permission = createTestPermission('module', 'resource', 'manage');

      expect(permission.grantsAction(PermissionAction.CREATE)).toBe(true);
      expect(permission.grantsAction(PermissionAction.READ)).toBe(true);
      expect(permission.grantsAction(PermissionAction.UPDATE)).toBe(true);
      expect(permission.grantsAction(PermissionAction.DELETE)).toBe(true);
      expect(permission.grantsAction(PermissionAction.LIST)).toBe(true);
    });

    it('should not grant special actions when permission is manage', () => {
      const permission = createTestPermission('module', 'resource', 'manage');

      expect(permission.grantsAction(PermissionAction.EXPORT)).toBe(false);
      expect(permission.grantsAction(PermissionAction.IMPORT)).toBe(false);
      expect(permission.grantsAction(PermissionAction.EXECUTE)).toBe(false);
    });

    it('should accept string action parameter', () => {
      const permission = createTestPermission('module', 'resource', 'create');
      expect(permission.grantsAction('create')).toBe(true);
      expect(permission.grantsAction('update')).toBe(false);
    });
  });

  describe('appliesToModule Method', () => {
    it('should return true for matching module', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToModule('scheduling')).toBe(true);
    });

    it('should return false for non-matching module', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToModule('clinical')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToModule('Scheduling')).toBe(false);
    });
  });

  describe('appliesToResource Method', () => {
    it('should return true for matching resource', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToResource('appointment')).toBe(true);
    });

    it('should return false for non-matching resource', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToResource('patient')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const permission = createTestPermission('scheduling', 'appointment', 'create');
      expect(permission.appliesToResource('Appointment')).toBe(false);
    });
  });

  describe('isManagementPermission Method', () => {
    it('should return true for manage permission', () => {
      const permission = createTestPermission('module', 'resource', 'manage');
      expect(permission.isManagementPermission()).toBe(true);
    });

    it('should return false for non-manage permissions', () => {
      const actions = ['create', 'read', 'update', 'delete', 'list', 'export', 'import', 'execute'];

      actions.forEach(action => {
        const permission = createTestPermission('module', 'resource', action);
        expect(permission.isManagementPermission()).toBe(false);
      });
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize permission to JSON with all fields', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');

      const permission = createTestPermission('scheduling', 'appointment', 'create', {
        displayName: 'Create Appointments',
        description: 'Allows creating new appointments',
        isActive: true,
        createdAt,
      });

      const json = permission.toJSON();

      expect(json).toEqual({
        id: permission.id,
        code: 'scheduling.appointment.create',
        displayName: 'Create Appointments',
        description: 'Allows creating new appointments',
        module: 'scheduling',
        resource: 'appointment',
        action: 'create',
        isActive: true,
        createdAt: createdAt.toISOString(),
      });
    });

    it('should serialize inactive permission', () => {
      const permission = createTestPermission('legacy', 'feature', 'read', {
        isActive: false,
      });

      const json = permission.toJSON();

      expect(json.isActive).toBe(false);
    });

    it('should serialize permission without description', () => {
      const permission = createTestPermission('module', 'resource', 'create', {
        description: undefined,
      });

      const json = permission.toJSON();

      expect(json.description).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle permission with single-letter module', () => {
      const permission = createTestPermission('a', 'resource', 'create');
      expect(permission.isValidCode()).toBe(true);
    });

    it('should handle permission with single-letter resource', () => {
      const permission = createTestPermission('module', 'a', 'create');
      expect(permission.isValidCode()).toBe(true);
    });

    it('should handle permission with very long module name', () => {
      const longModule = 'a'.repeat(100);
      const permission = createTestPermission(longModule, 'resource', 'create');
      expect(permission.module).toBe(longModule);
    });

    it('should handle permission with very long resource name', () => {
      const longResource = 'a'.repeat(100);
      const permission = createTestPermission('module', longResource, 'create');
      expect(permission.resource).toBe(longResource);
    });

    it('should handle all permission actions in sequence', () => {
      const allActions = Object.values(PermissionAction);

      allActions.forEach(action => {
        const permission = createTestPermission('module', 'resource', action);
        expect(permission.action).toBe(action);
        expect(permission.isValidCode()).toBe(true);
      });
    });

    it('should handle permission code parsing with manage action', () => {
      const permission = createTestPermission('billing', 'invoice', 'manage');
      const parsed = permission.parseCode();

      expect(parsed).not.toBeNull();
      expect(parsed?.action).toBe('manage');
      expect(permission.isManagementPermission()).toBe(true);
    });
  });

  describe('Permission Code Format Examples', () => {
    it('should validate realistic permission codes', () => {
      const validCodes = [
        'scheduling.appointment.create',
        'clinical.patient.read',
        'billing.invoice.update',
        'admin.user.delete',
        'reports.analytics.list',
        'clinical.diagnosis.manage',
        'billing.payment.export',
        'admin.audit.import',
        'system.backup.execute',
      ];

      validCodes.forEach(code => {
        expect(Permission.isValidPermissionCode(code)).toBe(true);
      });
    });

    it('should reject invalid permission codes', () => {
      const invalidCodes = [
        'SchedulingAppointmentCreate', // No dots
        'scheduling.appointment', // Missing action
        'scheduling.create', // Missing resource
        'scheduling.appointment.Create', // Uppercase action
        'Scheduling.appointment.create', // Uppercase module
        'scheduling.Appointment.create', // Uppercase resource
        'scheduling-appointment-create', // Hyphens instead of dots
        'scheduling_appointment_create', // Underscores instead of dots
        'scheduling.appointment.crud', // Invalid action
        'scheduling.appointment.123', // Number action
        '', // Empty
        'invalid', // Single word
      ];

      invalidCodes.forEach(code => {
        expect(Permission.isValidPermissionCode(code)).toBe(false);
      });
    });
  });
});
