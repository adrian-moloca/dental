/**
 * MFAStatusCard Component
 *
 * Displays current MFA status and provides action buttons
 * to enable or disable MFA
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface MFAStatusCardProps {
  /**
   * Whether MFA is currently enabled
   */
  enabled: boolean;
  /**
   * Date when MFA was enrolled
   */
  enrolledAt?: Date;
  /**
   * Loading state for status check
   */
  isLoading?: boolean;
  /**
   * Callback when user wants to enable MFA
   */
  onEnableMfa: () => void;
  /**
   * Callback when user wants to disable MFA
   */
  onDisableMfa: () => void;
  /**
   * Callback when user wants to view backup codes
   */
  onViewBackupCodes: () => void;
}

/**
 * Card component showing MFA status with enable/disable actions
 */
export function MFAStatusCard({
  enabled,
  enrolledAt,
  isLoading,
  onEnableMfa,
  onDisableMfa,
  onViewBackupCodes,
}: MFAStatusCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>Loading MFA status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <svg
              className="h-8 w-8 animate-spin text-primary-500"
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <Badge tone={enabled ? 'success' : 'neutral'}>
            {enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <CardDescription>
          {enabled
            ? 'Your account is protected with two-factor authentication using an authenticator app.'
            : 'Add an extra layer of security to your account by requiring a code from your authenticator app when signing in.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Security Icon */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <div
              className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${
                enabled
                  ? 'bg-success-100 dark:bg-success-900/30'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
            >
              <svg
                className={`w-6 h-6 ${enabled ? 'text-success-600 dark:text-success-400' : 'text-neutral-600 dark:text-neutral-400'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {enabled ? 'Two-factor authentication is active' : 'Two-factor authentication is not set up'}
              </p>
              {enabled && enrolledAt && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Enabled on {new Date(enrolledAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Info about MFA */}
          {!enabled && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                How it works:
              </p>
              <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1 ml-4 list-disc">
                <li>Download an authenticator app (Google Authenticator, Authy, or similar)</li>
                <li>Scan the QR code we provide with your app</li>
                <li>Enter the 6-digit code to verify setup</li>
                <li>Save backup codes in case you lose access to your device</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-col sm:flex-row gap-2">
        {enabled ? (
          <>
            <Button
              variant="outline"
              onClick={onViewBackupCodes}
              className="w-full sm:w-auto"
            >
              View Backup Codes
            </Button>
            <Button
              variant="danger"
              onClick={onDisableMfa}
              className="w-full sm:w-auto"
            >
              Disable MFA
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            onClick={onEnableMfa}
            className="w-full sm:w-auto"
          >
            Enable MFA
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
