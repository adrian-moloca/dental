export const API_CONFIG = {
  AUTH_URL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3301/api/v1',
  ENTERPRISE_URL: import.meta.env.VITE_ENTERPRISE_API_URL || 'http://localhost:3307/api/v1',
  SUBSCRIPTION_URL: import.meta.env.VITE_SUBSCRIPTION_API_URL || 'http://localhost:3309/api/v1',
  HEALTH_URL: import.meta.env.VITE_HEALTH_AGGREGATOR_URL || 'http://localhost:3399/api/v1',
};
