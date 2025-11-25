"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchClient = void 0;
const opensearch_1 = require("@opensearch-project/opensearch");
const health_1 = require("../health");
class OpenSearchClient {
    constructor(config) {
        this.isShuttingDown = false;
        const options = {
            node: config.node,
            maxRetries: config.maxRetries,
            requestTimeout: config.requestTimeout,
            sniffOnStart: config.sniffOnStart,
        };
        if (config.username && config.password) {
            options.auth = {
                username: config.username,
                password: config.password,
            };
        }
        if (config.sniffInterval) {
            options.sniffInterval = config.sniffInterval;
        }
        if (config.ssl) {
            options.ssl = {
                rejectUnauthorized: false,
            };
        }
        this.client = new opensearch_1.Client(options);
    }
    async createIndex(indexName, settings, mappings) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            const body = {};
            if (settings) {
                body.settings = {
                    number_of_shards: settings.numberOfShards,
                    number_of_replicas: settings.numberOfReplicas,
                    refresh_interval: settings.refreshInterval,
                };
            }
            if (mappings) {
                body.mappings = mappings;
            }
            await this.client.indices.create({
                index: indexName,
                body: Object.keys(body).length > 0 ? body : undefined,
            });
        }
        catch (error) {
            throw new Error(`Failed to create index: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteIndex(indexName) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            await this.client.indices.delete({
                index: indexName,
            });
        }
        catch (error) {
            throw new Error(`Failed to delete index: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async indexExists(indexName) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            const response = await this.client.indices.exists({
                index: indexName,
            });
            return response.body === true;
        }
        catch (error) {
            throw new Error(`Failed to check index existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async index(indexName, document, documentId) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            const response = await this.client.index({
                index: indexName,
                id: documentId,
                body: document,
            });
            return response.body._id;
        }
        catch (error) {
            throw new Error(`Failed to index document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async search(indexName, query, options) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            const response = await this.client.search({
                index: indexName,
                body: {
                    query,
                    from: options?.from,
                    size: options?.size,
                    sort: options?.sort,
                },
            });
            return {
                hits: response.body.hits.hits,
                total: response.body.hits.total.value,
            };
        }
        catch (error) {
            throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async update(indexName, documentId, partialDocument) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            await this.client.update({
                index: indexName,
                id: documentId,
                body: {
                    doc: partialDocument,
                },
            });
        }
        catch (error) {
            throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async delete(indexName, documentId) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            await this.client.delete({
                index: indexName,
                id: documentId,
            });
        }
        catch (error) {
            throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async bulk(operations) {
        if (this.isShuttingDown) {
            throw new Error('OpenSearchClient is shutting down');
        }
        try {
            const body = operations.flatMap((op) => {
                const operation = op.index || op.delete || op.update;
                if (op.index && op.doc) {
                    return [{ index: operation }, op.doc];
                }
                else if (op.update && op.doc) {
                    return [{ update: operation }, { doc: op.doc }];
                }
                else if (op.delete) {
                    return [{ delete: operation }];
                }
                return [];
            });
            await this.client.bulk({ body });
        }
        catch (error) {
            throw new Error(`Bulk operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    getClient() {
        return this.client;
    }
    async healthCheck() {
        try {
            const start = Date.now();
            const response = await this.client.cluster.health();
            const duration = Date.now() - start;
            const status = response.body.status;
            let healthStatus;
            if (status === 'green') {
                healthStatus = health_1.HealthStatus.HEALTHY;
            }
            else if (status === 'yellow') {
                healthStatus = health_1.HealthStatus.DEGRADED;
            }
            else {
                healthStatus = health_1.HealthStatus.UNHEALTHY;
            }
            return {
                status: healthStatus,
                timestamp: new Date(),
                message: `OpenSearch cluster status: ${status}`,
                metadata: {
                    responseTimeMs: duration,
                    clusterName: response.body.cluster_name,
                    numberOfNodes: response.body.number_of_nodes,
                },
            };
        }
        catch (error) {
            return {
                status: health_1.HealthStatus.UNHEALTHY,
                timestamp: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    async shutdown() {
        if (this.isShuttingDown) {
            return;
        }
        this.isShuttingDown = true;
        try {
            await this.client.close();
        }
        catch (error) {
            console.error('Error during OpenSearch shutdown:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
}
exports.OpenSearchClient = OpenSearchClient;
//# sourceMappingURL=opensearch.client.js.map