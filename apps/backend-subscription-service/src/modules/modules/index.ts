/**
 * Modules Package Exports
 * Central export point for all module catalog functionality
 *
 * @module backend-subscription-service/modules
 */

// Module
export { ModulesModule } from './modules.module';

// Entities
export {
  Module,
  ModuleType,
  ModuleCode,
  ModulePricing,
  ModuleDependency,
} from './entities/module.entity';

// Constants
export {
  MODULE_CATALOG,
  ModuleDefinition,
  getModuleDefinition,
  getCoreModules,
  getPremiumModules,
  getModulesByCategory,
  getModuleCategories,
  calculateModulesPrice,
  validateModuleDependencies,
  getAllRequiredModules,
  getModulePermissions,
} from './constants/module-catalog.constant';

// Repository
export { ModuleRepository, FindModulesOptions } from './repositories/module.repository';

// Service
export {
  ModuleService,
  DependencyValidationResult,
  PricingCalculation,
} from './services/module.service';

// Controller
export { ModuleController } from './controllers/module.controller';

// DTOs
export {
  QueryModulesDto,
  SearchModulesDto,
  ValidateDependenciesDto,
  ValidateModuleSetDto,
  CalculatePricingDto,
  CanRemoveModuleDto,
  CompareModulesDto,
  GetRecommendationsDto,
} from './dto';

// Seeder
export { ModuleSeeder, SeederConfig, SeederResult } from './seeders/module.seeder';
