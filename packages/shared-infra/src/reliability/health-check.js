"use strict";
var HealthCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = exports.HealthStatus = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
let HealthCheckService = HealthCheckService_1 = class HealthCheckService {
    constructor() {
        this.logger = new common_1.Logger(HealthCheckService_1.name);
        this.checks = new Map();
        this.startTime = Date.now();
        this.checkCache = new Map();
        this.CACHE_TTL = 5000;
    }
    register(name, checkFn) {
        this.checks.set(name, checkFn);
        this.logger.log(`Registered health check: ${name}`);
    }
    async check() {
        const checks = {};
        const results = await Promise.allSettled(Array.from(this.checks.entries()).map(async ([name, checkFn]) => {
            const cached = this.checkCache.get(name);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return { name, result: cached.result };
            }
            const startTime = Date.now();
            try {
                const result = await Promise.race([
                    checkFn(),
                    this.timeout(5000, name),
                ]);
                const responseTime = Date.now() - startTime;
                const healthResult = {
                    ...result,
                    responseTime,
                    lastCheck: new Date().toISOString(),
                };
                this.checkCache.set(name, { result: healthResult, timestamp: Date.now() });
                return { name, result: healthResult };
            }
            catch (error) {
                const responseTime = Date.now() - startTime;
                const errorResult = {
                    status: HealthStatus.UNHEALTHY,
                    message: error instanceof Error ? error.message : 'Health check failed',
                    responseTime,
                    lastCheck: new Date().toISOString(),
                };
                return { name, result: errorResult };
            }
        }));
        results.forEach((result) => {
            if (result.status === 'fulfilled') {
                checks[result.value.name] = result.value.result;
            }
        });
        const statuses = Object.values(checks).map((c) => c.status);
        let overallStatus;
        if (statuses.every((s) => s === HealthStatus.HEALTHY)) {
            overallStatus = HealthStatus.HEALTHY;
        }
        else if (statuses.some((s) => s === HealthStatus.UNHEALTHY)) {
            overallStatus = HealthStatus.UNHEALTHY;
        }
        else {
            overallStatus = HealthStatus.DEGRADED;
        }
        return {
            status: overallStatus,
            checks,
            timestamp: new Date().toISOString(),
            uptime: Date.now() - this.startTime,
        };
    }
    async liveness() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
    async readiness() {
        return this.check();
    }
    timeout(ms, name) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Health check timeout for ${name}`)), ms);
        });
    }
    static createDatabaseCheck(_db, testQuery) {
        return async () => {
            try {
                await testQuery();
                return {
                    status: HealthStatus.HEALTHY,
                    message: 'Database connection successful',
                };
            }
            catch (error) {
                return {
                    status: HealthStatus.UNHEALTHY,
                    message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        };
    }
    static createRedisCheck(redis) {
        return async () => {
            try {
                await redis.ping();
                return {
                    status: HealthStatus.HEALTHY,
                    message: 'Redis connection successful',
                };
            }
            catch (error) {
                return {
                    status: HealthStatus.UNHEALTHY,
                    message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        };
    }
    static createExternalServiceCheck(serviceName, checkFn) {
        return async () => {
            try {
                const isHealthy = await checkFn();
                return {
                    status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
                    message: isHealthy ? `${serviceName} is healthy` : `${serviceName} is degraded`,
                };
            }
            catch (error) {
                return {
                    status: HealthStatus.UNHEALTHY,
                    message: `${serviceName} check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        };
    }
};
exports.HealthCheckService = HealthCheckService;
exports.HealthCheckService = HealthCheckService = HealthCheckService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], HealthCheckService);
//# sourceMappingURL=health-check.js.map