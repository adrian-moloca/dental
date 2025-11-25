/**
 * Module dependency validation helpers
 * @module shared-auth/license/module-dependencies
 */

import { ModuleCode } from '../jwt/jwt-payload.types';

/**
 * Module dependency mapping
 * Defines which modules require other modules to be enabled
 *
 * @remarks
 * Dependencies are hierarchical:
 * - Advanced features require basic features
 * - Specialized modules may require foundational modules
 *
 * @example
 * IMAGING requires CLINICAL_BASIC because imaging needs clinical charting
 */
const MODULE_DEPENDENCIES: Record<ModuleCode, ModuleCode[]> = {
  // Core modules have no dependencies
  [ModuleCode.SCHEDULING]: [],
  [ModuleCode.PATIENT_MANAGEMENT]: [],
  [ModuleCode.CLINICAL_BASIC]: [],
  [ModuleCode.BILLING_BASIC]: [],

  // Premium modules with dependencies
  [ModuleCode.CLINICAL_ADVANCED]: [ModuleCode.CLINICAL_BASIC],
  [ModuleCode.IMAGING]: [ModuleCode.CLINICAL_BASIC],
  [ModuleCode.INVENTORY]: [],
  [ModuleCode.MARKETING]: [ModuleCode.PATIENT_MANAGEMENT],
  [ModuleCode.INSURANCE]: [ModuleCode.BILLING_BASIC],
  [ModuleCode.TELEDENTISTRY]: [ModuleCode.CLINICAL_BASIC, ModuleCode.SCHEDULING],
  [ModuleCode.ANALYTICS_ADVANCED]: [],
  [ModuleCode.MULTI_LOCATION]: [ModuleCode.SCHEDULING],
};

/**
 * Get direct dependencies for a module
 *
 * @param moduleCode - Module code to check
 * @returns Array of module codes this module depends on
 *
 * @example
 * ```typescript
 * const deps = getModuleDependencies(ModuleCode.IMAGING);
 * // Returns: [ModuleCode.CLINICAL_BASIC]
 * ```
 */
export function getModuleDependencies(moduleCode: ModuleCode): ModuleCode[] {
  return MODULE_DEPENDENCIES[moduleCode] || [];
}

/**
 * Get all dependencies for a module (including transitive)
 *
 * @param moduleCode - Module code to check
 * @returns Array of all module codes this module depends on
 *
 * @remarks
 * This function recursively resolves all dependencies.
 * For example, if A depends on B, and B depends on C,
 * this returns [B, C] for module A.
 *
 * @example
 * ```typescript
 * const deps = getAllModuleDependencies(ModuleCode.TELEDENTISTRY);
 * // Returns: [ModuleCode.CLINICAL_BASIC, ModuleCode.SCHEDULING]
 * ```
 */
export function getAllModuleDependencies(moduleCode: ModuleCode): ModuleCode[] {
  const visited = new Set<ModuleCode>();
  const dependencies: ModuleCode[] = [];

  function collectDependencies(code: ModuleCode): void {
    if (visited.has(code)) {
      return; // Prevent infinite loops in circular dependencies
    }

    visited.add(code);
    const deps = getModuleDependencies(code);

    for (const dep of deps) {
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
      collectDependencies(dep); // Recurse for transitive dependencies
    }
  }

  collectDependencies(moduleCode);
  return dependencies;
}

/**
 * Check if a module has dependencies
 *
 * @param moduleCode - Module code to check
 * @returns true if module has dependencies, false otherwise
 *
 * @example
 * ```typescript
 * hasModuleDependencies(ModuleCode.IMAGING); // true
 * hasModuleDependencies(ModuleCode.SCHEDULING); // false
 * ```
 */
export function hasModuleDependencies(moduleCode: ModuleCode): boolean {
  const deps = getModuleDependencies(moduleCode);
  return deps.length > 0;
}

/**
 * Validate that all dependencies for a module are met
 *
 * @param moduleCode - Module code to validate
 * @param enabledModules - Array of currently enabled module codes
 * @returns Array of missing module codes (empty if all satisfied)
 *
 * @remarks
 * This checks only direct dependencies, not transitive.
 * Use {@link validateAllDependencies} for complete validation.
 *
 * @example
 * ```typescript
 * const missing = getMissingDependencies(
 *   ModuleCode.IMAGING,
 *   [ModuleCode.SCHEDULING]
 * );
 * // Returns: [ModuleCode.CLINICAL_BASIC]
 * ```
 */
export function getMissingDependencies(
  moduleCode: ModuleCode,
  enabledModules: readonly ModuleCode[],
): ModuleCode[] {
  const requiredDeps = getModuleDependencies(moduleCode);
  return requiredDeps.filter((dep) => !enabledModules.includes(dep));
}

/**
 * Validate that all dependencies (including transitive) are met
 *
 * @param moduleCode - Module code to validate
 * @param enabledModules - Array of currently enabled module codes
 * @returns Array of all missing module codes (empty if all satisfied)
 *
 * @example
 * ```typescript
 * const missing = getAllMissingDependencies(
 *   ModuleCode.TELEDENTISTRY,
 *   [ModuleCode.SCHEDULING]
 * );
 * // Returns: [ModuleCode.CLINICAL_BASIC] (SCHEDULING is present)
 * ```
 */
export function getAllMissingDependencies(
  moduleCode: ModuleCode,
  enabledModules: readonly ModuleCode[],
): ModuleCode[] {
  const allDeps = getAllModuleDependencies(moduleCode);
  return allDeps.filter((dep) => !enabledModules.includes(dep));
}

/**
 * Check if all dependencies for a module are satisfied
 *
 * @param moduleCode - Module code to check
 * @param enabledModules - Array of currently enabled module codes
 * @returns true if all dependencies are enabled, false otherwise
 *
 * @example
 * ```typescript
 * const canEnable = areDependenciesSatisfied(
 *   ModuleCode.IMAGING,
 *   [ModuleCode.CLINICAL_BASIC]
 * );
 * // Returns: true
 * ```
 */
export function areDependenciesSatisfied(
  moduleCode: ModuleCode,
  enabledModules: readonly ModuleCode[],
): boolean {
  const missing = getMissingDependencies(moduleCode, enabledModules);
  return missing.length === 0;
}

/**
 * Get human-readable dependency error message
 *
 * @param moduleCode - Module code that has missing dependencies
 * @param missingDeps - Array of missing module codes
 * @returns Formatted error message
 *
 * @example
 * ```typescript
 * const message = getDependencyErrorMessage(
 *   ModuleCode.IMAGING,
 *   [ModuleCode.CLINICAL_BASIC]
 * );
 * // Returns: "Module 'imaging' requires the following modules: clinical_basic"
 * ```
 */
export function getDependencyErrorMessage(
  moduleCode: ModuleCode,
  missingDeps: ModuleCode[],
): string {
  if (missingDeps.length === 0) {
    return '';
  }

  const depList = missingDeps.join(', ');
  return `Module '${moduleCode}' requires the following modules: ${depList}`;
}

/**
 * Validate multiple modules and their dependencies
 *
 * @param moduleCodes - Array of module codes to validate
 * @param enabledModules - Array of currently enabled module codes
 * @returns Map of module codes to their missing dependencies
 *
 * @remarks
 * Only includes entries for modules with missing dependencies.
 * If all dependencies are satisfied, returns an empty map.
 *
 * @example
 * ```typescript
 * const issues = validateModuleDependencies(
 *   [ModuleCode.IMAGING, ModuleCode.TELEDENTISTRY],
 *   [ModuleCode.SCHEDULING]
 * );
 * // Returns: Map {
 * //   'imaging' => [ModuleCode.CLINICAL_BASIC],
 * //   'teledentistry' => [ModuleCode.CLINICAL_BASIC]
 * // }
 * ```
 */
export function validateModuleDependencies(
  moduleCodes: readonly ModuleCode[],
  enabledModules: readonly ModuleCode[],
): Map<ModuleCode, ModuleCode[]> {
  const issues = new Map<ModuleCode, ModuleCode[]>();

  for (const moduleCode of moduleCodes) {
    const missing = getMissingDependencies(moduleCode, enabledModules);
    if (missing.length > 0) {
      issues.set(moduleCode, missing);
    }
  }

  return issues;
}

/**
 * Check if a module depends on another module
 *
 * @param moduleCode - Module code to check
 * @param dependencyCode - Potential dependency module code
 * @param includeTransitive - Whether to check transitive dependencies
 * @returns true if moduleCode depends on dependencyCode
 *
 * @example
 * ```typescript
 * dependsOn(ModuleCode.IMAGING, ModuleCode.CLINICAL_BASIC); // true
 * dependsOn(ModuleCode.SCHEDULING, ModuleCode.CLINICAL_BASIC); // false
 * ```
 */
export function dependsOn(
  moduleCode: ModuleCode,
  dependencyCode: ModuleCode,
  includeTransitive: boolean = false,
): boolean {
  const deps = includeTransitive
    ? getAllModuleDependencies(moduleCode)
    : getModuleDependencies(moduleCode);

  return deps.includes(dependencyCode);
}
