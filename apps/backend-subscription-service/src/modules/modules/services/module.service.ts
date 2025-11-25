/**
 * Module Service
 * Business logic for module catalog operations
 *
 * Provides methods for:
 * - Module catalog queries
 * - Dependency validation
 * - Permission resolution
 * - Pricing calculations
 *
 * @module backend-subscription-service/modules/services
 */

import { Injectable } from '@nestjs/common';
import { ModuleRepository, FindModulesOptions } from '../repositories/module.repository';
import { Module, ModuleCode, ModuleType } from '../entities/module.entity';
import {
  validateModuleDependencies,
  getAllRequiredModules,
  getModulePermissions,
} from '../constants/module-catalog.constant';
import { NotFoundError, ValidationError } from '@dentalos/shared-errors';

/**
 * Module dependency validation result
 */
export interface DependencyValidationResult {
  valid: boolean;
  missingDependencies: ModuleCode[];
  requiredModules: ModuleCode[];
}

/**
 * Module pricing calculation result
 */
export interface PricingCalculation {
  moduleCodes: ModuleCode[];
  monthlyTotal: number;
  yearlyTotal: number;
  yearlySavings: number;
  yearlySavingsPercent: number;
  breakdown: Array<{
    code: ModuleCode;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
  }>;
}

/**
 * Module Service
 */
@Injectable()
export class ModuleService {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  /**
   * Get all modules with optional filtering
   */
  async getAllModules(options: FindModulesOptions = {}): Promise<Module[]> {
    return this.moduleRepository.findAll(options);
  }

  /**
   * Get module by ID
   */
  async getModuleById(id: string): Promise<Module> {
    const module = await this.moduleRepository.findById(id);
    if (!module) {
      throw new NotFoundError(`Module with ID ${id} not found`);
    }
    return module;
  }

  /**
   * Get module by code
   */
  async getModuleByCode(code: ModuleCode): Promise<Module> {
    const module = await this.moduleRepository.findByCode(code);
    if (!module) {
      throw new NotFoundError(`Module with code ${code} not found`);
    }
    return module;
  }

  /**
   * Get modules by codes
   */
  async getModulesByCodes(codes: ModuleCode[]): Promise<Module[]> {
    return this.moduleRepository.findByCodes(codes);
  }

  /**
   * Get all core modules
   */
  async getCoreModules(): Promise<Module[]> {
    return this.moduleRepository.findCoreModules();
  }

  /**
   * Get all premium modules
   */
  async getPremiumModules(): Promise<Module[]> {
    return this.moduleRepository.findPremiumModules();
  }

  /**
   * Get active modules available for subscription
   */
  async getAvailableModules(): Promise<Module[]> {
    return this.moduleRepository.findAvailableModules();
  }

  /**
   * Get modules by category
   */
  async getModulesByCategory(category: string): Promise<Module[]> {
    return this.moduleRepository.findByCategory(category);
  }

  /**
   * Get all module categories
   */
  async getCategories(): Promise<string[]> {
    return this.moduleRepository.getCategories();
  }

  /**
   * Search modules by query string
   */
  async searchModules(query: string, options: FindModulesOptions = {}): Promise<Module[]> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty');
    }

    return this.moduleRepository.search(query.trim(), options);
  }

  /**
   * Validate module dependencies
   * Checks if all required dependencies are present in the enabled modules list
   */
  validateDependencies(
    enabledModules: ModuleCode[],
    moduleToAdd: ModuleCode,
  ): DependencyValidationResult {
    const missingDependencies = validateModuleDependencies(enabledModules, moduleToAdd);
    const requiredModules = getAllRequiredModules(moduleToAdd);

    return {
      valid: missingDependencies.length === 0,
      missingDependencies,
      requiredModules,
    };
  }

  /**
   * Validate multiple modules and their dependencies
   * Returns modules in correct dependency order
   */
  async validateModuleSet(moduleCodes: ModuleCode[]): Promise<{
    valid: boolean;
    orderedModules: ModuleCode[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const allRequired = new Set<ModuleCode>();

    // Collect all required modules
    for (const code of moduleCodes) {
      const required = getAllRequiredModules(code);
      required.forEach((req) => allRequired.add(req));
    }

    const orderedModules = Array.from(allRequired);

    // Validate all modules exist and are available
    const modules = await this.moduleRepository.findByCodes(orderedModules);
    const foundCodes = new Set(modules.map((m) => m.code));

    for (const code of orderedModules) {
      if (!foundCodes.has(code)) {
        errors.push(`Module ${code} not found in catalog`);
      }
    }

    // Check for inactive or deprecated modules
    for (const module of modules) {
      if (!module.isActive) {
        errors.push(`Module ${module.code} is not active`);
      }
      if (module.isDeprecated) {
        errors.push(
          `Module ${module.code} is deprecated: ${module.deprecationNotice || 'No longer supported'}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      orderedModules,
      errors,
    };
  }

  /**
   * Get all permissions for a set of modules
   */
  getModulePermissions(moduleCodes: ModuleCode[]): string[] {
    return getModulePermissions(moduleCodes);
  }

  /**
   * Get permissions from database modules
   */
  async getModulePermissionsFromDb(moduleCodes: ModuleCode[]): Promise<string[]> {
    const modules = await this.moduleRepository.findByCodes(moduleCodes);
    const permissions = new Set<string>();

    for (const module of modules) {
      module.permissions.forEach((perm: string) => permissions.add(perm));
    }

    return Array.from(permissions);
  }

  /**
   * Calculate pricing for a set of modules
   */
  async calculatePricing(
    moduleCodes: ModuleCode[],
    _billingCycle: 'monthly' | 'yearly' = 'monthly',
  ): Promise<PricingCalculation> {
    const modules = await this.moduleRepository.findByCodes(moduleCodes);

    let monthlyTotal = 0;
    let yearlyTotal = 0;
    const breakdown: PricingCalculation['breakdown'] = [];

    for (const module of modules) {
      const monthlyPrice = module.pricing.monthlyPrice;
      const yearlyPrice = module.pricing.yearlyPrice;

      monthlyTotal += monthlyPrice;
      yearlyTotal += yearlyPrice;

      breakdown.push({
        code: module.code,
        name: module.name,
        monthlyPrice,
        yearlyPrice,
      });
    }

    const annualizedMonthly = monthlyTotal * 12;
    const yearlySavings = annualizedMonthly - yearlyTotal;
    const yearlySavingsPercent =
      annualizedMonthly > 0 ? Math.round((yearlySavings / annualizedMonthly) * 100) : 0;

    return {
      moduleCodes,
      monthlyTotal,
      yearlyTotal,
      yearlySavings,
      yearlySavingsPercent,
      breakdown,
    };
  }

  /**
   * Get modules that depend on a specific module
   * Useful when considering removing a module from a subscription
   */
  async getDependentModules(moduleCode: ModuleCode): Promise<Module[]> {
    return this.moduleRepository.findDependentModules(moduleCode);
  }

  /**
   * Check if a module can be safely removed from a subscription
   * Returns the modules that would be affected
   */
  async canRemoveModule(
    moduleCode: ModuleCode,
    currentModules: ModuleCode[],
  ): Promise<{
    canRemove: boolean;
    affectedModules: ModuleCode[];
    reason?: string;
  }> {
    const dependentModules = await this.getDependentModules(moduleCode);
    const affectedModules: ModuleCode[] = [];

    for (const dependent of dependentModules) {
      if (currentModules.includes(dependent.code)) {
        affectedModules.push(dependent.code);
      }
    }

    if (affectedModules.length > 0) {
      return {
        canRemove: false,
        affectedModules,
        reason: `Cannot remove ${moduleCode} because it is required by: ${affectedModules.join(', ')}`,
      };
    }

    return {
      canRemove: true,
      affectedModules: [],
    };
  }

  /**
   * Get module recommendations based on existing modules
   * Suggests complementary modules
   */
  async getRecommendations(enabledModules: ModuleCode[]): Promise<Module[]> {
    const enabledSet = new Set(enabledModules);
    const recommendations: Module[] = [];

    // Define recommendation rules
    const rules: Record<string, ModuleCode[]> = {
      [ModuleCode.CLINICAL_BASIC]: [ModuleCode.CLINICAL_ADVANCED, ModuleCode.IMAGING],
      [ModuleCode.SCHEDULING]: [ModuleCode.TELEDENTISTRY, ModuleCode.MARKETING],
      [ModuleCode.PATIENT_MANAGEMENT]: [ModuleCode.MARKETING],
      [ModuleCode.BILLING_BASIC]: [ModuleCode.INSURANCE, ModuleCode.ANALYTICS_ADVANCED],
      [ModuleCode.IMAGING]: [ModuleCode.CLINICAL_ADVANCED],
    };

    const recommended = new Set<ModuleCode>();

    // Apply rules
    for (const enabledModule of enabledModules) {
      const suggestions = rules[enabledModule];
      if (suggestions) {
        suggestions.forEach((code) => {
          if (!enabledSet.has(code)) {
            recommended.add(code);
          }
        });
      }
    }

    // Fetch recommended modules
    if (recommended.size > 0) {
      const modules = await this.moduleRepository.findByCodes(Array.from(recommended));
      recommendations.push(...modules.filter((m) => m.isAvailable()));
    }

    return recommendations;
  }

  /**
   * Check if module exists by code
   */
  async moduleExists(code: ModuleCode): Promise<boolean> {
    return this.moduleRepository.existsByCode(code);
  }

  /**
   * Get module statistics
   */
  async getModuleStats(): Promise<{
    total: number;
    core: number;
    premium: number;
    active: number;
    deprecated: number;
    categories: Record<string, number>;
  }> {
    const [total, coreModules, premiumModules, active, deprecated, categories] = await Promise.all([
      this.moduleRepository.count(),
      this.moduleRepository.count({ type: ModuleType.CORE }),
      this.moduleRepository.count({ type: ModuleType.PREMIUM }),
      this.moduleRepository.count({ isActive: true }),
      this.moduleRepository.count({ isDeprecated: true }),
      this.moduleRepository.getCategories(),
    ]);

    const categoryStats: Record<string, number> = {};
    for (const category of categories) {
      categoryStats[category] = await this.moduleRepository.count({ category });
    }

    return {
      total,
      core: coreModules,
      premium: premiumModules,
      active,
      deprecated,
      categories: categoryStats,
    };
  }

  /**
   * Get featured modules for marketing
   */
  async getFeaturedModules(limit: number = 6): Promise<Module[]> {
    // Return most popular premium modules
    return this.moduleRepository.findAll({
      type: ModuleType.PREMIUM,
      isActive: true,
      isDeprecated: false,
      sortBy: 'displayOrder',
      sortOrder: 'ASC',
      limit,
    });
  }

  /**
   * Compare modules (useful for upgrade decisions)
   */
  async compareModules(
    code1: ModuleCode,
    code2: ModuleCode,
  ): Promise<{
    module1: Module;
    module2: Module;
    priceDifference: {
      monthly: number;
      yearly: number;
    };
    featureComparison: {
      unique1: string[];
      unique2: string[];
      common: string[];
    };
    permissionComparison: {
      unique1: string[];
      unique2: string[];
      common: string[];
    };
  }> {
    const [module1, module2] = await Promise.all([
      this.getModuleByCode(code1),
      this.getModuleByCode(code2),
    ]);

    const features1 = new Set(module1.features);
    const features2 = new Set(module2.features);
    const permissions1 = new Set(module1.permissions);
    const permissions2 = new Set(module2.permissions);

    return {
      module1,
      module2,
      priceDifference: {
        monthly: module2.pricing.monthlyPrice - module1.pricing.monthlyPrice,
        yearly: module2.pricing.yearlyPrice - module1.pricing.yearlyPrice,
      },
      featureComparison: {
        unique1: module1.features.filter((f: string) => !features2.has(f)),
        unique2: module2.features.filter((f: string) => !features1.has(f)),
        common: module1.features.filter((f: string) => features2.has(f)),
      },
      permissionComparison: {
        unique1: module1.permissions.filter((p: string) => !permissions2.has(p)),
        unique2: module2.permissions.filter((p: string) => !permissions1.has(p)),
        common: module1.permissions.filter((p: string) => permissions2.has(p)),
      },
    };
  }
}
