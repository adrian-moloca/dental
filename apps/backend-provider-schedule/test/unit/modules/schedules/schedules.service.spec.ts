import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { SchedulesService } from '../../../../src/modules/schedules/schedules.service';
import {
  ProviderSchedule,
  ProviderAbsence,
  DayOfWeek,
} from '../../../../src/modules/schedules/entities';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let scheduleModel: Model<ProviderSchedule>;
  let absenceModel: Model<ProviderAbsence>;

  const mockSchedule = {
    id: 'schedule-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    providerId: 'provider-1',
    weeklyHours: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
    },
    breaks: [
      {
        name: 'Lunch',
        start: '12:00',
        end: '13:00',
        days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
      },
    ],
    locationIds: ['location-1'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
  };

  const mockAbsence = {
    id: 'absence-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    providerId: 'provider-1',
    start: new Date('2025-12-01'),
    end: new Date('2025-12-05'),
    type: 'vacation',
    status: 'approved',
    isAllDay: true,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulesService,
        {
          provide: getModelToken(ProviderSchedule.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            deleteOne: vi.fn(),
          },
        },
        {
          provide: getModelToken(ProviderAbsence.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            deleteOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    scheduleModel = module.get<Model<ProviderSchedule>>(getModelToken(ProviderSchedule.name));
    absenceModel = module.get<Model<ProviderAbsence>>(getModelToken(ProviderAbsence.name));
  });

  describe('getProviderSchedule', () => {
    it('should return schedule with absences', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([mockAbsence]),
          }),
        }),
      } as never);

      // Act
      const result = await service.getProviderSchedule('provider-1', 'tenant-1', 'org-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.schedule).toBeDefined();
      expect(result.schedule.providerId).toBe('provider-1');
      expect(result.absences).toHaveLength(1);
      expect(result.absences[0].type).toBe('vacation');
    });

    it('should throw NotFoundException when schedule not found', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      // Act & Assert
      await expect(service.getProviderSchedule('provider-1', 'tenant-1', 'org-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProviderSchedule', () => {
    it('should create new schedule when not exists', async () => {
      // Arrange
      const updateDto = {
        weeklyHours: mockSchedule.weeklyHours,
        breaks: mockSchedule.breaks,
        locationIds: mockSchedule.locationIds,
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as never);

      vi.spyOn(scheduleModel, 'create').mockResolvedValue({
        toObject: () => mockSchedule,
      } as never);

      // Act
      const result = await service.updateProviderSchedule('provider-1', 'tenant-1', 'org-1', updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.providerId).toBe('provider-1');
      expect(scheduleModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: 'provider-1',
          tenantId: 'tenant-1',
          organizationId: 'org-1',
        }),
      );
    });

    it('should update existing schedule', async () => {
      // Arrange
      const updateDto = {
        weeklyHours: { monday: [{ start: '08:00', end: '16:00' }] },
        breaks: [],
        locationIds: ['location-2'],
      };

      const existingSchedule = {
        ...mockSchedule,
        save: vi.fn().mockResolvedValue(mockSchedule),
        toObject: () => mockSchedule,
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(existingSchedule),
      } as never);

      // Act
      const result = await service.updateProviderSchedule('provider-1', 'tenant-1', 'org-1', updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(existingSchedule.save).toHaveBeenCalled();
    });

    it('should throw ConflictException for overlapping time slots', async () => {
      // Arrange
      const updateDto = {
        weeklyHours: {
          monday: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '17:00' }, // Overlaps with first slot
          ],
        },
        breaks: [],
        locationIds: ['location-1'],
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      } as never);

      // Act & Assert
      await expect(
        service.updateProviderSchedule('provider-1', 'tenant-1', 'org-1', updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createAbsence', () => {
    it('should create absence successfully', async () => {
      // Arrange
      const createDto = {
        start: new Date('2025-12-10'),
        end: new Date('2025-12-15'),
        type: 'vacation' as const,
        isAllDay: true,
        isRecurring: false,
      };

      vi.spyOn(absenceModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      vi.spyOn(absenceModel, 'create').mockResolvedValue({
        ...mockAbsence,
        ...createDto,
        toObject: () => ({ ...mockAbsence, ...createDto }),
      } as never);

      // Act
      const result = await service.createAbsence('provider-1', 'tenant-1', 'org-1', createDto, 'user-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.providerId).toBe('provider-1');
      expect(result.type).toBe('vacation');
      expect(absenceModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: 'provider-1',
          tenantId: 'tenant-1',
          createdBy: 'user-1',
        }),
      );
    });

    it('should throw ConflictException for overlapping absences', async () => {
      // Arrange
      const createDto = {
        start: new Date('2025-12-01'),
        end: new Date('2025-12-05'),
        type: 'vacation' as const,
        isAllDay: true,
        isRecurring: false,
      };

      vi.spyOn(absenceModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockAbsence),
        }),
      } as never);

      // Act & Assert
      await expect(
        service.createAbsence('provider-1', 'tenant-1', 'org-1', createDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteAbsence', () => {
    it('should delete absence successfully', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'deleteOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 1 }),
      } as never);

      // Act
      await service.deleteAbsence('absence-1', 'provider-1', 'tenant-1', 'org-1');

      // Assert
      expect(absenceModel.deleteOne).toHaveBeenCalledWith({
        id: 'absence-1',
        providerId: 'provider-1',
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      });
    });

    it('should throw NotFoundException when absence not found', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'deleteOne').mockReturnValue({
        exec: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      } as never);

      // Act & Assert
      await expect(
        service.deleteAbsence('absence-1', 'provider-1', 'tenant-1', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability', () => {
    it('should return available with time slots', async () => {
      // Arrange
      const checkDate = new Date('2025-11-25'); // Monday

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      // Act
      const result = await service.checkAvailability('provider-1', 'tenant-1', 'org-1', {
        date: checkDate,
      });

      // Assert
      expect(result.isAvailable).toBe(true);
      expect(result.availableSlots).toBeDefined();
      expect(result.availableSlots!.length).toBeGreaterThan(0);
    });

    it('should return unavailable when provider does not work on that day', async () => {
      // Arrange
      const checkDate = new Date('2025-11-23'); // Sunday

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      // Act
      const result = await service.checkAvailability('provider-1', 'tenant-1', 'org-1', {
        date: checkDate,
      });

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('does not work');
    });

    it('should return unavailable when provider has absence', async () => {
      // Arrange
      const checkDate = new Date('2025-12-02');

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([mockAbsence]),
        }),
      } as never);

      // Act
      const result = await service.checkAvailability('provider-1', 'tenant-1', 'org-1', {
        date: checkDate,
      });

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('unavailable');
    });
  });

  describe('validateAvailability', () => {
    it('should return available for valid time slot', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-25T10:00:00'),
        end: new Date('2025-11-25T11:00:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      // Act
      const result = await service.validateAvailability('tenant-1', 'org-1', validateDto);

      // Assert
      expect(result.isAvailable).toBe(true);
    });

    it('should return unavailable for time outside working hours', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-25T18:00:00'), // After 17:00
        end: new Date('2025-11-25T19:00:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      // Act
      const result = await service.validateAvailability('tenant-1', 'org-1', validateDto);

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('outside provider working hours');
    });

    it('should return unavailable for time during break', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-25T12:00:00'), // During lunch break
        end: new Date('2025-11-25T12:30:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      // Act
      const result = await service.validateAvailability('tenant-1', 'org-1', validateDto);

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('break');
    });

    it('should return unavailable when schedule not found', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-25T10:00:00'),
        end: new Date('2025-11-25T11:00:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      // Act
      const result = await service.validateAvailability('tenant-1', 'org-1', validateDto);

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('schedule not found');
    });
  });
});
