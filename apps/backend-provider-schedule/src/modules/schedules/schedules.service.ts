import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  ProviderSchedule,
  ProviderScheduleDocument,
  ProviderAbsence,
  ProviderAbsenceDocument,
  DayOfWeek,
} from './entities';
import {
  UpdateScheduleDto,
  CreateAbsenceDto,
  CheckAvailabilityDto,
  ValidateAvailabilityDto,
  GetAvailableSlotsDto,
  ScheduleResponseDto,
  AbsenceResponseDto,
  AvailabilityResponseDto,
  AvailableSlotsResponseDto,
} from './dto';

/**
 * Provider Schedule Service
 *
 * Handles all business logic for provider schedules and absences.
 * Includes conflict detection, availability validation, and schedule management.
 */
@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @InjectModel(ProviderSchedule.name)
    private readonly scheduleModel: Model<ProviderScheduleDocument>,
    @InjectModel(ProviderAbsence.name)
    private readonly absenceModel: Model<ProviderAbsenceDocument>,
  ) {}

  /**
   * Get provider schedule with absences
   */
  async getProviderSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
  ): Promise<{ schedule: ScheduleResponseDto; absences: AbsenceResponseDto[] }> {
    this.logger.log(`Getting schedule for provider ${providerId} in tenant ${tenantId}`);

    // Find schedule
    const schedule = await this.scheduleModel
      .findOne({
        providerId,
        tenantId,
        organizationId,
      })
      .lean()
      .exec();

    if (!schedule) {
      throw new NotFoundException(`Schedule not found for provider ${providerId}`);
    }

    // Find active absences (not cancelled or rejected)
    const absences = await this.absenceModel
      .find({
        providerId,
        tenantId,
        organizationId,
        status: { $in: ['pending', 'approved'] },
        end: { $gte: new Date() }, // Only future absences
      })
      .sort({ start: 1 })
      .lean()
      .exec();

    return {
      schedule: this.mapScheduleToDto(schedule as unknown as ProviderSchedule),
      absences: absences.map((absence) =>
        this.mapAbsenceToDto(absence as unknown as ProviderAbsence),
      ),
    };
  }

  /**
   * Update provider schedule
   */
  async updateProviderSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(`Updating schedule for provider ${providerId} in tenant ${tenantId}`);

    // Validate working hours
    this.validateWeeklyHours(dto.weeklyHours);

    // Find existing schedule or create new one
    let schedule = await this.scheduleModel
      .findOne({
        providerId,
        tenantId,
        organizationId,
      })
      .exec();

    if (schedule) {
      // Update existing schedule
      Object.assign(schedule, dto);
      await schedule.save();
    } else {
      // Create new schedule
      schedule = await this.scheduleModel.create({
        id: uuidv4(),
        providerId,
        tenantId,
        organizationId,
        ...dto,
      });
    }

    this.logger.log(`Schedule updated successfully for provider ${providerId}`);
    return this.mapScheduleToDto(schedule.toObject());
  }

  /**
   * Create provider absence
   */
  async createAbsence(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: CreateAbsenceDto,
    userId?: string,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(`Creating absence for provider ${providerId} in tenant ${tenantId}`);

    // Check for overlapping absences
    await this.checkOverlappingAbsences(providerId, tenantId, dto.start, dto.end);

    // Create absence record
    const absence = await this.absenceModel.create({
      id: uuidv4(),
      providerId,
      tenantId,
      organizationId,
      ...dto,
      status: 'pending',
      createdBy: userId,
    });

    this.logger.log(`Absence created successfully: ${absence.id}`);
    return this.mapAbsenceToDto(absence.toObject());
  }

  /**
   * Delete provider absence
   */
  async deleteAbsence(
    absenceId: string,
    providerId: string,
    tenantId: string,
    organizationId: string,
  ): Promise<void> {
    this.logger.log(`Deleting absence ${absenceId} for provider ${providerId}`);

    const result = await this.absenceModel
      .deleteOne({
        id: absenceId,
        providerId,
        tenantId,
        organizationId,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Absence ${absenceId} not found`);
    }

    this.logger.log(`Absence ${absenceId} deleted successfully`);
  }

  /**
   * Check provider availability for a specific date
   */
  async checkAvailability(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: CheckAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(`Checking availability for provider ${providerId} on ${dto.date}`);

    // Get schedule
    const schedule = await this.scheduleModel
      .findOne({
        providerId,
        tenantId,
        organizationId,
        isActive: true,
      })
      .lean()
      .exec();

    if (!schedule) {
      return {
        isAvailable: false,
        reason: 'Provider schedule not found',
      };
    }

    // Get day of week
    const dayOfWeek = this.getDayOfWeek(dto.date);

    // Check if provider works on this day
    const dailyHours = schedule.weeklyHours[dayOfWeek];
    if (!dailyHours || dailyHours.length === 0) {
      return {
        isAvailable: false,
        reason: `Provider does not work on ${dayOfWeek}`,
      };
    }

    // Check for absences on this date
    const startOfDay = new Date(dto.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dto.date);
    endOfDay.setHours(23, 59, 59, 999);

    const absences = await this.absenceModel
      .find({
        providerId,
        tenantId,
        organizationId,
        status: 'approved',
        start: { $lte: endOfDay },
        end: { $gte: startOfDay },
      })
      .lean()
      .exec();

    if (absences.length > 0) {
      return {
        isAvailable: false,
        reason: `Provider is unavailable (${absences[0].type})`,
      };
    }

    // Calculate available slots
    const availableSlots = this.calculateAvailableSlots(dto.date, dailyHours, schedule.breaks);

    return {
      isAvailable: true,
      availableSlots,
    };
  }

  /**
   * Validate availability for appointment booking (internal API)
   */
  async validateAvailability(
    tenantId: string,
    organizationId: string,
    dto: ValidateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    this.logger.log(
      `Validating availability for provider ${dto.providerId} from ${dto.start} to ${dto.end}`,
    );

    // Get schedule
    const schedule = await this.scheduleModel
      .findOne({
        providerId: dto.providerId,
        tenantId,
        organizationId,
        isActive: true,
        locationIds: dto.locationId,
      })
      .lean()
      .exec();

    if (!schedule) {
      return {
        isAvailable: false,
        reason: 'Provider schedule not found or does not work at this location',
      };
    }

    // Get day of week
    const dayOfWeek = this.getDayOfWeek(dto.start);

    // Check if provider works on this day
    const dailyHours = schedule.weeklyHours[dayOfWeek];
    if (!dailyHours || dailyHours.length === 0) {
      return {
        isAvailable: false,
        reason: `Provider does not work on ${dayOfWeek}`,
      };
    }

    // Check if requested time is within working hours
    const requestedStartTime = this.formatTime(dto.start);
    const requestedEndTime = this.formatTime(dto.end);

    const isWithinWorkingHours = dailyHours.some((slot) => {
      return requestedStartTime >= slot.start && requestedEndTime <= slot.end;
    });

    if (!isWithinWorkingHours) {
      return {
        isAvailable: false,
        reason: 'Requested time is outside provider working hours',
      };
    }

    // Check for breaks
    if (schedule.breaks && schedule.breaks.length > 0) {
      for (const breakPeriod of schedule.breaks) {
        if (breakPeriod.days.includes(dayOfWeek)) {
          const breakStart = breakPeriod.start;
          const breakEnd = breakPeriod.end;

          // Check if appointment overlaps with break
          if (
            (requestedStartTime >= breakStart && requestedStartTime < breakEnd) ||
            (requestedEndTime > breakStart && requestedEndTime <= breakEnd) ||
            (requestedStartTime <= breakStart && requestedEndTime >= breakEnd)
          ) {
            return {
              isAvailable: false,
              reason: `Requested time conflicts with break: ${breakPeriod.name}`,
            };
          }
        }
      }
    }

    // Check for absences
    const absences = await this.absenceModel
      .find({
        providerId: dto.providerId,
        tenantId,
        organizationId,
        status: 'approved',
        start: { $lte: dto.end },
        end: { $gte: dto.start },
      })
      .lean()
      .exec();

    if (absences.length > 0) {
      return {
        isAvailable: false,
        reason: `Provider is unavailable (${absences[0].type})`,
      };
    }

    return {
      isAvailable: true,
    };
  }

  /**
   * Get next N available slots for a provider (internal API)
   *
   * Used by the appointment booking UI to display available time slots.
   * Calculates slots based on:
   * - Provider's weekly schedule
   * - Breaks
   * - Absences
   * - Requested duration
   *
   * IMPORTANT SCHEDULING CONSIDERATIONS:
   * - Slots are returned in chronological order
   * - Duration determines slot length (e.g., 30 min, 60 min)
   * - Slots respect buffer times if configured
   * - Only returns slots within provider's working hours
   * - Excludes slots that overlap with absences
   *
   * @param dto - GetAvailableSlotsDto with provider, date, duration, count
   * @returns AvailableSlotsResponseDto with array of available slots
   */
  async getAvailableSlots(dto: GetAvailableSlotsDto): Promise<AvailableSlotsResponseDto> {
    this.logger.log(
      `Getting ${dto.count} available slots for provider ${dto.providerId} ` +
        `starting from ${dto.date} with duration ${dto.duration}min`,
    );

    // Get provider schedule
    const schedule = await this.scheduleModel
      .findOne({
        providerId: dto.providerId,
        tenantId: dto.tenantId,
        organizationId: dto.organizationId,
        isActive: true,
        locationIds: dto.locationId,
      })
      .lean()
      .exec();

    if (!schedule) {
      this.logger.warn(
        `Schedule not found for provider ${dto.providerId} at location ${dto.locationId}`,
      );
      return { slots: [], hasMore: false };
    }

    const slots: { start: Date; end: Date }[] = [];
    const maxDaysToSearch = 30; // Limit search to 30 days ahead
    const currentDate = new Date(dto.date);
    currentDate.setHours(0, 0, 0, 0);

    // Search for available slots across multiple days
    for (let dayOffset = 0; dayOffset < maxDaysToSearch && slots.length < dto.count; dayOffset++) {
      const searchDate = new Date(currentDate);
      searchDate.setDate(searchDate.getDate() + dayOffset);

      const dayOfWeek = this.getDayOfWeek(searchDate);
      const dailyHours = schedule.weeklyHours[dayOfWeek];

      // Skip days when provider doesn't work
      if (!dailyHours || dailyHours.length === 0) {
        continue;
      }

      // Check for absences on this day
      const startOfDay = new Date(searchDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDate);
      endOfDay.setHours(23, 59, 59, 999);

      const absences = await this.absenceModel
        .find({
          providerId: dto.providerId,
          tenantId: dto.tenantId,
          organizationId: dto.organizationId,
          status: 'approved',
          start: { $lte: endOfDay },
          end: { $gte: startOfDay },
        })
        .lean()
        .exec();

      // Get available time blocks for this day (excluding breaks)
      const availableBlocks = this.calculateAvailableSlots(
        searchDate,
        dailyHours,
        schedule.breaks || [],
      );

      // For each available block, generate slots of requested duration
      for (const block of availableBlocks) {
        let slotStart = new Date(block.start);

        // If searching the first day, skip past current time + buffer
        if (dayOffset === 0) {
          const now = new Date();
          const bufferMinutes = schedule.bufferTime || 0;
          const minimumStartTime = new Date(now.getTime() + bufferMinutes * 60000);

          if (slotStart < minimumStartTime) {
            // Round up to next slot boundary
            const minutesSinceBlockStart =
              (minimumStartTime.getTime() - block.start.getTime()) / 60000;
            const slotsToSkip = Math.ceil(minutesSinceBlockStart / dto.duration);
            slotStart = new Date(block.start.getTime() + slotsToSkip * dto.duration * 60000);
          }
        }

        // Generate slots within this block
        while (slots.length < dto.count) {
          const slotEnd = new Date(slotStart.getTime() + dto.duration * 60000);

          // Check if slot fits within block
          if (slotEnd > block.end) {
            break;
          }

          // Check if slot overlaps with any absence
          const hasAbsenceConflict = absences.some((absence) => {
            const absenceStart = new Date(absence.start);
            const absenceEnd = new Date(absence.end);
            return slotStart < absenceEnd && slotEnd > absenceStart;
          });

          if (!hasAbsenceConflict) {
            slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
          }

          // Move to next slot
          slotStart = new Date(slotStart.getTime() + dto.duration * 60000);
        }

        if (slots.length >= dto.count) {
          break;
        }
      }
    }

    this.logger.log(`Found ${slots.length} available slots for provider ${dto.providerId}`);

    return {
      slots,
      hasMore: slots.length >= dto.count,
      provider: {
        id: dto.providerId,
      },
    };
  }

  /**
   * Check for overlapping absences
   */
  private async checkOverlappingAbsences(
    providerId: string,
    tenantId: string,
    start: Date,
    end: Date,
    excludeId?: string,
  ): Promise<void> {
    const query: Record<string, unknown> = {
      providerId,
      tenantId,
      status: { $in: ['pending', 'approved'] },
      start: { $lt: end },
      end: { $gt: start },
    };

    if (excludeId) {
      query.id = { $ne: excludeId };
    }

    const overlapping = await this.absenceModel.findOne(query).lean().exec();

    if (overlapping) {
      throw new ConflictException(
        `Absence overlaps with existing absence from ${overlapping.start} to ${overlapping.end}`,
      );
    }
  }

  /**
   * Validate weekly hours format
   */
  private validateWeeklyHours(weeklyHours: Record<string, { start: string; end: string }[]>) {
    for (const [day, slots] of Object.entries(weeklyHours)) {
      if (!slots || slots.length === 0) continue;

      // Check for overlapping slots on the same day
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          if (
            (slots[i].start >= slots[j].start && slots[i].start < slots[j].end) ||
            (slots[i].end > slots[j].start && slots[i].end <= slots[j].end) ||
            (slots[i].start <= slots[j].start && slots[i].end >= slots[j].end)
          ) {
            throw new ConflictException(`Overlapping time slots on ${day}`);
          }
        }
      }
    }
  }

  /**
   * Get day of week from date
   */
  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];
    return days[date.getDay()];
  }

  /**
   * Format date to HH:mm time string
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calculate available time slots for a day
   */
  private calculateAvailableSlots(
    date: Date,
    dailyHours: { start: string; end: string }[],
    breaks: { name: string; start: string; end: string; days: DayOfWeek[] }[] = [],
  ): { start: Date; end: Date }[] {
    const dayOfWeek = this.getDayOfWeek(date);
    const slots: { start: Date; end: Date }[] = [];

    for (const slot of dailyHours) {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMin, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMin, 0, 0);

      // Check for breaks in this slot
      const applicableBreaks = breaks.filter((b) => b.days.includes(dayOfWeek));

      if (applicableBreaks.length === 0) {
        slots.push({ start: slotStart, end: slotEnd });
      } else {
        // Split slot around breaks
        let currentStart = slotStart;

        for (const breakPeriod of applicableBreaks) {
          const [breakStartHour, breakStartMin] = breakPeriod.start.split(':').map(Number);
          const [breakEndHour, breakEndMin] = breakPeriod.end.split(':').map(Number);

          const breakStart = new Date(date);
          breakStart.setHours(breakStartHour, breakStartMin, 0, 0);

          const breakEnd = new Date(date);
          breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);

          if (breakStart > currentStart && breakStart < slotEnd) {
            // Add slot before break
            slots.push({ start: currentStart, end: breakStart });
            currentStart = breakEnd;
          }
        }

        // Add remaining slot after last break
        if (currentStart < slotEnd) {
          slots.push({ start: currentStart, end: slotEnd });
        }
      }
    }

    return slots;
  }

  /**
   * Map schedule entity to DTO
   */
  private mapScheduleToDto(schedule: ProviderSchedule): ScheduleResponseDto {
    return {
      id: schedule.id,
      tenantId: schedule.tenantId,
      organizationId: schedule.organizationId,
      providerId: schedule.providerId,
      weeklyHours: schedule.weeklyHours,
      breaks: schedule.breaks || [],
      locationIds: schedule.locationIds,
      defaultAppointmentDuration: schedule.defaultAppointmentDuration,
      bufferTime: schedule.bufferTime,
      maxPatientsPerDay: schedule.maxPatientsPerDay,
      isActive: schedule.isActive,
      effectiveFrom: schedule.effectiveFrom,
      effectiveTo: schedule.effectiveTo,
      notes: schedule.notes,
      createdAt: schedule.createdAt!,
      updatedAt: schedule.updatedAt!,
    };
  }

  /**
   * Map absence entity to DTO
   */
  private mapAbsenceToDto(absence: ProviderAbsence): AbsenceResponseDto {
    return {
      id: absence.id,
      tenantId: absence.tenantId,
      organizationId: absence.organizationId,
      providerId: absence.providerId,
      start: absence.start,
      end: absence.end,
      type: absence.type,
      status: absence.status,
      reason: absence.reason,
      isAllDay: absence.isAllDay,
      isRecurring: absence.isRecurring,
      recurrenceRule: absence.recurrenceRule,
      createdBy: absence.createdBy,
      approvedBy: absence.approvedBy,
      approvedAt: absence.approvedAt,
      approvalNotes: absence.approvalNotes,
      createdAt: absence.createdAt!,
      updatedAt: absence.updatedAt!,
    };
  }
}
