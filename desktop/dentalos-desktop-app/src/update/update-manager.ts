import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import axios from 'axios';
import { getDeviceId } from '../device/device-manager';
import { emitTelemetryEvent } from '../telemetry/telemetry-manager';

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestVersion?: string;
  isMandatory?: boolean;
  package?: UpdatePackageInfo;
  differentialPatch?: DifferentialPatchInfo;
  message?: string;
}

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
  platform: string;
  arch: string;
  patchFileSize: number;
  downloadUrl: string;
  sha256: string;
  signature: string;
  algorithm: string;
}

export interface UpdateStatus {
  stage: 'idle' | 'checking' | 'downloading' | 'applying' | 'completed' | 'failed';
  progress: number;
  message: string;
  error?: string;
}

export type UpdateEventCallback = (status: UpdateStatus) => void;

/**
 * Desktop update manager for checking, downloading, and applying application updates.
 * Supports differential patches for efficient updates and full package downloads as fallback.
 * Includes signature verification and rollback capabilities.
 */
export class UpdateManager {
  private readonly updateServiceUrl: string;
  private readonly updateDir: string;
  private readonly backupDir: string;
  private eventCallbacks: UpdateEventCallback[] = [];
  private currentStatus: UpdateStatus;

  constructor(updateServiceUrl: string = process.env.UPDATE_SERVICE_URL || 'http://localhost:3021/api/v1') {
    this.updateServiceUrl = updateServiceUrl;
    this.updateDir = path.join(app.getPath('userData'), 'updates');
    this.backupDir = path.join(app.getPath('userData'), 'backups');
    this.currentStatus = {
      stage: 'idle',
      progress: 0,
      message: 'Ready to check for updates',
    };
  }

  /**
   * Initialize update manager and create necessary directories.
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.updateDir, { recursive: true });
    await fs.mkdir(this.backupDir, { recursive: true });
  }

  /**
   * Registers a callback to receive update status events.
   */
  onUpdate(callback: UpdateEventCallback): void {
    this.eventCallbacks.push(callback);
  }

  /**
   * Emits an update status event to all registered callbacks.
   */
  private emitStatus(status: Partial<UpdateStatus>): void {
    this.currentStatus = { ...this.currentStatus, ...status };
    this.eventCallbacks.forEach((cb) => cb(this.currentStatus));
  }

  /**
   * Gets the current update status.
   */
  getStatus(): UpdateStatus {
    return this.currentStatus;
  }

  /**
   * Checks if an update is available for the current device.
   */
  async checkForUpdates(channel: 'stable' | 'beta' | 'alpha' = 'stable'): Promise<UpdateCheckResult> {
    this.emitStatus({ stage: 'checking', progress: 0, message: 'Checking for updates...' });

    await getDeviceId(); // Initialize device ID
    const currentVersion = app.getVersion();
    const platform = this.getPlatform();
    const arch = this.getArch();

    // Emit telemetry event
    await emitTelemetryEvent('update_check', {
      currentVersion,
      platform,
      arch,
      channel,
    });

    try {
      const response = await axios.get(`${this.updateServiceUrl}/updates/latest`, {
        params: {
          platform,
          arch,
          currentVersion,
          channel,
        },
        timeout: 10000,
      });

      const result: UpdateCheckResult = response.data;

      if (result.updateAvailable) {
        this.emitStatus({
          stage: 'idle',
          progress: 0,
          message: `Update available: ${result.latestVersion}`,
        });

        // Emit telemetry for update found
        await emitTelemetryEvent('update_found', {
          currentVersion,
          latestVersion: result.latestVersion,
          isMandatory: result.isMandatory,
          hasDifferentialPatch: !!result.differentialPatch,
        });
      } else {
        this.emitStatus({
          stage: 'idle',
          progress: 0,
          message: 'No updates available',
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emitStatus({
        stage: 'failed',
        progress: 0,
        message: 'Failed to check for updates',
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Downloads and applies an update.
   * Prefers differential patch if available, falls back to full download.
   */
  async downloadAndApplyUpdate(updateInfo: UpdateCheckResult): Promise<void> {
    if (!updateInfo.updateAvailable || !updateInfo.package) {
      throw new Error('No update available to download');
    }

    const startTime = Date.now();

    try {
      // Register installation start event
      await this.registerInstallationEvent('download_started', updateInfo);

      // Download update (differential or full)
      let downloadPath: string;
      let sha256: string;
      let signature: string;

      if (updateInfo.differentialPatch) {
        downloadPath = await this.downloadDifferentialPatch(updateInfo.differentialPatch);
        sha256 = updateInfo.differentialPatch.sha256;
        signature = updateInfo.differentialPatch.signature;
      } else {
        downloadPath = await this.downloadFullPackage(updateInfo.package);
        sha256 = updateInfo.package.sha256;
        signature = updateInfo.package.signature;
      }

      await this.registerInstallationEvent('download_completed', updateInfo);

      // Verify integrity
      this.emitStatus({
        stage: 'applying',
        progress: 80,
        message: 'Verifying download integrity...',
      });

      await this.verifyIntegrity(downloadPath, sha256);
      await this.verifySignature(downloadPath, signature);

      // Create backup before applying
      await this.createBackup();

      // Apply update
      await this.registerInstallationEvent('apply_started', updateInfo);
      await this.applyUpdate(downloadPath, updateInfo);

      const durationMs = Date.now() - startTime;

      await this.registerInstallationEvent('apply_completed', updateInfo, { durationMs });

      this.emitStatus({
        stage: 'completed',
        progress: 100,
        message: 'Update completed successfully. Restart required.',
      });

      // Emit telemetry
      await emitTelemetryEvent('update_apply_success', {
        fromVersion: updateInfo.currentVersion,
        toVersion: updateInfo.latestVersion,
        durationMs,
        patchUsed: !!updateInfo.differentialPatch,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const durationMs = Date.now() - startTime;

      await this.registerInstallationEvent('apply_failed', updateInfo, {
        errorMessage,
        durationMs,
      });

      this.emitStatus({
        stage: 'failed',
        progress: 0,
        message: 'Update failed',
        error: errorMessage,
      });

      // Emit telemetry
      await emitTelemetryEvent('update_apply_failure', {
        fromVersion: updateInfo.currentVersion,
        toVersion: updateInfo.latestVersion,
        error: errorMessage,
        durationMs,
      });

      throw error;
    }
  }

  /**
   * Downloads a differential patch.
   */
  private async downloadDifferentialPatch(patch: DifferentialPatchInfo): Promise<string> {
    this.emitStatus({
      stage: 'downloading',
      progress: 10,
      message: `Downloading differential patch (${this.formatBytes(patch.patchFileSize)})...`,
    });

    const downloadPath = path.join(this.updateDir, `patch-${patch.fromVersion}-${patch.toVersion}.patch`);

    const response = await axios.get(patch.downloadUrl, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        this.emitStatus({
          stage: 'downloading',
          progress: 10 + (percentCompleted * 0.6),
          message: `Downloading patch: ${percentCompleted}%`,
        });
      },
    });

    const writer = require('fs').createWriteStream(downloadPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return downloadPath;
  }

  /**
   * Downloads a full update package.
   */
  private async downloadFullPackage(pkg: UpdatePackageInfo): Promise<string> {
    this.emitStatus({
      stage: 'downloading',
      progress: 10,
      message: `Downloading full update (${this.formatBytes(pkg.fileSize)})...`,
    });

    const downloadPath = path.join(this.updateDir, `update-${pkg.version}.${this.getFileExtension()}`);

    const response = await axios.get(pkg.downloadUrl, {
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        this.emitStatus({
          stage: 'downloading',
          progress: 10 + (percentCompleted * 0.6),
          message: `Downloading: ${percentCompleted}%`,
        });
      },
    });

    const writer = require('fs').createWriteStream(downloadPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return downloadPath;
  }

  /**
   * Verifies SHA256 integrity of downloaded file.
   */
  private async verifyIntegrity(filePath: string, expectedSha256: string): Promise<void> {
    const fileBuffer = await fs.readFile(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (hash !== expectedSha256) {
      throw new Error(`Integrity check failed: expected ${expectedSha256}, got ${hash}`);
    }
  }

  /**
   * Verifies digital signature of downloaded file.
   * Uses public key from environment to verify signature.
   */
  private async verifySignature(filePath: string, signature: string): Promise<void> {
    const publicKey = process.env.UPDATE_SIGNATURE_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('UPDATE_SIGNATURE_PUBLIC_KEY not configured');
    }

    const fileBuffer = await fs.readFile(filePath);
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(fileBuffer);
    verify.end();

    const isValid = verify.verify(publicKey, signature, 'base64');

    if (!isValid) {
      throw new Error('Signature verification failed');
    }
  }

  /**
   * Creates a backup of the current application.
   */
  private async createBackup(): Promise<void> {
    this.emitStatus({
      stage: 'applying',
      progress: 85,
      message: 'Creating backup...',
    });

    const appPath = app.getAppPath();
    const backupPath = path.join(this.backupDir, `backup-${app.getVersion()}`);

    await fs.mkdir(backupPath, { recursive: true });

    // Copy app.asar or app directory
    const asar = path.join(appPath, 'app.asar');
    if (await this.fileExists(asar)) {
      await fs.copyFile(asar, path.join(backupPath, 'app.asar'));
    } else {
      // Copy entire app directory if not using asar
      await this.copyDirectory(appPath, backupPath);
    }
  }

  /**
   * Applies the update to the application.
   */
  private async applyUpdate(updatePath: string, updateInfo: UpdateCheckResult): Promise<void> {
    this.emitStatus({
      stage: 'applying',
      progress: 90,
      message: 'Applying update...',
    });

    const appPath = app.getAppPath();

    // Extract or copy update based on file type
    if (updateInfo.differentialPatch) {
      // Apply differential patch
      await this.applyDifferentialPatch(updatePath, appPath);
    } else {
      // Extract full package
      await this.extractFullPackage(updatePath, appPath);
    }
  }

  /**
   * Applies a differential patch to the application.
   */
  private async applyDifferentialPatch(_patchPath: string, _targetPath: string): Promise<void> {
    // For a production implementation, use a binary diff library like bsdiff
    // This is a placeholder for the actual implementation
    throw new Error('Differential patch application not yet implemented');
  }

  /**
   * Extracts a full update package.
   */
  private async extractFullPackage(_packagePath: string, _targetPath: string): Promise<void> {
    // For a production implementation, use an extraction library
    // This is a placeholder for the actual implementation
    throw new Error('Full package extraction not yet implemented');
  }

  /**
   * Rolls back to the previous version from backup.
   */
  async rollback(): Promise<void> {
    const currentVersion = app.getVersion();
    const backupPath = path.join(this.backupDir, `backup-${currentVersion}`);

    if (!(await this.fileExists(backupPath))) {
      throw new Error('No backup available for rollback');
    }

    this.emitStatus({
      stage: 'applying',
      progress: 50,
      message: 'Rolling back to previous version...',
    });

    const appPath = app.getAppPath();
    const asar = path.join(appPath, 'app.asar');
    const backupAsar = path.join(backupPath, 'app.asar');

    if (await this.fileExists(backupAsar)) {
      await fs.copyFile(backupAsar, asar);
    } else {
      await this.copyDirectory(backupPath, appPath);
    }

    // Register rollback event
    await axios.post(`${this.updateServiceUrl}/updates/register-installation`, {
      deviceId: await getDeviceId(),
      fromVersion: currentVersion,
      toVersion: currentVersion,
      platform: this.getPlatform(),
      arch: this.getArch(),
      eventType: 'rollback',
      timestamp: new Date(),
    });

    this.emitStatus({
      stage: 'completed',
      progress: 100,
      message: 'Rollback completed. Restart required.',
    });
  }

  /**
   * Registers an installation event with the update service.
   */
  private async registerInstallationEvent(
    eventType: string,
    updateInfo: UpdateCheckResult,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await axios.post(`${this.updateServiceUrl}/updates/register-installation`, {
        deviceId: await getDeviceId(),
        fromVersion: updateInfo.currentVersion,
        toVersion: updateInfo.latestVersion,
        platform: this.getPlatform(),
        arch: this.getArch(),
        eventType,
        timestamp: new Date(),
        metadata,
      });
    } catch (error) {
      // Don't fail the update if telemetry fails
      console.error('Failed to register installation event:', error);
    }
  }

  /**
   * Helper methods
   */

  private getPlatform(): 'windows' | 'macos' | 'linux' {
    const platform = process.platform;
    if (platform === 'win32') return 'windows';
    if (platform === 'darwin') return 'macos';
    return 'linux';
  }

  private getArch(): 'x64' | 'arm64' {
    return process.arch === 'arm64' ? 'arm64' : 'x64';
  }

  private getFileExtension(): string {
    const platform = this.getPlatform();
    if (platform === 'windows') return 'exe';
    if (platform === 'macos') return 'dmg';
    return 'AppImage';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
}

// Singleton instance
let updateManager: UpdateManager | null = null;

/**
 * Gets the global UpdateManager instance.
 */
export function getUpdateManager(): UpdateManager {
  if (!updateManager) {
    updateManager = new UpdateManager();
  }
  return updateManager;
}
