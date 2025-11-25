import { z } from 'zod';
declare const OpenSearchConfigSchema: z.ZodObject<{
    node: z.ZodDefault<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    maxRetries: z.ZodDefault<z.ZodNumber>;
    requestTimeout: z.ZodDefault<z.ZodNumber>;
    sniffOnStart: z.ZodDefault<z.ZodBoolean>;
    sniffInterval: z.ZodOptional<z.ZodNumber>;
    ssl: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    ssl: boolean;
    node: string;
    maxRetries: number;
    requestTimeout: number;
    sniffOnStart: boolean;
    username?: string | undefined;
    password?: string | undefined;
    sniffInterval?: number | undefined;
}, {
    username?: string | undefined;
    password?: string | undefined;
    ssl?: boolean | undefined;
    node?: string | undefined;
    maxRetries?: number | undefined;
    requestTimeout?: number | undefined;
    sniffOnStart?: boolean | undefined;
    sniffInterval?: number | undefined;
}>;
export type OpenSearchConfig = z.infer<typeof OpenSearchConfigSchema>;
export declare function loadOpenSearchConfig(): OpenSearchConfig;
export {};
