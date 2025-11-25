"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedHelmet = EnhancedHelmet;
exports.DevelopmentHelmet = DevelopmentHelmet;
exports.AdaptiveHelmet = AdaptiveHelmet;
const helmet_1 = require("helmet");
function EnhancedHelmet() {
    return (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'", 'https://api.openai.com'],
                fontSrc: ["'self'", 'data:'],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
                upgradeInsecureRequests: [],
            },
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        dnsPrefetchControl: { allow: false },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: true,
        permittedCrossDomainPolicies: { permittedPolicies: 'none' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        xssFilter: true,
    });
}
function DevelopmentHelmet() {
    return (0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        frameguard: { action: 'sameorigin' },
        hsts: false,
    });
}
function AdaptiveHelmet() {
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction ? EnhancedHelmet() : DevelopmentHelmet();
}
//# sourceMappingURL=enhanced-helmet.js.map