import { z, ZodObject, ZodRawShape } from 'zod';
export declare function mergeSchemas<T extends ZodRawShape[]>(...schemas: {
    [K in keyof T]: ZodObject<T[K]>;
}): ZodObject<T[number]>;
export declare function extendSchema<T extends ZodRawShape, U extends ZodRawShape>(baseSchema: ZodObject<T>, extensionSchema: ZodObject<U>): ZodObject<T & U>;
export declare function makePartial<T extends ZodRawShape>(schema: ZodObject<T>): ZodObject<{
    [K in keyof T]: z.ZodOptional<T[K]>;
}>;
export declare function makeOptional<T extends ZodRawShape, K extends keyof T>(schema: ZodObject<T>, fields: K[]): ZodObject<{
    [P in keyof T]: P extends K ? z.ZodOptional<T[P]> : T[P];
}>;
export declare function makeRequired<T extends ZodRawShape, K extends keyof T>(schema: ZodObject<T>, fields: K[]): ZodObject<T>;
export declare function pickFields<T extends ZodRawShape, K extends keyof T>(schema: ZodObject<T>, fields: K[]): ZodObject<Pick<T, K>>;
export declare function omitFields<T extends ZodRawShape, K extends keyof T>(schema: ZodObject<T>, fields: K[]): ZodObject<Omit<T, K>>;
export declare function makeDeepPartial<T extends ZodRawShape>(schema: ZodObject<T>): ZodObject<{
    [K in keyof T]: z.ZodOptional<T[K]>;
}>;
export declare function allowAdditionalProperties<T extends ZodRawShape>(schema: ZodObject<T>): ZodObject<T>;
export declare function makeStrict<T extends ZodRawShape>(schema: ZodObject<T>): ZodObject<T>;
