/**
 * Unit Tests for UserRepository
 *
 * Test coverage:
 * - Tenant isolation on all queries
 * - Email uniqueness per organization
 * - Create user with conflict detection
 * - Find users by email and ID
 * - Update operations with tenant validation
 * - Status transitions
 * - Last login tracking
 * - Error handling (ConflictError, NotFoundError)
 *
 * @module test/unit/modules/users/repositories
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../../../src/modules/users/repositories/user.repository';
import { User, UserStatus } from '../../../../../src/modules/users/entities/user.entity';
import { ConflictError, NotFoundError } from '@dentalos/shared-errors';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

  const mockOrganizationId = '550e8400-e29b-41d4-a716-446655440000' as any;
  const mockClinicId = '550e8400-e29b-41d4-a716-446655440001' as any;
  const mockUserId = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(async () => {
    // Create mock TypeORM repository
    mockTypeOrmRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email within organization', async () => {
      const mockUser: Partial<User> = {
        id: mockUserId,
        email: 'test@example.com',
        organizationId: mockOrganizationId,
        firstName: 'John',
        lastName: 'Doe',
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await userRepository.findByEmail(
        'test@example.com',
        mockOrganizationId,
      );

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'test@example.com',
          organizationId: mockOrganizationId,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail(
        'nonexistent@example.com',
        mockOrganizationId,
      );

      expect(result).toBeNull();
    });

    it('should filter by organizationId to prevent cross-tenant access', async () => {
      await userRepository.findByEmail('test@example.com', mockOrganizationId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should find user by ID within organization', async () => {
      const mockUser: Partial<User> = {
        id: mockUserId,
        email: 'test@example.com',
        organizationId: mockOrganizationId,
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await userRepository.findById(mockUserId, mockOrganizationId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockUserId,
          organizationId: mockOrganizationId,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found in organization', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById(mockUserId, mockOrganizationId);

      expect(result).toBeNull();
    });

    it('should enforce tenant isolation', async () => {
      await userRepository.findById(mockUserId, mockOrganizationId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
          }),
        }),
      );
    });
  });

  describe('create', () => {
    const createUserData = {
      email: 'newuser@example.com',
      passwordHash: 'hashedPassword123',
      firstName: 'Jane',
      lastName: 'Smith',
      organizationId: mockOrganizationId,
    };

    it('should create user successfully', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null); // No existing user

      const createdUser: Partial<User> = {
        id: mockUserId,
        ...createUserData,
        roles: [],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
      };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser as User);

      const result = await userRepository.create(createUserData);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserData.email,
          organizationId: mockOrganizationId,
        },
      });
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictError if email exists in organization', async () => {
      const existingUser: Partial<User> = {
        id: 'existing-id',
        email: createUserData.email,
        organizationId: mockOrganizationId,
      };

      mockTypeOrmRepository.findOne.mockResolvedValue(existingUser as User);

      await expect(userRepository.create(createUserData)).rejects.toThrow(
        ConflictError,
      );
      await expect(userRepository.create(createUserData)).rejects.toThrow(
        /already exists/,
      );
    });

    it('should allow same email in different organizations', async () => {
      const otherOrgId = '550e8400-e29b-41d4-a716-446655440999' as any;

      // First call: check for existing user (not found)
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const userData = {
        ...createUserData,
        organizationId: otherOrgId,
      };

      const createdUser: Partial<User> = {
        id: mockUserId,
        ...userData,
        roles: [],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
      };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser as User);

      await userRepository.create(userData);

      // Verify it checked within the correct organization
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: createUserData.email,
          organizationId: otherOrgId,
        },
      });
    });

    it('should set default values for optional fields', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const createdUser: Partial<User> = {
        id: mockUserId,
        ...createUserData,
        roles: [],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
      };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser as User);

      await userRepository.create(createUserData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [],
          permissions: [],
          status: UserStatus.ACTIVE,
          emailVerified: false,
        }),
      );
    });

    it('should accept custom roles, permissions, and status', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const customData = {
        ...createUserData,
        roles: ['DENTIST', 'CLINIC_ADMIN'],
        permissions: ['patients:read', 'appointments:write'],
        status: UserStatus.INVITED,
        emailVerified: true,
      };

      const createdUser: Partial<User> = {
        id: mockUserId,
        ...customData,
      };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser as User);

      await userRepository.create(customData);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['DENTIST', 'CLINIC_ADMIN'],
          permissions: ['patients:read', 'appointments:write'],
          status: UserStatus.INVITED,
          emailVerified: true,
        }),
      );
    });

    it('should include clinicId if provided', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const dataWithClinic = {
        ...createUserData,
        clinicId: mockClinicId,
      };

      const createdUser: Partial<User> = {
        id: mockUserId,
        ...dataWithClinic,
        roles: [],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
      };

      mockTypeOrmRepository.create.mockReturnValue(createdUser as User);
      mockTypeOrmRepository.save.mockResolvedValue(createdUser as User);

      await userRepository.create(dataWithClinic);

      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: mockClinicId,
        }),
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any);

      await userRepository.updateLastLogin(mockUserId, mockOrganizationId);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { id: mockUserId, organizationId: mockOrganizationId },
        { lastLoginAt: expect.any(Date) },
      );
    });

    it('should throw NotFoundError if user not found', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        userRepository.updateLastLogin(mockUserId, mockOrganizationId),
      ).rejects.toThrow(NotFoundError);
    });

    it('should enforce tenant isolation on update', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any);

      await userRepository.updateLastLogin(mockUserId, mockOrganizationId);

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: mockOrganizationId,
        }),
        expect.any(Object),
      );
    });
  });

  describe('findAllActive', () => {
    it('should find all active users in organization', async () => {
      const mockUsers: Partial<User>[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          organizationId: mockOrganizationId,
          status: UserStatus.ACTIVE,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          organizationId: mockOrganizationId,
          status: UserStatus.ACTIVE,
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockUsers as User[]);

      const result = await userRepository.findAllActive(mockOrganizationId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          organizationId: mockOrganizationId,
          status: UserStatus.ACTIVE,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no active users found', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await userRepository.findAllActive(mockOrganizationId);

      expect(result).toEqual([]);
    });

    it('should enforce tenant isolation', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      await userRepository.findAllActive(mockOrganizationId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockOrganizationId,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should find all users regardless of status', async () => {
      const mockUsers: Partial<User>[] = [
        {
          id: 'user-1',
          status: UserStatus.ACTIVE,
          organizationId: mockOrganizationId,
        },
        {
          id: 'user-2',
          status: UserStatus.INACTIVE,
          organizationId: mockOrganizationId,
        },
        {
          id: 'user-3',
          status: UserStatus.BLOCKED,
          organizationId: mockOrganizationId,
        },
      ];

      mockTypeOrmRepository.find.mockResolvedValue(mockUsers as User[]);

      const result = await userRepository.findAll(mockOrganizationId);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({
        where: {
          organizationId: mockOrganizationId,
        },
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result).toHaveLength(3);
    });
  });

  describe('updateStatus', () => {
    it('should update user status', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any);

      await userRepository.updateStatus(
        mockUserId,
        UserStatus.BLOCKED,
        mockOrganizationId,
      );

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { id: mockUserId, organizationId: mockOrganizationId },
        { status: UserStatus.BLOCKED },
      );
    });

    it('should throw NotFoundError if user not found', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0 } as any);

      await expect(
        userRepository.updateStatus(
          mockUserId,
          UserStatus.BLOCKED,
          mockOrganizationId,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('should enforce tenant isolation on status update', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any);

      await userRepository.updateStatus(
        mockUserId,
        UserStatus.INACTIVE,
        mockOrganizationId,
      );

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: mockOrganizationId,
        }),
        expect.any(Object),
      );
    });
  });

  describe('Tenant isolation', () => {
    it('should never query without organizationId filter', async () => {
      // Test all query methods
      await userRepository.findByEmail('test@example.com', mockOrganizationId);
      await userRepository.findById(mockUserId, mockOrganizationId);
      await userRepository.findAllActive(mockOrganizationId);
      await userRepository.findAll(mockOrganizationId);

      // Verify all calls included organizationId
      const allCalls = [
        ...mockTypeOrmRepository.findOne.mock.calls,
        ...mockTypeOrmRepository.find.mock.calls,
      ];

      allCalls.forEach((call) => {
        expect(call[0]?.where).toHaveProperty('organizationId');
      });
    });

    it('should never update without organizationId filter', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 } as any);

      await userRepository.updateLastLogin(mockUserId, mockOrganizationId);
      await userRepository.updateStatus(
        mockUserId,
        UserStatus.ACTIVE,
        mockOrganizationId,
      );

      // Verify all update calls included organizationId
      mockTypeOrmRepository.update.mock.calls.forEach((call) => {
        expect(call[0]).toHaveProperty('organizationId');
      });
    });
  });
});
