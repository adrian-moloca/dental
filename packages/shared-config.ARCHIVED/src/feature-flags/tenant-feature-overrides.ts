/**
 * Tenant Feature Overrides
 * Utilities for managing tenant-specific feature flag overrides
 */

import type { TenantId } from '@dentalos/shared-types';
import { getFeatureFlagManager } from './feature-flag-manager';

/**
 * Tenant feature override definition
 */
export interface TenantFeatureOverride {
  /** Tenant ID */
  tenantId: TenantId;
  /** Feature flag name */
  flag: string;
  /** Override value */
  enabled: boolean;
  /** Reason for override */
  reason?: string;
  /** Timestamp when override was set */
  timestamp: Date;
}

/**
 * Batch update tenant feature overrides
 *
 * @param tenantId - Tenant ID
 * @param overrides - Map of feature flags to their enabled state
 */
export function batchUpdateTenantOverrides(
  tenantId: TenantId,
  overrides: Record<string, boolean>,
): void {
  const manager = getFeatureFlagManager();

  Object.entries(overrides).forEach(([flag, enabled]) => {
    if (enabled) {
      manager.enableForTenant(flag, tenantId);
    } else {
      manager.disableForTenant(flag, tenantId);
    }
  });
}

/**
 * Apply a set of feature overrides to a tenant
 *
 * @param overrides - Array of tenant feature overrides
 */
export function applyTenantOverrides(overrides: TenantFeatureOverride[]): void {
  const manager = getFeatureFlagManager();

  overrides.forEach(({ tenantId, flag, enabled }) => {
    if (enabled) {
      manager.enableForTenant(flag, tenantId);
    } else {
      manager.disableForTenant(flag, tenantId);
    }
  });
}

/**
 * Get all overrides for a tenant with metadata
 *
 * @param tenantId - Tenant ID
 * @returns Array of tenant feature overrides
 */
export function getTenantOverridesWithMetadata(
  tenantId: TenantId,
): TenantFeatureOverride[] {
  const manager = getFeatureFlagManager();
  const overrides = manager.getTenantOverrides(tenantId);
  const timestamp = new Date();

  return Object.entries(overrides).map(([flag, enabled]) => ({
    tenantId,
    flag,
    enabled,
    timestamp,
  }));
}

/**
 * Compare tenant overrides with global flags
 * Returns flags that differ from global configuration
 *
 * @param tenantId - Tenant ID
 * @returns Record of flags that differ from global
 */
export function compareTenantOverridesWithGlobal(
  tenantId: TenantId,
): Record<string, { tenant: boolean; global: boolean }> {
  const manager = getFeatureFlagManager();
  const tenantFlags = manager.getAllFlagsForTenant(tenantId);
  const globalFlags = manager.getAllFlags();

  const differences: Record<string, { tenant: boolean; global: boolean }> = {};

  Object.keys(tenantFlags).forEach((flag) => {
    const tenantValue = tenantFlags[flag];
    const globalValue = globalFlags[flag];

    if (tenantValue !== globalValue) {
      differences[flag] = {
        tenant: tenantValue,
        global: globalValue ?? false,
      };
    }
  });

  return differences;
}

/**
 * Reset tenant to global feature flag configuration
 * Removes all tenant-specific overrides
 *
 * @param tenantId - Tenant ID
 */
export function resetTenantToGlobal(tenantId: TenantId): void {
  const manager = getFeatureFlagManager();
  manager.clearAllTenantOverrides(tenantId);
}

/**
 * Check if tenant has any feature overrides
 *
 * @param tenantId - Tenant ID
 * @returns True if tenant has overrides
 */
export function hasTenantOverrides(tenantId: TenantId): boolean {
  const manager = getFeatureFlagManager();
  return manager.hasTenantOverrides(tenantId);
}
