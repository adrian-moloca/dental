/**
 * Session Card Component
 *
 * Displays a single user session with device info, location, and revoke action
 */

import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRelativeTime, formatLongDateTime, maskIpAddress } from '../../utils/dateUtils';
import type { SessionDto } from '../../types/auth.types';

interface SessionCardProps {
  session: SessionDto;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

/**
 * Get device type icon based on device info
 */
function getDeviceIcon(session: SessionDto): JSX.Element {
  const deviceType = session.device?.type || 'desktop';

  switch (deviceType) {
    case 'mobile':
      return (
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
          />
        </svg>
      );
    case 'tablet':
      return (
        <svg
          className="w-8 h-8 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="w-8 h-8 text-slate-400"
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
      );
  }
}

/**
 * Get browser display name
 */
function getBrowserDisplay(session: SessionDto): string {
  if (session.browser) {
    return `${session.browser.name}${session.browser.version ? ` ${session.browser.version}` : ''}`;
  }
  // Fallback to deviceInfo parsing if browser not provided
  return session.deviceInfo || 'Unknown Browser';
}

/**
 * Get OS display name
 */
function getOSDisplay(session: SessionDto): string {
  if (session.os) {
    return `${session.os.name}${session.os.version ? ` ${session.os.version}` : ''}`;
  }
  return 'Unknown OS';
}

/**
 * Get location display name
 */
function getLocationDisplay(session: SessionDto): string | null {
  if (session.location) {
    const parts = [];
    if (session.location.city) parts.push(session.location.city);
    if (session.location.country) parts.push(session.location.country);
    return parts.length > 0 ? parts.join(', ') : null;
  }
  return null;
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const browserDisplay = getBrowserDisplay(session);
  const osDisplay = getOSDisplay(session);
  const locationDisplay = getLocationDisplay(session);
  const maskedIp = maskIpAddress(session.ipAddress);

  return (
    <Card tone="glass" padding="lg">
      <div className="flex items-start gap-4">
        {/* Device Icon */}
        <div className="flex-shrink-0 mt-1" aria-hidden="true">
          {getDeviceIcon(session)}
        </div>

        {/* Session Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-white">
                  {browserDisplay}
                </h3>
                {session.isCurrent && (
                  <Badge tone="success">Current Session</Badge>
                )}
              </div>
              <p className="text-sm text-slate-400">{osDisplay}</p>
            </div>

            {/* Revoke Button */}
            {!session.isCurrent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRevoke(session.id)}
                disabled={isRevoking}
                loading={isRevoking}
                aria-label={`Revoke session from ${browserDisplay}`}
              >
                Revoke
              </Button>
            )}
          </div>

          {/* Additional Details */}
          <div className="space-y-1 text-sm text-slate-400">
            {locationDisplay && (
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>{locationDisplay}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
                />
              </svg>
              <span>IP: {maskedIp}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span
                title={formatLongDateTime(session.lastActiveAt)}
              >
                Last active {formatRelativeTime(session.lastActiveAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
