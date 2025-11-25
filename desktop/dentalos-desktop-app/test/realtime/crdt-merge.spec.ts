import {
  CRDTMergeEngine,
  CRDTEnvelope,
  CRDTResolutionStrategy,
} from '../../src/realtime/crdt-merge';

describe('CRDTMergeEngine', () => {
  let engine: CRDTMergeEngine;

  beforeEach(() => {
    engine = new CRDTMergeEngine();
  });

  describe('merge', () => {
    it('should merge patches with no conflicts', async () => {
      const localData = { firstName: 'John', age: 30 };
      const localMetadata = {
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const remotePatch: CRDTEnvelope = {
        id: 'patch-1',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { lastName: 'Doe' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await engine.merge(
        localData,
        localMetadata,
        remotePatch,
        CRDTResolutionStrategy.LAST_WRITE_WINS,
      );

      expect(result.conflicts).toHaveLength(0);
      expect(result.merged).toEqual({
        firstName: 'John',
        age: 30,
        lastName: 'Doe',
      });
      expect(result.resolved).toBe(true);
      expect(result.needsManualResolution).toBe(false);
    });

    it('should resolve conflicts using LAST_WRITE_WINS', async () => {
      const localData = { email: 'john@old.com' };
      const localMetadata = {
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const remotePatch: CRDTEnvelope = {
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

      const result = await engine.merge(
        localData,
        localMetadata,
        remotePatch,
        CRDTResolutionStrategy.LAST_WRITE_WINS,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].field).toBe('email');
      expect(result.merged.email).toBe('john@new.com'); // Remote wins (later timestamp)
      expect(result.conflicts[0].resolution).toBe('remote');
      expect(result.resolved).toBe(true);
    });

    it('should resolve conflicts using HIGHEST_VERSION_WINS', async () => {
      const localData = { phone: '555-1111' };
      const localMetadata = {
        version: 3,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const remotePatch: CRDTEnvelope = {
        id: 'patch-3',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { phone: '555-2222' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await engine.merge(
        localData,
        localMetadata,
        remotePatch,
        CRDTResolutionStrategy.HIGHEST_VERSION_WINS,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.merged.phone).toBe('555-1111'); // Local wins (higher version)
      expect(result.conflicts[0].resolution).toBe('local');
    });

    it('should merge objects using MERGE_OBJECTS strategy', async () => {
      const localData = {
        address: { street: '123 Main St', city: 'Old City' },
      };
      const localMetadata = {
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const remotePatch: CRDTEnvelope = {
        id: 'patch-4',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { address: { city: 'New City', zip: '12345' } },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await engine.merge(
        localData,
        localMetadata,
        remotePatch,
        CRDTResolutionStrategy.MERGE_OBJECTS,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.merged.address).toEqual({
        street: '123 Main St',
        city: 'New City',
        zip: '12345',
      });
    });

    it('should require manual resolution with MANUAL strategy', async () => {
      const localData = { status: 'active' };
      const localMetadata = {
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const remotePatch: CRDTEnvelope = {
        id: 'patch-5',
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-2',
        version: 2,
        timestamp: new Date('2025-01-01T10:01:00Z'),
        patch: { status: 'inactive' },
        tenantId: 'tenant-123',
        organizationId: 'org-123',
      };

      const result = await engine.merge(
        localData,
        localMetadata,
        remotePatch,
        CRDTResolutionStrategy.MANUAL,
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.needsManualResolution).toBe(true);
      expect(result.resolved).toBe(false);
      expect(result.conflicts[0].resolution).toBe('manual');
    });
  });

  describe('mergeMultiple', () => {
    it('should merge multiple patches in order', async () => {
      const localData = { firstName: 'John' };
      const localMetadata = {
        version: 1,
        timestamp: new Date('2025-01-01T10:00:00Z'),
        actorId: 'user-1',
      };

      const patches: CRDTEnvelope[] = [
        {
          id: 'patch-1',
          resourceType: 'patient',
          resourceId: 'patient-123',
          actorId: 'user-2',
          version: 2,
          timestamp: new Date('2025-01-01T10:01:00Z'),
          patch: { lastName: 'Doe' },
          tenantId: 'tenant-123',
          organizationId: 'org-123',
        },
        {
          id: 'patch-2',
          resourceType: 'patient',
          resourceId: 'patient-123',
          actorId: 'user-3',
          version: 3,
          timestamp: new Date('2025-01-01T10:02:00Z'),
          patch: { email: 'john.doe@example.com' },
          tenantId: 'tenant-123',
          organizationId: 'org-123',
        },
      ];

      const result = await engine.mergeMultiple(
        localData,
        localMetadata,
        patches,
        CRDTResolutionStrategy.LAST_WRITE_WINS,
      );

      expect(result.merged).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
      expect(result.conflicts).toHaveLength(0);
      expect(result.resolved).toBe(true);
    });
  });

  describe('createPatch', () => {
    it('should create a CRDT patch', () => {
      const changes = { firstName: 'Jane', email: 'jane@example.com' };
      const metadata = {
        actorId: 'user-1',
        version: 5,
        tenantId: 'tenant-123',
        organizationId: 'org-123',
        clinicId: 'clinic-456',
      };

      const patch = engine.createPatch('patient', 'patient-123', changes, metadata);

      expect(patch).toMatchObject({
        resourceType: 'patient',
        resourceId: 'patient-123',
        actorId: 'user-1',
        version: 5,
        patch: changes,
        tenantId: 'tenant-123',
        organizationId: 'org-123',
        clinicId: 'clinic-456',
      });
      expect(patch.id).toBeDefined();
      expect(patch.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('areValuesEqual', () => {
    it('should correctly compare primitive values', () => {
      const engine = new CRDTMergeEngine();
      expect((engine as any).areValuesEqual('test', 'test')).toBe(true);
      expect((engine as any).areValuesEqual('test', 'other')).toBe(false);
      expect((engine as any).areValuesEqual(123, 123)).toBe(true);
      expect((engine as any).areValuesEqual(123, 456)).toBe(false);
      expect((engine as any).areValuesEqual(null, null)).toBe(true);
      expect((engine as any).areValuesEqual(null, undefined)).toBe(false);
    });

    it('should correctly compare arrays', () => {
      const engine = new CRDTMergeEngine();
      expect((engine as any).areValuesEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect((engine as any).areValuesEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect((engine as any).areValuesEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should correctly compare objects', () => {
      const engine = new CRDTMergeEngine();
      expect((engine as any).areValuesEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect((engine as any).areValuesEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect((engine as any).areValuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });
  });
});
