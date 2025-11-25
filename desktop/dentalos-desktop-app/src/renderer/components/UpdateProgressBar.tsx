import React from 'react';

export interface UpdateProgressBarProps {
  progress: number;
  stage: 'idle' | 'checking' | 'downloading' | 'applying' | 'completed' | 'failed';
  message: string;
  error?: string;
}

/**
 * Progress bar component for displaying update download and installation progress.
 * Shows different states with appropriate visual feedback.
 */
export const UpdateProgressBar: React.FC<UpdateProgressBarProps> = ({
  progress,
  stage,
  message,
  error,
}) => {
  const getStageColor = () => {
    switch (stage) {
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'checking':
        return 'bg-blue-400';
      case 'downloading':
      case 'applying':
        return 'bg-blue-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'checking':
        return '🔍';
      case 'downloading':
        return '⬇️';
      case 'applying':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getStageLabel = () => {
    switch (stage) {
      case 'checking':
        return 'Checking for updates';
      case 'downloading':
        return 'Downloading';
      case 'applying':
        return 'Installing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="w-full">
      {/* Stage indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getStageIcon()}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStageLabel()}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStageColor()} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${progress}%` }}
        >
          {stage === 'downloading' && (
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          )}
        </div>
      </div>

      {/* Message */}
      <div className="mt-2">
        <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-200">Error</p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Completed message */}
      {stage === 'completed' && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              Update installed successfully! Restart the application to apply changes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Add shimmer animation to styles
const shimmerStyles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('update-progress-styles')) {
  const style = document.createElement('style');
  style.id = 'update-progress-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}
