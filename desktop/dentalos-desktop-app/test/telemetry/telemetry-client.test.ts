import { TelemetryClient, initTelemetryClient, getTelemetryClient } from '../../src/telemetry/telemetry-client';
import { TelemetryEventType } from '../../src/telemetry/usage-events';
import axios from 'axios';

jest.mock('axios');

describe('TelemetryClient', () => {
  const mockConfig = {
    aiEngineUrl: 'http://localhost:3020',
    deviceId: 'device-123',
    tenantId: 'tenant-456',
    organizationId: 'org-789',
    clinicId: 'clinic-001',
    enabled: true,
    flushIntervalMs: 5000,
    maxBatchSize: 50
  };

  let telemetryClient: TelemetryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    telemetryClient = new TelemetryClient(mockConfig);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('trackEvent', () => {
    it('should add event to queue when enabled', () => {
      telemetryClient.trackEvent(TelemetryEventType.SESSION_STARTED);

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should not track events when disabled', () => {
      const disabledClient = new TelemetryClient({ ...mockConfig, enabled: false });

      disabledClient.trackEvent(TelemetryEventType.SESSION_STARTED);

      expect(disabledClient.getQueueSize()).toBe(0);
    });

    it('should include device context in events', () => {
      telemetryClient.trackDeviceRegistered({
        platform: 'LINUX',
        osVersion: '6.8.0',
        appVersion: '1.0.0',
        deviceName: 'dev-machine'
      });

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should auto-flush when queue reaches max batch size', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      for (let i = 0; i < 50; i++) {
        telemetryClient.trackEvent(TelemetryEventType.USER_ACTION, { action: `action-${i}` });
      }

      await Promise.resolve();

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3020/api/v1/telemetry/events',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              eventType: TelemetryEventType.USER_ACTION,
              deviceId: 'device-123',
              tenantId: 'tenant-456'
            })
          ])
        }),
        expect.any(Object)
      );
    });
  });

  describe('flush', () => {
    it('should send all queued events to backend', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      telemetryClient.trackSessionStarted();
      telemetryClient.trackSyncStarted();
      telemetryClient.trackUserAction('click', 'dashboard', 'sync-button');

      await telemetryClient.flush();

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3020/api/v1/telemetry/events',
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({ eventType: TelemetryEventType.SESSION_STARTED }),
            expect.objectContaining({ eventType: TelemetryEventType.SYNC_STARTED }),
            expect.objectContaining({ eventType: TelemetryEventType.USER_ACTION })
          ])
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-tenant-id': 'tenant-456',
            'x-organization-id': 'org-789',
            'x-device-id': 'device-123'
          })
        })
      );

      expect(telemetryClient.getQueueSize()).toBe(0);
    });

    it('should handle flush errors gracefully', async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      telemetryClient.trackSessionStarted();

      await telemetryClient.flush();

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should not send if queue is empty', async () => {
      await telemetryClient.flush();

      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('specific event tracking methods', () => {
    it('should track sync completed with metrics', () => {
      telemetryClient.trackSyncCompleted(10, 15, 2, 5000);

      const events = telemetryClient.getQueueSize();
      expect(events).toBe(1);
    });

    it('should track sync failed with error', () => {
      telemetryClient.trackSyncFailed('Network timeout', 3000);

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should track session locked with reason', () => {
      telemetryClient.trackSessionLocked('TOO_MANY_ATTEMPTS');

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should track screen views', () => {
      telemetryClient.trackScreenViewed('patient-list', 'dashboard');

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should track errors with stack trace', () => {
      telemetryClient.trackError('TypeError', 'Cannot read property of undefined', 'Error stack...', 'sync-manager');

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should track network state changes', () => {
      telemetryClient.trackNetworkOffline();
      telemetryClient.trackNetworkOnline();

      expect(telemetryClient.getQueueSize()).toBe(2);
    });

    it('should track update events', () => {
      telemetryClient.trackUpdateAvailable('1.2.0', 'Bug fixes and improvements');
      telemetryClient.trackUpdateDownloaded('1.2.0');
      telemetryClient.trackUpdateInstalled('1.2.0');

      expect(telemetryClient.getQueueSize()).toBe(3);
    });
  });

  describe('periodic flush timer', () => {
    it('should flush automatically at intervals', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      telemetryClient.trackSessionStarted();

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(axios.post).toHaveBeenCalled();
    });

    it('should clear timer on shutdown', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      telemetryClient.trackSessionStarted();
      await telemetryClient.shutdown();

      jest.advanceTimersByTime(5000);

      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled/disabled toggle', () => {
    it('should stop tracking when disabled', () => {
      telemetryClient.trackSessionStarted();
      expect(telemetryClient.getQueueSize()).toBe(1);

      telemetryClient.setEnabled(false);
      telemetryClient.trackSessionEnded();

      expect(telemetryClient.getQueueSize()).toBe(1);
    });

    it('should resume tracking when re-enabled', () => {
      telemetryClient.setEnabled(false);
      telemetryClient.trackSessionStarted();
      expect(telemetryClient.getQueueSize()).toBe(0);

      telemetryClient.setEnabled(true);
      telemetryClient.trackSessionEnded();

      expect(telemetryClient.getQueueSize()).toBe(1);
    });
  });

  describe('session management', () => {
    it('should generate unique session IDs', () => {
      const sessionId1 = telemetryClient.getSessionId();

      telemetryClient.trackSessionStarted();

      const sessionId2 = telemetryClient.getSessionId();

      expect(sessionId1).not.toBe(sessionId2);
    });

    it('should flush on session end', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });

      telemetryClient.trackSessionStarted();
      telemetryClient.trackSessionEnded();

      await Promise.resolve();

      expect(axios.post).toHaveBeenCalled();
    });
  });

  describe('global instance', () => {
    it('should initialize and retrieve global instance', () => {
      const instance = initTelemetryClient(mockConfig);

      expect(getTelemetryClient()).toBe(instance);
    });

    it('should return null if not initialized', () => {
      expect(getTelemetryClient()).toBeNull();
    });
  });
});
