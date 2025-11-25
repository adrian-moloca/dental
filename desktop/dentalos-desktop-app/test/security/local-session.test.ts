import { LocalSessionManager, LockReason } from '../../src/security/local-session';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('LocalSessionManager', () => {
  let sessionManager: LocalSessionManager;

  beforeEach(() => {
    sessionManager = new LocalSessionManager();
    jest.clearAllMocks();
  });

  describe('setLocalPin', () => {
    it('should hash and store the PIN', async () => {
      const mockHash = '$2b$10$hashedpin123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      await sessionManager.setLocalPin('1234');

      expect(bcrypt.hash).toHaveBeenCalledWith('1234', 10);
    });

    it('should reject PINs shorter than 4 characters', async () => {
      await expect(sessionManager.setLocalPin('123')).rejects.toThrow(
        'PIN must be at least 4 characters'
      );
    });

    it('should emit pin-set event', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      const listener = jest.fn();
      sessionManager.on('pin-set', listener);

      await sessionManager.setLocalPin('1234');

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('unlockSessionWithPin', () => {
    beforeEach(async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      await sessionManager.setLocalPin('1234');
      sessionManager.lockSession(LockReason.MANUAL);
    });

    it('should unlock with correct PIN', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await sessionManager.unlockSessionWithPin('1234');

      expect(result.success).toBe(true);
      expect(sessionManager.isSessionLocked()).toBe(false);
      expect(sessionManager.getFailedAttempts()).toBe(0);
    });

    it('should track failed attempts on incorrect PIN', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await sessionManager.unlockSessionWithPin('wrong');

      expect(result.success).toBe(false);
      expect(sessionManager.getFailedAttempts()).toBe(1);
      expect(result.reason).toContain('Invalid PIN');
    });

    it('should lock for 15 minutes after 5 failed attempts', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        await sessionManager.unlockSessionWithPin('wrong');
      }

      expect(sessionManager.getLockReason()).toBe(LockReason.TOO_MANY_ATTEMPTS);
      expect(sessionManager.isSessionLocked()).toBe(true);

      const remainingTime = sessionManager.getRemainingLockoutTime();
      expect(remainingTime).toBeGreaterThan(0);
      expect(remainingTime).toBeLessThanOrEqual(15 * 60 * 1000);
    });

    it('should prevent unlock during lockout period', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      for (let i = 0; i < 5; i++) {
        await sessionManager.unlockSessionWithPin('wrong');
      }

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await sessionManager.unlockSessionWithPin('1234');

      expect(result.success).toBe(false);
      expect(result.reason).toContain('Too many failed attempts');
    });

    it('should emit unlock-failed event on failed attempt', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const listener = jest.fn();
      sessionManager.on('unlock-failed', listener);

      await sessionManager.unlockSessionWithPin('wrong');

      expect(listener).toHaveBeenCalledWith(1);
    });

    it('should emit unlocked event on successful unlock', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const listener = jest.fn();
      sessionManager.on('unlocked', listener);

      await sessionManager.unlockSessionWithPin('1234');

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('lockSession', () => {
    it('should lock the session with specified reason', () => {
      sessionManager.lockSession(LockReason.INACTIVITY);

      expect(sessionManager.isSessionLocked()).toBe(true);
      expect(sessionManager.getLockReason()).toBe(LockReason.INACTIVITY);
    });

    it('should emit locked event', () => {
      const listener = jest.fn();
      sessionManager.on('locked', listener);

      sessionManager.lockSession(LockReason.MANUAL);

      expect(listener).toHaveBeenCalledWith(LockReason.MANUAL);
    });
  });

  describe('isSessionLocked', () => {
    it('should return false when not locked', () => {
      expect(sessionManager.isSessionLocked()).toBe(false);
    });

    it('should return true when locked', () => {
      sessionManager.lockSession();
      expect(sessionManager.isSessionLocked()).toBe(true);
    });

    it('should auto-expire lockout after 15 minutes', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await sessionManager.setLocalPin('1234');
      sessionManager.lockSession();

      for (let i = 0; i < 5; i++) {
        await sessionManager.unlockSessionWithPin('wrong');
      }

      const state = sessionManager.getSessionState();
      const lockedAt = state.lockedAt!;
      lockedAt.setTime(lockedAt.getTime() - 16 * 60 * 1000);

      expect(sessionManager.isSessionLocked()).toBe(false);
    });
  });

  describe('hasPinConfigured', () => {
    it('should return false when no PIN is set', () => {
      expect(sessionManager.hasPinConfigured()).toBe(false);
    });

    it('should return true after PIN is set', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      await sessionManager.setLocalPin('1234');

      expect(sessionManager.hasPinConfigured()).toBe(true);
    });
  });

  describe('clearPin', () => {
    it('should remove the PIN hash', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      await sessionManager.setLocalPin('1234');

      sessionManager.clearPin();

      expect(sessionManager.hasPinConfigured()).toBe(false);
    });

    it('should emit pin-cleared event', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpin123');
      await sessionManager.setLocalPin('1234');

      const listener = jest.fn();
      sessionManager.on('pin-cleared', listener);

      sessionManager.clearPin();

      expect(listener).toHaveBeenCalled();
    });
  });
});
