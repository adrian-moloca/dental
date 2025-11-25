/**
 * Module Controller
 * Public API endpoints for module catalog
 *
 * All endpoints are public as modules are global catalog data.
 * No authentication/authorization required for reading module information.
 * Admin endpoints for managing modules would require auth (not implemented here).
 *
 * @module backend-subscription-service/modules/controllers
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { ModuleService } from '../services/module.service';
import { ModuleCode } from '../entities/module.entity';
import {
  QueryModulesDto,
  SearchModulesDto,
  ValidateDependenciesDto,
  ValidateModuleSetDto,
  CalculatePricingDto,
  CanRemoveModuleDto,
  CompareModulesDto,
  GetRecommendationsDto,
} from '../dto';

/**
 * Module Controller
 * Exposes module catalog API endpoints
 */
@Controller('modules')
@UseInterceptors(ClassSerializerInterceptor)
export class ModuleController {
  private readonly logger = new Logger(ModuleController.name);

  constructor(private readonly moduleService: ModuleService) {}

  /**
   * Get all modules with optional filtering
   *
   * @route GET /modules
   * @access Public
   * @example GET /modules?type=PREMIUM&isActive=true
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllModules(@Query() query: QueryModulesDto) {
    this.logger.log('GET /modules - Fetching all modules with filters');

    const modules = await this.moduleService.getAllModules(query);

    return {
      success: true,
      data: modules,
      meta: {
        count: modules.length,
        filters: {
          type: query.type,
          isActive: query.isActive,
          category: query.category,
        },
      },
    };
  }

  /**
   * Get module statistics
   *
   * @route GET /modules/stats
   * @access Public
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getModuleStats() {
    this.logger.log('GET /modules/stats - Fetching module statistics');

    const stats = await this.moduleService.getModuleStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get all module categories
   *
   * @route GET /modules/categories
   * @access Public
   */
  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async getCategories() {
    this.logger.log('GET /modules/categories - Fetching module categories');

    const categories = await this.moduleService.getCategories();

    return {
      success: true,
      data: categories,
    };
  }

  /**
   * Get featured modules for marketing
   *
   * @route GET /modules/featured
   * @access Public
   */
  @Get('featured')
  @HttpCode(HttpStatus.OK)
  async getFeaturedModules(@Query('limit') limit?: number) {
    this.logger.log(`GET /modules/featured - Fetching featured modules (limit: ${limit || 6})`);

    const modules = await this.moduleService.getFeaturedModules(limit);

    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Get all core modules
   *
   * @route GET /modules/core
   * @access Public
   */
  @Get('core')
  @HttpCode(HttpStatus.OK)
  async getCoreModules() {
    this.logger.log('GET /modules/core - Fetching core modules');

    const modules = await this.moduleService.getCoreModules();

    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Get all premium modules
   *
   * @route GET /modules/premium
   * @access Public
   */
  @Get('premium')
  @HttpCode(HttpStatus.OK)
  async getPremiumModules() {
    this.logger.log('GET /modules/premium - Fetching premium modules');

    const modules = await this.moduleService.getPremiumModules();

    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Get available modules (active and not deprecated)
   *
   * @route GET /modules/available
   * @access Public
   */
  @Get('available')
  @HttpCode(HttpStatus.OK)
  async getAvailableModules() {
    this.logger.log('GET /modules/available - Fetching available modules');

    const modules = await this.moduleService.getAvailableModules();

    return {
      success: true,
      data: modules,
    };
  }

  /**
   * Search modules by query string
   *
   * @route GET /modules/search
   * @access Public
   * @example GET /modules/search?q=imaging&type=PREMIUM
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchModules(@Query() query: SearchModulesDto) {
    this.logger.log(`GET /modules/search - Searching modules with query: ${query.q}`);

    const modules = await this.moduleService.searchModules(query.q, query);

    return {
      success: true,
      data: modules,
      meta: {
        query: query.q,
        count: modules.length,
      },
    };
  }

  /**
   * Get modules by category
   *
   * @route GET /modules/category/:category
   * @access Public
   */
  @Get('category/:category')
  @HttpCode(HttpStatus.OK)
  async getModulesByCategory(@Param('category') category: string) {
    this.logger.log(`GET /modules/category/${category} - Fetching modules by category`);

    const modules = await this.moduleService.getModulesByCategory(category);

    return {
      success: true,
      data: modules,
      meta: {
        category,
        count: modules.length,
      },
    };
  }

  /**
   * Get module by code
   *
   * @route GET /modules/code/:code
   * @access Public
   */
  @Get('code/:code')
  @HttpCode(HttpStatus.OK)
  async getModuleByCode(@Param('code') code: ModuleCode) {
    this.logger.log(`GET /modules/code/${code} - Fetching module by code`);

    const module = await this.moduleService.getModuleByCode(code);

    return {
      success: true,
      data: module,
    };
  }

  /**
   * Get module by ID
   *
   * @route GET /modules/:id
   * @access Public
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getModuleById(@Param('id') id: string) {
    this.logger.log(`GET /modules/${id} - Fetching module by ID`);

    const module = await this.moduleService.getModuleById(id);

    return {
      success: true,
      data: module,
    };
  }

  /**
   * Validate module dependencies
   *
   * @route POST /modules/validate/dependencies
   * @access Public
   */
  @Post('validate/dependencies')
  @HttpCode(HttpStatus.OK)
  async validateDependencies(@Body() dto: ValidateDependenciesDto) {
    this.logger.log(
      `POST /modules/validate/dependencies - Validating dependencies for ${dto.moduleToAdd}`,
    );

    const result = this.moduleService.validateDependencies(dto.enabledModules, dto.moduleToAdd);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Validate a set of modules
   *
   * @route POST /modules/validate/set
   * @access Public
   */
  @Post('validate/set')
  @HttpCode(HttpStatus.OK)
  async validateModuleSet(@Body() dto: ValidateModuleSetDto) {
    this.logger.log(
      `POST /modules/validate/set - Validating module set: ${dto.modules.join(', ')}`,
    );

    const result = await this.moduleService.validateModuleSet(dto.modules);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Calculate pricing for modules
   *
   * @route POST /modules/calculate/pricing
   * @access Public
   */
  @Post('calculate/pricing')
  @HttpCode(HttpStatus.OK)
  async calculatePricing(@Body() dto: CalculatePricingDto) {
    this.logger.log(
      `POST /modules/calculate/pricing - Calculating pricing for ${dto.modules.length} modules`,
    );

    const result = await this.moduleService.calculatePricing(dto.modules, dto.billingCycle);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Check if module can be removed
   *
   * @route POST /modules/validate/can-remove
   * @access Public
   */
  @Post('validate/can-remove')
  @HttpCode(HttpStatus.OK)
  async canRemoveModule(@Body() dto: CanRemoveModuleDto) {
    this.logger.log(
      `POST /modules/validate/can-remove - Checking if ${dto.moduleCode} can be removed`,
    );

    const result = await this.moduleService.canRemoveModule(dto.moduleCode, dto.currentModules);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Compare two modules
   *
   * @route POST /modules/compare
   * @access Public
   */
  @Post('compare')
  @HttpCode(HttpStatus.OK)
  async compareModules(@Body() dto: CompareModulesDto) {
    this.logger.log(`POST /modules/compare - Comparing ${dto.module1} vs ${dto.module2}`);

    const result = await this.moduleService.compareModules(dto.module1, dto.module2);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get module recommendations
   *
   * @route POST /modules/recommendations
   * @access Public
   */
  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(@Body() dto: GetRecommendationsDto) {
    this.logger.log(
      `POST /modules/recommendations - Getting recommendations for ${dto.enabledModules.length} modules`,
    );

    const recommendations = await this.moduleService.getRecommendations(dto.enabledModules);

    return {
      success: true,
      data: recommendations,
      meta: {
        count: recommendations.length,
      },
    };
  }

  /**
   * Get modules that depend on a specific module
   *
   * @route GET /modules/:code/dependents
   * @access Public
   */
  @Get(':code/dependents')
  @HttpCode(HttpStatus.OK)
  async getDependentModules(@Param('code') code: ModuleCode) {
    this.logger.log(`GET /modules/${code}/dependents - Fetching dependent modules`);

    const dependents = await this.moduleService.getDependentModules(code);

    return {
      success: true,
      data: dependents,
      meta: {
        moduleCode: code,
        count: dependents.length,
      },
    };
  }
}
