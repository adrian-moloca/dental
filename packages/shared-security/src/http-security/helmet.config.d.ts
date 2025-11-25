import { HelmetOptions } from 'helmet';
export interface SecurityHeadersConfig {
    enableHSTS?: boolean;
    hstsMaxAge?: number;
    enableCSP?: boolean;
    cspDirectives?: Record<string, string[]>;
    enableFrameguard?: boolean;
    frameguardAction?: 'deny' | 'sameorigin';
}
export declare function createHelmetConfig(config?: SecurityHeadersConfig): HelmetOptions;
export declare const DEFAULT_HELMET_CONFIG: HelmetOptions;
