/**
 * Feature Flags barrel export
 */

export {
  FeatureFlagManager,
  getFeatureFlagManager,
  resetFeatureFlagManager,
} from './feature-flag-manager';

export {
  batchUpdateTenantOverrides,
  applyTenantOverrides,
  getTenantOverridesWithMetadata,
  compareTenantOverridesWithGlobal,
  resetTenantToGlobal,
  hasTenantOverrides,
} from './tenant-feature-overrides';

export type { TenantFeatureOverride } from './tenant-feature-overrides';
