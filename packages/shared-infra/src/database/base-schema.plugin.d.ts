import { Schema } from 'mongoose';
export interface BaseSchemaPluginOptions {
    softDelete?: boolean;
    versioning?: boolean;
    multiTenant?: boolean;
    audit?: boolean;
}
export declare function baseSchemaPlugin(schema: Schema, options?: BaseSchemaPluginOptions): void;
