import React from 'react';
import { useSyncStatus } from '../hooks/useSyncStatus';

export const SyncStatus: React.FC = () => {
  const { status, triggerSync, loading } = useSyncStatus();

  return (
    <div className="panel">
      <h2>Sync Status</h2>

      <div className="status-cards">
        <div className="status-card">
          <h3>Current Sequence</h3>
          <p className="stat-value">{status.lastSequence}</p>
        </div>

        <div className="status-card">
          <h3>Pending Changes</h3>
          <p className="stat-value">{status.pendingChanges}</p>
        </div>

        <div className="status-card">
          <h3>Last Sync</h3>
          <p className="stat-value">
            {status.lastSyncAt
              ? new Date(status.lastSyncAt).toLocaleString()
              : 'Never'}
          </p>
        </div>

        <div className="status-card">
          <h3>Status</h3>
          <p className="stat-value">
            {status.isRunning ? '🔄 Syncing...' : '✅ Idle'}
          </p>
        </div>
      </div>

      <div className="sync-metrics">
        <h3>Last Sync Results</h3>
        <div className="metrics-grid">
          <div className="metric">
            <span className="label">Uploaded:</span>
            <span className="value">{status.uploaded}</span>
          </div>
          <div className="metric">
            <span className="label">Downloaded:</span>
            <span className="value">{status.downloaded}</span>
          </div>
          <div className="metric">
            <span className="label">Conflicts:</span>
            <span className="value">{status.conflicts}</span>
          </div>
        </div>
      </div>

      {status.errors.length > 0 && (
        <div className="error-list">
          <h3>Errors</h3>
          {status.errors.map((error, index) => (
            <div key={index} className="error-item">
              {error}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={triggerSync}
        disabled={loading || status.isRunning}
        className="sync-button"
      >
        {loading ? 'Triggering...' : 'Trigger Sync Now'}
      </button>
    </div>
  );
};
