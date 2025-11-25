/**
 * Environment Configuration
 *
 * Centralized environment variables with type safety and validation.
 * All values use direct property access from import.meta.env
 */

interface EnvConfig {
  AUTH_API_URL: string;
  PATIENT_API_URL: string;
  PROVIDER_API_URL: string;
  SCHEDULING_API_URL: string;
  CLINICAL_API_URL: string;
  BILLING_API_URL: string;
  INVENTORY_API_URL: string;
  ENTERPRISE_API_URL: string;
  HEALTH_AGGREGATOR_URL: string;
  IMAGING_API_URL: string;
}

export const env: EnvConfig = {
  AUTH_API_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3301/api/v1',
  PATIENT_API_URL: import.meta.env.VITE_PATIENT_API_URL || 'http://localhost:3304/api/v1',
  PROVIDER_API_URL: import.meta.env.VITE_PROVIDER_API_URL || 'http://localhost:3303/api/v1',
  SCHEDULING_API_URL: import.meta.env.VITE_SCHEDULING_API_URL || 'http://localhost:3302/api/v1',
  CLINICAL_API_URL: import.meta.env.VITE_CLINICAL_API_URL || 'http://localhost:3305/api/v1',
  BILLING_API_URL: import.meta.env.VITE_BILLING_API_URL || 'http://localhost:3310/api/v1',
  INVENTORY_API_URL: import.meta.env.VITE_INVENTORY_API_URL || 'http://localhost:3308/api/v1',
  ENTERPRISE_API_URL: import.meta.env.VITE_ENTERPRISE_API_URL || 'http://localhost:3317/api/v1',
  HEALTH_AGGREGATOR_URL: import.meta.env.VITE_HEALTH_AGGREGATOR_URL || 'http://localhost:3399/api/v1',
  IMAGING_API_URL: import.meta.env.VITE_IMAGING_API_URL || 'http://localhost:3008/api/v1',
};
