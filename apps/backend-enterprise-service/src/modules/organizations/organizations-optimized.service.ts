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
import { CacheService } from '../../common/cache/cache.service';
import {
  createOptimizedQuery,
  cursorPaginate,
  getOptimizedCount,
} from '../../common/utils/database-performance.util';
import { applyFieldSelection } from '../../common/decorators/select-fields.decorator';

/**
 * Optimized Organizations Service
 * Implements caching, lean queries, field projection, and cursor pagination
 */

@Injectable()
export class OrganizationsOptimizedService {
  private readonly logger = new Logger(OrganizationsOptimizedService.name);

  constructor(
    @InjectModel(OrganizationDocument.name)
    private organizationModel: Model<OrganizationDocument>,
    private eventEmitter: EventEmitter2,
    private cacheService: CacheService,
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

    // Cache the new organization
    await this.cacheService.set(`organization:${organization._id}`, organization.toObject(), {
      ttl: this.cacheService.getTTL('organization'),
    });

    // Invalidate list cache
    await this.cacheService.invalidateListCache('organization');

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

    return organization.toObject();
  }

  /**
   * Find all organizations with optimized pagination and caching
   */
  async findAll(filter: OrganizationFilterDto, fields?: string[]) {
    const cacheKey = `organization:list:${JSON.stringify(filter)}:${fields?.join(',') || 'all'}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached organization list');
      return cached;
    }

    const query: Record<string, unknown> = {};
    if (filter.status) query.status = filter.status;
    if (filter.subscriptionTier) query.subscriptionTier = filter.subscriptionTier;

    const limit = filter.limit || 20;
    const offset = filter.offset || 0;

    // Use cursor pagination for better performance on large datasets
    if ((filter as any).cursor) {
      const result = await cursorPaginate(
        this.organizationModel,
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

      // Cache for 30 seconds
      await this.cacheService.set(cacheKey, response, {
        ttl: this.cacheService.getTTL('list'),
      });

      return response;
    }

    // Offset pagination with optimizations
    const [results, countResult] = await Promise.all([
      createOptimizedQuery(this.organizationModel, query, {
        select: applyFieldSelection(fields),
        sort: { createdAt: -1 },
        limit,
        skip: offset,
        lean: true,
      }).exec(),
      getOptimizedCount(this.organizationModel, query),
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

    // Cache for 30 seconds
    await this.cacheService.set(cacheKey, response, {
      ttl: this.cacheService.getTTL('list'),
    });

    return response;
  }

  /**
   * Find one organization with caching
   */
  async findOne(id: string, fields?: string[]) {
    const cacheKey = `organization:${id}:${fields?.join(',') || 'all'}`;

    // Try cache first
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const query = this.organizationModel.findById(id).lean();

        if (fields) {
          query.select(applyFieldSelection(fields) || {});
        }

        const organization = await query.exec();

        if (!organization) {
          throw new NotFoundException(`Organization ${id} not found`);
        }

        return organization;
      },
      { ttl: this.cacheService.getTTL('organization') },
    );
  }

  /**
   * Update organization and invalidate cache
   */
  async update(id: string, dto: UpdateOrganizationDto, context: { userId: string }) {
    const organization = await this.organizationModel.findById(id).exec();

    if (!organization) {
      throw new NotFoundException(`Organization ${id} not found`);
    }

    Object.assign(organization, dto);
    organization.updatedBy = context.userId;

    await organization.save();
    this.logger.log(`Updated organization ${id}`);

    // Invalidate cache
    await this.cacheService.invalidateOrganization(id);
    await this.cacheService.invalidateListCache('organization');

    return organization.toObject();
  }

  async updateSettings(
    id: string,
    dto: UpdateOrganizationSettingsDto,
    context: { userId: string },
  ) {
    this.logger.log(`Updating settings for organization ${id}`);

    // Invalidate cache
    await this.cacheService.invalidateOrganization(id);

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

  /**
   * Batch load organizations (for DataLoader)
   */
  async findByIds(ids: string[], fields?: string[]): Promise<(any | null)[]> {
    const cacheKeys = ids.map((id) => `organization:${id}:${fields?.join(',') || 'all'}`);

    // Try to get from cache
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

    // Fetch missing items
    if (toFetch.length > 0) {
      const query = this.organizationModel.find({ _id: { $in: toFetch } }).lean();

      if (fields) {
        query.select(applyFieldSelection(fields) || {});
      }

      const organizations = await query.exec();

      // Cache fetched items
      const cacheItems = organizations.map((org) => ({
        key: `organization:${org._id}:${fields?.join(',') || 'all'}`,
        value: org,
        ttl: this.cacheService.getTTL('organization'),
      }));

      await this.cacheService.mset(cacheItems);

      // Add to map
      organizations.forEach((org) => {
        cacheMap.set(org._id.toString(), org);
      });
    }

    // Return in same order as requested
    return ids.map((id) => cacheMap.get(id) || null);
  }

  /**
   * Get organization statistics (cached)
   */
  async getStats() {
    const cacheKey = 'organization:stats';

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [total, byStatus, byTier] = await Promise.all([
          this.organizationModel.countDocuments().exec(),
          this.organizationModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
          this.organizationModel.aggregate([
            { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
          ]),
        ]);

        return {
          total,
          byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
          byTier: Object.fromEntries(byTier.map((t) => [t._id, t.count])),
        };
      },
      { ttl: this.cacheService.getTTL('stats') },
    );
  }
}
