import React, { useState, useEffect } from 'react';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
}

interface DownloadProgress {
  percent: number;
  transferred: number;
  total: number;
}

export const UpdateStatus: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdateAvailable = (_event: any, info: UpdateInfo) => {
      setUpdateAvailable(true);
      setUpdateInfo(info);
    };

    const handleUpdateProgress = (_event: any, progress: DownloadProgress) => {
      setDownloadProgress(progress);
    };

    const handleUpdateDownloaded = (_event: any, info: UpdateInfo) => {
      setDownloading(false);
      setUpdateReady(true);
      setUpdateInfo(info);
    };

    const handleUpdateError = (_event: any, errorMessage: string) => {
      setError(errorMessage);
      setDownloading(false);
    };

    window.electron?.ipcRenderer.on('update:available', handleUpdateAvailable);
    window.electron?.ipcRenderer.on('update:progress', handleUpdateProgress);
    window.electron?.ipcRenderer.on('update:downloaded', handleUpdateDownloaded);
    window.electron?.ipcRenderer.on('update:error', handleUpdateError);

    return () => {
      window.electron?.ipcRenderer.removeAllListeners('update:available');
      window.electron?.ipcRenderer.removeAllListeners('update:progress');
      window.electron?.ipcRenderer.removeAllListeners('update:downloaded');
      window.electron?.ipcRenderer.removeAllListeners('update:error');
    };
  }, []);

  const handleCheckForUpdates = async () => {
    try {
      setError(null);
      const result = await window.dentalos.update.check();
      if (!result || !result.version) {
        setError('No updates available');
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDownloadUpdate = async () => {
    try {
      setError(null);
      setDownloading(true);
      await window.dentalos.update.download();
    } catch (err) {
      setError(String(err));
      setDownloading(false);
    }
  };

  const handleInstallUpdate = async () => {
    try {
      await window.dentalos.update.install();
    } catch (err) {
      setError(String(err));
    }
  };

  if (!updateAvailable && !updateReady && !error) {
    return (
      <div className="update-status-idle">
        <button onClick={handleCheckForUpdates} className="check-update-button">
          Check for Updates
        </button>
      </div>
    );
  }

  return (
    <div className="update-status-container">
      <h2>Software Update</h2>

      {error && (
        <div className="update-error">
          <p className="error-message">{error}</p>
        </div>
      )}

      {updateAvailable && !updateReady && (
        <div className="update-available">
          <h3>Update Available: v{updateInfo?.version}</h3>
          {updateInfo?.releaseNotes && (
            <div className="release-notes">
              <h4>What's New:</h4>
              <p>{updateInfo.releaseNotes}</p>
            </div>
          )}

          {!downloading ? (
            <button onClick={handleDownloadUpdate} className="download-button">
              Download Update
            </button>
          ) : (
            <div className="download-progress">
              <p>Downloading update...</p>
              {downloadProgress && (
                <div className="progress-details">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${downloadProgress.percent}%` }}
                    />
                  </div>
                  <p className="progress-text">
                    {downloadProgress.percent.toFixed(1)}% - {(downloadProgress.transferred / 1024 / 1024).toFixed(2)} MB of {(downloadProgress.total / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {updateReady && (
        <div className="update-ready">
          <h3>Update Ready: v{updateInfo?.version}</h3>
          <p>The update has been downloaded and is ready to install.</p>
          <p className="warning">The application will restart after installation.</p>
          <button onClick={handleInstallUpdate} className="install-button">
            Restart and Install
          </button>
        </div>
      )}
    </div>
  );
};
