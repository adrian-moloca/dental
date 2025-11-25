/**
 * Permission Guard Unit Tests
 *
 * Comprehensive test suite for PermissionGuard covering:
 * - Permission metadata extraction
 * - User authentication validation
 * - Organization context validation
 * - Permission authorization checks
 * - Multi-tenant scoping
 * - Error handling and edge cases
 *
 * Test Coverage:
 * - Authorization: Permission checking and enforcement
 * - Authentication: User context validation
 * - Multi-Tenant: Organization and clinic context
 * - Edge Cases: Missing metadata, missing user, missing context
 * - Error Messages: Clear forbidden exception messages
 *
 * @group unit
 * @module backend-auth/test/unit/modules/rbac/guards
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';
import { PermissionGuard, PERMISSION_METADATA_KEY } from '../../../../../src/modules/rbac/guards/permission.guard';
import { PermissionCheckerService } from '../../../../../src/modules/rbac/services/permission-checker.service';
import type { UserContext } from '../../../../../src/modules/rbac/decorators/current-user.decorator';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionChecker: PermissionCheckerService;
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  // Test data constants
  const testUserId = 'user-789' as UUID;
  const testOrgId = 'org-123' as OrganizationId;
  const testClinicId = 'clinic-456' as ClinicId;
  const testPermission = 'scheduling.appointment.create';

  beforeEach(() => {
    // Create mock services
    reflector = {
      get: vi.fn(),
    } as any;

    permissionChecker = {
      hasPermission: vi.fn(),
      hasAllPermissions: vi.fn(),
      hasAnyPermission: vi.fn(),
      getUserPermissions: vi.fn(),
      invalidateUserPermissionsCache: vi.fn(),
    } as any;

    // Create mock request with authenticated user
    mockRequest = {
      user: {
        sub: testUserId,
        organizationId: testOrgId,
        clinicId: undefined,
        email: 'test@example.com',
        roles: ['doctor'],
      } as UserContext,
    };

    // Create mock execution context
    mockExecutionContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
      }),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as any;

    // Create guard instance
    guard = new PermissionGuard(reflector, permissionChecker);
  });

  /* ============================================================================
   * canActivate() - No Permission Requirement
   * ============================================================================ */

  describe('canActivate - No Permission Requirement', () => {
    it('should allow access if no permission metadata is set', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue(undefined);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(
        PERMISSION_METADATA_KEY,
        mockExecutionContext.getHandler(),
      );
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should allow access if permission metadata is null', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue(null);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should allow access if permission metadata is empty string', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue('');

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });
  });

  /* ============================================================================
   * canActivate() - User Authentication Validation
   * ============================================================================ */

  describe('canActivate - User Authentication Validation', () => {
    it('should throw ForbiddenException if user is not authenticated', async () => {
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

    it('should throw ForbiddenException if user.sub is missing', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = { organizationId: testOrgId } as UserContext;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Authentication required. User context not found in request.',
      );
    });

    it('should throw ForbiddenException if user.sub is empty string', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      mockRequest.user = {
        sub: '',
        organizationId: testOrgId,
      } as UserContext;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  /* ============================================================================
   * canActivate() - Organization Context Validation
   * ============================================================================ */

  describe('canActivate - Organization Context Validation', () => {
    it('should throw ForbiddenException if organizationId is missing', async () => {
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
        'Organization context required. User must belong to an organization.',
      );
      expect(permissionChecker.hasPermission).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if organizationId is null', async () => {
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

    it('should throw ForbiddenException if organizationId is empty string', async () => {
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
  });

  /* ============================================================================
   * canActivate() - Permission Authorization
   * ============================================================================ */

  describe('canActivate - Permission Authorization', () => {
    it('should allow access if user has required permission', async () => {
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

    it('should throw ForbiddenException if user lacks required permission', async () => {
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
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        testPermission,
        testOrgId,
        undefined,
      );
    });

    it('should include helpful error message with required permission', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue('admin.role.manage');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        'Access denied. Required permission: "admin.role.manage". User does not have sufficient privileges to perform this action.',
      );
    });
  });

  /* ============================================================================
   * canActivate() - Multi-Tenant Scoping
   * ============================================================================ */

  describe('canActivate - Multi-Tenant Scoping', () => {
    it('should pass organizationId to permission checker', async () => {
      // Arrange
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

    it('should pass clinicId to permission checker if present', async () => {
      // Arrange
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

    it('should handle clinic-scoped permissions correctly', async () => {
      // Arrange
      mockRequest.user.clinicId = testClinicId;
      const clinicPermission = 'scheduling.appointment.read';
      vi.mocked(reflector.get).mockReturnValue(clinicPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        clinicPermission,
        testOrgId,
        testClinicId,
      );
    });
  });

  /* ============================================================================
   * canActivate() - Permission Format Validation
   * ============================================================================ */

  describe('canActivate - Permission Format Validation', () => {
    it('should handle valid permission format (module.resource.action)', async () => {
      // Arrange
      const validPermission = 'clinical.patient.read';
      vi.mocked(reflector.get).mockReturnValue(validPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        validPermission,
        testOrgId,
        undefined,
      );
    });

    it('should pass through invalid permission format to checker for validation', async () => {
      // Arrange
      const invalidPermission = 'invalid-format';
      vi.mocked(reflector.get).mockReturnValue(invalidPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith(
        testUserId,
        invalidPermission,
        testOrgId,
        undefined,
      );
    });
  });

  /* ============================================================================
   * canActivate() - Edge Cases
   * ============================================================================ */

  describe('canActivate - Edge Cases', () => {
    it('should handle permission checker errors gracefully', async () => {
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

    it('should handle user context with additional properties', async () => {
      // Arrange
      mockRequest.user = {
        sub: testUserId,
        organizationId: testOrgId,
        clinicId: testClinicId,
        email: 'test@example.com',
        roles: ['doctor', 'nurse'],
        customProperty: 'custom-value',
      } as any;

      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should extract permission metadata from handler, not class', async () => {
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

    it('should call getHandler only once per request', async () => {
      // Arrange
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(mockExecutionContext.getHandler).toHaveBeenCalledTimes(1);
    });

    it('should call switchToHttp().getRequest() only once per request', async () => {
      // Arrange
      const getRequestMock = vi.fn().mockReturnValue(mockRequest);
      vi.mocked(mockExecutionContext.switchToHttp).mockReturnValue({
        getRequest: getRequestMock,
      } as any);
      vi.mocked(reflector.get).mockReturnValue(testPermission);
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);

      // Act
      await guard.canActivate(mockExecutionContext);

      // Assert
      expect(getRequestMock).toHaveBeenCalledTimes(1);
    });
  });

  /* ============================================================================
   * canActivate() - Multiple Permission Scenarios
   * ============================================================================ */

  describe('canActivate - Multiple Permission Scenarios', () => {
    it('should handle different permission codes for different routes', async () => {
      // Test permission 1
      vi.mocked(reflector.get).mockReturnValue('scheduling.appointment.create');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);
      const result1 = await guard.canActivate(mockExecutionContext);
      expect(result1).toBe(true);

      // Test permission 2
      vi.mocked(reflector.get).mockReturnValue('clinical.patient.read');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);
      const result2 = await guard.canActivate(mockExecutionContext);
      expect(result2).toBe(true);

      // Test permission 3 - denied
      vi.mocked(reflector.get).mockReturnValue('admin.user.delete');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should check permissions independently for each request', async () => {
      // First request - allowed
      vi.mocked(reflector.get).mockReturnValue('scheduling.appointment.read');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(true);
      await guard.canActivate(mockExecutionContext);

      // Second request - denied
      vi.mocked(reflector.get).mockReturnValue('admin.role.delete');
      vi.mocked(permissionChecker.hasPermission).mockResolvedValue(false);
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );

      // Verify each check was independent
      expect(permissionChecker.hasPermission).toHaveBeenCalledTimes(2);
    });
  });
});
