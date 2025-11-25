import React from 'react';

export interface UpdateAvailableBannerProps {
  version: string;
  isMandatory: boolean;
  onLearnMore: () => void;
  onDismiss?: () => void;
}

/**
 * Banner component that appears at the top of the application to notify users of available updates.
 * Can be dismissed for optional updates, always visible for mandatory updates.
 */
export const UpdateAvailableBanner: React.FC<UpdateAvailableBannerProps> = ({
  version,
  isMandatory,
  onLearnMore,
  onDismiss,
}) => {
  return (
    <div className={`w-full ${isMandatory ? 'bg-orange-500' : 'bg-blue-500'} text-white shadow-md`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isMandatory ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isMandatory
                  ? `Required update to version ${version} is available`
                  : `Version ${version} is now available`}
              </p>
              {isMandatory && (
                <p className="text-xs opacity-90">This update is required to continue using the application</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLearnMore}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
            >
              Learn more
            </button>
            {!isMandatory && onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
