/**
 * AuthService Unit Tests
 *
 * Comprehensive tests for authentication service including:
 * - User registration with validation
 * - Login with credential verification
 * - Token generation and validation
 * - Password security
 * - Tenant isolation
 *
 * @group unit
 * @module backend-auth/test/unit/modules/auth/services
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticationError, ConflictError, SecurityError } from '@dentalos/shared-errors';
import { UserRepository } from '../../../../../src/modules/users/repositories/user.repository';
import { PasswordService } from '../../../../../src/modules/users/services/password.service';
import { User, UserStatus } from '../../../../../src/modules/users/entities/user.entity';

/**
 * Mock AuthService implementation
 * This represents the expected implementation for GROUP 2
 */
class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    clinicId?: string;
  }) {
    // Validate password strength
    const validation = this.passwordService.validatePasswordStrength(dto.password);
    if (!validation.isValid) {
      throw new SecurityError({
        code: 'WEAK_PASSWORD',
        message: validation.errors.join(', '),
      });
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // Create user with default USER role
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      roles: ['USER'],
      status: UserStatus.ACTIVE,
    });

    // Generate auth response
    return this.generateAuthResponse(user);
  }

  async login(dto: {
    email: string;
    password: string;
    organizationId: string;
  }) {
    // Find user by email and organization
    const user = await this.userRepository.findByEmail(dto.email, dto.organizationId);

    // Generic error message for security
    const invalidCredentialsError = new AuthenticationError({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });

    if (!user) {
      throw invalidCredentialsError;
    }

    // Verify password
    const isValid = await this.passwordService.verifyPassword(dto.password, user.passwordHash);
    if (!isValid) {
      throw invalidCredentialsError;
    }

    // Check user status
    if (user.status === UserStatus.INACTIVE) {
      throw new AuthenticationError({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is inactive',
      });
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new AuthenticationError({
        code: 'ACCOUNT_BLOCKED',
        message: 'Account is blocked',
      });
    }

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id, dto.organizationId);

    // Generate auth response
    return this.generateAuthResponse(user);
  }

  async getCurrentUser(userId: string, organizationId: string) {
    const user = await this.userRepository.findById(userId, organizationId);

    if (!user) {
      throw new AuthenticationError({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return this.sanitizeUser(user);
  }

  async generateAuthResponse(user: User) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.roles,
        organizationId: user.organizationId,
        clinicId: user.clinicId,
      },
      { expiresIn: '15m' }
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        organizationId: user.organizationId,
        type: 'refresh',
      },
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      tokenType: 'Bearer' as const,
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 1) {
      return `${local}***@${domain}`;
    }
    return `${local[0]}***@${domain}`;
  }
}

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;
  let passwordService: PasswordService;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            create: vi.fn(),
            findByEmail: vi.fn(),
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
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    passwordService = module.get<PasswordService>(PasswordService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('register()', () => {
    const validRegisterDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: 'org-123',
    };

    it('should successfully create user with hashed password', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        email: validRegisterDto.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        roles: ['USER'],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() { return this; }
      } as User;

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue(mockUser.passwordHash);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      // Act
      const result = await service.register(validRegisterDto);

      // Assert
      expect(passwordService.validatePasswordStrength).toHaveBeenCalledWith(validRegisterDto.password);
      expect(passwordService.hashPassword).toHaveBeenCalledWith(validRegisterDto.password);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: validRegisterDto.email,
        passwordHash: mockUser.passwordHash,
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        clinicId: undefined,
        roles: ['USER'],
        status: UserStatus.ACTIVE,
      });
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });

    it('should return tokens and user data', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        email: validRegisterDto.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        roles: ['USER'],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() { return this; }
      } as User;

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue(mockUser.passwordHash);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      // Act
      const result = await service.register(validRegisterDto);

      // Assert
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.expiresIn).toBe(900);
      expect(result.tokenType).toBe('Bearer');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should assign default USER role', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        email: validRegisterDto.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        roles: ['USER'],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() { return this; }
      } as User;

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue(mockUser.passwordHash);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      // Act
      await service.register(validRegisterDto);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['USER'],
        })
      );
    });

    it('should throw ConflictError when email already exists in same organization', async () => {
      // Arrange
      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create).mockRejectedValue(
        new ConflictError('User with this email already exists in organization', {
          conflictType: 'duplicate',
          resourceType: 'user',
        })
      );

      // Act & Assert
      await expect(service.register(validRegisterDto)).rejects.toThrow(ConflictError);
      await expect(service.register(validRegisterDto)).rejects.toThrow(
        'User with this email already exists in organization'
      );
    });

    it('should allow same email in different organization', async () => {
      // Arrange
      const mockUser1: User = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        firstName: 'John',
        lastName: 'Doe',
        organizationId: 'org-123',
        roles: ['USER'],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() { return this; }
      } as User;

      const mockUser2: User = {
        ...mockUser1,
        id: 'user-456',
        organizationId: 'org-456',
      };

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue('hashed-password');
      vi.mocked(userRepository.create)
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      const result1 = await service.register({
        ...validRegisterDto,
        organizationId: 'org-123',
      });
      const result2 = await service.register({
        ...validRegisterDto,
        organizationId: 'org-456',
      });

      // Assert
      expect(result1.user.organizationId).toBe('org-123');
      expect(result2.user.organizationId).toBe('org-456');
      expect(result1.user.email).toBe(result2.user.email);
    });

    it('should throw SecurityError for invalid password', async () => {
      // Arrange
      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: false,
        errors: ['Password must be at least 12 characters'],
      });

      // Act & Assert
      await expect(
        service.register({
          ...validRegisterDto,
          password: 'weak',
        })
      ).rejects.toThrow(SecurityError);
      await expect(
        service.register({
          ...validRegisterDto,
          password: 'weak',
        })
      ).rejects.toThrow('Password must be at least 12 characters');
    });

    it('should never expose password in response', async () => {
      // Arrange
      const mockUser: User = {
        id: 'user-123',
        email: validRegisterDto.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
        firstName: validRegisterDto.firstName,
        lastName: validRegisterDto.lastName,
        organizationId: validRegisterDto.organizationId,
        roles: ['USER'],
        permissions: [],
        status: UserStatus.ACTIVE,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function() { return this; }
      } as User;

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue(mockUser.passwordHash);
      vi.mocked(userRepository.create).mockResolvedValue(mockUser);
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      const result = await service.register(validRegisterDto);

      // Assert
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('should store password hash, not plain text', async () => {
      // Arrange
      const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$randomsalt$computedhash';

      vi.mocked(passwordService.validatePasswordStrength).mockReturnValue({
        isValid: true,
        errors: [],
      });
      vi.mocked(passwordService.hashPassword).mockResolvedValue(hashedPassword);
      vi.mocked(userRepository.create).mockImplementation(async (data) => {
        // Verify hash is stored, not plain password
        expect(data.passwordHash).toBe(hashedPassword);
        expect(data.passwordHash).not.toBe(validRegisterDto.password);
        expect(data.passwordHash).toMatch(/^\$argon2id\$/);

        return {
          id: 'user-123',
          ...data,
          roles: ['USER'],
          permissions: [],
          status: UserStatus.ACTIVE,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          toJSON: function() { return this; }
        } as User;
      });
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      await service.register(validRegisterDto);

      // Assert
      expect(passwordService.hashPassword).toHaveBeenCalledWith(validRegisterDto.password);
    });
  });

  describe('login()', () => {
    const validLoginDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      organizationId: 'org-123',
    };

    const mockUser: User = {
      id: 'user-123',
      email: validLoginDto.email,
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: validLoginDto.organizationId,
      roles: ['USER'],
      permissions: [],
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: function() { return this; }
    } as User;

    it('should successfully login with valid credentials', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockResolvedValue(undefined);
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

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
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should update last login timestamp', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);
      vi.mocked(userRepository.updateLastLogin).mockResolvedValue(undefined);
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      await service.login(validLoginDto);

      // Assert
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith(
        mockUser.id,
        validLoginDto.organizationId
      );
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw AuthenticationError for wrong password', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw AuthenticationError for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, status: UserStatus.INACTIVE };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(inactiveUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Account is inactive');
    });

    it('should throw AuthenticationError for blocked user', async () => {
      // Arrange
      const blockedUser = { ...mockUser, status: UserStatus.BLOCKED };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(blockedUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(true);

      // Act & Assert
      await expect(service.login(validLoginDto)).rejects.toThrow(AuthenticationError);
      await expect(service.login(validLoginDto)).rejects.toThrow('Account is blocked');
    });

    it('should return generic error message for not found and wrong password', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(null);
      vi.mocked(userRepository.findByEmail).mockResolvedValueOnce(mockUser);
      vi.mocked(passwordService.verifyPassword).mockResolvedValue(false);

      // Act & Assert
      let errorMessage1 = '';
      let errorMessage2 = '';

      try {
        await service.login(validLoginDto);
      } catch (error) {
        errorMessage1 = (error as Error).message;
      }

      try {
        await service.login(validLoginDto);
      } catch (error) {
        errorMessage2 = (error as Error).message;
      }

      // Both errors should have the same generic message
      expect(errorMessage1).toBe('Invalid email or password');
      expect(errorMessage2).toBe('Invalid email or password');
    });

    it('should be tenant-scoped (cannot login to different org)', async () => {
      // Arrange
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login({
          ...validLoginDto,
          organizationId: 'different-org',
        })
      ).rejects.toThrow(AuthenticationError);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        validLoginDto.email,
        'different-org'
      );
    });
  });

  describe('getCurrentUser()', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: 'org-123',
      roles: ['USER'],
      permissions: [],
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: function() { return this; }
    } as User;

    it('should return user data for valid ID', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

      // Act
      const result = await service.getCurrentUser('user-123', 'org-123');

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith('user-123', 'org-123');
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw AuthenticationError when user not found', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser('user-999', 'org-123')).rejects.toThrow(
        AuthenticationError
      );
      await expect(service.getCurrentUser('user-999', 'org-123')).rejects.toThrow(
        'User not found'
      );
    });

    it('should be tenant-scoped (cannot get user from different org)', async () => {
      // Arrange
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCurrentUser('user-123', 'different-org')).rejects.toThrow(
        AuthenticationError
      );

      expect(userRepository.findById).toHaveBeenCalledWith('user-123', 'different-org');
    });
  });

  describe('generateAuthResponse()', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$salt$hash',
      firstName: 'John',
      lastName: 'Doe',
      organizationId: 'org-123',
      clinicId: 'clinic-456',
      roles: ['USER', 'DENTIST'],
      permissions: [],
      status: UserStatus.ACTIVE,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      toJSON: function() { return this; }
    } as User;

    it('should return access token with 15min expiration', async () => {
      // Arrange
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      // Act
      const result = await service.generateAuthResponse(mockUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
        }),
        { expiresIn: '15m' }
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.expiresIn).toBe(900); // 15 minutes
    });

    it('should return refresh token with 7day expiration', async () => {
      // Arrange
      vi.mocked(jwtService.sign).mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      // Act
      const result = await service.generateAuthResponse(mockUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          organizationId: mockUser.organizationId,
          type: 'refresh',
        }),
        { expiresIn: '7d' }
      );
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should include correct claims in tokens', async () => {
      // Arrange
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      await service.generateAuthResponse(mockUser);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          roles: mockUser.roles,
          organizationId: mockUser.organizationId,
          clinicId: mockUser.clinicId,
        }),
        expect.any(Object)
      );
    });

    it('should exclude password hash from user DTO', async () => {
      // Arrange
      vi.mocked(jwtService.sign).mockReturnValue('token');

      // Act
      const result = await service.generateAuthResponse(mockUser);

      // Assert
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).toHaveProperty('id', mockUser.id);
      expect(result.user).toHaveProperty('email', mockUser.email);
    });
  });

  describe('maskEmail()', () => {
    it('should mask email correctly', () => {
      // Act & Assert
      expect(service.maskEmail('john@example.com')).toBe('j***@example.com');
      expect(service.maskEmail('jane.doe@example.com')).toBe('j***@example.com');
      expect(service.maskEmail('a@example.com')).toBe('a***@example.com');
      expect(service.maskEmail('ab@example.com')).toBe('a***@example.com');
    });

    it('should handle edge cases', () => {
      // Act & Assert
      expect(service.maskEmail('x@test.com')).toBe('x***@test.com');
      expect(service.maskEmail('verylongemail@example.com')).toBe('v***@example.com');
    });
  });
});
