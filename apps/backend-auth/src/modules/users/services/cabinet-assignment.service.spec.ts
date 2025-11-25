/**
 * Cabinet Assignment Service Tests
 *
 * Test suite for automatic cabinet assignment during user registration.
 * Tests success scenarios, failure modes, edge cases, and graceful degradation.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CabinetAssignmentService } from './cabinet-assignment.service';
import { UserCabinetRepository } from '../repositories/user-cabinet.repository';
import { UserRepository } from '../repositories/user.repository';
import { SubscriptionClientService } from '../../auth/services/subscription-client.service';
import { ConflictError, NotFoundError, InfrastructureError } from '@dentalos/shared-errors';
import { EntityStatus } from '@dentalos/shared-types';
import type { UUID, OrganizationId } from '@dentalos/shared-types';

describe('CabinetAssignmentService', () => {
  let service: CabinetAssignmentService;
  let userCabinetRepository: jest.Mocked<UserCabinetRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let subscriptionClient: jest.Mocked<SubscriptionClientService>;

  const mockUserId: UUID = '550e8400-e29b-41d4-a716-446655440001' as UUID;
  const mockOrganizationId: OrganizationId =
    '550e8400-e29b-41d4-a716-446655440002' as OrganizationId;
  const mockCabinetId: UUID = '550e8400-e29b-41d4-a716-446655440003' as UUID;

  const mockUser = {
    id: mockUserId,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    organizationId: mockOrganizationId,
    roles: ['USER'],
    permissions: [],
    status: 'ACTIVE',
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCabinet = {
    id: mockCabinetId,
    organizationId: mockOrganizationId,
    name: 'Main Cabinet',
    code: 'MAIN',
    isDefault: true,
    status: EntityStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserCabinet = {
    id: '550e8400-e29b-41d4-a716-446655440004' as UUID,
    userId: mockUserId,
    cabinetId: mockCabinetId,
    organizationId: mockOrganizationId,
    isPrimary: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock implementations
    const mockUserCabinetRepository = {
      findByUserId: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockSubscriptionClient = {
      getDefaultCabinet: jest.fn(),
      createCabinet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CabinetAssignmentService,
        {
          provide: UserCabinetRepository,
          useValue: mockUserCabinetRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: SubscriptionClientService,
          useValue: mockSubscriptionClient,
        },
      ],
    }).compile();

    service = module.get<CabinetAssignmentService>(CabinetAssignmentService);
    userCabinetRepository = module.get(UserCabinetRepository);
    userRepository = module.get(UserRepository);
    subscriptionClient = module.get(SubscriptionClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('autoAssignCabinetOnRegistration', () => {
    it('should skip assignment if user already has cabinets (idempotent)', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([mockUserCabinet]);

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
      expect(userCabinetRepository.findByUserId).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId,
        false // Include inactive
      );
      expect(subscriptionClient.getDefaultCabinet).not.toHaveBeenCalled();
      expect(userCabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should assign user to existing default cabinet', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(mockCabinet);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.create.mockResolvedValue(mockUserCabinet as any);

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
      expect(subscriptionClient.getDefaultCabinet).toHaveBeenCalledWith(mockOrganizationId);
      expect(userCabinetRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        cabinetId: mockCabinetId,
        organizationId: mockOrganizationId,
        isPrimary: true,
        isActive: true,
      });
    });

    it('should create default cabinet if none exists', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(null);
      subscriptionClient.createCabinet.mockResolvedValue(mockCabinet);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.create.mockResolvedValue(mockUserCabinet as any);

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: true,
      });
      expect(subscriptionClient.getDefaultCabinet).toHaveBeenCalledWith(mockOrganizationId);
      expect(subscriptionClient.createCabinet).toHaveBeenCalledWith({
        organizationId: mockOrganizationId,
        name: 'Main Cabinet',
        code: 'MAIN',
        isDefault: true,
        status: EntityStatus.ACTIVE,
      });
      expect(userCabinetRepository.create).toHaveBeenCalled();
    });

    it('should handle subscription service unavailable gracefully', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockRejectedValue(
        new InfrastructureError('Subscription service unavailable', {
          service: 'external_api',
          isTransient: true,
        })
      );

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Subscription service unavailable');
      expect(userCabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should handle cabinet creation failure gracefully', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(null);
      subscriptionClient.createCabinet.mockRejectedValue(
        new InfrastructureError('Cabinet creation failed', {
          service: 'external_api',
          isTransient: true,
        })
      );

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cabinet creation failed');
    });

    it('should handle user not found gracefully', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(mockCabinet);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found in organization');
      expect(userCabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should handle duplicate assignment gracefully (race condition)', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(mockCabinet);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.create.mockRejectedValue(
        new ConflictError('User already assigned to this cabinet', {
          conflictType: 'duplicate',
          resourceType: 'user_cabinet',
        })
      );

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      // Should treat conflict as success (idempotent)
      expect(result.success).toBe(true);
      expect(result.cabinetId).toBe(mockCabinetId);
    });
  });

  describe('getOrCreateDefaultCabinet', () => {
    it('should return existing default cabinet', async () => {
      // Arrange
      subscriptionClient.getDefaultCabinet.mockResolvedValue(mockCabinet);

      // Act
      const result = await service.getOrCreateDefaultCabinet(mockOrganizationId);

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
      expect(subscriptionClient.getDefaultCabinet).toHaveBeenCalledWith(mockOrganizationId);
      expect(subscriptionClient.createCabinet).not.toHaveBeenCalled();
    });

    it('should create new default cabinet if none exists', async () => {
      // Arrange
      subscriptionClient.getDefaultCabinet.mockResolvedValue(null);
      subscriptionClient.createCabinet.mockResolvedValue(mockCabinet);

      // Act
      const result = await service.getOrCreateDefaultCabinet(mockOrganizationId);

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: true,
      });
      expect(subscriptionClient.createCabinet).toHaveBeenCalledWith({
        organizationId: mockOrganizationId,
        name: 'Main Cabinet',
        code: 'MAIN',
        isDefault: true,
        status: EntityStatus.ACTIVE,
      });
    });

    it('should handle infrastructure errors gracefully', async () => {
      // Arrange
      subscriptionClient.getDefaultCabinet.mockRejectedValue(
        new InfrastructureError('Service unavailable', {
          service: 'external_api',
          isTransient: true,
        })
      );

      // Act
      const result = await service.getOrCreateDefaultCabinet(mockOrganizationId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Service unavailable');
    });
  });

  describe('assignUserToDefaultCabinet', () => {
    it('should assign user to cabinet successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userCabinetRepository.create.mockResolvedValue(mockUserCabinet as any);

      // Act
      const result = await service.assignUserToDefaultCabinet(
        mockUserId,
        mockCabinetId,
        mockOrganizationId
      );

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
      expect(userCabinetRepository.create).toHaveBeenCalledWith({
        userId: mockUserId,
        cabinetId: mockCabinetId,
        organizationId: mockOrganizationId,
        isPrimary: true,
        isActive: true,
      });
    });

    it('should skip assignment if already exists (idempotent)', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.findOne.mockResolvedValue(mockUserCabinet as any);

      // Act
      const result = await service.assignUserToDefaultCabinet(
        mockUserId,
        mockCabinetId,
        mockOrganizationId
      );

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
      expect(userCabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.assignUserToDefaultCabinet(
        mockUserId,
        mockCabinetId,
        mockOrganizationId
      );

      // Assert
      expect(result).toEqual({
        success: false,
        created: false,
        error: 'User not found in organization',
      });
      expect(userCabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should handle conflict errors as success (idempotent)', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userCabinetRepository.create.mockRejectedValue(
        new ConflictError('User already assigned to this cabinet', {
          conflictType: 'duplicate',
          resourceType: 'user_cabinet',
        })
      );

      // Act
      const result = await service.assignUserToDefaultCabinet(
        mockUserId,
        mockCabinetId,
        mockOrganizationId
      );

      // Assert
      expect(result).toEqual({
        success: true,
        cabinetId: mockCabinetId,
        created: false,
      });
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userCabinetRepository.create.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.assignUserToDefaultCabinet(
        mockUserId,
        mockCabinetId,
        mockOrganizationId
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('Edge cases and concurrent operations', () => {
    it('should handle concurrent registrations gracefully', async () => {
      // Arrange - simulate race condition where cabinet is created between check and create
      userCabinetRepository.findByUserId.mockResolvedValue([]);
      subscriptionClient.getDefaultCabinet.mockResolvedValue(null);
      subscriptionClient.createCabinet.mockResolvedValue(mockCabinet);
      userCabinetRepository.findOne.mockResolvedValue(null);
      userRepository.findById.mockResolvedValue(mockUser as any);
      userCabinetRepository.create.mockRejectedValue(
        new ConflictError('User already assigned to this cabinet', {
          conflictType: 'duplicate',
          resourceType: 'user_cabinet',
        })
      );

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert - should treat as success due to idempotent handling
      expect(result.success).toBe(true);
    });

    it('should handle unexpected exceptions gracefully', async () => {
      // Arrange
      userCabinetRepository.findByUserId.mockRejectedValue(new Error('Database connection lost'));

      // Act
      const result = await service.autoAssignCabinetOnRegistration(mockUserId, mockOrganizationId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection lost');
    });
  });
});
