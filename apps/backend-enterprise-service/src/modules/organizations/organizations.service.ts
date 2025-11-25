import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrganizationDocument } from '../../schemas/organization.schema';
import { OrganizationStatus } from '@dentalos/shared-domain';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
  OrganizationFilterDto,
} from '@dentalos/shared-validation';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    @InjectModel(OrganizationDocument.name) private organizationModel: Model<OrganizationDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateOrganizationDto, context: { userId: string }) {
    const organization = new this.organizationModel({
      ...dto,
      status: OrganizationStatus.ACTIVE,
      createdBy: context.userId,
      updatedBy: context.userId,
    });

    await organization.save();
    this.logger.log(`Created organization ${organization._id}`);

    this.eventEmitter.emit('enterprise.organization.created', {
      organizationId: organization._id.toString(),
      name: organization.name,
      legalName: organization.legalName,
      taxId: organization.taxId,
      status: organization.status,
      primaryContactName: organization.primaryContactName,
      primaryContactEmail: organization.primaryContactEmail,
      primaryContactPhone: organization.primaryContactPhone,
      address: organization.address,
      subscriptionTier: organization.subscriptionTier,
      maxClinics: organization.maxClinics,
      maxUsers: organization.maxUsers,
      createdAt: organization.createdAt.toISOString(),
      createdBy: context.userId,
    });

    return organization;
  }

  async findAll(filter: OrganizationFilterDto) {
    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;
    if (filter.subscriptionTier) query.subscriptionTier = filter.subscriptionTier;

    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    const [results, total] = await Promise.all([
      this.organizationModel.find(query).limit(limit).skip(offset).sort({ createdAt: -1 }).exec(),
      this.organizationModel.countDocuments(query).exec(),
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

  async findOne(id: string) {
    const organization = await this.organizationModel.findById(id).exec();
    if (!organization) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto, context: { userId: string }) {
    const organization = await this.findOne(id);

    Object.assign(organization, dto);
    organization.updatedBy = context.userId;

    await organization.save();
    this.logger.log(`Updated organization ${id}`);

    return organization;
  }

  async updateSettings(
    id: string,
    dto: UpdateOrganizationSettingsDto,
    context: { userId: string },
  ) {
    this.logger.log(`Updating settings for organization ${id}`);

    this.eventEmitter.emit('enterprise.settings.updated', {
      entityType: 'ORGANIZATION',
      entityId: id,
      organizationId: id,
      settingsChanged: Object.keys(dto),
      previousValues: {},
      newValues: dto,
      updatedAt: new Date().toISOString(),
      updatedBy: context.userId,
    });

    return { success: true, organizationId: id };
  }
}
