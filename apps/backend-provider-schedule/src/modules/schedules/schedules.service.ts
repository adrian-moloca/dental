import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ProviderSchedule,
  ProviderScheduleDocument,
  ProviderAbsence,
  ProviderAbsenceDocument,
  ScheduleException,
  ScheduleExceptionDocument,
  DayOfWeek,
  AbsenceStatus,
  ExceptionType,
} from './entities';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  CreateAbsenceDto,
  CheckAvailabilityDto,
  ValidateAvailabilityDto,
  GetAvailableSlotsDto,
  ScheduleResponseDto,
  AbsenceResponseDto,
  AvailabilityResponseDto,
  AvailableSlotsResponseDto,
  CreateExceptionDto,
  UpdateExceptionDto,
  ExceptionResponseDto,
  ApproveAbsenceDto,
  QueryAbsencesDto,
  AbsenceListResponseDto,
  GetAvailabilityDto,
  GetAvailabilityRangeDto,
  AvailabilityCheckResponse,
  AvailabilityRangeResponse,
  DailyAvailability,
} from './dto';
import { CacheService } from '../../common/cache/cache.service';

/**
 * Provider Schedule Service
 *
 * ARCHITECTURAL OVERVIEW:
 * This service manages provider schedules, absences, and exceptions.
 * It implements a layered availability calculation:
 *
 * 1. BASE LAYER: Weekly schedule template (weeklyHours)
 *    - Defines recurring working hours for each day of week
 *    - Scoped per provider + clinic combination
 *
 * 2. EXCEPTION LAYER: Schedule exceptions
 *    - Date-specific overrides (holiday, vacation, sick, custom hours)
 *    - Takes precedence over weekly schedule
 *
 * 3. ABSENCE LAYER: Approved absences
 *    - Multi-day time off periods
 *    - Auto-generates exceptions when approved
 *
 * 4. APPOINTMENT LAYER: Existing appointments
 *    - Fetched from scheduling service
 *    - Subtracted from available time
 *
 * TIMEZONE HANDLING:
 * - All timestamps stored in UTC
 * - Weekly hours stored as HH:mm strings (local time)
 * - Timezone identifier stored per schedule
 * - Conversion happens at query time
 *
 * CACHING STRATEGY:
 * - Availability queries are cached with short TTL (30s)
 * - Cache invalidated on schedule/exception/absence changes
 * - Cache key includes tenant, provider, clinic, date
 */
@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  /** Cache TTL for availability queries in seconds */
  private readonly AVAILABILITY_CACHE_TTL = 30;

  /** Maximum days to search for available slots */
  private readonly MAX_SLOT_SEARCH_DAYS = 30;

  constructor(
    @InjectModel(ProviderSchedule.name)
    private readonly scheduleModel: Model<ProviderScheduleDocument>,
    @InjectModel(ProviderAbsence.name)
    private readonly absenceModel: Model<ProviderAbsenceDocument>,
    @InjectModel(ScheduleException.name)
    private readonly exceptionModel: Model<ScheduleExceptionDocument>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => CacheService))
    private readonly cacheService: CacheService,
  ) {}

  // ============================================================================
  // SCHEDULE TEMPLATE CRUD
  // ============================================================================

  /**
   * Create a new provider schedule for a clinic
   */
  async createSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(`Creating schedule for provider ${providerId} at clinic ${dto.clinicId}`);

    // Check for existing schedule at this clinic
    const existing = await this.scheduleModel.findOne({
      providerId,
      tenantId,
      clinicId: dto.clinicId,
    });

    if (existing) {
      throw new ConflictException(
        `Schedule already exists for provider ${providerId} at clinic ${dto.clinicId}`,
      );
    }

    // Validate weekly hours
    this.validateWeeklyHours(dto.weeklyHours);

    // Create schedule
    const schedule = await this.scheduleModel.create({
      id: uuidv4(),
      providerId,
      tenantId,
      organizationId,
      clinicId: dto.clinicId,
      timezone: dto.timezone,
      weeklyHours: dto.weeklyHours,
      breaks: dto.breaks || [],
      locationIds: dto.locationIds,
      defaultAppointmentDuration: dto.defaultAppointmentDuration,
      bufferTime: dto.bufferTime,
      maxPatientsPerDay: dto.maxPatientsPerDay,
      isActive: dto.isActive ?? true,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
      notes: dto.notes,
    });

    // Emit event
    this.eventEmitter.emit('schedule.created', {
      scheduleId: schedule.id,
      providerId,
      clinicId: dto.clinicId,
      tenantId,
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, dto.clinicId);

    this.logger.log(`Schedule created successfully: ${schedule.id}`);
    return this.mapScheduleToDto(schedule.toObject());
  }

  /**
   * Get provider schedule with absences for a specific clinic
   */
  async getProviderSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
    clinicId?: string,
  ): Promise<{ schedule: ScheduleResponseDto; absences: AbsenceResponseDto[] }> {
    this.logger.log(`Getting schedule for provider ${providerId} in tenant ${tenantId}`);

    // Find schedule
    const query: Record<string, unknown> = {
      providerId,
      tenantId,
      organizationId,
    };

    if (clinicId) {
      query.clinicId = clinicId;
    }

    const schedule = await this.scheduleModel.findOne(query).lean().exec();

    if (!schedule) {
      throw new NotFoundException(
        `Schedule not found for provider ${providerId}${clinicId ? ` at clinic ${clinicId}` : ''}`,
      );
    }

    // Find active absences (not cancelled or rejected)
    const absences = await this.absenceModel
      .find({
        providerId,
        tenantId,
        organizationId,
        status: { $in: [AbsenceStatus.PENDING, AbsenceStatus.APPROVED] },
        end: { $gte: new Date() },
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
   * Get all schedules for a provider (across all clinics)
   */
  async getProviderSchedules(
    providerId: string,
    tenantId: string,
    organizationId: string,
  ): Promise<ScheduleResponseDto[]> {
    const schedules = await this.scheduleModel
      .find({
        providerId,
        tenantId,
        organizationId,
      })
      .lean()
      .exec();

    return schedules.map((s) => this.mapScheduleToDto(s as unknown as ProviderSchedule));
  }

  /**
   * Update provider schedule
   */
  async updateProviderSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
    clinicId: string,
    dto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    this.logger.log(`Updating schedule for provider ${providerId} at clinic ${clinicId}`);

    // Validate working hours if provided
    if (dto.weeklyHours) {
      this.validateWeeklyHours(dto.weeklyHours);
    }

    // Find and update schedule
    const schedule = await this.scheduleModel.findOneAndUpdate(
      {
        providerId,
        tenantId,
        organizationId,
        clinicId,
      },
      { $set: dto },
      { new: true },
    );

    if (!schedule) {
      throw new NotFoundException(
        `Schedule not found for provider ${providerId} at clinic ${clinicId}`,
      );
    }

    // Emit event
    this.eventEmitter.emit('schedule.updated', {
      scheduleId: schedule.id,
      providerId,
      clinicId,
      tenantId,
      changes: Object.keys(dto),
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, clinicId);

    this.logger.log(`Schedule updated successfully: ${schedule.id}`);
    return this.mapScheduleToDto(schedule.toObject());
  }

  /**
   * Delete provider schedule
   */
  async deleteSchedule(
    providerId: string,
    tenantId: string,
    organizationId: string,
    clinicId: string,
  ): Promise<void> {
    const result = await this.scheduleModel.deleteOne({
      providerId,
      tenantId,
      organizationId,
      clinicId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Schedule not found for provider ${providerId} at clinic ${clinicId}`,
      );
    }

    // Emit event
    this.eventEmitter.emit('schedule.deleted', {
      providerId,
      clinicId,
      tenantId,
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, clinicId);

    this.logger.log(`Schedule deleted for provider ${providerId} at clinic ${clinicId}`);
  }

  // ============================================================================
  // EXCEPTION MANAGEMENT
  // ============================================================================

  /**
   * Create a schedule exception (date-specific override)
   */
  async createException(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: CreateExceptionDto,
    userId?: string,
  ): Promise<ExceptionResponseDto> {
    this.logger.log(`Creating exception for provider ${providerId} on ${dto.date.toISOString()}`);

    // Normalize date to start of day
    const normalizedDate = new Date(dto.date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Check for existing exception on this date
    const existing = await this.exceptionModel.findOne({
      providerId,
      tenantId,
      date: normalizedDate,
      clinicId: dto.clinicId || null,
    });

    if (existing) {
      throw new ConflictException(
        `Exception already exists for provider ${providerId} on ${normalizedDate.toISOString().split('T')[0]}`,
      );
    }

    // Validate hours if type is override
    if (dto.type === 'override' && dto.hours) {
      for (const slot of dto.hours) {
        if (slot.end <= slot.start) {
          throw new BadRequestException('Exception hour slot end time must be after start time');
        }
      }
    }

    // Create exception
    const exception = await this.exceptionModel.create({
      id: uuidv4(),
      providerId,
      tenantId,
      organizationId,
      clinicId: dto.clinicId || null,
      date: normalizedDate,
      type: dto.type,
      hours: dto.hours || null,
      reason: dto.reason,
      createdBy: userId,
    });

    // Emit event
    this.eventEmitter.emit('exception.created', {
      exceptionId: exception.id,
      providerId,
      date: normalizedDate,
      type: dto.type,
      tenantId,
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, dto.clinicId ?? undefined);

    this.logger.log(`Exception created successfully: ${exception.id}`);
    return this.mapExceptionToDto(exception.toObject());
  }

  /**
   * Get exceptions for a provider
   */
  async getExceptions(
    providerId: string,
    tenantId: string,
    organizationId: string,
    startDate?: Date,
    endDate?: Date,
    clinicId?: string,
  ): Promise<ExceptionResponseDto[]> {
    const query: Record<string, unknown> = {
      providerId,
      tenantId,
      organizationId,
    };

    if (clinicId) {
      query.$or = [{ clinicId }, { clinicId: null }];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        (query.date as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (query.date as Record<string, unknown>).$lte = endDate;
      }
    }

    const exceptions = await this.exceptionModel.find(query).sort({ date: 1 }).lean().exec();

    return exceptions.map((e) => this.mapExceptionToDto(e as unknown as ScheduleException));
  }

  /**
   * Update an exception
   */
  async updateException(
    exceptionId: string,
    providerId: string,
    tenantId: string,
    dto: UpdateExceptionDto,
  ): Promise<ExceptionResponseDto> {
    const exception = await this.exceptionModel.findOneAndUpdate(
      {
        id: exceptionId,
        providerId,
        tenantId,
      },
      { $set: dto },
      { new: true },
    );

    if (!exception) {
      throw new NotFoundException(`Exception ${exceptionId} not found`);
    }

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, exception.clinicId);

    return this.mapExceptionToDto(exception.toObject());
  }

  /**
   * Delete an exception
   */
  async deleteException(exceptionId: string, providerId: string, tenantId: string): Promise<void> {
    const exception = await this.exceptionModel.findOne({
      id: exceptionId,
      providerId,
      tenantId,
    });

    if (!exception) {
      throw new NotFoundException(`Exception ${exceptionId} not found`);
    }

    await this.exceptionModel.deleteOne({ id: exceptionId });

    // Emit event
    this.eventEmitter.emit('exception.deleted', {
      exceptionId,
      providerId,
      tenantId,
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId, exception.clinicId);

    this.logger.log(`Exception ${exceptionId} deleted successfully`);
  }

  // ============================================================================
  // ABSENCE MANAGEMENT WITH APPROVAL WORKFLOW
  // ============================================================================

  /**
   * Create provider absence request
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
      start: dto.start,
      end: dto.end,
      type: dto.type,
      status: AbsenceStatus.PENDING,
      reason: dto.reason,
      isAllDay: dto.isAllDay ?? true,
      isRecurring: dto.isRecurring ?? false,
      recurrenceRule: dto.recurrenceRule,
      createdBy: userId,
    });

    // Emit event
    this.eventEmitter.emit('absence.requested', {
      absenceId: absence.id,
      providerId,
      tenantId,
      type: dto.type,
      start: dto.start,
      end: dto.end,
    });

    this.logger.log(`Absence created successfully: ${absence.id}`);
    return this.mapAbsenceToDto(absence.toObject());
  }

  /**
   * Approve an absence request
   *
   * SIDE EFFECTS:
   * - Changes status to 'approved'
   * - Creates schedule exceptions for each day of the absence
   * - Emits absence.approved event (for appointment conflict detection)
   */
  async approveAbsence(
    absenceId: string,
    tenantId: string,
    reviewerId: string,
    dto: ApproveAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    this.logger.log(`Approving absence ${absenceId}`);

    const absence = await this.absenceModel.findOne({
      id: absenceId,
      tenantId,
      status: AbsenceStatus.PENDING,
    });

    if (!absence) {
      throw new NotFoundException(`Pending absence ${absenceId} not found`);
    }

    // Update absence status
    absence.status = AbsenceStatus.APPROVED;
    absence.approvedBy = reviewerId;
    absence.approvedAt = new Date();
    absence.approvalNotes = dto.approvalNotes;
    await absence.save();

    // Create schedule exceptions for each day
    await this.createExceptionsForAbsence(absence);

    // Emit event
    this.eventEmitter.emit('absence.approved', {
      absenceId: absence.id,
      providerId: absence.providerId,
      tenantId,
      start: absence.start,
      end: absence.end,
      type: absence.type,
    });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, absence.providerId);

    this.logger.log(`Absence ${absenceId} approved successfully`);
    return this.mapAbsenceToDto(absence.toObject());
  }

  /**
   * Reject an absence request
   */
  async rejectAbsence(
    absenceId: string,
    tenantId: string,
    reviewerId: string,
    dto: { rejectionReason?: string },
  ): Promise<AbsenceResponseDto> {
    this.logger.log(`Rejecting absence ${absenceId}`);

    const absence = await this.absenceModel.findOneAndUpdate(
      {
        id: absenceId,
        tenantId,
        status: AbsenceStatus.PENDING,
      },
      {
        $set: {
          status: AbsenceStatus.REJECTED,
          approvedBy: reviewerId,
          approvedAt: new Date(),
          approvalNotes: dto.rejectionReason,
        },
      },
      { new: true },
    );

    if (!absence) {
      throw new NotFoundException(`Pending absence ${absenceId} not found`);
    }

    // Emit event
    this.eventEmitter.emit('absence.rejected', {
      absenceId: absence.id,
      providerId: absence.providerId,
      tenantId,
      reason: dto.rejectionReason,
    });

    this.logger.log(`Absence ${absenceId} rejected`);
    return this.mapAbsenceToDto(absence.toObject());
  }

  /**
   * Cancel an absence (by provider or manager)
   */
  async cancelAbsence(
    absenceId: string,
    tenantId: string,
    _cancelledBy: string,
    dto: { cancellationReason?: string },
  ): Promise<AbsenceResponseDto> {
    this.logger.log(`Cancelling absence ${absenceId}`);

    const absence = await this.absenceModel.findOne({
      id: absenceId,
      tenantId,
      status: { $in: [AbsenceStatus.PENDING, AbsenceStatus.APPROVED] },
    });

    if (!absence) {
      throw new NotFoundException(`Active absence ${absenceId} not found`);
    }

    const wasApproved = absence.status === AbsenceStatus.APPROVED;

    // Update absence
    absence.status = AbsenceStatus.CANCELLED;
    absence.approvalNotes = dto.cancellationReason;
    await absence.save();

    // If was approved, remove associated exceptions
    if (wasApproved) {
      await this.removeExceptionsForAbsence(absence);
    }

    // Emit event
    this.eventEmitter.emit('absence.cancelled', {
      absenceId: absence.id,
      providerId: absence.providerId,
      tenantId,
      wasApproved,
    });

    // Invalidate cache if was approved
    if (wasApproved) {
      await this.invalidateAvailabilityCache(tenantId, absence.providerId);
    }

    this.logger.log(`Absence ${absenceId} cancelled`);
    return this.mapAbsenceToDto(absence.toObject());
  }

  /**
   * Query absences with filters
   */
  async queryAbsences(
    tenantId: string,
    organizationId: string,
    dto: QueryAbsencesDto,
  ): Promise<AbsenceListResponseDto> {
    const query: Record<string, unknown> = {
      tenantId,
      organizationId,
    };

    if (dto.status) {
      query.status = dto.status;
    }

    if (dto.type) {
      query.type = dto.type;
    }

    if (dto.providerId) {
      query.providerId = dto.providerId;
    }

    if (!dto.includePast) {
      query.end = { $gte: new Date() };
    }

    if (dto.startDate || dto.endDate) {
      if (!dto.includePast) {
        query.$and = [{ end: { $gte: new Date() } }];
      }
      if (dto.startDate) {
        query.start = { ...((query.start as object) || {}), $gte: dto.startDate };
      }
      if (dto.endDate) {
        query.end = { ...((query.end as object) || {}), $lte: dto.endDate };
      }
    }

    const skip = (dto.page - 1) * dto.limit;

    const [absences, total] = await Promise.all([
      this.absenceModel.find(query).sort({ start: 1 }).skip(skip).limit(dto.limit).lean().exec(),
      this.absenceModel.countDocuments(query),
    ]);

    return {
      data: absences.map((a) => ({
        ...this.mapAbsenceToDto(a as unknown as ProviderAbsence),
        providerName: undefined, // Would be populated via join/lookup
      })),
      pagination: {
        page: dto.page,
        limit: dto.limit,
        total,
        totalPages: Math.ceil(total / dto.limit),
      },
    };
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

    const absence = await this.absenceModel.findOne({
      id: absenceId,
      providerId,
      tenantId,
      organizationId,
    });

    if (!absence) {
      throw new NotFoundException(`Absence ${absenceId} not found`);
    }

    // If approved, remove associated exceptions
    if (absence.status === AbsenceStatus.APPROVED) {
      await this.removeExceptionsForAbsence(absence);
    }

    await this.absenceModel.deleteOne({ id: absenceId });

    // Invalidate cache
    await this.invalidateAvailabilityCache(tenantId, providerId);

    this.logger.log(`Absence ${absenceId} deleted successfully`);
  }

  // ============================================================================
  // AVAILABILITY CALCULATION
  // ============================================================================

  /**
   * Check provider availability for a specific date
   *
   * ALGORITHM:
   * 1. Check if date is within schedule effective range
   * 2. Get weekly schedule for the day of week
   * 3. Check for date-specific exceptions
   * 4. Check for approved absences
   * 5. Calculate available time blocks (schedule - breaks - exceptions)
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

    // Check effective date range
    if (schedule.effectiveFrom && dto.date < schedule.effectiveFrom) {
      return {
        isAvailable: false,
        reason: 'Date is before schedule effective date',
      };
    }
    if (schedule.effectiveTo && dto.date > schedule.effectiveTo) {
      return {
        isAvailable: false,
        reason: 'Date is after schedule effective date',
      };
    }

    // Get day of week
    const dayOfWeek = this.getDayOfWeek(dto.date);

    // Check for exception on this date
    const exception = await this.getExceptionForDate(providerId, tenantId, dto.date);

    if (exception) {
      // Exception takes precedence
      if (!exception.hours || exception.hours.length === 0) {
        return {
          isAvailable: false,
          reason: `Provider is unavailable (${exception.type})`,
        };
      }
      // Use exception hours instead of weekly schedule
      const availableSlots = this.calculateAvailableSlots(dto.date, exception.hours, []);
      return {
        isAvailable: true,
        availableSlots,
      };
    }

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
        status: AbsenceStatus.APPROVED,
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
    const availableSlots = this.calculateAvailableSlots(
      dto.date,
      dailyHours,
      schedule.breaks || [],
    );

    return {
      isAvailable: true,
      availableSlots,
    };
  }

  /**
   * Get availability for a date (public API)
   */
  async getAvailability(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: GetAvailabilityDto,
  ): Promise<AvailabilityCheckResponse> {
    // Try cache first
    const cacheKey = this.buildAvailabilityCacheKey(tenantId, providerId, dto.clinicId, dto.date);

    const cached = await this.cacheService.get<AvailabilityCheckResponse>(cacheKey);
    if (cached) {
      return { ...cached, cached: true, cachedAt: new Date() };
    }

    // Calculate availability
    const schedule = await this.scheduleModel
      .findOne({
        providerId,
        tenantId,
        organizationId,
        isActive: true,
        ...(dto.clinicId && { clinicId: dto.clinicId }),
      })
      .lean()
      .exec();

    if (!schedule) {
      const result: AvailabilityCheckResponse = {
        providerId,
        clinicId: dto.clinicId,
        isAvailable: false,
        reason: 'Provider schedule not found',
        timezone: dto.timezone,
      };
      return result;
    }

    const dayOfWeek = this.getDayOfWeek(dto.date);
    const dailyHours = schedule.weeklyHours[dayOfWeek];

    // Check for exception
    const exception = await this.getExceptionForDate(providerId, tenantId, dto.date, dto.clinicId);

    let workingHours = dailyHours;

    if (exception) {
      if (!exception.hours || exception.hours.length === 0) {
        const result: AvailabilityCheckResponse = {
          providerId,
          clinicId: dto.clinicId,
          isAvailable: false,
          reason: `Provider is unavailable (${exception.type})`,
          timezone: dto.timezone,
        };
        await this.cacheService.set(cacheKey, result, { ttl: this.AVAILABILITY_CACHE_TTL });
        return result;
      }
      workingHours = exception.hours;
    } else if (!dailyHours || dailyHours.length === 0) {
      const result: AvailabilityCheckResponse = {
        providerId,
        clinicId: dto.clinicId,
        isAvailable: false,
        reason: `Provider does not work on ${dayOfWeek}`,
        timezone: dto.timezone,
      };
      await this.cacheService.set(cacheKey, result, { ttl: this.AVAILABILITY_CACHE_TTL });
      return result;
    }

    // Check for absences
    const startOfDay = new Date(dto.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dto.date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const absences = await this.absenceModel
      .find({
        providerId,
        tenantId,
        status: AbsenceStatus.APPROVED,
        start: { $lte: endOfDay },
        end: { $gte: startOfDay },
      })
      .lean()
      .exec();

    if (absences.length > 0) {
      const result: AvailabilityCheckResponse = {
        providerId,
        clinicId: dto.clinicId,
        isAvailable: false,
        reason: `Provider is unavailable (${absences[0].type})`,
        timezone: dto.timezone,
      };
      await this.cacheService.set(cacheKey, result, { ttl: this.AVAILABILITY_CACHE_TTL });
      return result;
    }

    // Calculate available slots
    const availableSlots = this.calculateAvailableSlots(
      dto.date,
      workingHours || [],
      schedule.breaks || [],
    );

    // Filter by minimum duration
    const filteredSlots = availableSlots.filter((slot) => {
      const durationMs = slot.end.getTime() - slot.start.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      return durationMinutes >= dto.duration;
    });

    const result: AvailabilityCheckResponse = {
      providerId,
      clinicId: dto.clinicId,
      isAvailable: filteredSlots.length > 0,
      reason: filteredSlots.length === 0 ? 'No slots available for requested duration' : undefined,
      availableSlots: filteredSlots.map((s) => ({
        start: s.start,
        end: s.end,
        durationMinutes: (s.end.getTime() - s.start.getTime()) / (1000 * 60),
      })),
      workingHours: workingHours?.map((h) => ({ start: h.start, end: h.end })),
      timezone: dto.timezone,
    };

    // Cache result
    await this.cacheService.set(cacheKey, result, { ttl: this.AVAILABILITY_CACHE_TTL });

    return result;
  }

  /**
   * Get availability for a date range
   */
  async getAvailabilityRange(
    providerId: string,
    tenantId: string,
    organizationId: string,
    dto: GetAvailabilityRangeDto,
  ): Promise<AvailabilityRangeResponse> {
    // Validate date range
    if (dto.end < dto.start) {
      throw new BadRequestException('End date must be after start date');
    }

    const daysDiff = Math.ceil((dto.end.getTime() - dto.start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      throw new BadRequestException('Date range cannot exceed 90 days');
    }

    const days: DailyAvailability[] = [];
    let totalSlots = 0;
    let totalAvailableMinutes = 0;
    let availableDays = 0;

    // Get schedule once
    const schedule = await this.scheduleModel
      .findOne({
        providerId,
        tenantId,
        organizationId,
        isActive: true,
        ...(dto.clinicId && { clinicId: dto.clinicId }),
      })
      .lean()
      .exec();

    // Pre-fetch exceptions for the range
    const exceptions = await this.exceptionModel
      .find({
        providerId,
        tenantId,
        date: { $gte: dto.start, $lte: dto.end },
        $or: dto.clinicId
          ? [{ clinicId: dto.clinicId }, { clinicId: null }]
          : [{ clinicId: { $exists: true } }, { clinicId: null }],
      })
      .lean()
      .exec();

    const exceptionMap = new Map<string, ScheduleException>();
    for (const exc of exceptions) {
      const dateKey = exc.date.toISOString().split('T')[0];
      exceptionMap.set(dateKey, exc as unknown as ScheduleException);
    }

    // Pre-fetch absences for the range
    const absences = await this.absenceModel
      .find({
        providerId,
        tenantId,
        status: AbsenceStatus.APPROVED,
        start: { $lte: dto.end },
        end: { $gte: dto.start },
      })
      .lean()
      .exec();

    // Process each day
    const currentDate = new Date(dto.start);
    while (currentDate <= dto.end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = this.getDayOfWeek(currentDate);

      const dayAvailability: DailyAvailability = {
        date: dateStr,
        dayOfWeek,
        isAvailable: false,
      };

      // Check if schedule exists
      if (!schedule) {
        dayAvailability.unavailableReason = 'No schedule configured';
        days.push(dayAvailability);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Check for exception
      const exception = exceptionMap.get(dateStr);
      if (exception) {
        if (!exception.hours || exception.hours.length === 0) {
          dayAvailability.unavailableReason = `Provider is unavailable (${exception.type})`;
          days.push(dayAvailability);
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        dayAvailability.workingHours = exception.hours;
      } else {
        const dailyHours = schedule.weeklyHours[dayOfWeek];
        if (!dailyHours || dailyHours.length === 0) {
          dayAvailability.unavailableReason = `Provider does not work on ${dayOfWeek}`;
          days.push(dayAvailability);
          currentDate.setDate(currentDate.getDate() + 1);
          continue;
        }
        dayAvailability.workingHours = dailyHours;
      }

      // Check for absences
      const dayStart = new Date(currentDate);
      dayStart.setUTCHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const hasAbsence = absences.some(
        (a) => new Date(a.start) <= dayEnd && new Date(a.end) >= dayStart,
      );

      if (hasAbsence) {
        const absence = absences.find(
          (a) => new Date(a.start) <= dayEnd && new Date(a.end) >= dayStart,
        );
        dayAvailability.unavailableReason = `Provider is unavailable (${absence?.type})`;
        days.push(dayAvailability);
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Calculate available slots
      const slots = this.calculateAvailableSlots(
        currentDate,
        dayAvailability.workingHours || [],
        schedule.breaks || [],
      );

      // Filter by duration
      const filteredSlots = slots.filter((slot) => {
        const durationMinutes = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
        return durationMinutes >= dto.duration;
      });

      if (filteredSlots.length > 0) {
        dayAvailability.isAvailable = true;
        dayAvailability.availableSlots = filteredSlots.map((s) => ({
          start: s.start,
          end: s.end,
          durationMinutes: (s.end.getTime() - s.start.getTime()) / (1000 * 60),
        }));
        dayAvailability.totalAvailableMinutes = filteredSlots.reduce(
          (sum, s) => sum + (s.end.getTime() - s.start.getTime()) / (1000 * 60),
          0,
        );

        totalSlots += filteredSlots.length;
        totalAvailableMinutes += dayAvailability.totalAvailableMinutes;
        availableDays++;
      }

      days.push(dayAvailability);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      providerId,
      clinicId: dto.clinicId,
      startDate: dto.start.toISOString().split('T')[0],
      endDate: dto.end.toISOString().split('T')[0],
      days,
      summary: {
        totalDays: days.length,
        availableDays,
        totalSlots,
        totalAvailableMinutes,
      },
      timezone: dto.timezone,
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

    // Check for exception on this date
    const exception = await this.getExceptionForDate(
      dto.providerId,
      tenantId,
      dto.start,
      schedule.clinicId,
    );

    let dailyHours = schedule.weeklyHours[dayOfWeek];

    if (exception) {
      if (!exception.hours || exception.hours.length === 0) {
        return {
          isAvailable: false,
          reason: `Provider is unavailable (${exception.type})`,
        };
      }
      dailyHours = exception.hours;
    }

    // Check if provider works on this day
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
        status: AbsenceStatus.APPROVED,
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
    const currentDate = new Date(dto.date);
    currentDate.setHours(0, 0, 0, 0);

    // Pre-fetch exceptions for the search range
    const searchEndDate = new Date(currentDate);
    searchEndDate.setDate(searchEndDate.getDate() + this.MAX_SLOT_SEARCH_DAYS);

    const exceptions = await this.exceptionModel
      .find({
        providerId: dto.providerId,
        tenantId: dto.tenantId,
        date: { $gte: currentDate, $lte: searchEndDate },
        $or: [{ clinicId: schedule.clinicId }, { clinicId: null }],
      })
      .lean()
      .exec();

    const exceptionMap = new Map<string, ScheduleException>();
    for (const exc of exceptions) {
      const dateKey = exc.date.toISOString().split('T')[0];
      exceptionMap.set(dateKey, exc as unknown as ScheduleException);
    }

    // Search for available slots across multiple days
    for (
      let dayOffset = 0;
      dayOffset < this.MAX_SLOT_SEARCH_DAYS && slots.length < dto.count;
      dayOffset++
    ) {
      const searchDate = new Date(currentDate);
      searchDate.setDate(searchDate.getDate() + dayOffset);
      const dateKey = searchDate.toISOString().split('T')[0];

      const dayOfWeek = this.getDayOfWeek(searchDate);

      // Check for exception
      const exception = exceptionMap.get(dateKey);
      let dailyHours = schedule.weeklyHours[dayOfWeek];

      if (exception) {
        if (!exception.hours || exception.hours.length === 0) {
          continue; // Day off
        }
        dailyHours = exception.hours;
      } else if (!dailyHours || dailyHours.length === 0) {
        continue; // Provider doesn't work this day
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
          status: AbsenceStatus.APPROVED,
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

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

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
      status: { $in: [AbsenceStatus.PENDING, AbsenceStatus.APPROVED] },
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
   * Get exception for a specific date
   */
  private async getExceptionForDate(
    providerId: string,
    tenantId: string,
    date: Date,
    clinicId?: string,
  ): Promise<ScheduleException | null> {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const query: Record<string, unknown> = {
      providerId,
      tenantId,
      date: normalizedDate,
    };

    if (clinicId) {
      query.$or = [{ clinicId }, { clinicId: null }];
    }

    const exception = await this.exceptionModel.findOne(query).lean().exec();
    return exception as unknown as ScheduleException | null;
  }

  /**
   * Create schedule exceptions for each day of an absence
   */
  private async createExceptionsForAbsence(absence: ProviderAbsenceDocument): Promise<void> {
    const currentDate = new Date(absence.start);
    currentDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(absence.end);
    endDate.setUTCHours(0, 0, 0, 0);

    const exceptionType = this.mapAbsenceTypeToExceptionType(absence.type);

    while (currentDate <= endDate) {
      // Check if exception already exists
      const existing = await this.exceptionModel.findOne({
        providerId: absence.providerId,
        tenantId: absence.tenantId,
        date: new Date(currentDate),
      });

      if (!existing) {
        await this.exceptionModel.create({
          id: uuidv4(),
          providerId: absence.providerId,
          tenantId: absence.tenantId,
          organizationId: absence.organizationId,
          date: new Date(currentDate),
          type: exceptionType,
          hours: null, // All day off
          reason: `Auto-created from absence: ${absence.reason || absence.type}`,
          createdBy: absence.approvedBy,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  /**
   * Remove schedule exceptions created for an absence
   */
  private async removeExceptionsForAbsence(absence: ProviderAbsenceDocument): Promise<void> {
    const startDate = new Date(absence.start);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(absence.end);
    endDate.setUTCHours(0, 0, 0, 0);

    await this.exceptionModel.deleteMany({
      providerId: absence.providerId,
      tenantId: absence.tenantId,
      date: { $gte: startDate, $lte: endDate },
      reason: { $regex: /^Auto-created from absence/ },
    });
  }

  /**
   * Map absence type to exception type
   */
  private mapAbsenceTypeToExceptionType(absenceType: string): ExceptionType {
    const mapping: Record<string, ExceptionType> = {
      vacation: ExceptionType.VACATION,
      sick: ExceptionType.SICK,
      conference: ExceptionType.TRAINING,
      training: ExceptionType.TRAINING,
      personal: ExceptionType.VACATION,
      emergency: ExceptionType.SICK,
      other: ExceptionType.VACATION,
    };
    return mapping[absenceType] || ExceptionType.VACATION;
  }

  /**
   * Validate weekly hours format
   */
  private validateWeeklyHours(weeklyHours: Record<string, { start: string; end: string }[]>): void {
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
      const applicableBreaks = breaks
        .filter((b) => b.days.includes(dayOfWeek))
        .sort((a, b) => a.start.localeCompare(b.start));

      if (applicableBreaks.length === 0) {
        slots.push({ start: slotStart, end: slotEnd });
      } else {
        // Split slot around breaks
        let currentStart = new Date(slotStart);

        for (const breakPeriod of applicableBreaks) {
          const [breakStartHour, breakStartMin] = breakPeriod.start.split(':').map(Number);
          const [breakEndHour, breakEndMin] = breakPeriod.end.split(':').map(Number);

          const breakStart = new Date(date);
          breakStart.setHours(breakStartHour, breakStartMin, 0, 0);

          const breakEnd = new Date(date);
          breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);

          if (breakStart > currentStart && breakStart < slotEnd) {
            // Add slot before break
            if (currentStart < breakStart) {
              slots.push({ start: new Date(currentStart), end: new Date(breakStart) });
            }
            currentStart = new Date(breakEnd);
          }
        }

        // Add remaining slot after last break
        if (currentStart < slotEnd) {
          slots.push({ start: new Date(currentStart), end: new Date(slotEnd) });
        }
      }
    }

    return slots;
  }

  /**
   * Build cache key for availability
   */
  private buildAvailabilityCacheKey(
    tenantId: string,
    providerId: string,
    clinicId?: string,
    date?: Date,
  ): string {
    const dateStr = date ? date.toISOString().split('T')[0] : 'all';
    return `availability:${tenantId}:${providerId}:${clinicId || 'all'}:${dateStr}`;
  }

  /**
   * Invalidate availability cache
   */
  private async invalidateAvailabilityCache(
    tenantId: string,
    providerId: string,
    clinicId?: string,
  ): Promise<void> {
    const pattern = `availability:${tenantId}:${providerId}:${clinicId || '*'}:*`;
    await this.cacheService.delPattern(pattern);
  }

  // ============================================================================
  // DTO MAPPING
  // ============================================================================

  /**
   * Map schedule entity to DTO
   */
  private mapScheduleToDto(schedule: ProviderSchedule): ScheduleResponseDto {
    return {
      id: schedule.id,
      tenantId: schedule.tenantId,
      organizationId: schedule.organizationId,
      providerId: schedule.providerId,
      clinicId: schedule.clinicId,
      timezone: schedule.timezone || 'Europe/Bucharest',
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

  /**
   * Map exception entity to DTO
   */
  private mapExceptionToDto(exception: ScheduleException): ExceptionResponseDto {
    return {
      id: exception.id,
      tenantId: exception.tenantId,
      organizationId: exception.organizationId,
      providerId: exception.providerId,
      clinicId: exception.clinicId,
      date: exception.date,
      type: exception.type as 'holiday' | 'vacation' | 'sick' | 'training' | 'override',
      hours: exception.hours,
      reason: exception.reason,
      createdBy: exception.createdBy,
      createdAt: exception.createdAt!,
      updatedAt: exception.updatedAt!,
    };
  }
}
