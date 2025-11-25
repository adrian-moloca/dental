import { Test, TestingModule } from '@nestjs/testing';
import { CRDTResolverService } from '../src/modules/crdt/crdt-resolver.service';
import { LamportClockService } from '../src/modules/crdt/lamport-clock.service';
import { CRDTResolutionStrategy } from '@dentalos/shared-domain';

describe('CRDTResolverService', () => {
  let service: CRDTResolverService;
  let lamportClockService: jest.Mocked<LamportClockService>;

  beforeEach(async () => {
    const mockLamportClockService = {
      getTime: jest.fn(),
      incrementAndGet: jest.fn(),
      updateIfGreater: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CRDTResolverService,
        { provide: LamportClockService, useValue: mockLamportClockService },
      ],
    }).compile();

    service = module.get<CRDTResolverService>(CRDTResolverService);
    lamportClockService = module.get(LamportClockService) as jest.Mocked<LamportClockService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mergePatches', () => {
    it('should merge patches with no conflicts', async () => {
      const localPatch = {
        id: 'patch-1',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-1',
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        patch: { firstName: 'John' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const remotePatch = {
        id: 'patch-2',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { lastName: 'Doe' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await service.mergePatches(
        'tenant-123',
        'patient',
        'patient-123',
        localPatch,
        remotePatch,
        CRDTResolutionStrategy.LAST_WRITE_WINS,
      );

      expect(result.conflicts).toHaveLength(0);
      expect(result.merged).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(result.resolved).toBe(true);
    });

    it('should resolve conflicts using LAST_WRITE_WINS', async () => {
      const localPatch = {
        id: 'patch-1',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-1',
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        patch: { email: 'john@old.com' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const remotePatch = {
        id: 'patch-2',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { email: 'john@new.com' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await service.mergePatches(
        'tenant-123',
        'patient',
        'patient-123',
        localPatch,
        remotePatch,
        CRDTResolutionStrategy.LAST_WRITE_WINS,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].field).toBe('email');
      expect(result.merged.email).toBe('john@new.com');
      expect(result.conflicts[0].resolution).toBe('remote');
    });

    it('should resolve conflicts using HIGHEST_VERSION_WINS', async () => {
      const localPatch = {
        id: 'patch-1',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-1',
        version: 3,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        patch: { phone: '555-1111' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const remotePatch = {
        id: 'patch-2',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { phone: '555-2222' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await service.mergePatches(
        'tenant-123',
        'patient',
        'patient-123',
        localPatch,
        remotePatch,
        CRDTResolutionStrategy.HIGHEST_VERSION_WINS,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.merged.phone).toBe('555-1111');
      expect(result.conflicts[0].resolution).toBe('local');
    });
  });
});
