/**
 * User Preferences Service Unit Tests
 *
 * Tests business logic for user preference management.
 * Validates auto-create defaults, upsert pattern, and tenant isolation.
 *
 * @module modules/user-preferences/services
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferenceRepository } from '../repositories/user-preference.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { UserPreference } from '../entities/user-preference.entity';
import type { OrganizationId } from '@dentalos/shared-types';

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let userPreferenceRepository: jest.Mocked<UserPreferenceRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockOrganizationId = '123e4567-e89b-12d3-a456-426614174002' as OrganizationId;

  const mockUser = {
    id: mockUserId,
    organizationId: mockOrganizationId,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockPreference: UserPreference = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: mockUserId,
    organizationId: mockOrganizationId,
    dashboardLayout: [
      {
        id: 'appointments-calendar',
        x: 0,
        y: 0,
        w: 8,
        h: 4,
        visible: true,
      },
    ],
    themePreferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUserPreferenceRepository = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    };

    const mockUserRepositoryMock = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPreferencesService,
        {
          provide: UserPreferenceRepository,
          useValue: mockUserPreferenceRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserPreferencesService>(UserPreferencesService);
    userPreferenceRepository = module.get(UserPreferenceRepository);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPreferences', () => {
    it('should return existing preferences', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      userPreferenceRepository.findByUserId.mockResolvedValue(mockPreference);

      const result = await service.getPreferences(mockUserId, mockOrganizationId);

      expect(result).toEqual(mockPreference);
      expect(userRepository.findById).toHaveBeenCalledWith(mockUserId, mockOrganizationId);
      expect(userPreferenceRepository.findByUserId).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId
      );
    });

    it('should create default preferences if none exist', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      userPreferenceRepository.findByUserId.mockResolvedValue(null);
      userPreferenceRepository.create.mockResolvedValue(mockPreference);

      const result = await service.getPreferences(mockUserId, mockOrganizationId);

      expect(result).toEqual(mockPreference);
      expect(userPreferenceRepository.create).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId,
        expect.objectContaining({
          dashboardLayout: expect.arrayContaining([
            expect.objectContaining({ id: 'appointments-calendar' }),
          ]),
          themePreferences: null,
        })
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getPreferences(mockUserId, mockOrganizationId)).rejects.toThrow(
        NotFoundException
      );

      expect(userPreferenceRepository.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    const updateDto = {
      dashboardLayout: [
        {
          id: 'test-section',
          x: 0,
          y: 0,
          w: 12,
          h: 6,
          visible: true,
        },
      ],
    };

    it('should update existing preferences', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      const updatedPreference = { ...mockPreference, ...updateDto };
      userPreferenceRepository.upsert.mockResolvedValue(updatedPreference);

      const result = await service.updatePreferences(mockUserId, mockOrganizationId, updateDto);

      expect(result).toEqual(updatedPreference);
      expect(userPreferenceRepository.upsert).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId,
        expect.objectContaining({
          dashboardLayout: updateDto.dashboardLayout,
        })
      );
    });

    it('should create preferences if none exist (upsert pattern)', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      const newPreference = { ...mockPreference, ...updateDto };
      userPreferenceRepository.upsert.mockResolvedValue(newPreference);

      const result = await service.updatePreferences(mockUserId, mockOrganizationId, updateDto);

      expect(result).toEqual(newPreference);
      expect(userPreferenceRepository.upsert).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId,
        expect.any(Object)
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updatePreferences(mockUserId, mockOrganizationId, updateDto)
      ).rejects.toThrow(NotFoundException);

      expect(userPreferenceRepository.upsert).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      const partialUpdate = {
        themePreferences: {
          mode: 'dark' as const,
        },
      };
      const updatedPreference = { ...mockPreference, ...partialUpdate };
      userPreferenceRepository.upsert.mockResolvedValue(updatedPreference);

      const result = await service.updatePreferences(
        mockUserId,
        mockOrganizationId,
        partialUpdate
      );

      expect(result).toEqual(updatedPreference);
      expect(userPreferenceRepository.upsert).toHaveBeenCalledWith(
        mockUserId,
        mockOrganizationId,
        expect.objectContaining({
          themePreferences: partialUpdate.themePreferences,
        })
      );
    });
  });
});
