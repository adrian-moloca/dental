/**
 * BackupCodesDisplay Component
 *
 * Modal dialog for viewing and regenerating backup codes
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface BackupCodesDisplayProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Backup codes to display
   */
  codes?: string[];
  /**
   * Date when codes were generated
   */
  generatedAt?: Date;
  /**
   * Loading state when fetching codes
   */
  isLoading?: boolean;
  /**
   * Loading state when regenerating codes
   */
  isRegenerating?: boolean;
  /**
   * Callback to regenerate codes
   */
  onRegenerate: () => void;
}

/**
 * Modal for viewing and managing backup codes
 */
export function BackupCodesDisplay({
  open,
  onClose,
  codes,
  generatedAt,
  isLoading,
  isRegenerating,
  onRegenerate,
}: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleCopyAll = async () => {
    if (codes) {
      const codesText = codes.join('\n');
      await navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (codes) {
      const codesText = codes.join('\n');
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dental-os-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true);
  };

  const handleConfirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    onRegenerate();
  };

  const handleCancelRegenerate = () => {
    setShowRegenerateConfirm(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
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
              Loading backup codes...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Regenerate confirmation dialog
  if (showRegenerateConfirm) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes?</DialogTitle>
            <DialogDescription>
              This will invalidate your current backup codes and generate new ones.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
              <svg
                className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5"
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
                <p className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  Your old codes will no longer work
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300 mt-1">
                  Make sure to save the new codes in a secure location after regenerating them.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelRegenerate}
              disabled={isRegenerating}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmRegenerate}
              loading={isRegenerating}
            >
              Regenerate Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Main display
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Backup Codes</DialogTitle>
          <DialogDescription>
            Use these codes to access your account if you lose your authenticator device.
            Each code can only be used once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
            <svg
              className="w-5 h-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-info-800 dark:text-info-200">
                Store these codes safely
              </p>
              <p className="text-sm text-info-700 dark:text-info-300 mt-1">
                Keep them in a secure password manager or print them and store them in a safe place.
              </p>
            </div>
          </div>

          {/* Backup codes grid */}
          {codes && codes.length > 0 && (
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Your Backup Codes
                  </p>
                  {generatedAt && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Generated on {new Date(generatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <Badge tone="warning">Save These</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-sm mb-3">
                {codes.map((code, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                  >
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAll}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Copy All
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleRegenerateClick}>
            Regenerate Codes
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
