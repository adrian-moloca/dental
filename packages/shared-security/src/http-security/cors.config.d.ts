import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
export interface CorsConfig {
    allowedOrigins?: string[];
    allowedMethods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
}
export declare function createCorsConfig(config?: CorsConfig): CorsOptions;
export declare function createCorsConfigFromEnv(envVars: {
    CORS_ALLOWED_ORIGINS?: string;
    CORS_ALLOWED_METHODS?: string;
    CORS_ALLOW_CREDENTIALS?: string;
}): CorsOptions;
