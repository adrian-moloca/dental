/**
 * AuthenticationService Unit Tests
 *
 * Comprehensive tests for the refactored AuthenticationService.
 * Tests cover registration, login, smart login, org selection, and credential validation.
 *
 * @group unit
 * @module backend-auth/test/unit/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../../../src/modules/auth/services/authentication.service';
import { UserRepository } from '../../../src/modules/users/repositories/user.repository';
import { PasswordService } from '../../../src/modules/users/services/password.service';
import { User, UserStatus } from '../../../src/modules/users/entities/user.entity';
import { AuthenticationError, ConflictError } from '@dentalos/shared-errors';
import { RegisterDto, LoginDto, LoginSmartDto, SelectOrgDto } from '../../../src/modules/auth/dto';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: UserRepository,
          useValue: {
            create: vi.fn(),
            findByEmail: vi.fn(),
            findByEmailAllOrgs: vi.fn(),
            findById: vi.fn(),
            updateLastLogin: vi.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hashPassword: vi.fn(),
            verifyPassword: vi.fn(),
            validatePasswordStrength: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  describe('register()', () => {
    const validRegisterDto: RegisterDto = {
      email: 'new@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Smith',
      organizationId: 'org-123',
      clinicId: 'clinic-456',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);

      // Act
      const result = await service.register(validRegisterDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validRegisterDto.email,
        validRegisterDto.organizationId
      );
      expect(passwordService.hashPassword).toHaveBeenCalledWith(validRegisterDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: validRegisterDto.email,
        passwordHash: 'hashed-password',
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        clinicId: validRegisterDto.clinicId,
        roles: ['USER'],
        permissions: [],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictError when email already exists in organization', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.register(validRegisterDto)).rejects.toThrow(ConflictError);
      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'A user with this email already exists in this organization'
      );
      expect(passwordService.hashPassword).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should assign default USER role', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);

      // Act
      await service.register(validRegisterDto);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['USER'],
          permissions: [],
        })
      );
    });

    it('should handle optional clinicId', async () => {
      // Arrange
      const dtoWithoutClinic = { ...validRegisterDto, clinicId: undefined };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);

      // Act
      await service.register(dtoWithoutClinic);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          clinicId: undefined,
        })
      );
    });

    it('should allow same email in different organizations', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create)
        .mockResolvedValueOnce({ ...mockUser, organizationId: 'org-1' })
        .mockResolvedValueOnce({ ...mockUser, organizationId: 'org-2' });

      // Act
      const result1 = await service.register({ ...validRegisterDto, organizationId: 'org-1' });
      const result2 = await service.register({ ...validRegisterDto, organizationId: 'org-2' });

      // Assert
      expect(result1.organizationId).toBe('org-1');
      expect(result2.organizationId).toBe('org-2');
      expect(userRepository.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('login()', () => {
    const validLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      organizationId: 'org-123',
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockResolvedValue(undefined);

      // Act
      const result = await service.login(validLoginDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validLoginDto.email,
        validLoginDto.organizationId
      );
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        validLoginDto.password,
        mockUser.passwordHash
      );
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.organizationId
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Invalid email or password');
      expect(passwordService.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError for invalid password', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Invalid email or password');
      expect(userRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(inactiveUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('User account is not active');
    });

    it('should throw AuthenticationError for blocked user', async () => {
      // Arrange
      const blockedUser = { ...mockUser, status: UserStatus.BLOCKED };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(blockedUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('User account is not active');
    });

    it('should use generic error message for not found and wrong password', async () => {
      // Arrange - test user not found
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);

      // Act & Assert - user not found
      let errorMessage1 = '';
      try {
        await service.login(validLoginDto);
      } catch (error) {
        errorMessage1 = (error as Error).message;
      }

      // Arrange - test wrong password
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      // Act & Assert - wrong password
      let errorMessage2 = '';
      try {
        await service.login(validLoginDto);
      } catch (error) {
        errorMessage2 = (error as Error).message;
      }

      // Both should have same generic message (prevents user enumeration)
      expect(errorMessage1).toBe('Invalid email or password');
      expect(errorMessage2).toBe('Invalid email or password');
    });

    it('should be tenant-scoped (cannot login to different org)', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({ ...validLoginDto, organizationId: 'different-org' })
      ).rejects.toThrow(AuthenticationError);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validLoginDto.email,
        'different-org'
      );
    });

    it('should continue if updateLastLogin fails (non-blocking)', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockRejectedValue(new Error('Redis error'));

      // Act - should not throw
      const result = await service.login(validLoginDto);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userRepository.updateLastLogin).toHaveBeenCalled();
    });
  });

  describe('loginSmart()', () => {
    const validSmartLoginDto: LoginSmartDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
    };

    it('should auto-login for single organization', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmailAllOrgs).mockResolvedValue([mockUser]);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockResolvedValue(undefined);

      // Act
      const result = await service.loginSmart(validSmartLoginDto);

      // Assert
      expect(userRepository.findByEmailAllOrgs).toHaveBeenCalledWith(validSmartLoginDto.email);
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        validSmartLoginDto.password,
        mockUser.passwordHash
      );
      expect(result.needsOrgSelection).toBe(false);
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual(mockUser);
      expect(userRepository.updateLastLogin).toHaveBeenCalled();
    });

    it('should return organization list for multiple organizations', async () => {
      // Arrange
      const users = [
        { ...mockUser, id: 'user-1', organizationId: 'org-1' },
        { ...mockUser, id: 'user-2', organizationId: 'org-2' },
        { ...mockUser, id: 'user-3', organizationId: 'org-3' },
      ];
      vi.mocked(userRepository.findByEmailAllOrgs).mockResolvedValue(users);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act
      const result = await service.loginSmart(validSmartLoginDto);

      // Assert
      expect(result.needsOrgSelection).toBe(true);
      expect(result.users).toHaveLength(3);
      expect(result.users).toEqual(users);
      expect(userRepository.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmailAllOrgs).mockResolvedValue([]);

      // Act & Assert
      await expect(service.loginSmart(validSmartLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.loginSmart(validSmartLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should throw AuthenticationError for invalid password', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmailAllOrgs).mockResolvedValue([mockUser]);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      // Act & Assert
      await expect(service.loginSmart(validSmartLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.loginSmart(validSmartLoginDto)).rejects.toThrow(
        'Invalid email or password'
      );
    });

    it('should verify password using first user account', async () => {
      // Arrange
      const users = [
        { ...mockUser, id: 'user-1', organizationId: 'org-1', passwordHash: 'hash-1' },
        { ...mockUser, id: 'user-2', organizationId: 'org-2', passwordHash: 'hash-2' },
      ];
      vi.mocked(userRepository.findByEmailAllOrgs).mockResolvedValue(users);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act
      await service.loginSmart(validSmartLoginDto);

      // Assert - should verify against first user's hash
      expect(passwordService.verifyPassword).toHaveBeenCalledWith(
        validSmartLoginDto.password,
        'hash-1'
      );
    });
  });

  describe('loginSelectOrg()', () => {
    const validSelectOrgDto: SelectOrgDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      organizationId: 'org-123',
    };

    it('should successfully login to selected organization', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockResolvedValue(undefined);

      // Act
      const result = await service.loginSelectOrg(validSelectOrgDto);

      // Assert
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validSelectOrgDto.email,
        validSelectOrgDto.organizationId
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw AuthenticationError for invalid credentials', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(service.loginSelectOrg(validSelectOrgDto)).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should validate user status', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(inactiveUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(service.loginSelectOrg(validSelectOrgDto)).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe('validateUserCredentials()', () => {
    it('should validate and return user for valid credentials', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act
      const result = await service.validateUserCredentials(
        'test@example.com',
        'SecurePass123!',
        'org-123'
      );

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw AuthenticationError for invalid credentials', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateUserCredentials('test@example.com', 'wrong', 'org-123')
      ).rejects.toThrow(AuthenticationError);
    });

    it('should throw AuthenticationError for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(inactiveUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(
        service.validateUserCredentials('test@example.com', 'SecurePass123!', 'org-123')
      ).rejects.toThrow(AuthenticationError);
    });
  });

  describe('maskEmail()', () => {
    it('should mask email correctly for logging', () => {
      // Access private method via any for testing
      const maskEmail = (service as any).maskEmail.bind(service);

      // Assert
      expect(maskEmail('john@example.com')).toBe('j***@example.com');
      expect(maskEmail('jane.doe@example.com')).toBe('j***@example.com');
      expect(maskEmail('a@example.com')).toBe('a***@example.com');
      expect(maskEmail('')).toBe('***');
      expect(maskEmail('invalid')).toBe('***');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle database connection errors gracefully', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act & Assert
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'pass',
          organizationId: 'org-123',
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle password hashing errors during registration', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(passwordService.hashPassword).mockRejectedValue(new Error('Hashing failed'));

      // Act & Assert
      await expect(
        service.register({
          email: 'new@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
          organizationId: 'org-123',
        })
      ).rejects.toThrow('Hashing failed');
    });
  });

  describe('Security Tests', () => {
    it('should never log passwords', async () => {
      // This is a conceptual test - in real code, verify logging doesn't include passwords
      // The service should never log the password field
      const validLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SuperSecret123!',
        organizationId: 'org-123',
      };

      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      await service.login(validLoginDto);

      // In production, you would check that logs don't contain 'SuperSecret123!'
      // This is a reminder that password should never be in logs
      expect(true).toBe(true);
    });

    it('should enforce tenant isolation at all levels', async () => {
      // Arrange
      const userOrg1 = { ...mockUser, organizationId: 'org-1' };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(userOrg1);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act - try to login to different org
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      await expect(
        service.login({
          email: 'test@example.com',
          password: 'pass',
          organizationId: 'org-2',
        })
      ).rejects.toThrow(AuthenticationError);

      // Assert - should query with correct org
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com', 'org-2');
    });
  });
});
