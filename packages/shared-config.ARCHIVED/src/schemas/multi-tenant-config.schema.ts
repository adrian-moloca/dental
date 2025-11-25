/**
 * Multi-Tenant Configuration Schema
 * Zod schema for multi-tenancy settings
 */

import { z } from 'zod';

/**
 * Multi-tenant configuration schema
 * Defines tenant isolation and access control settings
 */
export const MultiTenantConfigSchema = z.object({
  /** Tenant isolation policy */
  isolationPolicy: z
    .enum(['strict', 'relaxed'])
    .default('strict')
    .describe(
      'Tenant isolation policy: strict = no cross-tenant access, relaxed = controlled access',
    ),

  /** Enable cross-organization access for super admins */
  enableCrossOrgAccess: z
    .boolean()
    .default(false)
    .describe('Allow super admins to access multiple organizations'),

  /** Maximum number of clinics per organization */
  maxClinicsPerOrg: z
    .number()
    .int()
    .positive()
    .default(100)
    .describe('Maximum clinics allowed per organization'),
});

/**
 * Inferred TypeScript type from multi-tenant config schema
 */
export type MultiTenantConfig = z.infer<typeof MultiTenantConfigSchema>;

/**
 * Load multi-tenant configuration from environment variables
 *
 * @returns Validated multi-tenant configuration
 * @throws ZodError if validation fails
 */
export function loadMultiTenantConfig(): MultiTenantConfig {
  const isolationPolicy = process.env.DENTALOS_MULTI_TENANT_ISOLATION_POLICY?.toLowerCase();

  const rawConfig = {
    isolationPolicy:
      isolationPolicy === 'strict' || isolationPolicy === 'relaxed'
        ? isolationPolicy
        : undefined,
    enableCrossOrgAccess:
      process.env.DENTALOS_MULTI_TENANT_ENABLE_CROSS_ORG_ACCESS === 'true',
    maxClinicsPerOrg: process.env.DENTALOS_MULTI_TENANT_MAX_CLINICS_PER_ORG
      ? parseInt(process.env.DENTALOS_MULTI_TENANT_MAX_CLINICS_PER_ORG, 10)
      : undefined,
  };

  return MultiTenantConfigSchema.parse(rawConfig);
}
