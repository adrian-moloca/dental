"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthAggregator = void 0;
const health_check_interface_1 = require("./health-check.interface");
class HealthAggregator {
    constructor() {
        this.components = new Map();
    }
    register(name, component) {
        this.components.set(name, component);
    }
    unregister(name) {
        this.components.delete(name);
    }
    async checkAll() {
        const results = {};
        const checks = Array.from(this.components.entries()).map(async ([name, component]) => {
            try {
                results[name] = await component.healthCheck();
            }
            catch (error) {
                results[name] = {
                    status: health_check_interface_1.HealthStatus.UNHEALTHY,
                    timestamp: new Date(),
                    error: error instanceof Error ? error.message : 'Unknown error',
                };
            }
        });
        await Promise.all(checks);
        return results;
    }
    async getOverallStatus() {
        const results = await this.checkAll();
        const statuses = Object.values(results).map((r) => r.status);
        if (statuses.some((s) => s === health_check_interface_1.HealthStatus.UNHEALTHY)) {
            return health_check_interface_1.HealthStatus.UNHEALTHY;
        }
        if (statuses.some((s) => s === health_check_interface_1.HealthStatus.DEGRADED)) {
            return health_check_interface_1.HealthStatus.DEGRADED;
        }
        return health_check_interface_1.HealthStatus.HEALTHY;
    }
}
exports.HealthAggregator = HealthAggregator;
//# sourceMappingURL=health-aggregator.js.map