/**
 * In-Memory Cache
 * Simple Map-based cache implementation for testing with tenant isolation
 *
 * @module shared-testing/mocks/in-memory
 *
 * @security
 * This cache enforces multi-tenant isolation through key prefixing.
 * All cache operations can optionally be scoped to a tenant context,
 * ensuring cache keys don't leak across tenant boundaries.
 */

import type { OrganizationId, ClinicId } from '@dentalos/shared-types';

/**
 * Tenant context for scoping cache operations
 * Optional for cache operations (allows global cache entries)
 */
export interface TenantContext {
  /** Organization ID (required) */
  organizationId: OrganizationId;
  /** Clinic ID (optional, for clinic-scoped operations) */
  clinicId?: ClinicId;
}

/**
 * Cache interface with optional tenant scoping
 */
export interface CacheInterface {
  get<T>(key: string, tenantContext?: TenantContext): Promise<T | null>;
  set<T>(key: string, value: T, tenantContext?: TenantContext, ttlSeconds?: number): Promise<void>;
  delete(key: string, tenantContext?: TenantContext): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * In-memory cache for testing with tenant-scoped key prefixing
 *
 * @remarks
 * This cache enforces multi-tenant isolation through automatic key prefixing:
 * - Keys without tenant context: "global:key"
 * - Keys with org only: "org-001:key"
 * - Keys with org + clinic: "org-001:clinic-001:key"
 *
 * This prevents accidental cross-tenant cache pollution in tests and
 * accurately reflects production cache behavior.
 *
 * @example
 * ```typescript
 * const cache = new InMemoryCache();
 * const tenant1 = { organizationId: 'org-001' };
 * const tenant2 = { organizationId: 'org-002' };
 *
 * // Set for tenant 1
 * await cache.set('user:session', { userId: '123' }, tenant1);
 *
 * // Get for tenant 1 (returns data)
 * const session1 = await cache.get('user:session', tenant1);
 *
 * // Get for tenant 2 (returns null - different tenant)
 * const session2 = await cache.get('user:session', tenant2);
 *
 * // Global cache (no tenant context)
 * await cache.set('app:config', { version: '1.0.0' });
 * const config = await cache.get('app:config'); // Available globally
 * ```
 */
export class InMemoryCache implements CacheInterface {
  private store: Map<string, any> = new Map();
  private expirations: Map<string, number> = new Map();

  /**
   * Build tenant-scoped cache key
   *
   * @param key - Base cache key
   * @param tenantContext - Optional tenant context for scoping
   * @returns Scoped cache key
   *
   * @remarks
   * Key format:
   * - No context: "global:key"
   * - Org only: "org-id:key"
   * - Org + clinic: "org-id:clinic-id:key"
   */
  private buildTenantKey(key: string, tenantContext?: TenantContext): string {
    if (!tenantContext) {
      return `global:${key}`;
    }

    const clinicPrefix = tenantContext.clinicId ? `${tenantContext.clinicId}:` : '';
    return `${tenantContext.organizationId}:${clinicPrefix}${key}`;
  }

  /**
   * Get a value from cache with optional tenant scoping
   *
   * @param key - Cache key
   * @param tenantContext - Optional tenant context for scoping
   * @returns Cached value or null if not found/expired
   *
   * @security
   * Tenant context is built into the key. Cross-tenant access
   * requires exact tenant context match.
   */
  public async get<T>(key: string, tenantContext?: TenantContext): Promise<T | null> {
    const scopedKey = this.buildTenantKey(key, tenantContext);
    this.checkExpiration(scopedKey);

    const value = this.store.get(scopedKey);
    return value !== undefined ? value : null;
  }

  /**
   * Set a value in cache with optional tenant scoping and TTL
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param tenantContext - Optional tenant context for scoping
   * @param ttlSeconds - Optional TTL in seconds
   *
   * @security
   * Automatically scopes key to tenant context. Same key with
   * different tenant contexts creates separate cache entries.
   */
  public async set<T>(
    key: string,
    value: T,
    tenantContext?: TenantContext,
    ttlSeconds?: number,
  ): Promise<void> {
    const scopedKey = this.buildTenantKey(key, tenantContext);
    this.store.set(scopedKey, value);

    if (ttlSeconds) {
      const expiresAt = Date.now() + ttlSeconds * 1000;
      this.expirations.set(scopedKey, expiresAt);
    } else {
      this.expirations.delete(scopedKey);
    }
  }

  /**
   * Delete a key from cache with optional tenant scoping
   *
   * @param key - Cache key
   * @param tenantContext - Optional tenant context for scoping
   * @returns true if key existed, false otherwise
   *
   * @security
   * Only deletes key within specified tenant scope.
   */
  public async delete(key: string, tenantContext?: TenantContext): Promise<boolean> {
    const scopedKey = this.buildTenantKey(key, tenantContext);
    const existed = this.store.has(scopedKey);
    this.store.delete(scopedKey);
    this.expirations.delete(scopedKey);
    return existed;
  }

  /**
   * Check if a key exists with optional tenant scoping
   *
   * @param key - Cache key
   * @param tenantContext - Optional tenant context for scoping
   * @returns true if key exists and not expired, false otherwise
   */
  public async has(key: string, tenantContext?: TenantContext): Promise<boolean> {
    const scopedKey = this.buildTenantKey(key, tenantContext);
    this.checkExpiration(scopedKey);
    return this.store.has(scopedKey);
  }

  /**
   * Clear all cache entries (testing utility)
   *
   * @remarks
   * Clears all entries across all tenant scopes.
   * Use clearTenant() for tenant-specific cleanup.
   */
  public async clear(): Promise<void> {
    this.store.clear();
    this.expirations.clear();
  }

  /**
   * Clear all cache entries for a specific tenant
   *
   * @param tenantContext - Tenant context to clear
   *
   * @remarks
   * Only clears entries matching the tenant context prefix.
   */
  public async clearTenant(tenantContext: TenantContext): Promise<void> {
    const prefix = tenantContext.clinicId
      ? `${tenantContext.organizationId}:${tenantContext.clinicId}:`
      : `${tenantContext.organizationId}:`;

    const keysToDelete: string[] = [];

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.store.delete(key);
      this.expirations.delete(key);
    }
  }

  /**
   * Get all keys (testing utility)
   *
   * @remarks
   * Returns raw scoped keys including tenant prefixes.
   */
  public getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get all keys for a specific tenant (testing utility)
   *
   * @param tenantContext - Tenant context to filter by
   * @returns Array of base keys (without tenant prefix) for the tenant
   */
  public getTenantKeys(tenantContext: TenantContext): string[] {
    const prefix = tenantContext.clinicId
      ? `${tenantContext.organizationId}:${tenantContext.clinicId}:`
      : `${tenantContext.organizationId}:`;

    const keys: string[] = [];

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        // Remove prefix to get base key
        keys.push(key.substring(prefix.length));
      }
    }

    return keys;
  }

  /**
   * Get cache size (testing utility)
   *
   * @returns Total number of cache entries across all tenants
   */
  public size(): number {
    return this.store.size;
  }

  /**
   * Get cache size for a specific tenant (testing utility)
   *
   * @param tenantContext - Tenant context to count
   * @returns Number of cache entries for the tenant
   */
  public tenantSize(tenantContext: TenantContext): number {
    return this.getTenantKeys(tenantContext).length;
  }

  /**
   * Check and remove expired keys
   * @private
   */
  private checkExpiration(key: string): void {
    const expiresAt = this.expirations.get(key);
    if (expiresAt && Date.now() >= expiresAt) {
      this.store.delete(key);
      this.expirations.delete(key);
    }
  }
}
