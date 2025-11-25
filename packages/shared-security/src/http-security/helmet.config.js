"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_HELMET_CONFIG = void 0;
exports.createHelmetConfig = createHelmetConfig;
function createHelmetConfig(config) {
    const { enableHSTS = true, hstsMaxAge = 31536000, enableCSP = true, cspDirectives = {}, enableFrameguard = true, frameguardAction = 'deny', } = config || {};
    const defaultCSP = {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        ...cspDirectives,
    };
    return {
        contentSecurityPolicy: enableCSP
            ? {
                directives: defaultCSP,
            }
            : false,
        hsts: enableHSTS
            ? {
                maxAge: hstsMaxAge,
                includeSubDomains: true,
                preload: true,
            }
            : false,
        frameguard: enableFrameguard
            ? {
                action: frameguardAction,
            }
            : false,
        xssFilter: true,
        noSniff: true,
        ieNoOpen: true,
        dnsPrefetchControl: { allow: false },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    };
}
exports.DEFAULT_HELMET_CONFIG = createHelmetConfig();
//# sourceMappingURL=helmet.config.js.map