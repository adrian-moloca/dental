import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationDocument } from '../../schemas/organization.schema';
import { ClinicDocument } from '../../schemas/clinic.schema';
import { ProviderClinicAssignmentDocument } from '../../schemas/provider-clinic-assignment.schema';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 * Automatically batches and caches requests within a single request context
 */

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor(
    @InjectModel(OrganizationDocument.name)
    private organizationModel: Model<OrganizationDocument>,
    @InjectModel(ClinicDocument.name)
    private clinicModel: Model<ClinicDocument>,
    @InjectModel(ProviderClinicAssignmentDocument.name)
    private assignmentModel: Model<ProviderClinicAssignmentDocument>,
  ) {}

  /**
   * Create organization loader
   * Batches organization lookups by ID
   */
  createOrganizationLoader(): DataLoader<string, any> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        const uniqueIds = [...new Set(ids)];
        this.logger.debug(`Batch loading ${uniqueIds.length} organizations`);

        const organizations = await this.organizationModel
          .find({ _id: { $in: uniqueIds } })
          .lean()
          .exec();

        // Create a map for O(1) lookups
        const orgMap = new Map(organizations.map((org) => [org._id.toString(), org]));

        // Return in same order as requested
        return ids.map((id) => orgMap.get(id) || null);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10), // 10ms batching window
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create clinic loader
   * Batches clinic lookups by ID
   */
  createClinicLoader(): DataLoader<string, any> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        const uniqueIds = [...new Set(ids)];
        this.logger.debug(`Batch loading ${uniqueIds.length} clinics`);

        const clinics = await this.clinicModel
          .find({ _id: { $in: uniqueIds } })
          .lean()
          .exec();

        const clinicMap = new Map(clinics.map((clinic) => [clinic._id.toString(), clinic]));

        return ids.map((id) => clinicMap.get(id) || null);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create assignment loader by provider ID
   * Batches assignment lookups for multiple providers
   */
  createAssignmentsByProviderLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (providerIds: readonly string[]) => {
        const uniqueIds = [...new Set(providerIds)];
        this.logger.debug(`Batch loading assignments for ${uniqueIds.length} providers`);

        const assignments = await this.assignmentModel
          .find({ providerId: { $in: uniqueIds }, isActive: true })
          .lean()
          .exec();

        // Group by provider ID
        const assignmentMap = new Map<string, any[]>();
        for (const assignment of assignments) {
          const existing = assignmentMap.get(assignment.providerId) || [];
          existing.push(assignment);
          assignmentMap.set(assignment.providerId, existing);
        }

        return providerIds.map((id) => assignmentMap.get(id) || []);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create assignment loader by clinic ID
   * Batches assignment lookups for multiple clinics
   */
  createAssignmentsByClinicLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (clinicIds: readonly string[]) => {
        const uniqueIds = [...new Set(clinicIds)];
        this.logger.debug(`Batch loading assignments for ${uniqueIds.length} clinics`);

        const assignments = await this.assignmentModel
          .find({ clinicId: { $in: uniqueIds }, isActive: true })
          .lean()
          .exec();

        // Group by clinic ID
        const assignmentMap = new Map<string, any[]>();
        for (const assignment of assignments) {
          const existing = assignmentMap.get(assignment.clinicId) || [];
          existing.push(assignment);
          assignmentMap.set(assignment.clinicId, existing);
        }

        return clinicIds.map((id) => assignmentMap.get(id) || []);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create clinics by organization loader
   * Batches clinic lookups for multiple organizations
   */
  createClinicsByOrganizationLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (organizationIds: readonly string[]) => {
        const uniqueIds = [...new Set(organizationIds)];
        this.logger.debug(`Batch loading clinics for ${uniqueIds.length} organizations`);

        const clinics = await this.clinicModel
          .find({ organizationId: { $in: uniqueIds } })
          .lean()
          .exec();

        // Group by organization ID
        const clinicMap = new Map<string, any[]>();
        for (const clinic of clinics) {
          const existing = clinicMap.get(clinic.organizationId) || [];
          existing.push(clinic);
          clinicMap.set(clinic.organizationId, existing);
        }

        return organizationIds.map((id) => clinicMap.get(id) || []);
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create provider loader (external service call simulation)
   * In production, this would call the HR service
   */
  createProviderLoader(): DataLoader<string, any> {
    return new DataLoader(
      async (providerIds: readonly string[]) => {
        const uniqueIds = [...new Set(providerIds)];
        this.logger.debug(`Batch loading ${uniqueIds.length} providers from HR service`);

        // TODO: Replace with actual HR service call
        // For now, return mock data
        return providerIds.map((id) => ({
          id,
          name: `Provider ${id}`,
          // ... other provider data
        }));
      },
      {
        cache: true,
        batchScheduleFn: (callback) => setTimeout(callback, 10),
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create a DataLoader factory for request-scoped loaders
   * This should be used in a request-scoped provider
   */
  createLoaders() {
    return {
      organizationLoader: this.createOrganizationLoader(),
      clinicLoader: this.createClinicLoader(),
      assignmentsByProviderLoader: this.createAssignmentsByProviderLoader(),
      assignmentsByClinicLoader: this.createAssignmentsByClinicLoader(),
      clinicsByOrganizationLoader: this.createClinicsByOrganizationLoader(),
      providerLoader: this.createProviderLoader(),
    };
  }
}

/**
 * Request-scoped DataLoader provider
 * Creates fresh loaders for each request to prevent cross-request data leakage
 */
export const DATALOADERS = Symbol('DATALOADERS');

export interface DataLoaders {
  organizationLoader: DataLoader<string, any>;
  clinicLoader: DataLoader<string, any>;
  assignmentsByProviderLoader: DataLoader<string, any[]>;
  assignmentsByClinicLoader: DataLoader<string, any[]>;
  clinicsByOrganizationLoader: DataLoader<string, any[]>;
  providerLoader: DataLoader<string, any>;
}
