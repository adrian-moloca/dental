import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import { initializeDatabase } from '../localdb/indexeddb';
import { SyncManager } from '../sync/sync-manager';
import { DeviceAuth } from '../auth/device-auth';
import { BackgroundScheduler } from '../background/scheduler';
import { NetworkMonitor } from '../background/network-monitor';
import { getTelemetryClient } from '../telemetry/telemetry-client';
import { getUpdateManager, UpdateStatus } from '../update/update-manager';

let mainWindow: BrowserWindow | null = null;
let syncManager: SyncManager | null = null;
let scheduler: BackgroundScheduler | null = null;
let networkMonitor: NetworkMonitor | null = null;

const AUTO_UPDATE_ENABLED = process.env.AUTO_UPDATE_ENABLED === 'true' || false;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    },
    title: 'DentalOS Desktop',
    show: false
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.dentalos.com"
        ]
      }
    });
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupAutoUpdater() {
  if (!AUTO_UPDATE_ENABLED) {
    console.log('Auto-update disabled');
    return;
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info: any) => {
    console.log('Update available:', info.version);
    mainWindow?.webContents.send('update:available', info);

    const telemetry = getTelemetryClient();
    telemetry?.trackUpdateAvailable(info.version, info.releaseNotes as string);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No updates available');
  });

  autoUpdater.on('download-progress', (progress: any) => {
    mainWindow?.webContents.send('update:progress', progress);
  });

  autoUpdater.on('update-downloaded', (info: any) => {
    console.log('Update downloaded:', info.version);
    mainWindow?.webContents.send('update:downloaded', info);

    const telemetry = getTelemetryClient();
    telemetry?.trackUpdateDownloaded(info.version);
  });

  autoUpdater.on('error', (error: any) => {
    console.error('Auto-updater error:', error);
    mainWindow?.webContents.send('update:error', error.message);
  });

  // Check for updates on startup (delayed by 10 seconds)
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 10000);

  // Check for updates every 6 hours
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 6 * 60 * 60 * 1000);
}

async function initializeServices() {
  try {
    await initializeDatabase();

    const deviceAuth = new DeviceAuth();
    await deviceAuth.initialize();

    syncManager = new SyncManager();
    await syncManager.initialize();

    networkMonitor = new NetworkMonitor();
    networkMonitor.on('online', () => {
      syncManager?.resume();
      const telemetry = getTelemetryClient();
      telemetry?.trackNetworkOnline();
    });
    networkMonitor.on('offline', () => {
      syncManager?.pause();
      const telemetry = getTelemetryClient();
      telemetry?.trackNetworkOffline();
    });

    scheduler = new BackgroundScheduler(syncManager);
    scheduler.start();

    // Initialize custom update manager
    const updateManager = getUpdateManager();
    await updateManager.initialize();

    // Listen to update status changes
    updateManager.onUpdate((status: UpdateStatus) => {
      mainWindow?.webContents.send('update:status', status);
    });

    // Check for updates on startup (delayed by 10 seconds)
    setTimeout(() => {
      updateManager.checkForUpdates().catch(console.error);
    }, 10000);

    // Check for updates every 6 hours
    setInterval(() => {
      updateManager.checkForUpdates().catch(console.error);
    }, 6 * 60 * 60 * 1000);

    setupAutoUpdater();
  } catch (error) {
    console.error('Failed to initialize services:', error);
    const telemetry = getTelemetryClient();
    telemetry?.trackError('service_init_failed', String(error), undefined, 'main');
  }
}

app.on('ready', async () => {
  await createWindow();
  await initializeServices();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  scheduler?.stop();
  await syncManager?.shutdown();
  const telemetry = getTelemetryClient();
  await telemetry?.shutdown();
});

ipcMain.handle('sync:trigger', async () => {
  if (!syncManager) {
    throw new Error('Sync manager not initialized');
  }
  return syncManager.triggerSync();
});

ipcMain.handle('sync:getStatus', async () => {
  if (!syncManager) {
    throw new Error('Sync manager not initialized');
  }
  return syncManager.getStatus();
});

ipcMain.handle('device:getInfo', async () => {
  const deviceAuth = new DeviceAuth();
  return deviceAuth.getDeviceInfo();
});

ipcMain.handle('device:isRegistered', async () => {
  const deviceAuth = new DeviceAuth();
  return deviceAuth.isRegistered();
});

ipcMain.handle('device:register', async (_event, credentials) => {
  const deviceAuth = new DeviceAuth();
  return deviceAuth.register(credentials);
});

ipcMain.handle('device:clear', async () => {
  const deviceAuth = new DeviceAuth();
  await deviceAuth.clearDevice();
  return { success: true };
});

ipcMain.handle('theme:toggle', async (_event, theme: 'light' | 'dark') => {
  mainWindow?.webContents.send('theme:changed', theme);
  return { success: true };
});

ipcMain.handle('update:check', async () => {
  if (!AUTO_UPDATE_ENABLED) {
    return { available: false, message: 'Auto-update is disabled' };
  }
  const result = await autoUpdater.checkForUpdates();
  return result?.updateInfo;
});

ipcMain.handle('update:download', async () => {
  if (!AUTO_UPDATE_ENABLED) {
    throw new Error('Auto-update is disabled');
  }
  await autoUpdater.downloadUpdate();
  return { success: true };
});

ipcMain.handle('update:install', async () => {
  if (!AUTO_UPDATE_ENABLED) {
    throw new Error('Auto-update is disabled');
  }
  const telemetry = getTelemetryClient();
  await telemetry?.flush();
  autoUpdater.quitAndInstall(false, true);
});

// Custom update manager IPC handlers
ipcMain.handle('update:checkCustom', async (_event, channel: 'stable' | 'beta' | 'alpha') => {
  const updateManager = getUpdateManager();
  return updateManager.checkForUpdates(channel || 'stable');
});

ipcMain.handle('update:downloadAndApply', async (_event, updateInfo) => {
  const updateManager = getUpdateManager();
  await updateManager.downloadAndApplyUpdate(updateInfo);
  return { success: true };
});

ipcMain.handle('update:getStatus', async () => {
  const updateManager = getUpdateManager();
  return updateManager.getStatus();
});

ipcMain.handle('update:rollback', async () => {
  const updateManager = getUpdateManager();
  await updateManager.rollback();
  return { success: true };
});
