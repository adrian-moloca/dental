import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { SchedulesService } from '../../../../src/modules/schedules/schedules.service';
import {
  ProviderSchedule,
  ProviderAbsence,
  ScheduleException,
  DayOfWeek,
  AbsenceStatus,
  ExceptionType,
} from '../../../../src/modules/schedules/entities';
import { CacheService } from '../../../../src/common/cache/cache.service';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let scheduleModel: Model<ProviderSchedule>;
  let absenceModel: Model<ProviderAbsence>;
  let exceptionModel: Model<ScheduleException>;
  let cacheService: CacheService;
  let eventEmitter: EventEmitter2;

  const mockSchedule = {
    id: 'schedule-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    providerId: 'provider-1',
    clinicId: 'clinic-1',
    timezone: 'Europe/Bucharest',
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
    status: AbsenceStatus.APPROVED,
    isAllDay: true,
    isRecurring: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
    save: vi.fn().mockResolvedValue(this),
  };

  const mockException = {
    id: 'exception-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    providerId: 'provider-1',
    clinicId: null,
    date: new Date('2025-12-25'),
    type: ExceptionType.HOLIDAY,
    hours: null,
    reason: 'Christmas Holiday',
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: function () {
      return { ...this };
    },
  };

  let mockCacheService: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    delPattern: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    // Create fresh mocks for each test
    mockCacheService = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
      delPattern: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
      ],
      providers: [
        SchedulesService,
        {
          provide: getModelToken(ProviderSchedule.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            findOneAndUpdate: vi.fn(),
            deleteOne: vi.fn(),
          },
        },
        {
          provide: getModelToken(ProviderAbsence.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            findOneAndUpdate: vi.fn(),
            deleteOne: vi.fn(),
            countDocuments: vi.fn(),
          },
        },
        {
          provide: getModelToken(ScheduleException.name),
          useValue: {
            findOne: vi.fn(),
            find: vi.fn(),
            create: vi.fn(),
            findOneAndUpdate: vi.fn(),
            deleteOne: vi.fn(),
            deleteMany: vi.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<SchedulesService>(SchedulesService);
    scheduleModel = module.get<Model<ProviderSchedule>>(getModelToken(ProviderSchedule.name));
    absenceModel = module.get<Model<ProviderAbsence>>(getModelToken(ProviderAbsence.name));
    exceptionModel = module.get<Model<ScheduleException>>(getModelToken(ScheduleException.name));
    cacheService = module.get<CacheService>(CacheService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Reset and spy on emit after getting the real instance
    if (eventEmitter && eventEmitter.emit) {
      vi.spyOn(eventEmitter, 'emit');
    }
  });

  // ============================================================================
  // SCHEDULE CRUD TESTS
  // ============================================================================

  describe('createSchedule', () => {
    it('should create a new schedule successfully', async () => {
      // Arrange
      const createDto = {
        clinicId: 'clinic-1',
        timezone: 'Europe/Bucharest',
        weeklyHours: mockSchedule.weeklyHours,
        breaks: mockSchedule.breaks,
        locationIds: ['location-1'],
        defaultAppointmentDuration: 30,
        bufferTime: 5,
        isActive: true,
      };

      vi.spyOn(scheduleModel, 'findOne').mockResolvedValue(null);
      vi.spyOn(scheduleModel, 'create').mockResolvedValue({
        ...mockSchedule,
        toObject: () => mockSchedule,
      } as never);

      // Act
      const result = await service.createSchedule('provider-1', 'tenant-1', 'org-1', createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.providerId).toBe('provider-1');
      expect(result.clinicId).toBe('clinic-1');
      expect(scheduleModel.create).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('schedule.created', expect.any(Object));
      expect(cacheService.delPattern).toHaveBeenCalled();
    });

    it('should throw ConflictException when schedule already exists', async () => {
      // Arrange
      const createDto = {
        clinicId: 'clinic-1',
        weeklyHours: mockSchedule.weeklyHours,
        locationIds: ['location-1'],
      };

      vi.spyOn(scheduleModel, 'findOne').mockResolvedValue(mockSchedule as never);

      // Act & Assert
      await expect(
        service.createSchedule('provider-1', 'tenant-1', 'org-1', createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException for overlapping time slots', async () => {
      // Arrange
      const createDto = {
        clinicId: 'clinic-1',
        weeklyHours: {
          monday: [
            { start: '09:00', end: '13:00' },
            { start: '12:00', end: '17:00' }, // Overlaps with first slot
          ],
        },
        locationIds: ['location-1'],
      };

      vi.spyOn(scheduleModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createSchedule('provider-1', 'tenant-1', 'org-1', createDto),
      ).rejects.toThrow(ConflictException);
    });
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

    it('should return schedule filtered by clinicId', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as never);

      // Act
      const result = await service.getProviderSchedule('provider-1', 'tenant-1', 'org-1', 'clinic-1');

      // Assert
      expect(result.schedule.clinicId).toBe('clinic-1');
      expect(scheduleModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ clinicId: 'clinic-1' }),
      );
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
    it('should update existing schedule', async () => {
      // Arrange
      const updateDto = {
        weeklyHours: { monday: [{ start: '08:00', end: '16:00' }] },
        bufferTime: 10,
      };

      vi.spyOn(scheduleModel, 'findOneAndUpdate').mockResolvedValue({
        ...mockSchedule,
        ...updateDto,
        toObject: () => ({ ...mockSchedule, ...updateDto }),
      } as never);

      // Act
      const result = await service.updateProviderSchedule(
        'provider-1',
        'tenant-1',
        'org-1',
        'clinic-1',
        updateDto,
      );

      // Assert
      expect(result).toBeDefined();
      expect(scheduleModel.findOneAndUpdate).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('schedule.updated', expect.any(Object));
    });

    it('should throw NotFoundException when schedule not found', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'findOneAndUpdate').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProviderSchedule('provider-1', 'tenant-1', 'org-1', 'clinic-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule successfully', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as never);

      // Act
      await service.deleteSchedule('provider-1', 'tenant-1', 'org-1', 'clinic-1');

      // Assert
      expect(scheduleModel.deleteOne).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('schedule.deleted', expect.any(Object));
    });

    it('should throw NotFoundException when schedule not found', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'deleteOne').mockResolvedValue({ deletedCount: 0 } as never);

      // Act & Assert
      await expect(
        service.deleteSchedule('provider-1', 'tenant-1', 'org-1', 'clinic-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // EXCEPTION MANAGEMENT TESTS
  // ============================================================================

  describe('createException', () => {
    it('should create a holiday exception (day off)', async () => {
      // Arrange
      const createDto = {
        date: new Date('2025-12-25'),
        type: 'holiday' as const,
        reason: 'Christmas Holiday',
      };

      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(null);
      vi.spyOn(exceptionModel, 'create').mockResolvedValue({
        ...mockException,
        toObject: () => mockException,
      } as never);

      // Act
      const result = await service.createException(
        'provider-1',
        'tenant-1',
        'org-1',
        createDto,
        'user-1',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('holiday');
      expect(exceptionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'holiday',
          hours: null,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith('exception.created', expect.any(Object));
    });

    it('should create an override exception with custom hours', async () => {
      // Arrange
      const createDto = {
        date: new Date('2025-12-24'),
        type: 'override' as const,
        hours: [{ start: '09:00', end: '14:00' }],
        reason: 'Christmas Eve - early close',
      };

      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(null);
      vi.spyOn(exceptionModel, 'create').mockResolvedValue({
        ...mockException,
        type: ExceptionType.OVERRIDE,
        hours: createDto.hours,
        toObject: () => ({
          ...mockException,
          type: ExceptionType.OVERRIDE,
          hours: createDto.hours,
        }),
      } as never);

      // Act
      const result = await service.createException(
        'provider-1',
        'tenant-1',
        'org-1',
        createDto,
        'user-1',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('override');
      expect(result.hours).toHaveLength(1);
    });

    it('should throw ConflictException when exception already exists for date', async () => {
      // Arrange
      const createDto = {
        date: new Date('2025-12-25'),
        type: 'holiday' as const,
      };

      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(mockException as never);

      // Act & Assert
      await expect(
        service.createException('provider-1', 'tenant-1', 'org-1', createDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid override hours', async () => {
      // Arrange
      const createDto = {
        date: new Date('2025-12-24'),
        type: 'override' as const,
        hours: [{ start: '14:00', end: '09:00' }], // Invalid - end before start
      };

      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createException('provider-1', 'tenant-1', 'org-1', createDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getExceptions', () => {
    it('should return all exceptions for a provider', async () => {
      // Arrange
      vi.spyOn(exceptionModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([mockException]),
          }),
        }),
      } as never);

      // Act
      const result = await service.getExceptions('provider-1', 'tenant-1', 'org-1');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('holiday');
    });

    it('should filter exceptions by date range', async () => {
      // Arrange
      const startDate = new Date('2025-12-01');
      const endDate = new Date('2025-12-31');

      vi.spyOn(exceptionModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue([mockException]),
          }),
        }),
      } as never);

      // Act
      await service.getExceptions('provider-1', 'tenant-1', 'org-1', startDate, endDate);

      // Assert
      expect(exceptionModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.objectContaining({
            $gte: startDate,
            $lte: endDate,
          }),
        }),
      );
    });
  });

  describe('updateException', () => {
    it('should update exception successfully', async () => {
      // Arrange
      const updateDto = {
        reason: 'Updated reason',
      };

      vi.spyOn(exceptionModel, 'findOneAndUpdate').mockResolvedValue({
        ...mockException,
        reason: 'Updated reason',
        toObject: () => ({ ...mockException, reason: 'Updated reason' }),
      } as never);

      // Act
      const result = await service.updateException(
        'exception-1',
        'provider-1',
        'tenant-1',
        updateDto,
      );

      // Assert
      expect(result.reason).toBe('Updated reason');
    });

    it('should throw NotFoundException when exception not found', async () => {
      // Arrange
      vi.spyOn(exceptionModel, 'findOneAndUpdate').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateException('exception-1', 'provider-1', 'tenant-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteException', () => {
    it('should delete exception successfully', async () => {
      // Arrange
      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(mockException as never);
      vi.spyOn(exceptionModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as never);

      // Act
      await service.deleteException('exception-1', 'provider-1', 'tenant-1');

      // Assert
      expect(exceptionModel.deleteOne).toHaveBeenCalledWith({ id: 'exception-1' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('exception.deleted', expect.any(Object));
    });

    it('should throw NotFoundException when exception not found', async () => {
      // Arrange
      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteException('exception-1', 'provider-1', 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // ABSENCE WORKFLOW TESTS
  // ============================================================================

  describe('createAbsence', () => {
    it('should create absence successfully with pending status', async () => {
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
        status: AbsenceStatus.PENDING,
        toObject: () => ({
          ...mockAbsence,
          ...createDto,
          status: AbsenceStatus.PENDING,
        }),
      } as never);

      // Act
      const result = await service.createAbsence('provider-1', 'tenant-1', 'org-1', createDto, 'user-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.providerId).toBe('provider-1');
      expect(result.status).toBe('pending');
      expect(eventEmitter.emit).toHaveBeenCalledWith('absence.requested', expect.any(Object));
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

  describe('approveAbsence', () => {
    it('should approve pending absence and create exceptions', async () => {
      // Arrange
      const pendingAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.PENDING,
        save: vi.fn().mockResolvedValue({
          ...mockAbsence,
          status: AbsenceStatus.APPROVED,
          approvedBy: 'reviewer-1',
          approvedAt: new Date(),
          toObject: () => ({
            ...mockAbsence,
            status: AbsenceStatus.APPROVED,
            approvedBy: 'reviewer-1',
          }),
        }),
        toObject: () => mockAbsence,
      };

      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(pendingAbsence as never);
      vi.spyOn(exceptionModel, 'findOne').mockResolvedValue(null);
      vi.spyOn(exceptionModel, 'create').mockResolvedValue({} as never);

      // Act
      const result = await service.approveAbsence(
        'absence-1',
        'tenant-1',
        'reviewer-1',
        { approvalNotes: 'Approved for vacation' },
      );

      // Assert
      expect(pendingAbsence.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('absence.approved', expect.any(Object));
      expect(cacheService.delPattern).toHaveBeenCalled();
      // Should create exceptions for each day of absence
      expect(exceptionModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-pending absence', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.approveAbsence('absence-1', 'tenant-1', 'reviewer-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectAbsence', () => {
    it('should reject pending absence', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOneAndUpdate').mockResolvedValue({
        ...mockAbsence,
        status: AbsenceStatus.REJECTED,
        toObject: () => ({
          ...mockAbsence,
          status: AbsenceStatus.REJECTED,
        }),
      } as never);

      // Act
      const result = await service.rejectAbsence(
        'absence-1',
        'tenant-1',
        'reviewer-1',
        { rejectionReason: 'Staffing conflicts' },
      );

      // Assert
      expect(result.status).toBe('rejected');
      expect(eventEmitter.emit).toHaveBeenCalledWith('absence.rejected', expect.any(Object));
    });

    it('should throw NotFoundException when absence not found', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOneAndUpdate').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.rejectAbsence('absence-1', 'tenant-1', 'reviewer-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelAbsence', () => {
    it('should cancel pending absence', async () => {
      // Arrange
      const pendingAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.PENDING,
        save: vi.fn().mockResolvedValue({
          ...mockAbsence,
          status: AbsenceStatus.CANCELLED,
          toObject: () => ({
            ...mockAbsence,
            status: AbsenceStatus.CANCELLED,
          }),
        }),
        toObject: () => ({
          ...mockAbsence,
          status: AbsenceStatus.CANCELLED,
        }),
      };

      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(pendingAbsence as never);

      // Act
      const result = await service.cancelAbsence(
        'absence-1',
        'tenant-1',
        'user-1',
        { cancellationReason: 'Plans changed' },
      );

      // Assert
      expect(pendingAbsence.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('absence.cancelled', expect.any(Object));
    });

    it('should cancel approved absence and remove exceptions', async () => {
      // Arrange
      const approvedAbsence = {
        ...mockAbsence,
        status: AbsenceStatus.APPROVED,
        save: vi.fn().mockResolvedValue({
          ...mockAbsence,
          status: AbsenceStatus.CANCELLED,
          toObject: () => ({
            ...mockAbsence,
            status: AbsenceStatus.CANCELLED,
          }),
        }),
        toObject: () => ({
          ...mockAbsence,
          status: AbsenceStatus.CANCELLED,
        }),
      };

      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(approvedAbsence as never);
      vi.spyOn(exceptionModel, 'deleteMany').mockResolvedValue({} as never);

      // Act
      await service.cancelAbsence(
        'absence-1',
        'tenant-1',
        'user-1',
        { cancellationReason: 'Plans changed' },
      );

      // Assert
      expect(exceptionModel.deleteMany).toHaveBeenCalled();
      expect(cacheService.delPattern).toHaveBeenCalled();
    });

    it('should throw NotFoundException for cancelled or rejected absence', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.cancelAbsence('absence-1', 'tenant-1', 'user-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('queryAbsences', () => {
    it('should return paginated absences', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              lean: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue([mockAbsence]),
              }),
            }),
          }),
        }),
      } as never);

      vi.spyOn(absenceModel, 'countDocuments').mockResolvedValue(1);

      // Act
      const result = await service.queryAbsences('tenant-1', 'org-1', {
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should filter absences by status', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'find').mockReturnValue({
        sort: vi.fn().mockReturnValue({
          skip: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              lean: vi.fn().mockReturnValue({
                exec: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as never);

      vi.spyOn(absenceModel, 'countDocuments').mockResolvedValue(0);

      // Act
      await service.queryAbsences('tenant-1', 'org-1', {
        page: 1,
        limit: 10,
        status: 'pending',
      });

      // Assert
      expect(absenceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
      );
    });
  });

  describe('deleteAbsence', () => {
    it('should delete absence successfully', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOne').mockResolvedValue({
        ...mockAbsence,
        status: AbsenceStatus.PENDING,
      } as never);
      vi.spyOn(absenceModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as never);

      // Act
      await service.deleteAbsence('absence-1', 'provider-1', 'tenant-1', 'org-1');

      // Assert
      expect(absenceModel.deleteOne).toHaveBeenCalledWith({ id: 'absence-1' });
    });

    it('should delete approved absence and remove exceptions', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOne').mockResolvedValue({
        ...mockAbsence,
        status: AbsenceStatus.APPROVED,
      } as never);
      vi.spyOn(absenceModel, 'deleteOne').mockResolvedValue({ deletedCount: 1 } as never);
      vi.spyOn(exceptionModel, 'deleteMany').mockResolvedValue({} as never);

      // Act
      await service.deleteAbsence('absence-1', 'provider-1', 'tenant-1', 'org-1');

      // Assert
      expect(exceptionModel.deleteMany).toHaveBeenCalled();
    });

    it('should throw NotFoundException when absence not found', async () => {
      // Arrange
      vi.spyOn(absenceModel, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteAbsence('absence-1', 'provider-1', 'tenant-1', 'org-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ============================================================================
  // AVAILABILITY TESTS
  // ============================================================================

  describe('checkAvailability', () => {
    it('should return available with time slots', async () => {
      // Arrange
      const checkDate = new Date('2025-11-24'); // Monday

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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

    it('should return unavailable when there is a holiday exception', async () => {
      // Arrange
      const checkDate = new Date('2025-12-25');

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            ...mockException,
            hours: null, // Day off
          }),
        }),
      } as never);

      // Act
      const result = await service.checkAvailability('provider-1', 'tenant-1', 'org-1', {
        date: checkDate,
      });

      // Assert
      expect(result.isAvailable).toBe(false);
      expect(result.reason).toContain('unavailable');
      expect(result.reason).toContain('holiday');
    });

    it('should use override exception hours instead of weekly schedule', async () => {
      // Arrange
      const checkDate = new Date('2025-12-24');
      const overrideException = {
        ...mockException,
        type: ExceptionType.OVERRIDE,
        hours: [{ start: '09:00', end: '14:00' }],
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(overrideException),
        }),
      } as never);

      // Act
      const result = await service.checkAvailability('provider-1', 'tenant-1', 'org-1', {
        date: checkDate,
      });

      // Assert
      expect(result.isAvailable).toBe(true);
      expect(result.availableSlots).toBeDefined();
    });
  });

  describe('getAvailability', () => {
    it('should return cached result when available', async () => {
      // Arrange
      const cachedResult = {
        providerId: 'provider-1',
        isAvailable: true,
        timezone: 'Europe/Bucharest',
      };

      vi.spyOn(cacheService, 'get').mockResolvedValue(cachedResult);

      // Act
      const result = await service.getAvailability('provider-1', 'tenant-1', 'org-1', {
        date: new Date('2025-11-24'),
        duration: 30,
        timezone: 'Europe/Bucharest',
      });

      // Assert
      expect(result.cached).toBe(true);
      expect(cacheService.get).toHaveBeenCalled();
    });

    it('should calculate and cache availability when not cached', async () => {
      // Arrange
      vi.spyOn(cacheService, 'get').mockResolvedValue(null);
      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);
      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as never);
      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      // Act
      const result = await service.getAvailability('provider-1', 'tenant-1', 'org-1', {
        date: new Date('2025-11-24'),
        duration: 30,
        timezone: 'Europe/Bucharest',
      });

      // Assert
      expect(result.isAvailable).toBe(true);
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getAvailabilityRange', () => {
    it('should return availability for date range', async () => {
      // Arrange
      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);
      vi.spyOn(exceptionModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);
      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      // Act
      const result = await service.getAvailabilityRange('provider-1', 'tenant-1', 'org-1', {
        start: new Date('2025-11-24'),
        end: new Date('2025-11-28'),
        duration: 30,
        timezone: 'Europe/Bucharest',
      });

      // Assert
      expect(result.days).toHaveLength(5);
      expect(result.summary.totalDays).toBe(5);
      expect(result.summary.availableDays).toBeGreaterThan(0);
    });

    it('should throw BadRequestException when end date before start', async () => {
      // Act & Assert
      await expect(
        service.getAvailabilityRange('provider-1', 'tenant-1', 'org-1', {
          start: new Date('2025-11-28'),
          end: new Date('2025-11-24'),
          duration: 30,
          timezone: 'Europe/Bucharest',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when range exceeds 90 days', async () => {
      // Act & Assert
      await expect(
        service.getAvailabilityRange('provider-1', 'tenant-1', 'org-1', {
          start: new Date('2025-01-01'),
          end: new Date('2025-12-31'),
          duration: 30,
          timezone: 'Europe/Bucharest',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateAvailability', () => {
    it('should return available for valid time slot', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-24T10:00:00'),
        end: new Date('2025-11-24T11:00:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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
        start: new Date('2025-11-24T18:00:00'), // After 17:00
        end: new Date('2025-11-24T19:00:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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
        start: new Date('2025-11-24T12:00:00'), // During lunch break
        end: new Date('2025-11-24T12:30:00'),
        locationId: 'location-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
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
        start: new Date('2025-11-24T10:00:00'),
        end: new Date('2025-11-24T11:00:00'),
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

    it('should return unavailable for invalid location', async () => {
      // Arrange
      const validateDto = {
        providerId: 'provider-1',
        start: new Date('2025-11-24T10:00:00'),
        end: new Date('2025-11-24T11:00:00'),
        locationId: 'location-999', // Provider doesn't work at this location
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null), // No schedule for this location
        }),
      } as never);

      // Act
      const result = await service.validateAvailability('tenant-1', 'org-1', validateDto);

      // Assert
      expect(result.isAvailable).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    it('should return available slots for provider', async () => {
      // Arrange
      const dto = {
        providerId: 'provider-1',
        locationId: 'location-1',
        date: new Date('2025-11-24'),
        duration: 30,
        count: 5,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockSchedule),
        }),
      } as never);

      vi.spyOn(exceptionModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      vi.spyOn(absenceModel, 'find').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      // Act
      const result = await service.getAvailableSlots(dto);

      // Assert
      expect(result.slots).toBeDefined();
      expect(result.slots.length).toBeLessThanOrEqual(5);
      expect(result.provider.id).toBe('provider-1');
    });

    it('should return empty slots when schedule not found', async () => {
      // Arrange
      const dto = {
        providerId: 'provider-1',
        locationId: 'location-999',
        date: new Date('2025-11-24'),
        duration: 30,
        count: 5,
        tenantId: 'tenant-1',
        organizationId: 'org-1',
      };

      vi.spyOn(scheduleModel, 'findOne').mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      } as never);

      // Act
      const result = await service.getAvailableSlots(dto);

      // Assert
      expect(result.slots).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });
  });
});
