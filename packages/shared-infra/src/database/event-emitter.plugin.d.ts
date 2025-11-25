import { Schema } from 'mongoose';
export interface EventEmitterPluginOptions {
    eventPrefix: string;
    payloadTransformer?: (doc: any, eventType: string) => Record<string, unknown>;
    enabled?: boolean;
}
export declare function eventEmitterPlugin(schema: Schema, options: EventEmitterPluginOptions): void;
