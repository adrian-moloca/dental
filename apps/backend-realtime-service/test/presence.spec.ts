import { Test, TestingModule } from '@nestjs/testing';
import { PresenceService } from '../src/modules/presence/presence.service';
import { RedisService } from '../src/redis/redis.service';

describe('PresenceService', () => {
  let service: PresenceService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockRedisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      sadd: jest.fn(),
      smembers: jest.fn(),
      expire: jest.fn(),
      getClient: jest.fn().mockReturnValue({
        keys: jest.fn().mockResolvedValue([]),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PresenceService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<PresenceService>(PresenceService);
    redisService = module.get(RedisService) as jest.Mocked<RedisService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setUserOnline', () => {
    it('should store user presence in Redis', async () => {
      const user = {
        actorId: 'actor-123',
        userId: 'user-123',
        tenantId: 'tenant-123',
        organizationId: 'org-123',
        role: 'PROVIDER',
      };

      await service.setUserOnline(user as any, 'socket-123', 'John Doe');

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('presence:user:tenant-123:actor-123'),
        expect.any(String),
        300,
      );
    });
  });

  describe('setUserOffline', () => {
    it('should remove user presence from Redis', async () => {
      await service.setUserOffline('tenant-123', 'actor-123');

      expect(redisService.del).toHaveBeenCalledWith(
        expect.stringContaining('presence:user:tenant-123:actor-123'),
      );
    });
  });

  describe('updatePresence', () => {
    it('should update user presence with active resource', async () => {
      const existingPresence = {
        actorId: 'actor-123',
        tenantId: 'tenant-123',
        status: 'ONLINE',
        lastHeartbeat: new Date(),
      };

      redisService.get.mockResolvedValue(JSON.stringify(existingPresence));

      await service.updatePresence('tenant-123', 'actor-123', {
        activeResource: { type: 'patient', id: 'patient-123' },
      });

      expect(redisService.set).toHaveBeenCalled();
      expect(redisService.sadd).toHaveBeenCalled();
    });
  });
});
