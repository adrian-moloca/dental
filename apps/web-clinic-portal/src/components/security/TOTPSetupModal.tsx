/**
 * TOTPSetupModal Component
 *
 * Modal dialog for setting up TOTP-based MFA
 * Shows QR code, manual entry key, and verification step
 */

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
import { Badge } from '../ui/Badge';

interface TOTPSetupModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * TOTP secret for QR code generation
   */
  secret?: string;
  /**
   * QR code data URL (otpauth:// format)
   */
  qrCodeDataUrl?: string;
  /**
   * Backup codes to display after verification
   */
  backupCodes?: string[];
  /**
   * Loading state during enrollment
   */
  isEnrolling?: boolean;
  /**
   * Loading state during verification
   */
  isVerifying?: boolean;
  /**
   * Error message from verification
   */
  verificationError?: string;
  /**
   * Whether setup is complete
   */
  isComplete?: boolean;
  /**
   * Callback to verify TOTP code
   */
  onVerify: (code: string) => void;
  /**
   * Callback when setup is complete
   */
  onComplete: () => void;
}

/**
 * Modal for TOTP setup flow with QR code and verification
 */
export function TOTPSetupModal({
  open,
  onClose,
  secret,
  qrCodeDataUrl,
  backupCodes,
  isEnrolling,
  isVerifying,
  verificationError,
  isComplete,
  onVerify,
  onComplete,
}: TOTPSetupModalProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [secretCopied, setSecretCopied] = useState(false);

  const handleCopySecret = async () => {
    if (secret) {
      await navigator.clipboard.writeText(secret);
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      onVerify(verificationCode);
    }
  };

  const handleComplete = () => {
    setVerificationCode('');
    onComplete();
  };

  // Enrollment loading state
  if (isEnrolling) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent hideCloseButton>
          <div className="flex flex-col items-center justify-center py-8">
            <svg
              className="h-12 w-12 animate-spin text-primary-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Generating your secure key...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state - show backup codes
  if (isComplete && backupCodes) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Two-Factor Authentication Enabled</DialogTitle>
            <DialogDescription>
              Save these backup codes in a secure location. You can use them to access your account if you lose your device.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Success message */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
              <svg
                className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-success-800 dark:text-success-200">
                Two-factor authentication has been successfully enabled for your account.
              </p>
            </div>

            {/* Backup codes */}
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Backup Codes
                </p>
                <Badge tone="warning">Save These</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700"
                  >
                    {code}
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3">
                Each code can only be used once. Store them safely.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="primary" onClick={handleComplete}>
              I've Saved My Backup Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Setup state - show QR code and verification
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app, then enter the verification code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold">
                1
              </div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Scan QR Code
              </h3>
            </div>

            {qrCodeDataUrl && (
              <div className="flex justify-center p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <QRCodeSVG
                  value={qrCodeDataUrl}
                  size={200}
                  level="H"
                  includeMargin
                  aria-label="QR code for authenticator app"
                />
              </div>
            )}

            <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
              Use Google Authenticator, Authy, or any TOTP-compatible app
            </p>
          </div>

          {/* Manual Entry Alternative */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Can't scan? Enter manually
            </h3>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <code className="flex-1 text-sm font-mono text-neutral-900 dark:text-neutral-100 break-all">
                {secret}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopySecret}
                aria-label="Copy secret key"
              >
                {secretCopied ? (
                  <svg
                    className="w-4 h-4 text-success-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Step 2: Verify Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold">
                2
              </div>
              <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Enter Verification Code
              </h3>
            </div>

            <Input
              type="text"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              maxLength={6}
              error={verificationError}
              hint="Enter the 6-digit code from your authenticator app"
              className="text-center text-2xl tracking-widest font-mono"
              autoFocus
              aria-label="Verification code"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isVerifying}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
            loading={isVerifying}
          >
            Verify and Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
