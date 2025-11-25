import { z } from 'zod';
declare const PostgresConfigSchema: z.ZodObject<{
    host: z.ZodDefault<z.ZodString>;
    port: z.ZodDefault<z.ZodNumber>;
    database: z.ZodString;
    user: z.ZodString;
    password: z.ZodString;
    maxConnections: z.ZodDefault<z.ZodNumber>;
    idleTimeoutMillis: z.ZodDefault<z.ZodNumber>;
    connectionTimeoutMillis: z.ZodDefault<z.ZodNumber>;
    ssl: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    password: string;
    database: string;
    ssl: boolean;
    maxConnections: number;
    user: string;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}, {
    password: string;
    database: string;
    user: string;
    host?: string | undefined;
    port?: number | undefined;
    ssl?: boolean | undefined;
    maxConnections?: number | undefined;
    idleTimeoutMillis?: number | undefined;
    connectionTimeoutMillis?: number | undefined;
}>;
export type PostgresConfig = z.infer<typeof PostgresConfigSchema>;
export declare function loadPostgresConfig(): PostgresConfig;
declare const MongoDBConfigSchema: z.ZodObject<{
    uri: z.ZodString;
    database: z.ZodString;
    maxPoolSize: z.ZodDefault<z.ZodNumber>;
    minPoolSize: z.ZodDefault<z.ZodNumber>;
    maxIdleTimeMS: z.ZodDefault<z.ZodNumber>;
    serverSelectionTimeoutMS: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    database: string;
    uri: string;
    maxPoolSize: number;
    minPoolSize: number;
    maxIdleTimeMS: number;
    serverSelectionTimeoutMS: number;
}, {
    database: string;
    uri: string;
    maxPoolSize?: number | undefined;
    minPoolSize?: number | undefined;
    maxIdleTimeMS?: number | undefined;
    serverSelectionTimeoutMS?: number | undefined;
}>;
export type MongoDBConfig = z.infer<typeof MongoDBConfigSchema>;
export declare function loadMongoDBConfig(): MongoDBConfig;
export {};
