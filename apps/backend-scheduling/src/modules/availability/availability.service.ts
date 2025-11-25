import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { AppointmentsRepository } from '../appointments/repositories/appointments.repository';
import { SearchAvailabilityDto, AvailabilityResponse, TimeSlot } from '../appointments/dto';

/**
 * Provider working hours configuration
 * In production, this would come from a configuration service or database
 */
interface WorkingHours {
  start: number; // Hour of day (0-23)
  end: number; // Hour of day (0-23)
  breakStart?: number;
  breakEnd?: number;
}

const DEFAULT_WORKING_HOURS: WorkingHours = {
  start: 8,
  end: 17,
  breakStart: 12,
  breakEnd: 13,
};

/**
 * Availability Service
 *
 * Calculates provider availability by:
 * 1. Fetching existing appointments
 * 2. Applying working hours constraints
 * 3. Generating available time slots
 * 4. Caching results in Redis for performance
 *
 * Performance target: <150ms for availability search
 */
@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);
  private readonly CACHE_TTL = 60; // 60 seconds
  private readonly CACHE_KEY_PREFIX = 'availability';

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  /**
   * Search for available time slots for a provider
   */
  async searchAvailability(
    tenantId: string,
    dto: SearchAvailabilityDto,
  ): Promise<AvailabilityResponse> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = this.buildCacheKey(tenantId, dto);
    const cached = await this.cacheManager.get<AvailabilityResponse>(cacheKey);

    if (cached) {
      this.logger.debug('Availability cache hit', {
        cacheKey,
        duration: Date.now() - startTime,
      });
      return { ...cached, cached: true };
    }

    // Calculate availability
    const slots = await this.calculateAvailability(tenantId, dto);

    const response: AvailabilityResponse = {
      providerId: dto.providerId,
      date: dto.date,
      slots,
      totalAvailable: slots.filter((s) => s.available).length,
      cached: false,
    };

    // Cache the result
    await this.cacheManager.set(cacheKey, response, this.CACHE_TTL * 1000);

    const duration = Date.now() - startTime;
    this.logger.debug('Availability calculated', {
      providerId: dto.providerId,
      date: dto.date,
      totalSlots: slots.length,
      availableSlots: response.totalAvailable,
      duration,
      performanceTarget: duration < 150 ? 'MET' : 'EXCEEDED',
    });

    return response;
  }

  /**
   * Calculate availability by finding gaps in schedule
   */
  private async calculateAvailability(
    tenantId: string,
    dto: SearchAvailabilityDto,
  ): Promise<TimeSlot[]> {
    const { providerId, date, durationMinutes } = dto;

    // Get start and end of day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Fetch existing appointments for the day
    const appointments = await this.appointmentsRepository.findByProviderAndDateRange(
      tenantId,
      providerId,
      dayStart,
      dayEnd,
    );

    // Get working hours (in production, fetch from provider schedule)
    const workingHours = DEFAULT_WORKING_HOURS;

    // Generate time slots
    const slots: TimeSlot[] = [];
    const slotDuration = durationMinutes;
    const slotInterval = 15; // 15-minute intervals

    // Create slots for working hours
    const workStart = new Date(date);
    workStart.setHours(workingHours.start, 0, 0, 0);

    const workEnd = new Date(date);
    workEnd.setHours(workingHours.end, 0, 0, 0);

    const currentSlotStart = new Date(workStart);

    while (currentSlotStart < workEnd) {
      const slotEnd = new Date(currentSlotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      // Check if slot exceeds working hours
      if (slotEnd > workEnd) {
        break;
      }

      // Check if slot is during break time
      if (this.isDuringBreak(currentSlotStart, slotEnd, workingHours)) {
        slots.push({
          start: new Date(currentSlotStart),
          end: new Date(slotEnd),
          available: false,
          reason: 'Break time',
        });
      } else if (this.hasConflict(currentSlotStart, slotEnd, appointments)) {
        // Check for conflicts with existing appointments
        slots.push({
          start: new Date(currentSlotStart),
          end: new Date(slotEnd),
          available: false,
          reason: 'Already booked',
        });
      } else if (currentSlotStart < new Date()) {
        // Slot is in the past
        slots.push({
          start: new Date(currentSlotStart),
          end: new Date(slotEnd),
          available: false,
          reason: 'Past time',
        });
      } else {
        // Slot is available
        slots.push({
          start: new Date(currentSlotStart),
          end: new Date(slotEnd),
          available: true,
        });
      }

      // Move to next slot
      currentSlotStart.setMinutes(currentSlotStart.getMinutes() + slotInterval);
    }

    return slots;
  }

  /**
   * Check if a time slot is during break time
   */
  private isDuringBreak(slotStart: Date, slotEnd: Date, workingHours: WorkingHours): boolean {
    if (!workingHours.breakStart || !workingHours.breakEnd) {
      return false;
    }

    const slotStartHour = slotStart.getHours() + slotStart.getMinutes() / 60;
    const slotEndHour = slotEnd.getHours() + slotEnd.getMinutes() / 60;

    return (
      (slotStartHour >= workingHours.breakStart && slotStartHour < workingHours.breakEnd) ||
      (slotEndHour > workingHours.breakStart && slotEndHour <= workingHours.breakEnd) ||
      (slotStartHour <= workingHours.breakStart && slotEndHour >= workingHours.breakEnd)
    );
  }

  /**
   * Check if a time slot conflicts with existing appointments
   */
  private hasConflict(
    slotStart: Date,
    slotEnd: Date,
    appointments: Array<{ start: Date; end: Date }>,
  ): boolean {
    return appointments.some((apt) => {
      return (
        (slotStart >= apt.start && slotStart < apt.end) || // Slot starts during appointment
        (slotEnd > apt.start && slotEnd <= apt.end) || // Slot ends during appointment
        (slotStart <= apt.start && slotEnd >= apt.end) // Slot contains appointment
      );
    });
  }

  /**
   * Build cache key for availability search
   */
  private buildCacheKey(tenantId: string, dto: SearchAvailabilityDto): string {
    const dateStr = dto.date.toISOString().split('T')[0];
    return `${this.CACHE_KEY_PREFIX}:${tenantId}:${dto.providerId}:${dateStr}:${dto.durationMinutes}`;
  }

  /**
   * Invalidate availability cache for a provider on a specific date
   * Called when appointments are created, updated, or cancelled
   */
  async invalidateCache(tenantId: string, providerId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    // We'd need to invalidate all duration variations, but for simplicity:
    const patterns = [15, 30, 60, 90, 120];

    await Promise.all(
      patterns.map((duration) => {
        const key = `${this.CACHE_KEY_PREFIX}:${tenantId}:${providerId}:${dateStr}:${duration}`;
        return this.cacheManager.del(key);
      }),
    );

    this.logger.debug('Availability cache invalidated', {
      tenantId,
      providerId,
      date: dateStr,
    });
  }
}
