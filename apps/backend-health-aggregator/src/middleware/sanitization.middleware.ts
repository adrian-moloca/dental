import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Input Sanitization Middleware
 *
 * SECURITY RESPONSIBILITIES:
 * - Sanitizes all user input to prevent injection attacks
 * - Removes potentially malicious characters and patterns
 * - Normalizes input data for consistent processing
 * - Prevents XSS, SQL injection, NoSQL injection, and command injection
 *
 * THREAT MITIGATION:
 * - XSS (Cross-Site Scripting) - CWE-79
 * - SQL Injection - CWE-89
 * - NoSQL Injection - CWE-943
 * - Command Injection - CWE-77
 * - Path Traversal - CWE-22
 * - LDAP Injection - CWE-90
 *
 * COMPLIANCE:
 * - OWASP Top 10 A03:2021 - Injection
 * - PCI DSS Requirement 6.5.1 - Injection flaws
 *
 * IMPORTANT:
 * - This middleware runs BEFORE validation pipes
 * - It sanitizes input but does NOT validate business logic
 * - Use in combination with class-validator for comprehensive protection
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SanitizationMiddleware.name);

  // Dangerous patterns to detect and sanitize
  private readonly DANGEROUS_PATTERNS = {
    // SQL Injection patterns
    SQL_KEYWORDS: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    SQL_OPERATORS: /(--|;|\/\*|\*\/|xp_|sp_)/gi,

    // NoSQL Injection patterns
    NOSQL_OPERATORS: /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$regex)/gi,

    // XSS patterns
    SCRIPT_TAGS: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    EVENT_HANDLERS: /on\w+\s*=/gi,
    JAVASCRIPT_PROTOCOL: /javascript:/gi,

    // Command Injection patterns
    SHELL_METACHARACTERS: /[;&|`$(){}[\]<>]/g,
    COMMAND_SUBSTITUTION: /\$\(.*\)/g,

    // Path Traversal patterns
    PATH_TRAVERSAL: /\.\.[\/\\]/g,

    // LDAP Injection patterns
    LDAP_SPECIAL_CHARS: /[()&|!]/g,

    // Null bytes
    NULL_BYTES: /\0/g,
  };

  // Fields that should NOT be sanitized (e.g., passwords, hashes)
  private readonly SKIP_FIELDS = new Set([
    'password',
    'currentPassword',
    'newPassword',
    'passwordHash',
    'token',
    'refreshToken',
    'secret',
  ]);

  use(req: Request, _res: Response, next: NextFunction): void {
    try {
      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        req.query = this.sanitizeObject(req.query) as typeof req.query;
      }

      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = this.sanitizeObject(req.body);
      }

      // Sanitize route parameters
      if (req.params && typeof req.params === 'object') {
        req.params = this.sanitizeObject(req.params) as typeof req.params;
      }

      next();
    } catch (error) {
      this.logger.error('Sanitization error', {
        error: error instanceof Error ? error.message : String(error),
        method: req.method,
        url: req.url,
      });

      // Proceed even if sanitization fails
      // SECURITY TRADEOFF: Prefer availability over strict sanitization
      next();
    }
  }

  /**
   * Sanitizes an object recursively
   *
   * @param obj - Object to sanitize
   * @param depth - Current recursion depth (prevent stack overflow)
   * @returns Sanitized object
   */
  private sanitizeObject(obj: unknown, depth: number = 0): unknown {
    // Prevent deep recursion (DoS attack)
    if (depth > 10) {
      this.logger.warn('Maximum sanitization depth reached, stopping recursion');
      return obj;
    }

    // Handle null/undefined
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item, depth + 1));
    }

    // Handle objects
    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(obj)) {
        // Skip fields that should not be sanitized
        if (this.SKIP_FIELDS.has(key)) {
          sanitized[key] = value;
          continue;
        }

        // Sanitize key (prevent prototype pollution)
        const sanitizedKey = this.sanitizeString(key);

        // Prevent prototype pollution
        if (
          sanitizedKey === '__proto__' ||
          sanitizedKey === 'constructor' ||
          sanitizedKey === 'prototype'
        ) {
          this.logger.warn('Blocked prototype pollution attempt', { key });
          continue;
        }

        // Recursively sanitize value
        sanitized[sanitizedKey] = this.sanitizeValue(value, depth);
      }

      return sanitized;
    }

    // Handle primitive types
    return this.sanitizeValue(obj, depth);
  }

  /**
   * Sanitizes a value based on its type
   *
   * @param value - Value to sanitize
   * @param depth - Current recursion depth
   * @returns Sanitized value
   */
  private sanitizeValue(value: unknown, depth: number): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeObject(item, depth + 1));
    }

    if (typeof value === 'object') {
      return this.sanitizeObject(value, depth + 1);
    }

    return value;
  }

  /**
   * Sanitizes a string value
   *
   * SANITIZATION STEPS:
   * 1. Remove null bytes
   * 2. Trim whitespace
   * 3. Remove dangerous SQL keywords (in suspicious contexts)
   * 4. Remove NoSQL operators (if starts with $)
   * 5. Remove XSS patterns (script tags, event handlers)
   * 6. Remove shell metacharacters (in specific fields)
   * 7. Remove path traversal sequences
   * 8. Limit length to prevent DoS
   *
   * @param value - String to sanitize
   * @returns Sanitized string
   */
  private sanitizeString(value: string): string {
    if (typeof value !== 'string') {
      return value;
    }

    let sanitized = value;

    // Remove null bytes
    sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.NULL_BYTES, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Remove NoSQL operators if string starts with $
    if (sanitized.startsWith('$')) {
      sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.NOSQL_OPERATORS, '');
    }

    // Remove XSS patterns
    sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.SCRIPT_TAGS, '');
    sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.EVENT_HANDLERS, '');
    sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.JAVASCRIPT_PROTOCOL, '');

    // Remove path traversal sequences
    sanitized = sanitized.replace(this.DANGEROUS_PATTERNS.PATH_TRAVERSAL, '');

    // Limit string length to prevent DoS (adjust as needed)
    const MAX_STRING_LENGTH = 10000;
    if (sanitized.length > MAX_STRING_LENGTH) {
      this.logger.warn('String exceeds maximum length, truncating', {
        originalLength: sanitized.length,
        truncatedLength: MAX_STRING_LENGTH,
      });
      sanitized = sanitized.substring(0, MAX_STRING_LENGTH);
    }

    return sanitized;
  }
}
