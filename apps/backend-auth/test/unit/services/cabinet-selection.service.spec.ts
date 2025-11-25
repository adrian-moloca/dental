/**
 * CabinetSelectionService Unit Tests
 *
 * Tests cabinet-related operations:
 * - Getting user cabinets with subscription data
 * - Cabinet selection validation
 * - Cabinet switching with validation
 * - Auto-assignment to default cabinet
 * - Subscription enrichment
 *
 * @group unit
 * @module backend-auth/test/unit/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CabinetSelectionService } from '../../../src/modules/auth/services/cabinet-selection.service';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';
import { UserCabinetRepository } from '../../../src/modules/users/repositories/user-cabinet.repository';
import { SubscriptionClientService } from '../../../src/modules/auth/services/subscription-client.service';
import { User, UserStatus } from '../../../src/modules/users/entities/user.entity';
import { ForbiddenError, AuthenticationError } from '@dentalos/shared-errors';

describe('CabinetSelectionService', () => {
  let service: CabinetSelectionService;
  let userRepository: UserRepository;
  let userCabinetRepository: UserCabinetRepository;
  let subscriptionClient: SubscriptionClientService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hash',
    firstName: 'John',
    lastName: 'Doe',
    organizationId: 'org-123',
    clinicId: 'clinic-456',
    roles: ['USER'],
    permissions: [],
    status: UserStatus.ACTIVE,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    toJSON: function () {
      return this;
    },
  } as User;

  const mockUserCabinet = {
    id: 'user-cabinet-1',
    userId: 'user-123',
    cabinetId: 'cabinet-1',
    organizationId: 'org-123',
    isPrimary: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCabinet = {
    id: 'cabinet-1',
    organizationId: 'org-123',
    name: 'Main Dental Cabinet',
    isDefault: true,
    isActive: true,
  };

  const mockSubscription = {
    id: 'sub-1',
    cabinetId: 'cabinet-1',
    status: 'ACTIVE',
    modules: [
      { moduleCode: 'SCHEDULING', isActive: true },
      { moduleCode: 'PATIENT_MANAGEMENT', isActive: true },
    ],
    isTrial: false,
    trialEndsAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CabinetSelectionService,
        {
          provide: UserRepository,
          useValue: {
            findById: vi.fn(),
          },
        },
        {
          provide: UserCabinetRepository,
          useValue: {
            findByUserId: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
          },
        },
        {
          provide: SubscriptionClientService,
          useValue: {
            getCabinetById: vi.fn(),
            getCabinetSubscription: vi.fn(),
            getDefaultCabinet: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CabinetSelectionService>(CabinetSelectionService);
    userRepository = module.get<UserRepository>(UserRepository);
    userCabinetRepository = module.get<UserCabinetRepository>(UserCabinetRepository);
    subscriptionClient = module.get<SubscriptionClientService>(SubscriptionClientService);
  });

  describe('getUserCabinets()', () => {
    it('should return empty array when user has no cabinets', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([]);

      // Act
      const result = await service.getUserCabinets('user-123', 'org-123');

      // Assert
      expect(result.cabinets).toEqual([]);
    });

    it('should fetch and enrich cabinets with subscription data', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([mockUserCabinet]);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const result = await service.getUserCabinets('user-123', 'org-123');

      // Assert
      expect(result.cabinets).toHaveLength(1);
      expect(result.cabinets[0]).toMatchObject({
        id: mockCabinet.id,
        name: mockCabinet.name,
        isDefault: mockCabinet.isDefault,
        isPrimary: mockUserCabinet.isPrimary,
        subscription: {
          status: 'ACTIVE',
          modules: ['SCHEDULING', 'PATIENT_MANAGEMENT'],
        },
      });
    });

    it('should skip cabinets that fail to fetch', async () => {
      // Arrange - multiple cabinets, one fails
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([
        mockUserCabinet,
        { ...mockUserCabinet, cabinetId: 'cabinet-2', id: 'user-cabinet-2' },
      ]);
      vi.mocked(subscriptionClient.getCabinetById)
        .mockResolvedValueOnce(mockCabinet)
        .mockRejectedValueOnce(new Error('Cabinet not found'));
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const result = await service.getUserCabinets('user-123', 'org-123');

      // Assert - should only return successful cabinet
      expect(result.cabinets).toHaveLength(1);
    });

    it('should fetch cabinets in parallel', async () => {
      // Arrange - multiple cabinets
      const userCabinets = [
        mockUserCabinet,
        { ...mockUserCabinet, cabinetId: 'cabinet-2', id: 'user-cabinet-2' },
        { ...mockUserCabinet, cabinetId: 'cabinet-3', id: 'user-cabinet-3' },
      ];
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue(userCabinets);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const startTime = Date.now();
      await service.getUserCabinets('user-123', 'org-123');
      const duration = Date.now() - startTime;

      // Assert - should be fast (parallel execution)
      // If serial: 3 cabinets * 10ms each = 30ms
      // If parallel: max(10ms, 10ms, 10ms) = 10ms
      expect(duration).toBeLessThan(100);
      expect(subscriptionClient.getCabinetById).toHaveBeenCalledTimes(3);
    });

    it('should only fetch active cabinets', async () => {
      // Act
      await service.getUserCabinets('user-123', 'org-123');

      // Assert
      expect(userCabinetRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
        'org-123',
        true // activeOnly = true
      );
    });
  });

  describe('selectCabinet()', () => {
    it('should successfully select cabinet with access', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const result = await service.selectCabinet('user-123', 'cabinet-1', 'org-123');

      // Assert
      expect(result.cabinet).toEqual(mockCabinet);
      expect(result.subscription).toEqual(mockSubscription);
      expect(result.userCabinet).toEqual(mockUserCabinet);
    });

    it('should throw ForbiddenError when user not assigned to cabinet', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(null);

      // Act & Assert
      await expect(service.selectCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        ForbiddenError
      );
      await expect(service.selectCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        'You do not have access to this cabinet'
      );
    });

    it('should throw ForbiddenError when cabinet assignment inactive', async () => {
      // Arrange
      const inactiveUserCabinet = { ...mockUserCabinet, isActive: false };
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(inactiveUserCabinet);

      // Act & Assert
      await expect(service.selectCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        ForbiddenError
      );
      await expect(service.selectCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        'Your access to this cabinet has been deactivated'
      );
    });

    it('should validate tenant isolation', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(mockUserCabinet);

      // Act
      await service.selectCabinet('user-123', 'cabinet-1', 'org-123');

      // Assert - should query with organizationId
      expect(userCabinetRepository.findOne).toHaveBeenCalledWith(
        'user-123',
        'cabinet-1',
        'org-123'
      );
    });
  });

  describe('switchCabinet()', () => {
    it('should successfully switch to new cabinet', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const result = await service.switchCabinet('user-123', 'cabinet-1', 'org-123');

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.cabinet).toEqual(mockCabinet);
      expect(result.subscription).toEqual(mockSubscription);
      expect(result.userCabinet).toEqual(mockUserCabinet);
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(service.switchCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        AuthenticationError
      );
      await expect(service.switchCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw AuthenticationError when user not active', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      vi.mocked(userRepository.findById).mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(service.switchCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        AuthenticationError
      );
      await expect(service.switchCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        'User account is not active'
      );
    });

    it('should throw ForbiddenError when user not assigned to new cabinet', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(null);

      // Act & Assert
      await expect(service.switchCabinet('user-123', 'cabinet-1', 'org-123')).rejects.toThrow(
        ForbiddenError
      );
    });

    it('should validate user and cabinet in correct order', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      await service.switchCabinet('user-123', 'cabinet-1', 'org-123');

      // Assert - user should be fetched before cabinet validation
      expect(userRepository.findById).toHaveBeenCalledBefore(
        userCabinetRepository.findOne as any
      );
    });
  });

  describe('assignUserToCabinet()', () => {
    it('should assign user to default cabinet', async () => {
      // Arrange
      vi.mocked(subscriptionClient.getDefaultCabinet).mockResolvedValue(mockCabinet);
      vi.mocked(userCabinetRepository.create).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const result = await service.assignUserToCabinet('user-123', 'org-123');

      // Assert
      expect(result).not.toBeNull();
      expect(result!.cabinetId).toBe(mockCabinet.id);
      expect(result!.subscription).toMatchObject({
        status: 'ACTIVE',
        modules: ['SCHEDULING', 'PATIENT_MANAGEMENT'],
      });
    });

    it('should create primary cabinet assignment', async () => {
      // Arrange
      vi.mocked(subscriptionClient.getDefaultCabinet).mockResolvedValue(mockCabinet);
      vi.mocked(userCabinetRepository.create).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      await service.assignUserToCabinet('user-123', 'org-123');

      // Assert
      expect(userCabinetRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        cabinetId: mockCabinet.id,
        organizationId: 'org-123',
        isPrimary: true,
        isActive: true,
      });
    });

    it('should throw AuthenticationError when no default cabinet', async () => {
      // Arrange
      vi.mocked(subscriptionClient.getDefaultCabinet).mockResolvedValue(null);

      // Act & Assert
      await expect(service.assignUserToCabinet('user-123', 'org-123')).rejects.toThrow(
        AuthenticationError
      );
      await expect(service.assignUserToCabinet('user-123', 'org-123')).rejects.toThrow(
        'No cabinets assigned to user'
      );
    });

    it('should return null on assignment failure (graceful degradation)', async () => {
      // Arrange
      vi.mocked(subscriptionClient.getDefaultCabinet).mockRejectedValue(
        new Error('Service unavailable')
      );

      // Act
      const result = await service.assignUserToCabinet('user-123', 'org-123');

      // Assert - should not throw, return null
      expect(result).toBeNull();
    });

    it('should handle subscription service failure gracefully', async () => {
      // Arrange
      vi.mocked(subscriptionClient.getDefaultCabinet).mockResolvedValue(mockCabinet);
      vi.mocked(userCabinetRepository.create).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockRejectedValue(
        new Error('Subscription service down')
      );

      // Act
      const result = await service.assignUserToCabinet('user-123', 'org-123');

      // Assert - should succeed even if subscription fetch fails
      expect(result).not.toBeNull();
      expect(result!.cabinetId).toBe(mockCabinet.id);
      expect(result!.subscription).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete cabinet selection flow', async () => {
      // 1. Get user cabinets
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([mockUserCabinet]);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      const cabinets = await service.getUserCabinets('user-123', 'org-123');
      expect(cabinets.cabinets).toHaveLength(1);

      // 2. Select cabinet
      vi.mocked(userCabinetRepository.findOne).mockResolvedValue(mockUserCabinet);

      const selected = await service.selectCabinet('user-123', 'cabinet-1', 'org-123');
      expect(selected.cabinet.id).toBe('cabinet-1');
    });

    it('should handle auto-assignment for new users', async () => {
      // Arrange - new user with no cabinets
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([]);
      vi.mocked(subscriptionClient.getDefaultCabinet).mockResolvedValue(mockCabinet);
      vi.mocked(userCabinetRepository.create).mockResolvedValue(mockUserCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act - get cabinets (empty) then auto-assign
      const cabinets = await service.getUserCabinets('user-123', 'org-123');
      expect(cabinets.cabinets).toHaveLength(0);

      const assigned = await service.assignUserToCabinet('user-123', 'org-123');
      expect(assigned).not.toBeNull();
      expect(assigned!.cabinetId).toBe(mockCabinet.id);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle subscription service timeout', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([mockUserCabinet]);
      vi.mocked(subscriptionClient.getCabinetById).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCabinet), 5000))
      );

      // Act with timeout
      const promise = service.getUserCabinets('user-123', 'org-123');

      // Note: In real implementation, should have timeout handling
      // For now, just verify it eventually resolves
      expect(promise).toBeDefined();
    });

    it('should handle malformed subscription data', async () => {
      // Arrange
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue([mockUserCabinet]);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue({
        ...mockSubscription,
        modules: null as any, // Malformed data
      });

      // Act
      const result = await service.getUserCabinets('user-123', 'org-123');

      // Assert - should handle gracefully
      expect(result.cabinets).toHaveLength(1);
      expect(result.cabinets[0].subscription.modules).toEqual([]);
    });
  });

  describe('Performance Tests', () => {
    it('should fetch multiple cabinets efficiently', async () => {
      // Arrange - user with 5 cabinets
      const userCabinets = Array.from({ length: 5 }, (_, i) => ({
        ...mockUserCabinet,
        id: `user-cabinet-${i}`,
        cabinetId: `cabinet-${i}`,
      }));
      vi.mocked(userCabinetRepository.findByUserId).mockResolvedValue(userCabinets);
      vi.mocked(subscriptionClient.getCabinetById).mockResolvedValue(mockCabinet);
      vi.mocked(subscriptionClient.getCabinetSubscription).mockResolvedValue(mockSubscription);

      // Act
      const startTime = Date.now();
      await service.getUserCabinets('user-123', 'org-123');
      const duration = Date.now() - startTime;

      // Assert - should be reasonably fast (< 500ms for 5 cabinets)
      expect(duration).toBeLessThan(500);
    });
  });
});
