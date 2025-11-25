/**
 * Cabinet E2E Integration Tests
 *
 * Comprehensive end-to-end tests for Cabinet CRUD operations with:
 * - Real PostgreSQL database (testcontainers)
 * - Multi-tenant isolation verification
 * - Business rule enforcement
 * - Edge case coverage
 * - Error handling
 *
 * Test Coverage:
 * - ✓ Create cabinet (CRUD)
 * - ✓ Read cabinet by ID (CRUD)
 * - ✓ List all cabinets with filters (CRUD)
 * - ✓ Update cabinet (CRUD)
 * - ✓ Delete cabinet (CRUD)
 * - ✓ Set default cabinet
 * - ✓ Multi-tenant isolation
 * - ✓ Business rules (default cabinet, unique code)
 * - ✓ Edge cases (concurrent operations, data validation)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { Cabinet } from '../../src/modules/cabinets/entities/cabinet.entity';
import { CabinetRepository } from '../../src/modules/cabinets/repositories/cabinet.repository';
import { CabinetService } from '../../src/modules/cabinets/services/cabinet.service';
import { TestDatabase } from '../helpers/test-database.helper';
import {
  createCabinetDto,
  createMultiTenantCabinets,
  createEdgeCases,
  TEST_ORG_1,
  TEST_ORG_2,
  TEST_USER_1,
} from '../helpers/test-data.factory';
import { EntityStatus } from '@dentalos/shared-types';
import { NotFoundError, ValidationError } from '@dentalos/shared-errors';
import type { UUID } from '@dentalos/shared-types';

describe('Cabinet E2E Integration Tests', () => {
  let testDb: TestDatabase;
  let dataSource: DataSource;
  let cabinetRepository: CabinetRepository;
  let cabinetService: CabinetService;
  let typeormRepository: Repository<Cabinet>;

  // Setup: Start database container
  beforeAll(async () => {
    testDb = new TestDatabase();
    dataSource = await testDb.start();
    typeormRepository = dataSource.getRepository(Cabinet);
    cabinetRepository = new CabinetRepository(typeormRepository);
    cabinetService = new CabinetService(cabinetRepository);
  }, 120000);

  // Cleanup: Stop database container
  afterAll(async () => {
    await testDb.stop();
  }, 60000);

  // Clear data before each test for isolation
  beforeEach(async () => {
    await testDb.clearData();
  });

  describe('CREATE Cabinet', () => {
    it('should create a cabinet with all fields', async () => {
      const dto = createCabinetDto({ name: 'Main Office' });
      const cabinet = await cabinetService.create(dto, TEST_ORG_1, TEST_USER_1);

      expect(cabinet).toBeDefined();
      expect(cabinet.id).toBeDefined();
      expect(cabinet.name).toBe('Main Office');
      expect(cabinet.organizationId).toBe(TEST_ORG_1);
      expect(cabinet.createdBy).toBe(TEST_USER_1);
      expect(cabinet.status).toBe(EntityStatus.ACTIVE);
      expect(cabinet.createdAt).toBeInstanceOf(Date);
      expect(cabinet.updatedAt).toBeInstanceOf(Date);
    });

    it('should auto-set first cabinet as default', async () => {
      const dto = createCabinetDto({ isDefault: false });
      const cabinet = await cabinetService.create(dto, TEST_ORG_1, TEST_USER_1);

      expect(cabinet.isDefault).toBe(true);
    });

    it('should create second cabinet as non-default', async () => {
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);
      const cabinet2 = await cabinetService.create(
        createCabinetDto({ name: 'Branch Office' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      expect(cabinet2.isDefault).toBe(false);
    });

    it('should unset existing default when creating new default cabinet', async () => {
      const first = await cabinetService.create(
        createCabinetDto({ name: 'First' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      expect(first.isDefault).toBe(true);

      const second = await cabinetService.create(
        createCabinetDto({ name: 'Second', isDefault: true }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      expect(second.isDefault).toBe(true);

      const firstReloaded = await cabinetService.findById(first.id, TEST_ORG_1);
      expect(firstReloaded.isDefault).toBe(false);
    });

    it('should create cabinet with minimal data', async () => {
      const edgeCases = createEdgeCases();
      const cabinet = await cabinetService.create(
        edgeCases.minimalData,
        TEST_ORG_1,
        TEST_USER_1,
      );

      expect(cabinet).toBeDefined();
      expect(cabinet.name).toBe('Minimal Cabinet');
      expect(cabinet.code).toBeUndefined();
      expect(cabinet.address).toBeUndefined();
    });

    it('should handle special characters in name and address', async () => {
      const edgeCases = createEdgeCases();
      const cabinet = await cabinetService.create(
        edgeCases.specialCharacters,
        TEST_ORG_1,
        TEST_USER_1,
      );

      expect(cabinet.name).toBe('Café Dentaire & Specialists');
      expect(cabinet.code).toBe('CAB-ÜÑÏ');
    });

    it('should enforce unique code within organization', async () => {
      const dto = createCabinetDto({ code: 'UNIQUE-001' });
      await cabinetService.create(dto, TEST_ORG_1, TEST_USER_1);

      await expect(
        cabinetService.create(
          createCabinetDto({ name: 'Different Name', code: 'UNIQUE-001' }),
          TEST_ORG_1,
          TEST_USER_1,
        ),
      ).rejects.toThrow();
    });

    it('should allow same code in different organizations', async () => {
      const dto = createCabinetDto({ code: 'SHARED-CODE' });

      const cabinet1 = await cabinetService.create(dto, TEST_ORG_1, TEST_USER_1);
      const cabinet2 = await cabinetService.create(dto, TEST_ORG_2, TEST_USER_1);

      expect(cabinet1.code).toBe('SHARED-CODE');
      expect(cabinet2.code).toBe('SHARED-CODE');
      expect(cabinet1.organizationId).not.toBe(cabinet2.organizationId);
    });
  });

  describe('READ Cabinet', () => {
    it('should find cabinet by ID', async () => {
      const created = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );
      const found = await cabinetService.findById(created.id, TEST_ORG_1);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
    });

    it('should throw NotFoundError for non-existent cabinet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000' as UUID;

      await expect(cabinetService.findById(fakeId, TEST_ORG_1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should enforce tenant isolation on findById', async () => {
      const org1Cabinet = await cabinetService.create(
        createCabinetDto({ name: 'Org 1 Cabinet' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(
        cabinetService.findById(org1Cabinet.id, TEST_ORG_2),
      ).rejects.toThrow(NotFoundError);
    });

    it('should find cabinet by code', async () => {
      const created = await cabinetService.create(
        createCabinetDto({ code: 'TEST-CODE' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      const found = await cabinetService.findByCode('TEST-CODE', TEST_ORG_1);

      expect(found).toBeDefined();
      expect(found?.code).toBe('TEST-CODE');
    });

    it('should find default cabinet', async () => {
      await cabinetService.create(
        createCabinetDto({ name: 'Default Cabinet' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      const defaultCabinet = await cabinetService.findDefault(TEST_ORG_1);

      expect(defaultCabinet).toBeDefined();
      expect(defaultCabinet.isDefault).toBe(true);
    });

    it('should throw NotFoundError when no default cabinet exists', async () => {
      await expect(cabinetService.findDefault(TEST_ORG_1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should list all cabinets for organization', async () => {
      await cabinetService.create(
        createCabinetDto({ name: 'Cabinet 1' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(
        createCabinetDto({ name: 'Cabinet 2' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      const cabinets = await cabinetService.findAll(TEST_ORG_1);

      expect(cabinets).toHaveLength(2);
      expect(cabinets[0].organizationId).toBe(TEST_ORG_1);
      expect(cabinets[1].organizationId).toBe(TEST_ORG_1);
    });

    it('should filter cabinets by status', async () => {
      const active = await cabinetService.create(
        createCabinetDto({ name: 'Active' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      const inactive = await cabinetService.create(
        createCabinetDto({ name: 'Inactive' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.updateStatus(inactive.id, EntityStatus.INACTIVE, TEST_ORG_1);

      const activeCabinets = await cabinetService.findAll(TEST_ORG_1, {
        status: EntityStatus.ACTIVE,
      });

      expect(activeCabinets).toHaveLength(1);
      expect(activeCabinets[0].id).toBe(active.id);
    });

    it('should count cabinets in organization', async () => {
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);

      const count = await cabinetService.count(TEST_ORG_1);
      expect(count).toBe(2);
    });

    it('should verify multi-tenant isolation in list', async () => {
      await cabinetService.create(
        createCabinetDto({ name: 'Org1-Cab1' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(
        createCabinetDto({ name: 'Org1-Cab2' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(
        createCabinetDto({ name: 'Org2-Cab1' }),
        TEST_ORG_2,
        TEST_USER_1,
      );

      const org1Cabinets = await cabinetService.findAll(TEST_ORG_1);
      const org2Cabinets = await cabinetService.findAll(TEST_ORG_2);

      expect(org1Cabinets).toHaveLength(2);
      expect(org2Cabinets).toHaveLength(1);
      expect(org1Cabinets.every((c) => c.organizationId === TEST_ORG_1)).toBe(true);
      expect(org2Cabinets.every((c) => c.organizationId === TEST_ORG_2)).toBe(true);
    });
  });

  describe('UPDATE Cabinet', () => {
    it('should update cabinet name', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto({ name: 'Original Name' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      const updated = await cabinetService.update(
        cabinet.id,
        { name: 'Updated Name' },
        TEST_ORG_1,
      );

      expect(updated.name).toBe('Updated Name');
      expect(updated.updatedAt.getTime()).toBeGreaterThan(cabinet.updatedAt.getTime());
    });

    it('should update multiple fields', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      const updated = await cabinetService.update(
        cabinet.id,
        {
          name: 'New Name',
          address: 'New Address',
          phone: '+1-555-9999',
          email: 'new@test.com',
        },
        TEST_ORG_1,
      );

      expect(updated.name).toBe('New Name');
      expect(updated.address).toBe('New Address');
      expect(updated.phone).toBe('+1-555-9999');
      expect(updated.email).toBe('new@test.com');
    });

    it('should update status', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);

      await cabinetService.updateStatus(cabinet.id, EntityStatus.INACTIVE, TEST_ORG_1);

      const updated = await cabinetService.findById(cabinet.id, TEST_ORG_1);
      expect(updated.status).toBe(EntityStatus.INACTIVE);
    });

    it('should set cabinet as default', async () => {
      const first = await cabinetService.create(
        createCabinetDto({ name: 'First' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      const second = await cabinetService.create(
        createCabinetDto({ name: 'Second' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await cabinetService.setDefault(second.id, TEST_ORG_1);

      const firstReloaded = await cabinetService.findById(first.id, TEST_ORG_1);
      const secondReloaded = await cabinetService.findById(second.id, TEST_ORG_1);

      expect(firstReloaded.isDefault).toBe(false);
      expect(secondReloaded.isDefault).toBe(true);
    });

    it('should prevent removing default flag from only cabinet', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(
        cabinetService.update(cabinet.id, { isDefault: false }, TEST_ORG_1),
      ).rejects.toThrow(ValidationError);
    });

    it('should prevent deactivating default cabinet without reassignment', async () => {
      const defaultCabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(
        cabinetService.updateStatus(
          defaultCabinet.id,
          EntityStatus.INACTIVE,
          TEST_ORG_1,
        ),
      ).rejects.toThrow(ValidationError);
    });

    it('should enforce tenant isolation on update', async () => {
      const org1Cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(
        cabinetService.update(org1Cabinet.id, { name: 'Hacked' }, TEST_ORG_2),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('DELETE Cabinet', () => {
    it('should soft delete cabinet', async () => {
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);
      const cabinet2 = await cabinetService.create(
        createCabinetDto({ name: 'To Delete' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await cabinetService.delete(cabinet2.id, TEST_ORG_1);

      await expect(cabinetService.findById(cabinet2.id, TEST_ORG_1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should prevent deleting default cabinet', async () => {
      const defaultCabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);

      await expect(
        cabinetService.delete(defaultCabinet.id, TEST_ORG_1),
      ).rejects.toThrow(ValidationError);
    });

    it('should prevent deleting only cabinet', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(cabinetService.delete(cabinet.id, TEST_ORG_1)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should enforce tenant isolation on delete', async () => {
      await cabinetService.create(createCabinetDto(), TEST_ORG_1, TEST_USER_1);
      const org1Cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      await expect(cabinetService.delete(org1Cabinet.id, TEST_ORG_2)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should isolate cabinets between organizations', async () => {
      const testCabinets = createMultiTenantCabinets();

      await cabinetService.create(testCabinets.org1Cabinet1, TEST_ORG_1, TEST_USER_1);
      await cabinetService.create(testCabinets.org1Cabinet2, TEST_ORG_1, TEST_USER_1);
      await cabinetService.create(testCabinets.org2Cabinet1, TEST_ORG_2, TEST_USER_1);
      await cabinetService.create(testCabinets.org2Cabinet2, TEST_ORG_2, TEST_USER_1);

      const org1Count = await cabinetService.count(TEST_ORG_1);
      const org2Count = await cabinetService.count(TEST_ORG_2);

      expect(org1Count).toBe(2);
      expect(org2Count).toBe(2);
    });

    it('should maintain separate default cabinets per organization', async () => {
      await cabinetService.create(
        createCabinetDto({ name: 'Org1 Default' }),
        TEST_ORG_1,
        TEST_USER_1,
      );
      await cabinetService.create(
        createCabinetDto({ name: 'Org2 Default' }),
        TEST_ORG_2,
        TEST_USER_1,
      );

      const org1Default = await cabinetService.findDefault(TEST_ORG_1);
      const org2Default = await cabinetService.findDefault(TEST_ORG_2);

      expect(org1Default.name).toBe('Org1 Default');
      expect(org2Default.name).toBe('Org2 Default');
      expect(org1Default.organizationId).toBe(TEST_ORG_1);
      expect(org2Default.organizationId).toBe(TEST_ORG_2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent cabinet creation', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        cabinetService.create(
          createCabinetDto({ name: `Cabinet ${i}` }),
          TEST_ORG_1,
          TEST_USER_1,
        ),
      );

      const cabinets = await Promise.all(promises);

      expect(cabinets).toHaveLength(5);
      expect(new Set(cabinets.map((c) => c.id)).size).toBe(5);

      const defaultCount = cabinets.filter((c) => c.isDefault).length;
      expect(defaultCount).toBe(1);
    });

    it('should handle long names', async () => {
      const edgeCases = createEdgeCases();
      const cabinet = await cabinetService.create(
        edgeCases.longName,
        TEST_ORG_1,
        TEST_USER_1,
      );

      expect(cabinet.name).toHaveLength(250);
    });

    it('should check if code is available', async () => {
      await cabinetService.create(
        createCabinetDto({ code: 'USED-CODE' }),
        TEST_ORG_1,
        TEST_USER_1,
      );

      const isAvailable = await cabinetService.isCodeAvailable(
        'USED-CODE',
        TEST_ORG_1,
      );
      const isAvailable2 = await cabinetService.isCodeAvailable(
        'FREE-CODE',
        TEST_ORG_1,
      );

      expect(isAvailable).toBe(false);
      expect(isAvailable2).toBe(true);
    });

    it('should check if cabinet exists', async () => {
      const cabinet = await cabinetService.create(
        createCabinetDto(),
        TEST_ORG_1,
        TEST_USER_1,
      );

      const exists = await cabinetService.exists(cabinet.id, TEST_ORG_1);
      const notExists = await cabinetService.exists(
        '00000000-0000-0000-0000-000000000000' as UUID,
        TEST_ORG_1,
      );

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });
  });
});
