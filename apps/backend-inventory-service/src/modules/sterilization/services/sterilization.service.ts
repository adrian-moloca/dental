import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  SterilizationCycleStatus,
  InstrumentStatus,
} from '@dentalos/shared-domain';

import { SterilizationCycle } from '../schemas/sterilization-cycle.schema';
import { Instrument } from '../schemas/instrument.schema';
import {
  CreateSterilizationCycleDto,
  CompleteCycleDto,
  CreateInstrumentDto,
} from '../dto';

export interface TenantContext {
  tenantId: string;
  organizationId: string;
  clinicId: string;
  userId: string;
}

@Injectable()
export class SterilizationService {
  private readonly logger = new Logger(SterilizationService.name);

  constructor(
    @InjectModel(SterilizationCycle.name)
    private readonly cycleModel: Model<SterilizationCycle>,
    @InjectModel(Instrument.name)
    private readonly instrumentModel: Model<Instrument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ==================== Sterilization Cycle Methods ====================

  async createCycle(
    dto: CreateSterilizationCycleDto,
    context: TenantContext,
  ): Promise<SterilizationCycle> {
    const cycleNumber = await this.generateCycleNumber(context);

    const instrumentIds = dto.instrumentIds?.map((id) => new Types.ObjectId(id)) || [];

    // Update instruments to IN_STERILIZATION status
    if (instrumentIds.length > 0) {
      await this.instrumentModel.updateMany(
        { _id: { $in: instrumentIds }, tenantId: context.tenantId },
        {
          $set: {
            status: InstrumentStatus.IN_STERILIZATION,
            updatedBy: context.userId,
          },
        },
      );
    }

    const cycle = new this.cycleModel({
      cycleNumber,
      type: dto.type,
      status: SterilizationCycleStatus.PENDING,
      autoclaveId: dto.autoclaveId,
      operatorId: context.userId,
      instruments: instrumentIds,
      instrumentCount: instrumentIds.length,
      temperature: dto.temperature,
      pressure: dto.pressure,
      durationMinutes: dto.durationMinutes,
      notes: dto.notes,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.userId,
    });

    const saved = await cycle.save();

    this.eventEmitter.emit('sterilization.cycle.created', {
      cycleId: saved._id.toString(),
      cycleNumber: saved.cycleNumber,
      instrumentCount: saved.instrumentCount,
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    });

    this.logger.log(
      `Created sterilization cycle ${cycleNumber} with ${instrumentIds.length} instruments`,
    );

    return saved;
  }

  async startCycle(
    cycleId: string,
    context: TenantContext,
  ): Promise<SterilizationCycle> {
    const cycle = await this.getCycleById(cycleId, context);

    if (cycle.status !== SterilizationCycleStatus.PENDING) {
      throw new BadRequestException(
        `Cannot start cycle with status ${cycle.status}`,
      );
    }

    cycle.status = SterilizationCycleStatus.RUNNING;
    cycle.startedAt = new Date();
    cycle.updatedBy = context.userId;

    const saved = await cycle.save();

    this.eventEmitter.emit('sterilization.cycle.started', {
      cycleId: saved._id.toString(),
      cycleNumber: saved.cycleNumber,
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    });

    this.logger.log(`Started sterilization cycle ${cycle.cycleNumber}`);

    return saved;
  }

  async completeCycle(
    cycleId: string,
    dto: CompleteCycleDto,
    context: TenantContext,
  ): Promise<SterilizationCycle> {
    const cycle = await this.getCycleById(cycleId, context);

    if (cycle.status !== SterilizationCycleStatus.RUNNING) {
      throw new BadRequestException(
        `Cannot complete cycle with status ${cycle.status}`,
      );
    }

    if (!dto.passed && !dto.failureReason) {
      throw new BadRequestException(
        'Failure reason is required when cycle does not pass',
      );
    }

    cycle.status = dto.passed
      ? SterilizationCycleStatus.PASSED
      : SterilizationCycleStatus.FAILED;
    cycle.completedAt = new Date();
    cycle.biologicalIndicatorResult = dto.biologicalIndicatorResult;
    cycle.biologicalIndicatorTestedAt = dto.biologicalIndicatorResult
      ? new Date()
      : undefined;
    cycle.biologicalIndicatorTestedBy = dto.biologicalIndicatorResult
      ? context.userId
      : undefined;
    cycle.failureReason = dto.failureReason;
    cycle.notes = dto.notes || cycle.notes;
    cycle.updatedBy = context.userId;

    const saved = await cycle.save();

    // Update instruments
    if (dto.passed) {
      await this.updateInstrumentsAfterCycle(cycle, context);
    } else {
      // Reset instruments to ACTIVE status if cycle failed
      await this.instrumentModel.updateMany(
        { _id: { $in: cycle.instruments }, tenantId: context.tenantId },
        {
          $set: {
            status: InstrumentStatus.ACTIVE,
            updatedBy: context.userId,
          },
        },
      );
    }

    this.eventEmitter.emit('sterilization.cycle.completed', {
      cycleId: saved._id.toString(),
      cycleNumber: saved.cycleNumber,
      passed: dto.passed,
      instrumentCount: saved.instrumentCount,
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    });

    this.logger.log(
      `Completed sterilization cycle ${cycle.cycleNumber} - ${dto.passed ? 'PASSED' : 'FAILED'}`,
    );

    return saved;
  }

  async cancelCycle(
    cycleId: string,
    context: TenantContext,
  ): Promise<SterilizationCycle> {
    const cycle = await this.getCycleById(cycleId, context);

    if (![SterilizationCycleStatus.PENDING, SterilizationCycleStatus.RUNNING].includes(cycle.status)) {
      throw new BadRequestException(
        `Cannot cancel cycle with status ${cycle.status}`,
      );
    }

    cycle.status = SterilizationCycleStatus.CANCELLED;
    cycle.completedAt = new Date();
    cycle.updatedBy = context.userId;

    // Reset instruments to ACTIVE status
    await this.instrumentModel.updateMany(
      { _id: { $in: cycle.instruments }, tenantId: context.tenantId },
      {
        $set: {
          status: InstrumentStatus.ACTIVE,
          updatedBy: context.userId,
        },
      },
    );

    const saved = await cycle.save();

    this.logger.log(`Cancelled sterilization cycle ${cycle.cycleNumber}`);

    return saved;
  }

  async getCycleById(
    cycleId: string,
    context: TenantContext,
  ): Promise<SterilizationCycle> {
    const cycle = await this.cycleModel.findOne({
      _id: new Types.ObjectId(cycleId),
      tenantId: context.tenantId,
    });

    if (!cycle) {
      throw new NotFoundException(`Sterilization cycle ${cycleId} not found`);
    }

    return cycle;
  }

  async listCycles(
    context: TenantContext,
    options: {
      status?: SterilizationCycleStatus;
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<{ cycles: SterilizationCycle[]; total: number }> {
    const query: Record<string, unknown> = {
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    };

    if (options.status) {
      query.status = options.status;
    }

    const [cycles, total] = await Promise.all([
      this.cycleModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.skip || 0)
        .limit(options.limit || 50)
        .exec(),
      this.cycleModel.countDocuments(query),
    ]);

    return { cycles, total };
  }

  // ==================== Instrument Methods ====================

  async createInstrument(
    dto: CreateInstrumentDto,
    context: TenantContext,
  ): Promise<Instrument> {
    const instrument = new this.instrumentModel({
      ...dto,
      status: InstrumentStatus.ACTIVE,
      cyclesCompleted: 0,
      tenantId: context.tenantId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.userId,
    });

    const saved = await instrument.save();

    this.logger.log(
      `Created instrument ${saved.name} (${saved.type}) for clinic ${context.clinicId}`,
    );

    return saved;
  }

  async getInstrumentById(
    instrumentId: string,
    context: TenantContext,
  ): Promise<Instrument> {
    const instrument = await this.instrumentModel.findOne({
      _id: new Types.ObjectId(instrumentId),
      tenantId: context.tenantId,
    });

    if (!instrument) {
      throw new NotFoundException(`Instrument ${instrumentId} not found`);
    }

    return instrument;
  }

  async listInstruments(
    context: TenantContext,
    options: {
      status?: InstrumentStatus;
      type?: string;
      needsSterilization?: boolean;
      limit?: number;
      skip?: number;
    } = {},
  ): Promise<{ instruments: Instrument[]; total: number }> {
    const query: Record<string, unknown> = {
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    };

    if (options.status) {
      query.status = options.status;
    }

    if (options.type) {
      query.type = options.type;
    }

    // Find instruments that need sterilization (not sterilized in last 24 hours)
    if (options.needsSterilization) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      query.$or = [
        { lastSterilizedAt: { $lt: oneDayAgo } },
        { lastSterilizedAt: null },
      ];
      query.status = InstrumentStatus.ACTIVE;
    }

    const [instruments, total] = await Promise.all([
      this.instrumentModel
        .find(query)
        .sort({ name: 1 })
        .skip(options.skip || 0)
        .limit(options.limit || 50)
        .exec(),
      this.instrumentModel.countDocuments(query),
    ]);

    return { instruments, total };
  }

  async retireInstrument(
    instrumentId: string,
    reason: string,
    context: TenantContext,
  ): Promise<Instrument> {
    const instrument = await this.getInstrumentById(instrumentId, context);

    if (instrument.status === InstrumentStatus.RETIRED) {
      throw new BadRequestException('Instrument is already retired');
    }

    instrument.status = InstrumentStatus.RETIRED;
    instrument.retiredAt = new Date();
    instrument.retiredReason = reason;
    instrument.updatedBy = context.userId;

    const saved = await instrument.save();

    this.eventEmitter.emit('sterilization.instrument.retired', {
      instrumentId: saved._id.toString(),
      name: saved.name,
      type: saved.type,
      cyclesCompleted: saved.cyclesCompleted,
      reason,
      tenantId: context.tenantId,
      clinicId: context.clinicId,
    });

    this.logger.log(`Retired instrument ${saved.name}: ${reason}`);

    return saved;
  }

  async getInstrumentHistory(
    instrumentId: string,
    context: TenantContext,
  ): Promise<SterilizationCycle[]> {
    const instrument = await this.getInstrumentById(instrumentId, context);

    const cycles = await this.cycleModel
      .find({
        instruments: instrument._id,
        tenantId: context.tenantId,
      })
      .sort({ completedAt: -1 })
      .limit(100)
      .exec();

    return cycles;
  }

  // ==================== Statistics ====================

  async getStatistics(context: TenantContext): Promise<{
    totalCycles: number;
    passedCycles: number;
    failedCycles: number;
    pendingCycles: number;
    activeInstruments: number;
    instrumentsDueSterilization: number;
    instrumentsNearMaxCycles: number;
  }> {
    const [
      totalCycles,
      passedCycles,
      failedCycles,
      pendingCycles,
      activeInstruments,
      instrumentsDueSterilization,
      instrumentsNearMaxCycles,
    ] = await Promise.all([
      this.cycleModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
      }),
      this.cycleModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: SterilizationCycleStatus.PASSED,
      }),
      this.cycleModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: SterilizationCycleStatus.FAILED,
      }),
      this.cycleModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: { $in: [SterilizationCycleStatus.PENDING, SterilizationCycleStatus.RUNNING] },
      }),
      this.instrumentModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: InstrumentStatus.ACTIVE,
      }),
      this.instrumentModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: InstrumentStatus.ACTIVE,
        $or: [
          { lastSterilizedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          { lastSterilizedAt: null },
        ],
      }),
      this.instrumentModel.countDocuments({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        status: InstrumentStatus.ACTIVE,
        maxCycles: { $exists: true, $ne: null },
        $expr: {
          $gte: ['$cyclesCompleted', { $multiply: ['$maxCycles', 0.9] }],
        },
      }),
    ]);

    return {
      totalCycles,
      passedCycles,
      failedCycles,
      pendingCycles,
      activeInstruments,
      instrumentsDueSterilization,
      instrumentsNearMaxCycles,
    };
  }

  // ==================== Private Helpers ====================

  private async generateCycleNumber(context: TenantContext): Promise<string> {
    const today = new Date();
    const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastCycle = await this.cycleModel
      .findOne({
        tenantId: context.tenantId,
        clinicId: context.clinicId,
        cycleNumber: new RegExp(`^SC-${datePrefix}`),
      })
      .sort({ cycleNumber: -1 });

    let sequence = 1;
    if (lastCycle) {
      const lastSeq = parseInt(lastCycle.cycleNumber.split('-')[2], 10);
      sequence = lastSeq + 1;
    }

    return `SC-${datePrefix}-${sequence.toString().padStart(4, '0')}`;
  }

  private async updateInstrumentsAfterCycle(
    cycle: SterilizationCycle,
    context: TenantContext,
  ): Promise<void> {
    const instruments = await this.instrumentModel.find({
      _id: { $in: cycle.instruments },
      tenantId: context.tenantId,
    });

    const instrumentsToRetire: string[] = [];

    for (const instrument of instruments) {
      instrument.status = InstrumentStatus.ACTIVE;
      instrument.cyclesCompleted += 1;
      instrument.lastSterilizedAt = cycle.completedAt || new Date();
      instrument.lastSterilizationCycleId = cycle._id as Types.ObjectId;
      instrument.updatedBy = context.userId;

      // Check if instrument has reached max cycles
      if (instrument.maxCycles && instrument.cyclesCompleted >= instrument.maxCycles) {
        instrumentsToRetire.push(instrument._id.toString());
        this.logger.warn(
          `Instrument ${instrument.name} has reached max cycles (${instrument.cyclesCompleted}/${instrument.maxCycles})`,
        );
      }

      await instrument.save();
    }

    // Auto-retire instruments that have reached max cycles
    for (const instrumentId of instrumentsToRetire) {
      await this.retireInstrument(
        instrumentId,
        'Maximum sterilization cycles reached',
        context,
      );
    }
  }
}
