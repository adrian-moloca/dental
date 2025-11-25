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
import { StructuredLogger } from '@dentalos/shared-infra';
import { RegisterDto, LoginDto, LoginSmartDto, SelectOrgDto } from '../dto';
import { User, UserStatus } from '../../users/entities/user.entity';
import { AuthenticationError, ConflictError } from '@dentalos/shared-errors';
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
    private readonly passwordService: PasswordService
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

    this.logger.log(`User registered successfully: ${user.id}`);
    return user;
  }

  /**
   * Login existing user
   *
   * Authenticates user with email, password, and organizationId.
   * Validates credentials and user status.
   *
   * @param dto - Login credentials
   * @returns Authenticated user entity
   * @throws {AuthenticationError} If credentials invalid or user inactive
   */
  async login(dto: LoginDto): Promise<User> {
    this.logger.log(`Login attempt for email: ${this.maskEmail(dto.email)}`);

    // Find user by email + organization
    const user = await this.userRepository.findByEmail(dto.email, dto.organizationId);

    // Validate credentials
    this.validateUserCredentialsInternal(user, dto.password, dto.email);

    // Update last login timestamp (non-blocking)
    try {
      await this.userRepository.updateLastLogin(user!.id, user!.organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to update last login for user ${user!.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
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
   *
   * @param dto - Smart login credentials (email + password, no organizationId)
   * @returns Response with tokens (single org) or org list (multiple orgs)
   * @throws {AuthenticationError} If credentials invalid
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

    // Verify password (use first user, all should have same password)
    const isValidPassword = await this.passwordService.verifyPassword(
      password,
      users[0].passwordHash
    );

    if (!isValidPassword) {
      this.logger.warn(`Smart login failed: Invalid password for email ${this.maskEmail(email)}`);
      throw new AuthenticationError('Invalid email or password', {
        reason: 'invalid_credentials',
      });
    }

    // Single organization - auto-login
    if (users.length === 1) {
      const user = users[0];

      this.logger.log(
        `Smart login: Auto-logging in user ${user.id} to organization ${user.organizationId}`
      );

      // Update last login timestamp (non-blocking)
      try {
        await this.userRepository.updateLastLogin(user.id, user.organizationId);
      } catch (error) {
        this.logger.error(
          `Failed to update last login for user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      return { users: [user], needsOrgSelection: false };
    }

    // Multiple organizations - return org list
    this.logger.log(
      `Smart login: User ${this.maskEmail(email)} belongs to ${users.length} organizations, requiring org selection`
    );

    return { users, needsOrgSelection: true };
  }

  /**
   * Login with organization selection
   *
   * Completes authentication flow after user selects organization
   * from multi-org login scenario.
   *
   * @param dto - Organization selection data (email + password + organizationId)
   * @returns Authenticated user entity
   * @throws {AuthenticationError} If credentials invalid or user inactive
   */
  async loginSelectOrg(dto: SelectOrgDto): Promise<User> {
    this.logger.log(
      `Login select org attempt for email: ${this.maskEmail(dto.email)} in organization ${dto.organizationId}`
    );

    const { email, password, organizationId } = dto;

    // Find user in selected organization
    const user = await this.userRepository.findByEmail(email, organizationId);

    // Validate credentials
    this.validateUserCredentialsInternal(user, password, email);

    // Update last login timestamp (non-blocking)
    try {
      await this.userRepository.updateLastLogin(user!.id, user!.organizationId);
    } catch (error) {
      this.logger.error(
        `Failed to update last login for user ${user!.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    this.logger.log(`User logged in successfully to selected organization: ${user!.id}`);

    return user!;
  }

  /**
   * Validate user credentials
   *
   * Public method for validating credentials during protected operations
   * (e.g., cabinet selection).
   *
   * @param email - User email
   * @param password - User password
   * @param organizationId - Organization ID
   * @returns Authenticated user entity
   * @throws {AuthenticationError} If credentials invalid or user inactive
   */
  async validateUserCredentials(
    email: string,
    password: string,
    organizationId: OrganizationId
  ): Promise<User> {
    const user = await this.userRepository.findByEmail(email, organizationId);
    this.validateUserCredentialsInternal(user, password, email);
    return user!;
  }

  /**
   * Internal credential validation
   *
   * Validates user exists, password is correct, and user is active.
   * Throws generic error messages to prevent user enumeration.
   *
   * @param user - User entity (may be null)
   * @param password - Password to verify
   * @param email - Email for logging (masked)
   * @throws {AuthenticationError} If validation fails
   * @private
   */
  private async validateUserCredentialsInternal(
    user: User | null,
    password: string,
    email: string
  ): Promise<void> {
    // User not found
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
