"use strict";
var DependencyHealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyHealthService = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let DependencyHealthService = DependencyHealthService_1 = class DependencyHealthService {
    constructor() {
        this.logger = new common_1.Logger(DependencyHealthService_1.name);
    }
    async checkHttpEndpoint(options) {
        const { url, timeout = 5000, expectedStatus = 200, retries = 1, } = options;
        const startTime = Date.now();
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await axios_1.default.get(url, {
                    timeout,
                    validateStatus: (status) => status === expectedStatus,
                    headers: {
                        'User-Agent': 'DentalOS-HealthAggregator/1.0',
                    },
                });
                const responseTime = Date.now() - startTime;
                return {
                    name: this.extractServiceName(url),
                    status: 'up',
                    responseTime,
                    metadata: {
                        statusCode: response.status,
                        attempt,
                    },
                };
            }
            catch (error) {
                if (attempt === retries) {
                    const responseTime = Date.now() - startTime;
                    const errorMessage = this.extractErrorMessage(error);
                    this.logger.warn(`HTTP endpoint check failed: ${url} - ${errorMessage}`);
                    return {
                        name: this.extractServiceName(url),
                        status: 'down',
                        responseTime,
                        error: errorMessage,
                        metadata: {
                            attempts: retries,
                        },
                    };
                }
                await this.sleep(Math.pow(2, attempt) * 100);
            }
        }
        return {
            name: this.extractServiceName(url),
            status: 'down',
            error: 'All retry attempts failed',
        };
    }
    async checkDatabaseConnection(dataSource, name = 'database') {
        const startTime = Date.now();
        try {
            if (!dataSource.isInitialized) {
                return {
                    name,
                    status: 'down',
                    error: 'DataSource not initialized',
                };
            }
            await dataSource.query('SELECT 1');
            const responseTime = Date.now() - startTime;
            return {
                name,
                status: 'up',
                responseTime,
                metadata: {
                    driver: dataSource.driver.options.type,
                    database: dataSource.driver.database,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = this.extractErrorMessage(error);
            this.logger.error(`Database health check failed: ${errorMessage}`);
            return {
                name,
                status: 'down',
                responseTime,
                error: errorMessage,
            };
        }
    }
    async checkRedisConnection(redis, name = 'redis') {
        const startTime = Date.now();
        try {
            const response = await redis.ping();
            const responseTime = Date.now() - startTime;
            if (response !== 'PONG') {
                return {
                    name,
                    status: 'degraded',
                    responseTime,
                    error: `Unexpected ping response: ${response}`,
                };
            }
            return {
                name,
                status: 'up',
                responseTime,
                metadata: {
                    host: redis.options.host,
                    port: redis.options.port,
                    db: redis.options.db,
                },
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            const errorMessage = this.extractErrorMessage(error);
            this.logger.error(`Redis health check failed: ${errorMessage}`);
            return {
                name,
                status: 'down',
                responseTime,
                error: errorMessage,
            };
        }
    }
    async checkMultipleEndpoints(endpoints) {
        const checks = endpoints.map((endpoint) => this.checkHttpEndpoint(endpoint));
        return Promise.all(checks);
    }
    aggregateHealthStatus(checks) {
        if (checks.length === 0) {
            return 'up';
        }
        const hasDown = checks.some((check) => check.status === 'down');
        const hasDegraded = checks.some((check) => check.status === 'degraded');
        if (hasDown) {
            return 'down';
        }
        if (hasDegraded) {
            return 'degraded';
        }
        return 'up';
    }
    calculateAverageResponseTime(checks) {
        const validChecks = checks.filter((check) => check.responseTime != null);
        if (validChecks.length === 0) {
            return 0;
        }
        const total = validChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0);
        return Math.round(total / validChecks.length);
    }
    calculateUptime(successfulChecks, totalChecks) {
        if (totalChecks === 0) {
            return 100;
        }
        return Math.round((successfulChecks / totalChecks) * 100 * 10) / 10;
    }
    extractServiceName(url) {
        try {
            const urlObj = new URL(url);
            const parts = urlObj.pathname.split('/').filter((p) => p);
            return parts[0] || urlObj.hostname;
        }
        catch {
            return url;
        }
    }
    extractErrorMessage(error) {
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            if (axiosError.code === 'ECONNREFUSED') {
                return 'Connection refused';
            }
            if (axiosError.code === 'ETIMEDOUT') {
                return 'Connection timeout';
            }
            if (axiosError.response) {
                return `HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
            }
            return axiosError.message;
        }
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.DependencyHealthService = DependencyHealthService;
exports.DependencyHealthService = DependencyHealthService = DependencyHealthService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], DependencyHealthService);
//# sourceMappingURL=dependency-health.service.js.map