import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationDocument } from '../schemas/organization.schema.enhanced';
import {
  BaseRepository,
  RepoPaginationOptions as PaginationOptions,
  PaginatedResult,
  RepositoryQueryOptions,
} from '@dentalos/shared-infra';
import { OrganizationStatus } from '@dentalos/shared-domain';

/**
 * Organization repository with domain-specific queries
 *
 * Extends BaseRepository to provide CRUD operations with:
 * - Multi-tenant scoping
 * - Pagination
 * - Transaction support
 * - Query optimization
 */
@Injectable()
export class OrganizationRepository extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(OrganizationDocument.name)
    organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel, 'Organization');
  }

  /**
   * Find organization by tax ID
   */
  async findByTaxId(
    taxId: string,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    return this.findOne({ taxId } as any, tenantId, options);
  }

  /**
   * Find active organizations
   */
  async findActive(
    tenantId: string,
    pagination: PaginationOptions = {},
    options: RepositoryQueryOptions = {},
  ): Promise<PaginatedResult<OrganizationDocument>> {
    return this.findMany(
      { status: OrganizationStatus.ACTIVE } as any,
      tenantId,
      {
        ...pagination,
        sort: pagination.sort || { createdAt: -1 },
      },
      options,
    );
  }

  /**
   * Find organizations with expiring subscriptions
   */
  async findExpiringSubscriptions(
    daysAhead: number,
    tenantId: string,
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const filter = {
      subscriptionEndDate: { $lte: futureDate, $gte: new Date() },
      status: OrganizationStatus.ACTIVE,
    };

    return this.findAll(filter as any, tenantId, options as any);
  }

  /**
   * Find organizations by subscription tier
   */
  async findBySubscriptionTier(
    tier: string,
    tenantId: string,
    pagination: PaginationOptions = {},
    options: RepositoryQueryOptions = {},
  ): Promise<PaginatedResult<OrganizationDocument>> {
    return this.findMany({ subscriptionTier: tier } as any, tenantId, pagination, options);
  }

  /**
   * Find organizations approaching clinic limit
   */
  async findApproachingClinicLimit(
    threshold: number,
    tenantId: string,
    _options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument[]> {
    const results = await this.model.aggregate([
      {
        $match: {
          tenantId,
          isDeleted: { $ne: true },
          status: OrganizationStatus.ACTIVE,
        },
      },
      {
        $addFields: {
          usagePercentage: {
            $multiply: [{ $divide: ['$currentClinicCount', '$maxClinics'] }, 100],
          },
        },
      },
      {
        $match: {
          usagePercentage: { $gte: threshold },
        },
      },
      {
        $sort: { usagePercentage: -1 },
      },
    ]);

    return results;
  }

  /**
   * Get organization statistics
   */
  async getStatistics(tenantId: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    totalClinics: number;
    totalUsers: number;
  }> {
    const stats = await this.model.aggregate([
      {
        $match: {
          tenantId,
          isDeleted: { $ne: true },
        },
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ],
          byTier: [
            {
              $group: {
                _id: '$subscriptionTier',
                count: { $sum: 1 },
              },
            },
          ],
          usage: [
            {
              $group: {
                _id: null,
                totalClinics: { $sum: '$currentClinicCount' },
                totalUsers: { $sum: '$currentUserCount' },
              },
            },
          ],
        },
      },
    ]);

    const result = stats[0];

    return {
      total: result.total[0]?.count || 0,
      byStatus: result.byStatus.reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byTier: result.byTier.reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      totalClinics: result.usage[0]?.totalClinics || 0,
      totalUsers: result.usage[0]?.totalUsers || 0,
    };
  }

  /**
   * Increment clinic count
   */
  async incrementClinicCount(
    organizationId: string,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    const org = await this.findById(organizationId, context.tenantId, options);

    if (!org) {
      return null;
    }

    if (!(org as any).canAddClinic()) {
      throw new Error('Organization has reached maximum clinic limit');
    }

    org.currentClinicCount += 1;
    org.updatedBy = context.userId;

    await org.save({ session: options.session });

    this.logger.log(`Incremented clinic count for organization ${organizationId}`);

    return org;
  }

  /**
   * Decrement clinic count
   */
  async decrementClinicCount(
    organizationId: string,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    const org = await this.findById(organizationId, context.tenantId, options);

    if (!org) {
      return null;
    }

    if (org.currentClinicCount > 0) {
      org.currentClinicCount -= 1;
      org.updatedBy = context.userId;

      await org.save({ session: options.session });

      this.logger.log(`Decremented clinic count for organization ${organizationId}`);
    }

    return org;
  }

  /**
   * Search organizations by text
   */
  async searchByText(
    searchText: string,
    tenantId: string,
    pagination: PaginationOptions = {},
    options: RepositoryQueryOptions = {},
  ): Promise<PaginatedResult<OrganizationDocument>> {
    const filter = {
      $text: { $search: searchText },
    };

    return this.findMany(filter as any, tenantId, pagination, options as any);
  }

  /**
   * Find organizations for list view (optimized with field selection)
   */
  async findForList(
    tenantId: string,
    pagination: PaginationOptions = {},
  ): Promise<PaginatedResult<OrganizationDocument>> {
    return this.findMany({} as any, tenantId, pagination, {
      select: {
        name: 1,
        status: 1,
        subscriptionTier: 1,
        currentClinicCount: 1,
        maxClinics: 1,
        primaryContactEmail: 1,
        createdAt: 1,
      },
      lean: true,
    });
  }

  /**
   * Activate organization
   */
  async activate(
    organizationId: string,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    return this.updateById(
      organizationId,
      { status: OrganizationStatus.ACTIVE } as any,
      context,
      options,
    );
  }

  /**
   * Suspend organization
   */
  async suspend(
    organizationId: string,
    reason: string,
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    return this.updateById(
      organizationId,
      {
        status: OrganizationStatus.SUSPENDED,
        suspensionReason: reason,
      } as any,
      context,
      options,
    );
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    organizationId: string,
    subscription: {
      tier: string;
      startDate?: Date;
      endDate?: Date;
      maxClinics?: number;
      maxUsers?: number;
      maxStorageGB?: number;
    },
    context: { userId: string; tenantId: string },
    options: RepositoryQueryOptions = {},
  ): Promise<OrganizationDocument | null> {
    const update: any = {
      subscriptionTier: subscription.tier,
    };

    if (subscription.startDate) {
      update.subscriptionStartDate = subscription.startDate;
    }
    if (subscription.endDate) {
      update.subscriptionEndDate = subscription.endDate;
    }
    if (subscription.maxClinics !== undefined) {
      update.maxClinics = subscription.maxClinics;
    }
    if (subscription.maxUsers !== undefined) {
      update.maxUsers = subscription.maxUsers;
    }
    if (subscription.maxStorageGB !== undefined) {
      update.maxStorageGB = subscription.maxStorageGB;
    }

    return this.updateById(organizationId, update, context, options);
  }
}
