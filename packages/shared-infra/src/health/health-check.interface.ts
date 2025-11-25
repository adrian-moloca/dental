/**
 * Health check status enumeration
 */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: Date;
  message?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for components that can perform health checks
 */
export interface HealthCheckable {
  healthCheck(): Promise<HealthCheckResult>;
}
