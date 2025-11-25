/**
 * Default Cabinet Seeder Tests
 *
 * Tests for DefaultCabinetSeeder service
 *
 * Test coverage:
 * - Single organization seeding
 * - Multiple organizations seeding
 * - Idempotency (running multiple times)
 * - Error handling
 * - Validation
 * - Statistics
 * - Repair operations
 *
 * @module test/unit/seeders
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DefaultCabinetSeeder } from '../../../src/modules/cabinets/seeders/default-cabinet.seeder';
import { Cabinet } from '../../../src/modules/cabinets/entities/cabinet.entity';
import { EntityStatus } from '@dentalos/shared-types';
import type { OrganizationId, UUID } from '@dentalos/shared-types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DefaultCabinetSeeder', () => {
  let seeder: DefaultCabinetSeeder;
  let cabinetRepository: jest.Mocked<Repository<Cabinet>>;
  let dataSource: jest.Mocked<DataSource>;

  // Test organization IDs
  const org1: OrganizationId = '550e8400-e29b-41d4-a716-446655440001' as OrganizationId;
  const org2: OrganizationId = '550e8400-e29b-41d4-a716-446655440002' as OrganizationId;
  const org3: OrganizationId = '550e8400-e29b-41d4-a716-446655440003' as OrganizationId;

  beforeEach(async () => {
    // Create mock repository
    const mockRepository = {
      count: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
    };

    // Create mock data source
    const mockDataSource = {
      transaction: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DefaultCabinetSeeder,
        {
          provide: getRepositoryToken(Cabinet),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    seeder = module.get<DefaultCabinetSeeder>(DefaultCabinetSeeder);
    cabinetRepository = module.get(getRepositoryToken(Cabinet));
    dataSource = module.get(DataSource);
  });

  describe('seedForOrganization', () => {
    it('should create default cabinet for organization without cabinets', async () => {
      // Arrange
      cabinetRepository.count.mockResolvedValue(0);
      const mockCabinet = {
        id: '123' as UUID,
        organizationId: org1,
        name: 'Main Office',
        isDefault: true,
        status: EntityStatus.ACTIVE,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      // Act
      const result = await seeder.seedForOrganization(org1);

      // Assert
      expect(result.created).toBe(true);
      expect(result.cabinetId).toBe('123');
      expect(cabinetRepository.count).toHaveBeenCalledWith({
        where: { organizationId: org1 },
      });
      expect(cabinetRepository.create).toHaveBeenCalled();
      expect(cabinetRepository.save).toHaveBeenCalled();
    });

    it('should skip organization that already has cabinets', async () => {
      // Arrange
      cabinetRepository.count.mockResolvedValue(2);

      // Act
      const result = await seeder.seedForOrganization(org1);

      // Assert
      expect(result.created).toBe(false);
      expect(result.reason).toContain('already has 2 cabinet(s)');
      expect(cabinetRepository.count).toHaveBeenCalledWith({
        where: { organizationId: org1 },
      });
      expect(cabinetRepository.create).not.toHaveBeenCalled();
    });

    it('should use custom cabinet name when provided', async () => {
      // Arrange
      cabinetRepository.count.mockResolvedValue(0);
      const mockCabinet = {
        id: '123' as UUID,
        organizationId: org1,
        name: 'Downtown Office',
        isDefault: true,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      // Act
      const result = await seeder.seedForOrganization(org1, {
        defaultCabinetName: 'Downtown Office',
      });

      // Assert
      expect(result.created).toBe(true);
      expect(cabinetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Downtown Office',
        }),
      );
    });

    it('should merge custom settings with default settings', async () => {
      // Arrange
      cabinetRepository.count.mockResolvedValue(0);
      const mockCabinet = {
        id: '123' as UUID,
        organizationId: org1,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      const customSettings = {
        timezone: 'America/New_York',
        currency: 'EUR',
      };

      // Act
      await seeder.seedForOrganization(org1, {
        defaultSettings: customSettings,
      });

      // Assert
      expect(cabinetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            timezone: 'America/New_York',
            currency: 'EUR',
            language: 'en', // Default value
            dateFormat: 'MM/DD/YYYY', // Default value
          }),
        }),
      );
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      cabinetRepository.count.mockResolvedValue(0);
      cabinetRepository.create.mockReturnValue({} as Cabinet);
      cabinetRepository.save.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(seeder.seedForOrganization(org1)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('seedForOrganizations', () => {
    it('should seed multiple organizations successfully', async () => {
      // Arrange
      const organizations = [org1, org2, org3];
      cabinetRepository.count.mockResolvedValue(0);
      const mockCabinet = {
        id: '123' as UUID,
        organizationId: org1,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      // Act
      const result = await seeder.seedForOrganizations(organizations);

      // Assert
      expect(result.total).toBe(3);
      expect(result.created).toBe(3);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should skip organizations that already have cabinets', async () => {
      // Arrange
      const organizations = [org1, org2, org3];
      cabinetRepository.count
        .mockResolvedValueOnce(0) // org1 - create
        .mockResolvedValueOnce(1) // org2 - skip
        .mockResolvedValueOnce(0); // org3 - create

      const mockCabinet = {
        id: '123' as UUID,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      // Act
      const result = await seeder.seedForOrganizations(organizations);

      // Assert
      expect(result.total).toBe(3);
      expect(result.created).toBe(2);
      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors but continue processing', async () => {
      // Arrange
      const organizations = [org1, org2, org3];
      cabinetRepository.count.mockResolvedValue(0);
      cabinetRepository.create.mockReturnValue({} as Cabinet);
      cabinetRepository.save
        .mockResolvedValueOnce({} as Cabinet) // org1 - success
        .mockRejectedValueOnce(new Error('Error for org2')) // org2 - error
        .mockResolvedValueOnce({} as Cabinet); // org3 - success

      // Act
      const result = await seeder.seedForOrganizations(organizations);

      // Assert
      expect(result.total).toBe(3);
      expect(result.created).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        organizationId: org2,
        error: 'Error for org2',
      });
    });
  });

  describe('validate', () => {
    it('should return valid when all organizations have cabinets', async () => {
      // Arrange
      const organizations = [org1, org2];
      cabinetRepository.count.mockResolvedValue(1);

      // Act
      const result = await seeder.validate(organizations);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.organizationsWithoutCabinets).toHaveLength(0);
      expect(result.organizationsWithCabinets).toHaveLength(2);
    });

    it('should return invalid when some organizations lack cabinets', async () => {
      // Arrange
      const organizations = [org1, org2, org3];
      cabinetRepository.count
        .mockResolvedValueOnce(1) // org1 - has cabinets
        .mockResolvedValueOnce(0) // org2 - no cabinets
        .mockResolvedValueOnce(1); // org3 - has cabinets

      // Act
      const result = await seeder.validate(organizations);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.organizationsWithoutCabinets).toEqual([org2]);
      expect(result.organizationsWithCabinets).toEqual([org1, org3]);
    });

    it('should return valid when no organization IDs provided', async () => {
      // Act
      const result = await seeder.validate([]);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.organizationsWithoutCabinets).toHaveLength(0);
      expect(result.organizationsWithCabinets).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      // Arrange
      cabinetRepository.count
        .mockResolvedValueOnce(10) // totalCabinets
        .mockResolvedValueOnce(5) // defaultCabinets
        .mockResolvedValueOnce(8); // activeCabinets

      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { count: '1' },
          { count: '2' },
          { count: '3' },
        ]),
      };
      cabinetRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await seeder.getStats();

      // Assert
      expect(result.totalCabinets).toBe(10);
      expect(result.defaultCabinets).toBe(5);
      expect(result.activeCabinets).toBe(8);
      expect(result.organizationsWithCabinets).toBe(3);
      expect(result.organizationsWithMultipleCabinets).toBe(2); // count > 1
    });
  });

  describe('repairMissingDefaults', () => {
    it('should set oldest cabinet as default for orgs without defaults', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([
          { organizationId: org1 },
          { organizationId: org2 },
        ]),
      };
      cabinetRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const mockCabinet1 = {
        id: '1' as UUID,
        organizationId: org1,
        isDefault: false,
      } as Cabinet;
      const mockCabinet2 = {
        id: '2' as UUID,
        organizationId: org2,
        isDefault: false,
      } as Cabinet;

      cabinetRepository.findOne
        .mockResolvedValueOnce(mockCabinet1)
        .mockResolvedValueOnce(mockCabinet2);
      cabinetRepository.save.mockResolvedValue({} as Cabinet);

      // Act
      const result = await seeder.repairMissingDefaults();

      // Assert
      expect(result).toBe(2);
      expect(cabinetRepository.save).toHaveBeenCalledTimes(2);
      expect(mockCabinet1.isDefault).toBe(true);
      expect(mockCabinet2.isDefault).toBe(true);
    });
  });

  describe('removeDuplicateDefaults', () => {
    it('should keep oldest default and unset others', async () => {
      // Arrange
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        getRawMany: vi.fn().mockResolvedValue([{ organizationId: org1 }]),
      };
      cabinetRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const mockCabinets = [
        { id: '1' as UUID, isDefault: true, createdAt: new Date('2024-01-01') },
        { id: '2' as UUID, isDefault: true, createdAt: new Date('2024-01-02') },
        { id: '3' as UUID, isDefault: true, createdAt: new Date('2024-01-03') },
      ] as Cabinet[];

      cabinetRepository.find.mockResolvedValue(mockCabinets);
      cabinetRepository.save.mockResolvedValue({} as Cabinet);

      // Act
      const result = await seeder.removeDuplicateDefaults();

      // Assert
      expect(result).toBe(2); // 2 duplicates removed (kept the first one)
      expect(cabinetRepository.save).toHaveBeenCalledTimes(2);
      expect(mockCabinets[0].isDefault).toBe(true); // Oldest kept
      expect(mockCabinets[1].isDefault).toBe(false); // Removed
      expect(mockCabinets[2].isDefault).toBe(false); // Removed
    });
  });

  describe('Idempotency', () => {
    it('should be safe to run multiple times for same organization', async () => {
      // Arrange
      cabinetRepository.count
        .mockResolvedValueOnce(0) // First run - no cabinets
        .mockResolvedValueOnce(1) // Second run - has cabinet
        .mockResolvedValueOnce(1); // Third run - has cabinet

      const mockCabinet = {
        id: '123' as UUID,
        organizationId: org1,
      } as Cabinet;
      cabinetRepository.create.mockReturnValue(mockCabinet);
      cabinetRepository.save.mockResolvedValue(mockCabinet);

      // Act - Run three times
      const result1 = await seeder.seedForOrganization(org1);
      const result2 = await seeder.seedForOrganization(org1);
      const result3 = await seeder.seedForOrganization(org1);

      // Assert
      expect(result1.created).toBe(true);
      expect(result2.created).toBe(false);
      expect(result3.created).toBe(false);
      expect(cabinetRepository.save).toHaveBeenCalledTimes(1); // Only created once
    });
  });
});
