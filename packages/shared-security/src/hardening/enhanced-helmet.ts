import helmet from 'helmet';

/**
 * Enhanced Helmet configuration for DentalOS with strict security policies.
 * Provides defense against common web vulnerabilities:
 * - XSS attacks
 * - Clickjacking
 * - MIME sniffing
 * - Information disclosure
 *
 * Apply to all Express apps:
 * app.use(EnhancedHelmet());
 */
export function EnhancedHelmet() {
  return helmet({
    // Content Security Policy - Prevents XSS attacks
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Note: Remove unsafe-inline in production
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.openai.com'], // ChatGPT API
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: true,

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: { policy: 'same-origin' },

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: { policy: 'same-origin' },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Frameguard - Prevents clickjacking
    frameguard: { action: 'deny' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HSTS - Force HTTPS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },

    // IE No Open - Prevent IE from opening downloads in site context
    ieNoOpen: true,

    // No Sniff - Prevent MIME sniffing
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // X-XSS-Protection (for older browsers)
    xssFilter: true,
  });
}

/**
 * Relaxed Helmet configuration for development environments.
 * Disables some strict policies that interfere with development tools.
 */
export function DevelopmentHelmet() {
  return helmet({
    contentSecurityPolicy: false, // Disable CSP in development
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    frameguard: { action: 'sameorigin' }, // Allow same-origin framing
    hsts: false, // Disable HSTS in development
  });
}

/**
 * Returns appropriate Helmet configuration based on environment.
 */
export function AdaptiveHelmet() {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? EnhancedHelmet() : DevelopmentHelmet();
}
