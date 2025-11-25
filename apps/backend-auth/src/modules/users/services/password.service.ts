/**
 * Password Service - Argon2id-based password hashing and validation
 *
 * Security Implementation:
 * - Uses Argon2id algorithm (hybrid of Argon2i and Argon2d)
 * - Non-deterministic hashing (unique salt per hash)
 * - Configurable memory, time, and parallelism parameters
 * - Constant-time verification to prevent timing attacks
 * - Password strength validation with comprehensive requirements
 *
 * HIPAA/GDPR Compliance:
 * - No password logging or exposure in errors
 * - Secure error handling without information disclosure
 * - Audit-safe error codes for tracking
 *
 * @module PasswordService
 */

import { Injectable } from '@nestjs/common';
import { hash, verify, Algorithm } from '@node-rs/argon2';
import { ConfigService } from '@nestjs/config';
import { SecurityError } from '@dentalos/shared-errors';

/**
 * Argon2id configuration parameters
 * Tuned for security vs. performance balance
 */
export interface Argon2Options {
  memoryCost: number; // Memory usage in KB (default: 64 MB)
  timeCost: number; // Number of iterations (default: 3)
  parallelism: number; // Number of parallel threads (default: 4)
}

/**
 * Password strength validation result
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Injectable service for secure password operations
 */
@Injectable()
export class PasswordService {
  private readonly options: Argon2Options;

  constructor(private configService: ConfigService) {
    // Load Argon2 parameters from config or use OWASP-recommended defaults
    // These defaults balance security and user experience:
    // - 64 MB memory (prevents GPU attacks while being server-friendly)
    // - 3 iterations (adds ~300ms delay, acceptable for authentication)
    // - 4 parallel threads (utilizes multi-core CPUs efficiently)
    this.options = {
      memoryCost: this.configService.get('security.argon2.memoryCost', 65536),
      timeCost: this.configService.get('security.argon2.timeCost', 3),
      parallelism: this.configService.get('security.argon2.parallelism', 4),
    };
  }

  /**
   * Hash password using Argon2id
   *
   * Security Properties:
   * - Argon2id combines resistance to side-channel attacks (Argon2i)
   *   and GPU cracking attacks (Argon2d)
   * - Each hash uses a unique random salt (non-deterministic)
   * - Salt is embedded in the output hash string
   * - Output format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
   *
   * @param plainPassword - Plain text password to hash
   * @returns Promise<string> - Argon2id hash string (includes algorithm, params, salt, and hash)
   *
   * @throws SecurityError if password is empty or invalid
   * @throws SecurityError if hashing operation fails
   *
   * Example:
   * ```typescript
   * const hash = await passwordService.hashPassword('SecurePass123!');
   * // Returns: $argon2id$v=19$m=65536,t=3,p=4$randomsalt$computedhash
   * ```
   */
  async hashPassword(plainPassword: string): Promise<string> {
    // Validate input before processing
    if (!plainPassword || plainPassword.trim().length === 0) {
      throw new SecurityError({
        code: 'INVALID_PASSWORD',
        message: 'Password cannot be empty',
      });
    }

    try {
      // Hash with Argon2id algorithm
      // @node-rs/argon2 automatically generates a unique salt for each hash
      return await hash(plainPassword, {
        algorithm: Algorithm.Argon2id,
        memoryCost: this.options.memoryCost,
        timeCost: this.options.timeCost,
        parallelism: this.options.parallelism,
      });
    } catch (error) {
      // Catch and wrap any hashing errors
      // Never expose the original password in error messages
      throw new SecurityError({
        code: 'PASSWORD_HASH_FAILED',
        message: 'Failed to hash password',
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Verify password against Argon2id hash
   *
   * Security Properties:
   * - Uses constant-time comparison to prevent timing attacks
   * - Extracts algorithm parameters and salt from hash string
   * - Recomputes hash with same parameters and compares
   * - No information leakage about why verification failed
   *
   * @param plainPassword - Plain text password to verify
   * @param hashedPassword - Argon2id hash to compare against
   * @returns Promise<boolean> - True if password matches, false otherwise
   *
   * @throws SecurityError if inputs are invalid (empty strings)
   *
   * Note: Returns false (not error) for malformed hashes or algorithm mismatches
   * This prevents information disclosure about hash format
   *
   * Example:
   * ```typescript
   * const isValid = await passwordService.verifyPassword(
   *   'SecurePass123!',
   *   '$argon2id$v=19$m=65536,t=3,p=4$salt$hash'
   * );
   * ```
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Validate inputs
    if (!plainPassword || !hashedPassword) {
      throw new SecurityError({
        code: 'INVALID_INPUT',
        message: 'Password and hash required for verification',
      });
    }

    try {
      // Verify using @node-rs/argon2
      // Returns true if password matches, false otherwise
      // This function performs constant-time comparison internally
      return await verify(hashedPassword, plainPassword);
    } catch (error) {
      // Verification errors (e.g., malformed hash, wrong algorithm)
      // should return false, not throw, to prevent information disclosure
      // An attacker shouldn't know if the hash is malformed vs. password is wrong
      return false;
    }
  }

  /**
   * Check if password meets minimum security requirements
   *
   * Requirements (NIST SP 800-63B compliant):
   * - Minimum 12 characters (recommended for high-security applications)
   * - Maximum 128 characters (prevents DoS via excessive hashing time)
   * - At least one uppercase letter (A-Z)
   * - At least one lowercase letter (a-z)
   * - At least one digit (0-9)
   * - At least one special character (non-alphanumeric)
   *
   * Note: These rules balance security with usability.
   * Consider using a password strength meter on the frontend
   * to help users create strong passwords.
   *
   * @param password - Password to validate
   * @returns PasswordStrengthResult - Validation result with specific errors
   *
   * Example:
   * ```typescript
   * const result = passwordService.validatePasswordStrength('weak');
   * // Returns: { isValid: false, errors: ['Password must be at least 12 characters', ...] }
   * ```
   */
  validatePasswordStrength(password: string): PasswordStrengthResult {
    const errors: string[] = [];

    // Length checks
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters');
    }

    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }

    // Complexity checks
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one digit');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
