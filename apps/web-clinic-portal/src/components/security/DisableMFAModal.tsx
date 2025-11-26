/**
 * DisableMFAModal Component
 *
 * Modal dialog for disabling MFA with password confirmation
 */

import { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface DisableMFAModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Loading state during disable operation
   */
  isDisabling?: boolean;
  /**
   * Error message from disable operation
   */
  error?: string;
  /**
   * Callback to disable MFA with password
   */
  onDisable: (password: string) => void;
}

/**
 * Confirmation modal for disabling MFA
 */
export function DisableMFAModal({
  open,
  onClose,
  isDisabling,
  error,
  onDisable,
}: DisableMFAModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onDisable(password);
    }
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Enter your password to confirm that you want to disable two-factor authentication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning message */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
            <svg
              className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
                This will reduce your account security
              </p>
              <p className="text-sm text-danger-700 dark:text-danger-300 mt-1">
                Your account will only be protected by your password. We strongly recommend keeping two-factor authentication enabled.
              </p>
            </div>
          </div>

          {/* Password input */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={error}
              required
              fullWidth
              autoFocus
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDisabling}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={!password.trim() || isDisabling}
              loading={isDisabling}
            >
              Disable MFA
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
