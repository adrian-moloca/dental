import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export interface CorsConfig {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  allowCredentials?: boolean;
  maxAge?: number;
}

export function createCorsConfig(config?: CorsConfig): CorsOptions {
  const {
    allowedOrigins = [],
    allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Correlation-Id', 'X-Tenant-Id', 'X-Organization-Id', 'X-Clinic-Id', 'X-Expected-Version', 'X-CSRF-Token'],
    exposedHeaders = ['X-Correlation-Id', 'X-Request-Id'],
    allowCredentials = true,
    maxAge = 86400,
  } = config || {};

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.length === 0) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: allowedMethods,
    allowedHeaders: allowedHeaders,
    exposedHeaders: exposedHeaders,
    credentials: allowCredentials,
    maxAge: maxAge,
  };
}

export function createCorsConfigFromEnv(envVars: {
  CORS_ALLOWED_ORIGINS?: string;
  CORS_ALLOWED_METHODS?: string;
  CORS_ALLOW_CREDENTIALS?: string;
}): CorsOptions {
  const allowedOrigins = envVars.CORS_ALLOWED_ORIGINS
    ? envVars.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:5173'];

  const allowedMethods = envVars.CORS_ALLOWED_METHODS
    ? envVars.CORS_ALLOWED_METHODS.split(',').map(m => m.trim())
    : ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

  const allowCredentials = envVars.CORS_ALLOW_CREDENTIALS === 'true';

  return createCorsConfig({
    allowedOrigins,
    allowedMethods,
    allowCredentials,
  });
}
