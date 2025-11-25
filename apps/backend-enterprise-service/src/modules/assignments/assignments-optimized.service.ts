import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderClinicAssignmentDocument } from '../../schemas/provider-clinic-assignment.schema';
import type { AssignProviderDto } from '@dentalos/shared-validation';
import { CacheService } from '../../common/cache/cache.service';
import {
  createOptimizedQuery,
  cursorPaginate,
  getOptimizedCount,
} from '../../common/utils/database-performance.util';
import { applyFieldSelection } from '../../common/decorators/select-fields.decorator';

/**
 * Optimized Assignments Service
 * Implements caching, lean queries, DataLoader integration for N+1 prevention
 */

@Injectable()
export class AssignmentsOptimizedService {
  private readonly logger = new Logger(AssignmentsOptimizedService.name);

  constructor(
    @InjectModel(ProviderClinicAssignmentDocument.name)
    private assignmentModel: Model<ProviderClinicAssignmentDocument>,
    private eventEmitter: EventEmitter2,
    private cacheService: CacheService,
  ) {}

  async assignProvider(
    providerId: string,
    dto: AssignProviderDto,
    context: { userId: string; organizationId: string },
  ) {
    const assignment = new this.assignmentModel({
      providerId,
      clinicId: dto.clinicId,
      organizationId: context.organizationId,
      roles: dto.roles,
      workingHoursOverride: dto.workingHoursOverride,
      isActive: true,
      isPrimaryClinic: dto.isPrimaryClinic || false,
      assignedAt: new Date(),
      assignedBy: context.userId,
    });

    await assignment.save();
    this.logger.log(`Assigned provider ${providerId} to clinic ${dto.clinicId}`);

    // Invalidate caches
    await this.cacheService.invalidateAssignment(providerId, dto.clinicId);

    this.eventEmitter.emit('enterprise.staff.assigned', {
      assignmentId: assignment._id.toString(),
      providerId,
      clinicId: dto.clinicId,
      organizationId: context.organizationId,
      roles: dto.roles,
      isPrimaryClinic: assignment.isPrimaryClinic,
      assignedAt: assignment.assignedAt.toISOString(),
      assignedBy: context.userId,
    });

    return assignment.toObject();
  }

  /**
   * Get provider's clinics with caching and optional population
   */
  async getProviderClinics(
    providerId: string,
    options?: {
      limit?: number;
      offset?: number;
      cursor?: string;
      populateClinics?: boolean;
      fields?: string[];
    },
  ) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const populateClinics = options?.populateClinics || false;

    const cacheKey = `provider:${providerId}:clinics:${JSON.stringify(options)}`;

    // Try cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached clinics for provider ${providerId}`);
      return cached;
    }

    const query = { providerId, isActive: true };

    // Cursor pagination
    if (options?.cursor) {
      const result = await cursorPaginate(
        this.assignmentModel,
        query,
        {
          limit,
          cursor: options.cursor,
          sortField: 'assignedAt',
          sortOrder: 'desc',
        },
        applyFieldSelection(options.fields),
      );

      let data = result.data;

      // Populate clinics if requested (use DataLoader to prevent N+1)
      if (populateClinics) {
        // TODO: Use DataLoader from request context
        // For now, batch load manually
        const clinicIds = data.map((a) => a.clinicId);
        const clinics = await this.batchLoadClinics(clinicIds);
        const clinicMap = new Map(clinics.map((c) => [c._id.toString(), c]));

        data = data.map((assignment) => ({
          ...assignment,
          clinic: clinicMap.get(assignment.clinicId),
        }));
      }

      const response = {
        data,
        meta: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit,
        },
      };

      await this.cacheService.set(cacheKey, response, {
        ttl: this.cacheService.getTTL('assignment'),
      });

      return response;
    }

    // Offset pagination
    const [results, countResult] = await Promise.all([
      createOptimizedQuery(this.assignmentModel, query, {
        select: applyFieldSelection(options?.fields),
        sort: { assignedAt: -1 },
        limit,
        skip: offset,
        lean: true,
      }).exec(),
      getOptimizedCount(this.assignmentModel, query),
    ]);

    let data = results;

    // Populate clinics if requested
    if (populateClinics) {
      const clinicIds = data.map((a: any) => a.clinicId);
      const clinics = await this.batchLoadClinics(clinicIds);
      const clinicMap = new Map(clinics.map((c: any) => [c._id.toString(), c]));

      data = data.map((assignment: any) => ({
        ...assignment,
        clinic: clinicMap.get(assignment.clinicId),
      }));
    }

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    const response = {
      data,
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
      ttl: this.cacheService.getTTL('assignment'),
    });

    return response;
  }

  /**
   * Get clinic's staff with caching and optional population
   */
  async getClinicStaff(
    clinicId: string,
    options?: {
      limit?: number;
      offset?: number;
      cursor?: string;
      populateProviders?: boolean;
      fields?: string[];
    },
  ) {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const populateProviders = options?.populateProviders || false;

    const cacheKey = `clinic:${clinicId}:staff:${JSON.stringify(options)}`;

    // Try cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached staff for clinic ${clinicId}`);
      return cached;
    }

    const query = { clinicId, isActive: true };

    // Cursor pagination
    if (options?.cursor) {
      const result = await cursorPaginate(
        this.assignmentModel,
        query,
        {
          limit,
          cursor: options.cursor,
          sortField: 'assignedAt',
          sortOrder: 'desc',
        },
        applyFieldSelection(options.fields),
      );

      let data = result.data;

      // Populate providers if requested
      if (populateProviders) {
        const providerIds = data.map((a) => a.providerId);
        const providers = await this.batchLoadProviders(providerIds);
        const providerMap = new Map(providers.map((p) => [p.id, p]));

        data = data.map((assignment) => ({
          ...assignment,
          provider: providerMap.get(assignment.providerId),
        }));
      }

      const response = {
        data,
        meta: {
          nextCursor: result.nextCursor,
          hasMore: result.hasMore,
          limit,
        },
      };

      await this.cacheService.set(cacheKey, response, {
        ttl: this.cacheService.getTTL('assignment'),
      });

      return response;
    }

    // Offset pagination
    const [results, countResult] = await Promise.all([
      createOptimizedQuery(this.assignmentModel, query, {
        select: applyFieldSelection(options?.fields),
        sort: { assignedAt: -1 },
        limit,
        skip: offset,
        lean: true,
      }).exec(),
      getOptimizedCount(this.assignmentModel, query),
    ]);

    let data = results;

    // Populate providers if requested
    if (populateProviders) {
      const providerIds = data.map((a: any) => a.providerId);
      const providers = await this.batchLoadProviders(providerIds);
      const providerMap = new Map(providers.map((p: any) => [p.id, p]));

      data = data.map((assignment: any) => ({
        ...assignment,
        provider: providerMap.get(assignment.providerId),
      }));
    }

    const total = countResult.count;
    const totalPages = Math.ceil(total / limit);
    const page = Math.floor(offset / limit) + 1;
    const hasNextPage = offset + limit < total;
    const hasPreviousPage = offset > 0;

    const response = {
      data,
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
      ttl: this.cacheService.getTTL('assignment'),
    });

    return response;
  }

  /**
   * Batch load clinics to prevent N+1
   */
  private async batchLoadClinics(clinicIds: string[]): Promise<any[]> {
    const uniqueIds = [...new Set(clinicIds)];

    // Try cache first
    const cacheKeys = uniqueIds.map((id) => `clinic:${id}`);
    const cached = await this.cacheService.mget(cacheKeys);

    const toFetch: string[] = [];
    const results: any[] = [];

    cached.forEach((item, index) => {
      if (item) {
        results.push(item);
      } else {
        toFetch.push(uniqueIds[index]);
      }
    });

    if (toFetch.length > 0) {
      // Import dynamically to avoid circular dependency
      await import('../../schemas/clinic.schema');
      const ClinicModel = this.assignmentModel.db.model('ClinicDocument', null as any);

      const clinics = await ClinicModel.find({ _id: { $in: toFetch } })
        .lean()
        .exec();

      // Cache fetched
      const cacheItems = clinics.map((clinic) => ({
        key: `clinic:${clinic._id}`,
        value: clinic,
        ttl: this.cacheService.getTTL('clinic'),
      }));

      await this.cacheService.mset(cacheItems);
      results.push(...clinics);
    }

    return results;
  }

  /**
   * Batch load providers to prevent N+1
   */
  private async batchLoadProviders(providerIds: string[]): Promise<any[]> {
    const uniqueIds = [...new Set(providerIds)];

    // TODO: Call HR service to batch load providers
    // For now, return mock data
    return uniqueIds.map((id) => ({
      id,
      name: `Provider ${id}`,
      // ... other provider data
    }));
  }

  /**
   * Unassign provider from clinic
   */
  async unassignProvider(providerId: string, clinicId: string, context: { userId: string }) {
    const assignment = await this.assignmentModel.findOne({ providerId, clinicId }).exec();

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.isActive = false;
    assignment.unassignedAt = new Date();
    assignment.unassignedBy = context.userId;

    await assignment.save();
    this.logger.log(`Unassigned provider ${providerId} from clinic ${clinicId}`);

    // Invalidate caches
    await this.cacheService.invalidateAssignment(providerId, clinicId);

    return assignment.toObject();
  }
}
