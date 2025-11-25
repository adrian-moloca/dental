import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeService } from '../src/modules/realtime/realtime.service';
import { Server } from 'socket.io';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RealtimeService],
    }).compile();

    service = module.get<RealtimeService>(RealtimeService);

    mockServer = {
      in: jest.fn().mockReturnThis(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      fetchSockets: jest.fn().mockResolvedValue([]),
    } as any;

    service.setServer(mockServer);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishEvent', () => {
    it('should publish event to specified channels', async () => {
      const dto = {
        tenantId: 'tenant-123',
        organizationId: 'org-456',
        clinicId: 'clinic-789',
        channels: ['tenant:tenant-123'],
        eventType: 'test.event',
        payload: { data: 'test' },
      };

      mockServer.fetchSockets.mockResolvedValue([
        {
          data: {
            user: {
              tenantId: 'tenant-123',
              organizationId: 'org-456',
              clinicId: 'clinic-789',
            },
          },
        } as any,
      ]);

      const result = await service.publishEvent(dto);

      expect(result).toHaveProperty('eventId');
      expect(result).toHaveProperty('delivered');
      expect(mockServer.to).toHaveBeenCalled();
      expect(mockServer.emit).toHaveBeenCalledWith('realtime:event', expect.objectContaining({
        eventType: 'test.event',
        tenantId: 'tenant-123',
      }));
    });
  });

  describe('room builders', () => {
    it('should build tenant room correctly', () => {
      expect(service.buildTenantRoom('tenant-123')).toBe('tenant:tenant-123');
    });

    it('should build organization room correctly', () => {
      expect(service.buildOrganizationRoom('org-456')).toBe('org:org-456');
    });

    it('should build clinic room correctly', () => {
      expect(service.buildClinicRoom('clinic-789')).toBe('clinic:clinic-789');
    });

    it('should build resource room correctly', () => {
      expect(service.buildResourceRoom('patient', 'patient-123')).toBe(
        'resource:patient:patient-123',
      );
    });
  });
});
