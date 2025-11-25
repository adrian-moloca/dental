import { WebSocketClient } from '../../src/realtime/websocket-client';

// Mock socket.io-client
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
  })),
}));

describe('WebSocketClient', () => {
  let client: WebSocketClient;

  beforeEach(() => {
    client = new WebSocketClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connect', () => {
    it('should connect to WebSocket server', () => {
      const config = {
        url: 'http://localhost:3020',
        token: 'test-token',
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      client.connect(config);

      expect(client.isConnected()).toBe(false); // Socket not yet connected in mock
    });

    it('should not reconnect if already connected', () => {
      const config = {
        url: 'http://localhost:3020',
        token: 'test-token',
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      client.connect(config);
      const consoleSpy = jest.spyOn(console, 'log');

      // Mock connected state
      (client as any).socket = { connected: true };
      client.connect(config);

      expect(consoleSpy).toHaveBeenCalledWith('Already connected');
    });
  });

  describe('disconnect', () => {
    it('should disconnect from WebSocket server', () => {
      const mockSocket = {
        disconnect: jest.fn(),
        connected: false,
      };

      (client as any).socket = mockSocket;

      client.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect((client as any).socket).toBeNull();
    });

    it('should clear subscribed channels on disconnect', () => {
      const mockSocket = {
        disconnect: jest.fn(),
        connected: false,
      };

      (client as any).socket = mockSocket;
      (client as any).subscribedChannels = new Set(['channel1', 'channel2']);

      client.disconnect();

      expect((client as any).subscribedChannels.size).toBe(0);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to channels', () => {
      const mockSocket = {
        connected: true,
        emit: jest.fn((_event, _data, callback) => {
          callback({ success: true });
        }),
      };

      (client as any).socket = mockSocket;

      const channels = ['channel1', 'channel2'];
      client.subscribe(channels);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'subscribe',
        { channels },
        expect.any(Function),
      );
    });

    it('should not subscribe if not connected', () => {
      const mockSocket = {
        connected: false,
        emit: jest.fn(),
      };

      (client as any).socket = mockSocket;

      const consoleSpy = jest.spyOn(console, 'warn');
      client.subscribe(['channel1']);

      expect(consoleSpy).toHaveBeenCalledWith('Cannot subscribe: not connected');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from channels', () => {
      const mockSocket = {
        connected: true,
        emit: jest.fn((_event, _data, callback) => {
          callback({ success: true });
        }),
      };

      (client as any).socket = mockSocket;
      (client as any).subscribedChannels = new Set(['channel1', 'channel2']);

      const channels = ['channel1'];
      client.unsubscribe(channels);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'unsubscribe',
        { channels },
        expect.any(Function),
      );
    });
  });

  describe('updatePresence', () => {
    it('should update presence status', () => {
      const mockSocket = {
        connected: true,
        emit: jest.fn((_event, _data, callback) => {
          callback({ success: true });
        }),
      };

      (client as any).socket = mockSocket;

      client.updatePresence('AWAY', undefined);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'presence:update',
        { status: 'AWAY', activeResource: undefined },
        expect.any(Function),
      );
    });

    it('should update active resource', () => {
      const mockSocket = {
        connected: true,
        emit: jest.fn((_event, _data, callback) => {
          callback({ success: true });
        }),
      };

      (client as any).socket = mockSocket;

      const activeResource = { type: 'patient', id: 'patient-123' };
      client.updatePresence(undefined, activeResource);

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'presence:update',
        { status: undefined, activeResource },
        expect.any(Function),
      );
    });

    it('should not update if not connected', () => {
      const mockSocket = {
        connected: false,
        emit: jest.fn(),
      };

      (client as any).socket = mockSocket;

      client.updatePresence('ONLINE', undefined);

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('startHeartbeat', () => {
    it('should send heartbeat at specified interval', () => {
      jest.useFakeTimers();

      const mockSocket = {
        connected: true,
        emit: jest.fn(),
      };

      (client as any).socket = mockSocket;

      client.startHeartbeat(1000);

      jest.advanceTimersByTime(1000);
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'presence:heartbeat',
        {},
        expect.any(Function),
      );

      jest.advanceTimersByTime(1000);
      expect(mockSocket.emit).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});
