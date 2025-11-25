import { Schema } from 'mongoose';
export interface AuditTrailPluginOptions {
    excludeFields?: string[];
    emitEvents?: boolean;
}
export declare function auditTrailPlugin(schema: Schema, options?: AuditTrailPluginOptions): void;
