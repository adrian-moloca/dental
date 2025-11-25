"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatus = void 0;
exports.checkDatabaseHealth = checkDatabaseHealth;
exports.checkRedisHealth = checkRedisHealth;
exports.createLivenessResponse = createLivenessResponse;
exports.createReadinessResponse = createReadinessResponse;
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["UP"] = "UP";
    HealthStatus["DOWN"] = "DOWN";
    HealthStatus["DEGRADED"] = "DEGRADED";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
async function checkDatabaseHealth(checkFn, timeout = 5000) {
    const startTime = Date.now();
    try {
        await Promise.race([
            checkFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Database health check timeout')), timeout)),
        ]);
        const responseTime = Date.now() - startTime;
        return {
            status: HealthStatus.UP,
            responseTime,
            lastCheck: new Date().toISOString(),
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            status: HealthStatus.DOWN,
            responseTime,
            message: error.message,
            lastCheck: new Date().toISOString(),
        };
    }
}
async function checkRedisHealth(checkFn, timeout = 3000) {
    const startTime = Date.now();
    try {
        await Promise.race([
            checkFn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Redis health check timeout')), timeout)),
        ]);
        const responseTime = Date.now() - startTime;
        return {
            status: HealthStatus.UP,
            responseTime,
            lastCheck: new Date().toISOString(),
        };
    }
    catch (error) {
        const responseTime = Date.now() - startTime;
        return {
            status: HealthStatus.DOWN,
            responseTime,
            message: error.message,
            lastCheck: new Date().toISOString(),
        };
    }
}
function createLivenessResponse() {
    return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    };
}
function createReadinessResponse(checks) {
    const allUp = Object.values(checks).every((check) => check.status === 'UP');
    return {
        status: allUp ? 'READY' : 'NOT_READY',
        timestamp: new Date().toISOString(),
        checks,
    };
}
//# sourceMappingURL=health-check.types.js.map