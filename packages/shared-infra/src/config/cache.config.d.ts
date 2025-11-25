import { z } from 'zod';
declare const RedisConfigSchema: z.ZodObject<{
    host: z.ZodDefault<z.ZodString>;
    port: z.ZodDefault<z.ZodNumber>;
    password: z.ZodOptional<z.ZodString>;
    db: z.ZodDefault<z.ZodNumber>;
    keyPrefix: z.ZodDefault<z.ZodString>;
    maxRetriesPerRequest: z.ZodDefault<z.ZodNumber>;
    connectTimeout: z.ZodDefault<z.ZodNumber>;
    enableReadyCheck: z.ZodDefault<z.ZodBoolean>;
    lazyConnect: z.ZodDefault<z.ZodBoolean>;
    maxLoadingRetryTime: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    connectTimeout: number;
    db: number;
    keyPrefix: string;
    maxRetriesPerRequest: number;
    enableReadyCheck: boolean;
    lazyConnect: boolean;
    maxLoadingRetryTime: number;
    password?: string | undefined;
}, {
    host?: string | undefined;
    port?: number | undefined;
    password?: string | undefined;
    connectTimeout?: number | undefined;
    db?: number | undefined;
    keyPrefix?: string | undefined;
    maxRetriesPerRequest?: number | undefined;
    enableReadyCheck?: boolean | undefined;
    lazyConnect?: boolean | undefined;
    maxLoadingRetryTime?: number | undefined;
}>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export declare function loadRedisConfig(): RedisConfig;
export {};
