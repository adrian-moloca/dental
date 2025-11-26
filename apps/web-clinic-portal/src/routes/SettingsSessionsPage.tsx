/**
 * Settings Sessions Page
 *
 * Allows users to view and manage their active sessions across devices
 */

import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';
import { SessionCard } from '../components/settings/SessionCard';
import { Modal } from '../components/overlay/Modal';
import { useSessions, useRevokeSession, useRevokeAllOtherSessions } from '../hooks/useSessions';

export default function SettingsSessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllOtherSessionsMutation = useRevokeAllOtherSessions();

  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);

  // Handle single session revocation
  const handleRevokeSingleSession = () => {
    if (sessionToRevoke) {
      revokeSessionMutation.mutate(sessionToRevoke, {
        onSuccess: () => {
          setSessionToRevoke(null);
        },
      });
    }
  };

  // Handle revoke all other sessions
  const handleRevokeAllOtherSessions = () => {
    revokeAllOtherSessionsMutation.mutate(undefined, {
      onSuccess: () => {
        setShowRevokeAllModal(false);
      },
    });
  };

  // Open confirmation modal
  const handleRevokeClick = (sessionId: string) => {
    setSessionToRevoke(sessionId);
  };

  // Sort sessions: current first, then by last active
  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
      })
    : [];

  const otherSessionsCount = sessions?.filter((s) => !s.isCurrent).length || 0;

  // Error state
  if (error) {
    return (
      <AppShell title="Active Sessions" subtitle="Manage your devices">
        <Card tone="glass" padding="lg" className="text-red-300 border border-red-500/30">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Error loading sessions</h3>
              <p className="text-sm">{(error as Error).message}</p>
            </div>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Active Sessions"
      subtitle="Manage where you're signed in"
      actions={
        otherSessionsCount > 0 ? (
          <Button
            variant="ghost"
            onClick={() => setShowRevokeAllModal(true)}
            disabled={revokeAllOtherSessionsMutation.isPending}
          >
            Revoke All Other Sessions
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Info Card */}
        <Card tone="glass" padding="lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Security Overview</h3>
              <p className="text-sm text-slate-300">
                These are the devices and browsers where you're currently signed in to your DentalOS account.
                If you see a session you don't recognize, revoke it immediately and consider changing your password.
              </p>
            </div>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4" role="status" aria-label="Loading sessions">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
            <span className="sr-only">Loading session data...</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedSessions.length === 0 && (
          <Card tone="glass" padding="lg">
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-slate-500 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-1">No Active Sessions</h3>
              <p className="text-sm text-slate-400">
                You don't have any active sessions at the moment.
              </p>
            </div>
          </Card>
        )}

        {/* Sessions List */}
        {!isLoading && sortedSessions.length > 0 && (
          <div className="space-y-4" role="list" aria-label="Active sessions">
            {sortedSessions.map((session) => (
              <div key={session.id} role="listitem">
                <SessionCard
                  session={session}
                  onRevoke={handleRevokeClick}
                  isRevoking={
                    revokeSessionMutation.isPending &&
                    sessionToRevoke === session.id
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Session Count Info */}
        {!isLoading && sortedSessions.length > 0 && (
          <Card tone="glass" padding="md">
            <p className="text-sm text-slate-400 text-center">
              {sortedSessions.length} active session{sortedSessions.length !== 1 ? 's' : ''}
              {otherSessionsCount > 0 && (
                <span> ({otherSessionsCount} other device{otherSessionsCount !== 1 ? 's' : ''})</span>
              )}
            </p>
          </Card>
        )}
      </div>

      {/* Revoke Single Session Confirmation Modal */}
      <Modal
        open={sessionToRevoke !== null}
        onClose={() => setSessionToRevoke(null)}
        title="Revoke Session?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to revoke this session? This device will be signed out immediately
            and will need to sign in again to access DentalOS.
          </p>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setSessionToRevoke(null)}
              disabled={revokeSessionMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRevokeSingleSession}
              loading={revokeSessionMutation.isPending}
              disabled={revokeSessionMutation.isPending}
            >
              Revoke Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke All Other Sessions Confirmation Modal */}
      <Modal
        open={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        title="Revoke All Other Sessions?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to revoke all other sessions? This will sign out all devices except your
            current one. Those devices will need to sign in again to access DentalOS.
          </p>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-xs text-yellow-200">
                This will affect {otherSessionsCount} active session{otherSessionsCount !== 1 ? 's' : ''}.
                Your current session will remain active.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setShowRevokeAllModal(false)}
              disabled={revokeAllOtherSessionsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRevokeAllOtherSessions}
              loading={revokeAllOtherSessionsMutation.isPending}
              disabled={revokeAllOtherSessionsMutation.isPending}
            >
              Revoke All Other Sessions
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
