/**
 * Fuzz Testing Suite for RBAC System
 *
 * Comprehensive fuzzing test suite that validates input validation, error handling,
 * and system resilience when subjected to random, malformed, and edge-case inputs.
 *
 * Fuzzing Targets:
 * 1. DTO Inputs - Random strings, SQL injection, XSS, buffer overflows
 * 2. Permission Codes - Invalid formats, wildcards, special characters
 * 3. Organization/Clinic IDs - Invalid UUIDs, SQL injection, nulls
 * 4. Numeric Inputs - Negative numbers, zero, extremely large values
 *
 * Fuzzing Strategies:
 * - Random string generation (ASCII, Unicode, emojis)
 * - Boundary value analysis (min, max, zero, negative)
 * - Type confusion (strings for numbers, arrays for strings)
 * - Encoding attacks (URL encoding, Base64, hex)
 * - Length attacks (empty, very long, buffer overflow attempts)
 *
 * Expected Behavior:
 * - All invalid inputs should be rejected with proper ValidationError
 * - No crashes, hangs, or undefined behavior
 * - No data corruption or security bypasses
 * - Clear, actionable error messages
 *
 * @group security
 * @group rbac
 * @group fuzz-testing
 * @module backend-auth/test/security/rbac
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationError } from '@dentalos/shared-errors';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { RBACService } from '../../../src/modules/rbac/services/rbac.service';
import { PermissionCheckerService } from '../../../src/modules/rbac/services/permission-checker.service';
import { RoleCheckerService } from '../../../src/modules/rbac/services/role-checker.service';
import { RoleRepository } from '../../../src/modules/rbac/repositories/role.repository';
import { PermissionRepository } from '../../../src/modules/rbac/repositories/permission.repository';
import { UserRoleRepository } from '../../../src/modules/rbac/repositories/user-role.repository';
import { RolePermissionRepository } from '../../../src/modules/rbac/repositories/role-permission.repository';
import { SystemRole } from '../../../src/modules/rbac/entities/role.entity';
import { createTestRole, createTestPermission } from '../../utils/rbac-test-helpers';

describe('RBAC Fuzz Testing Suite', () => {
  let rbacService: RBACService;
  let permissionChecker: PermissionCheckerService;
  let roleChecker: RoleCheckerService;
  let roleRepository: RoleRepository;
  let permissionRepository: PermissionRepository;
  let userRoleRepository: UserRoleRepository;
  let rolePermissionRepository: RolePermissionRepository;
  let mockCache: any;

  // Valid baseline for comparison
  const validOrgId = '00000000-0000-0000-0000-000000000001' as OrganizationId;
  const validUserId = '00000000-0000-0000-0000-000000000002' as UUID;
  const validRoleId = '00000000-0000-0000-0000-000000000003' as UUID;

  beforeEach(() => {
    // Initialize mock repositories
    roleRepository = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAllActive: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    } as any;

    permissionRepository = {
      findByIds: vi.fn(),
      findAll: vi.fn(),
      findByCode: vi.fn(),
    } as any;

    userRoleRepository = {
      assignRole: vi.fn(),
      revokeRole: vi.fn(),
      findActiveRolesByUser: vi.fn(),
      countActiveRolesByUser: vi.fn(),
    } as any;

    rolePermissionRepository = {
      grantPermissions: vi.fn(),
      revokePermissions: vi.fn(),
      replacePermissions: vi.fn(),
      findPermissionsByRoles: vi.fn(),
    } as any;

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      del: vi.fn(),
    };

    // Initialize services
    permissionChecker = new PermissionCheckerService(
      userRoleRepository,
      rolePermissionRepository,
      mockCache,
    );

    roleChecker = new RoleCheckerService(userRoleRepository);

    rbacService = new RBACService(
      roleRepository,
      permissionRepository,
      userRoleRepository,
      rolePermissionRepository,
      permissionChecker,
      roleChecker,
    );

    // Default mock responses
    vi.mocked(roleRepository.findById).mockResolvedValue(null);
    vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
    vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
    mockCache.get.mockResolvedValue(null);
  });

  /* ============================================================================
   * FUZZ TARGET 1: DTO String Inputs
   * ============================================================================ */

  describe('FUZZ TARGET 1: DTO String Inputs', () => {
    it('FUZZ: Random ASCII strings in role name', async () => {
      const fuzzInputs = [
        '!@#$%^&*()',
        '[]{}|\\;:\'",.<>?/',
        '`~-_=+',
        'a'.repeat(1000), // Long string
        '\n\r\t\0', // Control characters
        '    ', // Whitespace only
        '', // Empty string
      ];

      for (const fuzzName of fuzzInputs) {
        await expect(
          rbacService.createRole({
            name: fuzzName,
            displayName: 'Fuzz Role',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: SQL injection attempts in role name', async () => {
      const sqlInjections = [
        "'; DROP TABLE roles; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users--",
        "admin'--",
        "' OR 1=1--",
        "'; DELETE FROM roles WHERE '1'='1",
        "\\x00'; DROP TABLE users; --",
        "1; UPDATE roles SET is_system=true WHERE name='attacker",
      ];

      for (const injection of sqlInjections) {
        await expect(
          rbacService.createRole({
            name: injection,
            displayName: 'SQL Injection Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: XSS payloads in role description', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)">',
        '<body onload=alert(1)>',
        '"><script>alert(String.fromCharCode(88,83,83))</script>',
        '<img src="x" onerror="eval(atob(\'YWxlcnQoMSk=\'))">',
      ];

      for (const xss of xssPayloads) {
        await expect(
          rbacService.createRole({
            name: 'xss_test',
            displayName: 'XSS Test',
            description: xss,
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Unicode and emoji in role name', async () => {
      const unicodeInputs = [
        '役割', // Japanese
        'роль', // Russian
        'دور', // Arabic
        '🔒🔑🛡️', // Emojis
        'role\u200B\u200Cname', // Zero-width characters
        'rôle\u0301', // Combining diacritics
        '\uFEFFrole', // BOM character
        'role\uFFFD', // Replacement character
      ];

      for (const unicode of unicodeInputs) {
        await expect(
          rbacService.createRole({
            name: unicode,
            displayName: 'Unicode Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Extremely long strings (buffer overflow attempts)', async () => {
      const longStrings = [
        'a'.repeat(10000),
        'x'.repeat(100000),
        'z'.repeat(1000000),
      ];

      for (const longStr of longStrings) {
        await expect(
          rbacService.createRole({
            name: longStr,
            displayName: 'Buffer Overflow Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Null bytes and control characters', async () => {
      const controlChars = [
        'role\x00name', // Null byte
        'role\x01name', // SOH
        'role\x1Fname', // Unit separator
        'role\x7Fname', // DEL
        '\x00\x00\x00',
        'role\r\nname',
      ];

      for (const control of controlChars) {
        await expect(
          rbacService.createRole({
            name: control,
            displayName: 'Control Char Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Path traversal attempts in role name', async () => {
      const pathTraversals = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        './roles/../admin',
        'role/../../database',
        '%2e%2e%2f%2e%2e%2f',
      ];

      for (const path of pathTraversals) {
        await expect(
          rbacService.createRole({
            name: path,
            displayName: 'Path Traversal Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: LDAP injection attempts', async () => {
      const ldapInjections = [
        '*)(uid=*',
        'admin)(|(uid=*',
        '*)(&(objectClass=*',
        '\\2a\\28\\7c\\28uid\\3d\\2a\\29\\29',
      ];

      for (const ldap of ldapInjections) {
        await expect(
          rbacService.createRole({
            name: ldap,
            displayName: 'LDAP Injection Test',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });
  });

  /* ============================================================================
   * FUZZ TARGET 2: Permission Codes
   * ============================================================================ */

  describe('FUZZ TARGET 2: Permission Codes', () => {
    it('FUZZ: Invalid permission code formats', async () => {
      const invalidCodes = [
        'ADMIN.ROLE.CREATE', // Uppercase
        'admin-role-create', // Hyphens
        'admin_role_create', // Underscores
        'admin..role.create', // Double dots
        '.admin.role.create', // Leading dot
        'admin.role.create.', // Trailing dot
        'admin.role', // Too few parts
        'admin.role.create.extra', // Too many parts
        'admin', // Single part
        '', // Empty
        '...', // Only dots
      ];

      vi.mocked(userRoleRepository.findActiveRolesByUser).mockResolvedValue([]);
      vi.mocked(rolePermissionRepository.findPermissionsByRoles).mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      for (const code of invalidCodes) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });

    it('FUZZ: Wildcard permission attempts', async () => {
      const wildcards = [
        '*.*.*',
        'admin.*.*',
        'admin.role.*',
        '*.role.create',
        '*',
        '**',
        'admin.*.create',
      ];

      for (const wildcard of wildcards) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, wildcard, validOrgId);
        expect(hasPermission).toBe(false); // Wildcards not allowed
      }
    });

    it('FUZZ: Special characters in permission codes', async () => {
      const specialChars = [
        'admin.role.create<script>',
        'admin.role.create; DROP TABLE',
        'admin.role.create\x00',
        'admin.role.create\n\r',
        'admin.role.create\\',
        'admin.role.create/',
        'admin.role.create%00',
        'admin.role.create&foo=bar',
      ];

      for (const code of specialChars) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });

    it('FUZZ: Very long permission codes', async () => {
      const longCodes = [
        `${'a'.repeat(100)}.${'b'.repeat(100)}.${'c'.repeat(100)}`,
        `admin.${'role'.repeat(500)}.create`,
        'a'.repeat(10000),
      ];

      for (const code of longCodes) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });

    it('FUZZ: Non-existent permission codes', async () => {
      const nonExistent = [
        'fake.permission.code',
        'admin.role.destroy',
        'super.ultra.mega.permission',
        'quantum.entanglement.manipulate',
        'time.travel.enable',
      ];

      for (const code of nonExistent) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });

    it('FUZZ: Case variations in permission codes', async () => {
      const caseVariations = [
        'Admin.Role.Create',
        'ADMIN.ROLE.CREATE',
        'admin.ROLE.create',
        'AdMiN.rOlE.CrEaTe',
      ];

      for (const code of caseVariations) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false); // Case-sensitive
      }
    });

    it('FUZZ: Empty and whitespace permission codes', async () => {
      const emptyInputs = ['', '   ', '\t\n\r', '\x00', '    .    .    '];

      for (const code of emptyInputs) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });

    it('FUZZ: Regex metacharacters in permission codes', async () => {
      const regexChars = [
        'admin.role.create+',
        'admin.role.create?',
        'admin.role.create*',
        'admin.role.(create)',
        'admin.role.[create]',
        'admin.role.^create$',
        'admin.role.create|delete',
      ];

      for (const code of regexChars) {
        const hasPermission = await permissionChecker.hasPermission(validUserId, code, validOrgId);
        expect(hasPermission).toBe(false);
      }
    });
  });

  /* ============================================================================
   * FUZZ TARGET 3: Organization/Clinic IDs (UUIDs)
   * ============================================================================ */

  describe('FUZZ TARGET 3: Organization/Clinic IDs', () => {
    it('FUZZ: Invalid UUID formats', async () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '12345',
        'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        '00000000-0000-0000-0000-00000000000', // Too short
        '00000000-0000-0000-0000-000000000001z', // Invalid char
        '00000000000000000000000000000001', // No hyphens
        '{00000000-0000-0000-0000-000000000001}', // Braces
        '00000000_0000_0000_0000_000000000001', // Underscores
      ];

      for (const invalidId of invalidUUIDs) {
        await expect(
          rbacService.assignRole({
            userId: validUserId,
            roleId: validRoleId,
            organizationId: invalidId as OrganizationId,
            assignedBy: validUserId,
          }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: SQL injection in organizationId', async () => {
      const sqlInjections = [
        "' OR '1'='1",
        "'; DROP TABLE organizations; --",
        "00000000-0000-0000-0000-000000000001' OR '1'='1",
        "1' UNION SELECT * FROM users--",
      ];

      for (const injection of sqlInjections) {
        await expect(
          rbacService.assignRole({
            userId: validUserId,
            roleId: validRoleId,
            organizationId: injection as OrganizationId,
            assignedBy: validUserId,
          }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: Extremely long UUID-like strings', async () => {
      const longUUIDs = [
        '00000000-0000-0000-0000-000000000001'.repeat(100),
        'a'.repeat(10000),
        '00000000-0000-0000-0000-' + '0'.repeat(100000),
      ];

      for (const longId of longUUIDs) {
        await expect(
          rbacService.assignRole({
            userId: validUserId,
            roleId: validRoleId,
            organizationId: longId as OrganizationId,
            assignedBy: validUserId,
          }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: Null and undefined organization IDs', async () => {
      const nullInputs = [null, undefined, ''];

      for (const nullId of nullInputs) {
        await expect(
          rbacService.assignRole({
            userId: validUserId,
            roleId: validRoleId,
            organizationId: nullId as any,
            assignedBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Special characters in UUID fields', async () => {
      const specialChars = [
        '00000000-0000-0000-0000-00000000000<script>',
        '00000000-0000-0000-0000-00000000000\x00',
        '00000000-0000-0000-0000-00000000000\n',
        '00000000-0000-0000-0000-00000000000%00',
      ];

      for (const specialId of specialChars) {
        await expect(
          rbacService.assignRole({
            userId: validUserId,
            roleId: validRoleId,
            organizationId: specialId as OrganizationId,
            assignedBy: validUserId,
          }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: UUID with wrong version/variant', async () => {
      const wrongVersions = [
        '00000000-0000-1000-0000-000000000001', // Version 1
        '00000000-0000-2000-0000-000000000001', // Version 2
        '00000000-0000-3000-0000-000000000001', // Version 3
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF', // All Fs
      ];

      for (const wrongId of wrongVersions) {
        // System might accept any valid UUID format
        // This tests edge cases of UUID validation
        const roles = await rbacService.listRoles(wrongId as OrganizationId);
        expect(roles).toBeDefined();
      }
    });

    it('FUZZ: Array of organization IDs (type confusion)', async () => {
      await expect(
        rbacService.assignRole({
          userId: validUserId,
          roleId: validRoleId,
          organizationId: [validOrgId, validOrgId] as any,
          assignedBy: validUserId,
        }),
      ).rejects.toThrow();
    });

    it('FUZZ: Object instead of organizationId string', async () => {
      await expect(
        rbacService.assignRole({
          userId: validUserId,
          roleId: validRoleId,
          organizationId: { id: validOrgId } as any,
          assignedBy: validUserId,
        }),
      ).rejects.toThrow();
    });
  });

  /* ============================================================================
   * FUZZ TARGET 4: Numeric Inputs
   * ============================================================================ */

  describe('FUZZ TARGET 4: Numeric Inputs', () => {
    it('FUZZ: Negative numbers in pagination', async () => {
      const negativeInputs = [-1, -999, -2147483648, Number.MIN_SAFE_INTEGER];

      for (const neg of negativeInputs) {
        // If listRoles accepts pagination params
        await expect(
          rbacService.listRoles(validOrgId, { limit: neg } as any),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Zero values in limits', async () => {
      const zeroInputs = [0, 0.0, -0];

      for (const zero of zeroInputs) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: zero } as any),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Extremely large numbers', async () => {
      const largeNumbers = [
        Number.MAX_SAFE_INTEGER,
        Number.MAX_VALUE,
        9999999999,
        Infinity,
        -Infinity,
      ];

      for (const large of largeNumbers) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: large } as any),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Non-numeric strings for numeric fields', async () => {
      const nonNumeric = ['abc', 'NaN', 'undefined', 'null', 'true', '1.5.7'];

      for (const notNum of nonNumeric) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: notNum as any }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Floating point precision edge cases', async () => {
      const floats = [0.1 + 0.2, 1.7976931348623157e308, Number.EPSILON, -Number.EPSILON];

      for (const float of floats) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: float } as any),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Special numeric values', async () => {
      const specialValues = [NaN, undefined, null, '', '0x10', '0o10', '0b10'];

      for (const special of specialValues) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: special as any }),
        ).rejects.toThrow();
      }
    });

    it('FUZZ: Numeric overflow attempts', async () => {
      const overflows = [
        2 ** 53 + 1, // Beyond safe integer
        2 ** 100,
        10 ** 308,
      ];

      for (const overflow of overflows) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: overflow } as any),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Scientific notation', async () => {
      const scientific = ['1e10', '1E5', '1.5e-10', '1e1000'];

      for (const sci of scientific) {
        await expect(
          rbacService.listRoles(validOrgId, { limit: sci as any }),
        ).rejects.toThrow(ValidationError);
      }
    });
  });

  /* ============================================================================
   * FUZZ TARGET 5: Type Confusion & Mixed Input Types
   * ============================================================================ */

  describe('FUZZ TARGET 5: Type Confusion', () => {
    it('FUZZ: Boolean values for string fields', async () => {
      await expect(
        rbacService.createRole({
          name: true as any,
          displayName: false as any,
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Arrays for scalar fields', async () => {
      await expect(
        rbacService.createRole({
          name: ['admin', 'user'] as any,
          displayName: 'Array Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Objects for string fields', async () => {
      await expect(
        rbacService.createRole({
          name: { value: 'admin' } as any,
          displayName: 'Object Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Functions as input values', async () => {
      await expect(
        rbacService.createRole({
          name: (() => 'admin') as any,
          displayName: 'Function Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Symbol types', async () => {
      const sym = Symbol('admin');

      await expect(
        rbacService.createRole({
          name: sym as any,
          displayName: 'Symbol Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Date objects for string fields', async () => {
      await expect(
        rbacService.createRole({
          name: new Date() as any,
          displayName: 'Date Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: RegExp objects', async () => {
      await expect(
        rbacService.createRole({
          name: /admin/g as any,
          displayName: 'RegExp Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it('FUZZ: Circular references', async () => {
      const circular: any = { name: 'admin' };
      circular.self = circular;

      await expect(
        rbacService.createRole({
          name: 'circular_role',
          displayName: 'Circular Role',
          description: circular as any,
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow();
    });

    it('FUZZ: Prototype pollution attempts', async () => {
      const malicious = JSON.parse('{"__proto__":{"isAdmin":true}}');

      await expect(
        rbacService.createRole({
          name: 'proto_pollution',
          displayName: 'Proto Pollution',
          organizationId: validOrgId,
          createdBy: validUserId,
          ...malicious,
        } as any),
      ).rejects.toThrow();
    });

    it('FUZZ: Buffer objects', async () => {
      const buffer = Buffer.from('admin');

      await expect(
        rbacService.createRole({
          name: buffer as any,
          displayName: 'Buffer Role',
          organizationId: validOrgId,
          createdBy: validUserId,
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  /* ============================================================================
   * FUZZ TARGET 6: Encoding & Format Attacks
   * ============================================================================ */

  describe('FUZZ TARGET 6: Encoding & Format Attacks', () => {
    it('FUZZ: URL encoding in inputs', async () => {
      const urlEncoded = [
        '%61%64%6D%69%6E', // 'admin'
        'admin%20role',
        'admin%00role',
        '%2e%2e%2f',
      ];

      for (const encoded of urlEncoded) {
        await expect(
          rbacService.createRole({
            name: encoded,
            displayName: 'URL Encoded',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Base64 encoded payloads', async () => {
      const base64 = [
        'YWRtaW4=', // 'admin'
        Buffer.from('admin').toString('base64'),
        'PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==', // XSS
      ];

      for (const b64 of base64) {
        await expect(
          rbacService.createRole({
            name: b64,
            displayName: 'Base64',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Hex encoded strings', async () => {
      const hexEncoded = [
        '\\x61\\x64\\x6D\\x69\\x6E', // 'admin'
        '0x61646D696E',
        '\\u0061\\u0064\\u006D\\u0069\\u006E',
      ];

      for (const hex of hexEncoded) {
        await expect(
          rbacService.createRole({
            name: hex,
            displayName: 'Hex Encoded',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: HTML entity encoding', async () => {
      const htmlEntities = [
        '&lt;script&gt;alert(1)&lt;/script&gt;',
        '&#60;script&#62;',
        '&amp;admin&amp;',
        '&#x3C;admin&#x3E;',
      ];

      for (const entity of htmlEntities) {
        await expect(
          rbacService.createRole({
            name: entity,
            displayName: 'HTML Entity',
            description: entity,
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: JSON string escaping attempts', async () => {
      const jsonEscapes = [
        '{"name":"admin"}',
        '\\u0061\\u0064\\u006D\\u0069\\u006E',
        '\\"admin\\"',
        "{'name':'admin'}",
      ];

      for (const jsonStr of jsonEscapes) {
        await expect(
          rbacService.createRole({
            name: jsonStr,
            displayName: 'JSON Escape',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });

    it('FUZZ: Mixed encoding combinations', async () => {
      const mixedEncoding = [
        '%61dmin<script>',
        'admin\\x00%00',
        '&#x61;dmin',
        Buffer.from('%61dmin').toString('base64'),
      ];

      for (const mixed of mixedEncoding) {
        await expect(
          rbacService.createRole({
            name: mixed,
            displayName: 'Mixed Encoding',
            organizationId: validOrgId,
            createdBy: validUserId,
          }),
        ).rejects.toThrow(ValidationError);
      }
    });
  });
});
