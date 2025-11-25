import { Injectable, Logger } from '@nestjs/common';
import DataLoader = require('dataloader');
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// TODO: These schemas don't exist yet in inventory service
// import { OrganizationDocument } from '../../schemas/organization.schema';
// import { ClinicDocument } from '../../schemas/clinic.schema';
// import { ProviderClinicAssignmentDocument } from '../../schemas/provider-clinic-assignment.schema';

/**
 * DataLoader Service - Batch loading and N+1 query prevention
 * Automatically batches and caches requests within a single request context
 */

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor() {} // private assignmentModel: Model<ProviderClinicAssignmentDocument>, // @InjectModel(ProviderClinicAssignmentDocument.name) // private clinicModel: Model<ClinicDocument>, // @InjectModel(ClinicDocument.name) // private organizationModel: Model<OrganizationDocument>, // @InjectModel(OrganizationDocument.name) // TODO: Uncomment when schemas are available

  /**
   * Create organization loader
   * Batches organization lookups by ID
   * TODO: Implement when schema is available
   */
  createOrganizationLoader(): DataLoader<string, any> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        this.logger.warn('Organization loader not yet implemented');
        return ids.map(() => null);
        // TODO: Uncomment when schema is available
        // const uniqueIds = [...new Set(ids)];
        // this.logger.debug(`Batch loading ${uniqueIds.length} organizations`);
        //
        // const organizations = await this.organizationModel
        //   .find({ _id: { $in: uniqueIds } })
        //   .lean()
        //   .exec();
        //
        // // Create a map for O(1) lookups
        // const orgMap = new Map(
        //   organizations.map((org) => [org._id.toString(), org]),
        // );
        //
        // // Return in same order as requested
        // return ids.map((id) => orgMap.get(id) || null);
      },
      {
        cache: true,
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10), // 10ms batching window
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create clinic loader
   * Batches clinic lookups by ID
   * TODO: Implement when schema is available
   */
  createClinicLoader(): DataLoader<string, any> {
    return new DataLoader(
      async (ids: readonly string[]) => {
        this.logger.warn('Clinic loader not yet implemented');
        return ids.map(() => null);
      },
      {
        cache: true,
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10),
        maxBatchSize: 100,
      },
    );
  }

  /**
   * Create assignment loader by provider ID
   * Batches assignment lookups for multiple providers
   * TODO: Implement when schema is available
   */
  createAssignmentsByProviderLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (providerIds: readonly string[]) => {
        this.logger.warn('Assignments by provider loader not yet implemented');
        return providerIds.map(() => []);
      },
      {
        cache: true,
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create assignment loader by clinic ID
   * Batches assignment lookups for multiple clinics
   * TODO: Implement when schema is available
   */
  createAssignmentsByClinicLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (clinicIds: readonly string[]) => {
        this.logger.warn('Assignments by clinic loader not yet implemented');
        return clinicIds.map(() => []);
      },
      {
        cache: true,
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10),
        maxBatchSize: 50,
      },
    );
  }

  /**
   * Create clinics by organization loader
   * Batches clinic lookups for multiple organizations
   * TODO: Implement when schema is available
   */
  createClinicsByOrganizationLoader(): DataLoader<string, any[]> {
    return new DataLoader(
      async (organizationIds: readonly string[]) => {
        this.logger.warn('Clinics by organization loader not yet implemented');
        return organizationIds.map(() => []);
      },
      {
        cache: true,
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10),
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
        batchScheduleFn: (callback: () => void) => setTimeout(callback, 10),
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
