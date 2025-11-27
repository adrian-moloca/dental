/**
 * Authentication Service
 *
 * Handles core authentication operations: user registration, login variants,
 * and credential validation. This service focuses solely on authentication
 * logic without handling tokens, sessions, or subscriptions.
 *
 * Responsibilities:
 * - User registration with password hashing
 * - Standard login with email + password + organizationId
 * - Smart login without organizationId (auto-detects organizations)
 * - Organization selection after multi-org smart login
 * - Credential validation for protected operations
 *
 * Security:
 * - Generic error messages to prevent user enumeration
 * - Password verification without logging sensitive data
 * - User status validation (only ACTIVE users)
 * - Tenant isolation enforced at all levels
 *
 * @module modules/auth/services
 */

import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';
import { PasswordService } from '../../users/services/password.service';
import { PasswordHistoryService } from '../../password-reset/services/password-history.service';
import { StructuredLogger } from '@dentalos/shared-infra';
import { RegisterDto, LoginDto, LoginSmartDto, SelectOrgDto } from '../dto';
import { User, UserStatus } from '../../users/entities/user.entity';
import { AuthenticationError, ConflictError, AccountLockedError } from '@dentalos/shared-errors';
import type { OrganizationId } from '@dentalos/shared-types';

/**
 * Authentication Service
 * Handles user authentication operations
 */
@Injectable()
export class AuthenticationService {
  private readonly logger: StructuredLogger;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly passwordHistoryService: PasswordHistoryService
  ) {
    this.logger = new StructuredLogger('AuthenticationService');
  }

  /**
   * Register a new user
   *
   * Validates email uniqueness within organization, hashes password,
   * and creates user in database.
   *
   * @param dto - Registration data
   * @returns Created user entity
   * @throws {ConflictError} If email already exists in organization
   */
  async register(dto: RegisterDto): Promise<User> {
    this.logger.log(`Registration attempt for email: ${this.maskEmail(dto.email)}`);

    // Check if email already exists in organization
    const existingUser = await this.userRepository.findByEmail(dto.email, dto.organizationId);

    if (existingUser) {
      this.logger.warn(
        `Registration failed: Email already exists in organization ${dto.organizationId}`
      );
      throw new ConflictError('A user with this email already exists in this organization', {
        conflictType: 'duplicate',
        resourceType: 'user',
      });
    }

    // Hash password securely
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // Create user in database
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      organizationId: dto.organizationId,
      clinicId: dto.clinicId,
      roles: ['USER'], // Default role
      permissions: [], // No additional permissions by default
    });

    // Store initial password in history for password reuse prevention
    await this.passwordHistoryService.addPasswordToHistory(
      user.id,
      user.organizationId,
      passwordHash,
      'registration'
    );

    this.logger.log(`User registered successfully: ${user.id}`);
    return user;
  }

  /**
   * Login existing user
   *
   * Authenticates user with email, password, and organizationId.
   * Validates credentials and user status with brute-force protection.
   *
   * Security flow:
   * 1. Find user by email + organization
   * 2. Check if account is locked (throws 423 if locked)
   * 3. Validate password
   * 4. On failure: Record failed attempt, potentially lock account
   * 5. On success: Clear failed attempts, update last login
   *
   * @param dto - Login credentials
   * @returns Authenticated user entity
   * @throws {AccountLockedError} If account is locked (423)
   * @throws {AuthenticationError} If credentials invalid or user inactive (401)
   */
  async login(dto: LoginDto): Promise<User> {
    this.logger.log(`Login attempt for email: ${this.maskEmail(dto.email)}`);

    // Find user by email + organization
    const user = await this.userRepository.findByEmail(dto.email, dto.organizationId);

    // Check account lockout BEFORE password validation
    // This prevents timing attacks that could reveal lockout status
    if (user) {
      await this.checkAccountLockout(user.id, user.organizationId, dto.email);
    }

    // Validate credentials (handles user not found, wrong password, inactive status)
    await this.validateUserCredentialsInternal(user, dto.password, dto.email);

    // SUCCESS: Clear failed login attempts and update last login
    try {
      await this.userRepository.clearFailedLoginAttempts(user!.id, user!.organizationId);
      await this.userRepository.updateLastLogin(user!.id, user!.organizationId);
    } catch (error) {
      // Non-critical: Log but don't fail the login
      this.logger.error(
        `Failed to update login metadata for user ${user!.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    this.logger.log(`User logged in successfully: ${user!.id}`);
    return user!;
  }

  /**
   * Smart login - automatically resolve organization(s)
   *
   * Finds all organizations user belongs to and either auto-logs them in
   * (single org) or returns organization list for selection (multiple orgs).
   * Includes brute-force protection with account lockout.
   *
   * Security flow:
   * 1. Find all users with email across organizations
   * 2. Check lockout status for first user (all share same email identity)
   * 3. Validate password with failed attempt tracking
   * 4. On success: Clear failed attempts, return user(s)
   *
   * @param dto - Smart login credentials (email + password, no organizationId)
   * @returns Response with tokens (single org) or org list (multiple orgs)
   * @throws {AccountLockedError} If account is locked (423)
   * @throws {AuthenticationError} If credentials invalid (401)
   */
  async loginSmart(dto: LoginSmartDto): Promise<{ users: User[]; needsOrgSelection: boolean }> {
    this.logger.log(`Smart login attempt for email: ${this.maskEmail(dto.email)}`);

    const { email, password } = dto;

    // Find all users with this email across organizations
    const users = await this.userRepository.findByEmailAllOrgs(email);

    if (users.length === 0) {
      this.logger.warn(`Smart login failed: User not found for email ${this.maskEmail(email)}`);
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Check account lockout for first user (all share same email identity)
    // Using first user's org context for lockout check
    const primaryUser = users[0];
    await this.checkAccountLockout(primaryUser.id, primaryUser.organizationId, email);

    // Verify password (use first user, all should have same password)
    const isValidPassword = await this.passwordService.verifyPassword(
      password,
      primaryUser.passwordHash
    );

    if (!isValidPassword) {
      // Record failed attempt for the primary user
      await this.recordFailedLoginAttempt(primaryUser.id, primaryUser.organizationId, email);

      this.logger.warn(`Smart login failed: Invalid password for email ${this.maskEmail(email)}`);
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Check email verification status (use primary user as all share same email identity)
    if (!primaryUser.emailVerified) {
      this.logger.warn(
        `Smart login failed: Email not verified for user ${primaryUser.id} (${this.maskEmail(email)})`
      );
      throw new AuthenticationError(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        {
          reason: 'email_not_verified',
        }
      );
    }

    // Single organization - auto-login
    if (users.length === 1) {
      const user = users[0];

      this.logger.log(
        `Smart login: Auto-logging in user ${user.id} to organization ${user.organizationId}`
      );

      // SUCCESS: Clear failed attempts and update last login
      try {
        await this.userRepository.clearFailedLoginAttempts(user.id, user.organizationId);
        await this.userRepository.updateLastLogin(user.id, user.organizationId);
      } catch (error) {
        this.logger.error(
          `Failed to update login metadata for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return { users: [user], needsOrgSelection: false };
    }

    // Multiple organizations - return org list
    // Clear failed attempts for primary user on successful password validation
    try {
      await this.userRepository.clearFailedLoginAttempts(
        primaryUser.id,
        primaryUser.organizationId
      );
    } catch (error) {
      this.logger.error(
        `Failed to clear failed attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    this.logger.log(
      `Smart login: User ${this.maskEmail(email)} belongs to ${users.length} organizations, requiring org selection`
    );

    return { users, needsOrgSelection: true };
  }

  /**
   * Login with organization selection
   *
   * Completes authentication flow after user selects organization
   * from multi-org login scenario. Includes brute-force protection.
   *
   * Security flow:
   * 1. Find user in selected organization
   * 2. Check if account is locked
   * 3. Validate credentials with failed attempt tracking
   * 4. On success: Clear failed attempts, update last login
   *
   * @param dto - Organization selection data (email + password + organizationId)
   * @returns Authenticated user entity
   * @throws {AccountLockedError} If account is locked (423)
   * @throws {AuthenticationError} If credentials invalid or user inactive (401)
   */
  async loginSelectOrg(dto: SelectOrgDto): Promise<User> {
    this.logger.log(
      `Login select org attempt for email: ${this.maskEmail(dto.email)} in organization ${dto.organizationId}`
    );

    const { email, password, organizationId } = dto;

    // Find user in selected organization
    const user = await this.userRepository.findByEmail(email, organizationId);

    // Check account lockout BEFORE password validation
    if (user) {
      await this.checkAccountLockout(user.id, user.organizationId, email);
    }

    // Validate credentials (includes failed attempt tracking)
    await this.validateUserCredentialsInternal(user, password, email);

    // SUCCESS: Clear failed attempts and update last login
    try {
      await this.userRepository.clearFailedLoginAttempts(user!.id, user!.organizationId);
      await this.userRepository.updateLastLogin(user!.id, user!.organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to update login metadata for user ${user!.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    this.logger.log(`User logged in successfully to selected organization: ${user!.id}`);

    return user!;
  }

  /**
   * Validate user credentials
   *
   * Public method for validating credentials during protected operations
   * (e.g., cabinet selection). Includes brute-force protection.
   *
   * @param email - User email
   * @param password - User password
   * @param organizationId - Organization ID
   * @returns Authenticated user entity
   * @throws {AccountLockedError} If account is locked (423)
   * @throws {AuthenticationError} If credentials invalid or user inactive (401)
   */
  async validateUserCredentials(
    email: string,
    password: string,
    organizationId: OrganizationId
  ): Promise<User> {
    const user = await this.userRepository.findByEmail(email, organizationId);

    // Check account lockout BEFORE password validation
    if (user) {
      await this.checkAccountLockout(user.id, user.organizationId, email);
    }

    await this.validateUserCredentialsInternal(user, password, email);
    return user!;
  }

  /**
   * Internal credential validation with brute-force protection
   *
   * Validates user exists, password is correct, and user is active.
   * Records failed login attempts and triggers account lockout when threshold exceeded.
   * Throws generic error messages to prevent user enumeration.
   *
   * Security behavior:
   * - On password failure: Increments failed attempt counter
   * - At 5 failures: Locks account for 15 minutes (with exponential backoff)
   * - Generic error messages prevent username/email enumeration
   *
   * @param user - User entity (may be null)
   * @param password - Password to verify
   * @param email - Email for logging (masked)
   * @throws {AccountLockedError} If account becomes locked after this attempt
   * @throws {AuthenticationError} If validation fails
   * @private
   */
  private async validateUserCredentialsInternal(
    user: User | null,
    password: string,
    email: string
  ): Promise<void> {
    // User not found - don't record failed attempt (prevents enumeration)
    if (!user) {
      this.logger.warn(
        `Credential validation failed: User not found for email ${this.maskEmail(email)}`
      );
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      // SECURITY: Record failed login attempt
      await this.recordFailedLoginAttempt(user.id, user.organizationId, email);

      // Note: recordFailedLoginAttempt throws AccountLockedError if threshold exceeded
      // If we reach here, account is not locked yet
      this.logger.warn(`Credential validation failed: Invalid password for user ${user.id}`);
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(
        `Credential validation failed: User ${user.id} is not active (status: ${user.status})`
      );
      throw new AuthenticationError('User account is not active', {
        reason: 'invalid_credentials',
      });
    }

    // Check email verification status
    if (!user.emailVerified) {
      this.logger.warn(
        `Credential validation failed: Email not verified for user ${user.id} (${this.maskEmail(email)})`
      );
      throw new AuthenticationError(
        'Please verify your email before logging in. Check your inbox for the verification link.',
        {
          reason: 'email_not_verified',
        }
      );
    }
  }

  /**
   * Check if account is locked and throw appropriate error
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param email - Email for logging (masked)
   * @throws {AccountLockedError} If account is currently locked
   * @private
   */
  private async checkAccountLockout(
    userId: string,
    organizationId: OrganizationId,
    email: string
  ): Promise<void> {
    const lockStatus = await this.userRepository.checkAccountLockStatus(userId, organizationId);

    if (lockStatus.isLocked) {
      this.logger.warn(
        `Login blocked: Account locked for email ${this.maskEmail(email)}, ` +
          `${lockStatus.remainingSeconds} seconds remaining, ` +
          `${lockStatus.failedAttempts} failed attempts`
      );

      throw new AccountLockedError(
        'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        {
          remainingSeconds: lockStatus.remainingSeconds,
          reason: 'too_many_attempts',
        }
      );
    }
  }

  /**
   * Record failed login attempt and check for lockout
   *
   * @param userId - User ID
   * @param organizationId - Organization ID
   * @param email - Email for logging (masked)
   * @throws {AccountLockedError} If account is now locked after this attempt
   * @private
   */
  private async recordFailedLoginAttempt(
    userId: string,
    organizationId: OrganizationId,
    email: string
  ): Promise<void> {
    try {
      const result = await this.userRepository.recordFailedLoginAttempt(userId, organizationId);

      this.logger.warn(
        `Failed login attempt ${result.failedAttempts} for email ${this.maskEmail(email)}`
      );

      // If account is now locked, throw lockout error
      if (result.isLocked && result.lockoutUntil) {
        const remainingSeconds = Math.ceil((result.lockoutUntil.getTime() - Date.now()) / 1000);

        this.logger.warn(
          `Account locked for email ${this.maskEmail(email)} after ${result.failedAttempts} failed attempts, ` +
            `locked until ${result.lockoutUntil.toISOString()}`
        );

        throw new AccountLockedError(
          'Account is temporarily locked due to too many failed login attempts. Please try again later.',
          {
            remainingSeconds,
            reason: 'too_many_attempts',
          }
        );
      }
    } catch (error) {
      // Re-throw AccountLockedError
      if (error instanceof AccountLockedError) {
        throw error;
      }

      // Log but don't fail on other errors (fail open for recording)
      this.logger.error(
        `Failed to record failed login attempt: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Mask email for logging (GDPR compliance)
   *
   * @param email - Email address to mask
   * @returns Masked email address
   * @private
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) {
      return '***';
    }

    const [local, domain] = email.split('@');
    if (local.length === 0) {
      return '***@' + domain;
    }

    return `${local.charAt(0)}***@${domain}`;
  }
}
