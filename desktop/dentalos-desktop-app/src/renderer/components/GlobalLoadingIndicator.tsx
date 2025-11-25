import React from 'react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export interface GlobalLoadingIndicatorProps {
  syncStatus?: {
    isRunning: boolean;
    pendingChanges: number;
    uploaded: number;
    downloaded: number;
  };
}

/**
 * Global loading and sync status indicator shown in the app header.
 * Displays:
 * - Sync status (syncing, idle, error)
 * - Pending changes count
 * - Network connectivity
 * - Real-time connection status
 *
 * @example
 * <GlobalLoadingIndicator syncStatus={syncManager.getStatus()} />
 */
export const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  syncStatus,
}) => {
  const { isConnected } = useRealtimeSync({
    resourceType: 'global',
    resourceId: 'status',
    autoSubscribe: false,
  });

  const isSyncing = syncStatus?.isRunning;
  const pendingCount = syncStatus?.pendingChanges || 0;

  // Determine status icon and color
  const getStatusIndicator = () => {
    if (!navigator.onLine) {
      return {
        icon: '🔴',
        text: 'Offline',
        color: 'text-red-600',
        bg: 'bg-red-100',
      };
    }

    if (isSyncing) {
      return {
        icon: '🔄',
        text: 'Syncing...',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        animate: true,
      };
    }

    if (pendingCount > 0) {
      return {
        icon: '⏳',
        text: `${pendingCount} pending`,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
      };
    }

    if (isConnected) {
      return {
        icon: '✓',
        text: 'Synced',
        color: 'text-green-600',
        bg: 'bg-green-100',
      };
    }

    return {
      icon: '⚠',
      text: 'Disconnected',
      color: 'text-gray-600',
      bg: 'bg-gray-100',
    };
  };

  const status = getStatusIndicator();

  return (
    <div
      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${status.bg} ${status.color} text-sm font-medium transition-all duration-200`}
      title={`Status: ${status.text}`}
    >
      <span className={status.animate ? 'animate-spin' : ''}>{status.icon}</span>
      <span>{status.text}</span>
      {syncStatus && (syncStatus.uploaded > 0 || syncStatus.downloaded > 0) && (
        <span className="text-xs opacity-75">
          ↑{syncStatus.uploaded} ↓{syncStatus.downloaded}
        </span>
      )}
    </div>
  );
};

/**
 * Compact sync indicator for use in the system tray or status bar.
 */
export const CompactSyncIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  syncStatus,
}) => {
  const isSyncing = syncStatus?.isRunning;
  const pendingCount = syncStatus?.pendingChanges || 0;

  if (!navigator.onLine) {
    return <span title="Offline">🔴</span>;
  }

  if (isSyncing) {
    return <span className="animate-spin" title="Syncing">🔄</span>;
  }

  if (pendingCount > 0) {
    return <span title={`${pendingCount} pending changes`}>⏳ {pendingCount}</span>;
  }

  return <span title="Synced">✓</span>;
};

/**
 * Full-screen loading overlay for long-running operations.
 */
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  progress?: number;
}> = ({ isVisible, message = 'Loading...', progress }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>

          {/* Message */}
          <p className="text-gray-700 font-medium text-center">{message}</p>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}

          {/* Progress percentage */}
          {progress !== undefined && (
            <p className="text-sm text-gray-500">{Math.round(progress)}%</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Inline loading skeleton for content placeholders.
 */
export const LoadingSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-gray-200 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
};

/**
 * Spinner component for inline loading states.
 */
export const Spinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block border-blue-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};
