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
import { CacheService } from '../../common/cache/cache.service';
import {
  createOptimizedQuery,
  cursorPaginate,
  getOptimizedCount,
} from '../../common/utils/database-performance.util';
import { applyFieldSelection } from '../../common/decorators/select-fields.decorator';

/**
 * Optimized Clinics Service
 * Implements caching, lean queries, field projection, and efficient pagination
 */

@Injectable()
export class ClinicsOptimizedService {
  private readonly logger = new Logger(ClinicsOptimizedService.name);

  constructor(
    @InjectModel(ClinicDocument.name) private clinicModel: Model<ClinicDocument>,
    private eventEmitter: EventEmitter2,
    private cacheService: CacheService,
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

    // Cache the new clinic
    await this.cacheService.set(`clinic:${clinic._id}`, clinic.toObject(), {
      ttl: this.cacheService.getTTL('clinic'),
    });

    // Invalidate organization's clinic list cache
    await this.cacheService.invalidateClinic(clinic._id.toString(), organizationId);
    await this.cacheService.invalidateListCache('clinic');

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

    return clinic.toObject();
  }

  /**
   * Find all clinics with optimizations
   */
  async findAll(filter: ClinicFilterDto, fields?: string[]) {
    const cacheKey = `clinic:list:${JSON.stringify(filter)}:${fields?.join(',') || 'all'}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached clinic list');
      return cached;
    }

    const query: Record<string, unknown> = {};
    if (filter.organizationId) query.organizationId = filter.organizationId;
    if (filter.status) query.status = filter.status;

    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    // Use cursor pagination for better performance
    if ((filter as any).cursor) {
      const result = await cursorPaginate(
        this.clinicModel,
        query,
        {
          limit,
          cursor: (filter as any).cursor,
          sortField: 'createdAt',
          sortOrder: 'desc',
        },
        applyFieldSelection(fields),
      );

      const response = {
        data: result.data,
        meta: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit,
        },
      };

      await this.cacheService.set(cacheKey, response, {
        ttl: this.cacheService.getTTL('list'),
      });

      return response;
    }

    // Offset pagination
    const [results, countResult] = await Promise.all([
      createOptimizedQuery(this.clinicModel, query, {
        select: applyFieldSelection(fields),
        sort: { createdAt: -1 },
        limit,
        skip: offset,
        lean: true,
      }).exec(),
      getOptimizedCount(this.clinicModel, query),
    ]);

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    const response = {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        isEstimate: countResult.isEstimate,
      },
    };

    await this.cacheService.set(cacheKey, response, {
      ttl: this.cacheService.getTTL('list'),
    });

    return response;
  }

  /**
   * Find one clinic with caching
   */
  async findOne(clinicId: string, fields?: string[]) {
    const cacheKey = `clinic:${clinicId}:${fields?.join(',') || 'all'}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const query = this.clinicModel.findById(clinicId).lean();

        if (fields) {
          query.select(applyFieldSelection(fields) || {});
        }

        const clinic = await query.exec();

        if (!clinic) {
          throw new NotFoundException(`Clinic ${clinicId} not found`);
        }

        return clinic;
      },
      { ttl: this.cacheService.getTTL('clinic') },
    );
  }

  /**
   * Update clinic and invalidate cache
   */
  async update(clinicId: string, dto: UpdateClinicDto, context: { userId: string }) {
    const clinic = await this.clinicModel.findById(clinicId).exec();

    if (!clinic) {
      throw new NotFoundException(`Clinic ${clinicId} not found`);
    }

    const organizationId = clinic.organizationId;

    Object.assign(clinic, dto);
    clinic.updatedBy = context.userId;

    await clinic.save();
    this.logger.log(`Updated clinic ${clinicId}`);

    // Invalidate cache
    await this.cacheService.invalidateClinic(clinicId, organizationId);
    await this.cacheService.invalidateListCache('clinic');

    return clinic.toObject();
  }

  async updateSettings(
    clinicId: string,
    dto: UpdateClinicSettingsDto,
    context: { userId: string },
  ) {
    const clinic = await this.findOne(clinicId);

    // Invalidate cache
    await this.cacheService.invalidateClinic(clinicId, clinic.organizationId);

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

  /**
   * Batch load clinics (for DataLoader)
   */
  async findByIds(ids: string[], fields?: string[]): Promise<(any | null)[]> {
    const cacheKeys = ids.map((id) => `clinic:${id}:${fields?.join(',') || 'all'}`);

    // Try cache first
    const cached = await this.cacheService.mget(cacheKeys);

    const toFetch: string[] = [];
    const cacheMap = new Map<string, any>();

    cached.forEach((item, index) => {
      if (item) {
        cacheMap.set(ids[index], item);
      } else {
        toFetch.push(ids[index]);
      }
    });

    // Fetch missing
    if (toFetch.length > 0) {
      const query = this.clinicModel.find({ _id: { $in: toFetch } }).lean();

      if (fields) {
        query.select(applyFieldSelection(fields) || {});
      }

      const clinics = await query.exec();

      // Cache
      const cacheItems = clinics.map((clinic) => ({
        key: `clinic:${clinic._id}:${fields?.join(',') || 'all'}`,
        value: clinic,
        ttl: this.cacheService.getTTL('clinic'),
      }));

      await this.cacheService.mset(cacheItems);

      clinics.forEach((clinic) => {
        cacheMap.set(clinic._id.toString(), clinic);
      });
    }

    return ids.map((id) => cacheMap.get(id) || null);
  }

  /**
   * Find clinics by organization (optimized for DataLoader)
   */
  async findByOrganizationIds(
    organizationIds: string[],
    fields?: string[],
  ): Promise<Map<string, any[]>> {
    const query = this.clinicModel.find({ organizationId: { $in: organizationIds } }).lean();

    if (fields) {
      query.select(applyFieldSelection(fields) || {});
    }

    const clinics = await query.exec();

    // Group by organization ID
    const clinicMap = new Map<string, any[]>();
    for (const clinic of clinics) {
      const existing = clinicMap.get(clinic.organizationId) || [];
      existing.push(clinic);
      clinicMap.set(clinic.organizationId, existing);
    }

    return clinicMap;
  }
}
