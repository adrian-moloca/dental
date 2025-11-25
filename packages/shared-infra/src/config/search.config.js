"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadOpenSearchConfig = loadOpenSearchConfig;
const zod_1 = require("zod");
const OpenSearchConfigSchema = zod_1.z.object({
    node: zod_1.z.string().default('http://localhost:9200'),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    maxRetries: zod_1.z.number().int().positive().default(3),
    requestTimeout: zod_1.z.number().int().positive().default(30000),
    sniffOnStart: zod_1.z.boolean().default(false),
    sniffInterval: zod_1.z.number().int().positive().optional(),
    ssl: zod_1.z.boolean().default(false),
});
function loadOpenSearchConfig() {
    const config = {
        node: process.env.DENTALOS_OPENSEARCH_NODE || 'http://localhost:9200',
        username: process.env.DENTALOS_OPENSEARCH_USERNAME,
        password: process.env.DENTALOS_OPENSEARCH_PASSWORD,
        maxRetries: process.env.DENTALOS_OPENSEARCH_MAX_RETRIES
            ? parseInt(process.env.DENTALOS_OPENSEARCH_MAX_RETRIES, 10)
            : 3,
        requestTimeout: process.env.DENTALOS_OPENSEARCH_REQUEST_TIMEOUT
            ? parseInt(process.env.DENTALOS_OPENSEARCH_REQUEST_TIMEOUT, 10)
            : 30000,
        sniffOnStart: process.env.DENTALOS_OPENSEARCH_SNIFF_ON_START === 'true',
        ssl: process.env.DENTALOS_OPENSEARCH_SSL === 'true',
    };
    if (process.env.DENTALOS_OPENSEARCH_SNIFF_INTERVAL) {
        config.sniffInterval = parseInt(process.env.DENTALOS_OPENSEARCH_SNIFF_INTERVAL, 10);
    }
    return OpenSearchConfigSchema.parse(config);
}
//# sourceMappingURL=search.config.js.map