export interface RoutingKeyComponents {
    readonly domain: string;
    readonly entity: string;
    readonly action: string;
}
export declare function buildRoutingKey(domain: string, entity: string, action: string): string;
export declare function parseRoutingKey(routingKey: string): RoutingKeyComponents;
export declare function matchesPattern(routingKey: string, pattern: string): boolean;
