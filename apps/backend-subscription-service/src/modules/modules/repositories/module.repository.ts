/**
 * Module Repository
 * Data access layer for Module entities using TypeORM
 *
 * NOTE: Modules are GLOBAL entities (not tenant-scoped).
 * They define the catalog of available features in the platform.
 * No tenant filtering is required for module operations.
 *
 * @module backend-subscription-service/modules/repositories
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Module, ModuleCode, ModuleType } from '../entities/module.entity';

/**
 * Query options for finding modules
 */
export interface FindModulesOptions {
  /** Filter by module type */
  type?: ModuleType;
  /** Filter by active status */
  isActive?: boolean;
  /** Filter by deprecated status */
  isDeprecated?: boolean;
  /** Filter by category */
  category?: string;
  /** Include inactive modules */
  includeInactive?: boolean;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'ASC' | 'DESC';
  /** Limit results */
  limit?: number;
  /** Skip results */
  skip?: number;
}

/**
 * Module Repository
 * Handles all database operations for Module entities
 */
@Injectable()
export class ModuleRepository {
  private readonly logger = new Logger(ModuleRepository.name);

  constructor(
    @InjectRepository(Module)
    private readonly repository: Repository<Module>,
  ) {}

  /**
   * Find all modules with optional filtering
   */
  async findAll(options: FindModulesOptions = {}): Promise<Module[]> {
    const {
      type,
      isActive,
      isDeprecated,
      category,
      includeInactive = false,
      sortBy = 'displayOrder',
      sortOrder = 'ASC',
      limit,
      skip,
    } = options;

    const where: FindOptionsWhere<Module> = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else if (!includeInactive) {
      // By default, only show active modules
      where.isActive = true;
    }

    if (isDeprecated !== undefined) {
      where.isDeprecated = isDeprecated;
    }

    if (category) {
      where.category = category;
    }

    return this.repository.find({
      where,
      order: { [sortBy]: sortOrder },
      take: limit,
      skip,
    });
  }

  /**
   * Find module by ID
   */
  async findById(id: string): Promise<Module | null> {
    return this.repository.findOne({ where: { id: id as any } });
  }

  /**
   * Find module by code
   */
  async findByCode(code: ModuleCode): Promise<Module | null> {
    return this.repository.findOne({ where: { code } });
  }

  /**
   * Find modules by codes
   */
  async findByCodes(codes: ModuleCode[]): Promise<Module[]> {
    return this.repository.find({ where: { code: In(codes) } });
  }

  /**
   * Find all core modules
   */
  async findCoreModules(): Promise<Module[]> {
    return this.findAll({ type: ModuleType.CORE });
  }

  /**
   * Find all premium modules
   */
  async findPremiumModules(): Promise<Module[]> {
    return this.findAll({ type: ModuleType.PREMIUM });
  }

  /**
   * Find active modules available for subscription
   */
  async findAvailableModules(): Promise<Module[]> {
    return this.repository.find({
      where: {
        isActive: true,
        isDeprecated: false,
      },
      order: { displayOrder: 'ASC' },
    });
  }

  /**
   * Find modules by category
   */
  async findByCategory(category: string): Promise<Module[]> {
    return this.findAll({ category });
  }

  /**
   * Create a new module
   */
  async create(moduleData: Partial<Module>): Promise<Module> {
    try {
      const module = this.repository.create(moduleData);
      const saved = await this.repository.save(module);
      this.logger.log(`Module created: ${saved.code}`);
      return saved;
    } catch (error: any) {
      this.logger.error(`Failed to create module: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create multiple modules (bulk insert)
   */
  async createMany(modulesData: Partial<Module>[]): Promise<Module[]> {
    try {
      const modules = this.repository.create(modulesData);
      const saved = await this.repository.save(modules, { chunk: 100 });
      this.logger.log(`${saved.length} modules created`);
      return saved;
    } catch (error: any) {
      // Handle duplicate key errors gracefully
      if (error.code === '23505') {
        // PostgreSQL unique violation
        this.logger.warn('Some modules already exist, attempting individual inserts');
        const results: Module[] = [];
        for (const data of modulesData) {
          try {
            const module = await this.create(data);
            results.push(module);
          } catch (err: any) {
            if (err.code === '23505') {
              this.logger.warn(`Module ${data.code} already exists, skipping`);
            } else {
              throw err;
            }
          }
        }
        return results;
      }
      this.logger.error(`Failed to create modules: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update module by ID
   */
  async updateById(id: string, update: Partial<Module>): Promise<Module | null> {
    try {
      await this.repository.update({ id: id as any }, update);
      const updated = await this.findById(id);

      if (updated) {
        this.logger.log(`Module updated: ${updated.code}`);
      }

      return updated;
    } catch (error: any) {
      this.logger.error(`Failed to update module ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update module by code
   */
  async updateByCode(code: ModuleCode, update: Partial<Module>): Promise<Module | null> {
    try {
      await this.repository.update({ code }, update);
      const updated = await this.findByCode(code);

      if (updated) {
        this.logger.log(`Module updated: ${updated.code}`);
      }

      return updated;
    } catch (error: any) {
      this.logger.error(`Failed to update module ${code}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upsert module by code (create or update)
   */
  async upsertByCode(code: ModuleCode, moduleData: Partial<Module>): Promise<Module> {
    try {
      const existing = await this.findByCode(code);

      if (existing) {
        // Update existing
        await this.repository.update({ code }, moduleData);
        const updated = await this.findByCode(code);
        this.logger.log(`Module updated: ${code}`);
        return updated!;
      } else {
        // Create new
        const created = await this.create({ ...moduleData, code });
        this.logger.log(`Module created: ${code}`);
        return created;
      }
    } catch (error: any) {
      this.logger.error(`Failed to upsert module ${code}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete module by ID
   * Note: We don't actually delete modules, just mark as inactive/deprecated
   */
  async softDeleteById(id: string, reason?: string): Promise<Module | null> {
    return this.updateById(id, {
      isActive: false,
      isDeprecated: true,
      deprecationNotice: reason || 'Module has been deprecated',
    });
  }

  /**
   * Soft delete module by code
   */
  async softDeleteByCode(code: ModuleCode, reason?: string): Promise<Module | null> {
    return this.updateByCode(code, {
      isActive: false,
      isDeprecated: true,
      deprecationNotice: reason || 'Module has been deprecated',
    });
  }

  /**
   * Activate module
   */
  async activate(id: string): Promise<Module | null> {
    return this.updateById(id, { isActive: true });
  }

  /**
   * Deactivate module
   */
  async deactivate(id: string): Promise<Module | null> {
    return this.updateById(id, { isActive: false });
  }

  /**
   * Check if module exists by code
   */
  async existsByCode(code: ModuleCode): Promise<boolean> {
    const count = await this.repository.count({ where: { code } });
    return count > 0;
  }

  /**
   * Count modules matching filter
   */
  async count(where: FindOptionsWhere<Module> = {}): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Delete all modules (use with caution - for testing only)
   */
  async deleteAll(): Promise<{ deletedCount: number }> {
    this.logger.warn('Deleting all modules from database');
    const result = await this.repository.delete({});
    return { deletedCount: result.affected || 0 };
  }

  /**
   * Find modules that have a specific permission
   * Uses JSONB array containment operator
   */
  async findByPermission(permission: string): Promise<Module[]> {
    return this.repository
      .createQueryBuilder('module')
      .where('module.isActive = :isActive', { isActive: true })
      .andWhere('module.permissions @> :permissions', {
        permissions: JSON.stringify([permission]),
      })
      .getMany();
  }

  /**
   * Find modules that depend on a specific module
   * Uses JSONB query for dependencies array
   */
  async findDependentModules(moduleCode: ModuleCode): Promise<Module[]> {
    return this.repository
      .createQueryBuilder('module')
      .where('module.isActive = :isActive', { isActive: true })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(module.dependencies) AS dep
          WHERE dep->>'moduleCode' = :moduleCode
        )`,
        { moduleCode },
      )
      .getMany();
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('module')
      .select('DISTINCT module.category', 'category')
      .where('module.category IS NOT NULL')
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  /**
   * Update module pricing
   */
  async updatePricing(
    code: ModuleCode,
    pricing: {
      monthlyPrice?: number;
      yearlyPrice?: number;
      usageBased?: boolean;
      trialPeriodDays?: number;
    },
  ): Promise<Module | null> {
    const module = await this.findByCode(code);
    if (!module) return null;

    const updatedPricing = {
      ...module.pricing,
      ...pricing,
    };

    return this.updateByCode(code, { pricing: updatedPricing });
  }

  /**
   * Add permission to module
   */
  async addPermission(code: ModuleCode, permission: string): Promise<Module | null> {
    const module = await this.findByCode(code);
    if (!module) return null;

    if (!module.permissions.includes(permission)) {
      module.permissions.push(permission);
      await this.repository.save(module);
      this.logger.log(`Permission ${permission} added to module ${code}`);
    }

    return module;
  }

  /**
   * Remove permission from module
   */
  async removePermission(code: ModuleCode, permission: string): Promise<Module | null> {
    const module = await this.findByCode(code);
    if (!module) return null;

    module.permissions = module.permissions.filter((p) => p !== permission);
    await this.repository.save(module);
    this.logger.log(`Permission ${permission} removed from module ${code}`);

    return module;
  }

  /**
   * Add feature to module
   */
  async addFeature(code: ModuleCode, feature: string): Promise<Module | null> {
    const module = await this.findByCode(code);
    if (!module) return null;

    if (!module.features.includes(feature)) {
      module.features.push(feature);
      await this.repository.save(module);
      this.logger.log(`Feature ${feature} added to module ${code}`);
    }

    return module;
  }

  /**
   * Remove feature from module
   */
  async removeFeature(code: ModuleCode, feature: string): Promise<Module | null> {
    const module = await this.findByCode(code);
    if (!module) return null;

    module.features = module.features.filter((f) => f !== feature);
    await this.repository.save(module);
    this.logger.log(`Feature ${feature} removed from module ${code}`);

    return module;
  }

  /**
   * Search modules by name or description
   */
  async search(query: string, options: FindModulesOptions = {}): Promise<Module[]> {
    const qb = this.repository
      .createQueryBuilder('module')
      .where(
        '(module.name ILIKE :query OR module.description ILIKE :query OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(module.features) AS feature WHERE feature ILIKE :query))',
        { query: `%${query}%` },
      );

    // Apply additional filters from options
    if (options.type) {
      qb.andWhere('module.type = :type', { type: options.type });
    }
    if (options.isActive !== undefined) {
      qb.andWhere('module.isActive = :isActive', { isActive: options.isActive });
    } else if (!options.includeInactive) {
      qb.andWhere('module.isActive = :isActive', { isActive: true });
    }
    if (options.category) {
      qb.andWhere('module.category = :category', { category: options.category });
    }

    // Apply sorting
    const sortBy = options.sortBy || 'displayOrder';
    const sortOrder = options.sortOrder || 'ASC';
    qb.orderBy(`module.${sortBy}`, sortOrder);

    // Apply pagination
    if (options.skip) qb.skip(options.skip);
    if (options.limit) qb.take(options.limit);

    return qb.getMany();
  }
}
