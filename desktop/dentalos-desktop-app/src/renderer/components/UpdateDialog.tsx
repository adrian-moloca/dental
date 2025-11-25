import React from 'react';

export interface UpdatePackageInfo {
  version: string;
  releaseDate: Date;
  channel: string;
  platform: string;
  arch: string;
  fileSize: number;
  downloadUrl: string;
  sha256: string;
  signature: string;
  changelog: {
    features: string[];
    fixes: string[];
    breaking: string[];
  };
  isMandatory: boolean;
}

export interface DifferentialPatchInfo {
  fromVersion: string;
  toVersion: string;
  patchFileSize: number;
}

export interface UpdateDialogProps {
  isOpen: boolean;
  currentVersion: string;
  latestVersion: string;
  isMandatory: boolean;
  updatePackage: UpdatePackageInfo;
  differentialPatch?: DifferentialPatchInfo;
  onDownload: () => void;
  onCancel: () => void;
  onClose: () => void;
}

/**
 * Dialog component for displaying update information and prompting user action.
 * Shows changelog, download size, and mandatory vs optional update status.
 */
export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  isOpen,
  currentVersion,
  latestVersion,
  isMandatory,
  updatePackage,
  differentialPatch,
  onDownload,
  onCancel,
  onClose,
}) => {
  if (!isOpen) return null;

  const downloadSize = differentialPatch
    ? differentialPatch.patchFileSize
    : updatePackage.fileSize;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b dark:border-gray-700 ${isMandatory ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMandatory ? 'bg-orange-500' : 'bg-blue-500'}`}>
                <span className="text-white text-xl">🔄</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isMandatory ? 'Required Update Available' : 'Update Available'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Version {latestVersion} is now available (current: {currentVersion})
                </p>
              </div>
            </div>
            {!isMandatory && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Download Info */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Download Size</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatBytes(downloadSize)}
                </p>
              </div>
              {differentialPatch && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Differential update
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Changelog */}
          <div className="space-y-4">
            {updatePackage.changelog.features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-green-500">✨</span> New Features
                </h3>
                <ul className="space-y-1">
                  {updatePackage.changelog.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {updatePackage.changelog.fixes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-500">🐛</span> Bug Fixes
                </h3>
                <ul className="space-y-1">
                  {updatePackage.changelog.fixes.map((fix, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                      • {fix}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {updatePackage.changelog.breaking.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span className="text-red-500">⚠️</span> Breaking Changes
                </h3>
                <ul className="space-y-1">
                  {updatePackage.changelog.breaking.map((change, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-300 pl-6">
                      • {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {isMandatory && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
                    This is a mandatory update
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    The application requires this update to continue functioning properly. You must install it to proceed.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-end gap-3">
          {!isMandatory && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Remind me later
            </button>
          )}
          <button
            onClick={onDownload}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              isMandatory
                ? 'bg-orange-600 hover:bg-orange-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Download and Install
          </button>
        </div>
      </div>
    </div>
  );
};
