import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClinicDocument } from '../../schemas/clinic.schema';
import { ClinicStatus } from '@dentalos/shared-domain';
import type {
  CreateClinicDto,
  UpdateClinicDto,
  UpdateClinicSettingsDto,
  CreateClinicLocationDto,
  ClinicFilterDto,
} from '@dentalos/shared-validation';

@Injectable()
export class ClinicsService {
  private readonly logger = new Logger(ClinicsService.name);

  constructor(
    @InjectModel(ClinicDocument.name) private clinicModel: Model<ClinicDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(organizationId: string, dto: CreateClinicDto, context: { userId: string }) {
    const clinic = new this.clinicModel({
      ...dto,
      organizationId,
      status: ClinicStatus.ACTIVE,
      createdBy: context.userId,
      updatedBy: context.userId,
    });

    await clinic.save();
    this.logger.log(`Created clinic ${clinic._id} for organization ${organizationId}`);

    this.eventEmitter.emit('enterprise.clinic.created', {
      clinicId: clinic._id.toString(),
      organizationId,
      name: clinic.name,
      code: clinic.code,
      status: clinic.status,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      timezone: clinic.timezone,
      managerUserId: clinic.managerUserId,
      managerName: clinic.managerName,
      createdAt: clinic.createdAt.toISOString(),
      createdBy: context.userId,
    });

    return clinic;
  }

  async findAll(filter: ClinicFilterDto) {
    const query: Record<string, unknown> = {};
    if (filter.organizationId) query.organizationId = filter.organizationId;
    if (filter.status) query.status = filter.status;

    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    const [results, total] = await Promise.all([
      this.clinicModel.find(query).limit(limit).skip(offset).sort({ createdAt: -1 }).exec(),
      this.clinicModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
  }

  async findOne(clinicId: string) {
    const clinic = await this.clinicModel.findById(clinicId).exec();
    if (!clinic) {
      throw new NotFoundException(`Clinic ${clinicId} not found`);
    }
    return clinic;
  }

  async update(clinicId: string, dto: UpdateClinicDto, context: { userId: string }) {
    const clinic = await this.findOne(clinicId);

    Object.assign(clinic, dto);
    clinic.updatedBy = context.userId;

    await clinic.save();
    this.logger.log(`Updated clinic ${clinicId}`);

    return clinic;
  }

  async updateSettings(
    clinicId: string,
    dto: UpdateClinicSettingsDto,
    context: { userId: string },
  ) {
    const clinic = await this.findOne(clinicId);

    this.eventEmitter.emit('enterprise.settings.updated', {
      entityType: 'CLINIC',
      entityId: clinicId,
      organizationId: clinic.organizationId,
      clinicId,
      settingsChanged: Object.keys(dto),
      previousValues: {},
      newValues: dto,
      updatedAt: new Date().toISOString(),
      updatedBy: context.userId,
    });

    return { success: true, clinicId };
  }

  async getLocations(clinicId: string) {
    await this.findOne(clinicId);
    return [];
  }

  async createLocation(
    clinicId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _dto: CreateClinicLocationDto,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: { userId: string },
  ) {
    await this.findOne(clinicId);
    return { success: true, clinicId, locationId: 'location-1' };
  }
}
