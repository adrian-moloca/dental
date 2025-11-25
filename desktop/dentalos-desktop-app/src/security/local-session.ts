import * as bcrypt from 'bcrypt';
import { EventEmitter } from 'events';

const SALT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export enum LockReason {
  MANUAL = 'MANUAL',
  INACTIVITY = 'INACTIVITY',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
}

interface SessionState {
  isLocked: boolean;
  failedUnlockAttempts: number;
  lockedAt: Date | null;
  lockReason: LockReason | null;
  pinHash: string | null;
}

export class LocalSessionManager extends EventEmitter {
  private state: SessionState = {
    isLocked: false,
    failedUnlockAttempts: 0,
    lockedAt: null,
    lockReason: null,
    pinHash: null,
  };

  async setLocalPin(pin: string): Promise<void> {
    if (!pin || pin.length < 4) {
      throw new Error('PIN must be at least 4 characters');
    }

    const hash = await bcrypt.hash(pin, SALT_ROUNDS);
    this.state.pinHash = hash;
    this.emit('pin-set');
  }

  async verifyLocalPin(inputPin: string): Promise<boolean> {
    if (!this.state.pinHash) {
      throw new Error('No PIN has been set');
    }

    // Constant-time comparison via bcrypt
    const isValid = await bcrypt.compare(inputPin, this.state.pinHash);
    return isValid;
  }

  async unlockSessionWithPin(inputPin: string): Promise<{ success: boolean; reason?: string }> {
    // Check if currently in lockout period
    if (this.isInLockoutPeriod()) {
      const remainingTime = this.getRemainingLockoutTime();
      return {
        success: false,
        reason: `Too many failed attempts. Try again in ${Math.ceil(remainingTime / 60000)} minutes.`,
      };
    }

    if (!this.state.pinHash) {
      return { success: false, reason: 'No PIN configured' };
    }

    try {
      const isValid = await this.verifyLocalPin(inputPin);

      if (isValid) {
        // Successful unlock
        this.state.isLocked = false;
        this.state.failedUnlockAttempts = 0;
        this.state.lockedAt = null;
        this.state.lockReason = null;
        this.emit('unlocked');
        return { success: true };
      } else {
        // Failed attempt
        this.state.failedUnlockAttempts++;
        this.emit('unlock-failed', this.state.failedUnlockAttempts);

        if (this.state.failedUnlockAttempts >= MAX_FAILED_ATTEMPTS) {
          // Trigger lockout
          this.lockSession(LockReason.TOO_MANY_ATTEMPTS);
          return {
            success: false,
            reason: `Too many failed attempts. Locked for ${LOCKOUT_DURATION_MS / 60000} minutes.`,
          };
        }

        return {
          success: false,
          reason: `Invalid PIN. ${MAX_FAILED_ATTEMPTS - this.state.failedUnlockAttempts} attempts remaining.`,
        };
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      return { success: false, reason: 'Verification failed' };
    }
  }

  lockSession(reason: LockReason = LockReason.MANUAL): void {
    this.state.isLocked = true;
    this.state.lockedAt = new Date();
    this.state.lockReason = reason;
    this.emit('locked', reason);
  }

  isSessionLocked(): boolean {
    // Check if locked and still within lockout period for TOO_MANY_ATTEMPTS
    if (this.state.isLocked && this.state.lockReason === LockReason.TOO_MANY_ATTEMPTS) {
      if (!this.isInLockoutPeriod()) {
        // Lockout period expired, reset
        this.state.failedUnlockAttempts = 0;
        this.state.isLocked = false;
        this.state.lockedAt = null;
        this.state.lockReason = null;
        this.emit('lockout-expired');
        return false;
      }
    }

    return this.state.isLocked;
  }

  getLockReason(): LockReason | null {
    return this.state.lockReason;
  }

  getFailedAttempts(): number {
    return this.state.failedUnlockAttempts;
  }

  getRemainingLockoutTime(): number {
    if (!this.state.lockedAt || this.state.lockReason !== LockReason.TOO_MANY_ATTEMPTS) {
      return 0;
    }

    const elapsed = Date.now() - this.state.lockedAt.getTime();
    const remaining = LOCKOUT_DURATION_MS - elapsed;
    return Math.max(0, remaining);
  }

  private isInLockoutPeriod(): boolean {
    if (!this.state.lockedAt || this.state.lockReason !== LockReason.TOO_MANY_ATTEMPTS) {
      return false;
    }

    const elapsed = Date.now() - this.state.lockedAt.getTime();
    return elapsed < LOCKOUT_DURATION_MS;
  }

  hasPinConfigured(): boolean {
    return this.state.pinHash !== null;
  }

  clearPin(): void {
    this.state.pinHash = null;
    this.emit('pin-cleared');
  }

  resetFailedAttempts(): void {
    this.state.failedUnlockAttempts = 0;
  }

  getSessionState(): Readonly<SessionState> {
    return { ...this.state };
  }
}

let instance: LocalSessionManager | null = null;

export function getLocalSessionManager(): LocalSessionManager {
  if (!instance) {
    instance = new LocalSessionManager();
  }
  return instance;
}
