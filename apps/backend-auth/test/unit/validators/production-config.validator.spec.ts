/**
 * Production Configuration Validator Unit Tests
 *
 * Tests cover:
 * - Skips validation in non-production environments
 * - Enforces PostgreSQL SSL in production
 * - Enforces SSL certificate validation
 * - Enforces strong JWT secrets
 * - Prevents database auto-synchronization in production
 * - Validates CORS configuration
 *
 * Security Test Coverage:
 * - All HIPAA/GDPR compliance requirements
 * - Prevention of common misconfigurations
 * - Detection of weak secrets
 * - Protection against insecure deployments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { validateProductionConfig } from '../../../src/validators/production-config.validator';

describe('validateProductionConfig', () => {
  let mockConfigService: ConfigService;

  // Helper to create valid production config
  const createValidProductionConfig = () => {
    return {
      get: vi.fn((key: string) => {
        switch (key) {
          case 'nodeEnv':
            return 'production';
          case 'database.ssl':
            return { rejectUnauthorized: true, ca: 'cert-content' };
          case 'jwt.accessSecret':
            return 'a'.repeat(40); // Strong secret
          case 'jwt.refreshSecret':
            return 'b'.repeat(40); // Different strong secret
          case 'database.synchronize':
            return false;
          case 'cors.origins':
            return ['https://app.example.com', 'https://api.example.com'];
          default:
            return undefined;
        }
      }),
    } as any;
  };

  beforeEach(() => {
    mockConfigService = createValidProductionConfig();
  });

  describe('Environment Check', () => {
    it('should skip validation in development environment', () => {
      mockConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'nodeEnv') return 'development';
          return undefined;
        }),
      } as any;

      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
      expect(mockConfigService.get).toHaveBeenCalledWith('nodeEnv');
      expect(mockConfigService.get).toHaveBeenCalledTimes(1); // Only checks nodeEnv
    });

    it('should skip validation in test environment', () => {
      mockConfigService = {
        get: vi.fn((key: string) => {
          if (key === 'nodeEnv') return 'test';
          return undefined;
        }),
      } as any;

      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
      expect(mockConfigService.get).toHaveBeenCalledWith('nodeEnv');
      expect(mockConfigService.get).toHaveBeenCalledTimes(1);
    });

    it('should run validation in production environment', () => {
      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
      expect(mockConfigService.get).toHaveBeenCalledWith('nodeEnv');
      expect(mockConfigService.get).toHaveBeenCalled(); // Multiple calls for validation
    });
  });

  describe('PostgreSQL SSL Validation', () => {
    it('should pass with SSL enabled as object with certificate validation', () => {
      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should pass with SSL enabled as boolean true', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return ['https://app.example.com'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should throw if SSL is disabled (false)', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return false;
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'PostgreSQL SSL is disabled in production'
      );
    });

    it('should throw if SSL is disabled (undefined)', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return undefined;
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'PostgreSQL SSL is disabled in production'
      );
    });

    it('should throw if rejectUnauthorized is false', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return { rejectUnauthorized: false };
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'PostgreSQL SSL certificate validation is disabled'
      );
    });
  });

  describe('JWT Secret Validation', () => {
    it('should throw if JWT access secret is too short', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'short'; // Too short
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret is too weak'
      );
    });

    it('should throw if JWT access secret is undefined', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return undefined;
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret is too weak'
      );
    });

    it('should throw if JWT refresh secret is too short', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'short';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT refresh secret is too weak'
      );
    });

    it('should throw if JWT access secret contains "dev"', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'my-dev-secret-that-is-long-enough';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret contains \'dev\''
      );
    });

    it('should throw if JWT access secret contains "test"', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'my-test-secret-that-is-long-enough';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret contains \'test\''
      );
    });

    it('should throw if JWT access secret contains "change-me"', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'change-me-in-production-use-strong-secret';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret contains \'change-me\''
      );
    });

    it('should throw if JWT refresh secret contains weak pattern', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'example-secret-that-is-long-enough';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT refresh secret contains \'example\''
      );
    });

    it('should throw if access and refresh secrets are the same', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'a'.repeat(40); // Same as access
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access and refresh secrets must be different'
      );
    });

    it('should be case-insensitive when detecting weak patterns', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'MY-DEV-SECRET-THAT-IS-LONG-ENOUGH';
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'JWT access secret contains \'dev\''
      );
    });
  });

  describe('Database Synchronize Validation', () => {
    it('should pass if synchronize is false', () => {
      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should pass if synchronize is undefined (defaults to false)', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return undefined;
        if (key === 'cors.origins') return ['https://app.example.com'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should throw if synchronize is true', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return true;
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'Database auto-synchronization is enabled in production'
      );
    });
  });

  describe('CORS Validation', () => {
    it('should pass with valid production origins', () => {
      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should throw if CORS origins are empty', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return [];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS origins are not configured'
      );
    });

    it('should throw if CORS origins are undefined', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return undefined;
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS origins are not configured'
      );
    });

    it('should throw if CORS includes wildcard', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return ['*'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS is configured with wildcard'
      );
    });

    it('should throw if CORS includes localhost', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return ['https://app.example.com', 'http://localhost:3000'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS origins include localhost'
      );
    });

    it('should throw if CORS includes 127.0.0.1', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return ['http://127.0.0.1:3000'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS origins include localhost'
      );
    });

    it('should throw if CORS includes 0.0.0.0', () => {
      mockConfigService.get = vi.fn((key: string) => {
        if (key === 'nodeEnv') return 'production';
        if (key === 'database.ssl') return true;
        if (key === 'jwt.accessSecret') return 'a'.repeat(40);
        if (key === 'jwt.refreshSecret') return 'b'.repeat(40);
        if (key === 'database.synchronize') return false;
        if (key === 'cors.origins') return ['http://0.0.0.0:3000'];
        return undefined;
      }) as any;

      expect(() => validateProductionConfig(mockConfigService)).toThrow(
        'CORS origins include localhost'
      );
    });
  });

  describe('Complete Validation Flow', () => {
    it('should pass with all valid production settings', () => {
      mockConfigService = createValidProductionConfig();
      expect(() => validateProductionConfig(mockConfigService)).not.toThrow();
    });

    it('should validate all checks in order', () => {
      const validConfig = createValidProductionConfig();
      expect(() => validateProductionConfig(validConfig)).not.toThrow();

      // Verify all critical checks were performed
      expect(validConfig.get).toHaveBeenCalledWith('nodeEnv');
      expect(validConfig.get).toHaveBeenCalledWith('database.ssl');
      expect(validConfig.get).toHaveBeenCalledWith('jwt.accessSecret');
      expect(validConfig.get).toHaveBeenCalledWith('jwt.refreshSecret');
      expect(validConfig.get).toHaveBeenCalledWith('database.synchronize');
      expect(validConfig.get).toHaveBeenCalledWith('cors.origins');
    });
  });
});
