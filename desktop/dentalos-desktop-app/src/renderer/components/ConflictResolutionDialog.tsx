import React, { useState } from 'react';
import { CRDTConflict } from '../../realtime/crdt-merge';

export interface ConflictResolutionDialogProps {
  conflicts: CRDTConflict[];
  resourceType: string;
  resourceId: string;
  onResolve: (resolutions: Record<string, 'local' | 'remote'>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

/**
 * Dialog for manually resolving CRDT conflicts.
 *
 * @example
 * const [conflicts, setConflicts] = useState<CRDTConflict[]>([]);
 * const [showDialog, setShowDialog] = useState(false);
 *
 * const { applyRemotePatch } = useRealtimeSync({
 *   resourceType: 'patient',
 *   resourceId,
 *   onConflict: (result) => {
 *     if (result.needsManualResolution) {
 *       setConflicts(result.conflicts);
 *       setShowDialog(true);
 *     }
 *   },
 * });
 *
 * return (
 *   <ConflictResolutionDialog
 *     conflicts={conflicts}
 *     resourceType="patient"
 *     resourceId={patientId}
 *     isOpen={showDialog}
 *     onResolve={(resolutions) => {
 *       applyResolutions(resolutions);
 *       setShowDialog(false);
 *     }}
 *     onCancel={() => setShowDialog(false)}
 *   />
 * );
 */
export const ConflictResolutionDialog: React.FC<ConflictResolutionDialogProps> = ({
  conflicts,
  resourceType,
  resourceId,
  onResolve,
  onCancel,
  isOpen,
}) => {
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'remote'>>(() => {
    const initial: Record<string, 'local' | 'remote'> = {};
    conflicts.forEach((conflict) => {
      // Default to remote (newer) value
      initial[conflict.field] = 'remote';
    });
    return initial;
  });

  const handleResolutionChange = (field: string, choice: 'local' | 'remote') => {
    setResolutions((prev) => ({
      ...prev,
      [field]: choice,
    }));
  };

  const handleResolve = () => {
    onResolve(resolutions);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '(empty)';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const formatTimestamp = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Resolve Conflicts</h2>
          <p className="text-sm text-gray-600 mt-1">
            {resourceType} #{resourceId} has {conflicts.length} conflict
            {conflicts.length > 1 ? 's' : ''} that require your attention.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {conflicts.map((conflict, index) => (
            <div key={conflict.field} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  Field: <span className="text-blue-600">{conflict.field}</span>
                </h3>
                <span className="text-xs text-gray-500">Conflict {index + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    resolutions[conflict.field] === 'local'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleResolutionChange(conflict.field, 'local')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Your Version</span>
                    <input
                      type="radio"
                      checked={resolutions[conflict.field] === 'local'}
                      onChange={() => handleResolutionChange(conflict.field, 'local')}
                      className="form-radio text-blue-600"
                    />
                  </div>
                  <div className="bg-gray-100 rounded p-3 mb-2 overflow-auto max-h-32">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formatValue(conflict.localValue)}
                    </pre>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Version: {conflict.localVersion}</div>
                    <div>Modified: {formatTimestamp(conflict.localTimestamp)}</div>
                  </div>
                </div>

                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    resolutions[conflict.field] === 'remote'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onClick={() => handleResolutionChange(conflict.field, 'remote')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-700">Server Version</span>
                    <input
                      type="radio"
                      checked={resolutions[conflict.field] === 'remote'}
                      onChange={() => handleResolutionChange(conflict.field, 'remote')}
                      className="form-radio text-green-600"
                    />
                  </div>
                  <div className="bg-gray-100 rounded p-3 mb-2 overflow-auto max-h-32">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                      {formatValue(conflict.remoteValue)}
                    </pre>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Version: {conflict.remoteVersion}</div>
                    <div>Modified: {formatTimestamp(conflict.remoteTimestamp)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Resolve Conflicts
          </button>
        </div>
      </div>
    </div>
  );
};
