/**
 * Settings Security Page
 *
 * Security settings page with MFA management
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { NewAppShell } from '../components/layout/NewAppShell';
import { MFAStatusCard } from '../components/security/MFAStatusCard';
import { TOTPSetupModal } from '../components/security/TOTPSetupModal';
import { BackupCodesDisplay } from '../components/security/BackupCodesDisplay';
import { DisableMFAModal } from '../components/security/DisableMFAModal';
import { authClient } from '../api/authClient';
import type { MfaEnrollResponseDto } from '../types/auth.types';

/**
 * Security settings page with MFA configuration
 */
export default function SettingsSecurityPage() {
  const queryClient = useQueryClient();

  // State for modals
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);

  // MFA enrollment data
  const [enrollmentData, setEnrollmentData] = useState<MfaEnrollResponseDto | null>(null);
  const [setupComplete, setSetupComplete] = useState(false);

  // Fetch MFA status
  const {
    data: mfaStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useQuery({
    queryKey: ['mfa', 'status'],
    queryFn: () => authClient.getMfaStatus(),
    retry: 2,
  });

  // Fetch backup codes
  const {
    data: backupCodesData,
    isLoading: isLoadingBackupCodes,
    refetch: refetchBackupCodes,
  } = useQuery({
    queryKey: ['mfa', 'backup-codes'],
    queryFn: () => authClient.getBackupCodes(),
    enabled: false, // Only fetch when user requests
  });

  // Enroll MFA mutation
  const enrollMutation = useMutation({
    mutationFn: () => authClient.enrollMfa(),
    onSuccess: (data) => {
      setEnrollmentData(data);
    },
    onError: () => {
      toast.error('Failed to start MFA enrollment');
      setShowSetupModal(false);
    },
  });

  // Verify MFA mutation
  const verifyMutation = useMutation({
    mutationFn: (code: string) => authClient.verifyMfa({ code }),
    onSuccess: () => {
      setSetupComplete(true);
      toast.success('Two-factor authentication has been enabled');
      queryClient.invalidateQueries({ queryKey: ['mfa', 'status'] });
    },
    onError: () => {
      toast.error('Invalid verification code. Please try again.');
    },
  });

  // Disable MFA mutation
  const disableMutation = useMutation({
    mutationFn: (password: string) => authClient.disableMfa({ password }),
    onSuccess: () => {
      toast.success('Two-factor authentication has been disabled');
      setShowDisableModal(false);
      queryClient.invalidateQueries({ queryKey: ['mfa', 'status'] });
    },
    onError: () => {
      toast.error('Failed to disable MFA. Check your password.');
    },
  });

  // Regenerate backup codes mutation
  const regenerateBackupCodesMutation = useMutation({
    mutationFn: () => authClient.regenerateBackupCodes(),
    onSuccess: (data) => {
      toast.success('New backup codes generated');
      queryClient.setQueryData(['mfa', 'backup-codes'], data);
    },
    onError: () => {
      toast.error('Failed to regenerate backup codes');
    },
  });

  // Handle enable MFA
  const handleEnableMfa = () => {
    setShowSetupModal(true);
    setSetupComplete(false);
    setEnrollmentData(null);
    enrollMutation.mutate();
  };

  // Handle close setup modal
  const handleCloseSetupModal = () => {
    setShowSetupModal(false);
    setEnrollmentData(null);
    setSetupComplete(false);
  };

  // Handle setup complete
  const handleSetupComplete = () => {
    setShowSetupModal(false);
    setEnrollmentData(null);
    setSetupComplete(false);
  };

  // Handle view backup codes
  const handleViewBackupCodes = () => {
    setShowBackupCodesModal(true);
    refetchBackupCodes();
  };

  // Handle disable MFA
  const handleDisableMfa = () => {
    setShowDisableModal(true);
  };

  // Handle verify code
  const handleVerifyCode = (code: string) => {
    verifyMutation.mutate(code);
  };

  // Handle disable confirm
  const handleConfirmDisable = (password: string) => {
    disableMutation.mutate(password);
  };

  // Handle regenerate backup codes
  const handleRegenerateBackupCodes = () => {
    regenerateBackupCodesMutation.mutate();
  };

  // Error state
  if (statusError) {
    return (
      <NewAppShell
        title="Security Settings"
        subtitle="Manage your account security"
      >
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
            <svg
              className="w-5 h-5 text-danger-600 dark:text-danger-400 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-danger-800 dark:text-danger-200">
                Failed to load security settings
              </p>
              <p className="text-sm text-danger-700 dark:text-danger-300 mt-1">
                Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </NewAppShell>
    );
  }

  return (
    <NewAppShell
      title="Security Settings"
      subtitle="Manage your account security and two-factor authentication"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Security Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Keep your account secure with two-factor authentication
          </p>
        </div>

        {/* MFA Status Card */}
        <MFAStatusCard
          enabled={mfaStatus?.enabled || false}
          enrolledAt={mfaStatus?.enrolledAt}
          isLoading={isLoadingStatus}
          onEnableMfa={handleEnableMfa}
          onDisableMfa={handleDisableMfa}
          onViewBackupCodes={handleViewBackupCodes}
        />

        {/* Additional Security Information */}
        <div className="p-4 rounded-lg bg-info-50 dark:bg-info-900/20 border border-info-200 dark:border-info-800">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-info-600 dark:text-info-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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
                Why enable two-factor authentication?
              </p>
              <p className="text-sm text-info-700 dark:text-info-300 mt-1">
                Two-factor authentication (2FA) adds an extra layer of security to your account.
                Even if someone gets your password, they won't be able to access your account
                without the verification code from your authenticator app.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOTP Setup Modal */}
      <TOTPSetupModal
        open={showSetupModal}
        onClose={handleCloseSetupModal}
        secret={enrollmentData?.secret}
        qrCodeDataUrl={enrollmentData?.qrCodeDataUrl}
        backupCodes={enrollmentData?.backupCodes}
        isEnrolling={enrollMutation.isPending}
        isVerifying={verifyMutation.isPending}
        verificationError={verifyMutation.isError ? 'Invalid code. Please try again.' : undefined}
        isComplete={setupComplete}
        onVerify={handleVerifyCode}
        onComplete={handleSetupComplete}
      />

      {/* Backup Codes Display Modal */}
      <BackupCodesDisplay
        open={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        codes={backupCodesData?.codes}
        generatedAt={backupCodesData?.generatedAt}
        isLoading={isLoadingBackupCodes}
        isRegenerating={regenerateBackupCodesMutation.isPending}
        onRegenerate={handleRegenerateBackupCodes}
      />

      {/* Disable MFA Modal */}
      <DisableMFAModal
        open={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        isDisabling={disableMutation.isPending}
        error={disableMutation.isError ? 'Incorrect password. Please try again.' : undefined}
        onDisable={handleConfirmDisable}
      />
    </NewAppShell>
  );
}
