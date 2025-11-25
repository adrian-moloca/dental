/**
 * Module Entity
 * Represents a software module/feature in the DentalOS platform catalog
 *
 * Modules are global entities (not tenant-scoped) that define available
 * features and capabilities that can be included in subscription plans.
 *
 * @module backend-subscription-service/modules
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { UUID } from '@dentalos/shared-types';

/**
 * Module type enumeration
 */
export enum ModuleType {
  /** Core modules included in all plans */
  CORE = 'CORE',
  /** Premium modules available as add-ons */
  PREMIUM = 'PREMIUM',
}

/**
 * Module code enumeration
 * Unique identifier for each module in the system
 */
export enum ModuleCode {
  // Core Modules (included in base subscription)
  SCHEDULING = 'scheduling',
  PATIENT_MANAGEMENT = 'patient_management',
  CLINICAL_BASIC = 'clinical_basic',
  BILLING_BASIC = 'billing_basic',

  // Premium Modules (add-ons)
  CLINICAL_ADVANCED = 'clinical_advanced',
  IMAGING = 'imaging',
  INVENTORY = 'inventory',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TELEDENTISTRY = 'teledentistry',
  ANALYTICS_ADVANCED = 'analytics_advanced',
  MULTI_LOCATION = 'multi_location',
}

/**
 * Module pricing configuration
 */
export interface ModulePricing {
  /** Monthly price in USD cents (0 for core modules) */
  monthlyPrice: number;
  /** Yearly price in USD cents (0 for core modules, usually ~10 months of monthly) */
  yearlyPrice: number;
  /** Whether this module has usage-based pricing */
  usageBased?: boolean;
  /** Trial period in days */
  trialPeriodDays?: number;
}

/**
 * Module dependency configuration
 */
export interface ModuleDependency {
  /** Code of the required module */
  moduleCode: ModuleCode;
  /** Whether this dependency is optional */
  optional?: boolean;
  /** Description of why this dependency is required */
  reason?: string;
}

/**
 * Module Entity
 *
 * Global catalog of all available modules/features in the platform.
 * Modules are not tenant-specific - they define what features exist.
 * Tenants subscribe to modules via their subscription plans.
 *
 * Database indexes:
 * - Primary key on id (UUID)
 * - Unique index on code (module code must be unique)
 * - Composite index on (type, isActive) for filtering active modules by type
 * - Composite index on (isActive, displayOrder) for UI listing
 */
@Entity('modules')
@Index(['code'], { unique: true })
@Index(['type', 'isActive'])
@Index(['isActive', 'displayOrder'])
export class Module {
  /**
   * Unique module identifier (UUID v4)
   */
  @PrimaryGeneratedColumn('uuid')
  id!: UUID;

  /**
   * Module code - unique identifier used in code
   * @example 'scheduling', 'clinical_advanced'
   */
  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  code!: ModuleCode;

  /**
   * Human-readable module name
   * @example 'Appointment Scheduling', 'Advanced Clinical Features'
   */
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  /**
   * Detailed module description
   */
  @Column({ type: 'text' })
  description!: string;

  /**
   * Module type (CORE or PREMIUM)
   */
  @Column({
    type: 'enum',
    enum: ModuleType,
  })
  type!: ModuleType;

  /**
   * List of key features included in this module
   * Stored as JSONB array
   */
  @Column({ type: 'jsonb', default: [] })
  features!: string[];

  /**
   * Permissions granted by this module
   * Format: 'resource.action' (e.g., 'scheduling.appointment.create')
   * Stored as JSONB array for efficient querying
   */
  @Column({ type: 'jsonb', default: [] })
  permissions!: string[];

  /**
   * Pricing configuration for this module
   * Stored as JSONB for flexible pricing structure
   */
  @Column({ type: 'jsonb' })
  pricing!: ModulePricing;

  /**
   * Module dependencies
   * Other modules that must be enabled for this module to work
   * Stored as JSONB array
   */
  @Column({ type: 'jsonb', default: [] })
  dependencies!: ModuleDependency[];

  /**
   * Whether this module is currently active and available for subscription
   */
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive!: boolean;

  /**
   * Whether this module is deprecated and will be removed in the future
   */
  @Column({ type: 'boolean', name: 'is_deprecated', default: false })
  isDeprecated!: boolean;

  /**
   * Deprecation notice message (if deprecated)
   */
  @Column({ type: 'text', name: 'deprecation_notice', nullable: true })
  deprecationNotice?: string;

  /**
   * Module display order in UI (lower numbers appear first)
   */
  @Column({ type: 'integer', name: 'display_order', default: 0 })
  displayOrder!: number;

  /**
   * Category for grouping modules in UI
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  /**
   * Icon identifier for UI display
   */
  @Column({ type: 'varchar', length: 100, nullable: true })
  icon?: string;

  /**
   * Marketing/sales description for this module
   */
  @Column({ type: 'text', name: 'marketing_description', nullable: true })
  marketingDescription?: string;

  /**
   * Metadata for additional module configuration
   * Stored as JSONB for flexible key-value storage
   */
  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  /**
   * Version number for optimistic locking
   */
  @Column({ type: 'integer', default: 1 })
  version!: number;

  /**
   * Creation timestamp (auto-managed by TypeORM)
   */
  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  /**
   * Last update timestamp (auto-managed by TypeORM)
   */
  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  // ============================================================================
  // Business Logic Methods
  // ============================================================================

  /**
   * Check if this module has a specific permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Check if this module depends on another module
   */
  dependsOn(moduleCode: ModuleCode): boolean {
    return this.dependencies.some((dep: ModuleDependency) => dep.moduleCode === moduleCode);
  }

  /**
   * Get required (non-optional) dependencies
   */
  getRequiredDependencies(): ModuleCode[] {
    return this.dependencies
      .filter((dep: ModuleDependency) => !dep.optional)
      .map((dep: ModuleDependency) => dep.moduleCode);
  }

  /**
   * Get optional dependencies
   */
  getOptionalDependencies(): ModuleCode[] {
    return this.dependencies
      .filter((dep: ModuleDependency) => dep.optional)
      .map((dep: ModuleDependency) => dep.moduleCode);
  }

  /**
   * Check if module is available for new subscriptions
   */
  isAvailable(): boolean {
    return this.isActive && !this.isDeprecated;
  }

  /**
   * Get monthly price in dollars
   */
  getMonthlyPriceUSD(): number {
    return this.pricing.monthlyPrice / 100;
  }

  /**
   * Get yearly price in dollars
   */
  getYearlyPriceUSD(): number {
    return this.pricing.yearlyPrice / 100;
  }

  /**
   * Calculate yearly savings percentage
   */
  getYearlySavingsPercent(): number {
    if (this.pricing.monthlyPrice === 0) return 0;
    const monthlyTotal = this.pricing.monthlyPrice * 12;
    if (monthlyTotal === 0) return 0;
    return Math.round(((monthlyTotal - this.pricing.yearlyPrice) / monthlyTotal) * 100);
  }
}
