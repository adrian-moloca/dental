/**
 * Feature Flag Manager
 * Manages feature flags with tenant-specific overrides
 */

import type { TenantId } from '@dentalos/shared-types';
import type { FeaturesConfig } from '../types/config.types';
import { loadConfig } from '../loaders/config-loader';

/**
 * Feature flag manager
 * Provides runtime control over feature flags with tenant-specific overrides
 */
export class FeatureFlagManager {
  /** Global feature flags from configuration */
  private globalFlags: Map<string, boolean>;

  /** Tenant-specific feature flag overrides */
  private tenantOverrides: Map<string, Map<string, boolean>>;

  constructor(features?: FeaturesConfig) {
    this.globalFlags = new Map();
    this.tenantOverrides = new Map();

    if (features) {
      this.loadFeatures(features);
    }
  }

  /**
   * Load features from configuration
   *
   * @param features - Features configuration object
   */
  private loadFeatures(features: FeaturesConfig): void {
    Object.entries(features).forEach(([key, value]) => {
      this.globalFlags.set(key, value);
    });
  }

  /**
   * Initialize manager from loaded configuration
   *
   * @returns Initialized feature flag manager
   */
  static fromConfig(): FeatureFlagManager {
    const config = loadConfig();
    return new FeatureFlagManager(config.features);
  }

  /**
   * Check if a feature is enabled
   * Checks tenant-specific override first, then falls back to global flag
   *
   * @param flag - Feature flag name
   * @param tenantId - Optional tenant ID for tenant-specific check
   * @returns True if feature is enabled
   */
  isEnabled(flag: string, tenantId?: TenantId): boolean {
    // Check tenant-specific override first
    if (tenantId) {
      const tenantFlags = this.tenantOverrides.get(tenantId as string);
      if (tenantFlags && tenantFlags.has(flag)) {
        return tenantFlags.get(flag) ?? false;
      }
    }

    // Fall back to global flag
    return this.globalFlags.get(flag) ?? false;
  }

  /**
   * Check if a feature is disabled
   *
   * @param flag - Feature flag name
   * @param tenantId - Optional tenant ID for tenant-specific check
   * @returns True if feature is disabled
   */
  isDisabled(flag: string, tenantId?: TenantId): boolean {
    return !this.isEnabled(flag, tenantId);
  }

  /**
   * Enable a feature for a specific tenant
   *
   * @param flag - Feature flag name
   * @param tenantId - Tenant ID
   */
  enableForTenant(flag: string, tenantId: TenantId): void {
    this.setTenantOverride(flag, tenantId, true);
  }

  /**
   * Disable a feature for a specific tenant
   *
   * @param flag - Feature flag name
   * @param tenantId - Tenant ID
   */
  disableForTenant(flag: string, tenantId: TenantId): void {
    this.setTenantOverride(flag, tenantId, false);
  }

  /**
   * Set a tenant-specific override
   *
   * @param flag - Feature flag name
   * @param tenantId - Tenant ID
   * @param enabled - Whether feature is enabled
   */
  private setTenantOverride(flag: string, tenantId: TenantId, enabled: boolean): void {
    const tenantKey = tenantId as string;
    let tenantFlags = this.tenantOverrides.get(tenantKey);

    if (!tenantFlags) {
      tenantFlags = new Map();
      this.tenantOverrides.set(tenantKey, tenantFlags);
    }

    tenantFlags.set(flag, enabled);
  }

  /**
   * Remove a tenant-specific override
   * Feature will fall back to global flag value
   *
   * @param flag - Feature flag name
   * @param tenantId - Tenant ID
   */
  clearTenantOverride(flag: string, tenantId: TenantId): void {
    const tenantKey = tenantId as string;
    const tenantFlags = this.tenantOverrides.get(tenantKey);
    if (tenantFlags) {
      tenantFlags.delete(flag);

      // Clean up empty tenant override map
      if (tenantFlags.size === 0) {
        this.tenantOverrides.delete(tenantKey);
      }
    }
  }

  /**
   * Clear all overrides for a tenant
   *
   * @param tenantId - Tenant ID
   */
  clearAllTenantOverrides(tenantId: TenantId): void {
    this.tenantOverrides.delete(tenantId as string);
  }

  /**
   * Get all global feature flags
   *
   * @returns Record of all feature flags and their values
   */
  getAllFlags(): Record<string, boolean> {
    const flags: Record<string, boolean> = {};
    this.globalFlags.forEach((value, key) => {
      flags[key] = value;
    });
    return flags;
  }

  /**
   * Get all feature flags for a specific tenant
   * Merges global flags with tenant-specific overrides
   *
   * @param tenantId - Tenant ID
   * @returns Record of all feature flags for the tenant
   */
  getAllFlagsForTenant(tenantId: TenantId): Record<string, boolean> {
    const flags = this.getAllFlags();
    const tenantFlags = this.tenantOverrides.get(tenantId as string);

    if (tenantFlags) {
      tenantFlags.forEach((value, key) => {
        flags[key] = value;
      });
    }

    return flags;
  }

  /**
   * Get tenant-specific overrides only
   *
   * @param tenantId - Tenant ID
   * @returns Record of tenant-specific overrides
   */
  getTenantOverrides(tenantId: TenantId): Record<string, boolean> {
    const tenantFlags = this.tenantOverrides.get(tenantId as string);
    if (!tenantFlags) {
      return {};
    }

    const overrides: Record<string, boolean> = {};
    tenantFlags.forEach((value, key) => {
      overrides[key] = value;
    });
    return overrides;
  }

  /**
   * Check if a tenant has any overrides
   *
   * @param tenantId - Tenant ID
   * @returns True if tenant has overrides
   */
  hasTenantOverrides(tenantId: TenantId): boolean {
    const tenantFlags = this.tenantOverrides.get(tenantId as string);
    return tenantFlags ? tenantFlags.size > 0 : false;
  }

  /**
   * Get count of all tenants with overrides
   *
   * @returns Number of tenants with overrides
   */
  getTenantOverrideCount(): number {
    return this.tenantOverrides.size;
  }
}

/**
 * Create a singleton instance of FeatureFlagManager
 * Lazy-loaded on first access
 */
let globalInstance: FeatureFlagManager | null = null;

/**
 * Get the global feature flag manager instance
 *
 * @returns Global feature flag manager
 */
export function getFeatureFlagManager(): FeatureFlagManager {
  if (!globalInstance) {
    globalInstance = FeatureFlagManager.fromConfig();
  }
  return globalInstance;
}

/**
 * Reset the global feature flag manager instance
 * Useful for testing
 */
export function resetFeatureFlagManager(): void {
  globalInstance = null;
}
