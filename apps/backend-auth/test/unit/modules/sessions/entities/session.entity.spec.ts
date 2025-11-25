/**
 * Session Entity Unit Tests
 *
 * Tests cover:
 * - Valid session creation with all required fields
 * - Validation errors for missing/invalid fields
 * - Business logic methods (isActive, isExpired, isRevoked)
 * - Immutability patterns (withUpdatedActivity, withRevocation)
 * - JSON serialization/deserialization for Redis storage
 * - Edge cases and boundary conditions
 *
 * Security Test Coverage:
 * - Refresh token hash validation (min 64 chars)
 * - Device fingerprint format validation (SHA256)
 * - Expiration date logic
 * - Revocation reason requirements
 *
 * @group unit
 * @module backend-auth/test/unit/modules/sessions/entities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationError } from '@dentalos/shared-errors';
import { Session, SessionRevocationReason, DeviceInfo } from '../../../../../src/modules/sessions/entities/session.entity';
import { UUID, OrganizationId, ClinicId } from '@dentalos/shared-types';

describe('Session Entity', () => {
  // Test data fixtures
  const validDeviceInfo: DeviceInfo = {
    deviceId: 'a'.repeat(64), // Valid SHA256 hash
    deviceName: 'Chrome 120 on Windows 11',
    ipAddress: '192.168.1.xxx',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  };

  const validSessionProps = {
    id: 'session-123' as UUID,
    userId: 'user-456' as UUID,
    organizationId: 'org-789' as OrganizationId,
    clinicId: 'clinic-101' as ClinicId,
    refreshTokenHash: 'a'.repeat(64), // Valid Argon2id hash length
    deviceInfo: validDeviceInfo,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    expiresAt: new Date('2025-01-08T00:00:00Z'), // 7 days later
    lastActivityAt: new Date('2025-01-01T00:00:00Z'),
  };

  describe('Constructor - Valid Creation', () => {
    it('should create session with all required fields', () => {
      const session = new Session(validSessionProps);

      expect(session.id).toBe(validSessionProps.id);
      expect(session.userId).toBe(validSessionProps.userId);
      expect(session.organizationId).toBe(validSessionProps.organizationId);
      expect(session.clinicId).toBe(validSessionProps.clinicId);
      expect(session.refreshTokenHash).toBe(validSessionProps.refreshTokenHash);
      expect(session.deviceInfo).toEqual(validDeviceInfo);
      expect(session.createdAt).toEqual(validSessionProps.createdAt);
      expect(session.expiresAt).toEqual(validSessionProps.expiresAt);
      expect(session.lastActivityAt).toEqual(validSessionProps.lastActivityAt);
      expect(session.revokedAt).toBeUndefined();
      expect(session.revokedReason).toBeUndefined();
    });

    it('should create session without clinicId (optional field)', () => {
      const { clinicId, ...propsWithoutClinic } = validSessionProps;

      const session = new Session(propsWithoutClinic);

      expect(session.clinicId).toBeUndefined();
      expect(session.organizationId).toBe(validSessionProps.organizationId);
    });

    it('should create session with revocation data', () => {
      const revokedAt = new Date('2025-01-02T00:00:00Z');
      const revokedReason: SessionRevocationReason = 'user_logout';

      const session = new Session({
        ...validSessionProps,
        revokedAt,
        revokedReason,
      });

      expect(session.revokedAt).toEqual(revokedAt);
      expect(session.revokedReason).toBe(revokedReason);
    });
  });

  describe('Validation - Missing Required Fields', () => {
    it('should throw ValidationError when id is missing', () => {
      const { id, ...propsWithoutId } = validSessionProps;

      expect(() => new Session(propsWithoutId as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutId as any)).toThrow(/Session ID is required/);
    });

    it('should throw ValidationError when userId is missing', () => {
      const { userId, ...propsWithoutUserId } = validSessionProps;

      expect(() => new Session(propsWithoutUserId as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutUserId as any)).toThrow(/User ID is required/);
    });

    it('should throw ValidationError when organizationId is missing', () => {
      const { organizationId, ...propsWithoutOrgId } = validSessionProps;

      expect(() => new Session(propsWithoutOrgId as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutOrgId as any)).toThrow(/Organization ID is required/);
    });

    it('should throw ValidationError when refreshTokenHash is missing', () => {
      const { refreshTokenHash, ...propsWithoutHash } = validSessionProps;

      expect(() => new Session(propsWithoutHash as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutHash as any)).toThrow(/Refresh token hash is required/);
    });

    it('should throw ValidationError when deviceInfo is missing', () => {
      const { deviceInfo, ...propsWithoutDevice } = validSessionProps;

      expect(() => new Session(propsWithoutDevice as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutDevice as any)).toThrow(/Device info is required/);
    });

    it('should throw ValidationError when createdAt is missing', () => {
      const { createdAt, ...propsWithoutCreatedAt } = validSessionProps;

      expect(() => new Session(propsWithoutCreatedAt as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutCreatedAt as any)).toThrow(/Created at is required/);
    });

    it('should throw ValidationError when expiresAt is missing', () => {
      const { expiresAt, ...propsWithoutExpiresAt } = validSessionProps;

      expect(() => new Session(propsWithoutExpiresAt as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutExpiresAt as any)).toThrow(/Expires at is required/);
    });

    it('should throw ValidationError when lastActivityAt is missing', () => {
      const { lastActivityAt, ...propsWithoutActivity } = validSessionProps;

      expect(() => new Session(propsWithoutActivity as any)).toThrow(ValidationError);
      expect(() => new Session(propsWithoutActivity as any)).toThrow(/Last activity at is required/);
    });
  });

  describe('Validation - Invalid Field Values', () => {
    it('should throw ValidationError when refreshTokenHash is too short', () => {
      const shortHash = 'a'.repeat(63); // One char short

      expect(() => new Session({
        ...validSessionProps,
        refreshTokenHash: shortHash,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        refreshTokenHash: shortHash,
      })).toThrow(/at least 64 characters/);
    });

    it('should accept refreshTokenHash exactly 64 characters', () => {
      const exactHash = 'b'.repeat(64);

      const session = new Session({
        ...validSessionProps,
        refreshTokenHash: exactHash,
      });

      expect(session.refreshTokenHash).toBe(exactHash);
    });

    it('should accept refreshTokenHash longer than 64 characters (Argon2id is ~100 chars)', () => {
      const longHash = 'c'.repeat(100);

      const session = new Session({
        ...validSessionProps,
        refreshTokenHash: longHash,
      });

      expect(session.refreshTokenHash).toBe(longHash);
    });

    it('should throw ValidationError when device fingerprint is invalid format', () => {
      const invalidDeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        deviceId: 'invalid-not-sha256', // Not 64 hex chars
      };

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: invalidDeviceInfo,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: invalidDeviceInfo,
      })).toThrow(/valid SHA256 hash/);
    });

    it('should throw ValidationError when device fingerprint has invalid characters', () => {
      const invalidDeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        deviceId: 'z'.repeat(64), // 'z' is not valid hex
      };

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: invalidDeviceInfo,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: invalidDeviceInfo,
      })).toThrow(/valid SHA256 hash/);
    });

    it('should accept uppercase hex characters in device fingerprint', () => {
      const uppercaseDeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        deviceId: 'A'.repeat(64),
      };

      const session = new Session({
        ...validSessionProps,
        deviceInfo: uppercaseDeviceInfo,
      });

      expect(session.deviceInfo.deviceId).toBe('A'.repeat(64));
    });

    it('should throw ValidationError when expiresAt is before createdAt', () => {
      expect(() => new Session({
        ...validSessionProps,
        createdAt: new Date('2025-01-08T00:00:00Z'),
        expiresAt: new Date('2025-01-01T00:00:00Z'), // Before creation
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        createdAt: new Date('2025-01-08T00:00:00Z'),
        expiresAt: new Date('2025-01-01T00:00:00Z'),
      })).toThrow(/after creation date/);
    });

    it('should throw ValidationError when expiresAt equals createdAt', () => {
      const sameDate = new Date('2025-01-01T00:00:00Z');

      expect(() => new Session({
        ...validSessionProps,
        createdAt: sameDate,
        expiresAt: sameDate,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        createdAt: sameDate,
        expiresAt: sameDate,
      })).toThrow(/after creation date/);
    });
  });

  describe('Validation - Device Info Fields', () => {
    it('should throw ValidationError when deviceId is missing', () => {
      const { deviceId, ...deviceWithoutId } = validDeviceInfo;

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutId as any,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutId as any,
      })).toThrow(/Device ID is required/);
    });

    it('should throw ValidationError when deviceName is missing', () => {
      const { deviceName, ...deviceWithoutName } = validDeviceInfo;

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutName as any,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutName as any,
      })).toThrow(/Device name is required/);
    });

    it('should throw ValidationError when ipAddress is missing', () => {
      const { ipAddress, ...deviceWithoutIp } = validDeviceInfo;

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutIp as any,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutIp as any,
      })).toThrow(/IP address is required/);
    });

    it('should throw ValidationError when userAgent is missing', () => {
      const { userAgent, ...deviceWithoutUA } = validDeviceInfo;

      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutUA as any,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        deviceInfo: deviceWithoutUA as any,
      })).toThrow(/User agent is required/);
    });
  });

  describe('Validation - Revocation Rules', () => {
    it('should throw ValidationError when revokedAt is set but revokedReason is missing', () => {
      expect(() => new Session({
        ...validSessionProps,
        revokedAt: new Date(),
        revokedReason: undefined,
      })).toThrow(ValidationError);
      expect(() => new Session({
        ...validSessionProps,
        revokedAt: new Date(),
        revokedReason: undefined,
      })).toThrow(/Revocation reason is required/);
    });

    it('should allow revokedReason without revokedAt (edge case)', () => {
      // This shouldn't happen in practice, but validation only enforces
      // that revokedAt requires revokedReason, not the inverse
      const session = new Session({
        ...validSessionProps,
        revokedReason: 'user_logout',
      });

      expect(session.revokedReason).toBe('user_logout');
      expect(session.revokedAt).toBeUndefined();
    });
  });

  describe('isActive() - Business Logic', () => {
    it('should return true for non-expired, non-revoked session', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T00:00:00Z')); // Middle of session

      const session = new Session(validSessionProps);

      expect(session.isActive()).toBe(true);

      vi.useRealTimers();
    });

    it('should return false for expired session', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-10T00:00:00Z')); // After expiration

      const session = new Session(validSessionProps);

      expect(session.isActive()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false for revoked session', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T00:00:00Z')); // Not expired yet

      const session = new Session({
        ...validSessionProps,
        revokedAt: new Date('2025-01-02T00:00:00Z'),
        revokedReason: 'user_logout',
      });

      expect(session.isActive()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false for both expired and revoked session', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-10T00:00:00Z')); // After expiration

      const session = new Session({
        ...validSessionProps,
        revokedAt: new Date('2025-01-02T00:00:00Z'),
        revokedReason: 'user_logout',
      });

      expect(session.isActive()).toBe(false);

      vi.useRealTimers();
    });

    it('should return false when session expires exactly now', () => {
      const expiresAt = new Date('2025-01-05T12:00:00Z');

      vi.useFakeTimers();
      vi.setSystemTime(expiresAt);

      const session = new Session({
        ...validSessionProps,
        expiresAt,
      });

      expect(session.isActive()).toBe(false);

      vi.useRealTimers();
    });

    it('should return true when session expires in 1 millisecond', () => {
      const expiresAt = new Date('2025-01-05T12:00:00.001Z');

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T12:00:00.000Z'));

      const session = new Session({
        ...validSessionProps,
        expiresAt,
      });

      expect(session.isActive()).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('isExpired() - Business Logic', () => {
    it('should return false when session is not expired', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T00:00:00Z'));

      const session = new Session(validSessionProps);

      expect(session.isExpired()).toBe(false);

      vi.useRealTimers();
    });

    it('should return true when session is expired', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-10T00:00:00Z'));

      const session = new Session(validSessionProps);

      expect(session.isExpired()).toBe(true);

      vi.useRealTimers();
    });

    it('should return true when current time equals expiration time', () => {
      const expiresAt = new Date('2025-01-05T12:00:00Z');

      vi.useFakeTimers();
      vi.setSystemTime(expiresAt);

      const session = new Session({
        ...validSessionProps,
        expiresAt,
      });

      expect(session.isExpired()).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('isRevoked() - Business Logic', () => {
    it('should return false when session is not revoked', () => {
      const session = new Session(validSessionProps);

      expect(session.isRevoked()).toBe(false);
    });

    it('should return true when session is revoked', () => {
      const session = new Session({
        ...validSessionProps,
        revokedAt: new Date('2025-01-02T00:00:00Z'),
        revokedReason: 'user_logout',
      });

      expect(session.isRevoked()).toBe(true);
    });

    it('should return true for all revocation reasons', () => {
      const reasons: SessionRevocationReason[] = [
        'user_logout',
        'admin_revoked',
        'token_rotated',
        'expired',
        'suspicious_activity',
        'password_changed',
        'session_limit_exceeded',
      ];

      reasons.forEach((reason) => {
        const session = new Session({
          ...validSessionProps,
          revokedAt: new Date(),
          revokedReason: reason,
        });

        expect(session.isRevoked()).toBe(true);
      });
    });
  });

  describe('toJSON() - Serialization', () => {
    it('should serialize session to JSON object', () => {
      const session = new Session(validSessionProps);
      const json = session.toJSON();

      expect(json.id).toBe(validSessionProps.id);
      expect(json.userId).toBe(validSessionProps.userId);
      expect(json.organizationId).toBe(validSessionProps.organizationId);
      expect(json.clinicId).toBe(validSessionProps.clinicId);
      expect(json.refreshTokenHash).toBe(validSessionProps.refreshTokenHash);
      expect(json.deviceInfo).toEqual(validDeviceInfo);
    });

    it('should convert Date objects to ISO strings', () => {
      const session = new Session(validSessionProps);
      const json = session.toJSON();

      expect(json.createdAt).toBe('2025-01-01T00:00:00.000Z');
      expect(json.expiresAt).toBe('2025-01-08T00:00:00.000Z');
      expect(json.lastActivityAt).toBe('2025-01-01T00:00:00.000Z');
      expect(typeof json.createdAt).toBe('string');
    });

    it('should serialize undefined revokedAt as undefined (not null)', () => {
      const session = new Session(validSessionProps);
      const json = session.toJSON();

      expect(json.revokedAt).toBeUndefined();
      expect(json.revokedReason).toBeUndefined();
    });

    it('should serialize revokedAt as ISO string when present', () => {
      const revokedAt = new Date('2025-01-02T00:00:00Z');
      const session = new Session({
        ...validSessionProps,
        revokedAt,
        revokedReason: 'user_logout',
      });
      const json = session.toJSON();

      expect(json.revokedAt).toBe('2025-01-02T00:00:00.000Z');
      expect(json.revokedReason).toBe('user_logout');
    });

    it('should produce JSON that can be stringified', () => {
      const session = new Session(validSessionProps);
      const json = session.toJSON();

      expect(() => JSON.stringify(json)).not.toThrow();

      const stringified = JSON.stringify(json);
      expect(stringified).toContain(validSessionProps.id);
    });
  });

  describe('fromJSON() - Deserialization', () => {
    it('should deserialize JSON to Session entity', () => {
      const json = {
        id: 'session-123',
        userId: 'user-456',
        organizationId: 'org-789',
        clinicId: 'clinic-101',
        refreshTokenHash: 'a'.repeat(64),
        deviceInfo: validDeviceInfo,
        createdAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-01-08T00:00:00.000Z',
        lastActivityAt: '2025-01-01T00:00:00.000Z',
      };

      const session = Session.fromJSON(json);

      expect(session.id).toBe(json.id);
      expect(session.userId).toBe(json.userId);
      expect(session.organizationId).toBe(json.organizationId);
      expect(session.clinicId).toBe(json.clinicId);
      expect(session.refreshTokenHash).toBe(json.refreshTokenHash);
    });

    it('should convert ISO strings back to Date objects', () => {
      const json = {
        id: 'session-123',
        userId: 'user-456',
        organizationId: 'org-789',
        refreshTokenHash: 'a'.repeat(64),
        deviceInfo: validDeviceInfo,
        createdAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-01-08T00:00:00.000Z',
        lastActivityAt: '2025-01-01T00:00:00.000Z',
      };

      const session = Session.fromJSON(json);

      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.lastActivityAt).toBeInstanceOf(Date);
      expect(session.createdAt.toISOString()).toBe(json.createdAt);
    });

    it('should deserialize revoked session with revocation data', () => {
      const json = {
        id: 'session-123',
        userId: 'user-456',
        organizationId: 'org-789',
        refreshTokenHash: 'a'.repeat(64),
        deviceInfo: validDeviceInfo,
        createdAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-01-08T00:00:00.000Z',
        lastActivityAt: '2025-01-01T00:00:00.000Z',
        revokedAt: '2025-01-02T00:00:00.000Z',
        revokedReason: 'user_logout',
      };

      const session = Session.fromJSON(json);

      expect(session.revokedAt).toBeInstanceOf(Date);
      expect(session.revokedAt?.toISOString()).toBe(json.revokedAt);
      expect(session.revokedReason).toBe(json.revokedReason);
    });

    it('should handle undefined revokedAt/revokedReason', () => {
      const json = {
        id: 'session-123',
        userId: 'user-456',
        organizationId: 'org-789',
        refreshTokenHash: 'a'.repeat(64),
        deviceInfo: validDeviceInfo,
        createdAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-01-08T00:00:00.000Z',
        lastActivityAt: '2025-01-01T00:00:00.000Z',
        revokedAt: undefined,
        revokedReason: undefined,
      };

      const session = Session.fromJSON(json);

      expect(session.revokedAt).toBeUndefined();
      expect(session.revokedReason).toBeUndefined();
    });

    it('should round-trip serialize and deserialize correctly', () => {
      const originalSession = new Session(validSessionProps);
      const json = originalSession.toJSON();
      const deserializedSession = Session.fromJSON(json);

      expect(deserializedSession.id).toBe(originalSession.id);
      expect(deserializedSession.userId).toBe(originalSession.userId);
      expect(deserializedSession.organizationId).toBe(originalSession.organizationId);
      expect(deserializedSession.createdAt.getTime()).toBe(originalSession.createdAt.getTime());
      expect(deserializedSession.expiresAt.getTime()).toBe(originalSession.expiresAt.getTime());
      expect(deserializedSession.isActive()).toBe(originalSession.isActive());
    });
  });

  describe('withUpdatedActivity() - Immutability', () => {
    it('should create new session with updated lastActivityAt', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T12:00:00Z'));

      const originalSession = new Session(validSessionProps);
      const updatedSession = originalSession.withUpdatedActivity();

      expect(updatedSession).not.toBe(originalSession);
      expect(updatedSession.lastActivityAt.getTime()).toBeGreaterThan(
        originalSession.lastActivityAt.getTime()
      );
      expect(updatedSession.lastActivityAt.toISOString()).toBe('2025-01-05T12:00:00.000Z');

      vi.useRealTimers();
    });

    it('should preserve all other fields when updating activity', () => {
      const originalSession = new Session(validSessionProps);
      const updatedSession = originalSession.withUpdatedActivity();

      expect(updatedSession.id).toBe(originalSession.id);
      expect(updatedSession.userId).toBe(originalSession.userId);
      expect(updatedSession.organizationId).toBe(originalSession.organizationId);
      expect(updatedSession.refreshTokenHash).toBe(originalSession.refreshTokenHash);
      expect(updatedSession.createdAt).toEqual(originalSession.createdAt);
      expect(updatedSession.expiresAt).toEqual(originalSession.expiresAt);
    });

    it('should not mutate original session', () => {
      const originalSession = new Session(validSessionProps);
      const originalActivityTime = originalSession.lastActivityAt.getTime();

      originalSession.withUpdatedActivity();

      expect(originalSession.lastActivityAt.getTime()).toBe(originalActivityTime);
    });
  });

  describe('withRevocation() - Immutability', () => {
    it('should create new session with revocation data', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T12:00:00Z'));

      const originalSession = new Session(validSessionProps);
      const revokedSession = originalSession.withRevocation('user_logout');

      expect(revokedSession).not.toBe(originalSession);
      expect(revokedSession.revokedAt).toBeInstanceOf(Date);
      expect(revokedSession.revokedAt?.toISOString()).toBe('2025-01-05T12:00:00.000Z');
      expect(revokedSession.revokedReason).toBe('user_logout');

      vi.useRealTimers();
    });

    it('should preserve all other fields when revoking', () => {
      const originalSession = new Session(validSessionProps);
      const revokedSession = originalSession.withRevocation('admin_revoked');

      expect(revokedSession.id).toBe(originalSession.id);
      expect(revokedSession.userId).toBe(originalSession.userId);
      expect(revokedSession.organizationId).toBe(originalSession.organizationId);
      expect(revokedSession.refreshTokenHash).toBe(originalSession.refreshTokenHash);
      expect(revokedSession.createdAt).toEqual(originalSession.createdAt);
      expect(revokedSession.expiresAt).toEqual(originalSession.expiresAt);
      expect(revokedSession.lastActivityAt).toEqual(originalSession.lastActivityAt);
    });

    it('should not mutate original session', () => {
      const originalSession = new Session(validSessionProps);

      originalSession.withRevocation('user_logout');

      expect(originalSession.revokedAt).toBeUndefined();
      expect(originalSession.revokedReason).toBeUndefined();
    });

    it('should support all revocation reasons', () => {
      const reasons: SessionRevocationReason[] = [
        'user_logout',
        'admin_revoked',
        'token_rotated',
        'expired',
        'suspicious_activity',
        'password_changed',
        'session_limit_exceeded',
      ];

      const session = new Session(validSessionProps);

      reasons.forEach((reason) => {
        const revokedSession = session.withRevocation(reason);
        expect(revokedSession.revokedReason).toBe(reason);
        expect(revokedSession.isRevoked()).toBe(true);
      });
    });

    it('should allow re-revocation with different reason', () => {
      const session = new Session({
        ...validSessionProps,
        revokedAt: new Date('2025-01-02T00:00:00Z'),
        revokedReason: 'user_logout',
      });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-05T00:00:00Z'));

      const reRevokedSession = session.withRevocation('admin_revoked');

      expect(reRevokedSession.revokedReason).toBe('admin_revoked');
      expect(reRevokedSession.revokedAt?.toISOString()).toBe('2025-01-05T00:00:00.000Z');

      vi.useRealTimers();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long refresh token hashes', () => {
      const veryLongHash = 'a'.repeat(200);

      const session = new Session({
        ...validSessionProps,
        refreshTokenHash: veryLongHash,
      });

      expect(session.refreshTokenHash).toBe(veryLongHash);
    });

    it('should handle sessions with millisecond precision timestamps', () => {
      const preciseDate = new Date('2025-01-01T12:34:56.789Z');

      const session = new Session({
        ...validSessionProps,
        createdAt: preciseDate,
        lastActivityAt: preciseDate,
      });

      expect(session.createdAt.getTime()).toBe(preciseDate.getTime());
      expect(session.lastActivityAt.getMilliseconds()).toBe(789);
    });

    it('should handle device names with special characters', () => {
      const specialDeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        deviceName: 'Chrome 120 (Beta) on "Windows 11" [x64] & Others',
      };

      const session = new Session({
        ...validSessionProps,
        deviceInfo: specialDeviceInfo,
      });

      expect(session.deviceInfo.deviceName).toBe(specialDeviceInfo.deviceName);
    });

    it('should handle IPv6 masked addresses', () => {
      const ipv6DeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        ipAddress: '2001:0db8:85a3:0000:xxxx:xxxx:xxxx:xxxx',
      };

      const session = new Session({
        ...validSessionProps,
        deviceInfo: ipv6DeviceInfo,
      });

      expect(session.deviceInfo.ipAddress).toBe(ipv6DeviceInfo.ipAddress);
    });

    it('should handle very long user agent strings', () => {
      const longUA = 'Mozilla/5.0 ' + 'x'.repeat(500);
      const longUADeviceInfo: DeviceInfo = {
        ...validDeviceInfo,
        userAgent: longUA,
      };

      const session = new Session({
        ...validSessionProps,
        deviceInfo: longUADeviceInfo,
      });

      expect(session.deviceInfo.userAgent).toBe(longUA);
    });
  });
});
