export enum HealthStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
}

export interface HealthCheckResult {
  status: HealthStatus;
  timestamp: string;
  service: string;
  version?: string;
  uptime?: number;
  dependencies?: Record<string, DependencyHealth>;
  details?: Record<string, any>;
}

export interface DependencyHealth {
  status: HealthStatus;
  responseTime?: number;
  message?: string;
  lastCheck?: string;
}

export interface LivenessResponse {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
}

export interface ReadinessResponse {
  status: 'READY' | 'NOT_READY';
  timestamp: string;
  checks: Record<string, CheckResult>;
}

export interface CheckResult {
  status: 'UP' | 'DOWN';
  message?: string;
  responseTime?: number;
}

export async function checkDatabaseHealth(
  checkFn: () => Promise<void>,
  timeout = 5000
): Promise<DependencyHealth> {
  const startTime = Date.now();
  try {
    await Promise.race([
      checkFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database health check timeout')), timeout)
      ),
    ]);
    const responseTime = Date.now() - startTime;
    return {
      status: HealthStatus.UP,
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      status: HealthStatus.DOWN,
      responseTime,
      message: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}

export async function checkRedisHealth(
  checkFn: () => Promise<void>,
  timeout = 3000
): Promise<DependencyHealth> {
  const startTime = Date.now();
  try {
    await Promise.race([
      checkFn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis health check timeout')), timeout)
      ),
    ]);
    const responseTime = Date.now() - startTime;
    return {
      status: HealthStatus.UP,
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      status: HealthStatus.DOWN,
      responseTime,
      message: error.message,
      lastCheck: new Date().toISOString(),
    };
  }
}

export function createLivenessResponse(): LivenessResponse {
  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

export function createReadinessResponse(
  checks: Record<string, CheckResult>
): ReadinessResponse {
  const allUp = Object.values(checks).every((check) => check.status === 'UP');

  return {
    status: allUp ? 'READY' : 'NOT_READY',
    timestamp: new Date().toISOString(),
    checks,
  };
}
