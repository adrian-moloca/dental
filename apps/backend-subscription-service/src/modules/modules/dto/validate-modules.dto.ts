/**
 * Validate Modules DTO
 * Data transfer objects for validating module dependencies and pricing
 *
 * @module backend-subscription-service/modules/dto
 */

import { IsArray, IsEnum, IsNotEmpty, ArrayMinSize, ArrayUnique } from 'class-validator';
import { ModuleCode } from '../entities/module.entity';

/**
 * Request to validate module dependencies
 */
export class ValidateDependenciesDto {
  /**
   * Currently enabled modules
   */
  @IsArray()
  @ArrayUnique()
  @IsEnum(ModuleCode, { each: true })
  enabledModules!: ModuleCode[];

  /**
   * Module to add/validate
   */
  @IsNotEmpty()
  @IsEnum(ModuleCode)
  moduleToAdd!: ModuleCode;
}

/**
 * Request to validate a set of modules
 */
export class ValidateModuleSetDto {
  /**
   * Modules to validate
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(ModuleCode, { each: true })
  modules!: ModuleCode[];
}

/**
 * Request to calculate module pricing
 */
export class CalculatePricingDto {
  /**
   * Modules to calculate pricing for
   */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(ModuleCode, { each: true })
  modules!: ModuleCode[];

  /**
   * Billing cycle for pricing calculation
   * @default 'monthly'
   */
  @IsEnum(['monthly', 'yearly'])
  billingCycle: 'monthly' | 'yearly' = 'monthly';
}

/**
 * Request to check if module can be removed
 */
export class CanRemoveModuleDto {
  /**
   * Module to potentially remove
   */
  @IsNotEmpty()
  @IsEnum(ModuleCode)
  moduleCode!: ModuleCode;

  /**
   * Currently enabled modules in subscription
   */
  @IsArray()
  @ArrayUnique()
  @IsEnum(ModuleCode, { each: true })
  currentModules!: ModuleCode[];
}

/**
 * Request to compare two modules
 */
export class CompareModulesDto {
  /**
   * First module to compare
   */
  @IsNotEmpty()
  @IsEnum(ModuleCode)
  module1!: ModuleCode;

  /**
   * Second module to compare
   */
  @IsNotEmpty()
  @IsEnum(ModuleCode)
  module2!: ModuleCode;
}

/**
 * Request to get module recommendations
 */
export class GetRecommendationsDto {
  /**
   * Currently enabled modules
   */
  @IsArray()
  @ArrayUnique()
  @IsEnum(ModuleCode, { each: true })
  enabledModules!: ModuleCode[];
}
