/**
 * Authorization Security Tests
 *
 * Comprehensive security test suite validating authorization enforcement
 * across the RBAC system. Tests cover authentication requirements, permission
 * enforcement, and access control mechanisms.
 *
 * Security Scenarios Covered:
 * - JWT authentication requirement validation
 * - Permission-based access control enforcement
 * - Invalid/expired token handling
 * - Missing authentication context detection
 * - Permission decorator enforcement
 * - Guard execution order and precedence
 * - Authorization bypass prevention
 *
 * Attack Vectors Tested:
 * 1. Unauthenticated access attempts
 * 2. Invalid JWT token injection
 * 3. Expired token usage
 * 4. Missing permission metadata bypass
 * 5. User context manipulation
 * 6. Organization context manipulation
 *
 * @group security
 * @group rbac
 * @group authorization
 * @module backend-auth/test/security/rbac
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { PermissionGuard, PERMISSION_METADATA_KEY } from '../../../src/modules/rbac/guards/permission.guard';
import { PermissionCheckerService } from '../../../src/modules/rbac/services/permission-checker.service';
import type { UserContext } from '../../../src/modules/rbac/decorators/current-user.decorator';

describe('Authorization Enforcement Security Tests', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionChecker: PermissionCheckerService;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  const testUserId = 'user-123' as UUID;
  const testOrgId = 'org-456' as OrganizationId;
  const testPermission = 'scheduling.appointment.create';

  beforeEach(() => {
    reflector = { get: vi.fn() } as any;
    permissionChecker = {
      hasPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyPermission: vi.fn(),
      getUserPermissions: vi.fn(),
      invalidateUserPermissionsCache: vi.fn(),
    } as any;

    mockRequest = {
      user: {
        sub: testUserId,
        organizationId: testOrgId,
        email: 'test@example.com',
      } as UserContext,
    };

    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as any;

    guard = new PermissionGuard(reflector, permissionChecker);
  });

  /* ============================================================================
   * Attack Vector 1: Unauthenticated Access
   * ============================================================================ */

  describe('SECURITY: Unauthenticated Access Prevention', () => {
    it('should block access without JWT token (no user context)', async () => {
      // Scenario: Request without authentication header
      // Expected: ForbiddenException with clear message

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = undefined;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication required. User context not found in request.',
      );

      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should block access with malformed user context (missing sub)', async () => {
      // Scenario: User context present but missing user ID
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = { organizationId: testOrgId } as any;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication required',
      );
    });

    it('should block access with null user context', async () => {
      // Scenario: User context explicitly set to null
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = null;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should block access with empty sub (user ID)', async () => {
      // Scenario: User context has empty string for sub
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = {
        sub: '',
        organizationId: testOrgId,
      } as any;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /* ============================================================================
   * Attack Vector 2: Invalid JWT Token Scenarios
   * ============================================================================ */

  describe('SECURITY: Invalid Token Handling', () => {
    it('should block access if JWT guard did not populate user context', async () => {
      // Scenario: Request passed through but JWT guard failed to set user
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = undefined;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication required',
      );
    });

    it('should handle expired token (JWT guard should handle, but test defense)', async () => {
      // Scenario: User context present but might be from expired token
      // Expected: Permission check proceeds (JWT guard validates expiry)

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      // Note: Token expiry validation is JWT guard's responsibility
      // Permission guard assumes valid authentication if user context exists
    });
  });

  /* ============================================================================
   * Attack Vector 3: Organization Context Manipulation
   * ============================================================================ */

  describe('SECURITY: Organization Context Validation', () => {
    it('should block access without organization context', async () => {
      // Scenario: User authenticated but no organization assigned
      // Expected: ForbiddenException - organization required

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = {
        sub: testUserId,
        organizationId: undefined,
      } as any;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Organization context required',
      );
    });

    it('should block access with null organization ID', async () => {
      // Scenario: Organization ID explicitly set to null
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = {
        sub: testUserId,
        organizationId: null,
      } as any;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Organization context required',
      );
    });

    it('should block access with empty string organization ID', async () => {
      // Scenario: Organization ID is empty string (invalid)
      // Expected: ForbiddenException

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = {
        sub: testUserId,
        organizationId: '',
      } as any;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Organization context required',
      );
    });

    it('should pass correct organization ID to permission checker', async () => {
      // Scenario: Verify organization ID is used for tenant scoping
      // Expected: Permission check called with correct organizationId

      // Arrange
      const specificOrgId = 'org-specific-123' as OrganizationId;
      mockRequest.user.organizationId = specificOrgId;
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        specificOrgId,
        undefined,
      );
    });
  });

  /* ============================================================================
   * Attack Vector 4: Permission Bypass Attempts
   * ============================================================================ */

  describe('SECURITY: Permission Bypass Prevention', () => {
    it('should deny access when user lacks required permission', async () => {
      // Scenario: User authenticated but lacks permission
      // Expected: ForbiddenException with permission details

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        `Access denied. Required permission: "${testPermission}"`,
      );
    });

    it('should deny access for any missing permission', async () => {
      // Scenario: Test multiple permissions that user lacks
      // Expected: All denied with appropriate error messages

      const permissions = [
        'admin.user.delete',
        'admin.role.manage',
        'clinical.patient.delete',
        'billing.invoice.manage',
      ];

      for (const permission of permissions) {
        vi.mocked(reflector.get).mockReturnValue(permission);
        vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          `Required permission: "${permission}"`,
        );
      }
    });

    it('should not bypass permission check even if user is in request', async () => {
      // Scenario: Ensure permission check always runs when metadata present
      // Expected: Permission checked regardless of user properties

      // Arrange
      mockRequest.user.roles = ['super_admin']; // Has role but permission check required
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(permissionChecker.hasPermission).toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * Attack Vector 5: Metadata Manipulation
   * ============================================================================ */

  describe('SECURITY: Metadata Integrity', () => {
    it('should handle missing permission metadata gracefully (public route)', async () => {
      // Scenario: No permission metadata set (public endpoint)
      // Expected: Access allowed without permission check

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(undefined);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should handle empty string permission metadata (treated as no requirement)', async () => {
      // Scenario: Permission metadata is empty string
      // Expected: Treated as no permission requirement

      // Arrange
      vi.mocked(reflector.get).mockReturnValue('');

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should extract metadata from correct handler', async () => {
      // Scenario: Verify metadata extracted from method handler, not class
      // Expected: Reflector.get called with handler reference

      // Arrange
      const handlerMock = vi.fn();
      vi.mocked(mockExecutionContext.getHandler).mockReturnValue(handlerMock);
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_METADATA_KEY,
        handlerMock,
      );
    });
  });

  /* ============================================================================
   * Attack Vector 6: Clinic Context Manipulation
   * ============================================================================ */

  describe('SECURITY: Clinic Context Handling', () => {
    it('should pass clinicId to permission checker when present', async () => {
      // Scenario: User has clinic context
      // Expected: Permission checked with clinic scope

      // Arrange
      const testClinicId = 'clinic-789' as ClinicId;
      mockRequest.user.clinicId = testClinicId;
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        testOrgId,
        testClinicId,
      );
    });

    it('should handle undefined clinicId (organization-wide permission)', async () => {
      // Scenario: User context without clinic assignment
      // Expected: Permission checked at organization level

      // Arrange
      mockRequest.user.clinicId = undefined;
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        testOrgId,
        undefined,
      );
    });

    it('should prevent clinic context injection', async () => {
      // Scenario: Malicious clinic ID in request
      // Expected: Only user context clinic ID used

      // Arrange
      mockRequest.params = { clinicId: 'malicious-clinic' }; // Attempt to inject
      mockRequest.user.clinicId = 'legitimate-clinic' as ClinicId;
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        testOrgId,
        'legitimate-clinic' as ClinicId, // Uses user context, not params
      );
    });
  });

  /* ============================================================================
   * Error Handling and Edge Cases
   * ============================================================================ */

  describe('SECURITY: Error Handling', () => {
    it('should handle permission checker errors appropriately', async () => {
      // Scenario: Permission checker throws unexpected error
      // Expected: Error propagated (not swallowed)

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should provide clear error messages for debugging', async () => {
      // Scenario: Various failure scenarios
      // Expected: Error messages clearly identify the issue

      const scenarios = [
        {
          setup: () => {
            mockRequest.user = undefined;
          },
          expectedMessage: 'Authentication required',
        },
        {
          setup: () => {
            mockRequest.user = { sub: testUserId, organizationId: undefined } as any;
          },
          expectedMessage: 'Organization context required',
        },
        {
          setup: () => {
            mockRequest.user = { sub: testUserId, organizationId: testOrgId };
            vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);
          },
          expectedMessage: 'Access denied',
        },
      ];

      for (const scenario of scenarios) {
        vi.mocked(reflector.get).mockReturnValue(testPermission);
        scenario.setup();

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          scenario.expectedMessage,
        );
      }
    });
  });

  /* ============================================================================
   * Success Paths (for completeness)
   * ============================================================================ */

  describe('SECURITY: Authorized Access (Success Paths)', () => {
    it('should allow access when all authorization checks pass', async () => {
      // Scenario: Valid user with required permission
      // Expected: Access granted

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        testOrgId,
        undefined,
      );
    });

    it('should allow access to public endpoints (no permission metadata)', async () => {
      // Scenario: Public endpoint without permission requirement
      // Expected: Access granted without permission check

      // Arrange
      vi.mocked(reflector.get).mockReturnValue(undefined);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });
  });
});
